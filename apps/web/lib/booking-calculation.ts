export const BOOKING_PRICING_VERSION = "booking-v1";
export const BOOKING_CURRENCY = "BDT";
export const MAX_BOOKING_NIGHTS = 365;

export type CustomerPaymentMethod =
    | "BKASH"
    | "NAGAD"
    | "CARD"
    | "PAY_AT_HOTEL"
    | "WALLET"
    | "STRIPE";

const CUSTOMER_PAYMENT_METHODS = new Set<CustomerPaymentMethod>([
    "BKASH",
    "NAGAD",
    "CARD",
    "PAY_AT_HOTEL",
    "WALLET",
    "STRIPE",
]);

export function isCustomerPaymentMethod(
    value: unknown,
): value is CustomerPaymentMethod {
    return typeof value === "string" && CUSTOMER_PAYMENT_METHODS.has(value as CustomerPaymentMethod);
}

export interface NightlyRateInput {
    date: string;
    price: string | number;
    source: "BASE" | "INVENTORY_OVERRIDE";
}

export interface BookingCalculationInput {
    nightlyRates: NightlyRateInput[];
    commissionRatePercent: string | number;
    taxRatePercent: string | number;
    firstBookingDiscountPercent?: string | number;
    firstBookingDiscountCap?: string | number;
    paymentMethod: CustomerPaymentMethod;
    walletBalance?: string | number;
    useWalletBalance?: boolean;
    requestedWalletAmount?: string | number;
}

export interface BookingCalculationBreakdown {
    version: typeof BOOKING_PRICING_VERSION;
    currency: typeof BOOKING_CURRENCY;
    nightlyRates: Array<{
        date: string;
        amount: string;
        source: "BASE" | "INVENTORY_OVERRIDE";
    }>;
    roomSubtotal: string;
    discountRate: string;
    discountCap: string;
    discountAmount: string;
    taxableAmount: string;
    taxRate: string;
    taxAmount: string;
    totalAmount: string;
    commissionRate: string;
    commissionAmount: string;
    netAmount: string;
    amountDueNow: string;
    walletAmountUsed: string;
    amountOutstanding: string;
}

export interface BookingCalculationResult {
    roomSubtotalMinor: number;
    discountAmountMinor: number;
    taxAmountMinor: number;
    totalAmountMinor: number;
    commissionRateBasisPoints: number;
    commissionAmountMinor: number;
    netAmountMinor: number;
    amountDueNowMinor: number;
    walletAmountUsedMinor: number;
    amountOutstandingMinor: number;
    requiresPayment: boolean;
    walletPaymentSuccess: boolean;
    breakdown: BookingCalculationBreakdown;
}

const MONEY_PATTERN = /^-?\d+(?:\.\d{1,2})?$/;
const PERCENT_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DEFAULT_TAX_RATE_PERCENT = "15.00";
const DEFAULT_FIRST_BOOKING_DISCOUNT_PERCENT = "20.00";
const DEFAULT_FIRST_BOOKING_DISCOUNT_CAP = "1000.00";

function getPolicyPercent(
    value: string | undefined,
    fallback: string,
    name: string,
): string {
    const normalized = value?.trim() || fallback;
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
        throw new Error(`${name} must be a percentage with at most two decimals`);
    }
    return normalized;
}

function getPolicyMoney(
    value: string | undefined,
    fallback: string,
    name: string,
): string {
    const normalized = value?.trim() || fallback;
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
        throw new Error(`${name} must be a non-negative amount with at most two decimals`);
    }
    return normalized;
}

export function getBookingPricingPolicy(env: NodeJS.ProcessEnv = process.env) {
    return {
        taxRatePercent: getPolicyPercent(
            env.BOOKING_TAX_RATE_PERCENT,
            DEFAULT_TAX_RATE_PERCENT,
            "BOOKING_TAX_RATE_PERCENT",
        ),
        firstBookingDiscountPercent: getPolicyPercent(
            env.FIRST_BOOKING_DISCOUNT_PERCENT,
            DEFAULT_FIRST_BOOKING_DISCOUNT_PERCENT,
            "FIRST_BOOKING_DISCOUNT_PERCENT",
        ),
        firstBookingDiscountCap: getPolicyMoney(
            env.FIRST_BOOKING_DISCOUNT_CAP,
            DEFAULT_FIRST_BOOKING_DISCOUNT_CAP,
            "FIRST_BOOKING_DISCOUNT_CAP",
        ),
    };
}

