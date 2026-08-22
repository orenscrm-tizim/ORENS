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
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Owner Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Sizning biznesingizdagi bugungi holat.</p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Bugungi savdo', value: data.todayTotal.toLocaleString(), currency: 'UZS', change: `${data.change}%`, isUp: data.isUp },
          { label: 'Kechagi savdo', value: data.yesterdayTotal.toLocaleString(), currency: 'UZS', change: '-', isUp: null },
          { label: 'Cheklar soni', value: data.todayCount.toString(), currency: 'ta', change: '', isUp: null },
          { label: 'O\'rtacha chek', value: avgReceipt.toLocaleString(), currency: 'UZS', change: '', isUp: null },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden group">
            <span className="text-gray-500 text-sm font-medium z-10">{stat.label}</span>
            <div className="flex items-end gap-2 z-10">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</span>
              <span className="text-sm font-semibold text-gray-500 mb-1.5">{stat.currency}</span>
            </div>
            {stat.isUp !== null && (
              <div className="z-10 flex items-center gap-1 mt-1">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {stat.isUp ? '↑' : '↓'} {stat.change}
                </span>
                <span className="text-xs text-gray-400">kechagidan</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">So'nggi savdolar</h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {data.recentSales?.map((sale: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-green-100 text-green-700">🛒</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">
                    {sale.seller ? `${sale.seller.firstName} ${sale.seller.lastName}` : 'Kassir'} 
                    <span className="font-normal text-gray-500"> savdo qildi ({sale.receiptNo})</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(sale.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {sale.totalAmount.toLocaleString()} UZS
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Mahsulotlar (Soni)</h2>
          <div className="flex-1 flex flex-col gap-4">
            {data.topProducts?.map((product: any, i: number) => {
              const percent = maxSales > 0 ? (product.sales / maxSales) * 100 : 0;
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-900">{product.name}</span>
                    <span className="text-gray-500">{product.sales} ta</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
