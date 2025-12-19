"use client";

import { useState, useEffect, useTransition, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateUserRole, getUsersWithDetails, type UserWithDetails, type PaginatedUsers } from "@/actions/users";

interface UsersPageClientProps {
    initialData: PaginatedUsers;
}

export function UsersPageClient({ initialData }: UsersPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [data, setData] = useState(initialData);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [role, setRole] = useState(searchParams.get("role") || "ALL");
    const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        userId: string;
        userName: string;
        newRole: string;
    } | null>(null);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            updateURL();
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    // Update URL and fetch data
    const updateURL = (newPage?: number) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (role !== "ALL") params.set("role", role);
        params.set("page", String(newPage || page));

        startTransition(async () => {
            const result = await getUsersWithDetails({
                search,
                role: role === "ALL" ? "" : role,
                page: newPage || page,
                limit: 10,
            });
            setData(result);
        });

        router.push(`/users?${params.toString()}`, { scroll: false });
    };

    const handleRoleChange = (userId: string, userName: string, newRole: string) => {
        setConfirmModal({ userId, userName: userName || "this user", newRole });
    };

    const confirmRoleChange = async () => {
        if (!confirmModal) return;

        startTransition(async () => {
            await updateUserRole(confirmModal.userId, confirmModal.newRole);
            // Refresh data
            const result = await getUsersWithDetails({
                search,
                role: role === "ALL" ? "" : role,
                page,
                limit: 10,
            });
            setData(result);
        });

        setConfirmModal(null);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        updateURL(newPage);
    };

    const handleRoleFilter = (newRole: string) => {
        setRole(newRole);
        setPage(1);
        setTimeout(() => updateURL(1), 0);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const tierColors: Record<string, string> = {
        BRONZE: "#cd7f32",
        SILVER: "#c0c0c0",
        GOLD: "#ffd700",
        PLATINUM: "#e5e4e2",
    };

    return (
        <>
            {/* Search and Filter */}
            <div style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap"
            }}>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: "1",
                        minWidth: "200px",
                        padding: "0.75rem 1rem",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.875rem",
                        background: "var(--color-bg-card)",
                        color: "var(--color-text-primary)",
                    }}
                />
                <select
                    value={role}
                    onChange={(e) => handleRoleFilter(e.target.value)}
                    className="form-select"
                    style={{ minWidth: "150px" }}
                >
                    <option value="ALL">All Roles</option>
                    <option value="TRAVELER">Traveler</option>
                    <option value="HOTEL_OWNER">Hotel Owner</option>
                    <option value="PARTNER">Partner</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="card" style={{ overflow: "hidden" }}>
                <span className="scroll-hint">← Scroll to see more →</span>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Contact</th>
                                <th>Joined</th>
                                <th>Role</th>
                                <th style={{ width: "50px" }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="table-empty">
                                        {isPending ? "Loading..." : "No users found."}
                                    </td>
                                </tr>
                            ) : (
                                data.users.map((user) => (
                                    <Fragment key={user.id}>
                                        <tr>
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
                                                <div className="table-cell-secondary">{user.phone || "—"}</div>
                                            </td>
                                            <td>
                                                <div className="table-cell-secondary">
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </td>
                                            <td>
                                                <select
                                                    defaultValue={user.role}
                                                    className="form-select"
                                                    onChange={(e) => handleRoleChange(user.id, user.name || "", e.target.value)}
                                                >
                                                    <option value="TRAVELER">Traveler</option>
                                                    <option value="HOTEL_OWNER">Hotel Owner</option>
                                                    <option value="PARTNER">Partner</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                                                    className="btn btn-sm btn-outline"
                                                    title="View details"
                                                >
                                                    {expandedUser === user.id ? "▲" : "▼"}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedUser === user.id && (
                                            <tr>
                                                <td colSpan={5} style={{
                                                    background: "var(--color-bg-secondary)",
                                                    padding: "1rem 1.5rem"
                                                }}>
                                                    <div style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                                        gap: "1rem"
                                                    }}>
                                                        <div>
                                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                                                                Wallet Balance
                                                            </div>
                                                            <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                                                                ৳{user.walletBalance.toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                                                                Loyalty Points
                                                            </div>
                                                            <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                                                                {user.loyaltyPoints.toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                                                                Loyalty Tier
                                                            </div>
                                                            <div style={{
                                                                fontWeight: 600,
                                                                color: tierColors[user.loyaltyTier] || "var(--color-text-primary)"
                                                            }}>
                                                                {user.loyaltyTier}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                                                                Total Bookings
                                                            </div>
                                                            <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                                                                {user.totalBookings}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "1.5rem",
                    flexWrap: "wrap",
                    gap: "1rem"
                }}>
                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                        Showing {(data.page - 1) * data.limit + 1} - {Math.min(data.page * data.limit, data.total)} of {data.total} users
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={() => handlePageChange(data.page - 1)}
                            disabled={data.page <= 1 || isPending}
                            className="btn btn-sm btn-outline"
                        >
                            ← Previous
                        </button>
                        <span style={{
                            padding: "0.5rem 1rem",
                            fontSize: "0.875rem",
                            color: "var(--color-text-primary)"
                        }}>
                            Page {data.page} of {data.totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(data.page + 1)}
                            disabled={data.page >= data.totalPages || isPending}
                            className="btn btn-sm btn-outline"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "1rem"
                }}>
                    <div className="card" style={{
                        padding: "1.5rem",
                        maxWidth: "400px",
                        width: "100%"
                    }}>
                        <h3 style={{
                            fontSize: "1.125rem",
                            fontWeight: 600,
                            marginBottom: "1rem",
                            color: "var(--color-text-primary)"
                        }}>
                            Confirm Role Change
                        </h3>
                        <p style={{
                            marginBottom: "1.5rem",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.5
                        }}>
                            Are you sure you want to change <strong>{confirmModal.userName}</strong>&apos;s role to <strong>{confirmModal.newRole}</strong>?
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="btn btn-outline"
                                disabled={isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRoleChange}
                                className="btn btn-primary"
                                disabled={isPending}
                            >
                                {isPending ? "Updating..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
