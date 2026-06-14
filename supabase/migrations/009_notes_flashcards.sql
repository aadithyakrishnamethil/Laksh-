-- Notes
create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  chapter_id text not null references chapters(id),
  source text not null check (source in ('ai', 'manual')) default 'ai',
  content_md text not null default '',
  ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_student_id_idx on notes(student_id);
create index if not exists notes_chapter_id_idx on notes(chapter_id);

-- Flashcards (with SRS fields)
create table if not exists flashcards (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  chapter_id text not null references chapters(id),
  front text not null,
  back text not null,
  srs_due timestamptz not null default now(),
  srs_interval integer not null default 1,   -- days
  srs_ease numeric(4,2) not null default 2.5, -- SM-2 ease factor
  created_at timestamptz not null default now()
);

create index if not exists flashcards_student_id_idx on flashcards(student_id);
create index if not exists flashcards_srs_due_idx on flashcards(srs_due);
