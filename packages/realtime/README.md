# ZinuRooms Real-time WebSocket Server

Cloudflare Worker with Durable Objects for real-time dashboard updates.

## Features

- **Per-hotel WebSocket connections** - Each hotel gets its own Durable Object
- **Event broadcasting** - Push events to all connected clients
- **Auto-reconnect** - Client automatically reconnects on disconnect
- **Toast notifications** - Shows Bangla notifications for important events

## Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Install dependencies

```bash
cd packages/realtime
npm install
```

### 4. Deploy

```bash
npm run deploy
```

### 5. Set environment variables

```bash
wrangler secret put AUTH_SECRET
# Enter your secret key
```

## Usage

### Connect from Partner Dashboard

```tsx
import { RealtimeStatus } from "./components";

// In your dashboard
<RealtimeStatus hotelId={hotel.id} />;
```

### Push events from main app

```typescript
// When a new booking is created
await fetch("https://zinurooms-realtime.your-subdomain.workers.dev/push", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${AUTH_SECRET}`,
  },
  body: JSON.stringify({
    type: "NEW_BOOKING",
    hotelId: booking.hotelId,
    data: { bookingId: booking.id, guestName: booking.guestName },
  }),
});
```

## Event Types

| Event                 | Description           |
| --------------------- | --------------------- |
| `NEW_BOOKING`         | New booking created   |
| `BOOKING_CANCELLED`   | Booking was cancelled |
| `GUEST_CHECKED_IN`    | Guest checked in      |
| `GUEST_CHECKED_OUT`   | Guest checked out     |
| `PAYMENT_RECEIVED`    | Payment collected     |
| `ROOM_STATUS_CHANGED` | Room status updated   |

## Local Development

```bash
npm run dev
```

This starts the Worker locally at `http://localhost:8787`.

## Architecture

```
┌─────────────────┐      ┌─────────────────────────┐
│  Partner Portal │◄────►│  Cloudflare Worker      │
│  (Dashboard)    │ WS   │  + Durable Objects      │
└─────────────────┘      └───────────┬─────────────┘
                                     │
┌─────────────────┐                  │
│  Main Web App   │──── POST /push ──┘
│  (Bookings API) │
└─────────────────┘
```
