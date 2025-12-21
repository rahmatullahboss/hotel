"use client";

import { useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from "react-icons/fi";
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
    "WiFi", "AC", "TV", "Attached Bathroom", "Hot Water",
    "Mini Fridge", "Balcony", "Sea View", "City View"
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
        <div className="step-content">
            <h2 className="step-heading">Add your rooms</h2>
            <p className="step-description">
                Add different room types with their pricing. You can add more rooms later.
            </p>

            {/* Room List */}
            {data.rooms.length > 0 && !isAdding && (
                <div className="rooms-list">
                    {data.rooms.map((room, index) => (
                        <div key={index} className="room-card">
                            <div className="room-info">
                                <h3 className="room-name">{room.name}</h3>
                                <div className="room-details">
                                    <span className="room-type">{ROOM_TYPES.find(t => t.value === room.type)?.label}</span>
                                    <span className="room-number">Room #{room.roomNumber}</span>
                                    <span className="room-price">৳{room.basePrice}/night</span>
                                    <span className="room-guests">{room.maxGuests} guests</span>
                                </div>
                            </div>
                            <div className="room-actions">
                                <button
                                    type="button"
                                    onClick={() => handleEditRoom(index)}
                                    className="btn-icon"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteRoom(index)}
                                    className="btn-icon btn-danger"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Form */}
            {isAdding ? (
                <div className="room-form">
                    <h3 className="form-section-title">
                        {editingIndex !== null ? "Edit Room" : "Add New Room"}
                    </h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Room Name *</label>
                            <input
                                type="text"
                                value={currentRoom.name}
                                onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
                                placeholder="e.g., Deluxe Double"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Room Number *</label>
                            <input
                                type="text"
                                value={currentRoom.roomNumber}
                                onChange={(e) => setCurrentRoom({ ...currentRoom, roomNumber: e.target.value })}
                                placeholder="e.g., 101"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Room Type *</label>
                            <select
                                value={currentRoom.type}
                                onChange={(e) => {
                                    const type = e.target.value as RoomInput["type"];
                                    const defaultGuests = ROOM_TYPES.find(t => t.value === type)?.defaultGuests || 2;
                                    setCurrentRoom({ ...currentRoom, type, maxGuests: defaultGuests });
                                }}
                                className="form-input"
                            >
                                {ROOM_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Base Price (৳) *</label>
                            <input
                                type="number"
                                value={currentRoom.basePrice}
                                onChange={(e) => setCurrentRoom({ ...currentRoom, basePrice: e.target.value })}
                                placeholder="e.g., 2500"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Guests</label>
                            <input
                                type="number"
                                value={currentRoom.maxGuests}
                                onChange={(e) => setCurrentRoom({ ...currentRoom, maxGuests: parseInt(e.target.value) || 2 })}
                                min={1}
                                max={10}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Room Amenities</label>
                        <div className="room-amenities-grid">
                            {ROOM_AMENITIES.map((amenity) => (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => toggleRoomAmenity(amenity)}
                                    className={`amenity-chip ${currentRoom.amenities.includes(amenity) ? "selected" : ""}`}
                                >
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        <textarea
                            value={currentRoom.description || ""}
                            onChange={(e) => setCurrentRoom({ ...currentRoom, description: e.target.value })}
                            placeholder="Brief description of this room..."
                            rows={2}
                            className="form-input"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={handleCancel} className="btn btn-outline">
                            <FiX /> Cancel
                        </button>
                        <button type="button" onClick={handleSaveRoom} className="btn btn-primary">
                            <FiCheck /> Save Room
                        </button>
                    </div>
                </div>
            ) : (
                <button type="button" onClick={handleAddRoom} className="btn btn-add-room">
                    <FiPlus /> Add Room Type
                </button>
            )}

            <div className="rooms-count">
                {data.rooms.length} room{data.rooms.length !== 1 ? "s" : ""} added
            </div>
        </div>
    );
}
