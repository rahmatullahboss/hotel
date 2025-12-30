/**
 * ZinuRooms Real-time WebSocket Server
 * 
 * Cloudflare Durable Objects based WebSocket server for:
 * - Live booking notifications
 * - Check-in/Check-out updates
 * - Dashboard real-time updates
 */

export interface Env {
  HOTEL_ROOM: DurableObjectNamespace;
  AUTH_SECRET?: string;
}

// Event types that can be pushed to clients
export type EventType = 
  | 'NEW_BOOKING'
  | 'BOOKING_CANCELLED'
  | 'GUEST_CHECKED_IN'
  | 'GUEST_CHECKED_OUT'
  | 'PAYMENT_RECEIVED'
  | 'ROOM_STATUS_CHANGED';

export interface RealtimeEvent {
  type: EventType;
  hotelId: string;
  data: Record<string, unknown>;
  timestamp: number;
}

// Main Worker entry point
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Health check
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // WebSocket connection: /ws/:hotelId
    if (url.pathname.startsWith('/ws/')) {
      const hotelId = url.pathname.split('/')[2];
      if (!hotelId) {
        return new Response('Hotel ID required', { status: 400 });
      }

      // Get or create Durable Object for this hotel
      const id = env.HOTEL_ROOM.idFromName(hotelId);
      const stub = env.HOTEL_ROOM.get(id);

      // Forward request to Durable Object
      return stub.fetch(request);
    }

    // Push event endpoint: POST /push
    // Used by main app to broadcast events
    if (url.pathname === '/push' && request.method === 'POST') {
      try {
        // Optional: Verify auth secret
        const authHeader = request.headers.get('Authorization');
        if (env.AUTH_SECRET && authHeader !== `Bearer ${env.AUTH_SECRET}`) {
          return new Response('Unauthorized', { status: 401 });
        }

        const event = await request.json() as RealtimeEvent;
        
        if (!event.hotelId || !event.type) {
          return new Response('Invalid event format', { status: 400 });
        }

        // Get Durable Object for this hotel and broadcast
        const id = env.HOTEL_ROOM.idFromName(event.hotelId);
        const stub = env.HOTEL_ROOM.get(id);

        // Forward to Durable Object's broadcast endpoint
        const response = await stub.fetch(new Request('http://internal/broadcast', {
          method: 'POST',
          body: JSON.stringify(event),
        }));

        return response;
      } catch (error) {
        return new Response('Invalid JSON', { status: 400 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};

/**
 * HotelRoom Durable Object
 * 
 * Manages WebSocket connections for a single hotel.
 * Each hotel gets its own Durable Object instance.
 */
export class HotelRoom {
  private connections: Set<WebSocket> = new Set();
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Internal broadcast endpoint
    if (url.pathname === '/broadcast') {
      const event = await request.json() as RealtimeEvent;
      this.broadcast(event);
      return new Response(JSON.stringify({ success: true, clients: this.connections.size }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket connection
    this.state.acceptWebSocket(server);
    this.connections.add(server);

    // Send welcome message
    server.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'Connected to ZinuRooms real-time server',
      timestamp: Date.now(),
    }));

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  // Called when a WebSocket receives a message
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const data = JSON.parse(message as string);
      
      // Handle ping
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch {
      // Ignore invalid messages
    }
  }

  // Called when a WebSocket closes
  async webSocketClose(ws: WebSocket) {
    this.connections.delete(ws);
  }

  // Called on WebSocket error
  async webSocketError(ws: WebSocket) {
    this.connections.delete(ws);
  }

  // Broadcast event to all connected clients
  private broadcast(event: RealtimeEvent) {
    const message = JSON.stringify({
      ...event,
      timestamp: event.timestamp || Date.now(),
    });

    for (const ws of this.connections) {
      try {
        ws.send(message);
      } catch {
        // Remove dead connections
        this.connections.delete(ws);
      }
    }
  }
}

