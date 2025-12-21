"use client";

import { useState, useRef } from "react";
import { FiUpload, FiCheck, FiX, FiFileText, FiCreditCard, FiShield } from "react-icons/fi";
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
    optionalNote: {
        color: '#94a3b8',
        fontSize: '0.875rem',
        fontStyle: 'italic',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
    },
    card: {
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '1rem',
        textAlign: 'center' as const,
    },
    iconWrapper: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1d3557 0%, #2a4a7f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 4px 16px rgba(29, 53, 87, 0.25)',
    },
    cardTitle: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#1d3557',
        margin: 0,
    },
    cardDescription: {
        fontSize: '0.875rem',
        color: '#64748b',
        margin: 0,
        lineHeight: 1.5,
    },
    previewContainer: {
        width: '100%',
        aspectRatio: '16/10',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        position: 'relative' as const,
        border: '2px solid #10b981',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    },
    previewOverlay: {
        position: 'absolute' as const,
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
    },
    uploadedBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        background: '#10b981',
        color: 'white',
        padding: '0.375rem 0.875rem',
        borderRadius: '2rem',
        fontSize: '0.8125rem',
        fontWeight: 600,
    },
    btnRemove: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        background: '#dc2626',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        fontSize: '0.8125rem',
        fontWeight: 600,
        cursor: 'pointer',
    },
    btnUpload: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'white',
        color: '#1d3557',
        border: '2px dashed #cbd5e1',
        padding: '0.875rem 1.5rem',
        borderRadius: '0.75rem',
        fontSize: '0.9375rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        width: '100%',
        justifyContent: 'center',
    },
    note: {
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '1px solid #93c5fd',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
    },
    noteIcon: {
        color: '#3b82f6',
        flexShrink: 0,
        marginTop: '2px',
    },
    noteText: {
        fontSize: '0.875rem',
        color: '#1e40af',
        lineHeight: 1.6,
        margin: 0,
    },
};

export function DocumentsStep({ data, updateData }: Props) {
    const [uploading, setUploading] = useState<"nid" | "license" | null>(null);
    const nidInputRef = useRef<HTMLInputElement>(null);
    const licenseInputRef = useRef<HTMLInputElement>(null);

    async function handleUpload(type: "nid" | "license", file: File) {
        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
            return;
        }

        setUploading(type);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const { url } = await res.json();
                if (type === "nid") {
                    updateData({ ownerNid: url });
                } else {
                    updateData({ tradeLicense: url });
                }
            }
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(null);
        }
    }

    function handleRemove(type: "nid" | "license") {
        if (type === "nid") {
            updateData({ ownerNid: "" });
        } else {
            updateData({ tradeLicense: "" });
        }
    }

    return (
        <div style={styles.container}>
            <div>
                <h2 style={styles.heading}>Verify your documents</h2>
                <p style={styles.description}>
                    Upload documents for verification. This helps build trust with guests.
                    <span style={styles.optionalNote}> (Optional - you can add these later)</span>
                </p>
            </div>

            <div style={styles.grid}>
                {/* NID Upload */}
                <div style={styles.card}>
                    <div style={styles.iconWrapper}>
                        <FiCreditCard size={28} />
                    </div>
                    <h3 style={styles.cardTitle}>Owner's NID</h3>
                    <p style={styles.cardDescription}>
                        Upload a clear photo of your National ID card
                    </p>

                    {data.ownerNid ? (
                        <div style={styles.previewContainer}>
                            <img src={data.ownerNid} alt="NID Preview" style={styles.previewImage} />
                            <div style={styles.previewOverlay}>
                                <span style={styles.uploadedBadge}>
                                    <FiCheck size={14} /> Uploaded
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove("nid")}
                                    style={styles.btnRemove}
                                >
                                    <FiX size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => nidInputRef.current?.click()}
                            style={styles.btnUpload}
                            disabled={uploading === "nid"}
                        >
                            <FiUpload size={18} />
                            {uploading === "nid" ? "Uploading..." : "Upload NID"}
                        </button>
                    )}
                    <input
                        ref={nidInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => e.target.files?.[0] && handleUpload("nid", e.target.files[0])}
                        style={{ display: "none" }}
                    />
                </div>

                {/* Trade License Upload */}
                <div style={styles.card}>
                    <div style={styles.iconWrapper}>
                        <FiFileText size={28} />
                    </div>
                    <h3 style={styles.cardTitle}>Trade License</h3>
                    <p style={styles.cardDescription}>
                        Upload your hotel's trade license or business registration
                    </p>

                    {data.tradeLicense ? (
                        <div style={styles.previewContainer}>
                            <img src={data.tradeLicense} alt="Trade License Preview" style={styles.previewImage} />
                            <div style={styles.previewOverlay}>
                                <span style={styles.uploadedBadge}>
                                    <FiCheck size={14} /> Uploaded
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove("license")}
                                    style={styles.btnRemove}
                                >
                                    <FiX size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => licenseInputRef.current?.click()}
                            style={styles.btnUpload}
                            disabled={uploading === "license"}
                        >
                            <FiUpload size={18} />
                            {uploading === "license" ? "Uploading..." : "Upload License"}
                        </button>
                    )}
                    <input
                        ref={licenseInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => e.target.files?.[0] && handleUpload("license", e.target.files[0])}
                        style={{ display: "none" }}
                    />
                </div>
            </div>

            <div style={styles.note}>
                <FiShield size={18} style={styles.noteIcon} />
                <p style={styles.noteText}>
                    <strong>Secure & Private:</strong> Your documents are securely stored and only used for verification purposes.
                    They will never be shown to guests.
                </p>
            </div>
        </div>
    );
}
