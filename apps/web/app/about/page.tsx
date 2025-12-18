import { Footer, BottomNav } from "../components";
import { getTranslations } from "next-intl/server";
import { FiTarget, FiEye, FiHeart, FiUsers, FiAward, FiTrendingUp } from "react-icons/fi";

export const metadata = {
    title: "About Us - Vibe Hospitality",
    description: "Learn about Vibe Hospitality's mission to provide verified, quality hotel accommodations across Bangladesh.",
};

export default async function AboutPage() {
    const t = await getTranslations("about");
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

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="card p-10">
                            <div className="w-[70px] h-[70px] bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-6">
                                <FiTarget size={36} color="white" />
                            </div>
                            <h2 className="mb-4 text-2xl font-bold">{t("missionTitle")}</h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                {t("missionDescription")}
                            </p>
                        </div>

                        <div className="card p-10">
                            <div className="w-[70px] h-[70px] bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-6">
                                <FiEye size={36} color="white" />
                            </div>
                            <h2 className="mb-4 text-2xl font-bold">{t("visionTitle")}</h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                {t("visionDescription")}
                            </p>
                        </div>
                    </div>

                    {/* Our Values */}
                    <div className="mb-16">
                        <h2 className="section-title text-center mb-10">
                            {t("valuesTitle")}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiHeart size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("value1Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("value1Description")}
                                </p>
                            </div>

                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiAward size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("value2Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("value2Description")}
                                </p>
                            </div>

                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiUsers size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("value3Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("value3Description")}
                                </p>
                            </div>

                            <div className="card p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <FiTrendingUp size={40} color="var(--color-primary)" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg">{t("value4Title")}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    {t("value4Description")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="card p-12 mb-12 bg-[var(--color-primary)] text-white">
                        <h2 className="text-center mb-8 text-white font-bold text-2xl">{t("statsTitle")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-5xl font-bold mb-2">30+</div>
                                <div className="text-lg opacity-90">{t("hotelsCount")}</div>
                            </div>
                            <div>
                                <div className="text-5xl font-bold mb-2">9</div>
                                <div className="text-lg opacity-90">{t("citiesCount")}</div>
                            </div>
                            <div>
                                <div className="text-5xl font-bold mb-2">24/7</div>
                                <div className="text-lg opacity-90">{t("supportAvailable")}</div>
                            </div>
                        </div>
                    </div>

                    {/* Why Choose Us */}
                    <div className="mb-12">
                        <h2 className="section-title text-center mb-8">
                            {t("whyChooseTitle")}
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="card p-6">
                                <h3 className="mb-2 text-[var(--color-primary)] font-bold flex items-center gap-2">
                                    <span>✓</span> {t("reason1Title")}
                                </h3>
                                <p className="text-[var(--color-text-secondary)]">{t("reason1Description")}</p>
                            </div>
                            <div className="card p-6">
                                <h3 className="mb-2 text-[var(--color-primary)] font-bold flex items-center gap-2">
                                    <span>✓</span> {t("reason2Title")}
                                </h3>
                                <p className="text-[var(--color-text-secondary)]">{t("reason2Description")}</p>
                            </div>
                            <div className="card p-6">
                                <h3 className="mb-2 text-[var(--color-primary)] font-bold flex items-center gap-2">
                                    <span>✓</span> {t("reason3Title")}
                                </h3>
                                <p className="text-[var(--color-text-secondary)]">{t("reason3Description")}</p>
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
