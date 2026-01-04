"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiPhone, FiMail, FiUsers, FiCamera, FiCheck, FiX, FiFileText, FiCalendar, FiHome, FiDollarSign } from "react-icons/fi";
import { recordWalkIn, checkRoomAvailabilityForDates, RoomAvailability } from "../actions/walkin";

interface WalkInFormProps {
    hotelId: string;
}

// Reusable style objects
const styles = {
    card: {
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f0f0f0",
    } as React.CSSProperties,
    stepHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px",
    } as React.CSSProperties,
    stepNumber: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "700",
    } as React.CSSProperties,
    stepTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#1a1a2e",
        margin: 0,
    } as React.CSSProperties,
    stepDescription: {
        fontSize: "14px",
        color: "#6b7280",
        marginBottom: "20px",
        paddingLeft: "44px",
    } as React.CSSProperties,
    inputGroup: {
        marginBottom: "16px",
    } as React.CSSProperties,
    label: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151",
        marginBottom: "8px",
    } as React.CSSProperties,
    input: {
        width: "100%",
        padding: "14px 16px",
        borderRadius: "12px",
        border: "2px solid #e5e7eb",
        fontSize: "16px",
        outline: "none",
        transition: "all 0.2s ease",
        background: "#fafafa",
        boxSizing: "border-box" as const,
    } as React.CSSProperties,
    inputFocus: {
        borderColor: "#667eea",
        background: "white",
        boxShadow: "0 0 0 4px rgba(102, 126, 234, 0.1)",
    } as React.CSSProperties,
    grid2: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
    } as React.CSSProperties,
    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "100px",
        fontSize: "13px",
        fontWeight: "600",
    } as React.CSSProperties,
    badgeSuccess: {
        background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
        color: "#059669",
    } as React.CSSProperties,
    badgeError: {
        background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
        color: "#dc2626",
    } as React.CSSProperties,
    roomCard: {
        padding: "16px 20px",
        borderRadius: "14px",
        border: "2px solid",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.2s ease",
        marginBottom: "12px",
    } as React.CSSProperties,
    submitButton: {
        width: "100%",
        padding: "18px 24px",
        borderRadius: "14px",
        border: "none",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    } as React.CSSProperties,
    uploadArea: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        border: "3px dashed #e5e7eb",
        borderRadius: "16px",
        cursor: "pointer",
        background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
        transition: "all 0.3s ease",
    } as React.CSSProperties,
    message: {
        padding: "16px 20px",
        borderRadius: "14px",
        marginBottom: "20px",
        textAlign: "center" as const,
        fontWeight: "600",
        fontSize: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
    } as React.CSSProperties,
};

