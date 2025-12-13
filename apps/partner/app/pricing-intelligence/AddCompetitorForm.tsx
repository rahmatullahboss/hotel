"use client";

import { useState } from "react";
import { MdAdd } from "react-icons/md";
import { addCompetitor } from "../actions/competitorPricing";

export function AddCompetitorForm() {
    const [name, setName] = useState("");
    const [starRating, setStarRating] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsAdding(true);
        setMessage(null);

        try {
            const result = await addCompetitor({
                name: name.trim(),
                starRating: starRating ? parseInt(starRating, 10) : undefined,
            });

            if (result.success) {
                setName("");
                setStarRating("");
                setMessage({ type: "success", text: "Competitor added successfully!" });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: "error", text: result.error || "Failed to add competitor" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-form">
            <div className="form-row">
                <input
                    type="text"
                    placeholder="Hotel name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                />
                <select
                    value={starRating}
                    onChange={(e) => setStarRating(e.target.value)}
                    className="form-select"
                >
                    <option value="">Stars</option>
                    <option value="1">1⭐</option>
                    <option value="2">2⭐</option>
                    <option value="3">3⭐</option>
                    <option value="4">4⭐</option>
                    <option value="5">5⭐</option>
                </select>
                <button type="submit" className="add-btn" disabled={isAdding || !name.trim()}>
                    <MdAdd />
                </button>
            </div>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <style jsx>{`
                .add-form {
                    background: var(--color-bg-primary);
                    border-radius: 0.75rem;
                    padding: 1rem;
                }
                .form-row {
                    display: flex;
                    gap: 0.5rem;
                }
                .form-input {
                    flex: 1;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: 0.5rem;
                    background: var(--color-bg-secondary);
                    color: var(--color-text-primary);
                    font-size: 0.875rem;
                }
                .form-select {
                    width: 80px;
                    padding: 0.75rem 0.5rem;
                    border: 1px solid var(--color-border);
                    border-radius: 0.5rem;
                    background: var(--color-bg-secondary);
                    color: var(--color-text-primary);
                    font-size: 0.875rem;
                }
                .add-btn {
                    width: 48px;
                    height: 48px;
                    border: none;
                    border-radius: 0.5rem;
                    background: var(--color-primary);
                    color: white;
                    font-size: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: opacity 0.15s ease;
                }
                .add-btn:hover:not(:disabled) {
                    opacity: 0.9;
                }
                .add-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .message {
                    margin-top: 0.75rem;
                    padding: 0.5rem;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    text-align: center;
                }
                .message.success {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                }
                .message.error {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
            `}</style>
        </form>
    );
}

export default AddCompetitorForm;
