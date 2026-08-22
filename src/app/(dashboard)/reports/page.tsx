"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { useBranch } from '@/components/BranchContext';

export default function ReportsPage() {
  const { activeBranchId } = useBranch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeBranchId) return;
    setLoading(true);
    fetch(`/api/reports?branchId=${activeBranchId}`)
      .then(r => r.json())
      .then(res => {
        setData(res);
        setLoading(false);
      }).catch(console.error);
  }, [activeBranchId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Yuklanmoqda...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Xatolik yuz berdi</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analitika va Hisobotlar</h1>
        <p className="text-sm text-gray-500 mt-1">So'nggi 30 kunlik ko'rsatkichlar tahlili</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Savdolar dinamikasi (30 kun)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend} margin={{ top: 5, right: 20, bottom: 25, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString()} UZS`, 'Summa']} labelFormatter={(label) => `Sana: ${label}`} />
              <Line type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-6">
          {/* Total Box */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center">
            <p className="text-indigo-100 font-medium mb-2">30 kunlik umumiy savdo</p>
            <h3 className="text-3xl font-bold">{data.totalSales30d.toLocaleString()} <span className="text-xl font-medium">UZS</span></h3>
          </div>

          {/* Top Cashiers */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Eng faol kassirlar</h2>
            <div className="space-y-4">
              {data.cashiers.map((c: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">{c.name.charAt(0)}</div>
                    <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{c.total.toLocaleString()}</span>
                </div>
              ))}
              {data.cashiers.length === 0 && <p className="text-sm text-gray-500">Ma'lumot yo'q</p>}
            </div>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Eng xaridorgir kategoriyalar (Tushum bo'yicha)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.categories} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
              <XAxis type="number" tickFormatter={(val) => `${val / 1000}k`} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#4B5563', fontWeight: 500 }} width={120} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString()} UZS`, 'Tushum']} />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
