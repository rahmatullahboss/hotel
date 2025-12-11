// Cancellation reasons for analytics and customer feedback
export const CANCELLATION_REASONS = [
    { value: "PLAN_CHANGED", label: "Plan Changed", labelBn: "পরিকল্পনা পরিবর্তন" },
    { value: "FOUND_BETTER_DEAL", label: "Found Another Hotel", labelBn: "অন্য হোটেল পেয়ে গেছি" },
    { value: "EMERGENCY", label: "Emergency", labelBn: "জরুরি অবস্থা" },
    { value: "TRAVEL_CANCELLED", label: "Travel Cancelled", labelBn: "ভ্রমণ বাতিল হয়েছে" },
    { value: "PRICE_ISSUE", label: "Price Issue", labelBn: "মূল্য সমস্যা" },
    { value: "OTHER", label: "Other", labelBn: "অন্যান্য" },
] as const;

export type CancellationReason = typeof CANCELLATION_REASONS[number]["value"];
