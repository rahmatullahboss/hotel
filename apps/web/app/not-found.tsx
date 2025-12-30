import Link from "next/link";
import { HiOutlineHome, HiOutlineMagnifyingGlass, HiOutlineArrowLeft } from "react-icons/hi2";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[180px] font-black text-gray-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🏨</div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          পেজটি খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          আপনি যে পেজটি খুঁজছেন সেটি হয়তো সরিয়ে ফেলা হয়েছে, নাম পরিবর্তন করা হয়েছে,
          অথবা সাময়িকভাবে অনুপলব্ধ।
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <HiOutlineHome className="w-5 h-5" />
            হোমে ফিরে যান
          </Link>
          <Link
            href="/hotels"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <HiOutlineMagnifyingGlass className="w-5 h-5" />
            হোটেল খুঁজুন
          </Link>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          আগের পেজে ফিরে যান
        </button>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-4 opacity-50">
          <span className="text-3xl">🛏️</span>
          <span className="text-3xl">🌙</span>
          <span className="text-3xl">✨</span>
        </div>
      </div>
    </main>
  );
}
