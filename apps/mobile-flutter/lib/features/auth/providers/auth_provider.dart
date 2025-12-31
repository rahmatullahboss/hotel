// Auth Provider - Riverpod 3.0 state management for authentication
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/api/api_client.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/notifications/notification_provider.dart';

// Server Client ID from Firebase
const _serverClientId =
    '46787300862-ev3ra7q0t5e1jrr1jal8tas61p33v9hr.apps.googleusercontent.com';

// User model
class User {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final int walletBalance;
  final int loyaltyPoints;
  final int totalBookings;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatarUrl,
    this.walletBalance = 0,
    this.loyaltyPoints = 0,
    this.totalBookings = 0,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      walletBalance: json['walletBalance'] as int? ?? 0,
      loyaltyPoints: json['loyaltyPoints'] as int? ?? 0,
      totalBookings: json['totalBookings'] as int? ?? 0,
    );
  }
}

// Auth state
class AuthState {
  final User? user;
  final bool isLoading;
  final bool isAuthenticated;
  final String? error;

  AuthState({
    this.user,
    this.isLoading = false,
    this.isAuthenticated = false,
    this.error,
  });

  AuthState copyWith({
    User? user,
    bool? isLoading,
    bool? isAuthenticated,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      error: error,
    );
  }
}

// Auth notifier (Riverpod 3.0)
class AuthNotifier extends Notifier<AuthState> {
  late final Dio _dio;
  late final SecureStorageService _storage;
  bool _googleSignInInitialized = false;

  @override
  AuthState build() {
    _dio = ref.watch(dioProvider);
    _storage = ref.watch(secureStorageProvider);
    return AuthState();
  }

  Future<void> _ensureGoogleSignInInitialized() async {
    if (_googleSignInInitialized) return;
    try {
      await GoogleSignIn.instance.initialize(clientId: _serverClientId);
      _googleSignInInitialized = true;
    } catch (e) {
      debugPrint('Google Sign-In init error: $e');
    }
  }

  // Initialize auth state from storage
  Future<void> initialize() async {
    state = state.copyWith(isLoading: true);

    try {
      final token = await _storage.getToken();
      if (token != null) {
        await _fetchCurrentUser();
      }
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  // Login with email/phone and password
  Future<bool> loginWithCredentials(String identifier, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _dio.post(
        '/auth/mobile-login',
        data: {'email': identifier, 'password': password},
      );

      final token = response.data['token'] as String;
      await _storage.setToken(token);

      await _fetchCurrentUser();
      // Register FCM token after successful login
      await _registerFcmToken();
      return true;
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'লগইন ব্যর্থ হয়েছে',
      );
      return false;
    }
  }

  // Register with email, phone, and password
  Future<bool> registerWithCredentials({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _dio.post(
        '/auth/mobile-register',
        data: {
          'name': name,
          'email': email,
          'phone': phone,
          'password': password,
        },
      );

      final token = response.data['token'] as String;
      await _storage.setToken(token);

      await _fetchCurrentUser();
      // Register FCM token after successful registration
      await _registerFcmToken();
      return true;
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['error'] ?? 'নিবন্ধন ব্যর্থ হয়েছে',
      );
      return false;
    }
  }

  // Login with Google (v7 API)
  Future<bool> loginWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _ensureGoogleSignInInitialized();

      // Authenticate with Google Sign-In v7
      final account = await GoogleSignIn.instance.authenticate();

      // Get authentication credentials
      final auth = account.authentication;
      final idToken = auth.idToken;

      if (idToken == null) {
        state = state.copyWith(
          isLoading: false,
          error: 'Google authentication failed - no ID token',
        );
        return false;
      }

      // Send to backend
      final response = await _dio.post(
        '/mobile/google-auth',
        data: {'idToken': idToken},
      );

      final token = response.data['token'] as String;
      await _storage.setToken(token);

      await _fetchCurrentUser();
      // Register FCM token after successful Google login
      await _registerFcmToken();
      return true;
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'গুগল লগইন ব্যর্থ হয়েছে',
      );
      return false;
    } catch (e) {
      debugPrint('Google login error: $e');
      // Check if user cancelled
      if (e.toString().contains('canceled') ||
          e.toString().contains('cancelled')) {
        state = state.copyWith(isLoading: false);
        return false;
      }
      state = state.copyWith(
        isLoading: false,
        error: 'গুগল লগইন ব্যর্থ হয়েছে',
      );
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    // Unregister FCM token before logout
    await _unregisterFcmToken();
    await _storage.deleteToken();
    try {
      await GoogleSignIn.instance.signOut();
    } catch (e) {
      debugPrint('Google sign out error: $e');
    }
    state = AuthState();
  }

  // Register FCM token with server
  Future<void> _registerFcmToken() async {
    try {
      final notifier = ref.read(notificationProvider.notifier);
      await notifier.registerTokenWithServer();
    } catch (e) {
      debugPrint('FCM registration error: $e');
    }
  }

  // Unregister FCM token from server
  Future<void> _unregisterFcmToken() async {
    try {
      final notifier = ref.read(notificationProvider.notifier);
      await notifier.unregisterTokenFromServer();
    } catch (e) {
      debugPrint('FCM unregistration error: $e');
    }
  }

  // Fetch current user
  Future<void> _fetchCurrentUser() async {
    try {
      final response = await _dio.get('/user/profile');
      final user = User.fromJson(response.data);

      state = state.copyWith(
        user: user,
        isAuthenticated: true,
        isLoading: false,
      );

      _recordDailyLogin();
    } on DioException catch (_) {
      await _storage.deleteToken();
      state = state.copyWith(isLoading: false, isAuthenticated: false);
    }
  }

  // Record daily login for gamification
  Future<void> _recordDailyLogin() async {
    try {
      await _dio.post('/user/gamification');
    } catch (_) {
      // Silent fail
    }
  }

  /// Update user profile (name, phone)
  Future<bool> updateProfile({
    required String name,
    String? phone,
    String? avatarUrl,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _dio.put(
        '/user/profile',
        data: {
          'name': name,
          if (phone != null) 'phone': phone,
          if (avatarUrl != null) 'avatarUrl': avatarUrl,
        },
      );

      // Update local user state with new data
      final updatedUser = User.fromJson(response.data);
      state = state.copyWith(user: updatedUser, isLoading: false);
      return true;
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'প্রোফাইল আপডেট ব্যর্থ হয়েছে',
      );
      return false;
    }
  }
}

// Provider (Riverpod 3.0)
final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);

// Convenience providers
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});
