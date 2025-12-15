"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { BottomNav } from "../../components";

function SignInContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const t = useTranslations("auth");

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        await signIn("google", { callbackUrl });
    };

    const handleDevSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);
        await signIn("credentials", { email, callbackUrl });
    };

    return (
        <>
            <main style={{ minHeight: "100vh", padding: "2rem 1rem", background: "var(--color-bg-secondary)" }}>
                <div className="container" style={{ maxWidth: "400px" }}>
                    {/* Logo */}
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <Link href="/" style={{ textDecoration: "none" }}>
                            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-primary)" }}>
                                Vibe
                            </h1>
                        </Link>
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Sign In Card */}
                    <div className="card" style={{ padding: "2rem" }}>
                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="btn btn-outline btn-block"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.75rem",
                                marginBottom: "1.5rem",
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {isLoading ? t("signingIn") : t("continueGoogle")}
                        </button>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                marginBottom: "1.5rem",
                                color: "var(--color-text-muted)",
                            }}
                        >
                            <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
                            <span style={{ fontSize: "0.875rem" }}>{t("or")}</span>
                            <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
                        </div>

                        {/* Dev Sign In - show always for testing */}
                        <form onSubmit={handleDevSignIn}>
                            <div className="form-group">
                                <label className="form-label">{t("emailLabel")}</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder={t("emailPlaceholder")}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="btn btn-primary btn-block"
                            >
                                {isLoading ? t("signingIn") : t("signInEmail")}
                            </button>
                        </form>

                        {/* Phone Sign In Placeholder */}
                        <div style={{ marginTop: "1rem" }}>
                            <button
                                className="btn btn-secondary btn-block"
                                disabled
                                style={{ opacity: 0.6 }}
                            >
                                {t("signInPhone")}
                            </button>
                        </div>
                    </div>

                    {/* Terms */}
                    <p
                        style={{
                            textAlign: "center",
                            fontSize: "0.75rem",
                            color: "var(--color-text-muted)",
                            marginTop: "1.5rem",
                            lineHeight: 1.5,
                        }}
                    >
                        {t("agreement")}{" "}
                        <Link href="/terms" style={{ color: "var(--color-primary)" }}>
                            {t("terms")}
                        </Link>{" "}
                        {t("and")}{" "}
                        <Link href="/privacy" style={{ color: "var(--color-primary)" }}>
                            {t("privacy")}
                        </Link>
                        {t("agreementSuffix")}
                    </p>
                </div>
            </main>

        </>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
            <SignInContent />
        </Suspense>
    );
}
