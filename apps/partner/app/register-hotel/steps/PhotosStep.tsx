"use client";

import { useState, useRef } from "react";
import { FiUpload, FiX, FiStar, FiCamera } from "react-icons/fi";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1.5rem',
    },
    heading: {
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#1d3557',
        marginBottom: '0.5rem',
    },
    description: {
        color: '#64748b',
        fontSize: '1rem',
        marginBottom: '0.5rem',
    },
    dropzone: (isUploading: boolean) => ({
        border: '2px dashed',
        borderColor: isUploading ? '#1d3557' : '#e2e8f0',
        borderRadius: '1rem',
        padding: '2.5rem 2rem',
        textAlign: 'center' as const,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isUploading ? 'rgba(29, 53, 87, 0.05)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    }),
    dropzoneIcon: {
        fontSize: '2.5rem',
        color: '#64748b',
        marginBottom: '0.75rem',
    },
    dropzoneText: {
        fontSize: '1rem',
        color: '#334155',
        marginBottom: '0.25rem',
        fontWeight: 500,
    },
    dropzoneHint: {
        fontSize: '0.8125rem',
        color: '#94a3b8',
    },
    gallery: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '1rem',
    },
    photoItem: (isCover: boolean) => ({
        position: 'relative' as const,
        aspectRatio: '4/3',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: isCover ? '3px solid #1d3557' : '2px solid #e2e8f0',
        boxShadow: isCover ? '0 4px 16px rgba(29, 53, 87, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
    }),
    photoImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    },
    photoOverlay: {
        position: 'absolute' as const,
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        opacity: 0,
        transition: 'opacity 0.2s ease',
    },
    coverBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        background: '#1d3557',
        color: 'white',
        padding: '0.25rem 0.625rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: 600,
    },
    btnSetCover: {
        background: 'white',
        color: '#334155',
        border: 'none',
        padding: '0.375rem 0.75rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        cursor: 'pointer',
        fontWeight: 600,
    },
    btnRemove: {
        background: '#dc2626',
        color: 'white',
        border: 'none',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    photoCount: {
        textAlign: 'center' as const,
        color: '#64748b',
        fontSize: '0.875rem',
        padding: '0.75rem',
        background: '#f8fafc',
        borderRadius: '0.5rem',
    },
    suggestion: {
        color: '#f59e0b',
        fontWeight: 500,
    },
};

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
        const newPhotos = data.photos.filter((p) => p !== url);
        if (data.coverImage) {
            newPhotos.unshift(data.coverImage);
        }
        updateData({ coverImage: url, photos: newPhotos });
    }

    const allPhotos = [data.coverImage, ...data.photos].filter(Boolean);

    return (
        <div style={styles.container}>
            <div>
                <h2 style={styles.heading}>Show off your hotel</h2>
                <p style={styles.description}>
                    Upload high-quality photos to attract more guests. The first photo will be your cover image.
                </p>
            </div>

            {/* Drop Zone */}
            <div
                style={styles.dropzone(isUploading)}
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
                <FiUpload style={styles.dropzoneIcon} size={40} />
                <p style={styles.dropzoneText}>
                    {isUploading ? uploadProgress : "Drag photos here or click to upload"}
                </p>
                <span style={styles.dropzoneHint}>PNG, JPG, WebP up to 10MB each</span>
            </div>

            {/* Photo Gallery */}
            {allPhotos.length > 0 && (
                <div style={styles.gallery}>
                    {allPhotos.map((url, index) => (
                        <div
                            key={url}
                            style={styles.photoItem(url === data.coverImage)}
                            onMouseEnter={(e) => {
                                const overlay = e.currentTarget.querySelector('.photo-overlay') as HTMLElement;
                                if (overlay) overlay.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                const overlay = e.currentTarget.querySelector('.photo-overlay') as HTMLElement;
                                if (overlay) overlay.style.opacity = '0';
                            }}
                        >
                            <img src={url} alt={`Hotel photo ${index + 1}`} style={styles.photoImage} />
                            <div className="photo-overlay" style={styles.photoOverlay}>
                                {url === data.coverImage ? (
                                    <span style={styles.coverBadge}>
                                        <FiStar size={12} /> Cover
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setCoverImage(url)}
                                        style={styles.btnSetCover}
                                    >
                                        Set as Cover
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removePhoto(url)}
                                    style={styles.btnRemove}
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={styles.photoCount}>
                <strong>{allPhotos.length}</strong> photo{allPhotos.length !== 1 ? "s" : ""} uploaded
                {allPhotos.length < 3 && (
                    <span style={styles.suggestion}> (We recommend at least 5 photos)</span>
                )}
            </div>
        </div>
    );
}
