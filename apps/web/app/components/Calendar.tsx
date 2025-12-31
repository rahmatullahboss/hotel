"use client";

import { useState, useMemo } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface CalendarProps {
  selectedDate?: Date;
  onSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  locale?: "en" | "bn";
  className?: string;
}

// Bengali numerals
const toBengaliNumeral = (num: number): string => {
  const bengaliNumerals = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((d) => bengaliNumerals[parseInt(d)] || d)
    .join("");
};

// Month names
const monthNames = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  bn: [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ],
};

// Day names
const dayNames = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  bn: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"],
};

export function Calendar({
  selectedDate,
  onSelect,
  minDate,
  maxDate,
  locale = "bn",
  className = "",
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get days in month
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [year, month]);

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
    return false;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatNumber = (num: number): string => {
    return locale === "bn" ? toBengaliNumeral(num) : num.toString();
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HiChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="font-semibold text-gray-900">
          {monthNames[locale][month]} {formatNumber(year)}
        </h2>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HiChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames[locale].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-2" />;
          }

          const disabled = isDateDisabled(date);
          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !disabled && onSelect?.(date)}
              disabled={disabled}
              className={`
                p-2 text-sm rounded-lg transition-all
                ${disabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}
                ${today && !selected ? "ring-1 ring-primary text-primary font-semibold" : ""}
                ${selected ? "bg-primary text-white font-semibold hover:bg-primary/90" : ""}
                ${!disabled && !selected && !today ? "text-gray-700" : ""}
              `}
            >
              {formatNumber(date.getDate())}
            </button>
          );
        })}
      </div>

      {/* Locale Toggle */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-2">
        <button
          onClick={() => onSelect && onSelect(new Date())}
          className="text-xs text-primary hover:underline"
        >
          {locale === "bn" ? "আজ" : "Today"}
        </button>
      </div>
    </div>
  );
}
