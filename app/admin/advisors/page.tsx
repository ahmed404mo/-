'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Users, Plus, Trash2, Edit, Search, X, 
  BookOpen, Users2, GraduationCap, Calendar,
  ChevronDown, ChevronUp, Save
} from 'lucide-react'

interface Department {
  id: string
  name: string
  code: string
}

interface AcademicYear {
  id: string
  year: number
  name: string
}

interface Assignment {
  departmentId: string
  department?: Department
  academicYearId: string
  academicYear?: AcademicYear
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
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [filteredAdvisors, setFilteredAdvisors] = useState<Advisor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null)
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    assignments: [] as Assignment[]
  })

  // جلب البيانات
  useEffect(() => {
    if (session && (session.user as any)?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
    fetchData()
  }, [session, router])

  async function fetchData() {
    try {
      const [advisorsRes, deptsRes, yearsRes] = await Promise.all([
        fetch('/api/admin/advisors'),
        fetch('/api/admin/departments'),
        fetch('/api/admin/academic-years')
      ])
      
      const advisorsData = await advisorsRes.json()
      const deptsData = await deptsRes.json()
      const yearsData = await yearsRes.json()
      
      setAdvisors(advisorsData)
      setFilteredAdvisors(advisorsData)
      setDepartments(deptsData)
      setAcademicYears(yearsData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // فلترة
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredAdvisors(advisors)
    } else {
      const filtered = advisors.filter(advisor =>
        advisor.name.includes(searchTerm) ||
        advisor.email.includes(searchTerm)
      )
      setFilteredAdvisors(filtered)
    }
  }, [searchTerm, advisors])

  // إضافة توزيع جديد
  function addAssignment() {
    setFormData({
      ...formData,
      assignments: [
        ...formData.assignments,
        {
          departmentId: departments[0]?.id || '',
          academicYearId: academicYears[0]?.id || '',
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
    }
  }

  async function handleEditAdvisor(e: React.FormEvent) {
    e.preventDefault()
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

  function openEditForm(advisor: Advisor) {
    setSelectedAdvisor(advisor)
    setFormData({
      name: advisor.name,
      email: advisor.email,
      password: '',
      assignments: advisor.advisorAssignments.map(a => ({
        departmentId: a.departmentId,
        academicYearId: a.academicYearId,
        groupName: a.groupName,
        semester: a.semester,
        academicYearNum: a.academicYearNum,
      }))
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          إدارة المرشدين الأكاديميين
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          إضافة مرشد جديد
        </button>
      </div>

      {/* Search */}
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

      {/* Message */}
      {message && (
        <div className={`p-3 rounded mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Advisors Table */}
      {loading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : (
        <div className="space-y-4">
          {filteredAdvisors.map((advisor) => (
            <div key={advisor.id} className="bg-white rounded-xl shadow overflow-hidden">
              {/* صف المرشد الرئيسي */}
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

              {/* تفاصيل التوزيع */}
              {expandedAdvisor === advisor.id && (
                <div className="p-4 bg-gray-50">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    الفرق والأقسام المسندة
                  </h4>
                  
                  {advisor.advisorAssignments.length === 0 ? (
                    <p className="text-gray-500 text-sm">لا توجد توزيعات حتى الآن</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {advisor.advisorAssignments.map((assignment, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-blue-600">
                                {assignment.department?.name || 'قسم غير محدد'}
                              </p>
                              <p className="text-sm mt-1">
                                <span className="text-gray-500">السنة:</span> {assignment.academicYear?.name || `سنة ${assignment.academicYearNum}`}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">الفرقة:</span> {assignment.groupName}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-500">الفصل الدراسي:</span> {assignment.semester === 1 ? 'الأول' : 'الثاني'}
                              </p>
                            </div>
                            <div className="text-xs text-gray-400">
                              {assignment.academicYearNum}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal - نفس المحتوى مع إضافة جدول التوزيعات */}
      {/* ... أكمل كتابة المودال في الرد التالي ... */}
    </div>
  )
}