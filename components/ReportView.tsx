
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Printer, Download, Calendar, Car, User, FileText, Search, Wrench, ChevronRight, Share2, Phone, MapPin, ShieldCheck, Tag } from 'lucide-react';
import { Customer, Vehicle, Service, WorkshopInfo, BudgetItem } from '../types';

interface ReportViewProps {
  customers: Customer[];
  serviceHistory: Service[];
  workshopInfo: WorkshopInfo;
  onBack: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ customers, serviceHistory, workshopInfo, onBack }) => {
  const [step, setStep] = useState<'filter' | 'result'>('filter');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const filteredHistory = useMemo(() => {
    if (!selectedVehicle) return [];
    return serviceHistory.filter(s => 
      s.plate === selectedVehicle.plate &&
      s.finishedDate && 
      s.finishedDate >= dateRange.start && 
      s.finishedDate <= dateRange.end
    ).sort((a, b) => (b.finishedDate || '').localeCompare(a.finishedDate || ''));
  }, [selectedVehicle, dateRange, serviceHistory]);

  const calculateServiceTotal = (items?: BudgetItem[], discount?: number) => {
    if (!items) return 0;
    const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
    return subtotal - (discount || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const logoScale = workshopInfo.logoScale || 1.0;

  if (step === 'filter') {
    return (
      <div className="min-h-screen bg-[#0B1118] text-white animate-in fade-in duration-500">
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800/20 sticky top-0 bg-[#0B1118]/80 backdrop-blur-md z-20">
          <button onClick={onBack} className="text-blue-500"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="text-lg font-black italic tracking-tight uppercase">Gerar Relatório</h1>
          <div className="w-6"></div>
        </div>

        <div className="p-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">1. Selecione o Cliente</h2>
            </div>
            {!selectedCustomer ? (
              <div className="bg-card border border-gray-800 rounded-3xl p-4 max-h-48 overflow-y-auto space-y-2">
                {customers.map(c => (
                  <button key={c.id} onClick={() => setSelectedCustomer(c)} className="w-full text-left px-4 py-3 bg-[#0B1118] border border-gray-800 rounded-2xl flex items-center justify-between hover:border-blue-500 transition-colors">
                    <span className="font-bold text-sm">{c.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-3xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-blue-500 uppercase">CLIENTE</p>
                  <p className="font-bold">{selectedCustomer.name}</p>
                </div>
                <button onClick={() => {setSelectedCustomer(null); setSelectedVehicle(null);}} className="text-xs font-bold text-gray-500">Alterar</button>
              </div>
            )}
          </section>

          <section className={`space-y-4 ${!selectedCustomer ? 'opacity-20 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-500" />
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">2. Selecione o Veículo</h2>
            </div>
            {!selectedVehicle ? (
              <div className="grid grid-cols-1 gap-3">
                {selectedCustomer?.vehicles.map(v => (
                  <button key={v.id} onClick={() => setSelectedVehicle(v)} className="bg-card border border-gray-800 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500 transition-colors">
                    <div>
                      <p className="font-bold">{v.model}</p>
                      <p className="text-[10px] text-blue-500 font-black">{v.plate}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-emerald-500 uppercase">VEÍCULO</p>
                  <p className="font-bold">{selectedVehicle.model}</p>
                  <p className="text-xs text-gray-500">{selectedVehicle.plate}</p>
                </div>
                <button onClick={() => setSelectedVehicle(null)} className="text-xs font-bold text-gray-500">Alterar</button>
              </div>
            )}
          </section>

          <section className={`space-y-4 ${!selectedVehicle ? 'opacity-20 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">3. Período do Relatório</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-gray-800 rounded-2xl p-4">
                <p className="text-[9px] font-black text-gray-600 uppercase mb-1">INÍCIO</p>
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} className="bg-transparent border-none text-white text-xs font-bold w-full" />
              </div>
              <div className="bg-card border border-gray-800 rounded-2xl p-4">
                <p className="text-[9px] font-black text-gray-600 uppercase mb-1">FIM</p>
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} className="bg-transparent border-none text-white text-xs font-bold w-full" />
              </div>
            </div>
          </section>

          <button disabled={!selectedVehicle} onClick={() => setStep('result')} className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-20">GERAR HISTÓRICO COMPLETO</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white print:bg-white text-gray-900 animate-in slide-in-from-bottom duration-500 report-container print:min-h-0">
      <div className="print:hidden flex items-center justify-between px-6 py-6 bg-[#0B1118] text-white sticky top-0 z-50">
        <button onClick={() => setStep('filter')} className="text-blue-500 flex items-center gap-1 font-bold"><ChevronLeft className="w-5 h-5" /> Ajustar</button>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center"><Printer className="w-5 h-5 text-blue-400" /></button>
          <button className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Share2 className="w-5 h-5 text-white" /></button>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto print:p-0 print:m-0 print:max-w-none">
        <div className="border-b-4 border-gray-900 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:pb-4 print:mb-4 print:border-b-2">
          <div className="flex items-start gap-6 print:gap-4">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-[#0B1118] border border-gray-200 shadow-sm overflow-hidden flex-shrink-0 print:w-16 print:h-16">
               {workshopInfo.logoUrl ? (
                 <img 
                   src={workshopInfo.logoUrl} 
                   alt="Logo" 
                   className="w-full h-full object-contain p-2 transition-transform" 
                   style={{ transform: `scale(${logoScale})` }}
                 />
               ) : (
                 <ShieldCheck className="w-12 h-12 print:w-8 print:h-8" />
               )}
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none print:text-[18pt]">{workshopInfo.name}</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-2 print:mt-1 print:text-[8pt]">Relatório Técnico de Manutenção</p>
              <div className="text-[10px] text-gray-500 mt-3 space-y-0.5 font-bold uppercase tracking-widest print:text-[7pt] print:mt-2">
                <p className="flex items-center gap-2"><MapPin className="w-3 h-3 print:w-2 print:h-2" /> {workshopInfo.address}</p>
                <p className="flex items-center gap-2"><Phone className="w-3 h-3 print:w-2 print:h-2" /> {workshopInfo.phone}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 p-6 rounded-3xl border border-gray-200 flex-shrink-0 text-right print:p-3 print:rounded-xl">
             <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 print:text-[6pt]">PERÍODO CONSULTADO</h2>
             <p className="text-xs font-black uppercase tracking-tight print:text-[8pt]">{dateRange.start.split('-').reverse().join('/')} — {dateRange.end.split('-').reverse().join('/')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 print:mb-6 print:p-4 print:rounded-2xl print:gap-4 print:border-gray-300">
          <div className="space-y-1">
            <h3 className="text-[9px] font-black text-blue-600 uppercase tracking-widest print:text-[7pt]">PROPRIETÁRIO</h3>
            <p className="text-xl font-black italic uppercase print:text-[12pt]">{selectedCustomer?.name}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest print:text-[8pt]">{selectedCustomer?.phone}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-[9px] font-black text-blue-600 uppercase tracking-widest print:text-[7pt]">VEÍCULO</h3>
            <p className="text-xl font-black italic uppercase print:text-[12pt]">{selectedVehicle?.model}</p>
            <p className="text-sm font-black text-blue-600 tracking-widest uppercase print:text-[9pt]">PLACA: {selectedVehicle?.plate}</p>
          </div>
        </div>

        <div className="space-y-12 mb-20 print:space-y-6 print:mb-10">
          <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4 print:pb-2 print:border-gray-200">
             <Wrench className="w-5 h-5 text-gray-900 print:w-4 print:h-4" />
             <h2 className="text-xl font-black italic uppercase tracking-tight print:text-[13pt]">Histórico Detalhado de Intervenções</h2>
          </div>

          {filteredHistory.map((service) => {
            const totalOS = calculateServiceTotal(service.budgetItems, service.discount);
            
            return (
              <div key={service.id} className="relative pl-10 border-l-4 border-blue-100 ml-4 animate-in fade-in slide-in-from-left duration-500 print:pl-6 print:border-l-2 print:ml-2 page-break-avoid">
                <div className="absolute -left-[14px] top-0 w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-md print:w-4 print:h-4 print:-left-[9px] print:border-2"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:mb-3 print:gap-2">
                  <div>
                    <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm print:text-[7pt] print:px-2">
                      {new Date(service.finishedDate!).toLocaleDateString('pt-BR')}
                    </span>
                    <h4 className="text-lg font-black italic uppercase mt-2 print:text-[11pt] print:mt-1">OS #{service.id}</h4>
                  </div>
                  <div className="bg-gray-900 text-white px-5 py-2 rounded-2xl shadow-xl print:bg-white print:text-black print:border print:border-black print:px-3 print:py-1 print:rounded-lg">
                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5 print:text-[6pt] print:text-gray-600">VALOR TOTAL DA OS</p>
                     <p className="text-lg font-black italic print:text-[10pt]">R$ {totalOS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="space-y-6 print:space-y-3">
                  <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 print:p-3 print:rounded-lg print:border-gray-200">
                    <h5 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2 print:text-[7pt] print:mb-1">
                       <FileText className="w-3 h-3 print:w-2 print:h-2" /> DIAGNÓSTICO TÉCNICO
                    </h5>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed italic whitespace-pre-wrap print:text-[9pt]">
                      "{service.executionDescription || service.description}"
                    </p>
                  </div>

                  {service.budgetItems && service.budgetItems.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm print:rounded-lg print:border-gray-300">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 print:bg-gray-100 print:border-gray-300">
                            <th className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest print:px-3 print:py-1.5 print:text-[7pt] print:text-black">Peça / Serviço</th>
                            <th className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center print:px-2 print:py-1.5 print:text-[7pt] print:text-black">Qtd</th>
                            <th className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right print:px-3 print:py-1.5 print:text-[7pt] print:text-black">Unitário</th>
                            <th className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right print:px-3 print:py-1.5 print:text-[7pt] print:text-black">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 print:divide-gray-200">
                          {service.budgetItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-3.5 text-[11px] font-bold text-gray-800 uppercase print:px-3 print:py-1.5 print:text-[8pt] print:text-black">{item.name}</td>
                              <td className="px-5 py-3.5 text-[11px] font-bold text-gray-800 text-center print:px-2 print:py-1.5 print:text-[8pt] print:text-black">{item.qty}</td>
                              <td className="px-5 py-3.5 text-[11px] font-bold text-gray-800 text-right print:px-3 print:py-1.5 print:text-[8pt] print:text-black">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                              <td className="px-5 py-3.5 text-[11px] font-black text-gray-900 text-right italic print:px-3 print:py-1.5 print:text-[8pt] print:text-black">R$ {(item.unitPrice * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                        {service.discount && service.discount > 0 && (
                          <tfoot>
                            <tr className="bg-red-50/30 print:bg-white">
                              <td colSpan={3} className="px-5 py-2 text-[9px] font-black text-red-500 text-right uppercase tracking-widest print:px-3 print:py-1 print:text-[7pt]">DESCONTO APLICADO:</td>
                              <td className="px-5 py-2 text-[11px] font-black text-red-500 text-right italic print:px-3 print:py-1 print:text-[8pt]">- R$ {service.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredHistory.length === 0 && (
            <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 print:py-10">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 print:w-12 print:h-12 print:mb-3">
                 <Search className="w-10 h-10 text-gray-400 print:w-6 print:h-6" />
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] print:text-[8pt]">Sem registros no período selecionado</p>
            </div>
          )}
        </div>

        <footer className="pt-10 border-t-2 border-gray-100 flex flex-col items-center print:pt-4 print:mt-10 page-break-avoid">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 print:text-[7pt] print:text-gray-600 print:mb-2 text-center">Relatório Gerado pelo Sistema de Gestão {workshopInfo.name}</p>
           <div className="w-32 h-1 bg-gray-100 rounded-full print:hidden"></div>
           <p className="hidden print:block text-[6pt] text-gray-400 uppercase font-bold">Página gerada em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
        </footer>
      </div>
      <style>{`
        @media screen {
          .print-document { display: none !important; }
        }
        @media print {
          html, body { 
            background: white !important; 
            background-color: white !important;
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
            color: black !important;
          }
          .print\\:hidden { display: none !important; }
          .report-container { 
            background: white !important; 
            background-color: white !important;
          }
          
          @page { 
            margin: 10mm; 
            size: A4; 
          }
          
          .page-break-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          * { 
            color-adjust: exact;
            -webkit-print-color-adjust: exact;
            box-shadow: none !important;
          }
          
          h1, h2, h3, h4, h5, p, span, td, th {
            color: black !important;
          }

          .bg-blue-600 { background-color: #2563eb !important; color: white !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-blue-50\\/50 { background-color: #eff6ff !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportView;
