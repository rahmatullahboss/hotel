import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getUserBookings } from "../actions/bookings";
import { getWallet, getLoyaltyPoints } from "../actions/wallet";
import { BottomNav, LanguageSwitcher, SignOutButton, DeleteAccountButton } from "../components";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const [bookings, wallet, loyalty, t, tWallet] = await Promise.all([
        getUserBookings(session.user.id),
        getWallet(),
        getLoyaltyPoints(),
        getTranslations("profile"),
        getTranslations("wallet"),
    ]);

    const upcomingBookings = bookings.filter(
        (b: typeof bookings[number]) => new Date(b.checkIn) >= new Date() && b.status !== "CANCELLED"
    );
    const pastBookings = bookings.filter(
        (b: typeof bookings[number]) => new Date(b.checkIn) < new Date() || b.status === "CANCELLED"
    );

    const tierColors = {
        BRONZE: "#cd7f32",
        SILVER: "#c0c0c0",
        GOLD: "#ffd700",
        PLATINUM: "#e5e4e2",
    };

    return (
        <>
            <main className="container page-content premium-page-wrapper" style={{ paddingTop: "2rem" }}>
                {/* Profile Header */}
                <div className="premium-profile-card">
                    <div className="premium-profile-header">
                        <div className="premium-profile-avatar">
                            {session.user.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || "Profile"}
                                />
                            ) : (
                                <div className="premium-profile-avatar-placeholder">
                                    {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="premium-profile-info">
                            <h1 className="premium-profile-name">
                                {session.user.name || "User"}
                            </h1>
                            <p className="premium-profile-email">
                                {session.user.email}
                            </p>
                        </div>
                    </div>

                    <div className="premium-profile-actions">
                        <Link href="/profile/edit" className="premium-btn-outline" style={{ textAlign: "center", textDecoration: "none" }}>
                            {t("editProfile")}
                        </Link>
                        <SignOutButton style={{ flex: 1, width: "100%" }} />
                    </div>
                </div>

                {/* Wallet & Loyalty Card */}
                <Link
                    href="/wallet"
                    style={{ textDecoration: "none" }}
                >
                    <div className="premium-wallet-card">
                        <div className="premium-wallet-row">
                            <div>
                                <div className="premium-wallet-label">{tWallet("walletBalance")}</div>
                                <div className="premium-wallet-balance">
                                    ৳{Number(wallet?.balance || 0).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="premium-wallet-label">{tWallet("loyaltyPoints")}</div>
                                <div className="premium-wallet-points">
                                    {(loyalty?.points || 0).toLocaleString()} {tWallet("pts")}
                                </div>
                                <div
                                    className="premium-wallet-tier"
                                    style={{
                                        background: tierColors[loyalty?.tier as keyof typeof tierColors || "BRONZE"],
                                        color: loyalty?.tier === "SILVER" || loyalty?.tier === "PLATINUM" ? "#333" : "white",
                                    }}
                                >
                                    {loyalty?.tier || "BRONZE"} 🏆
                                </div>
                            </div>
                        </div>
                        <div className="premium-wallet-hint">
                            {tWallet("tapToManage")}
                        </div>
                    </div>
                </Link>

                {/* Quick Stats */}
                <div className="premium-stats-grid">
                    <div className="premium-stat-card">
                        <div className="premium-stat-number">
                            {upcomingBookings.length}
                        </div>
                        <div className="premium-stat-label">
                            {t("upcomingTrips")}
                        </div>
                    </div>
                    <div className="premium-stat-card">
                        <div className="premium-stat-number">
                            {pastBookings.length}
                        </div>
                        <div className="premium-stat-label">
                            {t("pastBookings")}
                        </div>
                    </div>
                </div>

                {/* Upcoming Bookings */}
                {upcomingBookings.length > 0 && (
                    <section style={{ marginBottom: "1.5rem" }}>
                        <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                            {t("upcomingTrips")}
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {upcomingBookings.map((booking: typeof upcomingBookings[number]) => (
                                <div key={booking.id} className="card" style={{ padding: "1rem" }}>
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <img
                                            src={booking.hotelImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop"}
                                            alt={booking.hotelName || "Hotel"}
                                            style={{
                                                width: 80,
                                                height: 60,
                                                borderRadius: "0.5rem",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                                {booking.hotelName}
                                            </h3>
                                            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                                {booking.roomName}
                                            </p>
                                            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                                {booking.checkIn} → {booking.checkOut}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginTop: "0.75rem",
                                            paddingTop: "0.75rem",
                                            borderTop: "1px solid var(--color-border)",
                                        }}
                                    >
                                        <span
                                            className={`badge badge-${booking.status === "CONFIRMED" ? "success" : "warning"}`}
                                        >
                                            {booking.status}
                                        </span>
                                        <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>
                                            ৳{Number(booking.totalAmount).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* View All Bookings Link */}
                <Link
                    href="/bookings"
                    className="btn btn-outline btn-block"
                    style={{ marginBottom: "1rem" }}
                >
                    {t("viewAllBookings")}
                </Link>

                {/* Account Actions */}
                <div className="card" style={{ padding: "0" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem",
                            borderBottom: "1px solid var(--color-border)",
                        }}
                    >
                        <span>{t("languageSwitch")}</span>
                        <LanguageSwitcher />
                    </div>
                    <Link
                        href="/profile/referral"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem",
                            color: "var(--color-text-primary)",
                            textDecoration: "none",
                            borderBottom: "1px solid var(--color-border)",
                            background: "linear-gradient(135deg, rgba(230, 57, 70, 0.05), rgba(69, 123, 157, 0.05))",
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            🎁 {t("referEarn")}
                        </span>
                        <span>→</span>
                    </Link>
                    <Link
                        href="/profile/achievements"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem",
                            color: "var(--color-text-primary)",
                            textDecoration: "none",
                            borderBottom: "1px solid var(--color-border)",
                            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.05))",
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            🏆 {t("achievements")}
                        </span>
                        <span>→</span>
                    </Link>
                    <Link
                        href="/help"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem",
                            color: "var(--color-text-primary)",
                            textDecoration: "none",
                            borderBottom: "1px solid var(--color-border)",
                        }}
                    >
                        <span>{t("help")}</span>
                        <span>→</span>
                    </Link>
                    <Link
                        href="/terms"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem",
                            color: "var(--color-text-primary)",
                            textDecoration: "none",
                            borderBottom: "1px solid var(--color-border)",
                        }}
                    >
                        <span>{t("terms")}</span>
                        <span>→</span>
                    </Link>
                    <Link
                        href="/privacy"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem",
                            color: "var(--color-text-primary)",
                            textDecoration: "none",
                            borderBottom: "1px solid var(--color-border)",
                        }}
                    >
                        <span>{t("privacy")}</span>
                        <span>→</span>
                    </Link>
                    <DeleteAccountButton userId={session.user.id} />
                </div>
            </main>

            <BottomNav />
        </>
    );
}
