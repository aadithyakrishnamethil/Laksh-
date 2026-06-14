import type { Metadata } from 'next'
import { TeacherClient } from './teacher-client'

export const metadata: Metadata = { title: 'Teacher Dashboard' }

export default function TeacherDashboardPage() {
  return <TeacherClient />
}
