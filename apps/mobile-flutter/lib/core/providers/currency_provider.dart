// Currency Provider - BDT/USD Toggle with Persistence
// Zinu Rooms Flutter App

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/secure_storage.dart';

/// Supported currencies
enum Currency {
  bdt, // Bangladesh Taka (default)
  usd, // US Dollar
}

/// Currency state with conversion
class CurrencyState {
  final Currency currency;
  final double exchangeRate; // USD to BDT rate

  const CurrencyState({
    this.currency = Currency.bdt,
    this.exchangeRate = 110.0, // 1 USD ≈ 110 BDT
  });

  CurrencyState copyWith({Currency? currency, double? exchangeRate}) {
    return CurrencyState(
      currency: currency ?? this.currency,
      exchangeRate: exchangeRate ?? this.exchangeRate,
    );
  }

  /// Get currency symbol
  String get symbol => currency == Currency.bdt ? '৳' : '\$';

  /// Get currency code
  String get code => currency == Currency.bdt ? 'BDT' : 'USD';

  /// Convert amount from BDT to selected currency
  int convertFromBDT(int amountInBDT) {
    if (currency == Currency.bdt) {
      return amountInBDT;
    }
    // Convert BDT to USD
    return (amountInBDT / exchangeRate).round();
  }

  /// Format price with currency symbol
  String formatPrice(int amountInBDT) {
    final converted = convertFromBDT(amountInBDT);
    final formatted = converted.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
    return '$symbol$formatted';
  }
}

/// Currency notifier for state management
class CurrencyNotifier extends Notifier<CurrencyState> {
  static const _currencyKey = 'selected_currency';

  @override
  CurrencyState build() {
    // Load saved currency preference on initialization
    _loadSavedCurrency();
    return const CurrencyState();
  }

  Future<void> _loadSavedCurrency() async {
    final storage = ref.read(secureStorageProvider);
    final savedCurrency = await storage.read(_currencyKey);
    if (savedCurrency == 'usd') {
      state = state.copyWith(currency: Currency.usd);
    }
  }

  /// Toggle between BDT and USD
  Future<void> toggleCurrency() async {
    final newCurrency = state.currency == Currency.bdt
        ? Currency.usd
        : Currency.bdt;
    await setCurrency(newCurrency);
  }

  /// Set specific currency
  Future<void> setCurrency(Currency currency) async {
    state = state.copyWith(currency: currency);
    // Persist selection
    final storage = ref.read(secureStorageProvider);
    await storage.write(_currencyKey, currency == Currency.usd ? 'usd' : 'bdt');
  }

  /// Update exchange rate (for future API integration)
  void updateExchangeRate(double rate) {
    state = state.copyWith(exchangeRate: rate);
  }
}

/// Currency provider (Riverpod 3.0)
final currencyProvider = NotifierProvider<CurrencyNotifier, CurrencyState>(
  CurrencyNotifier.new,
);

/// Convenience provider for checking if USD is selected
final isUsdProvider = Provider<bool>((ref) {
  return ref.watch(currencyProvider).currency == Currency.usd;
});
