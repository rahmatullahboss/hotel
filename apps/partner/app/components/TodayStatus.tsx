"use client";

import { useEffect, useState } from "react";

interface TodayStatusProps {
    checkInsLeft: number;
    totalCheckIns: number;
    checkOutsLeft: number;
    totalCheckOuts: number;
    roomsInUse: number;
    totalRooms: number;
    eodOccupancy: number;
    roomsLeft: number;
}

function AnimatedProgress({ value, max, color }: { value: number; max: number; color: string }) {
    const [width, setWidth] = useState(0);
    const percentage = max > 0 ? (value / max) * 100 : 0;

    useEffect(() => {
        const timer = setTimeout(() => setWidth(percentage), 100);
        return () => clearTimeout(timer);
    }, [percentage]);

    return (
        <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div 
                style={{ 
                    height: '100%', 
                    borderRadius: '9999px', 
                    transition: 'width 1s ease-out',
                    backgroundColor: color,
                    width: `${width}%` 
                }} 
            />
        </div>
    );
}

export function TodayStatus({
    checkInsLeft,
    totalCheckIns,
    checkOutsLeft,
    totalCheckOuts,
    roomsInUse,
    totalRooms,
    eodOccupancy,
    roomsLeft,
}: TodayStatusProps) {
    
    return (
    <>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{
                     width: '28px',
                     height: '28px',
                     borderRadius: '8px',
                     background: '#eef2ff',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     color: '#4f46e5'
                 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="3" x2="9" y2="21"/>
                    </svg>
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                    Today&apos;s Status
                </h2>
            </div>
             <div style={{
                 padding: '4px 10px',
                 borderRadius: '9999px',
                 fontSize: '11px',
                 fontWeight: 'bold',
                 border: `1px solid ${eodOccupancy >= 70 ? '#d1fae5' : eodOccupancy >= 40 ? '#fef3c7' : '#ffe4e6'}`,
                 background: eodOccupancy >= 70 ? '#ecfdf5' : eodOccupancy >= 40 ? '#fffbeb' : '#fff1f2',
                 color: eodOccupancy >= 70 ? '#059669' : eodOccupancy >= 40 ? '#d97706' : '#e11d48'
             }}>
                {eodOccupancy}% Occupancy
            </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            {/* Left Column - Circular Chart */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                paddingRight: '12px',
                borderRight: '1px solid #f1f5f9',
                minWidth: '100px'
            }}>
                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={eodOccupancy >= 70 ? '#10b981' : eodOccupancy >= 50 ? '#f59e0b' : '#f43f5e'}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 * (1 - eodOccupancy / 100)}
                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                            strokeLinecap="round"
                         />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ 
                            fontSize: '18px', 
                            fontWeight: 'bold',
                            color: eodOccupancy >= 70 ? '#059669' : eodOccupancy >= 50 ? '#d97706' : '#e11d48'
                        }}>
                            {eodOccupancy}%
                        </span>
                        <span style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Occupied</span>
                    </div>
                </div>
                
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                        {roomsInUse} <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'normal' }}>/ {totalRooms}</span>
                    </p>
                    <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '500', margin: 0 }}>Active Rooms</p>
                </div>
            </div>

            {/* Right Column - Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '10px' }}>
                {/* Check-ins */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Check-ins</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>{totalCheckIns - checkInsLeft}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>/ {totalCheckIns}</span>
                    </div>
                    <AnimatedProgress value={totalCheckIns - checkInsLeft} max={totalCheckIns} color="#3b82f6" />
                </div>

                {/* Check-outs */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Check-outs</span>
                    </div>
                     <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>{totalCheckOuts - checkOutsLeft}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>/ {totalCheckOuts}</span>
                    </div>
                    <AnimatedProgress value={totalCheckOuts - checkOutsLeft} max={totalCheckOuts} color="#f97316" />
                </div>

                {/* Available Rooms */}
                 <div style={{ 
                     background: '#f8fafc', 
                     borderRadius: '10px', 
                     padding: '10px', 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'space-between'
                 }}>
                    <div>
                        <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>AVAILABLE</p>
                        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{roomsLeft} Rooms</p>
                    </div>
                    <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '9999px', 
                        background: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#94a3b8', 
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </>
  );
}
