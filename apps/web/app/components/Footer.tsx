"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FaHotel, FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export function Footer() {
    const t = useTranslations("footer");
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { label: t("about"), href: "/about" },
            { label: t("contact"), href: "/contact" },
            { label: t("careers"), href: "/careers" },
        ],
        support: [
            { label: t("helpCenter"), href: "/help" },
            { label: t("terms"), href: "/terms" },
            { label: t("privacy"), href: "/privacy" },
        ],
        partners: [
            { label: t("listProperty"), href: "/partner" },
            { label: t("partnerLogin"), href: "/partner/auth/signin" },
        ],
    };

    return (
        <footer className="site-footer">
            <div className="container footer-container">
                {/* Brand Section */}
                <div className="footer-brand-section">
                    <Link href="/" className="footer-logo">
                        <img src="/logo.png" alt="Zinu Rooms" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                        <span className="logo-text">Zinu Rooms</span>
                    </Link>
                    <p className="footer-tagline">
                        {t("tagline") || "Redefining luxury across the nation."}
                    </p>
                    <div className="footer-social">
                        <a href="#" className="social-link" aria-label="Facebook"><FaFacebookF /></a>
                        <a href="#" className="social-link" aria-label="Instagram"><FaInstagram /></a>
                        <a href="#" className="social-link" aria-label="Twitter"><FaTwitter /></a>
                    </div>
                </div>

                {/* Links Divider */}
                <div className="footer-divider-vertical"></div>

                {/* Links Grid */}
                <div className="footer-links-grid">
                    <div className="footer-links-column">
                        <h4 className="footer-column-title">{t("about")}</h4>
                        <ul className="footer-links-list">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="footer-link">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h4 className="footer-column-title">{t("support")}</h4>
                        <ul className="footer-links-list">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="footer-link">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h4 className="footer-column-title">{t("partners")}</h4>
                        <ul className="footer-links-list">
                            {footerLinks.partners.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="footer-link">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <div className="container footer-bottom-container">
                    <p className="footer-copyright">
                        &copy; {currentYear} Zinu Rooms. {t("copyright", { year: "" }).replace(/\d{4}/, '').trim()}
                    </p>
                    <div className="footer-legal-links">
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .site-footer {
                    background-color: #050d1a; /* Even darker than the main navy */
                    color: white;
                    padding-top: 6rem;
                    position: relative;
                    overflow: hidden;
                }
                
                /* Decorative Top Border */
                .site-footer::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
                }

                .footer-container {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 4rem;
                }

                @media (min-width: 1024px) {
                    .footer-container {
                        grid-template-columns: 1.5fr 1px 2fr;
                        align-items: start;
                    }
                }

                .footer-brand-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .footer-logo {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    text-decoration: none;
                    color: white;
                }

                .logo-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #E63946 0%, #D32F2F 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    box-shadow: 0 4px 20px rgba(230, 57, 70, 0.4);
                }

                .logo-text {
                    font-family: 'Playfair Display', serif;
                    font-size: 2rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }

                .footer-tagline {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 1.125rem;
                    line-height: 1.6;
                    max-width: 400px;
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                }

                .footer-divider-vertical {
                    display: none;
                    width: 1px;
                    height: 100%;
                    min-height: 200px;
                    background: linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent);
                }

                @media (min-width: 1024px) {
                    .footer-divider-vertical {
                        display: block;
                    }
                }

                .footer-links-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 3rem;
                }

                @media (min-width: 768px) {
                    .footer-links-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .footer-column-title {
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: #D4AF37; /* Gold */
                    margin-bottom: 2rem;
                }

                .footer-links-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .footer-link {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                }

                .footer-link:hover {
                    color: white;
                    transform: translateX(4px);
                }

                .footer-social {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .social-link {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    transition: all 0.3s ease;
                }

                .social-link:hover {
                    background: white;
                    color: #0A192F;
                    transform: translateY(-4px);
                }

                .footer-bottom {
                    margin-top: 5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 2rem 0;
                    background: rgba(0,0,0,0.2);
                }

                .footer-bottom-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    text-align: center;
                }

                @media (min-width: 768px) {
                    .footer-bottom-container {
                        flex-direction: row;
                        justify-content: space-between;
                        text-align: left;
                    }
                }

                .footer-copyright {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.875rem;
                }
                
                .footer-legal-links {
                    display: flex;
                    gap: 2rem;
                }
                
                .footer-legal-links a {
                    color: rgba(255, 255, 255, 0.4);
                    text-decoration: none;
                    font-size: 0.875rem;
                    transition: color 0.2s;
                }
                
                .footer-legal-links a:hover {
                    color: white;
                }
            `}</style>
        </footer>
    );
}
