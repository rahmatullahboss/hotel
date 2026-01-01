// Stripe Payment Provider - Zinu Rooms (Riverpod 3.0)
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:dio/dio.dart';
import 'package:zinu_rooms/core/api/api_client.dart';
import 'package:zinu_rooms/core/providers/currency_provider.dart';

// Stripe publishable key (from environment or hardcoded for test)
const String stripePublishableKey = String.fromEnvironment(
  'STRIPE_PUBLISHABLE_KEY',
  defaultValue:
      'pk_test_51SirHkR4YQ09KMxr9eovrawaHmpnjgfwBgoI1sRiHf0wT1ciZ7SBFGcUUQpzKx86vRl3nFQC0Tdl4ll4TnjUru1X00f3JFVCZj',
);

// Initialize Stripe
Future<void> initializeStripe() async {
  Stripe.publishableKey = stripePublishableKey;
  await Stripe.instance.applySettings();
}

// Stripe Payment State
class StripePaymentState {
  final bool isLoading;
  final String? error;
  final bool isSuccess;
  final String? paymentIntentId;

  const StripePaymentState({
    this.isLoading = false,
    this.error,
    this.isSuccess = false,
    this.paymentIntentId,
  });

  StripePaymentState copyWith({
    bool? isLoading,
    String? error,
    bool? isSuccess,
    String? paymentIntentId,
  }) {
    return StripePaymentState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isSuccess: isSuccess ?? this.isSuccess,
      paymentIntentId: paymentIntentId ?? this.paymentIntentId,
    );
  }
}

// Stripe Payment Notifier (Riverpod 3.0)
class StripePaymentNotifier extends Notifier<StripePaymentState> {
  Dio get _dio => ref.read(dioProvider);

  @override
  StripePaymentState build() => const StripePaymentState();

  // Create payment intent and process payment
  Future<bool> processPayment({
    required String bookingId,
    required int amount,
  }) async {
    state = state.copyWith(isLoading: true, error: null, isSuccess: false);

    try {
      // Get current currency selection from provider
      final currencyState = ref.read(currencyProvider);
      final currency = currencyState.currency == Currency.usd ? 'usd' : 'bdt';

      // Step 1: Create payment intent on server
      final response = await _dio.post(
        '/payment/stripe/create-intent',
        data: {
          'bookingId': bookingId,
          'amount': amount,
          'currency': currency, // Send selected currency
        },
      );

      final data = response.data;
      if (data['success'] != true || data['clientSecret'] == null) {
        throw Exception(data['error'] ?? 'Failed to create payment intent');
      }

      final clientSecret = data['clientSecret'] as String;
      final paymentIntentId = data['paymentIntentId'] as String;

      // Step 2: Present payment sheet
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Zinu Rooms',
          style: ThemeMode.system,
          billingDetails: const BillingDetails(),
        ),
      );

      await Stripe.instance.presentPaymentSheet();

      // Step 3: Verify payment on server
      final verifyResponse = await _dio.post(
        '/payment/stripe/verify',
        data: {'paymentIntentId': paymentIntentId},
      );

      final verifyData = verifyResponse.data;
      if (verifyData['success'] == true &&
          verifyData['status'] == 'succeeded') {
        state = state.copyWith(
          isLoading: false,
          isSuccess: true,
          paymentIntentId: paymentIntentId,
        );
        return true;
      } else {
        throw Exception(verifyData['error'] ?? 'Payment verification failed');
      }
    } on StripeException catch (e) {
      // User cancelled or payment failed
      state = state.copyWith(
        isLoading: false,
        error: e.error.localizedMessage ?? 'Payment cancelled',
      );
      return false;
    } on DioException catch (e) {
      final apiError = ApiException.fromDioError(e);
      state = state.copyWith(isLoading: false, error: apiError.message);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // Reset state
  void reset() {
    state = const StripePaymentState();
  }
}

// Provider (Riverpod 3.0)
final stripePaymentProvider =
    NotifierProvider<StripePaymentNotifier, StripePaymentState>(
      StripePaymentNotifier.new,
    );
