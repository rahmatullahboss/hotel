// Room Provider - Fetches rooms with dynamic pricing from API
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';

// Room model matching API response (RoomWithDetails)
class Room {
  final String id;
  final String name;
  final String type;
  final String basePrice;
  final int dynamicPrice; // Calculated dynamic price per night
  final int totalDynamicPrice; // Total for all nights
  final int nights;
  final int maxGuests;
  final String? description;
  final List<String> photos;
  final List<String> amenities;
  final bool isAvailable;
  final String? unavailableReason;
  final int availableCount;
  final int totalCount;

  Room({
    required this.id,
    required this.name,
    required this.type,
    required this.basePrice,
    required this.dynamicPrice,
    required this.totalDynamicPrice,
    required this.nights,
    required this.maxGuests,
    this.description,
    required this.photos,
    required this.amenities,
    required this.isAvailable,
    this.unavailableReason,
    required this.availableCount,
    required this.totalCount,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
      basePrice: json['basePrice'] as String? ?? '0',
      dynamicPrice: (json['dynamicPrice'] as num?)?.toInt() ?? 0,
      totalDynamicPrice: (json['totalDynamicPrice'] as num?)?.toInt() ?? 0,
      nights: json['nights'] as int? ?? 1,
      maxGuests: json['maxGuests'] as int? ?? 2,
      description: json['description'] as String?,
      photos:
          (json['photos'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      amenities:
          (json['amenities'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      isAvailable: json['isAvailable'] as bool? ?? true,
      unavailableReason: json['unavailableReason'] as String?,
      availableCount: json['availableCount'] as int? ?? 1,
      totalCount: json['totalCount'] as int? ?? 1,
    );
  }

  // Helper to get display capacity text
  String get capacityText => '$maxGuests জন';

  // Helper to get beds text (from type)
  String get bedsText {
    if (type.toLowerCase().contains('double')) return '১ ডাবল বেড';
    if (type.toLowerCase().contains('twin')) return '২ সিঙ্গেল বেড';
    if (type.toLowerCase().contains('single')) return '১ সিঙ্গেল বেড';
    return '১ বেড';
  }
}

// Rooms state
class RoomsState {
  final List<Room> rooms;
  final bool isLoading;
  final String? error;

  RoomsState({this.rooms = const [], this.isLoading = false, this.error});

  RoomsState copyWith({List<Room>? rooms, bool? isLoading, String? error}) {
    return RoomsState(
      rooms: rooms ?? this.rooms,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Rooms provider - fetches rooms for a specific hotel with dates
final roomsProvider = FutureProvider.family<List<Room>, RoomsParams>((
  ref,
  params,
) async {
  final dio = ref.watch(dioProvider);
  try {
    final queryParams = <String, dynamic>{};
    if (params.checkIn != null) queryParams['checkIn'] = params.checkIn;
    if (params.checkOut != null) queryParams['checkOut'] = params.checkOut;

    final response = await dio.get(
      '/hotels/${params.hotelId}/rooms',
      queryParameters: queryParams,
    );

    final dynamic responseData = response.data;
    final List<dynamic> data;
    if (responseData is List) {
      data = responseData;
    } else if (responseData is Map<String, dynamic> &&
        responseData.containsKey('rooms')) {
      data = responseData['rooms'];
    } else {
      data = [];
    }

    return data.map((json) => Room.fromJson(json)).toList();
  } on DioException catch (e) {
    throw Exception(e.message ?? 'রুম লোড করতে সমস্যা হয়েছে');
  }
});

// Parameters for rooms provider
class RoomsParams {
  final String hotelId;
  final String? checkIn;
  final String? checkOut;

  RoomsParams({required this.hotelId, this.checkIn, this.checkOut});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is RoomsParams &&
          runtimeType == other.runtimeType &&
          hotelId == other.hotelId &&
          checkIn == other.checkIn &&
          checkOut == other.checkOut;

  @override
  int get hashCode => hotelId.hashCode ^ checkIn.hashCode ^ checkOut.hashCode;
}
