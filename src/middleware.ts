import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Allow public paths
  if (path === '/login' || path === '/' || path.startsWith('/api')) {
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
