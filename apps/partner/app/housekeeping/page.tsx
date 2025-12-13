import { redirect } from "next/navigation";
import Link from "next/link";
import { MdCleaningServices, MdCheckCircle, MdPending, MdPlayArrow, MdTouchApp } from "react-icons/md";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getRoomsWithCleaningStatus, getTodaysTasks, getHousekeepingStats } from "../actions/housekeeping";
import { BottomNav } from "../components";
import { HousekeepingTaskCard } from "./HousekeepingTaskCard";
import { RoomStatusGrid } from "./RoomStatusGrid";

export const dynamic = 'force-dynamic';

export default async function HousekeepingPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    const [rooms, tasks, stats] = await Promise.all([
        getRoomsWithCleaningStatus(),
        getTodaysTasks(),
        getHousekeepingStats(),
    ]);

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <Link
                    href="/"
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                        marginBottom: "0.5rem",
                    }}
                >
                    ←
                </Link>
                <h1 className="page-title">Housekeeping</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Room cleaning & maintenance
                </p>
            </header>

            <main>
                {/* Stats Cards */}
                {stats && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "0.75rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <div className="card stat-card" style={{ padding: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                <MdPending style={{ color: "var(--color-warning)" }} />
                                <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>{stats.pending}</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Pending</div>
                        </div>
                        <div className="card stat-card" style={{ padding: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                <MdPlayArrow style={{ color: "var(--color-primary)" }} />
                                <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>{stats.inProgress}</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>In Progress</div>
                        </div>
                        <div className="card stat-card" style={{ padding: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                <MdCheckCircle style={{ color: "var(--color-success)" }} />
                                <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>{stats.completed}</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Done</div>
                        </div>
                        <div className="card stat-card" style={{ padding: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                <MdCleaningServices style={{ color: "var(--color-error)" }} />
                                <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>{stats.dirtyRooms}</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Dirty</div>
                        </div>
                    </div>
                )}

                {/* Room Status Grid */}
                <section style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Room Status</h2>
                        <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            <MdTouchApp style={{ verticalAlign: "middle" }} /> Tap to create task
                        </span>
                    </div>
                    <RoomStatusGrid rooms={rooms} />
                </section>

                {/* Today's Tasks */}
                <section>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Today&apos;s Tasks ({tasks.length})
                    </h2>

                    {tasks.length === 0 ? (
                        <div
                            className="card"
                            style={{
                                padding: "2rem",
                                textAlign: "center",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            <MdCleaningServices style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.5 }} />
                            <p>No tasks for today</p>
                            <p style={{ fontSize: "0.875rem" }}>Tap a room above to create a task</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {tasks.map((task) => (
                                <HousekeepingTaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <BottomNav role={roleInfo.role} />
        </>
    );
}
