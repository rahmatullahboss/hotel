ibe Hospitality Network - Fullstack Architecture

## 1. Introduction
This document outlines the fullstack architecture for **Vibe Hospitality**. It leverages the "Vercel Ecosystem" to provide a serverless, scalable, and developer-friendly foundation.
* **Core Philosophy:** "Serverless First." We rely on managed services (Neon, Vercel) to minimize DevOps overhead.
* **Unified Stack:** Both Frontend and Backend logic reside in Next.js, utilizing **React Server Components (RSC)** for data fetching and **Server Actions** for mutations.

## 2. High Level Architecture

### 2.1 Technical Summary
The system is a **Monorepo** containing three Next.js applications (`web`, `partner`, `admin`) and shared packages (`ui`, `db`, `config`). It is deployed on **Vercel**.
* **Data Layer:** **Neon (PostgreSQL)** accessed via **Drizzle ORM**.
* **Auth Layer:** **NextAuth.js (v5)** with Drizzle Adapter.
* **API Layer:** **Next.js Server Actions** for secure, type-safe mutations.
* **Media:** **Vercel Blob** for high-performance image delivery.

### 2.2 System Diagram
```mermaid
graph TD
    User[Traveler (PWA)] -->|HTTPS| WebApp[apps/web (Next.js)]
    Partner[Hotelier (PWA)] -->|HTTPS| PartnerApp[apps/partner (Next.js)]
    Admin[Ops Staff] -->|HTTPS| AdminApp[apps/admin (Next.js)]

    subgraph Vercel Cloud
        WebApp & PartnerApp & AdminApp -->|Auth| NextAuth[NextAuth.js]
        NextAuth -->|Adapter| NeonDB[(Neon Postgres)]
        WebApp & PartnerApp & AdminApp -->|Read/Write| ServerActions[Server Actions]
        ServerActions -->|SQL| NeonDB
        ServerActions -->|Upload| Blob[Vercel Blob]
        ServerActions -->|Maps| GoogleMaps[Google Maps API]
    end
3. Tech Stack
Category	Technology	Version	Purpose	Rationale
Framework	Next.js	14+ (App Router)	Fullstack Framework	React Server Components reduce client bundle size; Server Actions simplify API logic.
Language	TypeScript	5.x	Language	End-to-end type safety from DB to UI.
Monorepo	Turborepo	Latest	Build System	Fast, cached builds; easy dependency management for shared packages.
Database	Neon (Postgres)	Serverless	Relational DB	Scales to zero; branching workflow; reliable transactional integrity.
ORM	Drizzle	Latest	Data Access	Lightweight, type-safe, SQL-like syntax; better cold-start performance than Prisma.
Auth	NextAuth.js	v5 (Beta)	Authentication	Open-source; owns data; runs on Edge; tight integration with Next.js App Router.
Styling	Tailwind CSS	3.x	Styling	Utility-first; standardized design tokens across apps.
Components	shadcn/ui	Latest	UI Library	Accessible, copy-paste components; customizable implementation of Radix UI.
Validation	Zod	3.x	Schema Validation	Validates API inputs and Form data.
4. Repository Structure (Monorepo)
Plaintext
vibe-hospitality/
├── apps/
│   ├── web/                 # Traveler PWA (Next.js)
│   ├── partner/             # Hotelier PMS PWA (Next.js)
│   └── admin/               # Internal Dashboard (Next.js)
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── db/                  # Database Schema & Client
│   │   ├── schema/          # Drizzle definitions (inc. Auth tables)
│   │   └── index.ts         # DB connection export
│   ├── config/              # Shared configs (ESLint, TS)
│   └── api/                 # Shared Business Logic
├── turbo.json               # Turborepo pipeline config
└── package.json             # Root dependencies
5. Data Models (Core Schema)
5.1 Auth (NextAuth Standard Schema)

User: id, name, email, emailVerified, image, role (TRAVELER | PARTNER | ADMIN).

Account: Linked OAuth accounts (Google, Facebook).

Session: For database strategies (if not using JWT).

VerificationToken: For passwordless/email login magic links.

5.2 Supply (Hotels)

Hotel: id, ownerId (FK to User.id), name, address, location (PostGIS point), amenities (JSONB), status (ACTIVE | PENDING).

Room: id, hotelId (FK), type (SINGLE | DOUBLE), price, baseInventory (Int).

RoomInventory: id, roomId (FK), date, availableCount (Int), isBlocked (Boolean).

5.3 Demand (Bookings)

Booking: id, userId (FK), roomId (FK), checkIn, checkOut, status (PENDING | CONFIRMED | CHECKED_IN | CANCELLED), paymentStatus, totalAmount.

6. Key Architectural Patterns
6.1 Authentication (Auth.js v5)

Configuration: Shared auth.config.ts in packages/config imported by each app.

Middleware: middleware.ts in each app uses auth to protect routes (e.g., /dashboard redirects to login).

Session: Accessible in Server Components via auth() and Client Components via SessionProvider.

6.2 Server Actions for Mutations

Pattern: Actions are defined in apps/[app]/actions or packages/api.

Security: Every action starts with const session = await auth(). If !session, throw Unauthorized.

6.3 Shared UI System

Pattern: packages/ui exports "dumb" components (Buttons, Inputs).

Theming: Apps inject their own Tailwind themes.

7. Security & Performance Strategy
7.1 Security

Authentication: NextAuth handles session tokens (JWE by default).

Authorization: Role-based checks in Server Actions (e.g., if (session.user.role !== 'PARTNER') throw Forbidden).

Inputs: All inputs validated via Zod schemas.

7.2 Performance

Edge: Middleware runs on Vercel Edge for instant auth checks.

Image Optimization: next/image with Vercel Blob.

8. Development Workflow
Local: npm run dev starts all apps via Turborepo.

Database: npm run db:push pushes schema changes to Neon.