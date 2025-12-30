// Theme Provider - Dark Mode Support (Riverpod 3.0)
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Theme mode state
enum AppThemeMode { system, light, dark }

// Theme state
class ThemeState {
  final AppThemeMode mode;
  final ThemeMode themeMode;
  final bool isLoaded;

  ThemeState({
    required this.mode,
    required this.themeMode,
    this.isLoaded = false,
  });

  ThemeState copyWith({
    AppThemeMode? mode,
    ThemeMode? themeMode,
    bool? isLoaded,
  }) {
    return ThemeState(
      mode: mode ?? this.mode,
      themeMode: themeMode ?? this.themeMode,
      isLoaded: isLoaded ?? this.isLoaded,
    );
  }
}

// Theme notifier (Riverpod 3.0 - Fixed async loading)
class ThemeNotifier extends Notifier<ThemeState> {
  static const _key = 'theme_mode';

  @override
  ThemeState build() {
    // Start loading asynchronously
    _initializeTheme();
    // Default to light mode for white label theme
    return ThemeState(
      mode: AppThemeMode.light,
      themeMode: ThemeMode.light,
      isLoaded: false,
    );
  }

  Future<void> _initializeTheme() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final modeString = prefs.getString(_key) ?? 'light'; // Default to light
      final mode = AppThemeMode.values.firstWhere(
        (e) => e.name == modeString,
        orElse: () => AppThemeMode.light,
      );
      // Update state after loading - this will trigger rebuild
      state = ThemeState(
        mode: mode,
        themeMode: _getThemeMode(mode),
        isLoaded: true,
      );
    } catch (e) {
      // On error, mark as loaded with light mode default
      state = ThemeState(
        mode: AppThemeMode.light,
        themeMode: ThemeMode.light,
        isLoaded: true,
      );
    }
  }

  ThemeMode _getThemeMode(AppThemeMode mode) {
    switch (mode) {
      case AppThemeMode.light:
        return ThemeMode.light;
      case AppThemeMode.dark:
        return ThemeMode.dark;
      case AppThemeMode.system:
        return ThemeMode.system;
    }
  }

  Future<void> setThemeMode(AppThemeMode mode) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_key, mode.name);
      // Immediately update state to trigger UI rebuild
      state = state.copyWith(mode: mode, themeMode: _getThemeMode(mode));
    } catch (e) {
      debugPrint('Error saving theme: $e');
    }
  }

  void toggleDarkMode() {
    if (state.mode == AppThemeMode.dark) {
      setThemeMode(AppThemeMode.light);
    } else {
      setThemeMode(AppThemeMode.dark);
    }
  }

  bool get isDarkMode => state.mode == AppThemeMode.dark;
}

// Provider (Riverpod 3.0 NotifierProvider)
final themeProvider = NotifierProvider<ThemeNotifier, ThemeState>(
  ThemeNotifier.new,
);

// Helper to check if currently in dark mode
final isDarkModeProvider = Provider<bool>((ref) {
  final themeState = ref.watch(themeProvider);
  return themeState.mode == AppThemeMode.dark;
});

// Helper to check if theme is loaded
final isThemeLoadedProvider = Provider<bool>((ref) {
  return ref.watch(themeProvider).isLoaded;
});
