import { redirect } from "next/navigation";
import { getHotelProfile } from "../../actions/settings";
import { ProfileForm } from "./ProfileForm";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const hotel = await getHotelProfile();

    if (!hotel) {
        redirect("/auth/signin");
    }

    return <ProfileForm hotel={hotel} />;
}
