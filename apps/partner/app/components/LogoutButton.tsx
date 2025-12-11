"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="btn btn-outline"
            style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                minHeight: "auto",
            }}
        >
            Logout
        </button>
    );
}
