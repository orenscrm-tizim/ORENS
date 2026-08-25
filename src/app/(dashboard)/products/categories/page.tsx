"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      });
      if (res.ok) {
        setNewCategoryName('');
        fetchCategories();
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/products" className="text-sm text-indigo-600 hover:underline">Mahsulotlar</Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-600">Kategoriyalar</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Kategoriyalar</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Barcha mahsulot kategoriyalarini boshqarish</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Category Form */}
        <div className="md:col-span-1">
          <form onSubmit={handleAddCategory} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Yangi kategoriya</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi *</label>
              <input 
                required 
                type="text" 
                value={newCategoryName} 
                onChange={e => setNewCategoryName(e.target.value)} 
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Masalan: Ichimliklar" 
              />
            </div>
            <button 
              type="submit" 
              disabled={saving || !newCategoryName.trim()} 
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-70 transition-colors"
            >
              {saving ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategoriya nomi</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ost-kategoriyalar</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={2} className="px-6 py-12 text-center text-gray-500">Yuklanmoqda...</td></tr>
                  ) : categories.length === 0 ? (
                    <tr><td colSpan={2} className="px-6 py-12 text-center text-gray-500">Kategoriyalar mavjud emas.</td></tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-sm">
                              {category.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.children && category.children.length > 0 
                            ? category.children.map((c: any) => c.name).join(', ') 
                            : 'Yo\'q'
                          }
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
