import { NextResponse, type NextRequest } from 'next/server'

// Auth redirect logic is handled in Server Component layouts.
// This middleware is a no-op passthrough to avoid Edge Runtime timeouts.
export function middleware(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: [],
}
