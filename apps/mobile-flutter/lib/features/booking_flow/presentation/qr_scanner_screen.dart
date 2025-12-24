// QR Scanner Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class QrScannerScreen extends ConsumerStatefulWidget {
  const QrScannerScreen({super.key});

  @override
  ConsumerState<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends ConsumerState<QrScannerScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          'QR স্ক্যান',
          style: AppTypography.h4.copyWith(color: Colors.white),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          // Scanner Area
          Expanded(
            flex: 3,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Camera placeholder
                Container(
                  color: Colors.black87,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.qr_code_scanner,
                          size: 100,
                          color: Colors.white.withValues(alpha: 0.3),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'ক্যামেরা এক্সেস প্রয়োজন',
                          style: AppTypography.bodyMedium.copyWith(
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Scanner Frame
                Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.primary, width: 3),
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),

                // Corner Decorations
                Positioned(
                  top: (MediaQuery.of(context).size.height / 2) - 180,
                  left: (MediaQuery.of(context).size.width / 2) - 125,
                  child: _CornerDecoration(corner: 'topLeft'),
                ),
                Positioned(
                  top: (MediaQuery.of(context).size.height / 2) - 180,
                  right: (MediaQuery.of(context).size.width / 2) - 125,
                  child: _CornerDecoration(corner: 'topRight'),
                ),
                Positioned(
                  bottom: (MediaQuery.of(context).size.height / 2) - 180,
                  left: (MediaQuery.of(context).size.width / 2) - 125,
                  child: _CornerDecoration(corner: 'bottomLeft'),
                ),
                Positioned(
                  bottom: (MediaQuery.of(context).size.height / 2) - 180,
                  right: (MediaQuery.of(context).size.width / 2) - 125,
                  child: _CornerDecoration(corner: 'bottomRight'),
                ),
              ],
            ),
          ),

          // Instructions
          Expanded(
            flex: 1,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
              ),
              child: Column(
                children: [
                  Text(
                    'হোটেলের QR কোড স্ক্যান করুন',
                    style: AppTypography.h4,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'চেক-ইন বা চেক-আউট করতে রিসেপশনে থাকা QR কোড স্ক্যান করুন',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const Spacer(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _ActionButton(
                        icon: Icons.flash_on,
                        label: 'ফ্ল্যাশ',
                        onTap: () {},
                      ),
                      _ActionButton(
                        icon: Icons.image,
                        label: 'গ্যালারি',
                        onTap: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CornerDecoration extends StatelessWidget {
  final String corner;

  const _CornerDecoration({required this.corner});

  @override
  Widget build(BuildContext context) {
    BorderRadius borderRadius;
    switch (corner) {
      case 'topLeft':
        borderRadius = const BorderRadius.only(topLeft: Radius.circular(20));
        break;
      case 'topRight':
        borderRadius = const BorderRadius.only(topRight: Radius.circular(20));
        break;
      case 'bottomLeft':
        borderRadius = const BorderRadius.only(bottomLeft: Radius.circular(20));
        break;
      case 'bottomRight':
        borderRadius = const BorderRadius.only(
          bottomRight: Radius.circular(20),
        );
        break;
      default:
        borderRadius = BorderRadius.zero;
    }

    return Container(
      width: 30,
      height: 30,
      decoration: BoxDecoration(
        border: Border(
          top: corner.contains('top')
              ? const BorderSide(color: AppColors.primary, width: 4)
              : BorderSide.none,
          bottom: corner.contains('bottom')
              ? const BorderSide(color: AppColors.primary, width: 4)
              : BorderSide.none,
          left: corner.contains('Left')
              ? const BorderSide(color: AppColors.primary, width: 4)
              : BorderSide.none,
          right: corner.contains('Right')
              ? const BorderSide(color: AppColors.primary, width: 4)
              : BorderSide.none,
        ),
        borderRadius: borderRadius,
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.primary),
          ),
          const SizedBox(height: 8),
          Text(label, style: AppTypography.labelSmall),
        ],
      ),
    );
  }
}
