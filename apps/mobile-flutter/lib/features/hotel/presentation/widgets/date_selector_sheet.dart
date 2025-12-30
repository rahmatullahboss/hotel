// Date Selector Bottom Sheet - Premium Date Picker
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../l10n/generated/app_localizations.dart';

class DateSelectorSheet extends StatefulWidget {
  final DateTime initialCheckIn;
  final DateTime initialCheckOut;
  final Function(DateTime checkIn, DateTime checkOut) onDatesSelected;

  const DateSelectorSheet({
    super.key,
    required this.initialCheckIn,
    required this.initialCheckOut,
    required this.onDatesSelected,
  });

  static Future<void> show(
    BuildContext context, {
    required DateTime initialCheckIn,
    required DateTime initialCheckOut,
    required Function(DateTime checkIn, DateTime checkOut) onDatesSelected,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DateSelectorSheet(
        initialCheckIn: initialCheckIn,
        initialCheckOut: initialCheckOut,
        onDatesSelected: onDatesSelected,
      ),
    );
  }

  @override
  State<DateSelectorSheet> createState() => _DateSelectorSheetState();
}

class _DateSelectorSheetState extends State<DateSelectorSheet> {
  late DateTime _checkIn;
  late DateTime _checkOut;
  bool _selectingCheckOut = false;

  @override
  void initState() {
    super.initState();
    _checkIn = widget.initialCheckIn;
    _checkOut = widget.initialCheckOut;
  }

  int get _nights => _checkOut.difference(_checkIn).inDays;

  String _formatFullDate(DateTime date) {
    final weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return '${weekdays[date.weekday - 1]}, ${date.day} ${months[date.month - 1]} ${date.year}';
  }

