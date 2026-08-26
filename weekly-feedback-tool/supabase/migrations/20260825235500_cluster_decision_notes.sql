-- Task 13: each cluster gets a free-text decision note captured during
-- discussion, alongside the action items already modeled by action_items.
alter table clusters add column decision_notes text;
