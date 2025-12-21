"use client";

import { useState, useRef } from "react";
import { FiUpload, FiX, FiImage, FiStar } from "react-icons/fi";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

export function PhotosStep({ data, updateData }: Props) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileUpload(files: FileList | null) {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const uploaded: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file || !file.type.startsWith("image/")) continue;

            setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);

            try {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (res.ok) {
                    const { url } = await res.json();
                    uploaded.push(url);
                }
            } catch (err) {
                console.error("Upload failed:", err);
            }
        }

        if (uploaded.length > 0) {
            // First uploaded image becomes cover if none set
            if (!data.coverImage && uploaded.length > 0) {
                updateData({
                    coverImage: uploaded[0],
                    photos: [...data.photos, ...uploaded.slice(1)],
                });
            } else {
                updateData({ photos: [...data.photos, ...uploaded] });
            }
        }

        setIsUploading(false);
        setUploadProgress("");
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        handleFileUpload(e.dataTransfer.files);
    }

    function removePhoto(url: string) {
        if (data.coverImage === url) {
            // Move first gallery photo to cover, or clear
            const newPhotos = data.photos.filter((p) => p !== url);
            updateData({
                coverImage: newPhotos[0] || "",
                photos: newPhotos.slice(1),
            });
        } else {
            updateData({ photos: data.photos.filter((p) => p !== url) });
        }
    }

    function setCoverImage(url: string) {
        // Swap with current cover
        const newPhotos = data.photos.filter((p) => p !== url);
        if (data.coverImage) {
            newPhotos.unshift(data.coverImage);
        }
        updateData({ coverImage: url, photos: newPhotos });
    }

    const allPhotos = [data.coverImage, ...data.photos].filter(Boolean);

    return (
        <div className="step-content">
            <h2 className="step-heading">Show off your hotel</h2>
            <p className="step-description">
                Upload high-quality photos to attract more guests. The first photo will be your cover image.
            </p>

            {/* Drop Zone */}
            <div
                className={`photo-dropzone ${isUploading ? "uploading" : ""}`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    style={{ display: "none" }}
                />
                <FiUpload className="dropzone-icon" />
                <p className="dropzone-text">
                    {isUploading ? uploadProgress : "Drag photos here or click to upload"}
                </p>
                <span className="dropzone-hint">PNG, JPG, WebP up to 10MB each</span>
            </div>

            {/* Photo Gallery */}
            {allPhotos.length > 0 && (
                <div className="photo-gallery">
                    {allPhotos.map((url, index) => (
                        <div
                            key={url}
                            className={`photo-item ${url === data.coverImage ? "cover" : ""}`}
                        >
                            <img src={url} alt={`Hotel photo ${index + 1}`} />
                            <div className="photo-overlay">
                                {url === data.coverImage ? (
                                    <span className="cover-badge">
                                        <FiStar /> Cover
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setCoverImage(url)}
                                        className="btn-set-cover"
                                    >
                                        Set as Cover
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removePhoto(url)}
                                    className="btn-remove"
                                >
                                    <FiX />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="photo-count">
                {allPhotos.length} photo{allPhotos.length !== 1 ? "s" : ""} uploaded
                {allPhotos.length < 3 && (
                    <span className="photo-suggestion"> (We recommend at least 5 photos)</span>
                )}
            </div>
        </div>
    );
}
