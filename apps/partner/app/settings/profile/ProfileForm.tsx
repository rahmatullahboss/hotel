"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateHotelProfile, HOTEL_AMENITIES, type HotelProfile } from "../../actions/settings";
import { BottomNav } from "../../components";

interface ProfileFormProps {
    hotel: HotelProfile;
}

export function ProfileForm({ hotel }: ProfileFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: hotel.name,
        description: hotel.description || "",
        address: hotel.address,
        city: hotel.city,
        amenities: hotel.amenities,
        payAtHotelEnabled: hotel.payAtHotelEnabled,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        startTransition(async () => {
            const result = await updateHotelProfile(formData);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.error || "Failed to update profile");
            }
        });
    };

    const toggleAmenity = (amenity: string) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <button
                    onClick={() => router.back()}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        padding: 0,
                        marginBottom: "0.5rem",
                    }}
                >
                    ←
                </button>
                <h1 className="page-title">Hotel Profile</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Edit your hotel information
                </p>
            </header>

            <main style={{ padding: "1rem", paddingBottom: "6rem" }}>
                <form onSubmit={handleSubmit}>
                    {/* Success Message */}
                    {success && (
                        <div
                            style={{
                                padding: "1rem",
                                marginBottom: "1rem",
                                borderRadius: "0.5rem",
                                background: "rgba(42, 157, 143, 0.1)",
                                color: "var(--color-success)",
                                fontWeight: 600,
                            }}
                        >
                            ✓ Profile updated successfully!
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div
                            style={{
                                padding: "1rem",
                                marginBottom: "1rem",
                                borderRadius: "0.5rem",
                                background: "rgba(208, 0, 0, 0.1)",
                                color: "var(--color-error)",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Hotel Name */}
                    <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                        <label
                            htmlFor="name"
                            style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
                        >
                            Hotel Name *
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                fontSize: "1rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                        <label
                            htmlFor="description"
                            style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            placeholder="Describe your hotel..."
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                fontSize: "1rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                outline: "none",
                                resize: "vertical",
                            }}
                        />
                    </div>

                    {/* Address */}
                    <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                        <label
                            htmlFor="address"
                            style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
                        >
                            Address *
                        </label>
                        <input
                            id="address"
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                fontSize: "1rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* City */}
                    <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                        <label
                            htmlFor="city"
                            style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
                        >
                            City *
                        </label>
                        <input
                            id="city"
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                fontSize: "1rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* Amenities */}
                    <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", fontWeight: 600, marginBottom: "0.75rem" }}>
                            Amenities
                        </label>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.5rem",
                            }}
                        >
                            {HOTEL_AMENITIES.map((amenity) => {
                                const isSelected = formData.amenities.includes(amenity);
                                return (
                                    <button
                                        key={amenity}
                                        type="button"
                                        onClick={() => toggleAmenity(amenity)}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            borderRadius: "20px",
                                            border: isSelected
                                                ? "2px solid var(--color-primary)"
                                                : "2px solid var(--color-border)",
                                            background: isSelected
                                                ? "var(--color-primary)"
                                                : "transparent",
                                            color: isSelected ? "white" : "var(--color-text-primary)",
                                            fontSize: "0.875rem",
                                            cursor: "pointer",
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        {isSelected && "✓ "}
                                        {amenity}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pay at Hotel Toggle */}
                    <div
                        className="card"
                        style={{
                            padding: "1rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    Pay at Hotel
                                </div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    Allow guests to pay 80% at check-in
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({ ...formData, payAtHotelEnabled: !formData.payAtHotelEnabled })
                                }
                                style={{
                                    width: "50px",
                                    height: "28px",
                                    borderRadius: "14px",
                                    background: formData.payAtHotelEnabled
                                        ? "var(--color-success)"
                                        : "var(--color-text-muted)",
                                    position: "relative",
                                    cursor: "pointer",
                                    border: "none",
                                }}
                            >
                                <div
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        background: "white",
                                        position: "absolute",
                                        top: "2px",
                                        left: formData.payAtHotelEnabled ? "24px" : "2px",
                                        transition: "left 0.2s",
                                    }}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Commission Rate (Read-only) */}
                    <div
                        className="card"
                        style={{
                            padding: "1rem",
                            marginBottom: "1.5rem",
                            background: "var(--color-bg-secondary)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    Commission Rate
                                </div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    Platform fee on each booking
                                </div>
                            </div>
                            <div
                                style={{
                                    fontSize: "1.25rem",
                                    fontWeight: 700,
                                    color: "var(--color-primary)",
                                }}
                            >
                                {hotel.commissionRate}%
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-accent"
                        disabled={isPending}
                        style={{
                            width: "100%",
                            padding: "1rem",
                            fontSize: "1rem",
                            fontWeight: 600,
                        }}
                    >
                        {isPending ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </main>

            <BottomNav />
        </>
    );
}
