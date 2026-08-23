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
    { name: 'Jamoaviy Chat', icon: '💬', path: '/chat', roles: ['OWNER', 'ADMIN', 'CASHIER', 'ACCOUNTANT', 'WAREHOUSE'] },
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
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex-col shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg">O</div>
            <span className="text-xl font-bold tracking-widest text-white">ORENS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1 custom-scrollbar">
          {menuItems.map((item, i) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={i} 
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors active-scale ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                <span className="font-medium text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 flex-shrink-0 sticky top-0">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 hover:text-indigo-600 p-1 transition-colors">
              <span className="text-2xl">☰</span>
            </button>
            <span className="text-xl font-extrabold text-indigo-600 tracking-wider">ORENS</span>
          </div>
          
          <div className="flex-1 hidden md:block px-4">
            <div className="relative max-w-md group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
              <input 
                type="text" 
                placeholder="Qidirish (mahsulot, chek)..." 
                className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5 ml-auto">
            <BranchSelector />
            <button className="text-gray-400 hover:text-indigo-600 hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-indigo-50 transition-colors relative active-scale">
              <span className="text-xl">🔔</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm ring-2 ring-white cursor-pointer hover:bg-indigo-200 transition-colors">
              <span className="text-sm">{(session?.user?.firstName || 'A')[0].toUpperCase()}</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
