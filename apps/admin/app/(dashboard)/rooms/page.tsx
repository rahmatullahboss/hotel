import { getRoomsWithRemovalRequests, approveRoomRemoval, rejectRoomRemoval } from "@/actions/hotels";

export default async function RoomsPage() {
    const roomsWithRequests = await getRoomsWithRemovalRequests();

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Room Management</h1>
                <p className="page-subtitle">
                    {roomsWithRequests.length} pending removal requests
                </p>
            </div>

            {/* Pending Removal Requests */}
            {roomsWithRequests.length > 0 ? (
                <div style={{ padding: "0 1.5rem" }}>
                    <h2 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}>
                        <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "var(--color-warning)",
                            color: "white",
                            fontSize: "0.75rem",
                            fontWeight: 700
                        }}>
                            {roomsWithRequests.length}
                        </span>
                        Removal Requests
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {roomsWithRequests.map((room: any) => {
                            // Extract reason from description
                            const reasonMatch = room.description?.match(/\[REMOVAL_REQUESTED:\s*([^\]]+)\]/);
                            const reason = reasonMatch ? reasonMatch[1] : "No reason provided";

                            return (
                                <div
                                    key={room.id}
                                    className="card"
                                    style={{
                                        padding: "1rem",
                                        border: "2px solid var(--color-warning)",
                                        background: "rgba(233, 196, 106, 0.05)"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                                <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                                                    Room #{room.roomNumber}
                                                </span>
                                                <span style={{ fontWeight: 500 }}>{room.name}</span>
                                                <span className="badge badge-warning">Removal Pending</span>
                                            </div>
                                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                                                {room.type} • ৳{parseFloat(room.basePrice).toLocaleString()} / night
                                            </div>
                                            <div style={{
                                                padding: "0.5rem 0.75rem",
                                                background: "var(--color-bg-secondary)",
                                                borderRadius: "0.375rem",
                                                fontSize: "0.875rem",
                                                marginBottom: "0.75rem"
                                            }}>
                                                <strong>Hotel:</strong> {room.hotel?.name || "Unknown"}
                                            </div>
                                            <div style={{
                                                padding: "0.5rem 0.75rem",
                                                background: "rgba(233, 196, 106, 0.1)",
                                                borderRadius: "0.375rem",
                                                fontSize: "0.875rem",
                                                color: "var(--color-text-primary)"
                                            }}>
                                                <strong>Reason:</strong> {reason}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
                                            <form action={async () => {
                                                "use server";
                                                await approveRoomRemoval(room.id);
                                            }}>
                                                <button className="btn btn-primary btn-sm">
                                                    ✓ Approve
                                                </button>
                                            </form>
                                            <form action={async () => {
                                                "use server";
                                                await rejectRoomRemoval(room.id);
                                            }}>
                                                <button className="btn btn-outline btn-sm">
                                                    ✕ Reject
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div style={{ padding: "0 1.5rem" }}>
                    <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                        No pending room removal requests
                    </div>
                </div>
            )}
        </div>
    );
}
