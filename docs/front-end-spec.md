# Vibe Hospitality Network - UI/UX Specification

## 1. Introduction
This document defines the user experience goals, information architecture, and visual design specifications for **Vibe Hospitality**. It covers two distinct PWA applications:
1.  **Vibe Traveler (User App):** For guests searching and booking rooms.
2.  **Vibe Manager (Partner App):** For hotel owners managing inventory.

It serves as the foundation for the Frontend Architecture and development of the Next.js applications.

## 2. Overall UX Goals & Principles

### 2.1 Design Principles
* **Mobile-First & PWA-Native:** All interfaces are designed for touch first. Bottom sheets, swipe gestures, and "app-like" navigation (bottom tab bars) are standard.
* **Trust through Transparency:** High-resolution imagery and clear, upfront pricing (no hidden fees) are prioritized to combat the "trust deficit."
* **Operational Clarity (Partner App):** Large buttons, high contrast, and immediate feedback are essential for busy hotel staff. "Don't make them think."
* **Optimistic UI:** Actions like "Blocking a Room" should feel instant. We show the success state immediately while the Server Action syncs in the background.

### 2.2 Target Personas
* **The Budget Traveler (Ali):** 24 years old, student. Values: Low price, fast WiFi, "What I see is what I get." Pain point: Arriving to find a dirty room.
* **The Hotel Manager (Rahim):** 45 years old, busy owner. Values: Filling rooms, getting paid. Pain point: Overbooking because he forgot to update the app.

## 3. Information Architecture (IA)

### 3.1 Sitemap: Traveler App (`apps/web`)
```mermaid
graph TD
    Home[Home / Search] --> SearchResults[Search Results List/Map]
    SearchResults --> HotelDetail[Hotel Detail Page]
    HotelDetail --> BookingReview[Booking Review]
    BookingReview --> Payment[Payment Gateway]
    Payment --> BookingSuccess[Success / Ticket]
    
    Home --> Bookings[My Bookings]
    Bookings --> BookingDetail[Booking Detail]
    
    Home --> Profile[Profile]
    Profile --> Settings[Settings]
3.2 Sitemap: Partner App (apps/partner)

Code snippet
graph TD
    Dashboard[Dashboard (Today's Stats)]
    
    Dashboard --> Inventory[Inventory Calendar]
    Inventory --> RoomToggle[Block/Unblock Room]
    
    Dashboard --> Scanner[QR Scanner]
    Scanner --> CheckIn[Check-in Flow]
    
    Dashboard --> Earnings[Earnings Report]
4. Visual Design System
4.1 Color Palette

Primary (Brand): Vibe Red (#E63946) - Used for primary CTAs (Book Now, Check In).

Secondary: Deep Navy (#1D3557) - Used for headers, text, and trust indicators.

Background: Clean White (#FFFFFF) and Off-White (#F1FAEE) - Dominant background to convey hygiene.

Status Colors:

Success: #2A9D8F (Confirmed, Available)

Warning: #E9C46A (Pending Payment)

Error: #D00000 (Occupied, Cancelled)

4.2 Typography

Font Family: Inter (or system-ui) for maximum legibility on low-end devices.

Scale:

H1 (Hero Prices): 24px Bold

H2 (Section Headers): 18px SemiBold

Body: 16px Regular (Standard readability size)

Caption: 12px Medium (Secondary info like taxes)

4.3 Iconography

Library: Lucide React (Clean, lightweight, matches Next.js ecosystem).

Style: Outlined for general UI, Filled for active tab states.

5. Key User Flows & Screen Layouts
5.1 Traveler: The "3-Click" Booking

Home: Large "Where to?" input. Auto-detect location. Large "Search" button.

List View: Cards showing Photo + Price + Rating. "Pay at Hotel" tag prominent.

Detail: Hero image takes top 40% of screen. Amenities icons (AC, Wifi) clearly visible. Sticky footer with "Book Now" button.

Booking Sheet: Bottom sheet slides up. User confirms dates/guests. Selects "Pay at Hotel". Swipes to confirm.

5.2 Partner: Instant Inventory Block

Dashboard: Shows "Rooms Available: 5".

Inventory Tab: Grid view of rooms. Green = Free, Red = Occupied.

Action: Tap a Green room.

Confirmation: Room instantly turns Red (Optimistic UI). Toast message: "Room 101 Blocked".

6. Technical UX Requirements
6.1 PWA Specifics

Manifest: Must include distinct icons for web and partner apps.

Viewport: viewport-fit=cover to utilize the full notch area.

Touch Targets: All interactive elements must be at least 44x44px.

6.2 Loading States

Skeletons: Use Skeleton screens (pulsing gray boxes) matching the layout while Next.js Server Components stream data. No full-page spinners.

Streaming: The "Hotel Detail" page should show the Title/Image immediately while the "Reviews" section streams in (using <Suspense>).

6.3 Accessibility (WCAG AA)

Contrast: Partner app text must pass 4.5:1 contrast ratio (critical for outdoor use).

Forms: All inputs must have visible labels (no placeholder-only inputs).

Focus: Visible focus rings for keyboard/screen-reader navigation on Web.

7. Design Handoff Checklist
[ ] Tailwind CSS config defined (colors, fonts).

[ ] Lucide Icon set selected.

[ ] PWA manifest assets (icons, splash screens) prepared.

[ ] Skeleton components designed for List and Detail views.