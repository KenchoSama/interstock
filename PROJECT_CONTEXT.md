# InterStock — Project Context

A continuity document for starting a new chat/session on this project. Covers architecture, integrations, database design, conventions, and known open items as of 2026-09-08.

## 1. What this is

InterStock is a financial-literacy web app for InterStock LLC (Miami-based startup, founders Gabriel A. Kasabdji and Christian E. Kasabdji, founded 2022). It's a paper-trading simulator + education platform used by middle/high school students, with an admin side for the company/schools to manage students, tournaments, assignments, and content. Public marketing site: interstockusa.com (currently promotes the app as "launching soon").

## 2. Tech stack

- **Frontend**: Vite + React + TypeScript
- **Backend**: Supabase — Postgres, PostgREST (auto-generated REST API), Supabase Auth, Row-Level Security (RLS), Postgres RPC functions, Supabase Storage (for assignment PDF attachments)
- **Deployment**: Vercel (frontend + a couple of serverless API routes under `api/`)
- **Repo**: GitHub `KenchoSama/interstock` (private), working copy at `C:\Users\KenMartinez\Github\interstock`
- **State management**: a single `useReducer`-based `AppContext` (`src/state/AppContext.tsx`) — no Redux/Zustand/etc. Per-role state lives in a flat object at `state.u[role]`.
- **Routing**: hash-based view routing. `state.view` drives `PageRouter.tsx`'s lookup table; each role has its own top-level "Shell" component (`StudentShell`, `AdminShell`, `SchoolShell`, `PartnerShell`, `StaffShell`) that gates onboarding steps (Code of Conduct, Baseline Assessment) before rendering the shared `Shell` (topbar + sidebar + `PageRouter`).

## 3. External connectors / integrations

- **Yahoo Finance** — the only external market-data source. Proxied through a Vercel serverless function at `api/chart/[sym].ts` (hits `query1.finance.yahoo.com/v8/finance/chart/...`, no auth needed for this endpoint). Used by most quote-fetching hooks: `useStockQuotes`, `useTickerQuotes`, `useIndexPerformance`, `useFuturesQuotes`, `useFuturesLookup`, `useStockLookup`, `useStockCandles`, the options-chain pricing logic, etc. Quotes are ~15min delayed (Yahoo free tier) — not fixable without a paid data feed. Yahoo's *quote* endpoint (which carries market cap) requires an auth crumb we don't have and returns `Unauthorized` — confirmed via direct curl test; only the chart/price endpoint is usable.
- **Supabase** — Postgres DB, Auth (email/password), Storage (`assignments` bucket, public), and RPC functions. Management-API access token (`SUPABASE_ACCESS_TOKEN` in `.env`) is used for schema introspection/migrations via `npx supabase db push` and direct SQL queries via the Supabase Management API (`https://api.supabase.com/v1/projects/{ref}/database/query`) — this is how RLS policies, function definitions, and FK constraints get inspected/debugged live.
- No other third-party APIs (no payment processor, no email service integration visible, no analytics).

## 4. Architecture & key design decisions

**Portfolio model** — `portfolios.competition_id` (nullable FK to `competitions`) distinguishes a student's general portfolio (`NULL`) from a tournament portfolio (set). Enforced via two partial unique indexes rather than a single constraint, since one student can now legitimately have multiple portfolio rows. `AppContext`'s `cash`/`portfolio`/`portfolioId` fields are **derived** — they always reflect whichever portfolio is currently "active" (`activeCompetitionId`), switched via the `PortfolioSwitcher` component and a `SWITCH_PORTFOLIO` action. This means ~10 pre-existing trading-related files needed zero changes to become tournament-aware.

**Class Funds** (shared group portfolios) — deliberately **not** built on the `portfolios` table, since that table is owned by exactly one `user_id` with per-user unique constraints. Instead a parallel mini-schema: `class_funds`, `class_fund_members`, `class_fund_holdings`, `class_fund_transactions`. All trades go through a `trade_class_fund` RPC that row-locks the fund (`for update`) to serialize concurrent trades from different members sharing the same cash balance.

**Options/Futures pricing** — a real Black-Scholes model implemented client-side in `Options.tsx` (not a stub): proper `d1`/`d2`, a volatility smile (further OTM + downside puts carry higher IV), deterministic per-(ticker, expiry, strike) pseudo-random volume/OI so numbers don't jitter every quote refresh, and expiration dates generated as a realistic mix of weekly + monthly (third-Friday) dates. Futures use a simpler synthetic model (`FUTURES_DATA` in `Futures.tsx`) with real margin/multiplier figures per contract.

**Feature locking** — `isLocked(view, xp)` in `AppContext.tsx` is the single choke point for gating a view for students; `Sidebar.tsx` and each page both check it. **As of now, it unconditionally locks**: `lessons`, `diplomas`, `portfolio`, `options`, `futures`, `order-history`, `class-fund` — i.e., all trading and both of those education features are fully shut off for every student, no XP threshold, no exceptions. (Earlier iterations had Options/Futures unlock at an XP threshold instead of a flat lock — that was superseded.) Tournaments (`compete`) and Stock Analysis remain open since neither executes a trade directly.

