import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { 
  getPartnerHotel, 
  getDashboardStats, 
  getUpcomingBookings, 
  getTodaysCheckIns, 
  getCurrentlyStaying, 
  getTodaysCheckOuts, 
  getAllPartnerHotels, 
  getOccupancyHistory, 
  getBookingSources, 
  getMaintenanceIssues, 
  getGuestReviewsSummary, 
  getTodaysPricing, 
  getActivePromotion, 
  getPlatformPromotion 
} from "./actions/dashboard";
import {
  LogoutButton,
  TodayStatus,
  PriceCard,
  PromoBanner,
  HighRiskBookings,
  RealtimeStatus,
  RecentBookingsTable,
  QuickActionsGrid,
  RevPARTrend,
  BookingSourcesPie,
  ImprovementAreas,
  GuestExpCard,
  RankingCard,
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

  const _t = await getTranslations("dashboard");
  const hotel = await getPartnerHotel();

  // State 1: User has no hotel - prompt to register
  if (!hotel) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-24 h-24 mb-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-4xl shadow-xl shadow-primary/20 text-white">
          🏨
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to ZinuRooms Manager
        </h1>
        <p className="text-gray-500 mb-8 max-w-md text-lg leading-relaxed">
          Register your hotel to start managing bookings, inventory, and earnings all in one place.
        </p>
        <Link 
          href="/register-hotel" 
          className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-accent/30 transition-all hover:scale-105"
        >
          Register Your Hotel
        </Link>
        <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-sm text-gray-500">
          Signed in as: <strong className="text-gray-900">{session.user.email}</strong>
        </div>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </main>
    );
  }

  // State 2: Hotel is pending approval
  if (hotel.status === "PENDING") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-24 h-24 mb-6 bg-yellow-100 rounded-full flex items-center justify-center text-4xl">
          ⏳
        </div>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
          Pending Approval
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {hotel.name}
        </h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Your hotel registration is being reviewed by our team. This usually takes 24-48 hours.
        </p>
      </main>
    );
  }

  // State 3: Hotel is suspended
  if (hotel.status === "SUSPENDED") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-24 h-24 mb-6 bg-red-100 rounded-full flex items-center justify-center text-4xl">
          ⚠️
        </div>
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
          Suspended
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {hotel.name}
        </h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Your hotel has been suspended. Please contact support immediately.
        </p>
      </main>
    );
  }

  // State 4: Hotel is ACTIVE - Show full dashboard
  const [
    stats, 
    upcomingBookings, 
    todaysCheckIns, 
    _currentlyStaying, 
    todaysCheckOuts, 
    _allPartnerHotels, 
    highRiskBookings, 
    occupancyHistory, 
    bookingSourcesData, 
    maintenanceIssues, 
    reviewsSummary, 
    todaysPricing, 
    activePromotion, 
    platformPromotion, 
    incentiveStats
  ] = await Promise.all([
    getDashboardStats(hotel.id),
    getUpcomingBookings(hotel.id, 10),
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

  // Derived Metrics
  const checkInsCompleted = todaysCheckIns.filter((b) => b.status === "CHECKED_IN").length;
  const checkOutsCompleted = todaysCheckOuts.filter((b) => b.status === "CHECKED_OUT").length;
  const roomsInUse = stats.occupiedRooms || 0;
  const totalRooms = stats.totalRooms || 20;
  const eodOccupancy = stats.occupancyRate || 0;

  // Combining bookings for the Unified Table
  // We'll prioritize Today's Checkins, then Checkouts, then Upcoming
  const unifiedRecentBookings = [
    ...todaysCheckIns.map(b => ({ ...b, status: b.status === 'CHECKED_IN' ? 'CHECKED_IN' : 'CONFIRMED' })),
    ...todaysCheckOuts,
    ...upcomingBookings
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Remove duplicates
   .slice(0, 10); // Limit to 10

  const occupancyTrendData = occupancyHistory.length > 0 
    ? occupancyHistory.map(h => ({ date: String(h?.date ?? ''), revpar: (h?.value ?? 0) * 20, adr: 1500 }))
    : [
        { date: "Mon", revpar: 1200, adr: 1500 },
        { date: "Tue", revpar: 1400, adr: 1600 },
        { date: "Wed", revpar: 1100, adr: 1450 },
        { date: "Thu", revpar: 1600, adr: 1700 },
        { date: "Fri", revpar: 2200, adr: 1900 },
        { date: "Sat", revpar: 2400, adr: 2000 },
        { date: "Sun", revpar: 1800, adr: 1600 },
      ];

  const bookingSources = bookingSourcesData.length > 0 ? bookingSourcesData : [
    { source: "Platform", count: 12, revenue: 24000 },
    { source: "Walk-in", count: 5, revenue: 8500 },
    { source: "OTA", count: 3, revenue: 4200 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
          <div>
             <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              Welcome back, here&apos;s your property overview.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'white', borderRadius: '9999px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}/>
                Live Updates On
             </div>
             <RealtimeStatus hotelId={hotel.id} />
          </div>
        </div>

        {/* COMPACT DASHBOARD LAYOUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* ROW 1: Key Metrics (3 cards) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* Today's Status */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
            }}>
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
            </div>

            {/* Price Card */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
            }}>
              <PriceCard
                hotelId={hotel.id}
                rooms={todaysPricing.slice(0, 4)}
                promotionPercent={activePromotion?.isActive ? Number(activePromotion.value) : 0}
              />
            </div>

            {/* Revenue Trend */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                   <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Revenue Trend</h3>
                   <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Last 7 Days</p>
                </div>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '12px', height: '12px' }}>
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <RevPARTrend data={occupancyTrendData} />
            </div>
          </div>

          {/* ROW 2: Promo + Guest Experience */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <PromoBanner
              hotelId={hotel.id}
              enabled={activePromotion?.isActive ?? false}
              discount={activePromotion ? Number(activePromotion.value) : 5}
              additionalDiscount={platformPromotion ? Number(platformPromotion.value) : 0}
            />
            <GuestExpCard
              happyPercent={reviewsSummary.happyPercent}
              unhappyPercent={reviewsSummary.unhappyPercent}
              level={Math.min(5, Math.ceil(reviewsSummary.averageRating))}
            />
          </div>

          {/* ROW 3: Quick Actions + Booking Sources + Rewards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {/* Quick Actions */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
            }}>
              <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>Quick Actions</h3>
              <QuickActionsGrid />
            </div>

            {/* Booking Sources */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 12px 0' }}>Booking Sources</h3>
              <BookingSourcesPie sources={bookingSources} />
            </div>

            {/* Partner Rewards */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderRadius: '16px',
                padding: '16px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Partner Rewards</h3>
                    <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0 0' }}>Earn bonuses for high occupancy</p>
                  </div>
                  <span style={{ fontSize: '20px' }}>🏆</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Total Earned</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#34d399' }}>৳{incentiveStats?.totalEarned?.toLocaleString() || 0}</div>
                </div>
                <Link href="/incentives" style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* ROW 4: Recent Bookings */}
          <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                 <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Recent Bookings</h3>
                 <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Latest check-ins and check-outs</p>
              </div>
              <Link href="/bookings" style={{
                  fontSize: '13px',
                  color: '#2563eb',
                  fontWeight: '600',
                  textDecoration: 'none'
              }}>
                View All →
              </Link>
            </div>
            <RecentBookingsTable bookings={unifiedRecentBookings} />
          </div>

          {/* Alerts */}
          {highRiskBookings.length > 0 && (
            <HighRiskBookings bookings={highRiskBookings} />
          )}

          <ImprovementAreas items={maintenanceIssues} />

        </div>
      </div>
    </div>
  );
}
