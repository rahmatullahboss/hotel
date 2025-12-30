// Splash Screen
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/storage/secure_storage.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _progressAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );

    _progressAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));

    _controller.forward().whenComplete(() async {
      if (mounted) {
        // Check if user has already seen onboarding
        final storage = ref.read(secureStorageProvider);
        final hasSeenOnboarding = await storage.hasSeenOnboarding();

        if (hasSeenOnboarding) {
          context.go('/home');
        } else {
          context.go('/onboarding');
        }
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background Image
          Image.network(
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDNnrUXSAPdsMEtF-FfFy9eecmLacvuG5LYQ4WEqJ-I2OcwARVavWJbfdON4Rl0AWjBrsUST2_vxljkn0IFJGpn2Oalm0HQiBK5AdMYxfwHCVKSDLgnIEf9b-MtU1y4xwQIIj4wLq9yzJJ4wsVeErFigQ5gYzHttzw0n_85r1mE_zEpOeDxF2FyKICgCJTtLOF32HqgIVaI7EjbAxcLFP1IspWhcNoj25LG2V07H1TuUzdQx8vHQSSnwSyo2n-rNRQBZAh9mNb3THg',
            fit: BoxFit.cover,
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return Container(color: AppColors.primary);
            },
            errorBuilder: (context, error, stackTrace) =>
                Container(color: AppColors.primary),
          ),

          // Primary Gradient Overlay (mix-blend-multiply simulation)
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.primary.withValues(alpha: 0.8),
                  AppColors.primary.withValues(alpha: 0.95),
                ],
              ),
            ),
          ),

          // Black Overlay
          Container(color: Colors.black.withValues(alpha: 0.2)),

          // Content
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),

              // Logo
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.5),
                      blurRadius: 24,
                      offset: const Offset(0, 10),
                    ),
                  ],
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.2),
                    width: 4,
                  ),
                ),
                child: const Center(
                  child: Icon(
                    Icons.king_bed,
                    size: 48,
                    color: AppColors.primary,
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // Brand Name
              Text(
                'ZinuRooms', // Using app name instead of generic "Staycation"
                style: AppTypography.h1.copyWith(
                  color: Colors.white,
                  fontSize: 42,
                  fontWeight: FontWeight.w800,
                  height: 1.1,
                  shadows: [
                    Shadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 2,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 12),

              // Tagline
              Text(
                'Discover luxury, book comfort.',
                style: AppTypography.bodyLarge.copyWith(
                  color: Colors.white.withValues(alpha: 0.9),
                  fontWeight: FontWeight.w500,
                  letterSpacing: 0.5,
                ),
                textAlign: TextAlign.center,
              ),

              const Spacer(),

              // Loading Bar
              SizedBox(
                width: 160,
                child: AnimatedBuilder(
                  animation: _progressAnimation,
                  builder: (context, child) {
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(999),
                      child: Container(
                        height: 4,
                        color: Colors.white.withValues(alpha: 0.2),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor:
                              0.3 +
                              (0.7 *
                                  _progressAnimation
                                      .value), // Start at ~30% and fill
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.white.withValues(alpha: 0.5),
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 16),

              // Loading Text
              Text(
                'LOADING EXPERIENCE',
                style: AppTypography.labelSmall.copyWith(
                  color: Colors.white.withValues(alpha: 0.6),
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),

              const SizedBox(height: 48),
            ],
          ),
        ],
      ),
    );
  }
}
