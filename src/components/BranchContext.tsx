"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Branch = {
  id: string;
  name: string;
};

interface BranchContextType {
  branches: Branch[];
  activeBranchId: string | null;
  setActiveBranchId: (id: string) => void;
  loading: boolean;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType>({
  branches: [],
  activeBranchId: null,
  setActiveBranchId: () => {},
  loading: true,
  refreshBranches: async () => {},
});

export const useBranch = () => useContext(BranchContext);

export const BranchProvider = ({ children }: { children: React.ReactNode }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBranches(data);
        if (data.length > 0 && !activeBranchId) {
          setActiveBranchIdState(data[0].id);
          localStorage.setItem('activeBranchId', data[0].id);
        }
      } else {
        setBranches([]);
      }
      setLoading(false);
    } catch (e) {
      setBranches([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('activeBranchId');
    if (stored) setActiveBranchIdState(stored);
    refreshBranches();
  }, []);

  const setActiveBranchId = (id: string) => {
    setActiveBranchIdState(id);
    localStorage.setItem('activeBranchId', id);
  };

  return (
    <BranchContext.Provider value={{ branches, activeBranchId, setActiveBranchId, loading, refreshBranches }}>
      {children}
    </BranchContext.Provider>
  );
};
