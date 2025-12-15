"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BottomNav } from "../components";
import { customerSelfCheckIn } from "../actions/checkin";
import { FiSmartphone, FiCheckCircle, FiXCircle, FiCalendar, FiLock, FiCamera, FiAlertTriangle } from "react-icons/fi";
import { FaHotel, FaBed } from "react-icons/fa";

export default function CheckInPage() {
    const t = useTranslations("checkin");
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        booking?: {
            hotelName: string;
            roomName: string;
            checkIn: string;
            checkOut: string;
        };
    } | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin?callbackUrl=/checkin");
        }
    }, [status, router]);

    const handleScan = async (decodedText: string) => {
        setIsScanning(false);
        setProcessing(true);

        try {
            // Parse QR code data
            let qrData;
            try {
                qrData = JSON.parse(decodedText);
            } catch {
                setResult({
                    success: false,
                    message: t("invalidQR"),
                });
                setProcessing(false);
                return;
            }

            // Verify it's a hotel check-in QR
            if (!qrData || qrData.type !== "HOTEL_CHECKIN" || !qrData.hotelId) {
                setResult({
                    success: false,
                    message: t("wrongQR"),
                });
                setProcessing(false);
                return;
            }

            // Perform self check-in
            if (!session?.user?.id) {
                setResult({
                    success: false,
                    message: t("signInRequired"),
                });
                setProcessing(false);
                return;
            }

            const response = await customerSelfCheckIn(qrData.hotelId, session.user.id);

            if (response.success && response.booking) {
                setResult({
                    success: true,
                    message: t("success"),
                    booking: response.booking,
                });
            } else {
                setResult({
                    success: false,
                    message: response.error || t("error"),
                });
            }
        } catch (error) {
            console.error("Check-in error:", error);
            setResult({
                success: false,
                message: error instanceof Error
                    ? `Error: ${error.message}`
                    : t("errorGeneric"),
            });
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-BD", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    if (status === "loading") {
        return (
            <div style={{ padding: "3rem", textAlign: "center" }}>
                <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
                .checkin-header {
                    padding: 1.5rem;
                    background: linear-gradient(135deg, #2a9d8f 0%, #264653 100%);
                    color: white;
                    text-align: center;
                }
                .checkin-header h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem 0;
                }
                .checkin-header p {
                    opacity: 0.9;
                    font-size: 0.875rem;
                    margin: 0;
                }
                .scan-card {
                    background: white;
                    border-radius: 1rem;
                    padding: 2rem;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    margin-bottom: 1.5rem;
                }
                .scan-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                .scan-btn {
                    width: 100%;
                    padding: 1rem;
                    font-size: 1.125rem;
                    font-weight: 600;
                    background: linear-gradient(135deg, #2a9d8f 0%, #264653 100%);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .scan-btn:active {
                    transform: scale(0.98);
                }
                .scan-btn:disabled {
                    opacity: 0.7;
                }
                .result-card {
                    background: white;
                    border-radius: 1rem;
                    padding: 2rem;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }
                .result-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                .result-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .booking-details {
                    background: var(--color-bg-secondary);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    margin: 1rem 0;
                    text-align: left;
                }
                .booking-details h3 {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                .booking-details p {
                    color: var(--color-text-secondary);
                    font-size: 0.875rem;
                    margin: 0.25rem 0;
                }
                .instructions {
                    background: var(--color-bg-secondary);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    margin-top: 1rem;
                }
                .instructions h3 {
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    font-size: 0.9375rem;
                }
                .instructions ol {
                    margin: 0;
                    padding-left: 1.25rem;
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                }
                .instructions li {
                    margin-bottom: 0.5rem;
                }
            `}</style>

            <header className="checkin-header">
                <h1><FiSmartphone size={24} style={{ marginRight: "0.5rem" }} /> {t("title")}</h1>
                <p>{t("instruction")}</p>
            </header>

            <main className="page-content">
                {!result ? (
                    <>
                        <div className="scan-card">
                            <div className="scan-icon"><FaHotel size={48} color="var(--color-primary)" /></div>
                            <h2 style={{ marginBottom: "0.5rem" }}>{t("readyTitle")}</h2>
                            <p style={{
                                color: "var(--color-text-secondary)",
                                marginBottom: "1.5rem",
                                fontSize: "0.9375rem",
                            }}>
                                {t("readyDesc")}
                            </p>
                            <button
                                className="scan-btn"
                                onClick={() => setIsScanning(true)}
                                disabled={processing}
                            >
                                {processing ? t("processing") : t("scanButton")}
                            </button>
                        </div>

                        <div className="instructions">
                            <h3>{t("howItWorks")}</h3>
                            <ol>
                                <li>{t("step1")}</li>
                                <li>{t("step2")}</li>
                                <li>{t("step3")}</li>
                                <li>{t("step4")}</li>
                            </ol>
                        </div>
                    </>
                ) : (
                    <div className="result-card">
                        <div className="result-icon">
                            {result.success ? <FiCheckCircle size={48} color="var(--color-success)" /> : <FiXCircle size={48} color="var(--color-error)" />}
                        </div>
                        <div
                            className="result-title"
                            style={{ color: result.success ? "var(--color-success)" : "var(--color-error)" }}
                        >
                            {result.message}
                        </div>

                        {result.booking && (
                            <div className="booking-details">
                                <h3><FaHotel size={16} style={{ marginRight: "0.5rem" }} /> {result.booking.hotelName}</h3>
                                <p><FaBed size={14} style={{ marginRight: "0.5rem" }} /> {result.booking.roomName}</p>
                                <p><FiCalendar size={14} style={{ marginRight: "0.5rem" }} /> {formatDate(result.booking.checkIn)} → {formatDate(result.booking.checkOut)}</p>
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
                            {result.success ? (
                                <Link href="/bookings" className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
                                    {t("viewBookings")}
                                </Link>
                            ) : (
                                <>
                                    <button
                                        className="scan-btn"
                                        onClick={() => {
                                            setResult(null);
                                            setIsScanning(true);
                                        }}
                                    >
                                        {t("tryAgain")}
                                    </button>
                                    <Link
                                        href="/bookings"
                                        className="btn btn-outline"
                                        style={{ width: "100%", padding: "0.75rem" }}
                                    >
                                        {t("checkBookings")}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* QR Scanner Modal */}
            {isScanning && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.9)",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <div style={{
                        padding: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: "white",
                    }}>
                        <h2 style={{ margin: 0, fontSize: "1.125rem" }}>{t("modalTitle")}</h2>
                        <button
                            onClick={() => setIsScanning(false)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "white",
                                fontSize: "1.5rem",
                                cursor: "pointer",
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <QRScannerComponent onScan={handleScan} />
                    </div>
                    <div style={{ padding: "1rem", textAlign: "center", color: "white" }}>
                        <p style={{ opacity: 0.8 }}>{t("modalDesc")}</p>
                    </div>
                </div>
            )}
        
            <BottomNav />
        </>
    );
}

// Inline QR Scanner Component using html5-qrcode
function QRScannerComponent({ onScan }: { onScan: (data: string) => void }) {
    const t = useTranslations("checkin");
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<"permission" | "https" | "general">("general");

    useEffect(() => {
        let html5QrCode: import("html5-qrcode").Html5Qrcode | null = null;
        let mounted = true;

        const startScanner = async () => {
            // Check if we're on HTTPS (required for camera on mobile)
            if (typeof window !== "undefined" &&
                window.location.protocol !== "https:" &&
                window.location.hostname !== "localhost") {
                setError(t("httpsError"));
                setErrorType("https");
                return;
            }

            // Check if camera is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError(t("notSupported"));
                setErrorType("general");
                return;
            }

            try {
                const { Html5Qrcode } = await import("html5-qrcode");

                if (!mounted) return;

                html5QrCode = new Html5Qrcode("qr-reader-customer");

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        html5QrCode?.stop();
                        onScan(decodedText);
                    },
                    () => { } // Ignore errors during scanning
                );
            } catch (err: unknown) {
                console.error("Scanner error:", err);

                const errorMessage = err instanceof Error ? err.message : String(err);

                if (errorMessage.includes("Permission") || errorMessage.includes("NotAllowedError")) {
                    setError(t("cameraPermission"));
                    setErrorType("permission");
                } else if (errorMessage.includes("NotFoundError") || errorMessage.includes("no camera")) {
                    setError(t("cameraNotFound"));
                    setErrorType("general");
                } else if (errorMessage.includes("NotReadableError") || errorMessage.includes("streaming")) {
                    setError(t("cameraInUse"));
                    setErrorType("general");
                } else {
                    setError(t("cameraGenericError"));
                    setErrorType("permission");
                }
            }
        };

        startScanner();

        return () => {
            mounted = false;
            html5QrCode?.stop().catch(() => { });
        };
    }, [onScan]);

    if (error) {
        return (
            <div style={{
                padding: "2rem",
                textAlign: "center",
                color: "white",
                maxWidth: "320px",
            }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    {errorType === "https" ? <FiLock size={40} /> : errorType === "permission" ? <FiCamera size={40} /> : <FiAlertTriangle size={40} />}
                </div>
                <p style={{ marginBottom: "1rem", lineHeight: 1.5 }}>{error}</p>
                {errorType === "permission" && (
                    <p style={{ fontSize: "0.8125rem", opacity: 0.8 }}>
                        Go to your browser settings → Site Settings → Camera → Allow
                    </p>
                )}
            </div>
        );
    }

    return (
        <div
            id="qr-reader-customer"
            style={{
                width: "100%",
                maxWidth: "400px",
                borderRadius: "1rem",
                overflow: "hidden",
            }}
        />
    );
}
