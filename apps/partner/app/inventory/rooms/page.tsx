import { redirect } from "next/navigation";
import { getPartnerHotel } from "../../actions/dashboard";
import { getAllHotelRooms } from "../../actions/inventory";
import { BottomNav } from "../../components";
import RoomsManagementClient from "./RoomsManagementClient";

export const dynamic = 'force-dynamic';

export default async function RoomsManagementPage() {
    const hotel = await getPartnerHotel();

    if (!hotel) {
        redirect("/auth/signin");
    }

    const rooms = await getAllHotelRooms(hotel.id);

    return (
        <>
            <RoomsManagementClient hotelId={hotel.id} rooms={rooms} />
            <BottomNav />
        </>
    );
}
