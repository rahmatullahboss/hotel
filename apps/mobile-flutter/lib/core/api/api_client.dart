// API Client with Dio - Zinu Rooms
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/secure_storage.dart';

// API Configuration
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://zinurooms.vercel.app/api',
);

// Dio provider
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'x-client-platform': 'mobile-flutter',
      },
    ),
  );

  // Add interceptors
  dio.interceptors.add(AuthInterceptor(ref));
  dio.interceptors.add(
    LogInterceptor(requestBody: true, responseBody: true, error: true),
  );

  return dio;
});

// Auth Interceptor - Adds JWT token to requests
class AuthInterceptor extends Interceptor {
  final Ref ref;

  AuthInterceptor(this.ref);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Get token from secure storage
    final storage = ref.read(secureStorageProvider);
    final token = await storage.getToken();

    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Handle 401 - Token expired
    if (err.response?.statusCode == 401) {
      // Clear token and redirect to login
      final storage = ref.read(secureStorageProvider);
      await storage.deleteToken();
      // TODO: Navigate to login screen
    }

    handler.next(err);
  }
}

// API Response wrapper
class ApiResponse<T> {
  final T? data;
  final String? error;
  final bool isSuccess;

  ApiResponse({this.data, this.error}) : isSuccess = error == null;

  factory ApiResponse.success(T data) => ApiResponse(data: data);
  factory ApiResponse.failure(String error) => ApiResponse(error: error);
}

// API Exception
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  ApiException({required this.message, this.statusCode, this.data});

  @override
  String toString() => message;

  factory ApiException.fromDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          message: 'Connection timed out. Please check your internet.',
          statusCode: null,
        );
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final data = error.response?.data;
        String message = 'Something went wrong';

        if (data is Map) {
          message = data['error'] ?? data['message'] ?? message;
        }

        return ApiException(
          message: message,
          statusCode: statusCode,
          data: data,
        );
      case DioExceptionType.cancel:
        return ApiException(message: 'Request cancelled');
      case DioExceptionType.connectionError:
        return ApiException(
          message: 'No internet connection. Please check your network.',
        );
      default:
        return ApiException(message: error.message ?? 'Unknown error occurred');
    }
  }
}
