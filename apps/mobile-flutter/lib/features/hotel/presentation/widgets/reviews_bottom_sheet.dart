// Reviews Bottom Sheet - Shows all hotel reviews
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class ReviewsBottomSheet extends StatelessWidget {
  final double rating;
  final int reviewCount;
  final String hotelName;

  const ReviewsBottomSheet({
    super.key,
    required this.rating,
    required this.reviewCount,
    required this.hotelName,
  });

  static Future<void> show(
    BuildContext context, {
    required double rating,
    required int reviewCount,
    required String hotelName,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ReviewsBottomSheet(
        rating: rating,
        reviewCount: reviewCount,
        hotelName: hotelName,
      ),
    );
  }

  String _getRatingText(double rating) {
    if (rating >= 4.5) return 'অসাধারণ';
    if (rating >= 4.0) return 'খুব ভালো';
    if (rating >= 3.5) return 'ভালো';
    if (rating >= 3.0) return 'মোটামুটি';
    return 'গড়পড়তা';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDarkMode(context);

    // Mock reviews data - in real app, fetch from API
    final reviews = _generateMockReviews(reviewCount);

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.surfaceDark : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : AppColors.divider,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Header
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'গেস্ট রিভিউ',
                            style: AppTypography.h3.copyWith(
                              color: isDark
                                  ? Colors.white
                                  : AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            hotelName,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Rating badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          Text(
                            rating.toStringAsFixed(1),
                            style: AppTypography.h2.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            _getRatingText(rating),
                            style: AppTypography.labelSmall.copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Summary stats
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    _StatChip(
                      icon: Icons.star_rounded,
                      label: '$reviewCount রিভিউ',
                      isDark: isDark,
                    ),
                    const SizedBox(width: 12),
                    _StatChip(
                      icon: Icons.verified,
                      label: 'যাচাইকৃত',
                      isDark: isDark,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              Divider(color: isDark ? Colors.white12 : AppColors.divider),

              // Reviews list
              Expanded(
                child: ListView.separated(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  itemCount: reviews.length,
                  separatorBuilder: (_, _i) => Divider(
                    height: 32,
                    color: isDark ? Colors.white12 : AppColors.divider,
                  ),
                  itemBuilder: (context, index) {
                    final review = reviews[index];
                    return _ReviewCard(
                      name: review['name']!,
                      date: review['date']!,
                      rating: double.parse(review['rating']!),
                      comment: review['comment']!,
                      isDark: isDark,
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  List<Map<String, String>> _generateMockReviews(int count) {
    final reviews = <Map<String, String>>[
      {
        'name': 'আহমেদ হোসেন',
        'date': '২ সপ্তাহ আগে',
        'rating': '5.0',
        'comment':
            'অসাধারণ অভিজ্ঞতা! রুম পরিষ্কার ছিল, স্টাফদের আচরণ খুবই ভালো। আবার আসব অবশ্যই।',
      },
      {
        'name': 'সাবরিনা আক্তার',
        'date': '১ মাস আগে',
        'rating': '4.5',
        'comment':
            'পরিবারের সাথে ভ্রমণে দারুণ জায়গা। বাচ্চাদের জন্যও ভালো ব্যবস্থা আছে।',
      },
      {
        'name': 'করিম উদ্দিন',
        'date': '২ মাস আগে',
        'rating': '4.0',
        'comment':
            'লোকেশন ভালো, কিন্তু ব্রেকফাস্টে আরেকটু ভ্যারাইটি থাকলে ভালো হতো।',
      },
      {
        'name': 'নাসরিন বেগম',
        'date': '৩ মাস আগে',
        'rating': '5.0',
        'comment':
            'সুইমিং পুল এবং জিম এর সুবিধা চমৎকার। স্পা সার্ভিসও খুব ভালো।',
      },
      {
        'name': 'ফারুক আহমেদ',
        'date': '৪ মাস আগে',
        'rating': '4.5',
        'comment':
            'বিজনেস ট্রিপে এসেছিলাম, ওয়াইফাই স্পিড ভালো, কনফারেন্স রুম সুবিধাজনক।',
      },
    ];

    // Repeat reviews to match count (mock data)
    final result = <Map<String, String>>[];
    for (int i = 0; i < count && i < 20; i++) {
      result.add(reviews[i % reviews.length]);
    }
    return result;
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isDark;

  const _StatChip({
    required this.icon,
    required this.label,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.08)
            : AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: isDark ? Colors.white : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final String name;
  final String date;
  final double rating;
  final String comment;
  final bool isDark;

  const _ReviewCard({
    required this.name,
    required this.date,
    required this.rating,
    required this.comment,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 20,
              backgroundColor: AppColors.primary.withValues(alpha: 0.1),
              child: Text(
                name.isNotEmpty ? name[0] : '?',
                style: AppTypography.labelLarge.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Name and date
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: AppTypography.labelMedium.copyWith(
                      color: isDark ? Colors.white : AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    date,
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            // Rating
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.starFilled.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.star_rounded,
                    size: 14,
                    color: AppColors.starFilled,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    rating.toStringAsFixed(1),
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.starFilled,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          comment,
          style: AppTypography.bodyMedium.copyWith(
            color: isDark ? Colors.white70 : AppColors.textSecondary,
            height: 1.5,
          ),
        ),
      ],
    );
  }
}
