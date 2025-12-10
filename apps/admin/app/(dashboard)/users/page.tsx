import { getAdminUsers, updateUserRole } from "@/actions/users";

export default async function UsersPage() {
    const users = await getAdminUsers();

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Manage Users</h1>
                <p className="page-subtitle">{users.length} users total</p>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
                <span className="scroll-hint">← Scroll to see more →</span>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Contact</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="table-empty">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="table-cell-flex">
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt=""
                                                        className="header-avatar"
                                                    />
                                                ) : (
                                                    <div className="header-avatar-placeholder">
                                                        {(user.name || user.email)?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="table-cell-primary">
                                                    {user.name || "Unknown"}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-cell-primary">{user.email}</div>
                                            <div className="table-cell-secondary">{user.phone}</div>
                                        </td>
                                        <td>
                                            <form
                                                action={async (formData) => {
                                                    "use server";
                                                    const role = formData.get("role") as string;
                                                    await updateUserRole(user.id, role);
                                                }}
                                                className="form-inline"
                                            >
                                                <select
                                                    name="role"
                                                    defaultValue={user.role || "TRAVELER"}
                                                    className="form-select"
                                                >
                                                    <option value="TRAVELER">Traveler</option>
                                                    <option value="HOTEL_OWNER">Hotel Owner</option>
                                                    <option value="PARTNER">Partner</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                                <button type="submit" className="btn btn-sm btn-outline">
                                                    Update
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
