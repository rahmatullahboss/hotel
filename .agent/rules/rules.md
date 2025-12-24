---
trigger: always_on
---

# Helper Guide for AI Agents

This document provides context and guidelines for AI agents working on the **ZinuRooms** project.

## Project Overview

ZinuRooms is a hotel booking platform built as a Monorepo. It serves travelers (User App), partners (Hotel Owners), and administrators.

- **Monorepo Manager**: TurboRepo (`npm`)
- **Key Apps**:
  - `apps/web`: Tenant facing application (Travelers).
  - `apps/admin`: Admin dashboard for internal management.
  - `apps/partner`: Partner dashboard for hotel owners.
  - `apps/mobile`: Native mobile application (iOS/Android).
- **Shared Packages**:
  - `packages/db`: Database schema and client.
  - `packages/ui`: Shared design system/components.
  - `packages/config`: Shared ESLint/TS configs.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Neon Serverless Postgres
- **ORM**: Drizzle ORM (NOT Prisma)
  - Schema location: `packages/db/src/schema/`
  - Client location: `packages/db/src/index.ts`
- **Authentication**: NextAuth.js (v5 Beta)
- **Styling**: Tailwind CSS + Custom CSS (`globals.css`)
  - **Note**: Extensive custom BEM-like classes (e.g., `.btn-primary`, `.card`) are defined in `globals.css` and used alongside Tailwind utilities.
- **Maps**: Leaflet (`react-leaflet`)
- **Icons**: `react-icons` (Required for Web/Admin). For Mobile, use `@expo/vector-icons`.

## Web App Strategy (Next.js 16)

**Architecture**: "Modular Monolith" (Feature-based).
**Rendering**: Server Components (RSC) by default + Partial Prerendering (PPR) for dynamic holes.
**State**: Server Actions for mutations + URL Search Params for searchable state.

### "Million Dollar Web App" Guidelines

1.  **Server-First Mental Model**:
    - **Fetch on Server**: Use `await db.query()` directly in Page/Layout components.
    - **No API Routes**: Replace `pages/api` with **Server Actions** for form submissions and mutations.
    - **Cached by Default**: leverage `common/ui` components but keep them dumb.

2.  **Advanced Performance (2025 Standard)**:
    - **PPR (Partial Prerendering)**: Static shell (Navbar/Footer) loads instantly; dynamic parts (Price/Availability) stream in.
    - **React Compiler**: Enabled. No need for `useMemo` or `useCallback` anymore.
    - **Image Optimization**: `next/image` with AVIF/WebP and `placeholder="blur"`.

3.  **Modern UX Patterns**:
    - **Optimistic UI**: Update UI _immediately_ on click, rollback on error (via `useOptimistic`).
    - **Playful Interactions**: Use framer-motion for micro-interactions (e.g., button press, toast slide-in).
    - **Clean URL State**: Store filters/modals in URL params (`?modal=login`, `?filter=luxury`) to make everything shareable.

4.  **Dev Workflow**:
    - `npm run dev:web` to focus on the tenant app.
    - Use `TurboPack` (enabled by default) for instant HMR.

- **Icons**: `react-icons` (Required for Web/Admin). For Mobile, use `@expo/vector-icons`.

## Mobile App Strategy (Expo/React Native) - LEGACY

> [!NOTE]
> The Expo app (`apps/mobile`) is being replaced with Flutter (`apps/mobile-flutter`) to fix Bengali text clipping issues.

**Framework**: React Native 0.81+ via Expo SDK 54.
**Navigation**: Expo Router (File-based, Deep Link native).
**Engine**: Hermes + New Architecture (Fabric/TurboModules).

### "Million Dollar App" Architecture

To achieve premium quality and scalability, follow these guidelines:

1.  **Feature-Based Structure**:
    - `src/features/auth`, `src/features/booking`, etc.
    - Avoid grouping by file type (e.g., all components in one folder).

2.  **State Management**:
    - **Zustand**: Global UI state (Theme, Auth, Modals).
    - **TanStack Query (v5)**: Server state, caching, offline support.
    - **MMKV**: Fast local persistence.

3.  **High-Performance UI**:
    - **NativeWind v4**: Tailwind for Native.
    - **FlashList**: Shopify's list component (5x-10x faster than FlatList).
    - **Reanimated 4**: 120 FPS animations.
    - **Expo Image**: Best-in-class caching and blurring.

4.  **Dev & CI/CD**:
    - Run `npm run dev:mobile` (or `expo start` in `apps/mobile`).
    - Use **EAS Build** and **EAS Update** for cloud builds and OTA updates.

---

## Mobile App Strategy (Flutter) - ACTIVE

> [!IMPORTANT]
> **Use `apps/mobile-flutter` for all new mobile development.** Flutter provides better Bengali/multi-language text rendering.

**Framework**: Flutter 3.38+ (Dart 3.10+)
**Navigation**: go_router (declarative, URL-based)
**State**: Riverpod (reactive caching and data-binding)

### Flutter Project Structure

```
apps/mobile-flutter/
├── lib/
│   ├── main.dart                    # Entry point
│   ├── core/
│   │   ├── api/api_client.dart      # Dio + auth interceptor
│   │   ├── router/app_router.dart   # go_router config
│   │   ├── storage/secure_storage.dart
│   │   └── theme/                   # Colors, typography, theme
│   ├── features/                    # Feature-based modules
│   │   ├── auth/
│   │   ├── home/
│   │   ├── search/
│   │   ├── bookings/
│   │   ├── profile/
│   │   └── hotel/
│   └── shared/widgets/              # Reusable components
├── assets/fonts/                    # Noto Sans Bengali fonts
└── pubspec.yaml
```

