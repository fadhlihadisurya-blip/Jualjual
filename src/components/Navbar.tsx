import React from 'react';
import { TabType, Material } from '../types';
import { LayoutDashboard, ShoppingCart, PackageOpen, Boxes, FileText, AlertTriangle, Sparkles, User as UserIcon, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
  materials: Material[];
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab, materials, currentUser, onOpenAuth }) => {
  const lowStockCount = materials.filter(m => m.totalStock <= m.minStock).length;

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos' as TabType, label: 'Kasir (POS)', icon: ShoppingCart },
    { id: 'products' as TabType, label: 'Produk & Resep', icon: PackageOpen },
    { id: 'materials' as TabType, label: 'Stok Bahan Baku', icon: Boxes, badge: lowStockCount },
    { id: 'reports' as TabType, label: 'Laporan Keuangan', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setTab('dashboard')}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent tracking-tight">
                JualJual
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                POS & Kalkulator HPP
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {item.label}
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats & User Profile Button */}
          <div className="flex items-center space-x-3">
            {lowStockCount > 0 && (
              <button
                onClick={() => setTab('materials')}
                className="hidden sm:flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 shadow-2xs hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-bounce" />
                <span>{lowStockCount} Menipis</span>
              </button>
            )}

            {/* Auth Button */}
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                currentUser
                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
              }`}
            >
              {currentUser ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <UserIcon className="h-4 w-4 text-indigo-600" />
                  <span className="max-w-[120px] truncate">{currentUser.email?.split('@')[0]}</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Masuk / Daftar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative flex flex-col items-center p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </header>
  );
};
