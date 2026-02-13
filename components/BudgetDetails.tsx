
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Download, Printer, Wrench, Plus, Trash2, Tag, ShieldCheck, MapPin, Phone, User, FileText, Save } from 'lucide-react';
import { BudgetItem, WorkshopInfo } from '../types';

interface BudgetDetailsProps {
  onBack: () => void;
  onApprove?: () => void;
  customerName: string;
  customerPhone?: string;
  customerDocument?: string;
  vehicleModel: string;
  plate: string;
  osId?: string;
  initialItems?: BudgetItem[];
  initialDiscount?: number;
  workshopInfo: WorkshopInfo;
  onUpdateItems?: (items: BudgetItem[], discount: number) => void;
}

const BudgetDetails: React.FC<BudgetDetailsProps> = ({ 
    onBack, 
    onApprove, 
    customerName,
    customerPhone,
    customerDocument,
    vehicleModel, 
    plate,
    osId = "01",
    initialItems = [],
    initialDiscount = 0,
    workshopInfo,
    onUpdateItems
}) => {
  const [items, setItems] = useState<BudgetItem[]>(initialItems);
  const [discount, setDiscount] = useState(initialDiscount);

  useEffect(() => {
    onUpdateItems?.(items, discount);
  }, [items, discount]);

  const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const total = subtotal - discount;

  const addItem = () => {
    const newItem: BudgetItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      unitPrice: 0,
      qty: 1
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'qty') return { ...item, [field]: parseInt(value) || 0 };
        if (field === 'unitPrice') return { ...item, [field]: parseFloat(value) || 0 };
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const logoScale = workshopInfo.logoScale || 1.0;

  return (
    <div className="min-h-screen bg-[#0B1118] print:bg-white print:min-h-0 text-white animate-in slide-in-from-right duration-300 pb-40 print:pb-0">
      <div className="print:hidden">
        <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-[#0B1118]/80 backdrop-blur-md z-20 border-b border-gray-800/20">
          <button onClick={onBack} className="flex items-center text-blue-500 font-bold gap-1 active:opacity-50">
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-sm font-bold text-gray-500 uppercase tracking-widest italic">ORÇAMENTO</h1>
          <div className="w-12"></div>
        </div>

        <div className="p-4 md:p-6">
          <div className="bg-card rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-800/50 flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#0B1118] border border-gray-800 shadow-xl overflow-hidden">
                {workshopInfo.logoUrl ? (
                  <img 
                    src={workshopInfo.logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-contain p-2 transition-transform" 
                    style={{ transform: `scale(${logoScale})` }}
                  />
                ) : (
                  <ShieldCheck className="w-8 h-8" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-black italic tracking-tight uppercase">{workshopInfo.name || "SUA OFICINA"}</h2>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest opacity-60">Sistema de Gestão Profissional</p>
              </div>
            </div>

            <div className="p-8 border-b border-gray-800/50 bg-[#0B1118]/30">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">DADOS DO CLIENTE</h3>
                  <p className="text-lg font-black italic text-white uppercase">{customerName || "NOME DO CLIENTE"}</p>
                  <div className="mt-1 space-y-0.5">
                    {customerDocument && <p className="text-[10px] text-gray-400 font-bold uppercase">Doc: {customerDocument}</p>}
                    {customerPhone && <p className="text-[10px] text-gray-400 font-bold uppercase">Tel: {customerPhone}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">VEÍCULO</h3>
                  <p className="text-lg font-black italic text-white uppercase">{vehicleModel || "MODELO"}</p>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Placa: {plate || "ABC-0000"}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">PEÇAS E SERVIÇOS</h3>
                <button onClick={addItem} className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-4 py-2.5 rounded-xl border border-blue-500/20 active:scale-95 transition-all">
                  <Plus className="w-3.5 h-3.5" />
                  ADICIONAR ITEM
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4 text-[9px] font-black text-gray-600 uppercase tracking-widest border-b border-gray-800 pb-2">
                  <div className="col-span-6">DESCRIÇÃO</div>
                  <div className="col-span-2 text-center">QTD</div>
                  <div className="col-span-3 text-right">PREÇO UN.</div>
                  <div className="col-span-1"></div>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6">
                      <input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} placeholder="Peça ou serviço..." className="w-full bg-transparent border-none text-sm font-bold text-white focus:outline-none focus:text-blue-400 transition-colors uppercase" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} className="w-full bg-gray-800/30 rounded-lg py-1.5 text-center text-sm font-bold text-white focus:outline-none border border-gray-800/50" />
                    </div>
                    <div className="col-span-3 text-right">
                      <input type="number" value={item.unitPrice || ''} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} placeholder="0.00" className="w-20 bg-transparent border-none text-right text-sm font-bold text-white focus:outline-none focus:text-blue-400" />
                    </div>
                    <div className="col-span-1 text-right">
                      <button onClick={() => removeItem(item.id)} className="text-red-500/50 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-gray-800 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">SUBTOTAL</span>
                  <span className="text-white font-bold">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                     <Tag className="w-3 h-3 text-blue-500" />
                     <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">DESCONTO</span>
                  </div>
                  <input type="number" value={discount || ''} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} placeholder="0" className="w-20 bg-gray-800/30 border border-gray-800/50 px-2 py-1 rounded text-right font-bold text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-blue-500/20">
                  <span className="text-lg font-black italic text-white uppercase tracking-tighter">TOTAL GERAL</span>
                  <span className="text-4xl font-black text-blue-500 italic">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-4 bg-gray-800/20">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handlePrint} className="flex items-center justify-center gap-2 bg-gray-800/50 border border-gray-800 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 active:scale-95">
                  <Printer className="w-4 h-4" /> IMPRIMIR
                </button>
                <button onClick={handlePrint} className="flex items-center justify-center gap-2 bg-gray-800/50 border border-gray-800 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 active:scale-95">
                  <Share2 className="w-4 h-4" /> ENVIAR ZAP
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B1118] via-[#0B1118] to-transparent z-10 flex flex-col gap-3">
            <button 
                onClick={onBack}
                className="w-full bg-gray-800 text-gray-400 font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
            >
                <Save className="w-5 h-5" />
                SALVAR E AGUARDAR CLIENTE
            </button>
            <button 
                onClick={onApprove} 
                disabled={items.length === 0}
                className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
                <Wrench className="w-6 h-6" />
                APROVAR E INICIAR SERVIÇO
            </button>
        </div>
      </div>

      {/* TEMPLATE DE IMPRESSÃO - RESPEITANDO O ZOOM DO LOGO */}
      <div className="hidden print:block !bg-white !text-black p-0 m-0 font-sans print-document overflow-visible">
        <div className="w-full bg-white text-black p-0 pt-[5mm] pb-[10mm]">
          
          <header className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border border-black/10">
                {workshopInfo.logoUrl ? (
                  <img 
                    src={workshopInfo.logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-contain p-1 transition-transform" 
                    style={{ transform: `scale(${logoScale})` }}
                  />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-black" />
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-[14pt] font-black uppercase italic tracking-tight !text-black leading-none mb-1">
                  {workshopInfo.name?.toUpperCase() || "OFICINA MECÂNICA"}
                </h1>
                <div className="text-[8pt] font-bold !text-black uppercase tracking-tight leading-tight">
                  <p>📞 {workshopInfo.phone || "(00) 00000-0000"}</p>
                  <p>📍 {workshopInfo.address || "Endereço não informado"}</p>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <h2 className="text-[11pt] font-black !text-black uppercase italic mb-0.5 tracking-tight">ORÇAMENTO #{osId}</h2>
              <p className="text-[7.5pt] font-black !text-gray-500 uppercase">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-4 mb-6 border border-black rounded-lg overflow-hidden">
            <div className="border-r border-black p-3 bg-gray-50/50">
              <span className="text-[7pt] font-black !text-black uppercase block mb-1">DADOS DO CLIENTE</span>
              <p className="text-[10pt] font-black uppercase italic !text-black">{customerName?.toUpperCase()}</p>
              <div className="text-[8pt] font-bold !text-gray-800 mt-1 uppercase leading-none">
                {customerDocument && <span className="block mb-0.5 text-[7.5pt]">CPF: {customerDocument}</span>}
                {customerPhone && <span className="block text-[7.5pt]">TEL: {customerPhone}</span>}
              </div>
            </div>
            <div className="p-3 bg-gray-50/50">
              <span className="text-[7pt] font-black !text-black uppercase block mb-1">DADOS DO VEÍCULO</span>
              <p className="text-[10pt] font-black uppercase italic !text-black">{vehicleModel?.toUpperCase()}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="border border-black !text-black text-[8pt] font-black px-2 py-0.5 rounded tracking-widest uppercase">PLACA: {plate || "---"}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="border-b-2 border-black pb-1 mb-2">
              <h3 className="text-[9pt] font-black !text-black uppercase tracking-widest">DETALHAMENTO DE PEÇAS E SERVIÇOS</h3>
            </div>
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="py-2 text-[7.5pt] font-black uppercase !text-black px-2">DESCRIÇÃO</th>
                  <th className="py-2 text-[7.5pt] font-black uppercase !text-black text-center w-14">QTD</th>
                  <th className="py-2 text-[7.5pt] font-black uppercase !text-black text-right w-24">UNITÁRIO</th>
                  <th className="py-2 text-[7.5pt] font-black uppercase !text-black text-right w-24">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {items.map((item) => (
                  <tr key={item.id} className="page-break-inside-avoid border-b border-gray-100">
                    <td className="py-2 text-[8.5pt] font-bold uppercase px-2 !text-black break-words leading-tight">{item.name || "ITEM NÃO ESPECIFICADO"}</td>
                    <td className="py-2 text-[8.5pt] font-bold text-center !text-black">{item.qty}</td>
                    <td className="py-2 text-[8.5pt] font-bold text-right !text-black">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 text-[8.5pt] font-black text-right italic !text-black">R$ {(item.unitPrice * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-10 page-break-inside-avoid">
            <div className="w-60 border-t-2 border-black pt-3 space-y-1.5">
              <div className="flex justify-between items-center text-[8pt] font-bold !text-gray-600 uppercase">
                <span>SUBTOTAL:</span>
                <span className="!text-black font-black">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-[8pt] font-black !text-black uppercase">
                  <span>DESCONTO:</span>
                  <span>- R$ {discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-300">
                <span className="text-[10pt] font-black italic !text-black uppercase tracking-tight">TOTAL:</span>
                <span className="text-[16pt] font-black italic tracking-tighter !text-black leading-none">
                  R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <footer className="mt-8 page-break-inside-avoid">
            <p className="text-center text-[7pt] font-black text-gray-400 uppercase tracking-[0.2em] mb-12">ESTE ORÇAMENTO É VÁLIDO POR 10 DIAS. AGRADECEMOS A CONFIANÇA!</p>
            <div className="grid grid-cols-2 gap-16 px-4">
              <div className="text-center">
                <div className="w-full h-[1px] bg-black mb-1.5"></div>
                <p className="text-[7.5pt] font-black !text-black uppercase italic">ASSINATURA DO CLIENTE</p>
              </div>
              <div className="text-center">
                <div className="w-full h-[1px] bg-black mb-1.5"></div>
                <p className="text-[7.5pt] font-black !text-black uppercase italic">
                  {(workshopInfo.name || "RESPONSÁVEL").toUpperCase()}
                </p>
              </div>
            </div>
          </footer>

        </div>

        <style>{`
          @media screen {
            .print-document { display: none !important; }
          }
          @media print {
            @page { 
              size: A4; 
              margin: 10mm 15mm 15mm 15mm; 
            }
            html, body { 
              background: white !important; 
              background-color: white !important;
              margin: 0 !important; 
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            .print\\:hidden { display: none !important; }
            .print-document { 
              display: block !important; 
              width: 100% !important;
              background-color: white !important;
              position: relative !important;
              z-index: 1000 !important;
            }
            * { 
              background-color: transparent !important;
              color: black !important; 
              border-color: black !important; 
              box-shadow: none !important;
              text-shadow: none !important;
            }
            .bg-white, .!bg-white { background-color: white !important; }
            .bg-gray-50\\/50 { background-color: #f9fafb !important; }
            .bg-gray-100 { background-color: #f3f4f6 !important; }
            .page-break-inside-avoid {
              page-break-inside: avoid;
            }
            /* Esconde o fundo escuro do App.tsx que pode vazar */
            #root > div { background-color: white !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BudgetDetails;
