-- Task 15: phase-gate the write paths that weren't fully enforced yet.
--
-- cards insert previously only checked participant identity, not phase — a
-- participant could add a card after reveal. card_clusters and
-- action_items had no RLS at all. This closes those gaps so "an action
-- outside its allowed phase" is rejected at the database level, matching
-- the app-level guard in lib/board-phase-guard.ts.

alter policy "cards_insert_as_self" on cards
with check (
  cards.participant_id = nullif(
    current_setting('request.headers', true)::json ->> 'x-participant-id',
    ''
  )::uuid
  and exists (
    select 1 from boards b where b.id = cards.board_id and b.phase = 'submit'
  )
);

alter table card_clusters enable row level security;

create policy "card_clusters_select_all"
on card_clusters for select
using (true);

create policy "card_clusters_insert_during_cluster_phase"
on card_clusters for insert
with check (
  exists (select 1 from boards b where b.id = card_clusters.board_id and b.phase = 'cluster')
);

create policy "card_clusters_delete_during_cluster_phase"
on card_clusters for delete
using (
  exists (select 1 from boards b where b.id = card_clusters.board_id and b.phase = 'cluster')
);

alter table action_items enable row level security;

create policy "action_items_select_all"
on action_items for select
using (true);

create policy "action_items_insert_during_discuss_phase"
on action_items for insert
with check (
  exists (select 1 from boards b where b.id = action_items.board_id and b.phase = 'discuss')
);
