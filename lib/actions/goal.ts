'use server'

import { createClient } from '@/lib/supabase/server'
import type { SubjectBreakdown } from '@/stores/goal-store'

export async function saveGoalAction(
  targetPct: number,
  subjectBreakdowns: Record<string, SubjectBreakdown>
): Promise<{ success: boolean; updatedAt?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Archive the current active goal.
    await supabase
      .from('goals')
      .update({ status: 'abandoned' })
      .eq('student_id', user.id)
      .eq('status', 'active')

    // Insert the new active goal.
    const { data: goal, error: goalErr } = await supabase
      .from('goals')
      .insert({ student_id: user.id, target_overall_pct: targetPct, status: 'active' })
      .select('id, created_at')
      .single()

    if (goalErr || !goal) return { success: false, error: goalErr?.message ?? 'Failed to create goal' }

    // Insert per-subject breakdowns.
    const rows = Object.entries(subjectBreakdowns).map(([subjectId, bd]) => ({
      goal_id: goal.id,
      subject_id: subjectId,
      target_pct: bd.targetPct,
      required_effort_hrs: bd.requiredEffortHrs,
      ai_feasibility: bd.feasibility,
      ai_rationale: bd.rationale,
    }))
    if (rows.length > 0) {
      await supabase.from('subject_goals').insert(rows)
    }

    // Award XP for updating goal.
    await supabase.from('xp_events').insert({
      student_id: user.id,
      amount: 50,
      reason: 'goal_updated',
    })

    return { success: true, updatedAt: goal.created_at }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
