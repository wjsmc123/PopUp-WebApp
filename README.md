# PopUp Concierge Web App

A modernized version of the PopUp concierge experience rebuilt on the Next.js App Router. The app serves bespoke event guests with live schedules, in-venue commerce, concierge messaging, and weather context pulled directly from Supabase data.

## Purpose
- Deliver a secure, mobile-first dashboard that feels native while running fully in the browser.
- Maintain real-time parity with Supabase data for profiles, events, schedules, and shop inventory.
- Provide instant visual feedback with route-specific skeletons so navigation never displays blank states.
- Surface live weather data per event location using Open-Meteo for richer itinerary context.

## Tech Stack
- **Framework:** Next.js 14 (App Router, Server Actions) + React 18 + TypeScript.
- **Styling:** Tailwind CSS with a lightweight theme helper (`getThemeClasses`).
- **State / Data:** TanStack Query 5 for caching + background refresh, Zustand for auth/session, Supabase (Postgres + Realtime) as the backend.
- **API Integrations:** Supabase for data/auth, Open-Meteo for weather, Lucide React for icons.

## Getting Started
### Prerequisites
- Node.js 18.17+ (Next.js 14 requirement)
- npm 9+
- A Supabase project with the tables used by this app (`profiles`, `events`, `schedule_items`, `products`).

### Installation
1. **Clone** the repository and move into it.
2. **Install** dependencies:
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in the Supabase URL and anon key from your project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Run the dev server:**
   ```bash
   npm run dev
   ```
5. (Optional) **Verify local setup:**
   ```bash
   npm run verify
   ```
   The script checks for required env vars and dependency versions.

### Supabase Notes
- The app assumes the following tables: `profiles`, `events`, `schedule_items`, `products`.
- `profiles` must include at least: `id`, `first_name`, `booking_ref`, `event_id`, `whatsapp_number`.
- `events` should include metadata plus `coordinates` ("lat,lon") to enable weather lookups.
- `schedule_items` and `products` rows are filtered by `event_id`.
- Realtime updates: the `profiles` table needs Realtime enabled for row updates so `useProfileRealtime` can keep the UI synced.

## npm Scripts
| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server at `http://localhost:3000`. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint using Next.js defaults. |
| `npm run verify` | Sanity-check required environment variables and tooling. |
| `npm run test` | Run all unit tests in watch mode. |
| `npm run test:ui` | Open Vitest UI dashboard to visualize test runs. |
| `npm run test:security` | Run comprehensive security test suite (unit + client-side). |
| `npm run test:e2e` | Run end-to-end browser tests against test database. |
| `npm run test:e2e:ui` | Run E2E tests in interactive UI mode. |
| `npm run security:scan` | Audit dependencies for known vulnerabilities. |
| `npm run security:full` | Run all security checks: unit tests + E2E + npm audit. |

## Project Layout
```
app/
  layout.tsx           # Root layout – applies shared chrome, Providers, and Supabase auth redirect logic
  loading.tsx          # Global route-aware skeleton switcher
  page.tsx             # Home (schedule/weather) view
  shop/page.tsx        # Commerce tab, uses Product skeletons
  personal/page.tsx    # Guest profile + concierge contact info
  settings/page.tsx    # Preferences tab
  login/               # Authentication entry
components/
  DashboardLayout.tsx  # Wraps all authenticated routes, handles data prefetch + offline UI
  Skeletons.tsx        # Centralized skeleton definitions per route
  BottomDock.tsx, LoadingScreen.tsx, OfflineBanner.tsx, etc.
hooks/
  useNetworkStatus.ts  # Tracks offline state
  useProfileRealtime.ts# Supabase Realtime listener for profile changes
lib/
  supabase/            # Browser + server Supabase clients
  store/               # Zustand auth store
  utils.ts             # Mapping helpers + theming utilities
  weather.ts           # Open-Meteo fetch + parsing helpers
scripts/
  verify-setup.js      # Helps CI/onboarding validate configuration
```

## Architecture & Data Flow
- **Authentication & Session:** Credentials are checked via Supabase (`signIn` server action). User + event data live in a persisted Zustand store (`authStore`). `DashboardLayout` redirects to `/login` when no user is hydrated.
- **Server Actions:** Located in `app/actions.ts`. They call Supabase on the server, map rows to typed DTOs, and are consumed by React Query hooks for caching.
- **Caching Strategy:** TanStack Query caches event/schedule/product data for 5 minutes and prefetches upcoming tabs, so switching routes feels instant while still refreshing in the background.
- **Realtime Updates:** `useProfileRealtime` subscribes to Supabase channel updates per user and patches the Zustand store whenever profile data changes.
- **Weather Integration:** When an event exposes `coordinates`, `getEvent` enriches the record with current weather from Open-Meteo via `lib/weather.ts` so the Home tab always shows fresh data.
- **Skeletons & Loading:** `app/loading.tsx` uses `usePathname` to pick the right skeleton (`HomeSkeleton`, `ShopSkeleton`, etc.), ensuring every route has an immediate placeholder. Components can still render their own fallbacks (e.g., product grid shimmer) for data-level loading states.
- **Offline Awareness:** `useNetworkStatus` drives `OfflineBanner`, and React Query stays resilient via `refetchOnReconnect`.

