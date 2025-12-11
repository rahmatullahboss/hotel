import { Suspense } from "react";
import { getUserStats, getUsersWithDetails } from "@/actions/users";
import { UsersPageClient } from "./UsersPageClient";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const search = typeof params.search === "string" ? params.search : "";
    const role = typeof params.role === "string" ? params.role : "";
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;

    const [stats, usersData] = await Promise.all([
        getUserStats(),
        getUsersWithDetails({ search, role, page, limit: 10 }),
    ]);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Users</h1>
                    <p className="page-subtitle">{stats.total} users total • {stats.newThisMonth} new this month</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
                <div className="card stat-card">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{stats.total}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Travelers</div>
                    <div className="stat-value">{stats.travelers}</div>
                    <div className="stat-subtext">Regular customers</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Hotel Owners</div>
                    <div className="stat-value">{stats.hotelOwners}</div>
                    <div className="stat-subtext">Pending approval</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Partners</div>
                    <div className="stat-value">{stats.partners}</div>
                    <div className="stat-subtext">Active hotels</div>
                </div>
            </div>

            {/* Users Table with Search/Filter/Pagination */}
            <Suspense fallback={<div className="card" style={{ padding: "2rem", textAlign: "center" }}>Loading users...</div>}>
                <UsersPageClient initialData={usersData} />
            </Suspense>
        </div>
    );
}
