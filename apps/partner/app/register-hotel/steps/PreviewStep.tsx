"use client";

import { FiMapPin, FiPhone, FiMail, FiCheck, FiImage } from "react-icons/fi";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
    data: OnboardingData;
}

export function PreviewStep({ data }: Props) {
    const allPhotos = [data.coverImage, ...data.photos].filter(Boolean);

    return (
        <div className="step-content preview-step">
            <h2 className="step-heading">Review your hotel</h2>
            <p className="step-description">
                Please review all the information before submitting. You can go back to make changes.
            </p>

            {/* Hotel Preview Card */}
            <div className="preview-card">
                {/* Cover Image */}
                {data.coverImage && (
                    <div className="preview-cover">
                        <img src={data.coverImage} alt={data.name} />
                    </div>
                )}

                <div className="preview-body">
                    <h1 className="preview-name">{data.name || "Your Hotel Name"}</h1>

                    <div className="preview-location">
                        <FiMapPin />
                        <span>{data.address}, {data.city}</span>
                    </div>

                    <div className="preview-contacts">
                        {data.phone && (
                            <span><FiPhone /> {data.phone}</span>
                        )}
                        {data.email && (
                            <span><FiMail /> {data.email}</span>
                        )}
                    </div>

                    <p className="preview-description">{data.description}</p>

                    {/* Amenities */}
                    {data.amenities.length > 0 && (
                        <div className="preview-section">
                            <h3>Amenities</h3>
                            <div className="preview-amenities">
                                {data.amenities.map((amenity) => (
                                    <span key={amenity} className="amenity-tag">
                                        <FiCheck /> {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Photos */}
                    {allPhotos.length > 1 && (
                        <div className="preview-section">
                            <h3>Photos ({allPhotos.length})</h3>
                            <div className="preview-photos">
                                {allPhotos.slice(0, 4).map((url, i) => (
                                    <img key={i} src={url} alt={`Photo ${i + 1}`} />
                                ))}
                                {allPhotos.length > 4 && (
                                    <div className="more-photos">+{allPhotos.length - 4}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rooms */}
                    {data.rooms.length > 0 && (
                        <div className="preview-section">
                            <h3>Rooms ({data.rooms.length})</h3>
                            <div className="preview-rooms">
                                {data.rooms.map((room, index) => (
                                    <div key={index} className="preview-room">
                                        <div className="room-header">
                                            <span className="room-name">{room.name}</span>
                                            <span className="room-price">৳{room.basePrice}/night</span>
                                        </div>
                                        <div className="room-meta">
                                            <span>Room #{room.roomNumber}</span>
                                            <span>{room.maxGuests} guests</span>
                                            <span>{room.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documents Status */}
                    <div className="preview-section">
                        <h3>Documents</h3>
                        <div className="preview-documents">
                            <div className={`doc-status ${data.ownerNid ? "uploaded" : "pending"}`}>
                                <span>Owner NID</span>
                                <span>{data.ownerNid ? "✓ Uploaded" : "○ Not uploaded"}</span>
                            </div>
                            <div className={`doc-status ${data.tradeLicense ? "uploaded" : "pending"}`}>
                                <span>Trade License</span>
                                <span>{data.tradeLicense ? "✓ Uploaded" : "○ Not uploaded"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="preview-notice">
                <p>
                    ⚡ After submission, your hotel will be reviewed by our team.
                    You'll receive a notification once your hotel is approved and live!
                </p>
            </div>
        </div>
    );
}
