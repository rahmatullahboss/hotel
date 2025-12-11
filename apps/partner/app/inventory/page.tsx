import { redirect } from "next/navigation";
import Link from "next/link";
import { getPartnerHotel } from "../actions/dashboard";
import { getHotelRooms } from "../actions/inventory";
import { BottomNav, ScannerFAB, RoomGrid } from "../components";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const hotel = await getPartnerHotel();

    if (!hotel) {
        redirect("/auth/signin");
    }

    const rooms = await getHotelRooms(hotel.id);

    return (
        <>
            {/* Header */}
            <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="page-title">Room Inventory</h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        Tap a room to block/unblock
                    </p>
                </div>
                <Link href="/inventory/rooms" className="btn btn-primary">
                    Manage Rooms
                </Link>
            </header>

            <main style={{ padding: "1rem" }}>
                {rooms.length === 0 ? (
                    <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                            No rooms yet. Add rooms to manage your inventory.
                        </p>
                        <Link href="/inventory/rooms" className="btn btn-primary">
                            + Add Your First Room
                        </Link>
                    </div>
                ) : (
                    <RoomGrid initialRooms={rooms} hotelId={hotel.id} />
                )}
            </main>

            {/* Scanner FAB */}
            <ScannerFAB />

            {/* Bottom Navigation */}
            <BottomNav />
        </>
    );
}
