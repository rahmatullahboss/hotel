import { redirect } from "next/navigation";
import { getHotelReviews, getReviewStats } from "../actions/reviews";
import { getPartnerRole } from "../actions/getPartnerRole";
import { ReviewsList } from "./ReviewsList";
import { ReviewStats } from "./ReviewStats";
import { BottomNav, ScannerFAB } from "../components";
import { FiMessageSquare, FiStar } from "react-icons/fi";

export const dynamic = "force-dynamic";

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
        <>
            <main className="dashboard-content">
                {/* Header */}
                <header className="page-header" style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                            }}
                        >
                            <FiMessageSquare size={20} />
                        </div>
                        <div>
                            <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>
                                Guest Reviews
                            </h1>
                            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                View and respond to guest feedback
                            </p>
                        </div>
                    </div>
                </header>

                {/* Stats Section */}
                {stats && (
                    <ReviewStats stats={stats} />
                )}

                {/* Reviews List */}
                <section style={{ marginTop: "1.5rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FiStar /> All Reviews ({reviews.length})
                    </h2>

                    {reviews.length === 0 ? (
                        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
                            <h3 style={{ marginBottom: "0.5rem" }}>No Reviews Yet</h3>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                                Guest reviews will appear here after their stay
                            </p>
                        </div>
                    ) : (
                        <ReviewsList reviews={reviews} />
                    )}
                </section>
            </main>

            {/* Scanner FAB */}
            <ScannerFAB />

            {/* Bottom Navigation */}
            <BottomNav role={roleInfo.role} />
        </>
    );
}