export function parseMoneyToMinor(value: string | number, name: string): number {
    const normalized = typeof value === "number" ? value.toString() : value.trim();
    if (!MONEY_PATTERN.test(normalized)) {
        throw new Error(`${name} must be a decimal amount with at most two fractional digits`);
    }

    const negative = normalized.startsWith("-");
    const unsigned = negative ? normalized.slice(1) : normalized;
    const [wholePart, fractionPart = ""] = unsigned.split(".");
    const minor = Number(wholePart) * 100 + Number(fractionPart.padEnd(2, "0"));
    const result = negative ? -minor : minor;
    if (!Number.isSafeInteger(result)) {
        throw new Error(`${name} exceeds the supported money range`);
    }
    return result;
}

export function parsePercentToBasisPoints(
    value: string | number,
    name: string,
): number {
    const normalized = typeof value === "number" ? value.toString() : value.trim();
    if (!PERCENT_PATTERN.test(normalized)) {
        throw new Error(`${name} must be a non-negative percentage with at most two decimals`);
    }
    const [wholePart, fractionPart = ""] = normalized.split(".");
    const basisPoints = Number(wholePart) * 100 + Number(fractionPart.padEnd(2, "0"));
    if (!Number.isSafeInteger(basisPoints) || basisPoints > 10_000) {
        throw new Error(`${name} must be between 0 and 100 percent`);
    }
    return basisPoints;
}

export function formatMinor(minor: number): string {
    if (!Number.isSafeInteger(minor)) {
        throw new Error("Money value must be an integer number of minor units");
    }
    const sign = minor < 0 ? "-" : "";
    const absolute = Math.abs(minor);
    return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}

function multiplyRate(amountMinor: number, basisPoints: number): number {
    const numerator = amountMinor * basisPoints;
    if (!Number.isSafeInteger(numerator)) {
        throw new Error("Calculated money value exceeds the supported range");
    }
    return Math.floor((numerator + 5_000) / 10_000);
}

function validateNightlyRates(nightlyRates: NightlyRateInput[]): void {
    if (nightlyRates.length < 1 || nightlyRates.length > MAX_BOOKING_NIGHTS) {
        throw new Error(`Booking must contain between 1 and ${MAX_BOOKING_NIGHTS} nights`);
    }

    let previousDate = "";
    for (const rate of nightlyRates) {
        if (!ISO_DATE_PATTERN.test(rate.date)) {
            throw new Error("Nightly rate dates must use YYYY-MM-DD");
        }
        if (previousDate && rate.date <= previousDate) {
            throw new Error("Nightly rate dates must be strictly increasing and unique");
        }
        if (parseMoneyToMinor(rate.price, `Nightly rate for ${rate.date}`) < 0) {
            throw new Error("Nightly rates cannot be negative");
        }
        previousDate = rate.date;
    }
}

