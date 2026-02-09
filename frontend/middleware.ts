import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login/admin?error=unauthorized', req.url))
    }

    // Teacher routes
    if (path.startsWith('/teacher') && token?.role !== 'teacher') {
      return NextResponse.redirect(new URL('/login/teacher?error=unauthorized', req.url))
    }

    // Parent routes
    if (path.startsWith('/parent') && token?.role !== 'parent') {
      return NextResponse.redirect(new URL('/login/parent?error=unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/parent/:path*'],
}
