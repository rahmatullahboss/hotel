// Auth Provider - Riverpod state management for authentication
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/api/api_client.dart';
import '../../../core/storage/secure_storage.dart';

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

// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final Dio _dio;
  final SecureStorageService _storage;
  final GoogleSignIn _googleSignIn;

  AuthNotifier(this._dio, this._storage)
    : _googleSignIn = GoogleSignIn(scopes: ['email', 'profile']),
      super(AuthState());

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
      return true;
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'লগইন ব্যর্থ হয়েছে',
      );
      return false;
    }
  }

  // Login with Google
  Future<bool> loginWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        state = state.copyWith(isLoading: false);
        return false; // User cancelled
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null) {
        state = state.copyWith(
          isLoading: false,
          error: 'Google authentication failed',
        );
        return false;
      }

      // Send ID token to backend
      final response = await _dio.post(
        '/mobile/google-auth',
        data: {'idToken': idToken},
      );

      final token = response.data['token'] as String;
      await _storage.setToken(token);

      await _fetchCurrentUser();
      return true;
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'গুগল লগইন ব্যর্থ হয়েছে',
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'গুগল লগইন ব্যর্থ হয়েছে',
      );
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    await _storage.deleteToken();
    await _googleSignIn.signOut();
    state = AuthState();
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
    } on DioException catch (_) {
      await _storage.deleteToken();
      state = state.copyWith(isLoading: false, isAuthenticated: false);
    }
  }
}

// Providers
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final dio = ref.watch(dioProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthNotifier(dio, storage);
});

// Convenience providers
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});
