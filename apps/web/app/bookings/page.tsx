"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getUserBookings } from "../actions/bookings";
import { BottomNav, BookingQRCode, CancelBookingModal } from "../components";

type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "PAY_AT_HOTEL" | "REFUNDED";

interface Booking {
    id: string;
    hotelName: string | null;
    hotelLocation: string | null;
    hotelImage: string | null;
    roomName: string | null;
    checkIn: string;
    checkOut: string;
    status: BookingStatus;
    totalAmount: string;
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    bookingFee?: string;
    bookingFeeStatus?: string;
}

const statusConfig: Record<BookingStatus, { labelKey: string; className: string; icon: string }> = {
    PENDING: { labelKey: "pendingPayment", className: "badge-warning", icon: "⏳" },
    CONFIRMED: { labelKey: "confirmed", className: "badge-success", icon: "✅" },
    CHECKED_IN: { labelKey: "checkedIn", className: "badge-success", icon: "🏨" },
    CHECKED_OUT: { labelKey: "completed", className: "", icon: "✓" },
    CANCELLED: { labelKey: "cancelled", className: "badge-error", icon: "❌" },
};

const paymentStatusConfig: Record<PaymentStatus, { labelKey: string; color: string }> = {
    PENDING: { labelKey: "paymentPending", color: "var(--color-warning)" },
    PAID: { labelKey: "fullyPaid", color: "var(--color-success)" },
    PAY_AT_HOTEL: { labelKey: "payAtHotel", color: "var(--color-primary)" },
    REFUNDED: { labelKey: "refunded", color: "var(--color-text-secondary)" },
};

type TabType = "upcoming" | "past";

