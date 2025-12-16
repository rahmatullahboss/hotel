"use client";

import { useState, useEffect, useCallback } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ImageGalleryModalProps {
    images: string[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
    hotelName: string;
}

export function ImageGalleryModal({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
    hotelName,
}: ImageGalleryModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Reset to initial index when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            if (e.key === "ArrowRight") setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        },
        [isOpen, images.length, onClose]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const goToPrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    const goToNext = () => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));

    return (
        <div className="image-gallery-overlay" onClick={onClose}>
            <div className="image-gallery-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="image-gallery-header">
                    <div className="image-gallery-counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                    <h3 className="image-gallery-title">{hotelName}</h3>
                    <button className="image-gallery-close" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                {/* Main Image */}
                <div className="image-gallery-main">
                    <img
                        src={images[currentIndex]}
                        alt={`${hotelName} - Photo ${currentIndex + 1}`}
                        className="image-gallery-image"
                    />

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button className="image-gallery-nav image-gallery-prev" onClick={goToPrev}>
                                <FiChevronLeft size={32} />
                            </button>
                            <button className="image-gallery-nav image-gallery-next" onClick={goToNext}>
                                <FiChevronRight size={32} />
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                    <div className="image-gallery-thumbnails">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                className={`image-gallery-thumb ${i === currentIndex ? "active" : ""}`}
                                onClick={() => setCurrentIndex(i)}
                            >
                                <img src={img} alt={`Thumbnail ${i + 1}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
