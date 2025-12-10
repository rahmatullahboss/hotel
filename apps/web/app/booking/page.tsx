"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Mock booking data
const mockBookingData = {
    hotel: {
        name: "Hotel Sunrise",
        location: "Gulshan 2, Dhaka",
        room: "Standard Double",
        price: 2500,
    },
    dates: {
        checkIn: "2024-12-15",
        checkOut: "2024-12-16",
        nights: 1,
    },
};

type PaymentMethod = "BKASH" | "NAGAD" | "CARD" | "PAY_AT_HOTEL";

const paymentMethods: { id: PaymentMethod; name: string; icon: string }[] = [
    { id: "PAY_AT_HOTEL", name: "Pay at Hotel", icon: "🏨" },
    { id: "BKASH", name: "bKash", icon: "📱" },
    { id: "NAGAD", name: "Nagad", icon: "📱" },
    { id: "CARD", name: "Credit/Debit Card", icon: "💳" },
];

function BookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PAY_AT_HOTEL");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { hotel, dates } = mockBookingData;
    const totalAmount = hotel.price * dates.nights;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            setStep(2);
            return;
        }

        if (step === 2) {
            setIsSubmitting(true);
            // Simulate API call
            await new Promise((r) => setTimeout(r, 1500));
            setStep(3);
            setIsSubmitting(false);
            return;
        }
    };

    // Success Screen
    if (step === 3) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem",
                    textAlign: "center",
                    background: "var(--color-bg-secondary)",
                }}
            >
                <div
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "var(--color-success)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1.5rem",
                    }}
                >
                    <span style={{ fontSize: "2.5rem", color: "white" }}>✓</span>
                </div>

                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Booking Confirmed!
                </h1>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
                    Your booking ID: <strong>VBK-{Math.random().toString(36).substr(2, 6).toUpperCase()}</strong>
                </p>

                <div
                    className="card"
                    style={{ padding: "1.5rem", width: "100%", maxWidth: "400px", marginBottom: "1.5rem" }}
                >
                    <div style={{ marginBottom: "1rem" }}>
                        <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>{hotel.name}</div>
                        <div style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                            {hotel.location}
                        </div>
                    </div>
                    <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span>Room</span>
                            <span>{hotel.room}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span>Check-in</span>
                            <span>{dates.checkIn}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span>Check-out</span>
                            <span>{dates.checkOut}</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontWeight: 700,
                                paddingTop: "0.5rem",
                                borderTop: "1px solid var(--color-border)",
                                marginTop: "0.5rem",
                            }}
                        >
                            <span>Total</span>
                            <span style={{ color: "var(--color-primary)" }}>
                                ৳{totalAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-primary btn-block"
                    style={{ maxWidth: "400px" }}
                    onClick={() => router.push("/bookings")}
                >
                    View My Bookings
                </button>

                <button
                    className="btn btn-outline"
                    style={{ maxWidth: "400px", marginTop: "0.75rem" }}
                    onClick={() => router.push("/")}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <header
                style={{
                    padding: "1rem",
                    background: "white",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                <button
                    onClick={() => (step === 1 ? router.back() : setStep(1))}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                    }}
                >
                    ←
                </button>
                <div>
                    <h1 style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                        {step === 1 ? "Guest Details" : "Payment"}
                    </h1>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                        Step {step} of 2
                    </p>
                </div>
            </header>

            <main style={{ padding: "1rem" }}>
                {/* Booking Summary */}
                <div
                    className="card"
                    style={{ padding: "1rem", marginBottom: "1.5rem" }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{hotel.name}</div>
                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                {hotel.room} • {dates.nights} night{dates.nights > 1 ? "s" : ""}
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                {dates.checkIn} → {dates.checkOut}
                            </div>
                        </div>
                        <div className="hotel-price">
                            ৳{totalAmount.toLocaleString()}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <>
                            {/* Guest Details Form */}
                            <div className="form-group">
                                <label htmlFor="guestName" className="form-label">
                                    Full Name *
                                </label>
                                <input
                                    id="guestName"
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your full name"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="guestPhone" className="form-label">
                                    Phone Number *
                                </label>
                                <input
                                    id="guestPhone"
                                    type="tel"
                                    className="form-input"
                                    placeholder="01XXXXXXXXX"
                                    value={guestPhone}
                                    onChange={(e) => setGuestPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="guestEmail" className="form-label">
                                    Email (Optional)
                                </label>
                                <input
                                    id="guestEmail"
                                    type="email"
                                    className="form-input"
                                    placeholder="your@email.com"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Payment Method Selection */}
                            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                                Select Payment Method
                            </h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.id)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            padding: "1rem",
                                            border: paymentMethod === method.id
                                                ? "2px solid var(--color-primary)"
                                                : "2px solid var(--color-border)",
                                            borderRadius: "0.75rem",
                                            background: "white",
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        <span style={{ fontSize: "1.5rem" }}>{method.icon}</span>
                                        <span style={{ fontWeight: 500 }}>{method.name}</span>
                                        {method.id === "PAY_AT_HOTEL" && (
                                            <span
                                                className="badge-pay-hotel"
                                                style={{ marginLeft: "auto" }}
                                            >
                                                Recommended
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {paymentMethod === "PAY_AT_HOTEL" && (
                                <p
                                    style={{
                                        marginTop: "1rem",
                                        padding: "1rem",
                                        background: "rgba(42, 157, 143, 0.1)",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                        color: "var(--color-success)",
                                    }}
                                >
                                    ✓ No advance payment required. Pay directly at the hotel during check-in.
                                </p>
                            )}
                        </>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-block btn-lg"
                        style={{ marginTop: "2rem" }}
                        disabled={isSubmitting || (step === 1 && (!guestName || !guestPhone))}
                    >
                        {isSubmitting
                            ? "Processing..."
                            : step === 1
                                ? "Continue to Payment"
                                : paymentMethod === "PAY_AT_HOTEL"
                                    ? "Confirm Booking"
                                    : `Pay ৳${totalAmount.toLocaleString()}`}
                    </button>
                </form>
            </main>
        </>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
            <BookingContent />
        </Suspense>
    );
}
