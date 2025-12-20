import Link from "next/link";
import { BottomNav, Footer } from "../components";
import { getTranslations } from "next-intl/server";

export const metadata = {
    title: "Privacy Policy - Zinu Rooms",
    description: "Privacy Policy for Zinu Rooms hotel booking platform.",
};

export default async function PrivacyPage() {
    const t = await getTranslations("privacy");

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
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                {t("section1Text")}
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>{t("section1Item1")}</li>
                                <li>{t("section1Item2")}</li>
                                <li>{t("section1Item3")}</li>
                                <li>{t("section1Item4")}</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                {t("section2Title")}
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8, marginBottom: '1rem' }}>
                                {t("section2Text")}
                            </p>
                            <ul style={{ color: '#64748B', lineHeight: 1.8, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                                <li>{t("section2Item1")}</li>
                                <li>{t("section2Item2")}</li>
                                <li>{t("section2Item3")}</li>
                                <li>{t("section2Item4")}</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                {t("section3Title")}
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                {t("section3Text")}
                            </p>
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
                                <li>{t("section5Item4")}</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                {t("section6Title")}
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                {t("section6Text")}
                            </p>
                        </section>

                        <section style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D3557', marginBottom: '1rem' }}>
                                {t("section7Title")}
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.8 }}>
                                {t("section7Text")}
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
