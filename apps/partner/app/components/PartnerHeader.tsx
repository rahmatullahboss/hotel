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
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            background: 'white',
            borderBottom: '1px solid #f3f4f6',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            height: '64px'
        }}>
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

            {/* Search */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 16px',
                flex: 1,
                maxWidth: '400px',
                margin: '0 24px'
            }}>
                <FiSearch size={16} color="#9ca3af" />
                <input 
                    type="text" 
                    placeholder="Search Bookings" 
                    style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '14px',
                        flex: 1
                    }}
                />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0, marginLeft: "auto" }}>
                <Link 
                    href="/walkin" 
                    style={{ 
                        whiteSpace: "nowrap",
                        background: '#e63946',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        textDecoration: 'none'
                    }}
                >
                    New Booking
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                    <ThemeToggle />
                    <NotificationBell />
                    <Link 
                        href="/help" 
                        style={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#6b7280',
                            textDecoration: 'none'
                        }}
                    >
                        <FiHelpCircle size={18} />
                    </Link>
                    <Link 
                        href="/settings" 
                        style={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#6b7280',
                            textDecoration: 'none'
                        }}
                    >
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
                        <span style={{
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
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '8px',
                            width: '192px',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                            border: '1px solid #e5e7eb',
                            padding: '4px 0',
                            zIndex: 50
                        }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>{user.name}</p>
                                <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                            </div>

                            <Link 
                                href="/profile" 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '8px 16px', 
                                    fontSize: '14px', 
                                    color: '#374151',
                                    textDecoration: 'none'
                                }}
                            >
                                <FiUser size={16} />
                                Profile
                            </Link>
                            <Link 
                                href="/settings" 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '8px 16px', 
                                    fontSize: '14px', 
                                    color: '#374151',
                                    textDecoration: 'none'
                                }}
                            >
                                <FiSettings size={16} />
                                Settings
                            </Link>
                            <div style={{ borderTop: '1px solid #f3f4f6', margin: '4px 0' }}></div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    color: '#dc2626',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
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
