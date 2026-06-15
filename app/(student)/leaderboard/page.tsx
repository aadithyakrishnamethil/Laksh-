import { getLeaderboardData } from '@/lib/db/queries'
import { LeaderboardClient } from './leaderboard-client'

export const metadata = { title: 'Leaderboard' }

export default async function LeaderboardPage() {
  const data = await getLeaderboardData()
  return <LeaderboardClient data={data} />
}
