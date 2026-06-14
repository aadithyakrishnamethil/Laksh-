-- Diagnostics
create table if not exists diagnostics (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('initial', 'periodic', 'chapter')) default 'initial',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  ability_estimate numeric(6,3) not null default 0
);

create index if not exists diagnostics_student_id_idx on diagnostics(student_id);

-- Diagnostic items (responses)
create table if not exists diagnostic_items (
  id uuid primary key default uuid_generate_v4(),
  diagnostic_id uuid not null references diagnostics(id) on delete cascade,
  chapter_id text not null references chapters(id),
  difficulty numeric(4,2) not null default 1,
  correct boolean not null default false,
  response_ms integer not null default 0
);

create index if not exists diagnostic_items_diagnostic_id_idx on diagnostic_items(diagnostic_id);

-- Mastery (per chapter, per student)
create table if not exists mastery (
  student_id uuid not null references profiles(id) on delete cascade,
  chapter_id text not null references chapters(id),
  mastery_pct numeric(5,2) not null default 0 check (mastery_pct between 0 and 100),
  confidence numeric(4,3) not null default 0.5,
  last_assessed timestamptz not null default now(),
  label text not null check (label in ('weakness', 'neutral', 'strength')) default 'neutral',
  primary key (student_id, chapter_id)
);

create index if not exists mastery_student_id_idx on mastery(student_id);
