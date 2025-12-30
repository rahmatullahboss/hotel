"use client";

import Link from "next/link";
import { 
  HiOutlinePlusCircle,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineWrenchScrewdriver,
  HiOutlineQrCode
} from "react-icons/hi2";

export function QuickActionsGrid() {
  const actions = [
    {
      label: "New Booking",
      icon: HiOutlinePlusCircle,
      href: "/bookings/new",
      color: "text-blue-600",
      bg: "bg-blue-50 hover:bg-blue-100",
      border: "border-blue-100",
    },
    {
      label: "Check-ins",
      icon: HiOutlineUserGroup,
      href: "/bookings?filter=today",
      color: "text-green-600",
      bg: "bg-green-50 hover:bg-green-100",
      border: "border-green-100",
    },
    {
      label: "Payments",
      icon: HiOutlineCurrencyDollar,
      href: "/finance",
      color: "text-purple-600",
      bg: "bg-purple-50 hover:bg-purple-100",
      border: "border-purple-100",
    },
    {
      label: "Scan QR",
      icon: HiOutlineQrCode,
      href: "/scanner",
      color: "text-rose-600",
      bg: "bg-rose-50 hover:bg-rose-100",
      border: "border-rose-100",
    },
    {
      label: "Maintenance",
      icon: HiOutlineWrenchScrewdriver,
      href: "/rooms/maintenance",
      color: "text-orange-600",
      bg: "bg-orange-50 hover:bg-orange-100",
      border: "border-orange-100",
    },
    {
      label: "Availability",
      icon: HiOutlineCalendar,
      href: "/rooms/calendar",
      color: "text-cyan-600",
      bg: "bg-cyan-50 hover:bg-cyan-100",
      border: "border-cyan-100",
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={`
            flex flex-col items-center justify-center p-4 rounded-xl 
            border ${action.border} ${action.bg} 
            transition-all duration-200 hover:scale-105 hover:shadow-sm
            text-center
          `}
        >
          <action.icon className={`w-8 h-8 mb-2 ${action.color}`} />
          <span className="text-xs font-semibold text-gray-700">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
