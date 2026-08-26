-- Facilitator model change: no more secret token. Any participant can
-- claim the role for a board; claiming replaces whoever had it (single
-- facilitator, self-service, no privacy concern per product decision).
alter table boards drop column facilitator_token;

alter table boards
  add column facilitator_participant_id uuid references participants (id) on delete set null;
