// Bookings Screen - Premium White Label Design with API Integration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../../shared/widgets/booking_card.dart';
import '../providers/booking_provider.dart';

class BookingsScreen extends ConsumerStatefulWidget {
  const BookingsScreen({super.key});

  @override
  ConsumerState<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends ConsumerState<BookingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    // Fetch bookings when screen loads
    Future.microtask(() {
      ref.read(bookingsProvider.notifier).fetchBookings();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _onRefresh() {
    ref.read(bookingsProvider.notifier).fetchBookings();
  }

  BookingStatus _mapStatus(String status) {
    switch (status) {
      case 'upcoming':
      case 'confirmed':
        return BookingStatus.confirmed;
      case 'completed':
        return BookingStatus.completed;
      case 'cancelled':
        return BookingStatus.cancelled;
      default:
        return BookingStatus.pending;
    }
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final bookingsState = ref.watch(bookingsProvider);
    final totalBookings =
        bookingsState.upcomingBookings.length +
        bookingsState.completedBookings.length;

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      body: Column(
        children: [
          // Premium Header with Dark Mode
          Container(
            decoration: BoxDecoration(
              color: AppColors.isDarkMode(context)
                  ? AppColors.surfaceDark
                  : Colors.white,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(28),
                bottomRight: Radius.circular(28),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Padding(
              padding: EdgeInsets.only(
                top: topPadding + 12,
                left: 20,
                right: 20,
                bottom: 16,
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppLocalizations.of(context)!.bookingsTitle,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: AppColors.isDarkMode(context)
                                  ? Colors.white
                                  : AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '$totalBookings ${AppLocalizations.of(context)!.bookingsSubtitleSuffix}',
                            style: GoogleFonts.notoSans(
                              fontSize: 14,
                              color: AppColors.isDarkMode(context)
                                  ? Colors.white60
                                  : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),

                      // QR Scanner Button
                      GestureDetector(
                        onTap: () => context.push('/qr-scanner'),
                        child: Container(
                          width: 46,
                          height: 46,
                          decoration: BoxDecoration(
                            color: AppColors.isDarkMode(context)
                                ? Colors.white.withValues(alpha: 0.1)
                                : AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(
                            Icons.qr_code_scanner_rounded,
                            color: AppColors.isDarkMode(context)
                                ? Colors.white
                                : AppColors.textPrimary,
                            size: 22,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Tab Bar with improved styling
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.isDarkMode(context)
                          ? Colors.white.withValues(alpha: 0.08)
                          : AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: TabBar(
                      controller: _tabController,
                      indicator: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      indicatorPadding: const EdgeInsets.all(4),
                      labelColor: Colors.white,
                      unselectedLabelColor: AppColors.textSecondary,
                      labelStyle: GoogleFonts.notoSans(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                      dividerColor: Colors.transparent,
                      indicatorSize: TabBarIndicatorSize.tab,
                      tabs: [
                        Tab(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(AppLocalizations.of(context)!.tabUpcoming),
                              if (bookingsState.upcomingBookings.isNotEmpty)
                                Container(
                                  margin: const EdgeInsets.only(left: 6),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '${bookingsState.upcomingBookings.length}',
                                    style: GoogleFonts.notoSans(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        Tab(
                          child: Text(
                            AppLocalizations.of(context)!.tabCompleted,
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Tab(
                          child: Text(
                            AppLocalizations.of(context)!.tabCancelled,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Content
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => _onRefresh(),
              color: AppColors.primary,
              child: TabBarView(
                controller: _tabController,
                children: [
                  // Upcoming Bookings
                  _buildBookingsList(
                    bookingsState.upcomingBookings,
                    bookingsState.isLoading,
                    bookingsState.error,
                    AppLocalizations.of(context)!.emptyUpcomingTitle,
                    AppLocalizations.of(context)!.emptyUpcomingSubtitle,
                  ),

                  // Completed Bookings
                  _buildBookingsList(
                    bookingsState.completedBookings,
                    bookingsState.isLoading,
                    bookingsState.error,
                    AppLocalizations.of(context)!.emptyCompletedTitle,
                    AppLocalizations.of(context)!.emptyCompletedSubtitle,
                  ),

                  // Cancelled Bookings
                  _buildBookingsList(
                    bookingsState.cancelledBookings,
                    bookingsState.isLoading,
                    bookingsState.error,
                    AppLocalizations.of(context)!.emptyCancelledTitle,
                    AppLocalizations.of(context)!.emptyCancelledSubtitle,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingsList(
    List<Booking> bookings,
    bool isLoading,
    String? error,
    String emptyTitle,
    String emptySubtitle,
  ) {
    // Loading State
    if (isLoading && bookings.isEmpty) {
      return ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: 2,
        itemBuilder: (_, _) => const _BookingCardShimmer(),
      );
    }

    // Error State
    if (error != null && bookings.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text(
                error,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _onRefresh,
                icon: const Icon(Icons.refresh),
                label: Text(AppLocalizations.of(context)!.searchTryAgain),
              ),
            ],
          ),
        ),
      );
    }

    // Empty State
    if (bookings.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.luggage_outlined,
                  size: 40,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 24),
              Text(emptyTitle, style: AppTypography.h4),
              const SizedBox(height: 8),
              Text(
                emptySubtitle,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () => context.go('/search'),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 28,
                    vertical: 14,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: AppColors.buttonShadow,
                  ),
                  child: Text(
                    AppLocalizations.of(context)!.findHotelsButton,
                    style: AppTypography.button,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Data State
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: bookings.length,
      itemBuilder: (context, index) {
        final booking = bookings[index];
        return BookingCard(
          id: booking.id,
          hotelName: booking.hotelName,
          hotelLocation:
              '', // City not available in Booking model, can add later
          hotelImage: booking.hotelImageUrl,
          roomName: booking.roomName,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          status: _mapStatus(booking.status),
          totalAmount: booking.totalAmount.toDouble(),
        );
      },
    );
  }
}

// Shimmer loading placeholder for booking cards
class _BookingCardShimmer extends StatelessWidget {
  const _BookingCardShimmer();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Shimmer.fromColors(
        baseColor: AppColors.shimmerBase,
        highlightColor: AppColors.shimmerHighlight,
        child: Container(
          height: 140,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}
