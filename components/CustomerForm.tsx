
import React, { useState, useRef } from 'react';
import { Camera, UserPlus, Briefcase, PlusCircle, Save, X, Car, LayoutGrid, Clock, Settings, CheckCircle2, Fingerprint, Pencil, Trash2, AlertTriangle, Mail, MessageSquare, Bell, Search, User, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Customer, Vehicle } from '../types';

interface CustomerFormProps {
  customers: Customer[];
  onBack: () => void;
  onSave: (customer: Customer) => void;
  onUpdate: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customers, onBack, onSave, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [idParaExcluirVeiculo, setIdParaExcluirVeiculo] = useState<string | null>(null);
  const [idParaExcluirCliente, setIdParaExcluirCliente] = useState<string | null>(null);
  
  const vehicleFileRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    notifications: {
      email: true,
      sms: true,
      push: false
    }
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    model: '',
    year: '',
    color: '',
    chassis: '',
    km: '',
    imageUrl: ''
  });

  const handleVehiclePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVehicle(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.document.includes(searchQuery) ||
    c.phone.includes(searchQuery)
  );

  const handleStartNewCustomer = () => {
    setEditingCustomerId(null);
    setFormData({
      name: '', document: '', phone: '', email: '', address: '',
      notifications: { email: true, sms: true, push: false }
    });
    setVehicles([]);
    setViewMode('form');
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setFormData({
      name: customer.name,
      document: customer.document,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      notifications: { email: true, sms: true, push: false }
    });
    setVehicles(customer.vehicles);
    setViewMode('form');
  };

  const handleSaveCustomer = () => {
    if (!formData.name) {
      alert('O nome do cliente é obrigatório');
      return;
    }
    setLoading(true);
    
    const customerData: Customer = {
      id: editingCustomerId || Math.random().toString(36).substr(2, 9),
      ...formData,
      vehicles
    };

    setTimeout(() => {
      setLoading(false);
      if (editingCustomerId) {
        onUpdate(customerData);
      } else {
        onSave(customerData);
      }
      setViewMode('list');
    }, 800);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleChange = (field: string, value: string) => {
    setNewVehicle(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveVehicle = () => {
    if (!newVehicle.plate || !newVehicle.model) {
      alert('Placa e Modelo são obrigatórios');
      return;
    }

    const vehicleData: Vehicle = { 
      id: editingVehicleId || Math.random().toString(36).substr(2, 9),
      model: `${newVehicle.year} ${newVehicle.model}`.trim(), 
      plate: newVehicle.plate.toUpperCase(), 
      color: newVehicle.color,
      year: newVehicle.year,
      chassis: newVehicle.chassis,
      km: newVehicle.km,
      imageUrl: newVehicle.imageUrl
    };

    if (editingVehicleId) {
      setVehicles(prev => prev.map(v => v.id === editingVehicleId ? vehicleData : v));
    } else {
      setVehicles(prev => [...prev, vehicleData]);
    }

    setShowVehicleForm(false);
    setEditingVehicleId(null);
    setNewVehicle({ plate: '', model: '', year: '', color: '', chassis: '', km: '', imageUrl: '' });
  };

  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-[#0B1118] text-white animate-in fade-in duration-500 pb-24">
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800/20 sticky top-0 bg-[#0B1118]/80 backdrop-blur-md z-20">
          <button onClick={onBack} className="text-blue-500 font-bold active:opacity-50">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-lg font-black italic tracking-tight uppercase">Gestão de Clientes</h1>
          <button onClick={handleStartNewCustomer} className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-90 transition-transform">
            <PlusCircle className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por nome, CPF ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-4">
            {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
              <div key={customer.id} className="bg-card border border-gray-800/50 rounded-3xl p-5 flex items-center justify-between group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black italic text-white truncate pr-2 uppercase">{customer.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{customer.phone}</span>
                      <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                      <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{customer.vehicles.length} Veículos</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditCustomer(customer)}
                    className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-blue-500 active:scale-90 transition-transform hover:bg-gray-700"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIdParaExcluirCliente(customer.id)}
                    className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-red-500 active:scale-90 transition-transform hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 opacity-30">
                <Search className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm font-black uppercase tracking-widest">Nenhum cliente encontrado</p>
              </div>
            )}
          </div>
        </div>

        {idParaExcluirCliente && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIdParaExcluirCliente(null)}></div>
              <div className="relative w-full max-w-xs bg-card border border-gray-800 rounded-3xl p-8 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">Excluir Cliente?</h3>
                  <p className="text-xs text-gray-500 text-center mb-8 leading-relaxed uppercase font-bold tracking-widest">
                      Todos os dados e vínculos deste cliente serão removidos permanentemente.
                  </p>
                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={() => { onDelete(idParaExcluirCliente); setIdParaExcluirCliente(null); }}
                          className="w-full bg-red-500 text-white font-black py-4 rounded-xl active:scale-95 transition-transform"
                      >
                          SIM, EXCLUIR
                      </button>
                      <button onClick={() => setIdParaExcluirCliente(null)} className="w-full bg-gray-800 text-gray-400 font-bold py-4 rounded-xl">
                          CANCELAR
                      </button>
                  </div>
              </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-in slide-in-from-right duration-300 bg-[#0B1118] relative">
      <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-[#0B1118]/80 backdrop-blur-md z-20 border-b border-gray-800/20">
        <button type="button" onClick={() => setViewMode('list')} className="text-blue-500 font-medium active:opacity-50">Cancelar</button>
        <h1 className="text-lg font-black italic tracking-tight uppercase">
          {editingCustomerId ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
        <button 
          type="button"
          onClick={handleSaveCustomer} 
          disabled={loading}
          className="text-blue-500 font-bold active:opacity-50 disabled:opacity-30"
        >
          {loading ? '...' : 'Salvar'}
        </button>
      </div>

      <div className="px-6 pb-40">
        <div className="flex flex-col items-center mt-4 mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-blue-500/30 bg-blue-500/5 flex items-center justify-center overflow-hidden">
               <UserPlus className="w-10 h-10 text-blue-500/50" />
            </div>
            <button type="button" className="absolute bottom-0 right-0 w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center border-4 border-[#0B1118] active:scale-90 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[10px] font-bold text-gray-500 mt-4 tracking-widest uppercase">Foto do Cliente</p>
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-blue-500" />
            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Informações Pessoais</h2>
          </div>
          <div className="space-y-3">
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nome do Cliente" 
              className="w-full bg-card border border-gray-800 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
            <input 
              type="text" 
              value={formData.document}
              onChange={(e) => handleChange('document', e.target.value)}
              placeholder="CPF ou CNPJ" 
              className="w-full bg-card border border-gray-800 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Telefone" 
                className="w-full bg-card border border-gray-800 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
              />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="E-mail" 
                className="w-full bg-card border border-gray-800 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>
            <textarea 
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Endereço" 
              rows={3}
              className="w-full bg-card border border-gray-800 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none shadow-sm"
            />
          </div>
        </section>

        <section className="mb-8 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Car className="text-blue-500 w-4 h-4" />
              <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Veículos Vinculados</h2>
              <span className="bg-blue-500/20 text-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">{vehicles.length}</span>
            </div>
            <button 
              type="button"
              onClick={() => { setEditingVehicleId(null); setNewVehicle({ plate: '', model: '', year: '', color: '', chassis: '', km: '', imageUrl: '' }); setShowVehicleForm(true); }}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-500 uppercase tracking-widest active:scale-95 transition-transform"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Adicionar Veículo
            </button>
          </div>
          
          <div className="space-y-4">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-card border border-gray-800 rounded-2xl p-4 flex items-center justify-between group relative overflow-hidden shadow-md">
                <div className="flex items-center gap-3">
                  {v.imageUrl ? (
                    <img src={v.imageUrl} alt={v.model} className="w-12 h-12 rounded-xl object-cover border border-gray-800" />
                  ) : (
                    <div className="w-12 h-12 bg-[#0B1118] rounded-xl border border-gray-800 flex items-center justify-center text-xl shadow-inner">🚗</div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-white">{v.model}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Placa: {v.plate} • {v.color}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 relative z-10">
                    <button 
                        type="button"
                        onClick={() => { setEditingVehicleId(v.id); setNewVehicle({ ...v, model: v.model.split(' ').slice(1).join(' ') }); setShowVehicleForm(true); }}
                        className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-blue-500 active:scale-90 transition-transform"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                        type="button"
                        onClick={() => setIdParaExcluirVeiculo(v.id)}
                        className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-red-500 active:scale-90 transition-transform"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
            {vehicles.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-2xl">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Nenhum veículo vinculado</p>
              </div>
            )}
          </div>
        </section>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B1118] via-[#0B1118] to-transparent z-[70]">
            <button 
                type="button"
                onClick={handleSaveCustomer}
                disabled={loading}
                className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-50"
            >
                {loading ? <span className="animate-pulse">PROCESSANDO...</span> : (
                  <>
                    <Save className="w-5 h-5" strokeWidth={2.5} />
                    {editingCustomerId ? 'ATUALIZAR CADASTRO' : 'SALVAR CADASTRO COMPLETO'}
                  </>
                )}
            </button>
        </div>
      </div>

      {idParaExcluirVeiculo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIdParaExcluirVeiculo(null)}></div>
            <div className="relative w-full max-w-xs bg-card border border-gray-800 rounded-3xl p-8 animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Desvincular Veículo?</h3>
                <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">Esta ação irá remover o veículo selecionado do cadastro.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => { setVehicles(prev => prev.filter(v => v.id !== idParaExcluirVeiculo)); setIdParaExcluirVeiculo(null); }} className="w-full bg-red-500 text-white font-black py-4 rounded-xl">SIM, EXCLUIR</button>
                    <button onClick={() => setIdParaExcluirVeiculo(null)} className="w-full bg-gray-800 text-gray-400 font-bold py-4 rounded-xl">CANCELAR</button>
                </div>
            </div>
        </div>
      )}

      {showVehicleForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowVehicleForm(false)}></div>
            <div className="relative w-full max-w-md bg-[#0B1118] border-t border-gray-800 rounded-t-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black italic tracking-tight uppercase">
                        {editingVehicleId ? 'EDITAR VEÍCULO' : 'ADICIONAR VEÍCULO'}
                    </h2>
                    <button type="button" onClick={() => setShowVehicleForm(false)} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                
                {/* Campo de Foto do Veículo */}
                <div className="flex flex-col items-center mb-6">
                   <div className="relative group cursor-pointer" onClick={() => vehicleFileRef.current?.click()}>
                      <div className="w-32 h-32 bg-card rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-800 overflow-hidden">
                         {newVehicle.imageUrl ? (
                            <img src={newVehicle.imageUrl} alt="Veículo" className="w-full h-full object-cover" />
                         ) : (
                            <div className="flex flex-col items-center gap-2 opacity-30">
                               <ImageIcon className="w-8 h-8" />
                               <span className="text-[10px] font-black uppercase">Foto do Carro</span>
                            </div>
                         )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-blue-500 rounded-full border-4 border-[#0B1118] flex items-center justify-center text-white">
                         <Camera className="w-4 h-4" />
                      </div>
                   </div>
                   <input 
                     type="file" 
                     ref={vehicleFileRef} 
                     className="hidden" 
                     accept="image/*" 
                     onChange={handleVehiclePhotoChange} 
                   />
                </div>

                <div className="space-y-4 pb-12">
                    <FormInput label="PLACA" placeholder="ABC-1234" value={newVehicle.plate} onChange={(v) => handleVehicleChange('plate', v.toUpperCase())} icon={<LayoutGrid className="w-5 h-5" />} />
                    <FormInput label="MODELO" placeholder="Ex: Corolla XEI" value={newVehicle.model} onChange={(v) => handleVehicleChange('model', v)} icon={<Car className="w-5 h-5" />} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="ANO" placeholder="2023" value={newVehicle.year} onChange={(v) => handleVehicleChange('year', v)} icon={<Clock className="w-5 h-5" />} />
                        <FormInput label="COR" placeholder="Branco" value={newVehicle.color} onChange={(v) => handleVehicleChange('color', v)} icon={<Settings className="w-5 h-5" />} />
                    </div>
                    <FormInput label="NÚMERO DO CHASSI" placeholder="Opcional" value={newVehicle.chassis} onChange={(v) => handleVehicleChange('chassis', v)} icon={<Fingerprint className="w-5 h-5" />} />
                    <FormInput label="KM ATUAL" placeholder="0" value={newVehicle.km} onChange={(v) => handleVehicleChange('km', v)} icon={<CheckCircle2 className="w-5 h-5" />} />
                    <button onClick={handleSaveVehicle} className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/20">SALVAR VEÍCULO</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const FormInput: React.FC<{ label: string; placeholder: string; value: string; onChange: (v: string) => void; icon: React.ReactNode }> = ({ label, placeholder, value, onChange, icon }) => (
    <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 flex items-center gap-4 focus-within:border-blue-500 transition-colors group">
        <div className="text-blue-500/60 group-focus-within:text-blue-500 transition-colors">{icon}</div>
        <div className="flex-1">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent border-none text-white text-sm font-bold focus:outline-none" />
        </div>
    </div>
);

export default CustomerForm;
