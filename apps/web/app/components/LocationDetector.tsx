"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Map of city coordinates to slugs
const CITY_COORDINATES: {
    name: string;
    slug: string;
    lat: number;
    lng: number;
    radius: number; // km
}[] = [
        { name: "Dhaka", slug: "dhaka", lat: 23.8103, lng: 90.4125, radius: 30 },
        { name: "Cox's Bazar", slug: "cox-bazar", lat: 21.4272, lng: 92.0058, radius: 20 },
        { name: "Chittagong", slug: "chittagong", lat: 22.3569, lng: 91.7832, radius: 25 },
        { name: "Sylhet", slug: "sylhet", lat: 24.8949, lng: 91.8687, radius: 20 },
        { name: "Rajshahi", slug: "rajshahi", lat: 24.3745, lng: 88.6042, radius: 20 },
        { name: "Khulna", slug: "khulna", lat: 22.8456, lng: 89.5403, radius: 20 },
        { name: "Rangpur", slug: "rangpur", lat: 25.7439, lng: 89.2752, radius: 20 },
        { name: "Mymensingh", slug: "mymensingh", lat: 24.7471, lng: 90.4203, radius: 20 },
    ];

// Calculate distance between two coordinates using Haversine formula
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Find the nearest city based on coordinates
function findNearestCity(lat: number, lng: number): string | null {
    let nearestCity: string | null = null;
    let minDistance = Infinity;

    for (const city of CITY_COORDINATES) {
        const distance = getDistanceKm(lat, lng, city.lat, city.lng);
        if (distance <= city.radius && distance < minDistance) {
            minDistance = distance;
            nearestCity = city.slug;
        }
    }

    return nearestCity;
}

interface LocationDetectorProps {
    autoRedirect?: boolean;
    onLocationDetected?: (city: string | null, coords: { lat: number; lng: number }) => void;
}

export function LocationDetector({ autoRedirect = false, onLocationDetected }: LocationDetectorProps) {
    const router = useRouter();
    const [detecting, setDetecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Only auto-detect if enabled and not already on a city page
        if (!autoRedirect) return;

        // Check if user has already been redirected in this session
        const alreadyRedirected = sessionStorage.getItem("locationRedirected");
        if (alreadyRedirected) return;

        detectLocation();
    }, [autoRedirect]);

    async function detectLocation() {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported");
            return;
        }

        setDetecting(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const nearestCity = findNearestCity(latitude, longitude);

                if (onLocationDetected) {
                    onLocationDetected(nearestCity, { lat: latitude, lng: longitude });
                }

                if (autoRedirect && nearestCity) {
                    // Mark as redirected so we don't loop
                    sessionStorage.setItem("locationRedirected", "true");
                    router.push(`/city/${nearestCity}`);
                }

                setDetecting(false);
            },
            (err) => {
                console.warn("Geolocation error:", err.message);
                setError(err.message);
                setDetecting(false);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000, // Cache for 5 minutes
            }
        );
    }

    // This component renders nothing - it just handles detection
    return null;
}

// Hook for manual location detection
export function useLocationDetection() {
    const [location, setLocation] = useState<{
        city: string | null;
        coords: { lat: number; lng: number } | null;
        loading: boolean;
        error: string | null;
    }>({
        city: null,
        coords: null,
        loading: false,
        error: null,
    });

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setLocation((prev) => ({ ...prev, error: "Geolocation not supported" }));
            return;
        }

        setLocation((prev) => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const nearestCity = findNearestCity(latitude, longitude);
                setLocation({
                    city: nearestCity,
                    coords: { lat: latitude, lng: longitude },
                    loading: false,
                    error: null,
                });
            },
            (err) => {
                setLocation((prev) => ({
                    ...prev,
                    loading: false,
                    error: err.message,
                }));
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    };

    return { ...location, detectLocation };
}
