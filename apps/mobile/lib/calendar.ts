import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';

interface BookingEvent {
    hotelName: string;
    hotelAddress?: string;
    checkIn: string;
    checkOut: string;
    guestName?: string;
    bookingId?: string;
}

/**
 * Request calendar permissions
 */
async function requestPermissions(): Promise<boolean> {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
}

/**
 * Get the default calendar for the device
 */
async function getDefaultCalendarId(): Promise<string | null> {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

    // Try to find a default calendar
    const defaultCalendar = calendars.find(cal =>
        cal.allowsModifications &&
        (cal.isPrimary || cal.source?.name === 'iCloud' || cal.source?.name === 'Local')
    );

    if (defaultCalendar) {
        return defaultCalendar.id;
    }

    // Fallback to first modifiable calendar
    const modifiableCalendar = calendars.find(cal => cal.allowsModifications);
    if (modifiableCalendar) {
        return modifiableCalendar.id;
    }

    // Create a new calendar if none available (Android)
    if (Platform.OS === 'android') {
        const newCalendarId = await Calendar.createCalendarAsync({
            title: 'ZinoRooms',
            color: '#E63946',
            entityType: Calendar.EntityTypes.EVENT,
            source: {
                isLocalAccount: true,
                name: 'ZinoRooms',
                type: Calendar.SourceType.LOCAL,
            },
            name: 'ZinoRooms',
            ownerAccount: 'ZinoRooms',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
        return newCalendarId;
    }

    return null;
}

/**
 * Add booking to device calendar
 */
export async function addBookingToCalendar(booking: BookingEvent): Promise<boolean> {
    try {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            Alert.alert(
                'Calendar Permission Required',
                'Please enable calendar access in settings to add bookings to your calendar.',
                [{ text: 'OK' }]
            );
            return false;
        }

        const calendarId = await getDefaultCalendarId();
        if (!calendarId) {
            Alert.alert('Error', 'Could not access calendar.');
            return false;
        }

        const checkInDate = new Date(booking.checkIn);
        checkInDate.setHours(14, 0, 0, 0); // 2 PM check-in

        const checkOutDate = new Date(booking.checkOut);
        checkOutDate.setHours(11, 0, 0, 0); // 11 AM check-out

        // Create check-in event
        await Calendar.createEventAsync(calendarId, {
            title: `🏨 Check-in: ${booking.hotelName}`,
            startDate: checkInDate,
            endDate: new Date(checkInDate.getTime() + 60 * 60 * 1000), // 1 hour duration
            location: booking.hotelAddress,
            notes: booking.bookingId
                ? `Booking ID: ${booking.bookingId}\nGuest: ${booking.guestName || 'Guest'}`
                : `Guest: ${booking.guestName || 'Guest'}`,
            alarms: [
                { relativeOffset: -60 * 24 }, // 1 day before
                { relativeOffset: -60 * 3 },  // 3 hours before
            ],
        });

        // Create check-out reminder
        await Calendar.createEventAsync(calendarId, {
            title: `🏨 Check-out: ${booking.hotelName}`,
            startDate: checkOutDate,
            endDate: new Date(checkOutDate.getTime() + 60 * 60 * 1000), // 1 hour duration
            location: booking.hotelAddress,
            notes: 'Remember to collect your belongings and check-out before 11 AM.',
            alarms: [
                { relativeOffset: -60 * 2 }, // 2 hours before
            ],
        });

        return true;
    } catch (error) {
        console.error('Error adding to calendar:', error);
        Alert.alert('Error', 'Failed to add booking to calendar.');
        return false;
    }
}

/**
 * Check if calendar feature is available
 */
export async function isCalendarAvailable(): Promise<boolean> {
    try {
        const calendars = await Calendar.getCalendarsAsync();
        return calendars.length > 0;
    } catch {
        return false;
    }
}
