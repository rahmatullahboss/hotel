import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

  // Get all hotels from the hotelsProvider if available
  // Or force fetch them?
  // Ideally we should have an endpoint for fetching by IDs or we iterate
  // access existing cache first

  // For now, let's assume valid hotels are in the main list or we need to fetch them singular
  // fetching strictly from ID might be slow if we do N requests.
  // Faster approach: fetch all hotels (since list is small probably) and filter
  // or rely on what we have.

  // Let's try to search empty to get "all" hotels or popular ones.
  // Actually, let's just reuse hotelsProvider which fetches default list.

  // Strategy:
  // 1. Check if hotelsProvider has data.
  // 2. If valid hotels found there, use them.
  // 3. For others, maybe fetch individual? (Too slow)
  // 4. Ideally, backend has GET /hotels?ids=...

  // Optimization: Just filter from what we can get via 'fetchHotels' (all)
  // We can call ref.read(hotelsProvider.notifier).fetchHotels()

  // Using searchHotelsProvider('') returns "all" (or filtered default).
  final allHotels = await ref.watch(searchHotelsProvider('').future);

  return allHotels.where((h) => savedIds.contains(h.id)).toList();
});
