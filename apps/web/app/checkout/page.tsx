"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BottomNav } from "../components";
import { customerSelfCheckOut } from "../actions/checkin";
import { FiLock, FiRefreshCw, FiCamera, FiAlertTriangle } from "react-icons/fi";
import { FaHandPeace } from "react-icons/fa";

export default function CheckOutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const t = useTranslations("checkoutPage");
    const [scanning, setScanning] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        booking?: {
            id: string;
            hotelName: string;
            roomName: string;
            checkIn: string;
            checkOut: string;
        };
    } | null>(null);

    // Redirect to sign in if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin?callbackUrl=/checkout");
        }
    }, [status, router]);

    const handleScan = async (decodedText: string) => {
        if (processing) return;

        setProcessing(true);
        setScanning(false);

        try {
            // Parse QR code data
            const qrData = JSON.parse(decodedText);

            // Validate QR code type
            if (qrData.type !== "HOTEL_CHECKIN" && qrData.type !== "HOTEL_CHECKOUT") {
                setResult({
                    success: false,
                    message: t("invalidQR"),
                });
                setProcessing(false);
                return;
            }

            if (!qrData.hotelId) {
                setResult({
                    success: false,
                    message: t("invalidQRFormat"),
                });
                setProcessing(false);
                return;
            }

            // Call the check-out action
            const userId = session?.user?.id;
            if (!userId) {
                setResult({
                    success: false,
                    message: t("pleaseSignIn"),
                });
                setProcessing(false);
                return;
            }
            const response = await customerSelfCheckOut(qrData.hotelId, userId);

            if (response.success && response.booking) {
                setResult({
                    success: true,
                    message: t("checkoutSuccess"),
                    booking: response.booking,
                });
            } else {
                setResult({
                    success: false,
                    message: response.error || t("checkoutFailedMessage"),
                });
            }
        } catch (error) {
            setResult({
                success: false,
                message: t("invalidQRCodeFormat"),
            });
        }

        setProcessing(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    };

    if (status === "loading") {
        return (
            <>
                <main className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                    <div className="skeleton" style={{ width: 200, height: 200, borderRadius: "1rem" }} />
                </main>
                <BottomNav />
            </>
        );
    }

    if (!session?.user) {
        return (
            <>
                <main className="container page-content" style={{ paddingTop: "2rem" }}>
                    <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}><FiLock size={48} color="var(--color-text-secondary)" /></div>
                        <h2 style={{ marginBottom: "0.5rem" }}>{t("signInRequired")}</h2>
                        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                            {t("signInToCheckout")}
                        </p>
                        <Link href="/auth/signin?callbackUrl=/checkout" className="btn btn-primary btn-block">
                            {t("signInToContinue")}
                        </Link>
                    </div>
                </main>
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <main className="container page-content" style={{ paddingTop: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", textAlign: "center" }}>
                    {t("title")}
                </h1>

                {/* Result View */}
                {result && (
                    <div className="card" style={{ padding: "2rem", textAlign: "center", marginBottom: "1rem" }}>
                        {result.success ? (
                            <>
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
                                <h2 style={{ marginBottom: "0.5rem" }}>{t("checkoutComplete")}</h2>
                                <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                                    {t("thankYou")}
                                </p>

                                {result.booking && (
                                    <div
                                        style={{
                                            background: "var(--color-bg-secondary)",
                                            padding: "1rem",
                                            borderRadius: "0.75rem",
                                            marginBottom: "1.5rem",
                                            textAlign: "left",
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                                            {result.booking.hotelName}
                                        </div>
                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                            {result.booking.roomName}
                                        </div>
                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "0.5rem" }}>
                                            {formatDate(result.booking.checkIn)} → {formatDate(result.booking.checkOut)}
                                        </div>
                                    </div>
                                )}

                                <Link href="/bookings" className="btn btn-primary btn-block">
                                    {t("viewBookingHistory")}
                                </Link>
                            </>
                        ) : (
                            <>
                                <div
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                        background: "rgba(208, 0, 0, 0.1)",
                                        color: "var(--color-error)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "2.5rem",
                                        margin: "0 auto 1rem",
                                    }}
                                >
                                    ✕
                                </div>
                                <h2 style={{ marginBottom: "0.5rem" }}>{t("checkoutFailed")}</h2>
                                <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                                    {result.message}
                                </p>
                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={() => {
                                        setResult(null);
                                        setScanning(true);
                                    }}
                                >
                                    {t("tryAgain")}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Scanner View */}
                {!result && (
                    <>
                        {scanning ? (
                            <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                                <QRScannerComponent onScan={handleScan} t={t} />
                                <button
                                    className="btn btn-outline btn-block"
                                    style={{ marginTop: "1rem" }}
                                    onClick={() => setScanning(false)}
                                >
                                    {t("cancel")}
                                </button>
                            </div>
                        ) : (
                            <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                                {processing ? (
                                    <>
                                        <div
                                            style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: "50%",
                                                background: "var(--color-bg-secondary)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "2rem",
                                                margin: "0 auto 1rem",
                                                animation: "pulse 1.5s infinite",
                                            }}
                                        >
                                            <FiRefreshCw size={32} style={{ animation: "spin 1s linear infinite" }} />
                                        </div>
                                        <h2 style={{ marginBottom: "0.5rem" }}>{t("processing")}</h2>
                                        <p style={{ color: "var(--color-text-secondary)" }}>
                                            {t("verifyingCheckout")}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            style={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: "1rem",
                                                background: "linear-gradient(135deg, #457b9d 0%, #1d3557 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "2.5rem",
                                                margin: "0 auto 1.5rem",
                                                color: "white",
                                            }}
                                        >
                                            <FaHandPeace size={40} />
                                        </div>
                                        <h2 style={{ marginBottom: "0.5rem" }}>{t("readyToLeave")}</h2>
                                        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                                            {t("scanToCheckout")}
                                        </p>
                                        <button
                                            className="btn btn-primary btn-block btn-lg"
                                            onClick={() => setScanning(true)}
                                        >
                                            <FiCamera size={20} style={{ marginRight: "0.5rem" }} /> {t("scanQRCode")}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="card" style={{ padding: "1.5rem", marginTop: "1rem" }}>
                            <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>{t("howToCheckout")}</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                                    <span style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        background: "var(--color-primary)",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        flexShrink: 0,
                                    }}>1</span>
                                    <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
                                        {t("step1")}
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                                    <span style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        background: "var(--color-primary)",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        flexShrink: 0,
                                    }}>2</span>
                                    <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
                                        {t("step2")}
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                                    <span style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        background: "var(--color-primary)",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        flexShrink: 0,
                                    }}>3</span>
                                    <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
                                        {t("step3")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <BottomNav />
        </>
    );
}

// Inline QR Scanner Component using html5-qrcode
function QRScannerComponent({ onScan, t }: { onScan: (data: string) => void; t: (key: string) => string }) {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let html5QrCode: any = null;

        const startScanner = async () => {
            try {
                const { Html5Qrcode } = await import("html5-qrcode");
                html5QrCode = new Html5Qrcode("qr-reader");

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText: string) => {
                        html5QrCode.stop().catch(console.error);
                        onScan(decodedText);
                    },
                    () => { } // Ignore errors during scanning
                );
            } catch (err) {
                console.error("Error starting QR scanner:", err);
                setError(t("cameraError"));
            }
        };

        startScanner();

        return () => {
            if (html5QrCode) {
                html5QrCode.stop().catch(console.error);
            }
        };
    }, [onScan, t]);

    if (error) {
        return (
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ color: "var(--color-error)", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}><FiAlertTriangle size={20} /> {error}</div>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    {t("allowCamera")}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div id="qr-reader" style={{ width: "100%", borderRadius: "0.75rem", overflow: "hidden" }} />
            <p style={{ textAlign: "center", marginTop: "0.75rem", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                {t("pointCamera")}
            </p>
        </div>
    );
}
