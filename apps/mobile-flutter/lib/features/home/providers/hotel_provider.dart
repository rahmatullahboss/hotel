// Hotel Provider - Riverpod state management for hotels
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';

// Hotel model
class Hotel {
  final String id;
  final String name;
  final String city;
  final String address;
  final String? imageUrl;
  final List<String> images; // For photo carousel
  final double rating;
  final int reviewCount;
  final int pricePerNight;
  final List<String> amenities;
  final bool isFeatured;
  final String? description;

  Hotel({
    required this.id,
    required this.name,
    required this.city,
    required this.address,
    this.imageUrl,
    this.images = const [],
    required this.rating,
    required this.reviewCount,
    required this.pricePerNight,
    required this.amenities,
    this.isFeatured = false,
    this.description,
  });

  factory Hotel.fromJson(Map<String, dynamic> json) {
    // Parse images array from API
    List<String> imagesList = [];
    if (json['images'] != null) {
      imagesList = (json['images'] as List<dynamic>)
          .map((e) => e as String)
          .toList();
    } else if (json['imageUrl'] != null) {
      imagesList = [json['imageUrl'] as String];
    } else if (json['coverImage'] != null) {
      imagesList = [json['coverImage'] as String];
    }

    // Helper to parse number from string or num
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    int parseInt(dynamic value) {
      if (value == null) return 0;
      if (value is int) return value;
      if (value is num) return value.toInt();
      if (value is String) {
        // Try int first, then double (for values like "2178.00")
        return int.tryParse(value) ?? double.tryParse(value)?.toInt() ?? 0;
      }
      return 0;
    }

    return Hotel(
      id: json['id'] as String,
      name: json['name'] as String,
      city: json['city'] as String,
      address: json['address'] as String? ?? json['location'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? json['coverImage'] as String?,
      images: imagesList,
      rating: parseDouble(json['rating']),
      reviewCount: parseInt(json['reviewCount']),
      pricePerNight: parseInt(
        json['lowestPrice'] ??
            json['lowestDynamicPrice'] ??
            json['pricePerNight'],
      ),
      amenities:
          (json['amenities'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      isFeatured: json['isFeatured'] as bool? ?? false,
      description: json['description'] as String?,
    );
  }
}

// Hotels state
class HotelsState {
  final List<Hotel> hotels;
  final List<Hotel> featuredHotels;
  final bool isLoading;
  final String? error;

  HotelsState({
    this.hotels = const [],
    this.featuredHotels = const [],
    this.isLoading = false,
    this.error,
  });

  HotelsState copyWith({
    List<Hotel>? hotels,
    List<Hotel>? featuredHotels,
    bool? isLoading,
    String? error,
  }) {
    return HotelsState(
      hotels: hotels ?? this.hotels,
      featuredHotels: featuredHotels ?? this.featuredHotels,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Hotels notifier
class HotelsNotifier extends StateNotifier<HotelsState> {
  final Dio _dio;

  HotelsNotifier(this._dio) : super(HotelsState());

  Future<void> fetchHotels({String? city, String? search}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final queryParams = <String, dynamic>{};
      if (city != null) queryParams['city'] = city;
      if (search != null) queryParams['search'] = search;

      final response = await _dio.get('/hotels', queryParameters: queryParams);

      final dynamic responseData = response.data;
      final List<dynamic> data;
      if (responseData is Map<String, dynamic> &&
          responseData.containsKey('hotels')) {
        data = responseData['hotels'];
      } else if (responseData is List) {
        data = responseData;
      } else {
        data = [];
      }
      final hotels = data.map((json) => Hotel.fromJson(json)).toList();

      state = state.copyWith(hotels: hotels, isLoading: false);
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.message ?? 'হোটেল লোড করতে সমস্যা হয়েছে',
      );
    }
  }

  Future<void> fetchFeaturedHotels() async {
    try {
      final response = await _dio.get('/hotels?limit=5');

      final dynamic responseData = response.data;
      final List<dynamic> data;
      if (responseData is Map<String, dynamic> &&
          responseData.containsKey('hotels')) {
        data = responseData['hotels'];
      } else if (responseData is List) {
        data = responseData;
      } else {
        data = [];
      }
      final hotels = data.map((json) => Hotel.fromJson(json)).toList();

      state = state.copyWith(featuredHotels: hotels);
    } on DioException catch (_) {
      // Silent fail for featured hotels
    }
  }
}

// Providers
final hotelsProvider = StateNotifierProvider<HotelsNotifier, HotelsState>((
  ref,
) {
  final dio = ref.watch(dioProvider);
  return HotelsNotifier(dio);
});

// Single hotel provider
final hotelProvider = FutureProvider.family<Hotel?, String>((
  ref,
  hotelId,
) async {
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/hotels/$hotelId');
    final dynamic responseData = response.data;
    final Map<String, dynamic> json;
    if (responseData is Map<String, dynamic> &&
        responseData.containsKey('hotel')) {
      json = responseData['hotel'];
    } else {
      json = responseData;
    }
    return Hotel.fromJson(json);
  } catch (_) {
    return null;
  }
});

// Search hotels provider - with proper city/location filtering
final searchHotelsProvider = FutureProvider.family<List<Hotel>, String>((
  ref,
  query,
) async {
  if (query.isEmpty) return [];

  final dio = ref.watch(dioProvider);
  final queryLower = query.toLowerCase().trim();

  // Check if query matches a known city name
  final cityNames = [
    'dhaka',
    'chittagong',
    "cox's bazar",
    'coxs bazar',
    'sylhet',
    'rajshahi',
    'khulna',
    'barisal',
    'rangpur',
    'mymensingh',
    'comilla',
    'gazipur',
    'narayanganj',
    'barguna',
  ];

  final isLocationSearch = cityNames.any(
    (city) => city.contains(queryLower) || queryLower.contains(city),
  );

  try {
    final Map<String, dynamic> queryParams = {};

    // Use city parameter for location searches, search for others
    if (isLocationSearch) {
      queryParams['city'] = query;
    } else {
      queryParams['search'] = query;
    }

    final response = await dio.get('/hotels', queryParameters: queryParams);
    final dynamic responseData = response.data;
    final List<dynamic> data;
    if (responseData is Map<String, dynamic> &&
        responseData.containsKey('hotels')) {
      data = responseData['hotels'];
    } else if (responseData is List) {
      data = responseData;
    } else {
      data = [];
    }

    final hotels = data.map((json) => Hotel.fromJson(json)).toList();

    // Additional client-side filtering for location searches
    // to ensure only hotels from that location are shown
    if (isLocationSearch) {
      return hotels.where((hotel) {
        final hotelCity = hotel.city.toLowerCase();
        final hotelAddress = hotel.address.toLowerCase();
        return hotelCity.contains(queryLower) ||
            queryLower.contains(hotelCity) ||
            hotelAddress.contains(queryLower);
      }).toList();
    }

    return hotels;
  } catch (_) {
    return [];
  }
});

// Hotel Filters Model
class HotelFilters {
  final String searchQuery;
  final String sortBy; // 'rating', 'price', 'priceLow', 'priceHigh'
  final double minPrice;
  final double maxPrice;
  final double? minRating;
  final List<String> selectedAmenities;
  final String? selectedCity;

  const HotelFilters({
    this.searchQuery = '',
    this.sortBy = 'rating',
    this.minPrice = 500,
    this.maxPrice = 15000,
    this.minRating,
    this.selectedAmenities = const [],
    this.selectedCity,
  });

  HotelFilters copyWith({
    String? searchQuery,
    String? sortBy,
    double? minPrice,
    double? maxPrice,
    double? minRating,
    bool clearMinRating = false,
    List<String>? selectedAmenities,
    String? selectedCity,
    bool clearSelectedCity = false,
  }) {
    return HotelFilters(
      searchQuery: searchQuery ?? this.searchQuery,
      sortBy: sortBy ?? this.sortBy,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      minRating: clearMinRating ? null : (minRating ?? this.minRating),
      selectedAmenities: selectedAmenities ?? this.selectedAmenities,
      selectedCity: clearSelectedCity
          ? null
          : (selectedCity ?? this.selectedCity),
    );
  }

  bool get hasActiveFilters =>
      searchQuery.isNotEmpty ||
      minPrice > 500 ||
      maxPrice < 15000 ||
      minRating != null ||
      selectedAmenities.isNotEmpty ||
      selectedCity != null;

  int get activeFilterCount {
    int count = 0;
    if (minPrice > 500 || maxPrice < 15000) count++;
    if (minRating != null) count++;
    if (selectedAmenities.isNotEmpty) count++;
    if (selectedCity != null) count++;
    return count;
  }
}

// Available amenities for filtering
const kAvailableAmenities = [
  'WiFi',
  'AC',
  'TV',
  'Parking',
  'Pool',
  'Restaurant',
  'Gym',
  'Room Service',
];

// Rating options for filtering
const kRatingOptions = [4.5, 4.0, 3.5, 3.0];

// Popular cities in Bangladesh
const kPopularCities = [
  'Dhaka',
  'Chittagong',
  "Cox's Bazar",
  'Sylhet',
  'Rajshahi',
  'Khulna',
];

// Hotel filters state provider
final hotelFiltersProvider = StateProvider<HotelFilters>((ref) {
  return const HotelFilters();
});

// Filtered hotels provider - applies filters to the hotels list
final filteredHotelsProvider = Provider<List<Hotel>>((ref) {
  final hotels = ref.watch(hotelsProvider).hotels;
  final filters = ref.watch(hotelFiltersProvider);

  var filtered = hotels.where((hotel) {
    // Search filter
    if (filters.searchQuery.isNotEmpty) {
      final query = filters.searchQuery.toLowerCase();
      if (!hotel.name.toLowerCase().contains(query) &&
          !hotel.city.toLowerCase().contains(query) &&
          !hotel.address.toLowerCase().contains(query)) {
        return false;
      }
    }

    // Price filter
    if (hotel.pricePerNight < filters.minPrice ||
        hotel.pricePerNight > filters.maxPrice) {
      return false;
    }

    // Rating filter
    if (filters.minRating != null && hotel.rating < filters.minRating!) {
      return false;
    }

    // Amenities filter
    if (filters.selectedAmenities.isNotEmpty) {
      final hotelAmenities = hotel.amenities
          .map((a) => a.toLowerCase())
          .toSet();
      for (final amenity in filters.selectedAmenities) {
        if (!hotelAmenities.contains(amenity.toLowerCase())) {
          return false;
        }
      }
    }

    // City filter
    if (filters.selectedCity != null &&
        !hotel.city.toLowerCase().contains(
          filters.selectedCity!.toLowerCase(),
        )) {
      return false;
    }

    return true;
  }).toList();

  // Sort
  switch (filters.sortBy) {
    case 'priceLow':
      filtered.sort((a, b) => a.pricePerNight.compareTo(b.pricePerNight));
      break;
    case 'priceHigh':
      filtered.sort((a, b) => b.pricePerNight.compareTo(a.pricePerNight));
      break;
    case 'rating':
    default:
      filtered.sort((a, b) => b.rating.compareTo(a.rating));
      break;
  }

  return filtered;
});
