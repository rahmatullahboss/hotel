// Bookings Screen - World-Class Premium Design
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/booking_card.dart';

// Dummy bookings for demonstration
final List<Map<String, dynamic>> dummyBookings = [
  {
    'id': '1',
    'hotelName': 'Pan Pacific Sonargaon',
    'hotelLocation': 'ঢাকা',
    'hotelImage':
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
    'roomName': 'Deluxe Room',
    'checkIn': DateTime.now().add(const Duration(days: 5)),
    'checkOut': DateTime.now().add(const Duration(days: 7)),
    'status': BookingStatus.confirmed,
    'totalAmount': 17000.0,
  },
  {
    'id': '2',
    'hotelName': 'Radisson Blu',
    'hotelLocation': 'চট্টগ্রাম',
    'hotelImage':
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=300',
    'roomName': 'Premium Suite',
    'checkIn': DateTime.now().add(const Duration(days: 15)),
    'checkOut': DateTime.now().add(const Duration(days: 17)),
    'status': BookingStatus.pending,
    'totalAmount': 14400.0,
  },
];

class BookingsScreen extends ConsumerWidget {
  const BookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final topPadding = MediaQuery.of(context).padding.top;
    final bookingsCount = dummyBookings.length;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // Premium Header
          Container(
            decoration: const BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Padding(
              padding: EdgeInsets.only(
                top: topPadding + 16,
                left: 20,
                right: 20,
                bottom: 24,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'আমার বুকিং',
                        style: AppTypography.h2.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '$bookingsCount ${bookingsCount != 1 ? 'বুকিং' : 'বুকিং'}',
                        style: AppTypography.bodyMedium.copyWith(
                          color: Colors.white.withValues(alpha: 0.85),
                        ),
                      ),
                    ],
                  ),

                  // QR Scanner Button
                  GestureDetector(
                    onTap: () => context.push('/qr-scanner'),
                    child: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.qr_code_scanner,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Content
          Expanded(
            child: dummyBookings.isEmpty
                ? _EmptyState()
                : ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: dummyBookings.length,
                    itemBuilder: (context, index) {
                      final booking = dummyBookings[index];
                      return BookingCard(
                        id: booking['id'] as String,
                        hotelName: booking['hotelName'] as String,
                        hotelLocation: booking['hotelLocation'] as String,
                        hotelImage: booking['hotelImage'] as String?,
                        roomName: booking['roomName'] as String,
                        checkIn: booking['checkIn'] as DateTime,
                        checkOut: booking['checkOut'] as DateTime,
                        status: booking['status'] as BookingStatus,
                        totalAmount: booking['totalAmount'] as double,
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.luggage_outlined,
                size: 40,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 24),
            Text('কোনো ট্রিপ নেই', style: AppTypography.h4),
            const SizedBox(height: 8),
            Text(
              'আপনার বুকিং এখানে দেখা যাবে',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: () => context.go('/search'),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 28,
                  vertical: 14,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: AppColors.buttonShadow,
                ),
                child: Text('হোটেল খুঁজুন', style: AppTypography.button),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
