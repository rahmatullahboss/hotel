"use client";

import { useState, useRef } from "react";
import { FiUpload, FiCheck, FiX, FiFileText, FiCreditCard } from "react-icons/fi";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

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
        <div className="step-content">
            <h2 className="step-heading">Verify your documents</h2>
            <p className="step-description">
                Upload documents for verification. This helps build trust with guests.
                <span className="optional-note"> (Optional - you can add these later)</span>
            </p>

            <div className="documents-grid">
                {/* NID Upload */}
                <div className="document-card">
                    <div className="document-icon">
                        <FiCreditCard />
                    </div>
                    <h3>Owner's NID</h3>
                    <p>Upload a clear photo of your National ID card</p>

                    {data.ownerNid ? (
                        <div className="document-preview">
                            <img src={data.ownerNid} alt="NID Preview" />
                            <div className="preview-overlay">
                                <span className="uploaded-badge">
                                    <FiCheck /> Uploaded
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove("nid")}
                                    className="btn-remove"
                                >
                                    <FiX /> Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => nidInputRef.current?.click()}
                            className="btn btn-upload"
                            disabled={uploading === "nid"}
                        >
                            <FiUpload />
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
                <div className="document-card">
                    <div className="document-icon">
                        <FiFileText />
                    </div>
                    <h3>Trade License</h3>
                    <p>Upload your hotel's trade license or business registration</p>

                    {data.tradeLicense ? (
                        <div className="document-preview">
                            <img src={data.tradeLicense} alt="Trade License Preview" />
                            <div className="preview-overlay">
                                <span className="uploaded-badge">
                                    <FiCheck /> Uploaded
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove("license")}
                                    className="btn-remove"
                                >
                                    <FiX /> Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => licenseInputRef.current?.click()}
                            className="btn btn-upload"
                            disabled={uploading === "license"}
                        >
                            <FiUpload />
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

            <div className="documents-note">
                <p>
                    <strong>Note:</strong> Your documents are securely stored and only used for verification purposes.
                    They will not be shown to guests.
                </p>
            </div>
        </div>
    );
}
