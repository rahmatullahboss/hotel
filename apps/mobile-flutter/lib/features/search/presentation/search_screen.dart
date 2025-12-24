// Search Screen - Premium Design with Real API Search
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/city_card.dart';
import '../../../shared/widgets/search_bar_widget.dart';
import '../../../shared/widgets/quick_filter_button.dart';
import '../../../shared/widgets/hotel_card.dart';
import '../../home/providers/hotel_provider.dart';

// City images
const Map<String, String> cityImages = {
  'Dhaka': 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=400',
  'Chittagong':
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
  "Cox's Bazar":
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400',
  'Sylhet':
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
  'Rajshahi':
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
  'Khulna': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
};

// Quick filter options
const List<Map<String, dynamic>> quickFilters = [
  {
    'id': 'nearby',
    'emoji': '📍',
    'label': 'Near Me',
    'color': Color(0xFF10B981),
  },
  {
    'id': 'budget',
    'emoji': '💰',
    'label': 'Budget',
    'color': Color(0xFF3B82F6),
  },
  {
    'id': 'luxury',
    'emoji': '⭐',
    'label': 'Premium',
    'color': Color(0xFFF59E0B),
  },
  {
    'id': 'couple',
    'emoji': '💕',
    'label': 'Couple',
    'color': Color(0xFFEC4899),
  },
];

// Popular cities
const List<Map<String, dynamic>> popularCities = [
  {'name': 'Dhaka', 'hotels': 6},
  {'name': 'Chittagong', 'hotels': 4},
  {"name": "Cox's Bazar", 'hotels': 5},
  {'name': 'Sylhet', 'hotels': 4},
  {'name': 'Rajshahi', 'hotels': 3},
  {'name': 'Khulna', 'hotels': 3},
];

// Search query provider for debouncing
final searchQueryProvider = StateProvider<String>((ref) => '');

class SearchScreen extends ConsumerStatefulWidget {
  final String? initialCity;
  final String? initialFilter;

  const SearchScreen({super.key, this.initialCity, this.initialFilter});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  final _focusNode = FocusNode();
  String? activeFilter;
  String? selectedCity;
  Set<String> savedHotels = {};

