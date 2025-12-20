import { NextResponse } from "next/server";
import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "your-secret-key";
const SALT_ROUNDS = 12;

export async function POST(request: Request) {
    try {
        const { name, email, phone, password } = await request.json();

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, normalizedEmail),
        });

        if (existingUser) {
            // If user exists but has no password, they registered via OAuth
            if (!existingUser.passwordHash) {
                return NextResponse.json(
                    { error: "This email is registered with Google. Please sign in with Google." },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const [newUser] = await db.insert(users).values({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone?.trim() || null,
            passwordHash,
            role: "TRAVELER",
        }).returning();

        if (!newUser) {
            return NextResponse.json(
                { error: "Failed to create account" },
                { status: 500 }
            );
        }

        // Generate JWT token for auto-login
        const token = jwt.sign(
            {
                userId: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
            },
            JWT_SECRET,
            { expiresIn: "30d" }
        );

        return NextResponse.json({
            message: "Account created successfully",
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Mobile registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
