# Weekly Feedback Tool — Backlog

Stack: Next.js (React) + Supabase (Postgres + Realtime). Shared-link access,
no accounts. See `../SCOPE.md` for product scope. Tasks are ordered but each is
written to stand alone — you can pick one up without having read the others.

---

## 1. Scaffold empty project with a passing test
Goal: A running Next.js app with a test runner wired up and one green test.
Description: Initialize a Next.js (App Router, TypeScript) project in this
directory, add Vitest (or the project's chosen runner) with a single trivial
test that passes, and confirm `npm run dev` and `npm test` both work. No app
features yet — this only establishes the skeleton and CI-able test command.

## 2. Set up Supabase project and local connection
Goal: The app can connect to a Supabase instance from server and client.
Description: Create a Supabase project (and local dev config via the Supabase
CLI), add the URL and anon key to environment variables, and add a typed
Supabase client module. Prove the connection with a small health-check query.
No schema or features yet.

Acceptance criteria:
- Supabase project exists (cloud or local via `supabase start`), URL and anon
  key stored in `.env.local`, not committed.
- `.env.example` documents required env vars with placeholder values.
- One shared client module (e.g. `lib/supabase.ts`) exports a typed client
  usable from both server and client components.
- A health-check (script or test) round-trips a trivial query (e.g. `select
  1` or reading Supabase's own `pg_catalog`) and passes against the running
  instance.
- `npm test` and `npm run build` from task 1 still pass unaffected.

Out of scope: any application table/schema (task 3), auth/RLS policies
(covered per-feature in later tasks).

## 3. Define the database schema and migrations
Goal: All core tables exist as versioned migrations.
Description: Model `projects`, `boards` (a project + week), `participants`,
`cards` (start/stop/continue, author, board), `clusters`, `card_clusters`,
`votes`, and `action_items` (owner, due date, board). Write them as Supabase
migration files with sensible foreign keys and a `phase` column on `boards`.
Seed a demo project and board for local testing.

Acceptance criteria:
- Migration files (Supabase CLI format) create: `projects`, `boards` (FK
  project, week identifier, `phase` enum/text defaulting to `submit`),
  `participants` (FK board, nullable name, anonymous flag), `cards` (FK board,
  FK participant, category enum start/stop/continue, text), `clusters` (FK
  board, name), `card_clusters` (FK card, FK cluster), `votes` (FK cluster, FK
  participant), `action_items` (FK board, text, owner, due date).
- Foreign keys cascade sensibly on board/project delete (documented, doesn't
  need to be exhaustive).
- `boards` has a unique constraint on (project, week).
- `supabase db reset` (or migration apply) runs clean with no errors.
- A seed script/file creates one demo project + one demo board so later
  tasks (4, 9, 10, 11, 12, 13) have data to build against without needing
  tasks 6/7 UI first.
- Schema documented briefly (table list + purpose) in `_docs/` or migration
  comments.

Out of scope: row-level security policies (added per-feature as those tasks
need them), application code reading/writing these tables.

## 4. Participant join-by-link and identity
Goal: A visitor can open a board link, enter a name (or go anonymous), and be
remembered on that board.
Description: Build the join screen and a per-board participant session stored in
a browser token, creating a `participants` row. Support an "anonymous" choice
that hides the name. This is the identity primitive other tasks rely on; it does
not need any board features to work.

Acceptance criteria:
- Visiting a board link with no existing session shows a join screen: name
  text input plus an "stay anonymous" toggle/checkbox.
- Submitting with a name creates a `participants` row with that name attached
  to the board.
- Submitting with anonymous checked creates a `participants` row with no
  display name (name field null/empty), but the row still exists so votes and
  cards can be tied to it.
- On submit, a per-board browser token (cookie or localStorage) is set that
  identifies this participant for this board only — the same browser on a
  different board is a different identity.
- Reloading or reopening the same board link in the same browser skips the
  join screen and re-attaches to the existing `participants` row (no
  duplicate row created).
- Opening the same board link in a different browser/incognito session shows
  the join screen again and creates a separate `participants` row.
- Name input has a reasonable max length and rejects empty non-anonymous
  submissions (must supply a name or choose anonymous).
- Works against a seeded board from task 3 with no dependency on cards,
  clustering, voting, or the facilitator role.

Out of scope: facilitator role/token (task 5), card submission (task 9),
real-time updates (task 8).

## 5. Facilitator role and secret facilitator link
**Superseded by task 18** — the secret-token model described below was
replaced with a self-claim button (any participant, single facilitator,
claiming replaces). Kept here for history; task 18 is authoritative.

Goal: One participant holds facilitator powers via a secret link.
Description: When a board is created, generate a separate facilitator token; a
visitor holding it is marked facilitator for that board. Add a server-side guard
so only the facilitator can perform facilitator actions. Expose the plain and
facilitator share links on the board. No phase controls yet — just the role.

Acceptance criteria:
- `boards` (or a related table) stores a random, unguessable facilitator
  token distinct from the board's public id/slug.
- Visiting `/board/<id>?facilitator=<token>` (or equivalent) marks that
  browser's participant session as facilitator for this board only.
- A server-side check rejects facilitator-only actions when the request
  doesn't carry a valid facilitator token/session — verified even if the
  client UI is bypassed (e.g. direct API/request).
- Board page shows two copyable links: the plain participant link and the
  facilitator link, visible only to the facilitator.
- Facilitator status persists across reloads the same way participant
  identity does (task 4's browser token mechanism).
- No new UI for phase transitions yet — just a `isFacilitator` flag
  available for task 15 to consume.

Out of scope: phase state machine and phase-gated actions (task 15).

## 6. Project list and create-project
Goal: Users can see all projects and create a new one.
Description: Build a page listing persistent projects and a form to create one
(name, optional description). Creating a project writes a `projects` row and
links to that project's boards. Read-only listing plus create; no week logic
here.

Acceptance criteria:
- `/projects` (or `/`) lists all projects from the `projects` table, newest
  or alphabetical, each linking to its project page.
- A visible form/button creates a project: required name, optional
  description.
- Submitting writes a `projects` row and the new project appears in the list
  without a manual refresh (simple redirect/revalidate is fine — no realtime
  needed here).
- Empty state: list renders a sensible message when no projects exist yet.
- Duplicate names allowed (no uniqueness assumed) unless product scope says
  otherwise — note this as an open question if unsure.
- Works against the schema from task 3; does not require boards, weeks, or
  any participant/facilitator concept.

Out of scope: week/board listing (task 7), editing or deleting projects.

## 7. Week selection and board creation under a project
Goal: From a project, pick or create the board for a given week.
Description: On a project page, list existing weekly boards and allow creating a
new board for a chosen week (creates a `boards` row in the initial phase).
Selecting a board routes to its page. Assumes projects exist; does not implement
the board's inner phases.

Acceptance criteria:
- Project page lists that project's existing boards, most recent week first,
  each showing its week and linking to the board page.
- A control lets the user pick/enter a week (e.g. week-start date or ISO week)
  and create a board for it if one doesn't already exist.
- Creating a board writes a `boards` row with `phase = submit` (task 3's
  default) and the correct project FK.
- Attempting to create a board for a week that already exists for this
  project either routes to the existing board or shows a clear error — does
  not create a duplicate (respects task 3's unique constraint).
- Selecting an existing board routes to its board page (page itself can be a
  stub — built out by tasks 9–15).
- Works standalone against a seeded project; does not require participant
  identity, facilitator role, or realtime.

Out of scope: the board's internal phases/content (tasks 9–15).

## 8. Real-time subscription helper
Goal: A reusable hook/util that streams row changes for a board into the UI.
Description: Wrap Supabase Realtime into a small helper that subscribes to
inserts/updates/deletes for a given board's rows (cards, votes, clusters) and
keeps local state in sync, handling subscribe/unsubscribe and reconnect. Ship a
tiny demo component proving live updates. Other live features depend on this.

Acceptance criteria:
- A hook/util (e.g. `useBoardRealtime` or `subscribeToBoard`) takes a board id
  and a table name, and streams insert/update/delete events for rows scoped
  to that board.
- Subscribing and unsubscribing is automatic on mount/unmount (React
  lifecycle) — no leaked channels when navigating away from a board.
- Local state updates correctly for all three event types (insert appends,
  update patches, delete removes) — covered by at least one test using a
  mocked Supabase channel.
- A minimal demo page/component shows two browser tabs on the same board
  seeing each other's changes to a test row within ~1s.
- Reconnect behavior after a dropped connection is at least documented, even
  if not fully tested (Supabase client has built-in reconnect — verify it's
  not disabled).

Out of scope: the actual card/cluster/vote UI (tasks 9–13) — this task ships
only the plumbing and a throwaway demo.

## 9. Card submission with pre-reveal privacy
Goal: A participant can add start/stop/continue cards and, before reveal, see
only their own.
Description: Build the card entry UI for the three categories with support for
multiple cards per category, writing `cards` rows tied to the participant and
board. Enforce (via row-level security and queries) that while the board is in
the submit phase, a participant reads only their own cards.

Acceptance criteria:
- Board page (submit phase) shows three columns: Start / Stop / Continue,
  each with an add-card input.
- A participant can add any number of cards per category; each write creates
  a `cards` row (category, text, FK participant, FK board).
- While `boards.phase = submit`, a participant's queries/UI show only cards
  authored by their own `participants` row — enforced server-side (RLS
  policy or equivalent guard), not just hidden in the client.
- Attempting to read another participant's cards during submit phase (e.g.
  direct query) returns nothing, proven by a test.
- Cards can be edited or deleted by their author before reveal (state at
  minimum: create + delete; edit optional, note if deferred).
- Depends on task 4 (participant identity) and task 3 (schema); does not
  require reveal, clustering, or voting to exist.

Out of scope: cross-participant visibility after reveal (task 10), realtime
sync of others' cards (not applicable pre-reveal by design).

## 10. Reveal phase and full-board card view
Goal: After the facilitator reveals, everyone sees all cards grouped by category.
Description: Add the facilitator "reveal" action that advances the board phase,
and a board view that shows every card in Start/Stop/Continue columns once
revealed. Anonymous cards display without an author name. Depends on cards
existing but can be built against seed data.

Acceptance criteria:
- Facilitator-only "Reveal" button/action sets `boards.phase` from `submit`
  to the next phase (e.g. `cluster`) — guarded server-side to facilitator
  only (builds on task 5).
- Once revealed, every participant's query/UI shows all cards from all
  participants, grouped into Start/Stop/Continue columns.
- Cards from anonymous participants display with no name/identifier; named
  cards show the author's name.
- Pre-reveal privacy (task 9) still holds for any board still in `submit`
  phase — this task only changes behavior post-reveal.
- Can be built/tested against a seeded board with pre-existing cards (task 3
  seed data) without needing task 9's UI to be complete.

Out of scope: clustering (task 11), voting (task 12), realtime propagation of
the reveal to other open tabs (nice-to-have if task 8 is already done, not
required to pass this task).

## 11. Manual clustering of cards
Goal: The team can drag similar cards together into named topic clusters.
Description: Implement drag-and-drop to group cards into `clusters`, recording
membership in `card_clusters`, with the ability to name a cluster and move cards
between clusters. Updates broadcast live to all viewers. Works on revealed cards.

Acceptance criteria:
- On a revealed board, any participant can drag a card onto another card or
  an existing cluster to group them; this creates a `clusters` row (if new)
  and a `card_clusters` row linking the card.
- A cluster can be renamed (free text) by any participant.
- A card can be moved from one cluster back to ungrouped, or from one
  cluster to another; `card_clusters` updates accordingly (no orphaned
  duplicate memberships for the same card).
- Clustering changes appear for other open viewers without a manual refresh,
  using the task 8 realtime helper.
- Works on top of revealed cards (task 10); does not require voting or
  discussion features.
- Basic drag interaction works with mouse; keyboard/touch fallback is a nice
  to have, note if deferred.

Out of scope: automatic/suggested clustering (explicitly out of product
scope), voting on clusters (task 12).

## 12. Live voting on clusters
Goal: Each participant casts three votes across clusters, stackable, in real time.
Description: Build the voting UI enforcing a per-participant budget of three
votes, allowing multiple votes on one cluster, writing `votes` rows. Vote tallies
update live for everyone and clusters can be shown ranked by votes. Assumes
clusters exist.

Acceptance criteria:
- Once the board is in the vote phase, each cluster shows a vote button/
  control and its current tally.
- A participant can cast up to 3 votes total across all clusters on this
  board; stacking multiple votes on one cluster is allowed.
- Casting a 4th vote (over budget) is rejected server-side, not just
  disabled in the UI — proven by a test.
- Each vote writes a `votes` row (FK cluster, FK participant); a
  participant's remaining vote count is derivable from their existing rows.
- Vote tallies update live for all open viewers via the task 8 realtime
  helper.
- Clusters can be displayed sorted by vote count, highest first.
- Assumes clusters already exist (task 11); does not implement discussion or
  action items.

Out of scope: locking votes once discussion starts (covered by task 15's
phase gating), removing/changing a cast vote (note as open question if not
specified by product scope).

## 13. Discussion: decisions and action items
Goal: During discussion, capture decisions and action items with owner and due date.
Description: For the top clusters, add a panel to record free-text decisions and
create `action_items` (text, owner, due date) tied to the board. This is the
output of the retro; it depends on clusters existing but not on the voting math.

Acceptance criteria:
- In the discuss phase, each cluster (or the currently-selected one) has a
  panel to add a free-text decision note and one or more action items.
- Each action item requires text, an owner (free text name, no account
  system), and a due date; all three are required to save.
- Saving writes an `action_items` row tied to the board (and optionally the
  cluster, if useful for later reference).
- Added action items appear in the panel immediately for the person who
  added them; live sync to other viewers via task 8 helper if that task is
  done, otherwise on next refresh.
- Works against a board with existing clusters (task 11); does not require
  vote tallies to be correct or final.

Out of scope: editing/deleting action items after creation (note as open
question), the cross-week list view (task 14).

## 14. Cross-week action items view
Goal: A page lists action items across weeks, filterable by week.
Description: Build a view that queries `action_items` across all boards and lets
the user filter by week (and optionally by project). Shows owner, due date, and
source board. Read-only; independent of the live board flow.

Acceptance criteria:
- A page (e.g. `/action-items`) lists all `action_items` joined to their
  source `boards`/`projects`, showing text, owner, due date, project name,
  and week.
- A filter control narrows the list by week; a second filter by project is
  present (nice-to-have if week-only ships first).
- Sorted by due date (or week) by default, most relevant/soonest first.
- Read-only — no create/edit/delete here (that's task 13's job).
- Works against seeded action items across at least two different boards/
  weeks, proving the cross-week aggregation actually spans boards.
- Does not require the live board flow (tasks 8–13) to be open or running —
  pure read from the table.

Out of scope: editing action items from this view, marking them done
(explicitly out of product scope for this version unless added later).

## 15. Board phase state machine and facilitator controls
Goal: The board moves through submit → reveal/cluster → vote → discuss under
facilitator control.
Description: Formalize the `phase` field as a state machine with allowed
transitions, and give the facilitator controls to advance phases. Each phase
gates which actions are available. This ties the earlier feature tasks together;
build it so each phase's guard is testable in isolation.

Acceptance criteria:
- Valid phases and transitions are defined explicitly (e.g. `submit` →
  `cluster` → `vote` → `discuss`, no skipping, no going backward — or state
  the exceptions if backward transitions are needed).
- A single shared guard/util validates "is this transition allowed" and "is
  this action allowed in the current phase" — reused by tasks 9–13's checks
  rather than each reimplementing phase logic ad hoc.
- Facilitator sees a control to advance to the next phase; advancing is
  rejected server-side for non-facilitators (builds on task 5).
- Attempting an action outside its allowed phase (e.g. submitting a card
  after reveal, voting before the vote phase) is rejected server-side, each
  covered by a test.
- Each phase transition guard is unit-testable in isolation, without needing
  a full board/UI render.
- Ties together tasks 9–13's phase-dependent behavior; can be built once
  those tasks' basic CRUD exists, retrofitting their guards to use this
  shared state machine.

Out of scope: pausing/undoing a phase transition, per-board custom phase
sequences.

## 16. Deploy
Goal: The app is deployed and reachable at a URL.
Description: Deploy the Next.js app (e.g. Vercel) wired to the Supabase project,
with environment variables and production build configured. Verify a full happy
path works against the deployed instance.

Acceptance criteria:
- App builds and deploys successfully on the chosen host (e.g. Vercel)
  pointed at the production/shared Supabase project.
- Production env vars (Supabase URL/anon key, any others) are set in the
  host's dashboard, not committed to the repo.
- Deployed URL loads the home/project list page without error.
- One full happy-path pass on the deployed instance: create project → create
  board → join as two participants → submit cards → reveal → cluster → vote
  → add action item → see it in the cross-week view.
- Basic error page/handling exists for a missing/invalid board link (no raw
  stack trace shown to users).

Out of scope: custom domain, CI/CD pipeline automation (manual deploy is
fine for this version), monitoring/alerting.

## 17. Site navigation on the board page
Goal: A participant on a board page can get back to the rest of the app.
Description: The board page (`app/board/[boardId]/page.tsx`) currently has
no link back to home/projects — once you're on a board, you're stuck there
except via browser back. Add a small persistent nav (e.g. a header with a
link to `/` and/or `/projects`) shown on the board page, and ideally shared
across all pages for consistency.

Acceptance criteria:
- From the board page, a visible link/button navigates back to `/` (or
  `/projects`) without relying on the browser back button.
- The same nav element (or equivalent) appears consistently on the other
  pages (`/projects`, `/projects/[projectId]`, `/action-items`) — no
  page is a dead end.
- Doesn't interfere with the board's own content (phase columns, facilitator
  links, etc.) — lives in a distinct header area.
- Follows `_docs/design-guidelines.md` (uses the existing color tokens, not
  new one-off styles).

Out of scope: full app navigation/sidebar redesign, breadcrumbs.

## 18. Facilitator becomes a self-claimed role (supersedes task 5's secret token)
Goal: Any participant can become facilitator with one click; no secret link.
Description: Originally flagged as "nobody can actually become facilitator"
(the board creator was never granted the role, and the only path was a
`facilitator_token` never surfaced in the UI). Product decision: privacy of
the facilitator role isn't a concern, so replace the secret-token model
entirely — any joined participant can self-claim facilitator via a button.
Single facilitator per board; claiming replaces whoever had it. Pre-reveal
card privacy (task 9 — nobody, facilitator included, sees others' cards
until the board leaves the submit phase) is unaffected and unchanged.

Implemented as:
- Migration `20260826010000_self_claim_facilitator.sql`: drops
  `boards.facilitator_token`, adds `boards.facilitator_participant_id`
  (nullable FK to `participants`).
- `lib/facilitator.ts`: `checkIsFacilitator(boardId, participantId)` compares
  against `facilitator_participant_id` directly — no cookie/token
  comparison. `requireFacilitator` unchanged in signature/behavior for
  callers (task 15's phase actions still just call it with a boardId).
- `app/board/[boardId]/facilitator-actions.ts`: `becomeFacilitator(boardId)`
  — no authorization check beyond "is a joined participant"; sets
  `facilitator_participant_id` to the caller.
- Board page shows "You are the facilitator" / "Facilitated by <name>" or
  "No facilitator yet" + a claim/take-over button.
- Removed: `lib/facilitator-token.ts`, `middleware.ts` (no more
  `?facilitator=` query param flow).

Acceptance criteria:
- Any joined participant can click "Become facilitator" and immediately
  gain facilitator powers (phase-advance controls) — proven by exercising
  `becomeFacilitator` then a phase-advance action.
- A second participant claiming replaces the first — the first participant's
  `AdvancePhaseButton`/facilitator UI reflects the loss on next render (no
  two simultaneous facilitators).
- `requireFacilitator` still rejects a non-facilitator's attempt to call a
  phase-advance action server-side (task 15's guarantee holds under the new
  model).
- No board, anywhere, still references the dropped `facilitator_token`
  column.

Out of scope: real-time notification when facilitator status changes hands
(participant only sees it on next navigation/refresh).

## 19. Write a README
Goal: A newcomer can understand, run, and use the app from the README alone.
Description: There's no `README.md` yet. Follow the pattern used by the
sibling `weekly-feedback` CLI project's README
(`/Users/sean/Git/ai-dev-tools-zoomcamp/01-ai-native-workflow/weekly-feedback/README.md`):
title + one-paragraph pitch, a stack/storage note up top, `## Setup` (install
+ run locally), `## Quick start` (a real end-to-end example with commands/
URLs and a sample of what you'd see), a table of the app's pages/routes
(parallel to that README's commands table), a note on any non-obvious
design decision worth flagging up front (this app's self-claimed
single-facilitator model, task 18), `## Where the data lives` (schema/
migrations location, local vs hosted Supabase), and `## Development` (tests,
build, deploy).

Acceptance criteria:
- `README.md` exists at the project root.
- Opens with a short pitch + stack note (Next.js + Supabase, no accounts,
  RLS-enforced privacy) — mirrors the reference README's opening two
  paragraphs in spirit, not verbatim.
- `## Setup` covers: `npm install`, `supabase start`, `supabase db reset`,
  `.env.local` from `.env.example`, `npm run dev`.
- `## Quick start` walks one full retro end-to-end (create project → create
  board → join → submit cards → reveal → cluster → vote → discuss → action
  items), with real URLs/paths, the way the reference README's Quick start
  walks `project add` → `add` → `report`.
- A table lists the app's routes/pages and what each does (mirrors the
  reference's `## Commands` table).
- Calls out the facilitator model (self-claim, single, replaces) and the
  pre-reveal card privacy (RLS-enforced) as the two most surprising design
  decisions, briefly.
- `## Where the data lives` names `supabase/migrations/`, `supabase/seed.sql`,
  and local (`supabase start`) vs hosted project distinction.
- `## Development` covers `npm test`, `npm run build`, and points to
  `_docs/tasks.md` and `_docs/design-guidelines.md` for further detail.
- Kept as terse and skimmable as the reference README — short paragraphs,
  code blocks over prose, no marketing language.

Out of scope: a CONTRIBUTING.md, API reference docs, changelog.
