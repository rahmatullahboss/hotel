import { Footer, BottomNav } from "../components";
import { getTranslations } from "next-intl/server";
import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export const metadata = {
    title: "Contact Us - Zinu Rooms",
    description: "Get in touch with Zinu Rooms. We're here to help with your booking questions and travel needs.",
};

export default async function ContactPage() {
    const t = await getTranslations("contact");

    return (
        <>
            <main style={{ padding: '2rem 0 4rem', background: '#F8FAFC', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("title")}
                        </h1>
                        <p style={{ fontSize: '1.125rem', color: '#64748B', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Contact Information Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        {/* Email */}
                        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <div style={{ width: '64px', height: '64px', background: '#E63946', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <FiMail size={28} color="white" />
                            </div>
                            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>Email</h3>
                            <p style={{ color: '#64748B', marginBottom: '0.5rem' }}>{t("emailLabel")}</p>
                            <a href="mailto:rahmatullahzisan@gmail.com" style={{ color: '#E63946', fontWeight: 600, textDecoration: 'none' }}>
                                rahmatullahzisan@gmail.com
                            </a>
                        </div>

                        {/* Phone */}
                        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <div style={{ width: '64px', height: '64px', background: '#E63946', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <FiPhone size={28} color="white" />
                            </div>
                            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>Phone</h3>
                            <p style={{ color: '#64748B', marginBottom: '0.5rem' }}>{t("phoneLabel")}</p>
                            <a href="tel:+8801739416661" style={{ color: '#E63946', fontWeight: 600, textDecoration: 'none' }}>
                                +880 1739 416661
                            </a>
                        </div>

                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/8801739416661?text=Hello%2C%20I%20need%20help%20with%20Zinu%20Rooms"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textDecoration: 'none' }}
                        >
                            <div style={{ width: '64px', height: '64px', background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <FaWhatsapp size={32} color="white" />
                            </div>
                            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>WhatsApp</h3>
                            <p style={{ color: '#64748B', marginBottom: '0.5rem' }}>এখনই মেসেজ করুন</p>
                            <span style={{ color: '#25D366', fontWeight: 600 }}>01739 416661</span>
                        </a>

                        {/* Office Hours */}
                        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <div style={{ width: '64px', height: '64px', background: '#E63946', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <FiClock size={28} color="white" />
                            </div>
                            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>{t("hoursTitle")}</h3>
                            <p style={{ color: '#64748B', marginBottom: '0.5rem' }}>{t("hoursLabel")}</p>
                            <p style={{ color: '#E63946', fontWeight: 600 }}>24/7 Support</p>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', marginBottom: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: '#1D3557', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FiMapPin size={24} color="white" />
                        </div>
                        <div>
                            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.125rem', color: '#1D3557' }}>{t("addressTitle")}</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.6 }}>
                                Gulshan Avenue, Gulshan-2<br />
                                Dhaka 1212, Bangladesh
                            </p>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#1D3557', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("faqTitle")}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ color: '#E63946', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>{t("faq1Question")}</h3>
                                <p style={{ color: '#64748B', lineHeight: 1.6 }}>{t("faq1Answer")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ color: '#E63946', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>{t("faq2Question")}</h3>
                                <p style={{ color: '#64748B', lineHeight: 1.6 }}>{t("faq2Answer")}</p>
                            </div>
                            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ color: '#E63946', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>{t("faq3Question")}</h3>
                                <p style={{ color: '#64748B', lineHeight: 1.6 }}>{t("faq3Answer")}</p>
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
