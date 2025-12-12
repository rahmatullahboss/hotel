import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { label: "About Us", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "Careers", href: "/careers" },
        ],
        support: [
            { label: "Help Center", href: "/help" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
        ],
        partners: [
            { label: "List Your Property", href: "/partner" },
            { label: "Partner Login", href: "/partner/auth/signin" },
        ],
    };

    return (
        <footer className="site-footer">
            <div className="footer-container">
                {/* Brand Section */}
                <div className="footer-brand">
                    <Link href="/" className="footer-logo">
                        <span className="logo-icon">🏨</span>
                        <span className="logo-text">Vibe Hotels</span>
                    </Link>
                    <p className="footer-tagline">
                        Find your perfect stay at the best prices. Pay at hotel, book instantly.
                    </p>
                </div>

                {/* Links Grid */}
                <div className="footer-links-grid">
                    <div className="footer-links-column">
                        <h4 className="footer-column-title">Company</h4>
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
                        <h4 className="footer-column-title">Support</h4>
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
                        <h4 className="footer-column-title">For Partners</h4>
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
                        © {currentYear} Vibe Hotels. All rights reserved.
                    </p>
                    <div className="footer-social">
                        <a href="#" className="social-link" aria-label="Facebook">📘</a>
                        <a href="#" className="social-link" aria-label="Instagram">📸</a>
                        <a href="#" className="social-link" aria-label="Twitter">🐦</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
