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
    <div className="p-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sotuvlar Tarixi</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chek Raqami</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sana</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kassir</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Summa</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">To'lov</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Holat</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Yuklanmoqda...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Hozircha sotuvlar yo'q.</td></tr>
              ) : (
                sales.map(sale => (
                  <React.Fragment key={sale.id}>
                    <tr onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{sale.receiptNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.seller ? `${sale.seller.firstName} ${sale.seller.lastName}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {sale.totalAmount.toLocaleString()} UZS
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.payments?.map((p: any) => `${p.method}: ${p.amount}`).join(' | ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sale.status === 'RETURNED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {sale.status === 'RETURNED' ? 'QAYTARILGAN' : sale.status}
                        </span>
                      </td>
                    </tr>
                    {expandedId === sale.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Xarid tafsiloti</h4>
                            <table className="min-w-full divide-y divide-gray-100">
                              <thead>
                                <tr>
                                  <th className="text-left py-2 text-xs text-gray-500">Mahsulot</th>
                                  <th className="text-left py-2 text-xs text-gray-500">Narxi</th>
                                  <th className="text-left py-2 text-xs text-gray-500">Soni</th>
                                  <th className="text-left py-2 text-xs text-gray-500">Jami</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {sale.items?.map((item: any) => (
                                  <tr key={item.id}>
                                    <td className="py-2 text-sm text-gray-900">{item.sku?.name || 'Noma\'lum'}</td>
                                    <td className="py-2 text-sm text-gray-500">{item.price.toLocaleString()}</td>
                                    <td className="py-2 text-sm text-gray-500">{item.quantity}</td>
                                    <td className="py-2 text-sm font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {sale.discount > 0 && (
                              <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                                Chegirma qilingan: <span className="font-bold text-red-500">{sale.discount.toLocaleString()} UZS</span>
                              </div>
                            )}
                            {sale.status !== 'RETURNED' && (
                              <div className="mt-4 border-t border-gray-200 pt-4 flex justify-end">
                                <button 
                                  onClick={() => handleRefund(sale.id)}
                                  className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors text-sm"
                                >
                                  Tavarni qaytarish (Vozvrat)
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
