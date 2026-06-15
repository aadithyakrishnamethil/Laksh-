import { getProfile } from '@/lib/db/queries'
import { getGoalData } from '@/lib/db/queries'
import { CoachClient } from './coach-client'

export const metadata = { title: 'AI Coach' }

export default async function CoachPage() {
  const [profile, goalData] = await Promise.all([getProfile(), getGoalData()])
  return (
    <CoachClient
      userName={profile.full_name}
      targetPct={goalData.targetPct}
      examDate={profile.target_exam_date}
    />
  )
}
