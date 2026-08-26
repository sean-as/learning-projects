-- Task 11 (manual clustering) needs:
--   1. A surrogate `id` on card_clusters so the generic realtime helper
--      (lib/use-board-realtime.ts, which requires rows shaped `{ id: ... }`)
--      can stream membership changes.
--   2. A denormalized `board_id` so that helper's `board_id=eq.<id>` filter
--      works on this table too (it only has card_id/cluster_id otherwise).
--   3. A single cluster per card: replace the (card_id, cluster_id) PK,
--      which allowed a card to belong to multiple clusters, with a unique
--      constraint on card_id alone — moving a card just updates its one
--      membership row instead of leaving stale ones behind.
alter table card_clusters
  add column id uuid not null default gen_random_uuid(),
  add column board_id uuid;

update card_clusters cc
set board_id = c.board_id
from clusters c
where c.id = cc.cluster_id;

alter table card_clusters alter column board_id set not null;
alter table card_clusters
  add constraint card_clusters_board_id_fkey foreign key (board_id) references boards (id) on delete cascade;

alter table card_clusters drop constraint card_clusters_pkey;
alter table card_clusters add primary key (id);
alter table card_clusters add constraint card_clusters_card_id_key unique (card_id);

create index card_clusters_board_id_idx on card_clusters (board_id);
