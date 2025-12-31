// Booking Card Widget
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

enum BookingStatus {
  confirmed,
  pending,
  cancelled,
  completed,
  checkedIn,
  checkedOut,
}

class BookingCard extends StatelessWidget {
  final String id;
  final String hotelName;
  final String hotelLocation;
  final String? hotelImage;
  final String roomName;
  final DateTime checkIn;
  final DateTime checkOut;
  final BookingStatus status;
  final double totalAmount;

  const BookingCard({
    super.key,
    required this.id,
    required this.hotelName,
    required this.hotelLocation,
    this.hotelImage,
    required this.roomName,
    required this.checkIn,
    required this.checkOut,
    required this.status,
    required this.totalAmount,
  });

  Color _getStatusColor() {
    switch (status) {
      case BookingStatus.confirmed:
        return AppColors.confirmed;
      case BookingStatus.pending:
        return AppColors.pending;
      case BookingStatus.cancelled:
        return AppColors.cancelled;
      case BookingStatus.completed:
        return AppColors.completed;
      case BookingStatus.checkedIn:
        return AppColors.checkedIn;
      case BookingStatus.checkedOut:
        return AppColors.completed;
    }
  }

  Color _getStatusBgColor() {
    switch (status) {
      case BookingStatus.confirmed:
        return const Color(0x1A14B8A6);
      case BookingStatus.pending:
        return const Color(0x1AF59E0B);
      case BookingStatus.cancelled:
        return const Color(0x1AEF4444);
      case BookingStatus.completed:
        return const Color(0x1A6B7280);
      case BookingStatus.checkedIn:
        return const Color(0x1A3B82F6);
      case BookingStatus.checkedOut:
        return const Color(0x1A6B7280);
    }
  }

  String _getStatusText() {
    switch (status) {
      case BookingStatus.confirmed:
        return 'Confirmed';
      case BookingStatus.pending:
        return 'Pending';
      case BookingStatus.cancelled:
        return 'Cancelled';
      case BookingStatus.completed:
        return 'Completed';
      case BookingStatus.checkedIn:
        return 'Checked In';
      case BookingStatus.checkedOut:
        return 'Checked Out';
    }
  }

  IconData _getStatusIcon() {
    switch (status) {
      case BookingStatus.confirmed:
        return Icons.check_circle;
      case BookingStatus.pending:
        return Icons.access_time;
      case BookingStatus.cancelled:
        return Icons.cancel;
      case BookingStatus.completed:
        return Icons.check;
      case BookingStatus.checkedIn:
        return Icons.login;
      case BookingStatus.checkedOut:
        return Icons.logout;
    }
  }

  String _formatDate(DateTime date) {
    return DateFormat('d MMM').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/bookings/$id'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Top Section with Image and Info
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hotel Image
                ClipRRect(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    bottomLeft: Radius.circular(16),
                  ),
                  child: SizedBox(
                    width: 100,
                    height: 100,
                    child: hotelImage != null
                        ? CachedNetworkImage(
                            imageUrl: hotelImage!,
                            fit: BoxFit.cover,
                            placeholder: (context, url) =>
                                Container(color: AppColors.shimmerBase),
                            errorWidget: (context, url, error) =>
                                _PlaceholderImage(),
                          )
                        : _PlaceholderImage(),
                  ),
                ),

                // Info
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Hotel Name
                        Text(
                          hotelName,
                          style: AppTypography.labelLarge.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),

                        // Room Name
                        Text(
                          roomName,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),

                        // Status Badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _getStatusBgColor(),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _getStatusIcon(),
                                size: 14,
                                color: _getStatusColor(),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _getStatusText(),
                                style: AppTypography.labelSmall.copyWith(
                                  color: _getStatusColor(),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // Divider
            Container(
              height: 1,
              color: AppColors.divider.withValues(alpha: 0.5),
            ),

            // Bottom Section with Dates and Amount
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Dates
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today_outlined,
                        size: 16,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${_formatDate(checkIn)} - ${_formatDate(checkOut)}',
                        style: AppTypography.labelMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),

                  // Amount
                  Text(
                    '৳${totalAmount.toInt()}',
                    style: AppTypography.priceSmall.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlaceholderImage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surfaceVariant,
      child: const Center(
        child: Icon(Icons.hotel, size: 32, color: AppColors.textTertiary),
      ),
    );
  }
}
