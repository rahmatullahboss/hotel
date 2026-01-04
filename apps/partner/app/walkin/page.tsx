import { redirect } from "next/navigation";
import { FiDollarSign, FiArrowLeft, FiInfo } from "react-icons/fi";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getPartnerHotel } from "../actions/dashboard";
import { BottomNav, ScannerFAB } from "../components";
import { WalkInForm } from "./WalkInForm";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function WalkInPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    // Get hotel details for status check
    const hotel = await getPartnerHotel();

    if (!hotel || hotel.status !== "ACTIVE") {
        redirect("/");
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            paddingBottom: "100px",
        }}>
            {/* Header */}
            <header style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "24px 20px 32px",
                borderRadius: "0 0 32px 32px",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                marginBottom: "24px",
            }}>
                <Link 
                    href="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "14px",
                        fontWeight: "500",
                        textDecoration: "none",
                        marginBottom: "12px",
                    }}
                >
                    <FiArrowLeft size={18} />
                    Back to Dashboard
                </Link>
                <h1 style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "white",
                    margin: 0,
                    marginBottom: "8px",
                }}>
                    Record Walk-in
                </h1>
                <p style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "15px",
                    margin: 0,
                }}>
                    Record guests who walked in directly (no commission)
                </p>
            </header>

            <main style={{
                padding: "0 16px",
                maxWidth: "600px",
                margin: "0 auto",
            }}>
                {/* Info Banner */}
                <div style={{
                    background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "24px",
                    border: "2px solid #10b981",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.15)",
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "16px",
                    }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                        }}>
                            <FiDollarSign size={24} color="white" />
                        </div>
                        <div>
                            <div style={{
                                fontWeight: "700",
                                fontSize: "16px",
                                color: "#065f46",
                                marginBottom: "6px",
                            }}>
                                No Commission for Walk-ins
                            </div>
                            <p style={{
                                fontSize: "14px",
                                color: "#047857",
                                margin: 0,
                                lineHeight: "1.5",
                            }}>
                                Walk-in guests are recorded for inventory tracking only.
                                You keep 100% of the revenue - no platform commission.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tips Banner */}
                <div style={{
                    background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}>
                    <FiInfo size={20} color="#4f46e5" />
                    <span style={{
                        fontSize: "13px",
                        color: "#4338ca",
                        fontWeight: "500",
                    }}>
                        Fill in the details step by step. Room selection will appear after choosing dates.
                    </span>
                </div>

                <WalkInForm hotelId={roleInfo.hotelId} />
            </main>

            <ScannerFAB />
            <BottomNav role={roleInfo.role} />
        </div>
    );
}
