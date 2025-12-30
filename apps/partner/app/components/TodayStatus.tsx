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

function AnimatedProgress({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
    const [width, setWidth] = useState(0);
    const percentage = max > 0 ? (value / max) * 100 : 0;

    useEffect(() => {
        const timer = setTimeout(() => setWidth(percentage), 100);
        return () => clearTimeout(timer);
    }, [percentage]);

    return (
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                style={{ width: `${width}%` }} 
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
    // Determine color based on occupancy
    const getOccupancyColor = (occ: number) => {
        if (occ >= 80) return "text-green-600";
        if (occ >= 50) return "text-amber-500";
        return "text-rose-500";
    };
    
    const getProgressBarColor = (occ: number) => {
        if (occ >= 80) return "bg-green-500";
        if (occ >= 50) return "bg-amber-500";
        return "bg-rose-500";
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-transparent">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="text-xl">📊</span> Today&apos;s Status
                </h2>
            </div>

            <div className="p-5">
                {/* Occupancy Gauge */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6 text-center border border-gray-100">
                    <div className={`text-4xl font-bold ${getOccupancyColor(eodOccupancy)} leading-tight`}>
                        {eodOccupancy}%
                    </div>
                    <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">
                        EOD Occupancy • {roomsLeft} rooms left
                    </div>
                    <div className="mt-3 max-w-[80%] mx-auto">
                        <AnimatedProgress 
                            value={eodOccupancy} 
                            max={100} 
                            colorClass={getProgressBarColor(eodOccupancy)} 
                        />
                    </div>
                </div>

                {/* Status rows */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Check-ins remaining</span>
                        <div className="flex items-baseline gap-1">
                            <strong className={`text-lg font-bold ${checkInsLeft > 0 ? "text-green-600" : "text-gray-900"}`}>
                                {String(checkInsLeft).padStart(2, "0")}
                            </strong>
                            <span className="text-xs text-gray-400">/ {totalCheckIns}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500 font-medium">Checkouts remaining</span>
                        <div className="flex items-baseline gap-1">
                            <strong className={`text-lg font-bold ${checkOutsLeft > 0 ? "text-amber-500" : "text-gray-900"}`}>
                                {String(checkOutsLeft).padStart(2, "0")}
                            </strong>
                            <span className="text-xs text-gray-400">/ {totalCheckOuts}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-500 font-medium">Rooms in use</span>
                        <div className="flex items-baseline gap-1">
                            <strong className="text-lg font-bold text-primary">
                                {roomsInUse}
                            </strong>
                            <span className="text-xs text-gray-400">/ {totalRooms}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
