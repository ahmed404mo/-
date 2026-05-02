'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function EditInterviewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const interviewId = params?.id as string
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    studentCode: '',
    studentName: '',
    studentEmail: '',
    year: '',
    group: '',
    program: '',
    interviewDate: '',
    situation: '',
    problem: '',
    guidance: ''
  })

  // جلب بيانات المقابلة
  useEffect(() => {
    async function fetchInterview() {
      try {
        const response = await fetch(`/api/interviews/${interviewId}`)
        const data = await response.json()
        
        if (data.interview) {
          setFormData({
            studentCode: data.interview.student.code,
            studentName: data.interview.student.name,
            studentEmail: data.interview.student.email || '',
            year: data.interview.student.year.toString(),
            group: data.interview.student.group,
            program: data.interview.student.program,
            interviewDate: data.interview.date.split('T')[0],
            situation: data.interview.situation || '',
            problem: data.interview.problem,
            guidance: data.interview.guidance
          })
        }
      } catch (error) {
        console.error(error)
        setMessage('❌ حدث خطأ في جلب البيانات')
      } finally {
        setLoadingData(false)
      }
    }

    if (interviewId) {
      fetchInterview()
    }
  }, [interviewId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formDataObj = new FormData(e.currentTarget)
    formDataObj.append('advisorId', (session?.user as any)?.id || '')

    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        body: formDataObj
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ تم تعديل المقابلة بنجاح')
        setTimeout(() => {
          router.push(`/dashboard/interviews/${interviewId}`)
        }, 1500)
      } else {
        setMessage('❌ حدث خطأ: ' + (result.message || 'يرجى المحاولة مرة أخرى'))
      }
    } catch (error) {
      setMessage('❌ حدث خطأ في الاتصال بالسيرفر')
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

  if (loadingData) {
    return <div className="p-8 text-center">جاري تحميل البيانات...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      
      {/* زر العودة */}
      <div className="mb-6">
        <Link 
          href={`/dashboard/interviews/${interviewId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى تفاصيل المقابلة
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">تعديل المقابلة الإرشادية</h1>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1">كود الطالب *</label>
            <input
              type="text"
              name="studentCode"
              value={formData.studentCode}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-1">اسم الطالب *</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-1">السنة الدراسية *</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="1">السنة الأولى</option>
              <option value="2">السنة الثانية</option>
              <option value="3">السنة الثالثة</option>
              <option value="4">السنة الرابعة</option>
            </select>
          </div>
          
          <div>
            <label className="block font-bold mb-1">الفرقة *</label>
            <input
              type="text"
              name="group"
              value={formData.group}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-1">البرنامج *</label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-1">تاريخ المقابلة *</label>
            <input
              type="date"
              name="interviewDate"
              value={formData.interviewDate}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-1">حالة الطالب</label>
            <select
              name="situation"
              value={formData.situation}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">اختر</option>
              <option value="عادي">عادي</option>
              <option value="تفوق">تفوق</option>
              <option value="تعصب">تعصب</option>
              <option value="قلق">قلق</option>
              <option value="تحديات دراسية">تحديات دراسية</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">المشكلة *</label>
          <textarea
            name="problem"
            value={formData.problem}
            onChange={handleInputChange}
            rows={3}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-bold mb-1">التوجيه المقدم *</label>
          <textarea
            name="guidance"
            value={formData.guidance}
            onChange={handleInputChange}
            rows={3}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {loading ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
          </button>
          
          <Link
            href={`/dashboard/interviews/${interviewId}`}
            className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg font-bold text-center hover:bg-gray-400 transition"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}