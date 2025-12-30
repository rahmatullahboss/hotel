"use client";

import { useState, FormEvent } from "react";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FiCreditCard, FiLock } from "react-icons/fi";

// Initialize Stripe
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripePaymentFormProps {
    bookingId: string;
    amount: number;
    onSuccess: (bookingId: string) => void;
    onError: (error: string) => void;
    t: (key: string) => string;
}

// Stripe Card Element styling
const cardElementOptions = {
    style: {
        base: {
            fontSize: "16px",
            color: "#1D3557",
            fontFamily: "system-ui, -apple-system, sans-serif",
            "::placeholder": {
                color: "#6B7280",
            },
        },
        invalid: {
            color: "#E63946",
            iconColor: "#E63946",
        },
    },
    hidePostalCode: true,
};

function CheckoutForm({ bookingId, amount, onSuccess, onError, t }: StripePaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setCardError(null);

        try {
            // Step 1: Create payment intent on server
            const intentResponse = await fetch("/api/payment/stripe/create-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, amount }),
            });

            const intentData = await intentResponse.json();

            if (!intentData.success || !intentData.clientSecret) {
                throw new Error(intentData.error || "Failed to create payment intent");
            }

            // Step 2: Confirm payment with Stripe
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error("Card element not found");
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(
                intentData.clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                    },
                }
            );

            if (error) {
                throw new Error(error.message || "Payment failed");
            }

            if (paymentIntent?.status === "succeeded") {
                // Step 3: Verify payment on server
                const verifyResponse = await fetch("/api/payment/stripe/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
                });

                const verifyData = await verifyResponse.json();

                if (verifyData.success) {
                    onSuccess(bookingId);
                } else {
                    throw new Error(verifyData.error || "Payment verification failed");
                }
            } else {
                throw new Error("Payment was not successful");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Payment failed";
            setCardError(errorMessage);
            onError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div
                style={{
                    background: "var(--color-bg-secondary)",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    marginBottom: "1rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.75rem",
                    }}
                >
                    <FiCreditCard size={18} />
                    <span style={{ fontWeight: 500 }}>{t("cardDetails")}</span>
                </div>
                <div
                    style={{
                        background: "white",
                        borderRadius: "0.5rem",
                        padding: "0.875rem 1rem",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <CardElement options={cardElementOptions} />
                </div>
            </div>

            {cardError && (
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
                    {cardError}
                </div>
            )}

            <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={!stripe || isProcessing}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                }}
            >
                {isProcessing ? (
                    <>
                        <div
                            className="spinner"
                            style={{
                                width: 18,
                                height: 18,
                                border: "2px solid transparent",
                                borderTopColor: "white",
                                borderRadius: "50%",
                                animation: "spin 0.8s linear infinite",
                            }}
                        />
                        {t("processing")}
                    </>
                ) : (
                    <>
                        <FiLock size={18} />
                        {t("payNow")} ৳{amount.toLocaleString()}
                    </>
                )}
            </button>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginTop: "1rem",
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                }}
            >
                <FiLock size={12} />
                <span>{t("securedByStripe")}</span>
            </div>
        </form>
    );
}

// Wrapper component with Stripe Elements provider
export default function StripePaymentForm(props: StripePaymentFormProps) {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm {...props} />
        </Elements>
    );
}
