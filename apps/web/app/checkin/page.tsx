"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "../components";
import { customerSelfCheckIn } from "../actions/checkin";

export default function CheckInPage() {
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
                    message: "Invalid QR code. Please scan the hotel check-in QR code.",
                });
                setProcessing(false);
                return;
            }

            // Verify it's a hotel check-in QR
            if (qrData.type !== "HOTEL_CHECKIN" || !qrData.hotelId) {
                setResult({
                    success: false,
                    message: "This is not a hotel check-in QR code. Please scan the correct QR code at the hotel reception.",
                });
                setProcessing(false);
                return;
            }

            // Perform self check-in
            if (!session?.user?.id) {
                setResult({
                    success: false,
                    message: "Please sign in to check-in.",
                });
                setProcessing(false);
                return;
            }

            const response = await customerSelfCheckIn(qrData.hotelId, session.user.id);

            if (response.success && response.booking) {
                setResult({
                    success: true,
                    message: "Check-in successful! 🎉",
                    booking: response.booking,
                });
            } else {
                setResult({
                    success: false,
                    message: response.error || "Check-in failed. Please try again.",
                });
            }
        } catch (error) {
            console.error("Check-in error:", error);
            setResult({
                success: false,
                message: "Something went wrong. Please try again.",
            });
        }

        setProcessing(false);
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
            <>
                <div style={{ padding: "3rem", textAlign: "center" }}>
                    <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
                </div>
                <BottomNav />
            </>
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
                <h1>📱 Self Check-in</h1>
                <p>Scan the QR code at hotel reception</p>
            </header>

            <main className="page-content">
                {!result ? (
                    <>
                        <div className="scan-card">
                            <div className="scan-icon">🏨</div>
                            <h2 style={{ marginBottom: "0.5rem" }}>Ready to Check-in?</h2>
                            <p style={{
                                color: "var(--color-text-secondary)",
                                marginBottom: "1.5rem",
                                fontSize: "0.9375rem",
                            }}>
                                Scan the hotel&apos;s QR code to check yourself in instantly
                            </p>
                            <button
                                className="scan-btn"
                                onClick={() => setIsScanning(true)}
                                disabled={processing}
                            >
                                {processing ? "Processing..." : "📷 Scan Hotel QR Code"}
                            </button>
                        </div>

                        <div className="instructions">
                            <h3>How it works:</h3>
                            <ol>
                                <li>Go to the hotel reception desk</li>
                                <li>Find the &quot;Self Check-in&quot; QR code displayed</li>
                                <li>Tap the button above and scan the QR code</li>
                                <li>You&apos;re checked in! Show confirmation to staff if needed</li>
                            </ol>
                        </div>
                    </>
                ) : (
                    <div className="result-card">
                        <div className="result-icon">
                            {result.success ? "✅" : "❌"}
                        </div>
                        <div
                            className="result-title"
                            style={{ color: result.success ? "var(--color-success)" : "var(--color-error)" }}
                        >
                            {result.message}
                        </div>

                        {result.booking && (
                            <div className="booking-details">
                                <h3>🏨 {result.booking.hotelName}</h3>
                                <p>🛏️ {result.booking.roomName}</p>
                                <p>📅 {formatDate(result.booking.checkIn)} → {formatDate(result.booking.checkOut)}</p>
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
                            {result.success ? (
                                <Link href="/bookings" className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
                                    View My Bookings
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
                                        Try Again
                                    </button>
                                    <Link
                                        href="/bookings"
                                        className="btn btn-outline"
                                        style={{ width: "100%", padding: "0.75rem" }}
                                    >
                                        Check My Bookings
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
                        <h2 style={{ margin: 0, fontSize: "1.125rem" }}>Scan Hotel QR</h2>
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
                        <p style={{ opacity: 0.8 }}>Point your camera at the hotel&apos;s check-in QR code</p>
                    </div>
                </div>
            )}

            <BottomNav />
        </>
    );
}

// Inline QR Scanner Component using html5-qrcode
function QRScannerComponent({ onScan }: { onScan: (data: string) => void }) {
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
                setError("Camera requires a secure connection (HTTPS). Please access this page via HTTPS.");
                setErrorType("https");
                return;
            }

            // Check if camera is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError("Camera is not supported on this browser. Please use a modern browser like Chrome or Safari.");
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
                    setError("Camera permission denied. Please allow camera access and try again.");
                    setErrorType("permission");
                } else if (errorMessage.includes("NotFoundError") || errorMessage.includes("no camera")) {
                    setError("No camera found. Please make sure your device has a camera.");
                    setErrorType("general");
                } else if (errorMessage.includes("NotReadableError") || errorMessage.includes("streaming")) {
                    setError("Camera is being used by another application. Please close other apps using the camera.");
                    setErrorType("general");
                } else {
                    setError("Could not start camera. Please check permissions and try again.");
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
                    {errorType === "https" ? "🔒" : errorType === "permission" ? "📷" : "⚠️"}
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
