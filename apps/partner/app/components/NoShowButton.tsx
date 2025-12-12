"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAsNoShow } from "../actions/noshow";

interface NoShowButtonProps {
    bookingId: string;
    hotelId: string;
    guestName: string;
    guestPhone: string;
    advancePaid: number;
}

export function NoShowButton({ bookingId, hotelId, guestName, guestPhone, advancePaid }: NoShowButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleNoShow = () => {
        const hotelShare = Math.floor(advancePaid * 0.5);

        const confirmed = confirm(
            `Mark ${guestName} as NO-SHOW?\n\n` +
            `📞 Contact: ${guestPhone}\n\n` +
            `This will:\n` +
            `• Cancel their booking\n` +
            `• Forfeit their ৳${advancePaid.toLocaleString()} advance\n` +
            `• You receive ৳${hotelShare.toLocaleString()} compensation\n` +
            `• Room becomes available for walk-ins\n` +
            `• Customer's trust score is reduced\n\n` +
            `Are you sure? This cannot be undone.`
        );

        if (!confirmed) return;

        startTransition(async () => {
            const result = await markAsNoShow(bookingId, hotelId);
            if (result.success) {
                alert("Booking marked as NO-SHOW. Room is now available.");
                router.refresh();
            } else {
                alert(result.error || "Failed to mark as no-show");
            }
        });
    };

    return (
        <button
            className="btn"
            onClick={handleNoShow}
            disabled={isPending}
            style={{
                fontSize: "0.75rem",
                padding: "0.5rem 1rem",
                background: "var(--color-warning)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: 600,
                cursor: isPending ? "wait" : "pointer",
                opacity: isPending ? 0.7 : 1,
            }}
        >
            {isPending ? "Processing..." : "⚠️ No-Show"}
        </button>
    );
}
