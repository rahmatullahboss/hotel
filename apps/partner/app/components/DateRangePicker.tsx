"use client";

import { useState } from "react";
import { 
  HiOutlineCalendarDays, 
  HiOutlineChevronDown 
} from "react-icons/hi2";

type DateRange = "today" | "week" | "month" | "quarter" | "custom";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange, startDate?: string, endDate?: string) => void;
  className?: string;
}

const rangeOptions: { value: DateRange; label: string }[] = [
  { value: "today", label: "আজ" },
  { value: "week", label: "এই সপ্তাহ" },
  { value: "month", label: "এই মাস" },
  { value: "quarter", label: "এই কোয়ার্টার" },
];

export function DateRangePicker({ value, onChange, className = "" }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = rangeOptions.find((opt) => opt.value === value);

  const getDateRange = (range: DateRange): { start: string; end: string } => {
    const today = new Date();
    const end = today.toISOString().split("T")[0]!;
    
    let start: Date;
    
    switch (range) {
      case "today":
        start = today;
        break;
      case "week":
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case "month":
        start = new Date(today);
        start.setMonth(today.getMonth() - 1);
        break;
      case "quarter":
        start = new Date(today);
        start.setMonth(today.getMonth() - 3);
        break;
      default:
        start = today;
    }
    
    return {
      start: start.toISOString().split("T")[0]!,
      end,
    };
  };

  const handleSelect = (range: DateRange) => {
    const { start, end } = getDateRange(range);
    onChange(range, start, end);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <HiOutlineCalendarDays className="w-4 h-4 text-gray-500" />
        <span>{selectedOption?.label || "Select"}</span>
        <HiOutlineChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm transition-colors
                  ${value === option.value
                    ? "bg-primary text-white font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