## Development Guidelines
- **Component Organization:** Feature-specific UI generally lives beside the route inside `app/`, while reusable primitives sit under `components/`.
- **Styling:** Tailwind is the default. Theme tokens from `getThemeClasses` supply colors/typography per event theme.
- **Type Safety:** Shared types (`UserProfile`, `EventConfig`, etc.) live in `types/`; mapping helpers in `lib/utils.ts` convert Supabase rows to these types.

## Testing & Security

### Test Infrastructure
The app includes a comprehensive security test suite with **70+ automated tests** covering authentication, input validation, injection prevention, and end-to-end browser security.

**Testing Tools:**
- **Vitest:** Unit test runner with jsdom environment for isolated testing (no real database access).
- **Playwright:** End-to-end browser automation across Chrome, Firefox, Safari, and mobile viewports.
- **dotenv:** Environment variable loading for separate test database configuration.

### Running Tests

**Unit & Client-Side Security Tests (Safe - Fully Mocked)**
```bash
npm run test:security
```
Runs 36+ tests covering:
- SQL/NoSQL injection prevention
- XSS attack blocking
- Input validation (empty, null, length limits, special chars)
- Authorization & access control
- Error information disclosure
- Timing attack resistance
- Session/localStorage security

**End-to-End Browser Tests (Against Separate Test Database)**
```bash
npm run test:e2e
```
Runs 25+ Playwright tests covering:
- Full login flows and session management
- Profile updates via browser
- Real-time data synchronization
- Offline behavior
- Network security headers
- DoS/rate-limiting scenarios

**Interactive Test Dashboard**
```bash
npm run test:ui
```
Opens Vitest UI for visual test debugging at `http://localhost:51204`.

**Full Security Audit**
```bash
npm run security:full
```
Runs all tests (unit + E2E) plus dependency vulnerability scanning.

### Test Environment Setup

**Important:** E2E tests run against a separate **test Supabase database**, never your production instance.

1. **Create a test Supabase project:**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Create a new project named `popup-webapp-test`
   - Get the project URL and anon key from Settings → API

2. **Duplicate your database schema:**
   - Tables needed: `profiles`, `events`, `schedule_items`, `products`
   - Use Supabase UI: Tables → right-click → Duplicate
   - Or use `pg_dump` to export/import schema

3. **Configure `.env.test`:**
   ```bash
   # .env.test (already created, fill in your test project values)
   NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key-here
   TEST_USER_BOOKING_REF=TEST-SEC-001
   TEST_USER_FIRST_NAME=Security
   ```

4. **Run E2E tests in parallel with dev server:**
   ```bash
   # Terminal 1: Start dev server (uses .env.local with production DB)
   npm run dev

   # Terminal 2: Run E2E tests (uses .env.test with test DB)
   npm run test:e2e
   ```

### Test File Organization
```
tests/
  setup.ts                     # Shared mock data and test config
  security/
    auth.test.ts               # Authentication & SQL injection prevention
    client-side.test.ts        # Zustand/localStorage/session security
  e2e/
    security.spec.ts           # Browser-based security flows
vitest.security.config.ts      # Test runner config (includes unit + client-side)
vitest.config.ts               # Main unit test config
playwright.config.ts           # E2E test config with dotenv loader
```

### CI/CD Integration
To integrate tests into your CI pipeline (GitHub Actions, GitLab CI, etc.):
```bash
# Example GitHub Actions workflow
npm run verify       # Check dependencies
npm run test:security   # Run unit tests (safe, no DB)
npm run lint         # Check code quality
npm run security:scan   # Audit dependencies
```

For full E2E validation in CI, you'll need test database credentials as GitHub Secrets, then add `npm run test:e2e` to your workflow.

## Development Guidelines
- **Component Organization:** Feature-specific UI generally lives beside the route inside `app/`, while reusable primitives sit under `components/`.
- **Styling:** Tailwind is the default. Theme tokens from `getThemeClasses` supply colors/typography per event theme.
- **Type Safety:** Shared types (`UserProfile`, `EventConfig`, etc.) live in `types/`; mapping helpers in `lib/utils.ts` convert Supabase rows to these types.
- **Deployments:** The app expects the same Supabase env vars at build and runtime. For production, run `npm run build` then `npm run start` behind your preferred hosting provider (Vercel, Fly, etc.).

## Troubleshooting
- **Blank screen after login:** Ensure `NEXT_PUBLIC_SUPABASE_*` vars are set and that the Supabase tables contain data for the booking reference being used.
- **Weather missing:** Confirm the event row has valid coordinates in `"lat,lon"` form and that outgoing requests to `api.open-meteo.com` are allowed.
- **Realtime not firing:** Enable Realtime on the `profiles` table and confirm Row Level Security policies permit UPDATE broadcasts.
- **Styles look off:** Tailwind relies on the `content` globs in `tailwind.config.ts`; if you move files, update those globs so classes aren't purged.

## Next Steps for New Contributors
1. Read through `DashboardLayout.tsx` to understand the authenticated shell and data prefetching logic.
2. Explore `components/Skeletons.tsx` and `app/loading.tsx` to keep the skeleton system consistent when shipping new routes.
3. When integrating new Supabase tables, add mapping helpers in `lib/utils.ts`, extend `types/`, and wrap fetches inside server actions so React Query can manage them.

Welcome aboard! Reach out in the team channel if you need schema exports or seed data.
