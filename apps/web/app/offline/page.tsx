import Link from "next/link";
import { HiOutlineWifi, HiOutlineArrowPath, HiOutlineHome } from "react-icons/hi2";

export const metadata = {
  title: "অফলাইন - ZinuRooms",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Offline Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <HiOutlineWifi className="w-12 h-12 text-gray-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-lg">✕</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          ইন্টারনেট সংযোগ নেই
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          আপনার ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে আপনার নেটওয়ার্ক সংযোগ 
          পরীক্ষা করে আবার চেষ্টা করুন।
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
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
            হোমে যান
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-12 p-4 bg-white rounded-xl border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">💡 টিপস</h4>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• WiFi বা মোবাইল ডাটা চালু আছে কিনা দেখুন</li>
            <li>• এয়ারপ্লেন মোড বন্ধ করুন</li>
            <li>• রাউটার রিস্টার্ট করার চেষ্টা করুন</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
