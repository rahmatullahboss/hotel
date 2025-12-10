"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Next.js
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const selectedIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export interface HotelMarker {
    id: string;
    name: string;
    lat: number;
    lng: number;
    price: number;
    rating?: number;
}

interface HotelMapProps {
    hotels: HotelMarker[];
    selectedHotelId?: string;
    onMarkerClick?: (hotelId: string) => void;
    center?: [number, number];
    zoom?: number;
}

export function HotelMap({
    hotels,
    selectedHotelId,
    onMarkerClick,
    center = [23.8103, 90.4125], // Default: Dhaka
    zoom = 12,
}: HotelMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const [isMapReady, setIsMapReady] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center,
            zoom,
            zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Add zoom control to bottom right
        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapInstanceRef.current = map;
        setIsMapReady(true);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Update markers when hotels change
    useEffect(() => {
        if (!mapInstanceRef.current || !isMapReady) return;

        const map = mapInstanceRef.current;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Add new markers
        hotels.forEach((hotel) => {
            if (!hotel.lat || !hotel.lng) return;

            const isSelected = hotel.id === selectedHotelId;
            const marker = L.marker([hotel.lat, hotel.lng], {
                icon: isSelected ? selectedIcon : defaultIcon,
            });

            // Create popup content
            const popupContent = `
                <div style="min-width: 150px;">
                    <strong style="font-size: 14px;">${hotel.name}</strong>
                    <div style="margin-top: 4px;">
                        <span style="color: #e63946; font-weight: 700;">৳${hotel.price.toLocaleString()}</span>
                        <span style="color: #666; font-size: 12px;">/night</span>
                    </div>
                    ${hotel.rating ? `<div style="color: #f4a261; font-size: 12px; margin-top: 2px;">★ ${hotel.rating}</div>` : ""}
                </div>
            `;

            marker.bindPopup(popupContent, {
                closeButton: false,
                offset: [0, -20],
            });

            marker.on("click", () => {
                if (onMarkerClick) {
                    onMarkerClick(hotel.id);
                }
            });

            marker.on("mouseover", () => {
                marker.openPopup();
            });

            marker.addTo(map);
            markersRef.current.push(marker);
        });

        // Fit bounds if we have hotels
        if (hotels.length > 0) {
            const validHotels = hotels.filter((h) => h.lat && h.lng);
            if (validHotels.length > 0) {
                const bounds = L.latLngBounds(validHotels.map((h) => [h.lat, h.lng]));
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [hotels, selectedHotelId, isMapReady, onMarkerClick]);

    // Pan to selected hotel
    useEffect(() => {
        if (!mapInstanceRef.current || !selectedHotelId || !isMapReady) return;

        const selectedHotel = hotels.find((h) => h.id === selectedHotelId);
        if (selectedHotel?.lat && selectedHotel?.lng) {
            mapInstanceRef.current.setView([selectedHotel.lat, selectedHotel.lng], 15, {
                animate: true,
            });
        }
    }, [selectedHotelId, hotels, isMapReady]);

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "100%",
                minHeight: 300,
                borderRadius: "0.75rem",
                overflow: "hidden",
            }}
        />
    );
}
