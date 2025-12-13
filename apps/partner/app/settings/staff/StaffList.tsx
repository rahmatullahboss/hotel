"use client";

import { useState, useTransition } from "react";
import { MdError, MdCheckCircle, MdBusinessCenter, MdRoomService, MdGroup } from "react-icons/md";
import type { StaffMember } from "../../actions/staff";
import {
    inviteStaffMember,
    updateStaffRole,
    revokeStaffAccess,
    removeStaffMember,
} from "../../actions/staff";

interface StaffListProps {
    initialStaff: StaffMember[];
    currentUserId: string;
}

export function StaffList({ initialStaff, currentUserId }: StaffListProps) {
    const [staff, setStaff] = useState(initialStaff);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Invite form state
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"MANAGER" | "RECEPTIONIST">("RECEPTIONIST");

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            const result = await inviteStaffMember(inviteEmail, inviteRole);
            if (result.success) {
                setSuccess("Staff member invited successfully!");
                setInviteEmail("");
                setShowInviteForm(false);
                // Refresh will happen via revalidatePath
                window.location.reload();
            } else {
                setError(result.error || "Failed to invite staff member");
            }
        });
    };

    const handleRoleChange = (staffId: string, newRole: "MANAGER" | "RECEPTIONIST") => {
        setError(null);
        startTransition(async () => {
            const result = await updateStaffRole(staffId, newRole);
            if (result.success) {
                setStaff((prev) =>
                    prev.map((s) => (s.id === staffId ? { ...s, role: newRole } : s))
                );
            } else {
                setError(result.error || "Failed to update role");
            }
        });
    };

    const handleRevoke = (staffId: string, name: string | null) => {
        if (!confirm(`Revoke access for ${name || "this user"}?`)) return;

        setError(null);
        startTransition(async () => {
            const result = await revokeStaffAccess(staffId);
            if (result.success) {
                setStaff((prev) =>
                    prev.map((s) => (s.id === staffId ? { ...s, status: "REVOKED" } : s))
                );
            } else {
                setError(result.error || "Failed to revoke access");
            }
        });
    };

    const handleRemove = (staffId: string, name: string | null) => {
        if (!confirm(`Permanently remove ${name || "this user"} from staff?`)) return;

        setError(null);
        startTransition(async () => {
            const result = await removeStaffMember(staffId);
            if (result.success) {
                setStaff((prev) => prev.filter((s) => s.id !== staffId));
            } else {
                setError(result.error || "Failed to remove staff member");
            }
        });
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case "OWNER":
                return "badge-accent";
            case "MANAGER":
                return "badge-primary";
            case "RECEPTIONIST":
                return "badge-secondary";
            default:
                return "badge-secondary";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return { class: "badge-success", label: "Active" };
            case "PENDING":
                return { class: "badge-warning", label: "Pending" };
            case "REVOKED":
                return { class: "badge-error", label: "Revoked" };
            default:
                return { class: "badge-secondary", label: status };
        }
    };

    return (
        <div>
            {/* Error/Success Messages */}
            {error && (
                <div
                    className="card"
                    style={{
                        marginBottom: "1rem",
                        backgroundColor: "rgba(208, 0, 0, 0.1)",
                        borderColor: "var(--color-error)",
                        padding: "0.75rem 1rem",
                    }}
                >
                    <span style={{ color: "var(--color-error)" }}><MdError style={{ display: "inline", verticalAlign: "middle" }} /> {error}</span>
                </div>
            )}
            {success && (
                <div
                    className="card"
                    style={{
                        marginBottom: "1rem",
                        backgroundColor: "rgba(42, 157, 143, 0.1)",
                        borderColor: "var(--color-success)",
                        padding: "0.75rem 1rem",
                    }}
                >
                    <span style={{ color: "var(--color-success)" }}><MdCheckCircle style={{ display: "inline", verticalAlign: "middle" }} /> {success}</span>
                </div>
            )}

            {/* Add Staff Button */}
            {!showInviteForm && (
                <button
                    className="btn btn-accent"
                    style={{ width: "100%", marginBottom: "1.5rem" }}
                    onClick={() => setShowInviteForm(true)}
                >
                    + Add Staff Member
                </button>
            )}

            {/* Invite Form */}
            {showInviteForm && (
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>
                        Invite Staff Member
                    </h3>
                    <form onSubmit={handleInvite}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label
                                htmlFor="email"
                                style={{
                                    display: "block",
                                    fontWeight: 500,
                                    marginBottom: "0.5rem",
                                    fontSize: "0.875rem",
                                }}
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="staff@example.com"
                                required
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "2px solid var(--color-border)",
                                    borderRadius: "0.5rem",
                                    fontSize: "1rem",
                                }}
                            />
                            <p
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--color-text-muted)",
                                    marginTop: "0.25rem",
                                }}
                            >
                                User must have an existing account
                            </p>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: 500,
                                    marginBottom: "0.5rem",
                                    fontSize: "0.875rem",
                                }}
                            >
                                Role
                            </label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    type="button"
                                    className={`btn ${inviteRole === "MANAGER" ? "btn-primary" : "btn-outline"}`}
                                    style={{ flex: 1 }}
                                    onClick={() => setInviteRole("MANAGER")}
                                >
                                    <MdBusinessCenter style={{ display: "inline", verticalAlign: "middle" }} /> Manager
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${inviteRole === "RECEPTIONIST" ? "btn-primary" : "btn-outline"}`}
                                    style={{ flex: 1 }}
                                    onClick={() => setInviteRole("RECEPTIONIST")}
                                >
                                    <MdRoomService style={{ display: "inline", verticalAlign: "middle" }} /> Receptionist
                                </button>
                            </div>
                        </div>

                        {/* Role Description */}
                        <div
                            style={{
                                padding: "0.75rem",
                                backgroundColor: "var(--color-bg-secondary)",
                                borderRadius: "0.5rem",
                                marginBottom: "1rem",
                                fontSize: "0.875rem",
                            }}
                        >
                            {inviteRole === "MANAGER" ? (
                                <>
                                    <strong>Manager Access:</strong>
                                    <ul
                                        style={{
                                            margin: "0.5rem 0 0 1rem",
                                            padding: 0,
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        <li>Manage rooms and inventory</li>
                                        <li>Set pricing and rules</li>
                                        <li>Handle check-in/out</li>
                                        <li>No access to earnings or payouts</li>
                                    </ul>
                                </>
                            ) : (
                                <>
                                    <strong>Receptionist Access:</strong>
                                    <ul
                                        style={{
                                            margin: "0.5rem 0 0 1rem",
                                            padding: 0,
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        <li>Check-in and check-out guests</li>
                                        <li>Record walk-in bookings</li>
                                        <li>No access to inventory, pricing, or earnings</li>
                                    </ul>
                                </>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{ flex: 1 }}
                                onClick={() => setShowInviteForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-accent"
                                style={{ flex: 1 }}
                                disabled={isPending || !inviteEmail}
                            >
                                {isPending ? "Inviting..." : "Send Invite"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Staff List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {staff.length === 0 ? (
                    <div
                        className="card"
                        style={{ textAlign: "center", padding: "2rem" }}
                    >
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                            <MdGroup size={32} />
                        </div>
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            No staff members yet. Add your first team member above.
                        </p>
                    </div>
                ) : (
                    staff.map((member) => {
                        const isCurrentUser = member.userId === currentUserId;
                        const isOwner = member.role === "OWNER";
                        const statusBadge = getStatusBadge(member.status);

                        return (
                            <div
                                key={member.id}
                                className="card"
                                style={{
                                    padding: "1rem",
                                    opacity: member.status === "REVOKED" ? 0.6 : 1,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                            }}
                                        >
                                            {member.name || "Unnamed User"}
                                            {isCurrentUser && (
                                                <span
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "var(--color-text-muted)",
                                                    }}
                                                >
                                                    (You)
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {member.email}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            gap: "0.25rem",
                                        }}
                                    >
                                        <span
                                            className={`badge ${getRoleBadgeClass(member.role)}`}
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            {member.role}
                                        </span>
                                        {member.status !== "ACTIVE" && (
                                            <span
                                                className={`badge ${statusBadge.class}`}
                                                style={{ fontSize: "0.65rem" }}
                                            >
                                                {statusBadge.label}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions - only for non-owners and non-current user */}
                                {!isOwner && !isCurrentUser && member.status === "ACTIVE" && (
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "0.5rem",
                                            paddingTop: "0.75rem",
                                            borderTop: "1px solid var(--color-border)",
                                        }}
                                    >
                                        <select
                                            value={member.role}
                                            onChange={(e) =>
                                                handleRoleChange(
                                                    member.id,
                                                    e.target.value as "MANAGER" | "RECEPTIONIST"
                                                )
                                            }
                                            disabled={isPending}
                                            style={{
                                                flex: 1,
                                                padding: "0.5rem",
                                                borderRadius: "0.375rem",
                                                border: "1px solid var(--color-border)",
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            <option value="MANAGER">Manager</option>
                                            <option value="RECEPTIONIST">Receptionist</option>
                                        </select>
                                        <button
                                            className="btn btn-outline"
                                            style={{
                                                fontSize: "0.75rem",
                                                padding: "0.5rem 0.75rem",
                                                color: "var(--color-error)",
                                                borderColor: "var(--color-error)",
                                            }}
                                            onClick={() => handleRevoke(member.id, member.name)}
                                            disabled={isPending}
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                )}

                                {/* Revoked actions */}
                                {member.status === "REVOKED" && (
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "0.5rem",
                                            paddingTop: "0.75rem",
                                            borderTop: "1px solid var(--color-border)",
                                        }}
                                    >
                                        <button
                                            className="btn btn-outline"
                                            style={{ flex: 1, fontSize: "0.75rem" }}
                                            onClick={() => handleRemove(member.id, member.name)}
                                            disabled={isPending}
                                        >
                                            Remove Permanently
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
