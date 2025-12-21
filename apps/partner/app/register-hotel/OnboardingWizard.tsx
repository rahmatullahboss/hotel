"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { LocationStep } from "./steps/LocationStep";
import { AmenitiesStep } from "./steps/AmenitiesStep";
import { PhotosStep } from "./steps/PhotosStep";
import { RoomsStep } from "./steps/RoomsStep";
import { DocumentsStep } from "./steps/DocumentsStep";
import { PreviewStep } from "./steps/PreviewStep";
import { submitHotelRegistration } from "../actions/hotel-registration";

export interface RoomInput {
    name: string;
    type: "SINGLE" | "DOUBLE" | "SUITE" | "DORMITORY";
    roomNumber: string;
    basePrice: string;
    maxGuests: number;
    description?: string;
    amenities: string[];
}

export interface OnboardingData {
    // Step 1: Basic Info
    name: string;
    description: string;
    phone: string;
    email: string;
    // Step 2: Location
    city: string;
    address: string;
    latitude?: number;
    longitude?: number;
    // Step 3: Amenities
    amenities: string[];
    // Step 4: Photos
    coverImage: string;
    photos: string[];
    // Step 5: Rooms
    rooms: RoomInput[];
    // Step 6: Documents
    ownerNid?: string;
    tradeLicense?: string;
}

const INITIAL_DATA: OnboardingData = {
    name: "",
    description: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    amenities: [],
    coverImage: "",
    photos: [],
    rooms: [],
    ownerNid: "",
    tradeLicense: "",
};

const STEPS = [
    { id: 1, title: "Basic Info", icon: "📝" },
    { id: 2, title: "Location", icon: "📍" },
    { id: 3, title: "Amenities", icon: "✨" },
    { id: 4, title: "Photos", icon: "📸" },
    { id: 5, title: "Rooms", icon: "🛏️" },
    { id: 6, title: "Documents", icon: "📄" },
    { id: 7, title: "Preview", icon: "👁️" },
];

const STORAGE_KEY = "hotel_onboarding_draft";

export function OnboardingWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

    // Load draft from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setData(parsed.data || INITIAL_DATA);
                setCurrentStep(parsed.step || 1);
            } catch {
                // Invalid data, ignore
            }
        }
    }, []);

    // Save draft to localStorage on every change
    useEffect(() => {
        if (data !== INITIAL_DATA) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step: currentStep }));
        }
    }, [data, currentStep]);

    function updateData(updates: Partial<OnboardingData>) {
        setData((prev) => ({ ...prev, ...updates }));
    }

    function validateStep(step: number): string[] {
        const errors: string[] = [];
        switch (step) {
            case 1:
                if (!data.name.trim()) errors.push("Hotel name is required");
                if (!data.description.trim()) errors.push("Description is required");
                if (!data.phone.trim()) errors.push("Phone number is required");
                break;
            case 2:
                if (!data.city) errors.push("City is required");
                if (!data.address.trim()) errors.push("Address is required");
                break;
            case 3:
                if (data.amenities.length === 0) errors.push("Select at least one amenity");
                break;
            case 4:
                if (!data.coverImage) errors.push("Cover image is required");
                break;
            case 5:
                if (data.rooms.length === 0) errors.push("Add at least one room");
                break;
            case 6:
                // Documents are optional for now
                break;
        }
        return errors;
    }

    function handleNext() {
        const errors = validateStep(currentStep);
        if (errors.length > 0) {
            setStepErrors({ ...stepErrors, [currentStep]: errors });
            return;
        }
        setStepErrors({ ...stepErrors, [currentStep]: [] });
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    }

    function handleBack() {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    }

    async function handleSubmit() {
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await submitHotelRegistration({
                name: data.name,
                description: data.description,
                address: data.address,
                city: data.city,
                amenities: data.amenities,
                phone: data.phone,
                latitude: data.latitude,
                longitude: data.longitude,
                photos: data.photos,
                coverImage: data.coverImage,
                rooms: data.rooms,
                ownerNid: data.ownerNid,
                tradeLicense: data.tradeLicense,
            });

            if (result.success) {
                localStorage.removeItem(STORAGE_KEY);
                setSuccess(true);
            } else {
                setError(result.error || "Failed to submit registration");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (success) {
        return (
            <div className="onboarding-success">
                <div className="success-icon">✓</div>
                <h1>Registration Submitted!</h1>
                <p>
                    Your hotel registration is now pending approval. Our team will review
                    your submission and get back to you within 24-48 hours.
                </p>
                <button onClick={() => router.push("/")} className="btn btn-primary">
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="onboarding-wizard">
            {/* Progress Indicator */}
            <div className="wizard-progress">
                {STEPS.map((step, index) => (
                    <div
                        key={step.id}
                        className={`progress-step ${currentStep === step.id ? "active" : ""} ${currentStep > step.id ? "completed" : ""}`}
                    >
                        <div className="step-indicator">
                            {currentStep > step.id ? <FiCheck /> : step.icon}
                        </div>
                        <span className="step-title">{step.title}</span>
                        {index < STEPS.length - 1 && <div className="step-connector" />}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="wizard-content">
                {error && <div className="wizard-error">{error}</div>}
                {stepErrors[currentStep]?.length && stepErrors[currentStep].length > 0 && (
                    <div className="wizard-error">
                        {stepErrors[currentStep]?.map((err, i) => (
                            <div key={i}>{err}</div>
                        ))}
                    </div>
                )}

                {currentStep === 1 && <BasicInfoStep data={data} updateData={updateData} />}
                {currentStep === 2 && <LocationStep data={data} updateData={updateData} />}
                {currentStep === 3 && <AmenitiesStep data={data} updateData={updateData} />}
                {currentStep === 4 && <PhotosStep data={data} updateData={updateData} />}
                {currentStep === 5 && <RoomsStep data={data} updateData={updateData} />}
                {currentStep === 6 && <DocumentsStep data={data} updateData={updateData} />}
                {currentStep === 7 && <PreviewStep data={data} />}
            </div>

            {/* Navigation Buttons */}
            <div className="wizard-navigation">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="btn btn-outline"
                >
                    <FiChevronLeft /> Back
                </button>

                {currentStep < STEPS.length ? (
                    <button onClick={handleNext} className="btn btn-primary">
                        Next <FiChevronRight />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="btn btn-accent"
                    >
                        {isSubmitting ? "Submitting..." : "Submit for Approval"}
                    </button>
                )}
            </div>
        </div>
    );
}
