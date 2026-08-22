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
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex-col shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <span className="text-2xl font-bold tracking-wider text-indigo-400">ORENS</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          {menuItems.map((item, i) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={i} 
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <LogoutButton />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 hover:text-gray-900 p-1">
              <span className="text-2xl">☰</span>
            </button>
            <span className="text-xl font-bold text-indigo-600 tracking-wider">ORENS</span>
          </div>
          
          <div className="flex-1 hidden md:block px-4">
            <input 
              type="text" 
              placeholder="Qidirish (mahsulot, chek, mijoz)..." 
              className="w-full max-w-md bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
            />
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <BranchSelector />
            <button className="text-gray-400 hover:text-gray-600 hidden md:block">
              <span className="text-xl">🔔</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm ring-2 ring-white cursor-pointer hover:bg-indigo-200 transition-colors">
              <span className="text-xs">{(session?.user?.firstName || 'A')[0].toUpperCase()}</span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
