import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { DeleteAccountButton } from "@/app/components";

export const metadata = {
    title: "Delete Account | Zinu Rooms",
    description: "Delete your Zinu Rooms account. Your account will be scheduled for permanent deletion after 30 days.",
};

export default async function DeleteAccountPage() {
    const session = await auth();
    const t = await getTranslations("profile");

    // If not logged in, show instructions to login first
    if (!session?.user) {
        return (
            <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem", maxWidth: "600px", margin: "0 auto" }}>
                <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                        Sign In Required
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                        Please sign in to your Zinu Rooms account to delete it.
                    </p>
                    <Link
                        href="/auth/signin?callbackUrl=/account/delete"
                        className="btn btn-primary"
                        style={{ display: "inline-block" }}
                    >
                        Sign In
                    </Link>
                </div>

                {/* Info section for Google Play compliance */}
                <div style={{ marginTop: "2rem", padding: "1.5rem", background: "#f8fafc", borderRadius: "1rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Account Deletion Information
                    </h2>
                    <ul style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.8, paddingLeft: "1.25rem" }}>
                        <li>You can request account deletion from your profile settings after signing in.</li>
                        <li>After requesting deletion, your account will be deactivated immediately.</li>
                        <li>You have a 30-day grace period to recover your account by logging in again.</li>
                        <li>After 30 days, all your data will be permanently deleted including: profile information, booking history, wallet balance, loyalty points, and referral data.</li>
                        <li>This action cannot be undone after the 30-day grace period.</li>
                    </ul>
                </div>
            </main>
        );
    }

    return (
        <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem", maxWidth: "600px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem", color: "#dc2626" }}>
                    {t("deleteAccountTitle")}
                </h1>
                <p style={{ color: "var(--color-text-secondary)" }}>
                    {session.user.email}
                </p>
            </div>

            {/* User Info Card */}
            <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    {session.user.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || "Profile"}
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: "50%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: "50%",
                                background: "var(--color-primary)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.25rem",
                                fontWeight: 700,
                            }}
                        >
                            {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                            {session.user.name || "User"}
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                            {session.user.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* 30-day grace period info */}
            <div
                style={{
                    background: "#fef3c7",
                    borderRadius: "1rem",
                    padding: "1.25rem",
                    marginBottom: "1.5rem",
                    borderLeft: "4px solid #f59e0b",
                }}
            >
                <p style={{ color: "#92400e", fontWeight: 600, marginBottom: "0.5rem" }}>
                    ⏰ {t("deleteGracePeriodTitle")}
                </p>
                <p style={{ color: "#92400e", fontSize: "0.875rem", margin: 0 }}>
                    {t("deleteGracePeriodDesc")}
                </p>
            </div>

            {/* Warning list */}
            <div
                style={{
                    background: "#fef2f2",
                    borderRadius: "1rem",
                    padding: "1.25rem",
                    marginBottom: "1.5rem",
                }}
            >
                <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: "0.75rem" }}>
                    {t("deleteWarningTitle")}
                </p>
                <ul style={{ color: "#b91c1c", fontSize: "0.875rem", paddingLeft: "1.25rem", margin: 0, lineHeight: 1.8 }}>
                    <li>{t("deleteWarning1")}</li>
                    <li>{t("deleteWarning2")}</li>
                    <li>{t("deleteWarning3")}</li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="card" style={{ padding: 0 }}>
                <DeleteAccountButton userId={session.user.id} />
                <Link
                    href="/profile"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        color: "var(--color-primary)",
                        textDecoration: "none",
                        fontWeight: 500,
                    }}
                >
                    ← Back to Profile
                </Link>
            </div>

            {/* Additional info for Google Play compliance */}
            <div style={{ marginTop: "2rem", padding: "1.5rem", background: "#f8fafc", borderRadius: "1rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-text-secondary)" }}>
                    What happens when you delete your account?
                </h3>
                <ul style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem", lineHeight: 1.8, paddingLeft: "1.25rem", margin: 0 }}>
                    <li>Your account will be immediately deactivated</li>
                    <li>You have 30 days to recover your account by logging in again</li>
                    <li>After 30 days, all your data is permanently deleted</li>
                    <li>This includes: profile, bookings, wallet, points, and referrals</li>
                </ul>
            </div>
        </main>
    );
}
