import type { Metadata } from 'next'
import { ParentClient } from './parent-client'

export const metadata: Metadata = { title: 'Parent Dashboard' }

export default function ParentDashboardPage() {
  return <ParentClient />
}
