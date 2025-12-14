"use client";

import { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";
import { createProgram } from "../actions/incentives";

const INCENTIVE_TYPES = [
    { value: "BOOKING_COUNT", label: "Booking Count", unit: "bookings" },
    { value: "REVENUE_TARGET", label: "Revenue Target", unit: "BDT" },
    { value: "OCCUPANCY_RATE", label: "Occupancy Rate", unit: "%" },
    { value: "RATING_IMPROVEMENT", label: "Rating Above", unit: "rating" },
    { value: "STREAK", label: "Booking Streak", unit: "days" },
];

const BADGE_ICONS = ["🎯", "🏆", "⭐", "💰", "🔥", "🎁", "💎", "🚀"];

export function CreateProgramButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "BOOKING_COUNT",
        targetValue: 10,
        rewardAmount: 1000,
        startDate: new Date().toISOString().split("T")[0]!,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!,
        minHotelRating: 4.5,
        badgeIcon: "🎯",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const selectedType = INCENTIVE_TYPES.find((t) => t.value === formData.type);

        try {
            await createProgram({
                name: formData.name,
                description: formData.description || undefined,
                type: formData.type as any,
                targetValue: formData.targetValue,
                targetUnit: selectedType?.unit || "units",
                rewardAmount: formData.rewardAmount,
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
                minHotelRating: formData.minHotelRating,
                badgeIcon: formData.badgeIcon,
            });
            setIsOpen(false);
            setFormData({
                name: "",
                description: "",
                type: "BOOKING_COUNT",
                targetValue: 10,
                rewardAmount: 1000,
                startDate: new Date().toISOString().split("T")[0]!,
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!,
                minHotelRating: 4.5,
                badgeIcon: "🎯",
            });
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="btn-primary"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                }}
            >
                <MdAdd /> Create Program
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Create Incentive Program</h2>
                            <button type="button" onClick={() => setIsOpen(false)} className="close-btn">
                                <MdClose />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Program Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., December Booking Bonus"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional description of the program"
                                    rows={2}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        {INCENTIVE_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Target Value *</label>
                                    <input
                                        type="number"
                                        value={formData.targetValue}
                                        onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                                        min={1}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Reward Amount (৳) *</label>
                                    <input
                                        type="number"
                                        value={formData.rewardAmount}
                                        onChange={(e) => setFormData({ ...formData, rewardAmount: Number(e.target.value) })}
                                        min={1}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Min Rating Required</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.minHotelRating}
                                        onChange={(e) => setFormData({ ...formData, minHotelRating: Number(e.target.value) })}
                                        min={1}
                                        max={5}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date *</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date *</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Badge Icon</label>
                                <div className="icon-grid">
                                    {BADGE_ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, badgeIcon: icon })}
                                            className={`icon-btn ${formData.badgeIcon === icon ? "selected" : ""}`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setIsOpen(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} className="btn-submit">
                                    {isLoading ? "Creating..." : "Create Program"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <style jsx>{`
                        .modal-overlay {
                            position: fixed;
                            inset: 0;
                            background: rgba(0, 0, 0, 0.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 1000;
                        }
                        .modal {
                            background: var(--color-bg-primary);
                            border-radius: 12px;
                            width: 100%;
                            max-width: 500px;
                            max-height: 90vh;
                            overflow-y: auto;
                        }
                        .modal-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 1rem 1.5rem;
                            border-bottom: 1px solid var(--color-border);
                        }
                        .modal-header h2 {
                            margin: 0;
                            font-size: 1.25rem;
                        }
                        .close-btn {
                            background: none;
                            border: none;
                            font-size: 1.5rem;
                            cursor: pointer;
                            color: var(--color-text-muted);
                        }
                        form {
                            padding: 1.5rem;
                        }
                        .form-group {
                            margin-bottom: 1rem;
                        }
                        .form-group label {
                            display: block;
                            font-weight: 500;
                            margin-bottom: 0.375rem;
                            font-size: 0.875rem;
                        }
                        .form-group input,
                        .form-group select,
                        .form-group textarea {
                            width: 100%;
                            padding: 0.625rem;
                            border: 1px solid var(--color-border);
                            border-radius: 8px;
                            font-size: 0.875rem;
                            background: var(--color-bg-secondary);
                        }
                        .form-row {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 1rem;
                        }
                        .icon-grid {
                            display: flex;
                            gap: 0.5rem;
                            flex-wrap: wrap;
                        }
                        .icon-btn {
                            width: 40px;
                            height: 40px;
                            border: 2px solid var(--color-border);
                            border-radius: 8px;
                            background: var(--color-bg-secondary);
                            font-size: 1.25rem;
                            cursor: pointer;
                            transition: all 0.15s ease;
                        }
                        .icon-btn.selected {
                            border-color: var(--color-primary);
                            background: rgba(59, 130, 246, 0.1);
                        }
                        .form-actions {
                            display: flex;
                            gap: 0.75rem;
                            margin-top: 1.5rem;
                        }
                        .btn-cancel {
                            flex: 1;
                            padding: 0.75rem;
                            border: 1px solid var(--color-border);
                            border-radius: 8px;
                            background: var(--color-bg-secondary);
                            cursor: pointer;
                            font-weight: 500;
                        }
                        .btn-submit {
                            flex: 2;
                            padding: 0.75rem;
                            border: none;
                            border-radius: 8px;
                            background: var(--color-primary);
                            color: white;
                            cursor: pointer;
                            font-weight: 600;
                        }
                        .btn-submit:disabled {
                            opacity: 0.5;
                            cursor: not-allowed;
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}

export default CreateProgramButton;
