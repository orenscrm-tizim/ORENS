"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="mt-auto mb-4 mx-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium"
    >
      <span className="text-lg">🚪</span>
      Chiqush
    </button>
  );
}
