"use client";

import React, { useState, useEffect, useRef } from "react";

export type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sound.m4r");

    // Mock incoming notifications for demonstration
    // To connect to a real backend, you can replace this with a WebSocket or polling mechanism
    const handleMockNotification = (e: any) => {
      const newNotification: Notification = e.detail;
      setNotifications((prev) => [newNotification, ...prev]);
      setHasUnread(true);
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    };

    window.addEventListener("app-notification", handleMockNotification);

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("app-notification", handleMockNotification);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="text-gray-400 hover:text-indigo-600 hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-indigo-50 transition-colors relative active-scale"
      >
        <span className="text-xl">🔔</span>
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Bildirishnomalar</h3>
            <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-full">
              {notifications.length} ta
            </span>
          </div>
          
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Yangi bildirishnomalar yo'q
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-indigo-50/30' : ''}`}>
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        notif.type === 'success' ? 'bg-emerald-500' :
                        notif.type === 'warning' ? 'bg-amber-500' :
                        'bg-indigo-500'
                      }`} />
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-0.5">{notif.title}</h4>
                        <p className="text-xs text-gray-500 mb-1 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
