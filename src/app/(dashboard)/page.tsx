"use client";

import React, { useState, useEffect } from 'react';
import { useBranch } from '@/components/BranchContext';

export default function Dashboard() {
  const { activeBranchId, loading: branchLoading } = useBranch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (branchLoading) return;
    if (!activeBranchId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/dashboard?branchId=${activeBranchId}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(console.error);
  }, [activeBranchId, branchLoading]);

  if (loading || branchLoading) return <div className="p-8 text-center text-gray-500">Yuklanmoqda...</div>;
  if (!activeBranchId) return <div className="p-8 text-center text-gray-500">Filial ma'lumotlari mavjud emas.</div>;
  if (!data || data.error) return <div className="p-8 text-center text-red-500">Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.</div>;

  const avgReceipt = data.todayCount > 0 ? Math.round(data.todayTotal / data.todayCount) : 0;
  const maxSales = Math.max(...((data.topProducts || []).map((p: any) => p.sales) || [1]));

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto py-4 md:py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight drop-shadow-sm">Dashboard</h1>
          <p className="text-xs md:text-sm font-medium text-slate-500">Sizning biznesingizdagi bugungi holat.</p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Bugungi savdo', value: data.todayTotal.toLocaleString(), currency: 'UZS', change: `${data.change}%`, isUp: data.isUp, icon: '💵', color: 'from-emerald-500 to-teal-400' },
          { label: 'Kechagi savdo', value: data.yesterdayTotal.toLocaleString(), currency: 'UZS', change: '-', isUp: null, icon: '📅', color: 'from-blue-500 to-indigo-400' },
          { label: 'Cheklar soni', value: data.todayCount.toString(), currency: 'ta', change: '', isUp: null, icon: '🧾', color: 'from-purple-500 to-pink-400' },
          { label: 'O\'rtacha chek', value: avgReceipt.toLocaleString(), currency: 'UZS', change: '', isUp: null, icon: '📈', color: 'from-orange-500 to-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[24px] shadow-sm hover-lift flex flex-col gap-4 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 ease-out`}></div>
            
            <div className="flex justify-between items-center z-10">
              <span className="text-slate-500 text-sm font-semibold tracking-wide uppercase">{stat.label}</span>
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">{stat.icon}</div>
            </div>
            
            <div className="flex flex-col gap-1 z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tighter">{stat.value}</span>
                <span className="text-sm font-bold text-slate-400">{stat.currency}</span>
              </div>
              
              {stat.isUp !== null && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${stat.isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {stat.isUp ? '↑' : '↓'} {stat.change}
                  </span>
                  <span className="text-xs font-medium text-slate-400">kechagiga nisbatan</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass rounded-[24px] shadow-sm p-7 flex flex-col hover-lift">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-extrabold text-slate-800">So'nggi savdolar</h2>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors">Barchasi</button>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            {data.recentSales?.map((sale: any, i: number) => (
              <div key={i} className="flex items-center gap-5 p-4 bg-white/60 hover:bg-white rounded-2xl transition-all shadow-sm border border-white/40 group cursor-pointer active-scale">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">🛍</div>
                <div className="flex-1">
                  <p className="text-sm text-slate-800 font-bold">
                    {sale.seller ? `${sale.seller.firstName} ${sale.seller.lastName}` : 'Kassir'} 
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Chek: {sale.receiptNo}</span>
                    • {new Date(sale.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  +{sale.totalAmount.toLocaleString()} UZS
                </div>
              </div>
            ))}
            {(!data.recentSales || data.recentSales.length === 0) && (
              <div className="text-center text-slate-400 py-10 font-medium">Hozircha savdolar yo'q.</div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="glass rounded-[24px] shadow-sm p-7 flex flex-col hover-lift">
          <h2 className="text-xl font-extrabold text-slate-800 mb-8">Ommabop Mahsulotlar</h2>
          <div className="flex-1 flex flex-col gap-6">
            {data.topProducts?.map((product: any, i: number) => {
              const percent = maxSales > 0 ? (product.sales / maxSales) * 100 : 0;
              const colors = ['from-indigo-500 to-purple-500', 'from-blue-400 to-cyan-400', 'from-emerald-400 to-teal-400', 'from-orange-400 to-amber-400', 'from-pink-400 to-rose-400'];
              const color = colors[i % colors.length];
              
              return (
                <div key={i} className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-700 truncate pr-4">{product.name}</span>
                    <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">{product.sales} ta</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            {(!data.topProducts || data.topProducts.length === 0) && (
              <div className="text-center text-slate-400 py-10 font-medium">Hozircha ma'lumot yo'q.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
