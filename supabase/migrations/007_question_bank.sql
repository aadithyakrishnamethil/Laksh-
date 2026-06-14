-- Question bank
create table if not exists question_bank (
  id uuid primary key default uuid_generate_v4(),
  subject_id text not null references subjects(id),
  chapter_id text not null references chapters(id),
  stem text not null,
  options jsonb not null default '[]', -- array of strings
  answer integer not null default 0,   -- index of correct option
  difficulty integer not null check (difficulty between 1 and 5) default 2,
  solution text not null default '',
  board_year text
);

create index if not exists qb_subject_id_idx on question_bank(subject_id);
create index if not exists qb_chapter_id_idx on question_bank(chapter_id);
create index if not exists qb_difficulty_idx on question_bank(difficulty);

-- Practice papers
create table if not exists practice_papers (
  id uuid primary key default uuid_generate_v4(),
  subject_id text not null references subjects(id),
  name text not null,
  duration_min integer not null default 60,
  questions jsonb not null default '[]' -- array of question IDs
);

-- Mock tests
create table if not exists mock_tests (
  id uuid primary key default uuid_generate_v4(),
  board text not null default 'CBSE',
  class text not null default '12',
  name text not null,
  duration_min integer not null default 180,
  sections jsonb not null default '[]' -- [{subject_id, questions[], marks}]
);

-- Attempts
create table if not exists attempts (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  test_id uuid not null,
  test_type text not null check (test_type in ('practice', 'mock')) default 'practice',
  score numeric(6,2) not null default 0,
  max_score numeric(6,2) not null default 100,
  percentile numeric(5,2),
  predicted_rank integer,
  time_analysis jsonb not null default '{}',
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index if not exists attempts_student_id_idx on attempts(student_id);

-- Attempt answers
create table if not exists attempt_answers (
  attempt_id uuid not null references attempts(id) on delete cascade,
  question_id uuid not null references question_bank(id),
  chosen integer, -- null = unanswered
  correct boolean not null default false,
  time_ms integer not null default 0,
  primary key (attempt_id, question_id)
);
