import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface BookingDatesContextType {
    checkIn: Date;
    checkOut: Date;
    setCheckIn: (date: Date) => void;
    setCheckOut: (date: Date) => void;
    setDates: (checkIn: Date, checkOut: Date) => void;
    nights: number;
    formatCheckIn: () => string;
    formatCheckOut: () => string;
}

const BookingDatesContext = createContext<BookingDatesContextType | undefined>(undefined);

export function BookingDatesProvider({ children }: { children: ReactNode }) {
    // Default: tomorrow to day after tomorrow
    const getDefaultCheckIn = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    };

    const getDefaultCheckOut = () => {
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        dayAfter.setHours(0, 0, 0, 0);
        return dayAfter;
    };

    const [checkIn, setCheckIn] = useState<Date>(getDefaultCheckIn);
    const [checkOut, setCheckOut] = useState<Date>(getDefaultCheckOut);

    const setDates = useCallback((newCheckIn: Date, newCheckOut: Date) => {
        setCheckIn(newCheckIn);
        setCheckOut(newCheckOut);
    }, []);

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const formatCheckIn = useCallback(() => {
        return checkIn.toISOString().split('T')[0];
    }, [checkIn]);

    const formatCheckOut = useCallback(() => {
        return checkOut.toISOString().split('T')[0];
    }, [checkOut]);

    return (
        <BookingDatesContext.Provider
            value={{
                checkIn,
                checkOut,
                setCheckIn,
                setCheckOut,
                setDates,
                nights,
                formatCheckIn,
                formatCheckOut,
            }}
        >
            {children}
        </BookingDatesContext.Provider>
    );
}

export function useBookingDates() {
    const context = useContext(BookingDatesContext);
    if (context === undefined) {
        throw new Error('useBookingDates must be used within a BookingDatesProvider');
    }
    return context;
}

export default BookingDatesContext;