export default function BookingsPage() {
    const { data: session } = useSession();
    const t = useTranslations("bookings");
    const tCommon = useTranslations("common");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("upcoming");
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

    useEffect(() => {
        fetchBookings();
    }, [session?.user?.id]);

    async function fetchBookings() {
        if (!session?.user?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const data = await getUserBookings(session.user.id);
        setBookings(data as Booking[]);
        setLoading(false);
    }

    const upcomingBookings = bookings.filter(
        (b) => b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "CHECKED_IN"
    );
    const pastBookings = bookings.filter(
        (b) => b.status === "CHECKED_OUT" || b.status === "CANCELLED"
    );

    const displayedBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-BD", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const getDaysUntilCheckIn = (checkIn: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkInDate = new Date(checkIn);
        checkInDate.setHours(0, 0, 0, 0);
        const diffTime = checkInDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (!session) {
        return (
            <>
                <header className="bookings-header">
                    <h1>{t("title")}</h1>
                </header>
                <main className="page-content">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔒</div>
                        <h2>{tCommon("signInRequired")}</h2>
                        <p>{tCommon("signInToBook")}</p>
                        <Link href="/auth/signin" className="btn btn-primary">
                            {tCommon("signInToContinue")}
                        </Link>
                    </div>
                </main>
                <BottomNav />
            </>
        );
    }

    if (loading) {
        return (
            <>
                <header className="bookings-header">
                    <h1>{t("title")}</h1>
                </header>
                <main className="page-content" style={{ textAlign: "center" }}>
                    <div style={{ padding: "3rem" }}>
                        <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
                        <p style={{ marginTop: "1rem", color: "var(--color-text-secondary)" }}>
                            {tCommon("loading")}
                        </p>
                    </div>
                </main>
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <style jsx>{`
                .bookings-header {
                    padding: 1rem;
                    background: linear-gradient(135deg, var(--color-primary), #c1121f);
                    color: white;
                }
                .bookings-header h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0;
                }
                .bookings-tabs {
                    display: flex;
                    background: white;
                    border-bottom: 1px solid var(--color-border);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .tab-btn {
                    flex: 1;
                    padding: 1rem;
                    border: none;
                    background: transparent;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                }
                .tab-btn.active {
                    color: var(--color-primary);
                }
                .tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--color-primary);
                    border-radius: 3px 3px 0 0;
                }
                .tab-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    margin-left: 0.5rem;
                    padding: 0 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    background: var(--color-bg-tertiary);
                    border-radius: 10px;
                }
                .tab-btn.active .tab-count {
                    background: var(--color-primary);
                    color: white;
                }
                .booking-card {
                    background: white;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                    margin-bottom: 1rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .booking-card:active {
                    transform: scale(0.98);
                }
                .booking-image {
                    position: relative;
                    height: 140px;
                    overflow: hidden;
                }
                .booking-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .booking-status-overlay {
                    position: absolute;
                    top: 0.75rem;
                    left: 0.75rem;
                    display: flex;
                    gap: 0.5rem;
                }
                .days-badge {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .booking-content {
                    padding: 1rem;
                }
                .booking-hotel-name {
                    font-size: 1.125rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                    color: var(--color-text-primary);
                }
                .booking-room {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.75rem;
                }
                .booking-dates {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: var(--color-bg-secondary);
                    border-radius: 0.5rem;
                    margin-bottom: 0.75rem;
                }
                .date-block {
                    flex: 1;
                    text-align: center;
                }
                .date-label {
                    font-size: 0.625rem;
                    text-transform: uppercase;
                    color: var(--color-text-secondary);
                    letter-spacing: 0.5px;
                }
                .date-value {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--color-text-primary);
                }
                .date-arrow {
                    color: var(--color-text-secondary);
                }
                .booking-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 0.75rem;
                    border-top: 1px solid var(--color-border);
                }
                .booking-id {
                    font-size: 0.75rem;
                    color: var(--color-text-secondary);
                }
                .booking-id span {
                    font-weight: 600;
                    color: var(--color-text-primary);
                    font-family: monospace;
                }
                .booking-price {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--color-primary);
                }
                .booking-actions {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: var(--color-bg-secondary);
                    border-top: 1px solid var(--color-border);
                }
                .booking-actions button {
                    flex: 1;
                }
                .payment-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8125rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    margin-bottom: 0.75rem;
                }
                .empty-state {
                    text-align: center;
                    padding: 3rem 1.5rem;
                }
                .empty-state-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                .empty-state h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--color-text-primary);
                }
                .empty-state p {
                    color: var(--color-text-secondary);
                    margin-bottom: 1.5rem;
                }
                .past-booking-card {
                    opacity: 0.7;
                }
                .past-booking-card .booking-image {
                    filter: grayscale(100%);
                }
                
                /* Desktop enhancements */
                @media (min-width: 1024px) {
                    .bookings-header {
                        padding: 2rem;
                        text-align: center;
                    }
                    .bookings-header h1 {
                        font-size: 2rem;
                    }
                    .booking-card {
                        display: grid;
                        grid-template-columns: 280px 1fr;
                        grid-template-rows: auto;
                        margin-bottom: 0;
                        border: 1px solid var(--color-border);
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .booking-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
                        border-color: var(--color-primary);
                    }
                    .booking-card:active {
                        transform: translateY(-2px);
                    }
                    .booking-image {
                        grid-row: 1 / -1;
                        height: 100%;
                        min-height: 220px;
                    }
                    .booking-image img {
                        transition: transform 0.4s ease;
                    }
                    .booking-card:hover .booking-image img {
                        transform: scale(1.05);
                    }
                    .booking-content {
                        padding: 1.5rem;
                        grid-column: 2;
                    }
                    .booking-hotel-name {
                        font-size: 1.25rem;
                    }
                    .booking-price {
                        font-size: 1.5rem;
                    }
                    .booking-actions {
                        grid-column: 2;
                        border-radius: 0;
                    }
                    .booking-qr-section {
                        grid-column: 2;
                    }
                    .empty-state {
                        padding: 4rem 2rem;
                        background: white;
                        border-radius: 1.5rem;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                    }
                    .empty-state-icon {
                        font-size: 5rem;
                    }
                    .empty-state h2 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>

            <header className="bookings-header">
                <h1>{t("title")}</h1>
            </header>

            {/* Tabs */}
            <div className="bookings-tabs">
                <button
                    className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
                    onClick={() => setActiveTab("upcoming")}
                >
                    {t("upcoming")}
                    <span className="tab-count">{upcomingBookings.length}</span>
                </button>
                <button
                    className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
                    onClick={() => setActiveTab("past")}
                >
                    {t("past")}
                    <span className="tab-count">{pastBookings.length}</span>
                </button>
            </div>

            <main className="page-content bookings-page-layout">
                {displayedBookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            {activeTab === "upcoming" ? "🏨" : "📋"}
                        </div>
                        <h2>
                            {activeTab === "upcoming" ? t("noUpcoming") : t("noPast")}
                        </h2>
                        <p>
                            {activeTab === "upcoming"
                                ? t("startExploring")
                                : t("pastBookingsDesc")}
                        </p>
                        {activeTab === "upcoming" && (
                            <Link href="/" className="btn btn-primary">
                                {t("searchHotels")}
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {displayedBookings.map((booking) => {
                            const daysUntil = getDaysUntilCheckIn(booking.checkIn);
                            const isPast = activeTab === "past";

                            return (
                                <div
                                    key={booking.id}
                                    className={`booking-card ${isPast ? "past-booking-card" : ""}`}
                                >
                                    {/* Image Section */}
                                    <div className="booking-image">
                                        <img
                                            src={booking.hotelImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"}
                                            alt={booking.hotelName || "Hotel"}
                                        />
                                        <div className="booking-status-overlay">
                                            <span className={`badge ${statusConfig[booking.status].className}`}>
                                                {statusConfig[booking.status].icon} {t(statusConfig[booking.status].labelKey)}
                                            </span>
                                        </div>
                                        {!isPast && daysUntil >= 0 && (
                                            <div className="days-badge">
                                                {daysUntil === 0
                                                    ? t("today")
                                                    : daysUntil === 1
                                                        ? t("tomorrow")
                                                        : t("days", { count: daysUntil })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="booking-content">
                                        <h3 className="booking-hotel-name">
                                            {booking.hotelName || "Unknown Hotel"}
                                        </h3>
                                        <p className="booking-room">
                                            {booking.roomName || "Room"} • {booking.hotelLocation || "Location"}
                                        </p>

                                        {/* Payment Breakdown - Show for Pay at Hotel with advance paid */}
                                        {!isPast && booking.paymentMethod === "PAY_AT_HOTEL" && booking.bookingFeeStatus === "PAID" && (
                                            <div style={{
                                                background: "var(--color-bg-secondary)",
                                                borderRadius: "0.75rem",
                                                padding: "0.75rem",
                                                marginBottom: "0.75rem",
                                            }}>
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    marginBottom: "0.5rem",
                                                }}>
                                                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                                                        ✅ {t("advancePaid")}
                                                    </span>
                                                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-success)" }}>
                                                        ৳{Number(booking.bookingFee || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    paddingTop: "0.5rem",
                                                    borderTop: "1px dashed var(--color-border)",
                                                }}>
                                                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)" }}>
                                                        💵 {t("payAtHotel")}
                                                    </span>
                                                    <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-primary)" }}>
                                                        ৳{(Number(booking.totalAmount) - Number(booking.bookingFee || 0)).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Payment Info for other cases */}
                                        {!isPast && !(booking.paymentMethod === "PAY_AT_HOTEL" && booking.bookingFeeStatus === "PAID") && (
                                            <div
                                                className="payment-info"
                                                style={{
                                                    background: `${paymentStatusConfig[booking.paymentStatus].color}15`,
                                                    color: paymentStatusConfig[booking.paymentStatus].color,
                                                }}
                                            >
                                                <span>
                                                    {booking.paymentStatus === "PAY_AT_HOTEL" ? "💵" :
                                                        booking.paymentStatus === "PAID" ? "✅" : "⏳"}
                                                </span>
                                                <span style={{ fontWeight: 500 }}>
                                                    {t(paymentStatusConfig[booking.paymentStatus].labelKey)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Dates */}
                                        <div className="booking-dates">
                                            <div className="date-block">
                                                <div className="date-label">{t("checkInDate", { defaultValue: "Check-in" })}</div>
                                                <div className="date-value">{formatDate(booking.checkIn)}</div>
                                            </div>
                                            <div className="date-arrow">→</div>
                                            <div className="date-block">
                                                <div className="date-label">{t("checkOutDate", { defaultValue: "Check-out" })}</div>
                                                <div className="date-value">{formatDate(booking.checkOut)}</div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="booking-footer">
                                            <div className="booking-id">
                                                ID: <span>{booking.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                            <div className="booking-price">
                                                ৳{Number(booking.totalAmount).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {!isPast && (
                                        <div className="booking-actions">
                                            {booking.status === "PENDING" && (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => {
                                                        // Redirect to payment
                                                        window.location.href = `/booking/payment?bookingId=${booking.id}`;
                                                    }}
                                                >
                                                    {t("completePayment")}
                                                </button>
                                            )}
                                            {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => setSelectedBookingId(
                                                        selectedBookingId === booking.id ? null : booking.id
                                                    )}
                                                >
                                                    {selectedBookingId === booking.id ? t("hideQR") : `📱 ${t("showQR")}`}
                                                </button>
                                            )}
                                            {booking.status !== "CHECKED_IN" && (
                                                <button
                                                    onClick={() => setCancellingBooking(booking)}
                                                    className="btn"
                                                    style={{
                                                        background: "transparent",
                                                        color: "var(--color-error)",
                                                        border: "1px solid var(--color-error)",
                                                    }}
                                                >
                                                    {t("cancelBooking")}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* QR Code Section */}
                                    {selectedBookingId === booking.id && (
                                        <div
                                            className="booking-qr-section"
                                            style={{
                                                padding: "1.5rem",
                                                background: "linear-gradient(135deg, rgba(29, 53, 87, 0.05) 0%, rgba(42, 157, 143, 0.05) 100%)",
                                                borderTop: "1px solid var(--color-border)",
                                            }}
                                        >
                                            <BookingQRCode bookingId={booking.id} size={180} />
                                            <p style={{
                                                textAlign: "center",
                                                fontSize: "0.8125rem",
                                                color: "var(--color-text-secondary)",
                                                marginTop: "0.75rem",
                                            }}>
                                                {t("showQRPrompt")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <BottomNav />

            {/* Cancel Booking Modal */}
            {
                cancellingBooking && session?.user?.id && (
                    <CancelBookingModal
                        bookingId={cancellingBooking.id}
                        userId={session.user.id}
                        hotelName={cancellingBooking.hotelName || "Hotel"}
                        onClose={() => setCancellingBooking(null)}
                        onSuccess={() => {
                            setCancellingBooking(null);
                            fetchBookings();
                        }}
                    />
                )
            }
        </>
    );
}
