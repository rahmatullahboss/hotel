// Date Selection Bar Widget
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import 'package:intl/intl.dart';

class DateSelectionBar extends StatelessWidget {
  final DateTime checkIn;
  final DateTime checkOut;
  final VoidCallback onTap;
  final bool light;

  const DateSelectionBar({
    super.key,
    required this.checkIn,
    required this.checkOut,
    required this.onTap,
    this.light = false,
  });

  String _formatDate(DateTime date) {
    return DateFormat('d MMM').format(date);
  }

  String _formatDayName(DateTime date) {
    return DateFormat('EEE').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final textColor = light ? Colors.white : AppColors.textPrimary;
    final subtextColor = light
        ? Colors.white.withValues(alpha: 0.7)
        : AppColors.textSecondary;
    final bgColor = light ? Colors.white.withValues(alpha: 0.15) : Colors.white;
    final dividerColor = light
        ? Colors.white.withValues(alpha: 0.3)
        : AppColors.divider;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: light
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Row(
          children: [
            // Check-in
            Expanded(
              child: Row(
                children: [
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 20,
                    color: light ? Colors.white : AppColors.primary,
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Check-in',
                        style: AppTypography.labelSmall.copyWith(
                          color: subtextColor,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${_formatDate(checkIn)}, ${_formatDayName(checkIn)}',
                        style: AppTypography.labelLarge.copyWith(
                          color: textColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Divider
            Container(
              width: 1,
              height: 40,
              color: dividerColor,
              margin: const EdgeInsets.symmetric(horizontal: 12),
            ),

            // Check-out
            Expanded(
              child: Row(
                children: [
                  Icon(
                    Icons.calendar_today_outlined,
                    size: 20,
                    color: light ? Colors.white : AppColors.primary,
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Check-out',
                        style: AppTypography.labelSmall.copyWith(
                          color: subtextColor,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${_formatDate(checkOut)}, ${_formatDayName(checkOut)}',
                        style: AppTypography.labelLarge.copyWith(
                          color: textColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
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
