import { redirect } from "next/navigation";
import Link from "next/link";
import { getPartnerRole } from "../../actions/getPartnerRole";
import { getStaffMembers } from "../../actions/staff";
import { BottomNav } from "../../components";
import { StaffList } from "./StaffList";
import { auth } from "../../../auth";

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    // Only OWNER can manage staff
    if (!roleInfo.permissions.canManageStaff) {
        redirect("/settings?accessDenied=staff");
    }

    const session = await auth();
    const staff = await getStaffMembers();

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link
                        href="/settings"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-bg-secondary)",
                            color: "var(--color-text-secondary)",
                            textDecoration: "none",
                        }}
                    >
                        ←
                    </Link>
                    <div>
                        <h1 className="page-title">Staff Management</h1>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                            Manage your hotel team
                        </p>
                    </div>
                </div>
            </header>

            <main>
                {/* Info Banner */}
                <div
                    className="card"
                    style={{
                        marginBottom: "1.5rem",
                        backgroundColor: "rgba(29, 53, 87, 0.05)",
                        borderColor: "var(--color-primary)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div style={{ fontSize: "1.5rem" }}>👥</div>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                Role-Based Access
                            </div>
                            <ul style={{
                                fontSize: "0.875rem",
                                color: "var(--color-text-secondary)",
                                margin: 0,
                                paddingLeft: "1rem",
                            }}>
                                <li><strong>Managers</strong> can handle inventory, pricing & bookings</li>
                                <li><strong>Receptionists</strong> can only check-in/out guests</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <StaffList
                    initialStaff={staff}
                    currentUserId={session?.user?.id || ""}
                />
            </main>

            <BottomNav role={roleInfo.role} />
        </>
    );
}
