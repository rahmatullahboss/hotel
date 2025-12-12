import { getAllPayoutRequests } from "../../actions/payout";
import { PayoutsClient } from "./PayoutsClient";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
    const payouts = await getAllPayoutRequests();

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Payout Requests</h1>
                <p style={{ color: "var(--color-text-secondary)" }}>
                    Manage hotel partner withdrawal requests
                </p>
            </div>

            <PayoutsClient payouts={payouts} />
        </>
    );
}
