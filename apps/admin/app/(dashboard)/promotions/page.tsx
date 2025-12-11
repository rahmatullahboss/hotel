import { getPromotions, togglePromotionStatus, deletePromotion } from "@/actions/promotions";
import { CreatePromotionForm } from "./CreatePromotionForm";

export const dynamic = 'force-dynamic';

export default async function PromotionsPage() {
    const promotions = await getPromotions();

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Promotions</h1>
                <p className="page-subtitle">Manage discount codes and promotional offers</p>
            </div>

            {/* Create Promotion Form */}
            <div style={{ padding: "0 1.5rem", marginBottom: "1.5rem" }}>
                <CreatePromotionForm />
            </div>

            {/* Promotions List */}
            <div style={{ padding: "0 1.5rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                    All Promotions ({promotions.length})
                </h2>

                {promotions.length === 0 ? (
                    <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            No promotions created yet. Create your first promotion above.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "1rem" }}>
                        {promotions.map((promo) => (
                            <div
                                key={promo.id}
                                className="card"
                                style={{
                                    opacity: promo.isActive ? 1 : 0.6,
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                                            <code style={{
                                                padding: "0.25rem 0.5rem",
                                                background: "var(--color-primary)",
                                                color: "white",
                                                borderRadius: "0.25rem",
                                                fontWeight: 700,
                                                fontSize: "1rem",
                                            }}>
                                                {promo.code}
                                            </code>
                                            <span style={{ fontWeight: 600 }}>{promo.name}</span>
                                        </div>
                                        {promo.description && (
                                            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>
                                                {promo.description}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span className={`badge ${promo.isActive ? "badge-success" : "badge-warning"}`}>
                                            {promo.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>

                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                    gap: "1rem",
                                    padding: "0.75rem",
                                    background: "var(--color-bg-secondary)",
                                    borderRadius: "0.5rem",
                                    marginBottom: "0.75rem",
                                }}>
                                    <div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Discount</div>
                                        <div style={{ fontWeight: 600 }}>
                                            {promo.type === "PERCENTAGE" ? `${promo.value}%` : `৳${promo.value}`}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Usage</div>
                                        <div style={{ fontWeight: 600 }}>
                                            {promo.currentUses}{promo.maxUses ? ` / ${promo.maxUses}` : " (unlimited)"}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Valid From</div>
                                        <div style={{ fontWeight: 600 }}>{formatDate(promo.validFrom)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Valid To</div>
                                        <div style={{ fontWeight: 600 }}>{formatDate(promo.validTo)}</div>
                                    </div>
                                    {promo.minBookingAmount && (
                                        <div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Min Amount</div>
                                            <div style={{ fontWeight: 600 }}>৳{promo.minBookingAmount}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Scope</div>
                                        <div style={{ fontWeight: 600 }}>
                                            {promo.hotelId ? "Hotel-specific" : "Platform-wide"}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <form action={async () => {
                                        "use server";
                                        await togglePromotionStatus(promo.id);
                                    }}>
                                        <button className={`btn btn-sm ${promo.isActive ? "btn-outline" : "btn-primary"}`}>
                                            {promo.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await deletePromotion(promo.id);
                                    }}>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            style={{ color: "var(--color-error)" }}
                                        >
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
