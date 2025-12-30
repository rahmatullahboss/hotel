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
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 lg:p-8 max-w-[1600px] mx-auto bg-gray-50/50">
        
        {/* LEFT COLUMN: Main Dashboard (8/12 columns) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Header & Welcome */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-gray-500 text-sm">Welcome back, here&apos;s your property overview.</p>
            </div>
          </div>

          {/* 2. Key Metrics & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* 3. Quick Actions Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Actions</h3>
            <QuickActionsGrid />
          </div>

          {/* 4. High Priority Alerts */}
          {highRiskBookings.length > 0 && (
            <HighRiskBookings bookings={highRiskBookings} />
          )}

          {/* 5. Revenue & Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Last 7 Days</span>
              </div>
              <RevPARTrend data={occupancyTrendData} />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Booking Sources</h3>
              </div>
              <BookingSourcesPie sources={bookingSources} />
            </div>
          </div>

          {/* 6. Recent Bookings Table (Unified) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
              <Link href="/bookings" className="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
                View All Bookings →
              </Link>
            </div>
            <RecentBookingsTable bookings={unifiedRecentBookings} />
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar Widgets (4/12 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Guest Reviews / Experience */}
          <GuestExpCard
            happyPercent={reviewsSummary.happyPercent}
            unhappyPercent={reviewsSummary.unhappyPercent}
            level={Math.min(5, Math.ceil(reviewsSummary.averageRating))}
          />

          {/* Rewards / Incentives - Gamification Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl shadow-gray-900/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-lg">Partner Rewards</h3>
                    <p className="text-gray-400 text-xs mt-1">Earn bonuses for high occupancy</p>
                </div>
                <span className="text-3xl bg-white/10 p-2 rounded-xl">🏆</span>
              </div>
              <div className="mb-6 space-y-1">
                <div className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Total Earned</div>
                <div className="text-4xl font-bold text-emerald-400 tracking-tight">৳{incentiveStats?.totalEarned?.toLocaleString() || 0}</div>
              </div>
              <Link href="/incentives" className="block w-full text-center bg-white text-gray-900 hover:bg-gray-100 transition-colors py-3 rounded-xl text-sm font-bold shadow-lg">
                View Reward Details
              </Link>
            </div>
          </div>

          {/* Improvement Areas */}
          <ImprovementAreas items={maintenanceIssues} />

          {/* Rankings */}
          <RankingCard
            occupancyRank={null}
            arrRank={null}
            guestExpRank={null}
          />

           {/* Promo Banner */}
          <PromoBanner
            hotelId={hotel.id}
            enabled={activePromotion?.isActive ?? false}
            discount={activePromotion ? Number(activePromotion.value) : 5}
            additionalDiscount={platformPromotion ? Number(platformPromotion.value) : 0}
          />

        </div>
      </div>

      {/* Floating Elements */}
      <RealtimeStatus hotelId={hotel.id} />
    </>
  );
}
