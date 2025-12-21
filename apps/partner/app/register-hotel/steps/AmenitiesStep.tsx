"use client";

import { FiWifi, FiTv, FiCoffee, FiClock, FiWind, FiShield, FiThermometer } from "react-icons/fi";
import { MdPool, MdLocalParking, MdRestaurant, MdFitnessCenter, MdRoomService, MdLocalLaundryService, MdElevator, MdMeetingRoom, MdSpa } from "react-icons/md";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

const AMENITY_OPTIONS = [
    { id: "WiFi", label: "Free WiFi", icon: FiWifi },
    { id: "AC", label: "Air Conditioning", icon: FiWind },
    { id: "TV", label: "Television", icon: FiTv },
    { id: "Parking", label: "Parking", icon: MdLocalParking },
    { id: "Restaurant", label: "Restaurant", icon: MdRestaurant },
    { id: "Pool", label: "Swimming Pool", icon: MdPool },
    { id: "Gym", label: "Fitness Center", icon: MdFitnessCenter },
    { id: "Room Service", label: "Room Service", icon: MdRoomService },
    { id: "24/7 Reception", label: "24/7 Reception", icon: FiClock },
    { id: "Laundry", label: "Laundry Service", icon: MdLocalLaundryService },
    { id: "Elevator", label: "Elevator", icon: MdElevator },
    { id: "Conference Room", label: "Conference Room", icon: MdMeetingRoom },
    { id: "Spa", label: "Spa & Wellness", icon: MdSpa },
    { id: "Breakfast", label: "Free Breakfast", icon: FiCoffee },
    { id: "Hot Water", label: "Hot Water", icon: FiThermometer },
    { id: "Security", label: "24/7 Security", icon: FiShield },
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
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '0.75rem',
    },
    card: (selected: boolean) => ({
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem 0.75rem',
        border: selected ? '2px solid #1d3557' : '2px solid #e2e8f0',
        borderRadius: '1rem',
        background: selected ? 'linear-gradient(135deg, #1d3557 0%, #2a4a7f 100%)' : 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'center' as const,
        minHeight: '90px',
        boxShadow: selected ? '0 6px 20px rgba(29, 53, 87, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
    }),
    icon: (selected: boolean) => ({
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
        color: selected ? 'white' : '#64748b',
    }),
    label: (selected: boolean) => ({
        fontSize: '0.75rem',
        fontWeight: 600,
        color: selected ? 'white' : '#334155',
    }),
    count: {
        textAlign: 'center' as const,
        color: '#64748b',
        fontSize: '0.875rem',
        marginTop: '1rem',
        padding: '0.75rem',
        background: '#f8fafc',
        borderRadius: '0.5rem',
    },
};

export function AmenitiesStep({ data, updateData }: Props) {
    function toggleAmenity(amenityId: string) {
        const current = data.amenities;
        if (current.includes(amenityId)) {
            updateData({ amenities: current.filter((a) => a !== amenityId) });
        } else {
            updateData({ amenities: [...current, amenityId] });
        }
    }

    return (
        <div style={styles.container}>
            <div>
                <h2 style={styles.heading}>What amenities do you offer?</h2>
                <p style={styles.description}>
                    Select all the amenities available at your hotel. This helps guests find what they need.
                </p>
            </div>

            <div style={styles.grid}>
                {AMENITY_OPTIONS.map((amenity) => {
                    const Icon = amenity.icon;
                    const isSelected = data.amenities.includes(amenity.id);
                    return (
                        <button
                            key={amenity.id}
                            type="button"
                            onClick={() => toggleAmenity(amenity.id)}
                            style={styles.card(isSelected)}
                        >
                            <Icon style={styles.icon(isSelected)} />
                            <span style={styles.label(isSelected)}>{amenity.label}</span>
                        </button>
                    );
                })}
            </div>

            <div style={styles.count}>
                <strong>{data.amenities.length}</strong> amenities selected
            </div>
        </div>
    );
}
