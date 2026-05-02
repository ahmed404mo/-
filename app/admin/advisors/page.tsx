'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Users, Plus, Trash2, Edit, Search, X, 
  BookOpen, Users2, GraduationCap, Calendar,
  ChevronDown, ChevronUp, Upload, Loader2
} from 'lucide-react'

interface Department {
  id: string
  name: string
  code: string
}

interface Assignment {
  departmentId: string
  department?: Department
  groupName: string
  semester: number
  academicYearNum: number
}

interface Advisor {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  advisorAssignments: Assignment[]
}

export default function AdminAdvisorsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredAdvisors, setFilteredAdvisors] = useState<Advisor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null)
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    assignments: [] as Assignment[]
  })

  useEffect(() => {
    if (session && (session.user as any)?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
    fetchData()
  }, [session, router])

  async function fetchData() {
    setLoading(true)
    try {
      const [advisorsRes, deptsRes] = await Promise.all([
        fetch('/api/admin/advisors'),
        fetch('/api/admin/departments')
      ])
      
      const advisorsData = await advisorsRes.json()
      const deptsData = await deptsRes.json()
      
      setAdvisors(advisorsData || [])
      setFilteredAdvisors(advisorsData || [])
      setDepartments(deptsData || [])
    } catch (error) {
      console.error('Error:', error)
      setAdvisors([])
      setFilteredAdvisors([])
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredAdvisors(advisors || [])
    } else {
      const filtered = (advisors || []).filter(advisor =>
        advisor.name.includes(searchTerm) ||
        advisor.email.includes(searchTerm)
      )
      setFilteredAdvisors(filtered)
    }
  }, [searchTerm, advisors])

  function addAssignment() {
    setFormData({
      ...formData,
      assignments: [
        ...formData.assignments,
        {
          departmentId: departments[0]?.id || '',
          groupName: 'أ',
          semester: 1,
          academicYearNum: new Date().getFullYear(),
        }
      ]
    })
  }

  function removeAssignment(index: number) {
    const newAssignments = [...formData.assignments]
    newAssignments.splice(index, 1)
    setFormData({ ...formData, assignments: newAssignments })
  }

  function updateAssignment(index: number, field: string, value: any) {
    const newAssignments = [...formData.assignments]
    newAssignments[index] = { ...newAssignments[index], [field]: value }
    setFormData({ ...formData, assignments: newAssignments })
  }

  async function handleAddAdvisor(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/advisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ text: '✅ تم إضافة المرشد بنجاح', type: 'success' })
        setFormData({ name: '', email: '', password: '', assignments: [] })
        setShowAddForm(false)
        fetchData()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ text: '❌ ' + result.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: '❌ حدث خطأ', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditAdvisor(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    if (!selectedAdvisor) return

    try {
      const response = await fetch('/api/admin/advisors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAdvisor.id,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          assignments: formData.assignments
        })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ text: '✅ تم تعديل المرشد بنجاح', type: 'success' })
        setShowEditForm(false)
        setSelectedAdvisor(null)
        setFormData({ name: '', email: '', password: '', assignments: [] })
        fetchData()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ text: '❌ ' + result.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: '❌ حدث خطأ', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteAdvisor(id: string) {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا المرشد؟')) return

    try {
      const response = await fetch(`/api/admin/advisors?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ text: '✅ تم حذف المرشد بنجاح', type: 'success' })
        fetchData()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const result = await response.json()
        setMessage({ text: '❌ ' + result.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: '❌ حدث خطأ', type: 'error' })
    }
  }

  async function handleUploadExcel(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile) {
      setMessage({ text: '❌ يرجى اختيار ملف أولاً', type: 'error' })
      return
    }

    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', uploadFile)

    try {
      const response = await fetch('/api/admin/advisors/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ 
          text: `✅ تم بنجاح: ${result.added} مرشد، فشل: ${result.failed}`, 
          type: 'success' 
        })
        setShowUploadForm(false)
        setUploadFile(null)
        fetchData()
        setTimeout(() => setMessage(null), 5000)
      } else {
        setMessage({ text: '❌ ' + result.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: '❌ حدث خطأ في رفع الملف', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  function openEditForm(advisor: Advisor) {
    setSelectedAdvisor(advisor)
    setFormData({
      name: advisor.name,
      email: advisor.email,
      password: '',
      assignments: advisor.advisorAssignments?.map(a => ({
        departmentId: a.departmentId,
        groupName: a.groupName,
        semester: a.semester,
        academicYearNum: a.academicYearNum,
      })) || []
    })
    setShowEditForm(true)
  }

  function toggleExpand(advisorId: string) {
    setExpandedAdvisor(expandedAdvisor === advisorId ? null : advisorId)
  }

  if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-center">جاري التحميل...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          إدارة المرشدين الأكاديميين
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Upload className="w-4 h-4" />
            رفع ملف Excel
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            إضافة مرشد جديد
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 p-2 border rounded-lg"
          />
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-500">جاري التحميل...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(filteredAdvisors || []).length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
              لا يوجد مرشدين
            </div>
          ) : (
            filteredAdvisors.map((advisor) => (
              <div key={advisor.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b hover:bg-gray-50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{advisor.name}</h3>
                      <p className="text-sm text-gray-500">{advisor.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 ml-4">
                      📅 {new Date(advisor.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                    <button
                      onClick={() => toggleExpand(advisor.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      {expandedAdvisor === advisor.id ? 
                        <ChevronUp className="w-5 h-5" /> : 
                        <ChevronDown className="w-5 h-5" />
                      }
                    </button>
                    <button
                      onClick={() => openEditForm(advisor)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAdvisor(advisor.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {expandedAdvisor === advisor.id && (
                  <div className="p-4 bg-gray-50">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      الفرق والأقسام المسندة
                    </h4>
                    
                    {!advisor.advisorAssignments || advisor.advisorAssignments.length === 0 ? (
                      <p className="text-gray-500 text-sm">لا توجد توزيعات حتى الآن</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {advisor.advisorAssignments.map((assignment, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border">
                            <div>
                              <p className="font-semibold text-blue-600">
                                {departments.find(d => d.id === assignment.departmentId)?.name || 'قسم غير محدد'}
                              </p>
                              <p className="text-sm mt-1">
                                <span className="text-gray-500">الفرقة:</span> {assignment.groupName === 'أ' ? 'الأولى' : assignment.groupName === 'ب' ? 'الثانية' : assignment.groupName === 'ج' ? 'الثالثة' : 'الرابعة'}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">الفصل الدراسي:</span> {assignment.semester === 1 ? 'الأول' : 'الثاني'}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">العام الدراسي:</span> {assignment.academicYearNum}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal إضافة مرشد */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">إضافة مرشد أكاديمي جديد</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAdvisor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">الاسم *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">كلمة المرور *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    توزيع المرشد على الفرق والأقسام
                  </h3>
                  <button
                    type="button"
                    onClick={addAssignment}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    + إضافة توزيع
                  </button>
                </div>

                {(formData.assignments || []).map((assignment, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">توزيع #{idx + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeAssignment(idx)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        حذف
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold mb-1">القسم</label>
                        <select
                          value={assignment.departmentId || ''}
                          onChange={(e) => updateAssignment(idx, 'departmentId', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          required
                        >
                          <option value="">اختر القسم</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1">الفرقة/المجموعة</label>
                        <select
                          value={assignment.groupName || 'أ'}
                          onChange={(e) => updateAssignment(idx, 'groupName', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          required
                        >
                          <option value="أ">الأولى</option>
                          <option value="ب">الثانية</option>
                          <option value="ج">الثالثة</option>
                          <option value="د">الرابعة</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1">الفصل الدراسي</label>
                        <select
                          value={assignment.semester || 1}
                          onChange={(e) => updateAssignment(idx, 'semester', parseInt(e.target.value))}
                          className="w-full p-2 border rounded text-sm"
                          required
                        >
                          <option value={1}>الأول</option>
                          <option value={2}>الثاني</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1">العام الدراسي</label>
                        <input
                          type="number"
                          value={assignment.academicYearNum || new Date().getFullYear()}
                          onChange={(e) => {
                            const val = parseInt(e.target.value)
                            updateAssignment(idx, 'academicYearNum', isNaN(val) ? new Date().getFullYear() : val)
                          }}
                          className="w-full p-2 border rounded text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(formData.assignments || []).length === 0 && (
                  <p className="text-gray-400 text-sm text-center">لم يتم إضافة أي توزيع. اضغط على "إضافة توزيع"</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? 'جاري الحفظ...' : 'إضافة المرشد'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 p-2 rounded-lg hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal تعديل مرشد */}
      {showEditForm && selectedAdvisor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">تعديل بيانات المرشد</h2>
              <button onClick={() => setShowEditForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditAdvisor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">الاسم *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">كلمة المرور (اتركها فارغة إذا لم ترد التغيير)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    توزيع المرشد على الفرق والأقسام
                  </h3>
                  <button
                    type="button"
                    onClick={addAssignment}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    + إضافة توزيع
                  </button>
                </div>

                {(formData.assignments || []).map((assignment, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">توزيع #{idx + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeAssignment(idx)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        حذف
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold mb-1">القسم</label>
                        <select
                          value={assignment.departmentId || ''}
                          onChange={(e) => updateAssignment(idx, 'departmentId', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          required
                        >
                          <option value="">اختر القسم</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1">الفرقة/المجموعة</label>
                        <select
                          value={assignment.groupName || 'أ'}
                          onChange={(e) => updateAssignment(idx, 'groupName', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                          required
                        >
                          <option value="أ">الأولى</option>
                          <option value="ب">الثانية</option>
                          <option value="ج">الثالثة</option>
                          <option value="د">الرابعة</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1">الفصل الدراسي</label>
                        <select
                          value={assignment.semester || 1}
                          onChange={(e) => updateAssignment(idx, 'semester', parseInt(e.target.value))}
                          className="w-full p-2 border rounded text-sm"
                          required
                        >
                          <option value={1}>الأول</option>
                          <option value={2}>الثاني</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1">العام الدراسي</label>
                        <input
                          type="number"
                          value={assignment.academicYearNum || new Date().getFullYear()}
                          onChange={(e) => {
                            const val = parseInt(e.target.value)
                            updateAssignment(idx, 'academicYearNum', isNaN(val) ? new Date().getFullYear() : val)
                          }}
                          className="w-full p-2 border rounded text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(formData.assignments || []).length === 0 && (
                  <p className="text-gray-400 text-sm text-center">لم يتم إضافة أي توزيع. اضغط على "إضافة توزيع"</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 bg-gray-300 p-2 rounded-lg hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal رفع Excel */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">رفع ملف Excel</h2>
              <button onClick={() => setShowUploadForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-sm mb-2">📌 الأعمدة المطلوبة في ملف Excel:</h3>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• <strong>name</strong> - الاسم (مطلوب)</li>
                <li>• <strong>email</strong> - البريد الإلكتروني (مطلوب)</li>
                <li>• <strong>password</strong> - كلمة المرور (اختياري - افتراضي: 123456)</li>
                <li>• <strong>department</strong> - اسم القسم (مطلوب - يجب أن يكون مطابق للأقسام في النظام)</li>
                <li>• <strong>groupName</strong> - الفرقة (أ، ب، ج، د)</li>
                <li>• <strong>semester</strong> - الفصل الدراسي (1 أو 2)</li>
                <li>• <strong>academicYearNum</strong> - العام الدراسي (مثال: 2026)</li>
              </ul>
            </div>

            <form onSubmit={handleUploadExcel} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">اختر ملف Excel</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={uploading} className="flex-1 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'جاري الرفع...' : 'رفع الملف'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 bg-gray-300 p-2 rounded-lg hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}