import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['bn', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
    locales,
    defaultLocale: 'bn',
    localePrefix: 'never' // Don't add locale prefix to URLs
});

// Type-safe navigation helpers
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
