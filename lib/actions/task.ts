'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleTask(taskId: string, currentStatus: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify the task belongs to a plan owned by the current user
  const { data: owned } = await supabase
    .from('plan_tasks')
    .select('id, study_plans!inner(student_id)')
    .eq('id', taskId)
    .eq('study_plans.student_id', user.id)
    .single()
  if (!owned) throw new Error('Unauthorized')

  const newStatus = currentStatus === 'done' ? 'pending' : 'done'
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('plan_tasks')
    .update({
      status: newStatus,
      completed_at: newStatus === 'done' ? now : null,
    })
    .eq('id', taskId)

  if (error) throw error

  if (newStatus === 'done') {
    await supabase.from('xp_events').insert({
      student_id: user.id,
      amount: 25,
      reason: 'Completed study task',
    })
  }

  revalidatePath('/planner')
  revalidatePath('/dashboard')
  return { newStatus }
}

export async function rescheduleMissedTasks(planId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify the plan belongs to the current user
  const { data: plan } = await supabase
    .from('study_plans')
    .select('id')
    .eq('id', planId)
    .eq('student_id', user.id)
    .single()
  if (!plan) throw new Error('Unauthorized')

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { error } = await supabase
    .from('plan_tasks')
    .update({
      status: 'pending',
      date: tomorrowStr,
      rescheduled_from: new Date().toISOString().split('T')[0],
    })
    .eq('plan_id', planId)
    .eq('status', 'missed')

  if (error) throw error

  revalidatePath('/planner')
  return { rescheduledTo: tomorrowStr }
}
