"use client";

import { FiWifi, FiTv, FiCoffee, FiDroplet, FiSun, FiUsers, FiShield, FiClock, FiWind, FiPhone, FiMapPin, FiThermometer } from "react-icons/fi";
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
        <div className="step-content">
            <h2 className="step-heading">What amenities do you offer?</h2>
            <p className="step-description">
                Select all the amenities available at your hotel. This helps guests find what they need.
            </p>

            <div className="amenities-grid">
                {AMENITY_OPTIONS.map((amenity) => {
                    const Icon = amenity.icon;
                    const isSelected = data.amenities.includes(amenity.id);
                    return (
                        <button
                            key={amenity.id}
                            type="button"
                            onClick={() => toggleAmenity(amenity.id)}
                            className={`amenity-card ${isSelected ? "selected" : ""}`}
                        >
                            <Icon className="amenity-icon" />
                            <span className="amenity-label">{amenity.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="selected-count">
                {data.amenities.length} amenities selected
            </div>
        </div>
    );
}
