"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function SignUpContent() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        await signIn("google", { callbackUrl: "/register-hotel" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError("All fields are required");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Sign up failed");
                setIsLoading(false);
                return;
            }

            // Auto sign in after successful registration
            const signInResult = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (signInResult?.error) {
                // Registration succeeded but auto-signin failed, redirect to signin
                router.push("/auth/signin");
            } else {
                // Redirect to hotel registration
                router.push("/register-hotel");
            }
        } catch {
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <main className="main-centered">
            <div className="container" style={{ maxWidth: "400px", margin: "0 auto" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)" }}>
                        Become a Partner
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)" }}>
                        Create your account to list your hotel
                    </p>
                </div>

                {/* Sign Up Card */}
                <div className="card" style={{ padding: "2rem" }}>
                    {/* Google Sign Up */}
                    <button
                        onClick={handleGoogleSignUp}
                        disabled={isLoading}
                        className="btn btn-outline"
                        style={{
                            width: "100%",
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
                        {isLoading ? "Please wait..." : "Continue with Google"}
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
                        <span style={{ fontSize: "0.875rem" }}>or</span>
                        <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
                    </div>

                    {/* Email/Password Sign Up Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="partner@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Re-enter password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        {error && (
                            <p style={{
                                color: "var(--color-error)",
                                fontSize: "0.875rem",
                                marginBottom: "1rem",
                                textAlign: "center",
                            }}>
                                {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>
                </div>

                {/* Sign In Link */}
                <p
                    style={{
                        textAlign: "center",
                        fontSize: "0.875rem",
                        color: "var(--color-text-secondary)",
                        marginTop: "1.5rem",
                    }}
                >
                    Already have an account?{" "}
                    <Link
                        href="/auth/signin"
                        style={{
                            color: "var(--color-primary)",
                            fontWeight: 600,
                            textDecoration: "none",
                        }}
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </main>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
            <SignUpContent />
        </Suspense>
    );
}
