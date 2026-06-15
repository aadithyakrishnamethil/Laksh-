import { getAchievementsData } from '@/lib/db/queries'
import { AchievementsClient } from './achievements-client'

export const metadata = { title: 'Achievements' }

export default async function AchievementsPage() {
  const data = await getAchievementsData()
  return <AchievementsClient data={data} />
}
