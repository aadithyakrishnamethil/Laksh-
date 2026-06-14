import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PlannerClient } from './planner-client'
import { SEED_PLAN_TASKS } from '@/lib/db/seed-data'

export const metadata: Metadata = { title: 'Study Planner' }

export default async function PlannerPage() {
  let tasks = SEED_PLAN_TASKS
  let planId: string | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: plan } = await supabase
        .from('study_plans')
        .select('id')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (plan) {
        planId = plan.id
        const { data: planTasks } = await supabase
          .from('plan_tasks')
          .select('id, plan_id, date, subject_id, chapter_id, type, est_minutes, status, rescheduled_from')
          .eq('plan_id', plan.id)
          .order('date', { ascending: true })

        if (planTasks && planTasks.length > 0) {
          tasks = planTasks as typeof SEED_PLAN_TASKS
        }
      }
    }
  } catch {
    // Supabase not configured — use seed data
  }

  return <PlannerClient initialTasks={tasks} planId={planId} />
}
