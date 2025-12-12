"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cancelBooking, getCancellationInfo } from "../actions/bookings";
import { CANCELLATION_REASONS } from "../actions/cancel-reasons";

interface CancelBookingModalProps {
    bookingId: string;
    userId: string;
    hotelName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function CancelBookingModal({
    bookingId,
    userId,
    hotelName,
    onClose,
    onSuccess,
}: CancelBookingModalProps) {
    const t = useTranslations("cancelModal");
    const [isPending, startTransition] = useTransition();
    const [reason, setReason] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [policyInfo, setPolicyInfo] = useState<{
        type: "ADVANCE_PAYMENT";
        isLate: boolean;
        hoursRemaining: number;
        penalty: string | null;
        refund: number;
    } | null>(null);

    useEffect(() => {
        getCancellationInfo(bookingId, userId).then(setPolicyInfo);
    }, [bookingId, userId]);

    const handleCancel = () => {
        if (!reason) {
            setError(t("selectReason"));
            return;
        }

        startTransition(async () => {
            const result = await cancelBooking(bookingId, userId, reason);
            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || "Failed to cancel booking");
            }
        });
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "1rem",
            }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "1.5rem",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ marginBottom: "0.5rem", fontSize: "1.25rem" }}>
                    {t("title")}
                </h2>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                    {hotelName}
                </p>

                {/* Policy Info */}
                {policyInfo && (
                    <div
                        style={{
                            padding: "1rem",
                            background: policyInfo.isLate
                                ? "rgba(231, 111, 81, 0.1)"
                                : "rgba(42, 157, 143, 0.1)",
                            borderRadius: "0.5rem",
                            marginBottom: "1rem",
                        }}
                    >
                        {policyInfo.refund > 0 ? (
                            <div style={{ color: "#2a9d8f", fontWeight: 500 }}>
                                {t("refundMessage", { amount: policyInfo.refund })}
                            </div>
                        ) : policyInfo.penalty ? (
                            <div style={{ color: "#e76f51", fontWeight: 500 }}>
                                ⚠ {policyInfo.penalty}
                            </div>
                        ) : (
                            <div style={{ color: "#2a9d8f", fontWeight: 500 }}>
                                {t("freeCancellation")}
                            </div>
                        )}
                        <div style={{
                            fontSize: "0.875rem",
                            color: "var(--color-text-secondary)",
                            marginTop: "0.25rem"
                        }}>
                            {policyInfo.hoursRemaining > 24
                                ? t("daysUntil", { days: Math.floor(policyInfo.hoursRemaining / 24) })
                                : t("hoursUntil", { hours: Math.round(policyInfo.hoursRemaining) })
                            }
                        </div>
                    </div>
                )}

                {/* Reason Selector */}
                <label
                    style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500
                    }}
                >
                    {t("reasonLabel")}
                </label>
                <select
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        setError(null);
                    }}
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--color-border)",
                        marginBottom: "1rem",
                        fontSize: "1rem",
                    }}
                >
                    <option value="">{t("reasonPlaceholder")}</option>
                    {CANCELLATION_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                            {r.label}
                        </option>
                    ))}
                </select>

                {error && (
                    <div style={{ color: "var(--color-error)", marginBottom: "1rem" }}>
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                        onClick={onClose}
                        className="btn btn-outline"
                        style={{ flex: 1 }}
                        disabled={isPending}
                    >
                        {t("keepBooking")}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="btn"
                        style={{
                            flex: 1,
                            background: "var(--color-error)",
                            color: "white",
                        }}
                        disabled={isPending || !reason}
                    >
                        {isPending ? t("cancelling") : t("confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}
