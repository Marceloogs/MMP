
import React, { useState } from 'react';
import { ChevronLeft, Search, User, Car, Calendar, FileText, CheckCircle2, X, Gauge, UserPlus } from 'lucide-react';
import { Customer, Vehicle, Service } from '../types';

interface NewServiceFormProps {
  onBack: () => void;
  customers: Customer[];
  nextServiceNumber: number;
  onStartService: (service: Service) => void;
}

const NewServiceForm: React.FC<NewServiceFormProps> = ({ onBack, customers, nextServiceNumber, onStartService }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [serviceDescription, setServiceDescription] = useState('');
  const [mileage, setMileage] = useState('');
  const [predictionDate, setPredictionDate] = useState('');

  const handleFinish = () => {
    if (!selectedCustomer || !selectedVehicle || !serviceDescription || !mileage) {
      alert('Por favor, preencha todos os campos obrigatórios (incluindo a kilometragem).');
      return;
    }

    const newService: Service = {
      id: String(nextServiceNumber).padStart(2, '0'),
      customerName: selectedCustomer.name,
      vehicle: selectedVehicle.model,
      plate: selectedVehicle.plate,
      description: serviceDescription,
      mileage: mileage,
      status: 'AGUARDANDO APROVAÇÃO',
      imageUrl: selectedVehicle.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=200'
    };

    onStartService(newService);
  };

  const filteredCustomers = searchQuery.length > 0 
    ? customers.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.document.includes(searchQuery)
      ) 
    : [];

  return (
    <div className="min-h-screen pb-40 animate-in slide-in-from-bottom duration-300 bg-[#0B1118]">
      <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-[#0B1118]/80 backdrop-blur-md z-20 border-b border-gray-800/20">
        <button onClick={onBack} className="text-blue-500 font-medium flex items-center gap-1 active:opacity-50">
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>
        <h1 className="text-lg font-bold">Novo Orçamento</h1>
        <button 
          onClick={handleFinish}
          disabled={!selectedCustomer || !selectedVehicle}
          className="text-blue-500 font-bold active:opacity-50 disabled:opacity-20"
        >
          Iniciar
        </button>
      </div>

      <div className="px-6 space-y-8 mt-6">
        <div className="flex gap-2 mb-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${selectedCustomer && i === 1 ? 'bg-blue-500' : (selectedVehicle && i === 2 ? 'bg-blue-500' : (serviceDescription && i === 3 ? 'bg-blue-500' : 'bg-gray-800'))}`} />
            ))}
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Passo 1: Selecionar Cliente</h2>
          </div>

          {!selectedCustomer ? (
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-gray-800 rounded-2xl pl-12 pr-4 py-5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all shadow-xl shadow-black/20"
              />
              {searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-gray-800 rounded-2xl overflow-hidden z-[60] shadow-2xl animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setSearchQuery('');
                        }}
                        className="w-full px-6 py-4 text-left text-sm hover:bg-blue-500/10 border-b border-gray-800/30 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white block">{c.name}</span>
                          <span className="text-[10px] text-gray-500">{c.document}</span>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-gray-600 rotate-180" />
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-10 text-center">
                       <p className="text-xs text-gray-500 mb-4 uppercase font-bold">Nenhum cliente encontrado</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between animate-in zoom-in-95 duration-200">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">CLIENTE SELECIONADO</p>
                   <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
                 </div>
               </div>
               <button onClick={() => { setSelectedCustomer(null); setSelectedVehicle(null); }} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center active:scale-90 transition-transform">
                 <X className="w-4 h-4 text-gray-400" />
               </button>
            </div>
          )}
        </section>

        <section className={`space-y-4 transition-all duration-500 ${!selectedCustomer ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-500" />
            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Passo 2: Selecionar Veículo</h2>
          </div>

          {!selectedVehicle ? (
            <div className="grid grid-cols-1 gap-3">
                {selectedCustomer && selectedCustomer.vehicles.length > 0 ? selectedCustomer.vehicles.map(v => (
                    <button 
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className="bg-card border border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-500/50 transition-all active:scale-95 text-left"
                    >
                        {v.imageUrl ? (
                           <img src={v.imageUrl} alt={v.model} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                           <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-xl">🚗</div>
                        )}
                        <div>
                            <p className="font-bold text-white text-base">{v.model}</p>
                            <p className="text-[10px] font-black text-blue-500 tracking-widest uppercase">{v.plate}</p>
                        </div>
                    </button>
                )) : selectedCustomer ? (
                  <div className="text-center py-6 border border-dashed border-gray-800 rounded-2xl">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Nenhum veículo vinculado</p>
                  </div>
                ) : null}
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between animate-in zoom-in-95 duration-200">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                    <Car className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">VEÍCULO SELECIONADO</p>
                   <h3 className="text-lg font-bold text-white">{selectedVehicle.model}</h3>
                   <p className="text-xs text-gray-500 font-bold">{selectedVehicle.plate}</p>
                 </div>
               </div>
               <button onClick={() => setSelectedVehicle(null)} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center active:scale-90 transition-transform">
                 <X className="w-4 h-4 text-gray-400" />
               </button>
            </div>
          )}
        </section>

        <section className={`space-y-6 transition-all duration-500 ${!selectedVehicle ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Passo 3: Detalhes do Problema</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-gray-800 rounded-2xl p-6 focus-within:border-blue-500 transition-colors shadow-inner">
               <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-2">Relato do Cliente / Diagnóstico Inicial</label>
               <textarea 
                 rows={4}
                 value={serviceDescription}
                 onChange={(e) => setServiceDescription(e.target.value)}
                 placeholder="Descreva aqui o problema relatado pelo cliente..."
                 className="w-full bg-transparent border-none text-white focus:outline-none resize-none text-sm leading-relaxed"
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-gray-800 rounded-2xl px-6 py-5 flex items-center shadow-inner">
                    <div className="flex items-center gap-4 w-full">
                        <Gauge className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Kilometragem Atual</p>
                            <input 
                                type="number"
                                value={mileage}
                                onChange={(e) => setMileage(e.target.value)}
                                placeholder="Ex: 45000"
                                className="bg-transparent border-none text-white text-sm font-bold focus:outline-none w-full mt-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-gray-800 rounded-2xl px-6 py-5 flex items-center shadow-inner">
                    <div className="flex items-center gap-4 w-full">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Previsão de Entrega</p>
                            <input 
                                type="date"
                                value={predictionDate}
                                onChange={(e) => setPredictionDate(e.target.value)}
                                className="bg-transparent border-none text-white text-sm font-bold focus:outline-none w-full mt-1"
                            />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </section>

        <div className="pt-8">
            <button 
                onClick={handleFinish}
                disabled={!selectedCustomer || !selectedVehicle || !serviceDescription || !mileage}
                className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
            >
                <CheckCircle2 className="w-6 h-6" />
                ABRIR ORÇAMENTO (OS #{String(nextServiceNumber).padStart(2, '0')})
            </button>
        </div>
        
        {/* Espaçador Extra para garantir que o scroll ultrapasse o limite do teclado */}
        <div className="h-40"></div>
      </div>
    </div>
  );
};

export default NewServiceForm;