  void _onDaySelected(DateTime day) {
    setState(() {
      if (!_selectingCheckOut) {
        _checkIn = day;
        if (_checkOut.isBefore(day) || _checkOut.isAtSameMomentAs(day)) {
          _checkOut = day.add(const Duration(days: 1));
        }
        _selectingCheckOut = true;
      } else {
        if (day.isAfter(_checkIn)) {
          _checkOut = day;
          _selectingCheckOut = false;
        } else {
          // If selected date is before check-in, reset
          _checkIn = day;
          _checkOut = day.add(const Duration(days: 1));
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context)!;
    final isDark = AppColors.isDarkMode(context);

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: AppColors.adaptiveBackground(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Handle Bar
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.divider,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Select Dates',
                  style: AppTypography.h3.copyWith(
                    color: AppColors.adaptiveTextPrimary(context),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '$_nights ${_nights == 1 ? 'Night' : 'Nights'}',
                    style: AppTypography.labelMedium.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Date Summary Cards
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                // Check-in Card
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectingCheckOut = false),
                    child: _DateCard(
                      label: loc.checkIn,
                      date: _formatFullDate(_checkIn),
                      isSelected: !_selectingCheckOut,
                      isDark: isDark,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Arrow
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.arrow_forward,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 12),
                // Check-out Card
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectingCheckOut = true),
                    child: _DateCard(
                      label: loc.checkOut,
                      date: _formatFullDate(_checkOut),
                      isSelected: _selectingCheckOut,
                      isDark: isDark,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Calendar
          Expanded(
            child: _CalendarView(
              checkIn: _checkIn,
              checkOut: _checkOut,
              onDaySelected: _onDaySelected,
              isDark: isDark,
            ),
          ),

          // Bottom Apply Button
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    widget.onDatesSelected(_checkIn, _checkOut);
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text('Apply Dates', style: AppTypography.button),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DateCard extends StatelessWidget {
  final String label;
  final String date;
  final bool isSelected;
  final bool isDark;

  const _DateCard({
    required this.label,
    required this.date,
    required this.isSelected,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isSelected
            ? AppColors.primary.withValues(alpha: 0.1)
            : (isDark ? AppColors.surfaceDark : AppColors.surfaceVariant),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected ? AppColors.primary : Colors.transparent,
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: isSelected ? AppColors.primary : AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            date,
            style: AppTypography.labelMedium.copyWith(
              color: isSelected
                  ? AppColors.primary
                  : (isDark ? Colors.white : AppColors.textPrimary),
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _CalendarView extends StatefulWidget {
  final DateTime checkIn;
  final DateTime checkOut;
  final Function(DateTime) onDaySelected;
  final bool isDark;

  const _CalendarView({
    required this.checkIn,
    required this.checkOut,
    required this.onDaySelected,
    required this.isDark,
  });

  @override
  State<_CalendarView> createState() => _CalendarViewState();
}

class _CalendarViewState extends State<_CalendarView> {
  late PageController _pageController;
  late DateTime _currentMonth;
  final DateTime _today = DateTime.now();

  @override
  void initState() {
    super.initState();
    _currentMonth = DateTime(widget.checkIn.year, widget.checkIn.month);
    _pageController = PageController(initialPage: 0);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goToMonth(int delta) {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + delta);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Month Navigation
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                onPressed: () => _goToMonth(-1),
                icon: Icon(
                  Icons.chevron_left,
                  color: widget.isDark ? Colors.white : AppColors.textPrimary,
                ),
              ),
              Text(
                _getMonthYearString(_currentMonth),
                style: AppTypography.h4.copyWith(
                  color: widget.isDark ? Colors.white : AppColors.textPrimary,
                ),
              ),
              IconButton(
                onPressed: () => _goToMonth(1),
                icon: Icon(
                  Icons.chevron_right,
                  color: widget.isDark ? Colors.white : AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),

        // Weekday Headers
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                .map(
                  (day) => Expanded(
                    child: Center(
                      child: Text(
                        day,
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        ),

        const SizedBox(height: 8),

        // Calendar Grid
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: _buildMonthGrid(),
          ),
        ),
      ],
    );
  }

  String _getMonthYearString(DateTime date) {
    final months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return '${months[date.month - 1]} ${date.year}';
  }

  Widget _buildMonthGrid() {
    final firstDayOfMonth = DateTime(
      _currentMonth.year,
      _currentMonth.month,
      1,
    );
    final lastDayOfMonth = DateTime(
      _currentMonth.year,
      _currentMonth.month + 1,
      0,
    );
    final startingWeekday = firstDayOfMonth.weekday % 7;
    final daysInMonth = lastDayOfMonth.day;

    final days = <Widget>[];

    // Empty cells for days before month starts
    for (int i = 0; i < startingWeekday; i++) {
      days.add(const SizedBox());
    }

    // Days of the month
    for (int day = 1; day <= daysInMonth; day++) {
      final date = DateTime(_currentMonth.year, _currentMonth.month, day);
      final isToday =
          date.year == _today.year &&
          date.month == _today.month &&
          date.day == _today.day;
      final isPast = date.isBefore(
        DateTime(_today.year, _today.month, _today.day),
      );
      final isCheckIn =
          date.year == widget.checkIn.year &&
          date.month == widget.checkIn.month &&
          date.day == widget.checkIn.day;
      final isCheckOut =
          date.year == widget.checkOut.year &&
          date.month == widget.checkOut.month &&
          date.day == widget.checkOut.day;
      final isInRange =
          date.isAfter(widget.checkIn) && date.isBefore(widget.checkOut);

      days.add(
        _CalendarDay(
          day: day,
          isToday: isToday,
          isPast: isPast,
          isCheckIn: isCheckIn,
          isCheckOut: isCheckOut,
          isInRange: isInRange,
          onTap: isPast ? null : () => widget.onDaySelected(date),
          isDark: widget.isDark,
        ),
      );
    }

    return GridView.count(
      crossAxisCount: 7,
      mainAxisSpacing: 4,
      crossAxisSpacing: 4,
      children: days,
    );
  }
}

class _CalendarDay extends StatelessWidget {
  final int day;
  final bool isToday;
  final bool isPast;
  final bool isCheckIn;
  final bool isCheckOut;
  final bool isInRange;
  final VoidCallback? onTap;
  final bool isDark;

  const _CalendarDay({
    required this.day,
    required this.isToday,
    required this.isPast,
    required this.isCheckIn,
    required this.isCheckOut,
    required this.isInRange,
    this.onTap,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;
    BoxDecoration? decoration;

    if (isCheckIn || isCheckOut) {
      bgColor = AppColors.primary;
      textColor = Colors.white;
      decoration = BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      );
    } else if (isInRange) {
      bgColor = AppColors.primary.withValues(alpha: 0.15);
      textColor = isDark ? Colors.white : AppColors.textPrimary;
      decoration = BoxDecoration(color: bgColor);
    } else if (isPast) {
      bgColor = Colors.transparent;
      textColor = AppColors.textTertiary.withValues(alpha: 0.5);
    } else {
      bgColor = Colors.transparent;
      textColor = isDark ? Colors.white : AppColors.textPrimary;
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: decoration,
        child: Stack(
          alignment: Alignment.center,
          children: [
            Text(
              day.toString(),
              style: AppTypography.labelMedium.copyWith(
                color: textColor,
                fontWeight: (isCheckIn || isCheckOut)
                    ? FontWeight.bold
                    : FontWeight.normal,
              ),
            ),
            if (isToday && !isCheckIn && !isCheckOut)
              Positioned(
                bottom: 4,
                child: Container(
                  width: 4,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
