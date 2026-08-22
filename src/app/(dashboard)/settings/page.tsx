"use client";

import React, { useState, useEffect } from 'react';
import { useBranch } from '@/components/BranchContext';

export default function SettingsPage() {
  const { refreshBranches } = useBranch();
  
  const [orgs, setOrgs] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [newCat, setNewCat] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/organizations').then(r => r.json()),
      fetch('/api/branches').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/brands').then(r => r.json()),
    ]).then(([o, br, c, b]) => {
      setOrgs(o);
      setBranches(br);
      setCategories(c);
      setBrands(b);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleAddCategory = async () => {
    if (!newCat) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat })
    });
    if (res.ok) {
      const data = await res.json();
      setCategories([...categories, data]);
      setNewCat('');
    }
  };

  const handleAddBrand = async () => {
    if (!newBrand) return;
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBrand })
    });
    if (res.ok) {
      const data = await res.json();
      setBrands([...brands, data]);
      setNewBrand('');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories(categories.filter(c => c.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Xatolik");
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setBrands(brands.filter(b => b.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Xatolik");
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/organizations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setOrgs(orgs.filter(o => o.id !== id));
      if (selectedOrgId === id) setSelectedOrgId('');
    } else {
      const data = await res.json();
      alert(data.error || "Xatolik");
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setBranches(branches.filter(b => b.id !== id));
      refreshBranches();
    } else {
      const data = await res.json();
      alert(data.error || "Xatolik");
    }
  };

  const [newOrg, setNewOrg] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');

  const handleAddOrg = async () => {
    if (!newOrg) return;
    const res = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newOrg })
    });
    if (res.ok) {
      const data = await res.json();
      setOrgs([...orgs, data]);
      setNewOrg('');
      if (!selectedOrgId) setSelectedOrgId(data.id);
    }
  };

  const handleAddBranch = async () => {
    if (!newBranch || (!selectedOrgId && orgs.length === 0)) return;
    const orgId = selectedOrgId || orgs[0]?.id;
    const res = await fetch('/api/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBranch, organizationId: orgId })
    });
    if (res.ok) {
      const data = await res.json();
      setBranches([...branches, data]);
      setNewBranch('');
      refreshBranches();
    }
  };

  if (loading) return <div className="p-6">Yuklanmoqda...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sozlamalar va Ma'lumotnomalar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Organizations */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tashkilotlar</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" value={newOrg} onChange={e => setNewOrg(e.target.value)} placeholder="Yangi tashkilot nomi" className="flex-1 rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            <button onClick={handleAddOrg} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Qo'shish</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {orgs.map(o => (
              <div key={o.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition group">
                <span>{o.name}</span>
                <button onClick={() => handleDeleteOrg(o.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition px-2">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Branches */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Filiallar</h2>
          <div className="flex flex-col gap-2 mb-4">
            {orgs.length > 0 && (
              <select value={selectedOrgId} onChange={e => setSelectedOrgId(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Tashkilotni tanlang</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            )}
            <div className="flex gap-2">
              <input type="text" value={newBranch} onChange={e => setNewBranch(e.target.value)} placeholder="Yangi filial nomi" className="flex-1 rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button onClick={handleAddBranch} disabled={orgs.length === 0} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50">Qo'shish</button>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {branches.map(b => (
              <div key={b.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition group">
                <div className="flex items-center gap-2">
                  <span>{b.name}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{b.organization?.name || 'Filial'}</span>
                </div>
                <button onClick={() => handleDeleteBranch(b.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition px-2">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Kategoriyalar</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Yangi kategoriya nomi" className="flex-1 rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            <button onClick={handleAddCategory} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Qo'shish</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {categories.map(c => (
              <div key={c.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition group">
                <span>{c.name}</span>
                <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition px-2">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Brendlar</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="Yangi brend nomi" className="flex-1 rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            <button onClick={handleAddBrand} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Qo'shish</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {brands.map(b => (
              <div key={b.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition group">
                <span>{b.name}</span>
                <button onClick={() => handleDeleteBrand(b.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition px-2">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
