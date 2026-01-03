import Link from "next/link";

interface OccupancyData {
    date: string;
    value: number;
    cityAvg: number;
}

interface BookingSourceData {
    source: string;
    count: number;
    revenue: number;
}

interface PerformanceChartsProps {
    occupancyData: OccupancyData[];
    occupancyThisMonth: number;
    bookingSources: BookingSourceData[];
    totalBookings: number;
    avgARR: number;
}

import { Bar, Doughnut } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import "./charts/chartjs-register"; 

export function PerformanceCharts({
    occupancyData,
    occupancyThisMonth,
    bookingSources,
    totalBookings,
    avgARR,
}: PerformanceChartsProps) {
    
    // Occupancy Chart Configuration
    const occupancyChartData: ChartData<'bar'> = {
        labels: occupancyData.map(d => d.date),
        datasets: [
            {
                label: 'Your Occupancy',
                data: occupancyData.map(d => d.value),
                backgroundColor: '#6366f1', // Indigo 500
                borderRadius: 4,
                barThickness: 20,
            },
            {
                label: 'City Avg.',
                data: occupancyData.map(d => d.cityAvg),
                backgroundColor: '#cbd5e1', // Slate 300
                borderRadius: 4,
                barThickness: 20,
            }
        ]
    };

    const occupancyOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 10 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                },
                border: {
                    display: false
                },
                ticks: {
                    font: { size: 10 },
                    callback: (value) => value + '%'
                }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 10 } }
            }
        }
    };

    // Booking Sources Configuration
    const sourceChartData: ChartData<'doughnut'> = {
        labels: bookingSources.map(s => s.source),
        datasets: [{
            data: bookingSources.map(s => s.count),
            backgroundColor: [
                '#3b82f6', // blue-500
                '#8b5cf6', // violet-500
                '#f43f5e', // rose-500
                '#22c55e', // green-500
                '#eab308'  // yellow-500
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    return (
        <section style={{ gridColumn: 'span 1 / span 1', display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }} className="lg:col-span-3 lg:grid-cols-2">
            
            {/* Occupancy Card */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(241, 245, 249, 1)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Occupancy</h2>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#059669',
                            background: '#ecfdf5',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            marginTop: '4px',
                            display: 'inline-block'
                        }}>
                            {occupancyThisMonth}% This Month
                        </span>
                    </div>
                </div>
                <div style={{ flex: 1, width: '100%', minHeight: '200px', display: 'flex', alignItems: 'flex-end' }}>
                    <Bar data={occupancyChartData} options={occupancyOptions} />
                </div>
            </div>

            {/* Booking Sources Card */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(241, 245, 249, 1)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Sources</h2>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#94a3b8' }}>
                            {totalBookings} Total Bookings
                        </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                         <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg ARR</span>
                         <span style={{ fontWeight: 'bold', color: '#1e293b' }}>৳{avgARR}</span>
                    </div>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }} className="md:flex-row">
                    <div style={{ position: 'relative', width: '128px', height: '128px', flexShrink: 0 }}>
                        <Doughnut 
                            data={sourceChartData} 
                            options={{
                                cutout: '70%',
                                plugins: { legend: { display: false } }
                            }} 
                        />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>{totalBookings}</span>
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
                        {bookingSources.map((source, idx) => {
                            const bgColors = (sourceChartData.datasets?.[0]?.backgroundColor as string[]) || [];
                            const color = bgColors[idx] || '#cbd5e1';
                            
                            return (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    background: '#f8fafc',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{source.source}</span>
                                    </div>
                                    <div style={{ fontSize: '12px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{source.count}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Ranking Card - Redesigned
interface RankingCardProps {
    occupancyRank?: number | null;
    occupancyChange?: "up" | "down" | "same";
    arrRank?: string | number | null;
    guestExpRank?: string | number | null;
}

export function RankingCard({ occupancyRank, occupancyChange, arrRank, guestExpRank }: RankingCardProps) {
    const formatRank = (value: string | number | null | undefined) => {
        if (value === null || value === undefined) return "—";
        return `#${value}`;
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f1f5f9',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{
                       width: '40px',
                       height: '40px',
                       borderRadius: '16px',
                       background: '#ede9fe',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: '#7c3aed'
                   }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                            <path d="M4 22h16"/>
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                        </svg>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                            Rankings
                        </h2>
                         <span style={{ fontSize: '12px', fontWeight: '500', color: '#94a3b8' }}>Last 7 Days</span>
                    </div>
                </div>
                <Link 
                    href="/portfolio" 
                    style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        background: '#f8fafc',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        border: '1px solid #e2e8f0',
                        textDecoration: 'none'
                    }}
                >
                    Details
                </Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Occupancy</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {occupancyChange === "up" && <span style={{ fontSize: '12px', color: '#10b981' }}>▲</span>}
                        {occupancyChange === "down" && <span style={{ fontSize: '12px', color: '#f43f5e' }}>▼</span>}
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{formatRank(occupancyRank)}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>ARR</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{formatRank(arrRank)}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Guest Exp.</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{formatRank(guestExpRank)}</span>
                </div>
            </div>
        </div>
    );
}

// Guest Experience Card - Redesigned
interface GuestExpCardProps {
    happyPercent: number;
    unhappyPercent: number;
    level: number;
}

export function GuestExpCard({ happyPercent, unhappyPercent, level }: GuestExpCardProps) {
    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f1f5f9',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{
                       width: '40px',
                       height: '40px',
                       borderRadius: '16px',
                       background: '#ffe4e6',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: '#e11d48'
                   }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/>
                            <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/>
                            <path d="M2 21h20"/>
                            <path d="M7 8v2"/>
                            <path d="M17 8v2"/>
                            <path d="M12 5a3 3 0 0 0-3 3v2h6V8a3 3 0 0 0-3-3Z"/>
                        </svg>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                            Guest Exp
                        </h2>
                         <span style={{ fontSize: '12px', fontWeight: '500', color: '#94a3b8' }}>Last 10 Days</span>
                    </div>
                </div>
                <Link 
                    href="/reviews" 
                    style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        background: '#f8fafc',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        border: '1px solid #e2e8f0',
                        textDecoration: 'none'
                    }}
                >
                    Details
                </Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                        <span style={{ fontWeight: '600', color: '#059669' }}>Happy Guests</span>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{happyPercent}%</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#10b981', borderRadius: '9999px', width: `${happyPercent}%`, transition: 'width 1s ease-out' }}></div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                        <span style={{ fontWeight: '600', color: '#e11d48' }}>Unhappy Guests</span>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{unhappyPercent}%</span>
                    </div>
                     <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#f43f5e', borderRadius: '9999px', width: `${unhappyPercent}%`, transition: 'width 1s ease-out' }}></div>
                    </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>3C Experience Level</span>
                    <span style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{level}</span>
                </div>
            </div>
            
             {/* Decorative background blob */}
            <div style={{
                position: 'absolute',
                bottom: '-48px',
                right: '-48px',
                width: '128px',
                height: '128px',
                background: '#ffe4e6',
                borderRadius: '9999px',
                filter: 'blur(48px)',
                opacity: 0.5,
                pointerEvents: 'none'
            }}></div>
        </div>
    );
}
