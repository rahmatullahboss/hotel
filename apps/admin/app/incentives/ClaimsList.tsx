"use client";

import { useState } from "react";
import { MdCheck, MdClose, MdPayment } from "react-icons/md";
import { approveClaim, rejectClaim, markClaimPaid } from "../actions/incentives";

interface Claim {
    id: string;
    hotelName: string;
    programName: string;
    amount: string | null;
    claimedAt: Date | null;
}

interface ClaimsListProps {
    claims: Claim[];
}

export function ClaimsList({ claims }: ClaimsListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleAction = async (id: string, action: "approve" | "reject" | "paid") => {
        setLoadingId(id);
        try {
            if (action === "approve") {
                await approveClaim(id);
            } else if (action === "reject") {
                await rejectClaim(id);
            } else {
                await markClaimPaid(id);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Hotel</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Program</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Claimed</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {claims.map((claim) => (
                        <tr key={claim.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                            <td style={{ padding: "0.75rem 1rem" }}>{claim.hotelName}</td>
                            <td style={{ padding: "0.75rem 1rem" }}>{claim.programName}</td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>
                                ৳{parseFloat(claim.amount || "0").toLocaleString()}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                                {claim.claimedAt ? new Date(claim.claimedAt).toLocaleDateString() : "-"}
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                                    <button
                                        type="button"
                                        onClick={() => handleAction(claim.id, "approve")}
                                        disabled={loadingId === claim.id}
                                        style={{
                                            padding: "0.375rem 0.75rem",
                                            border: "none",
                                            borderRadius: "6px",
                                            backgroundColor: "rgba(34, 197, 94, 0.1)",
                                            color: "#22c55e",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.25rem",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        <MdCheck /> Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAction(claim.id, "paid")}
                                        disabled={loadingId === claim.id}
                                        style={{
                                            padding: "0.375rem 0.75rem",
                                            border: "none",
                                            borderRadius: "6px",
                                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                                            color: "#3b82f6",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.25rem",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        <MdPayment /> Mark Paid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAction(claim.id, "reject")}
                                        disabled={loadingId === claim.id}
                                        style={{
                                            padding: "0.375rem 0.75rem",
                                            border: "none",
                                            borderRadius: "6px",
                                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                                            color: "#ef4444",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.25rem",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        <MdClose /> Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ClaimsList;
