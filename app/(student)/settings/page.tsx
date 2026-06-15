import type { Metadata } from 'next'
import { SettingsClient } from './settings-client'
import { getProfile } from '@/lib/db/queries'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const profile = await getProfile()
  return <SettingsClient profile={profile} />
}
