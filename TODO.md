# Booking Status System - Fix Plan

## Completed Steps:

- [x] 1. `bookingsStore.ts` — Added `completed` to `BookingStatus`, added `adminMarkCompleted` & `managerMarkCompleted` actions
- [x] 2. `BookingsPage.tsx` (Admin) — Added `completed` status display + "Mark Completed" action (in earlier session)
- [x] 3. `ManagerBookingsPage.tsx` — Added `completed` status display + "إنهاء الإقامة" button. Fixed variable shadowing bug (`b` → `bookingRow`)
- [x] 4. `MyBookingsPage.tsx` — Fixed STATUS object to use real statuses (`cancelled_by_admin`, `cancelled_by_manager`, `cancelled_by_user`), fixed filter logic for cancelled/completed/pending tabs, fixed tab counts, fixed cancel button conditions

