import { db } from "./index";
import { users, accounts } from "./schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "rahmatullahzisan@gmail.com";

async function linkGoogleAccount() {
    console.log(`🔍 Finding user with email: ${ADMIN_EMAIL}`);

    // Find the user
    const user = await db
        .select()
        .from(users)
        .where(eq(users.email, ADMIN_EMAIL))
        .limit(1);

    if (user.length === 0) {
        console.log("❌ User not found!");
        process.exit(1);
    }

    console.log(`✅ Found user: ${user[0].id} (role: ${user[0].role})`);

    // Check if Google account already exists
    const existingGoogleAccount = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, user[0].id));

    console.log(`📦 Existing accounts: ${existingGoogleAccount.length}`);
    
    for (const acc of existingGoogleAccount) {
        console.log(`  - Provider: ${acc.provider}, Type: ${acc.type}`);
    }

    // If no Google account linked, we need to delete existing accounts to allow OAuth
    // This is a workaround for NextAuth's OAuthAccountNotLinked error
    if (existingGoogleAccount.length > 0) {
        console.log("\n🗑️ Removing existing accounts to allow fresh OAuth login...");
        await db.delete(accounts).where(eq(accounts.userId, user[0].id));
        console.log("✅ Accounts cleared. You can now login with Google!");
    }

    // If user has passwordHash but wants OAuth, clear it optionally
    if (user[0].passwordHash) {
        console.log("\n🔐 User has password set. Keeping it for now.");
        console.log("   They can use either email/password or Google after linking.");
    }

    console.log("\n✅ Done! Now login with Google at /auth/signin");
    console.log("   The Google account will be automatically linked.");
    process.exit(0);
}

linkGoogleAccount();
