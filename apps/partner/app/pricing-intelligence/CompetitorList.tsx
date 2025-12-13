"use client";

import { useState } from "react";
import { MdStar, MdLocationOn, MdClose } from "react-icons/md";
import { removeCompetitor } from "../actions/competitorPricing";

interface Competitor {
    id: string;
    name: string;
    starRating: number | null;
    avgRating: string | null;
    distance: string | null;
    latestRate: string | null;
    rateDate: Date | null;
}

interface CompetitorListProps {
    competitors: Competitor[];
}

export function CompetitorList({ competitors }: CompetitorListProps) {
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (id: string) => {
        setRemovingId(id);
        try {
            await removeCompetitor(id);
        } catch (error) {
            console.error("Error removing:", error);
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="competitor-list">
            {competitors.map((comp) => (
                <div key={comp.id} className="competitor-card">
                    <div className="card-content">
                        <div className="card-header">
                            <h3>{comp.name}</h3>
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => handleRemove(comp.id)}
                                disabled={removingId === comp.id}
                                aria-label="Remove competitor"
                            >
                                <MdClose />
                            </button>
                        </div>
                        <div className="card-meta">
                            {comp.starRating && (
                                <span className="meta-item">
                                    <MdStar style={{ color: "#fbbf24" }} />
                                    {comp.starRating}
                                </span>
                            )}
                            {comp.avgRating && (
                                <span className="meta-item">
                                    ⭐ {parseFloat(comp.avgRating).toFixed(1)}
                                </span>
                            )}
                            {comp.distance && (
                                <span className="meta-item">
                                    <MdLocationOn />
                                    {parseFloat(comp.distance).toFixed(1)} km
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="rate-section">
                        {comp.latestRate ? (
                            <>
                                <div className="rate-value">৳{parseFloat(comp.latestRate).toLocaleString()}</div>
                                <div className="rate-date">
                                    {comp.rateDate && new Date(comp.rateDate).toLocaleDateString()}
                                </div>
                            </>
                        ) : (
                            <div className="no-rate">No rates</div>
                        )}
                    </div>
                </div>
            ))}

            <style jsx>{`
                .competitor-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .competitor-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--color-bg-primary);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                .card-content {
                    flex: 1;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.375rem;
                }
                .card-header h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                }
                .remove-btn {
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: transparent;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.5;
                    transition: opacity 0.15s ease;
                }
                .remove-btn:hover:not(:disabled) {
                    opacity: 1;
                    color: #ef4444;
                }
                .remove-btn:disabled {
                    cursor: not-allowed;
                }
                .card-meta {
                    display: flex;
                    gap: 0.75rem;
                    font-size: 0.75rem;
                    color: var(--color-text-secondary);
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .rate-section {
                    text-align: right;
                }
                .rate-value {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: var(--color-text-primary);
                }
                .rate-date {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                }
                .no-rate {
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                }
            `}</style>
        </div>
    );
}

export default CompetitorList;
