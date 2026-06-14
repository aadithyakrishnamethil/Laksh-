-- Enable RLS on all tables
alter table profiles enable row level security;
alter table parent_links enable row level security;
alter table classes enable row level security;
alter table class_members enable row level security;
alter table goals enable row level security;
alter table subject_goals enable row level security;
alter table diagnostics enable row level security;
alter table diagnostic_items enable row level security;
alter table mastery enable row level security;
alter table study_plans enable row level security;
alter table plan_tasks enable row level security;
alter table predictions enable row level security;
alter table question_bank enable row level security;
alter table practice_papers enable row level security;
alter table mock_tests enable row level security;
alter table attempts enable row level security;
alter table attempt_answers enable row level security;
alter table coach_conversations enable row level security;
alter table coach_messages enable row level security;
alter table notes enable row level security;
alter table flashcards enable row level security;
alter table xp_events enable row level security;
alter table student_achievements enable row level security;
alter table streaks enable row level security;
alter table challenge_progress enable row level security;
alter table focus_sessions enable row level security;
alter table productivity_logs enable row level security;
alter table burnout_signals enable row level security;
alter table learning_style enable row level security;
alter table notifications enable row level security;

-- ─── Helper functions ───────────────────────────────────────────────────────

create or replace function get_linked_student_ids(parent_uid uuid)
returns setof uuid language sql security definer stable as $$
  select student_id from parent_links
  where parent_id = parent_uid and status = 'active';
$$;

create or replace function get_teacher_student_ids(teacher_uid uuid)
returns setof uuid language sql security definer stable as $$
  select cm.student_id
  from class_members cm
  join classes c on c.id = cm.class_id
  where c.teacher_id = teacher_uid;
$$;

-- ─── Public tables (read-only, no auth needed) ──────────────────────────────

-- subjects: public read
create policy "subjects_public_read" on subjects for select using (true);
-- chapters: public read
create policy "chapters_public_read" on chapters for select using (true);
-- achievements: public read
create policy "achievements_public_read" on achievements for select using (true);
-- question_bank: authenticated read
create policy "qb_authenticated_read" on question_bank for select using (auth.role() = 'authenticated');
create policy "practice_papers_read" on practice_papers for select using (auth.role() = 'authenticated');
create policy "mock_tests_read" on mock_tests for select using (auth.role() = 'authenticated');
create policy "challenges_read" on challenges for select using (auth.role() = 'authenticated');

-- ─── Profiles ───────────────────────────────────────────────────────────────

create policy "profile_own_read" on profiles for select using (auth.uid() = id);
create policy "profile_own_update" on profiles for update using (auth.uid() = id);

-- Parents can read linked student profiles
create policy "profile_parent_read" on profiles for select using (
  id in (select get_linked_student_ids(auth.uid()))
);

-- Teachers can read class member profiles
create policy "profile_teacher_read" on profiles for select using (
  id in (select get_teacher_student_ids(auth.uid()))
);

-- ─── Student-owned tables (standard pattern) ─────────────────────────────────

-- Goals
create policy "goals_student_crud" on goals for all using (student_id = auth.uid());
create policy "goals_parent_read" on goals for select using (student_id in (select get_linked_student_ids(auth.uid())));
create policy "goals_teacher_read" on goals for select using (student_id in (select get_teacher_student_ids(auth.uid())));

-- Subject goals (via goal owner)
create policy "subject_goals_read" on subject_goals for select using (
  goal_id in (select id from goals where student_id = auth.uid())
  or goal_id in (select id from goals where student_id in (select get_linked_student_ids(auth.uid())))
  or goal_id in (select id from goals where student_id in (select get_teacher_student_ids(auth.uid())))
);
create policy "subject_goals_write" on subject_goals for all using (
  goal_id in (select id from goals where student_id = auth.uid())
);

