// Bookings Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class BookingsScreen extends ConsumerWidget {
  const BookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text('আমার বুকিং', style: AppTypography.h4),
          backgroundColor: Colors.transparent,
          elevation: 0,
          bottom: TabBar(
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textSecondary,
            indicatorColor: AppColors.primary,
            labelStyle: AppTypography.labelLarge,
            tabs: const [
              Tab(text: 'আসন্ন'),
              Tab(text: 'সম্পন্ন'),
              Tab(text: 'বাতিল'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _BookingList(status: 'upcoming'),
            _BookingList(status: 'completed'),
            _BookingList(status: 'cancelled'),
          ],
        ),
      ),
    );
  }
}

class _BookingList extends StatelessWidget {
  final String status;

  const _BookingList({required this.status});

  @override
  Widget build(BuildContext context) {
    // Placeholder - will be replaced with actual data
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.calendar_month_outlined,
            size: 80,
            color: AppColors.textTertiary.withValues(alpha: 0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'কোনো বুকিং নেই',
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'আপনার বুকিং এখানে দেখা যাবে',
            style: AppTypography.bodySmall,
          ),
        ],
      ),
    );
  }
}
