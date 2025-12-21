"use client";

import { lazy, Suspense } from "react";
import type { OnboardingData } from "../OnboardingWizard";

const LocationPicker = lazy(() =>
    import("../../components/LocationPicker").then((mod) => ({ default: mod.LocationPicker }))
);

interface Props {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

const CITY_OPTIONS = [
    "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria",
    "Chandpur", "Chapainawabganj", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar",
    "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
    "Habiganj", "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat",
    "Khagrachari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur",
    "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar",
    "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
    "Natore", "Nawabganj", "Netrokona", "Nilphamari", "Noakhali", "Pabna",
    "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati",
    "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj",
    "Sylhet", "Tangail", "Thakurgaon",
];

export function LocationStep({ data, updateData }: Props) {
    return (
        <div className="step-content">
            <h2 className="step-heading">Where is your hotel located?</h2>
            <p className="step-description">
                Help guests find you easily with accurate location details.
            </p>

            <div className="form-group">
                <label htmlFor="city" className="form-label">
                    City / District *
                </label>
                <select
                    id="city"
                    value={data.city}
                    onChange={(e) => updateData({ city: e.target.value })}
                    className="form-input"
                >
                    <option value="">Select a city</option>
                    {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="address" className="form-label">
                    Full Address *
                </label>
                <textarea
                    id="address"
                    value={data.address}
                    onChange={(e) => updateData({ address: e.target.value })}
                    placeholder="Street address, area, landmarks..."
                    rows={2}
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    Pin Location on Map (Optional)
                </label>
                <Suspense
                    fallback={
                        <div className="map-loading">Loading map...</div>
                    }
                >
                    <LocationPicker
                        value={data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : undefined}
                        onChange={(loc) => updateData({ latitude: loc.lat, longitude: loc.lng })}
                    />
                </Suspense>
            </div>
        </div>
    );
}
