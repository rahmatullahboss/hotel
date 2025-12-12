"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageSwitcher() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const setLocale = (locale: string) => {
        document.cookie = `locale=${locale};path=/;max-age=31536000`;
        startTransition(() => {
            router.refresh();
        });
    };

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
                বাং
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
