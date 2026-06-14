-- Coach conversations
create table if not exists coach_conversations (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'New Conversation',
  created_at timestamptz not null default now()
);

create index if not exists conv_student_id_idx on coach_conversations(student_id);

-- Coach messages
create table if not exists coach_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references coach_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conv_id_idx on coach_messages(conversation_id);
create index if not exists messages_created_at_idx on coach_messages(created_at);
