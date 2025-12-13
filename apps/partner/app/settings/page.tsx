import { redirect } from "next/navigation";
import Link from "next/link";
import { MdBusiness, MdCameraAlt, MdGroup, MdReceipt, MdInsights, MdHelpOutline, MdLanguage } from "react-icons/md";
import { getHotelProfile } from "../actions/settings";
import { getPartnerRole } from "../actions/getPartnerRole";
import { BottomNav, LanguageSwitcher } from "../components";
import { NotificationSettings } from "../components/NotificationSettings";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const roleInfo = await getPartnerRole();
    const hotel = await getHotelProfile();
    const t = await getTranslations("settings");
    const tNav = await getTranslations("nav");

    if (!roleInfo || !hotel) {
        redirect("/auth/signin");
    }

    // Build settings items, conditionally including owner-only items
    const settingsItems = [
        {
            href: "/settings/profile",
            icon: <MdBusiness size={24} />,
            title: t("hotelProfile"),
            description: t("hotelProfileDesc"),
        },
        {
            href: "/settings/photos",
            icon: <MdCameraAlt size={24} />,
            title: t("photosMedia"),
            description: t("photosMediaDesc"),
        },
        // Staff Management - OWNER only
        ...(roleInfo.permissions.canManageStaff ? [{
            href: "/settings/staff",
            icon: <MdGroup size={24} />,
            title: "Staff Management",
            description: "Manage team members and roles",
        }] : []),
        {
            href: "/bookings",
            icon: <MdReceipt size={24} />,
            title: t("bookingHistory"),
            description: t("bookingHistoryDesc"),
        },
        {
            href: "/analytics",
            icon: <MdInsights size={24} />,
            title: t("analytics"),
            description: t("analyticsDesc"),
        },
        {
            href: "/help",
            icon: <MdHelpOutline size={24} />,
            title: t("helpSupport"),
            description: t("helpSupportDesc"),
        },
    ];

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <h1 className="page-title">{t("title")}</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    {t("manageSettings")}
                </p>
            </header>

            <main>
                {/* Hotel Info Card */}
                <div
                    className="card"
                    style={{
                        marginBottom: "1.5rem",
                        padding: "1.25rem",
                        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
                        color: "white",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div
                            style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "12px",
                                background: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.75rem",
                            }}
                        >
                            <MdBusiness size={28} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                                {hotel.name}
                            </h2>
                            <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                                {hotel.city} • {hotel.status}
                            </p>
                        </div>
                        <span
                            style={{
                                background: "rgba(255,255,255,0.2)",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                            }}
                        >
                            {t("commission")}
                        </span>
                    </div>
                </div>

                {/* Language Setting */}
                <div
                    className="card"
                    style={{
                        marginBottom: "0.75rem",
                        padding: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "var(--color-bg-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem",
                        }}
                    >
                        <MdLanguage size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                            {t("language")}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            {t("languageDesc")}
                        </div>
                    </div>
                    <LanguageSwitcher />
                </div>

                {/* Push Notifications */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <NotificationSettings />
                </div>

                {/* Settings Menu */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {settingsItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="card"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1rem",
                                textDecoration: "none",
                                color: "inherit",
                                transition: "transform 0.15s, box-shadow 0.15s",
                            }}
                        >
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "12px",
                                    background: "var(--color-bg-secondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.5rem",
                                }}
                            >
                                {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    {item.title}
                                </div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {item.description}
                                </div>
                            </div>
                            <div style={{ color: "var(--color-text-muted)", fontSize: "1.25rem" }}>
                                →
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pay at Hotel Toggle */}
                <div
                    className="card"
                    style={{
                        marginTop: "1.5rem",
                        padding: "1.25rem",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                {t("payAtHotel")}
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                {t("payAtHotelDesc")}
                            </div>
                        </div>
                        <div
                            style={{
                                width: "50px",
                                height: "28px",
                                borderRadius: "14px",
                                background: hotel.payAtHotelEnabled ? "var(--color-success)" : "var(--color-text-muted)",
                                position: "relative",
                                cursor: "default",
                            }}
                        >
                            <div
                                style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                    background: "white",
                                    position: "absolute",
                                    top: "2px",
                                    left: hotel.payAtHotelEnabled ? "24px" : "2px",
                                    transition: "left 0.2s",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Version Info */}
                <div
                    style={{
                        marginTop: "2rem",
                        textAlign: "center",
                        color: "var(--color-text-muted)",
                        fontSize: "0.75rem",
                    }}
                >
                    {t("version")}
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNav role={roleInfo.role} />
        </>
    );
}
