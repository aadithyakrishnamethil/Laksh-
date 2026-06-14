-- Focus sessions
create table if not exists focus_sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  focus_score numeric(5,2) not null default 0 check (focus_score between 0 and 100),
  distractions integer not null default 0
);

create index if not exists focus_sessions_student_id_idx on focus_sessions(student_id);

-- Productivity logs (daily aggregates)
create table if not exists productivity_logs (
  student_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  minutes_studied integer not null default 0,
  tasks_done integer not null default 0,
  primary key (student_id, date)
);

-- Burnout signals
create table if not exists burnout_signals (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  score numeric(5,2) not null default 0,
  factors jsonb not null default '{}',
  level text not null check (level in ('ok', 'watch', 'high')) default 'ok'
);

create index if not exists burnout_student_id_idx on burnout_signals(student_id);
create index if not exists burnout_date_idx on burnout_signals(date);

-- Learning style
create table if not exists learning_style (
  student_id uuid primary key references profiles(id) on delete cascade,
  style text not null check (style in ('visual', 'auditory', 'kinesthetic', 'reading')) default 'visual',
  evidence jsonb not null default '{}'
);
