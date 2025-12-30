// Available amenities for hotels
export const HOTEL_AMENITIES = [
    "WiFi",
    "AC",
    "TV",
    "Parking",
    "Restaurant",
    "Room Service",
    "Laundry",
    "24h Front Desk",
    "Elevator",
    "Power Backup",
    "CCTV",
    "Hot Water",
    "Breakfast Included",
    "Airport Pickup",
];

// Message template interface
export interface MessageTemplate {
    id: string;
    name: string;
    type: "PRE_ARRIVAL" | "WELCOME" | "POST_STAY" | "CUSTOM";
    subject: string;
    body: string;
    isActive: boolean;
    sendTiming: number;
}

// Default message templates for guest communication
export const DEFAULT_TEMPLATES: MessageTemplate[] = [
    {
        id: "pre-arrival",
        name: "Pre-Arrival Message",
        type: "PRE_ARRIVAL",
        subject: "Your stay at {hotelName} is coming up!",
        body: `Dear {guestName},

We're excited to welcome you to {hotelName} on {checkInDate}!

Check-in: {checkInDate} from 2:00 PM
Check-out: {checkOutDate} by 12:00 PM

See you soon!
{hotelName} Team`,
        isActive: true,
        sendTiming: 24,
    },
    {
        id: "welcome",
        name: "Welcome Message",
        type: "WELCOME",
        subject: "Welcome to {hotelName}!",
        body: `Dear {guestName},

Welcome to {hotelName}! We hope you have a wonderful stay.

Need anything? Contact us at the front desk.

Enjoy your stay!`,
        isActive: true,
        sendTiming: 0,
    },
    {
        id: "post-stay",
        name: "Post-Stay Feedback",
        type: "POST_STAY",
        subject: "Thank you for staying at {hotelName}!",
        body: `Dear {guestName},

Thank you for choosing {hotelName}! We'd love to hear your feedback.

We hope to welcome you back soon!

{hotelName} Team`,
        isActive: true,
        sendTiming: 2,
    },
];

// Maintenance type configs with Bengali labels
export const MAINTENANCE_TYPES = [
    { value: "PLUMBING", label: "প্লাম্বিং", icon: "🔧" },
    { value: "ELECTRICAL", label: "ইলেক্ট্রিক্যাল", icon: "⚡" },
    { value: "HVAC", label: "এসি/হিটিং", icon: "❄️" },
    { value: "FURNITURE", label: "ফার্নিচার", icon: "🪑" },
    { value: "CLEANING", label: "ক্লিনিং", icon: "🧹" },
    { value: "APPLIANCE", label: "এপ্লায়েন্স", icon: "📺" },
    { value: "OTHER", label: "অন্যান্য", icon: "🛠️" },
] as const;
