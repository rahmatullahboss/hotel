"use client";

import { FiMapPin, FiPhone, FiMail, FiCheck, FiHome, FiCamera, FiFileText, FiStar } from "react-icons/fi";
import type { OnboardingData } from "../OnboardingWizard";

interface Props {
    data: OnboardingData;
}

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
        marginBottom: '0.5rem',
    },
    previewCard: {
        background: 'white',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    },
    coverImage: {
        width: '100%',
        height: '200px',
        objectFit: 'cover' as const,
    },
    coverPlaceholder: {
        width: '100%',
        height: '200px',
        background: 'linear-gradient(135deg, #1d3557 0%, #2a4a7f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    body: {
        padding: '1.5rem',
    },
    hotelName: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1d3557',
        margin: '0 0 0.75rem 0',
    },
    location: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#64748b',
        fontSize: '0.9375rem',
        marginBottom: '0.75rem',
    },
    contacts: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '1rem',
        marginBottom: '1rem',
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        color: '#64748b',
        fontSize: '0.875rem',
    },
    hotelDescription: {
        color: '#334155',
        fontSize: '0.9375rem',
        lineHeight: 1.7,
        marginBottom: '1.5rem',
        padding: '1rem',
        background: '#f8fafc',
        borderRadius: '0.75rem',
        borderLeft: '4px solid #1d3557',
    },
    section: {
        marginBottom: '1.25rem',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#1d3557',
        marginBottom: '0.75rem',
    },
    amenitiesGrid: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '0.5rem',
    },
    amenityTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        color: '#16a34a',
        borderRadius: '2rem',
        fontSize: '0.8125rem',
        fontWeight: 500,
    },
    photosGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
    },
    photoThumb: {
        aspectRatio: '1',
        borderRadius: '0.5rem',
        objectFit: 'cover' as const,
        border: '2px solid #e2e8f0',
    },
    morePhotos: {
        aspectRatio: '1',
        borderRadius: '0.5rem',
        background: 'linear-gradient(135deg, #1d3557 0%, #2a4a7f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.125rem',
        fontWeight: 600,
    },
    roomsList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.75rem',
    },
    roomCard: {
        padding: '1rem',
        background: '#f8fafc',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
    },
    roomHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    },
    roomName: {
        fontWeight: 600,
        color: '#1d3557',
        fontSize: '0.9375rem',
    },
    roomPrice: {
        fontWeight: 700,
        color: '#16a34a',
        fontSize: '1rem',
    },
    roomMeta: {
        display: 'flex',
        gap: '0.75rem',
        fontSize: '0.8125rem',
        color: '#64748b',
    },
    documentsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem',
    },
    docStatus: (uploaded: boolean) => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        background: uploaded ? '#dcfce7' : '#fef3c7',
        borderRadius: '0.5rem',
        border: uploaded ? '1px solid #86efac' : '1px solid #fde68a',
    }),
    docLabel: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#334155',
    },
    docValue: (uploaded: boolean) => ({
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: uploaded ? '#16a34a' : '#d97706',
    }),
    notice: {
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '1px solid #fbbf24',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    noticeIcon: {
        fontSize: '1.25rem',
    },
    noticeText: {
        fontSize: '0.875rem',
        color: '#92400e',
        lineHeight: 1.5,
        margin: 0,
    },
};

export function PreviewStep({ data }: Props) {
    const allPhotos = [data.coverImage, ...data.photos].filter(Boolean);

    return (
        <div style={styles.container}>
            <div>
                <h2 style={styles.heading}>Review your hotel</h2>
                <p style={styles.description}>
                    Please review all the information before submitting. You can go back to make changes.
                </p>
            </div>

            {/* Hotel Preview Card */}
            <div style={styles.previewCard}>
                {/* Cover Image */}
                {data.coverImage ? (
                    <img src={data.coverImage} alt={data.name} style={styles.coverImage} />
                ) : (
                    <div style={styles.coverPlaceholder}>
                        <FiCamera size={48} />
                    </div>
                )}

                <div style={styles.body}>
                    <h1 style={styles.hotelName}>{data.name || "Your Hotel Name"}</h1>

                    <div style={styles.location}>
                        <FiMapPin size={16} />
                        <span>{data.address || "Address"}, {data.city || "City"}</span>
                    </div>

                    <div style={styles.contacts}>
                        {data.phone && (
                            <span style={styles.contactItem}>
                                <FiPhone size={14} /> {data.phone}
                            </span>
                        )}
                        {data.email && (
                            <span style={styles.contactItem}>
                                <FiMail size={14} /> {data.email}
                            </span>
                        )}
                    </div>

                    {data.description && (
                        <p style={styles.hotelDescription}>{data.description}</p>
                    )}

                    {/* Amenities */}
                    {data.amenities.length > 0 && (
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>
                                <FiStar size={16} /> Amenities ({data.amenities.length})
                            </h3>
                            <div style={styles.amenitiesGrid}>
                                {data.amenities.map((amenity) => (
                                    <span key={amenity} style={styles.amenityTag}>
                                        <FiCheck size={12} /> {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Photos */}
                    {allPhotos.length > 1 && (
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>
                                <FiCamera size={16} /> Photos ({allPhotos.length})
                            </h3>
                            <div style={styles.photosGrid}>
                                {allPhotos.slice(0, 4).map((url, i) => (
                                    <img key={i} src={url} alt={`Photo ${i + 1}`} style={styles.photoThumb} />
                                ))}
                                {allPhotos.length > 4 && (
                                    <div style={styles.morePhotos}>+{allPhotos.length - 4}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rooms */}
                    {data.rooms.length > 0 && (
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>
                                <FiHome size={16} /> Rooms ({data.rooms.length})
                            </h3>
                            <div style={styles.roomsList}>
                                {data.rooms.map((room, index) => (
                                    <div key={index} style={styles.roomCard}>
                                        <div style={styles.roomHeader}>
                                            <span style={styles.roomName}>{room.name}</span>
                                            <span style={styles.roomPrice}>৳{room.basePrice}/night</span>
                                        </div>
                                        <div style={styles.roomMeta}>
                                            <span>Room #{room.roomNumber}</span>
                                            <span>•</span>
                                            <span>{room.maxGuests} guests</span>
                                            <span>•</span>
                                            <span>{room.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documents Status */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FiFileText size={16} /> Documents
                        </h3>
                        <div style={styles.documentsGrid}>
                            <div style={styles.docStatus(!!data.ownerNid)}>
                                <span style={styles.docLabel}>Owner NID</span>
                                <span style={styles.docValue(!!data.ownerNid)}>
                                    {data.ownerNid ? "✓ Uploaded" : "○ Pending"}
                                </span>
                            </div>
                            <div style={styles.docStatus(!!data.tradeLicense)}>
                                <span style={styles.docLabel}>Trade License</span>
                                <span style={styles.docValue(!!data.tradeLicense)}>
                                    {data.tradeLicense ? "✓ Uploaded" : "○ Pending"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.notice}>
                <span style={styles.noticeIcon}>⚡</span>
                <p style={styles.noticeText}>
                    After submission, your hotel will be reviewed by our team.
                    You'll receive a notification once your hotel is approved and live!
                </p>
            </div>
        </div>
    );
}
