-- Initial schema for Weekly Feedback Tool.
--
-- Tables:
--   projects       persistent projects that own a series of weekly boards
--   boards         one retro board per (project, week); tracks phase
--   participants   a per-board identity (named or anonymous), no accounts
--   cards          start/stop/continue entries, authored by a participant
--   clusters       named topic groupings of cards, created during the
--                  cluster phase
--   card_clusters  many-to-many: which cards belong to which cluster
--   votes          one row per vote cast by a participant on a cluster
--                  (multiple rows per participant/cluster = stacked votes)
--   action_items   decisions/follow-ups captured during discussion, with
--                  owner + due date; queried across weeks independent of
--                  the live board flow

create extension if not exists "pgcrypto";

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table boards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  week date not null,
  phase text not null default 'submit'
    check (phase in ('submit', 'cluster', 'vote', 'discuss', 'closed')),
  facilitator_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique (project_id, week)
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards (id) on delete cascade,
  name text,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards (id) on delete cascade,
  participant_id uuid not null references participants (id) on delete cascade,
  category text not null check (category in ('start', 'stop', 'continue')),
  content text not null,
  created_at timestamptz not null default now()
);

create table clusters (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards (id) on delete cascade,
  name text not null default 'Untitled',
  created_at timestamptz not null default now()
);

create table card_clusters (
  card_id uuid not null references cards (id) on delete cascade,
  cluster_id uuid not null references clusters (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (card_id, cluster_id)
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  cluster_id uuid not null references clusters (id) on delete cascade,
  participant_id uuid not null references participants (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table action_items (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards (id) on delete cascade,
  cluster_id uuid references clusters (id) on delete set null,
  text text not null,
  owner text not null,
  due_date date not null,
  created_at timestamptz not null default now()
);

create index cards_board_id_idx on cards (board_id);
create index cards_participant_id_idx on cards (participant_id);
create index clusters_board_id_idx on clusters (board_id);
create index votes_cluster_id_idx on votes (cluster_id);
create index votes_participant_id_idx on votes (participant_id);
create index action_items_board_id_idx on action_items (board_id);
create index boards_project_id_idx on boards (project_id);

-- No RLS policies yet (added per-feature in later tasks, e.g. task 9's
-- pre-reveal card privacy). For now, grant the PostgREST roles table access
-- so the app can read/write through the anon key during early development.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
