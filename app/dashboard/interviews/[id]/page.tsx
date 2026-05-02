'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Trash2, Edit, X, CheckCircle, AlertCircle } from 'lucide-react'



// مكون رسالة Toast بسيط
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-75">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// مكون تأكيد الحذف (Modal)
function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  loading: boolean 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" dir="rtl">
        <h3 className="text-xl font-bold mb-4 text-red-600">تأكيد الحذف</h3>
        <p className="text-gray-700 mb-2">⚠️ هل أنت متأكد من حذف هذه المقابلة؟</p>
        <p className="text-gray-500 text-sm mb-6">سيتم حذف جميع جلسات المتابعة المرتبطة بها ولا يمكن التراجع!</p>
        
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
          >
            {loading ? 'جاري الحذف...' : 'نعم، احذف'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

// Client Component للتعامل مع الحذف
function DeleteButton({ interviewId, onDeleteSuccess }: { interviewId: string; onDeleteSuccess: () => void }) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setShowModal(false)
        onDeleteSuccess()
      } else {
        alert('❌ حدث خطأ: ' + result.message)
        setShowModal(false)
      }
    } catch (error) {
      alert('❌ حدث خطأ في الاتصال بالسيرفر')
      setShowModal(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        حذف المقابلة
      </button>
      
      <DeleteConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}

// Client Component للتعامل مع التعديل
function EditButton({ interviewId }: { interviewId: string }) {
  return (
    <Link
      href={`/dashboard/interviews/${interviewId}/edit`}
      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
    >
      <Edit className="w-4 h-4" />
      تعديل المقابلة
    </Link>
  )
}

export default function InterviewDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const interviewId = params?.id as string
  
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // جلب بيانات المقابلة
  useEffect(() => {
    async function fetchInterview() {
      try {
        const response = await fetch(`/api/interviews/${interviewId}`)
        const data = await response.json()
        setInterview(data.interview)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (interviewId) {
      fetchInterview()
    }
  }, [interviewId])

  // معالج نجاح الحذف
  const handleDeleteSuccess = () => {
    setToast({ message: '✅ تم حذف المقابلة بنجاح', type: 'success' })
    setTimeout(() => {
      router.push('/dashboard/interviews')
    }, 1500)
  }

  if (!session) {
    return <div className="p-8 text-center">جاري التحميل...</div>
  }

  if (loading) {
    return <div className="p-8 text-center">جاري تحميل البيانات...</div>
  }

  if (!interview) {
    return <div className="p-8 text-center text-red-500">المقابلة غير موجودة</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* شريط الأزرار العلوي */}
      <div className="mb-6 flex justify-between items-center">
        <Link 
          href="/dashboard/interviews"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى قائمة المقابلات
        </Link>
        
        <div className="flex gap-3">
          <EditButton interviewId={interview.id} />
          <DeleteButton interviewId={interview.id} onDeleteSuccess={handleDeleteSuccess} />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">تفاصيل المقابلة الإرشادية</h1>

      {/* بيانات الطالب */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">بيانات الطالب</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-bold">الاسم:</span> {interview.student.name}</p>
          <p><span className="font-bold">الكود:</span> {interview.student.code}</p>
          <p><span className="font-bold">الفرقة:</span> {interview.student.group}</p>
          <p><span className="font-bold">البرنامج:</span> {interview.student.program}</p>
          <p><span className="font-bold">السنة:</span> {interview.student.year}</p>
          <p><span className="font-bold">تاريخ المقابلة:</span> {new Date(interview.date).toLocaleDateString('ar-EG')}</p>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p><span className="font-bold">المشكلة:</span> {interview.problem}</p>
          <p className="mt-2"><span className="font-bold">التوجيه المقدم:</span> {interview.guidance}</p>
          {interview.situation && (
            <p className="mt-2"><span className="font-bold">حالة الطالب:</span> 
              <span className={`mr-2 px-2 py-1 rounded text-xs ${
                interview.situation === 'تفوق' ? 'bg-green-100 text-green-700' :
                interview.situation === 'تعصب' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
              }`}>
                {interview.situation}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* جلسات المتابعة */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold">جلسات المتابعة ({interview.followUps?.length || 0})</h2>
          
          <Link 
            href={`/dashboard/interviews/${interview.id}/followup`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
          >
            + جلسة متابعة جديدة
          </Link>
        </div>
        
        {!interview.followUps || interview.followUps.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا توجد جلسات متابعة بعد</p>
        ) : (
          <div className="space-y-4">
            {interview.followUps.map((follow: any, index: number) => (
              <div key={follow.id} className="border-r-4 border-blue-500 bg-gray-50 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-blue-700">جلسة #{index + 1}</span>
                  <span className="text-sm text-gray-500">{new Date(follow.sessionDate).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">نوع الجلسة:</span>
                  <span className="text-sm">{follow.sessionType}</span>
                </div>
                <p className="mt-2"><span className="font-bold">التطور:</span> {follow.progress}</p>
                {follow.recommendation && (
                  <p className="mt-2 text-green-700"><span className="font-bold">التوصية:</span> ➜ {follow.recommendation}</p>
                )}
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded inline-block ${
                    follow.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' : 
                    follow.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {follow.status === 'OPEN' ? '🟡 قيد المتابعة' : follow.status === 'CLOSED' ? '⚪ مغلق' : '🟣 تم التحويل'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}