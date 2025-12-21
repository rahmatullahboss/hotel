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
        <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 min-h-[calc(100vh-120px)] font-sans">
            {/* Sidebar Stepper */}
            <div className="flex flex-col gap-0 bg-gradient-to-br from-[#1d3557] to-[#2a4a7f] rounded-2xl p-6 md:p-8 text-white sticky top-[100px] h-fit shadow-2xl">
                <div className="text-xs font-bold tracking-widest text-white/50 mb-6 uppercase">Getting Started</div>
                {STEPS.map((step, i) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                        <div key={step.id} className={`relative flex items-center gap-4 py-4 ${isActive ? 'opacity-100' : 'opacity-60'} hover:opacity-100 transition-opacity cursor-pointer group`}>
                            {/* Icon Circle */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 z-10 relative transition-all duration-300 ${isActive ? 'bg-white text-[#1d3557] border-white scale-110 shadow-lg' :
                                isCompleted ? 'bg-emerald-500 text-white border-emerald-500' :
                                    'bg-white/10 text-white/60 border-white/20'
                                }`}>
                                {isCompleted ? <FiCheck size={18} /> : <step.icon />}
                            </div>

                            {/* Text */}
                            <div className={`text-sm font-medium ${isActive ? 'text-white font-bold' : 'text-white/80'}`}>
                                {step.title}
                            </div>

                            {/* Connector Line */}
                            {i < STEPS.length - 1 && (
                                <div className={`absolute left-[19px] top-10 w-[2px] h-8 ${isCompleted ? 'bg-emerald-500' : 'bg-white/10'}`} />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-black/5 [&_input]:w-full [&_input]:p-4 [&_input]:border [&_input]:border-gray-200 [&_input]:rounded-xl [&_input]:bg-gray-50 [&_input:focus]:bg-white [&_input:focus]:ring-4 [&_input:focus]:ring-[#1d3557]/10 [&_input]:transition-all [&_label]:font-bold [&_label]:text-gray-700 [&_label]:mb-2 [&_label]:block [&_textarea]:w-full [&_textarea]:p-4 [&_textarea]:border [&_textarea]:border-gray-200 [&_textarea]:rounded-xl [&_textarea]:bg-gray-50 [&_select]:w-full [&_select]:p-4 [&_select]:border [&_select]:border-gray-200 [&_select]:rounded-xl [&_select]:bg-gray-50">
                {/* Error Message */}
                {(error || (stepErrors[currentStep]?.length ?? 0) > 0) && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border-l-4 border-red-500 text-sm">
                        <p className="font-bold mb-1">Please fix the following errors:</p>
                        {error && <div>• {error}</div>}
                        {stepErrors[currentStep]?.map((err, i) => (
                            <div key={i}>• {err}</div>
                        ))}
                    </div>
                )}

                <div className="min-h-[400px]">
                    {currentStep === 1 && <BasicInfoStep data={data} updateData={updateData} />}
                    {currentStep === 2 && <LocationStep data={data} updateData={updateData} />}
                    {currentStep === 3 && <AmenitiesStep data={data} updateData={updateData} />}
                    {currentStep === 4 && <PhotosStep data={data} updateData={updateData} />}
                    {currentStep === 5 && <RoomsStep data={data} updateData={updateData} />}
                    {currentStep === 6 && <DocumentsStep data={data} updateData={updateData} />}
                    {currentStep === 7 && <PreviewStep data={data} />}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-semibold hover:border-gray-300 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <FiChevronLeft /> Back
                    </button>

                    {currentStep < STEPS.length ? (
                        <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#1d3557] text-white font-semibold hover:bg-[#152945] shadow-lg shadow-[#1d3557]/20 transition-all">
                            Next <FiChevronRight />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white font-semibold hover:opacity-90 shadow-lg shadow-[#e63946]/20 transition-all"
                        >
                            {isSubmitting ? "Submitting..." : "Submit for Approval"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
