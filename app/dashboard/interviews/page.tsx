import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'  // استيراد من lib/auth
import Link from 'next/link'

export default async function InterviewsPage() {
  const session = await getServerSession(authOptions)
  const advisorId = (session?.user as any)?.id

  const interviews = await prisma.interview.findMany({
    where: advisorId ? { advisorId } : {},
    include: {
      student: true,
      followUps: {
        orderBy: { sessionDate: 'desc' },
        take: 1
      }
    },
    orderBy: { date: 'desc' }
  })

  return (
    <div className="p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">المقابلات الإرشادية</h1>
        <Link href="/dashboard/interviews/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + مقابلة جديدة
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
          لا توجد مقابلات إرشادية مسجلة حتى الآن
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">الطالب</th>
                <th className="p-3">الكود</th>
                <th className="p-3">الفرقة</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">المتابعات</th>
                <th className="p-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview: any) => (
                <tr key={interview.id} className="border-t">
                  <td className="p-3">{interview.student.name}</td>
                  <td className="p-3 text-blue-600">{interview.student.code}</td>
                  <td className="p-3">{interview.student.group}</td>
                  <td className="p-3">{new Date(interview.date).toLocaleDateString('ar-EG')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      interview.situation === 'تفوق' ? 'bg-green-100 text-green-700' :
                      interview.situation === 'تعصب' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {interview.situation || 'عادي'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {interview.followUps?.length || 0}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/dashboard/interviews/${interview.id}`} className="text-blue-600 hover:underline">
                      تفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}