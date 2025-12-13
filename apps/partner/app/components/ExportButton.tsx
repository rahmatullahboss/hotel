"use client";

import { useState } from "react";
import { FiDownload, FiFileText, FiGrid } from "react-icons/fi";

interface ExportButtonProps {
    onExportPDF: () => void;
    onExportExcel: () => void;
    disabled?: boolean;
    className?: string;
}

export function ExportButton({
    onExportPDF,
    onExportExcel,
    disabled = false,
    className = "",
}: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (type: "pdf" | "excel") => {
        setIsExporting(true);
        try {
            if (type === "pdf") {
                await onExportPDF();
            } else {
                await onExportExcel();
            }
        } finally {
            setIsExporting(false);
            setIsOpen(false);
        }
    };

    return (
        <div className={`export-button-wrapper ${className}`}>
            <button
                type="button"
                className="export-button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled || isExporting}
                aria-label="Export report"
            >
                <FiDownload className="export-icon" />
                <span>{isExporting ? "Exporting..." : "Export"}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="export-backdrop"
                        onClick={() => setIsOpen(false)}
                        onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
                        role="presentation"
                    />
                    <div className="export-dropdown">
                        <button
                            type="button"
                            className="export-option"
                            onClick={() => handleExport("pdf")}
                        >
                            <FiFileText className="option-icon pdf" />
                            <div className="option-content">
                                <span className="option-title">Export as PDF</span>
                                <span className="option-desc">Best for printing</span>
                            </div>
                        </button>
                        <button
                            type="button"
                            className="export-option"
                            onClick={() => handleExport("excel")}
                        >
                            <FiGrid className="option-icon excel" />
                            <div className="option-content">
                                <span className="option-title">Export as Excel</span>
                                <span className="option-desc">Best for accounting</span>
                            </div>
                        </button>
                    </div>
                </>
            )}

            <style jsx>{`
                .export-button-wrapper {
                    position: relative;
                    display: inline-block;
                }

                .export-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 1rem;
                    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
                }

                .export-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(79, 70, 229, 0.4);
                }

                .export-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .export-icon {
                    width: 1rem;
                    height: 1rem;
                }

                .export-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 40;
                }

                .export-dropdown {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    right: 0;
                    width: 220px;
                    background: white;
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    z-index: 50;
                    overflow: hidden;
                    animation: slideDown 0.15s ease-out;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .export-option {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: background 0.15s ease;
                    text-align: left;
                }

                .export-option:hover {
                    background: #f8fafc;
                }

                .export-option:first-child {
                    border-bottom: 1px solid #f1f5f9;
                }

                .option-icon {
                    width: 1.5rem;
                    height: 1.5rem;
                    flex-shrink: 0;
                }

                .option-icon.pdf {
                    color: #ef4444;
                }

                .option-icon.excel {
                    color: #22c55e;
                }

                .option-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.125rem;
                }

                .option-title {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #1e293b;
                }

                .option-desc {
                    font-size: 0.75rem;
                    color: #64748b;
                }

                @media (prefers-color-scheme: dark) {
                    .export-dropdown {
                        background: #1e293b;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    }

                    .export-option:hover {
                        background: #334155;
                    }

                    .export-option:first-child {
                        border-bottom-color: #334155;
                    }

                    .option-title {
                        color: #f1f5f9;
                    }

                    .option-desc {
                        color: #94a3b8;
                    }
                }
            `}</style>
        </div>
    );
}

export default ExportButton;
