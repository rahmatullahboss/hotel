"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, string> = {
        Configuration: "There is a problem with the server configuration.",
        AccessDenied: "You do not have permission to sign in.",
        Verification: "The verification link may have been used or expired.",
        Default: "An error occurred during sign in. Please try again.",
    };

    const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

    return (
        <main style={{ minHeight: "100vh", padding: "2rem 1rem", background: "var(--color-bg-secondary)" }}>
            <div className="container" style={{ maxWidth: "400px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)" }}>
                        Vibe Manager
                    </h1>
                </div>

                <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Authentication Error
                    </h2>
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                        {message}
                    </p>
                    <Link href="/auth/signin" className="btn btn-primary" style={{ display: "inline-block" }}>
                        Try Again
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
