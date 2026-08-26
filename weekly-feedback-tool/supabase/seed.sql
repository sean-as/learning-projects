-- Demo data for local development: one project with one board in its
-- default (submit) phase, so later tasks (4, 9, 10, 11, 12, 13) have
-- something to build/test against without needing the project/board UI
-- (tasks 6/7) to exist yet.

insert into projects (id, name, description)
values (
  '00000000-0000-0000-0000-000000000001',
  'Demo Project',
  'Seeded project for local development and testing.'
);

insert into boards (id, project_id, week, phase)
values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  date_trunc('week', now())::date,
  'submit'
);
