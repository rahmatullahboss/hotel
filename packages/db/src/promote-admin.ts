/**
 * Promote User to Admin Script
 * 
 * Run with: npx tsx packages/db/src/promote-admin.ts
 */

import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "rahmatullahzisan@gmail.com";

async function promoteToAdmin() {
    console.log(`🔑 Promoting ${ADMIN_EMAIL} to ADMIN role...\n`);

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, ADMIN_EMAIL),
    });

    if (!existingUser) {
        console.log("User not found. Creating new admin user...");
        const [newUser] = await db.insert(users).values({
            email: ADMIN_EMAIL,
            name: "Admin",
            role: "ADMIN",
        }).returning();

        console.log(`✅ Created new admin user: ${newUser?.email}`);
    } else {
        console.log(`Found existing user: ${existingUser.name || existingUser.email}`);
        console.log(`Current role: ${existingUser.role}`);

        await db
            .update(users)
            .set({ role: "ADMIN" })
            .where(eq(users.email, ADMIN_EMAIL));

        console.log(`✅ Updated role to ADMIN`);
    }

    console.log("\n🎉 Done! You can now log into the admin panel.");
    process.exit(0);
}

promoteToAdmin().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
