"use client";

import { useState } from "react";
import { MdCleaningServices, MdBuild, MdSearch } from "react-icons/md";
import { createTask } from "../actions/housekeeping";

type CleaningStatus = "CLEAN" | "DIRTY" | "INSPECTED" | "OUT_OF_ORDER";

interface Room {
    id: string;
    roomNumber: string;
    roomName: string | null;
    type: string | null;
    status: CleaningStatus;
    lastCleanedAt?: Date | null;
}

interface RoomStatusGridProps {
    rooms: Room[];
}

export function RoomStatusGrid({ rooms }: RoomStatusGridProps) {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const getStatusColor = (status: CleaningStatus) => {
        switch (status) {
            case "CLEAN":
                return "#22c55e";
            case "INSPECTED":
                return "#3b82f6";
            case "DIRTY":
                return "#ef4444";
            case "OUT_OF_ORDER":
                return "#6b7280";
            default:
                return "#94a3b8";
        }
    };

    const getStatusBg = (status: CleaningStatus) => {
        switch (status) {
            case "CLEAN":
                return "rgba(34, 197, 94, 0.1)";
            case "INSPECTED":
                return "rgba(59, 130, 246, 0.1)";
            case "DIRTY":
                return "rgba(239, 68, 68, 0.1)";
            case "OUT_OF_ORDER":
                return "rgba(107, 114, 128, 0.1)";
            default:
                return "var(--color-bg-secondary)";
        }
    };

    const handleCreateTask = async (type: "CHECKOUT_CLEAN" | "MAINTENANCE" | "INSPECTION") => {
        if (!selectedRoom) return;

        setIsCreating(true);
        try {
            await createTask({
                roomId: selectedRoom.id,
                type,
                priority: type === "MAINTENANCE" ? "HIGH" : "NORMAL",
            });
            setSelectedRoom(null);
        } catch (error) {
            console.error("Error creating task:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <div className="room-grid">
                {rooms.map((room) => (
                    <button
                        key={room.id}
                        type="button"
                        className="room-card"
                        onClick={() => setSelectedRoom(room)}
                        style={{
                            background: getStatusBg(room.status),
                            borderColor: getStatusColor(room.status),
                        }}
                    >
                        <div className="room-number">{room.roomNumber}</div>
                        <div
                            className="room-status-dot"
                            style={{ background: getStatusColor(room.status) }}
                        />
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div className="status-legend">
                <span><span className="legend-dot" style={{ background: "#22c55e" }} /> Clean</span>
                <span><span className="legend-dot" style={{ background: "#3b82f6" }} /> Inspected</span>
                <span><span className="legend-dot" style={{ background: "#ef4444" }} /> Dirty</span>
                <span><span className="legend-dot" style={{ background: "#6b7280" }} /> Out of Order</span>
            </div>

            {/* Task Creation Modal */}
            {selectedRoom && (
                <>
                    <div
                        className="modal-backdrop"
                        onClick={() => setSelectedRoom(null)}
                        onKeyDown={(e) => e.key === "Escape" && setSelectedRoom(null)}
                        role="presentation"
                    />
                    <div className="task-modal">
                        <h3>Create Task for Room {selectedRoom.roomNumber}</h3>
                        <p className="modal-subtitle">
                            Current status: <strong>{selectedRoom.status}</strong>
                        </p>
                        <div className="task-options">
                            <button
                                type="button"
                                className="task-option"
                                onClick={() => handleCreateTask("CHECKOUT_CLEAN")}
                                disabled={isCreating}
                            >
                                <MdCleaningServices />
                                <span>Cleaning</span>
                            </button>
                            <button
                                type="button"
                                className="task-option"
                                onClick={() => handleCreateTask("MAINTENANCE")}
                                disabled={isCreating}
                            >
                                <MdBuild />
                                <span>Maintenance</span>
                            </button>
                            <button
                                type="button"
                                className="task-option"
                                onClick={() => handleCreateTask("INSPECTION")}
                                disabled={isCreating}
                            >
                                <MdSearch />
                                <span>Inspection</span>
                            </button>
                        </div>
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => setSelectedRoom(null)}
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}

            <style jsx>{`
                .room-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
                    gap: 0.5rem;
                }
                .room-card {
                    aspect-ratio: 1;
                    border-radius: 0.5rem;
                    border: 2px solid;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.25rem;
                    cursor: pointer;
                    transition: transform 0.15s ease;
                }
                .room-card:hover {
                    transform: scale(1.05);
                }
                .room-number {
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                .room-status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .status-legend {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    margin-top: 1rem;
                    font-size: 0.75rem;
                    color: var(--color-text-secondary);
                }
                .status-legend span {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .legend-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                }
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 100;
                }
                .task-modal {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: var(--color-bg-primary);
                    border-radius: 1.5rem 1.5rem 0 0;
                    padding: 1.5rem;
                    z-index: 101;
                    animation: slideUp 0.2s ease;
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .task-modal h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                .modal-subtitle {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 1.25rem;
                }
                .task-options {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .task-option {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    background: var(--color-bg-secondary);
                    border: none;
                    cursor: pointer;
                    font-size: 0.875rem;
                    color: var(--color-text-primary);
                    transition: background 0.15s ease;
                }
                .task-option:hover:not(:disabled) {
                    background: var(--color-primary);
                    color: white;
                }
                .task-option:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .task-option :global(svg) {
                    font-size: 1.5rem;
                }
                .btn-cancel {
                    width: 100%;
                    padding: 0.875rem;
                    border: none;
                    background: transparent;
                    color: var(--color-text-secondary);
                    font-size: 0.875rem;
                    cursor: pointer;
                }
            `}</style>
        </>
    );
}

export default RoomStatusGrid;
