"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    let errorMessage = "An unknown error occurred.";
    if (error === "AccessDenied") {
        errorMessage = "You do not have permission to access the admin panel.";
    } else if (error === "Configuration") {
        errorMessage = "There is a problem with the server configuration.";
    }

    return (
        <div className="card" style={{ padding: "2rem", width: "100%", maxWidth: "400px", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-error)", marginBottom: "1rem" }}>
                Authentication Error
            </h1>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                {errorMessage}
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
                <Link href="/auth/signin" className="btn btn-primary btn-block">
                    Try Again
                </Link>
                <Link href="/" className="btn btn-outline btn-block">
                    Go Home
                </Link>
            </div>
        </div>
    );
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
