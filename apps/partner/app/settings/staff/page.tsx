import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiUsers } from "react-icons/fi";
import { getPartnerRole } from "../../actions/getPartnerRole";
import { getStaffMembers } from "../../actions/staff";
import { BottomNav } from "../../components";
import { StaffList } from "./StaffList";
import { auth } from "../../../auth";

export const dynamic = 'force-dynamic';

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
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
        fontSize: "26px",
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
        maxWidth: "800px",
        margin: "0 auto",
    } as React.CSSProperties,
    infoBanner: {
        background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
        borderRadius: "18px",
        padding: "20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        border: "1px solid #c4b5fd",
    } as React.CSSProperties,
};

export default async function StaffPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    if (!roleInfo.permissions.canManageStaff) {
        redirect("/settings?accessDenied=staff");
    }

    const session = await auth();
    const staff = await getStaffMembers();

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <Link href="/settings" style={styles.backLink}>
                        <FiArrowLeft size={18} />
                        Back to Settings
                    </Link>
                    <h1 style={styles.pageTitle}>
                        <FiUsers size={26} />
                        Staff Management
                    </h1>
                    <p style={styles.pageSubtitle}>
                        Manage your hotel team
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Info Banner */}
                <div style={styles.infoBanner}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <span style={{ fontSize: "24px" }}>👥</span>
                    </div>
                    <div>
                        <div style={{ fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>
                            Role-Based Access
                        </div>
                        <ul style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            margin: 0,
                            paddingLeft: "20px",
                            lineHeight: 1.6,
                        }}>
                            <li><strong>Managers</strong> can handle inventory, pricing & bookings</li>
                            <li><strong>Receptionists</strong> can only check-in/out guests</li>
                        </ul>
                    </div>
                </div>

                <StaffList
                    initialStaff={staff}
                    currentUserId={session?.user?.id || ""}
                />
            </main>

            <BottomNav role={roleInfo.role} />
        </div>
    );
}
