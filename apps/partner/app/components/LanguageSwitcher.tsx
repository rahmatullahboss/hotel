"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageSwitcher() {
    const t = useTranslations("language");
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const setLocale = (locale: string) => {
        // Set cookie and refresh to apply new locale
        document.cookie = `locale=${locale};path=/;max-age=31536000`;
        startTransition(() => {
            router.refresh();
        });
    };

    // Get current locale from cookie
    const getCurrentLocale = () => {
        if (typeof document !== "undefined") {
            const match = document.cookie.match(/locale=([^;]+)/);
            return match ? match[1] : "bn";
        }
        return "bn";
    };

    const currentLocale = getCurrentLocale();

    return (
        <div className="language-switcher">
            <button
                onClick={() => setLocale("bn")}
                className={`lang-btn ${currentLocale === "bn" ? "active" : ""}`}
                disabled={isPending}
                aria-label="বাংলা"
            >
                বাংলা
            </button>
            <button
                onClick={() => setLocale("en")}
                className={`lang-btn ${currentLocale === "en" ? "active" : ""}`}
                disabled={isPending}
                aria-label="English"
            >
                EN
            </button>
        </div>
    );
}
