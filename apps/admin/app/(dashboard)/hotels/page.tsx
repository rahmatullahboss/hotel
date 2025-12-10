import { getAdminHotels, toggleHotelVerification } from "@/actions/hotels";
import Link from "next/link";

export default async function HotelsPage() {
    const hotels = await getAdminHotels();

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 className="text-2xl font-bold">Manage Hotels</h1>
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                    {hotels.length} hotels total
                </div>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)" }}>
                        <tr>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Hotel Name</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Location</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Manager</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Status</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotels.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                                    No hotels found.
                                </td>
                            </tr>
                        ) : (
                            hotels.map((hotel) => (
                                <tr key={hotel.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: "0.5rem",
                                                    background: "var(--color-bg-secondary)",
                                                    backgroundImage: hotel.coverImage ? `url(${hotel.coverImage})` : "none",
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                }}
                                            />
                                            <span style={{ fontWeight: 500 }}>{hotel.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        {hotel.city}, {hotel.address}
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        {/* @ts-ignore - owner relation might be optional/null */}
                                        {hotel.owner?.name || hotel.owner?.email || "Unknown"}
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span
                                            className={`badge badge-${hotel.status === "ACTIVE" ? "success" : "warning"}`}
                                        >
                                            {hotel.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <form
                                            action={async () => {
                                                "use server";
                                                await toggleHotelVerification(
                                                    hotel.id,
                                                    hotel.status !== "ACTIVE"
                                                );
                                            }}
                                        >
                                            <button
                                                className={`btn btn-${hotel.status === "ACTIVE" ? "outline" : "primary"}`}
                                                style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
                                            >
                                                {hotel.status === "ACTIVE" ? "Suspend" : "Approve"}
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
