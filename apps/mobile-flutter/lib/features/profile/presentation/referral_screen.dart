// Referral Screen with API Integration
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../providers/referral_provider.dart';

class ReferralScreen extends ConsumerStatefulWidget {
  const ReferralScreen({super.key});

  @override
  ConsumerState<ReferralScreen> createState() => _ReferralScreenState();
}

class _ReferralScreenState extends ConsumerState<ReferralScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(referralProvider.notifier).fetchReferralData();
    });
  }

  String _formatCurrency(int amount) {
    return amount.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  @override
  Widget build(BuildContext context) {
    final referralState = ref.watch(referralProvider);
    final referralCode = referralState.code ?? 'ZINU-XXXX';

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      appBar: AppBar(
        title: Text('রেফারেল', style: AppTypography.h4),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: referralState.isLoading && referralState.code == null
          ? _buildLoadingState()
          : RefreshIndicator(
              onRefresh: () =>
                  ref.read(referralProvider.notifier).fetchReferralData(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Header Image
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.card_giftcard,
                        size: 60,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Title
                    Text(
                      'বন্ধুদের আমন্ত্রণ জানান',
                      style: AppTypography.h2,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'প্রতি সফল রেফারেলে ৳১০০ বোনাস পান!',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),

                    // Referral Code
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppColors.primary.withValues(alpha: 0.3),
                          width: 2,
                          strokeAlign: BorderSide.strokeAlignOutside,
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            'আপনার রেফারেল কোড',
                            style: AppTypography.labelMedium,
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                referralCode,
                                style: AppTypography.h2.copyWith(
                                  color: AppColors.primary,
                                  letterSpacing: 4,
                                ),
                              ),
                              const SizedBox(width: 12),
                              IconButton(
                                onPressed: () {
                                  Clipboard.setData(
                                    ClipboardData(text: referralCode),
                                  );
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('কোড কপি হয়েছে!'),
                                      duration: Duration(seconds: 2),
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.copy),
                                color: AppColors.primary,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Share Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          SharePlus.instance.share(
                            ShareParams(
                              text:
                                  'Zinu Rooms এ সাইন আপ করুন এবং আমার রেফারেল কোড $referralCode ব্যবহার করে ৳১০০ বোনাস পান! https://zinurooms.com/app',
                            ),
                          );
                        },
                        icon: const Icon(Icons.share),
                        label: const Text('শেয়ার করুন'),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Stats
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: _StatItem(
                              value: '${referralState.totalReferrals}',
                              label: 'মোট রেফারেল',
                              icon: Icons.people_outline,
                            ),
                          ),
                          Container(
                            width: 1,
                            height: 50,
                            color: AppColors.divider,
                          ),
                          Expanded(
                            child: _StatItem(
                              value:
                                  '৳${_formatCurrency(referralState.totalEarned)}',
                              label: 'মোট আয়',
                              icon: Icons.monetization_on_outlined,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Pending vs Completed
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: _StatItem(
                              value: '${referralState.pendingReferrals}',
                              label: 'পেন্ডিং',
                              icon: Icons.hourglass_empty,
                            ),
                          ),
                          Container(
                            width: 1,
                            height: 50,
                            color: AppColors.divider,
                          ),
                          Expanded(
                            child: _StatItem(
                              value: '${referralState.completedReferrals}',
                              label: 'সম্পন্ন',
                              icon: Icons.check_circle_outline,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Referral History
                    if (referralState.history.isNotEmpty) ...[
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text('রেফারেল ইতিহাস', style: AppTypography.h4),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: referralState.history.length,
                          separatorBuilder: (_, __) =>
                              Divider(height: 1, color: AppColors.divider),
                          itemBuilder: (context, index) {
                            final item = referralState.history[index];
                            return _ReferralHistoryItem(item: item);
                          },
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],

                    // How it works
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('কিভাবে কাজ করে', style: AppTypography.h4),
                          const SizedBox(height: 16),
                          const _StepItem(
                            number: '১',
                            title: 'শেয়ার করুন',
                            description:
                                'আপনার রেফারেল কোড বন্ধুদের সাথে শেয়ার করুন',
                          ),
                          const _StepItem(
                            number: '২',
                            title: 'সাইন আপ',
                            description: 'বন্ধু আপনার কোড দিয়ে সাইন আপ করবে',
                          ),
                          const _StepItem(
                            number: '৩',
                            title: 'বুকিং',
                            description: 'বন্ধু প্রথম বুকিং সম্পন্ন করবে',
                          ),
                          const _StepItem(
                            number: '৪',
                            title: 'বোনাস',
                            description: 'আপনারা দুজনেই ৳১০০ বোনাস পাবেন!',
                            isLast: true,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
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
              width: 120,
              height: 120,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Shimmer.fromColors(
            baseColor: AppColors.shimmerBase,
            highlightColor: AppColors.shimmerHighlight,
            child: Container(
              height: 100,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Shimmer.fromColors(
            baseColor: AppColors.shimmerBase,
            highlightColor: AppColors.shimmerHighlight,
            child: Container(
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReferralHistoryItem extends StatelessWidget {
  final ReferralHistoryItem item;

  const _ReferralHistoryItem({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
            backgroundImage: item.referredUserImage != null
                ? NetworkImage(item.referredUserImage!)
                : null,
            child: item.referredUserImage == null
                ? const Icon(Icons.person, color: AppColors.primary)
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.referredUserName, style: AppTypography.labelMedium),
                Text(
                  DateFormat('dd MMM, yyyy').format(item.createdAt),
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: (item.isCompleted ? AppColors.success : AppColors.warning)
                  .withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              item.isCompleted ? '৳${item.reward}' : 'পেন্ডিং',
              style: AppTypography.labelSmall.copyWith(
                color: item.isCompleted ? AppColors.success : AppColors.warning,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;

  const _StatItem({
    required this.value,
    required this.label,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary, size: 28),
        const SizedBox(height: 8),
        Text(value, style: AppTypography.h3),
        Text(label, style: AppTypography.labelSmall),
      ],
    );
  }
}

class _StepItem extends StatelessWidget {
  final String number;
  final String title;
  final String description;
  final bool isLast;

  const _StepItem({
    required this.number,
    required this.title,
    required this.description,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  number,
                  style: AppTypography.labelLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 30,
                color: AppColors.primary.withValues(alpha: 0.3),
              ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(bottom: isLast ? 0 : 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.labelLarge),
                Text(description, style: AppTypography.bodySmall),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
