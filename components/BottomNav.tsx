
import React from 'react';
import { LayoutGrid, Package, Settings, Plus, Wallet } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  activeTab: View;
  onTabChange: (tab: View) => void;
  onPlusClick?: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-blue-500 scale-110' : 'text-gray-500'}`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-[0.1em]">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onPlusClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0B1118]/80 backdrop-blur-2xl border-t border-gray-800/30 px-6 py-5 flex items-center justify-between z-50 rounded-t-[2.5rem] max-w-md mx-auto">
      <NavItem 
        icon={<LayoutGrid className="w-6 h-6" />} 
        label="Início" 
        active={activeTab === 'dashboard'} 
        onClick={() => onTabChange('dashboard')}
      />
      
      <NavItem 
        icon={<Wallet className="w-6 h-6" />} 
        label="Finanças" 
        active={activeTab === 'finances'} 
        onClick={() => onTabChange('finances')}
      />

      <div className="relative -top-12">
        <button 
          onClick={onPlusClick}
          className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 border-4 border-[#0B1118] active:scale-90 transition-transform"
        >
          <Plus className="w-8 h-8 text-white" strokeWidth={3} />
        </button>
      </div>

      <NavItem 
        icon={<Package className="w-6 h-6" />} 
        label="Estoque" 
        active={activeTab === 'inventory'} 
        onClick={() => onTabChange('inventory')}
      />
      <NavItem 
        icon={<Settings className="w-6 h-6" />} 
        label="Ajustes" 
        active={activeTab === 'settings'} 
        onClick={() => onTabChange('settings')}
      />
    </div>
  );
};

export default BottomNav;
