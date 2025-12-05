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
- **Testing / QA:** While no automated tests ship yet, `npm run verify` plus manual tab-by-tab smoke tests (home/shop/personal/settings) are recommended before pushing.
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
