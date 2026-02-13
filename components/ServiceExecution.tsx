
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Wrench, Clock, Settings, Search, CheckCircle2, LayoutGrid, Home, Gauge } from 'lucide-react';
import { ServiceStatus, Service } from '../types';

interface ServiceExecutionProps {
  onBack: () => void;
  onGoToDashboard: () => void;
  onFinish: (details: any) => void;
  vehicleModel: string;
  plate: string;
  serviceId?: string;
  initialDescription?: string;
  initialStatus?: ServiceStatus;
  onUpdateExecution?: (description: string, status: ServiceStatus) => void;
  mileage?: string; 
}

const ServiceExecution: React.FC<ServiceExecutionProps> = ({ 
  onBack, 
  onGoToDashboard,
  onFinish, 
  vehicleModel, 
  plate,
  serviceId,
  initialDescription = '',
  initialStatus = 'EM ANDAMENTO',
  onUpdateExecution,
  mileage
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState<ServiceStatus>(initialStatus);

  useEffect(() => {
    onUpdateExecution?.(description, status);
  }, [description, status]);

  const statusOptions = [
    { label: 'Em Andamento', val: 'EM ANDAMENTO' as ServiceStatus, color: 'bg-blue-500' },
    { label: 'Aguardando Peças', val: 'AGUARDANDO PEÇAS' as ServiceStatus, color: 'bg-yellow-500' },
    { label: 'Diagnóstico', val: 'DIAGNÓSTICO' as ServiceStatus, color: 'bg-purple-500' },
    { label: 'Aguardando Aprovação', val: 'AGUARDANDO APROVAÇÃO' as ServiceStatus, color: 'bg-cyan-500' },
    { label: 'Outros', val: 'OUTROS' as ServiceStatus, color: 'bg-gray-500' },
  ];

  const osNumber = serviceId || '----';

  return (
    <div className="min-h-screen bg-[#0B1118] text-white animate-in slide-in-from-right duration-300">
      {/* Header Fixo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800/20 sticky top-0 bg-[#0B1118]/90 backdrop-blur-xl z-20">
        <button onClick={onBack} className="flex items-center text-blue-500 font-bold gap-1 active:opacity-50">
          <ChevronLeft className="w-5 h-5" />
          Orçamento
        </button>
        <h1 className="text-lg font-black italic tracking-tight uppercase">Execução</h1>
        <button onClick={onGoToDashboard} className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-blue-500 active:scale-90 transition-transform">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-8 pb-60">
        <div className="flex items-center gap-4 bg-card border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
           <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 relative z-10">
             <Wrench className="w-8 h-8 text-white" strokeWidth={2.5} />
           </div>
           <div className="relative z-10">
             <h3 className="text-xl font-black italic uppercase">{vehicleModel || "Veículo"}</h3>
             <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">OS #{osNumber}</span>
                <span className="text-[10px] text-gray-600 font-bold">•</span>
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{plate}</span>
             </div>
             {mileage && (
               <div className="flex items-center gap-1 mt-1 text-emerald-500">
                 <Gauge className="w-3 h-3" />
                 <span className="text-[9px] font-black uppercase tracking-widest">KM ENTRADA: {mileage}</span>
               </div>
             )}
           </div>
           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-4 h-4 text-blue-500" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">RELATO DOS SERVIÇOS REALIZADOS</h2>
          </div>
          <div className="bg-card border border-gray-800 rounded-3xl p-6 focus-within:border-blue-500 transition-colors shadow-inner">
            <textarea 
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o que foi feito no veículo..."
              className="w-full bg-transparent border-none text-white focus:outline-none resize-none text-base leading-relaxed"
            />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-blue-500" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">STATUS ATUAL DO SERVIÇO</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {statusOptions.map((opt) => (
              <button 
                key={opt.val}
                onClick={() => setStatus(opt.val)}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                  status === opt.val 
                  ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg shadow-blue-500/5' 
                  : 'bg-card border-gray-800/50 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${opt.color} shadow-lg shadow-white/5`}></div>
                  <span className="text-sm font-bold">{opt.label}</span>
                </div>
                {status === opt.val && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              </button>
            ))}
          </div>
        </section>

        <div className="pt-2">
            <button 
                onClick={onGoToDashboard}
                className="w-full bg-gray-800/50 border border-gray-800 text-gray-400 font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
                <Home className="w-4 h-4" />
                Pausar e Voltar ao Início
            </button>
        </div>

        <div className="pt-4">
           <button 
            onClick={() => onFinish({ description, status: 'CONCLUÍDO' })}
            className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(59,130,246,0.3)] active:scale-95 transition-all"
           >
             <CheckCircle2 className="w-6 h-6" />
             FINALIZAR SERVIÇO E COBRAR
           </button>
        </div>
        
        {/* Espaçador de segurança para scroll */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default ServiceExecution;
