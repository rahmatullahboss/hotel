"use client";

import { lazy, Suspense } from "react";
import { FiMapPin } from "react-icons/fi";
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

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1.5rem',
    },
    heading: {
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#1d3557',
        marginBottom: '0.5rem',
    },
    description: {
        color: '#64748b',
        fontSize: '1rem',
        marginBottom: '0.5rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#334155',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    labelIcon: {
        color: '#64748b',
    },
    select: {
        width: '100%',
        padding: '0.875rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '0.75rem',
        fontSize: '1rem',
        background: 'white',
        cursor: 'pointer',
        appearance: 'none' as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1.25rem',
    },
    textarea: {
        width: '100%',
        padding: '0.875rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '0.75rem',
        fontSize: '1rem',
        background: 'white',
        resize: 'vertical' as const,
        minHeight: '80px',
        fontFamily: 'inherit',
        lineHeight: 1.6,
    },
    mapContainer: {
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '2px solid #e2e8f0',
    },
    mapLoading: {
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '0.75rem',
        color: '#64748b',
        fontSize: '0.875rem',
    },
};

export function LocationStep({ data, updateData }: Props) {
    return (
        <div style={styles.container}>
            <div>
                <h2 style={styles.heading}>Where is your hotel located?</h2>
                <p style={styles.description}>
                    Help guests find you easily with accurate location details.
                </p>
            </div>

            <div style={styles.formGroup}>
                <label htmlFor="city" style={styles.label}>
                    <FiMapPin style={styles.labelIcon} /> City / District *
                </label>
                <select
                    id="city"
                    value={data.city}
                    onChange={(e) => updateData({ city: e.target.value })}
                    style={styles.select}
                >
                    <option value="">Select a city</option>
                    {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>

            <div style={styles.formGroup}>
                <label htmlFor="address" style={styles.label}>
                    Full Address *
                </label>
                <textarea
                    id="address"
                    value={data.address}
                    onChange={(e) => updateData({ address: e.target.value })}
                    placeholder="Street address, area, landmarks..."
                    style={styles.textarea}
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>
                    Pin Location on Map (Optional)
                </label>
                <div style={styles.mapContainer}>
                    <Suspense
                        fallback={
                            <div style={styles.mapLoading}>Loading map...</div>
                        }
                    >
                        <LocationPicker
                            value={data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : undefined}
                            onChange={(loc) => updateData({ latitude: loc.lat, longitude: loc.lng })}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
