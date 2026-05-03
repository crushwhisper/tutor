import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/reset-password']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getSession (cookie read, no network call) to avoid edge timeout.
  // Real verification with getUser() happens in Server Component layouts.
  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname

  // Redirect authenticated users away from auth pages
  if (session && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // Redirect unauthenticated users away from app
  if (!session && pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Only run middleware on routes that actually need auth gating.
  // This prevents a Supabase network call on every static/marketing page.
  matcher: ['/app/:path*', '/auth/:path*'],
}
