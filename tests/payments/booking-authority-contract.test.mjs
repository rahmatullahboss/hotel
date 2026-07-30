import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");
async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

test("customer booking request contract contains no client total", async () => {
  const service = await read("apps/web/lib/booking-creation-service.ts");
  const api = await read("apps/web/app/api/bookings/route.ts");
  const web = await read("apps/web/app/booking/page.tsx");
  const flutter = await read(
    "apps/mobile-flutter/lib/features/bookings/providers/booking_provider.dart",
  );

  const inputBlock = service.slice(
    service.indexOf("export interface CreateBookingInput"),
    service.indexOf("export interface BookingResult"),
  );
  assert.doesNotMatch(inputBlock, /totalAmount/);
  assert.doesNotMatch(api, /missingFields\.push\(['"]totalAmount/);
  assert.doesNotMatch(web, /createBooking\([\s\S]*?totalAmount,/);
  assert.doesNotMatch(flutter, /['"]totalAmount['"]\s*:/);
});

test("server action identity is resolved from Auth.js, not request input", async () => {
  const action = await read("apps/web/app/actions/bookings.ts");
  const service = await read("apps/web/lib/booking-creation-service.ts");

  assert.match(action, /const session = await auth\(\)/);
  assert.match(action, /userId: session\.user\.id/);
  assert.doesNotMatch(service, /userId\?: string/);
});

test("calculation loads date pricing and configured hotel commission", async () => {
  const pricing = await read("apps/web/lib/booking-pricing-service.ts");
  const creation = await read("apps/web/lib/booking-creation-service.ts");

  assert.match(pricing, /roomInventory\.price/);
  assert.match(pricing, /hotels\.commissionRate/);
  assert.match(pricing, /calculateBookingAmounts/);
  assert.doesNotMatch(creation, /totalAmount\s*\*\s*0\.20/);
  assert.doesNotMatch(creation, /input\.totalAmount/);
});

test("wallet debit is explicit, bounded and persisted from one calculation", async () => {
  const calculation = await read("apps/web/lib/booking-calculation.ts");
  const creation = await read("apps/web/lib/booking-creation-service.ts");

  assert.match(calculation, /input\.useWalletBalance/);
  assert.match(calculation, /exceeds the amount due now/);
  assert.match(creation, /pg_advisory_xact_lock/);
  assert.match(creation, /calculation\.walletAmountUsedMinor/);
  assert.doesNotMatch(creation, /wallet can auto-pay/i);
});

test("booking schema persists immutable calculation evidence", async () => {
  const schema = await read("packages/db/src/schema/business.ts");
  for (const field of [
    "pricingVersion",
    "currency",
    "roomSubtotal",
    "discountAmount",
    "taxRate",
    "taxAmount",
    "commissionRate",
    "amountDueNow",
    "pricingBreakdown",
  ]) {
    assert.match(schema, new RegExp(`\\b${field}:`));
  }
});

test("payment initiation derives amount and currency from the booking", async () => {
  for (const route of [
    "apps/web/app/api/payment/initiate/route.ts",
    "apps/web/app/api/payment/stripe/create-intent/route.ts",
  ]) {
    const source = await read(route);
    assert.match(source, /booking\.amountDueNow/);
    assert.match(source, /booking\.walletAmountUsed/);
    assert.doesNotMatch(source, /const \{ bookingId, amount/);
    assert.doesNotMatch(source, /amount \|\| Number\(booking\.totalAmount\)/);
  }
});

test("provider callbacks verify the persisted outstanding amount", async () => {
  const callback = await read("apps/web/app/api/payment/callback/route.ts");
  const stripeVerify = await read(
    "apps/web/app/api/payment/stripe/verify/route.ts",
  );

  for (const source of [callback, stripeVerify]) {
    assert.match(source, /booking\.amountDueNow/);
    assert.match(source, /booking\.walletAmountUsed/);
  }
  assert.match(callback, /paidAmountMinor !== expectedAmountMinor/);
  assert.doesNotMatch(callback, /paidAmount < totalAmount/);
});

test("Flutter payment callers submit only the booking identity", async () => {
  const provider = await read(
    "apps/mobile-flutter/lib/features/booking_flow/providers/stripe_payment_provider.dart",
  );
  const details = await read(
    "apps/mobile-flutter/lib/features/bookings/presentation/booking_details_screen.dart",
  );

  assert.match(provider, /Future<bool> processPayment\(\{required String bookingId\}\)/);
  assert.doesNotMatch(provider, /required int amount/);
  assert.doesNotMatch(details, /processPayment\([^)]*amount:/s);
});

test("temporary PAY-01 maintenance workflows are absent", async () => {
  for (const workflow of [
    ".github/workflows/pay01-source-snapshot.yml",
    ".github/workflows/pay01-apply-patch.yml",
    ".github/workflows/pay01-generate-migration.yml",
    ".github/workflows/pay01-format-flutter.yml",
    ".github/workflows/pay01-lint-fix.yml",
    ".github/workflows/pay01-flutter-cleanup.yml",
  ]) {
    assert.equal(await exists(workflow), false, `${workflow} must be absent`);
  }
});
