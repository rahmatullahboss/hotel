// Search Screen - Premium White Label Design with Real API Search
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/city_card.dart';
import '../../../shared/widgets/search_bar_widget.dart';
import '../../../shared/widgets/hotel_card.dart';
import '../../home/providers/hotel_provider.dart';
import '../../home/providers/saved_hotels_provider.dart';
import '../../../l10n/generated/app_localizations.dart';

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

// Quick filter options with icons
final List<Map<String, dynamic>> quickFilters = [
  {
    'id': 'saved',
    'icon': Icons.favorite_outline,
    'label': 'Saved',
    'color': AppColors.primary,
  },
  {
    'id': 'nearby',
    'icon': Icons.location_on_outlined,
    'label': 'Near Me',
    'color': Color(0xFF10B981),
  },
  {
    'id': 'budget',
    'icon': Icons.savings_outlined,
    'label': 'Budget',
    'color': Color(0xFF3B82F6),
  },
  {
    'id': 'luxury',
    'icon': Icons.star_outline,
    'label': 'Premium',
    'color': Color(0xFFF59E0B),
  },
  {
    'id': 'couple',
    'icon': Icons.favorite_border,
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

// All searchable locations for suggestions
const List<Map<String, dynamic>> allSuggestions = [
  {'name': 'Dhaka', 'type': 'city', 'icon': '🏙️'},
  {'name': 'Chittagong', 'type': 'city', 'icon': '🏙️'},
  {"name": "Cox's Bazar", 'type': 'city', 'icon': '🏖️'},
  {'name': 'Sylhet', 'type': 'city', 'icon': '🌿'},
  {'name': 'Rajshahi', 'type': 'city', 'icon': '🏙️'},
  {'name': 'Khulna', 'type': 'city', 'icon': '🏙️'},
  {'name': 'Barisal', 'type': 'city', 'icon': '🏙️'},
  {'name': 'Rangpur', 'type': 'city', 'icon': '🏙️'},
  {'name': 'Mymensingh', 'type': 'city', 'icon': '🏙️'},
  {'name': 'Comilla', 'type': 'city', 'icon': '🏙️'},
  {'name': 'Gazipur', 'type': 'city', 'icon': '🏙️'},
  {'name': 'Narayanganj', 'type': 'city', 'icon': '🏙️'},
  {'name': 'Barguna', 'type': 'city', 'icon': '🏙️'},
  {'name': 'Luxury Hotels', 'type': 'filter', 'icon': '⭐'},
  {'name': 'Budget Hotels', 'type': 'filter', 'icon': '💰'},
  {'name': 'Couple Friendly', 'type': 'filter', 'icon': '💕'},
  {'name': 'Beach Hotels', 'type': 'filter', 'icon': '🏖️'},
];

// Search query notifier for Riverpod 3.0
class SearchQueryNotifier extends Notifier<String> {
  @override
  String build() => '';

  void update(String query) => state = query;
  void clear() => state = '';
}

final searchQueryProvider = NotifierProvider<SearchQueryNotifier, String>(
  SearchQueryNotifier.new,
);

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
  // Set<String> savedHotels = {}; // Managed by provider
  bool _showSuggestions = false;
  String _typingQuery = '';

  // Location state
  Position? _currentPosition;
  bool _isLoadingLocation = false;
  String? _locationError;

  @override
  void initState() {
    super.initState();
    // Set initial city from navigation
    selectedCity = widget.initialCity;
    activeFilter = widget.initialFilter;

    // If we have a city, set it as the search query
    if (selectedCity != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(searchQueryProvider.notifier).update(selectedCity!);
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

  void _handleFilterTap(String filterId) async {
    // Toggle filter
    if (activeFilter == filterId) {
      setState(() {
        activeFilter = null;
      });
      // Clear any filter-based search
      ref.read(searchQueryProvider.notifier).clear();
      return;
    }

    setState(() {
      activeFilter = filterId;
    });

    // Handle different filters
    switch (filterId) {
      case 'nearby':
        await _handleNearbyFilter();
        break;
      case 'budget':
        // Budget hotels <= 3000 BDT
        ref.read(searchQueryProvider.notifier).update('Budget Hotels');
        break;
      case 'luxury':
        // Premium/Luxury hotels >= 8000 BDT
        ref.read(searchQueryProvider.notifier).update('Luxury Hotels');
        break;
      case 'couple':
        // Couple friendly hotels
        ref.read(searchQueryProvider.notifier).update('Couple Friendly');
        break;
      case 'saved':
        ref.read(searchQueryProvider.notifier).clear();
        _searchController.clear();
        break;
    }
  }

  Future<void> _handleNearbyFilter() async {
    setState(() {
      _isLoadingLocation = true;
      _locationError = null;
    });

    try {
      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _isLoadingLocation = false;
          _locationError = 'লোকেশন সার্ভিস বন্ধ আছে';
        });
        _showLocationErrorSnackbar('দয়া করে লোকেশন সার্ভিস চালু করুন');
        return;
      }

      // Check permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _isLoadingLocation = false;
            _locationError = 'লোকেশন অনুমতি প্রত্যাখ্যাত';
          });
          _showLocationErrorSnackbar('লোকেশন অনুমতি প্রয়োজন');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _isLoadingLocation = false;
          _locationError = 'লোকেশন অনুমতি স্থায়ীভাবে বন্ধ';
        });
        _showLocationErrorSnackbar('সেটিংস থেকে লোকেশন অনুমতি দিন');
        return;
      }

      // Get current position
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );

      setState(() {
        _currentPosition = position;
        _isLoadingLocation = false;
      });

      // Search for nearby hotels
      ref
          .read(searchQueryProvider.notifier)
          .update('nearby:${position.latitude},${position.longitude}');

      _showSuccessSnackbar(
        'আপনার লোকেশন পাওয়া গেছে! কাছের হোটেল দেখানো হচ্ছে...',
      );
    } catch (e) {
      setState(() {
        _isLoadingLocation = false;
        _locationError = 'লোকেশন পেতে সমস্যা হয়েছে';
      });
      _showLocationErrorSnackbar('লোকেশন পেতে সমস্যা হয়েছে');
    }
  }

  void _showLocationErrorSnackbar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.location_off, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        action: SnackBarAction(
          label: 'সেটিংস',
          textColor: Colors.white,
          onPressed: () => Geolocator.openLocationSettings(),
        ),
      ),
    );
  }

  void _showSuccessSnackbar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.location_on, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _handleSearch(String query) {
    setState(() {
      _typingQuery = query;
      _showSuggestions = query.isNotEmpty;
    });
    // Only trigger actual search when user stops typing (debounced in UI)
    // For now, don't immediately search - wait for suggestion selection or blur
  }

  void _selectSuggestion(String suggestion) {
    _searchController.text = suggestion;
    ref.read(searchQueryProvider.notifier).update(suggestion);
    setState(() {
      _showSuggestions = false;
      _typingQuery = suggestion;
    });
    _focusNode.unfocus();
  }

  void _submitSearch() {
    final query = _searchController.text.trim();
    if (query.isNotEmpty) {
      ref.read(searchQueryProvider.notifier).update(query);
      setState(() {
        _showSuggestions = false;
      });
      _focusNode.unfocus();
    }
  }

  void _clearSearch() {
    _searchController.clear();
    ref.read(searchQueryProvider.notifier).clear();
    setState(() {
      activeFilter = null;
      selectedCity = null;
    });
  }

  void _handleSaveToggle(String hotelId) {
    ref.read(savedHotelsProvider.notifier).toggleSaved(hotelId);
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final screenWidth = MediaQuery.of(context).size.width;
    final gridItemWidth = (screenWidth - 52) / 2;
    final searchQuery = ref.watch(searchQueryProvider);
    final savedHotels = ref.watch(savedHotelsProvider);
    final isSearching = searchQuery.isNotEmpty || activeFilter == 'saved';

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      body: Column(
        children: [
          // Header with Premium Design and Dark Mode
          Container(
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
            child: Padding(
              padding: EdgeInsets.only(
                top: topPadding + 10,
                left: 20,
                right: 20,
                bottom: 24,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Back button and title row
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => context.pop(),
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
                            size: 18,
                            color: AppColors.isDarkMode(context)
                                ? Colors.white
                                : AppColors.textPrimary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              AppLocalizations.of(context)!.searchHeaderTitle,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: AppColors.isDarkMode(context)
                                    ? Colors.white
                                    : AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              AppLocalizations.of(
                                context,
                              )!.searchHeaderSubtitle,
                              style: GoogleFonts.notoSans(
                                fontSize: 13,
                                color: AppColors.isDarkMode(context)
                                    ? Colors.white60
                                    : AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Search Bar
                  SearchBarWidget(
                    placeholder: AppLocalizations.of(
                      context,
                    )!.searchPlaceholder,
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
                            final filterId = filter['id'] as String;
                            final icon = filter['icon'] as IconData;
                            final color = filter['color'] as Color;
                            return _SearchFilterChip(
                              id: filterId,
                              label: filter['label'] as String,
                              icon: icon,
                              color: color,
                              isActive: activeFilter == filterId,
                              isLoading:
                                  filterId == 'nearby' && _isLoadingLocation,
                              onPressed: () => _handleFilterTap(filterId),
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
                                      AppLocalizations.of(context)!.searchClear,
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

                  // Location Status Banner - shows when nearby filter is active
                  if (activeFilter == 'nearby') ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _locationError != null
                              ? AppColors.error.withValues(alpha: 0.1)
                              : AppColors.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _locationError != null
                                ? AppColors.error.withValues(alpha: 0.3)
                                : AppColors.success.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _locationError != null
                                  ? Icons.location_off
                                  : Icons.my_location,
                              size: 20,
                              color: _locationError != null
                                  ? AppColors.error
                                  : AppColors.success,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _locationError != null
                                        ? _locationError!
                                        : AppLocalizations.of(
                                            context,
                                          )!.searchLocationFound,
                                    style: AppTypography.labelMedium.copyWith(
                                      color: _locationError != null
                                          ? AppColors.error
                                          : AppColors.success,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  if (_currentPosition != null &&
                                      _locationError == null)
                                    Text(
                                      'lat: ${_currentPosition!.latitude.toStringAsFixed(4)}, lng: ${_currentPosition!.longitude.toStringAsFixed(4)}',
                                      style: AppTypography.labelSmall.copyWith(
                                        color: AppColors.textTertiary,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            if (_locationError != null)
                              TextButton(
                                onPressed: () => _handleNearbyFilter(),
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                  ),
                                  minimumSize: Size.zero,
                                ),
                                child: Text(
                                  AppLocalizations.of(context)!.searchTryAgain,
                                  style: AppTypography.labelSmall.copyWith(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  // Suggestions Dropdown - shows when typing
                  if (_showSuggestions && _typingQuery.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.isDarkMode(context)
                              ? AppColors.surfaceDark
                              : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.12),
                              blurRadius: 20,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                              child: Text(
                                AppLocalizations.of(context)!.searchSuggestions,
                                style: AppTypography.labelMedium.copyWith(
                                  color: AppColors.textTertiary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            ...allSuggestions
                                .where(
                                  (s) => (s['name'] as String)
                                      .toLowerCase()
                                      .contains(_typingQuery.toLowerCase()),
                                )
                                .take(6)
                                .map(
                                  (suggestion) => _SuggestionItem(
                                    name: suggestion['name'] as String,
                                    icon: suggestion['icon'] as String,
                                    type: suggestion['type'] as String,
                                    onTap: () => _selectSuggestion(
                                      suggestion['name'] as String,
                                    ),
                                  ),
                                ),
                            // Search this query option
                            InkWell(
                              onTap: _submitSearch,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 12,
                                ),
                                decoration: BoxDecoration(
                                  border: Border(
                                    top: BorderSide(
                                      color: AppColors.divider,
                                      width: 1,
                                    ),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withValues(
                                          alpha: 0.1,
                                        ),
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.search,
                                        size: 18,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        '"$_typingQuery" ${AppLocalizations.of(context)!.navSearch}',
                                        style: AppTypography.bodyMedium
                                            .copyWith(
                                              color: AppColors.primary,
                                              fontWeight: FontWeight.w600,
                                            ),
                                      ),
                                    ),
                                    const Icon(
                                      Icons.arrow_forward_ios,
                                      size: 14,
                                      color: AppColors.primary,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ] else if (!isSearching) ...[
                    // Popular Cities Grid
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
                      child: Text(
                        AppLocalizations.of(context)!.searchPopularDestinations,
                        style: AppTypography.h4,
                      ),
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
                            onTap: () {
                              final cityName = city['name'] as String;
                              _searchController.text = cityName;
                              ref
                                  .read(searchQueryProvider.notifier)
                                  .update(cityName);
                              _focusNode.unfocus();
                            },
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
                              '${AppLocalizations.of(context)!.searchAllHotels} →',
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
                          Text(
                            AppLocalizations.of(context)!.searchTipsTitle,
                            style: AppTypography.h4,
                          ),
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
                                  text: AppLocalizations.of(
                                    context,
                                  )!.searchTipNearMe,
                                ),
                                const SizedBox(height: 12),
                                _TipItem(
                                  icon: Icons.filter_list,
                                  text: AppLocalizations.of(
                                    context,
                                  )!.searchTipBudget,
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
                      activeFilter: activeFilter,
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
  final String? activeFilter;
  final Set<String> savedHotels;
  final Function(String) onSaveToggle;

  const _SearchResults({
    required this.query,
    this.activeFilter,
    required this.savedHotels,
    required this.onSaveToggle,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<List<Hotel>> searchResults;
    if (activeFilter == 'saved') {
      searchResults = ref.watch(savedHotelsListProvider);
    } else {
      searchResults = ref.watch(searchHotelsProvider(query));
    }

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
              AppLocalizations.of(context)!.searchResultsError,
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
                  distance: hotel.distanceFromUser,
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

// Suggestion item widget
class _SuggestionItem extends StatelessWidget {
  final String name;
  final String icon;
  final String type;
  final VoidCallback onTap;

  const _SuggestionItem({
    required this.name,
    required this.icon,
    required this.type,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: type == 'city'
                    ? AppColors.primary.withValues(alpha: 0.1)
                    : AppColors.warning.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(icon, style: const TextStyle(fontSize: 16)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: AppTypography.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    type == 'city' ? 'শহর' : 'ফিল্টার',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.north_west, size: 16, color: AppColors.textTertiary),
          ],
        ),
      ),
    );
  }
}

// Search Filter Chip with Icon and Color
class _SearchFilterChip extends StatelessWidget {
  final String id;
  final String label;
  final IconData icon;
  final Color color;
  final bool isActive;
  final bool isLoading;
  final VoidCallback onPressed;

  const _SearchFilterChip({
    required this.id,
    required this.label,
    required this.icon,
    required this.color,
    this.isActive = false,
    this.isLoading = false,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onPressed,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isActive
              ? color
              : AppColors.isDarkMode(context)
              ? AppColors.surfaceDark
              : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: isActive
              ? null
              : Border.all(color: AppColors.divider, width: 1),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: color.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isLoading)
              SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: isActive ? Colors.white : color,
                ),
              )
            else
              Icon(icon, size: 18, color: isActive ? Colors.white : color),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.notoSans(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isActive ? Colors.white : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
