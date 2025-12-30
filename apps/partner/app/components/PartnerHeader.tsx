"use client";

import { signOut } from "next-auth/react";

import Link from "next/link";
import { useState } from "react";
import { FiSearch, FiHelpCircle, FiChevronDown, FiSettings, FiLogOut, FiUser } from "react-icons/fi";
import { HotelSwitcher } from "./HotelSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";

interface PartnerHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    hotel: any;
    allHotels: any[];
}

export function PartnerHeader({ user, hotel, allHotels }: PartnerHeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="oyo-header">
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>
                {/* Logo */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontWeight: 800,
                    fontSize: "1.25rem",
                    color: "#e63946",
                    minWidth: "180px",
                    whiteSpace: "nowrap"
                }}>
                    <span style={{ fontSize: "1.5rem" }}>●</span>
                    ZinuRooms OS
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <HotelSwitcher currentHotel={hotel} hotels={allHotels} />
                </div>
            </div>

            {/* Search - Hidden on mobile */}
            <div className="oyo-search hidden md:flex">
                <FiSearch size={16} color="#9ca3af" />
                <input type="text" placeholder="Search Bookings" />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0, marginLeft: "auto" }}>
                <Link href="/walkin" className="oyo-new-booking-btn hidden sm:block" style={{ whiteSpace: "nowrap" }}>
                    New Booking
                </Link>

                <div className="oyo-header-actions relative">
                    <ThemeToggle />
                    <NotificationBell />
                    <Link href="/help" className="oyo-header-icon hidden md:flex">
                        <FiHelpCircle size={18} />
                    </Link>
                    <Link href="/settings" className="oyo-header-icon hidden md:flex">
                        <FiSettings size={18} />
                    </Link>

                    {/* Profile Dropdown Trigger */}
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", maxWidth: "160px", position: "relative" }}
                    >
                        <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "#e63946",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            flexShrink: 0
                        }}>
                            {user.name?.charAt(0) || "U"}
                        </div>
                        <span className="hidden sm:block" style={{
                            fontSize: "0.875rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100px"
                        }}>
                            Hi, {user.name?.split(" ")[0]}
                        </span>
                        <FiChevronDown size={14} style={{ flexShrink: 0 }} />
                    </div>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>

                            <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <FiUser size={16} />
                                Profile
                            </Link>
                            <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <FiSettings size={16} />
                                Settings
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                            >
                                <FiLogOut size={16} />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
