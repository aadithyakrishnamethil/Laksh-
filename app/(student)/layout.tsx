import { AppShell } from '@/components/layout/app-shell'
import { createClient } from '@/lib/supabase/server'
import { getGoalData } from '@/lib/db/queries'
import type { Profile } from '@/types'
import type { GoalData } from '@/lib/db/queries'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  let profile: Profile | null = null
  let unreadCount = 0
  let goalData: GoalData | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const [profileRes, notifRes, goal] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false),
        getGoalData(),
      ])
      profile = profileRes.data
      unreadCount = notifRes.count ?? 0
      goalData = goal
    }
  } catch {
    profile = null
  }

  return (
    <AppShell profile={profile} unreadNotifications={unreadCount} initialGoal={goalData}>
      {children}
    </AppShell>
  )
}
