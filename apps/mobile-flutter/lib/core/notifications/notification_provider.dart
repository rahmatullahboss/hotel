// Push Notification Provider (Riverpod 3.0)
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

// Notification notifier (Riverpod 3.0)
class NotificationNotifier extends Notifier<NotificationState> {
  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  StreamSubscription<RemoteMessage>? _openedAppSubscription;

  SecureStorageService get _storage => ref.read(secureStorageProvider);

  @override
  NotificationState build() {
    ref.onDispose(() {
      _foregroundSubscription?.cancel();
      _openedAppSubscription?.cancel();
    });
    return NotificationState();
  }

  /// Initialize Firebase Messaging
  Future<void> initialize() async {
    try {
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
        });

        // Check if app was opened from a terminated state via notification
        final initialMessage = await FirebaseMessaging.instance
            .getInitialMessage();
        if (initialMessage != null) {
          state = state.copyWith(lastMessage: initialMessage);
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
    debugPrint('Notification: ${message.notification?.title}');
  }

  /// Send FCM token to backend for targeted push notifications
  Future<void> sendTokenToBackend(String backendToken) async {
    if (state.fcmToken == null) return;
  }

  /// Request permission again if denied
  Future<bool> requestPermission() async {
    final settings = await FirebaseMessaging.instance.requestPermission();
    final hasPermission =
        settings.authorizationStatus == AuthorizationStatus.authorized;
    state = state.copyWith(hasPermission: hasPermission);
    return hasPermission;
  }
}

// Provider (Riverpod 3.0)
final notificationProvider =
    NotifierProvider<NotificationNotifier, NotificationState>(
      NotificationNotifier.new,
    );

// Convenience provider for FCM token
final fcmTokenProvider = Provider<String?>((ref) {
  return ref.watch(notificationProvider).fcmToken;
});
