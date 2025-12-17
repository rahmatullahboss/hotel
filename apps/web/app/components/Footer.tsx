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
            <div className="footer-container">
                {/* Brand Section */}
                <div className="footer-brand">
                    <Link href="/" className="footer-logo">
                        <span className="logo-icon"><FaHotel size={24} /></span>
                        <span className="logo-text">ZinoRooms</span>
                    </Link>
                    <p className="footer-tagline">
                        {t("tagline")}
                    </p>
                </div>

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

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        {t("copyright", { year: currentYear })}
                    </p>
                    <div className="footer-social">
                        <a href="#" className="social-link" aria-label="Facebook"><FaFacebookF size={18} /></a>
                        <a href="#" className="social-link" aria-label="Instagram"><FaInstagram size={18} /></a>
                        <a href="#" className="social-link" aria-label="Twitter"><FaTwitter size={18} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
