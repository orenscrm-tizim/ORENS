import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORENS - Do'kon boshqaruvi",
  description: "Retail biznesini boshqarish platformasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-gray-50`}>
      <body className="flex h-full min-h-full overflow-hidden text-gray-900 font-sans">
        
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col shadow-xl">
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <span className="text-2xl font-bold tracking-wider text-indigo-400">ORENS</span>
          </div>
          <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
            {[
              { name: 'Dashboard', icon: '📊', active: true },
              { name: 'Kassa (POS)', icon: '🛒' },
              { name: 'Sotuvlar', icon: '🧾' },
              { name: 'Sklad', icon: '📦' },
              { name: 'Mahsulotlar', icon: '🏷' },
              { name: 'Moliya', icon: '💰' },
              { name: 'Xodimlar', icon: '👥' },
              { name: 'Hisobotlar', icon: '📈' },
              { name: 'Sozlamalar', icon: '⚙️' },
            ].map((item, i) => (
              <a key={i} href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${item.active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10 flex-shrink-0">
            <div className="md:hidden text-xl font-bold text-indigo-600 tracking-wider">ORENS</div>
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Qidirish (mahsulot, chek, mijoz)..." 
                className="w-full max-w-md bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 hidden md:block outline-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-gray-600">
                <span className="text-xl">🔔</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm ring-2 ring-white cursor-pointer hover:bg-indigo-200 transition-colors">
                AD
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
