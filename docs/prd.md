# Vibe Hospitality Network - Product Requirements Document (PRD)

## 1. Goals and Background Context

### 1.1 Goals
* **Launch MVP:** Onboard **50 verified properties** in the pilot city with full amenities verification.
* **Occupancy & Revenue:** Achieve **60% average occupancy** across network properties within 6 months of launch.
* **User Satisfaction:** Maintain a **Net Promoter Score (NPS) > 50**, specifically tracking "Cleanliness" and "Check-in Experience" ratings.
* **Efficiency:** Achieve a **Customer Acquisition Cost (CAC) of < $5** per transacting user.
* **Platform Stability:** Ensure **99.9% uptime** for the Partner App (PMS) to prevent inventory sync errors.

### 1.2 Background Context
The budget hospitality market in our target region is highly fragmented. Travelers often face a "trust deficit" regarding basic amenities (hygiene, AC, WiFi) when booking non-branded guesthouses. Conversely, small hotel owners suffer from low visibility and rely on manual, error-prone operational methods.

This project aims to bridge this gap by launching a tech-enabled hospitality network (similar to the OYO model). We will provide travelers with a "3-click booking" experience for standardized rooms and empower hotel partners with a mobile-first Property Management System (PMS) to manage inventory and pricing in real-time.

### 1.3 Change Log
| Date       | Version | Description                                      | Author    |
| :---       | :---    | :---                                             | :---      |
| 2023-10-27 | 1.0     | Initial Draft based on Project Brief             | John (PM) |
| 2023-10-27 | 1.1     | Updated Tech Stack to Vercel/Next.js Ecosystem   | John (PM) |

## 2. Requirements

### 2.1 Functional Requirements (FR)

**User App (Traveler PWA)**
* **FR1 (Search & Filter):** Users must be able to search for hotels by City, Check-in/out Dates, and Number of Guests. Search results must support filtering by Price Range and "Pay at Hotel" availability.
* **FR2 (Listing Details):** Users must be able to view hotel details including high-resolution photos, list of verified amenities (AC, WiFi), and Google Maps location.
* **FR3 (Booking Flow):** Users must be able to complete a booking in under 3 clicks (Select Room -> Enter Guest Details -> Confirm).
* **FR4 (Payments):** System must support Mobile Wallets (bKash/Nagad/UPI) and Credit Cards via payment gateway, plus a "Pay at Hotel" option which marks the booking as "Reserved" rather than "Confirmed" until check-in.
* **FR5 (Booking Management):** Users must be able to view active bookings and cancel them (subject to cancellation policy) via the app.

**Partner App (PMS PWA - "Vibe Property Manager")**
* **FR6 (Inventory Toggle):** Hotel partners must be able to block/unblock specific rooms or dates instantly to prevent double-booking from offline walk-ins.
* **FR7 (Check-in/Check-out):** Partners must be able to check guests in by scanning a booking QR code or entering the Booking ID, updating the central inventory status immediately.
* **FR8 (Earnings Dashboard):** Partners must be able to view "Today's Earnings" and "Upcoming Bookings" on the home screen.

**Admin Dashboard (Internal Operations)**
* **FR9 (Onboarding):** Admins must be able to create new Hotel profiles, upload verified photos, and set base room rates.
* **FR10 (Commission Management):** System must calculate the platform commission (e.g., 20%) automatically per booking for payout reports.

### 2.2 Non-Functional Requirements (NFR)
* **NFR1 (Performance - Latency):** Search results must load within **< 2 seconds** on 4G networks (using Next.js Edge Caching).
* **NFR2 (Consistency):** Inventory synchronization between the User App and Partner App must be **near real-time (< 3 seconds)** using Server Actions and on-demand revalidation.
* **NFR3 (Scalability):** The backend must support auto-scaling (Serverless Functions) to handle seasonal spikes without manual intervention.
* **NFR4 (Security):** All payment data handling must be **PCI-DSS compliant**. Customer PII must be encrypted at rest.
* **NFR5 (Availability):** The Partner App API must maintain **99.9% availability**, as partners rely on it for physical check-ins.

## 3. User Interface Design Goals

### 3.1 Overall UX Vision
* **Traveler App:** "Frictionless & Trustworthy." Prioritize high-quality imagery and transparent pricing.
* **Partner App (PMS):** "Utilitarian & Robust." High contrast, large touch targets, and offline tolerance for busy hotel staff.

### 3.2 Key Interaction Paradigms
* **Mobile-First PWA:** Both apps must feel native (installable on home screen) but run in the browser.
* **Bottom Navigation:** Standard tab bar for core navigation (Search, Bookings, Profile).
* **Map-First Search:** Toggle availability to switch between list view and map view.
* **Scanner Interface:** Prominent FAB for QR code scanning in Partner App.

### 3.3 Core Screens
* **Traveler:** Home/Search, Hotel Detail (Hero Image), Booking Summary, User Profile.
* **Partner:** Dashboard (Today's Stats), Inventory Calendar, QR Scanner.

### 3.4 Accessibility & Branding
* **Target:** WCAG AA.
* **Visual Style:** Clean, minimalist, white-space heavy to convey hygiene. Primary color used sparingly for CTAs.

## 4. Technical Assumptions

### 4.1 Repository Structure
* **Structure:** Monorepo (Turborepo).
* **Apps:** `apps/web` (Traveler PWA), `apps/partner` (Hotelier PWA), `apps/admin` (Ops Dashboard).
* **Shared:** `packages/ui` (Components), `packages/db` (Schema/Drizzle), `packages/api` (Server Actions).

### 4.2 Technology Stack ("The Vercel Stack")
* **Framework:** **Next.js 14+ (App Router)**. Using React Server Components (RSC) for backend logic.
* **Database:** **Neon (Serverless PostgreSQL)** with **Drizzle ORM**.
* **Storage:** **Vercel Blob** for hotel images and user documents.
* **Authentication:** **Clerk** (Handling Multi-session & Phone Auth).
* **Maps:** **Google Maps API**.
* **Deployment:** **Vercel** (Zero-config, Edge Network).

### 4.3 Testing
* **Strategy:** Unit Tests (Vitest) for util functions. Integration Tests (Playwright) for critical booking flows.

## 5. Epic List

### Phase 1: Foundation & Supply (Weeks 1-4)
* **Epic 1: Vercel/Neon Foundation:** Initialize Monorepo, Setup Neon+Drizzle, Configure Clerk Auth, Deploy "Hello World".
* **Epic 2: Partner Core (Inventory Management):** Build Partner PWA, Real-time Room Toggle (Server Actions), Image Upload (Vercel Blob).

### Phase 2: Demand & Transactions (Weeks 5-8)
* **Epic 3: Traveler Experience (Search & Discovery):** Build Booking PWA, Geolocation Search (PostGIS), Hotel Detail Pages (Static+Revalidation).
* **Epic 4: Booking Engine & Payments:** Booking State Machine, Payment Gateway Integration (API Routes).

### Phase 3: Operations (Weeks 9-10)
* **Epic 5: Admin Operations & Settlement:** Internal dashboard for approvals and commission reports.