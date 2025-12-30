"use client";

import { useState } from "react";
import { FiClock, FiStar, FiCheckCircle } from "react-icons/fi";

interface StaffMember {
    id: string;
    name: string;
    role: "OWNER" | "MANAGER" | "RECEPTIONIST" | "HOUSEKEEPING";
    avatar?: string;
    email?: string;
    phone?: string;
    status: "on-duty" | "off-duty" | "on-leave";
    shiftStart?: string;
    shiftEnd?: string;
    tasksCompleted: number;
    tasksTotal: number;
    rating?: number;
}

const roleColors: Record<string, string> = {
    OWNER: "#8B5CF6",
    MANAGER: "#3B82F6",
    RECEPTIONIST: "#10B981",
    HOUSEKEEPING: "#F59E0B",
};

const roleLabels: Record<string, string> = {
    OWNER: "Owner",
    MANAGER: "Manager",
    RECEPTIONIST: "Receptionist",
    HOUSEKEEPING: "Housekeeping",
};

interface StaffCardProps {
    staff: StaffMember;
    onViewDetails?: (staff: StaffMember) => void;
}

export function StaffCard({ staff, onViewDetails }: StaffCardProps) {
    const completionRate = staff.tasksTotal > 0
        ? Math.round((staff.tasksCompleted / staff.tasksTotal) * 100)
        : 100;

    const statusConfig = {
        "on-duty": { label: "On Duty", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
        "off-duty": { label: "Off Duty", color: "#94A3B8", bg: "rgba(148, 163, 184, 0.1)" },
        "on-leave": { label: "On Leave", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
    };

    const status = statusConfig[staff.status];

    return (
        <div
            className="glass-card"
            style={{ padding: "1rem", cursor: onViewDetails ? "pointer" : "default" }}
            onClick={() => onViewDetails?.(staff)}
        >
            <div style={{ display: "flex", gap: "0.75rem" }}>
                {/* Avatar */}
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: roleColors[staff.role],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1rem",
                        flexShrink: 0,
                    }}
                >
                    {staff.avatar ? (
                        <img src={staff.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "12px", objectFit: "cover" }} />
                    ) : (
                        staff.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <h3 style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "2px" }}>
                                {staff.name}
                            </h3>
                            <span
                                style={{
                                    display: "inline-block",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    background: `${roleColors[staff.role]}15`,
                                    color: roleColors[staff.role],
                                    fontSize: "0.6875rem",
                                    fontWeight: 500,
                                }}
                            >
                                {roleLabels[staff.role]}
                            </span>
                        </div>
                        
                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                borderRadius: "8px",
                                background: status.bg,
                                color: status.color,
                                fontSize: "0.6875rem",
                                fontWeight: 500,
                            }}
                        >
                            <div
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: status.color,
                                }}
                            />
                            {status.label}
                        </span>
                    </div>

                    {/* Shift & Tasks */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "0.75rem",
                            fontSize: "0.8125rem",
                        }}
                    >
                        {staff.shiftStart && staff.shiftEnd && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-secondary)" }}>
                                <FiClock size={12} />
                                {staff.shiftStart} - {staff.shiftEnd}
                            </div>
                        )}
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <FiCheckCircle size={14} color={completionRate >= 80 ? "#10B981" : completionRate >= 50 ? "#F59E0B" : "#EF4444"} />
                                <span style={{ fontWeight: 600 }}>{completionRate}%</span>
                            </div>
                            
                            {staff.rating && (
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <FiStar size={14} fill="#F59E0B" color="#F59E0B" />
                                    <span style={{ fontWeight: 600 }}>{staff.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StaffDashboardProps {
    staff: StaffMember[];
    onViewDetails?: (staff: StaffMember) => void;
}

export function StaffDashboard({ staff, onViewDetails }: StaffDashboardProps) {
    const [roleFilter, setRoleFilter] = useState<string>("all");

    const filteredStaff = staff.filter((s) => roleFilter === "all" || s.role === roleFilter);

    const onDutyCount = staff.filter((s) => s.status === "on-duty").length;
    const offDutyCount = staff.filter((s) => s.status === "off-duty").length;
    const onLeaveCount = staff.filter((s) => s.status === "on-leave").length;

    return (
        <div className="animate-fade-in">
            {/* Summary */}
            <div className="glass-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                    <div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10B981" }}>{onDutyCount}</div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>On Duty</div>
                    </div>
                    <div style={{ width: "1px", background: "var(--color-border)" }} />
                    <div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#94A3B8" }}>{offDutyCount}</div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>Off Duty</div>
                    </div>
                    <div style={{ width: "1px", background: "var(--color-border)" }} />
                    <div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F59E0B" }}>{onLeaveCount}</div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>On Leave</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                <button
                    onClick={() => setRoleFilter("all")}
                    style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        background: roleFilter === "all" ? "var(--color-primary)" : "transparent",
                        color: roleFilter === "all" ? "white" : "var(--color-text-secondary)",
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                    }}
                >
                    All
                </button>
                {Object.entries(roleLabels).map(([role, label]) => (
                    <button
                        key={role}
                        onClick={() => setRoleFilter(role)}
                        style={{
                            padding: "0.5rem 0.75rem",
                            borderRadius: "8px",
                            border: `1px solid ${roleFilter === role ? roleColors[role] : "var(--color-border)"}`,
                            background: roleFilter === role ? `${roleColors[role]}15` : "transparent",
                            color: roleFilter === role ? roleColors[role] : "var(--color-text-secondary)",
                            fontSize: "0.8125rem",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Staff List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {filteredStaff.length === 0 ? (
                    <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                        No staff members found
                    </div>
                ) : (
                    filteredStaff.map((member) => (
                        <StaffCard key={member.id} staff={member} onViewDetails={onViewDetails} />
                    ))
                )}
            </div>
        </div>
    );
}
