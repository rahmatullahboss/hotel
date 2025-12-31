// Home Screen - Premium White Label Design with API Integration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shimmer/shimmer.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/hotel_card.dart';
import '../../../shared/widgets/city_card.dart';
import '../../../shared/widgets/search_bar_widget.dart';
import '../../../shared/widgets/date_selection_bar.dart';
import '../../../shared/widgets/promo_banner.dart';
import '../../../shared/widgets/featured_hotel_carousel.dart';
import '../../../shared/widgets/special_deals_section.dart';

import '../../../l10n/generated/app_localizations.dart';
import '../providers/hotel_provider.dart';
import '../providers/saved_hotels_provider.dart';
import '../../profile/providers/user_notifications_provider.dart';

// City images - Real photos of Bangladeshi landmarks
const Map<String, String> cityImages = {
  'Dhaka':
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
  'Chittagong':
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
  'Cox\'s Bazar':
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
  'Sylhet':
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800',
  'Rajshahi':
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800',
  'Khulna':
      'https://images.unsplash.com/photo-1468746587034-766ade47c1ac?q=80&w=800',
};

// Quick filter data with icons
const List<Map<String, dynamic>> quickFilters = [
  {'id': 'nearby', 'icon': Icons.location_on_outlined},
  {'id': 'budget', 'icon': Icons.savings_outlined},
  {'id': 'luxury', 'icon': Icons.star_outline},
  {'id': 'couple', 'icon': Icons.favorite_outline},
];

