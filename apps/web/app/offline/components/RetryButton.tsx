"use client";

import { HiOutlineArrowPath } from "react-icons/hi2";

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
    >
      <HiOutlineArrowPath className="w-5 h-5" />
      আবার চেষ্টা করুন
    </button>
  );
}
