// Main Entry Point - Zinu Rooms Flutter App
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:zinu_rooms/l10n/generated/app_localizations.dart';

import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/router/app_router.dart';
import 'core/l10n/locale_provider.dart';
import 'core/notifications/notification_provider.dart';
import 'features/auth/providers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase (Safely)
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase initialization failed (Check config files): $e');
  }

  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const ProviderScope(child: ZinuRoomsApp()));
}

class ZinuRoomsApp extends ConsumerStatefulWidget {
  const ZinuRoomsApp({super.key});

  @override
  ConsumerState<ZinuRoomsApp> createState() => _ZinuRoomsAppState();
}

class _ZinuRoomsAppState extends ConsumerState<ZinuRoomsApp> {
  @override
  void initState() {
    super.initState();
    // Initialize auth state from storage (restore session)
    Future.microtask(() {
      ref.read(authProvider.notifier).initialize();
    });
    // Initialize notifications
    Future.microtask(() {
      ref.read(notificationProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final themeState = ref.watch(themeProvider);
    final localeState = ref.watch(localeProvider);
    debugPrint(
      'Main: Building app with locale: ${localeState.locale.languageCode}',
    );

    return MaterialApp.router(
      title: 'Zinu Rooms',
      debugShowCheckedModeBanner: false,

      // Theme
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeState.themeMode,

      // Router
      routerConfig: router,

      // Localization
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      locale: localeState.locale,

      // Builder for global error handling and overlays
      builder: (context, child) {
        // Apply text scaling limits to prevent text overflow
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: TextScaler.linear(
              MediaQuery.of(context).textScaler.scale(1.0).clamp(0.8, 1.2),
            ),
          ),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
