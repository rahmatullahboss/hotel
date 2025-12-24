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
  final double rating;
  final int reviewCount;
  final int pricePerNight;
  final List<String> amenities;
  final bool isFeatured;

  Hotel({
    required this.id,
    required this.name,
    required this.city,
    required this.address,
    this.imageUrl,
    required this.rating,
    required this.reviewCount,
    required this.pricePerNight,
    required this.amenities,
    this.isFeatured = false,
  });

  factory Hotel.fromJson(Map<String, dynamic> json) {
    return Hotel(
      id: json['id'] as String,
      name: json['name'] as String,
      city: json['city'] as String,
      address: json['address'] as String? ?? '',
      imageUrl: json['imageUrl'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: json['reviewCount'] as int? ?? 0,
      pricePerNight:
          (json['lowestPrice'] as num?)?.toInt() ??
          (json['pricePerNight'] as int? ?? 0),
      amenities:
          (json['amenities'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      isFeatured: json['isFeatured'] as bool? ?? false,
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

// Search hotels provider
final searchHotelsProvider = FutureProvider.family<List<Hotel>, String>((
  ref,
  query,
) async {
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get(
      '/hotels',
      queryParameters: {'search': query},
    );
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
    return data.map((json) => Hotel.fromJson(json)).toList();
  } catch (_) {
    return [];
  }
});
