"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateProfile, getUserProfile } from "../../actions/profile";
import { BottomNav } from "../../components";

export default function EditProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Load user data
    useEffect(() => {
        async function loadProfile() {
            if (session?.user?.id) {
                const profile = await getUserProfile(session.user.id);
                if (profile) {
                    setName(profile.name || "");
                    setPhone(profile.phone || "");
                }
                setIsLoading(false);
            }
        }

        if (status === "authenticated") {
            loadProfile();
        } else if (status === "unauthenticated") {
            router.push("/auth/signin?callbackUrl=/profile/edit");
        }
    }, [session, status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setIsSaving(true);

        try {
            const result = await updateProfile({
                userId: session?.user?.id || "",
                name,
                phone,
            });

            if (result.success) {
                setSuccess(true);
                // Update session with new name
                await update({ name });
                setTimeout(() => {
                    router.push("/profile");
                }, 1500);
            } else {
                setError(result.error || "Failed to update profile");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <>
                <main className="container" style={{ padding: "2rem" }}>
                    <div className="card" style={{ padding: "2rem" }}>
                        <div className="skeleton" style={{ width: "100%", height: 24, marginBottom: "1rem" }} />
                        <div className="skeleton" style={{ width: "100%", height: 48, marginBottom: "1rem" }} />
                        <div className="skeleton" style={{ width: "100%", height: 48 }} />
                    </div>
                </main>
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <main className="container" style={{ padding: "1rem", paddingTop: "2rem" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                    <Link
                        href="/profile"
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "var(--color-bg-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textDecoration: "none",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        ←
                    </Link>
                    <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Edit Profile</h1>
                </div>

                {/* Profile Picture */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt=""
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: "50%",
                                objectFit: "cover",
                                margin: "0 auto 1rem",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: "50%",
                                background: "var(--color-primary)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "2.5rem",
                                fontWeight: 700,
                                margin: "0 auto 1rem",
                            }}
                        >
                            {(name || session?.user?.email)?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        {session?.user?.email}
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div
                        style={{
                            padding: "1rem",
                            marginBottom: "1rem",
                            background: "rgba(42, 157, 143, 0.1)",
                            color: "var(--color-success)",
                            borderRadius: "0.5rem",
                            textAlign: "center",
                        }}
                    >
                        ✓ Profile updated successfully! Redirecting...
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div
                        style={{
                            padding: "1rem",
                            marginBottom: "1rem",
                            background: "rgba(208, 0, 0, 0.1)",
                            color: "var(--color-error)",
                            borderRadius: "0.5rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Edit Form */}
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ padding: "1.5rem" }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="01XXXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={session?.user?.email || ""}
                                disabled
                                style={{ background: "var(--color-bg-secondary)", opacity: 0.7 }}
                            />
                            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                                Email cannot be changed
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                        <Link
                            href="/profile"
                            className="btn btn-outline"
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 2 }}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </main>

            <BottomNav />
        </>
    );
}
