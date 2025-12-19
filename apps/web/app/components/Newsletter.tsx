"use client";

import { FaPaperPlane, FaLock } from "react-icons/fa";

export function Newsletter() {
    return (
        <section className="newsletter-section">
            <div className="newsletter-card-premium">
                <div className="glow-effect" />
                <div className="newsletter-content">
                    <div className="icon-wrapper">
                        <FaLock />
                    </div>
                    <h2 className="newsletter-title">Unlock Secret Member Prices</h2>
                    <p className="newsletter-desc">
                        Sign up for free and get up to <strong>50% OFF</strong> on selected hotels with our exclusive member deals.
                    </p>

                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="newsletter-input"
                            required
                        />
                        <button type="submit" className="newsletter-btn">
                            <FaPaperPlane /> Join Elite
                        </button>
                    </form>
                    <p className="newsletter-disclaimer">
                        We respect your privacy. No spam, ever.
                    </p>
                </div>
            </div>

            <style jsx>{`
                .newsletter-section {
                    /* Padding handled by parent */
                }

                .newsletter-card-premium {
                    background: linear-gradient(135deg, #112240 0%, #0A192F 100%);
                    border-radius: 2rem;
                    padding: 4rem 2rem;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    text-align: center;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    max-width: 900px;
                    margin: 0 auto;
                }

                /* Animated Glow */
                .glow-effect {
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle at center, rgba(230, 57, 70, 0.15) 0%, transparent 60%);
                    animation: pulseGlow 5s ease-in-out infinite;
                    pointer-events: none;
                }

                .newsletter-content {
                    position: relative;
                    z-index: 10;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .icon-wrapper {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 72px;
                    height: 72px;
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    border-radius: 50%;
                    font-size: 1.75rem;
                    margin-bottom: 2rem;
                    color: #D4AF37; /* Gold */
                    box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
                }

                .newsletter-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    background: linear-gradient(to right, #fff, #cbd5e1);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .newsletter-desc {
                    font-size: 1.15rem;
                    margin-bottom: 2.5rem;
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.6;
                }
                
                .newsletter-desc strong {
                    color: #D4AF37;
                }

                .newsletter-form {
                    display: flex;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.5rem;
                    border-radius: 9999px;
                    margin-bottom: 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }
                
                .newsletter-form:focus-within {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
                }

                .newsletter-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    padding: 1rem 1.5rem;
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    font-family: 'Inter', sans-serif;
                }

                .newsletter-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .newsletter-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, #E63946 0%, #D32F2F 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 9999px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(230, 57, 70, 0.4);
                }

                .newsletter-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(230, 57, 70, 0.5);
                }

                .newsletter-disclaimer {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.5);
                }

                @media (max-width: 640px) {
                    .newsletter-form {
                        flex-direction: column;
                        background: transparent;
                        padding: 0;
                        border: none;
                        border-radius: 0;
                    }

                    .newsletter-input {
                        background: rgba(255, 255, 255, 0.08);
                        border-radius: 12px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        text-align: center;
                    }

                    .newsletter-btn {
                        width: 100%;
                        justify-content: center;
                        padding: 1rem;
                    }
                    
                    .newsletter-title {
                        font-size: 2rem;
                    }
                }
            `}</style>
        </section>
    );
}
