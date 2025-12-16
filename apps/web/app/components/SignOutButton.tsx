"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

interface SignOutButtonProps {
    className?: string;
    style?: React.CSSProperties;
}

export function SignOutButton({ className = "btn btn-outline", style }: SignOutButtonProps) {
    const t = useTranslations("profile");

    const handleSignOut = () => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <button
            type="button"
            onClick={handleSignOut}
            className={className}
            style={style}
        >
            {t("signOut")}
        </button>
    );
}
