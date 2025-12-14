"use client";

import { useState } from "react";
import { MdSave } from "react-icons/md";
import { updateSuspensionThreshold } from "../actions/suspension";

interface SuspensionSettingsProps {
    currentThreshold: number;
}

export function SuspensionSettings({ currentThreshold }: SuspensionSettingsProps) {
    const [threshold, setThreshold] = useState(currentThreshold);
    const [isLoading, setIsLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateSuspensionThreshold(threshold);
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
            <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Threshold:</label>
            <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                step="0.5"
                min="1"
                max="5"
                style={{
                    width: "60px",
                    padding: "0.5rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    textAlign: "center",
                }}
            />
            <button
                type="button"
                onClick={handleSave}
                disabled={isLoading || threshold === currentThreshold}
                style={{
                    padding: "0.5rem 0.75rem",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: saved ? "rgba(34, 197, 94, 0.1)" : "var(--color-primary)",
                    color: saved ? "#22c55e" : "white",
                    cursor: isLoading || threshold === currentThreshold ? "not-allowed" : "pointer",
                    opacity: threshold === currentThreshold ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                }}
            >
                <MdSave />
                {saved ? "Saved!" : "Save"}
            </button>
        </div>
    );
}

export default SuspensionSettings;
