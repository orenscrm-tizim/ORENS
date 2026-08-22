"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBranch } from '@/components/BranchContext';

export default function POSPage() {
  const router = useRouter();
  const { activeBranchId } = useBranch();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);

  const [receiptData, setReceiptData] = useState<any>(null);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const addToCart = (product: any, sku: any) => {
    const existingItem = cart.find(item => item.skuId === sku.id);
    if (existingItem) {
      setCart(cart.map(item => item.skuId === sku.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { 
        skuId: sku.id, 
        name: `${product.name} ${sku.name !== product.name ? `(${sku.name})` : ''}`, 
        price: sku.sellPrice, 
        costPrice: sku.costPrice,
        quantity: 1 
      }]);
    }
  };

  const removeFromCart = (skuId: string) => {
    setCart(cart.filter(item => item.skuId !== skuId));
  };

  const updateQuantity = (skuId: string, q: number) => {
    if (q <= 0) return removeFromCart(skuId);
    setCart(cart.map(item => item.skuId === skuId ? { ...item, quantity: q } : item));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalAmount = Math.max(0, totalAmount - discount);

  const openCheckout = () => {
    if (cart.length === 0) return;
    setDiscount(0);
    setCashAmount(totalAmount);
    setCardAmount(0);
    setIsCheckoutModalOpen(true);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const paid = cashAmount + cardAmount;
    if (paid < finalAmount) {
      alert("To'lov summasi yetarli emas!");
      return;
    }
    
    setCheckoutLoading(true);
    try {
      const payments = [];
      if (cashAmount > 0) payments.push({ method: 'CASH', amount: cashAmount });
      if (cardAmount > 0) payments.push({ method: 'CARD', amount: cardAmount });

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          totalAmount,
          discount,
          paidAmount: paid,
          payments,
          branchId: activeBranchId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setReceiptData({
          sale: data.sale,
          items: cart,
          totalAmount,
          discount,
          finalAmount,
          cashAmount,
          cardAmount
        });
        setCart([]);
        setIsCheckoutModalOpen(false);
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
      alert("Xatolik yuz berdi");
    }
    setCheckoutLoading(false);
  };

  const [barcodeInput, setBarcodeInput] = useState('');

  const handleBarcodeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      const code = barcodeInput.trim();
      const product = products.find(p => p.skus?.some((s: any) => s.barcode === code));
      if (product) {
        const sku = product.skus.find((s: any) => s.barcode === code);
        addToCart(product, sku);
      } else {
        alert("Bunday shtrix-kodli mahsulot topilmadi!");
      }
      setBarcodeInput(''); // Skanerdan keyin inputni tozalash
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category?.name || "Boshqa"))).sort();
  const filteredProducts = activeCategory 
    ? products.filter(p => (p.category?.name || "Boshqa") === activeCategory)
    : products;

  const [showCartMobile, setShowCartMobile] = useState(false);

  return (
    <div className="flex h-full bg-transparent overflow-hidden relative animate-in fade-in duration-500">
      {/* Products Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0">
        <div className="p-5 border-b border-white/20 glass shadow-sm flex flex-col gap-5 z-10 sticky top-0">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">Kassa (POS)</h1>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
              <input 
                type="text" 
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeSubmit}
                placeholder="Shtrix-kod (skaner)..." 
                className="bg-white/60 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 border border-white focus:bg-white focus:ring-4 focus:ring-indigo-500/20 outline-none w-48 md:w-72 shadow-sm transition-all placeholder:text-slate-400" 
                autoFocus
              />
            </div>
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setActiveCategory(null)}
                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all active-scale ${activeCategory === null ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-white/60 text-slate-600 hover:bg-white hover:shadow-sm border border-white/40'}`}
              >
                Barchasi
              </button>
              {categories.map((cat, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveCategory(cat as string)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all active-scale ${activeCategory === cat ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-white/60 text-slate-600 hover:bg-white hover:shadow-sm border border-white/40'}`}
                >
                  {cat as string}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 font-medium">Mahsulotlar yuklanmoqda...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <span className="text-6xl mb-4 opacity-50 text-indigo-200">📦</span>
              <p className="font-bold text-lg">Mahsulotlar yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredProducts.map(product => (
                <div key={product.id} className="glass p-4 rounded-[20px] shadow-sm border border-white/50 hover-lift cursor-pointer flex flex-col group relative overflow-hidden" onClick={() => product.skus?.[0] && addToCart(product, product.skus[0])}>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-colors"></div>
                  
                  <div className="h-28 bg-white/60 rounded-2xl mb-4 flex items-center justify-center text-4xl shadow-inner group-hover:scale-[1.03] transition-transform">
                    🛍️
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-2 group-hover:text-indigo-700 transition-colors">{product.name}</h3>
                  <p className="text-indigo-600 font-extrabold mt-auto text-base">
                    {product.skus?.[0]?.sellPrice?.toLocaleString() || 0} <span className="text-xs font-semibold text-indigo-400">UZS</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Toggle Button */}
      <div className="md:hidden fixed bottom-20 right-5 z-40">
        <button 
          onClick={() => setShowCartMobile(!showCartMobile)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl w-16 h-16 shadow-2xl flex items-center justify-center relative active-scale"
        >
          <span className="text-3xl">🛒</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Cart Section */}
      <div className={`${showCartMobile ? 'flex' : 'hidden'} md:flex fixed inset-0 top-16 md:static md:w-[400px] glass-dark md:border-l border-white/10 shadow-2xl flex-col z-50 md:z-20 animate-in slide-in-from-right md:slide-in-from-right-8 duration-500`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-white/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-indigo-500/20 rounded-xl">🛒</span>
            <h2 className="font-extrabold text-xl text-white tracking-wide">Joriy Xarid</h2>
          </div>
          <button onClick={() => setShowCartMobile(false)} className="md:hidden text-slate-400 text-2xl font-bold p-2">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm gap-2 opacity-50">
              <span className="text-4xl">🛒</span>
              <p>Savatcha bo'sh</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.skuId} className="flex flex-col bg-white/10 border border-white/10 p-4 rounded-[16px] shadow-sm hover:bg-white/20 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-white text-sm pr-4">{item.name}</span>
                  <button onClick={() => removeFromCart(item.skuId)} className="text-rose-400 hover:text-rose-300 opacity-50 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 bg-black/20 rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.skuId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg text-white font-bold hover:bg-white/20 active-scale">-</button>
                    <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.skuId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg text-white font-bold hover:bg-white/20 active-scale">+</button>
                  </div>
                  <span className="font-extrabold text-white text-sm">{(item.price * item.quantity).toLocaleString()} <span className="text-xs text-indigo-300">UZS</span></span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-black/20 pb-8 md:pb-6">
          <div className="flex justify-between mb-4 text-sm font-medium text-slate-300">
            <span>Chegirma:</span>
            <span className="text-rose-400">{discount > 0 ? '-' : ''}{discount.toLocaleString()} UZS</span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="text-xl font-extrabold text-white">Jami:</span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">{finalAmount.toLocaleString()} UZS</span>
          </div>
          <button 
            onClick={() => {
              openCheckout();
              setShowCartMobile(false);
            }}
            disabled={cart.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 active-scale text-lg tracking-wide"
          >
            To'lovni tasdiqlash 
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">To'lov</h2>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Jami Summa:</span>
                <span className="text-lg font-bold">{totalAmount.toLocaleString()} UZS</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chegirma (UZS)</label>
                <input 
                  type="number" 
                  value={discount || ''}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setDiscount(val);
                    setCashAmount(Math.max(0, totalAmount - val));
                    setCardAmount(0);
                  }}
                  className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <span className="text-indigo-900 font-bold">To'lanishi kerak:</span>
                <span className="text-xl font-bold text-indigo-700">{finalAmount.toLocaleString()} UZS</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naqd (CASH)</label>
                <input 
                  type="number" 
                  value={cashAmount || ''}
                  onChange={e => setCashAmount(Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plastik Karta (CARD)</label>
                <input 
                  type="number" 
                  value={cardAmount || ''}
                  onChange={e => setCardAmount(Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-between items-center p-2">
                <span className="text-sm font-medium text-gray-600">Qabul qilindi:</span>
                <span className={`text-sm font-bold ${(cashAmount + cardAmount) < finalAmount ? 'text-red-500' : 'text-green-600'}`}>
                  {(cashAmount + cardAmount).toLocaleString()} UZS
                </span>
              </div>
              {(cashAmount + cardAmount) > finalAmount && (
                <div className="flex justify-between items-center p-2 bg-yellow-50 text-yellow-800 rounded-lg">
                  <span className="text-sm font-medium">Qaytim:</span>
                  <span className="text-sm font-bold">{((cashAmount + cardAmount) - finalAmount).toLocaleString()} UZS</span>
                </div>
              )}
            </div>

            <button 
              onClick={handleCheckout}
              disabled={checkoutLoading || (cashAmount + cardAmount) < finalAmount}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
            >
              {checkoutLoading ? 'Jarayonda...' : 'Tasdiqlash'}
            </button>
          </div>
        </div>
      )}

      {/* Receipt Print Modal */}
      {receiptData && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col max-h-full">
            
            {/* Printable Area */}
            <div id="print-section" className="p-6 bg-white text-black overflow-y-auto print:p-0 print:w-full">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold font-mono">ORENS</h2>
                <p className="text-sm font-mono text-gray-600">Chek: {receiptData.sale.receiptNo}</p>
                <p className="text-sm font-mono text-gray-600">{new Date(receiptData.sale.createdAt).toLocaleString()}</p>
              </div>
              
              <div className="border-t border-b border-dashed border-gray-400 py-3 mb-4 space-y-2">
                {receiptData.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm font-mono">
                    <span className="flex-1 pr-2">{item.name} x{item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 font-mono text-sm">
                <div className="flex justify-between">
                  <span>Jami:</span>
                  <span>{receiptData.totalAmount.toLocaleString()}</span>
                </div>
                {receiptData.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Chegirma:</span>
                    <span>-{receiptData.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-black">
                  <span>To'lanishi:</span>
                  <span>{receiptData.finalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-2 text-gray-600">
                  <span>Naqd:</span>
                  <span>{receiptData.cashAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Plastik:</span>
                  <span>{receiptData.cardAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-center mt-6 text-sm font-mono text-gray-500">
                <p>Xaridingiz uchun rahmat!</p>
              </div>
            </div>

            {/* Actions (Not printable) */}
            <div className="p-4 bg-gray-50 border-t flex gap-3 print:hidden">
              <button 
                onClick={() => setReceiptData(null)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Yopish
              </button>
              <button 
                onClick={() => {
                  const printContents = document.getElementById('print-section')?.innerHTML;
                  const originalContents = document.body.innerHTML;
                  if(printContents) {
                    document.body.innerHTML = printContents;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload(); // Reload to restore react state cleanly after innerHTML hack
                  }
                }}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"
              >
                🖨️ Chop etish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
