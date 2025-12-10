import { getAdminUsers, updateUserRole } from "@/actions/users";

export default async function UsersPage() {
    const users = await getAdminUsers();

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 className="text-2xl font-bold">Manage Users</h1>
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                    {users.length} users total
                </div>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)" }}>
                        <tr>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>User</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Contact</th>
                            <th style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                <td style={{ padding: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt=""
                                                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: "50%",
                                                    background: "var(--color-primary)",
                                                    color: "white",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {(user.name || user.email)?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <span style={{ fontWeight: 500 }}>{user.name || "Unknown"}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    <div style={{ fontSize: "0.875rem" }}>{user.email}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{user.phone}</div>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    <form
                                        action={async (formData) => {
                                            "use server";
                                            const role = formData.get("role") as string;
                                            await updateUserRole(user.id, role);
                                        }}
                                        style={{ display: "flex", gap: "0.5rem" }}
                                    >
                                        <select
                                            name="role"
                                            defaultValue={user.role || "USER"}
                                            style={{
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                border: "1px solid var(--color-border)",
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            <option value="USER">User</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="PARTNER">Partner</option>
                                        </select>
                                        <button
                                            type="submit"
                                            className="btn btn-outline"
                                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                        >
                                            Update
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
