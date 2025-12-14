"use client";

import { useState } from "react";
import { MdBlock } from "react-icons/md";
import { bulkSuspendLowRatedHotels } from "../actions/suspension";

interface BulkSuspendButtonProps {
    count: number;
    threshold: number;
}

export function BulkSuspendButton({ count, threshold }: BulkSuspendButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleBulkSuspend = async () => {
        if (!confirm(`Are you sure you want to suspend ${count} hotels with ratings below ${threshold}?`)) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await bulkSuspendLowRatedHotels(threshold);
            if (result.success) {
                alert(`Successfully suspended ${result.count} hotels`);
            } else {
                alert(result.error || "Failed to suspend hotels");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to bulk suspend hotels");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleBulkSuspend}
            disabled={isLoading}
            style={{
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#ef4444",
                color: "white",
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: 600,
            }}
        >
            <MdBlock />
            {isLoading ? "Suspending..." : `Suspend All ${count} Hotels`}
        </button>
    );
}

export default BulkSuspendButton;
