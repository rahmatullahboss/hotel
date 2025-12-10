import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export { auth, signOut };

export async function getSession() {
    return await auth();
}

export async function requireAuth() {
    const session = await auth();
    if (!session?.user) {
        redirect("/auth/signin");
    }
    return session;
}

export async function requireRole(allowedRoles: string[]) {
    const session = await requireAuth();
    if (!allowedRoles.includes(session.user.role)) {
        redirect("/");
    }
    return session;
}
