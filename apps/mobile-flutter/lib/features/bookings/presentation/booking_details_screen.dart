// Booking Details Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class BookingDetailsScreen extends ConsumerWidget {
  final String bookingId;

  const BookingDetailsScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      appBar: AppBar(
        title: Text('বুকিং বিবরণ', style: AppTypography.h4),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Status Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle, color: AppColors.success, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'নিশ্চিত হয়েছে',
                    style: AppTypography.labelMedium.copyWith(
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Booking ID
            Text('বুকিং #$bookingId', style: AppTypography.h3),
            const SizedBox(height: 24),

            // Hotel Info Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  // Hotel Image
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.hotel,
                      size: 32,
                      color: AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Hotel Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('হোটেল নাম', style: AppTypography.h4),
                        const SizedBox(height: 4),
                        Text(
                          'ডিলাক্স ডাবল রুম',
                          style: AppTypography.bodySmall,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              Icons.location_on_outlined,
                              size: 14,
                              color: AppColors.textSecondary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'ঢাকা, বাংলাদেশ',
                              style: AppTypography.labelSmall,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Booking Details Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  _DetailRow(
                    icon: Icons.calendar_today,
                    label: 'চেক-ইন',
                    value: '২৫ ডিসেম্বর, ২০২৪',
                  ),
                  const Divider(),
                  _DetailRow(
                    icon: Icons.calendar_today_outlined,
                    label: 'চেক-আউট',
                    value: '২৬ ডিসেম্বর, ২০২৪',
                  ),
                  const Divider(),
                  _DetailRow(
                    icon: Icons.nights_stay,
                    label: 'রাত',
                    value: '১ রাত',
                  ),
                  const Divider(),
                  _DetailRow(icon: Icons.people, label: 'অতিথি', value: '২ জন'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Payment Details Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('পেমেন্ট', style: AppTypography.labelLarge),
                  const SizedBox(height: 12),
                  _PaymentRow(label: 'রুম ভাড়া', value: '৳2,500'),
                  _PaymentRow(label: 'ট্যাক্স', value: '৳250'),
                  const Divider(),
                  _PaymentRow(label: 'মোট', value: '৳2,750', isTotal: true),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.payment, color: AppColors.primary),
                        const SizedBox(width: 12),
                        Text('বিকাশ', style: AppTypography.labelMedium),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.success.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'পেইড',
                            style: AppTypography.labelSmall.copyWith(
                              color: AppColors.success,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // QR Code Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Text('চেক-ইন QR কোড', style: AppTypography.labelLarge),
                  const SizedBox(height: 8),
                  Text('রিসেপশনে এই কোড দেখান', style: AppTypography.bodySmall),
                  const SizedBox(height: 16),
                  QrImageView(
                    data: 'zinu://booking/$bookingId',
                    version: QrVersions.auto,
                    size: 180,
                    backgroundColor: Colors.white,
                    errorCorrectionLevel: QrErrorCorrectLevel.M,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.phone),
                    label: const Text('হোটেলে কল'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.map),
                    label: const Text('ম্যাপে দেখুন'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () {
                  // Show cancel dialog
                  _showCancelDialog(context);
                },
                style: TextButton.styleFrom(foregroundColor: AppColors.error),
                child: const Text('বুকিং বাতিল করুন'),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  void _showCancelDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('বুকিং বাতিল করবেন?', style: AppTypography.h4),
        content: Text(
          'চেক-ইনের ২৪ ঘণ্টা আগে বাতিল করলে কোনো চার্জ কাটা হবে না।',
          style: AppTypography.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('না'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Cancel booking
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('হ্যাঁ, বাতিল করুন'),
          ),
        ],
      ),
    );
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
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(width: 12),
          Text(label, style: AppTypography.bodyMedium),
          const Spacer(),
          Text(value, style: AppTypography.labelMedium),
        ],
      ),
    );
  }
}

class _PaymentRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isTotal;

  const _PaymentRow({
    required this.label,
    required this.value,
    this.isTotal = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: isTotal
                ? AppTypography.labelLarge
                : AppTypography.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
          ),
          Text(
            value,
            style: isTotal
                ? AppTypography.priceLarge
                : AppTypography.bodyMedium,
          ),
        ],
      ),
    );
  }
}
