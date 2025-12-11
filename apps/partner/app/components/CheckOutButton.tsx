"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkOutGuest } from "../actions/dashboard";

interface CheckOutButtonProps {
    bookingId: string;
    hotelId: string;
    guestName: string;
}

export function CheckOutButton({ bookingId, hotelId, guestName }: CheckOutButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleCheckOut = () => {
        if (!confirm(`Check out ${guestName}?`)) return;

        startTransition(async () => {
            const result = await checkOutGuest(bookingId, hotelId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || "Failed to check out");
            }
        });
    };

    return (
        <button
            className="btn btn-primary"
            onClick={handleCheckOut}
            disabled={isPending}
            style={{
                fontSize: "0.75rem",
                padding: "0.5rem 1rem",
                flex: 1,
            }}
        >
            {isPending ? "Processing..." : "✓ Check Out"}
        </button>
    );
}
