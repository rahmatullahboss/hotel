// Booking Provider - Riverpod 3.0 state management for bookings
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';

// Booking model
class Booking {
  final String id;
  final String hotelId;
  final String hotelName;
  final String roomId;
  final String roomName;
  final String? hotelImageUrl;
  final DateTime checkIn;
  final DateTime checkOut;
  final int guests;
  final int totalAmount;
  final String status;
  final String paymentMethod;
  final String? qrCode;
  final DateTime createdAt;

  Booking({
    required this.id,
    required this.hotelId,
    required this.hotelName,
    required this.roomId,
    required this.roomName,
    this.hotelImageUrl,
    required this.checkIn,
    required this.checkOut,
    required this.guests,
    required this.totalAmount,
    required this.status,
    required this.paymentMethod,
    this.qrCode,
    required this.createdAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id']?.toString() ?? '',
      hotelId: json['hotelId']?.toString() ?? '',
      hotelName: json['hotelName']?.toString() ?? 'Unknown Hotel',
      roomId: json['roomId']?.toString() ?? '',
      roomName: json['roomName']?.toString() ?? 'Room',
      hotelImageUrl:
          json['hotelImage']?.toString() ?? json['hotelImageUrl']?.toString(),
      checkIn: json['checkIn'] != null
          ? DateTime.parse(json['checkIn'].toString())
          : DateTime.now(),
      checkOut: json['checkOut'] != null
          ? DateTime.parse(json['checkOut'].toString())
          : DateTime.now().add(const Duration(days: 1)),
      guests: int.tryParse(json['guests']?.toString() ?? '1') ?? 1,
      totalAmount:
          double.tryParse(json['totalAmount']?.toString() ?? '0')?.toInt() ?? 0,
      status: json['status']?.toString().toLowerCase() ?? 'pending',
      paymentMethod: json['paymentMethod']?.toString() ?? 'PAY_AT_HOTEL',
      qrCode: json['qrCode']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
    );
  }

  int get nights => checkOut.difference(checkIn).inDays;
  bool get isUpcoming =>
      ['upcoming', 'pending', 'confirmed'].contains(status.toLowerCase());
  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';
}

// Bookings state
class BookingsState {
  final List<Booking> upcomingBookings;
  final List<Booking> completedBookings;
  final List<Booking> cancelledBookings;
  final bool isLoading;
  final String? error;

  BookingsState({
    this.upcomingBookings = const [],
    this.completedBookings = const [],
    this.cancelledBookings = const [],
    this.isLoading = false,
    this.error,
  });

