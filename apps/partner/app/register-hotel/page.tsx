import { OnboardingWizard } from "./OnboardingWizard";

export const metadata = {
    title: "Register Your Hotel | Zinu Rooms Partner",
    description: "Join Zinu Rooms as a hotel partner and start receiving bookings",
};

export default function RegisterHotelPage() {
    return (
        <>
            <header className="page-header">
                <h1 className="page-title">Register Your Hotel</h1>
                <p className="page-subtitle">
                    Complete the steps below to get your hotel listed on Zinu Rooms
                </p>
            </header>

            <main className="container">
                <OnboardingWizard />
            </main>
        </>
    );
}
