import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSmartphone, FiUsers, FiCalendar, FiDollarSign, FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";
import { MdDirectionsWalk } from "react-icons/md";
import { getPartnerHotel } from "../actions/dashboard";
import { getBookingHistory } from "../actions/bookings-history";
import { BottomNav } from "../components";
import { BookingsExportClient } from "../components/BookingsExportClient";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ status?: string; page?: string }>;
}

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
        marginBottom: "24px",
    } as React.CSSProperties,
    backLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "rgba(255,255,255,0.9)",
        fontSize: "14px",
        fontWeight: "500",
        textDecoration: "none",
        marginBottom: "12px",
    } as React.CSSProperties,
    pageTitle: {
        fontSize: "28px",
        fontWeight: "800",
        color: "white",
        margin: 0,
        marginBottom: "8px",
    } as React.CSSProperties,
    pageSubtitle: {
        color: "rgba(255,255,255,0.8)",
        fontSize: "15px",
        margin: 0,
    } as React.CSSProperties,
    main: {
        padding: "0 16px",
        maxWidth: "800px",
        margin: "0 auto",
    } as React.CSSProperties,
    tabsContainer: {
        display: "flex",
        gap: "10px",
        overflowX: "auto" as const,
        marginBottom: "24px",
        paddingBottom: "8px",
    } as React.CSSProperties,
    tab: {
        padding: "12px 20px",
        borderRadius: "100px",
        fontSize: "14px",
        textDecoration: "none",
        whiteSpace: "nowrap" as const,
        fontWeight: "600",
        transition: "all 0.2s ease",
        border: "none",
    } as React.CSSProperties,
    tabActive: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    } as React.CSSProperties,
    tabInactive: {
        background: "white",
        color: "#64748b",
        border: "2px solid #e5e7eb",
    } as React.CSSProperties,
    bookingCard: {
        padding: "20px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f0f0f0",
        marginBottom: "16px",
        borderLeft: "5px solid",
        transition: "all 0.2s ease",
    } as React.CSSProperties,
    emptyState: {
        padding: "60px 24px",
        textAlign: "center" as const,
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    } as React.CSSProperties,
    statusBadge: {
        padding: "6px 14px",
        borderRadius: "100px",
        fontSize: "12px",
        fontWeight: "700",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
    } as React.CSSProperties,
    paginationBtn: {
        padding: "12px 20px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "600",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s ease",
    } as React.CSSProperties,
};

