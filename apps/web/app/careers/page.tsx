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

                    {/* Why Join Us */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-[#1D3557] text-center mb-10 font-serif">
                            {t("whyJoinTitle")}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                                <div className="flex justify-center mb-4">
                                    <FiTrendingUp size={40} className="text-[#E63946]" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg text-[#1D3557]">{t("benefit1Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("benefit1Description")}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                                <div className="flex justify-center mb-4">
                                    <FiUsers size={40} className="text-[#E63946]" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg text-[#1D3557]">{t("benefit2Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("benefit2Description")}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                                <div className="flex justify-center mb-4">
                                    <FiBriefcase size={40} className="text-[#E63946]" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg text-[#1D3557]">{t("benefit3Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("benefit3Description")}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                                <div className="flex justify-center mb-4">
                                    <FiHeart size={40} className="text-[#E63946]" />
                                </div>
                                <h3 className="mb-3 font-bold text-lg text-[#1D3557]">{t("benefit4Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("benefit4Description")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Open Positions Section */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-[#1D3557] text-center mb-8 font-serif">
                            {t("openPositionsTitle")}
                        </h2>

                        <div className="bg-slate-100 rounded-3xl p-12 text-center">
                            <div className="flex justify-center mb-6">
                                <FiBriefcase size={60} className="text-[#E63946]" />
                            </div>
                            <h3 className="mb-4 text-2xl font-bold text-[#1D3557]">{t("noOpeningsTitle")}</h3>
                            <p className="text-slate-500 mb-8 max-w-[600px] mx-auto leading-relaxed">
                                {t("noOpeningsDescription")}
                            </p>
                            <Link href="/contact" className="inline-flex items-center gap-2 bg-[#E63946] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#d32f2f] transition-colors">
                                {t("getInTouchButton")}
                            </Link>
                        </div>
                    </div>

                    {/* Application Process */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-[#1D3557] text-center mb-8 font-serif">
                            {t("processTitle")}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl p-6 text-center shadow-md shadow-black/5">
                                <div className="w-12 h-12 bg-[#E63946] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                                    1
                                </div>
                                <h3 className="mb-2 font-bold text-[#1D3557]">{t("step1Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("step1Description")}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 text-center shadow-md shadow-black/5">
                                <div className="w-12 h-12 bg-[#E63946] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                                    2
                                </div>
                                <h3 className="mb-2 font-bold text-[#1D3557]">{t("step2Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("step2Description")}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 text-center shadow-md shadow-black/5">
                                <div className="w-12 h-12 bg-[#E63946] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                                    3
                                </div>
                                <h3 className="mb-2 font-bold text-[#1D3557]">{t("step3Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {t("step3Description")}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 text-center shadow-md shadow-black/5">
                                <div className="w-12 h-12 bg-[#E63946] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                                    4
                                </div>
                                <h3 className="mb-2 font-bold text-[#1D3557]">{t("step4Title")}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
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