-- Diagnostics
create policy "diagnostics_student_crud" on diagnostics for all using (student_id = auth.uid());
create policy "diagnostics_parent_read" on diagnostics for select using (student_id in (select get_linked_student_ids(auth.uid())));
create policy "diagnostics_teacher_read" on diagnostics for select using (student_id in (select get_teacher_student_ids(auth.uid())));

-- Diagnostic items
create policy "diagnostic_items_student" on diagnostic_items for all using (
  diagnostic_id in (select id from diagnostics where student_id = auth.uid())
);

-- Mastery
create policy "mastery_student_crud" on mastery for all using (student_id = auth.uid());
create policy "mastery_parent_read" on mastery for select using (student_id in (select get_linked_student_ids(auth.uid())));
create policy "mastery_teacher_read" on mastery for select using (student_id in (select get_teacher_student_ids(auth.uid())));

-- Study plans
create policy "plans_student_crud" on study_plans for all using (student_id = auth.uid());
create policy "plans_parent_read" on study_plans for select using (student_id in (select get_linked_student_ids(auth.uid())));
create policy "plans_teacher_read" on study_plans for select using (student_id in (select get_teacher_student_ids(auth.uid())));

-- Plan tasks
create policy "tasks_student" on plan_tasks for all using (
  plan_id in (select id from study_plans where student_id = auth.uid())
);
create policy "tasks_parent_read" on plan_tasks for select using (
  plan_id in (select id from study_plans where student_id in (select get_linked_student_ids(auth.uid())))
);

-- Predictions
create policy "predictions_student_crud" on predictions for all using (student_id = auth.uid());
create policy "predictions_parent_read" on predictions for select using (student_id in (select get_linked_student_ids(auth.uid())));
create policy "predictions_teacher_read" on predictions for select using (student_id in (select get_teacher_student_ids(auth.uid())));

-- Attempts
create policy "attempts_student_crud" on attempts for all using (student_id = auth.uid());
create policy "attempt_answers_student" on attempt_answers for all using (
  attempt_id in (select id from attempts where student_id = auth.uid())
);

-- Coach conversations
create policy "conversations_student_crud" on coach_conversations for all using (student_id = auth.uid());
create policy "messages_student" on coach_messages for all using (
  conversation_id in (select id from coach_conversations where student_id = auth.uid())
);

-- Notes + Flashcards
create policy "notes_student_crud" on notes for all using (student_id = auth.uid());
create policy "flashcards_student_crud" on flashcards for all using (student_id = auth.uid());

-- Gamification
create policy "xp_events_student_read" on xp_events for select using (student_id = auth.uid());
create policy "xp_events_student_insert" on xp_events for insert with check (student_id = auth.uid());
create policy "student_achievements_crud" on student_achievements for all using (student_id = auth.uid());
create policy "streaks_student_crud" on streaks for all using (student_id = auth.uid());
create policy "challenge_progress_student_crud" on challenge_progress for all using (student_id = auth.uid());

-- Focus + Burnout
create policy "focus_sessions_student_crud" on focus_sessions for all using (student_id = auth.uid());
create policy "productivity_logs_student_crud" on productivity_logs for all using (student_id = auth.uid());
create policy "burnout_student_crud" on burnout_signals for all using (student_id = auth.uid());
create policy "burnout_parent_read" on burnout_signals for select using (student_id in (select get_linked_student_ids(auth.uid())));
create policy "learning_style_student_crud" on learning_style for all using (student_id = auth.uid());

-- Notifications
create policy "notifications_own" on notifications for all using (user_id = auth.uid());

-- ─── Classes ─────────────────────────────────────────────────────────────────

create policy "classes_teacher_crud" on classes for all using (teacher_id = auth.uid());
create policy "classes_member_read" on classes for select using (
  id in (select class_id from class_members where student_id = auth.uid())
);
create policy "class_members_teacher" on class_members for all using (
  class_id in (select id from classes where teacher_id = auth.uid())
);
create policy "class_members_student_read" on class_members for select using (student_id = auth.uid());

-- Parent links
create policy "parent_links_own" on parent_links for all using (
  parent_id = auth.uid() or student_id = auth.uid()
);
