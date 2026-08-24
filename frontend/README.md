# Sentinel &mdash; Fraud Detection Frontend

React (Vite) + Tailwind frontend for the AI-Powered Financial Fraud
Detection System, talking to the Spring Boot backend built in this same
project.

## Build status (page-by-page, per the agreed order)

- [x] **Phase 1 &mdash; Project setup, API layer, Authentication (Login/Register)**
- [x] **Phase 2 &mdash; Dashboard**
- [x] **Phase 3 &mdash; Transaction Submission / Fraud Detection (`/detection`)**
- [x] **Phase 4 &mdash; Transaction History (`/transactions`, `/transactions/:transactionId`)**
- [x] **Phase 5 &mdash; Live Dashboard (welcome header, trend chart, auto-refresh)**
- [x] **Phase 6 &mdash; Role-based User Portal / Admin Portal split**
- [ ] Phase 5 &mdash; Transaction History
- [ ] Phase 6 &mdash; Alerts
- [ ] Phase 7 &mdash; Users (Admin)
- [ ] Phase 8 &mdash; Analytics
- [ ] Phase 9 &mdash; Settings

## ⚠️ Known gap: there is no backend login endpoint yet

This is the most important thing to know before testing Phase 1.

The Spring Boot backend (`UserController`) only implements:
- `POST /api/v1/users/register`
- `GET /api/v1/users/{userId}`
- `GET /api/v1/users/email/{email}`

**There is no `POST /auth/login`, no password verification, and no token
issuance anywhere in the backend** &mdash; authentication was explicitly
deferred to a future security module throughout that project's build
(Modules 6, 7, and 9 all state this directly).

Consequences for this frontend, by design, not by accident:

- **Register works for real**, right now, against the live backend
  (`src/services/authService.js#registerUser` &rarr;
  `POST /api/v1/users/register`).
- **Login is built completely and correctly** &mdash; form, validation,
  loading state, error handling, redirect-after-login &mdash; but calls
  `POST /api/v1/auth/login`, which will fail (network error or 404) until
  that endpoint exists on the backend. This is surfaced through the normal
  error-toast path, not a crash.
- You cannot currently reach `/dashboard` (or any future protected page)
  through the real login flow. For manual testing of protected routes
  ahead of a real login endpoint, you can temporarily seed `localStorage`
  in the browser console:
  ```js
  localStorage.setItem('accessToken', 'dev-only-placeholder');
  localStorage.setItem('userId', '<a real userId from your Mongo users collection>');
  localStorage.setItem('userRole', 'ANALYST');
  ```
  then refresh. This is a manual dev workaround, not something the app
  does automatically &mdash; no fake login logic exists in the codebase
  itself.

**Recommended fix**: add a real login endpoint to the Spring Boot backend
(password verification + JWT issuance). Until then, use the manual
`localStorage` seed above to reach the Dashboard for testing.

## Phase 2 &mdash; Dashboard, and what it's honest about

Everything on the Dashboard is wired to a real, working backend endpoint
&mdash; nothing is mocked. Two things are worth knowing before you read
too much into the numbers:

- **"Recent predictions" is ordered by `predictionId` descending, not by
  time.** `PredictionResponse` has no timestamp field, so there's nothing
  else to sort by. IDs are assigned sequentially (`PRED-001`, `PRED-002`,
  ...), so this is a reasonable proxy, not a real chronological order.
- **The risk-distribution chart and the "High risk" / "Flagged fraudulent"
  stat cards only cover the most recent page (10 predictions)**, not the
  whole platform &mdash; there's no backend aggregation endpoint to compute
  a true global distribution without paging through everything. The chart
  and cards say "recent" / "of last N predictions" rather than implying a
  total. Only **"Total predictions"** (`page.totalElements`) is a real
  all-time count.
- **Open alerts resolve/dismiss for real** against
  `PUT /api/v1/alerts/{id}/resolve` and `.../dismiss` &mdash; `notes` is
  sent as a query param, matching the backend's `@RequestParam` signature
  (not a request body).

## Phase 3 &mdash; Fraud Detection (`/detection`)

Submits real transactions to `POST /api/v1/transactions` (Module 6/7) and
renders the real `PredictionResponse` that comes back - persistence, the
ML call, risk derivation, and alert creation all happen server-side.
Nothing here is mocked or simulated.

One field is an honest approximation: **"Processing Time" shows
`processingMs`** (how long the ML service took), not a wall-clock
timestamp - `PredictionResponse` has no `createdAt`/prediction-time field
to show instead.

## Phase 4 &mdash; Transaction History (`/transactions`)

The backend has **no endpoint that lists transactions across all users**
&mdash; only `GET /transactions/user/{userId}`. So this page shows *your*
transaction history, not a platform-wide admin view, even though nothing
in the UI copy claims otherwise. A few other real gaps and how they're
handled:

- **Transactions and predictions are two separate calls, joined
  client-side.** `TransactionResponse` has no risk/prediction fields;
  `PredictionResponse` has no amount/type/date fields. Each row fetches
  its prediction via `GET /predictions/transaction/{id}` in parallel
  (`Promise.allSettled`) after the transaction page loads.
