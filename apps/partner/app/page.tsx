"use client";

import { BottomNav, ScannerFAB, StatCard } from "./components";

// Mock data - will be replaced with real data from Server Actions
const mockStats = {
  roomsAvailable: 5,
  todayEarnings: "৳12,500",
  upcomingCheckIns: 3,
  occupancyRate: "68%",
};

const mockUpcomingBookings = [
  {
    id: "1",
    guestName: "Mohammad Rahman",
    roomName: "Room 101",
    checkIn: "Today, 2:00 PM",
    status: "CONFIRMED" as const,
  },
  {
    id: "2",
    guestName: "Fatima Akter",
    roomName: "Room 205",
    checkIn: "Today, 4:00 PM",
    status: "CONFIRMED" as const,
  },
  {
    id: "3",
    guestName: "Abdul Karim",
    roomName: "Room 302",
    checkIn: "Tomorrow, 10:00 AM",
    status: "PENDING" as const,
  },
];

export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <header className="page-header">
        <h1 className="page-title">Vibe Manager</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
          Hotel Sunrise, Dhaka
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
            value={mockStats.roomsAvailable}
            label="Rooms Available"
          />
          <StatCard
            value={mockStats.todayEarnings}
            label="Today's Earnings"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            value={mockStats.upcomingCheckIns}
            label="Upcoming Check-ins"
          />
          <StatCard
            value={mockStats.occupancyRate}
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
            {mockUpcomingBookings.map((booking) => (
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
                    {booking.roomName} • {booking.checkIn}
                  </div>
                </div>
                <span
                  className={`badge ${booking.status === "CONFIRMED" ? "badge-success" : "badge-warning"
                    }`}
                >
                  {booking.status === "CONFIRMED" ? "Confirmed" : "Pending"}
                </span>
              </div>
            ))}
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
            <button className="btn btn-outline">Add Walk-in Guest</button>
          </div>
        </section>
      </main>

      {/* Scanner FAB */}
      <ScannerFAB onClick={() => window.location.href = "/scanner"} />

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
