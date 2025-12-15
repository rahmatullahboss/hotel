"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { createBooking } from "../actions/bookings";
import { getUserProfile } from "../actions/profile";
import { getWalletBalance } from "../actions/wallet";
import { BottomNav, BookingQRCode } from "../components";
import { FiLock, FiClock, FiCreditCard, FiSmartphone, FiCheck } from "react-icons/fi";
import { FaHotel, FaWallet } from "react-icons/fa";

type PaymentMethod = "BKASH" | "NAGAD" | "CARD" | "PAY_AT_HOTEL" | "WALLET";

const paymentMethods: { id: PaymentMethod; nameKey: string; icon: React.ReactNode; advancePercent: number }[] = [
    { id: "WALLET", nameKey: "payByWallet", icon: <FaWallet size={24} />, advancePercent: 100 },
    { id: "PAY_AT_HOTEL", nameKey: "payAtHotel", icon: <FaHotel size={24} />, advancePercent: 20 },
    { id: "BKASH", nameKey: "bKash", icon: <FiSmartphone size={24} />, advancePercent: 100 },
    { id: "NAGAD", nameKey: "nagad", icon: <FiSmartphone size={24} />, advancePercent: 100 },
    { id: "CARD", nameKey: "creditDebitCard", icon: <FiCreditCard size={24} />, advancePercent: 100 },
];

function BookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const t = useTranslations("booking");
    const tCommon = useTranslations("common");

    // Get params from URL
    const hotelId = searchParams.get("hotelId") || "";
    const roomId = searchParams.get("roomId") || "";
    const hotelName = searchParams.get("hotel") || "Hotel";
    const roomName = searchParams.get("room") || "Room";
    const price = Number(searchParams.get("price")) || 0;
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const roomPhoto = searchParams.get("roomPhoto") || "";

    // Calculate nights and amounts
    const nights = checkIn && checkOut
        ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
        : 1;
    const totalAmount = price * nights;

    const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 4 = Advance payment method selection
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PAY_AT_HOTEL");
    const [advancePaymentMethod, setAdvancePaymentMethod] = useState<"BKASH" | "NAGAD">("BKASH");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingId, setBookingId] = useState("");
    const [pendingAdvanceAmount, setPendingAdvanceAmount] = useState(0);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [useWalletPartial, setUseWalletPartial] = useState(false); // Use wallet for partial payment
    const [error, setError] = useState("");

    // Get current payment method's advance requirement (after paymentMethod state is declared)
    const currentMethod = paymentMethods.find(m => m.id === paymentMethod);
    const advancePercent = currentMethod?.advancePercent || 100;
    const advanceAmount = paymentMethod === "PAY_AT_HOTEL"
        ? Math.round(totalAmount * 0.20)  // 20% for Pay at Hotel
        : totalAmount;  // Full payment for online methods

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

            // Fetch wallet balance
            getWalletBalance().then((balance) => {
                setWalletBalance(balance);
            });
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
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}><FiLock size={48} color="var(--color-text-secondary)" /></div>
                    <h2 style={{ marginBottom: "0.5rem" }}>{t("signInRequired")}</h2>
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                        {t("signInToBook")}
                    </p>
                    <Link
                        href={`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`}
                        className="btn btn-primary btn-block"
                    >
                        {t("signInToContinue")}
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
                setError(t("fillRequired"));
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

                    // Handle payment based on method
                    if (paymentMethod === "PAY_AT_HOTEL") {
                        if (result.requiresPayment && result.advanceAmount) {
                            // Wallet insufficient - go to step 4 to select payment method for 20% advance
                            setPendingAdvanceAmount(result.advanceAmount);
                            setStep(4);
                        } else {
                            // Wallet had enough, 20% already paid - confirm booking
                            setStep(3);
                        }
                    } else if (paymentMethod === "BKASH") {
                        // Full payment via bKash
                        try {
                            const paymentResponse = await fetch("/api/payment/initiate", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ bookingId: result.bookingId }),
                            });
                            const paymentData = await paymentResponse.json();

                            if (paymentData.success && paymentData.redirectUrl) {
                                window.location.href = paymentData.redirectUrl;
                                return;
                            } else {
                                setError(paymentData.error || t("failedToInitiate"));
                            }
                        } catch (paymentErr) {
                            setError(t("paymentServiceUnavailable"));
                        }
                    } else if (paymentMethod === "WALLET") {
                        // Wallet payment - booking is already confirmed if we reach here
                        // The createBooking action handles wallet deduction
                        if (result.walletPaymentSuccess) {
                            setStep(3); // Booking confirmed, paid from wallet
                        } else {
                            setError(result.error || t("walletPaymentFailed"));
                        }
                    } else if (paymentMethod === "NAGAD" || paymentMethod === "CARD") {
                        // TODO: Implement Nagad and Card payments
                        setError(t("paymentComingSoon"));
                    }
                } else {
                    setError(result.error || t("failedToCreate"));
                }
            } catch (err) {
                setError(t("errorOccurred"));
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Handle advance payment for Pay at Hotel when wallet is insufficient
    const handleAdvancePayment = async () => {
        setIsSubmitting(true);
        setError("");

        try {
            const paymentResponse = await fetch("/api/payment/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: bookingId,
                    amount: pendingAdvanceAmount,
                }),
            });
            const paymentData = await paymentResponse.json();

            if (paymentData.success && paymentData.redirectUrl) {
                window.location.href = paymentData.redirectUrl;
            } else {
                setError(paymentData.error || t("failedToInitiate"));
            }
        } catch (err) {
            setError(t("paymentServiceUnavailable"));
        } finally {
            setIsSubmitting(false);
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
                                    {s === 1 ? t("details") : s === 2 ? t("payment") : t("confirmStep")}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Booking Summary Card with Room Photo */}
                    <div className="card" style={{ overflow: "hidden", marginBottom: "1rem" }}>
                        {/* Room Photo */}
                        <div style={{ position: "relative", height: "140px", overflow: "hidden" }}>
                            <img
                                src={roomPhoto || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=400&fit=crop"}
                                alt={roomName}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                        <div style={{ padding: "1rem" }}>
                            <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{hotelName}</h3>
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
                                <span>{nights} {tCommon(nights > 1 ? "nights" : "night")}</span>
                            </div>
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
                                <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>{t("guestDetails")}</h3>
                                <div className="form-group">
                                    <label className="form-label">{t("guestName")} *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={t("asPerID")}
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t("guestPhone")} *</label>
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
                                    <label className="form-label">{t("guestEmail")}</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder={t("forConfirmation")}
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block btn-lg">
                                {t("continueToPayment")}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Payment Method */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit}>
                            {/* Use Wallet Balance Toggle */}
                            {walletBalance > 0 && (
                                <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <FaWallet size={18} color="var(--color-primary)" />
                                                <h3 style={{ fontWeight: 600, margin: 0 }}>{t("useWalletBalance")}</h3>
                                            </div>
                                            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                                                {t("available")}: ৳{walletBalance.toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setUseWalletPartial(!useWalletPartial)}
                                            style={{
                                                width: 56,
                                                height: 32,
                                                borderRadius: 16,
                                                background: useWalletPartial ? "var(--color-primary)" : "var(--color-border)",
                                                border: "none",
                                                cursor: "pointer",
                                                position: "relative",
                                                transition: "background 0.2s",
                                            }}
                                        >
                                            <div style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: "50%",
                                                background: "white",
                                                position: "absolute",
                                                top: 4,
                                                left: useWalletPartial ? 28 : 4,
                                                transition: "left 0.2s",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                            }} />
                                        </button>
                                    </div>

                                    {useWalletPartial && (
                                        <div style={{
                                            marginTop: "1rem",
                                            padding: "0.75rem",
                                            background: "rgba(42, 157, 143, 0.1)",
                                            borderRadius: "0.5rem",
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ color: "var(--color-success)" }}>{t("walletDeduction")}</span>
                                                <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
                                                    -৳{Math.min(walletBalance, totalAmount).toLocaleString()}
                                                </span>
                                            </div>
                                            {walletBalance < totalAmount && (
                                                <div style={{ fontSize: "0.75rem", color: "var(--color-success)", marginTop: "0.25rem" }}>
                                                    {t("remainingToPay")}: ৳{(totalAmount - walletBalance).toLocaleString()}
                                                </div>
                                            )}
                                            {walletBalance >= totalAmount && (
                                                <div style={{ fontSize: "0.75rem", color: "var(--color-success)", marginTop: "0.25rem" }}>
                                                    ✓ {t("fullyCoveredByWallet")}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Only show payment methods if there's remaining amount */}
                            {(!useWalletPartial || walletBalance < totalAmount) && (
                                <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                                    <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>
                                        {useWalletPartial ? t("payRemainingAmount") : t("selectPayment")}
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        {paymentMethods.map((method) => {
                                            const isWallet = method.id === "WALLET";
                                            const hasEnoughBalance = walletBalance >= totalAmount;
                                            const isDisabled = isWallet && !hasEnoughBalance;

                                            return (
                                                <label
                                                    key={method.id}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "1rem",
                                                        padding: "1rem",
                                                        border: `2px solid ${paymentMethod === method.id ? "var(--color-primary)" : "var(--color-border)"}`,
                                                        borderRadius: "0.75rem",
                                                        cursor: isDisabled ? "not-allowed" : "pointer",
                                                        background: paymentMethod === method.id ? "rgba(230, 57, 70, 0.05)" : "transparent",
                                                        opacity: isDisabled ? 0.5 : 1,
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value={method.id}
                                                        checked={paymentMethod === method.id}
                                                        onChange={() => !isDisabled && setPaymentMethod(method.id)}
                                                        disabled={isDisabled}
                                                        style={{ width: 20, height: 20 }}
                                                    />
                                                    <span style={{ fontSize: "1.5rem" }}>{method.icon}</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                            <span style={{ fontWeight: 500 }}>{t(method.nameKey)}</span>
                                                            {isWallet && (
                                                                <span style={{
                                                                    fontSize: "0.75rem",
                                                                    padding: "0.125rem 0.5rem",
                                                                    borderRadius: "1rem",
                                                                    background: hasEnoughBalance ? "rgba(42, 157, 143, 0.15)" : "rgba(208, 0, 0, 0.1)",
                                                                    color: hasEnoughBalance ? "var(--color-success)" : "var(--color-error)",
                                                                    fontWeight: 600,
                                                                }}>
                                                                    ৳{walletBalance.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {isWallet && !hasEnoughBalance && (
                                                            <div style={{ fontSize: "0.75rem", color: "var(--color-error)" }}>
                                                                {t("insufficientBalance")}
                                                            </div>
                                                        )}
                                                        {isWallet && hasEnoughBalance && (
                                                            <div style={{ fontSize: "0.75rem", color: "var(--color-success)" }}>
                                                                {t("instantPayment")}
                                                            </div>
                                                        )}
                                                        {method.id === "PAY_AT_HOTEL" && (
                                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                                {t("advanceRequired")}
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Price Summary */}
                            <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span>{tCommon("room")} × {nights} {tCommon(nights > 1 ? "nights" : "night")}</span>
                                    <span>৳{(price * nights).toLocaleString()}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span>{tCommon("taxesAndFees")}</span>
                                    <span>{tCommon("included")}</span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        paddingTop: "0.75rem",
                                        borderTop: "1px solid var(--color-border)",
                                        fontWeight: 700,
                                        fontSize: "1.125rem",
                                    }}
                                >
                                    <span>{t("total")}</span>
                                    <span style={{ color: "var(--color-primary)" }}>
                                        ৳{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                                {/* Show advance payment info only for Pay at Hotel */}
                                {paymentMethod === "PAY_AT_HOTEL" && (
                                    <>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                padding: "0.75rem",
                                                marginTop: "0.75rem",
                                                background: "rgba(42, 157, 143, 0.1)",
                                                borderRadius: "0.5rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            <span style={{ color: "var(--color-success)" }}>
                                                {t("payNow20")}
                                            </span>
                                            <span style={{ color: "var(--color-success)" }}>
                                                ৳{advanceAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.5rem", textAlign: "center" }}>
                                            {t("payRemainingAtHotel", { amount: `৳${(totalAmount - advanceAmount).toLocaleString()}` })}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => setStep(1)}
                                >
                                    {tCommon("back")}
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 2 }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? tCommon("processing") : t("confirmBooking")}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 4: Advance Payment Method Selection (for Pay at Hotel with insufficient wallet) */}
                    {step === 4 && (
                        <div className="card" style={{ padding: "1.5rem" }}>
                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: "1.5rem",
                                }}
                            >
                                <div
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        background: "rgba(230, 57, 70, 0.1)",
                                        color: "var(--color-primary)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1.5rem",
                                        margin: "0 auto 1rem",
                                    }}
                                >
                                    <FiCreditCard size={28} />
                                </div>
                                <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                                    {t("pay20Advance")}
                                </h3>
                                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                                    {t("walletInsufficient", { amount: `৳${pendingAdvanceAmount.toLocaleString()}` })}
                                </p>
                            </div>

                            {/* Booking hold notice */}
                            <div
                                style={{
                                    background: "rgba(255, 193, 7, 0.1)",
                                    border: "1px solid rgba(255, 193, 7, 0.3)",
                                    borderRadius: "0.5rem",
                                    padding: "0.75rem",
                                    marginBottom: "1rem",
                                    textAlign: "center",
                                    fontSize: "0.875rem",
                                }}
                            >
                                <strong><FiClock size={16} style={{ marginRight: "0.5rem" }} /> {t("roomHeld")}</strong>
                                <div style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                                    {t("completePaymentToConfirm")}
                                </div>
                            </div>

                            {/* Amount to pay */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "1rem",
                                    background: "rgba(42, 157, 143, 0.1)",
                                    borderRadius: "0.5rem",
                                    marginBottom: "1rem",
                                    fontWeight: 600,
                                }}
                            >
                                <span>{t("amountToPay")}</span>
                                <span style={{ color: "var(--color-success)", fontSize: "1.25rem" }}>
                                    ৳{pendingAdvanceAmount.toLocaleString()}
                                </span>
                            </div>

                            {/* Payment method selection */}
                            <div style={{ marginBottom: "1rem" }}>
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        padding: "1rem",
                                        border: `2px solid ${advancePaymentMethod === "BKASH" ? "var(--color-primary)" : "var(--color-border)"}`,
                                        borderRadius: "0.75rem",
                                        cursor: "pointer",
                                        marginBottom: "0.5rem",
                                        background: advancePaymentMethod === "BKASH" ? "rgba(230, 57, 70, 0.05)" : "transparent",
                                    }}
                                    onClick={() => setAdvancePaymentMethod("BKASH")}
                                >
                                    <input
                                        type="radio"
                                        checked={advancePaymentMethod === "BKASH"}
                                        onChange={() => setAdvancePaymentMethod("BKASH")}
                                        style={{ width: 20, height: 20 }}
                                    />
                                    <span style={{ fontSize: "1.5rem" }}><FiSmartphone size={24} /></span>
                                    <span style={{ fontWeight: 500 }}>{t("bKash")}</span>
                                </label>
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        padding: "1rem",
                                        border: `2px solid ${advancePaymentMethod === "NAGAD" ? "var(--color-primary)" : "var(--color-border)"}`,
                                        borderRadius: "0.75rem",
                                        cursor: "pointer",
                                        background: advancePaymentMethod === "NAGAD" ? "rgba(230, 57, 70, 0.05)" : "transparent",
                                    }}
                                    onClick={() => setAdvancePaymentMethod("NAGAD")}
                                >
                                    <input
                                        type="radio"
                                        checked={advancePaymentMethod === "NAGAD"}
                                        onChange={() => setAdvancePaymentMethod("NAGAD")}
                                        style={{ width: 20, height: 20 }}
                                    />
                                    <span style={{ fontSize: "1.5rem" }}><FiSmartphone size={24} /></span>
                                    <span style={{ fontWeight: 500 }}>{t("nagad")}</span>
                                    <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                        {tCommon("comingSoon")}
                                    </span>
                                </label>
                            </div>

                            {error && (
                                <div
                                    style={{
                                        padding: "0.75rem",
                                        marginBottom: "1rem",
                                        background: "rgba(208, 0, 0, 0.1)",
                                        color: "var(--color-error)",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                className="btn btn-primary btn-block btn-lg"
                                onClick={handleAdvancePayment}
                                disabled={isSubmitting || advancePaymentMethod === "NAGAD"}
                            >
                                {isSubmitting ? tCommon("processing") : `${t("payNow")} ৳${pendingAdvanceAmount.toLocaleString()}`}
                            </button>
                        </div>
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
                            <h2 style={{ marginBottom: "0.5rem" }}>{t("bookingConfirmed")}</h2>
                            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                                {t("bookingCreated")}
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
                                    {t("bookingId")}
                                </div>
                                <div style={{ fontWeight: 700, fontFamily: "monospace" }}>
                                    {bookingId.slice(0, 8).toUpperCase()}
                                </div>
                            </div>

                            <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "var(--color-text-secondary)" }}>{tCommon("room")}</span>
                                    <span style={{ fontWeight: 500 }}>{hotelName}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "var(--color-text-secondary)" }}>{t("checkInDate")}</span>
                                    <span style={{ fontWeight: 500 }}>{checkIn}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "var(--color-text-secondary)" }}>{t("checkOutDate")}</span>
                                    <span style={{ fontWeight: 500 }}>{checkOut}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--color-text-secondary)" }}>{t("total")}</span>
                                    <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                                        ৳{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Link href="/bookings" className="btn btn-primary btn-block">
                                {t("viewMyBookings")}
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </>);
}

function BookingLoadingSkeleton() {
    return (
        <main className="page-content">
            <div className="container" style={{ maxWidth: 600 }}>
                {/* Progress Steps Skeleton */}
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
                                className="skeleton"
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                }}
                            />
                            <div
                                className="skeleton"
                                style={{
                                    width: 50,
                                    height: 12,
                                    marginTop: "0.5rem",
                                    borderRadius: "0.25rem",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Room Image and Details Skeleton */}
                <div className="card" style={{ overflow: "hidden", marginBottom: "1rem" }}>
                    <div className="skeleton" style={{ height: 140, borderRadius: 0 }} />
                    <div style={{ padding: "1rem" }}>
                        <div className="skeleton" style={{ width: "70%", height: 20, marginBottom: "0.5rem" }} />
                        <div className="skeleton" style={{ width: "50%", height: 14, marginBottom: "0.75rem" }} />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingTop: "0.75rem",
                                borderTop: "1px solid var(--color-border)",
                            }}
                        >
                            <div className="skeleton" style={{ width: 120, height: 14 }} />
                            <div className="skeleton" style={{ width: 60, height: 14 }} />
                        </div>
                    </div>
                </div>

                {/* Form Skeleton */}
                <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                    <div className="skeleton" style={{ width: 120, height: 20, marginBottom: "1.25rem" }} />

                    {/* Form Fields */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ marginBottom: "1rem" }}>
                            <div className="skeleton" style={{ width: 80, height: 12, marginBottom: "0.5rem" }} />
                            <div className="skeleton" style={{ height: 44, borderRadius: "0.5rem" }} />
                        </div>
                    ))}
                </div>

                {/* Submit Button Skeleton */}
                <div className="skeleton" style={{ height: 52, borderRadius: "0.75rem" }} />
            </div>
        </main>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<BookingLoadingSkeleton />}>
            <BookingContent />
        </Suspense>
    );
}
