"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (error: string) => void;
    onClose: () => void;
}

export function QRScanner({ onScanSuccess, onScanError, onClose }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let mounted = true;

        const startScanner = async () => {
            if (!containerRef.current) return;

            try {
                const scanner = new Html5Qrcode("qr-reader", {
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                    verbose: false,
                });
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        if (mounted) {
                            // Stop scanning on success
                            scanner.stop().catch(() => { });
                            onScanSuccess(decodedText);
                        }
                    },
                    () => {
                        // Ignore QR not found errors
                    }
                );

                if (mounted) {
                    setIsScanning(true);
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
                    setError(errorMessage);
                    onScanError?.(errorMessage);
                }
            }
        };

        startScanner();

        return () => {
            mounted = false;
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, [onScanSuccess, onScanError]);

    const handleClose = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch {
                // Ignore stop errors
            }
        }
        onClose();
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    backgroundColor: "white",
                    borderRadius: "1rem",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--color-border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <h3 style={{ fontWeight: 600, margin: 0 }}>Scan QR Code</h3>
                    <button
                        onClick={handleClose}
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            border: "none",
                            background: "var(--color-bg-secondary)",
                            cursor: "pointer",
                            fontSize: "1.25rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Scanner Area */}
                <div
                    ref={containerRef}
                    style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1",
                        backgroundColor: "#000",
                    }}
                >
                    <div id="qr-reader" style={{ width: "100%", height: "100%" }} />

                    {!isScanning && !error && (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                            }}
                        >
                            <div className="spinner" style={{ marginBottom: "1rem" }} />
                            <p>Starting camera...</p>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div
                        style={{
                            padding: "1rem",
                            backgroundColor: "rgba(208, 0, 0, 0.1)",
                            color: "var(--color-error)",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Camera Error</p>
                        <p style={{ fontSize: "0.875rem" }}>{error}</p>
                        <button
                            onClick={handleClose}
                            className="btn btn-outline"
                            style={{ marginTop: "1rem" }}
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Instructions */}
                {isScanning && !error && (
                    <div
                        style={{
                            padding: "1rem",
                            textAlign: "center",
                            color: "var(--color-text-secondary)",
                            fontSize: "0.875rem",
                        }}
                    >
                        Point your camera at the booking QR code
                    </div>
                )}
            </div>
        </div>
    );
}
