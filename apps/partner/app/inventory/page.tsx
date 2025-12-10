import { redirect } from "next/navigation";
import { getPartnerHotel } from "../actions/dashboard";
import { getHotelRooms } from "../actions/inventory";
import { BottomNav, ScannerFAB, RoomGrid } from "../components";

export default async function InventoryPage() {
    const hotel = await getPartnerHotel();

    if (!hotel) {
        redirect("/auth/signin");
    }

    const rooms = await getHotelRooms(hotel.id);

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <h1 className="page-title">Room Inventory</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Tap a room to block/unblock
                </p>
            </header>

            <main style={{ padding: "1rem" }}>
                <RoomGrid initialRooms={rooms} hotelId={hotel.id} />
            </main>

            {/* Scanner FAB */}
            <ScannerFAB />

            {/* Bottom Navigation */}
            <BottomNav />
        </>
    );
}
