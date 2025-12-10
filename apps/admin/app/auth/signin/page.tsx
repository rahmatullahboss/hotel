"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SignInContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
        <main style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
        }}>
            <div style={{ maxWidth: "420px", width: "100%" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
                        WebkitTextFillColor: "transparent",
                        marginBottom: "0.5rem"
                    }}>
                        Vibe Admin
                    </h1>
                    <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}>
                        Sign in to access the admin dashboard
                    </p>
                </div>

                {/* Sign In Card */}
                <div style={{
                    padding: "2rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                }}>
                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                            padding: "0.875rem 1.5rem",
                            background: "rgba(255, 255, 255, 0.95)",
                            color: "#333",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "1rem",
                            fontWeight: 600,
                            cursor: isLoading ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                            marginBottom: "1.5rem",
                            opacity: isLoading ? 0.7 : 1
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
                        {isLoading ? "Signing in..." : "Continue with Google"}
                    </button>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "1.5rem",
                            color: "rgba(255, 255, 255, 0.4)",
                        }}
                    >
                        <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
                        <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>or</span>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
                    </div>

                    {/* Dev Sign In */}
                    <form onSubmit={handleDevSignIn}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: 500,
                                    fontSize: "0.85rem",
                                    marginBottom: "0.5rem",
                                    color: "rgba(255, 255, 255, 0.7)"
                                }}
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="admin@vibehotel.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.875rem 1rem",
                                    fontSize: "1rem",
                                    border: "2px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "12px",
                                    outline: "none",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "#fff",
                                    boxSizing: "border-box",
                                    transition: "border-color 0.2s ease"
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            style={{
                                width: "100%",
                                padding: "0.875rem 1.5rem",
                                background: isLoading || !email
                                    ? "rgba(102, 126, 234, 0.5)"
                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: 600,
                                cursor: isLoading || !email ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            {isLoading ? "Signing in..." : "Sign In with Email"}
                        </button>
                    </form>
                </div>

                {/* Info */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: "rgba(255, 193, 7, 0.1)",
                    border: "1px solid rgba(255, 193, 7, 0.2)",
                    borderRadius: "12px"
                }}>
                    <span style={{ fontSize: "1rem" }}>🔒</span>
                    <p style={{
                        fontSize: "0.8rem",
                        color: "rgba(255, 193, 7, 0.9)",
                        lineHeight: 1.4,
                        margin: 0
                    }}>
                        Admin access only. You must have admin privileges to sign in.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function SignInPage() {
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
            <SignInContent />
        </Suspense>
    );
}
