"use client";

import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

interface DatePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDate: (date: string) => void;
    selectedDate: string;
    minDate?: string;
    title?: string;
}

export function DatePickerModal({
    isOpen,
    onClose,
    onSelectDate,
    selectedDate,
    minDate,
    title = "Select Date"
}: DatePickerModalProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (isOpen && selectedDate) {
            setCurrentMonth(new Date(selectedDate));
        }
    }, [isOpen, selectedDate]);

    if (!isOpen) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDateObj = minDate ? new Date(minDate) : today;
    minDateObj.setHours(0, 0, 0, 0);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        const days: (Date | null)[] = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }
        
        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    };

    const days = getDaysInMonth(currentMonth);

    const goToPreviousMonth = () => {
        setAnimating(true);
        setTimeout(() => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
            setAnimating(false);
        }, 150);
    };

    const goToNextMonth = () => {
        setAnimating(true);
        setTimeout(() => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
            setAnimating(false);
        }, 150);
    };

    const handleDateClick = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0]!;
        onSelectDate(dateStr);
        onClose();
    };

    const isDateDisabled = (date: Date) => {
        return date < minDateObj;
    };

    const isDateSelected = (date: Date) => {
        return date.toISOString().split("T")[0] === selectedDate;
    };

    const isToday = (date: Date) => {
        const todayStr = today.toISOString().split("T")[0];
        return date.toISOString().split("T")[0] === todayStr;
    };

    // Check if we can go to previous month
    const canGoPrevious = () => {
        const lastDayOfPrevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
        return lastDayOfPrevMonth >= minDateObj;
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="date-picker-backdrop"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="date-picker-modal">
                {/* Header */}
                <div className="date-picker-header">
                    <h3 className="date-picker-title">{title}</h3>
                    <button className="date-picker-close" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                {/* Month Navigation */}
                <div className="date-picker-nav">
                    <button 
                        className="date-picker-nav-btn"
                        onClick={goToPreviousMonth}
                        disabled={!canGoPrevious()}
                    >
                        <FiChevronLeft size={20} />
                    </button>
                    <span className="date-picker-month">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button 
                        className="date-picker-nav-btn"
                        onClick={goToNextMonth}
                    >
                        <FiChevronRight size={20} />
                    </button>
                </div>

                {/* Day Names */}
                <div className="date-picker-weekdays">
                    {dayNames.map((day) => (
                        <div key={day} className="date-picker-weekday">{day}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className={`date-picker-grid ${animating ? "animating" : ""}`}>
                    {days.map((date, index) => (
                        <div key={index} className="date-picker-cell">
                            {date ? (
                                <button
                                    className={`date-picker-day ${
                                        isDateSelected(date) ? "selected" : ""
                                    } ${isToday(date) ? "today" : ""} ${
                                        isDateDisabled(date) ? "disabled" : ""
                                    }`}
                                    onClick={() => !isDateDisabled(date) && handleDateClick(date)}
                                    disabled={isDateDisabled(date)}
                                >
                                    {date.getDate()}
                                </button>
                            ) : null}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="date-picker-footer">
                    <button 
                        className="date-picker-today-btn"
                        onClick={() => {
                            if (today >= minDateObj) {
                                handleDateClick(today);
                            }
                        }}
                        disabled={today < minDateObj}
                    >
                        Today
                    </button>
                </div>
            </div>
        </>
    );
}
