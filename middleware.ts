import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // مسارات Super Admin
    if (path.startsWith('/admin')) {
      if ((token as any)?.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // مسارات المرشدين العاديين
    if (path.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => true // نسمح للكل ثم نتحقق في middleware
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}