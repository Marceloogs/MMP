
import React, { useState } from 'react';
import { Camera, ChevronLeft, LayoutGrid, Car, Clock, Settings, Fingerprint, CheckCircle2, Save } from 'lucide-react';

interface VehicleFormProps {
  onBack: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plate: 'ADC 2387',
    model: 'Scania R440',
    year: '2018',
    color: 'Branco',
    chassis: 'Hzhjjajsjjzhdhd',
    km: '1000'
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.plate || !formData.model) {
      alert('Placa e Modelo são obrigatórios');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Veículo salvo com sucesso!');
      onBack();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0B1118] text-white animate-in slide-in-from-right duration-300">
      {/* Header Fixo */}
      <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-[#0B1118]/90 backdrop-blur-xl z-20 border-b border-gray-800/20">
        <button onClick={onBack} className="flex items-center text-blue-500 font-bold gap-1 active:opacity-50">
          <ChevronLeft className="w-6 h-6" />
          Voltar
        </button>
        <h1 className="text-sm font-bold text-gray-500 uppercase tracking-widest italic">CADASTRO</h1>
        <div className="w-12"></div>
      </div>

      <div className="px-6 space-y-4 mt-6 pb-60">
        {/* Banner de Foto do Veículo */}
        <div className="relative h-40 bg-card rounded-[2.5rem] border border-gray-800 overflow-hidden mb-8 flex items-center justify-center group cursor-pointer shadow-2xl">
           <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-50 transition-opacity">
              <Camera className="w-10 h-10" />
              <span className="text-[10px] font-black uppercase tracking-widest">Foto do Veículo</span>
           </div>
           <div className="absolute bottom-4 right-4 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-4 border-[#151C26]">
              <Camera className="w-4 h-4 text-white" />
           </div>
        </div>

        {/* Grade de Inputs estilo Cards */}
        <section className="space-y-3">
          <VehicleCardInput 
            icon={<LayoutGrid className="w-5 h-5" />} 
            label="PLACA" 
            value={formData.plate}
            onChange={(v) => handleChange('plate', v)}
          />
          
          <VehicleCardInput 
            icon={<Car className="w-5 h-5" />} 
            label="MODELO" 
            value={formData.model}
            onChange={(v) => handleChange('model', v)}
          />

          <div className="grid grid-cols-2 gap-3">
            <VehicleCardInput 
              icon={<Clock className="w-5 h-5" />} 
              label="ANO" 
              value={formData.year}
              onChange={(v) => handleChange('year', v)}
            />
            <VehicleCardInput 
              icon={<Settings className="w-5 h-5" />} 
              label="COR" 
              value={formData.color}
              onChange={(v) => handleChange('color', v)}
            />
          </div>

          <VehicleCardInput 
            icon={<Fingerprint className="w-5 h-5" />} 
            label="NÚMERO DO CHASSI" 
            value={formData.chassis}
            onChange={(v) => handleChange('chassis', v)}
          />

          <VehicleCardInput 
            icon={<CheckCircle2 className="w-5 h-5" />} 
            label="KM ATUAL" 
            value={formData.km}
            onChange={(v) => handleChange('km', v)}
          />
        </section>

        {/* Container do Botão com margem superior */}
        <div className="pt-10">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(59,130,246,0.3)] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
               <span className="animate-pulse">PROCESSANDO...</span>
            ) : (
              <>
                <Save className="w-6 h-6" />
                SALVAR CADASTRO
              </>
            )}
          </button>
        </div>
        
        {/* Espaçador de segurança extra */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

interface VehicleCardInputProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const VehicleCardInput: React.FC<VehicleCardInputProps> = ({ icon, label, value, onChange }) => (
  <div className="bg-card border border-gray-800/50 rounded-2xl px-6 py-5 flex items-center gap-5 group focus-within:border-blue-500/50 transition-all shadow-lg">
    <div className="w-11 h-11 bg-[#0B1118] rounded-xl flex items-center justify-center text-blue-500 group-focus-within:bg-blue-500 group-focus-within:text-white transition-all shadow-inner">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 group-focus-within:text-blue-400 transition-colors">
        {label}
      </p>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-none text-xl font-black italic text-white focus:outline-none placeholder:text-gray-800"
      />
    </div>
  </div>
);

export default VehicleForm;
