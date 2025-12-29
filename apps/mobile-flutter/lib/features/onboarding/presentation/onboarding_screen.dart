import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/router/app_router.dart';

class OnboardingPageData {
  final String title;
  final String description;
  final String imageUrl;

  OnboardingPageData({
    required this.title,
    required this.description,
    required this.imageUrl,
  });
}

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingPageData> _pages = [
    OnboardingPageData(
      title: "Discover Amazing Hotels",
      description: "Find the perfect stay for your next vacation in seconds.",
      // Luxury Pool View
      imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1920&auto=format&fit=crop",
    ),
    OnboardingPageData(
      title: "Best Deals & Prices",
      description: "Unlock exclusive offers and save up to 40% on top-rated hotels around the world.",
      // Relaxing Resort
      imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1920&auto=format&fit=crop",
    ),
    OnboardingPageData(
      title: "Easy Booking",
      description: "Quickly browse, select, and secure your perfect stay without the hassle. Your next trip is just a tap away.",
      // Scenic Traveler
      imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1920&auto=format&fit=crop",
    ),
    OnboardingPageData(
      title: "24/7 Support",
      description: "Our dedicated team is here to help you anytime, anywhere. Peace of mind for every stay.",
      // Hospitality Staff
      imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1920&auto=format&fit=crop",
    ),
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _precacheImages();
  }

  void _precacheImages() {
    for (final page in _pages) {
      precacheImage(CachedNetworkImageProvider(page.imageUrl), context);
    }
  }

  void _onNext() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _finishOnboarding();
    }
  }

  void _onBack() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _finishOnboarding() {
    context.go(AppRoutes.home);
  }

  @override
  Widget build(BuildContext context) {
    // Project Brand Color (Zinu Red)
    const primaryColor = Color(0xFFE63946); 
    // const primaryColor = Color(0xFFA3B12D); // The lime color from screenshot if requested specifically, but sticking to brand.

    return Scaffold(
      backgroundColor: Colors.black, // Dark background for gaps
      body: Stack(
        children: [
          // Content Slides
          PageView.builder(
            controller: _pageController,
            itemCount: _pages.length,
            onPageChanged: (index) {
              setState(() {
                _currentPage = index;
              });
            },
            itemBuilder: (context, index) {
              final page = _pages[index];
              return Stack(
                fit: StackFit.expand,
                children: [
                  // Full Screen Image
                  CachedNetworkImage(
                    imageUrl: page.imageUrl,
                    fit: BoxFit.cover,
                    memCacheWidth: 1000, // Memory optimization
                    placeholder: (context, url) => Container(
                      color: Colors.grey[900],
                      child: const Center(child: CircularProgressIndicator()),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.grey[900],
                      child: const Icon(Icons.error, color: Colors.white),
                    ),
                  ),

                  // Gradient Overlay (Scrym)
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.0),
                          Colors.black.withOpacity(0.5),
                          Colors.black.withOpacity(0.8),
                          Colors.black,
                        ],
                        stops: const [0.0, 0.4, 0.6, 0.8, 1.0],
                      ),
                    ),
                  ),

                  // Text Content
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Spacer(), // Push content to bottom
                          
                          // Page Indicator Pill (e.g., 1/4)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2), // Glass effect
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: Text(
                              '${index + 1}/${_pages.length}',
                              style: GoogleFonts.plusJakartaSans(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          
                          const SizedBox(height: 20),

                          // Title
                          Text(
                            page.title,
                            style: GoogleFonts.plusJakartaSans(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              height: 1.1,
                              letterSpacing: -0.5,
                            ),
                          ),

                          const SizedBox(height: 12),

                          // Description
                          Text(
                            page.description,
                            style: GoogleFonts.notoSans(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 16,
                              height: 1.5,
                            ),
                          ),

                          const SizedBox(height: 140), // Space for bottom buttons
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

          // Bottom Action Bar (Floating above PageView)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
                child: Row(
                  children: [
                    // Back Button (Hidden on first page or handled?)
                    // Design shows back button. Let's make it visible but disabled or hidden on page 0
                    if (_currentPage > 0)
                      Padding(
                        padding: const EdgeInsets.only(right: 16.0),
                        child: InkWell(
                          onTap: _onBack,
                          borderRadius: BorderRadius.circular(50),
                          child: Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white.withOpacity(0.3), width: 1),
                            ),
                            child: const Icon(Icons.arrow_back, color: Colors.white),
                          ),
                        ),
                      )
                    else 
                      // Placeholder to keep layout if we want, or just nothing.
                      // Design implies spacing. If hidden, content moves. Let's just hide it.
                      const SizedBox.shrink(),

                    // Expanded Next / Get Started Button
                    Expanded(
                      child: SizedBox(
                        height: 56,
                        child: ElevatedButton(
                          onPressed: _onNext,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryColor,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                          ),
                          child: Text(
                            _currentPage == _pages.length - 1 ? "Get Started" : "Next",
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white, // Ensure text is white
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Top Status Bar Area handling is automatic by system overlay, 
          // but we might want a 'Skip' button at top right if requested?
          // Design didn't explicitly show 'Skip' in the screenshot, but it's good UX.
          // The previous code had it. I will keep it for UX safety, but make it subtle.
          Positioned(
            top: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: TextButton(
                  onPressed: _finishOnboarding,
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.white.withOpacity(0.7),
                  ),
                  child: Text(
                    'Skip',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
