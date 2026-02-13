
import React, { useState } from 'react';
import { Bell, Search, ShieldCheck, FileText, X, Wallet, AlertCircle } from 'lucide-react';
import { WorkshopInfo, Transaction } from '../types';

interface HeaderProps {
  workshopName: string;
  logoUrl?: string;
  logoScale?: number;
  pendingCheques?: Transaction[];
  onSearch?: () => void;
}

const Header: React.FC<HeaderProps> = ({ workshopName, logoUrl, logoScale = 1.0, pendingCheques = [], onSearch }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const nameParts = workshopName.split(' ');
  const lastPart = nameParts.length > 1 ? nameParts.pop() : '';
  const firstPart = nameParts.join(' ');

  const hasAlerts = pendingCheques.length > 0;

  return (
    <header className="flex items-center justify-between px-6 py-8 relative">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-4 border-blue-500/20 shadow-xl overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-contain p-1.5 transition-transform"
                style={{ transform: `scale(${logoScale})` }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#0B1118]">
                <ShieldCheck className="w-8 h-8" strokeWidth={2.5} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-[#0B1118] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Oficina Ativa</p>
          </div>
          <h1 className="text-xl font-black italic tracking-tight text-white uppercase leading-tight">
            {firstPart} <span className="text-blue-500">{lastPart}</span>
          </h1>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSearch}
          className="w-11 h-11 bg-card rounded-2xl flex items-center justify-center border border-gray-800/50 hover:bg-gray-800 transition-all active:scale-90 shadow-lg"
        >
          <Search className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all active:scale-90 shadow-lg relative ${hasAlerts ? 'bg-blue-500/10 border-blue-500/30' : 'bg-card border-gray-800/50'}`}
        >
          <Bell className={`w-5 h-5 ${hasAlerts ? 'text-blue-500' : 'text-gray-400'}`} />
          {hasAlerts ? (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-[#0B1118] flex items-center justify-center animate-bounce shadow-lg">
              {pendingCheques.length}
            </span>
          ) : (
            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#151C26]"></span>
          )}
        </button>
      </div>

      {/* Painel de Notificações Popover */}
      {isNotificationsOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
          <div className="absolute top-24 right-6 w-72 bg-[#151C26] border border-gray-800 rounded-3xl shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1B2431]">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Central de Avisos</h3>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-gray-500"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto scrollbar-hide">
              {hasAlerts ? (
                <div className="space-y-2 p-2">
                  <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest px-1 mb-3">Cheques para Compensar Hoje</p>
                  {pendingCheques.map((ch) => (
                    <div key={ch.id} className="bg-[#0B1118] border border-gray-800/50 rounded-2xl p-4 active:bg-gray-800 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black text-white uppercase truncate">{ch.title.split(':').pop()}</p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">Vencimento: Hoje</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase">Cheque</span>
                            <span className="text-xs font-black italic text-blue-500">R$ {Math.abs(ch.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 text-[9px] font-black text-blue-500 uppercase tracking-widest text-center mt-2 border-t border-gray-800/50">Ver todas as finanças</button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center opacity-30">
                  <AlertCircle className="w-8 h-8 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem avisos para hoje</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
