import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api/api_client.dart';
import 'hotel_provider.dart';

class SavedHotelsNotifier extends Notifier<Set<String>> {
  static const _key = 'saved_hotels';

  @override
  Set<String> build() {
    _loadSavedHotels();
    return {};
  }

  Future<void> _loadSavedHotels() async {
    final prefs = await SharedPreferences.getInstance();
    final savedList = prefs.getStringList(_key) ?? [];
    state = savedList.toSet();
  }

  Future<void> toggleSaved(String hotelId) async {
    final prefs = await SharedPreferences.getInstance();
    final currentSaved = Set<String>.from(state);

    if (currentSaved.contains(hotelId)) {
      currentSaved.remove(hotelId);
    } else {
      currentSaved.add(hotelId);
    }

    await prefs.setStringList(_key, currentSaved.toList());
    state = currentSaved;
  }
}

final savedHotelsProvider = NotifierProvider<SavedHotelsNotifier, Set<String>>(
  SavedHotelsNotifier.new,
);

final savedHotelsListProvider = FutureProvider<List<Hotel>>((ref) async {
  final savedIds = ref.watch(savedHotelsProvider);
  if (savedIds.isEmpty) return [];

  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/hotels');
    
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
    return hotels.where((h) => savedIds.contains(h.id)).toList();
  } catch (e) {
    // If fetch fails, return empty list or maybe cached hotels if available
    return [];
  }
});
