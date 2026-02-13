
import React from 'react';
import { UserPlus, FileText, BarChart3 } from 'lucide-react';

interface QuickActionsProps {
  onNewCustomer: () => void;
  onBudget: () => void;
  onReports: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNewCustomer, onBudget, onReports }) => {
  return (
    <div className="px-6 mb-8">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Ações Rápidas</h2>
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={onNewCustomer}
          className="bg-accent rounded-2xl p-4 flex flex-col items-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform text-center"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider leading-tight">Cliente</span>
        </button>

        <button 
          onClick={onBudget}
          className="bg-card rounded-2xl p-4 flex flex-col items-center gap-3 border border-gray-800/50 active:scale-95 transition-transform text-center"
        >
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider leading-tight text-gray-300">Orçamento</span>
        </button>

        <button 
          onClick={onReports}
          className="bg-card rounded-2xl p-4 flex flex-col items-center gap-3 border border-gray-800/50 active:scale-95 transition-transform text-center"
        >
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider leading-tight text-gray-300">Relatórios</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
