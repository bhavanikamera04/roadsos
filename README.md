# RoadSoS

RoadSoS is a small client-first web application for AI-assisted emergency response. It ranks nearby hospitals using trauma capability, ICU availability, distance, and availability; collects emergency contacts; and provides a set of emergency actions (notify contacts, call hospital, first aid guidance). The project is built with React + TypeScript, Vite, TailwindCSS and uses Supabase for backend services (optional during local development).

**This documentation** covers project purpose, architecture, developer setup, runtime behaviour, and troubleshooting steps to run locally and prepare for production.

**Quick links**
- **Source:** [src](src)
- **Supabase schema:** [supabase/schema.sql](supabase/schema.sql)
- **Dev server:** `npm run dev`
- **Production build:** `npm run build`

**Table of contents**
1. Project overview
2. Architecture and folder map
3. Key modules and responsibilities
4. Local development and environment
5. Supabase integration and stub behavior
6. Running and testing emergency flows
7. Troubleshooting
8. Contributing

## 1. Project overview

RoadSoS aims to give bystanders and victims an immediate way to notify emergency contacts and hospitals with contextual intelligence about the best receiving hospital. The UI provides both a full app and a lightweight bystander page.

Core features:
- Crash detection and sensor simulation
- Smart hospital ranking (trauma, ICU, distance, 24hr)
- Emergency contact management
- Emergency action execution (SMS/WhatsApp, call 108, notify hospital)

## 2. Architecture and folder map

Top-level layout (relevant files):

- `src/` — main application code
  - `main.tsx` — React entry; renders either `Bystander` or `App`.
  - `App.tsx` — core UI and emergency trigger flows.
  - `index.css` — Tailwind + base styles.
  - `api/` — external service clients
    - `supabase.ts` — Supabase client (safe dev stub included).
  - `components/` — UI components (e.g., `EmergencyTabs.tsx`, `HospitalCard.tsx`, `ContactSetup.tsx`).
  - `core/` — core algorithms
    - `routing/scoring.ts` — hospital scoring implementation used by `useHospitals`.
  - `hooks/` — React hooks (e.g., `useAuth.ts`, `useHospitals.ts`, `useSensor.ts`, `useEmergency.ts`, `useIncident.ts`).
  - `repositories/` — DB access layer (e.g., `hospitalRepository.ts`, `incidentRepository.ts`).
  - `services/` — higher level operations (e.g., `emergencyService.ts`).
  - `utils/` — utilities (e.g. `detection.ts`, `scoring.ts`, `emergency.ts`).

Files to inspect for behaviour and flow:
- App entry: [src/main.tsx](src/main.tsx)
- Supabase client: [src/api/supabase.ts](src/api/supabase.ts)
- Hospital scoring: [src/core/routing/scoring.ts](src/core/routing/scoring.ts)
- Emergency action definitions: [src/utils/emergency.ts](src/utils/emergency.ts)

## 3. Key modules and responsibilities

- `useSensor` (`src/hooks/useSensor.ts`): manages device sensors or a deterministic simulator when sensors are not available. Exposes `crashScore`, `isMonitoring`, `countdown`, and control methods.
- `useHospitals` (`src/hooks/useHospitals.ts`): acquires the user's location, fetches hospitals via `HospitalRepository`, then ranks them via `scoreHospitals` from `core/routing/scoring.ts`.
- `scoreHospitals` (`src/core/routing/scoring.ts`): computes distance using Haversine, a normalized distance score, and a weighted final score combining trauma, distance, ICU, and 24-hour availability.
- `EmergencyService` (`src/services/emergencyService.ts`): orchestrates real-world actions like invoking Supabase Edge functions, local first-aid guidance, and returns an `ActionResult[]` describing outcome statuses.
- `useAuth` (`src/hooks/useAuth.ts`): wraps Supabase auth calls to provide current user and sign-in/out helpers.
- Repositories: `HospitalRepository` and `IncidentRepository` abstract Supabase queries and RPC calls.

## 4. Local development and environment

Prerequisites:
- Node.js 18+ (recommended)
- npm

Install and run locally:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Environment variables (for real Supabase integration):
- Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=https://your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If these variables are absent the project uses a development-safe Supabase stub (see next section).

## 5. Supabase integration and stub behaviour

- `src/api/supabase.ts` will create a real Supabase client when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.
- When env vars are missing the file provides a safe stub that:
  - is chainable/awaitable for common query shapes (so `supabase.from(...).select(...).eq(...)` won't crash),
  - provides `auth.getSession()` and `auth.onAuthStateChange()` no-op implementations,
  - returns empty arrays for query data, and
  - throws a clear error if a function invocation is attempted (so you can see the missing backend).

This stub is intended solely for local development so the UI can mount and be tested without a backend. Replace with real env vars to enable full backend functionality.

## 6. Running and testing emergency flows

1. Start dev server: `npm run dev` and open `http://localhost:5173`.
2. The app runs with a stubbed Supabase client when env vars are missing — you'll see a console warning stating this.
3. To manually test a crash/emergency flow:
   - Toggle or start monitoring in the UI (the app simulates sensors on desktop). The `TAP TO ACTIVATE` button will begin simulation.
   - When the simulated crash triggers and the countdown completes, the app fires the emergency sequence (updates incident, calls `EmergencyService.executeResponse`). Since the environment is stubbed, service calls return mock results.
4. You can check the `EMERGENCY ACTIVATED` view which shows the action results and first aid steps.

## 7. Troubleshooting

- White screen on load: check browser console. Common cause: missing env vars causing Supabase client to throw. With the recent dev-safe stub this will no longer crash the app but you will see a console warning. Fix by adding `.env` as described above.
- TypeScript errors during build: run `npm run build` to see `tsc` output. I fixed previous type mismatches related to `ScoredHospital` types; if you add new modules, keep imports consistent — prefer `src/core/routing/scoring.ts` for scoring logic.
- Supabase RPC and functions: `HospitalRepository.getNearbyHospitals` uses `rpc('get_hospitals_within_radius', ...)`. Make sure the SQL in `supabase/schema.sql` (or your Supabase project) implements that function.

## 8. Contributing and next steps

- Suggested improvements:
  - Consolidate duplicate scoring implementations (`src/utils/scoring.ts` vs `src/core/routing/scoring.ts`). Keep one canonical implementation.
  - Add unit tests for `scoreHospitals` and `calculateCrashScore`.
  - Improve the Supabase stub to more accurately emulate RPC responses for richer local testing.
  - Add an Error Boundary component to surface UI errors in a user-friendly way.

If you'd like, I can:
- Add a `docs/` folder and split this README into per-module markdowns.
- Add simple unit tests for scoring and detection.

---

If you want an on-disk copy of this file opened, check: [README.md](README.md)
