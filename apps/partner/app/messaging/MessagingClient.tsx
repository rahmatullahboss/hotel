"use client";

import { useState } from "react";
import { FiEdit2, FiToggleLeft, FiToggleRight, FiSend, FiChevronDown, FiChevronUp, FiCheck, FiClock, FiAlertCircle } from "react-icons/fi";
import { updateAutomationSettings, sendCustomMessage } from "../actions/messaging";
import type { AutomationSettings, MessageTemplate, GuestMessage } from "../actions/messaging";

interface MessagingClientProps {
    settings: AutomationSettings;
    templates: MessageTemplate[];
    messages: GuestMessage[];
    upcomingCheckIns: {
        bookingId: string;
        guestName: string;
        guestEmail: string;
        checkIn: Date;
        hoursUntilCheckIn: number;
    }[];
    hotelName: string;
}



export default function MessagingClient({
    settings: initialSettings,
    templates,
    messages,
    upcomingCheckIns,
}: MessagingClientProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [activeTab, setActiveTab] = useState<"automation" | "templates" | "history">("automation");
    const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
    const [sendingTo, setSendingTo] = useState<string | null>(null);

    const handleToggle = async (key: keyof AutomationSettings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        await updateAutomationSettings(newSettings);
    };

    const handleSendMessage = async (bookingId: string) => {
        setSendingTo(bookingId);
        await sendCustomMessage(bookingId, "Your stay is coming up!", "We're excited to welcome you!");
        setSendingTo(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "SENT":
                return (
                    <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <FiCheck size={12} /> Sent
                    </span>
                );
            case "PENDING":
                return (
                    <span className="badge badge-warning" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <FiClock size={12} /> Pending
                    </span>
                );
            case "FAILED":
                return (
                    <span className="badge badge-error" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <FiAlertCircle size={12} /> Failed
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {/* Tab Navigation */}
            <div
                style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1.5rem",
                    borderBottom: "1px solid var(--color-border)",
                    paddingBottom: "0.5rem",
                }}
            >
                {[
                    { key: "automation", label: "Automation" },
                    { key: "templates", label: "Templates" },
                    { key: "history", label: "History" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as "automation" | "templates" | "history")}
                        style={{
                            flex: 1,
                            padding: "0.75rem",
                            borderRadius: "0.5rem 0.5rem 0 0",
                            border: "none",
                            background: activeTab === tab.key ? "var(--color-primary)" : "transparent",
                            color: activeTab === tab.key ? "white" : "var(--color-text-secondary)",
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            cursor: "pointer",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Automation Tab */}
            {activeTab === "automation" && (
                <section className="glass-card" style={{ padding: "1rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Automation Settings
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {/* Pre-Arrival */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.75rem",
                                background: "var(--color-bg-secondary)",
                                borderRadius: "0.5rem",
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 500 }}>Pre-Arrival Message</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                    Sent {settings.preArrivalHours}h before check-in
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle("preArrivalEnabled")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "1.5rem",
                                    color: settings.preArrivalEnabled ? "var(--color-success)" : "var(--color-text-muted)",
                                }}
                            >
                                {settings.preArrivalEnabled ? <FiToggleRight /> : <FiToggleLeft />}
                            </button>
                        </div>

                        {/* Welcome Message */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.75rem",
                                background: "var(--color-bg-secondary)",
                                borderRadius: "0.5rem",
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 500 }}>Welcome Message</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                    Sent at check-in
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle("welcomeMessageEnabled")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "1.5rem",
                                    color: settings.welcomeMessageEnabled ? "var(--color-success)" : "var(--color-text-muted)",
                                }}
                            >
                                {settings.welcomeMessageEnabled ? <FiToggleRight /> : <FiToggleLeft />}
                            </button>
                        </div>

                        {/* Post-Stay */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.75rem",
                                background: "var(--color-bg-secondary)",
                                borderRadius: "0.5rem",
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 500 }}>Post-Stay Feedback</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                    Sent {settings.postStayHours}h after check-out
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle("postStayEnabled")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "1.5rem",
                                    color: settings.postStayEnabled ? "var(--color-success)" : "var(--color-text-muted)",
                                }}
                            >
                                {settings.postStayEnabled ? <FiToggleRight /> : <FiToggleLeft />}
                            </button>
                        </div>
                    </div>

                    {/* Upcoming Check-ins */}
                    {upcomingCheckIns.length > 0 && (
                        <div style={{ marginTop: "1.5rem" }}>
                            <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                                Upcoming Check-ins ({upcomingCheckIns.length})
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {upcomingCheckIns.slice(0, 5).map((checkin) => (
                                    <div
                                        key={checkin.bookingId}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "0.75rem",
                                            background: "var(--color-bg-secondary)",
                                            borderRadius: "0.5rem",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                                                {checkin.guestName}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                In {checkin.hoursUntilCheckIn}h
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-accent"
                                            disabled={sendingTo === checkin.bookingId}
                                            onClick={() => handleSendMessage(checkin.bookingId)}
                                            style={{ fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
                                        >
                                            {sendingTo === checkin.bookingId ? "Sending..." : <><FiSend size={12} /> Send</>}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Templates Tab */}
            {activeTab === "templates" && (
                <section className="glass-card" style={{ padding: "1rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Message Templates
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                style={{
                                    borderRadius: "0.5rem",
                                    border: "1px solid var(--color-border)",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    onClick={() =>
                                        setExpandedTemplate(
                                            expandedTemplate === template.id ? null : template.id
                                        )
                                    }
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "0.75rem",
                                        background: "var(--color-bg-secondary)",
                                        cursor: "pointer",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span
                                            style={{
                                                width: "8px",
                                                height: "8px",
                                                borderRadius: "50%",
                                                background: template.isActive
                                                    ? "var(--color-success)"
                                                    : "var(--color-text-muted)",
                                            }}
                                        />
                                        <div style={{ fontWeight: 500 }}>{template.name}</div>
                                    </div>
                                    {expandedTemplate === template.id ? (
                                        <FiChevronUp />
                                    ) : (
                                        <FiChevronDown />
                                    )}
                                </div>

                                {expandedTemplate === template.id && (
                                    <div style={{ padding: "1rem", fontSize: "0.875rem" }}>
                                        <div style={{ marginBottom: "0.75rem" }}>
                                            <strong>Subject:</strong>
                                            <div style={{ color: "var(--color-text-secondary)" }}>
                                                {template.subject}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: "1rem" }}>
                                            <strong>Body:</strong>
                                            <pre
                                                style={{
                                                    background: "var(--color-bg-secondary)",
                                                    padding: "0.75rem",
                                                    borderRadius: "0.5rem",
                                                    fontSize: "0.75rem",
                                                    whiteSpace: "pre-wrap",
                                                    fontFamily: "inherit",
                                                    marginTop: "0.25rem",
                                                }}
                                            >
                                                {template.body}
                                            </pre>
                                        </div>
                                        <button
                                            className="btn btn-outline"
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            <FiEdit2 size={12} /> Edit Template
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
                <section className="glass-card" style={{ padding: "1rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Message History
                    </h3>

                    {messages.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "2rem",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
                            <p>No messages sent yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "0.75rem",
                                        background: "var(--color-bg-secondary)",
                                        borderRadius: "0.5rem",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                                            {message.guestName}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                            {message.subject}
                                        </div>
                                    </div>
                                    {getStatusBadge(message.status)}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </>
    );
}
