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
    <div className="flex h-full bg-gray-50 overflow-hidden relative">
      {/* Products Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0">
        <div className="p-4 border-b bg-white shadow-sm flex flex-col gap-4 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Kassa (POS)</h1>
            <input 
              type="text" 
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeSubmit}
              placeholder="Shtrix-kod (skaner)..." 
              className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 border-none focus:ring-2 focus:ring-indigo-500 outline-none w-40 md:w-64" 
              autoFocus
            />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Barchasi
              </button>
              {categories.map((cat, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveCategory(cat as string)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {cat as string}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">Mahsulotlar yuklanmoqda...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-4xl mb-2">📦</span>
              <p>Mahsulotlar yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col" onClick={() => product.skus?.[0] && addToCart(product, product.skus[0])}>
                  <div className="h-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl mb-3 flex items-center justify-center text-3xl shadow-inner">
                    🛍️
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{product.name}</h3>
                  <p className="text-indigo-600 font-bold mt-auto text-sm">{product.skus?.[0]?.sellPrice?.toLocaleString() || 0} UZS</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Toggle Button */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button 
          onClick={() => setShowCartMobile(!showCartMobile)}
          className="bg-indigo-600 text-white rounded-full w-14 h-14 shadow-xl flex items-center justify-center relative"
        >
          <span className="text-2xl">🛒</span>
          {cart.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Cart Section */}
      <div className={`${showCartMobile ? 'flex' : 'hidden'} md:flex fixed inset-0 top-16 md:static md:w-96 bg-white md:border-l shadow-2xl flex-col z-50 md:z-20 animate-in slide-in-from-right md:slide-in-from-bottom-0 duration-300`}>
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛒</span>
            <h2 className="font-bold text-lg text-gray-800">Xarid savatchasi</h2>
          </div>
          <button onClick={() => setShowCartMobile(false)} className="md:hidden text-gray-500 text-2xl font-bold">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Savatcha bo'sh</div>
          ) : (
            cart.map(item => (
              <div key={item.skuId} className="flex flex-col bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                  <button onClick={() => removeFromCart(item.skuId)} className="text-red-400 hover:text-red-600">✕</button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.skuId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-800 font-bold hover:bg-gray-50">-</button>
                    <span className="w-6 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.skuId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-800 font-bold hover:bg-gray-50">+</button>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 pb-8 md:pb-4">
          <div className="flex justify-between mb-4 text-sm text-gray-600">
            <span>Chegirma:</span>
            <span>{discount.toLocaleString()} UZS</span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="text-xl font-bold text-gray-900">Jami:</span>
            <span className="text-xl font-bold text-indigo-600">{finalAmount.toLocaleString()} UZS</span>
          </div>
          <button 
            onClick={() => {
              openCheckout();
              setShowCartMobile(false);
            }}
            disabled={cart.length === 0}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            To'lovni amalga oshirish 
            <span>→</span>
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
