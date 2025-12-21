"use client";

import { useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiHome, FiWifi, FiDroplet, FiTv, FiSun, FiThermometer, FiSunrise, FiFeather } from "react-icons/fi";
import { MdBalcony, MdKitchen, MdWaves, MdLocationCity, MdBathtub, MdPool, MdWater, MdOutdoorGrill } from "react-icons/md";
import type { OnboardingData, RoomInput } from "../OnboardingWizard";

interface Props {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

const ROOM_TYPES = [
    { value: "SINGLE", label: "Single Room", defaultGuests: 1 },
    { value: "DOUBLE", label: "Double Room", defaultGuests: 2 },
    { value: "SUITE", label: "Suite", defaultGuests: 4 },
    { value: "DORMITORY", label: "Dormitory", defaultGuests: 6 },
] as const;

const ROOM_AMENITIES = [
    { name: "WiFi", icon: FiWifi },
    { name: "AC", icon: FiSun },
    { name: "TV", icon: FiTv },
    { name: "Attached Bathroom", icon: MdBathtub },
    { name: "Hot Water", icon: FiThermometer },
    { name: "Mini Fridge", icon: MdKitchen },
    { name: "Balcony", icon: MdBalcony },
    { name: "Sea View", icon: MdWaves },
    { name: "City View", icon: MdLocationCity },
    { name: "Hill View", icon: FiSunrise },
    { name: "Garden View", icon: FiFeather },
    { name: "Pool View", icon: MdPool },
    { name: "River View", icon: MdWater },
    { name: "Courtyard View", icon: MdOutdoorGrill },
];

const EMPTY_ROOM: RoomInput = {
    name: "",
    type: "DOUBLE",
    roomNumber: "",
    basePrice: "",
    maxGuests: 2,
    description: "",
    amenities: [],
};

// Inline style objects
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1.5rem',
    },
    heading: {
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#1d3557',
        marginBottom: '0.5rem',
    },
    description: {
        color: '#64748b',
        fontSize: '1rem',
        marginBottom: '1rem',
    },
    formCard: {
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
    },
    formTitle: {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#1d3557',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#334155',
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '0.75rem',
        fontSize: '1rem',
        background: 'white',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
    },
    select: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '0.75rem',
        fontSize: '1rem',
        background: 'white',
        cursor: 'pointer',
    },
    amenitiesGrid: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    amenityChip: (selected: boolean) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.5rem 0.875rem',
        borderRadius: '2rem',
        fontSize: '0.8125rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: selected ? '2px solid #1d3557' : '2px solid #e2e8f0',
        background: selected ? 'linear-gradient(135deg, #1d3557 0%, #2a4a7f 100%)' : 'white',
        color: selected ? 'white' : '#64748b',
        boxShadow: selected ? '0 4px 12px rgba(29, 53, 87, 0.2)' : 'none',
    }),
    textarea: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '2px solid #e2e8f0',
        borderRadius: '0.75rem',
        fontSize: '1rem',
        background: 'white',
        resize: 'vertical' as const,
        minHeight: '80px',
        fontFamily: 'inherit',
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e2e8f0',
    },
    btnCancel: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        background: 'white',
        border: '2px solid #e2e8f0',
        color: '#64748b',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    btnSave: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        background: '#1d3557',
        border: 'none',
        color: 'white',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(29, 53, 87, 0.25)',
    },
    addButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '1rem',
        fontSize: '1rem',
        fontWeight: 600,
        background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
        border: 'none',
        color: 'white',
        borderRadius: '0.75rem',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(230, 57, 70, 0.3)',
    },
    roomCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        background: 'white',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        marginBottom: '0.75rem',
    },
    roomInfo: {
        flex: 1,
    },
    roomName: {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#1d3557',
        marginBottom: '0.25rem',
    },
    roomDetails: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '0.5rem',
        fontSize: '0.8125rem',
    },
    roomTag: {
        background: '#f1f5f9',
        padding: '0.25rem 0.625rem',
        borderRadius: '0.375rem',
        color: '#64748b',
    },
    roomPrice: {
        background: '#dcfce7',
        padding: '0.25rem 0.625rem',
        borderRadius: '0.375rem',
        color: '#16a34a',
        fontWeight: 600,
    },
    roomActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    iconBtn: {
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0',
        background: 'white',
        cursor: 'pointer',
        color: '#64748b',
    },
    iconBtnDanger: {
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.5rem',
        border: '1px solid #fecaca',
        background: '#fef2f2',
        cursor: 'pointer',
        color: '#dc2626',
    },
    roomsCount: {
        textAlign: 'center' as const,
        color: '#64748b',
        fontSize: '0.875rem',
        marginTop: '1rem',
    },
};

