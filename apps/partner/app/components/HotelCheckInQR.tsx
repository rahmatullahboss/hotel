"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface HotelCheckInQRProps {
    hotelId: string;
    hotelName: string;
}

export function HotelCheckInQR({ hotelId, hotelName }: HotelCheckInQRProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Generate QR code with hotel check-in data
        const qrData = JSON.stringify({
            type: "HOTEL_CHECKIN",
            hotelId: hotelId,
            hotelName: hotelName,
        });

        QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2,
            color: {
                dark: "#264653",
                light: "#ffffff",
            },
        })
            .then((url) => setQrCodeUrl(url))
            .catch((err) => console.error("QR generation error:", err));
    }, [hotelId, hotelName]);

    return (
        <>
            <style jsx>{`
                .qr-card {
                    background: linear-gradient(135deg, #2a9d8f 0%, #264653 100%);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    color: white;
                    text-align: center;
                }
                .qr-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                .qr-subtitle {
                    font-size: 0.8125rem;
                    opacity: 0.9;
                    margin-bottom: 1rem;
                }
                .qr-container {
                    background: white;
                    border-radius: 0.75rem;
                    padding: 1rem;
                    display: inline-block;
                }
                .qr-image {
                    width: 200px;
                    height: 200px;
                }
                .qr-image.expanded {
                    width: 280px;
                    height: 280px;
                }
                .qr-instructions {
                    margin-top: 1rem;
                    font-size: 0.75rem;
                    opacity: 0.85;
                }
                .expand-btn {
                    margin-top: 0.75rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 0.5rem;
                    color: white;
                    font-size: 0.8125rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .expand-btn:hover {
                    background: rgba(255,255,255,0.3);
                }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                }
                .modal-content {
                    background: white;
                    border-radius: 1rem;
                    padding: 2rem;
                    text-align: center;
                    max-width: 350px;
                }
                .modal-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: var(--color-text-primary);
                }
                .modal-subtitle {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 1rem;
                }
                .close-btn {
                    margin-top: 1rem;
                    padding: 0.75rem 2rem;
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                }
            `}</style>

            <div className="qr-card">
                <div className="qr-title">📱 Guest Self Check-in QR</div>
                <div className="qr-subtitle">Guests can scan this to check-in</div>

                {qrCodeUrl && (
                    <div className="qr-container">
                        <img
                            src={qrCodeUrl}
                            alt="Hotel Check-in QR Code"
                            className="qr-image"
                        />
                    </div>
                )}

                <div className="qr-instructions">
                    Display this QR code at reception for guests to scan
                </div>

                <button className="expand-btn" onClick={() => setIsExpanded(true)}>
                    🔍 Enlarge for Printing
                </button>
            </div>

            {/* Expanded Modal for Printing */}
            {isExpanded && (
                <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">Self Check-in QR Code</div>
                        <div className="modal-subtitle">{hotelName}</div>

                        {qrCodeUrl && (
                            <img
                                src={qrCodeUrl}
                                alt="Hotel Check-in QR Code"
                                style={{ width: "250px", height: "250px" }}
                            />
                        )}

                        <p style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-text-secondary)",
                            marginTop: "1rem",
                        }}>
                            Guests scan this QR code with the RoomBooker app to check-in instantly
                        </p>

                        <button className="close-btn" onClick={() => setIsExpanded(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
