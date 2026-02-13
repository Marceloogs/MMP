
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsSection from './components/StatsSection';
import QuickActions from './components/QuickActions';
import ActiveServices from './components/ActiveServices';
import BottomNav from './components/BottomNav';
import CustomerForm from './components/CustomerForm';
import VehicleForm from './components/VehicleForm';
import BudgetDetails from './components/BudgetDetails';
import NewServiceForm from './components/NewServiceForm';
import ServiceExecution from './components/ServiceExecution';
import PaymentView from './components/PaymentView';
import FinanceView from './components/FinanceView';
import ReportView from './components/ReportView';
import SettingsView from './components/SettingsView';
import { supabase } from './supabase';
import AuthScreen from './components/AuthScreen';
import InventoryView from './components/InventoryView';
import { Session } from '@supabase/supabase-js';
import { Customer, Service, BudgetItem, View, Transaction, WorkshopInfo, ServiceStatus, InventoryItem } from './types';

const STORAGE_KEY = 'mecanicpro_v1_data';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceHistory, setServiceHistory] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [finishedCountToday, setFinishedCountToday] = useState(0);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [nextServiceNumber, setNextServiceNumber] = useState(1);
  const [workshopInfo, setWorkshopInfo] = useState<WorkshopInfo>({
    name: 'Mecânica Copetão',
    phone: '(11) 99999-9999',
    address: 'Rua das Oficinas, 123 - Centro, São Paulo/SP',
    logoUrl: '',
    logoScale: 1.0
  });

  // Carregar dados (Prioridade Supabase, Fallback LocalStorage)
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      try {
        // 1. Carregar do Supabase
        const { data: remServices } = await supabase.from('services').select('*').order('created_at', { ascending: false });
        const { data: remTransactions } = await supabase.from('financial_transactions').select('*').order('created_at', { ascending: false });
        const { data: remCustomers } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        const { data: remInventory } = await supabase.from('inventory_items').select('*').order('created_at', { ascending: false });
        const { data: remSettings } = await supabase.from('settings').select('*').single();

        const hasRemoteData = (remServices?.length || 0) + (remTransactions?.length || 0) + (remCustomers?.length || 0) + (remInventory?.length || 0) + (remSettings ? 1 : 0) > 0;

        if (hasRemoteData) {
          if (remServices) {
            setServices(remServices.filter(s => s.status !== 'CONCLUÍDO').map(s => ({
              ...s, customerName: s.customer_name, budgetItems: s.budget_items, finishedDate: s.finished_date, imageUrl: s.image_url || ''
            })));
            setServiceHistory(remServices.filter(s => s.status === 'CONCLUÍDO').map(s => ({
              ...s, customerName: s.customer_name, budgetItems: s.budget_items, finishedDate: s.finished_date, imageUrl: s.image_url || ''
            })));
          }
          if (remTransactions) {
            setTransactions(remTransactions.map(t => ({ ...t, date: t.date_label, isoDate: t.iso_date })));
          }
          if (remCustomers) {
            setCustomers(remCustomers.map(c => ({ ...c })));
          }
          if (remInventory) {
            setInventory(remInventory.map(i => ({
              ...i,
              costPrice: Number(i.cost_price),
              salePrice: Number(i.sale_price),
              quantity: Number(i.quantity),
              minQuantity: Number(i.min_quantity),
              imageUrl: i.image_url || ''
            })));
          }
          if (remSettings) {
            setWorkshopInfo(remSettings.workshop_info);
            setNextServiceNumber(remSettings.next_service_number);
            const today = new Date().toISOString().split('T')[0];
            if (remSettings.last_reset_date === today) {
              setFinishedCountToday(remSettings.finished_count_today);
            } else {
              setFinishedCountToday(0);
            }
          }
        } else {
          // 2. Migração local para Cloud
          const savedData = localStorage.getItem(STORAGE_KEY);
          if (savedData) {
            const p = JSON.parse(savedData);
            if (p.services) setServices(p.services);
            if (p.serviceHistory) setServiceHistory(p.serviceHistory);
            if (p.transactions) setTransactions(p.transactions);
            if (p.customers) setCustomers(p.customers);
            if (p.inventory) setInventory(p.inventory);
            if (p.workshopInfo) setWorkshopInfo(p.workshopInfo);
            if (p.nextServiceNumber) setNextServiceNumber(p.nextServiceNumber || 1);
            if (p.finishedCountToday) setFinishedCountToday(p.finishedCountToday || 0);

            // Upload inicial
            if (p.services?.length > 0) {
              await syncTable('services', [...p.services, ...(p.serviceHistory || [])].map((s: any) => ({
                id: s.id, user_id: session.user.id, customer_name: s.customerName, vehicle: s.vehicle, plate: s.plate, description: s.description, execution_description: s.executionDescription, status: s.status, budget_items: s.budgetItems || [], discount: s.discount || 0, mileage: s.mileage, finished_date: s.finishedDate
              })));
            }
            if (p.transactions?.length > 0) {
              await syncTable('financial_transactions', p.transactions.map((t: any) => ({
                id: t.id, user_id: session.user.id, title: t.title, subtitle: t.subtitle, amount: t.amount, type: t.type, category: t.category, method: t.method, time: t.time, date_label: t.date, iso_date: t.isoDate, status: t.status
              })));
            }
            if (p.customers?.length > 0) {
              await syncTable('customers', p.customers.map((c: any) => ({
                id: c.id, user_id: session.user.id, name: c.name, document: c.document, phone: c.phone, email: c.email, address: c.address, vehicles: c.vehicles || []
              })));
            }
            if (p.inventory?.length > 0) {
              await syncTable('inventory_items', p.inventory.map((i: any) => ({
                id: i.id, user_id: session.user.id, name: i.name, code: i.code, category: i.category, cost_price: i.costPrice, sale_price: i.salePrice, quantity: i.quantity, min_quantity: i.minQuantity, location: i.location, image_url: i.imageUrl
              })));
            }
            // Upload settings
            await supabase.from('settings').upsert({
              user_id: session.user.id,
              workshop_info: p.workshopInfo || {},
              next_service_number: p.nextServiceNumber || 1,
              finished_count_today: p.finishedCountToday || 0,
              last_reset_date: new Date().toISOString().split('T')[0]
            });
          }
        }
      } catch (error) {
        console.error("Erro na sincronização:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [session]);

  const syncTable = async (table: string, data: any[]) => {
    if (!session?.user?.id) return;
    const { error } = await supabase.from(table).upsert(data);
    if (error) console.error(`Erro ao salvar em ${table}:`, error);
  };

  // Helpers Cloud Upsert
  const saveSettingsToCloud = async (info: WorkshopInfo, nextNum: number, count: number) => {
    if (!session?.user?.id) return;
    await supabase.from('settings').upsert({
      user_id: session.user.id,
      workshop_info: info,
      next_service_number: nextNum,
      finished_count_today: count,
      last_reset_date: new Date().toISOString().split('T')[0]
    });
  };

  const saveServiceToCloud = async (s: Service) => {
    if (!session?.user?.id) return;
    await supabase.from('services').upsert({
      id: s.id, user_id: session.user.id, customer_name: s.customerName, vehicle: s.vehicle, plate: s.plate, description: s.description, execution_description: s.executionDescription, status: s.status, budget_items: s.budgetItems || [], discount: s.discount || 0, mileage: s.mileage, finished_date: s.finishedDate
    });
  };

  const saveTransactionToCloud = async (t: Transaction) => {
    if (!session?.user?.id) return;
    await supabase.from('financial_transactions').upsert({
      id: t.id, user_id: session.user.id, title: t.title, subtitle: t.subtitle, amount: t.amount, type: t.type, category: t.category, method: t.method, time: t.time, date_label: t.date, iso_date: t.isoDate, status: t.status
    });
  };

  const saveCustomerToCloud = async (c: Customer) => {
    if (!session?.user?.id) return;
    await supabase.from('customers').upsert({
      id: c.id, user_id: session.user.id, name: c.name, document: c.document, phone: c.phone, email: c.email, address: c.address, vehicles: c.vehicles || []
    });
  };

  const saveInventoryToCloud = async (i: InventoryItem) => {
    if (!session?.user?.id) return;
    await supabase.from('inventory_items').upsert({
      id: i.id, user_id: session.user.id, name: i.name, code: i.code, category: i.category, cost_price: i.costPrice, sale_price: i.salePrice, quantity: i.quantity, min_quantity: i.minQuantity, location: i.location, image_url: i.imageUrl
    });
  };

  const deleteServiceFromCloud = async (id: string) => {
    if (!session?.user?.id) return;
    await supabase.from('services').delete().eq('id', id);
  };

  const deleteTransactionFromCloud = async (id: string) => {
    if (!session?.user?.id) return;
    await supabase.from('financial_transactions').delete().eq('id', id);
  };

  const deleteCustomerFromCloud = async (id: string) => {
    if (!session?.user?.id) return;
    await supabase.from('customers').delete().eq('id', id);
  };

  const deleteInventoryFromCloud = async (id: string) => {
    if (!session?.user?.id) return;
    await supabase.from('inventory_items').delete().eq('id', id);
  };

  // Salvar configs (Cloud + Local backup)
  useEffect(() => {
    if (!isLoaded) return;
    saveSettingsToCloud(workshopInfo, nextServiceNumber, finishedCountToday);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ workshopInfo, nextServiceNumber, finishedCountToday }));
  }, [workshopInfo, nextServiceNumber, finishedCountToday, isLoaded]);

  const selectedService = services.find(s => s.id === selectedServiceId) || serviceHistory.find(s => s.id === selectedServiceId) || null;
  const associatedCustomer = customers.find(c => c.name.trim() === selectedService?.customerName.trim());
  const activeCount = services.length;
  const pendingCount = services.filter(s => s.status === 'AGUARDANDO APROVAÇÃO').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingChequesToday = transactions.filter(t =>
    t.method === 'Cheque' && t.status === 'PENDING' && t.isoDate === todayStr
  );

  const calculateTotal = (service: Service | null): number => {
    if (!service || !service.budgetItems) return 0;
    const subtotal = service.budgetItems.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
    return subtotal - (service.discount || 0);
  };

  const currentTotal = calculateTotal(selectedService);

  const handleUpdateServiceData = (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        saveServiceToCloud(updated);
        return updated;
      }
      return s;
    }));
  };

  const handleFinishExecution = (details: { description: string, status: ServiceStatus }) => {
    if (selectedServiceId) {
      setServices(prev => prev.map(s => {
        if (s.id === selectedServiceId) {
          const updated = {
            ...s,
            executionDescription: details.description,
            status: details.status
          };
          saveServiceToCloud(updated);
          return updated;
        }
        return s;
      }));

      if (details.status === 'CONCLUÍDO') {
        setCurrentView('payment');
      } else {
        setCurrentView('dashboard');
      }
    }
  };

  const handlePaymentFinish = (generatedTransactions: Transaction[]) => {
    if (selectedService) {
      const now = new Date();
      const finishedService: Service = {
        ...selectedService,
        status: 'CONCLUÍDO',
        finishedDate: now.toISOString().split('T')[0]
      };

      // Salvar serviço finalizado
      saveServiceToCloud(finishedService);

      // Salvar novas transações
      generatedTransactions.forEach(t => saveTransactionToCloud(t));

      setServiceHistory(prev => [finishedService, ...prev]);
      setServices(prev => prev.filter(s => s.id !== selectedServiceId));
      setTransactions(prev => [...generatedTransactions, ...prev]);
      setFinishedCountToday(prev => prev + 1);
      setCurrentView('dashboard');
      setSelectedServiceId(null);
    }
  };

  const showNav = ['dashboard', 'finances', 'inventory', 'settings'].includes(currentView);

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="max-w-md mx-auto bg-[#0B1118] print:bg-white print:max-w-none print:mx-0 min-h-screen relative overflow-x-hidden print:overflow-visible">
      {currentView === 'dashboard' && (
        <div className="animate-in fade-in duration-500 pb-32">
          <Header
            workshopName={workshopInfo.name}
            logoUrl={workshopInfo.logoUrl}
            logoScale={workshopInfo.logoScale}
            pendingCheques={pendingChequesToday}
            onSearch={() => setCurrentView('customer_form')}
          />
          <StatsSection
            activeCount={activeCount}
            pendingCount={pendingCount}
            finishedCount={finishedCountToday}
          />
          <QuickActions
            onNewCustomer={() => setCurrentView('customer_form')}
            onBudget={() => setCurrentView('new_service')}
            onReports={() => setCurrentView('reports')}
          />
          <ActiveServices
            services={services}
            onServiceClick={(s) => {
              setSelectedServiceId(s.id);
              if (s.status === 'AGUARDANDO APROVAÇÃO') setCurrentView('budget');
              else setCurrentView('service_execution');
            }}
            onDeleteService={(id) => {
              deleteServiceFromCloud(id);
              setServices(prev => prev.filter(s => s.id !== id));
            }}
          />
        </div>
      )}

      {currentView === 'customer_form' && (
        <CustomerForm
          customers={customers}
          onBack={() => setCurrentView('dashboard')}
          onSave={(c) => {
            saveCustomerToCloud(c);
            setCustomers(p => [...p, c]);
            setCurrentView('dashboard');
          }}
          onUpdate={(c) => {
            saveCustomerToCloud(c);
            setCustomers(p => p.map(x => x.id === c.id ? c : x));
            setCurrentView('dashboard');
          }}
          onDelete={(id) => {
            deleteCustomerFromCloud(id);
            setCustomers(p => p.filter(x => x.id !== id));
            setCurrentView('dashboard');
          }}
        />
      )}

      {currentView === 'vehicle_form' && (
        <VehicleForm onBack={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'new_service' && (
        <NewServiceForm
          onBack={() => setCurrentView('dashboard')}
          customers={customers}
          nextServiceNumber={nextServiceNumber}
          onStartService={(s) => {
            saveServiceToCloud(s);
            setServices(p => [s, ...p]);
            setNextServiceNumber(n => n + 1);
            setSelectedServiceId(s.id);
            setCurrentView('budget');
          }}
        />
      )}

      {currentView === 'budget' && selectedService && (
        <BudgetDetails
          onBack={() => setCurrentView('dashboard')}
          onApprove={() => { handleUpdateServiceData(selectedService.id, { status: 'EM ANDAMENTO' }); setCurrentView('dashboard'); }}
          customerName={selectedService.customerName}
          customerPhone={associatedCustomer?.phone}
          customerDocument={associatedCustomer?.document}
          vehicleModel={selectedService.vehicle}
          plate={selectedService.plate}
          osId={selectedService.id}
          initialItems={selectedService.budgetItems}
          initialDiscount={selectedService.discount}
          workshopInfo={workshopInfo}
          onUpdateItems={(items, discount) => handleUpdateServiceData(selectedService.id, { budgetItems: items, discount })}
        />
      )}

      {currentView === 'service_execution' && selectedService && (
        <ServiceExecution
          onBack={() => setCurrentView('dashboard')}
          onGoToDashboard={() => setCurrentView('dashboard')}
          onFinish={handleFinishExecution}
          vehicleModel={selectedService.vehicle}
          plate={selectedService.plate}
          serviceId={selectedService.id}
          initialDescription={selectedService.executionDescription || selectedService.description}
          initialStatus={selectedService.status}
          mileage={selectedService.mileage}
          onUpdateExecution={(desc, status) => handleUpdateServiceData(selectedService.id, { executionDescription: desc, status })}
        />
      )}

      {currentView === 'payment' && selectedService && (
        <PaymentView
          total={currentTotal}
          customerName={selectedService.customerName}
          vehicle={selectedService.vehicle}
          plate={selectedService.plate}
          onBack={() => setCurrentView('service_execution')}
          onFinish={handlePaymentFinish}
        />
      )}

      {currentView === 'finances' && (
        <FinanceView
          transactions={transactions}
          serviceHistory={serviceHistory}
          onAddExpense={(e) => {
            saveTransactionToCloud(e);
            setTransactions(p => [e, ...p]);
          }}
          onUpdateTransaction={(t) => {
            saveTransactionToCloud(t);
            setTransactions(p => p.map(x => x.id === t.id ? t : x));
          }}
        />
      )}

      {currentView === 'inventory' && (
        <InventoryView
          inventory={inventory}
          onSaveItem={(item) => {
            saveInventoryToCloud(item);
            setInventory(prev => {
              const exists = prev.find(i => i.id === item.id);
              if (exists) return prev.map(i => i.id === item.id ? item : i);
              return [item, ...prev];
            });
          }}
          onDeleteItem={(id) => {
            deleteInventoryFromCloud(id);
            setInventory(p => p.filter(i => i.id !== id));
          }}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'settings' && (
        <SettingsView
          workshopInfo={workshopInfo}
          onSave={(info) => { setWorkshopInfo(info); setCurrentView('dashboard'); }}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'reports' && (
        <ReportView
          customers={customers}
          serviceHistory={serviceHistory}
          workshopInfo={workshopInfo}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {showNav && (
        <BottomNav
          activeTab={currentView}
          onTabChange={setCurrentView}
          onPlusClick={() => setCurrentView('new_service')}
        />
      )}
    </div>
  );
};

export default App;
