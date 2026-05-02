// app/dashboard/probations/page.tsx
import prisma from '@/lib/prisma'

export default async function ProbationsPage() {
  // جلب البيانات من Neon عبر Prisma
  const probations = await prisma.probationForm.findMany({
    include: { student: { include: { user: true } } }
  });

  return (
    <div className="p-8 text-right" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">نماذج الإنذار الأكاديمي</h1>
      
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">اسم الطالب</th>
            <th className="py-2 px-4 border-b">المعدل التراكمي</th>
            <th className="py-2 px-4 border-b">مستوى الإنذار</th>
            <th className="py-2 px-4 border-b">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {probations.map((probation) => (
            <tr key={probation.id} className="text-center">
              <td className="py-2 px-4 border-b">{probation.student.user.name}</td>
              <td className="py-2 px-4 border-b">{probation.gpa}</td>
              <td className="py-2 px-4 border-b">{probation.level}</td>
              <td className="py-2 px-4 border-b">{probation.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}