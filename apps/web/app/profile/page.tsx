import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getUserBookings } from "../actions/bookings";
import { getWallet, getLoyaltyPoints } from "../actions/wallet";
import { BottomNav, LanguageSwitcher } from "../components";

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
            <main className="container page-content profile-layout" style={{ paddingTop: "2rem" }}>
                {/* Profile Header */}
                <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {session.user.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name || "Profile"}
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: "50%",
                                    background: "var(--color-primary)",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.5rem",
                                    fontWeight: 700,
                                }}
                            >
                                {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                                {session.user.name || "User"}
                            </h1>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                                {session.user.email}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <Link href="/profile/edit" className="btn btn-outline" style={{ flex: 1, textAlign: "center", textDecoration: "none", color: "inherit", lineHeight: "inherit" }}>
                            {t("editProfile")}
                        </Link>
                        <form
                            action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/" });
                            }}
                            style={{ flex: 1 }}
                        >
                            <button type="submit" className="btn btn-outline" style={{ width: "100%" }}>
                                {t("signOut")}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Wallet & Loyalty Card */}
                <Link
                    href="/wallet"
                    style={{ textDecoration: "none" }}
                >
                    <div
                        style={{
                            background: "linear-gradient(135deg, #1d3557 0%, #457b9d 100%)",
                            borderRadius: "1rem",
                            padding: "1.25rem",
                            marginBottom: "1.5rem",
                            color: "white",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "0.25rem" }}>{tWallet("walletBalance")}</div>
                                <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                                    ৳{Number(wallet?.balance || 0).toLocaleString()}
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "0.25rem" }}>{tWallet("loyaltyPoints")}</div>
                                <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                                    {(loyalty?.points || 0).toLocaleString()} {tWallet("pts")}
                                </div>
                                <div
                                    style={{
                                        display: "inline-block",
                                        padding: "0.25rem 0.5rem",
                                        background: tierColors[loyalty?.tier as keyof typeof tierColors || "BRONZE"],
                                        color: loyalty?.tier === "SILVER" || loyalty?.tier === "PLATINUM" ? "#333" : "white",
                                        borderRadius: "1rem",
                                        fontSize: "0.625rem",
                                        fontWeight: 600,
                                        marginTop: "0.25rem",
                                    }}
                                >
                                    {loyalty?.tier || "BRONZE"} 🏆
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: "0.75rem", marginTop: "0.75rem", opacity: 0.7 }}>
                            {tWallet("tapToManage")}
                        </div>
                    </div>
                </Link>

                {/* Quick Stats */}
                <div className="profile-stats-grid" style={{ marginBottom: "1.5rem" }}>
                    <div className="card profile-stat-card">
                        <div className="profile-stat-number">
                            {upcomingBookings.length}
                        </div>
                        <div className="profile-stat-label">
                            {t("upcomingTrips")}
                        </div>
                    </div>
                    <div className="card profile-stat-card">
                        <div className="profile-stat-number">
                            {pastBookings.length}
                        </div>
                        <div className="profile-stat-label">
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
                            {upcomingBookings.map((booking) => (
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
                        }}
                    >
                        <span>{t("privacy")}</span>
                        <span>→</span>
                    </Link>
                </div>
            </main>

            <BottomNav />
        </>
    );
}
