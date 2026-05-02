'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { Home, Users, FileText, Settings, LogOut, UserCircle } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navLinks = [
    { name: 'الرئيسية', href: '/dashboard', icon: Home },
      // { name: ' إدارة المرشدين', href: '/dashboard/admin/advisors', icon: Settings },
    { name: 'المقابلات الإرشادية', href: '/dashboard/interviews', icon: Users },
    { name: 'تقارير المتابعة', href: '/dashboard/advisor/reports', icon: FileText },
    { name: 'إعدادات المرشد', href: '/dashboard/settings', icon: Settings },
  ]

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-slate-50" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-64 bg-white shadow-xl flex flex-col justify-between hidden md:flex">
        <div className="p-6 border-b border-slate-100 text-center">
          <h2 className="text-xl font-extrabold text-blue-700">الإرشاد الأكاديمي</h2>
          <p className="text-xs text-gray-500 mt-1">كلية التربية للطفولة المبكرة</p>
        </div>

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
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <h3 className="font-semibold text-gray-700">لوحة تحكم المرشد</h3>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
            <div className="text-left">
              <p className="text-sm font-bold text-gray-800">{session?.user?.name || 'مرشد أكاديمي'}</p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
            <UserCircle className="w-10 h-10 text-blue-600" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  )
}