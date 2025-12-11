export default function SettingsPage() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage admin panel configuration</p>
            </div>

            <div className="card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* General Settings Section */}
                    <section>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            General Settings
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--color-bg-secondary)", borderRadius: "0.5rem" }}>
                                <div>
                                    <p style={{ fontWeight: 500 }}>Site Name</p>
                                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        Vibe Hospitality Network
                                    </p>
                                </div>
                                <button className="btn btn-outline btn-sm">Edit</button>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--color-bg-secondary)", borderRadius: "0.5rem" }}>
                                <div>
                                    <p style={{ fontWeight: 500 }}>Default Currency</p>
                                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        BDT (Bangladeshi Taka)
                                    </p>
                                </div>
                                <button className="btn btn-outline btn-sm">Edit</button>
                            </div>
                        </div>
                    </section>

                    {/* Notification Settings */}
                    <section>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Notifications
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--color-bg-secondary)", borderRadius: "0.5rem" }}>
                                <div>
                                    <p style={{ fontWeight: 500 }}>Email Notifications</p>
                                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        Receive email alerts for new bookings and hotel registrations
                                    </p>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--color-bg-secondary)", borderRadius: "0.5rem" }}>
                                <div>
                                    <p style={{ fontWeight: 500 }}>Push Notifications</p>
                                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        Browser push notifications for urgent updates
                                    </p>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* API & Integrations */}
                    <section>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            API & Integrations
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--color-bg-secondary)", borderRadius: "0.5rem" }}>
                                <div>
                                    <p style={{ fontWeight: 500 }}>bKash Payment Gateway</p>
                                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        Status: <span style={{ color: "var(--color-success)" }}>Connected</span>
                                    </p>
                                </div>
                                <button className="btn btn-outline btn-sm">Configure</button>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--color-bg-secondary)", borderRadius: "0.5rem" }}>
                                <div>
                                    <p style={{ fontWeight: 500 }}>Email Service (Resend)</p>
                                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        Status: <span style={{ color: "var(--color-success)" }}>Connected</span>
                                    </p>
                                </div>
                                <button className="btn btn-outline btn-sm">Configure</button>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-error)" }}>
                            Danger Zone
                        </h2>
                        <div style={{ border: "1px solid var(--color-error)", borderRadius: "0.5rem", padding: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ fontWeight: 500 }}>Clear Cache</p>
                                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        Clear all cached data and force refresh
                                    </p>
                                </div>
                                <button className="btn btn-outline btn-sm" style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}>
                                    Clear Cache
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
