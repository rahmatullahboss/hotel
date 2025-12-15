"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";


function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, string> = {
        Configuration: "There is a problem with the server configuration.",
        AccessDenied: "You do not have permission to sign in.",
        Verification: "The verification link has expired or has already been used.",
        Default: "An error occurred during authentication.",
    };

    const message = errorMessages[error || ""] || errorMessages.Default;

    return (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h2 style={{ marginBottom: "0.5rem", color: "var(--color-error)" }}>
                Authentication Error
            </h2>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                {message}
            </p>
            <Link href="/auth/signin" className="btn btn-primary">
                Try Again
            </Link>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <>
            <main style={{ minHeight: "100vh", padding: "2rem 1rem", background: "var(--color-bg-secondary)" }}>
                <div className="container" style={{ maxWidth: "400px" }}>
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <Link href="/" style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-primary)", textDecoration: "none" }}>
                            Vibe
                        </Link>
                    </div>

                    <Suspense fallback={<div>Loading...</div>}>
                        <ErrorContent />
                    </Suspense>
                </div>
            </main>

        </>
    );
}
