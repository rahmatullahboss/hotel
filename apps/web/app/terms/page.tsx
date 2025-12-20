import Link from "next/link";
import { BottomNav, Footer } from "../components";
import { getTranslations } from "next-intl/server";

export const metadata = {
    title: "Terms of Service - Zinu Rooms",
    description: "Terms of Service for Zinu Rooms hotel booking platform.",
};

export default async function TermsPage() {
    const t = await getTranslations("terms");

    return (
        <>
            <main style={{ padding: '2rem 0 4rem', background: '#F8FAFC', minHeight: '100vh' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
                            {t("title")}
                        </h1>
                        <p style={{ color: '#64748B' }}>{t("lastUpdated")}</p>
                    </div>

                    {/* Content */}
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                {t("section1Title")}
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                {t("section1Text")}
                            </p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                {t("section2Title")}
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                {t("section2Text")}
                            </p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                {t("section3Title")}
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                {t("section3Text")}
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>{t("section3Item1")}</li>
                                <li>{t("section3Item2")}</li>
                                <li>{t("section3Item3")}</li>
                                <li>{t("section3Item4")}</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                {t("section4Title")}
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                {t("section4Text")}
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>{t("section4Item1")}</li>
                                <li>{t("section4Item2")}</li>
                                <li>{t("section4Item3")}</li>
                                <li>{t("section4Item4")}</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                {t("section5Title")}
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                {t("section5Text")}
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>{t("section5Item1")}</li>
                                <li>{t("section5Item2")}</li>
                                <li>{t("section5Item3")}</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                {t("section6Title")}
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                {t("section6Text")}
                                <br /><br />
                                {t("contactEmail")}<br />
                                {t("contactPhone")}
                            </p>
                        </section>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link href="/" style={{ color: '#E63946', fontWeight: 600, textDecoration: 'none' }}>
                            {t("backHome")}
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
            <BottomNav />
        </>
    );
}
