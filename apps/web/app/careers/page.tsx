import { Footer, BottomNav } from "../components";
import { getTranslations } from "next-intl/server";
import { FiBriefcase, FiTrendingUp, FiUsers, FiHeart } from "react-icons/fi";
import Link from "next/link";

export const metadata = {
    title: "Careers - Zinu Rooms",
    description: "Join the Zinu Rooms team and help transform hotel booking in Bangladesh.",
};

export default async function CareersPage() {
    const t = await getTranslations("careers");

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

                    {/* Why Join Us */}
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#1D3557', marginBottom: '2.5rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("whyJoinTitle")}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <FiTrendingUp size={40} color="#E63946" />
                                <h3 style={{ margin: '1rem 0 0.75rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>{t("benefit1Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{t("benefit1Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <FiUsers size={40} color="#E63946" />
                                <h3 style={{ margin: '1rem 0 0.75rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>{t("benefit2Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{t("benefit2Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <FiBriefcase size={40} color="#E63946" />
                                <h3 style={{ margin: '1rem 0 0.75rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>{t("benefit3Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{t("benefit3Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <FiHeart size={40} color="#E63946" />
                                <h3 style={{ margin: '1rem 0 0.75rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>{t("benefit4Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{t("benefit4Description")}</p>
                            </div>
                        </div>
                    </div>

                    {/* Open Positions Section */}
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#1D3557', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("openPositionsTitle")}
                        </h2>
                        <div style={{ background: '#E2E8F0', borderRadius: '1.5rem', padding: '3rem 2rem', textAlign: 'center' }}>
                            <FiBriefcase size={60} color="#E63946" />
                            <h3 style={{ margin: '1.5rem 0 1rem', fontSize: '1.5rem', fontWeight: 700, color: '#1D3557' }}>{t("noOpeningsTitle")}</h3>
                            <p style={{ color: '#64748B', marginBottom: '2rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                                {t("noOpeningsDescription")}
                            </p>
                            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#E63946', color: 'white', padding: '0.875rem 2rem', borderRadius: '9999px', fontWeight: 600, textDecoration: 'none' }}>
                                {t("getInTouchButton")}
                            </Link>
                        </div>
                    </div>

                    {/* Application Process */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#1D3557', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("processTitle")}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <div style={{ width: '48px', height: '48px', background: '#E63946', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>1</div>
                                <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, color: '#1D3557' }}>{t("step1Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6 }}>{t("step1Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <div style={{ width: '48px', height: '48px', background: '#E63946', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>2</div>
                                <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, color: '#1D3557' }}>{t("step2Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6 }}>{t("step2Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <div style={{ width: '48px', height: '48px', background: '#E63946', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>3</div>
                                <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, color: '#1D3557' }}>{t("step3Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6 }}>{t("step3Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <div style={{ width: '48px', height: '48px', background: '#E63946', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>4</div>
                                <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, color: '#1D3557' }}>{t("step4Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6 }}>{t("step4Description")}</p>
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
