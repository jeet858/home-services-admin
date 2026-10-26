# Subidha Admin

Operations console for the Subidha home-services app — bookings, professionals, catalogue, customers, reviews, coupons and admin team. Built with Next.js 15 (App Router), shadcn/ui (Radix), TanStack Query/Table, react-hook-form + zod, and installable as a PWA.

## Setup

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_BASE_API_URL to the subidha_backend URL
npm install
npm run dev                  # http://localhost:3000
```

In production the backend only accepts origins listed in its `ALLOWED_ORIGINS` env var — add this admin's URL there.

Admin endpoints this app relies on that were added to `subidha_backend` alongside the redesign:

- `GET /api/admin/stats` — dashboard totals, 30-day series, top services
- `GET /api/booking` filters — `status`, `paymentStatus`, `from`, `to`, `unassigned`, `userId`, `providerId`, `search`
- `PATCH /api/booking/:id/status` — optional `reason` stored when cancelling
- `GET /api/coupons/admin/all` — every coupon, including inactive/expired
- `GET /api/admin/users?search=` — customer search

## Structure

```
app/(auth)/login        sign-in
app/(admin)/…           dashboard and feature pages (client-rendered, data via TanStack Query)
app/manifest.ts         PWA manifest; public/sw.js is the service worker
components/ui           shadcn components (add more with `npx shadcn@latest add <name>`)
components/layout       sidebar, header, ⌘K command menu, user menu
components/shared       status badges, dialogs, empty/error states, uploads
features/<domain>       API hooks (api.ts) and domain components
lib/api/client.ts       fetch wrapper; normalises the backend's response envelopes
```

Auth: the admin JWT is kept in the `subidha_admin_token` cookie; `middleware.ts` guards routes and any 401 signs the user out.

Brand tokens (colours mirrored from the Flutter app's `colors.dart`) live in `app/globals.css`; light and dark themes are supported.

## PWA

- Icons are generated from the app logo into `public/icons` (incl. maskable) and `app/icon.png` / `app/apple-icon.png`.
- `public/sw.js` caches static assets and pages for an offline fallback (`/offline`). API responses are never cached.
- The worker registers in production builds only (`npm run build && npm start`). A toast offers a reload when a new version is deployed; bump `VERSION` in `sw.js` to force old caches out.
- "Install app" appears in the user menu when the browser supports it.
