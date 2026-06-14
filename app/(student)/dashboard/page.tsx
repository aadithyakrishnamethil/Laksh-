import type { Metadata } from 'next'
import { DashboardClient } from './dashboard-client'
import { getDashboardData } from '@/lib/db/queries'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const data = await getDashboardData()
  return <DashboardClient data={data} />
}
