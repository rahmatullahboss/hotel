"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { recordWalkIn, checkRoomAvailabilityForDates, RoomAvailability } from "../actions/walkin";

interface WalkInFormProps {
    hotelId: string;
}

export function WalkInForm({ hotelId }: WalkInFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Step 1: Dates
    const today = new Date().toISOString().split("T")[0]!;
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]!;
    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState(tomorrow);

    // Step 2: Rooms with availability
    const [rooms, setRooms] = useState<RoomAvailability[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<RoomAvailability | null>(null);

    // Fetch rooms when dates change
    useEffect(() => {
        if (checkIn && checkOut && checkIn < checkOut) {
            setLoadingRooms(true);
            setSelectedRoom(null); // Reset selection when dates change
            checkRoomAvailabilityForDates(checkIn, checkOut)
                .then(setRooms)
                .finally(() => setLoadingRooms(false));
        }
    }, [checkIn, checkOut]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setIdPhotoUrl(data.url);
            } else {
                setMessage({ type: "error", text: "Failed to upload ID photo" });
            }
        } catch {
            setMessage({ type: "error", text: "Failed to upload ID photo" });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedRoom) return;

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await recordWalkIn({
                roomId: selectedRoom.id,
                guestName: formData.get("guestName") as string,
                guestPhone: formData.get("guestPhone") as string,
                guestEmail: formData.get("guestEmail") as string || undefined,
                guestCount: Number(formData.get("guestCount")) || 1,
                checkIn,
                checkOut,
                totalAmount: Number(formData.get("totalAmount")),
                notes: formData.get("notes") as string || undefined,
                guestIdPhoto: idPhotoUrl || undefined,
            });

            if (result.success) {
                setMessage({ type: "success", text: "Walk-in recorded successfully!" });
                setTimeout(() => router.push("/"), 1500);
            } else {
                setMessage({ type: "error", text: result.error || "Failed to record walk-in" });
            }
        });
    };

    const availableCount = rooms.filter(r => r.isAvailable).length;
    const unavailableCount = rooms.filter(r => !r.isAvailable).length;

    return (
        <form onSubmit={handleSubmit}>
            {/* Step 1: Date Selection - Always Visible */}
            <div className="card" style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="step-number">1</span>
                    Select Stay Dates
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                    Choose dates first to see room availability
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Check-in *
                        </label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={today}
                            required
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Check-out *
                        </label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || today}
                            required
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            {/* Step 2: Room Selection with Availability */}
            <div className="card" style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="step-number">2</span>
                    Select Room
                </h3>

                {/* Availability Summary */}
                {rooms.length > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                        <span className="badge badge-success">
                            {availableCount} Available
                        </span>
                        {unavailableCount > 0 && (
                            <span className="badge badge-error">
                                {unavailableCount} Unavailable
                            </span>
                        )}
                    </div>
                )}

                {loadingRooms ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                        ⏳ Checking availability...
                    </div>
                ) : rooms.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                        No rooms found. Please check the dates.
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => room.isAvailable && setSelectedRoom(room)}
                                style={{
                                    padding: "0.75rem",
                                    border: `2px solid ${!room.isAvailable
                                            ? "var(--color-error)"
                                            : selectedRoom?.id === room.id
                                                ? "var(--color-primary)"
                                                : "var(--color-border)"
                                        }`,
                                    borderRadius: "0.5rem",
                                    cursor: room.isAvailable ? "pointer" : "not-allowed",
                                    background: !room.isAvailable
                                        ? "rgba(208, 0, 0, 0.05)"
                                        : selectedRoom?.id === room.id
                                            ? "rgba(29, 53, 87, 0.05)"
                                            : "transparent",
                                    opacity: room.isAvailable ? 1 : 0.7,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        Room {room.number} - {room.name}
                                        {room.isAvailable ? (
                                            <span style={{ color: "var(--color-success)", fontSize: "0.875rem" }}>✓</span>
                                        ) : (
                                            <span style={{ color: "var(--color-error)", fontSize: "0.875rem" }}>✕</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        {room.type}
                                        {!room.isAvailable && room.unavailableReason && (
                                            <span style={{ marginLeft: "0.5rem", color: "var(--color-error)" }}>
                                                • {room.unavailableReason}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700, color: room.isAvailable ? "inherit" : "var(--color-text-secondary)" }}>
                                    ৳{room.price.toLocaleString()}/night
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedRoom && (
                <>
                    {/* Step 3: Guest Details */}
                    <div className="card" style={{ marginBottom: "1rem" }}>
                        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span className="step-number">3</span>
                            Guest Details
                        </h3>

                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                                    Guest Name *
                                </label>
                                <input
                                    name="guestName"
                                    type="text"
                                    required
                                    placeholder="Full name"
                                    className="form-input"
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                                        Phone *
                                    </label>
                                    <input
                                        name="guestPhone"
                                        type="tel"
                                        required
                                        placeholder="01XXXXXXXXX"
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                                        Guests
                                    </label>
                                    <input
                                        name="guestCount"
                                        type="number"
                                        min="1"
                                        defaultValue="1"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                                    Email (optional)
                                </label>
                                <input
                                    name="guestEmail"
                                    type="email"
                                    placeholder="guest@email.com"
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="card" style={{ marginBottom: "1rem" }}>
                        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Payment</h3>
                        <div>
                            <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                                Total Amount (৳) *
                            </label>
                            <input
                                name="totalAmount"
                                type="number"
                                required
                                min="1"
                                defaultValue={selectedRoom.price}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* ID Photo Upload */}
                    <div className="card" style={{ marginBottom: "1rem" }}>
                        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Guest ID Photo</h3>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                            Upload guest&apos;s ID card for security verification
                        </p>

                        {idPhotoUrl ? (
                            <div style={{ position: "relative" }}>
                                <img
                                    src={idPhotoUrl}
                                    alt="Guest ID"
                                    style={{
                                        width: "100%",
                                        maxHeight: "200px",
                                        objectFit: "cover",
                                        borderRadius: "0.5rem",
                                        border: "2px solid var(--color-success)",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIdPhotoUrl(null)}
                                    style={{
                                        position: "absolute",
                                        top: "0.5rem",
                                        right: "0.5rem",
                                        background: "var(--color-error)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "28px",
                                        height: "28px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    ✕
                                </button>
                                <div style={{
                                    fontSize: "0.75rem",
                                    color: "var(--color-success)",
                                    marginTop: "0.5rem",
                                    textAlign: "center",
                                }}>
                                    ✓ ID photo uploaded
                                </div>
                            </div>
                        ) : (
                            <label
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "2rem",
                                    border: "2px dashed var(--color-border)",
                                    borderRadius: "0.5rem",
                                    cursor: uploadingPhoto ? "wait" : "pointer",
                                    backgroundColor: "var(--color-bg-secondary)",
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handlePhotoUpload}
                                    disabled={uploadingPhoto}
                                    style={{ display: "none" }}
                                />
                                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                                    {uploadingPhoto ? "⏳" : "📷"}
                                </div>
                                <div style={{ fontWeight: 500 }}>
                                    {uploadingPhoto ? "Uploading..." : "Tap to take photo or upload"}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                    NID, Passport, or Driving License
                                </div>
                            </label>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="card" style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Notes (optional)
                        </label>
                        <textarea
                            name="notes"
                            placeholder="Any special requirements..."
                            rows={2}
                            className="form-input"
                            style={{ resize: "vertical" }}
                        />
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
                                textAlign: "center",
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isPending || uploadingPhoto}
                        style={{ width: "100%", padding: "1rem" }}
                    >
                        {isPending ? "Recording..." : "Record Walk-in Guest"}
                    </button>
                </>
            )}
        </form>
    );
}
