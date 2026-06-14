-- Goals
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  target_overall_pct numeric(5,2) not null check (target_overall_pct between 33 and 100),
  status text not null check (status in ('active', 'achieved', 'abandoned')) default 'active',
  created_at timestamptz not null default now()
);

create index if not exists goals_student_id_idx on goals(student_id);

-- Subject goals
create table if not exists subject_goals (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid not null references goals(id) on delete cascade,
  subject_id text not null references subjects(id),
  target_pct numeric(5,2) not null,
  required_effort_hrs numeric(6,2) not null default 0,
  ai_feasibility text not null check (ai_feasibility in ('feasible', 'stretch', 'unlikely')) default 'feasible',
  ai_rationale text not null default '',
  unique (goal_id, subject_id)
);

create index if not exists subject_goals_goal_id_idx on subject_goals(goal_id);
