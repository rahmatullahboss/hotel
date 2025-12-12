"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface LocationPickerProps {
    value?: { lat: number; lng: number };
    onChange: (location: { lat: number; lng: number; address?: string }) => void;
    defaultCenter?: [number, number];
}

export function LocationPicker({
    value,
    onChange,
    defaultCenter = [23.8103, 90.4125], // Dhaka
}: LocationPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const leafletRef = useRef<typeof import("leaflet") | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [address, setAddress] = useState<string>("");

    // Reverse geocoding using Nominatim (free, open-source)
    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await response.json();
            if (data.display_name) {
                setAddress(data.display_name);
                return data.display_name;
            }
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
        }
        return undefined;
    }, []);

    // Initialize map (dynamically import Leaflet to avoid SSR issues)
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        let mounted = true;

        const initMap = async () => {
            // Dynamically import Leaflet only on client-side
            const L = await import("leaflet");

            // Dynamically load Leaflet CSS
            if (!document.querySelector('link[href*="leaflet.css"]')) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(link);
            }

            if (!mounted || !mapRef.current) return;

            leafletRef.current = L;

            // Create custom marker icon
            const markerIcon = L.icon({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            });

            const initialCenter = value ? [value.lat, value.lng] as [number, number] : defaultCenter;

            const map = L.map(mapRef.current, {
                center: initialCenter,
                zoom: 14,
                zoomControl: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);

            // Add initial marker if value exists
            if (value) {
                const marker = L.marker([value.lat, value.lng], { icon: markerIcon, draggable: true });
                marker.addTo(map);
                markerRef.current = marker;

                // Handle marker drag
                marker.on("dragend", async () => {
                    const pos = marker.getLatLng();
                    const addr = await reverseGeocode(pos.lat, pos.lng);
                    onChange({ lat: pos.lat, lng: pos.lng, address: addr });
                });

                reverseGeocode(value.lat, value.lng);
            }

            // Handle map click to place/move marker
            map.on("click", async (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;

                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                } else {
                    const marker = L.marker([lat, lng], { icon: markerIcon, draggable: true });
                    marker.addTo(map);
                    markerRef.current = marker;

                    marker.on("dragend", async () => {
                        const pos = marker.getLatLng();
                        const addr = await reverseGeocode(pos.lat, pos.lng);
                        onChange({ lat: pos.lat, lng: pos.lng, address: addr });
                    });
                }

                const addr = await reverseGeocode(lat, lng);
                onChange({ lat, lng, address: addr });
            });

            mapInstanceRef.current = map;
            setIsMapLoaded(true);
        };

        initMap();

        return () => {
            mounted = false;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update marker when value changes externally
    useEffect(() => {
        if (!mapInstanceRef.current || !value) return;

        if (markerRef.current) {
            markerRef.current.setLatLng([value.lat, value.lng]);
        }
        mapInstanceRef.current.setView([value.lat, value.lng], 15);
    }, [value?.lat, value?.lng]);

    // Get current location
    const handleUseCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            return;
        }

        if (!leafletRef.current || !mapInstanceRef.current) {
            alert("Map not loaded yet");
            return;
        }

        setIsLoading(true);
        const L = leafletRef.current;
        const markerIcon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords;

                // Update map view
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([lat, lng], 16);

                    if (markerRef.current) {
                        markerRef.current.setLatLng([lat, lng]);
                    } else {
                        const marker = L.marker([lat, lng], { icon: markerIcon, draggable: true });
                        marker.addTo(mapInstanceRef.current);
                        markerRef.current = marker;

                        marker.on("dragend", async () => {
                            const pos = marker.getLatLng();
                            const addr = await reverseGeocode(pos.lat, pos.lng);
                            onChange({ lat: pos.lat, lng: pos.lng, address: addr });
                        });
                    }
                }

                const addr = await reverseGeocode(lat, lng);
                onChange({ lat, lng, address: addr });
                setIsLoading(false);
            },
            (error) => {
                alert(error.code === 1 ? "Location access denied" : "Failed to get location");
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [onChange, reverseGeocode]);

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                }}
            >
                <label style={{ fontWeight: 500 }}>
                    Hotel Location <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleUseCurrentLocation}
                    disabled={isLoading || !isMapLoaded}
                    style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                >
                    {isLoading ? "📍 Getting..." : "📍 Use My Location"}
                </button>
            </div>

            <div
                ref={mapRef}
                style={{
                    width: "100%",
                    height: 300,
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg-secondary)",
                }}
            />

            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.5rem" }}>
                Click on the map or drag the marker to set your hotel location
            </p>

            {address && (
                <div
                    style={{
                        marginTop: "0.5rem",
                        padding: "0.75rem",
                        background: "var(--color-bg-secondary)",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                    }}
                >
                    📍 {address}
                </div>
            )}

            {value && (
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Latitude</label>
                        <input
                            type="text"
                            value={value.lat.toFixed(6)}
                            readOnly
                            className="form-input"
                            style={{ fontSize: "0.875rem" }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Longitude</label>
                        <input
                            type="text"
                            value={value.lng.toFixed(6)}
                            readOnly
                            className="form-input"
                            style={{ fontSize: "0.875rem" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