export function WalkInForm({ hotelId }: WalkInFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
            setSelectedRoom(null);
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
                setMessage({ type: "success", text: "✅ Walk-in recorded successfully!" });
                setTimeout(() => router.push("/"), 1500);
            } else {
                setMessage({ type: "error", text: result.error || "Failed to record walk-in" });
            }
        });
    };

    const getInputStyle = (inputName: string): React.CSSProperties => ({
        ...styles.input,
        ...(focusedInput === inputName ? styles.inputFocus : {}),
    });

    const availableCount = rooms.filter(r => r.isAvailable).length;
    const unavailableCount = rooms.filter(r => !r.isAvailable).length;

    return (
        <form onSubmit={handleSubmit}>
            {/* Step 1: Date Selection */}
            <div style={styles.card}>
                <div style={styles.stepHeader}>
                    <div style={styles.stepNumber}>1</div>
                    <h3 style={styles.stepTitle}>Select Stay Dates</h3>
                </div>
                <p style={styles.stepDescription}>
                    <FiCalendar style={{ marginRight: "6px" }} />
                    Choose dates first to see room availability
                </p>

                <div style={styles.grid2}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <FiCalendar size={16} />
                            Check-in Date *
                        </label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={today}
                            required
                            style={getInputStyle("checkIn")}
                            onFocus={() => setFocusedInput("checkIn")}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <FiCalendar size={16} />
                            Check-out Date *
                        </label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || today}
                            required
                            style={getInputStyle("checkOut")}
                            onFocus={() => setFocusedInput("checkOut")}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </div>
                </div>
            </div>

            {/* Step 2: Room Selection */}
            <div style={styles.card}>
                <div style={styles.stepHeader}>
                    <div style={styles.stepNumber}>2</div>
                    <h3 style={styles.stepTitle}>Select Room</h3>
                </div>

                {/* Availability Summary */}
                {rooms.length > 0 && (
                    <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                        <span style={{ ...styles.badge, ...styles.badgeSuccess }}>
                            <FiCheck size={14} />
                            {availableCount} Available
                        </span>
                        {unavailableCount > 0 && (
                            <span style={{ ...styles.badge, ...styles.badgeError }}>
                                <FiX size={14} />
                                {unavailableCount} Unavailable
                            </span>
                        )}
                    </div>
                )}

                {loadingRooms ? (
                    <div style={{
                        padding: "48px 24px",
                        textAlign: "center",
                        color: "#6b7280",
                        background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                        borderRadius: "12px",
                    }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            border: "4px solid #e5e7eb",
                            borderTopColor: "#667eea",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 16px",
                        }} />
                        <span style={{ fontSize: "15px", fontWeight: "500" }}>Checking availability...</span>
                    </div>
                ) : rooms.length === 0 ? (
                    <div style={{
                        padding: "48px 24px",
                        textAlign: "center",
                        color: "#6b7280",
                        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                        borderRadius: "12px",
                    }}>
                        <FiHome size={32} style={{ marginBottom: "12px", color: "#d97706" }} />
                        <div style={{ fontSize: "15px", fontWeight: "500" }}>No rooms found. Please check the dates.</div>
                    </div>
                ) : (
                    <div>
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => room.isAvailable && setSelectedRoom(room)}
                                style={{
                                    ...styles.roomCard,
                                    borderColor: !room.isAvailable
                                        ? "#fecaca"
                                        : selectedRoom?.id === room.id
                                            ? "#667eea"
                                            : "#e5e7eb",
                                    background: !room.isAvailable
                                        ? "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
                                        : selectedRoom?.id === room.id
                                            ? "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)"
                                            : "white",
                                    opacity: room.isAvailable ? 1 : 0.7,
                                    cursor: room.isAvailable ? "pointer" : "not-allowed",
                                    transform: selectedRoom?.id === room.id ? "scale(1.02)" : "scale(1)",
                                    boxShadow: selectedRoom?.id === room.id
                                        ? "0 8px 25px rgba(102, 126, 234, 0.2)"
                                        : "0 2px 8px rgba(0, 0, 0, 0.04)",
                                }}
                            >
                                <div>
                                    <div style={{
                                        fontWeight: "700",
                                        fontSize: "16px",
                                        color: "#1a1a2e",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: "4px",
                                    }}>
                                        <FiHome size={16} />
                                        Room {room.number} - {room.name}
                                        {room.isAvailable ? (
                                            <span style={{
                                                width: "20px",
                                                height: "20px",
                                                borderRadius: "50%",
                                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}>
                                                <FiCheck size={12} color="white" />
                                            </span>
                                        ) : (
                                            <span style={{
                                                width: "20px",
                                                height: "20px",
                                                borderRadius: "50%",
                                                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}>
                                                <FiX size={12} color="white" />
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                        {room.type}
                                        {!room.isAvailable && room.unavailableReason && (
                                            <span style={{
                                                marginLeft: "8px",
                                                color: "#dc2626",
                                                fontWeight: "500",
                                            }}>
                                                • {room.unavailableReason}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{
                                    fontWeight: "800",
                                    fontSize: "18px",
                                    color: room.isAvailable ? "#667eea" : "#9ca3af",
                                    background: room.isAvailable
                                        ? "linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)"
                                        : "#f3f4f6",
                                    padding: "8px 16px",
                                    borderRadius: "10px",
                                }}>
                                    ৳{room.price.toLocaleString()}
                                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#6b7280" }}>/night</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedRoom && (
                <>
                    {/* Step 3: Guest Details */}
                    <div style={styles.card}>
                        <div style={styles.stepHeader}>
                            <div style={styles.stepNumber}>3</div>
                            <h3 style={styles.stepTitle}>Guest Details</h3>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <FiUser size={16} />
                                Guest Name *
                            </label>
                            <input
                                name="guestName"
                                type="text"
                                required
                                placeholder="Enter full name"
                                style={getInputStyle("guestName")}
                                onFocus={() => setFocusedInput("guestName")}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </div>

                        <div style={styles.grid2}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <FiPhone size={16} />
                                    Phone *
                                </label>
                                <input
                                    name="guestPhone"
                                    type="tel"
                                    required
                                    placeholder="01XXXXXXXXX"
                                    style={getInputStyle("guestPhone")}
                                    onFocus={() => setFocusedInput("guestPhone")}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <FiUsers size={16} />
                                    Guests
                                </label>
                                <input
                                    name="guestCount"
                                    type="number"
                                    min="1"
                                    defaultValue="1"
                                    style={getInputStyle("guestCount")}
                                    onFocus={() => setFocusedInput("guestCount")}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <FiMail size={16} />
                                Email (optional)
                            </label>
                            <input
                                name="guestEmail"
                                type="email"
                                placeholder="guest@email.com"
                                style={getInputStyle("guestEmail")}
                                onFocus={() => setFocusedInput("guestEmail")}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </div>
                    </div>

                    {/* Step 4: Payment */}
                    <div style={styles.card}>
                        <div style={styles.stepHeader}>
                            <div style={styles.stepNumber}>4</div>
                            <h3 style={styles.stepTitle}>Payment</h3>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <FiDollarSign size={16} />
                                Total Amount (৳) *
                            </label>
                            <input
                                name="totalAmount"
                                type="number"
                                required
                                min="1"
                                defaultValue={selectedRoom.price}
                                style={getInputStyle("totalAmount")}
                                onFocus={() => setFocusedInput("totalAmount")}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </div>
                    </div>

                    {/* Step 5: ID Photo Upload */}
                    <div style={styles.card}>
                        <div style={styles.stepHeader}>
                            <div style={styles.stepNumber}>5</div>
                            <h3 style={styles.stepTitle}>Guest ID Photo</h3>
                        </div>
                        <p style={styles.stepDescription}>
                            Upload guest&apos;s ID card for security verification
                        </p>

                        {idPhotoUrl ? (
                            <div style={{ position: "relative" }}>
                                <img
                                    src={idPhotoUrl}
                                    alt="Guest ID"
                                    style={{
                                        width: "100%",
                                        maxHeight: "220px",
                                        objectFit: "cover",
                                        borderRadius: "16px",
                                        border: "3px solid #10b981",
                                        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIdPhotoUrl(null)}
                                    style={{
                                        position: "absolute",
                                        top: "12px",
                                        right: "12px",
                                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "36px",
                                        height: "36px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
                                    }}
                                >
                                    <FiX size={18} />
                                </button>
                                <div style={{
                                    fontSize: "14px",
                                    color: "#10b981",
                                    marginTop: "12px",
                                    textAlign: "center",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                }}>
                                    <FiCheck size={16} />
                                    ID photo uploaded successfully
                                </div>
                            </div>
                        ) : (
                            <label style={{
                                ...styles.uploadArea,
                                cursor: uploadingPhoto ? "wait" : "pointer",
                                borderColor: uploadingPhoto ? "#667eea" : "#e5e7eb",
                            }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handlePhotoUpload}
                                    disabled={uploadingPhoto}
                                    style={{ display: "none" }}
                                />
                                <div style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "50%",
                                    background: uploadingPhoto
                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                        : "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "16px",
                                }}>
                                    <FiCamera size={28} color={uploadingPhoto ? "white" : "#667eea"} />
                                </div>
                                <div style={{
                                    fontWeight: "700",
                                    fontSize: "16px",
                                    color: "#1a1a2e",
                                    marginBottom: "6px",
                                }}>
                                    {uploadingPhoto ? "Uploading..." : "Tap to take photo or upload"}
                                </div>
                                <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                                    NID, Passport, or Driving License
                                </div>
                            </label>
                        )}
                    </div>

                    {/* Step 6: Notes */}
                    <div style={styles.card}>
                        <div style={styles.stepHeader}>
                            <div style={styles.stepNumber}>6</div>
                            <h3 style={styles.stepTitle}>Notes (optional)</h3>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                <FiFileText size={16} />
                                Special Requirements
                            </label>
                            <textarea
                                name="notes"
                                placeholder="Any special requirements or notes..."
                                rows={3}
                                style={{
                                    ...getInputStyle("notes"),
                                    resize: "vertical",
                                    minHeight: "100px",
                                }}
                                onFocus={() => setFocusedInput("notes")}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <div
                            style={{
                                ...styles.message,
                                background: message.type === "success"
                                    ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
                                    : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                                color: message.type === "success" ? "#059669" : "#dc2626",
                            }}
                        >
                            {message.type === "success" ? <FiCheck size={20} /> : <FiX size={20} />}
                            {message.text}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isPending || uploadingPhoto}
                        style={{
                            ...styles.submitButton,
                            opacity: isPending || uploadingPhoto ? 0.7 : 1,
                            cursor: isPending || uploadingPhoto ? "not-allowed" : "pointer",
                        }}
                    >
                        {isPending ? (
                            <>
                                <div style={{
                                    width: "20px",
                                    height: "20px",
                                    border: "3px solid rgba(255,255,255,0.3)",
                                    borderTopColor: "white",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                }} />
                                Recording...
                            </>
                        ) : (
                            <>
                                <FiCheck size={20} />
                                Record Walk-in Guest
                            </>
                        )}
                    </button>

                    {/* Keyframe animation for spinner */}
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </>
            )}
        </form>
    );
}
