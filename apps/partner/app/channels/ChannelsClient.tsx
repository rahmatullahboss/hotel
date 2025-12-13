"use client";

import { useState } from "react";
import { MdSync, MdFileDownload, MdWarning } from "react-icons/md";
import { connectChannel, disconnectChannel, syncChannel, pullChannelBookings } from "../actions/channels";

type ChannelType = "BOOKING_COM" | "EXPEDIA" | "AGODA" | "SHARETRIP" | "GOZAYAAN";

interface Channel {
    type: ChannelType;
    name: string;
    logo: string;
    logoColor?: string;
    description: string;
    status: "available" | "coming_soon";
}

interface Connection {
    id: string;
    channelType: string;
    isActive: boolean;
    lastSyncAt: Date | null;
    syncStatus: string | null;
    syncError: string | null;
    externalPropertyId: string | null;
}

interface Room {
    id: string;
    name: string;
    roomType: string;
    roomNumber: string;
}

interface ChannelsClientProps {
    channels: Channel[];
    connections: Connection[];
    rooms: Room[];
}

export default function ChannelsClient({ channels, connections, rooms }: ChannelsClientProps) {
    const [showModal, setShowModal] = useState<ChannelType | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state for connection
    const [credentials, setCredentials] = useState({
        apiKey: "",
        propertyId: "",
        apiSecret: "",
    });

    const handleConnect = async () => {
        if (!showModal) return;
        setLoading("connect");
        setError(null);

        const result = await connectChannel(showModal, credentials);

        if (result.success) {
            setShowModal(null);
            setCredentials({ apiKey: "", propertyId: "", apiSecret: "" });
        } else {
            setError(result.error || "Failed to connect");
        }

        setLoading(null);
    };

    const handleDisconnect = async (connectionId: string) => {
        if (!confirm("Are you sure you want to disconnect this channel?")) return;

        setLoading(connectionId);
        await disconnectChannel(connectionId);
        setLoading(null);
    };

    const handleSync = async (connectionId: string) => {
        setLoading(`sync-${connectionId}`);
        const result = await syncChannel(connectionId);

        if (!result.success) {
            alert(result.errorMessage || "Sync failed");
        }

        setLoading(null);
    };

    const handlePullBookings = async (connectionId: string) => {
        setLoading(`pull-${connectionId}`);
        const result = await pullChannelBookings(connectionId);

        if (result.success) {
            alert(`Pulled ${result.bookingsCreated} new bookings`);
        } else {
            alert(result.error || "Failed to pull bookings");
        }

        setLoading(null);
    };

    const getConnection = (channelType: ChannelType) => {
        return connections.find((c) => c.channelType === channelType);
    };

    return (
        <>
            {/* Channel Cards */}
            <section>
                <h2 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    color: "var(--color-text-primary)",
                }}>
                    Available Channels
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {channels.map((channel) => {
                        const connection = getConnection(channel.type);
                        const isConnected = connection?.isActive;
                        const isAvailable = channel.status === "available";

                        return (
                            <div
                                key={channel.type}
                                className="card"
                                style={{
                                    padding: "1rem",
                                    opacity: isAvailable ? 1 : 0.6,
                                    borderLeft: isConnected ? "4px solid var(--color-success)" : undefined,
                                }}
                            >
                                {/* Header */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "0.75rem",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <span style={{
                                            fontSize: "1.5rem",
                                            width: "36px",
                                            height: "36px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "50%",
                                            backgroundColor: channel.logoColor || "var(--color-primary)",
                                            color: "white",
                                            fontWeight: "bold"
                                        }}>{channel.logo}</span>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{channel.name}</div>
                                            <div style={{
                                                fontSize: "0.75rem",
                                                color: "var(--color-text-secondary)",
                                            }}>
                                                {channel.description}
                                            </div>
                                        </div>
                                    </div>

                                    {isConnected ? (
                                        <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>
                                            ✓ Connected
                                        </span>
                                    ) : !isAvailable ? (
                                        <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>
                                            Coming Soon
                                        </span>
                                    ) : null}
                                </div>

                                {/* Connection Details */}
                                {isConnected && connection && (
                                    <div style={{
                                        background: "var(--color-bg-secondary)",
                                        padding: "0.75rem",
                                        borderRadius: "0.5rem",
                                        marginBottom: "0.75rem",
                                        fontSize: "0.8125rem",
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: "0.25rem",
                                        }}>
                                            <span style={{ color: "var(--color-text-secondary)" }}>
                                                Property ID:
                                            </span>
                                            <span style={{ fontFamily: "monospace" }}>
                                                {connection.externalPropertyId || "N/A"}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: "0.25rem",
                                        }}>
                                            <span style={{ color: "var(--color-text-secondary)" }}>
                                                Last Sync:
                                            </span>
                                            <span>
                                                {connection.lastSyncAt
                                                    ? new Date(connection.lastSyncAt).toLocaleString()
                                                    : "Never"}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--color-text-secondary)" }}>
                                                Status:
                                            </span>
                                            <span style={{
                                                color: connection.syncStatus === "ERROR"
                                                    ? "var(--color-error)"
                                                    : connection.syncStatus === "SYNCING"
                                                        ? "var(--color-warning)"
                                                        : "var(--color-success)",
                                            }}>
                                                {connection.syncStatus || "Idle"}
                                            </span>
                                        </div>
                                        {connection.syncError && (
                                            <div style={{
                                                marginTop: "0.5rem",
                                                padding: "0.5rem",
                                                background: "rgba(208, 0, 0, 0.1)",
                                                borderRadius: "0.25rem",
                                                color: "var(--color-error)",
                                                fontSize: "0.75rem",
                                            }}>
                                                <MdWarning style={{ display: "inline", verticalAlign: "middle" }} /> {connection.syncError}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    {isConnected && connection ? (
                                        <>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleSync(connection.id)}
                                                disabled={loading === `sync-${connection.id}`}
                                                style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                            >
                                                {loading === `sync-${connection.id}` ? "Syncing..." : <><MdSync style={{ display: "inline", verticalAlign: "middle" }} /> Sync Now</>}
                                            </button>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => handlePullBookings(connection.id)}
                                                disabled={loading === `pull-${connection.id}`}
                                                style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                            >
                                                {loading === `pull-${connection.id}` ? "Pulling..." : <><MdFileDownload style={{ display: "inline", verticalAlign: "middle" }} /> Pull Bookings</>}
                                            </button>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => handleDisconnect(connection.id)}
                                                disabled={loading === connection.id}
                                                style={{
                                                    fontSize: "0.75rem",
                                                    padding: "0.5rem 1rem",
                                                    color: "var(--color-error)",
                                                    borderColor: "var(--color-error)",
                                                }}
                                            >
                                                {loading === connection.id ? "..." : "Disconnect"}
                                            </button>
                                        </>
                                    ) : isAvailable ? (
                                        <button
                                            className="btn btn-accent"
                                            onClick={() => setShowModal(channel.type)}
                                            style={{ fontSize: "0.75rem", padding: "0.5rem 1rem", width: "100%" }}
                                        >
                                            Connect to {channel.name}
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-outline"
                                            disabled
                                            style={{ fontSize: "0.75rem", padding: "0.5rem 1rem", width: "100%", opacity: 0.5 }}
                                        >
                                            Coming Soon
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Connection Modal */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowModal(null)}
                >
                    <div
                        className="card"
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            padding: "1.5rem",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{
                            fontSize: "1.25rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                        }}>
                            Connect to {channels.find((c) => c.type === showModal)?.name}
                        </h2>
                        <p style={{
                            fontSize: "0.875rem",
                            color: "var(--color-text-secondary)",
                            marginBottom: "1.5rem",
                        }}>
                            Enter your API credentials to connect your property.
                        </p>

                        {error && (
                            <div style={{
                                padding: "0.75rem",
                                background: "rgba(208, 0, 0, 0.1)",
                                borderRadius: "0.5rem",
                                color: "var(--color-error)",
                                marginBottom: "1rem",
                                fontSize: "0.875rem",
                            }}>
                                <MdWarning style={{ display: "inline", verticalAlign: "middle" }} /> {error}
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    Property ID *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Your OTA property ID"
                                    value={credentials.propertyId}
                                    onChange={(e) => setCredentials({ ...credentials, propertyId: e.target.value })}
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    API Key *
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Your API key"
                                    value={credentials.apiKey}
                                    onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    API Secret (optional)
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Your API secret"
                                    value={credentials.apiSecret}
                                    onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowModal(null)}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-accent"
                                onClick={handleConnect}
                                disabled={loading === "connect" || !credentials.apiKey || !credentials.propertyId}
                                style={{ flex: 1 }}
                            >
                                {loading === "connect" ? "Connecting..." : "Connect"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
