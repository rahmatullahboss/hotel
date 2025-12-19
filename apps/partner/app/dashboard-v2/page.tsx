import { redirect } from "next/navigation";
import { getPartnerHotel, getDashboardStats, getTodaysCheckIns, getTodaysCheckOuts } from "../actions/dashboard";
import { getPartnerRole } from "../actions/getPartnerRole";
import { auth } from "../../auth";
import Link from "next/link";
import { FiSearch, FiHelpCircle, FiBell, FiChevronDown } from "react-icons/fi";
import {
    OyoSidebar,
    TodayStatus,
    PriceCard,
    PromoBanner,
    PerformanceCharts,
    RankingCard,
    GuestExpCard,
    ImprovementAreas,
    BottomNav,
} from "../components";

export const dynamic = "force-dynamic";

export default async function OyoDashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const hotel = await getPartnerHotel();
    const roleInfo = await getPartnerRole();

    if (!hotel || !roleInfo) {
        redirect("/");
    }

    const [stats, todaysCheckIns, todaysCheckOuts] = await Promise.all([
        getDashboardStats(hotel.id),
        getTodaysCheckIns(hotel.id),
        getTodaysCheckOuts(hotel.id),
    ]);

    // Calculate derived metrics
    const checkInsCompleted = todaysCheckIns.filter((b) => b.status === "CHECKED_IN").length;
    const checkOutsCompleted = todaysCheckOuts.filter((b) => b.status === "CHECKED_OUT").length;
    const roomsInUse = stats.occupiedRooms || 0;
    const totalRooms = stats.totalRooms || 20;
    const eodOccupancy = stats.occupancyRate || 0;

    // Sample data for charts (in production, fetch from server)
    const occupancyData = [
        { date: "1st Dec", value: 75, cityAvg: 50 },
        { date: "8th", value: 82, cityAvg: 55 },
        { date: "16th", value: 68, cityAvg: 48 },
        { date: "24th", value: 90, cityAvg: 60 },
        { date: "28th Dec", value: stats.occupancyRate, cityAvg: 52 },
    ];

    const bookingSources = [
        { source: "Online", count: 44, revenue: 1030 },
        { source: "MMT", count: 26, revenue: 1400 },
        { source: "Walk-in", count: 17, revenue: 1500 },
        { source: "OTA", count: 13, revenue: 2200 },
    ];

    const improvementItems = [
        { type: "ac" as const, roomCount: 10, roomNumbers: "203, 205, 207", issues: ["Low cooling", "No remote"] },
        { type: "wifi" as const, roomCount: 7, roomNumbers: "203, 205, 207", issues: ["Slow speed", "Low range"] },
        { type: "washroom" as const, roomCount: 9, roomNumbers: "203, 205, 207", issues: ["Dirty Washroom"] },
    ];

    return (
        <div className="oyo-layout">
            {/* Desktop Sidebar */}
            <OyoSidebar hotelName={hotel.name} />

            {/* Main Content */}
            <main className="oyo-main">
                {/* Header */}
                <header className="oyo-header">
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Dashboard</h1>

                    <div className="oyo-search">
                        <FiSearch size={16} color="#9ca3af" />
                        <input type="text" placeholder="Search Bookings" />
                    </div>

                    <Link href="/walkin" className="oyo-new-booking-btn">
                        New Booking
                    </Link>

                    <div className="oyo-header-actions">
                        <button className="oyo-header-icon">
                            <FiHelpCircle size={18} />
                        </button>
                        <button className="oyo-header-icon">
                            <FiBell size={18} />
                        </button>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                cursor: "pointer",
                            }}
                        >
                            <div
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    background: "#e63946",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                }}
                            >
                                {session.user.name?.charAt(0) || "U"}
                            </div>
                            <span style={{ fontSize: "0.875rem" }}>Hi, {session.user.name?.split(" ")[0]}</span>
                            <FiChevronDown size={14} />
                        </div>
                    </div>
                </header>

                <div className="oyo-dashboard-grid">
                    {/* Left Column - Main Content */}
                    <div className="oyo-dashboard-main">
                        {/* Top Row: Status + Price */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <TodayStatus
                                checkInsLeft={todaysCheckIns.length - checkInsCompleted}
                                totalCheckIns={todaysCheckIns.length || 12}
                                checkOutsLeft={todaysCheckOuts.length - checkOutsCompleted}
                                totalCheckOuts={todaysCheckOuts.length || 14}
                                roomsInUse={roomsInUse}
                                totalRooms={totalRooms}
                                eodOccupancy={eodOccupancy}
                                roomsLeft={totalRooms - roomsInUse}
                            />

                            <PriceCard
                                hotelId={hotel.id}
                                pricing={{
                                    type: "standard",
                                    singleOccupancy: 749,
                                    doubleOccupancy: 749,
                                    tripleOccupancy: 1200,
                                }}
                            />
                        </div>

                        {/* Promotion Banner */}
                        <PromoBanner />

                        {/* Performance Charts */}
                        <PerformanceCharts
                            occupancyData={occupancyData}
                            occupancyThisMonth={stats.occupancyRate}
                            bookingSources={bookingSources}
                            totalBookings={230}
                            avgARR={stats.averageRoomRate || 1700}
                        />

                        {/* Bottom Row: Rankings */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <RankingCard
                                occupancyRank={1}
                                occupancyChange="up"
                                arrRank="⏳"
                                guestExpRank="⏳"
                            />

                            <GuestExpCard
                                happyPercent={80}
                                unhappyPercent={20}
                                level={4}
                            />
                        </div>

                        {/* Improvement Areas */}
                        <ImprovementAreas items={improvementItems} />
                    </div>

                    {/* Right Sidebar */}
                    <div className="oyo-right-sidebar">
                        {/* Rewards Card */}
                        <div className="oyo-card">
                            <div className="oyo-card-header">
                                <span style={{ color: "#e63946", fontWeight: 600 }}>Incentive</span>
                                <Link href="/earnings" className="oyo-card-link">Details</Link>
                            </div>
                            <div className="oyo-reward-card">
                                <div>
                                    <div className="oyo-reward-label">Rewards last week</div>
                                    <div className="oyo-reward-value">৳{stats.monthlyRevenue ? Math.round(stats.monthlyRevenue / 4) : 1588}</div>
                                    <div style={{ fontSize: "0.625rem", color: "#92400e" }}>Total Earned</div>
                                </div>
                                <div className="oyo-reward-icon">🏆</div>
                            </div>
                        </div>

                        {/* Staff Training */}
                        <div className="oyo-card">
                            <div className="oyo-card-header">
                                <span className="oyo-card-title">Staff Training</span>
                                <Link href="/staff-performance" className="oyo-card-link">Apply</Link>
                            </div>
                            <div className="oyo-card-body">
                                <div
                                    style={{
                                        padding: "1rem",
                                        background: "#f9fafb",
                                        borderRadius: "8px",
                                        fontSize: "0.8125rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>👨‍🏫</span>
                                    Staff training sessions for all partners starts on 20th July
                                </div>
                            </div>
                        </div>

                        {/* Training Modules */}
                        <div className="oyo-card">
                            <div className="oyo-card-header">
                                <span className="oyo-card-title">Your Training Modules</span>
                                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>4/8 done</span>
                            </div>
                            <div className="oyo-card-body">
                                <div
                                    style={{
                                        height: "120px",
                                        background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    🎓 Jump In
                                </div>
                                <div style={{ marginTop: "1rem" }}>
                                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                                        Managing in-house cafeteria
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#3b82f6" }}>
                                        📄 40 slides
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <BottomNav role={roleInfo.role} />
        </div>
    );
}
