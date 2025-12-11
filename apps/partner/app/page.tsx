import { redirect } from "next/navigation";
import { getPartnerHotel, getDashboardStats, getUpcomingBookings, getTodaysCheckIns, getCurrentlyStaying } from "./actions/dashboard";
import { BottomNav, ScannerFAB, StatCard, LogoutButton, HotelCheckInQR } from "./components";
import { auth } from "../auth";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  // If not logged in, middleware should handle this, but just in case
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const hotel = await getPartnerHotel();
  const userRole = (session.user as { role?: string }).role;

  // State 1: User has no hotel - prompt to register
  if (!hotel) {
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
          width: "100px",
          height: "100px",
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3rem",
          boxShadow: "0 8px 24px rgba(29, 53, 87, 0.2)"
        }}>
          🏨
        </div>
        <h1 style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--color-text-primary)"
        }}>
          Welcome to Vibe Manager
        </h1>
        <p style={{
          color: "var(--color-text-secondary)",
          marginBottom: "2rem",
          maxWidth: "340px",
          lineHeight: 1.6
        }}>
          Register your hotel to start managing bookings, inventory, and earnings all in one place.
        </p>
        <Link href="/register-hotel" className="btn btn-accent" style={{ padding: "1rem 2rem" }}>
          Register Your Hotel
        </Link>
        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "var(--color-bg-secondary)",
          borderRadius: "12px",
          fontSize: "0.875rem",
          color: "var(--color-text-secondary)"
        }}>
          Signed in as: <strong style={{ color: "var(--color-text-primary)" }}>{session.user.email}</strong>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <LogoutButton />
        </div>
      </main>
    );
  }

  // State 2: Hotel is pending approval
  if (hotel.status === "PENDING") {
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
          width: "100px",
          height: "100px",
          marginBottom: "1.5rem",
          background: "rgba(233, 196, 106, 0.15)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3rem"
        }}>
          ⏳
        </div>
        <span className="badge badge-warning" style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
          Pending Approval
        </span>
        <h1 style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--color-text-primary)"
        }}>
          {hotel.name}
        </h1>
        <p style={{
          color: "var(--color-text-secondary)",
          marginBottom: "2rem",
          maxWidth: "360px",
          lineHeight: 1.6
        }}>
          Your hotel registration is being reviewed by our team. This usually takes 24-48 hours. We&apos;ll notify you once approved.
        </p>
        <div className="card" style={{
          padding: "1.25rem",
          maxWidth: "320px",
          width: "100%",
          textAlign: "left"
        }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-text-secondary)" }}>
            What happens next?
          </h3>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontSize: "0.875rem",
            color: "var(--color-text-primary)"
          }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--color-success)" }}>✓</span>
              <span>Registration submitted</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--color-warning)" }}>○</span>
              <span>Admin review in progress</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>○</span>
              <span>Set up rooms & pricing</span>
            </li>
          </ul>
        </div>
        <div style={{
          marginTop: "2rem",
          fontSize: "0.75rem",
          color: "var(--color-text-muted)"
        }}>
          Questions? Contact support@vibehotel.com
        </div>
      </main>
    );
  }

  // State 3: Hotel is suspended
  if (hotel.status === "SUSPENDED") {
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
          width: "100px",
          height: "100px",
          marginBottom: "1.5rem",
          background: "rgba(208, 0, 0, 0.1)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3rem"
        }}>
          ⚠️
        </div>
        <span className="badge badge-error" style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
          Suspended
        </span>
        <h1 style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--color-text-primary)"
        }}>
          {hotel.name}
        </h1>
        <p style={{
          color: "var(--color-text-secondary)",
          marginBottom: "2rem",
          maxWidth: "360px",
          lineHeight: 1.6
        }}>
          Your hotel has been suspended. Please contact support for more information.
        </p>
      </main>
    );
  }

  // State 4: Hotel is ACTIVE - Show full dashboard
  const [stats, upcomingBookings, todaysCheckIns, currentlyStaying] = await Promise.all([
    getDashboardStats(hotel.id),
    getUpcomingBookings(hotel.id, 5),
    getTodaysCheckIns(hotel.id),
    getCurrentlyStaying(hotel.id),
  ]);

  return (
    <>
      {/* Header */}
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Vibe Manager</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            {hotel.name}, {hotel.city}
          </p>
        </div>
        <LogoutButton />
      </header>

      <main style={{ padding: "1rem" }}>
        {/* Stats Grid - Row 1: Revenue & ARR */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <StatCard
            value={`৳${stats.monthlyRevenue.toLocaleString()}`}
            label="Monthly Revenue"
            trend={stats.monthlyRevenue > 0 ? { value: 12, isPositive: true } : undefined}
          />
          <StatCard
            value={`৳${stats.averageRoomRate.toLocaleString()}`}
            label="Avg Room Rate (ARR)"
          />
        </div>

        {/* Stats Grid - Row 2: Check-ins/outs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <StatCard
            value={stats.todayCheckIns}
            label="Today's Check-ins"
          />
          <StatCard
            value={stats.todayCheckOuts}
            label="Today's Check-outs"
          />
        </div>

        {/* Stats Grid - Row 3: Occupancy & Pending */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <StatCard
            value={`${stats.occupancyRate}%`}
            label="Occupancy Rate"
            trend={stats.occupancyRate > 50 ? { value: stats.occupancyRate, isPositive: true } : { value: stats.occupancyRate, isPositive: false }}
          />
          <StatCard
            value={stats.pendingBookings}
            label="Pending Bookings"
          />
        </div>

        {/* Today's Check-ins - Action List */}
        <section style={{ marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "var(--color-text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            📋 Today&apos;s Check-ins
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {todaysCheckIns.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  background: "linear-gradient(135deg, rgba(42, 157, 143, 0.05) 0%, rgba(29, 53, 87, 0.05) 100%)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
                No check-ins scheduled for today
              </div>
            ) : (
              todaysCheckIns.map((booking) => (
                <div
                  key={booking.id}
                  className="card"
                  style={{
                    padding: "1rem",
                    borderLeft: `4px solid ${booking.status === "CHECKED_IN"
                      ? "var(--color-success)"
                      : booking.status === "CONFIRMED"
                        ? "var(--color-primary)"
                        : "var(--color-warning)"
                      }`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                        {booking.guestName}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                        Room {booking.roomNumber}
                      </div>
                    </div>
                    <span
                      className={`badge ${booking.status === "CHECKED_IN"
                        ? "badge-success"
                        : booking.status === "CONFIRMED"
                          ? "badge-primary"
                          : "badge-warning"
                        }`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {booking.status === "CHECKED_IN"
                        ? "✓ Checked In"
                        : booking.status === "CONFIRMED"
                          ? "Ready"
                          : "Pending"}
                    </span>
                  </div>

                  {/* Payment Breakdown */}
                  <div style={{
                    background: "var(--color-bg-secondary)",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "0.75rem",
                    fontSize: "0.875rem"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Total Bill</span>
                      <span style={{ fontWeight: 600 }}>৳{booking.totalAmount.toLocaleString()}</span>
                    </div>
                    {booking.advancePaid > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                        <span style={{ color: "var(--color-success)" }}>✓ Advance Paid</span>
                        <span style={{ color: "var(--color-success)" }}>৳{booking.advancePaid.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.remainingAmount > 0 && booking.paymentStatus !== "PAID" && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderTop: "1px dashed var(--color-border)" }}>
                        <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>💵 Collect</span>
                        <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>৳{booking.remainingAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.paymentStatus === "PAID" && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderTop: "1px dashed var(--color-border)" }}>
                        <span style={{ fontWeight: 600, color: "var(--color-success)" }}>✅ Fully Paid</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {booking.status === "CONFIRMED" && (
                      <a
                        href={`/scanner?bookingId=${booking.id}`}
                        className="btn btn-accent"
                        style={{ fontSize: "0.75rem", padding: "0.5rem 1rem", flex: 1 }}
                      >
                        Check In →
                      </a>
                    )}
                    {booking.status === "CHECKED_IN" && (
                      <a
                        href={`/scanner?bookingId=${booking.id}`}
                        className="btn btn-primary"
                        style={{ fontSize: "0.75rem", padding: "0.5rem 1rem", flex: 1 }}
                      >
                        Check Out →
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Currently Staying - Guests who need to check out */}
        {currentlyStaying.length > 0 && (
          <section style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "var(--color-text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              🏨 Currently Staying ({currentlyStaying.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {currentlyStaying.map((booking) => (
                <div
                  key={booking.id}
                  className="card"
                  style={{
                    padding: "1rem",
                    borderLeft: "4px solid var(--color-success)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                        {booking.guestName}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                        Room {booking.roomNumber} • Check-out: {booking.checkOut}
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: "0.75rem" }}>
                      Staying
                    </span>
                  </div>

                  {/* Payment Status */}
                  <div style={{
                    background: "var(--color-bg-secondary)",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "0.75rem",
                    fontSize: "0.875rem"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Total Bill</span>
                      <span style={{ fontWeight: 600 }}>৳{booking.totalAmount.toLocaleString()}</span>
                    </div>
                    {booking.paymentStatus === "PAID" ? (
                      <div style={{ color: "var(--color-success)", fontWeight: 600, marginTop: "0.25rem" }}>
                        ✅ Fully Paid
                      </div>
                    ) : booking.remainingAmount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem", padding: "0.5rem 0", borderTop: "1px dashed var(--color-border)" }}>
                        <span style={{ fontWeight: 600, color: "var(--color-warning)" }}>⚠️ Due</span>
                        <span style={{ fontWeight: 700, color: "var(--color-warning)" }}>৳{booking.remainingAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <a
                    href={`/scanner?bookingId=${booking.id}`}
                    className="btn btn-primary"
                    style={{ fontSize: "0.875rem", padding: "0.75rem 1rem", width: "100%", textAlign: "center" }}
                  >
                    Check Out →
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

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

        {/* Guest Self Check-in QR */}
        <section style={{ marginTop: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "var(--color-text-primary)",
            }}
          >
            Guest Self Check-in
          </h2>
          <HotelCheckInQR hotelId={hotel.id} hotelName={hotel.name} />
        </section>
      </main>

      {/* Scanner FAB */}
      <ScannerFAB />

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
