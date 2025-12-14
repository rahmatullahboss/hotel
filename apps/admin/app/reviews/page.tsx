import { MdStar, MdVisibility, MdVisibilityOff, MdReply, MdRateReview } from "react-icons/md";
import { getReviewStats, getAllReviews } from "../actions/reviews";
import { ReviewTable } from "./ReviewTable";
import { RatingBreakdown } from "./RatingBreakdown";

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
    const [stats, reviews] = await Promise.all([
        getReviewStats(),
        getAllReviews(),
    ]);

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <h1>Review Management</h1>
                    <p className="text-muted">Monitor and moderate guest reviews across all hotels</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <MdStar />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.avgRating}</span>
                        <span className="stat-label">Avg Rating</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdRateReview />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Reviews</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <MdVisibility />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.visible}</span>
                        <span className="stat-label">Visible</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <MdVisibilityOff />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.hidden}</span>
                        <span className="stat-label">Hidden</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                        <MdReply />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.withResponse}</span>
                        <span className="stat-label">Responded</span>
                    </div>
                </div>
            </div>

            {/* Rating Breakdown */}
            <section className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
                <h3 style={{ margin: 0, marginBottom: "1rem" }}>Rating Distribution</h3>
                <RatingBreakdown breakdown={stats.breakdown} total={stats.total} />
            </section>

            {/* Reviews Table */}
            <section>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                    All Reviews ({reviews.length})
                </h2>
                <ReviewTable reviews={reviews} />
            </section>

            <style jsx>{`
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                .stat-content {
                    display: flex;
                    flex-direction: column;
                }
                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                }
                .stat-label {
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                }
            `}</style>
        </div>
    );
}
