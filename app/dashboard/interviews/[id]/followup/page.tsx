'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NewFollowUpPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  
  // استخدم params.id مباشرة
  const interviewId = params?.id as string
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    sessionType: '',
    sessionDate: new Date().toISOString().split('T')[0],
    progress: '',
    recommendation: '',
    status: 'OPEN'
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    console.log('interviewId:', interviewId)

    if (!interviewId) {
      setMessage('❌ خطأ: معرف المقابلة غير موجود')
      setLoading(false)
      return
    }

    // استخدام FormData بدلاً من JSON
    const formDataObj = new FormData()
    formDataObj.append('interviewId', interviewId)
    formDataObj.append('advisorId', (session?.user as any)?.id || '')
    formDataObj.append('sessionType', formData.sessionType)
    formDataObj.append('sessionDate', formData.sessionDate)
    formDataObj.append('progress', formData.progress)
    formDataObj.append('recommendation', formData.recommendation)
    formDataObj.append('status', formData.status)

    try {
      const response = await fetch('/api/followups', {
        method: 'POST',
        body: formDataObj, // لا تحدد Content-Type
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage('✅ تم تسجيل جلسة المتابعة بنجاح')
        setFormData({
          sessionType: '',
          sessionDate: new Date().toISOString().split('T')[0],
          progress: '',
          recommendation: '',
          status: 'OPEN'
        })
        setTimeout(() => {
          router.push(`/dashboard/interviews/${interviewId}`)
        }, 1500)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!session) {
    return <div className="p-8 text-center">جاري التحميل...</div>
  }

  if (!interviewId) {
    return <div className="p-8 text-center text-red-500">خطأ: معرف المقابلة غير موجود</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      
      <div className="mb-6">
        <Link 
          href={`/dashboard/interviews/${interviewId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى تفاصيل المقابلة
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">تسجيل جلسة متابعة جديدة</h1>
      
      {/* <div className="bg-green-100 p-3 rounded mb-4 text-center">
        ✅ معرف المقابلة: <span className="font-bold">{interviewId}</span>
      </div> */}
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
        
        <div>
          <label className="block font-bold mb-1">نوع الجلسة *</label>
          <select
            name="sessionType"
            value={formData.sessionType}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">اختر نوع الجلسة</option>
            <option value="تعصب">تعصب</option>
            <option value="تفوق">تفوق</option>
            <option value="تحديات دراسية">تحديات دراسية</option>
            <option value="نفسية">نفسية</option>
            <option value="توجيه مهني">توجيه مهني</option>
            <option value="متابعة عادية">متابعة عادية</option>
          </select>
        </div>

        <div>
          <label className="block font-bold mb-1">تاريخ الجلسة *</label>
          <input
            type="date"
            name="sessionDate"
            value={formData.sessionDate}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-bold mb-1">تطور الحالة *</label>
          <textarea
            name="progress"
            value={formData.progress}
            onChange={handleInputChange}
            rows={3}
            required
            className="w-full p-2 border rounded"
            placeholder="مثال: تحسن ملحوظ في المستوى الدراسي..."
          />
        </div>

        <div>
          <label className="block font-bold mb-1">التوصية</label>
          <select
            name="recommendation"
            value={formData.recommendation}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="">-- اختر --</option>
            <option value="وحدة دعم نفسي">وحدة دعم نفسي</option>
            <option value="لجنة شؤون الطلاب">لجنة شؤون الطلاب</option>
            <option value="وحدة ذوي الاحتياجات">وحدة ذوي الاحتياجات</option>
            <option value="لجنة الجودة">لجنة الجودة</option>
            <option value="وحدة التوجيه المهني">وحدة التوجيه المهني</option>
            <option value="لا يوجد توصية">لا يوجد توصية</option>
          </select>
        </div>

        <div>
          <label className="block font-bold mb-1">حالة المتابعة</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="OPEN"> قيد المتابعة</option>
            <option value="CLOSED"> تم الإغلاق</option>
            <option value="REFERRED"> تم التحويل</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700"
          >
            {loading ? 'جاري الحفظ...' : ' حفظ جلسة المتابعة'}
          </button>
          
          <Link
            href={`/dashboard/interviews/${interviewId}`}
            className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg font-bold text-center hover:bg-gray-400"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}