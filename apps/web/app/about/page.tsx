import { Footer, BottomNav } from "../components";
import { getTranslations } from "next-intl/server";
import { FiTarget, FiEye, FiCheckCircle, FiStar } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";

export const metadata = {
    title: "About Us - Zinu Rooms",
    description: "Learn about Zinu Rooms' mission to provide verified, quality hotel accommodations across Bangladesh.",
};

export default async function AboutPage() {
    const t = await getTranslations("about");

    return (
        <>
            <main style={{ padding: '2rem 0 4rem', background: '#F8FAFC', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Hero Section */}
                    <div style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '2rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("title")}
                        </h1>
                        <p style={{ fontSize: '1.125rem', color: '#64748B', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7 }}>
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Mission & Vision - Premium Design */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                        {/* Mission Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #E63946 0%, #c62828 100%)',
                            borderRadius: '1.5rem',
                            padding: '2.5rem',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(230, 57, 70, 0.3)'
                        }}>
                            {/* Decorative circles */}
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                            <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '72px',
                                    height: '72px',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}>
                                    <FiTarget size={36} color="white" />
                                </div>
                                <h2 style={{ marginBottom: '1rem', fontSize: '1.75rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                                    {t("missionTitle")}
                                </h2>
                                <p style={{ lineHeight: 1.8, opacity: 0.95, fontSize: '1.05rem' }}>
                                    {t("missionDescription")}
                                </p>
                            </div>
                        </div>

                        {/* Vision Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1D3557 0%, #0d1b2a 100%)',
                            borderRadius: '1.5rem',
                            padding: '2.5rem',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(29, 53, 87, 0.3)'
                        }}>
                            {/* Decorative circles */}
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                            <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '72px',
                                    height: '72px',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}>
                                    <FiEye size={36} color="white" />
                                </div>
                                <h2 style={{ marginBottom: '1rem', fontSize: '1.75rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                                    {t("visionTitle")}
                                </h2>
                                <p style={{ lineHeight: 1.8, opacity: 0.95, fontSize: '1.05rem' }}>
                                    {t("visionDescription")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tagline Quote Section - Replacing Values */}
                    <div style={{
                        background: 'white',
                        borderRadius: '1.5rem',
                        padding: '3rem 2.5rem',
                        marginBottom: '4rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: '1.5rem', left: '2rem', opacity: 0.1 }}>
                            <FaQuoteLeft size={60} color="#E63946" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <FiStar key={i} size={24} color="#E63946" fill="#E63946" style={{ margin: '0 2px' }} />
                            ))}
                        </div>
                        <p style={{
                            fontSize: '1.5rem',
                            fontWeight: 500,
                            color: '#1D3557',
                            fontFamily: "'Playfair Display', serif",
                            fontStyle: 'italic',
                            lineHeight: 1.7,
                            maxWidth: '800px',
                            margin: '0 auto 1.5rem'
                        }}>
                            "বাংলাদেশে ভ্রমণকে আরও সহজ এবং নির্ভরযোগ্য করে তুলতে আমরা প্রতিশ্রুতিবদ্ধ। প্রতিটি বুকিং এ আমরা নিশ্চিত করি সেরা মান এবং সেরা অভিজ্ঞতা।"
                        </p>
                        <p style={{ color: '#64748B', fontWeight: 600 }}>— Zinu Rooms Team</p>
                    </div>

                    {/* Stats Section */}
                    <div style={{ background: 'linear-gradient(135deg, #E63946 0%, #c62828 100%)', borderRadius: '1.5rem', padding: '3rem 2rem', marginBottom: '4rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontWeight: 700, fontSize: '1.75rem' }}>{t("statsTitle")}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>30+</div>
                                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>{t("hotelsCount")}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>9</div>
                                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>{t("citiesCount")}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>24/7</div>
                                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>{t("supportAvailable")}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Why Choose Us */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#1D3557', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("whyChooseTitle")}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(230, 57, 70, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FiCheckCircle size={20} color="#E63946" />
                                </div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem', color: '#1D3557', fontWeight: 600, fontSize: '1.1rem' }}>{t("reason1Title")}</h3>
                                    <p style={{ color: '#64748B', lineHeight: 1.6 }}>{t("reason1Description")}</p>
                                </div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(230, 57, 70, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FiCheckCircle size={20} color="#E63946" />
                                </div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem', color: '#1D3557', fontWeight: 600, fontSize: '1.1rem' }}>{t("reason2Title")}</h3>
                                    <p style={{ color: '#64748B', lineHeight: 1.6 }}>{t("reason2Description")}</p>
                                </div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(230, 57, 70, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FiCheckCircle size={20} color="#E63946" />
                                </div>
                                <div>
                                    <h3 style={{ marginBottom: '0.5rem', color: '#1D3557', fontWeight: 600, fontSize: '1.1rem' }}>{t("reason3Title")}</h3>
                                    <p style={{ color: '#64748B', lineHeight: 1.6 }}>{t("reason3Description")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <BottomNav />
        </>
    );
}
