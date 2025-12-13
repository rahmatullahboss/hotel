import { redirect } from "next/navigation";
import Link from "next/link";
import { getHotelRooms } from "../actions/inventory";
import { getPartnerRole } from "../actions/getPartnerRole";
import { BottomNav, ScannerFAB, RoomGrid } from "../components";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    // Role-based access control: Only OWNER and MANAGER can manage inventory
    if (!roleInfo.permissions.canManageInventory) {
        redirect("/?accessDenied=inventory");
    }

    const rooms = await getHotelRooms(roleInfo.hotelId);

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

            <main>
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
                    <RoomGrid initialRooms={rooms} hotelId={roleInfo.hotelId} />
                )}
            </main>

            {/* Scanner FAB */}
            <ScannerFAB />

            {/* Bottom Navigation */}
            <BottomNav role={roleInfo.role} />
        </>
    );
}
