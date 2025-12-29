// Hotel Details Screen - World-Class Premium Design with API Integration
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

import '../../../l10n/generated/app_localizations.dart';

// Dummy hotel data
const dummyHotelData = {
  'id': '1',
  'name': 'Pan Pacific Sonargaon',
  'city': 'ঢাকা, বাংলাদেশ',
  'rating': 4.8,
  'reviewCount': 320,
  'price': 8500,
  'description':
      'এটি একটি চমৎকার হোটেল যেখানে আপনি আরামদায়ক থাকার ব্যবস্থা পাবেন। আধুনিক সুযোগ-সুবিধা সহ এই হোটেল আপনার ভ্রমণকে আরও আনন্দদায়ক করে তুলবে। শহরের কেন্দ্রে অবস্থিত এই হোটেলে সব ধরনের সুযোগ-সুবিধা রয়েছে।',
  'images': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  ],
  'amenities': [
    {'icon': 'wifi', 'label': 'ফ্রি ওয়াইফাই'},
    {'icon': 'ac', 'label': 'এসি'},
    {'icon': 'parking', 'label': 'পার্কিং'},
    {'icon': 'restaurant', 'label': 'রেস্টুরেন্ট'},
    {'icon': 'pool', 'label': 'সুইমিং পুল'},
    {'icon': 'gym', 'label': 'জিম'},
  ],
  'rooms': [
    {
      'id': 'r1',
      'name': 'ডিলাক্স রুম',
      'capacity': '২ জন',
      'beds': '১ বেড',
      'features': 'এসি',
      'price': 8500,
      'image':
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
    },
    {
      'id': 'r2',
      'name': 'প্রিমিয়াম স্যুট',
      'capacity': '৪ জন',
      'beds': '২ বেড',
      'features': 'এসি • সি ভিউ',
      'price': 12500,
      'image':
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400',
    },
  ],
};

class HotelDetailsScreen extends ConsumerStatefulWidget {
  final String hotelId;

  const HotelDetailsScreen({super.key, required this.hotelId});

  @override
  ConsumerState<HotelDetailsScreen> createState() => _HotelDetailsScreenState();
}

class _HotelDetailsScreenState extends ConsumerState<HotelDetailsScreen> {
  int _currentImageIndex = 0;
  bool _isSaved = false;
  final PageController _pageController = PageController();

  // Date state for room availability
  late DateTime _checkIn;
  late DateTime _checkOut;

