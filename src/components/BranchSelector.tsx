"use client";

import React from 'react';
import { useBranch } from './BranchContext';

export default function BranchSelector() {
  const { branches, activeBranchId, setActiveBranchId, loading } = useBranch();

  if (loading || branches.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mr-4">
      <span className="text-sm text-gray-500 font-medium hidden md:inline">Filial:</span>
      <select 
        value={activeBranchId || ''} 
        onChange={(e) => setActiveBranchId(e.target.value)}
        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none font-medium shadow-sm cursor-pointer"
      >
        {branches.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
    </div>
  );
}
