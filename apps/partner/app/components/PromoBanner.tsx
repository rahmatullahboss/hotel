"use client";

import { useState } from "react";

interface PromoBannerProps {
    enabled?: boolean;
    discount?: number;
    additionalDiscount?: number;
}

export function PromoBanner({
    enabled = true,
    discount = 5,
    additionalDiscount = 15,
}: PromoBannerProps) {
    const [isEnabled, setIsEnabled] = useState(enabled);
    const [discountValue, setDiscountValue] = useState(discount);

    return (
        <div className="oyo-promo-banner">
            <div className="oyo-promo-header">
                <span className="oyo-promo-title">Set Basic Promotion</span>
                <button
                    className={`oyo-toggle ${isEnabled ? "active" : ""}`}
                    onClick={() => setIsEnabled(!isEnabled)}
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
                            onClick={() => setDiscountValue(Math.max(0, discountValue - 1))}
                            style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "4px",
                                border: "none",
                                background: "rgba(255,255,255,0.3)",
                                color: "white",
                                cursor: "pointer",
                            }}
                        >
                            −
                        </button>
                        <span style={{ fontWeight: 700, minWidth: "2rem", textAlign: "center" }}>
                            {discountValue}%
                        </span>
                        <button
                            onClick={() => setDiscountValue(discountValue + 1)}
                            style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "4px",
                                border: "none",
                                background: "rgba(255,255,255,0.3)",
                                color: "white",
                                cursor: "pointer",
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
        </div>
    );
}
