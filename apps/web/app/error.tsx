"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HiOutlineHome, HiOutlineArrowPath, HiOutlineExclamationTriangle } from "react-icons/hi2";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
            <HiOutlineExclamationTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          কিছু একটা সমস্যা হয়েছে!
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          দুঃখিত, একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। আমরা এই সমস্যার সমাধানে কাজ করছি।
          অনুগ্রহ করে আবার চেষ্টা করুন।
        </p>

        {/* Error Details (for development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-gray-100 rounded-xl text-left">
            <p className="text-xs font-mono text-gray-600 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <HiOutlineArrowPath className="w-5 h-5" />
            আবার চেষ্টা করুন
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <HiOutlineHome className="w-5 h-5" />
            হোমে ফিরে যান
          </Link>
        </div>

        {/* Support */}
        <p className="mt-8 text-sm text-gray-500">
          সমস্যা থাকলে যোগাযোগ করুন:{" "}
          <a
            href="mailto:support@zinurooms.com"
            className="text-primary hover:underline"
          >
            support@zinurooms.com
          </a>
        </p>
      </div>
    </main>
  );
}
