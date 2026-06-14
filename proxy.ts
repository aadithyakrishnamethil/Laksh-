import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const AUTH_ROUTES = ['/login', '/signup']
const PUBLIC_PREFIXES = ['/api/', '/_next/', '/favicon', '/icons/', '/manifest', '/sw.js']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Pass through static/public assets
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Demo mode: a guest clicked "Continue as Demo Student" — allow read-only
  // access to seed data without a Supabase session.
  const isDemo = req.cookies.get('laksh-demo')?.value === '1'

  // Supabase session refresh: always run so cookies stay fresh
  const res = NextResponse.next({
    request: { headers: req.headers },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseKey !== 'placeholder-anon-key'

  if (!isConfigured) {
    // Supabase not wired up — let everything through for local dev
    return res
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value)
              res.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = AUTH_ROUTES.includes(pathname)

    // Unauthenticated user hitting a protected route → login
    // (demo guests are allowed through to seed-data pages)
    if (!user && !isDemo && !isAuthRoute && pathname !== '/') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Authenticated user hitting login/signup → dashboard
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  } catch {
    // Supabase not configured (placeholder keys) — let request through for dev
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.ico$|.*\\.svg$|.*\\.webp$).*)'],
}
