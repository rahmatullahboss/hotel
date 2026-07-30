import jwt, { type JwtPayload } from "jsonwebtoken";

export const MOBILE_JWT_ALGORITHM = "HS256" as const;
export const DEFAULT_MOBILE_JWT_TTL_SECONDS = 24 * 60 * 60;
export const MIN_MOBILE_JWT_TTL_SECONDS = 15 * 60;
export const MAX_MOBILE_JWT_TTL_SECONDS = 7 * 24 * 60 * 60;
export const MAX_MOBILE_TOKEN_LENGTH = 4096;

export interface MobileAuthConfig {
    secret: string;
    issuer: string;
    audience: string;
    ttlSeconds: number;
}

export interface MobileTokenSubject {
    userId: string;
    email: string;
    name: string | null;
    role: string;
}

export interface VerifiedMobileToken extends MobileTokenSubject {
    sessionId: string;
    issuedAt: number;
    expiresAt: number;
}

interface MobileJwtPayload extends JwtPayload {
    token_use?: unknown;
    email?: unknown;
    name?: unknown;
    role?: unknown;
}

function requireNonBlank(value: string | undefined, name: string): string {
    const normalized = value?.trim();
    if (!normalized) {
        throw new Error(`${name} environment variable is required for mobile authentication`);
    }
    return normalized;
}

function parseTtlSeconds(value: string | undefined): number {
    if (!value?.trim()) {
        return DEFAULT_MOBILE_JWT_TTL_SECONDS;
    }

    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed)) {
        throw new Error("MOBILE_JWT_TTL_SECONDS must be an integer number of seconds");
    }
    if (parsed < MIN_MOBILE_JWT_TTL_SECONDS || parsed > MAX_MOBILE_JWT_TTL_SECONDS) {
        throw new Error(
            `MOBILE_JWT_TTL_SECONDS must be between ${MIN_MOBILE_JWT_TTL_SECONDS} and ${MAX_MOBILE_JWT_TTL_SECONDS}`,
        );
    }
    return parsed;
}

export function getMobileAuthConfig(
    env: NodeJS.ProcessEnv = process.env,
): MobileAuthConfig {
    const secret = requireNonBlank(env.AUTH_SECRET, "AUTH_SECRET");
    if (Buffer.byteLength(secret, "utf8") < 32) {
        throw new Error("AUTH_SECRET must contain at least 32 bytes for mobile authentication");
    }

    return {
        secret,
        issuer: requireNonBlank(env.MOBILE_JWT_ISSUER, "MOBILE_JWT_ISSUER"),
        audience: requireNonBlank(env.MOBILE_JWT_AUDIENCE, "MOBILE_JWT_AUDIENCE"),
        ttlSeconds: parseTtlSeconds(env.MOBILE_JWT_TTL_SECONDS),
    };
}

export function signMobileAccessToken(
    subject: MobileTokenSubject,
    sessionId: string,
    config: MobileAuthConfig = getMobileAuthConfig(),
): string {
    if (!subject.userId || !subject.email || !subject.role || !sessionId) {
        throw new Error("Mobile access token requires user, email, role and session identifiers");
    }

    return jwt.sign(
        {
            token_use: "mobile-access",
            email: subject.email,
            name: subject.name,
            role: subject.role,
        },
        config.secret,
        {
            algorithm: MOBILE_JWT_ALGORITHM,
            issuer: config.issuer,
            audience: config.audience,
            subject: subject.userId,
            jwtid: sessionId,
            expiresIn: config.ttlSeconds,
        },
    );
}

export function verifyMobileAccessToken(
    token: string,
    config: MobileAuthConfig = getMobileAuthConfig(),
): VerifiedMobileToken {
    if (!token || token.length > MAX_MOBILE_TOKEN_LENGTH) {
        throw new Error("Mobile access token is missing or too large");
    }

    const decoded = jwt.verify(token, config.secret, {
        algorithms: [MOBILE_JWT_ALGORITHM],
        issuer: config.issuer,
        audience: config.audience,
        clockTolerance: 5,
    });

    if (typeof decoded === "string") {
        throw new Error("Mobile access token payload is invalid");
    }

    const payload = decoded as MobileJwtPayload;
    if (
        payload.token_use !== "mobile-access" ||
        typeof payload.sub !== "string" ||
        typeof payload.jti !== "string" ||
        typeof payload.email !== "string" ||
        (payload.name !== null && typeof payload.name !== "string") ||
        typeof payload.role !== "string" ||
        typeof payload.iat !== "number" ||
        typeof payload.exp !== "number"
    ) {
        throw new Error("Mobile access token claims are invalid");
    }

    return {
        userId: payload.sub,
        sessionId: payload.jti,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
    };
}
