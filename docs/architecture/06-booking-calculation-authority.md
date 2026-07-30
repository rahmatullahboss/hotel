# Booking Calculation Authority

## Decision

Customer booking money is calculated once on the server from persisted room/date pricing and persisted policy inputs. Client totals are display estimates only and are never accepted as booking, commission, wallet or payment amounts.

PAY-01 applies to customer-originated bookings from the web and Flutter API. Partner walk-in bookings remain a separate hotel-entered operational flow and are not silently converted into commission-bearing platform bookings in this workstream.

## Authoritative inputs

For each stay, the server loads:

- the selected active room and its owning active hotel;
- the room base price;
- any `roomInventory.price` override for each check-in-inclusive/check-out-exclusive night;
- the hotel's configured `commissionRate`;
- the environment's bounded booking tax policy;
- first-booking eligibility from existing non-cancelled bookings when the source is the authenticated mobile app;
- the user's current wallet balance under a transaction-scoped wallet lock.

No request body value may override a nightly price, tax rate, discount amount, commission rate, total, net amount, amount due now or payment amount.

## Money model

All calculations use integer minor units. Decimal strings are parsed exactly with at most two fractional digits. Floating-point currency arithmetic is prohibited.

The `booking-v1` calculation is:

1. `roomSubtotal = sum(nightly rates)`
2. `discount = min(subtotal × discount rate, configured cap)`
3. `taxableAmount = subtotal - discount`
4. `tax = taxableAmount × configured tax rate`
5. `total = taxableAmount + tax`
6. `commission = total × hotel commission rate`
7. `hotel net = total - commission`
8. `amount due now = commission` for Pay at Hotel, otherwise `total`
9. `amount outstanding = amount due now - explicit wallet contribution`

Percentage multiplication uses half-up rounding to the nearest minor unit.

## Wallet policy

Wallet debit is never automatic merely because a balance exists.

- `WALLET` requires the wallet to cover the full authoritative total.
- Other payment methods use wallet only after explicit opt-in.
- A requested wallet contribution is a customer allocation instruction, not a source of truth; it must be non-negative and cannot exceed either the current wallet balance or amount due now.
- The wallet is locked and re-read inside the booking transaction before calculation and debit.
- The persisted wallet amount and wallet transaction must be identical.

## Persisted evidence

Each booking persists the pricing version, currency, room subtotal, discount, tax rate/amount, commission rate/amount, amount due now and full nightly JSON breakdown alongside the existing total/net/booking-fee compatibility fields.

Admin and partner reports continue to aggregate persisted booking fields. They do not recalculate historical bookings using current room or commission settings.

## Payment boundary

Payment-intent creation loads the booking and derives the outstanding amount from persisted authoritative fields. Client `amount` and currency selections are ignored. Provider idempotency, webhook event storage and reconciliation belong to PAY-02.

## Compatibility and rollout

- Existing client payloads may temporarily include `totalAmount`; the server ignores it and regression tests forbid using it.
- New responses include authoritative `calculation`, `totalAmount`, `amountDueNow`, `walletAmountUsed` and `amountOutstanding`.
- Web and Flutter payment flows use response amounts rather than pre-booking estimates.
- This project has no active production booking history at PAY-01 integration time, so no historical money backfill is performed.
- Migration defaults are compatibility placeholders for non-customer or seed inserts; only `booking-v1` customer bookings claim a complete nightly breakdown.

## Ownership boundary

PAY-01 owns the booking money migration until merge. RSV-01 must start from the PAY-01 integration head and may add reservation-allocation constraints only after this ownership is released.
