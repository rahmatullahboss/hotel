// Booking Flow Screen - Complete Booking with Guest Details & Dynamic Pricing
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../bookings/providers/booking_provider.dart';
import '../../hotel/providers/room_provider.dart';

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

  @override
  void initState() {
    super.initState();
    _checkIn = DateTime.now().add(const Duration(days: 1));
    _checkOut = DateTime.now().add(const Duration(days: 2));
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
          });
        });
      }
    });

    return Scaffold(
      backgroundColor: AppColors.adaptiveBackground(context),
      appBar: AppBar(
        title: Text('বুকিং', style: AppTypography.h4),
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
                        _currentStep == 2 ? 'বুকিং নিশ্চিত করুন' : 'পরবর্তী',
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
                      child: const Text('পূর্ববর্তী'),
                    ),
                  ],
                ],
              ),
            );
          },
          steps: [
            Step(
              title: Text('তারিখ নির্বাচন', style: AppTypography.labelLarge),
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
              title: Text('অতিথি তথ্য', style: AppTypography.labelLarge),
              subtitle: Text(
                _guestNameController.text.isNotEmpty
                    ? _guestNameController.text
                    : '$_guests জন অতিথি',
                style: AppTypography.bodySmall,
              ),
              isActive: _currentStep >= 1,
              state: _currentStep > 1 ? StepState.complete : StepState.indexed,
              content: _buildGuestStep(),
            ),
            Step(
              title: Text('পেমেন্ট', style: AppTypography.labelLarge),
              subtitle: Text(
                '৳${_formatPrice(_grandTotal)} - $_paymentMethodLabel',
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
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('তারিখ নির্বাচন করুন')));
        return;
      }
      if (!_checkOut!.isAfter(_checkIn!)) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('চেক-আউট তারিখ চেক-ইনের পরে হতে হবে')),
        );
        return;
      }
      setState(() => _currentStep++);
    } else if (_currentStep == 1) {
      // Validate guest details
      if (_guestNameController.text.isEmpty) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('অতিথির নাম লিখুন')));
        return;
      }
      if (_guestPhoneController.text.isEmpty) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('ফোন নম্বর লিখুন')));
        return;
      }
      setState(() => _currentStep++);
    } else if (_currentStep == 2) {
      _completeBooking();
    }
  }

  Widget _buildDateStep() {
    return Column(
      children: [
        _DateSelector(
          label: 'চেক-ইন',
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
          label: 'চেক-আউট',
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
                  '৳${_formatPrice(_roomPrice)}/রাত',
                  style: AppTypography.priceSmall,
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildGuestStep() {
    return Column(
      children: [
        // Guest Name
        _InputField(
          controller: _guestNameController,
          label: 'অতিথির নাম *',
          hint: 'পুরো নাম লিখুন',
          icon: Icons.person_outline,
        ),
        const SizedBox(height: 16),

        // Phone Number
        _InputField(
          controller: _guestPhoneController,
          label: 'ফোন নম্বর *',
          hint: '01XXXXXXXXX',
          icon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
        ),
        const SizedBox(height: 16),

        // Email (optional)
        _InputField(
          controller: _guestEmailController,
          label: 'ইমেইল (ঐচ্ছিক)',
          hint: 'example@email.com',
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
                    Text('অতিথি সংখ্যা', style: AppTypography.labelMedium),
                    Text('সর্বোচ্চ ৪ জন', style: AppTypography.bodySmall),
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
                label: 'রুম ভাড়া ($_nights রাত)',
                value: '৳${_formatPrice(_roomTotal)}',
              ),
              _PriceRow(
                label: 'ট্যাক্স (১০%)',
                value: '৳${_formatPrice(_tax)}',
              ),
              const Divider(),
              _PriceRow(
                label: 'মোট',
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
                          'এখন শুধু ২০% অগ্রিম: ৳${_formatPrice(_bookingFee)}',
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
          title: 'হোটেলে পেমেন্ট',
          subtitle: 'শুধু ২০% অগ্রিম, বাকি হোটেলে',
          icon: Icons.hotel,
          onChanged: (v) => setState(() => _paymentMethod = v!),
        ),
        _PaymentOption(
          value: 'BKASH',
          groupValue: _paymentMethod,
          title: 'বিকাশ',
          subtitle: 'সম্পূর্ণ পেমেন্ট এখনই',
          icon: Icons.phone_android,
          onChanged: (v) => setState(() => _paymentMethod = v!),
        ),
        _PaymentOption(
          value: 'NAGAD',
          groupValue: _paymentMethod,
          title: 'নগদ',
          subtitle: 'সম্পূর্ণ পেমেন্ট এখনই',
          icon: Icons.phone_android,
          onChanged: (v) => setState(() => _paymentMethod = v!),
        ),
        _PaymentOption(
          value: 'CARD',
          groupValue: _paymentMethod,
          title: 'কার্ড',
          subtitle: 'ক্রেডিট/ডেবিট কার্ড',
          icon: Icons.credit_card,
          onChanged: (v) => setState(() => _paymentMethod = v!),
        ),
      ],
    );
  }

  String get _paymentMethodLabel {
    switch (_paymentMethod) {
      case 'BKASH':
        return 'বিকাশ';
      case 'NAGAD':
        return 'নগদ';
      case 'CARD':
        return 'কার্ড';
      case 'PAY_AT_HOTEL':
        return 'হোটেলে পেমেন্ট';
      default:
        return '';
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _completeBooking() async {
    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    // Call booking API
    final success = await ref
        .read(bookingsProvider.notifier)
        .createBooking(
          hotelId: widget.hotelId ?? '',
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

    // Hide loading
    if (mounted) Navigator.of(context).pop();

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
                Text('বুকিং সম্পন্ন!', style: AppTypography.h3),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'আপনার বুকিং সফলভাবে সম্পন্ন হয়েছে।',
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
                child: const Text('আমার বুকিং দেখুন'),
              ),
            ],
          ),
        );
      }
    } else {
      // Show error
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('বুকিং করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।'),
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
                      : 'তারিখ নির্বাচন করুন',
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