  BookingsState copyWith({
    List<Booking>? upcomingBookings,
    List<Booking>? completedBookings,
    List<Booking>? cancelledBookings,
    bool? isLoading,
    String? error,
  }) {
    return BookingsState(
      upcomingBookings: upcomingBookings ?? this.upcomingBookings,
      completedBookings: completedBookings ?? this.completedBookings,
      cancelledBookings: cancelledBookings ?? this.cancelledBookings,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Bookings notifier (Riverpod 3.0)
class BookingsNotifier extends Notifier<BookingsState> {
  Dio get _dio => ref.read(dioProvider);

  @override
  BookingsState build() => BookingsState();

  Future<void> fetchBookings() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _dio.get('/bookings');
      final dynamic responseData = response.data;
      List<dynamic> data = [];

      if (responseData is List) {
        data = responseData;
      } else if (responseData is Map && responseData['bookings'] is List) {
        data = responseData['bookings'];
      }

      final bookings = data.map((json) => Booking.fromJson(json)).toList();

      state = state.copyWith(
        upcomingBookings: bookings.where((b) => b.isUpcoming).toList(),
        completedBookings: bookings.where((b) => b.isCompleted).toList(),
        cancelledBookings: bookings.where((b) => b.isCancelled).toList(),
        isLoading: false,
      );
    } on DioException catch (e) {
      // If we get a 404 or formatting error, it likely means no bookings setup on backend
      // or using a mock backend that doesn't return the expected format.
      // For user friendliness in this demo stage, we return empty list if appropriate
      // or show a friendlier error.
      if (e.response?.statusCode == 404) {
        state = state.copyWith(
          upcomingBookings: [],
          completedBookings: [],
          cancelledBookings: [],
          isLoading: false,
        );
        return;
      }

      state = state.copyWith(
        isLoading: false,
        error: e.message ?? 'Failed to load bookings',
      );
    } catch (e) {
      // If parsing fails (e.g. data is not a list), assume no bookings or API mismatch.
      // Returning empty list is safer than showing "Unknown error" which confuses users.
      debugPrint('Booking fetch error: $e');
      state = state.copyWith(
        upcomingBookings: [],
        completedBookings: [],
        cancelledBookings: [],
        isLoading: false,
        // error: 'An unknown problem occurred', // Commented out to prevent confusing error UI
      );
    }
  }

  Future<bool> createBooking({
    required String hotelId,
    required String roomId,
    required DateTime checkIn,
    required DateTime checkOut,
    required int guests,
    required String paymentMethod,
    required int totalAmount,
    String? guestName,
    String? guestPhone,
    String? guestEmail,
  }) async {
    try {
      final response = await _dio.post(
        '/bookings',
        data: {
          'hotelId': hotelId,
          'roomId': roomId,
          'checkIn': checkIn.toIso8601String().split('T')[0],
          'checkOut': checkOut.toIso8601String().split('T')[0],
          'guests': guests,
          'paymentMethod': paymentMethod,
          'totalAmount': totalAmount,
          if (guestName != null) 'guestName': guestName,
          if (guestPhone != null) 'guestPhone': guestPhone,
          if (guestEmail != null) 'guestEmail': guestEmail,
        },
      );

      if (response.data['success'] == true) {
        await fetchBookings();
        return true;
      }
      return false;
    } on DioException catch (e) {
      debugPrint('Booking error: ${e.response?.data}');
      return false;
    }
  }

  Future<bool> cancelBooking(String bookingId, {String? reason}) async {
    try {
      await _dio.put(
        '/bookings/$bookingId/cancel',
        data: {if (reason != null) 'reason': reason},
      );
      await fetchBookings();
      return true;
    } on DioException catch (_) {
      return false;
    }
  }

  /// Creates a booking and returns the booking ID for payment processing
  Future<String?> createBookingAndReturnId({
    required String hotelId,
    required String roomId,
    required DateTime checkIn,
    required DateTime checkOut,
    required int guests,
    required String paymentMethod,
    required int totalAmount,
    String? guestName,
    String? guestPhone,
    String? guestEmail,
  }) async {
    try {
      debugPrint(
        'BookingProvider: Creating booking with hotelId=$hotelId, roomId=$roomId',
      );
      final response = await _dio.post(
        '/bookings',
        data: {
          'hotelId': hotelId,
          'roomId': roomId,
          'checkIn': checkIn.toIso8601String().split('T')[0],
          'checkOut': checkOut.toIso8601String().split('T')[0],
          'guests': guests,
          'paymentMethod': paymentMethod,
          'totalAmount': totalAmount,
          if (guestName != null) 'guestName': guestName,
          if (guestPhone != null) 'guestPhone': guestPhone,
          if (guestEmail != null) 'guestEmail': guestEmail,
        },
      );

      debugPrint('BookingProvider: Response = ${response.data}');

      if (response.data['success'] == true) {
        final bookingId =
            response.data['bookingId']?.toString() ??
            response.data['booking']?['id']?.toString();
        debugPrint('BookingProvider: Booking created, ID = $bookingId');
        return bookingId;
      }

      debugPrint(
        'BookingProvider: API returned success=false, error=${response.data['error']}',
      );
      return null;
    } on DioException catch (e) {
      debugPrint(
        'BookingProvider: DioException - status=${e.response?.statusCode}, data=${e.response?.data}',
      );
      return null;
    } catch (e) {
      debugPrint('BookingProvider: Unknown error - $e');
      return null;
    }
  }
}

// Provider (Riverpod 3.0)
final bookingsProvider = NotifierProvider<BookingsNotifier, BookingsState>(
  BookingsNotifier.new,
);

// Single booking provider
final bookingProvider = FutureProvider.family<Booking?, String>((
  ref,
  bookingId,
) async {
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/bookings/$bookingId');
    return Booking.fromJson(response.data);
  } catch (_) {
    return null;
  }
});
