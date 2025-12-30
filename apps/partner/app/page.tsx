import { redirect } from "next/navigation";
import { getPartnerHotel, getDashboardStats, getUpcomingBookings, getTodaysCheckIns, getCurrentlyStaying, getTodaysCheckOuts, getAllPartnerHotels, getOccupancyHistory, getBookingSources, getMaintenanceIssues, getGuestReviewsSummary, getTodaysPricing, getActivePromotion, getPlatformPromotion } from "./actions/dashboard";
import { getPartnerRole } from "./actions/getPartnerRole";
import {
  ScannerFAB,
  LogoutButton,
  HotelCheckInQR,
  CollectPaymentButton,
  CheckOutButton,
  ExtendStayButton,
  NoShowButton,
  HighRiskBookings,
  TodayStatus,
  PriceCard,
  PromoBanner,
  PerformanceCharts,
  RankingCard,
  GuestExpCard,
  ImprovementAreas,
} from "./components";
import { auth } from "../auth";
import { getHighRiskBookings } from "./actions/prediction";
import Link from "next/link";
import { getIncentiveStats } from "./actions/incentives";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  // If not logged in, middleware should handle this, but just in case
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const hotel = await getPartnerHotel();

  // State 1: User has no hotel - prompt to register
  if (!hotel) {
    return (
      <main className="main-centered">
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
          Welcome to ZinuRooms Manager
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
      <main className="main-centered">
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
          Your hotel registration is being reviewed by our team. This usually takes 24-48 hours.
        </p>
      </main>
    );
  }

  // State 3: Hotel is suspended
  if (hotel.status === "SUSPENDED") {
    return (
      <main className="main-centered">
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
          Your hotel has been suspended. Please contact support.
        </p>
      </main>
    );
  }

  // Get partner role for RBAC (reserved for future feature gating)
  const roleInfo = await getPartnerRole();
  const _currentRole = roleInfo?.role ?? "RECEPTIONIST";

  // State 4: Hotel is ACTIVE - Show full dashboard
  const [stats, upcomingBookings, todaysCheckIns, currentlyStaying, todaysCheckOuts, _allPartnerHotels, highRiskBookings, occupancyHistory, bookingSourcesData, maintenanceIssues, reviewsSummary, todaysPricing, activePromotion, platformPromotion, incentiveStats] = await Promise.all([
    getDashboardStats(hotel.id),
    getUpcomingBookings(hotel.id, 5),
    getTodaysCheckIns(hotel.id),
    getCurrentlyStaying(hotel.id),
    getTodaysCheckOuts(hotel.id),
    getAllPartnerHotels(),
    getHighRiskBookings({ minRiskScore: 30, limit: 5 }),
    getOccupancyHistory(hotel.id),
    getBookingSources(hotel.id),
    getMaintenanceIssues(hotel.id),
    getGuestReviewsSummary(hotel.id),
    getTodaysPricing(hotel.id),
    getActivePromotion(hotel.id),
    getPlatformPromotion(),
    getIncentiveStats(),
  ]);

  // Calculate derived metrics
  const checkInsCompleted = todaysCheckIns.filter((b) => b.status === "CHECKED_IN").length;
  const checkOutsCompleted = todaysCheckOuts.filter((b) => b.status === "CHECKED_OUT").length;
  const roomsInUse = stats.occupiedRooms || 0;
  const totalRooms = stats.totalRooms || 20;
  const eodOccupancy = stats.occupancyRate || 0;

  // Use real data or fallback to defaults
  const occupancyData = occupancyHistory.length > 0 ? occupancyHistory : [
    { date: "1st", value: 0, cityAvg: 50 },
    { date: "8th", value: 0, cityAvg: 55 },
    { date: "16th", value: 0, cityAvg: 48 },
    { date: "24th", value: 0, cityAvg: 60 },
    { date: "Today", value: stats.occupancyRate, cityAvg: 52 },
  ];

  const bookingSources = bookingSourcesData.length > 0 ? bookingSourcesData : [
    { source: "Platform", count: 0, revenue: 0 },
    { source: "Walk-in", count: 0, revenue: 0 },
  ];

  const improvementItems = maintenanceIssues.length > 0 ? maintenanceIssues : [];

  return (
    <>
      {/* Main Dashboard Content - layout shell provided by layout.tsx */}
      <div className="oyo-dashboard-grid">
        {/* Left Column - Main Content */}
        <div className="oyo-dashboard-main">
          {/* Top Row: Status + Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <TodayStatus
              checkInsLeft={todaysCheckIns.length - checkInsCompleted}
              totalCheckIns={todaysCheckIns.length || stats.todayCheckIns}
              checkOutsLeft={todaysCheckOuts.length - checkOutsCompleted}
              totalCheckOuts={todaysCheckOuts.length || stats.todayCheckOuts}
              roomsInUse={roomsInUse}
              totalRooms={totalRooms}
              eodOccupancy={eodOccupancy}
              roomsLeft={totalRooms - roomsInUse}
            />

            <PriceCard
              hotelId={hotel.id}
              rooms={todaysPricing}
              promotionPercent={activePromotion?.isActive ? Number(activePromotion.value) : 0}
            />
          </div>

          {/* Promotion Banner */}
          <PromoBanner
            hotelId={hotel.id}
            enabled={activePromotion?.isActive ?? false}
            discount={activePromotion ? Number(activePromotion.value) : 5}
            additionalDiscount={platformPromotion ? Number(platformPromotion.value) : 0}
          />

          {/* High-Risk Bookings Alert */}
          {highRiskBookings.length > 0 && (
            <HighRiskBookings bookings={highRiskBookings} />
          )}

          {/* Today's Check-ins - Action List */}
          <section className="oyo-card">
            <div className="oyo-card-header">
              <h2 className="oyo-card-title">📋 Today&apos;s Check-ins ({todaysCheckIns.length})</h2>
              <Link href="/bookings" className="oyo-card-link">View All</Link>
            </div>
            <div className="oyo-card-body" style={{ padding: "0" }}>
              {todaysCheckIns.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
                  ✓ No check-ins scheduled for today
                </div>
              ) : (
                todaysCheckIns.slice(0, 5).map((booking) => {
                  const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div
                      key={booking.id}
                      style={{
                        padding: "1rem 1.25rem",
                        borderBottom: "1px solid #f3f4f6",
                        borderLeft: `4px solid ${booking.status === "CHECKED_IN" ? "#10b981" : booking.status === "CONFIRMED" ? "#3b82f6" : "#f59e0b"}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{booking.guestName}</div>
                          <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                            🚪 {booking.roomNumber} • 🌙 {nights} nights • 📞 {booking.guestPhone}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            background: booking.status === "CHECKED_IN" ? "#dcfce7" : booking.status === "CONFIRMED" ? "#dbeafe" : "#fef3c7",
                            color: booking.status === "CHECKED_IN" ? "#166534" : booking.status === "CONFIRMED" ? "#1e40af" : "#92400e",
                          }}
                        >
                          {booking.status === "CHECKED_IN" ? "✓ Checked In" : booking.status === "CONFIRMED" ? "Ready" : "Pending"}
                        </span>
                      </div>

                      {/* Payment & Actions */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                        <div style={{ fontSize: "0.875rem" }}>
                          <span style={{ fontWeight: 600 }}>৳{booking.totalAmount.toLocaleString()}</span>
                          {booking.advancePaid > 0 && (
                            <span style={{ color: "#10b981", marginLeft: "0.5rem" }}>
                              (৳{booking.advancePaid.toLocaleString()} paid)
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {booking.status === "CONFIRMED" && booking.remainingAmount > 0 && booking.paymentStatus !== "PAID" && (
                            <CollectPaymentButton
                              bookingId={booking.id}
                              hotelId={hotel.id}
                              remainingAmount={booking.remainingAmount}
                            />
                          )}
                          {booking.status === "CONFIRMED" && (
                            <>
                              <NoShowButton
                                bookingId={booking.id}
                                hotelId={hotel.id}
                                guestName={booking.guestName}
                                guestPhone={booking.guestPhone}
                                advancePaid={booking.advancePaid}
                              />
                              <a
                                href={`/scanner?bookingId=${booking.id}`}
                                style={{
                                  fontSize: "0.75rem",
                                  padding: "0.375rem 0.75rem",
                                  background: "#e63946",
                                  color: "white",
                                  borderRadius: "6px",
                                  textDecoration: "none",
                                }}
                              >
                                Check In →
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Today's Checkouts */}
          {todaysCheckOuts.length > 0 && (
            <section className="oyo-card">
              <div className="oyo-card-header">
                <h2 className="oyo-card-title">🚪 Today&apos;s Check-outs ({todaysCheckOuts.length})</h2>
              </div>
              <div className="oyo-card-body" style={{ padding: "0" }}>
                {todaysCheckOuts.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      padding: "1rem 1.25rem",
                      borderBottom: "1px solid #f3f4f6",
                      borderLeft: "4px solid #f59e0b",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{booking.guestName}</div>
                        <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                          Room {booking.roomNumber} • 📞 {booking.guestPhone}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "4px", background: "#fef3c7", color: "#92400e" }}>
                        Due Today
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                      <div style={{ fontSize: "0.875rem" }}>
                        {booking.paymentStatus === "PAID" ? (
                          <span style={{ color: "#10b981" }}>✅ Fully Paid</span>
                        ) : (
                          <span style={{ color: "#f59e0b" }}>⚠️ ৳{booking.remainingAmount.toLocaleString()} due</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {booking.paymentStatus !== "PAID" && booking.remainingAmount > 0 && (
                          <CollectPaymentButton
                            bookingId={booking.id}
                            hotelId={hotel.id}
                            remainingAmount={booking.remainingAmount}
                          />
                        )}
                        <ExtendStayButton
                          bookingId={booking.id}
                          hotelId={hotel.id}
                          guestName={booking.guestName}
                          pricePerNight={Math.round(booking.totalAmount / ((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)))}
                        />
                        <CheckOutButton
                          bookingId={booking.id}
                          hotelId={hotel.id}
                          guestName={booking.guestName}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Currently Staying */}
          {currentlyStaying.length > 0 && (
            <section className="oyo-card">
              <div className="oyo-card-header">
                <h2 className="oyo-card-title">🏨 Currently Staying ({currentlyStaying.length})</h2>
              </div>
              <div className="oyo-card-body" style={{ padding: "0" }}>
                {currentlyStaying.slice(0, 5).map((booking) => {
                  const checkOutDate = new Date(booking.checkOut);
                  const today = new Date();
                  const daysRemaining = Math.ceil((checkOutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={booking.id}
                      style={{
                        padding: "1rem 1.25rem",
                        borderBottom: "1px solid #f3f4f6",
                        borderLeft: `4px solid ${daysRemaining <= 0 ? "#f59e0b" : "#10b981"}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{booking.guestName}</div>
                          <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                            🚪 {booking.roomNumber} • 📞 {booking.guestPhone}
                          </div>
                        </div>
                        <span style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          background: daysRemaining <= 0 ? "#fef3c7" : "#dcfce7",
                          color: daysRemaining <= 0 ? "#92400e" : "#166534",
                        }}>
                          {daysRemaining <= 0 ? "⚠️ Checkout Due" : `${daysRemaining} days left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Performance Charts */}
          <PerformanceCharts
            occupancyData={occupancyData as { date: string; value: number; cityAvg: number }[]}
            occupancyThisMonth={stats.occupancyRate}
            bookingSources={bookingSources}
            totalBookings={bookingSources.reduce((sum: number, s: { count: number }) => sum + s.count, 0)}
            avgARR={stats.averageRoomRate || 1700}
          />

          {/* Bottom Row: Rankings */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <RankingCard
              occupancyRank={null}
              arrRank={null}
              guestExpRank={null}
            />
            <GuestExpCard
              happyPercent={reviewsSummary.happyPercent}
              unhappyPercent={reviewsSummary.unhappyPercent}
              level={Math.min(5, Math.ceil(reviewsSummary.averageRating))}
            />
          </div>

          {/* Improvement Areas */}
          <ImprovementAreas items={improvementItems} />

          {/* Guest Self Check-in QR */}
          <section className="oyo-card">
            <div className="oyo-card-header">
              <h2 className="oyo-card-title">📱 Guest Self-Service</h2>
            </div>
            <div className="oyo-card-body">
              <HotelCheckInQR hotelId={hotel.id} hotelName={hotel.name} />
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="oyo-right-sidebar">
          {/* Rewards Card */}
          <div className="oyo-card">
            <div className="oyo-card-header">
              <span style={{ color: "#e63946", fontWeight: 600 }}>Incentive</span>
              <Link href="/incentives" className="oyo-card-link">Details</Link>
            </div>
            <div className="oyo-reward-card">
              <div>
                <div className="oyo-reward-label">Total Earned</div>
                <div className="oyo-reward-value">৳{incentiveStats?.totalEarned?.toLocaleString() || 0}</div>
                <div style={{ fontSize: "0.625rem", color: "#92400e" }}>
                  {incentiveStats?.active || 0} active • {incentiveStats?.completed || 0} completed
                </div>
              </div>
              <div className="oyo-reward-icon">🏆</div>
            </div>
          </div>

          {/* Staff Training - Coming Soon */}
          <div className="oyo-card">
            <div className="oyo-card-header">
              <span className="oyo-card-title">🎓 Training</span>
              <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Coming Soon</span>
            </div>
            <div className="oyo-card-body">
              <div style={{
                padding: "2rem 1rem",
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                borderRadius: "8px",
                textAlign: "center",
              }}>
                <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.75rem" }}>👨‍🏫</span>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>
                  Staff Training Modules
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  Training courses will be available soon
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="oyo-card">
            <div className="oyo-card-header">
              <span className="oyo-card-title">📅 Upcoming</span>
              <Link href="/bookings" className="oyo-card-link">View All</Link>
            </div>
            <div className="oyo-card-body" style={{ padding: "0" }}>
              {upcomingBookings.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "#9ca3af" }}>
                  No upcoming bookings
                </div>
              ) : (
                upcomingBookings.slice(0, 3).map((booking) => {
                  const checkInDate = new Date(booking.checkIn);
                  const today = new Date();
                  const daysUntil = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={booking.id}
                      style={{
                        padding: "0.75rem 1.25rem",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{booking.guestName}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            Room {booking.roomNumber} • {booking.checkIn}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.625rem", color: "#9ca3af" }}>
                          {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scanner FAB */}
      <ScannerFAB />
    </>
  );
}
