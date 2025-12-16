"use client";

import { useState } from "react";
import { FiImage } from "react-icons/fi";
import { ImageGalleryModal } from "./ImageGalleryModal";

interface HotelImageGalleryProps {
    images: string[];
    hotelName: string;
}

export function HotelImageGallery({ images, hotelName }: HotelImageGalleryProps) {
    const [showModal, setShowModal] = useState(false);
    const [initialIndex, setInitialIndex] = useState(0);

    // Ensure we have at least 5 images for the grid, repeat if needed
    const displayImages = images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"];

    const mainImage = displayImages[0];
    const thumbnails = displayImages.slice(1, 5);

    const openGallery = (index: number) => {
        setInitialIndex(index);
        setShowModal(true);
    };

    return (
        <>
            <div className="hotel-gallery-grid">
                {/* Main Large Image */}
                <div
                    className="hotel-gallery-main"
                    onClick={() => openGallery(0)}
                >
                    <img src={mainImage} alt={hotelName} />
                </div>

                {/* Thumbnail Grid */}
                <div className="hotel-gallery-thumbs">
                    {thumbnails.map((img, index) => (
                        <div
                            key={index}
                            className="hotel-gallery-thumb"
                            onClick={() => openGallery(index + 1)}
                        >
                            <img src={img} alt={`${hotelName} - ${index + 2}`} />

                            {/* Show "View all X photos" on last thumbnail */}
                            {index === thumbnails.length - 1 && displayImages.length > 5 && (
                                <div className="hotel-gallery-overlay">
                                    <FiImage size={20} />
                                    <span>+{displayImages.length - 5} photos</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Fill empty slots if less than 4 thumbnails */}
                    {thumbnails.length < 4 && thumbnails.length > 0 && (
                        <div
                            className="hotel-gallery-thumb hotel-gallery-view-all"
                            onClick={() => openGallery(0)}
                        >
                            <FiImage size={24} />
                            <span>View all {displayImages.length} photos</span>
                        </div>
                    )}
                </div>

                {/* View All Photos Button */}
                <button
                    className="hotel-gallery-btn"
                    onClick={() => openGallery(0)}
                >
                    <FiImage size={16} />
                    View all {displayImages.length} photos
                </button>
            </div>

            {/* Fullscreen Modal */}
            <ImageGalleryModal
                images={displayImages}
                initialIndex={initialIndex}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                hotelName={hotelName}
            />
        </>
    );
}
