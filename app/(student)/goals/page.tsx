import type { Metadata } from 'next'
import { GoalsClient } from './goals-client'
export const metadata: Metadata = { title: 'My Goals' }
export default function GoalsPage() {
  return <GoalsClient />
}
