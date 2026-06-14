import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Laksh — AI Study Platform for CBSE Class 12',
    template: '%s | Laksh',
  },
  description:
    'AI-powered study platform for CBSE Class 12 board exam preparation. Personalised plans, adaptive diagnostics, and smart coaching.',
  keywords: ['CBSE', 'Class 12', 'board exam', 'study app', 'AI tutor', 'India'],
}

export const viewport: Viewport = {
  themeColor: '#2A7AFE',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  )
}
