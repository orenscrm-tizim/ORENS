"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBranch } from '@/components/BranchContext';

export default function FinancePage() {
  const router = useRouter();
  const { activeBranchId } = useBranch();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAccount, setNewAccount] = useState({ name: '', balance: '' });
  const [tx, setTx] = useState({ accountId: '', amount: '', type: 'INCOME', description: '' });

  useEffect(() => {
    if (!activeBranchId) return;
    fetch(`/api/finance?branchId=${activeBranchId}`).then(r => r.json()).then(data => {
      setAccounts(data);
      if (data.length > 0) setTx(prev => ({ ...prev, accountId: data[0].id }));
      setLoading(false);
    }).catch(console.error);
  }, [activeBranchId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || !activeBranchId) return;
    
    const res = await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newAccount.name, balance: parseFloat(newAccount.balance) || 0, branchId: activeBranchId })
    });
    if (res.ok) {
      const acc = await res.json();
      setAccounts([...accounts, acc]);
      setNewAccount({ name: '', balance: '' });
      if (!tx.accountId) setTx({ ...tx, accountId: acc.id });
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tx.accountId || !tx.amount) return;
    
    const res = await fetch('/api/finance/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: tx.accountId,
        amount: parseFloat(tx.amount),
        type: tx.type,
        description: tx.description
      })
    });

    if (res.ok) {
      alert("Tranzaksiya muvaffaqiyatli saqlandi!");
      const updatedAccount = await res.json();
      setAccounts(accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
      setTx({ ...tx, amount: '', description: '' });
    } else {
      alert("Xatolik yuz berdi");
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Moliya va Kassalar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-indigo-100 font-medium mb-1">Jami Mablag' (Balans)</h3>
          <p className="text-3xl font-bold">{totalBalance.toLocaleString()} UZS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Kassalar ro'yxati</h2>
          {loading ? <div>Yuklanmoqda...</div> : accounts.length === 0 ? <div>Kassalar mavjud emas</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {accounts.map(acc => (
                <div key={acc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{acc.name}</h4>
                      <p className="text-xs text-gray-500">{acc.currency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{acc.balance.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-lg font-bold text-gray-800">Tranzaksiya (Kirim/Chiqim)</h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <form onSubmit={handleTransaction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kassa</label>
                  <select value={tx.accountId} onChange={e => setTx({...tx, accountId: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900">
                    <option value="">Kassani tanlang...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.balance.toLocaleString()})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amal (Tur)</label>
                  <select value={tx.type} onChange={e => setTx({...tx, type: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900">
                    <option value="INCOME">Kirim (Daromad, Pul tushishi)</option>
                    <option value="EXPENSE">Chiqim (Xarajat, Pul chiqishi)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summa (UZS)</label>
                <input required type="number" value={tx.amount} onChange={e => setTx({...tx, amount: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
              </div>
              <button type="submit" disabled={!tx.accountId} className={`w-full py-2.5 rounded-lg font-medium transition ${tx.type === 'INCOME' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                {tx.type === 'INCOME' ? 'Pul Kirim Qilish' : 'Xarajat Qilish'}
              </button>
            </form>
          </div>
        </div>

        {/* Add Account */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Yangi Kassa qo'shish</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (Masalan: Naqd, Uzcard)</label>
              <input required type="text" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boshlang'ich qoldiq (UZS)</label>
              <input type="number" value={newAccount.balance} onChange={e => setNewAccount({...newAccount, balance: e.target.value})} className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition">Qo'shish</button>
          </form>
        </div>
      </div>
    </div>
  );
}
