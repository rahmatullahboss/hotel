import { db } from "./index";
import { users, accounts } from "./schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "rahmatullahzisan@gmail.com";

async function linkGoogleAccount(): Promise<void> {
    console.log(`🔍 Finding user with email: ${ADMIN_EMAIL}`);

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, ADMIN_EMAIL))
        .limit(1);

    if (!user) {
        console.error("❌ User not found!");
        process.exitCode = 1;
        return;
    }

    console.log(`✅ Found user: ${user.id} (role: ${user.role})`);

    const existingGoogleAccounts = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, user.id));

    console.log(`📦 Existing accounts: ${existingGoogleAccounts.length}`);

    for (const account of existingGoogleAccounts) {
        console.log(`  - Provider: ${account.provider}, Type: ${account.type}`);
    }

    // If an incompatible account record exists, clear it before a fresh OAuth login.
    // This remains an explicit maintenance utility and must not run automatically.
    if (existingGoogleAccounts.length > 0) {
        console.log("\n🗑️ Removing existing accounts to allow fresh OAuth login...");
        await db.delete(accounts).where(eq(accounts.userId, user.id));
        console.log("✅ Accounts cleared. You can now login with Google!");
    }

    if (user.passwordHash) {
        console.log("\n🔐 User has password set. Keeping it for now.");
        console.log("   They can use either email/password or Google after linking.");
    }

    console.log("\n✅ Done! Now login with Google at /auth/signin");
    console.log("   The Google account will be automatically linked.");
}

linkGoogleAccount().catch((error: unknown) => {
    console.error("Failed to link Google account:", error);
    process.exitCode = 1;
});