- **Search and the four filters (Type, Risk, Prediction, Amount) run
  client-side against the currently loaded page** &mdash; there's no
  backend search/filter endpoint. Same for the two amount/date sort
  options, which *are* real server-side sorts (`Pageable` on real
  `Transaction` fields), versus the two risk sort options, which are
  client-side only and labeled "(this page)" in the sort dropdown so
  that distinction is visible, not just documented here.
- **"User Name" search from the original spec isn't implemented.**
  `TransactionResponse` only carries a `userId`, not a name, and
  resolving one would mean an extra `GET /users/{id}` call per row.
  Search covers Transaction ID, Sender, and Receiver instead.
- **CSV export covers the currently loaded page only**, not the full
  history &mdash; there's no backend export endpoint to page through
  everything server-side.
- **The details-page Timeline** has one real timestamp
  (`transaction.createdAt`) and derives "ML Processing Started" /
  "Prediction Completed" / "Alert Generated" from `createdAt +
  processingMs`, since the backend records no separate timestamp for any
  of those stages. All three are visibly marked "(estimated)" in the UI.

## Phase 5 &mdash; Live Dashboard

One correction worth flagging: the brief for this phase assumed the
Dashboard was still static/hardcoded demo data. It wasn't &mdash; Phase 2
already wired it to real `GET /predictions` and `GET /alerts/open` calls.
This phase *extends* that with the pieces that genuinely were missing
(welcome header, transaction trend chart, recent-transactions table,
30-second auto-refresh), rather than replacing something already real.

New files: `services/dashboardService.js` (orchestrates the existing
service functions in parallel, joins each recent transaction with its
prediction) and `hooks/useDashboard.js` (owns loading state, the 30s
`setInterval` poll, and every derived stat).

Two scoping notes, consistent with Phase 4's:

- **"Total Transactions," its trend badge, "High Risk Transactions," and
  the trend chart are all scoped to *your* transactions** (last 50,
  newest first) &mdash; same reason as the Transactions page: no
  all-users transaction endpoint exists. **"Fraud Predictions"
  (`GET /predictions`) and "Open Alerts" (`GET /alerts/open`) are
  genuinely platform-wide**, and the dashboard's copy/captions say so
  either way rather than presenting all four as the same kind of number.
- **The welcome message's full name comes from a real
  `GET /users/{userId}` call**, not from local storage &mdash; the
  logged-in `AuthContext.user.fullName` is always `null` today, since
  neither `/register` (no auto-login) nor the not-yet-existing
  `/auth/login` ever populate it locally.
- **The trend badge on "Total Transactions"** is a real week-over-week
  percentage computed from the same loaded sample, and is simply omitted
  (not shown as `0%` or hidden awkwardly) when there's no prior-week data
  to compare against.

Also fixed while here: `TransactionsPage.jsx` (Phase 4) destructured
`{ session }` from `useAuth()`, but `AuthContext` exposes `{ user }` -
that typo meant the Transactions page never actually loaded any data.
Fixed to `{ user }`.

## Phase 6 &mdash; Role-based portals

The app now has two completely separate interfaces, chosen by
`user.role` after login (`utils/roleRouting.js`):

- **Admin Portal** (`ADMIN` + `ANALYST` roles, both share it - there's no
  ANALYST-only surface) at `/admin/*`: the existing Dashboard, Fraud
  Detection (reframed as an analyst testing tool), Transactions all moved
  here unchanged, plus four new pages - Predictions, Alerts, Users,
  Analytics - and Profile/Settings.
- **User Portal** (`USER` role, and any unrecognized role as a
  least-privileged default) at `/user/*`: entirely new - Dashboard,
  Transfer Money, Transaction History, Profile, Settings. Simulates
  personal banking; never shows riskLevel/probability/confidence/step/
  balances - only Payment Successful / Under Review / Blocked.

`RoleProtectedRoute.jsx` (new) nests inside the existing
`ProtectedRoute.jsx` and gates each portal; `AppLayout.jsx` (existing,
repointed to `/admin/*` paths) and `UserLayout.jsx` (new) are separate
sidebars.

**Real backend constraints this works around, not around:**

