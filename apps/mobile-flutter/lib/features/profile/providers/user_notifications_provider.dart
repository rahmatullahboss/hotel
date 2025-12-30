// User Notifications Provider - In-App Notification Management
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/storage/secure_storage.dart';

// Notification model
class UserNotification {
  final String id;
  final String title;
  final String message;
  final String type; // 'booking', 'promo', 'system'
  final DateTime createdAt;
  final bool isRead;

  UserNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.createdAt,
    this.isRead = false,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'message': message,
    'type': type,
    'createdAt': createdAt.toIso8601String(),
    'isRead': isRead,
  };

  factory UserNotification.fromJson(Map<String, dynamic> json) {
    return UserNotification(
      id: json['id'],
      title: json['title'],
      message: json['message'],
      type: json['type'],
      createdAt: DateTime.parse(json['createdAt']),
      isRead: json['isRead'] ?? false,
    );
  }

  UserNotification copyWith({bool? isRead}) {
    return UserNotification(
      id: id,
      title: title,
      message: message,
      type: type,
      createdAt: createdAt,
      isRead: isRead ?? this.isRead,
    );
  }
}

// Notification state
class UserNotificationsState {
  final List<UserNotification> notifications;
  final bool isLoading;
  final String? error;

  UserNotificationsState({
    this.notifications = const [],
    this.isLoading = false,
    this.error,
  });

  int get unreadCount => notifications.where((n) => !n.isRead).length;

  UserNotificationsState copyWith({
    List<UserNotification>? notifications,
    bool? isLoading,
    String? error,
  }) {
    return UserNotificationsState(
      notifications: notifications ?? this.notifications,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Notification notifier
class UserNotificationsNotifier extends Notifier<UserNotificationsState> {
  static const _storageKey = 'user_notifications';

  SecureStorageService get _storage => ref.read(secureStorageProvider);

  @override
  UserNotificationsState build() {
    _loadNotifications();
    return UserNotificationsState(isLoading: true);
  }

  Future<void> _loadNotifications() async {
    try {
      final data = await _storage.read(_storageKey);
      if (data != null) {
        final List<dynamic> jsonList = jsonDecode(data);
        final notifications = jsonList
            .map((json) => UserNotification.fromJson(json))
            .toList();
        notifications.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        state = state.copyWith(notifications: notifications, isLoading: false);
      } else {
        state = state.copyWith(notifications: [], isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> _saveNotifications() async {
    final jsonList = state.notifications.map((n) => n.toJson()).toList();
    await _storage.write(_storageKey, jsonEncode(jsonList));
  }

  // Add a new notification
  Future<void> addNotification({
    required String title,
    required String message,
    String type = 'system',
  }) async {
    final notification = UserNotification(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      message: message,
      type: type,
      createdAt: DateTime.now(),
    );

    state = state.copyWith(
      notifications: [notification, ...state.notifications],
    );
    await _saveNotifications();
  }

  // Mark as read
  Future<void> markAsRead(String id) async {
    final updated = state.notifications.map((n) {
      if (n.id == id) {
        return n.copyWith(isRead: true);
      }
      return n;
    }).toList();

    state = state.copyWith(notifications: updated);
    await _saveNotifications();
  }

  // Mark all as read
  Future<void> markAllAsRead() async {
    final updated = state.notifications
        .map((n) => n.copyWith(isRead: true))
        .toList();
    state = state.copyWith(notifications: updated);
    await _saveNotifications();
  }

  // Delete notification
  Future<void> deleteNotification(String id) async {
    final updated = state.notifications.where((n) => n.id != id).toList();
    state = state.copyWith(notifications: updated);
    await _saveNotifications();
  }

  // Clear all
  Future<void> clearAll() async {
    state = state.copyWith(notifications: []);
    await _storage.write(_storageKey, '[]');
  }

  // Refresh
  Future<void> refresh() async {
    state = state.copyWith(isLoading: true);
    await _loadNotifications();
  }
}

// Providers
final userNotificationsProvider =
    NotifierProvider<UserNotificationsNotifier, UserNotificationsState>(
      UserNotificationsNotifier.new,
    );

final unreadNotificationCountProvider = Provider<int>((ref) {
  return ref.watch(userNotificationsProvider).unreadCount;
});
