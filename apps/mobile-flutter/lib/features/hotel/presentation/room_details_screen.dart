// Room Details Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class RoomDetailsScreen extends ConsumerWidget {
  final String roomId;

  const RoomDetailsScreen({super.key, required this.roomId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      body: CustomScrollView(
        slivers: [
          // App Bar with Image
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: AppColors.secondary,
                child: const Center(
                  child: Icon(Icons.bed, size: 100, color: Colors.white54),
                ),
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Room Name
                  Text('ডিলাক্স ডাবল রুম', style: AppTypography.h2),
                  const SizedBox(height: 8),
                  Text(
                    'হোটেল নাম • ঢাকা',
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Quick Info
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _InfoItem(
                          icon: Icons.people_outline,
                          label: 'সর্বোচ্চ',
                          value: '২ জন',
                        ),
                        _InfoItem(
                          icon: Icons.bed_outlined,
                          label: 'বেড',
                          value: '১ ডাবল',
                        ),
                        _InfoItem(
                          icon: Icons.square_foot,
                          label: 'আয়তন',
                          value: '২৫০ sqft',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Amenities
                  Text('রুম সুবিধা', style: AppTypography.h4),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _AmenityTag(icon: Icons.ac_unit, label: 'এসি'),
                      _AmenityTag(icon: Icons.wifi, label: 'ফ্রি ওয়াইফাই'),
                      _AmenityTag(icon: Icons.tv, label: 'LED টিভি'),
                      _AmenityTag(icon: Icons.hot_tub, label: 'গরম পানি'),
                      _AmenityTag(
                        icon: Icons.local_laundry_service,
                        label: 'লন্ড্রি',
                      ),
                      _AmenityTag(
                        icon: Icons.room_service,
                        label: 'রুম সার্ভিস',
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Description
                  Text('বিবরণ', style: AppTypography.h4),
                  const SizedBox(height: 12),
                  Text(
                    'এই আরামদায়ক ডিলাক্স রুমে একটি ডাবল বেড, এসি, LED টিভি এবং ফ্রি ওয়াইফাই রয়েছে। বাথরুমে গরম পানির ব্যবস্থা আছে। জানালা দিয়ে সুন্দর দৃশ্য দেখা যায়।',
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Policies
                  Text('নীতিমালা', style: AppTypography.h4),
                  const SizedBox(height: 12),
                  _PolicyItem(
                    icon: Icons.access_time,
                    title: 'চেক-ইন',
                    value: 'দুপুর ১২:০০ এর পর',
                  ),
                  _PolicyItem(
                    icon: Icons.access_time_filled,
                    title: 'চেক-আউট',
                    value: 'দুপুর ১১:০০ এর আগে',
                  ),
                  _PolicyItem(
                    icon: Icons.cancel_outlined,
                    title: 'বাতিল নীতি',
                    value: '২৪ ঘণ্টা আগে বিনামূল্যে',
                  ),

                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      // Bottom Bar
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('৳2,500', style: AppTypography.priceLarge),
                  Text('/রাত • ট্যাক্স ছাড়া', style: AppTypography.labelSmall),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    context.push('/book/$roomId');
                  },
                  child: const Text('বুকিং করুন'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary, size: 24),
        const SizedBox(height: 8),
        Text(label, style: AppTypography.labelSmall),
        Text(value, style: AppTypography.labelLarge),
      ],
    );
  }
}

class _AmenityTag extends StatelessWidget {
  final IconData icon;
  final String label;

  const _AmenityTag({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 6),
          Text(label, style: AppTypography.labelMedium),
        ],
      ),
    );
  }
}

class _PolicyItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;

  const _PolicyItem({
    required this.icon,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, color: AppColors.textSecondary, size: 20),
          const SizedBox(width: 12),
          Text(title, style: AppTypography.labelMedium),
          const Spacer(),
          Text(
            value,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
