import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

export default async function AdvisorReportsPage() {
  const session = await getServerSession()
  const advisorId = (session?.user as any)?.id

  // جلب جميع مقابلات المرشد مع المتابعات
  const interviews = await prisma.interview.findMany({
    where: { advisorId },
    include: {
      student: true,
      followUps: { orderBy: { sessionDate: 'desc' } }
    },
    orderBy: { date: 'desc' }
  })

  // تجميع الحالات التي تحتاج متابعة مفتوحة
  const openFollowUps = interviews.filter(i => 
    i.followUps.some(f => f.status === 'OPEN')
  )

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-2">تقارير المرشد الأكاديمي</h1>
      <p className="text-gray-500 mb-6">عرض جميع الحالات التي قمت بمتابعتها - مع إمكانية تتبع الحالات القديمة</p>

      {/* حالات نشطة تحتاج متابعة */}
      <div className="bg-yellow-50 p-4 rounded-xl mb-8 border-r-4 border-yellow-500">
        <h2 className="font-bold text-yellow-800 mb-3">📋 حالات تحتاج متابعة ({openFollowUps.length})</h2>
        {openFollowUps.map(interview => (
          <div key={interview.id} className="bg-white p-3 rounded mb-2 shadow-sm">
            <Link href={`/dashboard/interviews/${interview.id}`} className="hover:underline">
              <span className="font-bold">{interview.student.name}</span> - 
              <span className="text-sm text-gray-600 mr-2">{interview.student.code}</span>
              <span className="text-xs bg-yellow-200 px-2 py-1 rounded mr-2">
                آخر متابعة: {interview.followUps[0]?.sessionDate ? new Date(interview.followUps[0].sessionDate).toLocaleDateString('ar-EG') : 'بدون متابعة'}
              </span>
            </Link>
          </div>
        ))}
      </div>

      {/* جدول جميع الحالات */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">الطالب</th>
              <th className="p-3">السنة الدراسية</th>
              <th className="p-3">تاريخ أول مقابلة</th>
              <th className="p-3">آخر جلسة متابعة</th>
              <th className="p-3">عدد الجلسات</th>
              <th className="p-3">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map(interview => {
              const lastFollowUp = interview.followUps[0]
              return (
                <tr key={interview.id} className="border-t">
                  <td className="p-3">
                    <Link href={`/dashboard/interviews/${interview.id}`} className="text-blue-600 hover:underline">
                      {interview.student.name}
                    </Link>
                    <div className="text-xs text-gray-500">{interview.student.code}</div>
                  </td>
                  <td className="p-3">{interview.student.year} - {interview.student.group}</td>
                  <td className="p-3">{new Date(interview.date).toLocaleDateString('ar-EG')}</td>
                  <td className="p-3">
                    {lastFollowUp ? new Date(lastFollowUp.sessionDate).toLocaleDateString('ar-EG') : '—'}
                  </td>
                  <td className="p-3">{interview.followUps.length}</td>
                  <td className="p-3">
                    {lastFollowUp?.status === 'OPEN' && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">قيد المتابعة</span>
                    )}
                    {lastFollowUp?.status === 'REFERRED' && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">تم التحويل لـ {lastFollowUp.recommendation}</span>
                    )}
                    {(!lastFollowUp || lastFollowUp?.status === 'CLOSED') && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">مغلق</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}