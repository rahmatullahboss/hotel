import Link from "next/link";
import { HiOutlineMagnifyingGlass, HiOutlineCalendarDays, HiOutlineMapPin } from "react-icons/hi2";

interface EmptyStateProps {
  type?: "no-results" | "no-bookings" | "no-favorites" | "error";
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

const configs = {
  "no-results": {
    icon: "🔍",
    title: "কোনো হোটেল পাওয়া যায়নি",
    description: "আপনার সার্চের জন্য কোনো ফলাফল পাওয়া যায়নি। অন্য তারিখ বা লোকেশন দিয়ে চেষ্টা করুন।",
    actionLabel: "সব হোটেল দেখুন",
    actionHref: "/hotels",
    actionIcon: HiOutlineMagnifyingGlass,
  },
  "no-bookings": {
    icon: "📅",
    title: "কোনো বুকিং নেই",
    description: "আপনার এখনো কোনো বুকিং হয়নি। এখনই একটি হোটেল বুক করুন!",
    actionLabel: "হোটেল খুঁজুন",
    actionHref: "/hotels",
    actionIcon: HiOutlineCalendarDays,
  },
  "no-favorites": {
    icon: "❤️",
    title: "পছন্দের তালিকা খালি",
    description: "আপনি এখনও কোনো হোটেল পছন্দ করেননি। পছন্দের হোটেল সেভ করুন!",
    actionLabel: "হোটেল দেখুন",
    actionHref: "/hotels",
    actionIcon: HiOutlineMapPin,
  },
  "error": {
    icon: "😕",
    title: "কিছু ভুল হয়েছে",
    description: "ডাটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
    actionLabel: "হোমে যান",
    actionHref: "/",
    actionIcon: HiOutlineMagnifyingGlass,
  },
};

export function EmptyState({
  type = "no-results",
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const config = configs[type];
  const ActionIcon = config.actionIcon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="text-6xl mb-6 animate-bounce">
        {config.icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title || config.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
        {description || config.description}
      </p>

      {/* Action */}
      <Link
        href={actionHref || config.actionHref}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
      >
        <ActionIcon className="w-5 h-5" />
        {actionLabel || config.actionLabel}
      </Link>

      {/* Decorative */}
      <div className="mt-12 flex gap-3 opacity-40">
        <span className="text-2xl">🏨</span>
        <span className="text-2xl">🛏️</span>
        <span className="text-2xl">✨</span>
      </div>
    </div>
  );
}
