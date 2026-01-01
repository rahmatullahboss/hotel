// Hotel Provider - Riverpod 3.0 state management for hotels
import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';

// Haversine formula to calculate distance between two coordinates (in km)
double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
  const double earthRadius = 6371;

  double dLat = _toRadians(lat2 - lat1);
  double dLon = _toRadians(lon2 - lon1);

  double a =
      sin(dLat / 2) * sin(dLat / 2) +
      cos(_toRadians(lat1)) *
          cos(_toRadians(lat2)) *
          sin(dLon / 2) *
          sin(dLon / 2);

  double c = 2 * atan2(sqrt(a), sqrt(1 - a));

  return earthRadius * c;
}

double _toRadians(double degrees) {
  return degrees * pi / 180;
}

// Hotel model
class Hotel {
  final String id;
  final String name;
  final String city;
  final String address;
  final String? imageUrl;
  final List<String> images;
  final double rating;
  final int reviewCount;
  final int pricePerNight;
  final List<String> amenities;
  final bool isFeatured;
  final String? description;
  final double latitude;
  final double longitude;
  final double? distanceFromUser;

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
    this.latitude = 0.0,
    this.longitude = 0.0,
    this.distanceFromUser,
  });

  Hotel copyWith({
    String? id,
    String? name,
    String? city,
    String? address,
    String? imageUrl,
    List<String>? images,
    double? rating,
    int? reviewCount,
    int? pricePerNight,
    List<String>? amenities,
    bool? isFeatured,
    String? description,
    double? latitude,
    double? longitude,
    double? distanceFromUser,
  }) {
    return Hotel(
      id: id ?? this.id,
      name: name ?? this.name,
      city: city ?? this.city,
      address: address ?? this.address,
      imageUrl: imageUrl ?? this.imageUrl,
      images: images ?? this.images,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      pricePerNight: pricePerNight ?? this.pricePerNight,
      amenities: amenities ?? this.amenities,
      isFeatured: isFeatured ?? this.isFeatured,
      description: description ?? this.description,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      distanceFromUser: distanceFromUser ?? this.distanceFromUser,
    );
  }

  factory Hotel.fromJson(Map<String, dynamic> json) {
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
      latitude: parseDouble(json['latitude']),
      longitude: parseDouble(json['longitude']),
      distanceFromUser: parseDouble(json['distance']),
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

// Hotels notifier (Riverpod 3.0)
class HotelsNotifier extends Notifier<HotelsState> {
  Dio get _dio => ref.read(dioProvider);

  @override
  HotelsState build() => HotelsState();

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

// Provider (Riverpod 3.0)
final hotelsProvider = NotifierProvider<HotelsNotifier, HotelsState>(
  HotelsNotifier.new,
);

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

// Search hotels provider - with proper city/location/filter handling
final searchHotelsProvider = FutureProvider.family<List<Hotel>, String>((
  ref,
  query,
) async {
  if (query.isEmpty) return [];

  final dio = ref.watch(dioProvider);
  final queryLower = query.toLowerCase().trim();

  final isNearbySearch = query.startsWith('nearby:');
  final isBudgetFilter = queryLower == 'budget hotels';
  final isLuxuryFilter = queryLower == 'luxury hotels';
  final isCoupleFilter = queryLower == 'couple friendly';
  final isFilterQuery = isBudgetFilter || isLuxuryFilter || isCoupleFilter;

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

  final isLocationSearch =
      !isNearbySearch &&
      !isFilterQuery &&
      cityNames.any(
        (city) => city.contains(queryLower) || queryLower.contains(city),
      );

  try {
    // For nearby search, fetch all hotels
    final String endpoint = isNearbySearch ? '/hotels?all=true' : '/hotels';
    final response = await dio.get(endpoint);
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

    var hotels = data.map((json) => Hotel.fromJson(json)).toList();

    if (isNearbySearch) {
      final coords = query.substring(7).split(',');
      if (coords.length == 2) {
        final userLat = double.tryParse(coords[0]) ?? 0;
        final userLng = double.tryParse(coords[1]) ?? 0;

        // City coordinates for fallback when hotel lat/lng is missing
        const cityCoordinates = <String, List<double>>{
          'dhaka': [23.8103, 90.4125],
          'chittagong': [22.3569, 91.7832],
          "cox's bazar": [21.4272, 92.0058],
          'sylhet': [24.8949, 91.8687],
          'rajshahi': [24.3636, 88.6241],
          'khulna': [22.8456, 89.5403],
          'barisal': [22.7010, 90.3535],
          'rangpur': [25.7439, 89.2752],
          'mymensingh': [24.7471, 90.4203],
          'comilla': [23.4607, 91.1809],
        };

        // Calculate distance for all hotels using their actual or city-based coordinates
        final hotelsWithDistance = hotels.map((hotel) {
          // Use hotel's actual coordinates, or fallback to city coordinates
          double hotelLat = hotel.latitude;
          double hotelLng = hotel.longitude;

          if (hotelLat == 0.0 || hotelLng == 0.0) {
            // Use city-based coordinates as fallback
            final cityLower = hotel.city.toLowerCase();
            final cityCoords = cityCoordinates[cityLower];
            if (cityCoords != null) {
              hotelLat = cityCoords[0];
              hotelLng = cityCoords[1];
            } else {
              // If city not found, use a very far distance
              hotelLat = 0;
              hotelLng = 0;
            }
          }

          final distance = _calculateDistance(
            userLat,
            userLng,
            hotelLat,
            hotelLng,
          );
          return hotel.copyWith(distanceFromUser: distance);
        }).toList();

        // Sort by distance
        hotelsWithDistance.sort((a, b) {
          return (a.distanceFromUser ?? 99999).compareTo(
            b.distanceFromUser ?? 99999,
          );
        });

        // Return top 20 closest hotels
        return hotelsWithDistance.take(20).toList();
      }
    } else if (isBudgetFilter) {
      hotels = hotels.where((h) => h.pricePerNight <= 3000).toList();
      hotels.sort((a, b) => a.pricePerNight.compareTo(b.pricePerNight));
    } else if (isLuxuryFilter) {
      hotels = hotels.where((h) => h.pricePerNight >= 8000).toList();
      hotels.sort((a, b) => b.rating.compareTo(a.rating));
    } else if (isCoupleFilter) {
      hotels = hotels.where((hotel) {
        final amenitiesLower = hotel.amenities
            .map((a) => a.toLowerCase())
            .toList();
        final descLower = (hotel.description ?? '').toLowerCase();
        return amenitiesLower.any(
              (a) =>
                  a.contains('couple') ||
                  a.contains('honeymoon') ||
                  a.contains('romantic'),
            ) ||
            descLower.contains('couple') ||
            descLower.contains('honeymoon');
      }).toList();

      if (hotels.isEmpty) {
        hotels = data.map((json) => Hotel.fromJson(json)).toList();
        hotels = hotels.where((h) => h.rating >= 4.0).toList();
        hotels.sort((a, b) => b.rating.compareTo(a.rating));
      }
    } else if (isLocationSearch) {
      hotels = hotels.where((hotel) {
        final hotelCity = hotel.city.toLowerCase();
        final hotelAddress = hotel.address.toLowerCase();
        return hotelCity.contains(queryLower) ||
            queryLower.contains(hotelCity) ||
            hotelAddress.contains(queryLower);
      }).toList();
    } else {
      hotels = hotels.where((hotel) {
        final name = hotel.name.toLowerCase();
        final city = hotel.city.toLowerCase();
        final address = hotel.address.toLowerCase();
        return name.contains(queryLower) ||
            city.contains(queryLower) ||
            address.contains(queryLower);
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
  final String sortBy;
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
const kRatingOptions = [4.5, 4.0, 3.5, 3.0];
const kPopularCities = [
  'Dhaka',
  'Chittagong',
  "Cox's Bazar",
  'Sylhet',
  'Rajshahi',
  'Khulna',
];

// Hotel filters notifier (Riverpod 3.0 - replaces StateProvider)
class HotelFiltersNotifier extends Notifier<HotelFilters> {
  @override
  HotelFilters build() => const HotelFilters();

  void updateFilters(HotelFilters filters) => state = filters;
  void resetFilters() => state = const HotelFilters();
}

final hotelFiltersProvider =
    NotifierProvider<HotelFiltersNotifier, HotelFilters>(
      HotelFiltersNotifier.new,
    );

// Filtered hotels provider
final filteredHotelsProvider = Provider<List<Hotel>>((ref) {
  final hotels = ref.watch(hotelsProvider).hotels;
  final filters = ref.watch(hotelFiltersProvider);

  var filtered = hotels.where((hotel) {
    if (filters.searchQuery.isNotEmpty) {
      final query = filters.searchQuery.toLowerCase();
      if (!hotel.name.toLowerCase().contains(query) &&
          !hotel.city.toLowerCase().contains(query) &&
          !hotel.address.toLowerCase().contains(query)) {
        return false;
      }
    }

    if (hotel.pricePerNight < filters.minPrice ||
        hotel.pricePerNight > filters.maxPrice) {
      return false;
    }

    if (filters.minRating != null && hotel.rating < filters.minRating!) {
      return false;
    }

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

    if (filters.selectedCity != null &&
        !hotel.city.toLowerCase().contains(
          filters.selectedCity!.toLowerCase(),
        )) {
      return false;
    }

    return true;
  }).toList();

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
