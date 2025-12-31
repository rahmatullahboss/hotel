// Booking Details Screen - With Proper Localization & API Integration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../providers/booking_provider.dart';

class BookingDetailsScreen extends ConsumerWidget {
  final String bookingId;

  const BookingDetailsScreen({super.key, required this.bookingId});

  String _formatDate(DateTime date, BuildContext context) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${date.day} ${months[date.month - 1]}, ${date.year}';
  }

  String _formatPrice(int price) {
    return price.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final loc = AppLocalizations.of(context)!;
    final bookingAsync = ref.watch(bookingProvider(bookingId));

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      appBar: AppBar(
        title: Text(loc.bookingDetails, style: AppTypography.h4),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: bookingAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text(loc.errorLoadingBooking, style: AppTypography.bodyMedium),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(bookingProvider(bookingId)),
                child: Text(loc.retry),
              ),
            ],
          ),
        ),
        data: (booking) {
          if (booking == null) {
            return Center(
              child: Text(loc.bookingNotFound, style: AppTypography.bodyMedium),
            );
          }
          return _buildContent(context, ref, booking, loc);
        },
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    WidgetRef ref,
    Booking booking,
    AppLocalizations loc,
  ) {
    final statusColor = _getStatusColor(booking.status);
    final statusText = _getStatusText(booking.status, loc);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Status Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _getStatusIcon(booking.status),
                  color: statusColor,
                  size: 18,
                ),
                const SizedBox(width: 8),
                Text(
                  statusText,
                  style: AppTypography.labelMedium.copyWith(color: statusColor),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Booking ID
          Text(
            '${loc.booking} #${booking.id.substring(0, 8)}',
            style: AppTypography.h3,
          ),
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
                    image: booking.hotelImageUrl != null
                        ? DecorationImage(
                            image: NetworkImage(booking.hotelImageUrl!),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: booking.hotelImageUrl == null
                      ? const Icon(
                          Icons.hotel,
                          size: 32,
                          color: AppColors.textTertiary,
                        )
                      : null,
                ),
                const SizedBox(width: 16),
                // Hotel Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(booking.hotelName, style: AppTypography.h4),
                      const SizedBox(height: 4),
                      Text(booking.roomName, style: AppTypography.bodySmall),
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
                  label: loc.checkIn,
                  value: _formatDate(booking.checkIn, context),
                ),
                const Divider(),
                _DetailRow(
                  icon: Icons.calendar_today_outlined,
                  label: loc.checkOut,
                  value: _formatDate(booking.checkOut, context),
                ),
                const Divider(),
                _DetailRow(
                  icon: Icons.nights_stay,
                  label: loc.night,
                  value:
                      '${booking.nights} ${booking.nights == 1 ? loc.night : loc.nights}',
                ),
                const Divider(),
                _DetailRow(
                  icon: Icons.people,
                  label: loc.guests,
                  value: '${booking.guests}',
                ),
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
                Text(loc.payment, style: AppTypography.labelLarge),
                const SizedBox(height: 12),
                _PaymentRow(
                  label: loc.total,
                  value: '৳${_formatPrice(booking.totalAmount)}',
                  isTotal: true,
                ),
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
                      Text(
                        _getPaymentMethodLabel(booking.paymentMethod, loc),
                        style: AppTypography.labelMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // QR Code Card
          if (booking.qrCode != null)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Text(loc.checkInQRCode, style: AppTypography.labelLarge),
                  const SizedBox(height: 8),
                  Text(loc.showQRAtReception, style: AppTypography.bodySmall),
                  const SizedBox(height: 16),
                  QrImageView(
                    data: booking.qrCode!,
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
                  onPressed: () {
                    // TODO: Implement call hotel
                  },
                  icon: const Icon(Icons.phone),
                  label: Text(loc.callHotel),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    // TODO: Implement view on map
                  },
                  icon: const Icon(Icons.map),
                  label: Text(loc.viewOnMap),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (booking.isUpcoming)
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => _showCancelDialog(context, ref, loc),
                style: TextButton.styleFrom(foregroundColor: AppColors.error),
                child: Text(loc.cancelBooking),
              ),
            ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'cancelled':
        return AppColors.error;
      case 'completed':
      case 'checked_out':
        return AppColors.info;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return Icons.check_circle;
      case 'pending':
        return Icons.access_time;
      case 'cancelled':
        return Icons.cancel;
      case 'completed':
      case 'checked_out':
        return Icons.done_all;
      default:
        return Icons.info;
    }
  }

  String _getStatusText(String status, AppLocalizations loc) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return loc.confirmed;
      case 'pending':
        return loc.pending;
      case 'cancelled':
        return loc.cancelled;
      case 'completed':
      case 'checked_out':
        return loc.completed;
      default:
        return status;
    }
  }

  String _getPaymentMethodLabel(String method, AppLocalizations loc) {
    switch (method.toUpperCase()) {
      case 'PAY_AT_HOTEL':
        return loc.payAtHotel;
      case 'STRIPE':
      case 'CARD':
        return loc.card;
      case 'WALLET':
        return loc.wallet;
      default:
        return method;
    }
  }

  void _showCancelDialog(
    BuildContext context,
    WidgetRef ref,
    AppLocalizations loc,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(loc.cancelBookingQuestion, style: AppTypography.h4),
        content: Text(
          loc.cancelBookingMessage,
          style: AppTypography.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(loc.no),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement cancel booking
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: Text(loc.yesCancelBooking),
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
