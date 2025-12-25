// Achievements Screen with API Integration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../providers/gamification_provider.dart';
import '../providers/wallet_provider.dart';

class AchievementsScreen extends ConsumerStatefulWidget {
  const AchievementsScreen({super.key});

  @override
  ConsumerState<AchievementsScreen> createState() => _AchievementsScreenState();
}

class _AchievementsScreenState extends ConsumerState<AchievementsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(gamificationProvider.notifier).fetchGamificationData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final gamificationState = ref.watch(gamificationProvider);
    final walletState = ref.watch(walletProvider);

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      appBar: AppBar(
        title: Text('অ্যাচিভমেন্ট', style: AppTypography.h4),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body:
          gamificationState.isLoading &&
              gamificationState.streak.currentStreak == 0
          ? _buildLoadingState()
          : RefreshIndicator(
              onRefresh: () => ref
                  .read(gamificationProvider.notifier)
                  .fetchGamificationData(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Streak Card
                    _buildStreakCard(gamificationState),
                    const SizedBox(height: 24),

                    // Level Card based on Loyalty
                    _buildLevelCard(walletState),
                    const SizedBox(height: 24),

                    // Stats
                    Row(
                      children: [
                        Expanded(
                          child: _StatCard(
                            icon: Icons.local_fire_department,
                            value: '${gamificationState.streak.currentStreak}',
                            label: 'স্ট্রিক',
                            color: Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            icon: Icons.calendar_month,
                            value: '${gamificationState.streak.totalLoginDays}',
                            label: 'মোট দিন',
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            icon: Icons.workspace_premium,
                            value: '${gamificationState.earnedBadges.length}',
                            label: 'ব্যাজ',
                            color: AppColors.starFilled,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Badges Section
                    Text('ব্যাজ সমূহ', style: AppTypography.h4),
                    const SizedBox(height: 12),

                    if (gamificationState.allBadges.isEmpty)
                      _buildEmptyBadges()
                    else
                      ...gamificationState.allBadges.map(
                        (badge) => _AchievementCard(
                          icon: _getBadgeIcon(badge.category),
                          title: badge.displayName,
                          description: badge.displayDescription,
                          isUnlocked: badge.isEarned,
                          points: badge.points,
                        ),
                      ),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStreakCard(GamificationState state) {
    final streak = state.streak;
    final nextReward = streak.nextReward;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.orange, Colors.deepOrange],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.orange.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.local_fire_department,
                color: Colors.white,
                size: 40,
              ),
              const SizedBox(width: 12),
              Text(
                '${streak.currentStreak}',
                style: AppTypography.h1.copyWith(
                  color: Colors.white,
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'দিন',
                style: AppTypography.h3.copyWith(color: Colors.white70),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'লগইন স্ট্রিক',
            style: AppTypography.labelLarge.copyWith(color: Colors.white),
          ),
          if (nextReward != null) ...[
            const SizedBox(height: 20),
            // Progress to next reward
            Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'পরবর্তী পুরস্কার',
                      style: AppTypography.labelSmall.copyWith(
                        color: Colors.white70,
                      ),
                    ),
                    Text(
                      '${nextReward.days} দিনে ৳${nextReward.reward}',
                      style: AppTypography.labelMedium.copyWith(
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                LinearProgressIndicator(
                  value: state.progressToNextReward,
                  backgroundColor: Colors.white24,
                  valueColor: const AlwaysStoppedAnimation(Colors.white),
                  borderRadius: BorderRadius.circular(10),
                ),
                const SizedBox(height: 4),
                Text(
                  'আর ${streak.daysUntilReward} দিন বাকি',
                  style: AppTypography.bodySmall.copyWith(
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLevelCard(WalletState walletState) {
    final tier = walletState.loyaltyTier;
    final tierName = walletState.loyaltyTierBengali;
    final points = walletState.loyaltyPoints;

    // Calculate progress to next tier
    int nextTierPoints = 1000;
    if (tier == 'silver') nextTierPoints = 5000;
    if (tier == 'gold') nextTierPoints = 10000;
    if (tier == 'platinum') nextTierPoints = 10000;

    final progress = (points / nextTierPoints).clamp(0.0, 1.0);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _getTierColors(tier),
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Icon(Icons.emoji_events, size: 50, color: _getTierIconColor(tier)),
          const SizedBox(height: 12),
          Text(tierName, style: AppTypography.h3.copyWith(color: Colors.white)),
          const SizedBox(height: 8),
          Text(
            '$points পয়েন্ট',
            style: AppTypography.labelMedium.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 16),
          // Progress Bar
          Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '০',
                    style: AppTypography.labelSmall.copyWith(
                      color: Colors.white70,
                    ),
                  ),
                  Text(
                    '$nextTierPoints পয়েন্ট',
                    style: AppTypography.labelSmall.copyWith(
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.white24,
                valueColor: AlwaysStoppedAnimation(_getTierIconColor(tier)),
                borderRadius: BorderRadius.circular(10),
              ),
            ],
          ),
        ],
      ),
    );
  }

  List<Color> _getTierColors(String tier) {
    switch (tier) {
      case 'silver':
        return [const Color(0xFF9E9E9E), const Color(0xFF616161)];
      case 'gold':
        return [const Color(0xFFFFD700), const Color(0xFFFFA000)];
      case 'platinum':
        return [const Color(0xFF7C4DFF), const Color(0xFF536DFE)];
      default:
        return [
          AppColors.secondary,
          AppColors.secondary.withValues(alpha: 0.8),
        ];
    }
  }

  Color _getTierIconColor(String tier) {
    switch (tier) {
      case 'silver':
        return Colors.white;
      case 'gold':
        return Colors.white;
      case 'platinum':
        return Colors.white;
      default:
        return AppColors.starFilled;
    }
  }

  IconData _getBadgeIcon(String category) {
    switch (category.toLowerCase()) {
      case 'streak':
        return Icons.local_fire_department;
      case 'booking':
        return Icons.hotel;
      case 'referral':
        return Icons.people;
      case 'review':
        return Icons.star;
      case 'explorer':
        return Icons.explore;
      default:
        return Icons.workspace_premium;
    }
  }

  Widget _buildEmptyBadges() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(
            Icons.workspace_premium_outlined,
            size: 60,
            color: AppColors.textTertiary.withValues(alpha: 0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'কোনো ব্যাজ নেই',
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'কার্যক্রম সম্পন্ন করে ব্যাজ অর্জন করুন',
            style: AppTypography.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Shimmer.fromColors(
            baseColor: AppColors.shimmerBase,
            highlightColor: AppColors.shimmerHighlight,
            child: Container(
              height: 180,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Shimmer.fromColors(
            baseColor: AppColors.shimmerBase,
            highlightColor: AppColors.shimmerHighlight,
            child: Container(
              height: 160,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: List.generate(
              3,
              (i) => Expanded(
                child: Shimmer.fromColors(
                  baseColor: AppColors.shimmerBase,
                  highlightColor: AppColors.shimmerHighlight,
                  child: Container(
                    height: 80,
                    margin: EdgeInsets.only(left: i > 0 ? 12 : 0),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
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
          Icon(icon, color: color, size: 28),
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
  final int points;

  const _AchievementCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.isUnlocked,
    required this.points,
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
                      const Icon(
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
              ],
            ),
          ),

          // Points
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isUnlocked
                  ? AppColors.starFilled.withValues(alpha: 0.1)
                  : AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '$points pt',
              style: AppTypography.labelSmall.copyWith(
                color: isUnlocked
                    ? AppColors.starFilled
                    : AppColors.textTertiary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
