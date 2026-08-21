import React from 'react';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Owner Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Sizning biznesingizdagi bugungi holat.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <select className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Bugun</option>
            <option>Kecha</option>
            <option>Shu hafta</option>
            <option>Shu oy</option>
          </select>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all">
            + Yangi Sotuv
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Bugungi savdo', value: '12,450,000', currency: 'UZS', change: '+14.5%', isUp: true },
          { label: 'Kechagi savdo', value: '10,920,000', currency: 'UZS', change: '-2.1%', isUp: false },
          { label: 'Cheklar soni', value: '142', currency: 'ta', change: '+5.4%', isUp: true },
          { label: 'O\'rtacha chek', value: '87,600', currency: 'UZS', change: '+8.2%', isUp: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 rounded-full bg-gray-50 group-hover:bg-indigo-50 transition-colors z-0" />
            <span className="text-gray-500 text-sm font-medium z-10">{stat.label}</span>
            <div className="flex items-end gap-2 z-10">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</span>
              <span className="text-sm font-semibold text-gray-500 mb-1.5">{stat.currency}</span>
            </div>
            <div className="z-10 flex items-center gap-1 mt-1">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {stat.isUp ? '↑' : '↓'} {stat.change}
              </span>
              <span className="text-xs text-gray-400">kechagidan</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">So'nggi harakatlar</h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Barchasi</button>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {[
              { user: 'Omina', action: 'sotuv qildi', amount: '450 000 UZS', time: '10 daqiqa oldin', icon: '🛒', color: 'bg-green-100 text-green-700' },
              { user: 'Sklad', action: 'yangi kirim qabul qildi', amount: '12 000 000 UZS', time: '1 soat oldin', icon: '📦', color: 'bg-blue-100 text-blue-700' },
              { user: 'System', action: '3 xil tovar kam qoldi', amount: 'Ogohlantirish', time: '2 soat oldin', icon: '⚠️', color: 'bg-amber-100 text-amber-700' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">{item.user} <span className="font-normal text-gray-500">{item.action}</span></p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {item.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Mahsulotlar</h2>
          <div className="flex-1 flex flex-col gap-4">
            {[
              { name: 'Chanel Bleu 50ml', sales: 24, percent: 85 },
              { name: 'Dior Sauvage 100ml', sales: 18, percent: 65 },
              { name: 'Baccarat Rouge 540', sales: 12, percent: 45 },
              { name: 'Tom Ford Oud Wood', sales: 9, percent: 30 },
            ].map((product, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">{product.name}</span>
                  <span className="text-gray-500">{product.sales} ta</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${product.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
