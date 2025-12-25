// Home Screen - World-Class Premium Design with API Integration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/hotel_card.dart';
import '../../../shared/widgets/city_card.dart';
import '../../../shared/widgets/search_bar_widget.dart';
import '../../../shared/widgets/date_selection_bar.dart';
import '../../../shared/widgets/quick_filter_button.dart';
import '../../../shared/widgets/promo_banner.dart';
import '../providers/hotel_provider.dart';

// City images - Real photos of Bangladeshi landmarks
const Map<String, String> cityImages = {
  'ঢাকা':
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
  'চট্টগ্রাম':
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
  'কক্সবাজার':
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
  'সিলেট':
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800',
  'রাজশাহী':
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800',
  'খুলনা':
      'https://images.unsplash.com/photo-1468746587034-766ade47c1ac?q=80&w=800',
};

// Quick filter data
const List<Map<String, String>> quickFilters = [
  {'id': 'nearby', 'label': 'কাছে', 'emoji': '📍'},
  {'id': 'budget', 'label': 'বাজেট', 'emoji': '💰'},
  {'id': 'luxury', 'label': 'প্রিমিয়াম', 'emoji': '⭐'},
  {'id': 'couple', 'label': 'কাপল', 'emoji': '💕'},
];

// Popular cities
const List<Map<String, dynamic>> popularCities = [
  {'name': 'ঢাকা', 'count': 45},
  {'name': 'চট্টগ্রাম', 'count': 28},
  {'name': 'কক্সবাজার', 'count': 52},
  {'name': 'সিলেট', 'count': 18},
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
  Set<String> savedHotels = {};

  @override
  void initState() {
    super.initState();
    // Fetch hotels when screen loads
    Future.microtask(() {
      ref.read(hotelsProvider.notifier).fetchHotels();
      ref.read(hotelsProvider.notifier).fetchFeaturedHotels();
    });
  }

  void _handleFilterTap(String filterId) {
    setState(() {
      activeFilter = activeFilter == filterId ? null : filterId;
    });
    // Navigate to search with filter
    context.push('/search?filter=$filterId');
  }

  void _handleSaveToggle(String hotelId) {
    setState(() {
      if (savedHotels.contains(hotelId)) {
        savedHotels.remove(hotelId);
      } else {
        savedHotels.add(hotelId);
      }
    });
    // TODO: Save to backend
  }

  void _onRefresh() {
    ref.read(hotelsProvider.notifier).fetchHotels();
    ref.read(hotelsProvider.notifier).fetchFeaturedHotels();
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final hotelsState = ref.watch(hotelsProvider);

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      body: RefreshIndicator(
        onRefresh: () async => _onRefresh(),
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            // Premium Header
            SliverToBoxAdapter(
              child: Container(
                decoration: const BoxDecoration(color: AppColors.primary),
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
                      // Greeting Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'স্বাগতম! 👋',
                                  style: AppTypography.h2.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'আজকে কোথায় থাকবেন?',
                                  style: AppTypography.bodyMedium.copyWith(
                                    color: Colors.white.withValues(alpha: 0.8),
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
                                    color: Colors.white.withValues(alpha: 0.15),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.notifications_outlined,
                                    color: Colors.white,
                                    size: 22,
                                  ),
                                ),
                                Positioned(
                                  right: 8,
                                  top: 8,
                                  child: Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFFBBF24),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Search Bar
                      SearchBarWidgetLight(
                        onTap: () => context.push('/search'),
                      ),
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
                        light: true,
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
                        label: filter['label']!,
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
                child: Text('জনপ্রিয় গন্তব্য', style: AppTypography.h4),
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
                    return CityCard(
                      name: city['name'] as String,
                      imageUrl: cityImages[city['name']],
                      hotelCount: city['count'] as int,
                      onTap: () => context.push('/search?city=${city['name']}'),
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
                  title: 'প্রথম বুকিং অফার!',
                  subtitle: 'প্রথম থাকায় ২০% ছাড় পান',
                  badgeText: 'সীমিত অফার',
                  emoji: '🎁',
                  buttonText: 'বুক করুন',
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
                    Text('জনপ্রিয় হোটেল', style: AppTypography.h4),
                    GestureDetector(
                      onTap: () => context.push('/hotels'),
                      child: Text(
                        'সব দেখুন',
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
            _buildHotelsList(hotelsState),

            // Bottom Padding
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildHotelsList(HotelsState state) {
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
                label: const Text('পুনরায় চেষ্টা করুন'),
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
                'কোনো হোটেল পাওয়া যায়নি',
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
