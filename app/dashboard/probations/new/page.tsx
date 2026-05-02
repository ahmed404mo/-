'use client' // لأننا نستخدم تفاعلات المستخدم (Form)

import { useState } from 'react';
import { createProbationForm } from '@/actions/probation'; // الـ Server Action الذي أنشأناه سابقاً

export default function NewProbationPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const response = await createProbationForm(formData);

    if (response.success) {
      setMessage('✅ تم حفظ نموذج الإنذار بنجاح!');
      event.currentTarget.reset(); // تفريغ الحقول بعد النجاح
    } else {
      setMessage('❌ حدث خطأ أثناء الحفظ.');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-md rounded-lg mt-10 text-right" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
        نموذج الإنذار الأكاديمي (Probation)
      </h1>

      {message && <div className="mb-4 text-lg font-semibold text-blue-600">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* سيتم إخفاؤه لاحقاً وأخذه من الجلسة (Session) للمرشد */}
        <input type="hidden" name="advisorId" value="advisor_123" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* بيانات الطالب */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">رقم قيد الطالب (ID)</label>
            <input type="text" name="studentId" required 
                   className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* مستوى الإنذار */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">مستوى الإنذار</label>
            <select name="level" required 
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="P1">P1 (الإنذار الأول)</option>
              <option value="P2">P2 (الإنذار الثاني)</option>
              <option value="P3">P3 (الإنذار الثالث)</option>
            </select>
          </div>

          {/* المعدل التراكمي */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">المعدل التراكمي (CGPA)</label>
            <input type="number" step="0.01" name="gpa" required 
                   className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* نسبة الغياب */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">نسبة الغياب (%)</label>
            <input type="number" name="absencePercentage" 
                   className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* خطة التدخل والعلاج */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">إجراءات الدعم وخطة التدخل</label>
          <textarea name="interventionPlan" rows={4} required placeholder="دروس تقوية، تعلم أقران، تنظيم وقت..."
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400">
          {loading ? 'جاري الحفظ...' : 'حفظ وإرسال الإنذار'}
        </button>
      </form>
    </div>
  );
}