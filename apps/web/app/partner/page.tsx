import { Footer, BottomNav } from "../components";
import { getTranslations } from "next-intl/server";
import { FiCheckCircle, FiDollarSign, FiTrendingUp, FiUsers } from "react-icons/fi";
import Link from "next/link";

export const metadata = {
    title: "Partner With Us - Vibe Hospitality",
    description: "List your hotel on Vibe Hospitality and reach thousands of travelers across Bangladesh.",
};

export default async function PartnerPage() {
    const t = await getTranslations("partner");
    const tCommon = await getTranslations("common");

    return (
        <>
            <main className="container page-content pt-8">
                <div className="max-w-[1000px] mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="section-title text-4xl mb-4">
                            {t("title")}
                        </h1>
                        <p className="text-xl text-[var(--color-text-secondary)] max-w-[700px] mx-auto mb-8 leading-loose">
                            {t("subtitle")}
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link href="/partner/auth/signin" className="btn-primary min-w-[180px]">
                                {t("partnerLoginButton")}
                            </Link>
                            <Link href="/contact" className="btn-outline min-w-[180px]">
                                {t("contactUsButton")}
                            </Link>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="mb-16">
                        <h2 className="section-title text-center mb-10">
                            {t("benefitsTitle")}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiUsers size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("benefit1Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("benefit1Description")}
                                </p>
                            </div>

                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiTrendingUp size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("benefit2Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("benefit2Description")}
                                </p>
                            </div>

                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiDollarSign size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("benefit3Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("benefit3Description")}
                                </p>
                            </div>

                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiCheckCircle size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("benefit4Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("benefit4Description")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mb-16">
                        <h2 className="section-title text-center mb-8">
                            {t("howItWorksTitle")}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="card p-6 text-center">
                                <div className="w-[50px] h-[50px] bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                                    1
                                </div>
                                <h3 className="mb-2 font-bold">{t("step1Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("step1Description")}
                                </p>
                            </div>

                            <div className="card p-6 text-center">
                                <div className="w-[50px] h-[50px] bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                                    2
                                </div>
                                <h3 className="mb-2 font-bold">{t("step2Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("step2Description")}
                                </p>
                            </div>

                            <div className="card p-6 text-center">
                                <div className="w-[50px] h-[50px] bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                                    3
                                </div>
                                <h3 className="mb-2 font-bold">{t("step3Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("step3Description")}
                                </p>
                            </div>

                            <div className="card p-6 text-center">
                                <div className="w-[50px] h-[50px] bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                                    4
                                </div>
                                <h3 className="mb-2 font-bold">{t("step4Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("step4Description")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mb-16">
                        <h2 className="section-title text-center mb-8">
                            {t("featuresTitle")}
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="card p-6">
                                <h3 className="mb-2 text-[var(--color-primary)] font-bold flex items-center gap-2">
                                    <span>✓</span> {t("feature1Title")}
                                </h3>
                                <p className="text-[var(--color-text-secondary)]">{t("feature1Description")}</p>
                            </div>
                            <div className="card p-6">
                                <h3 className="mb-2 text-[var(--color-primary)] font-bold flex items-center gap-2">
                                    <span>✓</span> {t("feature2Title")}
                                </h3>
                                <p className="text-[var(--color-text-secondary)]">{t("feature2Description")}</p>
                            </div>
                            <div className="card p-6">
                                <h3 className="mb-2 text-[var(--color-primary)] font-bold flex items-center gap-2">
                                    <span>✓</span> {t("feature3Title")}
                                </h3>
                                <p className="text-[var(--color-text-secondary)]">{t("feature3Description")}</p>
                            </div>
                            <div className="card p-6">
                                <h3 className="mb-2 text-[var(--color-primary)] font-bold flex items-center gap-2">
                                    <span>✓</span> {t("feature4Title")}
                                </h3>
                                <p className="text-[var(--color-text-secondary)]">{t("feature4Description")}</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="card p-12 text-center bg-[var(--color-primary)] text-white">
                        <h2 className="mb-4 text-white text-3xl font-bold">{t("ctaTitle")}</h2>
                        <p className="mb-8 text-lg opacity-95 max-w-[600px] mx-auto">
                            {t("ctaDescription")}
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link href="/partner/auth/signin" className="btn-outline min-w-[180px] bg-white text-[var(--color-primary)] border-white hover:bg-gray-100 hover:border-gray-100">
                                {t("getStartedButton")}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <BottomNav />
        </>
    );
}
