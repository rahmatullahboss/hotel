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

  ThemeState({required this.mode, required this.themeMode});

  ThemeState copyWith({AppThemeMode? mode, ThemeMode? themeMode}) {
    return ThemeState(
      mode: mode ?? this.mode,
      themeMode: themeMode ?? this.themeMode,
    );
  }
}

// Theme notifier (Riverpod 3.0 Notifier pattern)
class ThemeNotifier extends Notifier<ThemeState> {
  static const _key = 'theme_mode';

  @override
  ThemeState build() {
    // Load theme on init
    _loadTheme();
    return ThemeState(mode: AppThemeMode.system, themeMode: ThemeMode.system);
  }

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final modeString = prefs.getString(_key) ?? 'system';
    final mode = AppThemeMode.values.firstWhere(
      (e) => e.name == modeString,
      orElse: () => AppThemeMode.system,
    );
    state = ThemeState(mode: mode, themeMode: _getThemeMode(mode));
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
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, mode.name);
    state = ThemeState(mode: mode, themeMode: _getThemeMode(mode));
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
