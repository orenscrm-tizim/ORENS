"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    brandId: '',
    skuName: '',
    barcode: '',
    sellPrice: '',
    costPrice: '',
  });

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories).catch(console.error);
    // You can add /api/brands later if needed, right now we mock or fetch if it exists.
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          categoryId: formData.categoryId || null,
          brandId: formData.brandId || null,
          skus: [{
            name: formData.skuName || formData.name,
            barcode: formData.barcode,
            sellPrice: parseFloat(formData.sellPrice) || 0,
            costPrice: parseFloat(formData.costPrice) || 0
          }]
        })
      });
      if (res.ok) {
        router.push('/products');
        router.refresh();
      } else {
        alert("Xatolik yuz berdi");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/products" className="text-gray-500 hover:text-gray-900 bg-white p-2 rounded-lg border shadow-sm">
          ← Ortga
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yangi Mahsulot</h1>
          <p className="text-sm text-gray-500">Yangi mahsulot va uning variantini qo'shish</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Asosiy ma'lumotlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mahsulot nomi *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masalan: Coca Cola 1L" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
              <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Tanlang</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Variant) nomi</label>
              <input type="text" value={formData.skuName} onChange={e => setFormData({...formData, skuName: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masalan: 1 litrli baklajka" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shtrix-kod (Barcode)</label>
              <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="1234567890123" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Narxlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelish narxi (Cost) *</label>
              <input required type="number" min="0" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sotish narxi (Sell) *</label>
              <input required type="number" min="0" value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/products" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Bekor qilish
          </Link>
          <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-70">
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}
