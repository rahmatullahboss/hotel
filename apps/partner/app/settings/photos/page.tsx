import { redirect } from "next/navigation";
import Link from "next/link";
import { MdCameraAlt, MdImage, MdLightbulb } from "react-icons/md";
import { getHotelProfile } from "../../actions/settings";
import { BottomNav } from "../../components";

export const dynamic = 'force-dynamic';

export default async function PhotosPage() {
    const hotel = await getHotelProfile();

    if (!hotel) {
        redirect("/auth/signin");
    }

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <Link
                    href="/settings"
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                        marginBottom: "0.5rem",
                    }}
                >
                    ←
                </Link>
                <h1 className="page-title">Photos & Media</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Manage your hotel photos
                </p>
            </header>

            <main>
                {/* Cover Image Section */}
                <section style={{ marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Cover Image
                    </h2>
                    <div
                        className="card"
                        style={{
                            height: "200px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: hotel.coverImage
                                ? `url(${hotel.coverImage}) center/cover`
                                : "var(--color-bg-secondary)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {!hotel.coverImage && (
                            <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
                                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}><MdCameraAlt /></div>
                                <div>No cover image</div>
                            </div>
                        )}
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "0.5rem" }}>
                        Cover images are displayed on your hotel listing. Use the Scanner page to upload photos.
                    </p>
                </section>

                {/* Gallery Section */}
                <section>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Photo Gallery ({hotel.photos.length} photos)
                    </h2>

                    {hotel.photos.length === 0 ? (
                        <div
                            className="card"
                            style={{
                                padding: "2rem",
                                textAlign: "center",
                                color: "var(--color-text-muted)",
                            }}
                        >
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}><MdImage /></div>
                            <div>No photos yet</div>
                            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                                Add photos to showcase your hotel
                            </p>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "0.75rem",
                            }}
                        >
                            {hotel.photos.map((photo, index) => (
                                <div
                                    key={index}
                                    style={{
                                        aspectRatio: "4/3",
                                        borderRadius: "0.5rem",
                                        overflow: "hidden",
                                        background: `url(${photo}) center/cover`,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Info Card */}
                <div
                    className="card"
                    style={{
                        marginTop: "1.5rem",
                        padding: "1rem",
                        background: "var(--color-bg-secondary)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div style={{ fontSize: "1.25rem" }}><MdLightbulb /></div>
                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            <p style={{ marginBottom: "0.5rem" }}>
                                <strong>Tip:</strong> High-quality photos attract more guests.
                            </p>
                            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                                <li>Use well-lit, clear photos</li>
                                <li>Show your rooms, bathrooms, and common areas</li>
                                <li>Update photos seasonally</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav />
        </>
    );
}
