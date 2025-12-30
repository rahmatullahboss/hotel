// Notifications Screen - Premium White Label Design with Real Provider
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import 'package:intl/intl.dart';
import '../providers/user_notifications_provider.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final topPadding = MediaQuery.of(context).padding.top;
    final notificationsState = ref.watch(userNotificationsProvider);
    final notifications = notificationsState.notifications;

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      body: Column(
        children: [
          // Premium Header with Dark Mode
          Container(
            padding: EdgeInsets.only(
              top: topPadding + 12,
              left: 20,
              right: 20,
              bottom: 16,
            ),
            decoration: BoxDecoration(
              color: AppColors.isDarkMode(context)
                  ? AppColors.surfaceDark
                  : Colors.white,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(28),
                bottomRight: Radius.circular(28),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.isDarkMode(context)
                          ? Colors.white.withValues(alpha: 0.1)
                          : AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      Icons.arrow_back_ios_new,
                      color: AppColors.isDarkMode(context)
                          ? Colors.white
                          : AppColors.textPrimary,
                      size: 18,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Text(
                  'নোটিফিকেশন',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.isDarkMode(context)
                        ? Colors.white
                        : AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                if (notifications.isNotEmpty)
                  TextButton(
                    onPressed: () {
                      ref
                          .read(userNotificationsProvider.notifier)
                          .markAllAsRead();
                    },
                    child: Text(
                      'সব পড়া হয়েছে',
                      style: GoogleFonts.notoSans(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Notifications List
          Expanded(
            child: _buildContent(
              context,
              ref,
              notificationsState,
              notifications,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    WidgetRef ref,
    UserNotificationsState state,
    List<UserNotification> notifications,
  ) {
    // Loading state
    if (state.isLoading) {
      return ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: 3,
        itemBuilder: (_, __) => _NotificationShimmer(),
      );
    }

    // Empty state
    if (notifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.notifications_off_outlined,
                size: 40,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'কোনো নোটিফিকেশন নেই',
              style: AppTypography.h4.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            Text(
              'নতুন বুকিং বা অফার পেলে জানাব',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
          ],
        ),
      );
    }

    // Data state
    return RefreshIndicator(
      onRefresh: () => ref.read(userNotificationsProvider.notifier).refresh(),
      color: AppColors.primary,
      child: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: notifications.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final notification = notifications[index];
          return Dismissible(
            key: Key(notification.id),
            direction: DismissDirection.endToStart,
            background: Container(
              alignment: Alignment.centerRight,
              padding: const EdgeInsets.only(right: 20),
              decoration: BoxDecoration(
                color: AppColors.error,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.delete, color: Colors.white),
            ),
            onDismissed: (_) {
              ref
                  .read(userNotificationsProvider.notifier)
                  .deleteNotification(notification.id);
            },
            child: GestureDetector(
              onTap: () {
                if (!notification.isRead) {
                  ref
                      .read(userNotificationsProvider.notifier)
                      .markAsRead(notification.id);
                }
              },
              child: _NotificationCard(notification: notification),
            ),
          );
        },
      ),
    );
  }
}

class _NotificationShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Shimmer.fromColors(
        baseColor: AppColors.shimmerBase,
        highlightColor: AppColors.shimmerHighlight,
        child: Container(
          height: 100,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final UserNotification notification;

  const _NotificationCard({required this.notification});

  IconData get _icon {
    switch (notification.type) {
      case 'booking':
        return Icons.luggage_outlined;
      case 'promo':
        return Icons.local_offer_outlined;
      default:
        return Icons.info_outline;
    }
  }

  Color get _iconColor {
    switch (notification.type) {
      case 'booking':
        return AppColors.success;
      case 'promo':
        return AppColors.warning;
      default:
        return AppColors.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDarkMode(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: notification.isRead
            ? (isDark ? AppColors.surfaceDark : Colors.white)
            : AppColors.primary.withValues(alpha: isDark ? 0.15 : 0.05),
        borderRadius: BorderRadius.circular(20),
        border: notification.isRead
            ? null
            : Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
        boxShadow: isDark ? [] : AppColors.softShadow,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: _iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(_icon, color: _iconColor, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        notification.title,
                        style: AppTypography.labelLarge.copyWith(
                          fontWeight: notification.isRead
                              ? FontWeight.w500
                              : FontWeight.w600,
                          color: isDark ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                    ),
                    if (!notification.isRead)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  notification.message,
                  style: AppTypography.bodySmall.copyWith(
                    color: isDark ? Colors.white70 : AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _formatTime(notification.createdAt),
                  style: AppTypography.labelSmall.copyWith(
                    color: isDark ? Colors.white54 : AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inHours < 1) {
      return '${diff.inMinutes} মিনিট আগে';
    } else if (diff.inHours < 24) {
      return '${diff.inHours} ঘণ্টা আগে';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} দিন আগে';
    } else {
      return DateFormat('dd MMM').format(date);
    }
  }
}
