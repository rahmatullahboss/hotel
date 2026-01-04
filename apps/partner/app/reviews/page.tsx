import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiMessageSquare, FiStar } from "react-icons/fi";
import { getHotelReviews, getReviewStats } from "../actions/reviews";
import { getPartnerRole } from "../actions/getPartnerRole";
import { ReviewsList } from "./ReviewsList";
import { ReviewStats } from "./ReviewStats";
import { BottomNav, ScannerFAB } from "../components";

export const dynamic = "force-dynamic";

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
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
    section: {
        background: "white",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        marginBottom: "20px",
    } as React.CSSProperties,
    sectionTitle: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#1a1a2e",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    } as React.CSSProperties,
    emptyState: {
        textAlign: "center" as const,
        padding: "48px 24px",
    } as React.CSSProperties,
};

export default async function ReviewsPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    const [reviews, stats] = await Promise.all([
        getHotelReviews(),
        getReviewStats(),
    ]);

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <Link href="/" style={styles.backLink}>
                        <FiArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <h1 style={styles.pageTitle}>
                        <FiMessageSquare size={26} />
                        Guest Reviews
                    </h1>
                    <p style={styles.pageSubtitle}>
                        View and respond to guest feedback
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Stats Section */}
                {stats && <ReviewStats stats={stats} />}

                {/* Reviews List */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <FiStar size={20} color="#f59e0b" />
                        All Reviews ({reviews.length})
                    </h2>

                    {reviews.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                                fontSize: "36px",
                            }}>
                                📝
                            </div>
                            <h3 style={{ fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>
                                No Reviews Yet
                            </h3>
                            <p style={{ color: "#6b7280", fontSize: "14px" }}>
                                Guest reviews will appear here after their stay
                            </p>
                        </div>
                    ) : (
                        <ReviewsList reviews={reviews} />
                    )}
                </section>
            </main>

            <ScannerFAB />
            <BottomNav role={roleInfo.role} />
        </div>
    );
}
