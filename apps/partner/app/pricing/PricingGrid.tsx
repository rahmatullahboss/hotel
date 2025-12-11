"use client";

import { useState, useTransition } from "react";
import { RoomPricing, updateSmartPrice, resetToBasePrice, getRoomPricingCalendar } from "../actions/pricing";

interface PricingGridProps {
    rooms: RoomPricing[];
}

export function PricingGrid({ rooms }: PricingGridProps) {
    const [selectedRoom, setSelectedRoom] = useState<RoomPricing | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);
    const [editDate, setEditDate] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const today = new Date().toISOString().split("T")[0]!;

    const handleRoomClick = (room: RoomPricing) => {
        setSelectedRoom(room);
        setEditPrice(room.currentPrice);
        setEditDate(today);
        setMessage(null);
    };

    const handleUpdatePrice = () => {
        if (!selectedRoom || !editDate) return;

        startTransition(async () => {
            const result = await updateSmartPrice(selectedRoom.id, editDate, editPrice);
            if (result.success) {
                setMessage({ type: "success", text: "Price updated successfully!" });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: "error", text: result.error || "Failed to update price" });
            }
        });
    };

    const handleResetPrice = () => {
        if (!selectedRoom || !editDate) return;

        startTransition(async () => {
            const result = await resetToBasePrice(selectedRoom.id, editDate);
            if (result.success) {
                setEditPrice(selectedRoom.basePrice);
                setMessage({ type: "success", text: "Reset to base price" });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: "error", text: result.error || "Failed to reset price" });
            }
        });
    };

    const getPriceChangePercent = () => {
        if (!selectedRoom) return 0;
        return Math.round(((editPrice - selectedRoom.basePrice) / selectedRoom.basePrice) * 100);
    };

    return (
        <>
            {/* Room Cards */}
            <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                {rooms.map((room) => {
                    const priceChange = Math.round(((room.currentPrice - room.basePrice) / room.basePrice) * 100);
                    const isSelected = selectedRoom?.id === room.id;

                    return (
                        <div
                            key={room.id}
                            className="card"
                            onClick={() => handleRoomClick(room)}
                            style={{
                                cursor: "pointer",
                                borderColor: isSelected ? "var(--color-primary)" : undefined,
                                borderWidth: isSelected ? "2px" : undefined,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                        Room {room.roomNumber} - {room.name}
                                    </div>
                                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        {room.type} • Base: ৳{room.basePrice.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                                        ৳{room.currentPrice.toLocaleString()}
                                    </div>
                                    {priceChange !== 0 && (
                                        <span
                                            className={`badge ${priceChange > 0 ? "badge-success" : "badge-warning"}`}
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            {priceChange > 0 ? "+" : ""}{priceChange}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Price Editor Modal/Card */}
            {selectedRoom && (
                <div
                    className="card"
                    style={{
                        position: "fixed",
                        bottom: "80px",
                        left: "1rem",
                        right: "1rem",
                        maxWidth: "400px",
                        margin: "0 auto",
                        zIndex: 100,
                        boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Room {selectedRoom.roomNumber}</div>
                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                Base: ৳{selectedRoom.basePrice.toLocaleString()}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedRoom(null)}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: "1.5rem",
                                cursor: "pointer",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Date Selector */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Date
                        </label>
                        <input
                            type="date"
                            value={editDate}
                            min={today}
                            onChange={(e) => setEditDate(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        />
                    </div>

                    {/* Price Slider */}
                    <div style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <label style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                                Price
                            </label>
                            <span
                                style={{
                                    fontWeight: 700,
                                    color: getPriceChangePercent() > 0
                                        ? "var(--color-success)"
                                        : getPriceChangePercent() < 0
                                            ? "var(--color-warning)"
                                            : "var(--color-text-primary)",
                                }}
                            >
                                ৳{editPrice.toLocaleString()}
                                {getPriceChangePercent() !== 0 && (
                                    <span style={{ fontSize: "0.875rem", marginLeft: "0.5rem" }}>
                                        ({getPriceChangePercent() > 0 ? "+" : ""}{getPriceChangePercent()}%)
                                    </span>
                                )}
                            </span>
                        </div>

                        <input
                            type="range"
                            min={selectedRoom.minPrice}
                            max={selectedRoom.maxPrice}
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            style={{
                                width: "100%",
                                height: "8px",
                                borderRadius: "4px",
                                appearance: "none",
                                background: `linear-gradient(to right, var(--color-warning) 0%, var(--color-primary) 50%, var(--color-success) 100%)`,
                            }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                            <span>৳{selectedRoom.minPrice} (-20%)</span>
                            <span>৳{selectedRoom.maxPrice} (+20%)</span>
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <div
                            style={{
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                marginBottom: "1rem",
                                backgroundColor: message.type === "success"
                                    ? "rgba(44, 182, 125, 0.1)"
                                    : "rgba(208, 0, 0, 0.1)",
                                color: message.type === "success"
                                    ? "var(--color-success)"
                                    : "var(--color-error)",
                                fontSize: "0.875rem",
                                textAlign: "center",
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                            className="btn btn-outline"
                            onClick={handleResetPrice}
                            disabled={isPending}
                            style={{ flex: 1 }}
                        >
                            Reset
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleUpdatePrice}
                            disabled={isPending}
                            style={{ flex: 2 }}
                        >
                            {isPending ? "Updating..." : "Update Price"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