- **Self-registration always gets a fixed default role.**
  `RegisterUserRequest` intentionally has no `role` field (checked the
  actual backend record and its Javadoc: role/status are assigned
  server-side "to avoid a registration request granting itself elevated
  privileges"). There is currently no way to create an ADMIN or ANALYST
  account through this UI - only by whatever every self-registered user
  defaults to. The role-routing code is correct and ready regardless of
  which role that turns out to be, but only one portal is reachable
  through registration today.
- **The Transfer Money page's "Current Balance" is an explicit
  simulation** (`utils/simulatedWallet.js`), because the backend has no
  accounts/balance system at all. It's not just cosmetic, though: it's
  what actually gets sent as `oldbalanceOrg`/`newbalanceOrig`/`step` on
  the real `POST /transactions` call, since those are genuinely required,
  non-optional fields the fraud model uses. `oldbalanceDest`/
  `newbalanceDest` are sent as `0` (an honest "unknown," since there's no
  receiver-account backend to look a real one up from).
  "Payment Blocked" is a UI framing of a HIGH `riskLevel` result for the
  banking narrative - the transaction itself is always persisted by the
  backend regardless of risk level; nothing is actually reversed or held.
- **The Admin Users page can only look a user up by email or id** -
  `GET /users` (list-all) doesn't exist, and neither does
  activate/deactivate. Rather than show an empty "all users" table or
  fake buttons that do nothing, the page is a real lookup tool with that
  gap stated directly in the UI.
- **The Admin Alerts page's "Resolved" tab is scoped to this browser
  session** (`services/adminService.js`) - `AlertController` only exposes
  `GET /alerts/open`, no endpoint lists resolved/dismissed alerts, so
  there's no way to show a true history. The tab is labeled "Resolved
  (this session)," not "Resolved."
- **Settings pages (both portals) are intentionally non-functional** -
  no password-change or preferences endpoint exists - with a visible note
  and disabled controls, rather than inputs that silently do nothing.
- **Analytics' prediction data has no timestamp field**, so there's no
  platform-wide trend-over-time chart there (only the per-user one on the
  Dashboard, which does have real dates via transactions).

## Tech stack

React 18 (Vite) · Tailwind CSS · React Router v6 · Axios · Recharts ·
Lucide React. No other UI/animation libraries &mdash; Toast notifications
are custom-built (`src/context/ToastContext.jsx`) specifically to avoid
introducing a dependency outside the specified stack.

## Design system

See inline comments in `tailwind.config.js` for the full token rationale.
Summary: `ink`/`slate`/`canvas`/`surface` for neutrals, `navy-deep`/`navy-mid`
for dark surfaces (sidebar, auth panel), `azure` as the single brand
accent, and `risk-low`/`risk-medium`/`risk-high` as the semantic colors
used consistently everywhere a risk level appears (badges, charts, progress
indicators) from Phase 2 onward. Space Grotesk for headings/stat numbers,
Inter for body/UI, JetBrains Mono for transaction IDs and amounts.

## Running locally

```bash
npm install
npm run dev
```

Requires the Spring Boot backend running and reachable at the URL in
`.env` (`VITE_API_BASE_URL`, defaults to `http://localhost:8080/api/v1`).

**Note**: `npm install` was not run in the environment this code was
generated in (no network access to the npm registry there) &mdash; run it
yourself and report back if anything fails to resolve at the pinned
versions in `package.json`.

## Project structure

```
src/
  api/          Axios instance + error normalization (axios.js)
  components/
    ui/         Button, Input, SignalNetwork, StatCard, RiskBadge, LoadingOverlay,
                EmptyState, Pagination
    dashboard/  RecentPredictionsTable, RiskDistributionChart, TransactionTrendChart,
                RecentTransactionsTable, OpenAlertsPanel (Admin dashboard)
    detection/  TransactionForm, PredictionCard, ConfidenceGauge, ProbabilityBar, PredictionSummary
    transactions/  SearchBar, TransactionFilters, TransactionsTable, TransactionRow,
                    TransactionSummaryCard, TimelineCard
    user/       PaymentStatusBadge - user-facing status pill, hides ML terminology
    shared/     ProfileCard - reused by both User and Admin Profile pages
  context/      AuthContext, ToastContext
  hooks/        useAnimatedNumber, useDashboard (Admin), useUserDashboard (User)
  layouts/      AuthLayout (auth pages), AppLayout (Admin Portal - /admin/*),
                UserLayout (User Portal - /user/*)
  pages/
    auth/       Login, Register
    admin/      PredictionsPage, AlertsPage, UsersPage, AnalyticsPage, AdminProfile, AdminSettings
    detection/  DetectionPage.jsx - /admin/detection (analyst testing tool)
    transactions/   TransactionsPage.jsx, TransactionDetails.jsx - /admin/transactions(/:id)
    user/       UserDashboard, TransferMoney, UserTransactionHistory, UserProfile, UserSettings
    errors/     NotFound (role-aware "back home" link)
    Dashboard.jsx   /admin/dashboard - live welcome header, stats, trend chart, recent activity
  routes/       ProtectedRoute (auth gate), RoleProtectedRoute (portal gate)
  services/     authService.js, predictionService.js, alertService.js, transactionService.js,
                dashboardService.js, paymentService.js, profileService.js, userService.js, adminService.js
  utils/        validators.js, csvExport.js, roleRouting.js, simulatedWallet.js
```

## Backend field-name reference (Phase 1)

Matches the real backend DTOs exactly - no invented fields:

`RegisterUserRequest`: `fullName`, `email`, `password`.
`UserResponse` (register's response): `userId`, `fullName`, `email`, `role`,
`accountStatus`, `createdAt` &mdash; no token, no password field, ever.
`LoginResponse` (once the backend implements it): `accessToken`,
`refreshToken`, `userId`, `role`.

The backend's `X-User-Id` header requirement (Module 7, `TransactionController`
and `FeedbackController`) is handled automatically by
`src/api/axios.js`'s request interceptor once a user is signed in - not
something individual pages need to think about.
