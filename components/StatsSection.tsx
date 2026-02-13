
import React from 'react';
import { Car, Clock, CheckCircle } from 'lucide-react';

interface StatsSectionProps {
  activeCount: number;
  pendingCount: number;
  finishedCount: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({ activeCount, pendingCount, finishedCount }) => {
  const stats = [
    { 
      label: 'VEÍCULOS NA OFICINA', 
      value: activeCount.toString().padStart(2, '0'), 
      icon: <Car className="w-5 h-5" />, 
      color: 'text-blue-400' 
    },
    { 
      label: 'SERVIÇOS PENDENTES', 
      value: pendingCount.toString().padStart(2, '0'), 
      icon: <Clock className="w-5 h-5" />, 
      color: 'text-yellow-400' 
    },
    { 
      label: 'CONCLUÍDOS HOJE', 
      value: finishedCount.toString().padStart(2, '0'), 
      icon: <CheckCircle className="w-5 h-5" />, 
      color: 'text-emerald-400' 
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 px-6 mb-8">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-card rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-800/50 shadow-lg">
          <div className={`${stat.color} mb-3 opacity-80`}>
            {stat.icon}
          </div>
          <span className="text-3xl font-black italic mb-1">{stat.value}</span>
          <span className="text-[8px] text-center text-gray-500 font-black leading-tight uppercase tracking-[0.15em]">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;
