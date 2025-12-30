// QR Scanner Screen
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_code_scanner_plus/qr_code_scanner_plus.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class QrScannerScreen extends ConsumerStatefulWidget {
  const QrScannerScreen({super.key});

  @override
  ConsumerState<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends ConsumerState<QrScannerScreen> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? controller;
  bool flashOpen = false;

  // In order to get hot reload to work we need to pause the camera if the platform
  // is android, or resume the camera if the platform is iOS.
  @override
  void reassemble() {
    super.reassemble();
    if (Platform.isAndroid) {
      controller!.pauseCamera();
    } else if (Platform.isIOS) {
      controller!.resumeCamera();
    }
  }

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
        actions: [
          IconButton(
            icon: Icon(
              flashOpen ? Icons.flash_on : Icons.flash_off,
              color: Colors.white,
            ),
            onPressed: () async {
              await controller?.toggleFlash();
              setState(() {
                flashOpen = !flashOpen;
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Scanner Area
          Expanded(
            flex: 3,
            child: QRView(
              key: qrKey,
              onQRViewCreated: _onQRViewCreated,
              overlay: QrScannerOverlayShape(
                borderColor: AppColors.primary,
                borderRadius: 20,
                borderLength: 30,
                borderWidth: 10,
                cutOutSize: 250,
              ),
              onPermissionSet: (ctrl, p) => _onPermissionSet(context, ctrl, p),
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
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      // Pause to prevent multiple scans
      controller.pauseCamera();

      // Handle the scanned code
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Scanned: ${scanData.code}'),
          backgroundColor: AppColors.success,
        ),
      );

      // Logic to parse booking ID or check-in action would go here
      // For now, resume after 2 seconds
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          controller.resumeCamera();
        }
      });
    });
  }

  void _onPermissionSet(BuildContext context, QRViewController ctrl, bool p) {
    if (!p) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('no Permission')));
    }
  }

  @override
  void dispose() {
    // QRViewController self-disposes when QRView is unmounted
    super.dispose();
  }
}
