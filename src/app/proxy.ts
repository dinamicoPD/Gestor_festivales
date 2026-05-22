import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Allow public paths
  if (path === '/login' || path.startsWith('/api')) {
    return NextResponse.next()
  }
  
  // Check for auth token
  const token = request.cookies.get('festival_auth_token')
  
  if (!token && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}