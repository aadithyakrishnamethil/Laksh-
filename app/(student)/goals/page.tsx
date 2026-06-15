import type { Metadata } from 'next'
import { GoalsClient } from './goals-client'
import { getGoalData } from '@/lib/db/queries'
import { getProfile } from '@/lib/db/queries'

export const metadata: Metadata = { title: 'My Goals' }

export default async function GoalsPage() {
  const [profile, goalData] = await Promise.all([getProfile(), getGoalData()])
  return <GoalsClient examDate={profile.target_exam_date} initialGoal={goalData} />
}
