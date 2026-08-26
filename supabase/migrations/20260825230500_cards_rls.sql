-- Pre-reveal card privacy (task 9): while a board is in the `submit` phase,
-- a participant may only see their own cards. Once the board has moved past
-- `submit`, cards become visible to everyone (the "reveal").
--
-- There are no real user accounts, so identity is asserted per-request via
-- the `x-participant-id` header (analogous to the facilitator_token bearer
-- pattern from task 5's migration). The Next.js server reads the caller's
-- participant id from their httpOnly join cookie (task 4) and forwards it
-- as this header using a per-request Supabase client
-- (lib/supabase-server.ts) — it is never exposed to client-side JS.
alter table cards enable row level security;

create policy "cards_select_own_or_revealed"
on cards for select
using (
  exists (
    select 1
    from boards b
    where b.id = cards.board_id
      and (
        b.phase <> 'submit'
        or cards.participant_id = nullif(
          current_setting('request.headers', true)::json ->> 'x-participant-id',
          ''
        )::uuid
      )
  )
);

create policy "cards_insert_as_self"
on cards for insert
with check (
  cards.participant_id = nullif(
    current_setting('request.headers', true)::json ->> 'x-participant-id',
    ''
  )::uuid
);

create policy "cards_delete_own_before_reveal"
on cards for delete
using (
  cards.participant_id = nullif(
    current_setting('request.headers', true)::json ->> 'x-participant-id',
    ''
  )::uuid
  and exists (
    select 1 from boards b
    where b.id = cards.board_id and b.phase = 'submit'
  )
);
