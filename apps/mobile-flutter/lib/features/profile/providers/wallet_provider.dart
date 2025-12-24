// Wallet Provider - Riverpod state management for wallet
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';

// Transaction model
class Transaction {
  final String id;
  final String type; // 'CREDIT', 'DEBIT'
  final int amount;
  final String description;
  final String? reason;
  final DateTime createdAt;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    this.reason,
    required this.createdAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] as String,
      type: (json['type'] as String).toUpperCase(),
      amount: (json['amount'] as num).toInt(),
      description:
          json['description'] as String? ?? json['reason'] as String? ?? '',
      reason: json['reason'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  bool get isCredit => type == 'CREDIT';
}

// Wallet state
class WalletState {
  final int balance;
  final int loyaltyPoints;
  final String loyaltyTier; // 'bronze', 'silver', 'gold', 'platinum'
  final List<Transaction> transactions;
  final bool isLoading;
  final String? error;

  WalletState({
    this.balance = 0,
    this.loyaltyPoints = 0,
    this.loyaltyTier = 'bronze',
    this.transactions = const [],
    this.isLoading = false,
    this.error,
  });

  WalletState copyWith({
    int? balance,
    int? loyaltyPoints,
    String? loyaltyTier,
    List<Transaction>? transactions,
    bool? isLoading,
    String? error,
  }) {
    return WalletState(
      balance: balance ?? this.balance,
      loyaltyPoints: loyaltyPoints ?? this.loyaltyPoints,
      loyaltyTier: loyaltyTier ?? this.loyaltyTier,
      transactions: transactions ?? this.transactions,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  String get loyaltyTierBengali {
    switch (loyaltyTier) {
      case 'silver':
        return 'সিলভার';
      case 'gold':
        return 'গোল্ড';
      case 'platinum':
        return 'প্ল্যাটিনাম';
      default:
        return 'ব্রোঞ্জ';
    }
  }
}

// Wallet notifier
class WalletNotifier extends StateNotifier<WalletState> {
  final Dio _dio;

  WalletNotifier(this._dio) : super(WalletState());

  Future<void> fetchWallet() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _dio.get('/user/wallet');
      final data = response.data;

      // Parse loyalty from nested object
      final loyalty = data['loyalty'] as Map<String, dynamic>?;

      state = state.copyWith(
        balance: (data['balance'] as num?)?.toInt() ?? 0,
        loyaltyPoints: loyalty?['points'] as int? ?? 0,
        loyaltyTier: (loyalty?['tier'] as String?)?.toLowerCase() ?? 'bronze',
        isLoading: false,
      );

      // Parse transactions from same response
      final txData = data['transactions'] as List<dynamic>? ?? [];
      final transactions = txData
          .map((json) => Transaction.fromJson(json))
          .toList();
      state = state.copyWith(transactions: transactions);
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.message ?? 'ওয়ালেট লোড করতে সমস্যা হয়েছে',
      );
    }
  }

  Future<void> fetchTransactions() async {
    // Transactions are now fetched in fetchWallet, this is kept for manual refresh
    await fetchWallet();
  }

  Future<bool> topUp(int amount, String paymentMethod) async {
    try {
      await _dio.post(
        '/wallet/topup',
        data: {'amount': amount, 'paymentMethod': paymentMethod},
      );

      await fetchWallet();
      await fetchTransactions();
      return true;
    } on DioException catch (_) {
      return false;
    }
  }
}

// Provider
final walletProvider = StateNotifierProvider<WalletNotifier, WalletState>((
  ref,
) {
  final dio = ref.watch(dioProvider);
  return WalletNotifier(dio);
});
