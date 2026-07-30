import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateBookingAmounts,
  enumerateStayDates,
  formatMinor,
  parseMoneyToMinor,
} from "../../apps/web/lib/booking-calculation.ts";

const rates = [
  { date: "2026-08-01", price: "1000.00", source: "BASE" },
  { date: "2026-08-02", price: "1200.00", source: "INVENTORY_OVERRIDE" },
];

test("money parsing and formatting are exact", () => {
  assert.equal(parseMoneyToMinor("12.34", "amount"), 1234);
  assert.equal(parseMoneyToMinor(12, "amount"), 1200);
  assert.equal(formatMinor(1234), "12.34");
  assert.throws(() => parseMoneyToMinor("12.345", "amount"));
});

test("nightly pricing, discount, tax and configured commission are deterministic", () => {
  const result = calculateBookingAmounts({
    nightlyRates: rates,
    commissionRatePercent: "12.00",
    taxRatePercent: "15.00",
    firstBookingDiscountPercent: "20.00",
    firstBookingDiscountCap: "1000.00",
    paymentMethod: "STRIPE",
  });

  assert.equal(result.breakdown.roomSubtotal, "2200.00");
  assert.equal(result.breakdown.discountAmount, "440.00");
  assert.equal(result.breakdown.taxAmount, "264.00");
  assert.equal(result.breakdown.totalAmount, "2024.00");
  assert.equal(result.breakdown.commissionAmount, "242.88");
  assert.equal(result.breakdown.netAmount, "1781.12");
  assert.equal(result.breakdown.amountDueNow, "2024.00");
});

test("pay at hotel requires only the configured commission now", () => {
  const result = calculateBookingAmounts({
    nightlyRates: rates,
    commissionRatePercent: "12.00",
    taxRatePercent: "0.00",
    paymentMethod: "PAY_AT_HOTEL",
  });

  assert.equal(result.breakdown.totalAmount, "2200.00");
  assert.equal(result.breakdown.amountDueNow, "264.00");
  assert.equal(result.amountOutstandingMinor, 26400);
});

test("wallet application is explicit and bounded by balance and amount due", () => {
  const partial = calculateBookingAmounts({
    nightlyRates: rates,
    commissionRatePercent: "10.00",
    taxRatePercent: "0.00",
    paymentMethod: "PAY_AT_HOTEL",
    walletBalance: "500.00",
    useWalletBalance: true,
    requestedWalletAmount: "100.00",
  });
  assert.equal(partial.breakdown.walletAmountUsed, "100.00");
  assert.equal(partial.breakdown.amountOutstanding, "120.00");

  assert.throws(() =>
    calculateBookingAmounts({
      nightlyRates: rates,
      commissionRatePercent: "10.00",
      taxRatePercent: "0.00",
      paymentMethod: "PAY_AT_HOTEL",
      walletBalance: "500.00",
      useWalletBalance: true,
      requestedWalletAmount: "221.00",
    }),
  );
});

test("wallet-only payment requires the full authoritative total", () => {
  assert.throws(() =>
    calculateBookingAmounts({
      nightlyRates: rates,
      commissionRatePercent: "12.00",
      taxRatePercent: "0.00",
      paymentMethod: "WALLET",
      walletBalance: "2199.99",
    }),
  );

  const paid = calculateBookingAmounts({
    nightlyRates: rates,
    commissionRatePercent: "12.00",
    taxRatePercent: "0.00",
    paymentMethod: "WALLET",
    walletBalance: "2200.00",
  });
  assert.equal(paid.walletPaymentSuccess, true);
  assert.equal(paid.breakdown.walletAmountUsed, "2200.00");
  assert.equal(paid.breakdown.amountOutstanding, "0.00");
});

test("stay dates are check-in inclusive and check-out exclusive", () => {
  assert.deepEqual(enumerateStayDates("2026-08-01", "2026-08-04"), [
    "2026-08-01",
    "2026-08-02",
    "2026-08-03",
  ]);
  assert.throws(() => enumerateStayDates("2026-08-01", "2026-08-01"));
  assert.throws(() => enumerateStayDates("not-a-date", "2026-08-02"));
});


test("unsupported payment methods are rejected at runtime", () => {
  assert.throws(() =>
    calculateBookingAmounts({
      nightlyRates: rates,
      commissionRatePercent: "12.00",
      taxRatePercent: "15.00",
      paymentMethod: "CLIENT_DEFINED",
    }),
  );
});