export function calculateBookingAmounts(
    input: BookingCalculationInput,
): BookingCalculationResult {
    if (!isCustomerPaymentMethod(input.paymentMethod)) {
        throw new Error("Unsupported customer payment method");
    }
    validateNightlyRates(input.nightlyRates);

    const nightlyMinor = input.nightlyRates.map((rate) => ({
        ...rate,
        amountMinor: parseMoneyToMinor(rate.price, `Nightly rate for ${rate.date}`),
    }));
    const roomSubtotalMinor = nightlyMinor.reduce(
        (sum, rate) => sum + rate.amountMinor,
        0,
    );
    if (!Number.isSafeInteger(roomSubtotalMinor) || roomSubtotalMinor <= 0) {
        throw new Error("Room subtotal must be a positive supported amount");
    }

    const discountRateBasisPoints = parsePercentToBasisPoints(
        input.firstBookingDiscountPercent ?? 0,
        "First-booking discount rate",
    );
    const discountCapMinor = parseMoneyToMinor(
        input.firstBookingDiscountCap ?? 0,
        "First-booking discount cap",
    );
    if (discountCapMinor < 0) {
        throw new Error("First-booking discount cap cannot be negative");
    }

    const uncappedDiscountMinor = multiplyRate(
        roomSubtotalMinor,
        discountRateBasisPoints,
    );
    const discountAmountMinor = Math.min(
        roomSubtotalMinor,
        uncappedDiscountMinor,
        discountCapMinor,
    );
    const taxableAmountMinor = roomSubtotalMinor - discountAmountMinor;

    const taxRateBasisPoints = parsePercentToBasisPoints(
        input.taxRatePercent,
        "Tax rate",
    );
    const taxAmountMinor = multiplyRate(taxableAmountMinor, taxRateBasisPoints);
    const totalAmountMinor = taxableAmountMinor + taxAmountMinor;

    const commissionRateBasisPoints = parsePercentToBasisPoints(
        input.commissionRatePercent,
        "Commission rate",
    );
    const commissionAmountMinor = multiplyRate(
        totalAmountMinor,
        commissionRateBasisPoints,
    );
    const netAmountMinor = totalAmountMinor - commissionAmountMinor;

    const amountDueNowMinor =
        input.paymentMethod === "PAY_AT_HOTEL"
            ? commissionAmountMinor
            : totalAmountMinor;

    const walletBalanceMinor = parseMoneyToMinor(
        input.walletBalance ?? 0,
        "Wallet balance",
    );
    if (walletBalanceMinor < 0) {
        throw new Error("Wallet balance cannot be negative");
    }

    let walletAmountUsedMinor = 0;
    if (input.paymentMethod === "WALLET") {
        if (walletBalanceMinor < amountDueNowMinor) {
            throw new Error("Insufficient wallet balance");
        }
        walletAmountUsedMinor = amountDueNowMinor;
    } else if (input.useWalletBalance) {
        const requestedWalletAmountMinor =
            input.requestedWalletAmount === undefined
                ? Math.min(walletBalanceMinor, amountDueNowMinor)
                : parseMoneyToMinor(
                      input.requestedWalletAmount,
                      "Requested wallet amount",
                  );

        if (requestedWalletAmountMinor < 0) {
            throw new Error("Requested wallet amount cannot be negative");
        }
        if (requestedWalletAmountMinor > walletBalanceMinor) {
            throw new Error("Requested wallet amount exceeds available balance");
        }
        if (requestedWalletAmountMinor > amountDueNowMinor) {
            throw new Error("Requested wallet amount exceeds the amount due now");
        }
        walletAmountUsedMinor = requestedWalletAmountMinor;
    }

    const amountOutstandingMinor = amountDueNowMinor - walletAmountUsedMinor;

    return {
        roomSubtotalMinor,
        discountAmountMinor,
        taxAmountMinor,
        totalAmountMinor,
        commissionRateBasisPoints,
        commissionAmountMinor,
        netAmountMinor,
        amountDueNowMinor,
        walletAmountUsedMinor,
        amountOutstandingMinor,
        requiresPayment: amountOutstandingMinor > 0,
        walletPaymentSuccess:
            input.paymentMethod === "WALLET" && amountOutstandingMinor === 0,
        breakdown: {
            version: BOOKING_PRICING_VERSION,
            currency: BOOKING_CURRENCY,
            nightlyRates: nightlyMinor.map((rate) => ({
                date: rate.date,
                amount: formatMinor(rate.amountMinor),
                source: rate.source,
            })),
            roomSubtotal: formatMinor(roomSubtotalMinor),
            discountRate: formatMinor(discountRateBasisPoints),
            discountCap: formatMinor(discountCapMinor),
            discountAmount: formatMinor(discountAmountMinor),
            taxableAmount: formatMinor(taxableAmountMinor),
            taxRate: formatMinor(taxRateBasisPoints),
            taxAmount: formatMinor(taxAmountMinor),
            totalAmount: formatMinor(totalAmountMinor),
            commissionRate: formatMinor(commissionRateBasisPoints),
            commissionAmount: formatMinor(commissionAmountMinor),
            netAmount: formatMinor(netAmountMinor),
            amountDueNow: formatMinor(amountDueNowMinor),
            walletAmountUsed: formatMinor(walletAmountUsedMinor),
            amountOutstanding: formatMinor(amountOutstandingMinor),
        },
    };
}

export function enumerateStayDates(checkIn: string, checkOut: string): string[] {
    if (!ISO_DATE_PATTERN.test(checkIn) || !ISO_DATE_PATTERN.test(checkOut)) {
        throw new Error("Check-in and check-out must use YYYY-MM-DD");
    }

    const start = new Date(`${checkIn}T00:00:00.000Z`);
    const end = new Date(`${checkOut}T00:00:00.000Z`);
    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        start.toISOString().slice(0, 10) !== checkIn ||
        end.toISOString().slice(0, 10) !== checkOut ||
        end <= start
    ) {
        throw new Error("Check-out must be after check-in");
    }

    const dates: string[] = [];
    for (let cursor = start; cursor < end; cursor = new Date(cursor.getTime() + 86_400_000)) {
        dates.push(cursor.toISOString().slice(0, 10));
        if (dates.length > MAX_BOOKING_NIGHTS) {
            throw new Error(`Booking cannot exceed ${MAX_BOOKING_NIGHTS} nights`);
        }
    }
    return dates;
}
