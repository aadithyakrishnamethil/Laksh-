-- Predictions (keep full history for trend graph)
create table if not exists predictions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  predicted_overall_pct numeric(5,2) not null,
  confidence_pct numeric(5,2) not null default 70,
  per_subject jsonb not null default '{}',
  risk_level text not null check (risk_level in ('on-track', 'at-risk', 'critical')) default 'on-track',
  generated_at timestamptz not null default now()
);

create index if not exists predictions_student_id_idx on predictions(student_id);
create index if not exists predictions_generated_at_idx on predictions(generated_at);
