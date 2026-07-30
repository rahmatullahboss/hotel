const GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";
const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);
const MAX_GOOGLE_ID_TOKEN_LENGTH = 8192;

export type GoogleTokenFailureKind = "configuration" | "invalid" | "unavailable";

export class GoogleTokenVerificationError extends Error {
    public readonly kind: GoogleTokenFailureKind;

    constructor(kind: GoogleTokenFailureKind, message: string) {
        super(message);
        this.name = "GoogleTokenVerificationError";
        this.kind = kind;
    }
}

export interface VerifiedGoogleIdentity {
    providerAccountId: string;
    email: string;
    name: string;
    picture: string | null;
}

interface GoogleTokenInfoPayload {
    aud?: unknown;
    azp?: unknown;
    iss?: unknown;
    sub?: unknown;
    email?: unknown;
    email_verified?: unknown;
    name?: unknown;
    picture?: unknown;
    exp?: unknown;
}

export function getAllowedGoogleClientIds(
    env: NodeJS.ProcessEnv = process.env,
): string[] {
    const configured = [
        env.AUTH_GOOGLE_ID,
        ...(env.MOBILE_GOOGLE_CLIENT_IDS?.split(",") ?? []),
    ]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value));

    const unique = [...new Set(configured)];
    if (unique.length === 0) {
        throw new GoogleTokenVerificationError(
            "configuration",
            "AUTH_GOOGLE_ID or MOBILE_GOOGLE_CLIENT_IDS is required for Google mobile authentication",
        );
    }
    return unique;
}

function isVerifiedEmail(value: unknown): boolean {
    return value === true || value === "true";
}

function parseExpiry(value: unknown): number {
    if (typeof value === "number") {
        return value;
    }
    if (typeof value === "string" && /^\d+$/.test(value)) {
        return Number(value);
    }
    return Number.NaN;
}

export async function verifyGoogleIdToken(
    idToken: string,
    options: {
        env?: NodeJS.ProcessEnv;
        fetcher?: typeof fetch;
        nowSeconds?: number;
    } = {},
): Promise<VerifiedGoogleIdentity> {
    if (!idToken || idToken.length > MAX_GOOGLE_ID_TOKEN_LENGTH) {
        throw new GoogleTokenVerificationError("invalid", "Google ID token is missing or too large");
    }

    const allowedClientIds = getAllowedGoogleClientIds(options.env);
    const fetcher = options.fetcher ?? fetch;
    const url = new URL(GOOGLE_TOKENINFO_URL);
    url.searchParams.set("id_token", idToken);

    let response: Response;
    try {
        response = await fetcher(url, {
            method: "GET",
            cache: "no-store",
            signal: AbortSignal.timeout(5_000),
        });
    } catch {
        throw new GoogleTokenVerificationError(
            "unavailable",
            "Google token verification service is unavailable",
        );
    }

    if (!response.ok) {
        throw new GoogleTokenVerificationError(
            response.status >= 500 ? "unavailable" : "invalid",
            "Google ID token verification failed",
        );
    }

    const payload = (await response.json()) as GoogleTokenInfoPayload;
    const audience = typeof payload.aud === "string" ? payload.aud : "";
    const authorizedParty = typeof payload.azp === "string" ? payload.azp : null;
    const issuer = typeof payload.iss === "string" ? payload.iss : "";
    const expiresAt = parseExpiry(payload.exp);
    const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);

    if (
        !allowedClientIds.includes(audience) ||
        (authorizedParty !== null && !allowedClientIds.includes(authorizedParty)) ||
        !GOOGLE_ISSUERS.has(issuer) ||
        !Number.isSafeInteger(expiresAt) ||
        expiresAt <= nowSeconds ||
        !isVerifiedEmail(payload.email_verified) ||
        typeof payload.sub !== "string" ||
        !payload.sub ||
        typeof payload.email !== "string" ||
        !payload.email
    ) {
        throw new GoogleTokenVerificationError("invalid", "Google ID token claims are invalid");
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const name =
        typeof payload.name === "string" && payload.name.trim()
            ? payload.name.trim()
            : normalizedEmail.split("@")[0] || "Traveler";

    return {
        providerAccountId: payload.sub,
        email: normalizedEmail,
        name,
        picture:
            typeof payload.picture === "string" && payload.picture.trim()
                ? payload.picture.trim()
                : null,
    };
}
