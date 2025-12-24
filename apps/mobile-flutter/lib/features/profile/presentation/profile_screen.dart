// Profile Screen - World-Class Premium Design with API Integration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  String selectedLanguage = 'bn';

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final authState = ref.watch(authProvider);
    final isLoggedIn = authState.isAuthenticated;
    final user = authState.user;

    // Use user data from API or defaults
    final membershipTier = 'BRONZE';
    final bookingsCount = user?.totalBookings ?? 0;
    final walletBalance = user?.walletBalance ?? 0;
    final loyaltyPoints = user?.loyaltyPoints ?? 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Premium Header
            _ProfileHeader(
              isLoggedIn: isLoggedIn,
              membershipTier: membershipTier,
              onSignIn: () => context.push('/login'),
              onEditProfile: () => context.push('/edit-profile'),
              topPadding: topPadding,
            ),

            // Stats Card (only if logged in)
            if (isLoggedIn)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _StatsCard(
                  bookingsCount: bookingsCount,
                  walletBalance: walletBalance,
                  loyaltyPoints: loyaltyPoints,
                  onBookingsTap: () => context.go('/bookings'),
                  onWalletTap: () => context.push('/wallet'),
                  onPointsTap: () => context.push('/achievements'),
                ),
              ),

            const SizedBox(height: 16),

            // Account Section (only if logged in)
            if (isLoggedIn) ...[
              _MenuSection(
                title: 'অ্যাকাউন্ট',
                items: [
                  _MenuItemData(
                    icon: Icons.person_outline,
                    label: 'প্রোফাইল এডিট করুন',
                    onTap: () => context.push('/edit-profile'),
                  ),
                  _MenuItemData(
                    icon: Icons.qr_code_scanner,
                    label: 'QR স্ক্যান',
                    onTap: () => context.push('/qr-scanner'),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Bookings & Travel Section
              _MenuSection(
                title: 'বুকিং ও ভ্রমণ',
                items: [
                  _MenuItemData(
                    icon: Icons.luggage_outlined,
                    label: 'আমার ট্রিপ',
                    onTap: () => context.go('/bookings'),
                  ),
                  _MenuItemData(
                    icon: Icons.favorite_border,
                    label: 'সেভ করা হোটেল',
                    onTap: () => context.push('/saved'),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Wallet & Rewards Section
              _MenuSection(
                title: 'ওয়ালেট ও রিওয়ার্ড',
                items: [
                  _MenuItemData(
                    icon: Icons.account_balance_wallet_outlined,
                    label: 'ওয়ালেট',
                    onTap: () => context.push('/wallet'),
                  ),
                  _MenuItemData(
                    icon: Icons.card_giftcard_outlined,
                    label: 'রেফারেল',
                    onTap: () => context.push('/referral'),
                  ),
                  _MenuItemData(
                    icon: Icons.emoji_events_outlined,
                    label: 'অ্যাচিভমেন্ট',
                    onTap: () => context.push('/achievements'),
                  ),
                  _MenuItemData(
                    icon: Icons.local_offer_outlined,
                    label: 'অফার ও রিওয়ার্ড',
                    onTap: () => context.push('/achievements'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],

            // Preferences Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 8),
                    child: Text(
                      'পছন্দসমূহ',
                      style: AppTypography.labelMedium.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: AppColors.softShadow,
                    ),
                    child: Column(
                      children: [
                        // Language Selector
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withValues(
                                        alpha: 0.1,
                                      ),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Icon(
                                      Icons.language,
                                      color: AppColors.primary,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    'ভাষা',
                                    style: AppTypography.bodyMedium.copyWith(
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Padding(
                                padding: const EdgeInsets.only(left: 52),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: GestureDetector(
                                        onTap: () => setState(
                                          () => selectedLanguage = 'en',
                                        ),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 10,
                                          ),
                                          decoration: BoxDecoration(
                                            color: selectedLanguage == 'en'
                                                ? AppColors.primary
                                                : AppColors.surfaceVariant,
                                            borderRadius: BorderRadius.circular(
                                              12,
                                            ),
                                          ),
                                          child: Center(
                                            child: Text(
                                              'English',
                                              style: AppTypography.labelLarge
                                                  .copyWith(
                                                    color:
                                                        selectedLanguage == 'en'
                                                        ? Colors.white
                                                        : AppColors
                                                              .textSecondary,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: GestureDetector(
                                        onTap: () => setState(
                                          () => selectedLanguage = 'bn',
                                        ),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 10,
                                          ),
                                          decoration: BoxDecoration(
                                            color: selectedLanguage == 'bn'
                                                ? AppColors.primary
                                                : AppColors.surfaceVariant,
                                            borderRadius: BorderRadius.circular(
                                              12,
                                            ),
                                          ),
                                          child: Center(
                                            child: Text(
                                              'বাংলা',
                                              style: AppTypography.labelLarge
                                                  .copyWith(
                                                    color:
                                                        selectedLanguage == 'bn'
                                                        ? Colors.white
                                                        : AppColors
                                                              .textSecondary,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        const Divider(height: 1),

                        // Dark Mode Toggle
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(
                                    alpha: 0.1,
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(
                                  Icons.dark_mode_outlined,
                                  color: AppColors.primary,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'ডার্ক মোড',
                                  style: AppTypography.bodyMedium.copyWith(
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              Switch(
                                value: false,
                                onChanged: (value) {
                                  // TODO: Toggle dark mode
                                },
                                activeThumbColor: AppColors.primary,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Support Section
            _MenuSection(
              title: 'সাহায্য',
              items: [
                _MenuItemData(
                  icon: Icons.notifications_outlined,
                  label: 'নোটিফিকেশন',
                  onTap: () => context.push('/notifications'),
                ),
                _MenuItemData(
                  icon: Icons.help_outline,
                  label: 'সাহায্য ও সাপোর্ট',
                  onTap: () => context.push('/help'),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Logout Button
            if (isLoggedIn)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: GestureDetector(
                  onTap: () {
                    ref.read(authProvider.notifier).logout();
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: AppColors.errorLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.error.withValues(alpha: 0.3),
                        width: 2,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.logout,
                          color: AppColors.error,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'লগ আউট',
                          style: AppTypography.button.copyWith(
                            color: AppColors.error,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // App Info Footer
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 32),
              child: Column(
                children: [
                  Text(
                    'Zinu Rooms v1.0.0',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Made with ❤️ by ',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          // Open DigitalCare website
                        },
                        child: Text(
                          'DigitalCare',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  final bool isLoggedIn;
  final String membershipTier;
  final VoidCallback onSignIn;
  final VoidCallback onEditProfile;
  final double topPadding;

  const _ProfileHeader({
    required this.isLoggedIn,
    required this.membershipTier,
    required this.onSignIn,
    required this.onEditProfile,
    required this.topPadding,
  });

  Color _getTierColor() {
    switch (membershipTier) {
      case 'GOLD':
        return const Color(0xFFFFD700);
      case 'SILVER':
        return const Color(0xFFC0C0C0);
      default:
        return const Color(0xFFCD7F32);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Padding(
        padding: EdgeInsets.only(
          top: topPadding + 24,
          left: 20,
          right: 20,
          bottom: 32,
        ),
        child: Column(
          children: [
            // Avatar
            Stack(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.2),
                    border: Border.all(color: Colors.white, width: 3),
                  ),
                  child: isLoggedIn
                      ? const Icon(Icons.person, size: 50, color: Colors.white)
                      : const Icon(
                          Icons.person_outline,
                          size: 50,
                          color: Colors.white,
                        ),
                ),
                if (isLoggedIn)
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: GestureDetector(
                      onTap: onEditProfile,
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.2),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          size: 16,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),

            // Name
            Text(
              isLoggedIn ? 'ব্যবহারকারী' : 'অতিথি ব্যবহারকারী',
              style: AppTypography.h3.copyWith(color: Colors.white),
            ),

            // Membership Badge (if logged in)
            if (isLoggedIn) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: _getTierColor().withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _getTierColor(), width: 1),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.star, size: 14, color: _getTierColor()),
                    const SizedBox(width: 4),
                    Text(
                      membershipTier,
                      style: AppTypography.labelSmall.copyWith(
                        color: _getTierColor(),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Sign In Button (if not logged in)
            if (!isLoggedIn) ...[
              const SizedBox(height: 8),
              Text(
                'লগইন করুন সব ফিচার ব্যবহার করতে',
                style: AppTypography.bodySmall.copyWith(
                  color: Colors.white.withValues(alpha: 0.8),
                ),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: onSignIn,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Text(
                    'লগইন করুন',
                    style: AppTypography.button.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatsCard extends StatelessWidget {
  final int bookingsCount;
  final int walletBalance;
  final int loyaltyPoints;
  final VoidCallback onBookingsTap;
  final VoidCallback onWalletTap;
  final VoidCallback onPointsTap;

  const _StatsCard({
    required this.bookingsCount,
    required this.walletBalance,
    required this.loyaltyPoints,
    required this.onBookingsTap,
    required this.onWalletTap,
    required this.onPointsTap,
  });

  @override
  Widget build(BuildContext context) {
    return Transform.translate(
      offset: const Offset(0, -20),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
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
            Expanded(
              child: _StatItem(
                icon: Icons.luggage_outlined,
                value: bookingsCount.toString(),
                label: 'বুকিং',
                onTap: onBookingsTap,
              ),
            ),
            Container(width: 1, height: 40, color: AppColors.divider),
            Expanded(
              child: _StatItem(
                icon: Icons.account_balance_wallet_outlined,
                value: '৳$walletBalance',
                label: 'ওয়ালেট',
                onTap: onWalletTap,
              ),
            ),
            Container(width: 1, height: 40, color: AppColors.divider),
            Expanded(
              child: _StatItem(
                icon: Icons.star_outline,
                value: loyaltyPoints.toString(),
                label: 'পয়েন্ট',
                onTap: onPointsTap,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final VoidCallback onTap;

  const _StatItem({
    required this.icon,
    required this.value,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTypography.h4.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuItemData {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  _MenuItemData({required this.icon, required this.label, required this.onTap});
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItemData> items;

  const _MenuSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              title,
              style: AppTypography.labelMedium.copyWith(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: AppColors.softShadow,
            ),
            child: Column(
              children: items.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                return Column(
                  children: [
                    _MenuItem(
                      icon: item.icon,
                      label: item.label,
                      onTap: item.onTap,
                    ),
                    if (index < items.length - 1)
                      const Divider(height: 1, indent: 56),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: AppTypography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: AppColors.textTertiary,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
