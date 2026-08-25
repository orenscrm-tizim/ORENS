"use client";

import React, { useState, useEffect } from 'react';
import { useBranch } from '@/components/BranchContext';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeBranchId } = useBranch();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    role: 'CASHIER',
    branchId: ''
  });

  useEffect(() => {
    fetch('/api/branches').then(r => r.json()).then(setBranches).catch(console.error);
  }, []);

  useEffect(() => {
    if (!activeBranchId) return;
    setLoading(true);
    fetch(`/api/employees?branchId=${activeBranchId}`).then(r => r.json()).then(data => {
      setEmployees(data);
      setLoading(false);
    }).catch(console.error);
  }, [activeBranchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert("Xodim qo'shildi!");
      window.location.reload();
    } else {
      const { error } = await res.json();
      alert(error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ushbu xodimni o'chirishni xohlaysizmi?")) return;
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setEmployees(employees.filter(e => e.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Xodimlar va Rollar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Yangi Xodim</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
              <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Familiya</label>
              <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+998901234567" className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
              <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="CASHIER">Kassir (Sotuvchi)</option>
                <option value="WAREHOUSE">Sklad xodimi</option>
                <option value="ACCOUNTANT">Hisobchi (Buxgalter)</option>
                <option value="ADMIN">Administrator</option>
                <option value="OWNER">Egas (Owner)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filial</label>
              <select value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Filialni tanlang</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition">Qo'shish</button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Joriy Xodimlar</h2>
          {loading ? (
            <div>Yuklanmoqda...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 whitespace-nowrap">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">F.I.O</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Telefon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Roli</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Filial</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{emp.phone}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{emp.branch?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition font-medium">O'chirish</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
