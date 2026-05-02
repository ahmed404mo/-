import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AlertTriangle, Award, Users, Calendar, Activity } from 'lucide-react'

export default async function DashboardHomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const advisorId = (session.user as any)?.id
  const userRole = (session.user as any)?.role

  // إذا كان Super Admin، حوله للوحة التحكم الخاصة به
  if (userRole === 'SUPER_ADMIN') {
    redirect('/admin')
  }

  // جلب الإحصائيات الخاصة بالمرشد فقط
  const totalStudents = await prisma.student.count({
    where: {
      interviews: {
        some: {
          advisorId: advisorId
        }
      }
    }
  })

  const activeProbations = await prisma.followUp.count({
    where: {
      advisorId: advisorId,
      status: 'OPEN'
    }
  })

  const excellentStudents = await prisma.interview.count({
    where: {
      advisorId: advisorId,
      situation: 'تفوق'
    }
  })

  const totalInterviews = await prisma.interview.count({
    where: {
      advisorId: advisorId
    }
  })

  const totalFollowUps = await prisma.followUp.count({
    where: {
      advisorId: advisorId
    }
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">نظرة عامة</h1>
        <p className="text-gray-500 text-sm">مرحباً، {session.user?.name}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">إجمالي الطلاب</p>
            <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-red-100 p-4 rounded-full text-red-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">حالات تحتاج متابعة</p>
            <p className="text-2xl font-bold text-gray-800">{activeProbations}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">الطلاب المتفوقين</p>
            <p className="text-2xl font-bold text-gray-800">{excellentStudents}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            إجمالي المقابلات
          </h3>
          <p className="text-3xl font-bold text-blue-600">{totalInterviews}</p>
          <p className="text-sm text-gray-500 mt-2">مقابلة إرشادية مسجلة</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            جلسات المتابعة
          </h3>
          <p className="text-3xl font-bold text-green-600">{totalFollowUps}</p>
          <p className="text-sm text-gray-500 mt-2">جلسة متابعة مسجلة</p>
        </div>
      </div>
    </div>
  )
}