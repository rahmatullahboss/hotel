// Profile Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Profile Header
              const _ProfileHeader(),
              const SizedBox(height: 24),

              // Stats Card
              const _StatsCard(),
              const SizedBox(height: 24),

              // Menu Items
              _MenuSection(
                title: 'অ্যাকাউন্ট',
                items: [
                  _MenuItem(
                    icon: Icons.person_outline,
                    label: 'প্রোফাইল এডিট করুন',
                    onTap: () {},
                  ),
                  _MenuItem(
                    icon: Icons.account_balance_wallet_outlined,
                    label: 'ওয়ালেট',
                    onTap: () {},
                  ),
                  _MenuItem(
                    icon: Icons.card_giftcard_outlined,
                    label: 'রেফারেল',
                    onTap: () {},
                  ),
                  _MenuItem(
                    icon: Icons.emoji_events_outlined,
                    label: 'অ্যাচিভমেন্ট',
                    onTap: () {},
                  ),
                ],
              ),
              const SizedBox(height: 16),

              _MenuSection(
                title: 'সেটিংস',
                items: [
                  _MenuItem(
                    icon: Icons.notifications_outlined,
                    label: 'নোটিফিকেশন',
                    onTap: () {},
                  ),
                  _MenuItem(
                    icon: Icons.language_outlined,
                    label: 'ভাষা',
                    trailing: 'বাংলা',
                    onTap: () {},
                  ),
                  _MenuItem(
                    icon: Icons.help_outline,
                    label: 'সাহায্য',
                    onTap: () {},
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Logout
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: _MenuItem(
                  icon: Icons.logout,
                  label: 'লগ আউট',
                  iconColor: AppColors.error,
                  labelColor: AppColors.error,
                  onTap: () {
                    // Logout logic
                  },
                ),
              ),

              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Avatar
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary.withValues(alpha: 0.1),
            border: Border.all(
              color: AppColors.primary,
              width: 3,
            ),
          ),
          child: const Icon(
            Icons.person,
            size: 50,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 16),

        // Name
        Text(
          'অতিথি ব্যবহারকারী',
          style: AppTypography.h3,
        ),
        const SizedBox(height: 4),
        Text(
          'লগইন করুন সব ফিচার ব্যবহার করতে',
          style: AppTypography.bodySmall,
        ),
        const SizedBox(height: 12),

        // Login Button
        ElevatedButton(
          onPressed: () => context.push('/login'),
          child: const Text('লগইন করুন'),
        ),
      ],
    );
  }
}

class _StatsCard extends StatelessWidget {
  const _StatsCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary,
            AppColors.primaryDark,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatItem(value: '0', label: 'বুকিং'),
          _StatDivider(),
          _StatItem(value: '৳0', label: 'ওয়ালেট'),
          _StatDivider(),
          _StatItem(value: '0', label: 'পয়েন্ট'),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String label;

  const _StatItem({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: AppTypography.h3.copyWith(color: Colors.white),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTypography.labelSmall.copyWith(
            color: Colors.white.withValues(alpha: 0.8),
          ),
        ),
      ],
    );
  }
}

class _StatDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 40,
      color: Colors.white.withValues(alpha: 0.3),
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;

  const _MenuSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(title, style: AppTypography.labelMedium),
        ),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: items,
          ),
        ),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? trailing;
  final Color? iconColor;
  final Color? labelColor;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.label,
    this.trailing,
    this.iconColor,
    this.labelColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(
        icon,
        color: iconColor ?? AppColors.textSecondary,
      ),
      title: Text(
        label,
        style: AppTypography.bodyMedium.copyWith(
          color: labelColor ?? AppColors.textPrimary,
        ),
      ),
      trailing: trailing != null
          ? Text(trailing!, style: AppTypography.bodySmall)
          : const Icon(Icons.chevron_right, color: AppColors.textTertiary),
      onTap: onTap,
    );
  }
}
