-- XP events
create table if not exists xp_events (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  amount integer not null default 0,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists xp_events_student_id_idx on xp_events(student_id);

-- Achievements definition
create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  title text not null,
  description text not null default '',
  icon text not null default '🏅',
  tier text not null check (tier in ('bronze', 'silver', 'gold', 'platinum')) default 'bronze'
);

-- Student achievements (earned)
create table if not exists student_achievements (
  student_id uuid not null references profiles(id) on delete cascade,
  achievement_id uuid not null references achievements(id),
  earned_at timestamptz not null default now(),
  primary key (student_id, achievement_id)
);

-- Streaks
create table if not exists streaks (
  student_id uuid primary key references profiles(id) on delete cascade,
  current integer not null default 0,
  longest integer not null default 0,
  last_active date not null default current_date
);

-- Weekly challenges
create table if not exists challenges (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null,
  title text not null,
  target_desc text not null,
  reward_xp integer not null default 100
);

-- Challenge progress
create table if not exists challenge_progress (
  student_id uuid not null references profiles(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  progress integer not null default 0,
  completed boolean not null default false,
  primary key (student_id, challenge_id)
);

-- Leaderboard view
create or replace view leaderboard as
select
  p.id as student_id,
  p.full_name,
  p.avatar_url,
  coalesce(sum(x.amount), 0) as total_xp,
  rank() over (order by coalesce(sum(x.amount), 0) desc) as rank
from profiles p
left join xp_events x on x.student_id = p.id
where p.role = 'student'
group by p.id, p.full_name, p.avatar_url;

-- Seed achievements
insert into achievements (code, title, description, icon, tier) values
  ('first_login',           'Welcome to Laksh!',    'Completed your first login',                '🎉', 'bronze'),
  ('goal_set',              'Goal Setter',            'Set your first study goal',                 '🎯', 'bronze'),
  ('diagnostic_done',       'Know Thyself',           'Completed the diagnostic assessment',       '🔍', 'bronze'),
  ('streak_7',              '7-Day Warrior',          'Maintained a 7-day study streak',           '🔥', 'silver'),
  ('streak_30',             'Month Master',           'Maintained a 30-day study streak',          '⚡', 'gold'),
  ('mock_test_80',          'Top Scorer',             'Scored 80%+ in a mock test',                '🏆', 'gold'),
  ('all_chapters_strength', 'Subject Conqueror',     'All chapters at Strength level',            '💪', 'platinum'),
  ('goal_achieved',         'Exam Conqueror',         'Achieved your target score',                '👑', 'platinum'),
  ('week_challenge',        'Challenge Champion',    'Completed a weekly challenge',              '🌟', 'silver'),
  ('xp_500',                'Rising Star',            'Earned 500 XP',                             '⭐', 'bronze'),
  ('xp_5000',               'Study Legend',           'Earned 5000 XP',                            '🌙', 'gold'),
  ('flashcard_100',         'Memory Master',          'Reviewed 100 flashcards',                   '🃏', 'silver')
on conflict (code) do nothing;
