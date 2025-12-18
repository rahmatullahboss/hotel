import { Footer, BottomNav } from "../components";
import { getTranslations } from "next-intl/server";
import { FiBriefcase, FiTrendingUp, FiUsers, FiHeart } from "react-icons/fi";
import Link from "next/link";

export const metadata = {
    title: "Careers - Vibe Hospitality",
    description: "Join the Vibe Hospitality team and help transform hotel booking in Bangladesh.",
};

export default async function CareersPage() {
    const t = await getTranslations("careers");
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
                        <p className="text-xl text-[var(--color-text-secondary)] max-w-[700px] mx-auto leading-loose">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Why Join Us */}
                    <div className="mb-16">
                        <h2 className="section-title text-center mb-10">
                            {t("whyJoinTitle")}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiTrendingUp size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("benefit1Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("benefit1Description")}
                                </p>
                            </div>

                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiUsers size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("benefit2Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("benefit2Description")}
                                </p>
                            </div>

                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiBriefcase size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("benefit3Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("benefit3Description")}
                                </p>
                            </div>

                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiHeart size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("benefit4Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("benefit4Description")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Open Positions Section */}
                    <div className="mb-16">
                        <h2 className="section-title text-center mb-8">
                            {t("openPositionsTitle")}
                        </h2>

                        <div className="card p-12 text-center bg-[var(--color-bg-secondary)]">
                            <div className="flex justify-center mb-6">
                                <FiBriefcase size={60} color="var(--color-primary)" />
                            </div>
                            <h3 className="mb-4 text-2xl font-bold">{t("noOpeningsTitle")}</h3>
                            <p className="text-[var(--color-text-secondary)] mb-8 max-w-[600px] mx-auto">
                                {t("noOpeningsDescription")}
                            </p>
                            <Link href="/contact" className="btn-primary inline-flex">
                                {t("getInTouchButton")}
                            </Link>
                        </div>
                    </div>

                    {/* Application Process */}
                    <div className="mb-12">
                        <h2 className="section-title text-center mb-8">
                            {t("processTitle")}
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
                </div>
            </main>

            <Footer />
            <BottomNav />
        </>
    );
}
