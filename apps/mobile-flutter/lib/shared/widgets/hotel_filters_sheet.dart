// Hotel Filters Bottom Sheet Widget
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

import '../../features/home/providers/hotel_provider.dart';
import '../../l10n/generated/app_localizations.dart';

class HotelFiltersSheet extends ConsumerStatefulWidget {
  const HotelFiltersSheet({super.key});

  @override
  ConsumerState<HotelFiltersSheet> createState() => _HotelFiltersSheetState();
}

class _HotelFiltersSheetState extends ConsumerState<HotelFiltersSheet> {
  late RangeValues _priceRange;
  double? _selectedRating;
  List<String> _selectedAmenities = [];
  String? _selectedCity;

  @override
  void initState() {
    super.initState();
    final filters = ref.read(hotelFiltersProvider);
    _priceRange = RangeValues(filters.minPrice, filters.maxPrice);
    _selectedRating = filters.minRating;
    _selectedAmenities = List.from(filters.selectedAmenities);
    _selectedCity = filters.selectedCity;
  }

  void _applyFilters() {
    ref
        .read(hotelFiltersProvider.notifier)
        .updateFilters(
          ref
              .read(hotelFiltersProvider)
              .copyWith(
                minPrice: _priceRange.start,
                maxPrice: _priceRange.end,
                minRating: _selectedRating,
                clearMinRating: _selectedRating == null,
                selectedAmenities: _selectedAmenities,
                selectedCity: _selectedCity,
                clearSelectedCity: _selectedCity == null,
              ),
        );
    Navigator.pop(context);
  }

  void _clearAllFilters() {
    setState(() {
      _priceRange = const RangeValues(500, 15000);
      _selectedRating = null;
      _selectedAmenities = [];
      _selectedCity = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                AppLocalizations.of(context)!.filterTitle,
                style: AppTypography.h3.copyWith(fontWeight: FontWeight.bold),
              ),
              Row(
                children: [
                  TextButton(
                    onPressed: _clearAllFilters,
                    child: Text(
                      AppLocalizations.of(context)!.filterClearAll,
                      style: TextStyle(color: AppColors.primary),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ],
          ),
          const Divider(),

          // Scrollable content
          Flexible(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),

                  // Price Range Section
                  _buildSectionTitle(
                    AppLocalizations.of(context)!.filterPriceRange,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '৳${_priceRange.start.toInt()}',
                        style: AppTypography.labelLarge.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '৳${_priceRange.end.toInt()}',
                        style: AppTypography.labelLarge.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  RangeSlider(
                    values: _priceRange,
                    min: 500,
                    max: 15000,
                    divisions: 29,
                    activeColor: AppColors.primary,
                    inactiveColor: AppColors.divider,
                    onChanged: (values) {
                      setState(() {
                        _priceRange = values;
                      });
                    },
                  ),

                  const SizedBox(height: 24),

                  // Rating Section
                  _buildSectionTitle(
                    AppLocalizations.of(context)!.filterMinRating,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: kRatingOptions.map((rating) {
                      final isSelected = _selectedRating == rating;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedRating = isSelected ? null : rating;
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 120),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primary
                                : Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.divider,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.star,
                                size: 16,
                                color: isSelected
                                    ? Colors.white
                                    : AppColors.starFilled,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '$rating+',
                                style: AppTypography.labelLarge.copyWith(
                                  color: isSelected
                                      ? Colors.white
                                      : AppColors.textPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 24),

                  // Amenities Section
                  _buildSectionTitle(
                    AppLocalizations.of(context)!.filterAmenities,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: kAvailableAmenities.map((amenity) {
                      final isSelected = _selectedAmenities.contains(amenity);
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            if (isSelected) {
                              _selectedAmenities.remove(amenity);
                            } else {
                              _selectedAmenities.add(amenity);
                            }
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 120),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primary.withValues(alpha: 0.1)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.divider,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (isSelected)
                                const Padding(
                                  padding: EdgeInsets.only(right: 6),
                                  child: Icon(
                                    Icons.check,
                                    size: 16,
                                    color: AppColors.primary,
                                  ),
                                ),
                              Text(
                                _getAmenityLabel(context, amenity),
                                style: AppTypography.labelMedium.copyWith(
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.textPrimary,
                                  fontWeight: isSelected
                                      ? FontWeight.w600
                                      : FontWeight.normal,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 24),

                  // City Section
                  _buildSectionTitle(AppLocalizations.of(context)!.filterCity),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: kPopularCities.map((city) {
                      final isSelected = _selectedCity == city;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedCity = isSelected ? null : city;
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 120),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.secondary
                                : Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.secondary
                                  : AppColors.divider,
                            ),
                          ),
                          child: Text(
                            _getCityName(context, city),
                            style: AppTypography.labelMedium.copyWith(
                              color: isSelected
                                  ? Colors.white
                                  : AppColors.textPrimary,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),

          // Apply Button
          SafeArea(
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _applyFilters,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  AppLocalizations.of(context)!.filterApply,
                  style: AppTypography.labelLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTypography.bodyLarge.copyWith(
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }

  String _getAmenityLabel(BuildContext context, String amenity) {
    final loc = AppLocalizations.of(context)!;
    switch (amenity) {
      case 'WiFi':
        return loc.amenityWifi;
      case 'AC':
        return loc.amenityAC;
      case 'TV':
        return loc.amenityTV;
      case 'Parking':
        return loc.amenityParking;
      case 'Pool':
        return loc.amenityPool;
      case 'Restaurant':
        return loc.amenityRestaurant;
      case 'Gym':
        return loc.amenityGym;
      case 'Room Service':
        return loc.amenityRoomService;
      default:
        return amenity;
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
}

/// Shows the hotel filters bottom sheet
void showHotelFiltersSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) => const HotelFiltersSheet(),
    ),
  );
}
