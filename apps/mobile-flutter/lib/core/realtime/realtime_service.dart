import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

/// Event types from real-time server
enum RealtimeEventType {
  newBooking,
  bookingCancelled,
  guestCheckedIn,
  guestCheckedOut,
  paymentReceived,
  roomStatusChanged,
  connected,
  pong,
}

/// Real-time event model
class RealtimeEvent {
  final RealtimeEventType type;
  final String? hotelId;
  final Map<String, dynamic>? data;
  final String? message;
  final int timestamp;

  RealtimeEvent({
    required this.type,
    this.hotelId,
    this.data,
    this.message,
    required this.timestamp,
  });

  factory RealtimeEvent.fromJson(Map<String, dynamic> json) {
    return RealtimeEvent(
      type: _parseEventType(json['type'] as String? ?? ''),
      hotelId: json['hotelId'] as String?,
      data: json['data'] as Map<String, dynamic>?,
      message: json['message'] as String?,
      timestamp:
          json['timestamp'] as int? ?? DateTime.now().millisecondsSinceEpoch,
    );
  }

  static RealtimeEventType _parseEventType(String type) {
    switch (type) {
      case 'NEW_BOOKING':
        return RealtimeEventType.newBooking;
      case 'BOOKING_CANCELLED':
        return RealtimeEventType.bookingCancelled;
      case 'GUEST_CHECKED_IN':
        return RealtimeEventType.guestCheckedIn;
      case 'GUEST_CHECKED_OUT':
        return RealtimeEventType.guestCheckedOut;
      case 'PAYMENT_RECEIVED':
        return RealtimeEventType.paymentReceived;
      case 'ROOM_STATUS_CHANGED':
        return RealtimeEventType.roomStatusChanged;
      case 'CONNECTED':
        return RealtimeEventType.connected;
      case 'PONG':
        return RealtimeEventType.pong;
      default:
        return RealtimeEventType.connected;
    }
  }
}

/// Real-time connection state
class RealtimeState {
  final bool isConnected;
  final RealtimeEvent? lastEvent;
  final String? error;

  const RealtimeState({this.isConnected = false, this.lastEvent, this.error});

  RealtimeState copyWith({
    bool? isConnected,
    RealtimeEvent? lastEvent,
    String? error,
  }) {
    return RealtimeState(
      isConnected: isConnected ?? this.isConnected,
      lastEvent: lastEvent ?? this.lastEvent,
      error: error,
    );
  }
}

/// Real-time WebSocket notifier using Riverpod 3.0+ API
class RealtimeNotifier extends Notifier<RealtimeState> {
  WebSocketChannel? _channel;
  Timer? _pingTimer;
  Timer? _reconnectTimer;
  final String _baseUrl = 'wss://realtime.digitalcare.site';
  String? _hotelId;

  @override
  RealtimeState build() {
    ref.onDispose(() {
      disconnect();
    });
    return const RealtimeState();
  }

  /// Connect to WebSocket for a specific hotel
  void connect(String hotelId) {
    _hotelId = hotelId;
    _doConnect();
  }

  void _doConnect() {
    if (_hotelId == null) return;

    try {
      final uri = Uri.parse('$_baseUrl/ws/$_hotelId');
      _channel = WebSocketChannel.connect(uri);

      _channel!.stream.listen(_onMessage, onError: _onError, onDone: _onDone);

      // Start ping timer (every 30 seconds)
      _pingTimer?.cancel();
      _pingTimer = Timer.periodic(const Duration(seconds: 30), (_) {
        _sendPing();
      });
    } catch (e) {
      state = state.copyWith(
        isConnected: false,
        error: 'Failed to connect: $e',
      );
      _scheduleReconnect();
    }
  }

  void _onMessage(dynamic message) {
    try {
      final json = jsonDecode(message as String) as Map<String, dynamic>;
      final event = RealtimeEvent.fromJson(json);

      state = state.copyWith(isConnected: true, lastEvent: event, error: null);
    } catch (e) {
      // Ignore malformed messages
    }
  }

  void _onError(Object error) {
    state = state.copyWith(
      isConnected: false,
      error: 'Connection error: $error',
    );
    _scheduleReconnect();
  }

  void _onDone() {
    state = state.copyWith(isConnected: false);
    _scheduleReconnect();
  }

  void _sendPing() {
    if (_channel != null && state.isConnected) {
      try {
        _channel!.sink.add(jsonEncode({'type': 'PING'}));
      } catch (_) {
        // Connection might be closed
      }
    }
  }

  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      _doConnect();
    });
  }

  /// Disconnect from WebSocket
  void disconnect() {
    _pingTimer?.cancel();
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _channel = null;
    state = const RealtimeState();
  }
}

/// Provider for real-time service
final realtimeProvider = NotifierProvider<RealtimeNotifier, RealtimeState>(() {
  return RealtimeNotifier();
});

/// Provider to check if connected
final isRealtimeConnectedProvider = Provider<bool>((ref) {
  return ref.watch(realtimeProvider).isConnected;
});

/// Provider for last event
final lastRealtimeEventProvider = Provider<RealtimeEvent?>((ref) {
  return ref.watch(realtimeProvider).lastEvent;
});
