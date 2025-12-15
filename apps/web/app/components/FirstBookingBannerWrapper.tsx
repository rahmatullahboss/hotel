import { auth } from "@/auth";
import { FirstBookingBanner } from "./FirstBookingBanner";

/**
 * Server wrapper for FirstBookingBanner
 * Fetches session on server and passes userId to client component
 */
export async function FirstBookingBannerWrapper() {
    const session = await auth();

    // Only render if user is logged in
    if (!session?.user?.id) {
        return null;
    }

    return <FirstBookingBanner userId={session.user.id} />;
}
