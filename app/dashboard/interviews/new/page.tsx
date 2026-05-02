'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function NewInterviewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const form = e.currentTarget
    const formData = {
      studentCode: (form.elements.namedItem('studentCode') as HTMLInputElement).value,
      studentName: (form.elements.namedItem('studentName') as HTMLInputElement).value,
      studentEmail: (form.elements.namedItem('studentEmail') as HTMLInputElement).value || '',
      year: parseInt((form.elements.namedItem('year') as HTMLSelectElement).value),
      group: (form.elements.namedItem('group') as HTMLInputElement).value,
      program: (form.elements.namedItem('program') as HTMLInputElement).value,
      interviewDate: (form.elements.namedItem('interviewDate') as HTMLInputElement).value,
      situation: (form.elements.namedItem('situation') as HTMLSelectElement).value,
      problem: (form.elements.namedItem('problem') as HTMLTextAreaElement).value,
      guidance: (form.elements.namedItem('guidance') as HTMLTextAreaElement).value,
      advisorId: (session?.user as any)?.id || '',
    }

    console.log('Sending data:', formData)

    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage('✅ تم تسجيل المقابلة بنجاح')
        form.reset()
        setTimeout(() => router.push('/dashboard/interviews'), 2000)
      } else {
        setMessage('❌ ' + (result.message || 'حدث خطأ'))
      }
    } catch (error: any) {
      console.error('Error:', error)
      setMessage('❌ ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return <div className="p-8 text-center">جاري التحميل...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">تسجيل مقابلة إرشادية جديدة</h1>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1">كود الطالب *</label>
            <input type="text" name="studentCode" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block font-bold mb-1">اسم الطالب *</label>
            <input type="text" name="studentName" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block font-bold mb-1">البريد الإلكتروني</label>
            <input type="email" name="studentEmail" className="w-full p-2 border rounded" />
            <p className="text-xs text-gray-500 mt-1">اختياري - سيتم إنشاء بريد تلقائي إذا ترك فارغاً</p>
          </div>
          <div>
            <label className="block font-bold mb-1">السنة الدراسية *</label>
            <select name="year" required className="w-full p-2 border rounded">
              <option value="1">السنة الأولى</option>
              <option value="2">السنة الثانية</option>
              <option value="3">السنة الثالثة</option>
              <option value="4">السنة الرابعة</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">الفرقة *</label>
            <input type="text" name="group" placeholder="مثال: أولى أ" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block font-bold mb-1">البرنامج *</label>
            <input type="text" name="program" placeholder="مثال: علوم" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block font-bold mb-1">تاريخ المقابلة *</label>
            <input type="date" name="interviewDate" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block font-bold mb-1">حالة الطالب</label>
            <select name="situation" className="w-full p-2 border rounded">
              <option value="">اختر</option>
              <option value="عادي">عادي</option>
              <option value="تفوق">تفوق</option>
              <option value="تعصب">تعصب</option>
              <option value="قلق">قلق</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">المشكلة *</label>
          <textarea name="problem" rows={3} required className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block font-bold mb-1">التوجيه المقدم *</label>
          <textarea name="guidance" rows={3} required className="w-full p-2 border rounded" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">
          {loading ? 'جاري الحفظ...' : 'حفظ المقابلة'}
        </button>
      </form>
    </div>
  )
}