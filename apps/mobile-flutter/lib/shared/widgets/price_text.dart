// Price Text Widget - Currency-aware price display
// Uses CurrencyProvider for dynamic currency switching

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/currency_provider.dart';
import '../../core/theme/app_typography.dart';

/// A currency-aware text widget that displays prices
/// Automatically converts and formats based on selected currency
class PriceText extends ConsumerWidget {
  /// Amount in BDT (base currency)
  final int amountInBDT;

  /// Text style to apply
  final TextStyle? style;

  /// Whether to show per night suffix
  final bool showPerNight;

  /// Per night text (localized)
  final String? perNightText;

  const PriceText({
    super.key,
    required this.amountInBDT,
    this.style,
    this.showPerNight = false,
    this.perNightText,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currencyState = ref.watch(currencyProvider);
    final formattedPrice = currencyState.formatPrice(amountInBDT);

    if (showPerNight && perNightText != null) {
      return Text(
        '$formattedPrice/$perNightText',
        style: style ?? AppTypography.priceLarge,
      );
    }

    return Text(formattedPrice, style: style ?? AppTypography.priceLarge);
  }
}

/// Rich text version for inline price display
class PriceRichText extends ConsumerWidget {
  /// Amount in BDT (base currency)
  final int amountInBDT;

  /// Main price text style
  final TextStyle? priceStyle;

  /// Suffix text style (for /night)
  final TextStyle? suffixStyle;

  /// Suffix text (e.g., "/night")
  final String? suffix;

  const PriceRichText({
    super.key,
    required this.amountInBDT,
    this.priceStyle,
    this.suffixStyle,
    this.suffix,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currencyState = ref.watch(currencyProvider);
    final formattedPrice = currencyState.formatPrice(amountInBDT);

    return RichText(
      text: TextSpan(
        children: [
          TextSpan(
            text: formattedPrice,
            style: priceStyle ?? AppTypography.priceLarge,
          ),
          if (suffix != null)
            TextSpan(
              text: suffix,
              style: suffixStyle ?? AppTypography.labelSmall,
            ),
        ],
      ),
    );
  }
}

/// Extension for easy price formatting
extension CurrencyFormatExtension on WidgetRef {
  /// Format price using current currency
  String formatPrice(int amountInBDT) {
    return watch(currencyProvider).formatPrice(amountInBDT);
  }

  /// Get current currency symbol
  String get currencySymbol => watch(currencyProvider).symbol;
}
