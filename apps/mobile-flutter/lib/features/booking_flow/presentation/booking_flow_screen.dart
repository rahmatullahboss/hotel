// Booking Flow Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../bookings/providers/booking_provider.dart';

class BookingFlowScreen extends ConsumerStatefulWidget {
  final String roomId;

  const BookingFlowScreen({super.key, required this.roomId});

  @override
  ConsumerState<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends ConsumerState<BookingFlowScreen> {
  int _currentStep = 0;
  DateTime? _checkIn;
  DateTime? _checkOut;
  int _guests = 2;
  String _paymentMethod = 'bkash';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('বুকিং', style: AppTypography.h4),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 2) {
            setState(() => _currentStep++);
          } else {
            _completeBooking();
          }
        },
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
                    child: Text(
                      _currentStep == 2 ? 'বুকিং নিশ্চিত করুন' : 'পরবর্তী',
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
                  ? '${_formatDate(_checkIn!)} - ${_formatDate(_checkOut!)}'
                  : 'চেক-ইন ও চেক-আউট তারিখ',
              style: AppTypography.bodySmall,
            ),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
            content: _buildDateStep(),
          ),
          Step(
            title: Text('অতিথি তথ্য', style: AppTypography.labelLarge),
            subtitle: Text('$_guests জন অতিথি', style: AppTypography.bodySmall),
            isActive: _currentStep >= 1,
            state: _currentStep > 1 ? StepState.complete : StepState.indexed,
            content: _buildGuestStep(),
          ),
          Step(
            title: Text('পেমেন্ট', style: AppTypography.labelLarge),
            subtitle: Text(_paymentMethodLabel, style: AppTypography.bodySmall),
            isActive: _currentStep >= 2,
            state: _currentStep > 2 ? StepState.complete : StepState.indexed,
            content: _buildPaymentStep(),
          ),
        ],
      ),
    );
  }

  Widget _buildDateStep() {
    return Column(
      children: [
        _DateSelector(
          label: 'চেক-ইন',
          date: _checkIn,
          onSelect: (date) => setState(() => _checkIn = date),
        ),
        const SizedBox(height: 16),
        _DateSelector(
          label: 'চেক-আউট',
          date: _checkOut,
          onSelect: (date) => setState(() => _checkOut = date),
        ),
      ],
    );
  }

  Widget _buildGuestStep() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(Icons.people_outline, color: AppColors.textSecondary),
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
                onPressed: _guests > 1 ? () => setState(() => _guests--) : null,
                icon: const Icon(Icons.remove_circle_outline),
                color: AppColors.primary,
              ),
              Text('$_guests', style: AppTypography.h4),
              IconButton(
                onPressed: _guests < 4 ? () => setState(() => _guests++) : null,
                icon: const Icon(Icons.add_circle_outline),
                color: AppColors.primary,
              ),
            ],
          ),
        ],
      ),
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
              _PriceRow(label: 'রুম ভাড়া (১ রাত)', value: '৳2,500'),
              _PriceRow(label: 'ট্যাক্স', value: '৳250'),
              const Divider(),
              _PriceRow(label: 'মোট', value: '৳2,750', isTotal: true),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Payment Methods
        _PaymentOption(
          value: 'bkash',
          groupValue: _paymentMethod,
          title: 'বিকাশ',
          icon: Icons.phone_android,
          onChanged: (v) => setState(() => _paymentMethod = v!),
        ),
        _PaymentOption(
          value: 'nagad',
          groupValue: _paymentMethod,
          title: 'নগদ',
          icon: Icons.phone_android,
          onChanged: (v) => setState(() => _paymentMethod = v!),
        ),
        _PaymentOption(
          value: 'card',
          groupValue: _paymentMethod,
          title: 'কার্ড',
          icon: Icons.credit_card,
          onChanged: (v) => setState(() => _paymentMethod = v!),
        ),
        _PaymentOption(
          value: 'hotel',
          groupValue: _paymentMethod,
          title: 'হোটেলে পেমেন্ট',
          icon: Icons.hotel,
          onChanged: (v) => setState(() => _paymentMethod = v!),
        ),
      ],
    );
  }

  String get _paymentMethodLabel {
    switch (_paymentMethod) {
      case 'bkash':
        return 'বিকাশ';
      case 'nagad':
        return 'নগদ';
      case 'card':
        return 'কার্ড';
      case 'hotel':
        return 'হোটেলে পেমেন্ট';
      default:
        return '';
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _completeBooking() async {
    // Validate dates
    if (_checkIn == null || _checkOut == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('তারিখ নির্বাচন করুন')));
      return;
    }

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
          roomId: widget.roomId,
          checkIn: _checkIn!,
          checkOut: _checkOut!,
          guests: _guests,
          paymentMethod: _paymentMethod,
        );

    // Hide loading
    if (mounted) Navigator.of(context).pop();

    if (success) {
      // Show success dialog
      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('বুকিং সম্পন্ন!', style: AppTypography.h3),
            content: Text(
              'আপনার বুকিং সফলভাবে সম্পন্ন হয়েছে।',
              style: AppTypography.bodyMedium,
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  context.go('/bookings'); // Navigate to bookings tab
                },
                child: const Text('ঠিক আছে'),
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

class _DateSelector extends StatelessWidget {
  final String label;
  final DateTime? date;
  final ValueChanged<DateTime> onSelect;

  const _DateSelector({
    required this.label,
    required this.date,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: date ?? DateTime.now(),
          firstDate: DateTime.now(),
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
            Icon(Icons.calendar_today, color: AppColors.primary),
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
  final IconData icon;
  final ValueChanged<String?> onChanged;

  const _PaymentOption({
    required this.value,
    required this.groupValue,
    required this.title,
    required this.icon,
    required this.onChanged,
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
            Text(title, style: AppTypography.bodyMedium),
            const Spacer(),
            if (isSelected)
              const Icon(Icons.check_circle, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
