'use server'

import { createClient } from '@/lib/supabase/server'

interface SubjectGoalInput {
  subjectId: string
  targetPct: number
  requiredEffortHrs: number
  feasibility: 'feasible' | 'stretch' | 'unlikely'
  rationale: string
}

interface OnboardingInput {
  fullName: string
  examDate: string
  targetPct: number
  subjectGoals: SubjectGoalInput[]
}

export async function saveOnboarding(
  input: OnboardingInput
): Promise<{ ok: boolean; reason?: 'unauthenticated' }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // No session (e.g. Supabase unconfigured / demo) — let the client navigate.
  if (!user) return { ok: false, reason: 'unauthenticated' }

  // 1. Update profile with name and exam date
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: input.fullName,
      target_exam_date: input.examDate,
    })
    .eq('id', user.id)
  if (profileError) throw profileError

  // 2. Create goal
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .insert({
      student_id: user.id,
      target_overall_pct: input.targetPct,
      status: 'active',
    })
    .select()
    .single()

  if (goalError || !goal) throw goalError ?? new Error('Failed to create goal')

  // 3. Create per-subject goals
  if (input.subjectGoals.length > 0) {
    await supabase.from('subject_goals').insert(
      input.subjectGoals.map((sg) => ({
        goal_id: goal.id,
        subject_id: sg.subjectId,
        target_pct: sg.targetPct,
        required_effort_hrs: sg.requiredEffortHrs,
        ai_feasibility: sg.feasibility,
        ai_rationale: sg.rationale,
      }))
    )
  }

  // 4. Initialise streak row
  await supabase.from('streaks').upsert(
    {
      student_id: user.id,
      current: 0,
      longest: 0,
      last_active: new Date().toISOString().split('T')[0],
    },
    { onConflict: 'student_id' }
  )

  // 5. Award first-login XP
  await supabase.from('xp_events').insert({
    student_id: user.id,
    amount: 50,
    reason: 'Completed onboarding',
  })

  return { ok: true }
}
