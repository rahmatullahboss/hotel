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

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
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

export function OyoSidebar({ hotelName = "Zinu Hotel", className = "" }: OyoSidebarProps) {
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
    <aside className={`flex flex-col h-full bg-white border-r border-gray-100 w-64 ${className}`}>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const SectionIcon = section.icon;
          const hasActiveItem = section.items.some((item) => isActive(item.href));

          return (
            <div key={section.id} className="mb-2">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors
                  ${hasActiveItem ? "text-primary bg-primary/5" : "text-gray-500 hover:bg-gray-50"}
                `}
              >
                <div className="flex items-center gap-2">
                  <SectionIcon className="w-4 h-4" />
                  <span>{section.title}</span>
                </div>
                {isExpanded ? (
                  <HiOutlineChevronDown className="w-4 h-4" />
                ) : (
                  <HiOutlineChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Section Items */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-1 ml-4 border-l border-gray-100 pl-2 space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all
                          ${active
                            ? "bg-primary text-white font-medium shadow-sm shadow-primary/20"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                      >
                        <Icon className={`w-4 h-4 ${active ? "text-white" : "text-gray-400"}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Divider */}
        <div className="border-t border-gray-100 my-3" />

        {/* Bottom Items */}
        <div className="space-y-0.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all
                  ${active
                    ? "bg-primary text-white font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-md">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {hotelName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email || "Partner"}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
