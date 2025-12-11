"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordWalkIn } from "../actions/walkin";

interface Room {
    id: string;
    number: string;
    name: string;
    type: string;
    price: number;
    status: string;
}

interface WalkInFormProps {
    rooms: Room[];
}

export function WalkInForm({ rooms }: WalkInFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const today = new Date().toISOString().split("T")[0]!;
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]!;

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
                checkIn: formData.get("checkIn") as string,
                checkOut: formData.get("checkOut") as string,
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

    return (
        <form onSubmit={handleSubmit}>
            {/* Room Selection */}
            <div className="card" style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Select Room</h3>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            style={{
                                padding: "0.75rem",
                                border: `2px solid ${selectedRoom?.id === room.id ? "var(--color-primary)" : "var(--color-border)"}`,
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                                background: selectedRoom?.id === room.id ? "rgba(29, 53, 87, 0.05)" : "transparent",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600 }}>
                                    Room {room.number} - {room.name}
                                </div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {room.type}
                                </div>
                            </div>
                            <div style={{ fontWeight: 700 }}>
                                ৳{room.price.toLocaleString()}/night
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedRoom && (
                <>
                    {/* Guest Details */}
                    <div className="card" style={{ marginBottom: "1rem" }}>
                        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Guest Details</h3>

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
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "2px solid var(--color-border)",
                                        borderRadius: "0.5rem",
                                        fontSize: "1rem",
                                    }}
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
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "2px solid var(--color-border)",
                                            borderRadius: "0.5rem",
                                            fontSize: "1rem",
                                        }}
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
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "2px solid var(--color-border)",
                                            borderRadius: "0.5rem",
                                            fontSize: "1rem",
                                        }}
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
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "2px solid var(--color-border)",
                                        borderRadius: "0.5rem",
                                        fontSize: "1rem",
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stay Details */}
                    <div className="card" style={{ marginBottom: "1rem" }}>
                        <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Stay Details</h3>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                                    Check-in *
                                </label>
                                <input
                                    name="checkIn"
                                    type="date"
                                    required
                                    defaultValue={today}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "2px solid var(--color-border)",
                                        borderRadius: "0.5rem",
                                        fontSize: "1rem",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                                    Check-out *
                                </label>
                                <input
                                    name="checkOut"
                                    type="date"
                                    required
                                    defaultValue={tomorrow}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "2px solid var(--color-border)",
                                        borderRadius: "0.5rem",
                                        fontSize: "1rem",
                                    }}
                                />
                            </div>
                        </div>

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
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "2px solid var(--color-border)",
                                    borderRadius: "0.5rem",
                                    fontSize: "1rem",
                                }}
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
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                                resize: "vertical",
                            }}
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
