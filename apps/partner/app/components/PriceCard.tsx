"use client";

import Link from "next/link";

interface Room {
    id: string;
    name: string;
    type: string;
    basePrice: number;
    currentPrice: number;
}

interface PriceCardProps {
    rooms: Room[];
    hotelId: string;
    promotionPercent?: number;
}

// Format price with proper comma separators (e.g., 1,500)
const formatPrice = (price: number | string | undefined | null): string => {
    const numPrice = Number(price) || 0;
    return numPrice.toLocaleString('en-IN');
};

export function PriceCard({ rooms, hotelId, promotionPercent = 0 }: PriceCardProps) {
    // Calculate discounted price if promotion is active
    const hasPromotion = promotionPercent > 0;
    const applyDiscount = (price: number) => {
        if (!hasPromotion) return price;
        return Math.round(price * (1 - promotionPercent / 100));
    };

    return (
        <div 
            style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{
                       width: '40px',
                       height: '40px',
                       borderRadius: '16px',
                       background: '#d1fae5',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: '#059669'
                   }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                            Price
                        </h2>
                         {hasPromotion && (
                            <span style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#047857',
                                background: '#ecfdf5',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                border: '1px solid #d1fae5'
                            }}>
                                -{promotionPercent}% Active
                            </span>
                        )}
                    </div>
                </div>
                
                <Link 
                    href={`/settings/pricing`} 
                    style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        background: '#f8fafc',
                        padding: '6px 16px',
                        borderRadius: '9999px',
                        border: '1px solid #e2e8f0',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    Modify
                </Link>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rooms.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '14px' }}>
                        No rooms configured.
                    </div>
                ) : (
                    rooms.map((room) => (
                        <div key={room.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            borderRadius: '16px',
                            border: '1px solid transparent',
                            background: 'transparent',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>{room.name}</span>
                                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{room.type}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                {hasPromotion && (
                                    <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                                        ৳{formatPrice(room.basePrice)}
                                    </span>
                                )}
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: hasPromotion ? '#059669' : '#334155' }}>
                                    ৳{formatPrice(applyDiscount(room.basePrice))}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Decorative background blob */}
            <div style={{
                position: 'absolute',
                bottom: '-48px',
                right: '-48px',
                width: '128px',
                height: '128px',
                background: '#ecfdf5',
                borderRadius: '9999px',
                filter: 'blur(48px)',
                opacity: 0.5,
                pointerEvents: 'none'
            }}></div>
        </div>
    );
}
