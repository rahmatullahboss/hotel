import { Footer, BottomNav } from "../components";
import { getTranslations } from "next-intl/server";
import { FiTarget, FiEye, FiHeart, FiUsers, FiAward, FiTrendingUp, FiCheckCircle } from "react-icons/fi";

export const metadata = {
    title: "About Us - Zinu Rooms",
    description: "Learn about Zinu Rooms' mission to provide verified, quality hotel accommodations across Bangladesh.",
};

export default async function AboutPage() {
    const t = await getTranslations("about");

    return (
        <>
            <main className="pt-8 pb-16 bg-slate-50 min-h-screen">
                <div className="max-w-[1100px] mx-auto px-6">
                    {/* Hero Section */}
                    <div className="text-center mb-16 pt-8">
                        <h1 className="text-4xl font-bold text-[#1D3557] mb-4 font-serif">
                            {t("title")}
                        </h1>
                        <p className="text-lg text-slate-500 max-w-[700px] mx-auto leading-relaxed">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-white rounded-2xl p-10 shadow-lg shadow-black/5">
                            <div className="w-16 h-16 bg-[#E63946] rounded-2xl flex items-center justify-center mb-6">
                                <FiTarget size={32} color="white" />
                            </div>
                            <h2 className="mb-4 text-2xl font-bold text-[#1D3557]">{t("missionTitle")}</h2>
                            <p className="text-slate-500 leading-relaxed">
                                {t("missionDescription")}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-10 shadow-lg shadow-black/5">
                            <div className="w-16 h-16 bg-[#1D3557] rounded-2xl flex items-center justify-center mb-6">
                                <FiEye size={32} color="white" />
                            </div>
                            <h2 className="mb-4 text-2xl font-bold text-[#1D3557]">{t("visionTitle")}</h2>
                            <p className="text-slate-500 leading-relaxed">
                                {t("visionDescription")}
                            </p>
                        </div>
                    </div>

                    {/* Our Values */}
                    <div className="mb-16">
                        <h2 className="text-center text-3xl font-bold text-[#1D3557] mb-10 font-serif">
                            {t("valuesTitle")}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                                <div className="flex justify-center mb-4">
                                    <FiHeart size={36} className="text-[#E63946]" />
                                </div>
                                <h3 className="mb-3 font-semibold text-lg text-[#1D3557]">{t("value1Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("value1Description")}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                                <div className="flex justify-center mb-4">
                                    <FiAward size={36} className="text-[#E63946]" />
                                </div>
                                <h3 className="mb-3 font-semibold text-lg text-[#1D3557]">{t("value2Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("value2Description")}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                                <div className="flex justify-center mb-4">
                                    <FiUsers size={36} className="text-[#E63946]" />
                                </div>
                                <h3 className="mb-3 font-semibold text-lg text-[#1D3557]">{t("value3Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("value3Description")}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                                <div className="flex justify-center mb-4">
                                    <FiTrendingUp size={36} className="text-[#E63946]" />
                                </div>
                                <h3 className="mb-3 font-semibold text-lg text-[#1D3557]">{t("value4Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("value4Description")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="bg-gradient-to-br from-[#E63946] to-[#c62828] rounded-3xl p-12 mb-16 text-white">
                        <h2 className="text-center mb-10 font-bold text-2xl">{t("statsTitle")}</h2>
                        <div className="grid grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-5xl font-bold mb-2">30+</div>
                                <div className="text-base opacity-90">{t("hotelsCount")}</div>
                            </div>
                            <div>
                                <div className="text-5xl font-bold mb-2">9</div>
                                <div className="text-base opacity-90">{t("citiesCount")}</div>
                            </div>
                            <div>
                                <div className="text-5xl font-bold mb-2">24/7</div>
                                <div className="text-base opacity-90">{t("supportAvailable")}</div>
                            </div>
                        </div>
                    </div>

                    {/* Why Choose Us */}
                    <div className="mb-12">
                        <h2 className="text-center text-3xl font-bold text-[#1D3557] mb-8 font-serif">
                            {t("whyChooseTitle")}
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="bg-white rounded-2xl p-6 shadow-md shadow-black/5 flex items-start gap-4">
                                <FiCheckCircle size={24} className="text-[#E63946] shrink-0 mt-1" />
                                <div>
                                    <h3 className="mb-2 text-[#1D3557] font-semibold text-lg">{t("reason1Title")}</h3>
                                    <p className="text-slate-500 leading-relaxed">{t("reason1Description")}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-md shadow-black/5 flex items-start gap-4">
                                <FiCheckCircle size={24} className="text-[#E63946] shrink-0 mt-1" />
                                <div>
                                    <h3 className="mb-2 text-[#1D3557] font-semibold text-lg">{t("reason2Title")}</h3>
                                    <p className="text-slate-500 leading-relaxed">{t("reason2Description")}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-md shadow-black/5 flex items-start gap-4">
                                <FiCheckCircle size={24} className="text-[#E63946] shrink-0 mt-1" />
                                <div>
                                    <h3 className="mb-2 text-[#1D3557] font-semibold text-lg">{t("reason3Title")}</h3>
                                    <p className="text-slate-500 leading-relaxed">{t("reason3Description")}</p>
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
