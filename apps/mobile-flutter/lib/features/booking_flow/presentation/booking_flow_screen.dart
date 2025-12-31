// Booking Flow Screen - Complete Booking with Guest Details & Dynamic Pricing
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../bookings/providers/booking_provider.dart';
import '../../hotel/providers/room_provider.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/stripe_payment_provider.dart';

class BookingFlowScreen extends ConsumerStatefulWidget {
  final String roomId;
  final String? hotelId;

  const BookingFlowScreen({super.key, required this.roomId, this.hotelId});

  @override
  ConsumerState<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends ConsumerState<BookingFlowScreen> {
  int _currentStep = 0;
  DateTime? _checkIn;
  DateTime? _checkOut;
  int _guests = 2;
  String _paymentMethod = 'PAY_AT_HOTEL';

  // Guest details controllers
  final _guestNameController = TextEditingController();
  final _guestPhoneController = TextEditingController();
  final _guestEmailController = TextEditingController();

  // Form key for validation
  final _formKey = GlobalKey<FormState>();

  // Room price (fetched from API)
  int _roomPrice = 0;
  String _roomName = '';
  String? _resolvedHotelId; // Store hotelId from room data

  @override
  void initState() {
    super.initState();
    _checkIn = DateTime.now().add(const Duration(days: 1));
    _checkOut = DateTime.now().add(const Duration(days: 2));

    // Pre-fill user info
    // Using Future.microtask to access ref safely
    Future.microtask(() {
      final user = ref.read(authProvider).user;
      if (user != null) {
        setState(() {
          _guestNameController.text = user.name;
          if (user.phone != null) _guestPhoneController.text = user.phone!;
          _guestEmailController.text = user.email;
        });
      }
    });
  }

  @override
  void dispose() {
    _guestNameController.dispose();
    _guestPhoneController.dispose();
    _guestEmailController.dispose();
    super.dispose();
  }

  // Calculate number of nights
  int get _nights {
    if (_checkIn == null || _checkOut == null) return 1;
    return _checkOut!.difference(_checkIn!).inDays.clamp(1, 365);
  }

  // Calculate prices
  int get _roomTotal => _roomPrice * _nights;
  int get _tax => (_roomTotal * 0.10).round(); // 10% tax
  int get _grandTotal => _roomTotal + _tax;

  // Booking fee calculation (20% for PAH, 100% for online)
  int get _bookingFee {
    if (_paymentMethod == 'PAY_AT_HOTEL') {
      return (_grandTotal * 0.20).round();
    }
    return _grandTotal;
  }

  String _formatPrice(int price) {
    return price.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  @override
  Widget build(BuildContext context) {
    // Fetch room data to get dynamic price
    final roomsParams = RoomsParams(
      hotelId: widget.hotelId ?? widget.roomId.split('-').first,
      checkIn: _checkIn?.toIso8601String().split('T')[0],
      checkOut: _checkOut?.toIso8601String().split('T')[0],
    );
    final roomsAsync = ref.watch(roomsProvider(roomsParams));

    // Update room price when data loads
    roomsAsync.whenData((rooms) {
      final room = rooms.where((r) => r.id == widget.roomId).firstOrNull;
      if (room != null && _roomPrice != room.dynamicPrice) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          setState(() {
            _roomPrice = room.dynamicPrice;
            _roomName = room.name;
            // Store hotelId for booking - use widget.hotelId or fallback from room lookup
            _resolvedHotelId ??= widget.hotelId;
          });
        });
      }
    });

