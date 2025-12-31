// Hotel Details Screen - World-Class Premium Design with API Integration
import 'dart:ui';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../home/providers/hotel_provider.dart';
import '../../home/providers/saved_hotels_provider.dart';
import '../providers/room_provider.dart';
import 'widgets/full_screen_gallery.dart';
import 'widgets/date_selector_sheet.dart';
import 'widgets/premium_room_card.dart';
import 'widgets/reviews_bottom_sheet.dart';

import '../../../l10n/generated/app_localizations.dart';

class HotelDetailsScreen extends ConsumerStatefulWidget {
  final String hotelId;

  const HotelDetailsScreen({super.key, required this.hotelId});

  @override
  ConsumerState<HotelDetailsScreen> createState() => _HotelDetailsScreenState();
}

class _HotelDetailsScreenState extends ConsumerState<HotelDetailsScreen>
    with SingleTickerProviderStateMixin {
  int _currentImageIndex = 0;
  final PageController _pageController = PageController();
  final ScrollController _scrollController = ScrollController();

  // Date state for room availability
  late DateTime _checkIn;
  late DateTime _checkOut;

  // Animation controller for bottom bar
  late AnimationController _bottomBarController;
  late Animation<double> _bottomBarOpacity;

  // Scroll opacity for app bar
  double _appBarOpacity = 0.0;

  @override
  void initState() {
    super.initState();
    _checkIn = DateTime.now().add(const Duration(days: 1));
    _checkOut = DateTime.now().add(const Duration(days: 2));

    _bottomBarController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _bottomBarOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _bottomBarController, curve: Curves.easeOut),
    );

    _scrollController.addListener(_onScroll);

    // Animate bottom bar in after a delay
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) _bottomBarController.forward();
    });
  }

  void _onScroll() {
    final offset = _scrollController.offset;
    final maxOffset = 200.0;
    setState(() {
      _appBarOpacity = (offset / maxOffset).clamp(0.0, 1.0);
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    _scrollController.dispose();
    _bottomBarController.dispose();
    super.dispose();
  }

  int get _nights => _checkOut.difference(_checkIn).inDays;

  void _handleShare(String hotelName) {
    final loc = AppLocalizations.of(context)!;
    SharePlus.instance.share(
      ShareParams(
        text: loc.shareHotelText(
          hotelName,
          'https://zinurooms.com/hotel/${widget.hotelId}',
        ),
      ),
    );
  }

  void _handleSave() {
    ref.read(savedHotelsProvider.notifier).toggleSaved(widget.hotelId);
  }

  void _openDateSelector() {
    DateSelectorSheet.show(
      context,
      initialCheckIn: _checkIn,
      initialCheckOut: _checkOut,
      onDatesSelected: (checkIn, checkOut) {
        setState(() {
          _checkIn = checkIn;
          _checkOut = checkOut;
        });
        // This will trigger a refetch of rooms with new dates
      },
    );
  }

  void _openGallery(List<String> images, int index) {
    FullScreenGallery.open(context, images: images, initialIndex: index);
  }

  IconData _getAmenityIcon(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'wifi':
        return Icons.wifi;
      case 'ac':
        return Icons.ac_unit;
      case 'parking':
        return Icons.local_parking;
      case 'restaurant':
        return Icons.restaurant;
      case 'pool':
        return Icons.pool;
      case 'gym':
        return Icons.fitness_center;
      case 'tv':
        return Icons.tv;
      case 'roomservice':
      case 'room_service':
        return Icons.room_service;
      default:
        return Icons.check_circle_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final hotelAsync = ref.watch(hotelProvider(widget.hotelId));
    final savedHotels = ref.watch(savedHotelsProvider);
    final isSaved = savedHotels.contains(widget.hotelId);
    final isDark = AppColors.isDarkMode(context);

    // Fetch rooms with dynamic pricing
    final roomsParams = RoomsParams(
      hotelId: widget.hotelId,
      checkIn: _checkIn.toIso8601String().split('T')[0],
      checkOut: _checkOut.toIso8601String().split('T')[0],
    );
    final roomsAsync = ref.watch(roomsProvider(roomsParams));

    return hotelAsync.when(
      loading: () => _buildLoadingState(),
      error: (error, stackTrace) => _buildErrorState(),
      data: (hotel) {
        if (hotel == null) return _buildErrorState();

        final hotelName = hotel.name;
        final hotelCity = hotel.city;
        final hotelRating = hotel.rating;
        final hotelReviewCount = hotel.reviewCount;
        final price = hotel.pricePerNight;

        final images = hotel.images.isNotEmpty
            ? hotel.images
            : (hotel.imageUrl != null
                  ? [hotel.imageUrl!]
                  : [
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                    ]);

        final loc = AppLocalizations.of(context)!;

        final amenitiesList = [
          {'icon': 'wifi', 'label': loc.amenityWifi},
          {'icon': 'ac', 'label': loc.amenityAC},
          {'icon': 'parking', 'label': loc.amenityParking},
          {'icon': 'restaurant', 'label': loc.amenityRestaurant},
          {'icon': 'pool', 'label': loc.amenityPool},
          {'icon': 'gym', 'label': loc.amenityGym},
        ];

        final description = hotel.description ?? loc.detailsDescription;
        final apiRooms = roomsAsync.hasValue ? roomsAsync.value! : <Room>[];
        final hasRoomsError = roomsAsync.hasError;

        return _buildContent(
          context,
          hotelName: hotelName,
          hotelCity: hotelCity,
          hotelRating: hotelRating,
          hotelReviewCount: hotelReviewCount,
          price: price,
          images: images,
          amenities: amenitiesList,
          description: description,
          apiRooms: apiRooms,
          isLoadingRooms: roomsAsync.isLoading,
          hasRoomsError: hasRoomsError,
          isSaved: isSaved,
          isDark: isDark,
        );
      },
    );
  }

  Widget _buildLoadingState() {
    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      body: SafeArea(
        child: Column(
          children: [
            Shimmer.fromColors(
              baseColor: AppColors.shimmerBase,
              highlightColor: AppColors.shimmerHighlight,
              child: Container(height: 350, color: Colors.white),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Shimmer.fromColors(
                    baseColor: AppColors.shimmerBase,
                    highlightColor: AppColors.shimmerHighlight,
                    child: Container(
                      height: 28,
                      width: 220,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Shimmer.fromColors(
                    baseColor: AppColors.shimmerBase,
                    highlightColor: AppColors.shimmerHighlight,
                    child: Container(
                      height: 18,
                      width: 160,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Shimmer.fromColors(
                    baseColor: AppColors.shimmerBase,
                    highlightColor: AppColors.shimmerHighlight,
                    child: Container(
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      appBar: AppBar(backgroundColor: Colors.transparent),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline,
                size: 64,
                color: AppColors.error,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              AppLocalizations.of(context)!.errorLoadingHotel,
              style: AppTypography.h4.copyWith(
                color: AppColors.adaptiveTextPrimary(context),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Please check your connection and try again',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.refresh(hotelProvider(widget.hotelId)),
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

  Widget _buildContent(
    BuildContext context, {
    required String hotelName,
    required String hotelCity,
    required double hotelRating,
    required int hotelReviewCount,
    required int price,
    required List<String> images,
    required List<Map<String, String>> amenities,
    required String description,
    required List<Room> apiRooms,
    required bool isLoadingRooms,
    required bool hasRoomsError,
    required bool isSaved,
    required bool isDark,
  }) {
    final screenWidth = MediaQuery.of(context).size.width;
    final heroHeight = screenWidth * 0.9;
    final loc = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              // Hero Image Gallery
              SliverToBoxAdapter(
                child: SizedBox(
                  height: heroHeight,
                  child: Stack(
                    children: [
                      // Image PageView with gesture to open gallery
                      GestureDetector(
                        onTap: () => _openGallery(images, _currentImageIndex),
                        child: PageView.builder(
                          controller: _pageController,
                          onPageChanged: (index) {
                            setState(() => _currentImageIndex = index);
                          },
                          itemCount: images.length,
                          itemBuilder: (context, index) {
                            return Hero(
                              tag: 'gallery_image_$index',
                              child: CachedNetworkImage(
                                imageUrl: images[index],
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Container(
                                  color: isDark
                                      ? AppColors.surfaceDark
                                      : AppColors.secondary,
                                  child: const Center(
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  ),
                                ),
                                errorWidget: (context, url, error) => Container(
                                  color: isDark
                                      ? AppColors.surfaceDark
                                      : AppColors.secondary,
                                  child: const Icon(
                                    Icons.hotel,
                                    size: 80,
                                    color: Colors.white54,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),

                      // Gradient Overlay
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.transparent,
                                Colors.transparent,
                                Colors.black.withValues(alpha: 0.8),
                              ],
                              stops: const [0.0, 0.5, 1.0],
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                            ),
                          ),
                        ),
                      ),

                      // Page Indicators
                      Positioned(
                        bottom: 100,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(
                            images.length,
                            (index) => AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              width: index == _currentImageIndex ? 28 : 8,
                              height: 8,
                              margin: const EdgeInsets.symmetric(horizontal: 3),
                              decoration: BoxDecoration(
                                color: index == _currentImageIndex
                                    ? Colors.white
                                    : Colors.white.withValues(alpha: 0.4),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                        ),
                      ),

                      // View All Photos Button
                      Positioned(
                        bottom: 100,
                        right: 16,
                        child: GestureDetector(
                          onTap: () => _openGallery(images, 0),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: BackdropFilter(
                              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.4),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.2),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.photo_library_outlined,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      '${images.length} Photos',
                                      style: AppTypography.labelSmall.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),

                      // Bottom Info Card (overlapping hero)
                      Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 16),
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.surfaceDark
                                : Colors.white,
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(24),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.15),
                                blurRadius: 20,
                                offset: const Offset(0, -5),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          hotelName,
                                          style: AppTypography.h2.copyWith(
                                            color: isDark
                                                ? Colors.white
                                                : AppColors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          children: [
                                            Icon(
                                              Icons.location_on,
                                              size: 16,
                                              color: AppColors.primary,
                                            ),
                                            const SizedBox(width: 4),
                                            Expanded(
                                              child: Text(
                                                hotelCity,
                                                style: AppTypography.bodyMedium
                                                    .copyWith(
                                                      color: AppColors
                                                          .textSecondary,
                                                    ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),

                                  // Rating Badge
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 14,
                                      vertical: 10,
                                    ),
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          AppColors.starFilled,
                                          AppColors.starFilled.withValues(
                                            alpha: 0.8,
                                          ),
                                        ],
                                      ),
                                      borderRadius: BorderRadius.circular(14),
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppColors.starFilled
                                              .withValues(alpha: 0.3),
                                          blurRadius: 10,
                                          offset: const Offset(0, 4),
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(
                                          Icons.star_rounded,
                                          size: 20,
                                          color: Colors.white,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          hotelRating.toStringAsFixed(1),
                                          style: AppTypography.labelLarge
                                              .copyWith(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),

                              // Review Count
                              Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text(
                                  '$hotelReviewCount ${loc.reviews}',
                                  style: AppTypography.bodySmall.copyWith(
                                    color: AppColors.textTertiary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Content
              SliverToBoxAdapter(
                child: Container(
                  color: isDark ? AppColors.surfaceDark : Colors.white,
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),

                        // Date Selection Card
                        _DateSelectionCard(
                          checkIn: _checkIn,
                          checkOut: _checkOut,
                          nights: _nights,
                          onTap: _openDateSelector,
                          isDark: isDark,
                        ),

                        const SizedBox(height: 28),

                        // Amenities Section
                        Text(
                          loc.detailsAmenities,
                          style: AppTypography.h4.copyWith(
                            color: isDark
                                ? Colors.white
                                : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 16),
                        _AmenitiesGrid(
                          amenities: amenities,
                          getIcon: _getAmenityIcon,
                          isDark: isDark,
                        ),

                        const SizedBox(height: 28),

                        // Description Section
                        Text(
                          loc.detailsDescription,
                          style: AppTypography.h4.copyWith(
                            color: isDark
                                ? Colors.white
                                : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          description,
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.7,
                          ),
                        ),

                        const SizedBox(height: 28),

                        // Reviews Summary Section
                        _ReviewsSummary(
                          rating: hotelRating,
                          reviewCount: hotelReviewCount,
                          hotelName: hotelName,
                          isDark: isDark,
                        ),

                        const SizedBox(height: 28),

                        // Rooms Section
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              loc.detailsRooms,
                              style: AppTypography.h4.copyWith(
                                color: isDark
                                    ? Colors.white
                                    : AppColors.textPrimary,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                loc.roomsCount(apiRooms.length),
                                style: AppTypography.labelSmall.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Room Cards
                        if (isLoadingRooms)
                          _buildRoomsLoading()
                        else if (hasRoomsError)
                          _buildRoomsError()
                        else if (apiRooms.isEmpty)
                          _buildNoRooms()
                        else
                          ...apiRooms.map((room) {
                            String bedsText;
                            final type = room.type.toLowerCase();
                            if (type.contains('double')) {
                              bedsText = loc.bedDouble;
                            } else if (type.contains('twin')) {
                              bedsText = loc.bedTwin;
                            } else if (type.contains('single')) {
                              bedsText = loc.bedSingle;
                            } else {
                              bedsText = loc.bedDefault;
                            }

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 20),
                              child: PremiumRoomCard(
                                name: room.name,
                                capacity: loc.capacityText(room.maxGuests),
                                beds: bedsText,
                                features: room.amenities.take(4).toList(),
                                price: room.dynamicPrice,
                                imageUrl: room.photos.isNotEmpty
                                    ? room.photos.first
                                    : 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
                                isAvailable: room.isAvailable,
                                availableCount: room.availableCount,
                                onSelect: () {
                                  context.push(
                                    '/book/${room.id}?hotel=${widget.hotelId}',
                                  );
                                },
                              ),
                            );
                          }),

                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Fixed Top App Bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              color: (isDark ? AppColors.surfaceDark : Colors.white).withValues(
                alpha: _appBarOpacity,
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Back Button
                      _CircleButton(
                        icon: Icons.arrow_back_ios_new,
                        onTap: () => context.pop(),
                        isDark: isDark,
                        hasBackground: _appBarOpacity < 0.5,
                      ),

                      // Title (fades in on scroll)
                      AnimatedOpacity(
                        duration: const Duration(milliseconds: 200),
                        opacity: _appBarOpacity,
                        child: Text(
                          hotelName,
                          style: AppTypography.labelLarge.copyWith(
                            color: isDark
                                ? Colors.white
                                : AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),

                      // Share Button
                      _CircleButton(
                        icon: Icons.share_outlined,
                        onTap: () => _handleShare(hotelName),
                        isDark: isDark,
                        hasBackground: _appBarOpacity < 0.5,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Bottom Booking Bar
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: FadeTransition(
              opacity: _bottomBarOpacity,
              child: _BottomBookingBar(
                price: price,
                nights: _nights,
                isSaved: isSaved,
                onSave: _handleSave,
                onBook: () {
                  if (apiRooms.isNotEmpty) {
                    // Scroll to rooms section
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(loc.selectRoomSnackbar),
                        behavior: SnackBarBehavior.floating,
                        margin: const EdgeInsets.all(16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  }
                },
                isDark: isDark,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoomsLoading() {
    return Column(
      children: List.generate(
        2,
        (index) => Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Shimmer.fromColors(
            baseColor: AppColors.shimmerBase,
            highlightColor: AppColors.shimmerHighlight,
            child: Container(
              height: 200,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoomsError() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(Icons.error_outline, color: AppColors.error, size: 48),
          const SizedBox(height: 12),
          Text(
            AppLocalizations.of(context)!.errorLoadingRooms,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildNoRooms() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(Icons.bed_outlined, color: AppColors.textTertiary, size: 48),
          const SizedBox(height: 12),
          Text(
            AppLocalizations.of(context)!.noRoomsFound,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

// ============== PRIVATE WIDGETS ==============

class _CircleButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool isDark;
  final bool hasBackground;

  const _CircleButton({
    required this.icon,
    required this.onTap,
    required this.isDark,
    this.hasBackground = true,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: hasBackground
              ? Colors.black.withValues(alpha: 0.4)
              : (isDark ? AppColors.surfaceDark : Colors.white).withValues(
                  alpha: 0.9,
                ),
          shape: BoxShape.circle,
          boxShadow: hasBackground
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 8,
                  ),
                ],
        ),
        child: Icon(
          icon,
          color: hasBackground
              ? Colors.white
              : (isDark ? Colors.white : AppColors.textPrimary),
          size: 20,
        ),
      ),
    );
  }
}

class _DateSelectionCard extends StatelessWidget {
  final DateTime checkIn;
  final DateTime checkOut;
  final int nights;
  final VoidCallback onTap;
  final bool isDark;

  const _DateSelectionCard({
    required this.checkIn,
    required this.checkOut,
    required this.nights,
    required this.onTap,
    required this.isDark,
  });

  String _formatDate(DateTime date) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    final weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return '${weekdays[date.weekday - 1]}, ${date.day} ${months[date.month - 1]}';
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context)!;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primary.withValues(alpha: 0.08),
              AppColors.primary.withValues(alpha: 0.03),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
        ),
        child: Row(
          children: [
            // Check-in
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    loc.checkIn,
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatDate(checkIn),
                    style: AppTypography.labelLarge.copyWith(
                      color: isDark ? Colors.white : AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),

            // Nights Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Text(
                    nights.toString(),
                    style: AppTypography.h4.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    nights == 1 ? 'Night' : 'Nights',
                    style: AppTypography.labelSmall.copyWith(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 9,
                    ),
                  ),
                ],
              ),
            ),

            // Check-out
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    loc.checkOut,
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatDate(checkOut),
                    style: AppTypography.labelLarge.copyWith(
                      color: isDark ? Colors.white : AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AmenitiesGrid extends StatelessWidget {
  final List<Map<String, String>> amenities;
  final IconData Function(String) getIcon;
  final bool isDark;

  const _AmenitiesGrid({
    required this.amenities,
    required this.getIcon,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: amenities.map((amenity) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                getIcon(amenity['icon']!),
                size: 20,
                color: AppColors.primary,
              ),
              const SizedBox(width: 8),
              Text(
                amenity['label']!,
                style: AppTypography.labelMedium.copyWith(
                  color: isDark ? Colors.white : AppColors.textPrimary,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class _ReviewsSummary extends StatelessWidget {
  final double rating;
  final int reviewCount;
  final String hotelName;
  final bool isDark;

  const _ReviewsSummary({
    required this.rating,
    required this.reviewCount,
    required this.hotelName,
    required this.isDark,
  });

  String _getRatingText(double rating) {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Average';
    return 'Below Average';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.05)
            : AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Guest Reviews',
                style: AppTypography.h4.copyWith(
                  color: isDark ? Colors.white : AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: () {
                  ReviewsBottomSheet.show(
                    context,
                    rating: rating,
                    reviewCount: reviewCount,
                    hotelName: hotelName,
                  );
                },
                child: Text(
                  'See All',
                  style: AppTypography.labelMedium.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              // Big Rating
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    Text(
                      rating.toStringAsFixed(1),
                      style: AppTypography.h1.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      children: List.generate(5, (index) {
                        return Icon(
                          index < rating.floor()
                              ? Icons.star_rounded
                              : (index < rating
                                    ? Icons.star_half_rounded
                                    : Icons.star_outline_rounded),
                          color: AppColors.starFilled,
                          size: 14,
                        );
                      }),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),

              // Rating breakdown
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _getRatingText(rating),
                      style: AppTypography.h4.copyWith(
                        color: isDark ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Based on $reviewCount reviews',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Rating bars
                    _RatingBar(
                      label: 'Cleanliness',
                      value: 0.9,
                      isDark: isDark,
                    ),
                    const SizedBox(height: 4),
                    _RatingBar(label: 'Location', value: 0.85, isDark: isDark),
                    const SizedBox(height: 4),
                    _RatingBar(label: 'Service', value: 0.88, isDark: isDark),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RatingBar extends StatelessWidget {
  final String label;
  final double value;
  final bool isDark;

  const _RatingBar({
    required this.label,
    required this.value,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 70,
          child: Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.textSecondary,
              fontSize: 10,
            ),
          ),
        ),
        Expanded(
          child: Container(
            height: 4,
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.1)
                  : AppColors.divider,
              borderRadius: BorderRadius.circular(2),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: value,
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _BottomBookingBar extends StatelessWidget {
  final int price;
  final int nights;
  final bool isSaved;
  final VoidCallback onSave;
  final VoidCallback onBook;
  final bool isDark;

  const _BottomBookingBar({
    required this.price,
    required this.nights,
    required this.isSaved,
    required this.onSave,
    required this.onBook,
    required this.isDark,
  });

  String _formatPrice(int price) {
    return price.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context)!;
    final totalPrice = price * nights;

    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 16,
            bottom: MediaQuery.of(context).padding.bottom + 16,
          ),
          decoration: BoxDecoration(
            color: (isDark ? AppColors.surfaceDark : Colors.white).withValues(
              alpha: 0.9,
            ),
            border: Border(
              top: BorderSide(
                color: isDark ? Colors.white12 : AppColors.divider,
              ),
            ),
          ),
          child: Row(
            children: [
              // Price Info
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '৳${_formatPrice(totalPrice)}',
                            style: AppTypography.h3.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '$nights ${nights == 1 ? 'night' : 'nights'} • ৳${_formatPrice(price)}/night',
                      style: AppTypography.labelSmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              // Save Button
              GestureDetector(
                onTap: onSave,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 52,
                  height: 52,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    color: isSaved
                        ? AppColors.error.withValues(alpha: 0.1)
                        : (isDark
                              ? Colors.white.withValues(alpha: 0.08)
                              : AppColors.surfaceVariant),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSaved
                          ? AppColors.error.withValues(alpha: 0.3)
                          : (isDark ? Colors.white12 : AppColors.divider),
                    ),
                  ),
                  child: Icon(
                    isSaved ? Icons.favorite : Icons.favorite_border,
                    color: isSaved
                        ? AppColors.error
                        : (isDark ? Colors.white70 : AppColors.textSecondary),
                    size: 24,
                  ),
                ),
              ),

              // Book Button
              Expanded(
                child: GestureDetector(
                  onTap: onBook,
                  child: Container(
                    height: 52,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: AppColors.buttonShadow,
                    ),
                    child: Center(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(loc.bookNow, style: AppTypography.button),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.arrow_forward,
                            color: Colors.white,
                            size: 18,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
