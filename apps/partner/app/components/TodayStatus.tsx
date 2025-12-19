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
        <div className="oyo-card">
            <div className="oyo-card-header">
                <h2 className="oyo-card-title">Today&apos;s Status</h2>
            </div>
            <div className="oyo-card-body" style={{ padding: "0 1.25rem" }}>
                <div className="oyo-status-row">
                    <span className="oyo-status-label">Check-in&apos;s left</span>
                    <span className="oyo-status-value">
                        <strong>{String(checkInsLeft).padStart(2, "0")}</strong>
                        <span> of {totalCheckIns}</span>
                    </span>
                </div>
                <div className="oyo-status-row">
                    <span className="oyo-status-label">Checkout&apos;s left</span>
                    <span className="oyo-status-value">
                        <strong>{String(checkOutsLeft).padStart(2, "0")}</strong>
                        <span> of {totalCheckOuts}</span>
                    </span>
                </div>
                <div className="oyo-status-row">
                    <span className="oyo-status-label">Rooms in Use</span>
                    <span className="oyo-status-value">
                        <strong>{roomsInUse}</strong>
                        <span> of {totalRooms}</span>
                    </span>
                </div>
                <div className="oyo-status-row">
                    <span className="oyo-status-label">EOD occupancy</span>
                    <span className="oyo-status-value">
                        <strong
                            style={{
                                color: eodOccupancy >= 80 ? "#10b981" : eodOccupancy >= 50 ? "#f59e0b" : "#ef4444",
                            }}
                        >
                            {eodOccupancy}%
                        </strong>
                        <span style={{ fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                            {roomsLeft} rooms left
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
}
