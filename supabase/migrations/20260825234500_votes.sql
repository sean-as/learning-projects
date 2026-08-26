-- Task 12 (live voting): each participant gets a budget of 3 votes per
-- board, stackable on one cluster, enforced at the database level so a 4th
-- vote is rejected even via a direct request bypassing the app.
--
-- board_id is derived by trigger (never trusted from the client) so it
-- can't be spoofed to dodge the budget check, and so it's available for
-- lib/use-board-realtime.ts's generic `board_id=eq.<id>` filter.
alter table votes add column board_id uuid;

create or replace function set_vote_board_id()
returns trigger
language plpgsql
as $$
begin
  select c.board_id into new.board_id from clusters c where c.id = new.cluster_id;
  return new;
end;
$$;

create trigger votes_set_board_id
before insert on votes
for each row execute function set_vote_board_id();

alter table votes alter column board_id set not null;
alter table votes add constraint votes_board_id_fkey foreign key (board_id) references boards (id) on delete cascade;
create index votes_board_id_idx on votes (board_id);

alter table votes enable row level security;

-- Tallies are public to anyone on the board once voting is relevant; no
-- per-participant privacy concept for votes.
create policy "votes_select_all"
on votes for select
using (true);

create policy "votes_insert_within_budget"
on votes for insert
with check (
  votes.participant_id = nullif(
    current_setting('request.headers', true)::json ->> 'x-participant-id',
    ''
  )::uuid
  and exists (
    select 1 from boards b where b.id = votes.board_id and b.phase = 'vote'
  )
  and (
    select count(*) from votes v
    where v.participant_id = votes.participant_id and v.board_id = votes.board_id
  ) < 3
);