  @override
  void initState() {
    super.initState();
    _checkIn = DateTime.now().add(const Duration(days: 1));
    _checkOut = DateTime.now().add(const Duration(days: 2));
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _handleShare() {
    final loc = AppLocalizations.of(context)!;
    SharePlus.instance.share(
      ShareParams(
        text: loc.shareHotelText(
          dummyHotelData['name'] as String,
          'https://zinurooms.com/hotel/${widget.hotelId}',
        ),
      ),
    );
  }

  void _handleSave() {
    ref.read(savedHotelsProvider.notifier).toggleSaved(widget.hotelId);
  }

  IconData _getAmenityIcon(String iconName) {
    switch (iconName) {
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
      default:
        return Icons.check_circle_outline;
    }
  }

  String _formatPrice(num price) {
    return price.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  @override
  Widget build(BuildContext context) {
    final hotelAsync = ref.watch(hotelProvider(widget.hotelId));
    final savedHotels = ref.watch(savedHotelsProvider);
    final _isSaved = savedHotels.contains(widget.hotelId);

    // Fetch rooms with dynamic pricing
    final roomsParams = RoomsParams(
      hotelId: widget.hotelId,
      checkIn: _checkIn.toIso8601String().split('T')[0],
      checkOut: _checkOut.toIso8601String().split('T')[0],
    );
    final roomsAsync = ref.watch(roomsProvider(roomsParams));

    // Debug logging
    debugPrint('Rooms loading: ${roomsAsync.isLoading}');
    debugPrint(
      'Rooms error: ${roomsAsync.hasError ? roomsAsync.error : "none"}',
    );
    debugPrint(
      'Rooms count: ${roomsAsync.hasValue ? roomsAsync.value!.length : 0}',
    );

    return hotelAsync.when(
      loading: () => _buildLoadingState(),
      error: (_, _) => _buildErrorState(),
      data: (hotel) {
        // Use API data - hotel should never be null at this point
        if (hotel == null) return _buildErrorState();

        final hotelName = hotel.name;
        final hotelCity = hotel.city;
        final hotelRating = hotel.rating;
        final hotelReviewCount = hotel.reviewCount;
        final price = hotel.pricePerNight;

        // Use images array from API for carousel
        final images = hotel.images.isNotEmpty
            ? hotel.images
            : (hotel.imageUrl != null
                ? [hotel.imageUrl!]
                : [
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                  ]);

        final loc = AppLocalizations.of(context)!;
        
        // Map amenities keys to localized labels
        final amenitiesList = [
          {'icon': 'wifi', 'label': loc.amenityWifi},
          {'icon': 'ac', 'label': loc.amenityAC},
          {'icon': 'parking', 'label': loc.amenityParking},
          {'icon': 'restaurant', 'label': loc.amenityRestaurant},
          {'icon': 'pool', 'label': loc.amenityPool},
          {'icon': 'gym', 'label': loc.amenityGym},
        ];

        // Use API description or localized fallback
        final description = hotel.description ?? loc.detailsDescription;

        // Get rooms from API (with dynamic prices)
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
          isSaved: _isSaved,
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
              child: Container(height: 300, color: Colors.white),
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
                      height: 24,
                      width: 200,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Shimmer.fromColors(
                    baseColor: AppColors.shimmerBase,
                    highlightColor: AppColors.shimmerHighlight,
                    child: Container(
                      height: 16,
                      width: 150,
                      color: Colors.white,
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
            const Icon(Icons.error_outline, size: 64, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              AppLocalizations.of(context)!.errorLoadingHotel,
              style: AppTypography.bodyMedium,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.refresh(hotelProvider(widget.hotelId)),
              child: Text(AppLocalizations.of(context)!.retry),
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
    bool hasRoomsError = false,
    required bool isSaved,
  }) {
    final topPadding = MediaQuery.of(context).padding.top;
    final screenWidth = MediaQuery.of(context).size.width;
    final heroHeight = screenWidth * 0.85;

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              // Hero Image Gallery
              SliverToBoxAdapter(
                child: SizedBox(
                  height: heroHeight,
                  child: Stack(
                    children: [
                      // Image PageView
                      PageView.builder(
                        controller: _pageController,
                        onPageChanged: (index) {
                          setState(() => _currentImageIndex = index);
                        },
                        itemCount: images.length,
                        itemBuilder: (context, index) {
                          return CachedNetworkImage(
                            imageUrl: images[index],
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              color: AppColors.secondary,
                              child: const Center(
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              ),
                            ),
                            errorWidget: (context, url, error) => Container(
                              color: AppColors.secondary,
                              child: const Icon(
                                Icons.hotel,
                                size: 80,
                                color: Colors.white54,
                              ),
                            ),
                          );
                        },
                      ),

                      // Gradient Overlay
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.transparent,
                                Colors.black.withValues(alpha: 0.7),
                              ],
                              begin: const Alignment(0, 0.3),
                              end: Alignment.bottomCenter,
                            ),
                          ),
                        ),
                      ),

                      // Page Indicators
                      Positioned(
                        bottom: 80,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(
                            images.length,
                            (index) => AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              width: index == _currentImageIndex ? 24 : 8,
                              height: 8,
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              decoration: BoxDecoration(
                                color: index == _currentImageIndex
                                    ? Colors.white
                                    : Colors.white.withValues(alpha: 0.5),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                        ),
                      ),

                      // Price Badge
                      Positioned(
                        bottom: 20,
                        right: 20,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '৳${_formatPrice(price)}',
                                style: AppTypography.h4.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '/${AppLocalizations.of(context)!.night}',
                                style: AppTypography.labelSmall.copyWith(
                                  color: Colors.white.withValues(alpha: 0.7),
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
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Name and Rating
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(hotelName, style: AppTypography.h2),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.location_on,
                                      size: 16,
                                      color: AppColors.textSecondary,
                                    ),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        hotelCity,
                                        style: AppTypography.bodyMedium
                                            .copyWith(
                                              color: AppColors.textSecondary,
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
                              color: AppColors.starFilled,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.star,
                                  size: 18,
                                  color: Colors.white,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  hotelRating.toStringAsFixed(1),
                                  style: AppTypography.labelLarge.copyWith(
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
                          '$hotelReviewCount ${AppLocalizations.of(context)!.reviews}',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Amenities
                      Text(
                        AppLocalizations.of(context)!.detailsAmenities,
                        style: AppTypography.h4,
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 80,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: amenities.length,
                          separatorBuilder: (_, _) => const SizedBox(width: 12),
                          itemBuilder: (context, index) {
                            final amenity = amenities[index];
                            return _AmenityCard(
                              icon: _getAmenityIcon(amenity['icon']!),
                              label: amenity['label']!,
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Description
                      Text(
                        AppLocalizations.of(context)!.detailsDescription,
                        style: AppTypography.h4,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        description,
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                          height: 1.6,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Rooms Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            AppLocalizations.of(context)!.detailsRooms,
                            style: AppTypography.h4,
                          ),
                          Text(
                            AppLocalizations.of(
                              context,
                            )!.roomsCount(apiRooms.length),
                            style: AppTypography.labelMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Room Cards - Show loading, error, or actual rooms with dynamic prices
                      if (isLoadingRooms)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(20),
                            child: CircularProgressIndicator(),
                          ),
                        )
                      else if (hasRoomsError)
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              const Icon(
                                Icons.error_outline,
                                color: AppColors.error,
                                size: 40,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                AppLocalizations.of(context)!.errorLoadingRooms,
                                style: AppTypography.bodyMedium.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        )
                      else if (apiRooms.isEmpty)
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Text(
                            AppLocalizations.of(context)!.noRoomsFound,
                            style: AppTypography.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        )
                      else
                        ...apiRooms.map(
                          (room) {
                            final loc = AppLocalizations.of(context)!;
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
                              padding: const EdgeInsets.only(bottom: 16),
                              child: _RoomCard(
                                name: room.name,
                                capacity: loc.capacityText(room.maxGuests),
                                beds: bedsText,
                                features: room.amenities.take(2).join(' • '),
                              price: room.dynamicPrice, // Use dynamic price!
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
                        },
                      ),

                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Bottom Bar
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 16,
                bottom: MediaQuery.of(context).padding.bottom + 16,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 16,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Save Button
                  GestureDetector(
                    onTap: _handleSave,
                    child: Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: isSaved
                            ? AppColors.error.withValues(alpha: 0.1)
                            : AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSaved
                              ? AppColors.error.withValues(alpha: 0.3)
                              : AppColors.divider,
                        ),
                      ),
                      child: Icon(
                        isSaved ? Icons.favorite : Icons.favorite_border,
                        color: isSaved
                            ? AppColors.error
                            : AppColors.textSecondary,
                        size: 24,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Book Now Button
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        // Scroll up to show rooms - user should select a specific room
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              AppLocalizations.of(context)!.selectRoomSnackbar,
                            ),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                      child: Container(
                        height: 52,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: AppColors.buttonShadow,
                        ),
                        child: Center(
                          child: Text(
                            AppLocalizations.of(context)!.bookNow,
                            style: AppTypography.button,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Top Bar (Fixed)
          Positioned(
            top: topPadding + 8,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Back Button
                GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.4),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.arrow_back,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),

                // Title
                Text(
                  AppLocalizations.of(context)!.hotelDetailsTitle,
                  style: AppTypography.labelLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),

                // Share Button
                GestureDetector(
                  onTap: _handleShare,
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.4),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.share,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AmenityCard extends StatelessWidget {
  final IconData icon;
  final String label;

  const _AmenityCard({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 80,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.softShadow,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 24, color: AppColors.primary),
          const SizedBox(height: 8),
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.textSecondary,
              fontSize: 10,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _RoomCard extends StatelessWidget {
  final String name;
  final String capacity;
  final String beds;
  final String features;
  final int price;
  final String imageUrl;
  final VoidCallback onSelect;
  final bool isAvailable;
  final int availableCount;

  const _RoomCard({
    required this.name,
    required this.capacity,
    required this.beds,
    required this.features,
    required this.price,
    required this.imageUrl,
    required this.onSelect,
    this.isAvailable = true,
    this.availableCount = 1,
  });

  String _formatPrice(int price) {
    return price.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.softShadow,
      ),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Room Image (Left)
            ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                bottomLeft: Radius.circular(16),
              ),
              child: SizedBox(
                width: 120,
                child: CachedNetworkImage(
                  imageUrl: imageUrl,
                  fit: BoxFit.cover,
                  placeholder: (context, url) =>
                      Container(color: AppColors.shimmerBase),
                  errorWidget: (context, url, error) => Container(
                    color: AppColors.surfaceVariant,
                    child: const Icon(
                      Icons.bed,
                      size: 32,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ),
              ),
            ),

            // Room Info (Right)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: AppTypography.h4.copyWith(fontSize: 16),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$capacity • $beds',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                            fontSize: 10,
                          ),
                        ),
                        if (features.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            features,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                              fontSize: 10,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        RichText(
                          text: TextSpan(
                            children: [
                              TextSpan(
                                text: '৳${_formatPrice(price)}',
                                style: AppTypography.priceSmall,
                              ),
                              TextSpan(
                                text: '/${AppLocalizations.of(context)!.night}',
                                style: AppTypography.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ),
                        GestureDetector(
                          onTap: onSelect,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              AppLocalizations.of(context)!.selectRoom,
                              style: AppTypography.labelLarge.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
