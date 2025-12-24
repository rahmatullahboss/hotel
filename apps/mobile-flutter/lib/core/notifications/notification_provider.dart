// Push Notification Provider
// Note: Requires google-services.json (Android) and GoogleService-Info.plist (iOS)

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../../core/storage/secure_storage.dart';

// Background message handler - must be top-level function
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Handling background message: ${message.messageId}');
}

// Notification state
class NotificationState {
  final bool isInitialized;
  final String? fcmToken;
  final bool hasPermission;
  final RemoteMessage? lastMessage;
  final String? error;

  NotificationState({
    this.isInitialized = false,
    this.fcmToken,
    this.hasPermission = false,
    this.lastMessage,
    this.error,
  });

  NotificationState copyWith({
    bool? isInitialized,
    String? fcmToken,
    bool? hasPermission,
    RemoteMessage? lastMessage,
    String? error,
  }) {
    return NotificationState(
      isInitialized: isInitialized ?? this.isInitialized,
      fcmToken: fcmToken ?? this.fcmToken,
      hasPermission: hasPermission ?? this.hasPermission,
      lastMessage: lastMessage,
      error: error,
    );
  }
}

// Notification notifier
class NotificationNotifier extends StateNotifier<NotificationState> {
  final SecureStorageService _storage;
  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  StreamSubscription<RemoteMessage>? _openedAppSubscription;

  NotificationNotifier(this._storage) : super(NotificationState());

  /// Initialize Firebase Messaging
  Future<void> initialize() async {
    try {
      // Initialize Firebase (should be done in main.dart first)
      // await Firebase.initializeApp();

      // Set background handler
      FirebaseMessaging.onBackgroundMessage(
        _firebaseMessagingBackgroundHandler,
      );

      // Request permission
      final settings = await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      final hasPermission =
          settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional;

      if (hasPermission) {
        // Get FCM token
        final token = await FirebaseMessaging.instance.getToken();

        if (token != null) {
          // Save token for later use
          await _storage.write('fcm_token', token);

          state = state.copyWith(
            isInitialized: true,
            fcmToken: token,
            hasPermission: true,
          );
        }

        // Listen for token refresh
        FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
          await _storage.write('fcm_token', newToken);
          state = state.copyWith(fcmToken: newToken);
        });

        // Handle foreground messages
        _foregroundSubscription = FirebaseMessaging.onMessage.listen((message) {
          debugPrint('Foreground message: ${message.notification?.title}');
          state = state.copyWith(lastMessage: message);
          _showLocalNotification(message);
        });

        // Handle when app is opened via notification
        _openedAppSubscription = FirebaseMessaging.onMessageOpenedApp.listen((
          message,
        ) {
          debugPrint('Opened app from notification: ${message.data}');
          state = state.copyWith(lastMessage: message);
          // TODO: Navigate based on message data
        });

        // Check if app was opened from a terminated state via notification
        final initialMessage = await FirebaseMessaging.instance
            .getInitialMessage();
        if (initialMessage != null) {
          state = state.copyWith(lastMessage: initialMessage);
          // TODO: Handle navigation
        }
      } else {
        state = state.copyWith(isInitialized: true, hasPermission: false);
      }
    } catch (e) {
      debugPrint('Notification initialization error: $e');
      state = state.copyWith(isInitialized: true, error: e.toString());
    }
  }

  /// Show local notification for foreground messages
  void _showLocalNotification(RemoteMessage message) {
    // This would typically use flutter_local_notifications
    // For now, we just update state and let UI handle it
    debugPrint('Notification: ${message.notification?.title}');
  }

  /// Send FCM token to backend for targeted push notifications
  Future<void> sendTokenToBackend(String backendToken) async {
    if (state.fcmToken == null) return;

    // TODO: Send FCM token to your backend
    // dio.post('/notifications/register', data: {
    //   'fcmToken': state.fcmToken,
    // });
  }

  /// Request permission again if denied
  Future<bool> requestPermission() async {
    final settings = await FirebaseMessaging.instance.requestPermission();
    final hasPermission =
        settings.authorizationStatus == AuthorizationStatus.authorized;
    state = state.copyWith(hasPermission: hasPermission);
    return hasPermission;
  }

  @override
  void dispose() {
    _foregroundSubscription?.cancel();
    _openedAppSubscription?.cancel();
    super.dispose();
  }
}

// Provider
final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
      final storage = ref.watch(secureStorageProvider);
      return NotificationNotifier(storage);
    });

// Convenience provider for FCM token
final fcmTokenProvider = Provider<String?>((ref) {
  return ref.watch(notificationProvider).fcmToken;
});
