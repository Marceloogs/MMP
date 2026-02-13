
import React from 'react';
import { Settings, Wrench, Search as SearchIcon, Trash2, Clock, CheckCircle, FileText } from 'lucide-react';
import { Service, ServiceStatus } from '../types';

interface ActiveServicesProps {
  services: Service[];
  onServiceClick: (service: Service) => void;
  onDeleteService: (id: string) => void;
}

const StatusBadge: React.FC<{ status: ServiceStatus }> = ({ status }) => {
  const styles = {
    'EM ANDAMENTO': 'bg-blue-500/10 text-blue-500',
    'AGUARDANDO PEÇAS': 'bg-yellow-500/10 text-yellow-500',
    'DIAGNÓSTICO': 'bg-cyan-500/10 text-cyan-500',
    'CONCLUÍDO': 'bg-green-500/10 text-green-500',
    'AGUARDANDO APROVAÇÃO': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    'OUTROS': 'bg-gray-500/10 text-gray-500'
  };

  return (
    <span className={`text-[8px] font-black px-2 py-1 rounded-md tracking-widest uppercase ${styles[status] || styles['OUTROS']}`}>
      {status}
    </span>
  );
};

const ActiveServices: React.FC<ActiveServicesProps> = ({ services, onServiceClick, onDeleteService }) => {
  const getStatusDotColor = (status: ServiceStatus) => {
    switch (status) {
      case 'EM ANDAMENTO': return 'bg-blue-500';
      case 'AGUARDANDO PEÇAS': return 'bg-yellow-500';
      case 'DIAGNÓSTICO': return 'bg-cyan-500';
      case 'AGUARDANDO APROVAÇÃO': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'EM ANDAMENTO': return <Wrench className="w-3 h-3 text-gray-600" />;
      case 'AGUARDANDO PEÇAS': return <Settings className="w-3 h-3 text-gray-600" />;
      case 'DIAGNÓSTICO': return <SearchIcon className="w-3 h-3 text-gray-600" />;
      case 'AGUARDANDO APROVAÇÃO': return <Clock className="w-3 h-3 text-purple-400" />;
      default: return null;
    }
  };

  return (
    <div className="px-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">Fluxo de Trabalho</h2>
        <button className="text-[10px] font-black text-accent uppercase tracking-widest">Ver Todos</button>
      </div>
      
      <div className="space-y-4">
        {services.length > 0 ? services.map((service) => (
          <div 
            key={service.id} 
            onClick={() => onServiceClick(service)}
            className={`bg-card rounded-[1.5rem] p-4 flex gap-4 border active:scale-[0.98] transition-all cursor-pointer shadow-xl relative group ${service.status === 'AGUARDANDO APROVAÇÃO' ? 'border-purple-500/30 bg-purple-500/5' : 'border-gray-800/30'}`}
          >
            <div className="relative flex-shrink-0">
              <img 
                src={service.imageUrl} 
                alt={service.vehicle} 
                className={`w-16 h-16 rounded-2xl object-cover grayscale transition-opacity ${service.status === 'AGUARDANDO APROVAÇÃO' ? 'opacity-40' : 'opacity-60'}`}
              />
              <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-[#151C26] ${getStatusDotColor(service.status)} shadow-lg`}></div>
            </div>
            
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex justify-between items-start mb-0.5">
                <h3 className="font-black text-lg italic tracking-tight truncate uppercase">{service.vehicle}</h3>
              </div>
              <p className="text-[10px] text-gray-500 mb-2 font-black uppercase tracking-[0.1em]">{service.plate} {service.customerName ? `• ${service.customerName}` : ''}</p>
              
              <div className="flex items-center gap-2">
                <StatusBadge status={service.status} />
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <div className="flex items-center gap-1 min-w-0">
                    {getStatusIcon(service.status)}
                    <p className="text-[10px] text-gray-400 font-bold truncate">{service.description}</p>
                </div>
              </div>
            </div>

            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if(confirm("Deseja realmente excluir este serviço?")) {
                        onDeleteService(service.id);
                    }
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-red-500/10 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
            >
                <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )) : (
          <div className="text-center py-16 bg-card/10 rounded-[2.5rem] border-2 border-dashed border-gray-800/40">
            <div className="w-16 h-16 bg-gray-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800/50">
               <Wrench className="w-7 h-7 text-gray-700" />
            </div>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">Nenhum serviço ou orçamento em aberto</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveServices;
