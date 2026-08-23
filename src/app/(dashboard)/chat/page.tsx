"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useBranch } from '@/components/BranchContext';
import { useSession } from 'next-auth/react';

export default function ChatPage() {
  const { activeBranchId } = useBranch();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeChannel, setActiveChannel] = useState('GENERAL');
  
  const allChannels = [
    { id: 'GENERAL', name: 'Umumiy', icon: '🌐', roles: ['OWNER', 'ADMIN', 'CASHIER', 'WAREHOUSE', 'ACCOUNTANT'] },
    { id: 'CASHIER', name: 'Kassa va Sotuv', icon: '🛒', roles: ['OWNER', 'ADMIN', 'CASHIER'] },
    { id: 'WAREHOUSE', name: 'Sklad va Ombor', icon: '🏭', roles: ['OWNER', 'ADMIN', 'WAREHOUSE'] },
    { id: 'ADMIN', name: 'Rahbariyat', icon: '👔', roles: ['OWNER', 'ADMIN'] },
  ];

  const userRole = session?.user?.role || 'OWNER';
  const channels = allChannels.filter(ch => ch.roles.includes(userRole));

  const fetchMessages = async () => {
    try {
      const url = activeBranchId 
        ? `/api/chat?branchId=${activeBranchId}&channel=${activeChannel}` 
        : `/api/chat?channel=${activeChannel}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMessages();
    
    // Polling every 3 seconds for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeBranchId, activeChannel]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const deleteMessage = async (id: string) => {
    if (!confirm("Xabarni o'chirishni xohlaysizmi?")) return;
    try {
      const res = await fetch(`/api/chat/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const tempText = inputText;
    setInputText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: tempText,
          branchId: activeBranchId || undefined,
          channel: activeChannel
        })
      });
      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (e) {
      console.error("Xabar yuborishda xatolik", e);
      setInputText(tempText); // restore on error
    }
  };

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-64px)] max-w-5xl mx-auto w-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight drop-shadow-sm flex items-center gap-2">
          <span>💬</span> Jamoaviy Chat
        </h1>
        <p className="text-sm font-medium text-slate-500">Filial xodimlari o'rtasidagi ichki yozishmalar.</p>
      </div>

      {/* Channel Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-4 pb-2 custom-scrollbar">
        {channels.map(ch => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeChannel === ch.id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{ch.icon}</span> {ch.name}
          </button>
        ))}
      </div>
      
      <div className="flex-1 glass rounded-[24px] shadow-sm overflow-hidden flex flex-col bg-white/50 border border-white/50 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col gap-4 z-10">
          {loading && messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">Xabarlar yuklanmoqda...</div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <span className="text-5xl mb-3 opacity-50">💬</span>
              <p className="font-bold">Hali xabarlar yo'q. Birinchi bo'lib yozing!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === session?.user?.id;
              const canDelete = isMe || ['OWNER', 'ADMIN'].includes(session?.user?.role || '');
              
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[80%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-500">
                        {isMe ? 'Siz' : `${msg.sender?.firstName} ${msg.sender?.lastName || ''}`}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {canDelete && (
                        <button 
                          onClick={() => deleteMessage(msg.id)}
                          className="text-[10px] text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                          title="O'chirish"
                        >
                          O'chirish
                        </button>
                      )}
                    </div>
                    <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                      isMe 
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                    }`}>
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 border-t border-slate-100 z-10 backdrop-blur-md">
          <form onSubmit={sendMessage} className="flex gap-3 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Xabar yozing..."
              className="flex-1 bg-slate-100/50 border border-transparent rounded-2xl pl-5 pr-14 py-4 text-sm focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none text-slate-800 transition-all placeholder:text-slate-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 active-scale disabled:opacity-50 disabled:grayscale transition-all shadow-md shadow-indigo-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
