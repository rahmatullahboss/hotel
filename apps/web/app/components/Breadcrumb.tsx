"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineChevronRight, HiOutlineHome } from "react-icons/hi2";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Map routes to Bengali labels
const routeLabels: Record<string, string> = {
  "/": "হোম",
  "/hotels": "হোটেল",
  "/bookings": "বুকিং",
  "/profile": "প্রোফাইল",
  "/wallet": "ওয়ালেট",
  "/help": "সাহায্য",
  "/contact": "যোগাযোগ",
  "/about": "আমাদের সম্পর্কে",
  "/privacy": "গোপনীয়তা নীতি",
  "/terms": "শর্তাবলী",
  "/careers": "ক্যারিয়ার",
  "/partner": "পার্টনার হোন",
};

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbs: BreadcrumbItem[] = items || (() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: "হোম", href: "/" }];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Check if segment looks like an ID (UUID or number)
      const isId = /^[0-9a-f-]{36}$/i.test(segment) || /^\d+$/.test(segment);
      
      if (isId) {
        crumbs.push({ label: "বিস্তারিত" });
      } else {
        const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
        crumbs.push({
          label,
          href: isLast ? undefined : currentPath,
        });
      }
    });

    return crumbs;
  })();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`${className}`}>
      <ol className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <HiOutlineChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors"
                >
                  {isFirst && <HiOutlineHome className="w-4 h-4" />}
                  <span className={isFirst ? "sr-only sm:not-sr-only" : ""}>
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span className="text-gray-900 font-medium truncate max-w-[150px]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
