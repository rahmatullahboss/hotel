// App Router - go_router configuration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/search/presentation/search_screen.dart';
import '../../features/bookings/presentation/bookings_screen.dart';
import '../../features/bookings/presentation/booking_details_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/profile/presentation/wallet_screen.dart';
import '../../features/profile/presentation/referral_screen.dart';
import '../../features/profile/presentation/help_screen.dart';
import '../../features/profile/presentation/achievements_screen.dart';
import '../../features/hotel/presentation/hotel_details_screen.dart';
import '../../features/hotel/presentation/all_hotels_screen.dart';
import '../../features/hotel/presentation/room_details_screen.dart';
import '../../features/booking_flow/presentation/booking_flow_screen.dart';
import '../../features/booking_flow/presentation/qr_scanner_screen.dart';
import '../../shared/widgets/main_shell.dart';
import '../../features/profile/presentation/edit_profile_screen.dart';
import '../../features/profile/presentation/notifications_screen.dart';
import '../storage/secure_storage.dart';

// Route names
class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String home = '/home';
  static const String search = '/search';
  static const String bookings = '/bookings';
  static const String bookingDetails = '/bookings/:id';
  static const String profile = '/profile';
  static const String hotels = '/hotels';
  static const String hotelDetails = '/hotel/:id';
  static const String roomDetails = '/room/:id';
  static const String booking = '/book/:roomId';
  static const String wallet = '/wallet';
  static const String referral = '/referral';
  static const String achievements = '/achievements';
  static const String qrScanner = '/qr-scanner';
  static const String help = '/help';
  static const String editProfile = '/edit-profile';
  static const String notifications = '/notifications';
  static const String saved = '/saved';
}

// Router provider
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.home,
    debugLogDiagnostics: true,
    redirect: (context, state) async {
      final storage = ref.read(secureStorageProvider);
      final isLoggedIn = await storage.isLoggedIn();

      // Protected routes that require auth
      final protectedRoutes = [
        AppRoutes.bookings,
        AppRoutes.wallet,
        AppRoutes.referral,
        AppRoutes.achievements,
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
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: HomeScreen()),
          ),
          GoRoute(
            path: AppRoutes.search,
            name: 'search',
            pageBuilder: (context, state) {
              final city = state.uri.queryParameters['city'];
              final filter = state.uri.queryParameters['filter'];
              return NoTransitionPage(
                child: SearchScreen(initialCity: city, initialFilter: filter),
              );
            },
          ),
          GoRoute(
            path: AppRoutes.bookings,
            name: 'bookings',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: BookingsScreen()),
          ),
          GoRoute(
            path: AppRoutes.profile,
            name: 'profile',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ProfileScreen()),
          ),
        ],
      ),

      // Auth routes
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),

      // All hotels
      GoRoute(
        path: AppRoutes.hotels,
        name: 'hotels',
        builder: (context, state) {
          final offer = state.uri.queryParameters['offer'];
          return AllHotelsScreen(offer: offer);
        },
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

      // Room details
      GoRoute(
        path: AppRoutes.roomDetails,
        name: 'roomDetails',
        builder: (context, state) {
          final roomId = state.pathParameters['id']!;
          return RoomDetailsScreen(roomId: roomId);
        },
      ),

      // Booking flow
      GoRoute(
        path: AppRoutes.booking,
        name: 'booking',
        builder: (context, state) {
          final roomId = state.pathParameters['roomId']!;
          final hotelId = state.uri.queryParameters['hotel'];
          return BookingFlowScreen(roomId: roomId, hotelId: hotelId);
        },
      ),

      // Booking details
      GoRoute(
        path: AppRoutes.bookingDetails,
        name: 'bookingDetails',
        builder: (context, state) {
          final bookingId = state.pathParameters['id']!;
          return BookingDetailsScreen(bookingId: bookingId);
        },
      ),

      // Wallet
      GoRoute(
        path: AppRoutes.wallet,
        name: 'wallet',
        builder: (context, state) => const WalletScreen(),
      ),

      // Referral
      GoRoute(
        path: AppRoutes.referral,
        name: 'referral',
        builder: (context, state) => const ReferralScreen(),
      ),

      // Achievements
      GoRoute(
        path: AppRoutes.achievements,
        name: 'achievements',
        builder: (context, state) => const AchievementsScreen(),
      ),

      // QR Scanner
      GoRoute(
        path: AppRoutes.qrScanner,
        name: 'qrScanner',
        builder: (context, state) => const QrScannerScreen(),
      ),

      // Help
      GoRoute(
        path: AppRoutes.help,
        name: 'help',
        builder: (context, state) => const HelpScreen(),
      ),

      // Edit Profile
      GoRoute(
        path: AppRoutes.editProfile,
        name: 'editProfile',
        builder: (context, state) => const EditProfileScreen(),
      ),

      // Notifications
      GoRoute(
        path: AppRoutes.notifications,
        name: 'notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),

      // Saved Hotels (placeholder - redirects to search with saved filter)
      GoRoute(
        path: AppRoutes.saved,
        name: 'saved',
        redirect: (context, state) => '/search?filter=saved',
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found: ${state.matchedLocation}')),
    ),
  );
});
