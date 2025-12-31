// PDF Receipt Generator for Booking Confirmation
import 'dart:io';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'package:intl/intl.dart';
import 'package:flutter/material.dart';

class BookingReceiptGenerator {
  /// Generate and save booking receipt PDF
  static Future<String?> generateReceipt({
    required String bookingId,
    required String hotelName,
    required String roomName,
    required DateTime checkIn,
    required DateTime checkOut,
    required int totalAmount,
    required String paymentMethod,
    String? guestName,
    String? guestEmail,
    String? guestPhone,
  }) async {
    try {
      final pdf = pw.Document();

      // Calculate nights
      final nights = checkOut.difference(checkIn).inDays;

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(40),
          build: (pw.Context context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // Header
                _buildHeader(),
                pw.SizedBox(height: 30),

                // Booking ID
                _buildBookingId(bookingId),
                pw.SizedBox(height: 30),

                // Divider
                pw.Divider(thickness: 1, color: PdfColors.grey300),
                pw.SizedBox(height: 20),

                // Hotel & Room Info
                _buildSection('Hotel Information', [
                  _buildInfoRow('Hotel Name', hotelName),
                  _buildInfoRow('Room Type', roomName),
                ]),
                pw.SizedBox(height: 20),

                // Stay Details
                _buildSection('Stay Details', [
                  _buildInfoRow(
                    'Check-in',
                    DateFormat('EEEE, dd MMMM yyyy').format(checkIn),
                  ),
                  _buildInfoRow(
                    'Check-out',
                    DateFormat('EEEE, dd MMMM yyyy').format(checkOut),
                  ),
                  _buildInfoRow(
                    'Duration',
                    '$nights night${nights > 1 ? 's' : ''}',
                  ),
                ]),
                pw.SizedBox(height: 20),

                // Guest Info (if available)
                if (guestName != null || guestEmail != null)
                  _buildSection('Guest Information', [
                    if (guestName != null) _buildInfoRow('Name', guestName),
                    if (guestEmail != null) _buildInfoRow('Email', guestEmail),
                    if (guestPhone != null) _buildInfoRow('Phone', guestPhone),
                  ]),
                if (guestName != null || guestEmail != null)
                  pw.SizedBox(height: 20),

                // Payment Info
                _buildSection('Payment Details', [
                  _buildInfoRow(
                    'Payment Method',
                    _getPaymentLabel(paymentMethod),
                  ),
                  _buildInfoRow('Status', 'Confirmed'),
                ]),
                pw.SizedBox(height: 30),

                // Total Amount
                _buildTotalAmount(totalAmount),
                pw.SizedBox(height: 40),

                // Footer
                _buildFooter(),
              ],
            );
          },
        ),
      );

      // Save to temp directory
      final output = await getTemporaryDirectory();
      final fileName = 'ZinuRooms_Booking_$bookingId.pdf';
      final file = File('${output.path}/$fileName');
      await file.writeAsBytes(await pdf.save());

      debugPrint('[PDF] Receipt saved: ${file.path}');
      return file.path;
    } catch (e) {
      debugPrint('[PDF] Error generating receipt: $e');
      return null;
    }
  }

  /// Open PDF file
  static Future<void> openPdf(String filePath) async {
    try {
      await OpenFile.open(filePath);
    } catch (e) {
      debugPrint('[PDF] Error opening file: $e');
    }
  }

  // --- Private Helper Methods ---

  static pw.Widget _buildHeader() {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.center,
      children: [
        pw.Text(
          'ZINU ROOMS',
          style: pw.TextStyle(
            fontSize: 28,
            fontWeight: pw.FontWeight.bold,
            color: PdfColor.fromHex('#E63946'),
          ),
        ),
        pw.SizedBox(height: 8),
        pw.Text(
          'Booking Confirmation Receipt',
          style: pw.TextStyle(fontSize: 14, color: PdfColors.grey700),
        ),
        pw.SizedBox(height: 4),
        pw.Text(
          'Generated on ${DateFormat('dd MMM yyyy, hh:mm a').format(DateTime.now())}',
          style: pw.TextStyle(fontSize: 10, color: PdfColors.grey500),
        ),
      ],
    );
  }

  static pw.Widget _buildBookingId(String bookingId) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(20),
      decoration: pw.BoxDecoration(
        color: PdfColor.fromHex('#FEF3F2'),
        borderRadius: pw.BorderRadius.circular(8),
        border: pw.Border.all(color: PdfColor.fromHex('#E63946')),
      ),
      child: pw.Column(
        children: [
          pw.Text(
            'Booking ID',
            style: pw.TextStyle(fontSize: 12, color: PdfColors.grey600),
          ),
          pw.SizedBox(height: 8),
          pw.Text(
            '#$bookingId',
            style: pw.TextStyle(
              fontSize: 24,
              fontWeight: pw.FontWeight.bold,
              color: PdfColor.fromHex('#E63946'),
              letterSpacing: 2,
            ),
          ),
        ],
      ),
    );
  }

  static pw.Widget _buildSection(String title, List<pw.Widget> children) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(
          title,
          style: pw.TextStyle(
            fontSize: 14,
            fontWeight: pw.FontWeight.bold,
            color: PdfColors.grey800,
          ),
        ),
        pw.SizedBox(height: 12),
        ...children,
      ],
    );
  }

  static pw.Widget _buildInfoRow(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 4),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            label,
            style: pw.TextStyle(fontSize: 12, color: PdfColors.grey600),
          ),
          pw.Text(
            value,
            style: pw.TextStyle(
              fontSize: 12,
              fontWeight: pw.FontWeight.bold,
              color: PdfColors.grey800,
            ),
          ),
        ],
      ),
    );
  }

  static pw.Widget _buildTotalAmount(int amount) {
    final formatter = NumberFormat('#,###');
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(20),
      decoration: pw.BoxDecoration(
        color: PdfColor.fromHex('#E63946'),
        borderRadius: pw.BorderRadius.circular(8),
      ),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            'Total Amount',
            style: pw.TextStyle(fontSize: 16, color: PdfColors.white),
          ),
          pw.Text(
            'BDT ${formatter.format(amount)}',
            style: pw.TextStyle(
              fontSize: 24,
              fontWeight: pw.FontWeight.bold,
              color: PdfColors.white,
            ),
          ),
        ],
      ),
    );
  }

  static pw.Widget _buildFooter() {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.center,
      children: [
        pw.Divider(thickness: 1, color: PdfColors.grey300),
        pw.SizedBox(height: 16),
        pw.Text(
          'Thank you for choosing Zinu Rooms!',
          style: pw.TextStyle(
            fontSize: 12,
            fontWeight: pw.FontWeight.bold,
            color: PdfColors.grey700,
          ),
        ),
        pw.SizedBox(height: 8),
        pw.Text(
          'For any queries, please contact: support@zinurooms.com',
          style: pw.TextStyle(fontSize: 10, color: PdfColors.grey500),
        ),
        pw.SizedBox(height: 4),
        pw.Text(
          'Website: www.zinurooms.com | Phone: +880 1XXX-XXXXXX',
          style: pw.TextStyle(fontSize: 10, color: PdfColors.grey500),
        ),
      ],
    );
  }

  static String _getPaymentLabel(String method) {
    switch (method) {
      case 'bkash':
        return 'bKash';
      case 'nagad':
        return 'Nagad';
      case 'card':
        return 'Credit/Debit Card';
      case 'hotel':
        return 'Pay at Hotel';
      case 'stripe':
        return 'Stripe (Card)';
      default:
        return method;
    }
  }
}
