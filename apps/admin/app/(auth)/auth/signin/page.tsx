"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

function SignInContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const error = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setLoginError("");
        await signIn("google", { callbackUrl });
    };

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        
        setIsLoading(true);
        setLoginError("");
        
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
        });

        if (result?.error) {
            setLoginError("Invalid email or password");
            setIsLoading(false);
        } else if (result?.ok) {
            window.location.href = callbackUrl;
        } else {
            setIsLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: "2.5rem", width: "100%", maxWidth: "420px" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{
                    width: "56px",
                    height: "56px",
                    margin: "0 auto 1rem",
                    borderRadius: "1rem",
                    background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "1.25rem"
                }}>
                    ZR
                </div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)", marginBottom: "0.5rem" }}>
                    Admin Portal
                </h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Secure access for administrators only
                </p>
            </div>

            {/* Error Messages */}
            {(error || loginError) && (
                <div style={{
                    padding: "0.75rem 1rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.5rem",
                    color: "var(--color-error)",
                    fontSize: "0.875rem",
                    marginBottom: "1.5rem",
                    textAlign: "center"
                }}>
                    {loginError || (error === "CredentialsSignin" ? "Invalid email or password" : "Authentication failed")}
                </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleCredentialsSignIn} style={{ marginBottom: "1.5rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ 
                        display: "block", 
                        fontSize: "0.875rem", 
                        fontWeight: 500, 
                        marginBottom: "0.5rem",
                        color: "var(--color-text-primary)"
                    }}>
                        Email
                    </label>
                    <div style={{ position: "relative" }}>
                        <HiOutlineEnvelope 
                            size={18} 
                            style={{ 
                                position: "absolute", 
                                left: "0.875rem", 
                                top: "50%", 
                                transform: "translateY(-50%)",
                                color: "var(--color-text-muted)"
                            }} 
                        />
                        <input
                            type="email"
                            placeholder="admin@zinurooms.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem 0.875rem 0.75rem 2.75rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                                outline: "none",
                                transition: "all 0.2s ease"
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ 
                        display: "block", 
                        fontSize: "0.875rem", 
                        fontWeight: 500, 
                        marginBottom: "0.5rem",
                        color: "var(--color-text-primary)"
                    }}>
                        Password
                    </label>
                    <div style={{ position: "relative" }}>
                        <HiOutlineLockClosed 
                            size={18} 
                            style={{ 
                                position: "absolute", 
                                left: "0.875rem", 
                                top: "50%", 
                                transform: "translateY(-50%)",
                                color: "var(--color-text-muted)"
                            }} 
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem 2.75rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                                outline: "none",
                                transition: "all 0.2s ease"
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: "absolute",
                                right: "0.875rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--color-text-muted)",
                                padding: 0,
                                display: "flex"
                            }}
                        >
                            {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "0.875rem" }}
                >
                    {isLoading ? "Signing in..." : "Sign In"}
                </button>
            </form>

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
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>or</span>
                <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
            </div>

            {/* Google Sign In */}
            <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="btn btn-outline"
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    padding: "0.75rem"
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24">
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
                Continue with Google
            </button>

            <p style={{ 
                marginTop: "1.5rem", 
                textAlign: "center", 
                fontSize: "0.75rem", 
                color: "var(--color-text-muted)" 
            }}>
                Protected by ZinuRooms Security
            </p>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="card" style={{ padding: "2.5rem", width: "100%", maxWidth: "420px", textAlign: "center" }}>
                <div className="skeleton skeleton-text" style={{ width: "60%", margin: "0 auto" }} />
                <div className="skeleton skeleton-text" style={{ width: "40%", margin: "0.5rem auto" }} />
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}
