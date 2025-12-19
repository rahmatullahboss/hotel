"use client";

import { useState, useTransition } from "react";
import { savePromotion } from "../actions/dashboard";

interface PromoBannerProps {
    hotelId: string;
    enabled?: boolean;
    discount?: number;
    additionalDiscount?: number;
}

export function PromoBanner({
    hotelId,
    enabled = false,
    discount = 5,
    additionalDiscount = 15,
}: PromoBannerProps) {
    const [isEnabled, setIsEnabled] = useState(enabled);
    const [discountValue, setDiscountValue] = useState(discount);
    const [isPending, startTransition] = useTransition();
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const handleSave = () => {
        setSaveStatus("saving");
        startTransition(async () => {
            const result = await savePromotion(hotelId, {
                enabled: isEnabled,
                discountPercent: discountValue,
            });

            if (result.success) {
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2000);
            } else {
                setSaveStatus("error");
                setTimeout(() => setSaveStatus("idle"), 3000);
            }
        });
    };

    const handleToggle = () => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        // Auto-save on toggle
        startTransition(async () => {
            await savePromotion(hotelId, {
                enabled: newValue,
                discountPercent: discountValue,
            });
        });
    };

    const handleDiscountChange = (delta: number) => {
        const newValue = Math.max(0, Math.min(50, discountValue + delta));
        setDiscountValue(newValue);
    };

    return (
        <div className="oyo-promo-banner">
            <div className="oyo-promo-header">
                <span className="oyo-promo-title">Set Basic Promotion</span>
                <button
                    className={`oyo-toggle ${isEnabled ? "active" : ""}`}
                    onClick={handleToggle}
                    disabled={isPending}
                    aria-label="Toggle promotion"
                />
            </div>
            <p className="oyo-promo-text">
                Earn <strong>৳25,000</strong> extra revenue/month by spending{" "}
                <strong>৳1,600/month</strong> to attract Zinu&apos;s most loyal customers
            </p>
            <div className="oyo-promo-controls">
                <div className="oyo-promo-box">
                    <span style={{ fontSize: "0.75rem" }}>Discount by You</span>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <button
                            onClick={() => handleDiscountChange(-1)}
                            disabled={isPending}
                            style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "4px",
                                border: "none",
                                background: "rgba(255,255,255,0.3)",
                                color: "white",
                                cursor: isPending ? "not-allowed" : "pointer",
                                opacity: isPending ? 0.5 : 1,
                            }}
                        >
                            −
                        </button>
                        <span style={{ fontWeight: 700, minWidth: "2rem", textAlign: "center" }}>
                            {discountValue}%
                        </span>
                        <button
                            onClick={() => handleDiscountChange(1)}
                            disabled={isPending}
                            style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "4px",
                                border: "none",
                                background: "rgba(255,255,255,0.3)",
                                color: "white",
                                cursor: isPending ? "not-allowed" : "pointer",
                                opacity: isPending ? 0.5 : 1,
                            }}
                        >
                            +
                        </button>
                    </div>
                </div>
                <div className="oyo-promo-box">
                    <div>
                        <div style={{ fontSize: "0.625rem", color: "#fef08a" }}>OFFER</div>
                        <div style={{ fontSize: "0.75rem" }}>Additional</div>
                        <div style={{ fontSize: "0.75rem" }}>Discount by Zinu</div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "1.25rem" }}>{additionalDiscount}%</span>
                </div>
            </div>

            {/* Save Button */}
            <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                <button
                    onClick={handleSave}
                    disabled={isPending || saveStatus === "saving"}
                    style={{
                        padding: "0.5rem 1.25rem",
                        borderRadius: "6px",
                        border: "none",
                        background: saveStatus === "saved" ? "#10b981" : saveStatus === "error" ? "#ef4444" : "rgba(255,255,255,0.25)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        cursor: isPending ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                    }}
                >
                    {saveStatus === "saving" ? "Saving..." :
                        saveStatus === "saved" ? "✓ Saved" :
                            saveStatus === "error" ? "Error" :
                                "Save Changes"}
                </button>
            </div>
        </div>
    );
}
