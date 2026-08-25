# StayAdmin — Booking Admin Dashboard

A React + TypeScript admin dashboard for hotel booking management.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@stay.com | admin123 | Super Admin → redirects to /dashboard |
| manager@stay.com | manager123 | Manager → redirects to /home |

Or sign up for a new account (redirects to /home).

## Project Structure

```
src/
├── App.tsx                  # All routes + role-based protection
├── index.tsx                # Entry point
├── components/
│   └── Layout.tsx            # Shared sidebar + topbar used by every inner page
├── store/
│   └── authStore.ts         # Zustand auth (login, signup, persist)
├── routes/
│   └── ProtectedRoute.tsx   # Role-aware route guard
└── pages/
    ├── LoginPage.tsx
    ├── SignupPage.tsx
    ├── HomePage.tsx          # Home (own navbar, hero, stats, hotels, footer)
    ├── DashboardPage.tsx     # Super Admin only
    ├── hotels/HotelsPage.tsx
    ├── bookings/BookingsPage.tsx
    ├── customers/CustomersPage.tsx
    ├── analytics/AnalyticsPage.tsx     # Super Admin only — charts via Recharts
    ├── rooms/RoomsPage.tsx
    ├── revenue/RevenuePage.tsx          # Super Admin only
    ├── settings/SettingsPage.tsx
    ├── notifications/NotificationsPage.tsx
    └── profile/ProfilePage.tsx
```

## Navigation Map

Every icon and card is wired to a real route:

- **Hamburger / Menu icon** → opens the sidebar
- **Logo** → `/home`
- **Sidebar nav items** → Dashboard*, Hotels, Bookings, Customers, Analytics*, Settings (*Super Admin only)
- **Bell icon** → `/notifications`
- **User avatar (top-right)** → `/profile`
- **User card (sidebar bottom)** → `/profile`
- **Logout** → clears session → `/login`
- **Home page Quick Access cards** → Hotels, Bookings, Customers, Analytics*, Room Types, Revenue*
- **Featured Hotels** → `/hotels`
- **"View Bookings" CTA** → `/bookings`
- **"See Analytics" CTA** → `/analytics`*



## Features

- **Role-based routing** — superadmin sees Dashboard + Analytics + Revenue; regular users see Home only
- **Persistent auth** — login state saved to localStorage via Zustand persist
- **Live search** — filters Quick Access cards in real time
- **Hotel images** — pulls from Unsplash CDN
- **Responsive sidebar** — collapses on mobile with overlay
- **Notifications badge** — clears on click

## Tech Stack

- React 18 + TypeScript
- React Router v6
- Zustand (state + persistence)
- Lucide React (icons)
- Inter font (Google Fonts)
