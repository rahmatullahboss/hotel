"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FiCheck,
    FiChevronLeft,
    FiChevronRight,
    FiEdit3,
    FiMapPin,
    FiStar,
    FiCamera,
    FiHome,
    FiFileText,
    FiEye
} from "react-icons/fi";
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
    { id: 1, title: "Basic Info", icon: FiEdit3 },
    { id: 2, title: "Location", icon: FiMapPin },
    { id: 3, title: "Amenities", icon: FiStar },
    { id: 4, title: "Photos", icon: FiCamera },
    { id: 5, title: "Rooms", icon: FiHome },
    { id: 6, title: "Documents", icon: FiFileText },
    { id: 7, title: "Preview", icon: FiEye },
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
                <div className="success-icon"><FiCheck size={48} /></div>
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
        <div style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '2rem',
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '1.5rem',
            minHeight: 'calc(100vh - 80px)',
        }}>
            {/* Progress Sidebar */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #1d3557 0%, #2a4a7f 100%)',
                borderRadius: '1.25rem',
                padding: '2.5rem 2rem',
                color: 'white',
                position: 'sticky',
                top: '80px',
                height: 'fit-content',
                boxShadow: '0 10px 40px rgba(29, 53, 87, 0.3)',
            }}>
                <div style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    opacity: 0.6,
                    marginBottom: '1.5rem',
                    fontWeight: 500,
                }}>Getting Started</div>
                {STEPS.map((step) => (
                    <div
                        key={step.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 0',
                            position: 'relative',
                        }}
                    >
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            background: currentStep === step.id ? 'white' : currentStep > step.id ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                            border: currentStep === step.id ? '2px solid white' : currentStep > step.id ? '2px solid #10b981' : '2px solid rgba(255, 255, 255, 0.2)',
                            color: currentStep === step.id ? '#1d3557' : currentStep > step.id ? 'white' : 'rgba(255, 255, 255, 0.5)',
                            boxShadow: currentStep === step.id ? '0 4px 20px rgba(255, 255, 255, 0.3)' : 'none',
                        }}>
                            {currentStep > step.id ? <FiCheck /> : <step.icon />}
                        </div>
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: currentStep === step.id ? 600 : 500,
                            color: currentStep === step.id ? 'white' : currentStep > step.id ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)',
                        }}>{step.title}</span>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div style={{
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
            }}>
                {/* Error Messages */}
                {(error || (stepErrors[currentStep]?.length ?? 0) > 0) && (
                    <div style={{
                        padding: '1rem 1.25rem',
                        background: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: '0.75rem',
                        marginBottom: '2rem',
                        fontSize: '0.875rem',
                        borderLeft: '4px solid #dc2626',
                    }}>
                        {error && <div>{error}</div>}
                        {stepErrors[currentStep]?.map((err, i) => (
                            <div key={i}>{err}</div>
                        ))}
                    </div>
                )}

                {/* Step Content */}
                {currentStep === 1 && <BasicInfoStep data={data} updateData={updateData} />}
                {currentStep === 2 && <LocationStep data={data} updateData={updateData} />}
                {currentStep === 3 && <AmenitiesStep data={data} updateData={updateData} />}
                {currentStep === 4 && <PhotosStep data={data} updateData={updateData} />}
                {currentStep === 5 && <RoomsStep data={data} updateData={updateData} />}
                {currentStep === 6 && <DocumentsStep data={data} updateData={updateData} />}
                {currentStep === 7 && <PreviewStep data={data} />}

                {/* Navigation Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '3rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid #f3f4f6',
                    gap: '1rem',
                }}>
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 2rem',
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            background: 'transparent',
                            border: '2px solid #e5e7eb',
                            color: currentStep === 1 ? '#9ca3af' : '#6b7280',
                            borderRadius: '0.5rem',
                            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentStep === 1 ? 0.4 : 1,
                        }}
                    >
                        <FiChevronLeft /> Back
                    </button>

                    {currentStep < STEPS.length ? (
                        <button
                            onClick={handleNext}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.875rem 2rem',
                                fontSize: '0.9375rem',
                                fontWeight: 600,
                                background: '#1d3557',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(29, 53, 87, 0.3)',
                            }}
                        >
                            Next <FiChevronRight />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.875rem 2rem',
                                fontSize: '0.9375rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 16px rgba(230, 57, 70, 0.4)',
                                opacity: isSubmitting ? 0.7 : 1,
                            }}
                        >
                            {isSubmitting ? "Submitting..." : "Submit for Approval"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
