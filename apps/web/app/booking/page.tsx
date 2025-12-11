"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { createBooking } from "../actions/bookings";
import { getUserProfile } from "../actions/profile";
import { BookingQRCode, BottomNav } from "../components";

type PaymentMethod = "BKASH" | "NAGAD" | "CARD" | "PAY_AT_HOTEL";

const paymentMethods: { id: PaymentMethod; name: string; icon: string; advancePercent: number }[] = [
    { id: "PAY_AT_HOTEL", name: "Pay at Hotel", icon: "🏨", advancePercent: 20 },
    { id: "BKASH", name: "bKash", icon: "📱", advancePercent: 10 },
    { id: "NAGAD", name: "Nagad", icon: "📱", advancePercent: 10 },
    { id: "CARD", name: "Credit/Debit Card", icon: "💳", advancePercent: 10 },
];

function BookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    // Get params from URL
    const hotelId = searchParams.get("hotelId") || "";
    const roomId = searchParams.get("roomId") || "";
    const hotelName = searchParams.get("hotel") || "Hotel";
    const roomName = searchParams.get("room") || "Room";
    const price = Number(searchParams.get("price")) || 0;
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";

    // Calculate nights and amounts
    const nights = checkIn && checkOut
        ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
        : 1;
    const totalAmount = price * nights;

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PAY_AT_HOTEL");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingId, setBookingId] = useState("");
    const [error, setError] = useState("");

    // Get current payment method's advance requirement (after paymentMethod state is declared)
    const currentMethod = paymentMethods.find(m => m.id === paymentMethod);
    const advancePercent = currentMethod?.advancePercent || 10;
    const advanceAmount = paymentMethod === "PAY_AT_HOTEL"
        ? Math.round(totalAmount * 0.20)
        : Math.max(Math.round(totalAmount * 0.10), 50);

    // Pre-fill form with session data and profile (including phone)
    useEffect(() => {
        if (session?.user) {
            setGuestName(session.user.name || "");
            setGuestEmail(session.user.email || "");

            // Fetch user profile to get saved phone number
            if (session.user.id) {
                getUserProfile(session.user.id).then((profile) => {
                    if (profile?.phone) {
                        setGuestPhone(profile.phone);
                    }
                });
            }
        }
    }, [session]);

    // Redirect to sign in if not authenticated
    if (status === "loading") {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <div className="skeleton" style={{ width: 200, height: 24, margin: "0 auto" }} />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <main style={{ padding: "2rem", textAlign: "center" }}>
                <div className="card" style={{ padding: "2rem", maxWidth: 400, margin: "0 auto" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                    <h2 style={{ marginBottom: "0.5rem" }}>Sign In Required</h2>
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                        Please sign in to complete your booking
                    </p>
                    <Link
                        href={`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`}
                        className="btn btn-primary btn-block"
                    >
                        Sign In to Continue
                    </Link>
                </div>
            </main>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (step === 1) {
            if (!guestName || !guestPhone) {
                setError("Please fill in all required fields");
                return;
            }
            setStep(2);
            return;
        }

        if (step === 2) {
            setIsSubmitting(true);

            try {
                const result = await createBooking({
                    hotelId,
                    roomId,
                    guestName,
                    guestPhone,
                    guestEmail: guestEmail || undefined,
                    checkIn,
                    checkOut,
                    paymentMethod,
                    totalAmount,
                    userId: session?.user?.id,
                });

                if (result.success && result.bookingId) {
                    setBookingId(result.bookingId);

                    // Handle different payment methods
                    if (paymentMethod === "BKASH") {
                        // Initiate bKash payment
                        try {
                            const paymentResponse = await fetch("/api/payment/initiate", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ bookingId: result.bookingId }),
                            });
                            const paymentData = await paymentResponse.json();

                            if (paymentData.success && paymentData.redirectUrl) {
                                // Redirect to bKash
                                window.location.href = paymentData.redirectUrl;
                                return;
                            } else {
                                setError(paymentData.error || "Failed to initiate payment. Please try again.");
                                setStep(3); // Show confirmation anyway - they can pay later
                            }
                        } catch (paymentErr) {
                            setError("Payment service unavailable. Your booking is saved - you can pay at the hotel.");
                            setStep(3);
                        }
                    } else if (paymentMethod === "NAGAD" || paymentMethod === "CARD") {
                        // TODO: Implement Nagad and Card payments
                        setError("This payment method is coming soon. Your booking is saved - you can pay at the hotel.");
                        setStep(3);
                    } else {
                        // PAY_AT_HOTEL - go straight to confirmation
                        setStep(3);
                    }
                } else {
                    setError(result.error || "Failed to create booking");
                }
            } catch (err) {
                setError("An error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <>
            <main className="page-content">
                <div className="container" style={{ maxWidth: 600 }}>
                    {/* Progress Steps */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "2rem",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "15%",
                                right: "15%",
                                height: 2,
                                background: "var(--color-border)",
                                transform: "translateY(-50%)",
                                zIndex: 0,
                            }}
                        />
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    zIndex: 1,
                                }}
                            >
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        background: step >= s ? "var(--color-primary)" : "var(--color-border)",
                                        color: step >= s ? "white" : "var(--color-text-muted)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    {step > s ? "✓" : s}
                                </div>
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        marginTop: "0.5rem",
                                        color: step >= s ? "var(--color-text-primary)" : "var(--color-text-muted)",
                                    }}
                                >
                                    {s === 1 ? "Details" : s === 2 ? "Payment" : "Confirm"}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Booking Summary Card */}
                    <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                        <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{hotelName}</h3>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                            {roomName}
                        </p>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "0.75rem",
                                paddingTop: "0.75rem",
                                borderTop: "1px solid var(--color-border)",
                                fontSize: "0.875rem",
                            }}
                        >
                            <span>{checkIn} → {checkOut}</span>
                            <span>{nights} night{nights > 1 ? "s" : ""}</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            style={{
                                padding: "1rem",
                                marginBottom: "1rem",
                                background: "rgba(208, 0, 0, 0.1)",
                                color: "var(--color-error)",
                                borderRadius: "0.5rem",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Step 1: Guest Details */}
                    {step === 1 && (
                        <form onSubmit={handleSubmit}>
                            <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                                <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Guest Details</h3>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="As per ID"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="01XXXXXXXXX"
                                        value={guestPhone}
                                        onChange={(e) => setGuestPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Email (Optional)</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="For confirmation"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block btn-lg">
                                Continue to Payment
                            </button>
                        </form>
                    )}

                    {/* Step 2: Payment Method */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit}>
                            <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                                <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Select Payment</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {paymentMethods.map((method) => (
                                        <label
                                            key={method.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "1rem",
                                                padding: "1rem",
                                                border: `2px solid ${paymentMethod === method.id ? "var(--color-primary)" : "var(--color-border)"}`,
                                                borderRadius: "0.75rem",
                                                cursor: "pointer",
                                                background: paymentMethod === method.id ? "rgba(230, 57, 70, 0.05)" : "transparent",
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={paymentMethod === method.id}
                                                onChange={() => setPaymentMethod(method.id)}
                                                style={{ width: 20, height: 20 }}
                                            />
                                            <span style={{ fontSize: "1.5rem" }}>{method.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <span style={{ fontWeight: 500 }}>{method.name}</span>
                                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                    {method.advancePercent}% advance required
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span>Room × {nights} night{nights > 1 ? "s" : ""}</span>
                                    <span>৳{(price * nights).toLocaleString()}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span>Taxes & Fees</span>
                                    <span>Included</span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        paddingTop: "0.75rem",
                                        borderTop: "1px solid var(--color-border)",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    <span style={{ fontWeight: 600 }}>Total</span>
                                    <span style={{ fontWeight: 600 }}>
                                        ৳{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "0.75rem",
                                        background: "rgba(29, 53, 87, 0.05)",
                                        borderRadius: "0.5rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    <span style={{ color: "var(--color-primary)" }}>
                                        {paymentMethod === "PAY_AT_HOTEL" ? "Pay Now (20%)" : "Booking Fee"}
                                    </span>
                                    <span style={{ color: "var(--color-primary)" }}>
                                        ৳{advanceAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.5rem", textAlign: "center" }}>
                                    Deducted from your wallet balance
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 2 }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    background: "rgba(42, 157, 143, 0.1)",
                                    color: "var(--color-success)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "2.5rem",
                                    margin: "0 auto 1rem",
                                }}
                            >
                                ✓
                            </div>
                            <h2 style={{ marginBottom: "0.5rem" }}>Booking Confirmed!</h2>
                            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                                Your booking has been successfully created.
                            </p>

                            {/* QR Code for check-in */}
                            <div style={{ marginBottom: "1.5rem" }}>
                                <BookingQRCode bookingId={bookingId} size={180} />
                            </div>

                            <div
                                style={{
                                    background: "var(--color-bg-secondary)",
                                    padding: "1rem",
                                    borderRadius: "0.75rem",
                                    marginBottom: "1.5rem",
                                }}
                            >
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    Booking ID
                                </div>
                                <div style={{ fontWeight: 700, fontFamily: "monospace" }}>
                                    {bookingId.slice(0, 8).toUpperCase()}
                                </div>
                            </div>

                            <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "var(--color-text-secondary)" }}>Hotel</span>
                                    <span style={{ fontWeight: 500 }}>{hotelName}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "var(--color-text-secondary)" }}>Check-in</span>
                                    <span style={{ fontWeight: 500 }}>{checkIn}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "var(--color-text-secondary)" }}>Check-out</span>
                                    <span style={{ fontWeight: 500 }}>{checkOut}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--color-text-secondary)" }}>Total</span>
                                    <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                                        ৳{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Link href="/bookings" className="btn btn-primary btn-block">
                                View My Bookings
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <BottomNav />
        </>);
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
            <BookingContent />
        </Suspense>
    );
}
