// All Hotels Screen - Shows all hotels with search and filtering options
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/hotel_card.dart';
import '../../../shared/widgets/search_bar_widget.dart';
import '../../../shared/widgets/hotel_filters_sheet.dart';
import '../../home/providers/hotel_provider.dart';

class AllHotelsScreen extends ConsumerStatefulWidget {
  final String? offer;

  const AllHotelsScreen({super.key, this.offer});

  @override
  ConsumerState<AllHotelsScreen> createState() => _AllHotelsScreenState();
}

class _AllHotelsScreenState extends ConsumerState<AllHotelsScreen> {
  Set<String> savedHotels = {};
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Fetch all hotels when screen loads
    Future.microtask(() {
      ref.read(hotelsProvider.notifier).fetchHotels();
    });

    // Sync search controller with filter state
    final filters = ref.read(hotelFiltersProvider);
    _searchController.text = filters.searchQuery;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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

  void _onRefresh() {
    ref.read(hotelsProvider.notifier).fetchHotels();
  }

  void _onSearchChanged(String query) {
    ref
        .read(hotelFiltersProvider.notifier)
        .updateFilters(
          ref.read(hotelFiltersProvider).copyWith(searchQuery: query),
        );
  }

  void _onClearSearch() {
    _searchController.clear();
    ref
        .read(hotelFiltersProvider.notifier)
        .updateFilters(
          ref.read(hotelFiltersProvider).copyWith(searchQuery: ''),
        );
  }

  void _clearAllFilters() {
    _searchController.clear();
    ref.read(hotelFiltersProvider.notifier).resetFilters();
  }

  @override
  Widget build(BuildContext context) {
    final hotelsState = ref.watch(hotelsProvider);
    final filteredHotels = ref.watch(filteredHotelsProvider);
    final filters = ref.watch(hotelFiltersProvider);

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () => context.pop(),
        ),
        title: Text(
          widget.offer != null ? 'অফার হোটেল' : 'সব হোটেল',
          style: AppTypography.h4.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        actions: [
          // Filter button with badge
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.tune),
                onPressed: () => showHotelFiltersSheet(context),
              ),
              if (filters.activeFilterCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${filters.activeFilterCount}',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => _onRefresh(),
        color: AppColors.primary,
        child: Column(
          children: [
            // Search and Sort Bar
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Search Bar
                  SearchBarWidget(
                    controller: _searchController,
                    placeholder: 'হোটেল খুঁজুন...',
                    onChanged: _onSearchChanged,
                    onClear: _onClearSearch,
                  ),
                  const SizedBox(height: 12),

                  // Sort Options Row
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildSortChip(
                          'রেটিং',
                          Icons.star,
                          filters.sortBy == 'rating',
                          () => _setSortBy('rating'),
                        ),
                        _buildSortChip(
                          'কম মূল্য',
                          Icons.arrow_downward,
                          filters.sortBy == 'priceLow',
                          () => _setSortBy('priceLow'),
                        ),
                        _buildSortChip(
                          'বেশি মূল্য',
                          Icons.arrow_upward,
                          filters.sortBy == 'priceHigh',
                          () => _setSortBy('priceHigh'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Active Filters Display
            if (filters.hasActiveFilters)
              Container(
                color: AppColors.primaryLight.withValues(alpha: 0.1),
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                child: Row(
                  children: [
                    Icon(Icons.filter_list, size: 18, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _getActiveFiltersText(filters),
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    TextButton(
                      onPressed: _clearAllFilters,
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        'সব মুছুন',
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            // Hotel List
            Expanded(child: _buildContent(hotelsState, filteredHotels)),
          ],
        ),
      ),
    );
  }

  Widget _buildSortChip(
    String label,
    IconData icon,
    bool isActive,
    VoidCallback onTap,
  ) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isActive ? AppColors.primary : AppColors.divider,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 16,
                color: isActive ? Colors.white : AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: AppTypography.labelMedium.copyWith(
                  color: isActive ? Colors.white : AppColors.textPrimary,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _setSortBy(String sortBy) {
    ref
        .read(hotelFiltersProvider.notifier)
        .updateFilters(ref.read(hotelFiltersProvider).copyWith(sortBy: sortBy));
  }

  String _getActiveFiltersText(HotelFilters filters) {
    List<String> parts = [];

    if (filters.searchQuery.isNotEmpty) {
      parts.add('"${filters.searchQuery}"');
    }
    if (filters.minPrice > 500 || filters.maxPrice < 15000) {
      parts.add('৳${filters.minPrice.toInt()}-৳${filters.maxPrice.toInt()}');
    }
    if (filters.minRating != null) {
      parts.add('${filters.minRating}+ রেটিং');
    }
    if (filters.selectedAmenities.isNotEmpty) {
      parts.add('${filters.selectedAmenities.length}টি সুবিধা');
    }
    if (filters.selectedCity != null) {
      parts.add(filters.selectedCity!);
    }

    return parts.join(' • ');
  }

  Widget _buildContent(HotelsState state, List<Hotel> filteredHotels) {
    // Loading State
    if (state.isLoading && state.hotels.isEmpty) {
      return ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: 5,
        itemBuilder: (context, index) => const _HotelCardShimmer(),
      );
    }

    // Error State
    if (state.error != null && state.hotels.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                state.error!,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _onRefresh,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
                icon: const Icon(Icons.refresh),
                label: const Text('পুনরায় চেষ্টা করুন'),
              ),
            ],
          ),
        ),
      );
    }

    // Empty State (no hotels at all)
    if (state.hotels.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.hotel_outlined,
                size: 80,
                color: AppColors.textTertiary,
              ),
              const SizedBox(height: 16),
              Text(
                'কোনো হোটেল পাওয়া যায়নি',
                style: AppTypography.h4.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'পরে আবার চেষ্টা করুন',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // No Results from Filter
    if (filteredHotels.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.search_off, size: 80, color: AppColors.textTertiary),
              const SizedBox(height: 16),
              Text(
                'কোনো ফলাফল নেই',
                style: AppTypography.h4.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textTertiary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _clearAllFilters,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
                icon: const Icon(Icons.clear_all),
                label: const Text('ফিল্টার মুছুন'),
              ),
            ],
          ),
        ),
      );
    }

    // Data State - Show filtered hotels
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: filteredHotels.length,
      itemBuilder: (context, index) {
        final hotel = filteredHotels[index];
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
      },
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
