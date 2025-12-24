// Booking Confirmation Screen - Premium Success Display
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import 'package:intl/intl.dart';

class BookingConfirmationScreen extends StatelessWidget {
  final String bookingId;
  final String hotelName;
  final String roomName;
  final DateTime checkIn;
  final DateTime checkOut;
  final int totalAmount;
  final String paymentMethod;

  const BookingConfirmationScreen({
    super.key,
    required this.bookingId,
    required this.hotelName,
    required this.roomName,
    required this.checkIn,
    required this.checkOut,
    required this.totalAmount,
    required this.paymentMethod,
  });

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // Success Header
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: topPadding + 40,
              left: 20,
              right: 20,
              bottom: 40,
            ),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.success, Color(0xFF059669)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(32),
                bottomRight: Radius.circular(32),
              ),
            ),
            child: Column(
              children: [
                // Success Icon
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_circle,
                    color: Colors.white,
                    size: 48,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'বুকিং সম্পন্ন! 🎉',
                  style: AppTypography.h2.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'আপনার বুকিং সফলভাবে সম্পন্ন হয়েছে',
                  style: AppTypography.bodyMedium.copyWith(
                    color: Colors.white.withValues(alpha: 0.9),
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Booking ID Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: AppColors.softShadow,
                    ),
                    child: Column(
                      children: [
                        Text(
                          'বুকিং আইডি',
                          style: AppTypography.labelMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '#$bookingId',
                            style: AppTypography.h3.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Booking Details
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: AppColors.softShadow,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('বুকিং বিবরণ', style: AppTypography.h4),
                        const SizedBox(height: 16),
                        _DetailRow(
                          icon: Icons.hotel_outlined,
                          label: 'হোটেল',
                          value: hotelName,
                        ),
                        const Divider(height: 24),
                        _DetailRow(
                          icon: Icons.bed_outlined,
                          label: 'রুম',
                          value: roomName,
                        ),
                        const Divider(height: 24),
                        _DetailRow(
                          icon: Icons.calendar_today_outlined,
                          label: 'চেক-ইন',
                          value: DateFormat('dd MMM yyyy').format(checkIn),
                        ),
                        const Divider(height: 24),
                        _DetailRow(
                          icon: Icons.event_outlined,
                          label: 'চেক-আউট',
                          value: DateFormat('dd MMM yyyy').format(checkOut),
                        ),
                        const Divider(height: 24),
                        _DetailRow(
                          icon: Icons.payments_outlined,
                          label: 'পেমেন্ট',
                          value: _getPaymentLabel(paymentMethod),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Total Amount
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: AppColors.buttonShadow,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'মোট মূল্য',
                          style: AppTypography.labelLarge.copyWith(
                            color: Colors.white.withValues(alpha: 0.9),
                          ),
                        ),
                        Text(
                          '৳${NumberFormat('#,###').format(totalAmount)}',
                          style: AppTypography.h2.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            // TODO: Download PDF
                          },
                          icon: const Icon(Icons.download_outlined),
                          label: const Text('রিসিট'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => context.go('/bookings'),
                          icon: const Icon(Icons.luggage_outlined),
                          label: const Text('আমার বুকিং'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  TextButton(
                    onPressed: () => context.go('/'),
                    child: Text(
                      'হোমে ফিরে যান',
                      style: AppTypography.labelLarge.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getPaymentLabel(String method) {
    switch (method) {
      case 'bkash':
        return 'বিকাশ';
      case 'nagad':
        return 'নগদ';
      case 'card':
        return 'কার্ড';
      case 'hotel':
        return 'হোটেলে পেমেন্ট';
      default:
        return method;
    }
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.primary, size: 20),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            Text(value, style: AppTypography.bodyMedium),
          ],
        ),
      ],
    );
  }
}
