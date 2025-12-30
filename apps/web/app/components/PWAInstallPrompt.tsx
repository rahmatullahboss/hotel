"use client";

import { useState, useEffect } from "react";
import { HiOutlineDevicePhoneMobile, HiOutlineXMark, HiOutlinePlus } from "react-icons/hi2";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_DISMISSED_KEY = "zinurooms-install-dismissed";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if dismissed recently
    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Don't show for 7 days after dismissal
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 30 seconds
      setTimeout(() => setIsVisible(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS, show after 30 seconds
    if (isIOSDevice) {
      setTimeout(() => setIsVisible(true), 30000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <HiOutlineDevicePhoneMobile className="w-6 h-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 mb-1">
                অ্যাপ ইনস্টল করুন
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                দ্রুত অ্যাক্সেসের জন্য ZinuRooms আপনার হোম স্ক্রীনে যোগ করুন
              </p>

              {isIOS ? (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span>Safari-এ</span>
                  <HiOutlinePlus className="w-4 h-4" />
                  <span>ট্যাপ করে "Add to Home Screen" সিলেক্ট করুন</span>
                </p>
              ) : (
                <button
                  onClick={handleInstall}
                  className="w-full px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  ইনস্টল করুন
                </button>
              )}
            </div>

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
