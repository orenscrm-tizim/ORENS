"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReceiptPage() {
  const router = useRouter();
  const [skus, setSkus] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/stocks').then(r => r.json()).then(setSkus).catch(console.error);
  }, []);

  const addItem = (skuId: string) => {
    const sku = skus.find(s => s.id === skuId);
    if (!sku) return;
    if (items.find(i => i.skuId === skuId)) return;
    
    setItems([...items, {
      skuId: sku.id,
      name: `${sku.product?.name} ${sku.name !== sku.product?.name ? `(${sku.name})` : ''}`,
      quantity: 1,
      costPrice: sku.costPrice || 0
    }]);
  };

  const updateItem = (skuId: string, field: string, value: number) => {
    setItems(items.map(i => i.skuId === skuId ? { ...i, [field]: value } : i));
  };

  const removeItem = (skuId: string) => {
    setItems(items.filter(i => i.skuId !== skuId));
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setLoading(true);
    const res = await fetch('/api/warehouse/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (res.ok) {
      alert("Tovar muvaffaqiyatli qabul qilindi!");
      router.push('/warehouse');
      router.refresh();
    } else {
      alert("Xatolik yuz berdi");
      setLoading(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tovar Qabul Qilish (Prixod)</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Mahsulot qidirish</h2>
        <select onChange={e => addItem(e.target.value)} className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-indigo-500 outline-none mb-4">
          <option value="">Ro'yxatdan tanlang yoki shtrix-kod kiriting...</option>
          {skus.map(s => (
            <option key={s.id} value={s.id}>{s.product?.name} {s.name !== s.product?.name ? `(${s.name})` : ''}</option>
          ))}
        </select>
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mahsulot</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-32">Soni</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-48">Kelish Narxi</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-48">Jami</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.skuId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.skuId, 'quantity', parseFloat(e.target.value) || 0)} className="w-20 rounded border-gray-300 border p-1 outline-none text-gray-900" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="number" min="0" value={item.costPrice} onChange={e => updateItem(item.skuId, 'costPrice', parseFloat(e.target.value) || 0)} className="w-full rounded border-gray-300 border p-1 outline-none text-gray-900" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {(item.quantity * item.costPrice).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => removeItem(item.skuId)} className="text-red-500 hover:text-red-700">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-700">Umumiy Summa:</td>
                <td className="px-6 py-4 font-bold text-indigo-600 text-lg">{total.toLocaleString()} UZS</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button onClick={() => router.push('/warehouse')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Bekor qilish</button>
        <button onClick={handleSubmit} disabled={items.length === 0 || loading} className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Saqlanmoqda...' : 'Hujjatni Saqlash'}
        </button>
      </div>
    </div>
  );
}
