import assert from "node:assert/strict";
import test from "node:test";
import { getBookingPricingPolicy } from "../../apps/web/lib/booking-calculation.ts";

test("booking pricing policy has stable server defaults", () => {
  assert.deepEqual(getBookingPricingPolicy({}), {
    taxRatePercent: "15.00",
    firstBookingDiscountPercent: "20.00",
    firstBookingDiscountCap: "1000.00",
  });
});

test("booking pricing policy accepts bounded decimal configuration syntax", () => {
  assert.deepEqual(
    getBookingPricingPolicy({
      BOOKING_TAX_RATE_PERCENT: "7.50",
      FIRST_BOOKING_DISCOUNT_PERCENT: "10",
      FIRST_BOOKING_DISCOUNT_CAP: "500.25",
    }),
    {
      taxRatePercent: "7.50",
      firstBookingDiscountPercent: "10",
      firstBookingDiscountCap: "500.25",
    },
  );
  assert.throws(() =>
    getBookingPricingPolicy({ BOOKING_TAX_RATE_PERCENT: "not-a-rate" }),
  );
});
