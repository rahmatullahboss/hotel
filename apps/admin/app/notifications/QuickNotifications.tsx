"use client";

import { useState } from "react";
import { MdCelebration, MdUpdate, MdWarning, MdInfo, MdPhoneAndroid } from "react-icons/md";
import { broadcastToAllPartners, sendTestNotification, broadcastToAllMobileUsers } from "../actions/notifications";

const QUICK_TEMPLATES = [
    {
        icon: <MdCelebration />,
        title: "🎉 New Feature",
        body: "We've added exciting new features to help you manage your hotel better!",
        color: "#8b5cf6",
    },
    {
        icon: <MdUpdate />,
        title: "🔄 System Update",
        body: "The platform will undergo maintenance tonight. Please save your work.",
        color: "#3b82f6",
    },
    {
        icon: <MdWarning />,
        title: "⚠️ Important Notice",
        body: "Please review the updated terms and conditions in your settings.",
        color: "#f59e0b",
    },
    {
        icon: <MdInfo />,
        title: "💡 Tip of the Day",
        body: "Did you know? You can export your earnings report as PDF!",
        color: "#06b6d4",
    },
];

export function QuickNotifications() {
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [testLoading, setTestLoading] = useState(false);
    const [mobileLoading, setMobileLoading] = useState(false);

    const handleQuickSend = async (index: number) => {
        const template = QUICK_TEMPLATES[index];
        if (!template) return;

        if (!confirm(`Send "${template.title}" to all partners?`)) return;

        setLoadingIndex(index);
        try {
            const result = await broadcastToAllPartners({
                title: template.title,
                body: template.body,
                icon: "/icon-192x192.png",
            });

            if (result.success) {
                alert(`Sent to ${result.sent} devices`);
            } else {
                alert(result.error || "Failed to send");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to send notification");
        } finally {
            setLoadingIndex(null);
        }
    };

    const handleTestNotification = async () => {
        setTestLoading(true);
        try {
            const result = await sendTestNotification();
            if (result.success) {
                alert(`Test sent to ${result.sent} devices`);
            } else {
                alert(result.error || "Failed to send test");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to send test notification");
        } finally {
            setTestLoading(false);
        }
    };

    const handleMobileNotification = async () => {
        const title = prompt("Notification Title:", "🎁 Special Offer!");
        if (!title) return;

        const body = prompt("Notification Body:", "Get 20% off on your next booking!");
        if (!body) return;

        setMobileLoading(true);
        try {
            const result = await broadcastToAllMobileUsers({ title, body });
            if (result.success) {
                alert(`✅ Sent to ${result.sent} mobile devices (${result.failed} failed)`);
            } else {
                alert(result.error || "Failed to send");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to send mobile notification");
        } finally {
            setMobileLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Send to Mobile Apps - Primary Action */}
            <button
                type="button"
                onClick={handleMobileNotification}
                disabled={mobileLoading}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "1rem",
                    border: "none",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #E63946 0%, #c62f3c 100%)",
                    color: "white",
                    cursor: mobileLoading ? "not-allowed" : "pointer",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    opacity: mobileLoading ? 0.7 : 1,
                }}
            >
                <MdPhoneAndroid size={20} />
                {mobileLoading ? "Sending..." : "📱 Send to Mobile Apps"}
            </button>

            <hr style={{ margin: "0.5rem 0", border: "none", borderTop: "1px solid var(--color-border)" }} />

            {QUICK_TEMPLATES.map((template, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => handleQuickSend(index)}
                    disabled={loadingIndex === index}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        background: "var(--color-bg-secondary)",
                        cursor: loadingIndex === index ? "not-allowed" : "pointer",
                        textAlign: "left",
                        opacity: loadingIndex === index ? 0.5 : 1,
                    }}
                >
                    <span style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: `${template.color}20`,
                        color: template.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                    }}>
                        {template.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{template.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            {template.body.substring(0, 50)}...
                        </div>
                    </div>
                </button>
            ))}

            <hr style={{ margin: "0.5rem 0", border: "none", borderTop: "1px solid var(--color-border)" }} />

            <button
                type="button"
                onClick={handleTestNotification}
                disabled={testLoading}
                style={{
                    padding: "0.75rem",
                    border: "1px dashed var(--color-border)",
                    borderRadius: "8px",
                    background: "transparent",
                    cursor: testLoading ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                }}
            >
                {testLoading ? "Sending..." : "🧪 Send Test Notification"}
            </button>
        </div>
    );
}

export default QuickNotifications;

