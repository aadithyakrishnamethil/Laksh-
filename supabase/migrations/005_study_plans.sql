-- Study plans
create table if not exists study_plans (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  goal_id uuid not null references goals(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists study_plans_student_id_idx on study_plans(student_id);

-- Plan tasks
create table if not exists plan_tasks (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references study_plans(id) on delete cascade,
  date date not null,
  subject_id text not null references subjects(id),
  chapter_id text not null references chapters(id),
  type text not null check (type in ('learn', 'practice', 'revise')) default 'learn',
  est_minutes integer not null default 60,
  status text not null check (status in ('pending', 'done', 'missed')) default 'pending',
  rescheduled_from date,
  completed_at timestamptz
);

create index if not exists plan_tasks_plan_id_idx on plan_tasks(plan_id);
create index if not exists plan_tasks_date_idx on plan_tasks(date);
create index if not exists plan_tasks_student_date_idx on plan_tasks(plan_id, date, status);
