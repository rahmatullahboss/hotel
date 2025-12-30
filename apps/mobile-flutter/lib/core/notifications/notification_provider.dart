// Push Notification Provider (Riverpod 3.0)
// Uses Firebase Cloud Messaging (FCM) for push notifications

import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import '../api/api_client.dart';

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
  final bool isRegisteredWithServer;

  NotificationState({
    this.isInitialized = false,
    this.fcmToken,
    this.hasPermission = false,
    this.lastMessage,
    this.error,
    this.isRegisteredWithServer = false,
  });

  NotificationState copyWith({
    bool? isInitialized,
    String? fcmToken,
    bool? hasPermission,
    RemoteMessage? lastMessage,
    String? error,
    bool? isRegisteredWithServer,
  }) {
    return NotificationState(
      isInitialized: isInitialized ?? this.isInitialized,
      fcmToken: fcmToken ?? this.fcmToken,
      hasPermission: hasPermission ?? this.hasPermission,
      lastMessage: lastMessage,
      error: error,
      isRegisteredWithServer:
          isRegisteredWithServer ?? this.isRegisteredWithServer,
    );
  }
}

// Notification notifier (Riverpod 3.0)
class NotificationNotifier extends Notifier<NotificationState> {
  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  StreamSubscription<RemoteMessage>? _openedAppSubscription;

  SecureStorageService get _storage => ref.read(secureStorageProvider);
  Dio get _dio => ref.read(dioProvider);

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
          // Save token locally
          await _storage.write('fcm_token', token);

          state = state.copyWith(
            isInitialized: true,
            fcmToken: token,
            hasPermission: true,
          );

          debugPrint('[FCM] Token obtained: ${token.substring(0, 20)}...');
        }

        // Listen for token refresh
        FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
          debugPrint('[FCM] Token refreshed');
          await _storage.write('fcm_token', newToken);
          state = state.copyWith(
            fcmToken: newToken,
            isRegisteredWithServer: false,
          );
          // Re-register with server when token refreshes
          await registerTokenWithServer();
        });

        // Handle foreground messages
        _foregroundSubscription = FirebaseMessaging.onMessage.listen((message) {
          debugPrint(
            '[FCM] Foreground message: ${message.notification?.title}',
          );
          state = state.copyWith(lastMessage: message);
          _showLocalNotification(message);
        });

        // Handle when app is opened via notification
        _openedAppSubscription = FirebaseMessaging.onMessageOpenedApp.listen((
          message,
        ) {
          debugPrint('[FCM] Opened app from notification: ${message.data}');
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
      debugPrint('[FCM] Initialization error: $e');
      state = state.copyWith(isInitialized: true, error: e.toString());
    }
  }

  /// Show local notification for foreground messages
  void _showLocalNotification(RemoteMessage message) {
    debugPrint('[FCM] Notification: ${message.notification?.title}');
    // TODO: Use flutter_local_notifications for better foreground notification display
  }

  /// Register FCM token with backend server
  Future<bool> registerTokenWithServer() async {
    final token = state.fcmToken;
    if (token == null) {
      debugPrint('[FCM] No token to register');
      return false;
    }

    // Check if user is logged in
    final authToken = await _storage.getToken();
    if (authToken == null) {
      debugPrint('[FCM] User not logged in, skipping registration');
      return false;
    }

    try {
      final platform = Platform.isIOS ? 'ios' : 'android';

      final response = await _dio.post(
        '/user/push-token',
        data: {'fcmToken': token, 'platform': platform},
      );

      if (response.statusCode == 200) {
        state = state.copyWith(isRegisteredWithServer: true);
        debugPrint('[FCM] Token registered with server successfully');
        return true;
      } else {
        debugPrint('[FCM] Failed to register token: ${response.data}');
        return false;
      }
    } catch (e) {
      debugPrint('[FCM] Error registering token with server: $e');
      return false;
    }
  }

  /// Unregister FCM token from backend server (call on logout)
  Future<void> unregisterTokenFromServer() async {
    final token = state.fcmToken;
    if (token == null) return;

    try {
      await _dio.delete('/user/push-token', data: {'fcmToken': token});
      state = state.copyWith(isRegisteredWithServer: false);
      debugPrint('[FCM] Token unregistered from server');
    } catch (e) {
      debugPrint('[FCM] Error unregistering token: $e');
    }
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

// Provider to check if registered with server
final isRegisteredWithServerProvider = Provider<bool>((ref) {
  return ref.watch(notificationProvider).isRegisteredWithServer;
});
