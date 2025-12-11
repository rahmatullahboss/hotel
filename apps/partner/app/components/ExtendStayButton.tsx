"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { extendStay } from "../actions/dashboard";

interface ExtendStayButtonProps {
    bookingId: string;
    hotelId: string;
    guestName: string;
    pricePerNight?: number;
}

export function ExtendStayButton({ bookingId, hotelId, guestName, pricePerNight }: ExtendStayButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showModal, setShowModal] = useState(false);
    const [nights, setNights] = useState(1);

    const handleExtend = () => {
        startTransition(async () => {
            const result = await extendStay(bookingId, hotelId, nights);
            if (result.success) {
                alert(`Stay extended! New checkout: ${result.newCheckOut}\nAdditional charge: ৳${result.additionalAmount?.toLocaleString()}`);
                setShowModal(false);
                router.refresh();
            } else {
                alert(result.error || "Failed to extend stay");
            }
        });
    };

    return (
        <>
            <button
                className="btn btn-outline"
                onClick={() => setShowModal(true)}
                disabled={isPending}
                style={{
                    fontSize: "0.75rem",
                    padding: "0.5rem 1rem",
                    flex: 1,
                }}
            >
                + Extend Stay
            </button>

            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            background: "var(--color-bg-primary)",
                            borderRadius: "1rem",
                            padding: "1.5rem",
                            maxWidth: "320px",
                            width: "100%",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>
                            Extend Stay for {guestName}
                        </h3>

                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                                Additional Nights
                            </label>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setNights(Math.max(1, nights - 1))}
                                    style={{ padding: "0.5rem 1rem" }}
                                >
                                    -
                                </button>
                                <span style={{
                                    fontSize: "1.5rem",
                                    fontWeight: 700,
                                    minWidth: "3rem",
                                    textAlign: "center"
                                }}>
                                    {nights}
                                </span>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setNights(nights + 1)}
                                    style={{ padding: "0.5rem 1rem" }}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {pricePerNight && (
                            <div style={{
                                background: "var(--color-bg-secondary)",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                marginBottom: "1rem",
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "0.875rem",
                                }}>
                                    <span>Additional Charge:</span>
                                    <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>
                                        ৳{(pricePerNight * nights).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowModal(false)}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-accent"
                                onClick={handleExtend}
                                disabled={isPending}
                                style={{ flex: 1 }}
                            >
                                {isPending ? "Extending..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
