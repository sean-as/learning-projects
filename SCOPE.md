# Weekly Feedback Tool — Scope

A web app for running weekly **start / stop / continue** retrospectives on
code, technical, and design projects. Feedback is collected and organized by
the team (the tool does not generate feedback itself).

## Core model

- **Projects** are persistent. You pick a **project**, then a **week**, to open
  that week's **board**.
- Each board runs one full retro cycle: submit → cluster → vote → discuss.
- Access is by **shared link** — no accounts in this version. People enter a
  **name** (or choose to stay **anonymous**) when they join.
- One person is the **facilitator** and controls phases. Any participant can
  self-claim the role with a single click — no secret link, since privacy of
  the role isn't a concern. Only one facilitator at a time; claiming it
  replaces whoever had it.

## Feedback entries

- Format is structured: **Start / Stop / Continue**.
- An entry is a single **card** in one of those three categories.
- A person can submit **multiple cards per category**.
- Cards are scoped to the current **project + week**.

## The flow (board phases)

The facilitator advances the board through these phases:

1. **Submit (async)**
   - People add cards throughout the week, on their own time.
   - Each person can **only see their own cards** before the reveal (no
     anchoring on others' input).

2. **Reveal & cluster (facilitated)**
   - Facilitator reveals all cards to everyone.
   - The team **manually** drags similar cards together into **clusters** /
     topics. No automatic grouping.

3. **Vote (live / real-time)**
   - Happens synchronously, like a Miro/retro board.
   - Each person gets **3 votes** to cast on topic clusters.
   - Votes can be **stacked** — multiple votes on one topic allowed.

4. **Discuss (top clusters)**
   - Highest-voted clusters are discussed in order.
   - The team **captures decisions and action items** during discussion.

## Action items

- Each action item has an **owner** and a **due date**.
- There is a dedicated **action-items view**, filterable **by week**.
- Previous weeks' full boards do **not** need to be reopened; only the action
  items are surfaced across weeks.

## Visibility summary

| Phase        | Who sees the cards                     |
|--------------|----------------------------------------|
| Submit       | Each person sees only their own cards  |
| Reveal on    | Everyone sees all cards                |
| Cluster/Vote | Everyone                               |
| Results      | Everyone can see the organized board   |

## Roles

- **Facilitator** — self-claimed by any participant, controls phase
  transitions (reveal, start voting, etc.).
- **Participant** — joins via link, submits cards, clusters, votes, discusses.

## Explicitly out of scope (this version)

- Accounts / login (shared link only).
- Automatic/AI-suggested clustering (manual only).
- Tool-generated feedback (collect & organize only).
- Reopening full historical boards (only action items carry a cross-week view).

## Open / not yet decided

- Tech stack (frontend, backend, real-time transport, storage).
- How returning participants are recognized without accounts (e.g. per-board
  browser token).
- Whether anonymous cards are anonymous to the facilitator too.