export default async function BookingsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const hotel = await getPartnerHotel();

    if (!hotel) {
        redirect("/auth/signin");
    }

    const currentStatus = params.status || "ALL";
    const currentPage = parseInt(params.page || "1", 10);

    const { bookings, total, pages } = await getBookingHistory(
        { status: currentStatus === "ALL" ? undefined : currentStatus },
        currentPage,
        15
    );

    const statusTabs = [
        { value: "ALL", label: "All", icon: "📋" },
        { value: "CONFIRMED", label: "Confirmed", icon: "✅" },
        { value: "CHECKED_IN", label: "Staying", icon: "🏨" },
        { value: "CHECKED_OUT", label: "Completed", icon: "✔️" },
        { value: "CANCELLED", label: "Cancelled", icon: "❌" },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "#667eea";
            case "CHECKED_IN": return "#10b981";
            case "CHECKED_OUT": return "#6b7280";
            case "CANCELLED": return "#ef4444";
            default: return "#f59e0b";
        }
    };

    const getStatusGradient = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)";
            case "CHECKED_IN": return "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)";
            case "CHECKED_OUT": return "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)";
            case "CANCELLED": return "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
            default: return "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "Confirmed";
            case "CHECKED_IN": return "Staying";
            case "CHECKED_OUT": return "Completed";
            case "CANCELLED": return "Cancelled";
            default: return "Pending";
        }
    };

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ 
                    maxWidth: "800px", 
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start"
                }}>
                    <div>
                        <Link href="/" style={styles.backLink}>
                            <FiArrowLeft size={18} />
                            Back to Dashboard
                        </Link>
                        <h1 style={styles.pageTitle}>Booking History</h1>
                        <p style={styles.pageSubtitle}>
                            <FiCalendar style={{ marginRight: "6px", verticalAlign: "middle" }} />
                            {total} total bookings
                        </p>
                    </div>
                    <div style={{ marginTop: "30px" }}>
                        <BookingsExportClient
                            bookings={bookings.map((b) => ({
                                id: b.id,
                                guestName: b.guestName,
                                guestPhone: b.guestPhone,
                                roomNumber: b.roomNumber,
                                roomName: b.roomName || b.roomNumber,
                                checkIn: b.checkIn,
                                checkOut: b.checkOut,
                                status: b.status,
                                totalAmount: b.totalAmount,
                                paymentStatus: b.paymentStatus,
                                bookingSource: b.bookingSource,
                            }))}
                            hotelName={hotel.name}
                            dateRange={{
                                startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]!,
                                endDate: new Date().toISOString().split("T")[0]!,
                            }}
                        />
                    </div>
                </div>
            </header>

            <main style={styles.main}>
                {/* Status Filter Tabs */}
                <div style={styles.tabsContainer}>
                    {statusTabs.map((tab) => (
                        <Link
                            key={tab.value}
                            href={`/bookings?status=${tab.value}`}
                            style={{
                                ...styles.tab,
                                ...(currentStatus === tab.value ? styles.tabActive : styles.tabInactive),
                            }}
                        >
                            <span style={{ marginRight: "6px" }}>{tab.icon}</span>
                            {tab.label}
                        </Link>
                    ))}
                </div>

                {/* Bookings List */}
                <div>
                    {bookings.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                            }}>
                                <FiInbox size={36} color="#667eea" />
                            </div>
                            <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>
                                No bookings found
                            </div>
                            <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                Try selecting a different filter
                            </div>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div
                                key={booking.id}
                                style={{
                                    ...styles.bookingCard,
                                    borderLeftColor: getStatusColor(booking.status),
                                }}
                            >
                                {/* Header Row */}
                                <div style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    alignItems: "flex-start",
                                    marginBottom: "16px" 
                                }}>
                                    <div>
                                        <div style={{ 
                                            fontWeight: "700", 
                                            fontSize: "17px", 
                                            color: "#1a1a2e",
                                            marginBottom: "4px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                        }}>
                                            <FiUsers size={16} />
                                            {booking.guestName}
                                        </div>
                                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                            {booking.guestPhone}
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            background: getStatusGradient(booking.status),
                                            color: getStatusColor(booking.status),
                                        }}
                                    >
                                        {getStatusLabel(booking.status)}
                                    </span>
                                </div>

                                {/* Room & Dates */}
                                <div style={{ 
                                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                                    borderRadius: "12px",
                                    padding: "14px 16px",
                                    marginBottom: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px"
                                }}>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "10px",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontWeight: "700",
                                        fontSize: "14px"
                                    }}>
                                        {booking.roomNumber}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "600", color: "#1a1a2e", fontSize: "14px" }}>
                                            Room {booking.roomNumber}
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <FiCalendar size={12} />
                                            {booking.checkIn} → {booking.checkOut}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Row */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ 
                                        fontSize: "13px", 
                                        color: "#6b7280",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "6px 12px",
                                        background: booking.bookingSource === "WALK_IN" 
                                            ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                                            : "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                        color: booking.bookingSource === "WALK_IN" ? "#92400e" : "#1e40af"
                                    }}>
                                        {booking.bookingSource === "WALK_IN" 
                                            ? <><MdDirectionsWalk size={16} /> Walk-in</> 
                                            : <><FiSmartphone size={14} /> Platform</>
                                        }
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ 
                                            fontWeight: "800", 
                                            fontSize: "18px",
                                            color: "#1a1a2e",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px"
                                        }}>
                                            <FiDollarSign size={16} />
                                            ৳{booking.totalAmount.toLocaleString()}
                                        </div>
                                        {booking.advancePaid > 0 && (
                                            <div style={{ 
                                                fontSize: "12px", 
                                                color: "#10b981",
                                                fontWeight: "600"
                                            }}>
                                                Advance: ৳{booking.advancePaid.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "16px",
                            marginTop: "32px",
                        }}
                    >
                        {currentPage > 1 && (
                            <Link
                                href={`/bookings?status=${currentStatus}&page=${currentPage - 1}`}
                                style={{
                                    ...styles.paginationBtn,
                                    background: "white",
                                    color: "#667eea",
                                    border: "2px solid #667eea",
                                }}
                            >
                                <FiChevronLeft size={18} />
                                Previous
                            </Link>
                        )}
                        <span style={{ 
                            padding: "12px 20px", 
                            color: "#6b7280",
                            fontWeight: "600",
                            background: "white",
                            borderRadius: "12px",
                        }}>
                            Page {currentPage} of {pages}
                        </span>
                        {currentPage < pages && (
                            <Link
                                href={`/bookings?status=${currentStatus}&page=${currentPage + 1}`}
                                style={{
                                    ...styles.paginationBtn,
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                                }}
                            >
                                Next
                                <FiChevronRight size={18} />
                            </Link>
                        )}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
