// Wallet Provider - Riverpod state management for wallet
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';

// Transaction model
class Transaction {
  final String id;
  final String type; // 'credit', 'debit'
  final int amount;
  final String description;
  final String? referenceId;
  final DateTime createdAt;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    this.referenceId,
    required this.createdAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] as String,
      type: json['type'] as String,
      amount: json['amount'] as int,
      description: json['description'] as String,
      referenceId: json['referenceId'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  bool get isCredit => type == 'credit';
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
      final response = await _dio.get('/wallet');
      final data = response.data;

      state = state.copyWith(
        balance: data['balance'] as int? ?? 0,
        loyaltyPoints: data['loyaltyPoints'] as int? ?? 0,
        loyaltyTier: data['loyaltyTier'] as String? ?? 'bronze',
        isLoading: false,
      );
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.message ?? 'ওয়ালেট লোড করতে সমস্যা হয়েছে',
      );
    }
  }

  Future<void> fetchTransactions() async {
    try {
      final response = await _dio.get('/wallet/transactions');
      final List<dynamic> data = response.data['transactions'] ?? [];
      final transactions = data
          .map((json) => Transaction.fromJson(json))
          .toList();

      state = state.copyWith(transactions: transactions);
    } on DioException catch (_) {
      // Silent fail for transactions
    }
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
