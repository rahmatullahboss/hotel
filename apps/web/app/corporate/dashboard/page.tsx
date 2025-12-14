"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FiCalendar, FiUsers, FiFileText, FiPlus, FiClock } from "react-icons/fi";
import { BottomNav } from "@/app/components";
import { getCorporateAccount, getCorporateBookings, getCorporateInvoices } from "@/app/actions/corporate";

import "../corporate.css";

interface CorporateAccount {
    id: string;
    companyName: string;
    status: string;
    discountPercentage: string;
    currentBalance: string;
}

export default function CorporateDashboard() {
    const t = useTranslations("corporate");
    const router = useRouter();
    const [account, setAccount] = useState<{ account: CorporateAccount; role: string } | null>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [acc, book, inv] = await Promise.all([
            getCorporateAccount(),
            getCorporateBookings(),
            getCorporateInvoices(),
        ]);

        if (!acc) {
            router.push("/corporate");
            return;
        }

        setAccount(acc as any);
        setBookings(book);
        setInvoices(inv);
        setLoading(false);
    }

    if (loading || !account) {
        return (
            <div className="corporate-dashboard">
                <div className="corporate-loading">
                    <div className="loading-spinner" />
                </div>
                <BottomNav />
            </div>
        );
    }

    const pendingBookings = bookings.filter((b) => b.status === "PENDING_APPROVAL").length;
    const unpaidInvoices = invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE").length;

    return (
        <div className="corporate-dashboard">
            <header className="dashboard-header">
                <h1>{account.account.companyName}</h1>
                <p>{t("corporateAccount")}</p>
                <span className={`dashboard-status status-${account.account.status.toLowerCase()}`}>
                    {account.account.status}
                </span>
            </header>

            <div className="dashboard-stats">
                <div className="dashboard-stat">
                    <span className="stat-value">{bookings.length}</span>
                    <span className="stat-label">{t("totalBookings")}</span>
                </div>
                <div className="dashboard-stat">
                    <span className="stat-value">{Number(account.account.discountPercentage)}%</span>
                    <span className="stat-label">{t("discount")}</span>
                </div>
                <div className="dashboard-stat">
                    <span className="stat-value">{pendingBookings}</span>
                    <span className="stat-label">{t("pending")}</span>
                </div>
                <div className="dashboard-stat">
                    <span className="stat-value">{unpaidInvoices}</span>
                    <span className="stat-label">{t("unpaidInvoices")}</span>
                </div>
            </div>

            <nav className="dashboard-nav">
                <Link href="/hotels" className="nav-card">
                    <FiPlus className="nav-card-icon" />
                    <span className="nav-card-title">{t("newBooking")}</span>
                </Link>
                <Link href="/corporate/bookings" className="nav-card">
                    <FiCalendar className="nav-card-icon" />
                    <span className="nav-card-title">{t("bookings")}</span>
                </Link>
                <Link href="/corporate/team" className="nav-card">
                    <FiUsers className="nav-card-icon" />
                    <span className="nav-card-title">{t("team")}</span>
                </Link>
                <Link href="/corporate/invoices" className="nav-card">
                    <FiFileText className="nav-card-icon" />
                    <span className="nav-card-title">{t("invoices")}</span>
                </Link>
            </nav>

            {/* Recent Bookings */}
            {bookings.length > 0 && (
                <section style={{ padding: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        <FiClock style={{ marginRight: "0.5rem" }} />
                        {t("recentBookings")}
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {bookings.slice(0, 3).map((booking) => (
                            <div key={booking.id} className="card" style={{ padding: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <strong>{booking.hotel?.name}</strong>
                                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                            {booking.checkIn} → {booking.checkOut}
                                        </p>
                                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                            {booking.roomCount} {t("rooms")} • {booking.bookingReference}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span className={`badge badge-${booking.status === "CONFIRMED" ? "success" : "warning"}`}>
                                            {booking.status}
                                        </span>
                                        <p style={{ fontWeight: 600, marginTop: "0.25rem" }}>
                                            ৳{Number(booking.totalAmount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <BottomNav />
        </div>
    );
}
