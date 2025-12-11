"use client";

import { QRCodeSVG } from "qrcode.react";

interface BookingQRCodeProps {
    bookingId: string;
    size?: number;
    includeInstructions?: boolean;
}

export function BookingQRCode({
    bookingId,
    size = 200,
    includeInstructions = true,
}: BookingQRCodeProps) {
    // Generate QR code data
    const qrData = JSON.stringify({ bookingId });

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
            }}
        >
            {/* QR Code */}
            <div
                style={{
                    padding: "1rem",
                    backgroundColor: "white",
                    borderRadius: "0.75rem",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
            >
                <QRCodeSVG
                    value={qrData}
                    size={size}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#1d3557"
                />
            </div>

            {/* Instructions */}
            {includeInstructions && (
                <div
                    style={{
                        textAlign: "center",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.875rem",
                    }}
                >
                    <p style={{ marginBottom: "0.25rem" }}>
                        Show this QR code at the hotel for check-in
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        Booking ID: {bookingId.slice(0, 8)}...
                    </p>
                </div>
            )}
        </div>
    );
}
