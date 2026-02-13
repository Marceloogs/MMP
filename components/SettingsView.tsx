
import React, { useState, useRef } from 'react';
import { ShieldCheck, MapPin, Phone, Building2, Save, Camera, ChevronLeft, Image as ImageIcon, ZoomIn, ZoomOut, Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { WorkshopInfo } from '../types';

interface SettingsViewProps {
  workshopInfo: WorkshopInfo;
  onSave: (info: WorkshopInfo) => void;
  onBack: () => void;
}

const STORAGE_KEY = 'mecanicpro_v1_data';

const SettingsView: React.FC<SettingsViewProps> = ({ workshopInfo, onSave, onBack }) => {
  const [formData, setFormData] = useState<WorkshopInfo>({
    ...workshopInfo,
    logoScale: workshopInfo.logoScale || 1.0
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setLoading(true);
    try {
      onSave(formData);
    } catch (e) {
      console.error("Erro ao disparar onSave", e);
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem selecionada é muito grande. Escolha uma foto menor que 2MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, logoScale: parseFloat(e.target.value) }));
  };

  // Lógica de Backup - Exportar
  const handleExportBackup = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      alert("Não há dados registrados para exportar.");
      return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `backup_mecanicpro_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Lógica de Backup - Importar
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmImport = confirm("ATENÇÃO: Importar um backup irá SUBSTITUIR todos os dados atuais da sua oficina. Deseja continuar?");
    if (!confirmImport) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Validação básica de JSON
        JSON.parse(content);
        
        localStorage.setItem(STORAGE_KEY, content);
        alert("Backup restaurado com sucesso! O aplicativo será reiniciado para aplicar as mudanças.");
        window.location.reload();
      } catch (err) {
        alert("Erro: O arquivo selecionado não é um backup válido do MecanicPro.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#0B1118] text-white animate-in slide-in-from-right duration-300 pb-40">
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800/20 sticky top-0 bg-[#0B1118]/80 backdrop-blur-md z-20">
        <button onClick={onBack} className="text-blue-500 font-bold active:opacity-50">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black italic tracking-tight uppercase">Configurações</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-6 space-y-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer" onClick={handleLogoClick}>
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center border-4 border-blue-500/20 shadow-2xl overflow-hidden transition-transform active:scale-95">
               {formData.logoUrl ? (
                 <img 
                   src={formData.logoUrl} 
                   alt="Logo Oficina" 
                   className="w-full h-full object-contain p-2 transition-transform duration-200" 
                   style={{ transform: `scale(${formData.logoScale})` }}
                 />
               ) : (
                 <ShieldCheck className="w-14 h-14 text-[#0B1118]" />
               )}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="w-8 h-8 text-white" />
               </div>
            </div>
            <button className="absolute bottom-1 right-1 w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center border-4 border-[#0B1118] shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          <p className="text-[10px] font-bold text-gray-500 mt-4 tracking-widest uppercase">Logo da Oficina</p>
          
          {formData.logoUrl && (
            <div className="mt-6 w-full max-w-[200px] space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <ZoomOut className="w-3.5 h-3.5" />
                <span>Ajustar Tamanho</span>
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={formData.logoScale} 
                onChange={handleScaleChange}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}
        </div>

        {/* Workshop Info Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">DADOS DA EMPRESA</h2>
          </div>

          <div className="space-y-3">
             <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 focus-within:border-blue-500 transition-colors group">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">NOME DA OFICINA</p>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  className="w-full bg-transparent border-none text-white text-base font-bold focus:outline-none uppercase" 
                  placeholder="Ex: Mecânica Copetão"
                />
             </div>

             <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 focus-within:border-blue-500 transition-colors group">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">TELEFONE / WHATSAPP</p>
                <div className="flex items-center gap-2">
                   <Phone className="w-4 h-4 text-gray-600" />
                   <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    className="w-full bg-transparent border-none text-white text-base font-bold focus:outline-none" 
                    placeholder="(00) 00000-0000"
                  />
                </div>
             </div>

             <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 focus-within:border-blue-500 transition-colors group">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">ENDEREÇO COMPLETO</p>
                <div className="flex items-start gap-2">
                   <MapPin className="w-4 h-4 text-gray-600 mt-1" />
                   <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                    rows={3}
                    className="w-full bg-transparent border-none text-white text-sm font-bold focus:outline-none resize-none" 
                    placeholder="Rua, Número, Bairro, Cidade - Estado"
                  />
                </div>
             </div>
          </div>
        </section>

        {/* Backup Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-purple-500" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">BACKUP E SEGURANÇA</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleExportBackup}
              className="bg-card border border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-3 active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Download className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Exportar Backup</span>
            </button>

            <button 
              onClick={() => importInputRef.current?.click()}
              className="bg-card border border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-3 active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Importar Backup</span>
            </button>
            <input 
              type="file" 
              ref={importInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleImportBackup} 
            />
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold text-amber-500/80 uppercase leading-relaxed tracking-wider">
              RECOMENDAÇÃO: EXPORTE UM BACKUP SEMANALMENTE PARA GARANTIR QUE SEUS DADOS ESTEJAM SEGUROS FORA DO NAVEGADOR.
            </p>
          </div>
        </section>

        <div className="pt-4">
           <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-50"
           >
             <Save className="w-5 h-5" />
             {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
