# Database schema

Defined in `supabase/migrations/20260825223737_initial_schema.sql`. Demo data
in `supabase/seed.sql`.

| Table | Purpose |
|---|---|
| `projects` | Persistent project a team runs weekly retros for. |
| `boards` | One retro board per `(project, week)`. Tracks `phase`: `submit` → `cluster` → `vote` → `discuss` → `closed`. Holds the `facilitator_token` used for the facilitator-only link. |
| `participants` | A per-board identity (named or anonymous). No accounts — created when someone joins a board link. |
| `cards` | A start/stop/continue entry, authored by a participant, scoped to a board. |
| `clusters` | A named topic grouping of cards, created during the cluster phase. |
| `card_clusters` | Many-to-many join: which cards belong to which cluster. |
| `votes` | One row per vote cast by a participant on a cluster. Multiple rows for the same participant/cluster pair represent stacked votes. |
| `action_items` | A decision/follow-up captured during discussion: text, owner, due date, tied to a board (and optionally the cluster it came from). Queried across weeks independent of the live board flow. |

Notes:
- `boards` has a unique constraint on `(project_id, week)`.
- Row-level security policies are added per-feature in the tasks that need
  them (not part of the base schema).
- Apply locally with `supabase db reset` (runs migrations + seed).
