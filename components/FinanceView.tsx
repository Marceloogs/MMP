
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Calendar, TrendingUp, ArrowDown, ArrowUp, Wrench, ShoppingCart, Home, Settings, Plus, QrCode, Banknote, CreditCard, Inbox, X, Save, AlertTriangle, CheckCircle2, AlertCircle, FileText, Clock, Filter, FileDown, MoreHorizontal } from 'lucide-react';
import { Transaction, TransactionStatus, Service } from '../types';

interface FinanceViewProps {
  transactions: Transaction[];
  serviceHistory: Service[];
  onAddExpense: (expense: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
}

const FinanceView: React.FC<FinanceViewProps> = ({ transactions, serviceHistory, onAddExpense, onUpdateTransaction }) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'reports'>('transactions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<Transaction | null>(null);

  // Filtro de data inicial: mês atual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dateRange, setDateRange] = useState({ start: firstDay, end: lastDay });

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'PARTS' as Transaction['category'],
    method: 'Dinheiro'
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Filtragem das transações pelo período selecionado
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = t.isoDate;
      return tDate >= dateRange.start && tDate <= dateRange.end;
    });
  }, [transactions, dateRange]);

  // 2. Cálculos de Totais e Indicadores
  const analytics = useMemo(() => {
    let incomes = 0;
    let expenses = 0;
    let futureIncomes = 0;
    const methods: Record<string, number> = { PIX: 0, 'Cartão Crédito': 0, 'Cartão Débito': 0, Dinheiro: 0, Cheque: 0, Outros: 0 };

    filteredTransactions.forEach(t => {
      const amt = Math.abs(t.amount);
      if (t.type === 'EXPENSE') {
        expenses += amt;
      } else {
        const m = t.method.toUpperCase();

        // Contabilizar para o gráfico independentemente do status (exceto se for gasto)
        if (m.includes('PIX')) methods.PIX += amt;
        else if (m.includes('CREDITO')) methods['Cartão Crédito'] += amt;
        else if (m.includes('DEBITO')) methods['Cartão Débito'] += amt;
        else if (m.includes('CHEQUE')) methods.Cheque += amt;
        else if (m.includes('DINHEIRO')) methods.Dinheiro += amt;
        else methods.Outros += amt;

        // Contabilizar para o saldo real (Incomes)
        if (t.method === 'Cheque') {
          if (t.status === 'CLEARED') incomes += amt;
          else if (t.status === 'PENDING') futureIncomes += amt;
        } else {
          incomes += amt;
        }
      }
    });

    // Top Serviços por Receita (Agregado pelo histórico de serviços concluídos no período)
    const serviceRevenue: Record<string, number> = {};
    serviceHistory.forEach(s => {
      if (s.finishedDate && s.finishedDate >= dateRange.start && s.finishedDate <= dateRange.end) {
        const subtotal = s.budgetItems?.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0) || 0;
        const total = subtotal - (s.discount || 0);
        const categoryName = s.description.toUpperCase().trim();
        serviceRevenue[categoryName] = (serviceRevenue[categoryName] || 0) + total;
      }
    });

    const topServices = Object.entries(serviceRevenue)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    const maxServiceRevenue = topServices.length > 0 ? topServices[0].value : 1;

    return {
      balance: incomes - expenses,
      incomes,
      expenses,
      futureIncomes,
      methods,
      topServices,
      maxServiceRevenue
    };
  }, [filteredTransactions, serviceHistory, dateRange]);

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount) return;
    const val = parseFloat(newExpense.amount.replace(',', '.'));
    const now = new Date();
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      title: newExpense.title,
      subtitle: newExpense.method,
      amount: -val,
      type: 'EXPENSE',
      category: newExpense.category,
      method: newExpense.method,
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: 'HOJE, ' + now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase(),
      isoDate: todayStr,
      status: 'CLEARED'
    };
    onAddExpense(transaction);
    setIsModalOpen(false);
    setNewExpense({ title: '', amount: '', category: 'PARTS', method: 'Dinheiro' });
  };

  const handleUpdateCheckStatus = (status: TransactionStatus) => {
    if (selectedCheck) {
      onUpdateTransaction({ ...selectedCheck, status });
      setSelectedCheck(null);
    }
  };

  const formatDateForDisplay = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${d} ${months[parseInt(m) - 1]}`;
  };

  const currentYear = dateRange.start.split('-')[0];
  const periodLabel = `${formatDateForDisplay(dateRange.start)} - ${formatDateForDisplay(dateRange.end)}, ${currentYear}`;

  const uniqueDates = Array.from(new Set(filteredTransactions.map(t => t.date)));

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 animate-in fade-in duration-500 pb-32">
      {/* Header Fixo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <div className="w-10"></div>
        <h1 className="text-lg font-black italic tracking-tight uppercase">Finanças</h1>
        <button className="w-10 h-10 flex items-center justify-center text-gray-400"><MoreHorizontal className="w-6 h-6" /></button>
      </div>

      {/* Tabs de Navegação */}
      <div className="px-6 mt-4">
        <div className="bg-white p-1 rounded-2xl flex border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-[#0B1118] text-white shadow-lg' : 'text-gray-400'}`}
          >
            Fluxo de Caixa
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'reports' ? 'bg-[#0B1118] text-white shadow-lg' : 'text-gray-400'}`}
          >
            Indicadores
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'transactions' ? (
          /* ABA FLUXO DE CAIXA */
          <div className="space-y-6">
            <div className="bg-[#0B1118] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-white">
              <p className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase mb-2">SALDO NO PERÍODO</p>
              <h2 className="text-4xl font-black italic tracking-tight">R$ {analytics.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <button onClick={() => setIsFilterModalOpen(true)} className="w-full bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{periodLabel}</span>
              </div>
              <Filter className="w-4 h-4 text-gray-400" />
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><ArrowDown className="w-3 h-3 text-emerald-500" /> Entradas</p>
                <p className="text-xl font-black italic text-emerald-600">R$ {analytics.incomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><ArrowUp className="w-3 h-3 text-red-500" /> Saídas</p>
                <p className="text-xl font-black italic text-red-600">R$ {analytics.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="w-full bg-[#0B1118] text-white rounded-2xl py-5 flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
              <Plus className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Registrar Despesa</span>
            </button>

            <div className="space-y-8">
              {uniqueDates.length > 0 ? uniqueDates.map((dateGroup) => (
                <div key={dateGroup} className="space-y-4">
                  <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">{dateGroup}</h3>
                  <div className="space-y-3">
                    {filteredTransactions.filter(t => t.date === dateGroup).map(t => (
                      <div key={t.id} onClick={() => t.method === 'Cheque' ? setSelectedCheck(t) : null} className="bg-white rounded-3xl p-4 flex items-center justify-between border border-gray-100 shadow-sm active:scale-95 transition-transform">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            {t.type === 'INCOME' ? <Wrench className="w-5 h-5 text-emerald-500" /> : <ShoppingCart className="w-5 h-5 text-red-500" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate pr-2">{t.title}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.subtitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-black italic ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {t.type === 'INCOME' ? '+' : ''} R$ {Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold">{t.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 opacity-20">
                  <Inbox className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma transação neste período</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ABA INDICADORES */
          <div className="space-y-6 animate-in fade-in duration-500">

            {/* Filtro de Período (Visual idêntico à imagem) */}
            <div onClick={() => setIsFilterModalOpen(true)} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">PERÍODO SELECIONADO</p>
                  <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{periodLabel}</p>
                </div>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 border border-blue-100">
                <Filter className="w-4 h-4" />
              </div>
            </div>

            {/* Métricas Principais */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Receita Total</p>
                <p className="text-xl font-black italic text-gray-800 mb-2">R$ {analytics.incomes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                {analytics.futureIncomes > 0 && (
                  <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg w-fit">
                    <Clock className="w-2.5 h-2.5 text-blue-500" />
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">+ R$ {analytics.futureIncomes.toLocaleString('pt-BR')} a vencer</span>
                  </div>
                )}
              </div>
              <MetricCard
                label="Lucro Estimado"
                value={`R$ ${analytics.balance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                growth="+4.2%"
                growthColor="text-emerald-500"
              />
            </div>

            {/* TOP SERVIÇOS POR RECEITA (NOVA SEÇÃO) */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Top Serviços por Receita</h3>
              <div className="space-y-8">
                {analytics.topServices.length > 0 ? analytics.topServices.map((service, idx) => (
                  <ServiceRow
                    key={idx}
                    label={service.name}
                    amount={`R$ ${service.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                    progress={`${(service.value / analytics.maxServiceRevenue) * 100}%`}
                  />
                )) : (
                  <p className="text-center text-[10px] font-bold text-gray-400 uppercase py-4">Sem dados de serviços no período</p>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Clock className="w-3 h-3" /> ÚLTIMA ATUALIZAÇÃO: HOJE ÀS {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Meios de Pagamento */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Meios de Pagamento</h3>
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32">
                  {(() => {
                    const totalPayments = analytics.methods.PIX + analytics.methods['Cartão Crédito'] + analytics.methods['Cartão Débito'] + analytics.methods.Dinheiro + analytics.methods.Cheque + analytics.methods.Outros;

                    if (totalPayments === 0) {
                      return (
                        <>
                          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                            <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-black italic text-gray-300">Nenhum</span>
                            <span className="text-[10px] font-bold text-gray-300 uppercase">Dado</span>
                          </div>
                        </>
                      );
                    }

                    const pixPct = (analytics.methods.PIX / totalPayments) * 100;
                    const creditPct = (analytics.methods['Cartão Crédito'] / totalPayments) * 100;
                    const chequePct = (analytics.methods.Cheque / totalPayments) * 100;
                    const othersAmt = analytics.methods['Cartão Débito'] + analytics.methods.Dinheiro + analytics.methods.Outros;
                    const othersPct = (othersAmt / totalPayments) * 100;

                    // Encontrar o método dominante para o texto central
                    let dominantLabel = "Pix";
                    let dominantPct = pixPct;
                    if (creditPct > dominantPct) { dominantLabel = "Cartão"; dominantPct = creditPct; }
                    if (chequePct > dominantPct) { dominantLabel = "Cheque"; dominantPct = chequePct; }
                    if (othersPct > dominantPct) { dominantLabel = "Outros"; dominantPct = othersPct; }

                    return (
                      <>
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          {pixPct > 0 && (
                            <path className="text-blue-500" strokeDasharray={`${pixPct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          )}
                          {creditPct > 0 && (
                            <path className="text-blue-300" strokeDasharray={`${creditPct}, 100`} strokeDashoffset={-pixPct} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          )}
                          {chequePct > 0 && (
                            <path className="text-indigo-500" strokeDasharray={`${chequePct}, 100`} strokeDashoffset={-(pixPct + creditPct)} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          )}
                          {othersPct > 0 && (
                            <path className="text-gray-300" strokeDasharray={`${othersPct}, 100`} strokeDashoffset={-(pixPct + creditPct + chequePct)} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          )}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-black italic">{dominantLabel}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{Math.round(dominantPct)}%</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="space-y-4">
                  <LegendItem color="bg-blue-500" label="Pix" value={`R$ ${analytics.methods.PIX.toLocaleString('pt-BR')}`} />
                  <LegendItem color="bg-blue-300" label="Cartão Crédito" value={`R$ ${analytics.methods['Cartão Crédito'].toLocaleString('pt-BR')}`} />
                  <LegendItem color="bg-indigo-500" label="Cheques" value={`R$ ${analytics.methods.Cheque.toLocaleString('pt-BR')}`} />
                  <LegendItem color="bg-gray-300" label="Outros" value={`R$ ${(analytics.methods.Dinheiro + analytics.methods.Outros + analytics.methods['Cartão Débito']).toLocaleString('pt-BR')}`} />
                </div>
              </div>
            </div>

            <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest pb-32">
              Exibindo dados de {periodLabel}
            </p>
          </div>
        )}
      </div>

      {/* MODAL DE FILTRO DE DATA */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white border-t border-gray-200 rounded-t-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black italic tracking-tight text-gray-900 uppercase">Período de Análise</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">DATA INÍCIO</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">DATA FIM</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-full bg-[#0B1118] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl"
              >
                APLICAR FILTRO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Despesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#0B1118] border-t border-gray-800 rounded-t-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black italic tracking-tight text-red-500 uppercase">Registrar Saída</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 text-white">
              <input type="text" value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} placeholder="Título da Despesa" className="w-full bg-card border border-gray-800 rounded-2xl px-5 py-4 text-white font-bold outline-none" />
              <input type="text" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="Valor R$ 0,00" className="w-full bg-card border border-gray-800 rounded-2xl px-5 py-4 text-red-500 text-2xl font-black outline-none" />
              <button onClick={handleAddExpense} className="w-full bg-red-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3">
                <Save className="w-5 h-5" /> SALVAR DESPESA
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCheck && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedCheck(null)}></div>
          <div className="relative w-full max-w-xs bg-card border border-gray-800 rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-200 text-white">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-black text-center mb-1">Gestão de Cheque</h3>
            <p className="text-[10px] text-gray-500 text-center uppercase font-black tracking-widest mb-6">Vencimento: {selectedCheck.isoDate}</p>
            <div className="space-y-3">
              <button onClick={() => handleUpdateCheckStatus('CLEARED')} className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> COMPENSADO
              </button>
              <button onClick={() => handleUpdateCheckStatus('BOUNCED')} className="w-full bg-red-500/20 text-red-500 border border-red-500/30 font-black py-4 rounded-xl flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" /> DEVOLVIDO
              </button>
              <button onClick={() => setSelectedCheck(null)} className="w-full text-gray-500 font-bold py-3 uppercase text-[10px]">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; growth: string; growthColor: string }> = ({ label, value, growth, growthColor }) => (
  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black italic text-gray-800 mb-2">{value}</p>
    <div className="flex items-center gap-1">
      <TrendingUp className={`w-3 h-3 ${growthColor}`} />
      <span className={`text-[10px] font-bold ${growthColor}`}>{growth}</span>
    </div>
  </div>
);

const GrowthBar: React.FC<{ height: string; month: string; active?: boolean }> = ({ height, month, active }) => (
  <div className="flex-1 flex flex-col items-center gap-4">
    <div className="w-full flex-1 flex items-end justify-center px-1">
      <div
        style={{ height }}
        className={`w-full max-w-[24px] rounded-t-lg transition-all duration-1000 ${active ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-100'}`}
      ></div>
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-gray-900' : 'text-gray-300'}`}>{month}</span>
  </div>
);

const LegendItem: React.FC<{ color: string; label: string; value: string }> = ({ color, label, value }) => (
  <div className="flex items-center gap-3">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-0.5">{label}</p>
      <p className="text-xs font-black text-gray-800 leading-none">{value}</p>
    </div>
  </div>
);

const ServiceRow: React.FC<{ label: string; amount: string; progress: string }> = ({ label, amount, progress }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest truncate max-w-[70%]">{label}</span>
      <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{amount}</span>
    </div>
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div style={{ width: progress }} className="h-full bg-blue-500 rounded-full transition-all duration-1000"></div>
    </div>
  </div>
);

export default FinanceView;
