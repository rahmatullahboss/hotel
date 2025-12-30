"use client";

import { useState, useEffect } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "zinurooms-cookie-consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Icon & Text */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🍪</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    কুকি ব্যবহারের অনুমতি
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    আমরা আপনার অভিজ্ঞতা উন্নত করতে কুকি ব্যবহার করি।{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      গোপনীয়তা নীতি
                    </Link>{" "}
                    পড়ুন।
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                প্রত্যাখ্যান
              </button>
              <button
                onClick={handleAccept}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
              >
                গ্রহণ করুন
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDecline}
              className="absolute top-3 right-3 md:hidden p-1 text-gray-400 hover:text-gray-600"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar Animation */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-primary animate-pulse"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