export function RoomsStep({ data, updateData }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [currentRoom, setCurrentRoom] = useState<RoomInput>(EMPTY_ROOM);

    function handleAddRoom() {
        setCurrentRoom(EMPTY_ROOM);
        setIsAdding(true);
        setEditingIndex(null);
    }

    function handleEditRoom(index: number) {
        const room = data.rooms[index];
        if (!room) return;
        setCurrentRoom({
            name: room.name,
            type: room.type,
            roomNumber: room.roomNumber,
            basePrice: room.basePrice,
            maxGuests: room.maxGuests,
            description: room.description || "",
            amenities: [...room.amenities],
        });
        setEditingIndex(index);
        setIsAdding(true);
    }

    function handleSaveRoom() {
        if (!currentRoom.name || !currentRoom.roomNumber || !currentRoom.basePrice) {
            return;
        }

        const rooms = [...data.rooms];
        if (editingIndex !== null) {
            rooms[editingIndex] = currentRoom;
        } else {
            rooms.push(currentRoom);
        }
        updateData({ rooms });
        setIsAdding(false);
        setEditingIndex(null);
        setCurrentRoom(EMPTY_ROOM);
    }

    function handleDeleteRoom(index: number) {
        updateData({ rooms: data.rooms.filter((_, i) => i !== index) });
    }

    function handleCancel() {
        setIsAdding(false);
        setEditingIndex(null);
        setCurrentRoom(EMPTY_ROOM);
    }

    function toggleRoomAmenity(amenity: string) {
        const amenities = currentRoom.amenities.includes(amenity)
            ? currentRoom.amenities.filter((a) => a !== amenity)
            : [...currentRoom.amenities, amenity];
        setCurrentRoom({ ...currentRoom, amenities });
    }

    return (
        <div style={styles.container}>
            <div>
                <h2 style={styles.heading}>Add your rooms</h2>
                <p style={styles.description}>
                    Add different room types with their pricing. You can add more rooms later.
                </p>
            </div>

            {/* Room List */}
            {data.rooms.length > 0 && !isAdding && (
                <div>
                    {data.rooms.map((room, index) => (
                        <div key={index} style={styles.roomCard}>
                            <div style={styles.roomInfo}>
                                <h3 style={styles.roomName}>{room.name}</h3>
                                <div style={styles.roomDetails}>
                                    <span style={styles.roomTag}>
                                        {ROOM_TYPES.find(t => t.value === room.type)?.label}
                                    </span>
                                    <span style={styles.roomTag}>Room #{room.roomNumber}</span>
                                    <span style={styles.roomPrice}>৳{room.basePrice}/night</span>
                                    <span style={styles.roomTag}>{room.maxGuests} guests</span>
                                </div>
                            </div>
                            <div style={styles.roomActions}>
                                <button
                                    type="button"
                                    onClick={() => handleEditRoom(index)}
                                    style={styles.iconBtn}
                                >
                                    <FiEdit2 size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteRoom(index)}
                                    style={styles.iconBtnDanger}
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Form */}
            {isAdding ? (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>
                        <FiHome />
                        {editingIndex !== null ? "Edit Room" : "Add New Room"}
                    </h3>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Room Name *</label>
                            <input
                                type="text"
                                value={currentRoom.name}
                                onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
                                placeholder="e.g., Deluxe Double"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Room Number *</label>
                            <input
                                type="text"
                                value={currentRoom.roomNumber}
                                onChange={(e) => setCurrentRoom({ ...currentRoom, roomNumber: e.target.value })}
                                placeholder="e.g., 101"
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Room Type *</label>
                            <select
                                value={currentRoom.type}
                                onChange={(e) => {
                                    const type = e.target.value as RoomInput["type"];
                                    const defaultGuests = ROOM_TYPES.find(t => t.value === type)?.defaultGuests || 2;
                                    setCurrentRoom({ ...currentRoom, type, maxGuests: defaultGuests });
                                }}
                                style={styles.select}
                            >
                                {ROOM_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Base Price (৳) *</label>
                            <input
                                type="number"
                                value={currentRoom.basePrice}
                                onChange={(e) => setCurrentRoom({ ...currentRoom, basePrice: e.target.value })}
                                placeholder="e.g., 2500"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Max Guests</label>
                            <input
                                type="number"
                                value={currentRoom.maxGuests}
                                onChange={(e) => setCurrentRoom({ ...currentRoom, maxGuests: parseInt(e.target.value) || 2 })}
                                min={1}
                                max={10}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Room Amenities</label>
                        <div style={styles.amenitiesGrid}>
                            {ROOM_AMENITIES.map((amenity) => {
                                const Icon = amenity.icon;
                                return (
                                    <button
                                        key={amenity.name}
                                        type="button"
                                        onClick={() => toggleRoomAmenity(amenity.name)}
                                        style={styles.amenityChip(currentRoom.amenities.includes(amenity.name))}
                                    >
                                        <Icon size={14} />
                                        {amenity.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ ...styles.formGroup, marginTop: '1rem' }}>
                        <label style={styles.label}>Description (Optional)</label>
                        <textarea
                            value={currentRoom.description || ""}
                            onChange={(e) => setCurrentRoom({ ...currentRoom, description: e.target.value })}
                            placeholder="Brief description of this room..."
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.formActions}>
                        <button type="button" onClick={handleCancel} style={styles.btnCancel}>
                            <FiX /> Cancel
                        </button>
                        <button type="button" onClick={handleSaveRoom} style={styles.btnSave}>
                            <FiCheck /> Save Room
                        </button>
                    </div>
                </div>
            ) : (
                <button type="button" onClick={handleAddRoom} style={styles.addButton}>
                    <FiPlus size={20} /> Add Room Type
                </button>
            )}

            <div style={styles.roomsCount}>
                {data.rooms.length} room{data.rooms.length !== 1 ? "s" : ""} added
            </div>
        </div>
    );
}
