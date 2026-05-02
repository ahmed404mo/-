'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Users, UserCheck, Calendar, TrendingUp, Shield, Activity } from 'lucide-react'

interface Stats {
  totalAdvisors: number
  totalInterviews: number
  totalFollowUps: number
  totalStudents: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({
    totalAdvisors: 0,
    totalInterviews: 0,
    totalFollowUps: 0,
    totalStudents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'المرشدين الأكاديميين',
      value: stats.totalAdvisors,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'الطلاب المسجلين',
      value: stats.totalStudents,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'المقابلات الإرشادية',
      value: stats.totalInterviews,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'جلسات المتابعة',
      value: stats.totalFollowUps,
      icon: Activity,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">مرحباً، {session?.user?.name}</h1>
        <p className="text-gray-500 mt-2">نظرة عامة على نظام الإرشاد الأكاديمي</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <Shield className="w-5 h-5 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
              <p className="text-gray-500 text-sm mt-1">{card.title}</p>
            </div>
          )
        })}
      </div>

      {/* نشاط النظام */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* آخر النشاطات */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">آخر النشاطات</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">تم إضافة مرشد أكاديمي جديد</p>
                  <p className="text-xs text-gray-400 mt-1">منذ ساعة</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* روابط سريعة */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">روابط سريعة</h2>
          <div className="space-y-3">
            <a href="/admin/advisors" className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700">إدارة المرشدين الأكاديميين</span>
            </a>
            <a href="/admin/students" className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-green-700">إدارة الطلاب</span>
            </a>
            <a href="/admin/reports" className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-purple-700">التقارير والإحصائيات</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}