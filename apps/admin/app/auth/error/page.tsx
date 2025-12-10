"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorConfig: Record<string, { icon: string; title: string; message: string; color: string }> = {
        Configuration: {
            icon: "⚙️",
            title: "Configuration Error",
            message: "There is a problem with the server configuration. Please contact the system administrator.",
            color: "#3b82f6"
        },
        AccessDenied: {
            icon: "🚫",
            title: "Access Denied",
            message: "You do not have admin privileges. Only administrators can access this dashboard.",
            color: "#ef4444"
        },
        Verification: {
            icon: "⏰",
            title: "Link Expired",
            message: "The verification link may have been used or has expired. Please try signing in again.",
            color: "#f59e0b"
        },
        Default: {
            icon: "⚠️",
            title: "Authentication Error",
            message: "An error occurred during sign in. Please try again.",
            color: "#8b5cf6"
        },
    };

    const config = error ? errorConfig[error] || errorConfig.Default : errorConfig.Default;

    return (
        <main style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
        }}>
            <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
                {/* Logo */}
                <div style={{ marginBottom: "2rem" }}>
                    <div style={{
                        width: "72px",
                        height: "72px",
                        margin: "0 auto 1rem",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)"
                    }}>
                        🏨
                    </div>
                    <h1 style={{
                        fontSize: "1.75rem",
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        Vibe Admin
                    </h1>
                </div>

                {/* Error Card */}
                <div style={{
                    padding: "2.5rem 2rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                }}>
                    <div style={{
                        fontSize: "4rem",
                        marginBottom: "1.5rem",
                        animation: "pulse 2s infinite"
                    }}>
                        {config.icon}
                    </div>
                    <h2 style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        marginBottom: "0.75rem",
                        color: config.color
                    }}>
                        {config.title}
                    </h2>
                    <p style={{
                        color: "rgba(255, 255, 255, 0.6)",
                        marginBottom: "2rem",
                        lineHeight: 1.6
                    }}>
                        {config.message}
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                        <Link
                            href="/auth/signin"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.875rem 1.5rem",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "#fff",
                                textDecoration: "none",
                                borderRadius: "12px",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                transition: "transform 0.2s ease, box-shadow 0.2s ease"
                            }}
                        >
                            ← Try Again
                        </Link>
                    </div>
                </div>

                {/* Help text */}
                <p style={{
                    marginTop: "1.5rem",
                    fontSize: "0.8rem",
                    color: "rgba(255, 255, 255, 0.4)",
                    lineHeight: 1.5
                }}>
                    If you believe you should have access, please contact your system administrator.
                </p>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `}</style>
        </main>
    );
}

export default function ErrorPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                color: "#fff"
            }}>
                Loading...
            </div>
        }>
            <ErrorContent />
        </Suspense>
    );
}
