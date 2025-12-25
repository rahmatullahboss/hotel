// Referral Provider - Riverpod 3.0 state management for referrals
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';

// Referral History Item
class ReferralHistoryItem {
  final String id;
  final String referredUserName;
  final String? referredUserImage;
  final String status;
  final int reward;
  final DateTime createdAt;
  final DateTime? completedAt;

  ReferralHistoryItem({
    required this.id,
    required this.referredUserName,
    this.referredUserImage,
    required this.status,
    required this.reward,
    required this.createdAt,
    this.completedAt,
  });

  factory ReferralHistoryItem.fromJson(Map<String, dynamic> json) {
    return ReferralHistoryItem(
      id: json['id'] as String,
      referredUserName: json['referredUserName'] as String? ?? 'Anonymous',
      referredUserImage: json['referredUserImage'] as String?,
      status: json['status'] as String,
      reward: (json['reward'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'] as String)
          : null,
    );
  }

  bool get isPending => status == 'PENDING';
  bool get isCompleted => status == 'COMPLETED';
}

// Referral State
class ReferralState {
  final String? code;
  final int totalReferrals;
  final int pendingReferrals;
  final int completedReferrals;
  final int totalEarned;
  final List<ReferralHistoryItem> history;
  final bool isLoading;
  final String? error;

  ReferralState({
    this.code,
    this.totalReferrals = 0,
    this.pendingReferrals = 0,
    this.completedReferrals = 0,
    this.totalEarned = 0,
    this.history = const [],
    this.isLoading = false,
    this.error,
  });

  ReferralState copyWith({
    String? code,
    int? totalReferrals,
    int? pendingReferrals,
    int? completedReferrals,
    int? totalEarned,
    List<ReferralHistoryItem>? history,
    bool? isLoading,
    String? error,
  }) {
    return ReferralState(
      code: code ?? this.code,
      totalReferrals: totalReferrals ?? this.totalReferrals,
      pendingReferrals: pendingReferrals ?? this.pendingReferrals,
      completedReferrals: completedReferrals ?? this.completedReferrals,
      totalEarned: totalEarned ?? this.totalEarned,
      history: history ?? this.history,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Referral Notifier (Riverpod 3.0)
class ReferralNotifier extends Notifier<ReferralState> {
  Dio get _dio => ref.read(dioProvider);

  @override
  ReferralState build() => ReferralState();

  Future<void> fetchReferralData() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _dio.get('/user/referral');
      final data = response.data;

      final historyData = data['referralHistory'] as List<dynamic>? ?? [];
      final history = historyData
          .map((json) => ReferralHistoryItem.fromJson(json))
          .toList();

      state = state.copyWith(
        code: data['code'] as String?,
        totalReferrals: (data['totalReferrals'] as num?)?.toInt() ?? 0,
        pendingReferrals: (data['pendingReferrals'] as num?)?.toInt() ?? 0,
        completedReferrals: (data['completedReferrals'] as num?)?.toInt() ?? 0,
        totalEarned: (data['totalEarned'] as num?)?.toInt() ?? 0,
        history: history,
        isLoading: false,
      );
    } on DioException catch (e) {
      debugPrint('Referral fetch error: ${e.message}');
      state = state.copyWith(
        isLoading: false,
        error: e.message ?? 'রেফারেল ডেটা লোড করতে সমস্যা হয়েছে',
      );
    }
  }

  Future<bool> applyReferralCode(String code) async {
    try {
      final response = await _dio.post('/user/referral', data: {'code': code});

      if (response.data['success'] == true) {
        await fetchReferralData();
        return true;
      }
      return false;
    } on DioException catch (e) {
      debugPrint('Apply referral error: ${e.response?.data}');
      return false;
    }
  }
}

// Provider (Riverpod 3.0)
final referralProvider = NotifierProvider<ReferralNotifier, ReferralState>(
  ReferralNotifier.new,
);
