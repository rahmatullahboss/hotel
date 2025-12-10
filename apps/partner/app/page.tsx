import { redirect } from "next/navigation";
import { getPartnerHotel, getDashboardStats, getUpcomingBookings } from "./actions/dashboard";
import { BottomNav, ScannerFAB, StatCard } from "./components";
import { auth } from "../auth";

export default async function DashboardPage() {
  const session = await auth();

  // If not logged in, middleware should handle this, but just in case
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const hotel = await getPartnerHotel();

  if (!hotel) {
    // User is logged in but doesn't own a hotel
    return (
      <main style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "var(--color-bg-primary)",
        textAlign: "center"
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          marginBottom: "1.5rem",
          background: "var(--color-bg-secondary)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem"
        }}>
          🏨
        </div>
        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--color-text-primary)"
        }}>
          No Hotel Found
        </h1>
        <p style={{
          color: "var(--color-text-secondary)",
          marginBottom: "2rem",
          maxWidth: "300px",
          lineHeight: 1.6
        }}>
          Your account doesn&apos;t have a hotel registered yet. Please contact an administrator to set up your hotel.
        </p>
        <div style={{
          padding: "1rem",
          background: "var(--color-bg-secondary)",
          borderRadius: "12px",
          fontSize: "0.875rem",
          color: "var(--color-text-secondary)"
        }}>
          Signed in as: <strong style={{ color: "var(--color-text-primary)" }}>{session.user.email}</strong>
        </div>
      </main>
    );
  }

  const [stats, upcomingBookings] = await Promise.all([
    getDashboardStats(hotel.id),
    getUpcomingBookings(hotel.id, 5),
  ]);

  // Calculate rooms available from stats (this is a simplification)
  const roomsAvailable = Math.max(0, 10 - stats.occupancyRate / 10); // Approximate based on occupancy

  return (
    <>
      {/* Header */}
      <header className="page-header">
        <h1 className="page-title">Vibe Manager</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
          {hotel.name}, {hotel.city}
        </p>
      </header>

      <main style={{ padding: "1rem" }}>
        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <StatCard
            value={stats.todayCheckIns}
            label="Today's Check-ins"
          />
          <StatCard
            value={`৳${stats.monthlyRevenue.toLocaleString()}`}
            label="Monthly Revenue"
            trend={stats.monthlyRevenue > 0 ? { value: 12, isPositive: true } : undefined}
          />
          <StatCard
            value={stats.pendingBookings}
            label="Pending Bookings"
          />
          <StatCard
            value={`${stats.occupancyRate}%`}
            label="Occupancy Rate"
          />
        </div>

        {/* Upcoming Bookings */}
        <section>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "var(--color-text-primary)",
            }}
          >
            Upcoming Check-ins
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {upcomingBookings.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                }}
              >
                No upcoming bookings
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="card"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                      {booking.guestName}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                      Room {booking.roomNumber} • {booking.checkIn}
                    </div>
                  </div>
                  <span
                    className={`badge ${booking.status === "CONFIRMED" ? "badge-success" : "badge-warning"
                      }`}
                  >
                    {booking.status === "CONFIRMED" ? "Confirmed" : "Pending"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section style={{ marginTop: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "var(--color-text-primary)",
            }}
          >
            Quick Actions
          </h2>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href="/inventory" className="btn btn-primary">
              Manage Inventory
            </a>
            <a href="/scanner" className="btn btn-outline">
              Check-in Guest
            </a>
          </div>
        </section>
      </main>

      {/* Scanner FAB */}
      <ScannerFAB />

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
