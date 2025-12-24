// Achievements Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class AchievementsScreen extends ConsumerWidget {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('অ্যাচিভমেন্ট', style: AppTypography.h4),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Level Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.secondary,
                    AppColors.secondary.withValues(alpha: 0.8),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  const Icon(
                    Icons.emoji_events,
                    size: 60,
                    color: AppColors.starFilled,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'ব্রোঞ্জ এক্সপ্লোরার',
                    style: AppTypography.h3.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'লেভেল ১',
                    style: AppTypography.labelMedium.copyWith(
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Progress Bar
                  Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '০ পয়েন্ট',
                            style: AppTypography.labelSmall.copyWith(
                              color: Colors.white70,
                            ),
                          ),
                          Text(
                            '১০০ পয়েন্ট',
                            style: AppTypography.labelSmall.copyWith(
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: 0.0,
                        backgroundColor: Colors.white24,
                        valueColor: AlwaysStoppedAnimation(
                          AppColors.starFilled,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Stats
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    icon: Icons.hotel,
                    value: '০',
                    label: 'বুকিং',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    icon: Icons.star,
                    value: '০',
                    label: 'রিভিউ',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    icon: Icons.people,
                    value: '০',
                    label: 'রেফারেল',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Achievements List
            Text('ব্যাজ সমূহ', style: AppTypography.h4),
            const SizedBox(height: 12),

            // Locked Achievements
            _AchievementCard(
              icon: Icons.flight_takeoff,
              title: 'প্রথম যাত্রা',
              description: 'প্রথম বুকিং সম্পন্ন করুন',
              isUnlocked: false,
            ),
            _AchievementCard(
              icon: Icons.star,
              title: 'রিভিউয়ার',
              description: 'প্রথম রিভিউ দিন',
              isUnlocked: false,
            ),
            _AchievementCard(
              icon: Icons.people,
              title: 'সোশ্যাল বাটারফ্লাই',
              description: '৫ জন বন্ধুকে রেফার করুন',
              isUnlocked: false,
              progress: 0,
              total: 5,
            ),
            _AchievementCard(
              icon: Icons.location_city,
              title: 'সিটি এক্সপ্লোরার',
              description: '৫টি ভিন্ন শহরে থাকুন',
              isUnlocked: false,
              progress: 0,
              total: 5,
            ),
            _AchievementCard(
              icon: Icons.nights_stay,
              title: 'নাইট আউল',
              description: 'মোট ১০ রাত থাকুন',
              isUnlocked: false,
              progress: 0,
              total: 10,
            ),
            _AchievementCard(
              icon: Icons.verified,
              title: 'লয়্যাল কাস্টমার',
              description: '১০টি বুকিং সম্পন্ন করুন',
              isUnlocked: false,
              progress: 0,
              total: 10,
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 28),
          const SizedBox(height: 8),
          Text(value, style: AppTypography.h3),
          Text(label, style: AppTypography.labelSmall),
        ],
      ),
    );
  }
}

class _AchievementCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final bool isUnlocked;
  final int? progress;
  final int? total;

  const _AchievementCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.isUnlocked,
    this.progress,
    this.total,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: isUnlocked
            ? Border.all(color: AppColors.starFilled, width: 2)
            : null,
      ),
      child: Row(
        children: [
          // Icon
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isUnlocked
                  ? AppColors.starFilled.withValues(alpha: 0.1)
                  : AppColors.surfaceVariant,
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: isUnlocked ? AppColors.starFilled : AppColors.textTertiary,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      title,
                      style: AppTypography.labelLarge.copyWith(
                        color: isUnlocked
                            ? AppColors.textPrimary
                            : AppColors.textSecondary,
                      ),
                    ),
                    if (isUnlocked) ...[
                      const SizedBox(width: 8),
                      Icon(
                        Icons.check_circle,
                        color: AppColors.starFilled,
                        size: 16,
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
                if (progress != null && total != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: LinearProgressIndicator(
                          value: progress! / total!,
                          backgroundColor: AppColors.surfaceVariant,
                          valueColor: AlwaysStoppedAnimation(AppColors.primary),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text('$progress/$total', style: AppTypography.labelSmall),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
