"use client";

import { useState } from "react";
import { MdSave } from "react-icons/md";
import { updateDefaultCommission } from "../actions/commission";

interface DefaultCommissionProps {
    currentRate: number;
}

export function DefaultCommission({ currentRate }: DefaultCommissionProps) {
    const [rate, setRate] = useState(currentRate);
    const [isLoading, setIsLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateDefaultCommission(rate);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
                type="number"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                step="0.5"
                min="0"
                max="50"
                style={{
                    width: "70px",
                    padding: "0.5rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    textAlign: "center",
                    fontSize: "1rem",
                    fontWeight: 600,
                }}
            />
            <span style={{ fontWeight: 600 }}>%</span>
            <button
                type="button"
                onClick={handleSave}
                disabled={isLoading || rate === currentRate}
                style={{
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: saved ? "rgba(34, 197, 94, 0.1)" : "var(--color-primary)",
                    color: saved ? "#22c55e" : "white",
                    cursor: isLoading || rate === currentRate ? "not-allowed" : "pointer",
                    opacity: rate === currentRate ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                }}
            >
                <MdSave />
                {saved ? "Saved!" : "Update"}
            </button>
        </div>
    );
}

export default DefaultCommission;
