// App Colors - Zinu Rooms Design System
import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFFE63946); // Vibe Red
  static const Color primaryDark = Color(0xFFC62828);
  static const Color primaryLight = Color(0xFFFF6B6B);
  static const Color secondary = Color(0xFF1D3557); // Deep Navy
  static const Color secondaryLight = Color(0xFF457B9D);

  // Background
  static const Color background = Color(0xFFFFFFFF); // Pure White
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF1E1E1E);
  static const Color surfaceVariant = Color(
    0xFFF8F8F8,
  ); // Slightly off-white for cards

  // Text Colors
  static const Color textPrimary = Color(0xFF1D3557);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textTertiary = Color(0xFF999999);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);

  // Booking Status Colors
  static const Color confirmed = Color(0xFF14B8A6);
  static const Color pending = Color(0xFFF59E0B);
  static const Color cancelled = Color(0xFFEF4444);
  static const Color completed = Color(0xFF6B7280);
  static const Color checkedIn = Color(0xFF3B82F6);

  // Misc
  static const Color divider = Color(0xFFE0E0E0);
  static const Color overlay = Color(0x80000000);
  static const Color overlayLight = Color(0x40000000);
  static const Color shimmerBase = Color(0xFFE0E0E0);
  static const Color shimmerHighlight = Color(0xFFF5F5F5);

  // Star Rating
  static const Color starFilled = Color(0xFFFBBF24);
  static const Color starEmpty = Color(0xFFE0E0E0);

  // Glassmorphism
  static const Color glassWhite = Color(0x40FFFFFF);
  static const Color glassDark = Color(0x66000000);
  static const Color glassBorder = Color(0x33FFFFFF);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroOverlay = LinearGradient(
    colors: [Colors.transparent, Color(0x33000000), Color(0xBF000000)],
    stops: [0.0, 0.5, 1.0],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient cardOverlay = LinearGradient(
    colors: [Colors.transparent, Color(0xBF000000)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Shadows
  static List<BoxShadow> get cardShadow => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.08),
      blurRadius: 20,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> get buttonShadow => [
    BoxShadow(
      color: primary.withValues(alpha: 0.3),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> get softShadow => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.05),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
  ];

  // Adaptive Colors (for dark mode support)
  // Use these with BuildContext to get theme-aware colors

  static Color adaptiveBackground(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? backgroundDark
        : background;
  }

  static Color adaptiveSurface(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? surfaceDark
        : surface;
  }

  static Color adaptiveTextPrimary(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Colors.white
        : textPrimary;
  }

  static Color adaptiveTextSecondary(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Colors.white70
        : textSecondary;
  }

  static Color adaptiveDivider(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Colors.white24
        : divider;
  }

  static Color adaptiveSurfaceVariant(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? const Color(0xFF2A2A2A)
        : surfaceVariant;
  }

  static bool isDarkMode(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark;
  }
}
