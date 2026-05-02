'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Settings, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session && (session.user as any)?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:underline flex items-center gap-1">
          <ArrowRight className="w-4 h-4" />
          العودة للوحة التحكم
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">إعدادات النظام</h1>
        <p className="text-gray-500">هذه الصفحة قيد التطوير حاليًا</p>
        <p className="text-sm text-gray-400 mt-4">سيتم إضافة إعدادات النظام قريبًا</p>
      </div>
    </div>
  )
}