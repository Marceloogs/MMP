
import React, { useState, useRef } from 'react';
import { Package, Search, Plus, ChevronLeft, Trash2, Edit3, AlertTriangle, PackageCheck, Camera, Save, X, Boxes, Tag, Hash, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onSaveItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onBack: () => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory, onSaveItem, onDeleteItem, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    code: '',
    category: 'PEÇAS',
    costPrice: 0,
    salePrice: 0,
    quantity: 0,
    minQuantity: 5,
    location: '',
    imageUrl: ''
  });

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '', code: '', category: 'PEÇAS', costPrice: 0, salePrice: 0, quantity: 0, minQuantity: 5, location: '', imageUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    setItemToDeleteId(id);
  };

  const executeDelete = () => {
    if (itemToDeleteId) {
      onDeleteItem(itemToDeleteId);
      setItemToDeleteId(null);
    }
  };

  const handleSave = () => {
    if (!formData.name) return alert("O nome do item é obrigatório");
    
    const itemToSave: InventoryItem = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      code: formData.code || '',
      category: formData.category || 'PEÇAS',
      costPrice: Number(formData.costPrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      quantity: Number(formData.quantity) || 0,
      minQuantity: Number(formData.minQuantity) || 0,
      location: formData.location || '',
      imageUrl: formData.imageUrl || ''
    };

    onSaveItem(itemToSave);
    setIsModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1118] text-white animate-in fade-in duration-500 pb-32">
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800/20 sticky top-0 bg-[#0B1118]/80 backdrop-blur-md z-20">
        <button onClick={onBack} className="text-blue-500"><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="text-lg font-black italic tracking-tight uppercase">Estoque de Peças</h1>
        <button onClick={handleOpenAdd} className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-90 transition-transform">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Buscar peça ou código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredItems.length > 0 ? filteredItems.map(item => {
            const isLowStock = item.quantity <= item.minQuantity;
            return (
              <div key={item.id} className={`bg-card border rounded-[2rem] p-5 flex items-center gap-4 relative group transition-all ${isLowStock ? 'border-amber-500/30 bg-amber-500/5' : 'border-gray-800/50'}`}>
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-700">
                   {item.imageUrl ? (
                     <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                   ) : (
                     <Boxes className="w-8 h-8 text-gray-600" />
                   )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black italic uppercase text-white truncate">{item.name}</h3>
                    {isLowStock && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{item.code || 'S/ COD'}</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <p className="text-[8px] font-black text-gray-600 uppercase">Quantidade</p>
                      <p className={`text-base font-black ${isLowStock ? 'text-amber-500' : 'text-white'}`}>{item.quantity} un.</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-600 uppercase">Preço Venda</p>
                      <p className="text-base font-black text-emerald-500">R$ {item.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                   <button onClick={() => handleOpenEdit(item)} className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-blue-500 active:scale-90 transition-transform">
                      <Edit3 className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleConfirmDelete(item.id)} className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-red-500 active:scale-90 transition-transform">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-20 opacity-30">
              <Package className="w-12 h-12 mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">Estoque Vazio</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE ADIÇÃO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#0B1118] border-t border-gray-800 rounded-t-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-black italic tracking-tight uppercase text-blue-500">
                 {editingItem ? 'Editar Item' : 'Novo Item no Estoque'}
               </h2>
               <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 bg-card rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-800 overflow-hidden">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Peça" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-700" />
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <p className="text-[9px] font-black text-gray-600 mt-2 uppercase">Foto do Produto</p>
              </div>

              <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 focus-within:border-blue-500 transition-colors">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Nome do Produto</p>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-none text-white font-bold focus:outline-none" placeholder="Ex: Pastilha de Freio Diant." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 focus-within:border-blue-500 transition-colors">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Código/SKU</p>
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-transparent border-none text-white font-bold focus:outline-none" placeholder="PF-001" />
                </div>
                <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 focus-within:border-blue-500 transition-colors">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Categoria</p>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-transparent border-none text-white font-bold focus:outline-none appearance-none">
                    <option value="PEÇAS">PEÇAS</option>
                    <option value="ACESSÓRIOS">ACESSÓRIOS</option>
                    <option value="ÓLEOS/FLUIDOS">ÓLEOS/FLUIDOS</option>
                    <option value="PNEUS">PNEUS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 focus-within:border-emerald-500 transition-colors">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><ArrowDownLeft className="w-3 h-3 text-red-500"/> Custo R$</p>
                  <input type="number" value={formData.costPrice || ''} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} className="w-full bg-transparent border-none text-white font-bold focus:outline-none" placeholder="0.00" />
                </div>
                <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 focus-within:border-emerald-500 transition-colors">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3 text-emerald-500"/> Venda R$</p>
                  <input type="number" value={formData.salePrice || ''} onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})} className="w-full bg-transparent border-none text-white font-bold focus:outline-none" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 focus-within:border-blue-500 transition-colors">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Qtd Atual</p>
                  <input type="number" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full bg-transparent border-none text-white font-bold focus:outline-none" placeholder="0" />
                </div>
                <div className="bg-card border border-gray-800 rounded-2xl px-5 py-4 focus-within:border-blue-500 transition-colors">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Qtd Mínima</p>
                  <input type="number" value={formData.minQuantity || ''} onChange={e => setFormData({...formData, minQuantity: Number(e.target.value)})} className="w-full bg-transparent border-none text-white font-bold focus:outline-none" placeholder="5" />
                </div>
              </div>

              <div className="pt-4">
                <button onClick={handleSave} className="w-full bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30 active:scale-95 transition-all">
                  <Save className="w-5 h-5" />
                  SALVAR NO ESTOQUE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {itemToDeleteId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setItemToDeleteId(null)}></div>
          <div className="relative w-full max-w-xs bg-card border border-gray-800 rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Excluir Item?</h3>
            <p className="text-[10px] text-gray-500 text-center mb-8 leading-relaxed uppercase font-black tracking-widest">
              Esta ação removerá permanentemente a peça do seu controle de estoque.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDelete}
                className="w-full bg-red-500 text-white font-black py-4 rounded-xl active:scale-95 transition-transform"
              >
                SIM, EXCLUIR
              </button>
              <button 
                onClick={() => setItemToDeleteId(null)} 
                className="w-full bg-gray-800 text-gray-400 font-bold py-4 rounded-xl"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
