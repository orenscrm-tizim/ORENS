"use client";

import React, { useState, useEffect } from 'react';
import { useBranch } from '@/components/BranchContext';

export default function SalesPage() {
  const { activeBranchId } = useBranch();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchSales = () => {
    if (!activeBranchId) return;
    setLoading(true);
    fetch(`/api/sales?branchId=${activeBranchId}`)
      .then(r => r.json())
      .then(data => {
        setSales(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchSales();
  }, [activeBranchId]);

  const handleRefund = async (saleId: string) => {
    if (!confirm("Sotuvni qaytarishni tasdiqlaysizmi? (Tovarlar qoldiqqa qo'shiladi)")) return;
    try {
      const res = await fetch(`/api/sales/${saleId}/return`, { method: 'POST' });
      if (res.ok) {
        alert("Sotuv muvaffaqiyatli qaytarildi");
        fetchSales();
      } else {
        const d = await res.json();
        alert(d.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      alert("Xatolik");
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">Sotuvlar tarixi</h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">Barcha filiallar bo'yicha kassa va sotuv operatsiyalari</p>
        </div>
      </div>
      
      <div className="glass rounded-[24px] shadow-sm overflow-hidden p-2">
        <div className="overflow-x-auto rounded-[20px] bg-white/50">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Chek Raqami</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Sana</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Kassir</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Summa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">To'lov</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Yuklanmoqda...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Hozircha sotuvlar yo'q.</td></tr>
              ) : (
                sales.map(sale => (
                  <React.Fragment key={sale.id}>
                    <tr onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)} className="hover:bg-white transition-all cursor-pointer group active-scale">
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-extrabold text-indigo-600 flex items-center gap-2">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 text-indigo-400">►</span>
                        {sale.receiptNo}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-500">
                        {new Date(sale.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-700">
                        {sale.seller ? `${sale.seller.firstName} ${sale.seller.lastName}` : '-'}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-base font-black text-slate-800 tracking-tight">
                        {sale.totalAmount.toLocaleString()} <span className="text-xs font-semibold text-slate-400">UZS</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-500">
                        {sale.payments?.map((p: any) => (
                          <span key={p.method} className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded mr-1 text-xs">
                            {p.method}: {p.amount.toLocaleString()}
                          </span>
                        ))}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide uppercase ${sale.status === 'RETURNED' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {sale.status === 'RETURNED' ? 'QAYTARILGAN' : sale.status}
                        </span>
                      </td>
                    </tr>
                    {expandedId === sale.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="px-6 py-6 animate-in slide-in-from-top-2 duration-300">
                          <div className="border border-indigo-100 rounded-2xl p-6 bg-white shadow-xl shadow-indigo-100/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <h4 className="font-extrabold text-slate-800 mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                              <span>🛒</span> Xarid tafsiloti
                            </h4>
                            <div className="bg-slate-50 rounded-xl overflow-x-auto border border-slate-100">
                              <table className="min-w-full divide-y divide-slate-200 whitespace-nowrap">
                                <thead className="bg-slate-100">
                                  <tr>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">Mahsulot</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">Narxi</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">Soni</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">Jami</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {sale.items?.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-white transition-colors">
                                      <td className="px-4 py-3 text-sm font-bold text-slate-700">{item.sku?.name || 'Noma\'lum'}</td>
                                      <td className="px-4 py-3 text-sm font-medium text-slate-500">{item.price.toLocaleString()}</td>
                                      <td className="px-4 py-3 text-sm font-black text-slate-700">{item.quantity}</td>
                                      <td className="px-4 py-3 text-sm font-black text-indigo-600">{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            
                            {sale.discount > 0 && (
                              <div className="mt-4 text-sm font-medium text-slate-600 flex justify-end items-center gap-2">
                                Chegirma qilingan: <span className="font-black text-rose-500 text-base">-{sale.discount.toLocaleString()} UZS</span>
                              </div>
                            )}
                            
                            {sale.status !== 'RETURNED' && (
                              <div className="mt-6 pt-4 flex justify-end">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleRefund(sale.id); }}
                                  className="px-6 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all text-sm flex items-center gap-2 active-scale"
                                >
                                  <span>↺</span> Tovarni qaytarish (Vozvrat)
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
