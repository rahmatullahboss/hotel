/**
 * bKash Payment Gateway Configuration
 * 
 * Environment Variables Required:
 * - BKASH_APP_KEY
 * - BKASH_APP_SECRET
 * - BKASH_USERNAME
 * - BKASH_PASSWORD
 * - BKASH_IS_SANDBOX (optional, defaults to true)
 * - NEXT_PUBLIC_BASE_URL (for callback URLs)
 * 
 * Sandbox Test Credentials:
 * - Wallet: 01619777282, 01619777283, etc
 * - PIN: 12121
 * - OTP: 123456
 */

export interface BkashConfig {
    appKey: string;
    appSecret: string;
    username: string;
    password: string;
    isSandbox: boolean;
    baseUrl: string;
}

export interface BkashTokenResponse {
    statusCode: string;
    statusMessage: string;
    id_token?: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
}

export interface BkashCreatePaymentResponse {
    statusCode: string;
    statusMessage: string;
    paymentID?: string;
    bkashURL?: string;
    callbackURL?: string;
    successCallbackURL?: string;
    failureCallbackURL?: string;
    cancelledCallbackURL?: string;
    amount?: string;
    intent?: string;
    currency?: string;
    paymentCreateTime?: string;
    transactionStatus?: string;
    merchantInvoiceNumber?: string;
}

export interface BkashExecutePaymentResponse {
    statusCode: string;
    statusMessage: string;
    paymentID?: string;
    trxID?: string;
    transactionStatus?: string;
    amount?: string;
    currency?: string;
    intent?: string;
    paymentExecuteTime?: string;
    merchantInvoiceNumber?: string;
    payerReference?: string;
    customerMsisdn?: string;
}

export interface PaymentInitData {
    bookingId: string;
    totalAmount: number;
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    productName: string;
}

// Token storage (in production, use Redis or database)
let cachedToken: { id_token: string; refresh_token: string; expires_at: number } | null = null;

export function getBkashConfig(): BkashConfig {
    const appKey = process.env.BKASH_APP_KEY;
    const appSecret = process.env.BKASH_APP_SECRET;
    const username = process.env.BKASH_USERNAME;
    const password = process.env.BKASH_PASSWORD;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!appKey || !appSecret || !username || !password) {
        throw new Error(
            "bKash credentials not configured. Please set BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, and BKASH_PASSWORD in your environment variables."
        );
    }

    return {
        appKey,
        appSecret,
        username,
        password,
        isSandbox: process.env.BKASH_IS_SANDBOX !== "false",
        baseUrl,
    };
}

export function getBkashApiUrl(config: BkashConfig): string {
    return config.isSandbox
        ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
        : "https://tokenized.pay.bka.sh/v1.2.0-beta";
}

/**
 * Get bKash access token (with caching)
 */
export async function getBkashToken(): Promise<string> {
    const config = getBkashConfig();
    const apiUrl = getBkashApiUrl(config);

    // Check if we have a valid cached token
    if (cachedToken && cachedToken.expires_at > Date.now()) {
        return cachedToken.id_token;
    }

    // If we have a refresh token and it's not expired, use it
    if (cachedToken?.refresh_token) {
        try {
            const refreshed = await refreshBkashToken(cachedToken.refresh_token);
            if (refreshed) return refreshed;
        } catch (e) {
            console.log("Refresh failed, getting new token");
        }
    }

    // Get new token
    const response = await fetch(`${apiUrl}/tokenized/checkout/token/grant`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config.username,
            password: config.password,
        },
        body: JSON.stringify({
            app_key: config.appKey,
            app_secret: config.appSecret,
        }),
    });

    const result = (await response.json()) as BkashTokenResponse;

    if (result.statusCode !== "0000" || !result.id_token) {
        throw new Error(result.statusMessage || "Failed to get bKash token");
    }

    // Cache the token (expires in 1 hour, we'll refresh at 50 mins)
    cachedToken = {
        id_token: result.id_token,
        refresh_token: result.refresh_token || "",
        expires_at: Date.now() + 50 * 60 * 1000, // 50 minutes
    };

    return result.id_token;
}

