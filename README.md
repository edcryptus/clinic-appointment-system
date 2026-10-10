# Wellnest Medical Clinic: Premium Clinic Website with Appointment Booking

A complete multi-page clinic website with a working patient booking flow and a local mock REST API. Fictional brand **Wellnest Medical Clinic**, built with React, TypeScript, Vite, Tailwind CSS, React Router, Lucide icons, Lenis smooth scrolling, and JSON Server.

Note on design guidance: the UI UX Pro Max skill (https://uupm.cc) was not available in this environment, so the design follows professional healthcare UX judgment using the requested palette, DM Sans plus DM Serif Display pairing, and restrained editorial layouts.

## Quick start

Requirements: Node 18 or newer, npm.

```bash
cd clinic-appointment-system
npm install
npm run dev:all
```

This starts both processes:

| Process | Command | Address |
|---|---|---|
| Website | `npm run dev` | http://localhost:5174 |
| Mock API | `npm run server` | http://localhost:3002 |

The ports intentionally avoid 5173 and 3001, which may already be used by another local project.

Run them separately if you prefer two terminals:

```bash
npm run server
npm run dev
```

Build the frontend:

```bash
npm run build
```

## Demo workflow

1. Open http://localhost:5174.
2. Browse Home, Services, a service detail page, Doctors, a doctor profile, About, and Contact.
3. Click **Book an Appointment** and complete all five steps: care, doctor, time, details, review.
4. After **Confirm Appointment**, you land on a confirmation page with a reference like `WM-X7K2P9`.
5. Open **Find My Appointment** and enter that reference plus the email used for booking.
6. Try the seeded demo booking: reference `WM-DEMO01` with email `patient@example.com`.
7. Try cancelling from the lookup page, and try booking an overlapping slot to see conflict handling.
8. Send a message from Contact and confirm it appears in `db.json` under `contactMessages`.

## API

Base URL defaults to `http://localhost:3002` and can be changed with `VITE_API_URL` (see `.env.example`).

Resources in `db.json`: `services`, `doctors`, `appointments`, `availability`, `clinic`, `contactMessages`.

All requests go through `src/lib/api.ts`. Availability and conflict logic lives in `src/lib/availability.ts`:

- Opening hours come from `src/config/brand.ts` (Mon to Fri 8 AM to 6 PM, Sat 9 AM to 1 PM, closed Sun).
- Doctor working days and per-day windows come from `availability` and each doctor record.
- Slots step by the doctor rule (30, 40, or 45 minutes) and must fit the full service duration.
- Same-day past slots are disabled. Existing non-cancelled appointments block overlapping ranges.
- The confirm step rechecks conflicts through the API before POSTing, then navigates to confirmation only on success.

JSON Server is a mock store, not a transactional database. Two simultaneous requests for the same slot could both pass the check in a real race. A production backend would need atomic booking with a unique constraint on doctor, date, and time range.

Brand details (name, phone, email, address, hours) live in `src/config/brand.ts` so the identity is easy to change.

## Project structure

```
clinic-appointment-system/
  db.json
  src/
    config/brand.ts
    lib/api.ts, availability.ts, format.ts
    hooks/useLenis.ts, useReveal.ts
    components/Header.tsx, Footer.tsx, Layout.tsx, ui.tsx
    pages/Home.tsx, Services.tsx, ServiceDetail.tsx, Doctors.tsx,
      DoctorDetail.tsx, About.tsx, Booking.tsx, Confirmation.tsx,
      FindAppointment.tsx, Contact.tsx, NotFound.tsx
    App.tsx, main.tsx, index.css
```

## Verification performed

- `npm run build` passes with no TypeScript errors.
- Booking flow reviewed step by step: service preselection from service and doctor pages via `?service=` and `?doctor=` query params, eligible doctor filtering, 14-day date strip with Sundays disabled, slot conflict detection, inline form validation, recheck before POST, and reference-based confirmation.
- Lookup requires both reference and email. Cancellation uses PATCH with a confirm step.
- Responsive layouts use Tailwind breakpoints. The header collapses to an accessible mobile menu. Booking steps stack on small screens.
- Lenis smooth scrolling is enabled and skipped entirely when `prefers-reduced-motion` is set. Reveal animations are CSS only and degrade to visible content without IntersectionObserver.
