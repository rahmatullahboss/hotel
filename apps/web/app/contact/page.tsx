import { Footer, BottomNav } from "../components";
import { getTranslations } from "next-intl/server";
import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";

export const metadata = {
    title: "Contact Us - Vibe Hospitality",
    description: "Get in touch with Vibe Hospitality. We're here to help with your booking questions and travel needs.",
};

export default async function ContactPage() {
    const t = await getTranslations("contact");
    const tCommon = await getTranslations("common");

    return (
        <>
            <main className="container page-content pt-8">
                <div className="max-w-[1000px] mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="section-title text-4xl mb-4">
                            {t("title")}
                        </h1>
                        <p className="text-xl text-[var(--color-text-secondary)] max-w-[600px] mx-auto">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Contact Information Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Email */}
                        <div className="card p-8 text-center">
                            <div className="w-[60px] h-[60px] bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiMail size={28} color="white" />
                            </div>
                            <h3 className="mb-2 font-bold text-lg">Email</h3>
                            <p className="text-[var(--color-text-secondary)] mb-2">
                                {t("emailLabel")}
                            </p>
                            <a href="mailto:support@vibehospitality.com" className="text-[var(--color-primary)] font-semibold hover:underline">
                                support@vibehospitality.com
                            </a>
                        </div>

                        {/* Phone */}
                        <div className="card p-8 text-center">
                            <div className="w-[60px] h-[60px] bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiPhone size={28} color="white" />
                            </div>
                            <h3 className="mb-2 font-bold text-lg">Phone</h3>
                            <p className="text-[var(--color-text-secondary)] mb-2">
                                {t("phoneLabel")}
                            </p>
                            <a href="tel:+8801570260118" className="text-[var(--color-primary)] font-semibold hover:underline">
                                +880 1570 260118
                            </a>
                        </div>

                        {/* Office Hours */}
                        <div className="card p-8 text-center">
                            <div className="w-[60px] h-[60px] bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiClock size={28} color="white" />
                            </div>
                            <h3 className="mb-2 font-bold text-lg">{t("hoursTitle")}</h3>
                            <p className="text-[var(--color-text-secondary)] mb-2">
                                {t("hoursLabel")}
                            </p>
                            <p className="text-[var(--color-primary)] font-semibold">
                                24/7 Support
                            </p>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="card p-8 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-[50px] h-[50px] bg-[var(--color-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                                <FiMapPin size={24} color="white" />
                            </div>
                            <div>
                                <h3 className="mb-2 font-bold text-lg">{t("addressTitle")}</h3>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    Gulshan Avenue, Gulshan-2<br />
                                    Dhaka 1212, Bangladesh
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-12">
                        <h2 className="section-title text-center mb-8">
                            {t("faqTitle")}
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="card p-6">
                                <h3 className="mb-3 text-[var(--color-primary)] font-bold">
                                    {t("faq1Question")}
                                </h3>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    {t("faq1Answer")}
                                </p>
                            </div>
                            <div className="card p-6">
                                <h3 className="mb-3 text-[var(--color-primary)] font-bold">
                                    {t("faq2Question")}
                                </h3>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    {t("faq2Answer")}
                                </p>
                            </div>
                            <div className="card p-6">
                                <h3 className="mb-3 text-[var(--color-primary)] font-bold">
                                    {t("faq3Question")}
                                </h3>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
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