**Admin-only mutation pattern** (used consistently for anything touching another user's row or applying a bulk/administrative action): either (a) an RLS policy using a `get_my_role() = 'admin'::user_role` check (for simple per-row admin-gated writes — `schools`, `competitions`, `class_funds`), or (b) a `SECURITY DEFINER` RPC with an internal role check for anything more complex — cascading deletes, cross-table writes, or writes on behalf of many other users at once. `get_my_role()` is a pre-existing `SECURITY DEFINER` SQL function (`select role from profiles where id = auth.uid()`) used everywhere for this.

**Known pre-existing gap**: `assignments` table RLS is currently wide open — `using (true)` / `with check (true)` for insert/update/delete, meaning *any authenticated user* (not just admin) can create/edit/delete any assignment via a direct API call. Flagged to the user, not yet fixed (was waiting on a decision).

## 5. Database schema, by domain

- **Identity**: `profiles` (role enum: `student` / `school_admin` / `parent` / `partner` / `admin` / `staff`; `school_id`, `xp`, `login_streak`, `last_active_date`), `schools`
- **General trading**: `portfolios`, `holdings`, `transactions`, `portfolio_snapshots`, `limit_orders` (stock working orders)
- **Options**: `option_positions`, `option_orders` (limit orders for options)
- **Futures**: `futures_positions`
- **Tournaments**: `competitions` (has `starting_cash`, `start_date`, `created_by`, `status`), `competition_schools`, `competition_registrations`
- **Class Funds**: `class_funds`, `class_fund_members`, `class_fund_holdings`, `class_fund_transactions`
- **Social**: `friends`, `friend_requests`, `messages`
- **Education**: `assessments`, `lesson_progress`, `diplomas`, `assignments` (has `xp_reward`, `file_url`), `submissions`, `badges`, `user_badges`, `etf_submissions`, `game_sessions`
- **Admin/config**: `app_settings` (currently just `student_signup_code`)
- **Views**: `leaderboard` (joins `profiles`↔`portfolios`↔latest `portfolio_snapshots`, scoped to `competition_id is null` — **this view and the `badges`/`user_badges` schema are not in any tracked migration file**; they exist live in Supabase only, predating this session's migration discipline. If the DB is ever rebuilt from migrations alone, these won't exist — would need to be pulled from Supabase Studio first.)

## 6. Notable RPC functions

All `SECURITY DEFINER`, all with an internal `get_my_role()` admin check unless noted:
`delete_student_account` (cascades through ~15 dependent tables incl. `friend_requests`/`friends`/`messages`/`class_fund_transactions` — fixed this session after hitting FK violations), `delete_competition` (cascades `competition_registrations` → `portfolio_snapshots` → `portfolios` → `competitions`), `set_user_role` (also clears `school_id` when promoting to admin, since an admin isn't tied to a school), `admin_update_student_school`, `reset_student_portfolio`, `enter_school_in_tournament`, `create_class_fund`, `join_class_fund` (student-callable, no admin check — looks up fund by code), `trade_class_fund` (member-only check, not admin), `update_signup_access_code`, `check_and_award_badges`, `increment_xp`.

## 7. Established workflow conventions

- **Migrations**: write SQL to `supabase/migrations/`, `npx supabase db push --linked --dry-run` first to confirm only the intended file is pending, then push for real. Every migration this session included a comment explaining *why*, not just what.
- **Verification after any DB change**: a `curl` against the live REST/RPC endpoint (using the anon key from `.env`) to confirm the expected behavior — e.g., an unauthenticated/non-admin call gets rejected, a PostgREST embed resolves without a `PGRST200` ambiguity error.
- **Verification after any code change**: `npm run build` (runs `tsc -b && vite build`) — kept clean after every change this session.
- **Schema introspection**: since there's no local `psql`/docker, live schema questions (RLS policies, FK constraints, function definitions, table columns) get answered via the Supabase Management API's SQL query endpoint using `SUPABASE_ACCESS_TOKEN`, not guessed at.
- **Can't test the live UI** — no login credentials are available in-session, so every feature has been verified via `tsc`/build/curl only, never actually clicked through. Worth doing a real manual pass on recent features (class funds, options limit orders, admin school reassignment, locked pages) when there's time.

## 8. Known open items / deferred work

- **ISR (InterStock Rating) system** — a full rating/tier/confidence-score overhaul described in the original brainstorm doc (pages 4–5, 10–11). Explicitly deferred as its own future initiative — large scope, not started.
- **Cross-tournament regular-season + finals points system** — each tournament is currently fully standalone; deferred.
- **`assignments` RLS gap** — see above, not yet fixed pending a decision.
- **Career guidance resources** — scoped as a small static-content card, but actual content was never decided.
- **Reset leaderboard / bulk-remove stale accounts** — explicitly skipped as too destructive/ambiguous; use the existing per-student/per-school delete buttons instead.
- Nothing is currently committed to git beyond what was already pushed — check `git status` at the start of a new session.

## 9. Where to start in a new chat

Point Claude at this file (or paste it in) plus the plan file if one still exists at `C:\Users\KenMartinez\.claude\plans\`. The most useful first move in almost any new session is `git status` + `git log --oneline -10` to see what's changed since this document was written, since this project moves fast.
