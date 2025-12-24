// Locale Provider - Language Switching Support
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

  LocaleState({required this.locale});

  LocaleState copyWith({Locale? locale}) {
    return LocaleState(locale: locale ?? this.locale);
  }
}

// Locale notifier
class LocaleNotifier extends StateNotifier<LocaleState> {
  LocaleNotifier() : super(LocaleState(locale: AppLocales.bengali)) {
    _loadLocale();
  }

  static const _key = 'app_locale';

  Future<void> _loadLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final languageCode = prefs.getString(_key) ?? 'bn';
    state = LocaleState(locale: Locale(languageCode));
  }

  Future<void> setLocale(Locale locale) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, locale.languageCode);
    state = LocaleState(locale: locale);
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

// Provider
final localeProvider = StateNotifierProvider<LocaleNotifier, LocaleState>((
  ref,
) {
  return LocaleNotifier();
});

// Helper to get current locale
final currentLocaleProvider = Provider<Locale>((ref) {
  return ref.watch(localeProvider).locale;
});
