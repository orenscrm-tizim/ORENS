"use client";

import { signOut } from "next-auth/react";

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out text-slate-400 hover:bg-slate-800 hover:text-white font-medium text-[14px]"
    >
      <LogOutIcon />
      Chiqish
    </button>
  );
}
