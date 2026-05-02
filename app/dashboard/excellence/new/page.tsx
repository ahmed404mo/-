'use client';

import { useState } from 'react';
import { createExcellenceMeeting } from '@/actions/excellence';

export default function NewExcellenceMeetingPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const response = await createExcellenceMeeting(formData);

    if (response.success) {
      setMessage('✅ تم حفظ محضر توجيه الطلاب المتفوقين بنجاح!');
      event.currentTarget.reset();
    } else {
      setMessage('❌ حدث خطأ أثناء الحفظ.');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-xl mt-6 text-right" dir="rtl">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          محضر جلسة توجيه الطلبة المتفوقين
        </h1>
        <p className="text-sm text-gray-500 mt-2">كلية التربية للطفولة المبكرة – لجنة الإرشاد الأكاديمي</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md font-semibold ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* حقل مخفي للمرشد (سيتم استبداله لاحقاً ببيانات الجلسة) */}
        <input type="hidden" name="advisorId" value="advisor_123" />

        {/* بيانات الجلسة الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-100">
          <div>
            <label className="block text-gray-700 font-bold mb-2">رقم قيد الطالب</label>
            <input type="text" name="studentId" required 
                   className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">نوع الجلسة</label>
            <div className="flex gap-4 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="meetingType" value="فردية" required className="w-4 h-4 text-blue-600" />
                <span>فردية</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="meetingType" value="جماعية" required className="w-4 h-4 text-blue-600" />
                <span>جماعية</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">مكان/منصة الجلسة</label>
            <input type="text" name="location" placeholder="مثال: قاعة 3 / منصة Zoom" required 
                   className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* مؤشرات الأداء (KPIs) */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">مؤشرات المتابعة والأثر (KPIs)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">معدل المشاركة في أنشطة التميز (%)</label>
              <p className="text-xs text-gray-500 mb-2">المستهدف: 80% أو أكثر</p>
              <input type="number" name="kpiParticipation" min="0" max="100" required 
                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">نسبة رضا الطلبة عن التوجيه (%)</label>
              <p className="text-xs text-gray-500 mb-2">المستهدف: 90% أو أكثر</p>
              <input type="number" name="kpiSatisfaction" min="0" max="100" required 
                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400">
          {loading ? 'جاري الحفظ...' : 'اعتماد وحفظ محضر الجلسة'}
        </button>
      </form>
    </div>
  );
}