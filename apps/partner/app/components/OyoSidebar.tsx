"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import {
  HiOutlineHome,
  HiOutlineCalendarDays,
  HiOutlineUserGroup,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBuildingOffice2,
  HiOutlineWrenchScrewdriver,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineLink,
  HiOutlineStar,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
  HiOutlineQuestionMarkCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBriefcase,
} from "react-icons/hi2";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeProvider";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    id: "front-desk",
    title: "Front Desk",
    icon: HiOutlineHome,
    items: [
      { href: "/", label: "ড্যাশবোর্ড", icon: HiOutlineHome },
      { href: "/bookings", label: "বুকিং", icon: HiOutlineCalendarDays },
      { href: "/walkin", label: "ওয়াক-ইন", icon: HiOutlineUserGroup },
      { href: "/messaging", label: "মেসেজ", icon: HiOutlineChatBubbleLeftRight },
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    icon: HiOutlineBuildingOffice2,
    items: [
      { href: "/inventory", label: "রুম", icon: HiOutlineBuildingOffice2 },
      { href: "/maintenance", label: "রক্ষণাবেক্ষণ", icon: HiOutlineWrenchScrewdriver },
    ],
  },
  {
    id: "revenue",
    title: "Revenue",
    icon: HiOutlineCurrencyDollar,
    items: [
      { href: "/earnings", label: "আয়", icon: HiOutlineCurrencyDollar },
      { href: "/revenue-management", label: "রেভেনিউ", icon: HiOutlineChartBar },
      { href: "/reports", label: "রিপোর্ট", icon: HiOutlineDocumentText },
      { href: "/channels", label: "চ্যানেল", icon: HiOutlineLink },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    icon: HiOutlineBriefcase,
    items: [
      { href: "/reviews", label: "রিভিউ", icon: HiOutlineStar },
      { href: "/staff-performance", label: "স্টাফ", icon: HiOutlineUserGroup },
      { href: "/portfolio", label: "পোর্টফোলিও", icon: HiOutlineChartBar },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { href: "/settings", label: "সেটিংস", icon: HiOutlineCog6Tooth },
  { href: "/help", label: "সাহায্য", icon: HiOutlineQuestionMarkCircle },
];

interface OyoSidebarProps {
  hotelName?: string;
  className?: string;
}

export function OyoSidebar({ hotelName = "Zinu Hotel" }: OyoSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedSections, setExpandedSections] = useState<string[]>(["front-desk", "inventory", "revenue", "operations"]);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections;

    const query = searchQuery.toLowerCase();
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.label.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery]);

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'white',
      borderRight: '1px solid #f3f4f6',
      width: '240px',
      flexShrink: 0
    }}>
      {/* Search Bar */}
      <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ position: 'relative' }}>
          <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '36px',
              paddingRight: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
              fontSize: '14px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {filteredSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const SectionIcon = section.icon;
          const hasActiveItem = section.items.some((item) => isActive(item.href));

          return (
            <div key={section.id} style={{ marginBottom: '8px' }}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderRadius: '8px',
                  border: 'none',
                  background: hasActiveItem ? '#eef2ff' : 'transparent',
                  color: hasActiveItem ? '#4f46e5' : '#6b7280',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SectionIcon style={{ width: '16px', height: '16px' }} />
                  <span>{section.title}</span>
                </div>
                {isExpanded ? (
                  <HiOutlineChevronDown style={{ width: '16px', height: '16px' }} />
                ) : (
                  <HiOutlineChevronRight style={{ width: '16px', height: '16px' }} />
                )}
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div style={{ marginTop: '4px', marginLeft: '16px', borderLeft: '1px solid #f3f4f6', paddingLeft: '8px' }}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px 12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          marginBottom: '2px',
                          background: active ? '#4f46e5' : 'transparent',
                          color: active ? 'white' : '#4b5563',
                          fontWeight: active ? '500' : '400'
                        }}
                      >
                        <Icon style={{ width: '16px', height: '16px', color: active ? 'white' : '#9ca3af' }} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div style={{ borderTop: '1px solid #f3f4f6', margin: '12px 0' }} />

        {/* Bottom Items */}
        <div>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  marginBottom: '2px',
                  background: active ? '#4f46e5' : 'transparent',
                  color: active ? 'white' : '#4b5563'
                }}
              >
                <Icon style={{ width: '16px', height: '16px', color: active ? 'white' : '#9ca3af' }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '9999px',
            background: 'linear-gradient(to bottom right, #4f46e5, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
          }}>
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {hotelName}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session?.user?.email || "Partner"}
            </p>
          </div>

          {/* Theme Toggle */}
          <ThemeToggleButton />

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            style={{
              padding: '8px',
              color: '#9ca3af',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            title="Logout"
          >
            <HiOutlineArrowRightOnRectangle style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// Theme toggle button component
function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px',
        color: '#9ca3af',
        background: 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <HiOutlineSun style={{ width: '20px', height: '20px' }} />
      ) : (
        <HiOutlineMoon style={{ width: '20px', height: '20px' }} />
      )}
    </button>
  );
}