### Flutter Key Dependencies

```yaml
flutter_riverpod: ^2.6.1      # State management
go_router: ^15.1.3            # Navigation
dio: ^5.9.0                   # HTTP client
flutter_secure_storage        # Token storage
google_sign_in                # Auth
cached_network_image          # Image caching
google_fonts                  # Bengali font (Noto Sans Bengali)
```

### Flutter Dev Commands

```bash
# Navigate to Flutter project
cd apps/mobile-flutter

# Get dependencies
flutter pub get

# Run on connected device/emulator
flutter run

# Analyze code (use Dart MCP for best results)
flutter analyze

# Build release APK
flutter build apk --release
```

### Flutter AI Agent Guidelines

1. **Always use Dart MCP** for code analysis:
   - `mcp_dart-mcp-server_analyze_files` - Check for errors
   - `mcp_dart-mcp-server_dart_fix` - Auto-fix lint issues
   - `mcp_dart-mcp-server_dart_format` - Format code
   - `mcp_dart-mcp-server_run_tests` - Run tests

2. **Use Context7 MCP** for Flutter/Riverpod/go_router docs:
   - `/cfug/dio` - Dio HTTP client docs
   - `/websites/riverpod_dev` - Riverpod docs
   - `/websites/pub_dev-go_router` - go_router docs

3. **Bengali Text Best Practices**:
   - Always use `NotoSansBengali` font family
   - Set `height: 1.3` or higher for line height
   - Avoid `maxLines: 1` for Bengali text when possible
   - Use `overflow: TextOverflow.ellipsis` carefully

4. **Feature-Based Pattern**:
   - Each feature has `presentation/`, `providers/`, and optionally `models/`
   - Screens are `ConsumerWidget` (Riverpod)
   - Use providers for all API calls

### Flutter Key Rules

1. **Use ConsumerWidget/ConsumerStatefulWidget** for Riverpod integration
2. **Secure storage** for tokens (`flutter_secure_storage`)
3. **go_router** for all navigation (not Navigator.push)
4. **Dio interceptors** for auth token injection
5. **CachedNetworkImage** for all network images

## AI Agent Resources

> [!IMPORTANT]
> **Always use the `expo-docs` MCP server** for fetching the latest Expo/React Native documentation. Do NOT rely on training data which may be outdated.

Available MCP tools for Expo documentation:

- `mcp_expo-docs_search_expo_docs` - Search through Expo docs
- `mcp_expo-docs_get_expo_api_reference` - Get API reference for specific SDK modules (e.g., `expo-camera`, `expo-location`)
- `mcp_expo-docs_get_expo_doc_content` - Get full content of a documentation page
- `mcp_expo-docs_get_expo_quick_start` - Get quick start guide
- `mcp_expo-docs_list_expo_sections` - List available doc sections

**Example usage:**

```
When implementing expo-location, first call:
mcp_expo-docs_get_expo_api_reference(module: "expo-location")
```

## Key Project Rules

1.  **Strictly No Inline Styles**: Avoid `style={{ ... }}`. Use Tailwind classes or the defined custom classes in `globals.css`.
2.  **Use React Icons**: Always use imports from `react-icons/*` for iconography.
3.  **Build Before Commit**: Ensure `turbo run build` passes before finalizing large changes.
4.  **Database Changes**:
    - Modify schema in `packages/db/src/schema/`.
    - Run `npm run db:generate` and `npm run db:push` (from root or filtered to `@repo/db`) to apply changes.
    - **Do NOT** look for `prisma/schema.prisma`; it does not exist.

## Directory Structure

```
/
├── apps/
│   ├── web/       # Main User App (Next.js)
│   ├── admin/     # Admin Dashboard (Next.js)
│   └── partner/   # Hotel Partner Dashboard (Next.js)
├── packages/
│   ├── db/        # Drizzle ORM, Schema, Seeds
│   ├── ui/        # Shared React Components
│   └── config/    # Shared Definitions
├── .env           # Environment variables (Root)
├── package.json   # Root Dependencies & Workspaces
└── turbo.json     # TurboRepo Pipeline
```

## Common Workflows

- **Running Dev Server**: `npm run dev` (Starts all apps).
- **Running Specific App**: `npm run dev:web` (Starts only the web app).
- **Database Studio**: `npm run db:studio` (Drizzle Studio to view data).

## Theme & Design System

The Global CSS (`apps/web/app/globals.css`) defines:

- **Colors**:
  - Primary: Zinu Red (`#E63946`)
  - Secondary: Deep Navy (`#1D3557`)
  - Background: Off-white (`#F1FAEE`) for hygiene feel.
- **Components**:
  - Cards: `.card`, `.card-image`, `.card-body`
  - Buttons: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
  - Typography: Geist Sans (Variable font).

## Gotchas & Hints

- **Leaflet SSR**: Map components using `react-leaflet` must be dynamically imported with `ssr: false` in Next.js to avoid "window is not defined" errors.
- **Monorepo Imports**: Internal packages are imported via `@repo/*` (e.g., `import { db } from "@repo/db"`).
- **Auth**: Usage of `auth()` from `auth.ts` (NextAuth v5 pattern).
