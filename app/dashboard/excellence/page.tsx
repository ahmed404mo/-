import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PlusCircle, Award } from 'lucide-react';

export default async function ExcellencePage() {
  // جلب الجلسات من قاعدة البيانات
  const meetings = await prisma.excellenceMeeting.findMany({
    orderBy: { date: 'desc' }
  });

  return (
    <div className="p-2 md:p-8" dir="rtl">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="w-6 h-6 text-green-600" />
            توجيه الطلاب المتفوقين
          </h1>
          <p className="text-gray-500 text-sm mt-1">عرض جميع محاضر الجلسات ومؤشرات الأداء</p>
        </div>
        
        <Link 
          href="/dashboard/excellence/new" 
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2 transition"
        >
          <PlusCircle className="w-5 h-5" />
          إضافة محضر جديد
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-6 text-gray-600 font-bold">رقم الطالب</th>
              <th className="py-3 px-6 text-gray-600 font-bold">نوع الجلسة</th>
              <th className="py-3 px-6 text-gray-600 font-bold">المكان/المنصة</th>
              <th className="py-3 px-6 text-gray-600 font-bold">معدل المشاركة (KPI)</th>
              <th className="py-3 px-6 text-gray-600 font-bold">رضا الطالب (KPI)</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  لا توجد أي محاضر جلسات مسجلة حتى الآن.
                </td>
              </tr>
            ) : (
              meetings.map((meeting) => (
                <tr key={meeting.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 font-semibold text-blue-600">{meeting.studentId}</td>
                  <td className="py-3 px-6">{meeting.meetingType}</td>
                  <td className="py-3 px-6">{meeting.location}</td>
                  <td className="py-3 px-6">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-sm">{meeting.kpiParticipation}%</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm">{meeting.kpiSatisfaction}%</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}