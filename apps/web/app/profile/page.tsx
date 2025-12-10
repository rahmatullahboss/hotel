import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserBookings } from "../actions/bookings";
import { BottomNav } from "../components";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const bookings = await getUserBookings(session.user.id);
    const upcomingBookings = bookings.filter(
        (b) => new Date(b.checkIn) >= new Date() && b.status !== "CANCELLED"
    );
    const pastBookings = bookings.filter(
        (b) => new Date(b.checkIn) < new Date() || b.status === "CANCELLED"
    );

    return (
        <>
            <main className="container" style={{ padding: "1rem", paddingTop: "2rem" }}>
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
                            Edit Profile
                        </Link>
                        <form
                            action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/" });
                            }}
                            style={{ flex: 1 }}
                        >
                            <button type="submit" className="btn btn-outline" style={{ width: "100%" }}>
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>

                {/* Quick Stats */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-primary)" }}>
                            {upcomingBookings.length}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            Upcoming Trips
                        </div>
                    </div>
                    <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-secondary)" }}>
                            {pastBookings.length}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            Past Bookings
                        </div>
                    </div>
                </div>

                {/* Upcoming Bookings */}
                {upcomingBookings.length > 0 && (
                    <section style={{ marginBottom: "1.5rem" }}>
                        <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                            Upcoming Trips
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
                    View All Bookings
                </Link>

                {/* Account Actions */}
                <div className="card" style={{ padding: "0" }}>
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
                        <span>Help & Support</span>
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
                        <span>Terms of Service</span>
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
                        <span>Privacy Policy</span>
                        <span>→</span>
                    </Link>
                </div>
            </main>

            <BottomNav />
        </>
    );
}
