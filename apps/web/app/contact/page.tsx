import { Footer, BottomNav } from "../components";
import { getTranslations } from "next-intl/server";
import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";

export const metadata = {
    title: "Contact Us - Zinu Rooms",
    description: "Get in touch with Zinu Rooms. We're here to help with your booking questions and travel needs.",
};

export default async function ContactPage() {
    const t = await getTranslations("contact");

    return (
        <>
            <main className="pt-8 pb-16 bg-slate-50 min-h-screen">
                <div className="max-w-[1000px] mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-12 pt-8">
                        <h1 className="text-4xl font-bold text-[#1D3557] mb-4 font-serif">
                            {t("title")}
                        </h1>
                        <p className="text-lg text-slate-500 max-w-[600px] mx-auto leading-relaxed">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Contact Information Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Email */}
                        <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                            <div className="w-16 h-16 bg-[#E63946] rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiMail size={28} color="white" />
                            </div>
                            <h3 className="mb-2 font-bold text-lg text-[#1D3557]">Email</h3>
                            <p className="text-slate-500 mb-2">
                                {t("emailLabel")}
                            </p>
                            <a href="mailto:support@zinurooms.com" className="text-[#E63946] font-semibold hover:underline">
                                support@zinurooms.com
                            </a>
                        </div>

                        {/* Phone */}
                        <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                            <div className="w-16 h-16 bg-[#E63946] rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiPhone size={28} color="white" />
                            </div>
                            <h3 className="mb-2 font-bold text-lg text-[#1D3557]">Phone</h3>
                            <p className="text-slate-500 mb-2">
                                {t("phoneLabel")}
                            </p>
                            <a href="tel:+8801570260118" className="text-[#E63946] font-semibold hover:underline">
                                +880 1570 260118
                            </a>
                        </div>

                        {/* Office Hours */}
                        <div className="bg-white rounded-2xl p-8 text-center shadow-lg shadow-black/5">
                            <div className="w-16 h-16 bg-[#E63946] rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiClock size={28} color="white" />
                            </div>
                            <h3 className="mb-2 font-bold text-lg text-[#1D3557]">{t("hoursTitle")}</h3>
                            <p className="text-slate-500 mb-2">
                                {t("hoursLabel")}
                            </p>
                            <p className="text-[#E63946] font-semibold">
                                24/7 Support
                            </p>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white rounded-2xl p-8 mb-12 shadow-lg shadow-black/5">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-[#1D3557] rounded-full flex items-center justify-center shrink-0">
                                <FiMapPin size={24} color="white" />
                            </div>
                            <div>
                                <h3 className="mb-2 font-bold text-lg text-[#1D3557]">{t("addressTitle")}</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Gulshan Avenue, Gulshan-2<br />
                                    Dhaka 1212, Bangladesh
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-[#1D3557] text-center mb-8 font-serif">
                            {t("faqTitle")}
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="bg-white rounded-2xl p-6 shadow-md shadow-black/5">
                                <h3 className="mb-3 text-[#E63946] font-bold text-lg">
                                    {t("faq1Question")}
                                </h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {t("faq1Answer")}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-md shadow-black/5">
                                <h3 className="mb-3 text-[#E63946] font-bold text-lg">
                                    {t("faq2Question")}
                                </h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {t("faq2Answer")}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-md shadow-black/5">
                                <h3 className="mb-3 text-[#E63946] font-bold text-lg">
                                    {t("faq3Question")}
                                </h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {t("faq3Answer")}
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
