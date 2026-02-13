
import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, QrCode, Banknote, CreditCard, Wallet, FileText, Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
// Fix: Removed non-existent PaymentMethod import from types
import { Transaction, TransactionStatus } from '../types';

interface PaymentViewProps {
  total: number;
  customerName: string;
  vehicle: string;
  plate: string;
  onBack: () => void;
  onFinish: (transactions: Transaction[]) => void;
}

type PaymentMethod = 'PIX' | 'DINHEIRO' | 'DEBITO' | 'CREDITO' | 'CHEQUE';

const PaymentView: React.FC<PaymentViewProps> = ({ total, customerName, vehicle, plate, onBack, onFinish }) => {
  const getFormattedDate = (monthsToAdd = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsToAdd);
    return d.toISOString().split('T')[0];
  };

  const [method, setMethod] = useState<PaymentMethod>('CREDITO');
  const [installments, setInstallments] = useState(1);
  const [cheques, setCheques] = useState([
    { id: 1, date: getFormattedDate(0), value: total }
  ]);

  const redistributeChequeValues = (currentCheques: typeof cheques) => {
    const count = currentCheques.length;
    if (count === 0) return [];
    const dividedValue = total / count;
    return currentCheques.map(c => ({ ...c, value: dividedValue }));
  };

  const handleAddCheque = () => {
    const nextId = cheques.length > 0 ? Math.max(...cheques.map(c => c.id)) + 1 : 1;
    const newCheque = { 
      id: nextId, 
      date: getFormattedDate(cheques.length), 
      value: 0 
    };
    setCheques(redistributeChequeValues([...cheques, newCheque]));
  };

  const handleRemoveCheque = (id: number) => {
    if (cheques.length <= 1) return;
    const filtered = cheques.filter(c => c.id !== id);
    setCheques(redistributeChequeValues(filtered));
  };

  const currentChequesTotal = cheques.reduce((acc, c) => acc + c.value, 0);
  const isTotalCorrect = Math.abs(currentChequesTotal - total) < 0.01;

  const handleFinalize = () => {
    const now = new Date();
    const generatedTransactions: Transaction[] = [];

    if (method === 'CHEQUE') {
      if (!isTotalCorrect) {
        if (!confirm(`A soma dos cheques é diferente do total. Prosseguir?`)) return;
      }

      cheques.forEach((ch, idx) => {
        const checkDate = new Date(ch.date);
        generatedTransactions.push({
          id: Math.random().toString(36).substr(2, 9),
          title: `Serviço: ${vehicle} (${customerName})`,
          subtitle: `Cheque ${idx + 1}/${cheques.length}`,
          amount: ch.value,
          type: 'INCOME',
          category: 'SERVICE',
          method: 'Cheque',
          time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date: checkDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase(),
          isoDate: ch.date,
          status: 'PENDING'
        });
      });
    } else {
      generatedTransactions.push({
        id: Math.random().toString(36).substr(2, 9),
        title: `Serviço: ${vehicle} (${customerName})`,
        subtitle: method,
        amount: total,
        type: 'INCOME',
        category: 'SERVICE',
        method: method,
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        date: 'HOJE, ' + now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase(),
        isoDate: now.toISOString().split('T')[0],
        status: 'CLEARED'
      });
    }

    onFinish(generatedTransactions);
  };

  return (
    <div className="min-h-screen bg-[#0B1118] text-white animate-in slide-in-from-right duration-300 pb-24">
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800/20 sticky top-0 bg-[#0B1118]/80 backdrop-blur-md z-20">
        <button onClick={onBack} className="flex items-center text-blue-500 font-bold gap-1 active:opacity-50">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black italic tracking-tight text-center flex-1">Pagamento</h1>
        <div className="w-5"></div>
      </div>

      <div className="p-6 space-y-8">
        <div className="bg-card border border-gray-800 rounded-3xl p-6 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">CLIENTE</span>
            <h3 className="text-xl font-black italic">{customerName}</h3>
            <div className="flex items-center gap-3 mt-2">
               <span className="text-[10px] font-bold text-gray-400 uppercase">🚗 {vehicle}</span>
               <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-500/20">{plate}</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        <div className="text-center py-4">
          <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">TOTAL DO SERVIÇO</span>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-2xl font-black text-gray-500">R$</span>
            <span className="text-6xl font-black italic tracking-tighter text-white">{total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <section>
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">FORMA DE PAGAMENTO</h2>
          <div className="grid grid-cols-2 gap-4">
            <PaymentButton active={method === 'PIX'} onClick={() => setMethod('PIX')} icon={<QrCode className="w-6 h-6" />} label="Pix" />
            <PaymentButton active={method === 'DINHEIRO'} onClick={() => setMethod('DINHEIRO')} icon={<Banknote className="w-6 h-6" />} label="Dinheiro" />
            <PaymentButton active={method === 'DEBITO'} onClick={() => setMethod('DEBITO')} icon={<Wallet className="w-6 h-6" />} label="Débito" />
            <PaymentButton active={method === 'CREDITO'} onClick={() => setMethod('CREDITO')} icon={<CreditCard className="w-6 h-6" />} label="Crédito" />
            <PaymentButton className="col-span-2" active={method === 'CHEQUE'} onClick={() => setMethod('CHEQUE')} icon={<FileText className="w-6 h-6" />} label="Cheque" />
          </div>
        </section>

        {method === 'CHEQUE' && (
          <section className="animate-in slide-in-from-top-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">DETALHES DOS CHEQUES</h2>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest transition-colors ${isTotalCorrect ? 'text-blue-500 bg-blue-500/10' : 'text-red-500 bg-red-500/10'}`}>
                {cheques.length} {cheques.length === 1 ? 'CHEQUE' : 'CHEQUES'}
              </span>
            </div>

            {cheques.map((c, i) => (
              <div key={c.id} className="bg-card border border-gray-800 rounded-2xl p-6 grid grid-cols-2 gap-4 relative group">
                {cheques.length > 1 && (
                  <button onClick={() => handleRemoveCheque(c.id)} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-gray-600 uppercase">COMPENSAÇÃO ({i + 1})</p>
                  <input type="date" value={c.date} onChange={(e) => setCheques(prev => prev.map(ch => ch.id === c.id ? {...ch, date: e.target.value} : ch))} className="w-full bg-[#0B1118] text-xs font-bold text-white px-3 py-3 rounded-xl border border-gray-800 focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-gray-600 uppercase">VALOR</p>
                  <input type="number" step="0.01" value={c.value || ''} onChange={(e) => setCheques(prev => prev.map(ch => ch.id === c.id ? {...ch, value: parseFloat(e.target.value) || 0} : ch))} placeholder="0,00" className="w-full bg-[#0B1118] text-sm font-bold text-white px-3 py-3 rounded-xl border border-gray-800 text-right focus:border-blue-500" />
                </div>
              </div>
            ))}
            
            <button onClick={handleAddCheque} className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest active:text-blue-500">
              <Plus className="w-4 h-4" /> Adicionar Novo Cheque
            </button>
          </section>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B1118] via-[#0B1118] to-transparent z-10">
          <button onClick={handleFinalize} className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/40 active:scale-95 transition-all">
            <CheckCircle2 className="w-6 h-6" /> FINALIZAR PAGAMENTO E BAIXAR OS
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; className?: string }> = ({ active, onClick, icon, label, className = "" }) => (
  <button onClick={onClick} className={`${className} flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all active:scale-95 relative ${active ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-card border-transparent text-gray-600'}`}>
    <div className={`mb-3 ${active ? 'text-blue-500' : 'text-gray-600'}`}>{icon}</div>
    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default PaymentView;
