"use client";

import { FiGrid, FiCalendar, FiLayers } from "react-icons/fi";

type ViewMode = "grid" | "timeline" | "floor";

interface ViewToggleProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
    const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
        { mode: "grid", icon: <FiGrid size={16} />, label: "Grid" },
        { mode: "timeline", icon: <FiCalendar size={16} />, label: "Timeline" },
        { mode: "floor", icon: <FiLayers size={16} />, label: "Floor Plan" },
    ];

    return (
        <div
            style={{
                display: "flex",
                background: "var(--color-bg-secondary)",
                borderRadius: "0.75rem",
                padding: "4px",
                gap: "4px",
            }}
        >
            {views.map(({ mode, icon, label }) => (
                <button
                    key={mode}
                    onClick={() => onViewChange(mode)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "0.5rem",
                        border: "none",
                        background: currentView === mode
                            ? "var(--color-bg-primary)"
                            : "transparent",
                        color: currentView === mode
                            ? "var(--color-primary)"
                            : "var(--color-text-secondary)",
                        fontWeight: currentView === mode ? 600 : 400,
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: currentView === mode
                            ? "0 1px 3px rgba(0,0,0,0.1)"
                            : "none",
                    }}
                >
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}
