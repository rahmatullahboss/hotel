"use client";

import { useState } from "react";
import { MdToggleOn, MdToggleOff } from "react-icons/md";
import { toggleHotelIncentives } from "../actions/incentives";

interface IncentiveToggleProps {
    isEnabled: boolean;
}

export function IncentiveToggle({ isEnabled }: IncentiveToggleProps) {
    const [enabled, setEnabled] = useState(isEnabled);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const newValue = await toggleHotelIncentives();
            setEnabled(newValue);
        } catch (error) {
            console.error("Error toggling:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={isLoading}
            style={{
                background: "none",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: enabled ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: enabled ? "#22c55e" : "#ef4444",
                fontSize: "1rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
            }}
        >
            {enabled ? (
                <>
                    <MdToggleOn style={{ fontSize: "2rem" }} />
                    Enabled
                </>
            ) : (
                <>
                    <MdToggleOff style={{ fontSize: "2rem" }} />
                    Disabled
                </>
            )}
        </button>
    );
}

export default IncentiveToggle;
