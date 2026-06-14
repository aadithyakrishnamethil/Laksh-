-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'parent', 'teacher')) default 'student',
  full_name text not null default '',
  avatar_url text,
  board text not null default 'CBSE',
  class text not null default '12',
  target_exam_date date,
  theme_pref text not null check (theme_pref in ('light', 'dark', 'system')) default 'system',
  created_at timestamptz not null default now()
);

-- Parent links
create table if not exists parent_links (
  parent_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'active')) default 'pending',
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

-- Classes
create table if not exists classes (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  board text not null default 'CBSE',
  class text not null default '12',
  created_at timestamptz not null default now()
);

-- Class members
create table if not exists class_members (
  class_id uuid not null references classes(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
