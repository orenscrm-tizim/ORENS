"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import BranchSelector from "@/components/BranchSelector";

export default function AppLayout({ children, session }: { children: React.ReactNode, session: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/', roles: ['OWNER', 'ADMIN', 'ACCOUNTANT'] },
    { name: 'Kassa (POS)', icon: '🛒', path: '/pos', roles: ['OWNER', 'ADMIN', 'CASHIER'] },
    { name: 'Sotuvlar', icon: '🧾', path: '/sales', roles: ['OWNER', 'ADMIN', 'CASHIER', 'ACCOUNTANT'] },
    { name: 'Sklad', icon: '📦', path: '/warehouse', roles: ['OWNER', 'ADMIN', 'WAREHOUSE'] },
    { name: 'Mahsulotlar', icon: '🏷', path: '/products', roles: ['OWNER', 'ADMIN', 'WAREHOUSE'] },
    { name: 'Moliya', icon: '💰', path: '/finance', roles: ['OWNER', 'ACCOUNTANT'] },
    { name: 'Xodimlar', icon: '👥', path: '/employees', roles: ['OWNER'] },
    { name: 'Hisobotlar', icon: '📈', path: '/reports', roles: ['OWNER', 'ADMIN', 'ACCOUNTANT'] },
    { name: 'Sozlamalar', icon: '⚙️', path: '/settings', roles: ['OWNER'] },
  ].filter(item => item.roles.includes(session?.user?.role || 'OWNER'));

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-dark text-white flex-col shadow-2xl transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 flex
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">O</div>
            <span className="text-xl font-bold tracking-widest text-white">ORENS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2 custom-scrollbar">
          {menuItems.map((item, i) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={i} 
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 active-scale ${isActive ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-md' : ''}`}>{item.icon}</span>
                <span className="font-medium text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative bg-[#f8fafc]">
        
        {/* Header */}
        <header className="h-16 glass border-b border-gray-200/50 flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0 sticky top-0">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 hover:text-indigo-600 p-1 transition-colors">
              <span className="text-2xl">☰</span>
            </button>
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-wider">ORENS</span>
          </div>
          
          <div className="flex-1 hidden md:block px-4">
            <div className="relative max-w-md group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
              <input 
                type="text" 
                placeholder="Qidirish (mahsulot, chek)..." 
                className="w-full bg-slate-100/50 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none text-slate-700 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5 ml-auto">
            <BranchSelector />
            <button className="text-slate-400 hover:text-indigo-600 hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-indigo-50 transition-colors relative active-scale">
              <span className="text-xl">🔔</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all">
              <span className="text-sm">{(session?.user?.firstName || 'A')[0].toUpperCase()}</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto pb-6 custom-scrollbar relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none mix-blend-multiply"></div>
          <div className="relative z-10 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