// Popular cities
const List<Map<String, dynamic>> popularCities = [
  {'name': 'Dhaka', 'count': 45},
  {'name': 'Chittagong', 'count': 28},
  {'name': 'Cox\'s Bazar', 'count': 52},
  {'name': 'Sylhet', 'count': 18},
];

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String? activeFilter;
  DateTime checkIn = DateTime.now().add(const Duration(days: 1));
  DateTime checkOut = DateTime.now().add(const Duration(days: 2));

  String _getFilterLabel(BuildContext context, String filterId) {
    final loc = AppLocalizations.of(context)!;
    switch (filterId) {
      case 'nearby':
        return loc.filterNearby;
      case 'budget':
        return loc.filterBudget;
      case 'luxury':
        return loc.filterLuxury;
      case 'couple':
        return loc.filterCouple;
      default:
        return '';
    }
  }

  String _getCityName(BuildContext context, String cityId) {
    final loc = AppLocalizations.of(context)!;
    switch (cityId) {
      case 'Dhaka':
        return loc.cityDhaka;
      case 'Chittagong':
        return loc.cityChittagong;
      case 'Cox\'s Bazar':
        return loc.cityCoxsBazar;
      case 'Sylhet':
        return loc.citySylhet;
      case 'Rajshahi':
        return loc.cityRajshahi;
      case 'Khulna':
        return loc.cityKhulna;
      default:
        return cityId;
    }
  }

  String _getTimeBasedGreeting(BuildContext context) {
    final hour = DateTime.now().hour;
    final loc = AppLocalizations.of(context)!;

    if (hour >= 5 && hour < 12) {
      return loc.goodMorning;
    } else if (hour >= 12 && hour < 17) {
      return loc.goodAfternoon;
    } else if (hour >= 17 && hour < 21) {
      return loc.goodEvening;
    } else {
      return loc.goodNight;
    }
  }

  @override
  void initState() {
    super.initState();
    // Fetch hotels when screen loads
    Future.microtask(() {
      ref.read(hotelsProvider.notifier).fetchHotels();
      ref.read(hotelsProvider.notifier).fetchFeaturedHotels();
    });
  }

  Future<void> _handleFilterTap(String filterId) async {
    if (filterId == 'nearby') {
      setState(() {
        activeFilter = activeFilter == filterId ? null : filterId;
      });
      if (activeFilter == null) return;

      // Check permission
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Location permission denied')),
            );
          }
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Location permissions are permanently denied, we cannot request permissions.',
              ),
            ),
          );
        }
        return;
      }

      // Get location
      try {
        final position = await Geolocator.getCurrentPosition();
        if (mounted) {
          context.push(
            '/search?query=nearby:${position.latitude},${position.longitude}',
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error getting location: $e')));
        }
      }
    } else {
      setState(() {
        activeFilter = activeFilter == filterId ? null : filterId;
      });
      // Navigate to search with filter
      context.push('/search?filter=$filterId');
    }
  }

  void _handleSaveToggle(String hotelId) {
    ref.read(savedHotelsProvider.notifier).toggleSaved(hotelId);
  }

  void _onRefresh() {
    ref.read(hotelsProvider.notifier).fetchHotels();
    ref.read(hotelsProvider.notifier).fetchFeaturedHotels();
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final hotelsState = ref.watch(hotelsProvider);
    final savedHotels = ref.watch(savedHotelsProvider);
    final isDark = AppColors.isDarkMode(context);

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      body: RefreshIndicator(
        onRefresh: () async => _onRefresh(),
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            // Premium White Header with Time-based Greeting
            SliverToBoxAdapter(
              child: _buildHeader(context, topPadding, isDark),
            ),

            // Quick Filters
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(top: 20, bottom: 8),
                child: SizedBox(
                  height: 48,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: quickFilters.length,
                    separatorBuilder: (context, idx) =>
                        const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final filter = quickFilters[index];
                      final filterId = filter['id'] as String;
                      final icon = filter['icon'] as IconData;
                      return _QuickFilterChip(
                        id: filterId,
                        label: _getFilterLabel(context, filterId),
                        icon: icon,
                        isActive: activeFilter == filterId,
                        onPressed: () => _handleFilterTap(filterId),
                      );
                    },
                  ),
                ),
              ),
            ),

            // Featured Hotels Carousel
            if (hotelsState.featuredHotels.isNotEmpty)
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              gradient: AppColors.primaryGradient,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.auto_awesome,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            AppLocalizations.of(context)!.featuredHotels,
                            style: AppTypography.h4,
                          ),
                        ],
                      ),
                    ),
                    FeaturedHotelCarousel(
                      hotels: hotelsState.featuredHotels
                          .take(5)
                          .map(
                            (h) => FeaturedHotelData(
                              id: h.id,
                              name: h.name,
                              city: h.city,
                              rating: h.rating,
                              price: h.pricePerNight,
                              imageUrl: h.imageUrl,
                              isFeatured: true,
                            ),
                          )
                          .toList(),
                    ),
                  ],
                ),
              ),

            // Special Deals Section
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(top: 24),
                child: SpecialDealsSection(
                  title: AppLocalizations.of(context)!.flashDeals,
                  deals: hotelsState.hotels.take(3).map((h) {
                    final originalPrice = h.pricePerNight;
                    final discountedPrice = (originalPrice * 0.8).round();
                    return SpecialDealData(
                      hotelId: h.id,
                      hotelName: h.name,
                      title: '20% Off Weekend Stay',
                      originalPrice: originalPrice,
                      discountedPrice: discountedPrice,
                      imageUrl: h.imageUrl,
                      expiresAt: DateTime.now().add(const Duration(hours: 12)),
                    );
                  }).toList(),
                  onViewAll: () => context.push('/deals'),
                ),
              ),
            ),

            // Popular Destinations
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.explore_outlined,
                        color: AppColors.secondary,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      AppLocalizations.of(context)!.popularDestinations,
                      style: AppTypography.h4,
                    ),
                  ],
                ),
              ),
            ),

            SliverToBoxAdapter(
              child: SizedBox(
                height: 200,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: popularCities.length,
                  separatorBuilder: (context, idx) => const SizedBox(width: 14),
                  itemBuilder: (context, index) {
                    final city = popularCities[index];
                    final String cityName = city['name'] as String;
                    final int dynamicCount = hotelsState.hotels
                        .where((h) => h.city == cityName)
                        .length;

                    return CityCard(
                      name: _getCityName(context, cityName),
                      imageUrl: cityImages[cityName],
                      hotelCount: dynamicCount > 0
                          ? dynamicCount
                          : city['count'] as int,
                      onTap: () => context.push('/search?city=$cityName'),
                    );
                  },
                ),
              ),
            ),

            // Promo Banner
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(top: 28),
                child: PromoBanner(
                  title: AppLocalizations.of(context)!.firstBookingOffer,
                  subtitle: AppLocalizations.of(context)!.firstBookingDiscount,
                  badgeText: AppLocalizations.of(context)!.limitedOffer,
                  emoji: '🎁',
                  buttonText: AppLocalizations.of(context)!.book,
                  onTap: () => context.push('/hotels?offer=first-booking'),
                ),
              ),
            ),

            // All Hotels Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.info.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.hotel_outlined,
                            color: AppColors.info,
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          AppLocalizations.of(context)!.popularHotels,
                          style: AppTypography.h4,
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () => context.push('/hotels'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          AppLocalizations.of(context)!.viewAll,
                          style: AppTypography.labelMedium.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Hotel List - With Loading/Error/Data States
            _buildHotelsList(hotelsState, savedHotels),

            // Bottom Padding
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, double topPadding, bool isDark) {
    return Container(
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
          bottom: 20,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Greeting Row with Time-based Message
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Time-based greeting
                      Row(
                        children: [
                          _getGreetingIcon(),
                          const SizedBox(width: 8),
                          Text(
                            _getTimeBasedGreeting(context),
                            style: AppTypography.labelMedium.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        AppLocalizations.of(context)!.whereToStay,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),

                // Notification Button with Animation
                GestureDetector(
                  onTap: () => context.push('/notifications'),
                  child: Stack(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.1)
                              : AppColors.surfaceVariant,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.notifications_outlined,
                          color: isDark ? Colors.white : AppColors.textPrimary,
                          size: 24,
                        ),
                      ),
                      if (ref.watch(unreadNotificationCountProvider) > 0)
                        Positioned(
                          right: 10,
                          top: 10,
                          child: Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              gradient: AppColors.primaryGradient,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isDark
                                    ? AppColors.surfaceDark
                                    : Colors.white,
                                width: 2,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Search Bar with Premium Styling
            SearchBarWidget(
              onTap: () => context.push('/search'),
              readOnly: true,
            ),
            const SizedBox(height: 14),

            // Date Selection Bar
            DateSelectionBar(
              checkIn: checkIn,
              checkOut: checkOut,
              onTap: () async {
                // Show date picker for check-in
                final date = await showDatePicker(
                  context: context,
                  initialDate: checkIn,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 365)),
                  builder: (context, child) {
                    return Theme(
                      data: Theme.of(context).copyWith(
                        colorScheme: ColorScheme.light(
                          primary: AppColors.primary,
                          onPrimary: Colors.white,
                          surface: Colors.white,
                          onSurface: AppColors.textPrimary,
                        ),
                      ),
                      child: child!,
                    );
                  },
                );
                if (date != null) {
                  setState(() {
                    checkIn = date;
                    if (checkOut.isBefore(date)) {
                      checkOut = date.add(const Duration(days: 1));
                    }
                  });
                }
              },
              light: false,
            ),
          ],
        ),
      ),
    );
  }

  Widget _getGreetingIcon() {
    final hour = DateTime.now().hour;

    if (hour >= 5 && hour < 12) {
      return const Icon(
        Icons.wb_sunny_outlined,
        color: AppColors.starFilled,
        size: 18,
      );
    } else if (hour >= 12 && hour < 17) {
      return const Icon(Icons.wb_sunny, color: AppColors.starFilled, size: 18);
    } else if (hour >= 17 && hour < 21) {
      return const Icon(Icons.wb_twilight, color: AppColors.warning, size: 18);
    } else {
      return const Icon(
        Icons.nightlight_outlined,
        color: AppColors.secondary,
        size: 18,
      );
    }
  }

  Widget _buildHotelsList(HotelsState state, Set<String> savedHotels) {
    // Loading State
    if (state.isLoading && state.hotels.isEmpty) {
      return SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        sliver: SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) => const _HotelCardShimmer(),
            childCount: 3,
          ),
        ),
      );
    }

    // Error State
    if (state.error != null && state.hotels.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.error_outline,
                  size: 48,
                  color: AppColors.error,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                state.error!,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _onRefresh,
                icon: const Icon(Icons.refresh),
                label: Text(AppLocalizations.of(context)!.retry),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Empty State
    if (state.hotels.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.hotel_outlined,
                  size: 64,
                  color: AppColors.textTertiary,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                AppLocalizations.of(context)!.noHotelsFound,
                style: AppTypography.h4.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Data State - Show hotels from API
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate((context, index) {
          final hotel = state.hotels[index];
          return HotelCard(
            id: hotel.id,
            name: hotel.name,
            city: hotel.city,
            rating: hotel.rating,
            reviewCount: hotel.reviewCount,
            price: hotel.pricePerNight.toDouble(),
            imageUrl: hotel.imageUrl,
            isSaved: savedHotels.contains(hotel.id),
            onSaveToggle: () => _handleSaveToggle(hotel.id),
          );
        }, childCount: state.hotels.length),
      ),
    );
  }
}

