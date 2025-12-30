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
import '../../../shared/widgets/quick_filter_button.dart';
import '../../../shared/widgets/promo_banner.dart';

import '../../../l10n/generated/app_localizations.dart';
import '../providers/hotel_provider.dart';
import '../providers/saved_hotels_provider.dart';

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

// Quick filter data
const List<Map<String, String>> quickFilters = [
  {'id': 'nearby', 'emoji': '📍'},
  {'id': 'budget', 'emoji': '💰'},
  {'id': 'luxury', 'emoji': '⭐'},
  {'id': 'couple', 'emoji': '💕'},
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
  // Set<String> savedHotels = {}; // Managed by provider

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

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      body: RefreshIndicator(
        onRefresh: () async => _onRefresh(),
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            // Premium White Header
            SliverToBoxAdapter(
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Color(0x08000000),
                      blurRadius: 10,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Padding(
                  padding: EdgeInsets.only(
                    top: topPadding + 12,
                    left: 20,
                    right: 20,
                    bottom: 16,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Greeting Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  AppLocalizations.of(context)!.homeGreeting,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  AppLocalizations.of(context)!.whereToStay,
                                  style: GoogleFonts.notoSans(
                                    fontSize: 14,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Notification Button
                          GestureDetector(
                            onTap: () => context.push('/notifications'),
                            child: Stack(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceVariant,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.notifications_outlined,
                                    color: AppColors.textPrimary,
                                    size: 22,
                                  ),
                                ),
                                Positioned(
                                  right: 8,
                                  top: 8,
                                  child: Container(
                                    width: 10,
                                    height: 10,
                                    decoration: BoxDecoration(
                                      color: AppColors.primary,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.white,
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
                      const SizedBox(height: 16),

                      // Search Bar
                      SearchBarWidget(onTap: () => context.push('/search')),
                      const SizedBox(height: 12),

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
                            lastDate: DateTime.now().add(
                              const Duration(days: 365),
                            ),
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
              ),
            ),

            // Quick Filters
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(top: 20, bottom: 8),
                child: SizedBox(
                  height: 44,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: quickFilters.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final filter = quickFilters[index];
                      return QuickFilterButton(
                        id: filter['id']!,
                        label: _getFilterLabel(context, filter['id']!),
                        emoji: filter['emoji']!,
                        isActive: activeFilter == filter['id'],
                        onPressed: () => _handleFilterTap(filter['id']!),
                      );
                    },
                  ),
                ),
              ),
            ),

            // Popular Destinations
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(left: 20, right: 20, bottom: 16),
                child: Text(
                  AppLocalizations.of(context)!.popularDestinations,
                  style: AppTypography.h4,
                ),
              ),
            ),

            SliverToBoxAdapter(
              child: SizedBox(
                height: 176,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: popularCities.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    final city = popularCities[index];
                    final String cityName = city['name'] as String;
                    final int dynamicCount = hotelsState.hotels
                        .where((h) => h.city == cityName)
                        .length;

                    return CityCard(
                      name: _getCityName(context, cityName),
                      imageUrl: cityImages[cityName],
                      hotelCount: dynamicCount, // Use real count
                      onTap: () => context.push('/search?city=$cityName'),
                    );
                  },
                ),
              ),
            ),

            // Promo Banner
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(top: 24),
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

            // Featured Hotels Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.popularHotels,
                      style: AppTypography.h4,
                    ),
                    GestureDetector(
                      onTap: () => context.push('/hotels'),
                      child: Text(
                        AppLocalizations.of(context)!.viewAll,
                        style: AppTypography.labelLarge.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
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
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text(
                state.error!,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _onRefresh,
                icon: const Icon(Icons.refresh),
                label: Text(AppLocalizations.of(context)!.retry),
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
              Icon(
                Icons.hotel_outlined,
                size: 64,
                color: AppColors.textTertiary,
              ),
              const SizedBox(height: 16),
              Text(
                AppLocalizations.of(context)!.noHotelsFound,
                style: AppTypography.bodyMedium.copyWith(
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
      padding: const EdgeInsets.only(bottom: 16),
      child: Shimmer.fromColors(
        baseColor: AppColors.shimmerBase,
        highlightColor: AppColors.shimmerHighlight,
        child: Container(
          height: 280,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ),
    );
  }
}
