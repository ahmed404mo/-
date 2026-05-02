'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  UserCircle,
  Shield,
  FileText,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  // التحقق من صلاحية Super Admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session && (session.user as any)?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  const navLinks = [
    { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
    { name: 'إدارة المرشدين', href: '/admin/advisors', icon: Users },
    { name: 'إدارة الطلاب', href: '/admin/students', icon: TrendingUp },
    { name: 'التقارير العامة', href: '/admin/reports', icon: FileText },
    { name: 'إعدادات النظام', href: '/admin/settings', icon: Settings },
  ]

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>
  }

  if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      
      {/* القائمة الجانبية */}
      <aside className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl">
        {/* الترويسة */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-500" />
            <div>
              <h2 className="text-xl font-bold">لوحة المشرف العام</h2>
              <p className="text-xs text-gray-400 mt-1">Super Admin Panel</p>
            </div>
          </div>
        </div>

        {/* معلومات المستخدم */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <p className="font-semibold">{session?.user?.name}</p>
              <p className="text-xs text-gray-400">{session?.user?.email}</p>
              <span className="text-xs bg-yellow-500 text-gray-900 px-2 py-0.5 rounded mt-1 inline-block">
                Super Admin
              </span>
            </div>
          </div>
        </div>

        {/* الروابط */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-yellow-500 text-gray-900'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* زر تسجيل الخروج */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* الشريط العلوي */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">المشرف العام</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('ar-EG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </header>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}