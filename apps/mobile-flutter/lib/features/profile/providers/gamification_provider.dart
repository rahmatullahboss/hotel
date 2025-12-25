// Gamification Provider - Riverpod 3.0 state management for streaks and badges
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';

// Badge Model
class Badge {
  final String id;
  final String code;
  final String name;
  final String? nameBn;
  final String? description;
  final String? descriptionBn;
  final String category;
  final String? icon;
  final int points;
  final bool isEarned;
  final DateTime? earnedAt;

  Badge({
    required this.id,
    required this.code,
    required this.name,
    this.nameBn,
    this.description,
    this.descriptionBn,
    required this.category,
    this.icon,
    required this.points,
    this.isEarned = false,
    this.earnedAt,
  });

  factory Badge.fromJson(Map<String, dynamic> json) {
    return Badge(
      id: json['id'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      nameBn: json['nameBn'] as String?,
      description: json['description'] as String?,
      descriptionBn: json['descriptionBn'] as String?,
      category: json['category'] as String? ?? 'general',
      icon: json['icon'] as String?,
      points: (json['points'] as num?)?.toInt() ?? 0,
      isEarned: json['isEarned'] as bool? ?? false,
      earnedAt: json['earnedAt'] != null
          ? DateTime.parse(json['earnedAt'] as String)
          : null,
    );
  }

  String get displayName => nameBn ?? name;
  String get displayDescription => descriptionBn ?? description ?? '';
}

// Streak Reward Model
class StreakReward {
  final int days;
  final int reward;
  final String badgeCode;

  StreakReward({
    required this.days,
    required this.reward,
    required this.badgeCode,
  });

  factory StreakReward.fromJson(Map<String, dynamic> json) {
    return StreakReward(
      days: json['days'] as int,
      reward: json['reward'] as int,
      badgeCode: json['badgeCode'] as String,
    );
  }
}

// Streak Data Model
class StreakData {
  final int currentStreak;
  final int longestStreak;
  final int totalLoginDays;
  final String? lastLoginDate;
  final StreakReward? nextReward;
  final int daysUntilReward;
  final List<StreakReward> streakRewards;

  StreakData({
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.totalLoginDays = 0,
    this.lastLoginDate,
    this.nextReward,
    this.daysUntilReward = 0,
    this.streakRewards = const [],
  });

  factory StreakData.fromJson(Map<String, dynamic> json) {
    final rewardsData = json['streakRewards'] as List<dynamic>? ?? [];
    final rewards = rewardsData
        .map((r) => StreakReward.fromJson(r as Map<String, dynamic>))
        .toList();

    return StreakData(
      currentStreak: json['currentStreak'] as int? ?? 0,
      longestStreak: json['longestStreak'] as int? ?? 0,
      totalLoginDays: json['totalLoginDays'] as int? ?? 0,
      lastLoginDate: json['lastLoginDate'] as String?,
      nextReward: json['nextReward'] != null
          ? StreakReward.fromJson(json['nextReward'] as Map<String, dynamic>)
          : null,
      daysUntilReward: json['daysUntilReward'] as int? ?? 0,
      streakRewards: rewards,
    );
  }
}

// Gamification State
class GamificationState {
  final StreakData streak;
  final List<Badge> earnedBadges;
  final List<Badge> allBadges;
  final bool isLoading;
  final String? error;

  GamificationState({
    StreakData? streak,
    this.earnedBadges = const [],
    this.allBadges = const [],
    this.isLoading = false,
    this.error,
  }) : streak = streak ?? StreakData();

  GamificationState copyWith({
    StreakData? streak,
    List<Badge>? earnedBadges,
    List<Badge>? allBadges,
    bool? isLoading,
    String? error,
  }) {
    return GamificationState(
      streak: streak ?? this.streak,
      earnedBadges: earnedBadges ?? this.earnedBadges,
      allBadges: allBadges ?? this.allBadges,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  List<Badge> getBadgesByCategory(String category) {
    return allBadges.where((b) => b.category == category).toList();
  }

  double get progressToNextReward {
    if (streak.nextReward == null) return 1.0;
    final previous =
        streak.streakRewards
            .where((r) => r.days < streak.nextReward!.days)
            .lastOrNull
            ?.days ??
        0;
    final range = streak.nextReward!.days - previous;
    final progress = streak.currentStreak - previous;
    return (progress / range).clamp(0.0, 1.0);
  }
}

// Gamification Notifier (Riverpod 3.0)
class GamificationNotifier extends Notifier<GamificationState> {
  Dio get _dio => ref.read(dioProvider);

  @override
  GamificationState build() => GamificationState();

  Future<void> fetchGamificationData() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _dio.get('/user/gamification');
      final data = response.data;

      final streakData = StreakData.fromJson(
        data['streak'] as Map<String, dynamic>? ?? {},
      );

      final badgesData = data['badges'] as Map<String, dynamic>? ?? {};

      final earnedList = (badgesData['earned'] as List<dynamic>? ?? [])
          .map((j) => Badge.fromJson(j as Map<String, dynamic>))
          .toList();

      final allList = (badgesData['all'] as List<dynamic>? ?? [])
          .map((j) => Badge.fromJson(j as Map<String, dynamic>))
          .toList();

      state = state.copyWith(
        streak: streakData,
        earnedBadges: earnedList,
        allBadges: allList,
        isLoading: false,
      );
    } on DioException catch (e) {
      debugPrint('Gamification fetch error: ${e.message}');
      state = state.copyWith(
        isLoading: false,
        error: e.message ?? 'ডেটা লোড করতে সমস্যা হয়েছে',
      );
    }
  }

  Future<void> recordDailyLogin() async {
    try {
      final response = await _dio.post('/user/gamification');
      final data = response.data;

      if (data['success'] == true && data['isNewDay'] == true) {
        final newStreak = state.streak;
        state = state.copyWith(
          streak: StreakData(
            currentStreak:
                data['currentStreak'] as int? ?? newStreak.currentStreak,
            longestStreak:
                data['longestStreak'] as int? ?? newStreak.longestStreak,
            totalLoginDays: newStreak.totalLoginDays + 1,
            lastLoginDate: DateTime.now().toIso8601String().split('T')[0],
            nextReward: newStreak.nextReward,
            daysUntilReward: newStreak.nextReward != null
                ? newStreak.nextReward!.days -
                      (data['currentStreak'] as int? ?? 0)
                : 0,
            streakRewards: newStreak.streakRewards,
          ),
        );

        if (data['reward'] != null) {
          await fetchGamificationData();
        }
      }
    } on DioException catch (e) {
      debugPrint('Record login error: ${e.message}');
    }
  }
}

// Provider (Riverpod 3.0)
final gamificationProvider =
    NotifierProvider<GamificationNotifier, GamificationState>(
      GamificationNotifier.new,
    );
