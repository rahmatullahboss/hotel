"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { deleteAccount } from "../actions/profile";

interface DeleteAccountButtonProps {
    userId: string;
}

export function DeleteAccountButton({ userId }: DeleteAccountButtonProps) {
    const t = useTranslations("profile");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        const result = await deleteAccount(userId);

        if (result.success) {
            // Sign out and redirect to home page
            await signOut({ callbackUrl: "/" });
        } else {
            setError(result.error || t("deleteError"));
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    borderTop: "1px solid var(--color-border)",
                    color: "#dc2626",
                    fontSize: "1rem",
                    cursor: "pointer",
                    textAlign: "left",
                }}
            >
                <span>{t("deleteAccount")}</span>
                <span>→</span>
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "1rem",
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsModalOpen(false);
                        }
                    }}
                >
                    <div
                        style={{
                            background: "var(--color-background, white)",
                            borderRadius: "1rem",
                            padding: "1.5rem",
                            maxWidth: "400px",
                            width: "100%",
                            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                marginBottom: "0.5rem",
                                color: "#dc2626",
                            }}
                        >
                            {t("deleteAccountTitle")}
                        </h3>
                        <p
                            style={{
                                color: "var(--color-text-secondary)",
                                marginBottom: "1rem",
                                lineHeight: 1.5,
                            }}
                        >
                            {t("deleteAccountDesc")}
                        </p>

                        {/* 30-day grace period info */}
                        <div
                            style={{
                                background: "#fef3c7",
                                borderRadius: "0.5rem",
                                padding: "1rem",
                                marginBottom: "1rem",
                                borderLeft: "4px solid #f59e0b",
                            }}
                        >
                            <p style={{ color: "#92400e", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>
                                ⏰ {t("deleteGracePeriodTitle")}
                            </p>
                            <p style={{ color: "#92400e", fontSize: "0.875rem", margin: 0 }}>
                                {t("deleteGracePeriodDesc")}
                            </p>
                        </div>

                        {/* Warning list */}
                        <div
                            style={{
                                background: "#fef2f2",
                                borderRadius: "0.5rem",
                                padding: "1rem",
                                marginBottom: "1.5rem",
                            }}
                        >
                            <p style={{ color: "#dc2626", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                {t("deleteWarningTitle")}
                            </p>
                            <ul style={{ color: "#b91c1c", fontSize: "0.875rem", paddingLeft: "1.25rem", margin: 0 }}>
                                <li>{t("deleteWarning1")}</li>
                                <li>{t("deleteWarning2")}</li>
                                <li>{t("deleteWarning3")}</li>
                            </ul>
                        </div>

                        {error && (
                            <div
                                style={{
                                    background: "#fef2f2",
                                    border: "1px solid #dc2626",
                                    borderRadius: "0.5rem",
                                    padding: "0.75rem",
                                    marginBottom: "1rem",
                                    color: "#dc2626",
                                    fontSize: "0.875rem",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="btn btn-outline"
                                style={{ flex: 1 }}
                                disabled={isDeleting}
                            >
                                {t("deleteCancel")}
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem 1rem",
                                    borderRadius: "0.5rem",
                                    border: "none",
                                    background: "#dc2626",
                                    color: "white",
                                    fontWeight: 600,
                                    cursor: isDeleting ? "not-allowed" : "pointer",
                                    opacity: isDeleting ? 0.7 : 1,
                                }}
                            >
                                {isDeleting ? t("deleteDeleting") : t("deleteConfirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
