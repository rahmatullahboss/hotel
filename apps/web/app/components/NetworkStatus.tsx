"use client";

import { useState, useEffect } from "react";
import { HiOutlineWifi, HiOutlineSignal } from "react-icons/hi2";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Offline banner
  if (showOffline && !isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white py-2 px-4 text-center text-sm font-medium animate-in slide-in-from-top duration-300">
        <div className="flex items-center justify-center gap-2">
          <HiOutlineWifi className="w-4 h-4" />
          <span>ইন্টারনেট সংযোগ বিচ্ছিন্ন। কিছু ফিচার কাজ নাও করতে পারে।</span>
        </div>
      </div>
    );
  }

  // Reconnected toast
  if (showReconnected) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-500 text-white py-2 px-4 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-2">
          <HiOutlineSignal className="w-4 h-4" />
          <span>সংযোগ পুনরায় স্থাপিত হয়েছে!</span>
        </div>
      </div>
    );
  }

  return null;
}
