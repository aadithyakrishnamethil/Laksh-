import { AppShell } from '@/components/layout/app-shell'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  let profile: Profile | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    }
  } catch {
    // Supabase not configured — use mock profile for dev
    profile = {
      id: 'demo-student',
      role: 'student',
      full_name: 'Anya Sharma',
      avatar_url: null,
      board: 'CBSE',
      class: '12',
      target_exam_date: '2025-03-15',
      theme_pref: 'system',
      created_at: new Date().toISOString(),
    }
  }

  return <AppShell profile={profile}>{children}</AppShell>
}
