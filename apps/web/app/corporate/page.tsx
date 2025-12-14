"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiBriefcase, FiHome, FiUser, FiMail, FiPhone, FiMapPin, FiCheck } from "react-icons/fi";
import { BottomNav } from "@/app/components";
import { submitCorporateApplication, getCorporateAccount } from "@/app/actions/corporate";
import { useEffect, useTransition } from "react";

import "./corporate.css";

export default function CorporatePage() {
    const t = useTranslations("corporate");
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [hasAccount, setHasAccount] = useState<boolean | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        companyName: "",
        registrationNumber: "",
        industry: "",
        companySize: "",
        website: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        contactDesignation: "",
        address: "",
        city: "",
        billingEmail: "",
    });

    useEffect(() => {
        checkAccount();
    }, []);

    async function checkAccount() {
        const account = await getCorporateAccount();
        if (account) {
            router.push("/corporate/dashboard");
        } else {
            setHasAccount(false);
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!formData.companyName || !formData.contactName || !formData.contactEmail || !formData.contactPhone) {
            setError(t("requiredFields"));
            return;
        }

        startTransition(async () => {
            const result = await submitCorporateApplication(formData);
            if (result.success) {
                setSubmitted(true);
            } else {
                setError(result.error || t("submitError"));
            }
        });
    }

    if (hasAccount === null) {
        return (
            <div className="corporate-page">
                <div className="corporate-loading">
                    <div className="loading-spinner" />
                </div>
                <BottomNav />
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="corporate-page">
                <div className="corporate-success">
                    <div className="success-icon">
                        <FiCheck />
                    </div>
                    <h1>{t("applicationSubmitted")}</h1>
                    <p>{t("reviewMessage")}</p>
                    <button className="btn btn-primary" onClick={() => router.push("/")}>
                        {t("backToHome")}
                    </button>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="corporate-page">
            <header className="corporate-header">
                <FiBriefcase className="header-icon" />
                <h1>{t("title")}</h1>
                <p>{t("subtitle")}</p>
            </header>

            <section className="corporate-benefits">
                <h2>{t("whyCorporate")}</h2>
                <div className="benefits-grid">
                    <div className="benefit-item">
                        <span className="benefit-icon">💰</span>
                        <span className="benefit-text">{t("benefit1")}</span>
                    </div>
                    <div className="benefit-item">
                        <span className="benefit-icon">📊</span>
                        <span className="benefit-text">{t("benefit2")}</span>
                    </div>
                    <div className="benefit-item">
                        <span className="benefit-icon">🧾</span>
                        <span className="benefit-text">{t("benefit3")}</span>
                    </div>
                    <div className="benefit-item">
                        <span className="benefit-icon">👥</span>
                        <span className="benefit-text">{t("benefit4")}</span>
                    </div>
                </div>
            </section>

            <form className="corporate-form" onSubmit={handleSubmit}>
                <h2>{t("applyNow")}</h2>

                {/* Company Info */}
                <div className="form-section">
                    <h3><FiHome /> {t("companyInfo")}</h3>
                    <div className="form-group">
                        <label>{t("companyName")} *</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder={t("companyNamePlaceholder")}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t("registrationNumber")}</label>
                            <input
                                type="text"
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                placeholder={t("registrationPlaceholder")}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t("industry")}</label>
                            <select name="industry" value={formData.industry} onChange={handleChange}>
                                <option value="">{t("selectIndustry")}</option>
                                <option value="IT">IT & Technology</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Finance">Finance</option>
                                <option value="Retail">Retail</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t("companySize")}</label>
                            <select name="companySize" value={formData.companySize} onChange={handleChange}>
                                <option value="">{t("selectSize")}</option>
                                <option value="1-50">1-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="500+">500+ employees</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t("website")}</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Person */}
                <div className="form-section">
                    <h3><FiUser /> {t("contactPerson")}</h3>
                    <div className="form-group">
                        <label>{t("contactName")} *</label>
                        <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label><FiMail /> {t("contactEmail")} *</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><FiPhone /> {t("contactPhone")} *</label>
                            <input
                                type="tel"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t("designation")}</label>
                        <input
                            type="text"
                            name="contactDesignation"
                            value={formData.contactDesignation}
                            onChange={handleChange}
                            placeholder={t("designationPlaceholder")}
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="form-section">
                    <h3><FiMapPin /> {t("address")}</h3>
                    <div className="form-group">
                        <label>{t("officeAddress")}</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t("city")}</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t("billingEmail")}</label>
                            <input
                                type="email"
                                name="billingEmail"
                                value={formData.billingEmail}
                                onChange={handleChange}
                                placeholder={t("billingEmailPlaceholder")}
                            />
                        </div>
                    </div>
                </div>

                {error && <p className="form-error">{error}</p>}

                <button type="submit" className="btn btn-primary btn-block" disabled={isPending}>
                    {isPending ? t("submitting") : t("submitApplication")}
                </button>
            </form>

            <BottomNav />
        </div>
    );
}
