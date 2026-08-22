"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WarehousePage() {
  const [skus, setSkus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stocks').then(r => r.json()).then(data => {
      setSkus(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sklad va Qoldiqlar</h1>
          <p className="text-sm text-gray-500 mt-1">Barcha mahsulotlarning filiallardagi qoldig'i</p>
        </div>
        <Link href="/warehouse/receipts" className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2">
          <span>+ Tovar Qabul Qilish (Prixod)</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU Nomi</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategoriya / Brend</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shtrix-kod</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qoldiq (Sona)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Yuklanmoqda...</td></tr>
              ) : skus.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Mahsulotlar yo'q.</td></tr>
              ) : (
                skus.map(sku => {
                  const qty = sku.stocks?.reduce((sum: number, s: any) => sum + s.quantity, 0) || 0;
                  return (
                    <tr key={sku.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sku.product?.name} {sku.name !== sku.product?.name ? `(${sku.name})` : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sku.product?.category?.name || '-'} / {sku.product?.brand?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sku.barcode || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${qty <= 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {qty}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
