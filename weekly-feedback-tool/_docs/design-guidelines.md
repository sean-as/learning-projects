# Design guidelines

Minimal/clean visual style. Tailwind CSS v4 (CSS-first config in
`app/globals.css`). Light and dark mode both supported, switching
automatically with the OS/browser preference (`prefers-color-scheme`) — no
manual toggle.

## Brand colors → tokens

| Brand hex | Role | Token |
|---|---|---|
| `#7D72DA` | Primary — buttons, links, focus rings | `--color-primary-*` |
| `#449C7A` | Success / secondary accent — confirmations, positive state | `--color-success-*` |
| `#D9E761` / `#F4F8D3` | Highlight — tags, vote badges, subtle tinted backgrounds. **Not** for button fills (too light for white text) | `--color-highlight-*` |

Neutrals (grays for text/borders/surfaces) are not brand colors — a
standard scale was added since the brand palette has no neutral.

Semantic CSS variables (defined once in `:root`, redefined under
`@media (prefers-color-scheme: dark)`), always use these in components
rather than raw color tokens:

- `--bg` — page background
- `--surface` — card/panel background
- `--surface-tint` — subtle tinted section background (uses highlight color)
- `--border`
- `--text`, `--text-muted`
- `--primary`, `--primary-hover`, `--text-on-primary`
- `--focus-ring`

## Component conventions

The semantic tokens are plain CSS variables (not Tailwind's numbered
`--color-*` scale), so reference them with arbitrary-value syntax:
`bg-[var(--primary)]`, `text-[var(--text-muted)]`, etc. The numbered
`--color-primary-*` / `--color-success-*` / `--color-highlight-*` scales
*do* generate normal utilities (`bg-primary-500`, `text-highlight-600`, …)
for one-off cases that don't fit the semantic tokens.

- **Buttons**: `bg-[var(--primary)]` `hover:bg-[var(--primary-hover)]`
  `text-[var(--text-on-primary)]`, rounded-md, `px-4 py-2`. Secondary/ghost
  buttons: `border border-[var(--border)]` with transparent background.
- **Cards/panels**: `bg-[var(--surface)]` `border border-[var(--border)]`
  `rounded-lg` `p-4`.
- **Inputs**: `border border-[var(--border)]` `rounded-md` `px-3 py-2`,
  focus ring via `:focus-visible` (global, see globals.css).
- **Tags/badges** (vote counts, categories): `bg-highlight-100` /
  `bg-highlight-400` with dark text — never white text on highlight.
- **Spacing scale**: stick to Tailwind's default scale (4px steps); prefer
  `gap-*` on flex/grid containers over manual margins between siblings.
- **Typography**: system sans-serif stack (no custom font loaded). Page
  title `text-2xl font-semibold`, section heading `text-lg font-medium`,
  body `text-sm` / `text-base`, muted/meta text `text-sm text-muted`.

## Layout

- Board phases (submit/cluster/vote/discuss) render as card columns or
  sections in a responsive grid — stack on mobile (`grid-cols-1`), side by
  side on wider screens (`sm:grid-cols-3` for the three card categories).
- Max content width `max-w-3xl` to `max-w-5xl` depending on page, centered
  with `mx-auto`, horizontal padding `px-4`.