    // Localizations
    final loc = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      appBar: AppBar(
        title: Text(loc.bookings, style: AppTypography.h4),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: Stepper(
          currentStep: _currentStep,
          onStepContinue: _onStepContinue,
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() => _currentStep--);
            }
          },
          controlsBuilder: (context, details) {
            return Padding(
              padding: const EdgeInsets.only(top: 20),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: details.onStepContinue,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: Text(
                        _currentStep == 2 ? loc.bookNow : loc.next,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  if (_currentStep > 0) ...[
                    const SizedBox(width: 12),
                    OutlinedButton(
                      onPressed: details.onStepCancel,
                      child: Text(loc.previous),
                    ),
                  ],
                ],
              ),
            );
          },
          steps: [
            Step(
              title: Text(loc.stepDate, style: AppTypography.labelLarge),
              subtitle: Text(
                _checkIn != null && _checkOut != null
                    ? '${_formatDate(_checkIn!)} - ${_formatDate(_checkOut!)} ($_nights রাত)'
                    : 'চেক-ইন ও চেক-আউট তারিখ',
                style: AppTypography.bodySmall,
              ),
              isActive: _currentStep >= 0,
              state: _currentStep > 0 ? StepState.complete : StepState.indexed,
              content: _buildDateStep(),
            ),
            Step(
              title: Text(loc.stepGuest, style: AppTypography.labelLarge),
              subtitle: Text(
                _guestNameController.text.isNotEmpty
                    ? _guestNameController.text
                    : '$_guests ${loc.guests}',
                style: AppTypography.bodySmall,
              ),
              isActive: _currentStep >= 1,
              state: _currentStep > 1 ? StepState.complete : StepState.indexed,
              content: _buildGuestStep(),
            ),
            Step(
              title: Text(loc.stepPayment, style: AppTypography.labelLarge),
              subtitle: Text(
                '৳${_formatPrice(_grandTotal)} - ${_getPaymentMethodLabel(context)}',
                style: AppTypography.bodySmall,
              ),
              isActive: _currentStep >= 2,
              state: _currentStep > 2 ? StepState.complete : StepState.indexed,
              content: _buildPaymentStep(),
            ),
          ],
        ),
      ),
    );
  }

  void _onStepContinue() {
    if (_currentStep == 0) {
      // Validate dates
      if (_checkIn == null || _checkOut == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.selectDateMessage),
          ),
        );
        return;
      }
      if (!_checkOut!.isAfter(_checkIn!)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.checkoutDateMessage),
          ),
        );
        return;
      }
      setState(() => _currentStep++);
    } else if (_currentStep == 1) {
      // Validate guest details
      if (_guestNameController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.enterGuestNameMessage),
          ),
        ); // Fallback or add key
        return;
      }
      if (_guestPhoneController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.enterPhoneMessage),
          ),
        );
        return;
      }
      setState(() => _currentStep++);
    } else if (_currentStep == 2) {
      _completeBooking();
    }
  }

  Widget _buildDateStep() {
    final loc = AppLocalizations.of(context)!;
    return Column(
      children: [
        _DateSelector(
          label: loc.checkIn,
          date: _checkIn,
          onSelect: (date) {
            setState(() {
              _checkIn = date;
              // Auto-set checkout to next day if not set or before checkin
              if (_checkOut == null || !_checkOut!.isAfter(date)) {
                _checkOut = date.add(const Duration(days: 1));
              }
            });
          },
        ),
        const SizedBox(height: 16),
        _DateSelector(
          label: loc.checkOut,
          date: _checkOut,
          firstDate: _checkIn?.add(const Duration(days: 1)),
          onSelect: (date) => setState(() => _checkOut = date),
        ),
        const SizedBox(height: 16),
        if (_roomName.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.bed_outlined, color: AppColors.primary),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(_roomName, style: AppTypography.labelMedium),
                ),
                Text(
                  '৳${_formatPrice(_roomPrice)}/${loc.night}',
                  style: AppTypography.priceSmall,
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildGuestStep() {
    final loc = AppLocalizations.of(context)!;
    return Column(
      children: [
        // Guest Name
        _InputField(
          controller: _guestNameController,
          label: '${loc.guestNameLabel} *',
          hint: loc.guestNameHint,
          icon: Icons.person_outline,
        ),
        const SizedBox(height: 16),

        // Phone Number
        _InputField(
          controller: _guestPhoneController,
          label: '${loc.guestPhoneLabel} *',
          hint: loc.guestPhoneHint,
          icon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
        ),
        const SizedBox(height: 16),

        // Email (optional)
        _InputField(
          controller: _guestEmailController,
          label: loc.guestEmailLabel,
          hint: loc.guestEmailHint,
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),

        // Guest count
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              const Icon(Icons.people_outline, color: AppColors.textSecondary),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(loc.guestCountLabel, style: AppTypography.labelMedium),
                    Text(loc.maxGuestsLabel, style: AppTypography.bodySmall),
                  ],
                ),
              ),
              Row(
                children: [
                  IconButton(
                    onPressed: _guests > 1
                        ? () => setState(() => _guests--)
                        : null,
                    icon: const Icon(Icons.remove_circle_outline),
                    color: AppColors.primary,
                  ),
                  Text('$_guests', style: AppTypography.h4),
                  IconButton(
                    onPressed: _guests < 4
                        ? () => setState(() => _guests++)
                        : null,
                    icon: const Icon(Icons.add_circle_outline),
                    color: AppColors.primary,
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentStep() {
    final loc = AppLocalizations.of(context)!;
    return Column(
      children: [
        // Price Summary
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              _PriceRow(
                label: '${loc.roomRent} ($_nights ${loc.night})',
                value: '৳${_formatPrice(_roomTotal)}',
              ),
              _PriceRow(
                label: '${loc.tax} (10%)',
                value: '৳${_formatPrice(_tax)}',
              ),
              const Divider(),
              _PriceRow(
                label: loc.total,
                value: '৳${_formatPrice(_grandTotal)}',
                isTotal: true,
              ),
              if (_paymentMethod == 'PAY_AT_HOTEL') ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.info_outline,
                        color: AppColors.success,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          loc.advancePaymentMessage(_formatPrice(_bookingFee)),
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.success,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Payment Methods
        _PaymentOption(
          value: 'PAY_AT_HOTEL',
          groupValue: _paymentMethod,
          title: loc.payAtHotel,
          subtitle: loc.payAtHotelSubtitle,
          icon: Icons.hotel,
          onChanged: (v) => setState(() => _paymentMethod = v!),
        ),
        _PaymentOption(
          value: 'STRIPE',
          groupValue: _paymentMethod,
          title: loc.card,
          subtitle: loc.cardSubtitle,
          icon: Icons.credit_card,
          onChanged: (v) => setState(() => _paymentMethod = v!),
        ),
      ],
    );
  }

  String _getPaymentMethodLabel(BuildContext context) {
    final loc = AppLocalizations.of(context)!;
    switch (_paymentMethod) {
      case 'STRIPE':
        return loc.card;
      case 'PAY_AT_HOTEL':
        return loc.payAtHotel;
      default:
        return '';
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _completeBooking() async {
    final loc = AppLocalizations.of(context)!;

    // Validate hotelId before proceeding
    final hotelId = _resolvedHotelId ?? widget.hotelId;
    if (hotelId == null || hotelId.isEmpty) {
      debugPrint('Booking Error: hotelId is empty or null');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'হোটেল তথ্য পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
          ),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    debugPrint(
      'Creating booking: hotelId=$hotelId, roomId=${widget.roomId}, total=$_grandTotal',
    );

    // Call booking API to create pending booking
    final bookingId = await ref
        .read(bookingsProvider.notifier)
        .createBookingAndReturnId(
          hotelId: hotelId,
          roomId: widget.roomId,
          checkIn: _checkIn!,
          checkOut: _checkOut!,
          guests: _guests,
          guestName: _guestNameController.text,
          guestPhone: _guestPhoneController.text,
          guestEmail: _guestEmailController.text,
          paymentMethod: _paymentMethod,
          totalAmount: _grandTotal,
        );

    // If booking creation failed, show error
    if (bookingId == null) {
      debugPrint('Booking creation failed - bookingId is null');
      if (mounted) Navigator.of(context).pop();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(loc.bookingError),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return;
    }

    debugPrint('Booking created successfully: $bookingId');

    // For STRIPE payment, process payment before confirming
    bool success = true;
    if (_paymentMethod == 'STRIPE') {
      // Hide loading for Stripe payment sheet
      if (mounted) Navigator.of(context).pop();

      // Process Stripe payment
      success = await ref
          .read(stripePaymentProvider.notifier)
          .processPayment(bookingId: bookingId, amount: _grandTotal);
    } else {
      // For other payment methods, hide loading
      if (mounted) Navigator.of(context).pop();
    }

    if (success) {
      // Show success dialog
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: Row(
              children: [
                const Icon(Icons.check_circle, color: AppColors.success),
                const SizedBox(width: 8),
                Text(loc.bookingSuccessTitle, style: AppTypography.h3),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  loc.bookingSuccessMessage,
                  style: AppTypography.bodyMedium,
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'চেক-ইন: ${_formatDate(_checkIn!)}',
                        style: AppTypography.bodySmall,
                      ),
                      Text(
                        'চেক-আউট: ${_formatDate(_checkOut!)}',
                        style: AppTypography.bodySmall,
                      ),
                      Text(
                        'মোট: ৳${_formatPrice(_grandTotal)}',
                        style: AppTypography.labelMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  context.go('/bookings');
                },
                child: Text(loc.viewMyBookings),
              ),
            ],
          ),
        );
      }
    } else {
      // Show error
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(loc.bookingError),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
}

// Input Field Widget
class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String hint;
  final IconData icon;
  final TextInputType? keyboardType;

  const _InputField({
    required this.controller,
    required this.label,
    required this.hint,
    required this.icon,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.labelSmall),
          const SizedBox(height: 8),
          TextField(
            controller: controller,
            keyboardType: keyboardType,
            decoration: InputDecoration(
              hintText: hint,
              prefixIcon: Icon(icon, color: AppColors.textSecondary),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.divider),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.primary),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DateSelector extends StatelessWidget {
  final String label;
  final DateTime? date;
  final DateTime? firstDate;
  final ValueChanged<DateTime> onSelect;

  const _DateSelector({
    required this.label,
    required this.date,
    required this.onSelect,
    this.firstDate,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: date ?? firstDate ?? DateTime.now(),
          firstDate: firstDate ?? DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
        );
        if (picked != null) {
          onSelect(picked);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.divider),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today, color: AppColors.primary),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTypography.labelSmall),
                Text(
                  date != null
                      ? '${date!.day}/${date!.month}/${date!.year}'
                      : AppLocalizations.of(context)!.selectDateMessage,
                  style: AppTypography.bodyMedium,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isTotal;

  const _PriceRow({
    required this.label,
    required this.value,
    this.isTotal = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: isTotal
                ? AppTypography.labelLarge
                : AppTypography.bodyMedium,
          ),
          Text(
            value,
            style: isTotal
                ? AppTypography.priceLarge
                : AppTypography.bodyMedium,
          ),
        ],
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  final String value;
  final String groupValue;
  final String title;
  final String? subtitle;
  final IconData icon;
  final ValueChanged<String?> onChanged;

  const _PaymentOption({
    required this.value,
    required this.groupValue,
    required this.title,
    required this.icon,
    required this.onChanged,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return GestureDetector(
      onTap: () => onChanged(value),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.divider,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTypography.bodyMedium),
                  if (subtitle != null)
                    Text(
                      subtitle!,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
