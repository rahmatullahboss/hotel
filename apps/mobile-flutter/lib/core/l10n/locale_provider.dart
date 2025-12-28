// Locale Provider - Language Switching Support (Riverpod 3.0)
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Supported locales
class AppLocales {
  static const Locale english = Locale('en');
  static const Locale bengali = Locale('bn');

  static const List<Locale> supportedLocales = [english, bengali];

  static String getDisplayName(Locale locale) {
    switch (locale.languageCode) {
      case 'en':
        return 'English';
      case 'bn':
        return 'বাংলা';
      default:
        return locale.languageCode;
    }
  }
}

// Locale state
class LocaleState {
  final Locale locale;
  final bool isLoaded;

  LocaleState({required this.locale, this.isLoaded = false});

  LocaleState copyWith({Locale? locale, bool? isLoaded}) {
    return LocaleState(
      locale: locale ?? this.locale,
      isLoaded: isLoaded ?? this.isLoaded,
    );
  }
}

// Locale notifier (Riverpod 3.0 - Fixed async loading)
class LocaleNotifier extends Notifier<LocaleState> {
  static const _key = 'app_locale';

  @override
  LocaleState build() {
    // Start loading asynchronously, but return default state immediately
    _initializeLocale();
    return LocaleState(locale: AppLocales.bengali, isLoaded: false);
  }

  Future<void> _initializeLocale() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final languageCode = prefs.getString(_key) ?? 'bn';
      debugPrint('LocaleProvider: Loaded locale from prefs: $languageCode');
      // Update state after loading - this will trigger rebuild
      state = LocaleState(locale: Locale(languageCode), isLoaded: true);
    } catch (e) {
      debugPrint('LocaleProvider: Error loading locale: $e');
      // On error, mark as loaded with default
      state = LocaleState(locale: AppLocales.bengali, isLoaded: true);
    }
  }

  Future<void> setLocale(Locale locale) async {
    debugPrint('LocaleProvider: Setting locale to ${locale.languageCode}');
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_key, locale.languageCode);
      // Immediately update state to trigger UI rebuild
      state = state.copyWith(locale: locale);
      debugPrint('LocaleProvider: State updated to ${locale.languageCode}');
    } catch (e) {
      debugPrint('LocaleProvider: Error saving locale: $e');
    }
  }

  void toggleLocale() {
    if (state.locale == AppLocales.english) {
      setLocale(AppLocales.bengali);
    } else {
      setLocale(AppLocales.english);
    }
  }

  bool get isEnglish => state.locale == AppLocales.english;
  bool get isBengali => state.locale == AppLocales.bengali;
}

// Provider (Riverpod 3.0)
final localeProvider = NotifierProvider<LocaleNotifier, LocaleState>(
  LocaleNotifier.new,
);

// Helper to get current locale
final currentLocaleProvider = Provider<Locale>((ref) {
  return ref.watch(localeProvider).locale;
});

// Helper to check if locale is loaded
final isLocaleLoadedProvider = Provider<bool>((ref) {
  return ref.watch(localeProvider).isLoaded;
});
