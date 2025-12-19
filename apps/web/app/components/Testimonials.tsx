"use client";

import { FaStar, FaQuoteLeft } from "react-icons/fa";

interface Review {
    id: number;
    name: string;
    location: string;
    avatar: string;
    rating: number;
    text: string;
    stayType: string;
}

const reviews: Review[] = [
    {
        id: 1,
        name: "Sarah K.",
        location: "Dhaka",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
        rating: 5,
        text: "Absolutely amazed by the seamless booking process. The hotel was exactly as described, and the price was unbeatable!",
        stayType: "Family Vacation"
    },
    {
        id: 2,
        name: "Rahim U.",
        location: "Chittagong",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
        rating: 5,
        text: "Zinu Rooms is my go-to for business trips. Clean rooms, instant confirmation, and great support whenever I need it.",
        stayType: "Business Trip"
    },
    {
        id: 3,
        name: "Anika T.",
        location: "Sylhet",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
        rating: 4,
        text: "Loved the 'Pay at Hotel' feature. It gave me peace of mind. The property in Cox's Bazar was stunning.",
        stayType: "Couple Getaway"
    }
];

export function Testimonials() {
    return (
        <section className="testimonials-section">
            <div className="container">
                <div className="section-header-center">
                    <span className="subtitle-badge">Stories</span>
                    <h2 className="section-title-premium" style={{ color: '#1D3557' }}>Voices of Satisfaction</h2>
                    <p className="section-subtitle">
                        Real experiences from guests who found their perfect stay with us.
                    </p>
                </div>

                <div className="reviews-bento">
                    {reviews.map((review, i) => (
                        <div key={review.id} className={`review-card review-card-${i}`}>
                            <div className="review-quote-icon">
                                <FaQuoteLeft />
                            </div>
                            <div className="review-header">
                                <div className="review-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={i < review.rating ? "star-filled" : "star-empty"}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="review-text">"{review.text}"</p>

                            <div className="review-footer">
                                <div className="review-avatar-wrapper">
                                    <img
                                        src={review.avatar}
                                        alt={review.name}
                                        className="review-avatar"
                                    />
                                    <div className="verified-badge">✓</div>
                                </div>
                                <div className="review-author">
                                    <h4 className="author-name">{review.name}</h4>
                                    <span className="stay-location">{review.location}</span>
                                    <span className="stay-type">{review.stayType}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .testimonials-section {
                    /* Padding handled by parent */
                }

                .section-header-center {
                    text-align: center;
                    max-width: 700px;
                    margin: 0 auto 4rem;
                }

                .subtitle-badge {
                    display: inline-block;
                    color: var(--color-primary);
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    margin-bottom: 1rem;
                }

                .section-title-premium {
                    font-family: 'Playfair Display', serif;
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .section-subtitle {
                    color: var(--color-text-secondary);
                    font-size: 1.125rem;
                    line-height: 1.6;
                }

                .reviews-bento {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }

                @media (min-width: 768px) {
                    .reviews-bento {
                        grid-template-columns: repeat(3, 1fr);
                        align-items: start;
                    }
                    
                    /* Make the middle card stand out */
                    .review-card-1 {
                        transform: translateY(-2rem);
                        border-color: var(--color-gold);
                        background: radial-gradient(circle at top right, #fff, #f8fafc);
                    }
                }

                .review-card {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 1.5rem;
                    box-shadow: var(--shadow-md);
                    transition: all 0.4s ease;
                    position: relative;
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .review-card:hover {
                    transform: translateY(-10px);
                    box-shadow: var(--shadow-xl);
                }
                
                @media (min-width: 768px) {
                     .review-card-1:hover {
                        transform: translateY(calc(-2rem - 10px));
                    }
                }

                .review-quote-icon {
                    position: absolute;
                    top: 2rem;
                    right: 2rem;
                    color: rgba(212, 175, 55, 0.1);
                    font-size: 4rem;
                    font-family: serif;
                    line-height: 1;
                }

                .review-header {
                    margin-bottom: 1.5rem;
                }

                .review-stars {
                    display: flex;
                    gap: 0.25rem;
                    color: #D4AF37; /* Gold stars */
                    font-size: 0.9rem;
                }

                .review-text {
                    color: var(--color-text-primary);
                    font-family: 'Playfair Display', serif; /* Editorial feel for quotes */
                    font-size: 1.25rem;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    position: relative;
                    z-index: 1;
                    font-style: italic;
                }

                .review-footer {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(0,0,0,0.05);
                }

                .review-avatar-wrapper {
                    position: relative;
                }

                .review-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid white;
                    box-shadow: var(--shadow-sm);
                }
                
                .verified-badge {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: var(--color-success);
                    color: white;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    font-size: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                }

                .review-author {
                    display: flex;
                    flex-direction: column;
                }

                .author-name {
                    font-weight: 700;
                    color: var(--color-text-primary);
                    font-size: 1rem;
                    margin: 0;
                    letter-spacing: -0.01em;
                }

                .stay-location {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                    text-transform: uppercase;
                    margin-bottom: 2px;
                }

                .stay-type {
                    font-size: 0.8rem;
                    color: var(--color-text-muted);
                }
            `}</style>
        </section>
    );
}
