"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addRoom, requestRoomRemoval, cancelRoomRemovalRequest, updateRoom, type NewRoomInput, type UpdateRoomInput } from "../../actions/inventory";
import { uploadRoomPhoto } from "../../actions/upload";
import Link from "next/link";

const ROOM_TYPES = [
    { value: "SINGLE", label: "Single Room", maxGuests: 1 },
    { value: "DOUBLE", label: "Double Room", maxGuests: 2 },
    { value: "SUITE", label: "Suite", maxGuests: 4 },
    { value: "DORMITORY", label: "Dormitory", maxGuests: 1 },
] as const;

const ROOM_AMENITIES = [
    "WiFi",
    "AC",
    "TV",
    "Mini Bar",
    "Safe",
    "Balcony",
    "Sea View",
    "City View",
    "Bathtub",
    "Rain Shower",
];

interface Room {
    id: string;
    roomNumber: string;
    name: string;
    type: string;
    basePrice: string;
    maxGuests: number;
    description: string | null;
    isActive: boolean;
    photos?: string[] | null;
    amenities?: string[] | null;
}

interface RoomsManagementClientProps {
    hotelId: string;
    rooms: Room[];
}

export default function RoomsManagementClient({ hotelId, rooms: initialRooms }: RoomsManagementClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [roomNumber, setRoomNumber] = useState("");
    const [roomName, setRoomName] = useState("");
    const [roomType, setRoomType] = useState<NewRoomInput["type"]>("DOUBLE");
    const [basePrice, setBasePrice] = useState("");
    const [maxGuests, setMaxGuests] = useState("2");
    const [description, setDescription] = useState("");

    // Edit state
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [editRoomNumber, setEditRoomNumber] = useState("");
    const [editRoomName, setEditRoomName] = useState("");
    const [editRoomType, setEditRoomType] = useState<NewRoomInput["type"]>("DOUBLE");
    const [editBasePrice, setEditBasePrice] = useState("");
    const [editMaxGuests, setEditMaxGuests] = useState("2");
    const [editDescription, setEditDescription] = useState("");
    const [editAmenities, setEditAmenities] = useState<string[]>([]);
    const [editPhotos, setEditPhotos] = useState<string[]>([]);

    // Load edit form when editing room changes
    useEffect(() => {
        if (editingRoom) {
            setEditRoomNumber(editingRoom.roomNumber);
            setEditRoomName(editingRoom.name);
            setEditRoomType(editingRoom.type as NewRoomInput["type"]);
            setEditBasePrice(editingRoom.basePrice);
            setEditMaxGuests(editingRoom.maxGuests.toString());
            setEditDescription(editingRoom.description?.replace(/^\[REMOVAL_REQUESTED:.*?\]\s*/, "") || "");
            setEditAmenities(editingRoom.amenities || []);
            setEditPhotos(editingRoom.photos || []);
        }
    }, [editingRoom]);

    const handlePhotoUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploadingPhoto(true);
        setError(null);

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadRoomPhoto(formData);
            if (result.success && result.url) {
                setPhotos(prev => [...prev, result.url!]);
            } else {
                setError(result.error || "Failed to upload photo");
            }
        }

        setUploadingPhoto(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removePhoto = (urlToRemove: string) => {
        setPhotos(prev => prev.filter(url => url !== urlToRemove));
    };

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            const result = await addRoom({
                hotelId,
                roomNumber,
                name: roomName,
                type: roomType,
                basePrice: parseFloat(basePrice),
                maxGuests: parseInt(maxGuests),
                description: description || undefined,
                amenities: selectedAmenities,
                photos: photos,
            });

            if (result.success) {
                setSuccess("Room added successfully!");
                setShowAddForm(false);
                // Reset form
                setRoomNumber("");
                setRoomName("");
                setRoomType("DOUBLE");
                setBasePrice("");
                setMaxGuests("2");
                setDescription("");
                setSelectedAmenities([]);
                setPhotos([]);
                router.refresh();
            } else {
                setError(result.error || "Failed to add room");
            }
        });
    };

    const handleRequestRemoval = async (roomId: string) => {
        const reason = prompt("Please provide a reason for removal request:");
        if (reason === null) return; // User cancelled

        startTransition(async () => {
            const result = await requestRoomRemoval(roomId, reason);
            if (result.success) {
                setSuccess("Removal request sent to admin");
                router.refresh();
            } else {
                setError(result.error || "Failed to send request");
            }
        });
    };

    const handleCancelRequest = async (roomId: string) => {
        startTransition(async () => {
            const result = await cancelRoomRemovalRequest(roomId);
            if (result.success) {
                setSuccess("Removal request cancelled");
                router.refresh();
            } else {
                setError(result.error || "Failed to cancel request");
            }
        });
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const toggleEditAmenity = (amenity: string) => {
        setEditAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleEditRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRoom) return;
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            const result = await updateRoom({
                roomId: editingRoom.id,
                roomNumber: editRoomNumber,
                name: editRoomName,
                type: editRoomType,
                basePrice: parseFloat(editBasePrice),
                maxGuests: parseInt(editMaxGuests),
                description: editDescription || undefined,
                amenities: editAmenities,
                photos: editPhotos,
            });

            if (result.success) {
                setSuccess("Room updated successfully!");
                setEditingRoom(null);
                router.refresh();
            } else {
                setError(result.error || "Failed to update room");
            }
        });
    };

    const handleEditPhotoUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploadingPhoto(true);
        setError(null);

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadRoomPhoto(formData);
            if (result.success && result.url) {
                setEditPhotos(prev => [...prev, result.url!]);
            } else {
                setError(result.error || "Failed to upload photo");
            }
        }

        setUploadingPhoto(false);
    };

    const removeEditPhoto = (urlToRemove: string) => {
        setEditPhotos(prev => prev.filter(url => url !== urlToRemove));
    };

    return (
        <>
            {/* Header */}
            <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="page-title">Manage Rooms</h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        {initialRooms.length} rooms total
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn btn-primary"
                >
                    {showAddForm ? "Cancel" : "+ Add Room"}
                </button>
            </header>

            <main style={{ padding: "1rem", paddingBottom: "6rem" }}>
                {/* Messages */}
                {error && (
                    <div style={{
                        padding: "0.75rem 1rem",
                        background: "rgba(208, 0, 0, 0.1)",
                        color: "var(--color-error)",
                        borderRadius: "0.5rem",
                        marginBottom: "1rem",
                        fontSize: "0.875rem"
                    }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{
                        padding: "0.75rem 1rem",
                        background: "rgba(42, 157, 143, 0.1)",
                        color: "var(--color-success)",
                        borderRadius: "0.5rem",
                        marginBottom: "1rem",
                        fontSize: "0.875rem"
                    }}>
                        {success}
                    </div>
                )}

                {/* Add Room Form */}
                {showAddForm && (
                    <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Add New Room
                        </h2>
                        <form onSubmit={handleAddRoom}>
                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
                                {/* Room Number */}
                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                        Room Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={roomNumber}
                                        onChange={(e) => setRoomNumber(e.target.value)}
                                        required
                                        placeholder="e.g., 101"
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem 0.75rem",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "0.375rem",
                                            fontSize: "0.875rem"
                                        }}
                                    />
                                </div>

                                {/* Room Name */}
                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                        Room Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        required
                                        placeholder="e.g., Deluxe Double"
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem 0.75rem",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "0.375rem",
                                            fontSize: "0.875rem"
                                        }}
                                    />
                                </div>

                                {/* Room Type */}
                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                        Room Type *
                                    </label>
                                    <select
                                        value={roomType}
                                        onChange={(e) => {
                                            const type = e.target.value as NewRoomInput["type"];
                                            setRoomType(type);
                                            const typeConfig = ROOM_TYPES.find(t => t.value === type);
                                            if (typeConfig) setMaxGuests(typeConfig.maxGuests.toString());
                                        }}
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem 0.75rem",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "0.375rem",
                                            fontSize: "0.875rem",
                                            background: "white"
                                        }}
                                    >
                                        {ROOM_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Base Price */}
                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                        Base Price (BDT) *
                                    </label>
                                    <input
                                        type="number"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                        required
                                        min="0"
                                        placeholder="e.g., 2500"
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem 0.75rem",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "0.375rem",
                                            fontSize: "0.875rem"
                                        }}
                                    />
                                </div>

                                {/* Max Guests */}
                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                        Max Guests
                                    </label>
                                    <input
                                        type="number"
                                        value={maxGuests}
                                        onChange={(e) => setMaxGuests(e.target.value)}
                                        min="1"
                                        max="10"
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem 0.75rem",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "0.375rem",
                                            fontSize: "0.875rem"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ marginTop: "1rem" }}>
                                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    placeholder="Room description..."
                                    style={{
                                        width: "100%",
                                        padding: "0.5rem 0.75rem",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "0.375rem",
                                        fontSize: "0.875rem",
                                        resize: "vertical"
                                    }}
                                />
                            </div>

                            {/* Amenities */}
                            <div style={{ marginTop: "1rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                    Amenities
                                </label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                    {ROOM_AMENITIES.map((amenity) => (
                                        <button
                                            key={amenity}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity)}
                                            style={{
                                                padding: "0.375rem 0.75rem",
                                                borderRadius: "9999px",
                                                fontSize: "0.75rem",
                                                border: "1px solid",
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                ...(selectedAmenities.includes(amenity)
                                                    ? {
                                                        background: "var(--color-primary)",
                                                        color: "white",
                                                        borderColor: "var(--color-primary)",
                                                    }
                                                    : {
                                                        background: "white",
                                                        color: "var(--color-text-primary)",
                                                        borderColor: "var(--color-border)",
                                                    }),
                                            }}
                                        >
                                            {amenity}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div style={{ marginTop: "1.5rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>
                                    Room Photos
                                </label>

                                {/* Upload Area */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        handlePhotoUpload(e.dataTransfer.files);
                                    }}
                                    style={{
                                        border: "2px dashed var(--color-border)",
                                        borderRadius: "0.5rem",
                                        padding: "1.5rem",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        background: uploadingPhoto ? "var(--color-bg-secondary)" : "white",
                                    }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={(e) => handlePhotoUpload(e.target.files)}
                                        style={{ display: "none" }}
                                    />
                                    {uploadingPhoto ? (
                                        <div style={{ color: "var(--color-text-secondary)" }}>
                                            <span style={{ fontSize: "1.5rem" }}>⏳</span>
                                            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>Uploading...</p>
                                        </div>
                                    ) : (
                                        <div style={{ color: "var(--color-text-secondary)" }}>
                                            <span style={{ fontSize: "2rem" }}>📷</span>
                                            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                                                Click or drag photos here
                                            </p>
                                            <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                                                JPG, PNG, WebP • Max 5MB each
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Photo Preview Gallery */}
                                {photos.length > 0 && (
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                                        gap: "0.75rem",
                                        marginTop: "1rem"
                                    }}>
                                        {photos.map((url, index) => (
                                            <div
                                                key={url}
                                                style={{
                                                    position: "relative",
                                                    aspectRatio: "1",
                                                    borderRadius: "0.5rem",
                                                    overflow: "hidden",
                                                    border: "1px solid var(--color-border)"
                                                }}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Room photo ${index + 1}`}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover"
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(url)}
                                                    style={{
                                                        position: "absolute",
                                                        top: "4px",
                                                        right: "4px",
                                                        width: "24px",
                                                        height: "24px",
                                                        borderRadius: "50%",
                                                        background: "rgba(0,0,0,0.6)",
                                                        color: "white",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "14px"
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isPending || uploadingPhoto}
                                className="btn btn-primary"
                                style={{ marginTop: "1.5rem", width: "100%", opacity: (isPending || uploadingPhoto) ? 0.7 : 1 }}
                            >
                                {isPending ? "Adding..." : "Add Room"}
                            </button>
                        </form>
                    </div>
                )}


                {/* Rooms List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {initialRooms.length === 0 ? (
                        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                            No rooms yet. Add your first room to get started!
                        </div>
                    ) : (
                        initialRooms.map((room) => {
                            const hasRemovalRequest = room.description?.startsWith("[REMOVAL_REQUESTED");
                            return (
                                <div
                                    key={room.id}
                                    className="card"
                                    style={{
                                        padding: "1rem",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        opacity: room.isActive ? 1 : 0.5,
                                        borderColor: hasRemovalRequest ? "var(--color-warning)" : undefined,
                                        borderWidth: hasRemovalRequest ? "2px" : undefined,
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                                            <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                                                #{room.roomNumber}
                                            </span>
                                            <span style={{ fontWeight: 500 }}>{room.name}</span>
                                            {hasRemovalRequest && (
                                                <span className="badge badge-warning" style={{ fontSize: "0.625rem" }}>
                                                    Removal Pending
                                                </span>
                                            )}
                                            {!room.isActive && (
                                                <span className="badge badge-error" style={{ fontSize: "0.625rem" }}>
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                            {room.type} • ৳{parseFloat(room.basePrice).toLocaleString()} / night • {room.maxGuests} guests
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        {hasRemovalRequest ? (
                                            <button
                                                onClick={() => handleCancelRequest(room.id)}
                                                disabled={isPending}
                                                className="btn btn-sm btn-outline"
                                            >
                                                Cancel Request
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRequestRemoval(room.id)}
                                                disabled={isPending || !room.isActive}
                                                className="btn btn-sm btn-outline"
                                                style={{ color: "var(--color-error)", borderColor: "var(--color-error)" }}
                                            >
                                                Request Removal
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Back Link */}
                <Link
                    href="/inventory"
                    style={{
                        display: "inline-block",
                        marginTop: "1.5rem",
                        color: "var(--color-primary)",
                        fontSize: "0.875rem"
                    }}
                >
                    ← Back to Inventory
                </Link>
            </main>
        </>
    );
}