/**
 * Refresh bKash token
 */
async function refreshBkashToken(refreshToken: string): Promise<string | null> {
    const config = getBkashConfig();
    const apiUrl = getBkashApiUrl(config);

    const response = await fetch(`${apiUrl}/tokenized/checkout/token/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config.username,
            password: config.password,
        },
        body: JSON.stringify({
            app_key: config.appKey,
            app_secret: config.appSecret,
            refresh_token: refreshToken,
        }),
    });

    const result = (await response.json()) as BkashTokenResponse;

    if (result.statusCode !== "0000" || !result.id_token) {
        return null;
    }

    cachedToken = {
        id_token: result.id_token,
        refresh_token: result.refresh_token || refreshToken,
        expires_at: Date.now() + 50 * 60 * 1000,
    };

    return result.id_token;
}

/**
 * Create bKash payment
 */
export async function createBkashPayment(
    data: PaymentInitData
): Promise<{ success: boolean; paymentID?: string; bkashURL?: string; error?: string }> {
    try {
        const config = getBkashConfig();
        const apiUrl = getBkashApiUrl(config);
        const token = await getBkashToken();

        const response = await fetch(`${apiUrl}/tokenized/checkout/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: token,
                "X-APP-Key": config.appKey,
            },
            body: JSON.stringify({
                mode: "0011", // Checkout URL mode
                payerReference: data.customerPhone,
                callbackURL: `${config.baseUrl}/api/payment/callback`,
                amount: data.totalAmount.toString(),
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: data.bookingId,
            }),
        });

        const result = (await response.json()) as BkashCreatePaymentResponse;

        if (result.statusCode === "0000" && result.bkashURL) {
            return {
                success: true,
                paymentID: result.paymentID,
                bkashURL: result.bkashURL,
            };
        }

        return {
            success: false,
            error: result.statusMessage || "Failed to create payment",
        };
    } catch (error) {
        console.error("bKash create payment error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Payment service unavailable",
        };
    }
}

/**
 * Execute bKash payment (after user approves)
 */
export async function executeBkashPayment(
    paymentID: string
): Promise<{ success: boolean; data?: BkashExecutePaymentResponse; error?: string }> {
    try {
        const config = getBkashConfig();
        const apiUrl = getBkashApiUrl(config);
        const token = await getBkashToken();

        const response = await fetch(`${apiUrl}/tokenized/checkout/execute`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: token,
                "X-APP-Key": config.appKey,
            },
            body: JSON.stringify({ paymentID }),
        });

        const result = (await response.json()) as BkashExecutePaymentResponse;

        if (result.statusCode === "0000" && result.transactionStatus === "Completed") {
            return {
                success: true,
                data: result,
            };
        }

        return {
            success: false,
            error: result.statusMessage || "Payment execution failed",
        };
    } catch (error) {
        console.error("bKash execute payment error:", error);
        return {
            success: false,
            error: "Payment execution failed",
        };
    }
}

/**
 * Query bKash payment status
 */
export async function queryBkashPayment(
    paymentID: string
): Promise<{ success: boolean; data?: BkashExecutePaymentResponse; error?: string }> {
    try {
        const config = getBkashConfig();
        const apiUrl = getBkashApiUrl(config);
        const token = await getBkashToken();

        const response = await fetch(`${apiUrl}/tokenized/checkout/payment/status`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: token,
                "X-APP-Key": config.appKey,
            },
            body: JSON.stringify({ paymentID }),
        });

        const result = (await response.json()) as BkashExecutePaymentResponse;

        if (result.statusCode === "0000") {
            return {
                success: true,
                data: result,
            };
        }

        return {
            success: false,
            error: result.statusMessage || "Query failed",
        };
    } catch (error) {
        console.error("bKash query payment error:", error);
        return {
            success: false,
            error: "Query failed",
        };
    }
}
