import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[],
    }

    // جلب الأقسام للتأكد من وجودها
    const departments = await prisma.department.findMany()
    const departmentMap = new Map(departments.map(d => [d.name, d.id]))

    for (const row of data) {
      const name = (row as any).name
      const email = (row as any).email
      const password = (row as any).password || '123456'
      const departmentName = (row as any).department
      const groupName = (row as any).groupName || 'أ'
      const semester = (row as any).semester || 1
      const academicYearNum = (row as any).academicYearNum || new Date().getFullYear()

      if (!name || !email) {
        results.failed.push({ email: email || 'غير معروف', error: 'الاسم أو البريد ناقص' })
        continue
      }

      const departmentId = departmentMap.get(departmentName)
      if (!departmentId) {
        results.failed.push({ email, error: `القسم "${departmentName}" غير موجود` })
        continue
      }

      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        results.failed.push({ email, error: 'البريد موجود بالفعل' })
        continue
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      try {
        await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: 'ADVISOR',
            advisorAssignments: {
              create: {
                departmentId,
                groupName,
                semester: parseInt(semester),
                calendarYear: parseInt(academicYearNum),
              }
            }
          }
        })
        results.success.push(email)
      } catch (error) {
        results.failed.push({ email, error: 'خطأ في الإضافة' })
      }
    }

    return NextResponse.json({
      success: true,
      total: data.length,
      added: results.success.length,
      failed: results.failed.length,
      details: results
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'خطأ في رفع الملف' }, { status: 500 })
  }
}