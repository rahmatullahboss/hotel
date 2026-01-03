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
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleSave = () => {
        setSaveStatus("saving");
        setErrorMessage("");
        startTransition(async () => {
            console.log("[PromoBanner] Saving promotion:", {
                hotelId,
                enabled: isEnabled,
                discountPercent: discountValue,
            });

            const result = await savePromotion(hotelId, {
                enabled: isEnabled,
                discountPercent: discountValue,
            });

            if (result.success) {
                console.log("[PromoBanner] Save successful");
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2000);
            } else {
                console.error("[PromoBanner] Save failed:", result.error);
                setSaveStatus("error");
                setErrorMessage(result.error || "Failed to save promotion");
                setTimeout(() => {
                    setSaveStatus("idle");
                    setErrorMessage("");
                }, 3000);
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
        <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -10px rgba(37, 99, 235, 0.5)'
        }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-32px', right: '-32px', width: '128px', height: '128px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px' }} />
            <div style={{ position: 'absolute', bottom: '-24px', left: '-24px', width: '96px', height: '96px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px' }} />
            
            <div style={{ position: 'relative', zIndex: 10 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Set Basic Promotion</span>
                    <button
                        onClick={handleToggle}
                        disabled={isPending}
                        aria-label="Toggle promotion"
                        style={{
                            width: '52px',
                            height: '28px',
                            borderRadius: '9999px',
                            border: 'none',
                            background: isEnabled ? '#10b981' : 'rgba(255,255,255,0.3)',
                            cursor: isPending ? 'not-allowed' : 'pointer',
                            position: 'relative',
                            transition: 'background 0.2s'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '2px',
                            left: isEnabled ? '26px' : '2px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '9999px',
                            background: 'white',
                            transition: 'left 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                    </button>
                </div>
                
                {/* Description */}
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px', lineHeight: '1.5' }}>
                    Earn <strong>৳25,000</strong> extra revenue/month by spending{" "}
                    <strong>৳1,600/month</strong> to attract Zinu&apos;s most loyal customers
                </p>
                
                {/* Controls */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Discount by You */}
                    <div style={{
                        flex: 1,
                        minWidth: '140px',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>Discount by You</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                onClick={() => handleDiscountChange(-1)}
                                disabled={isPending}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.3)',
                                    color: 'white',
                                    cursor: isPending ? 'not-allowed' : 'pointer',
                                    opacity: isPending ? 0.5 : 1,
                                    fontSize: '18px',
                                    fontWeight: 'bold'
                                }}
                            >
                                −
                            </button>
                            <span style={{ fontWeight: 700, fontSize: '24px', minWidth: '48px', textAlign: 'center' }}>
                                {discountValue}%
                            </span>
                            <button
                                onClick={() => handleDiscountChange(1)}
                                disabled={isPending}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.3)',
                                    color: 'white',
                                    cursor: isPending ? 'not-allowed' : 'pointer',
                                    opacity: isPending ? 0.5 : 1,
                                    fontSize: '18px',
                                    fontWeight: 'bold'
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    {/* Additional Discount */}
                    <div style={{
                        flex: 1,
                        minWidth: '140px',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', background: '#fef08a', color: '#78350f', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>OFFER</span>
                            <span style={{ fontSize: '12px', opacity: 0.8 }}>Additional by Zinu</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '24px' }}>{additionalDiscount}%</span>
                    </div>
                </div>

                {/* Save Button */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSave}
                        disabled={isPending || saveStatus === "saving"}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            background: saveStatus === "saved" ? "#10b981" : saveStatus === "error" ? "#ef4444" : "rgba(255,255,255,0.25)",
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: isPending ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(12px)'
                        }}
                    >
                        {saveStatus === "saving" ? "Saving..." :
                            saveStatus === "saved" ? "✓ Saved" :
                                saveStatus === "error" ? "Error" :
                                    "Save Changes"}
                    </button>
                </div>
                
                {/* Error Message */}
                {errorMessage && (
                    <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        fontSize: '12px',
                        color: 'white',
                        textAlign: 'center',
                    }}>
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
