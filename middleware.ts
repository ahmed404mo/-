import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    console.log('Middleware - Path:', path)
    console.log('Middleware - Token:', token?.email, 'Role:', (token as any)?.role)

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
      authorized: ({ token }) => {
        console.log('Authorized callback - Token exists:', !!token)
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}