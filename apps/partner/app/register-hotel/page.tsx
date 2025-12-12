"use client";

import { useState, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { submitHotelRegistration } from "../actions/hotel-registration";

// Lazy load LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = lazy(() =>
    import("../components/LocationPicker").then((mod) => ({ default: mod.LocationPicker }))
);

const AMENITY_OPTIONS = [
    "WiFi",
    "AC",
    "TV",
    "Parking",
    "Restaurant",
    "Pool",
    "Gym",
    "Room Service",
    "24/7 Reception",
    "Laundry",
];

const CITY_OPTIONS = [
    // All 64 Districts of Bangladesh (Alphabetically sorted)
    "Bagerhat",
    "Bandarban",
    "Barguna",
    "Barisal",
    "Bhola",
    "Bogra",
    "Brahmanbaria",
    "Chandpur",
    "Chapainawabganj",
    "Chittagong",
    "Chuadanga",
    "Comilla",
    "Cox's Bazar",
    "Dhaka",
    "Dinajpur",
    "Faridpur",
    "Feni",
    "Gaibandha",
    "Gazipur",
    "Gopalganj",
    "Habiganj",
    "Jamalpur",
    "Jessore",
    "Jhalokati",
    "Jhenaidah",
    "Joypurhat",
    "Khagrachari",
    "Khulna",
    "Kishoreganj",
    "Kurigram",
    "Kushtia",
    "Lakshmipur",
    "Lalmonirhat",
    "Madaripur",
    "Magura",
    "Manikganj",
    "Meherpur",
    "Moulvibazar",
    "Munshiganj",
    "Mymensingh",
    "Naogaon",
    "Narail",
    "Narayanganj",
    "Narsingdi",
    "Natore",
    "Nawabganj",
    "Netrokona",
    "Nilphamari",
    "Noakhali",
    "Pabna",
    "Panchagarh",
    "Patuakhali",
    "Pirojpur",
    "Rajbari",
    "Rajshahi",
    "Rangamati",
    "Rangpur",
    "Satkhira",
    "Shariatpur",
    "Sherpur",
    "Sirajganj",
    "Sunamganj",
    "Sylhet",
    "Tangail",
    "Thakurgaon",
];

export default function RegisterHotelPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const address = formData.get("address") as string;
        const city = formData.get("city") as string;
        const phone = formData.get("phone") as string;

        const result = await submitHotelRegistration({
            name,
            description,
            address,
            city,
            amenities: selectedAmenities,
            phone,
            latitude: location?.lat,
            longitude: location?.lng,
        });

        setIsSubmitting(false);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || "Failed to submit registration");
        }
    }

    function toggleAmenity(amenity: string) {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    }

    if (success) {
        return (
            <main className="main-centered">
                <div
                    style={{
                        width: "100px",
                        height: "100px",
                        marginBottom: "1.5rem",
                        background: "rgba(42, 157, 143, 0.1)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "3rem",
                    }}
                >
                    ✓
                </div>
                <h1
                    style={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        marginBottom: "0.75rem",
                        color: "var(--color-text-primary)",
                    }}
                >
                    Registration Submitted!
                </h1>
                <p
                    style={{
                        color: "var(--color-text-secondary)",
                        marginBottom: "2rem",
                        maxWidth: "360px",
                        lineHeight: 1.6,
                    }}
                >
                    Your hotel registration is now pending approval. Our team will review
                    your submission and get back to you within 24-48 hours.
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="btn btn-primary"
                >
                    Go to Dashboard
                </button>
            </main>
        );
    }

    return (
        <>
            <header className="page-header">
                <h1 className="page-title">Register Your Hotel</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                    Fill in the details below to get started
                </p>
            </header>

            <main className="container-sm">
                <form onSubmit={handleSubmit} className="card">
                    {error && (
                        <div
                            style={{
                                padding: "0.75rem 1rem",
                                background: "rgba(208, 0, 0, 0.1)",
                                color: "var(--color-error)",
                                borderRadius: "0.5rem",
                                marginBottom: "1.5rem",
                                fontSize: "0.875rem",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Hotel Name */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label
                            htmlFor="name"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                            }}
                        >
                            Hotel Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="e.g., Grand Vibe Hotel"
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label
                            htmlFor="description"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                            }}
                        >
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={3}
                            placeholder="Tell guests about your hotel..."
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                                resize: "vertical",
                            }}
                        />
                    </div>

                    {/* City */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label
                            htmlFor="city"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                            }}
                        >
                            City *
                        </label>
                        <select
                            id="city"
                            name="city"
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                                background: "white",
                            }}
                        >
                            <option value="">Select a city</option>
                            {CITY_OPTIONS.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Address */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label
                            htmlFor="address"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                            }}
                        >
                            Full Address *
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            required
                            rows={2}
                            placeholder="Street address, area, landmarks..."
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                                resize: "vertical",
                            }}
                        />
                    </div>

                    {/* Location Picker */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <Suspense
                            fallback={
                                <div
                                    style={{
                                        height: 300,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "var(--color-bg-secondary)",
                                        borderRadius: "0.75rem",
                                    }}
                                >
                                    Loading map...
                                </div>
                            }
                        >
                            <LocationPicker
                                value={location || undefined}
                                onChange={(loc) => setLocation({ lat: loc.lat, lng: loc.lng })}
                            />
                        </Suspense>
                    </div>

                    {/* Phone */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label
                            htmlFor="phone"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                            }}
                        >
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="+880 1XXX-XXXXXX"
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        />
                    </div>

                    {/* Amenities */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "0.75rem",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                            }}
                        >
                            Amenities
                        </label>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.5rem",
                            }}
                        >
                            {AMENITY_OPTIONS.map((amenity) => (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => toggleAmenity(amenity)}
                                    style={{
                                        padding: "0.5rem 0.75rem",
                                        borderRadius: "9999px",
                                        fontSize: "0.875rem",
                                        border: "1px solid",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        ...(selectedAmenities.includes(amenity)
                                            ? {
                                                background: "var(--color-primary)",
                                                color: "white",
                                                borderColor: "var(--color-primary)",
                                            }
                                            : {
                                                background: "white",
                                                color: "var(--color-text-primary)",
                                                borderColor: "var(--color-border)",
                                            }),
                                    }}
                                >
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-accent"
                        style={{
                            width: "100%",
                            opacity: isSubmitting ? 0.7 : 1,
                        }}
                    >
                        {isSubmitting ? "Submitting..." : "Submit for Approval"}
                    </button>

                    <p
                        style={{
                            marginTop: "1rem",
                            fontSize: "0.75rem",
                            color: "var(--color-text-muted)",
                            textAlign: "center",
                        }}
                    >
                        By submitting, you agree to our terms of service and partner
                        guidelines.
                    </p>
                </form>
            </main>
        </>
    );
}
