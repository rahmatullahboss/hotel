import { redirect } from "next/navigation";
import { getHotelRooms } from "../actions/inventory";
import { getPartnerRole } from "../actions/getPartnerRole";
import { InventoryClient } from "./InventoryClient";

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
        <InventoryClient
            rooms={rooms}
            hotelId={roleInfo.hotelId}
            role={roleInfo.role}
        />
    );
}
