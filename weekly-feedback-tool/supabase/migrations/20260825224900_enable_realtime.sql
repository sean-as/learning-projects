-- Add board-scoped tables to Supabase's realtime publication so
-- postgres_changes subscriptions (see lib/use-board-realtime.ts) receive
-- insert/update/delete events for them.
alter publication supabase_realtime add table cards, clusters, card_clusters, votes, action_items;
