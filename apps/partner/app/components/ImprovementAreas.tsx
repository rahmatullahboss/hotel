import { FiThermometer, FiWifi, FiDroplet } from "react-icons/fi";

interface IssueItem {
    type: "ac" | "wifi" | "washroom" | "other";
    roomCount: number;
    roomNumbers: string;
    issues: string[];
}

interface ImprovementAreasProps {
    items: IssueItem[];
}

const iconMap = {
    ac: FiThermometer,
    wifi: FiWifi,
    washroom: FiDroplet,
    other: FiDroplet,
};

const labelMap = {
    ac: "AC",
    wifi: "Wi-Fi",
    washroom: "Washroom",
    other: "Other",
};

export function ImprovementAreas({ items }: ImprovementAreasProps) {
    if (items.length === 0) return null;

    return (
        <section>
            <h2 className="oyo-section-title">Improvement areas</h2>

            <div className="oyo-card">
                <div className="oyo-card-body" style={{ padding: "0 1.25rem" }}>
                    <div className="oyo-improve-table">
                        {items.map((item, i) => {
                            const Icon = iconMap[item.type] || FiDroplet;
                            return (
                                <div key={i} className="oyo-improve-row">
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <div className="oyo-improve-icon">
                                            <Icon size={16} />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{labelMap[item.type]}</span>
                                    </div>
                                    <span className="oyo-improve-rooms">{item.roomCount} Rooms</span>
                                    <span className="oyo-improve-room-nums">{item.roomNumbers}</span>
                                    <div className="oyo-improve-tags">
                                        {item.issues.map((issue, j) => (
                                            <span key={j} className="oyo-improve-tag">
                                                {issue}
                                            </span>
                                        ))}
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
