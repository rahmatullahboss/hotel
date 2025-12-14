"use client";

import { useState } from "react";
import { MdSend } from "react-icons/md";
import { broadcastToAllPartners } from "../actions/notifications";

export function BroadcastForm() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !body.trim()) {
            alert("Title and message are required");
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const response = await broadcastToAllPartners({
                title,
                body,
                url: url || undefined,
                icon: "/icon-192x192.png",
            });

            if (response.success) {
                setResult({ sent: response.sent, failed: response.failed });
                if (response.sent > 0) {
                    setTitle("");
                    setBody("");
                    setUrl("");
                }
            } else {
                alert(response.error || "Failed to send notifications");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to send notifications");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.375rem", fontSize: "0.875rem" }}>
                    Title *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 🎉 New Feature Announcement"
                    required
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                    }}
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.375rem", fontSize: "0.875rem" }}>
                    Message *
                </label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your notification message here..."
                    required
                    rows={4}
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        resize: "vertical",
                    }}
                />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.375rem", fontSize: "0.875rem" }}>
                    Link URL (optional)
                </label>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/page"
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                    }}
                />
                <p style={{ margin: "0.375rem 0 0 0", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Users will be redirected to this URL when they click the notification
                </p>
            </div>

            {result && (
                <div style={{
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    borderRadius: "8px",
                    backgroundColor: result.sent > 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                }}>
                    <p style={{ margin: 0, fontSize: "0.875rem" }}>
                        ✅ Sent: <strong>{result.sent}</strong>
                        {result.failed > 0 && (
                            <span style={{ marginLeft: "1rem", color: "#ef4444" }}>
                                ❌ Failed: <strong>{result.failed}</strong>
                            </span>
                        )}
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                style={{
                    width: "100%",
                    padding: "0.875rem",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    opacity: isLoading ? 0.7 : 1,
                }}
            >
                <MdSend />
                {isLoading ? "Sending..." : "Send to All Partners"}
            </button>
        </form>
    );
}

export default BroadcastForm;