// Shimmer loading placeholder for hotel cards
class _HotelCardShimmer extends StatelessWidget {
  const _HotelCardShimmer();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Shimmer.fromColors(
        baseColor: AppColors.shimmerBase,
        highlightColor: AppColors.shimmerHighlight,
        child: Container(
          height: 280,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
          ),
        ),
      ),
    );
  }
}

// Quick Filter Chip with Animation
class _QuickFilterChip extends StatefulWidget {
  final String id;
  final String label;
  final IconData icon;
  final bool isActive;
  final VoidCallback onPressed;

  const _QuickFilterChip({
    required this.id,
    required this.label,
    required this.icon,
    this.isActive = false,
    required this.onPressed,
  });

  @override
  State<_QuickFilterChip> createState() => _QuickFilterChipState();
}

class _QuickFilterChipState extends State<_QuickFilterChip>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTap() {
    _controller.forward().then((_) {
      _controller.reverse();
      widget.onPressed();
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _handleTap,
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(scale: _scaleAnimation.value, child: child);
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          decoration: BoxDecoration(
            color: widget.isActive ? AppColors.primary : Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: widget.isActive
                ? null
                : Border.all(color: AppColors.divider, width: 1),
            boxShadow: widget.isActive
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                widget.icon,
                size: 18,
                color: widget.isActive ? Colors.white : AppColors.primary,
              ),
              const SizedBox(width: 8),
              Text(
                widget.label,
                style: GoogleFonts.notoSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: widget.isActive ? Colors.white : AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
