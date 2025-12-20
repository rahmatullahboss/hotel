import { Footer, BottomNav } from "../components";
import { getTranslations } from "next-intl/server";
import { FiCheckCircle, FiDollarSign, FiTrendingUp, FiUsers } from "react-icons/fi";
import Link from "next/link";

export const metadata = {
    title: "Partner With Us - Zinu Rooms",
    description: "List your hotel on Zinu Rooms and reach thousands of travelers across Bangladesh.",
};

export default async function PartnerPage() {
    const t = await getTranslations("partner");

    return (
        <>
            <main style={{ padding: '2rem 0 4rem', background: '#F8FAFC', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Hero Section */}
                    <div style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '2rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("title")}
                        </h1>
                        <p style={{ fontSize: '1.125rem', color: '#64748B', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
                            {t("subtitle")}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/partner/auth/signin" style={{ display: 'inline-block', background: '#E63946', color: 'white', padding: '0.875rem 2rem', borderRadius: '0.5rem', fontWeight: 600, textDecoration: 'none', minWidth: '180px', textAlign: 'center' }}>
                                {t("partnerLoginButton")}
                            </Link>
                            <Link href="/contact" style={{ display: 'inline-block', background: 'transparent', color: '#1D3557', padding: '0.875rem 2rem', borderRadius: '0.5rem', fontWeight: 600, textDecoration: 'none', border: '2px solid #1D3557', minWidth: '180px', textAlign: 'center' }}>
                                {t("contactUsButton")}
                            </Link>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#1D3557', marginBottom: '2.5rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("benefitsTitle")}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <FiUsers size={40} color="#E63946" />
                                <h3 style={{ margin: '1rem 0 0.75rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>{t("benefit1Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{t("benefit1Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <FiTrendingUp size={40} color="#E63946" />
                                <h3 style={{ margin: '1rem 0 0.75rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>{t("benefit2Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{t("benefit2Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <FiDollarSign size={40} color="#E63946" />
                                <h3 style={{ margin: '1rem 0 0.75rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>{t("benefit3Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{t("benefit3Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <FiCheckCircle size={40} color="#E63946" />
                                <h3 style={{ margin: '1rem 0 0.75rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>{t("benefit4Title")}</h3>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{t("benefit4Description")}</p>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#1D3557', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("howItWorksTitle")}
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

                    {/* Features */}
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#1D3557', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("featuresTitle")}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ marginBottom: '0.5rem', color: '#E63946', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>✓</span> {t("feature1Title")}
                                </h3>
                                <p style={{ color: '#64748B', lineHeight: 1.6 }}>{t("feature1Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ marginBottom: '0.5rem', color: '#E63946', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>✓</span> {t("feature2Title")}
                                </h3>
                                <p style={{ color: '#64748B', lineHeight: 1.6 }}>{t("feature2Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ marginBottom: '0.5rem', color: '#E63946', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>✓</span> {t("feature3Title")}
                                </h3>
                                <p style={{ color: '#64748B', lineHeight: 1.6 }}>{t("feature3Description")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ marginBottom: '0.5rem', color: '#E63946', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>✓</span> {t("feature4Title")}
                                </h3>
                                <p style={{ color: '#64748B', lineHeight: 1.6 }}>{t("feature4Description")}</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div style={{ background: 'linear-gradient(135deg, #E63946 0%, #c62828 100%)', borderRadius: '1.5rem', padding: '3rem 2rem', textAlign: 'center', color: 'white' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: 700 }}>{t("ctaTitle")}</h2>
                        <p style={{ marginBottom: '2rem', fontSize: '1.125rem', opacity: 0.95, maxWidth: '600px', margin: '0 auto 2rem' }}>
                            {t("ctaDescription")}
                        </p>
                        <Link href="/partner/auth/signin" style={{ display: 'inline-block', background: 'white', color: '#E63946', padding: '0.875rem 2rem', borderRadius: '0.5rem', fontWeight: 600, textDecoration: 'none', minWidth: '180px' }}>
                            {t("getStartedButton")}
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
            <BottomNav />
        </>
    );
}
