
import React from 'react';
import { Maximize2 } from 'lucide-react';

const WorkshopMap: React.FC = () => {
  return (
    <div className="px-6 mb-24">
      <div className="bg-card rounded-2xl p-6 border border-gray-800/50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold">Mapa da Oficina</h2>
            <p className="text-xs text-gray-500">Visualização ao vivo dos boxes</p>
          </div>
          <button className="w-10 h-10 bg-[#0B1118] rounded-xl flex items-center justify-center text-gray-400">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative h-44 rounded-xl overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f?auto=format&fit=crop&q=80&w=800" 
            alt="Oficina" 
            className="w-full h-full object-cover grayscale opacity-50 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151C26] via-transparent to-transparent"></div>
          
          {/* Mock indicators for boxes */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopMap;
