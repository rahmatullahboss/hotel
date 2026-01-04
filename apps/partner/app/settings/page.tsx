import { redirect } from "next/navigation";
import Link from "next/link";
import { FiSettings, FiChevronRight, FiToggleRight, FiToggleLeft } from "react-icons/fi";
import { MdBusiness, MdCameraAlt, MdGroup, MdReceipt, MdInsights, MdHelpOutline, MdLanguage } from "react-icons/md";
import { getHotelProfile } from "../actions/settings";
import { getPartnerRole } from "../actions/getPartnerRole";
import { BottomNav, LanguageSwitcher } from "../components";
import { NotificationSettings } from "../components/NotificationSettings";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
        marginBottom: "24px",
    } as React.CSSProperties,
    pageTitle: {
        fontSize: "28px",
        fontWeight: "800",
        color: "white",
        margin: 0,
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
    } as React.CSSProperties,
    pageSubtitle: {
        color: "rgba(255,255,255,0.8)",
        fontSize: "15px",
        margin: 0,
    } as React.CSSProperties,
    main: {
        padding: "0 16px",
        maxWidth: "600px",
        margin: "0 auto",
    } as React.CSSProperties,
    hotelCard: {
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        borderRadius: "20px",
        padding: "24px",
        color: "white",
        marginBottom: "24px",
        boxShadow: "0 8px 30px rgba(99, 102, 241, 0.3)",
    } as React.CSSProperties,
    settingsCard: {
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
        border: "1px solid #f0f0f0",
        marginBottom: "12px",
        overflow: "hidden",
    } as React.CSSProperties,
    settingsLink: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "18px 20px",
        textDecoration: "none",
        color: "inherit",
        transition: "background 0.2s ease",
    } as React.CSSProperties,
    iconBox: {
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    } as React.CSSProperties,
    toggleTrack: {
        width: "52px",
        height: "28px",
        borderRadius: "14px",
        position: "relative" as const,
        cursor: "default",
        transition: "background 0.2s",
    } as React.CSSProperties,
    toggleThumb: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        background: "white",
        position: "absolute" as const,
        top: "2px",
        transition: "left 0.2s",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    } as React.CSSProperties,
};

const iconGradients: Record<string, string> = {
    profile: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    photos: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    staff: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    bookings: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    analytics: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    help: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    language: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
};

export default async function SettingsPage() {
    const roleInfo = await getPartnerRole();
    const hotel = await getHotelProfile();
    const t = await getTranslations("settings");

    if (!roleInfo || !hotel) {
        redirect("/auth/signin");
    }

    const settingsItems = [
        {
            href: "/settings/profile",
            icon: <MdBusiness size={24} color="white" />,
            title: t("hotelProfile"),
            description: t("hotelProfileDesc"),
            gradient: iconGradients.profile,
        },
        {
            href: "/settings/photos",
            icon: <MdCameraAlt size={24} color="white" />,
            title: t("photosMedia"),
            description: t("photosMediaDesc"),
            gradient: iconGradients.photos,
        },
        ...(roleInfo.permissions.canManageStaff ? [{
            href: "/settings/staff",
            icon: <MdGroup size={24} color="white" />,
            title: "Staff Management",
            description: "Manage team members and roles",
            gradient: iconGradients.staff,
        }] : []),
        {
            href: "/bookings",
            icon: <MdReceipt size={24} color="white" />,
            title: t("bookingHistory"),
            description: t("bookingHistoryDesc"),
            gradient: iconGradients.bookings,
        },
        {
            href: "/analytics",
            icon: <MdInsights size={24} color="white" />,
            title: t("analytics"),
            description: t("analyticsDesc"),
            gradient: iconGradients.analytics,
        },
        {
            href: "/help",
            icon: <MdHelpOutline size={24} color="white" />,
            title: t("helpSupport"),
            description: t("helpSupportDesc"),
            gradient: iconGradients.help,
        },
    ];

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <h1 style={styles.pageTitle}>
                        <FiSettings size={28} />
                        {t("title")}
                    </h1>
                    <p style={styles.pageSubtitle}>
                        {t("manageSettings")}
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Hotel Info Card */}
                <div style={styles.hotelCard}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "16px",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <MdBusiness size={32} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ 
                                fontSize: "20px", 
                                fontWeight: "800", 
                                marginBottom: "4px",
                                margin: 0 
                            }}>
                                {hotel.name}
                            </h2>
                            <p style={{ 
                                fontSize: "14px", 
                                opacity: 0.9,
                                margin: 0 
                            }}>
                                {hotel.city} • {hotel.status}
                            </p>
                        </div>
                        <span style={{
                            background: "rgba(255,255,255,0.2)",
                            padding: "8px 14px",
                            borderRadius: "100px",
                            fontSize: "12px",
                            fontWeight: "600",
                        }}>
                            {t("commission")}
                        </span>
                    </div>
                </div>

                {/* Language Setting */}
                <div style={styles.settingsCard}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "18px 20px",
                    }}>
                        <div style={{
                            ...styles.iconBox,
                            background: iconGradients.language,
                        }}>
                            <MdLanguage size={24} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a2e", marginBottom: "4px" }}>
                                {t("language")}
                            </div>
                            <div style={{ fontSize: "13px", color: "#6b7280" }}>
                                {t("languageDesc")}
                            </div>
                        </div>
                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Push Notifications */}
                <div style={{ marginBottom: "24px" }}>
                    <NotificationSettings />
                </div>

                {/* Settings Menu */}
                <div>
                    {settingsItems.map((item) => (
                        <div key={item.href} style={styles.settingsCard}>
                            <Link href={item.href} style={styles.settingsLink}>
                                <div style={{
                                    ...styles.iconBox,
                                    background: item.gradient,
                                }}>
                                    {item.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a2e", marginBottom: "4px" }}>
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                                        {item.description}
                                    </div>
                                </div>
                                <FiChevronRight size={20} color="#9ca3af" />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Pay at Hotel Toggle */}
                <div style={{
                    ...styles.settingsCard,
                    marginTop: "24px",
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "18px 20px",
                    }}>
                        <div>
                            <div style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a2e", marginBottom: "4px" }}>
                                {t("payAtHotel")}
                            </div>
                            <div style={{ fontSize: "13px", color: "#6b7280" }}>
                                {t("payAtHotelDesc")}
                            </div>
                        </div>
                        <div style={{
                            ...styles.toggleTrack,
                            background: hotel.payAtHotelEnabled 
                                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                                : "#e5e7eb",
                        }}>
                            <div style={{
                                ...styles.toggleThumb,
                                left: hotel.payAtHotelEnabled ? "26px" : "2px",
                            }} />
                        </div>
                    </div>
                </div>

                {/* Version Info */}
                <div style={{
                    marginTop: "32px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "13px",
                }}>
                    {t("version")}
                </div>
            </main>

            <BottomNav role={roleInfo.role} />
        </div>
    );
}
