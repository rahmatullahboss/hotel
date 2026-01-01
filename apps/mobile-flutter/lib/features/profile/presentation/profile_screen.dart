// Profile Screen - Premium White Label Design with API Integration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../core/l10n/locale_provider.dart';
import '../../../core/providers/currency_provider.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/wallet_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch wallet data when screen loads
    Future.microtask(() {
      if (ref.read(authProvider).isAuthenticated) {
        ref.read(walletProvider.notifier).fetchWallet();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final authState = ref.watch(authProvider);
    final isLoggedIn = authState.isAuthenticated;
    final user = authState.user;

    // Use walletProvider for accurate wallet/points data
    final walletState = ref.watch(walletProvider);

    // Use user data from API or defaults
    final membershipTier = walletState.loyaltyTier.toUpperCase();
    final bookingsCount = user?.totalBookings ?? 0;
    final walletBalance = walletState.balance;
    final loyaltyPoints = walletState.loyaltyPoints;

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Premium Header
            _ProfileHeader(
              isLoggedIn: isLoggedIn,
              userName: user?.name,
              avatarUrl: user?.avatarUrl,
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
                title: AppLocalizations.of(context)!.account,
                items: [
                  _MenuItemData(
                    icon: Icons.person_outline,
                    label: AppLocalizations.of(context)!.editProfile,
                    onTap: () => context.push('/edit-profile'),
                  ),
                  _MenuItemData(
                    icon: Icons.qr_code_scanner,
                    label: AppLocalizations.of(context)!.qrScan,
                    onTap: () => context.push('/qr-scanner'),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Bookings & Travel Section
              _MenuSection(
                title: AppLocalizations.of(context)!.bookingsAndTrips,
                items: [
                  _MenuItemData(
                    icon: Icons.luggage_outlined,
                    label: AppLocalizations.of(context)!.myTrips,
                    onTap: () => context.go('/bookings'),
                  ),
                  _MenuItemData(
                    icon: Icons.favorite_border,
                    label: AppLocalizations.of(context)!.savedHotels,
                    onTap: () => context.push('/saved'),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Wallet & Rewards Section
              _MenuSection(
                title: AppLocalizations.of(context)!.walletAndRewards,
                items: [
                  _MenuItemData(
                    icon: Icons.account_balance_wallet_outlined,
                    label: AppLocalizations.of(context)!.wallet,
                    onTap: () => context.push('/wallet'),
                  ),
                  _MenuItemData(
                    icon: Icons.card_giftcard_outlined,
                    label: AppLocalizations.of(context)!.referral,
                    onTap: () => context.push('/referral'),
                  ),
                  _MenuItemData(
                    icon: Icons.emoji_events_outlined,
                    label: AppLocalizations.of(context)!.achievements,
                    onTap: () => context.push('/achievements'),
                  ),
                  _MenuItemData(
                    icon: Icons.local_offer_outlined,
                    label: AppLocalizations.of(context)!.offersAndRewards,
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
                      AppLocalizations.of(context)!.preferences,
                      style: AppTypography.labelMedium.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.adaptiveSurface(context),
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
                                    AppLocalizations.of(context)!.language,
                                    style: AppTypography.bodyMedium.copyWith(
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Padding(
                                padding: const EdgeInsets.only(left: 52),
                                child: Builder(
                                  builder: (context) {
                                    final isEnglish =
                                        ref
                                            .watch(localeProvider)
                                            .locale
                                            .languageCode ==
                                        'en';
                                    return Row(
                                      children: [
                                        Expanded(
                                          child: GestureDetector(
                                            onTap: () => ref
                                                .read(localeProvider.notifier)
                                                .setLocale(AppLocales.english),
                                            child: Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    vertical: 10,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: isEnglish
                                                    ? AppColors.primary
                                                    : AppColors.surfaceVariant,
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  'English',
                                                  style: AppTypography
                                                      .labelLarge
                                                      .copyWith(
                                                        color: isEnglish
                                                            ? Colors.white
                                                            : AppColors
                                                                  .textSecondary,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: GestureDetector(
                                            onTap: () => ref
                                                .read(localeProvider.notifier)
                                                .setLocale(AppLocales.bengali),
                                            child: Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    vertical: 10,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: !isEnglish
                                                    ? AppColors.primary
                                                    : AppColors.surfaceVariant,
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  'বাংলা',
                                                  style: AppTypography
                                                      .labelLarge
                                                      .copyWith(
                                                        color: !isEnglish
                                                            ? Colors.white
                                                            : AppColors
                                                                  .textSecondary,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    );
                                  },
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
                                value: ref.watch(isDarkModeProvider),
                                onChanged: (value) {
                                  ref
                                      .read(themeProvider.notifier)
                                      .toggleDarkMode();
                                },
                                activeThumbColor: AppColors.primary,
                              ),
                            ],
                          ),
                        ),

                        const Divider(height: 1),

                        // Currency Toggle
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
                                      Icons.currency_exchange,
                                      color: AppColors.primary,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    'মুদ্রা (Currency)',
                                    style: AppTypography.bodyMedium.copyWith(
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Padding(
                                padding: const EdgeInsets.only(left: 52),
                                child: Builder(
                                  builder: (context) {
                                    final isBDT =
                                        ref.watch(currencyProvider).currency ==
                                        Currency.bdt;
                                    return Row(
                                      children: [
                                        Expanded(
                                          child: GestureDetector(
                                            onTap: () => ref
                                                .read(currencyProvider.notifier)
                                                .setCurrency(Currency.bdt),
                                            child: Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    vertical: 10,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: isBDT
                                                    ? AppColors.primary
                                                    : AppColors.surfaceVariant,
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  '৳ BDT',
                                                  style: AppTypography
                                                      .labelLarge
                                                      .copyWith(
                                                        color: isBDT
                                                            ? Colors.white
                                                            : AppColors
                                                                  .textSecondary,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: GestureDetector(
                                            onTap: () => ref
                                                .read(currencyProvider.notifier)
                                                .setCurrency(Currency.usd),
                                            child: Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    vertical: 10,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: !isBDT
                                                    ? AppColors.primary
                                                    : AppColors.surfaceVariant,
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  '\$ USD',
                                                  style: AppTypography
                                                      .labelLarge
                                                      .copyWith(
                                                        color: !isBDT
                                                            ? Colors.white
                                                            : AppColors
                                                                  .textSecondary,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    );
                                  },
                                ),
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
              title: AppLocalizations.of(context)!.help,
              items: [
                _MenuItemData(
                  icon: Icons.notifications_outlined,
                  label: AppLocalizations.of(context)!.notifications,
                  onTap: () => context.push('/notifications'),
                ),
                _MenuItemData(
                  icon: Icons.help_outline,
                  label: AppLocalizations.of(context)!.helpAndSupport,
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
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        width: 2,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.logout, color: AppColors.primary, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          AppLocalizations.of(context)!.logout,
                          style: AppTypography.button.copyWith(
                            color: AppColors.primary,
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
  final String? userName;
  final String? avatarUrl;
  final String membershipTier;
  final VoidCallback onSignIn;
  final VoidCallback onEditProfile;
  final double topPadding;

  const _ProfileHeader({
    required this.isLoggedIn,
    this.userName,
    this.avatarUrl,
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
    final isDark = AppColors.isDarkMode(context);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: EdgeInsets.only(
          top: topPadding + 16,
          left: 20,
          right: 20,
          bottom: 24,
        ),
        child: Column(
          children: [
            // Avatar with primary color ring
            Stack(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.1)
                        : AppColors.surfaceVariant,
                    border: Border.all(color: AppColors.primary, width: 3),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: isLoggedIn
                      ? (avatarUrl != null && avatarUrl!.isNotEmpty
                            ? ClipOval(
                                child: Image.network(
                                  avatarUrl!,
                                  width: 94,
                                  height: 94,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Icon(
                                    Icons.person,
                                    size: 50,
                                    color: AppColors.primary,
                                  ),
                                ),
                              )
                            : Icon(
                                Icons.person,
                                size: 50,
                                color: AppColors.primary,
                              ))
                      : Icon(
                          Icons.person_outline,
                          size: 50,
                          color: isDark
                              ? Colors.white54
                              : AppColors.textTertiary,
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
                          color: AppColors.primary,
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
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),

            // Name
            Text(
              isLoggedIn
                  ? (userName ?? AppLocalizations.of(context)!.user)
                  : AppLocalizations.of(context)!.guestUser,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
            ),

            // Membership Badge (if logged in)
            if (isLoggedIn) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: _getTierColor().withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _getTierColor().withValues(alpha: 0.5),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.star, size: 14, color: _getTierColor()),
                    const SizedBox(width: 4),
                    Text(
                      membershipTier,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _getTierColor(),
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
                AppLocalizations.of(context)!.loginPrompt,
                style: GoogleFonts.notoSans(
                  fontSize: 14,
                  color: isDark ? Colors.white60 : AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: onSignIn,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 14,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Text(
                    AppLocalizations.of(context)!.login,
                    style: GoogleFonts.notoSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
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

class _StatsCard extends ConsumerWidget {
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
  Widget build(BuildContext context, WidgetRef ref) {
    final currencyState = ref.watch(currencyProvider);

    return Transform.translate(
      offset: const Offset(0, -20),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        decoration: BoxDecoration(
          color: AppColors.adaptiveSurface(context),
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
                label: AppLocalizations.of(context)!.bookings,
                onTap: onBookingsTap,
              ),
            ),
            Container(width: 1, height: 40, color: AppColors.divider),
            Expanded(
              child: _StatItem(
                icon: Icons.account_balance_wallet_outlined,
                value: currencyState.formatPrice(walletBalance),
                label: 'ওয়ালেট',
                onTap: onWalletTap,
              ),
            ),
            Container(width: 1, height: 40, color: AppColors.divider),
            Expanded(
              child: _StatItem(
                icon: Icons.star_outline,
                value: loyaltyPoints.toString(),
                label: AppLocalizations.of(context)!.points,
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
              color: AppColors.adaptiveSurface(context),
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
