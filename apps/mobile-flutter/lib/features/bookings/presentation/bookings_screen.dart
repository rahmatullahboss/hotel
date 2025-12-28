// Bookings Screen - World-Class Premium Design with API Integration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
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
          // Premium Header
          Container(
            decoration: const BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Padding(
              padding: EdgeInsets.only(
                top: topPadding + 16,
                left: 20,
                right: 20,
                bottom: 12,
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
                            style: AppTypography.h2.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '$totalBookings ${AppLocalizations.of(context)!.bookingsSubtitleSuffix}',
                            style: AppTypography.bodyMedium.copyWith(
                              color: Colors.white.withValues(alpha: 0.85),
                            ),
                          ),
                        ],
                      ),

                      // QR Scanner Button
                      GestureDetector(
                        onTap: () => context.push('/qr-scanner'),
                        child: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.qr_code_scanner,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Tab Bar
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: TabBar(
                      controller: _tabController,
                      indicator: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      indicatorPadding: const EdgeInsets.all(4),
                      labelColor: AppColors.primary,
                      unselectedLabelColor: Colors.white.withValues(alpha: 0.8),
                      labelStyle: AppTypography.labelLarge.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      dividerColor: Colors.transparent,
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
                                    color: Colors.amber,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '${bookingsState.upcomingBookings.length}',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black87,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        Tab(text: AppLocalizations.of(context)!.tabCompleted),
                        Tab(text: AppLocalizations.of(context)!.tabCancelled),
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