  @override
  void initState() {
    super.initState();
    // Set initial city from navigation
    selectedCity = widget.initialCity;
    activeFilter = widget.initialFilter;

    // If we have a city, set it as the search query
    if (selectedCity != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(searchQueryProvider.notifier).state = selectedCity!;
        _searchController.text = selectedCity!;
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleFilterTap(String filterId) {
    setState(() {
      activeFilter = activeFilter == filterId ? null : filterId;
      if (filterId == 'nearby') {
        context.push('/search-results?nearby=true');
      }
    });
  }

  void _handleSearch(String query) {
    ref.read(searchQueryProvider.notifier).state = query;
  }

  void _clearSearch() {
    _searchController.clear();
    ref.read(searchQueryProvider.notifier).state = '';
    setState(() {
      activeFilter = null;
      selectedCity = null;
    });
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
    final screenWidth = MediaQuery.of(context).size.width;
    final gridItemWidth = (screenWidth - 52) / 2;
    final searchQuery = ref.watch(searchQueryProvider);
    final isSearching = searchQuery.isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // Header with Rounded Bottom
          Container(
            decoration: const BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(32),
                bottomRight: Radius.circular(32),
              ),
            ),
            child: Padding(
              padding: EdgeInsets.only(
                top: topPadding + 10,
                left: 20,
                right: 20,
                bottom: 32,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'সার্চ করুন',
                    style: AppTypography.h2.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'আপনার পছন্দের হোটেল খুঁজুন',
                    style: AppTypography.bodyMedium.copyWith(
                      color: Colors.white.withValues(alpha: 0.8),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Search Bar
                  SearchBarWidget(
                    placeholder: 'হোটেল বা শহর খুঁজুন...',
                    controller: _searchController,
                    focusNode: _focusNode,
                    onChanged: _handleSearch,
                    onClear: _clearSearch,
                  ),
                ],
              ),
            ),
          ),

          // Content
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Quick Filters
                  Padding(
                    padding: const EdgeInsets.only(top: 20),
                    child: SizedBox(
                      height: 44,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: quickFilters.length + (isSearching ? 1 : 0),
                        separatorBuilder: (_, _) => const SizedBox(width: 10),
                        itemBuilder: (context, index) {
                          if (index < quickFilters.length) {
                            final filter = quickFilters[index];
                            return QuickFilterButton(
                              id: filter['id'] as String,
                              label: filter['label'] as String,
                              emoji: filter['emoji'] as String,
                              isActive: activeFilter == filter['id'],
                              onPressed: () =>
                                  _handleFilterTap(filter['id'] as String),
                            );
                          } else {
                            // Clear button
                            return GestureDetector(
                              onTap: _clearSearch,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 10,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceVariant,
                                  borderRadius: BorderRadius.circular(24),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.close,
                                      size: 16,
                                      color: AppColors.textSecondary,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      'মুছুন',
                                      style: AppTypography.labelLarge.copyWith(
                                        color: AppColors.textSecondary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }
                        },
                      ),
                    ),
                  ),

                  if (!isSearching) ...[
                    // Popular Cities Grid
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
                      child: Text('জনপ্রিয় গন্তব্য', style: AppTypography.h4),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: gridItemWidth / 120,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        itemCount: 6,
                        itemBuilder: (context, index) {
                          final city = popularCities[index];
                          return CityCardGrid(
                            name: city['name'] as String,
                            imageUrl: cityImages[city['name']],
                            hotelCount: city['hotels'] as int,
                            onTap: () => context.push(
                              '/search-results?city=${city['name']}',
                            ),
                          );
                        },
                      ),
                    ),

                    // View All Hotels Button
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: GestureDetector(
                        onTap: () => context.push('/hotels'),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              'সব হোটেল দেখুন →',
                              style: AppTypography.labelLarge.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Tips Section
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('সার্চ টিপস', style: AppTypography.h4),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.infoLight,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: [
                                _TipItem(
                                  icon: Icons.lightbulb_outline,
                                  text: '"Near Me" দিয়ে কাছের হোটেল খুঁজুন',
                                ),
                                const SizedBox(height: 12),
                                _TipItem(
                                  icon: Icons.filter_list,
                                  text:
                                      'Budget (≤৳3,000) বা Premium (≥৳8,000) দিয়ে ফিল্টার করুন',
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    // Search Results
                    _SearchResults(
                      query: searchQuery,
                      savedHotels: savedHotels,
                      onSaveToggle: _handleSaveToggle,
                    ),
                  ],

                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Search results widget with API integration
class _SearchResults extends ConsumerWidget {
  final String query;
  final Set<String> savedHotels;
  final Function(String) onSaveToggle;

  const _SearchResults({
    required this.query,
    required this.savedHotels,
    required this.onSaveToggle,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchResults = ref.watch(searchHotelsProvider(query));

    return searchResults.when(
      loading: () => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: List.generate(3, (_) => const _HotelCardShimmer()),
        ),
      ),
      error: (error, _) => Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.error),
            const SizedBox(height: 12),
            Text(
              'সার্চ করতে সমস্যা হয়েছে',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
      data: (hotels) {
        if (hotels.isEmpty) {
          return Padding(
            padding: const EdgeInsets.all(40),
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.search_off,
                    size: 40,
                    color: AppColors.textTertiary,
                  ),
                ),
                const SizedBox(height: 16),
                Text('কোনো হোটেল পাওয়া যায়নি', style: AppTypography.h4),
                const SizedBox(height: 8),
                Text(
                  '"$query" দিয়ে কোনো হোটেল খুঁজে পাওয়া যায়নি',
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${hotels.length}টি হোটেল পাওয়া গেছে',
                style: AppTypography.labelLarge.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 12),
              ...hotels.map(
                (hotel) => HotelCard(
                  id: hotel.id,
                  name: hotel.name,
                  city: hotel.city,
                  rating: hotel.rating,
                  reviewCount: hotel.reviewCount,
                  price: hotel.pricePerNight.toDouble(),
                  imageUrl: hotel.imageUrl,
                  isSaved: savedHotels.contains(hotel.id),
                  onSaveToggle: () => onSaveToggle(hotel.id),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// Shimmer loading for hotel cards
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
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}

class _TipItem extends StatelessWidget {
  final IconData icon;
  final String text;

  const _TipItem({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: AppColors.info.withValues(alpha: 0.2),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 16, color: AppColors.info),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: AppTypography.bodySmall.copyWith(color: AppColors.info),
          ),
        ),
      ],
    );
  }
}
