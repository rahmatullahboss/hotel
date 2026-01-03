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

const actionColors: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' },
  green: { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' },
  purple: { bg: '#faf5ff', text: '#9333ea', border: '#f3e8ff' },
  rose: { bg: '#fff1f2', text: '#e11d48', border: '#ffe4e6' },
  orange: { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' },
  cyan: { bg: '#ecfeff', text: '#0891b2', border: '#cffafe' },
};

export function QuickActionsGrid() {
  const actions = [
    {
      label: "New Booking",
      icon: HiOutlinePlusCircle,
      href: "/bookings/new",
      color: "blue",
    },
    {
      label: "Check-ins",
      icon: HiOutlineUserGroup,
      href: "/bookings?filter=today",
      color: "green",
    },
    {
      label: "Payments",
      icon: HiOutlineCurrencyDollar,
      href: "/finance",
      color: "purple",
    },
    {
      label: "Scan QR",
      icon: HiOutlineQrCode,
      href: "/scanner",
      color: "rose",
    },
    {
      label: "Maintenance",
      icon: HiOutlineWrenchScrewdriver,
      href: "/rooms/maintenance",
      color: "orange",
    },
    {
      label: "Availability",
      icon: HiOutlineCalendar,
      href: "/rooms/calendar",
      color: "cyan",
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
      {actions.map((action) => {
        const colors = actionColors[action.color]!;
        return (
          <Link
            key={action.label}
            href={action.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 8px',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              background: colors.bg,
              transition: 'all 0.2s',
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            <action.icon style={{ width: '24px', height: '24px', marginBottom: '4px', color: colors.text }} />
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#374151' }}>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
