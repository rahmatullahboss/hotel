// App Router - go_router configuration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/search/presentation/search_screen.dart';
import '../../features/bookings/presentation/bookings_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/hotel/presentation/hotel_details_screen.dart';
import '../../shared/widgets/main_shell.dart';
import '../storage/secure_storage.dart';

// Route names
class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String home = '/home';
  static const String search = '/search';
  static const String bookings = '/bookings';
  static const String profile = '/profile';
  static const String hotelDetails = '/hotel/:id';
  static const String roomDetails = '/room/:id';
  static const String booking = '/book/:roomId';
  static const String wallet = '/wallet';
  static const String referral = '/referral';
  static const String qrScanner = '/qr-scanner';
  static const String help = '/help';
}

// Router provider
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.home,
    debugLogDiagnostics: true,
    redirect: (context, state) async {
      final storage = ref.read(secureStorageProvider);
      final isLoggedIn = await storage.isLoggedIn();
      final isLoggingIn = state.matchedLocation == AppRoutes.login;

      // Protected routes that require auth
      final protectedRoutes = [
        AppRoutes.bookings,
        AppRoutes.profile,
        AppRoutes.wallet,
        AppRoutes.referral,
      ];

      final isProtectedRoute = protectedRoutes.any(
        (route) => state.matchedLocation.startsWith(route),
      );

      if (isProtectedRoute && !isLoggedIn) {
        return AppRoutes.login;
      }

      return null;
    },
    routes: [
      // Main shell with bottom navigation
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            name: 'home',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.search,
            name: 'search',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: SearchScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.bookings,
            name: 'bookings',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: BookingsScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.profile,
            name: 'profile',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ProfileScreen(),
            ),
          ),
        ],
      ),

      // Auth routes
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),

      // Hotel details
      GoRoute(
        path: AppRoutes.hotelDetails,
        name: 'hotelDetails',
        builder: (context, state) {
          final hotelId = state.pathParameters['id']!;
          return HotelDetailsScreen(hotelId: hotelId);
        },
      ),

      // TODO: Add more routes as screens are implemented
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.matchedLocation}'),
      ),
    ),
  );
});
