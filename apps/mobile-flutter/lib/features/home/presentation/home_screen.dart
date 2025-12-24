// Home Screen - World-Class Premium Design
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/hotel_card.dart';
import '../../../shared/widgets/city_card.dart';
import '../../../shared/widgets/search_bar_widget.dart';
import '../../../shared/widgets/date_selection_bar.dart';
import '../../../shared/widgets/quick_filter_button.dart';
import '../../../shared/widgets/promo_banner.dart';

// City images - Real photos of Bangladeshi landmarks
const Map<String, String> cityImages = {
  'ঢাকা':
      'https://images.unsplash.com/photo-1619468129170-28dd035fb141?q=80&w=800',
  'চট্টগ্রাম':
      'https://images.unsplash.com/photo-1599587440406-03f4340a97a3?q=80&w=800',
  'কক্সবাজার':
      'https://images.unsplash.com/photo-1608958435020-e8a710988090?q=80&w=800',
  'সিলেট':
      'https://images.unsplash.com/photo-1628005370222-38d58dd75638?q=80&w=800',
  'রাজশাহী':
      'https://images.unsplash.com/photo-1633461247458-941838637769?q=80&w=800',
  'খুলনা':
      'https://images.unsplash.com/photo-1603956461970-d7a8ce0b0213?q=80&w=800',
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

// Dummy hotels for demonstration
const List<Map<String, dynamic>> dummyHotels = [
  {
    'id': '1',
    'name': 'Pan Pacific Sonargaon',
    'city': 'ঢাকা',
    'rating': 4.8,
    'reviewCount': 320,
    'price': 8500,
    'imageUrl':
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
  },
  {
    'id': '2',
    'name': 'Radisson Blu Chittagong',
    'city': 'চট্টগ্রাম',
    'rating': 4.6,
    'reviewCount': 215,
    'price': 7200,
    'imageUrl':
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600',
  },
  {
    'id': '3',
    'name': "Cox's Ocean Paradise",
    'city': 'কক্সবাজার',
    'rating': 4.5,
    'reviewCount': 189,
    'price': 5500,
    'imageUrl':
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
  },
  {
    'id': '4',
    'name': 'Grand Sylhet Resort',
    'city': 'সিলেট',
    'rating': 4.4,
    'reviewCount': 142,
    'price': 4800,
    'imageUrl':
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
  },
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
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
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
                      placeholder: 'হোটেল খুঁজুন...',
                      onTap: () => context.push('/search'),
                    ),
                    const SizedBox(height: 12),

                    // Date Selection
                    DateSelectionBar(
                      checkIn: checkIn,
                      checkOut: checkOut,
                      onTap: () {
                        // TODO: Show date picker
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
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: SizedBox(
                height: 44,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: quickFilters.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
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
                separatorBuilder: (_, __) => const SizedBox(width: 12),
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

          // Hotel List
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate((context, index) {
                final hotel = dummyHotels[index];
                return HotelCard(
                  id: hotel['id'] as String,
                  name: hotel['name'] as String,
                  city: hotel['city'] as String,
                  rating: (hotel['rating'] as num).toDouble(),
                  reviewCount: hotel['reviewCount'] as int,
                  price: (hotel['price'] as num).toDouble(),
                  imageUrl: hotel['imageUrl'] as String?,
                  isSaved: savedHotels.contains(hotel['id']),
                  onSaveToggle: () => _handleSaveToggle(hotel['id'] as String),
                );
              }, childCount: dummyHotels.length),
            ),
          ),

          // Bottom Padding
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }
}
