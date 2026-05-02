import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

// GET - جلب جميع المرشدين مع توزيعاتهم
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const advisors = await prisma.user.findMany({
      where: { role: 'ADVISOR' },
      include: {
        advisorAssignments: {
          include: {
            department: true,
            academicYear: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(advisors)
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}

// POST - إضافة مرشد جديد
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, assignments } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'الاسم والبريد وكلمة المرور مطلوبة' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'البريد الإلكتروني موجود بالفعل' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const advisor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADVISOR',
        advisorAssignments: assignments && assignments.length > 0 ? {
          create: assignments.map((assignment: any) => ({
            departmentId: assignment.departmentId,
            academicYearId: assignment.academicYearId,
            groupName: assignment.groupName,
            semester: assignment.semester,
            academicYear: assignment.academicYear,
          }))
        } : undefined
      },
      include: {
        advisorAssignments: {
          include: {
            department: true,
            academicYear: true,
          }
        }
      }
    })

    return NextResponse.json({ success: true, advisor })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}

// PUT - تحديث مرشد
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, email, password, assignments } = body

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 })
    }

    const updateData: any = { name, email }
    
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // حذف التوزيعات القديمة وإضافة الجديدة
    await prisma.advisorAssignment.deleteMany({
      where: { advisorId: id }
    })

    const updatedAdvisor = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        advisorAssignments: assignments && assignments.length > 0 ? {
          create: assignments.map((assignment: any) => ({
            departmentId: assignment.departmentId,
            academicYearId: assignment.academicYearId,
            groupName: assignment.groupName,
            semester: assignment.semester,
            academicYear: assignment.academicYear,
          }))
        } : undefined
      },
      include: {
        advisorAssignments: {
          include: {
            department: true,
            academicYear: true,
          }
        }
      }
    })

    return NextResponse.json({ success: true, advisor: updatedAdvisor })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}

// DELETE - حذف مرشد
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'معرف المرشد مطلوب' }, { status: 400 })
    }

    // حذف التوزيعات أولاً
    await prisma.advisorAssignment.deleteMany({
      where: { advisorId: id }
    })

    // حذف المرشد
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'تم حذف المرشد بنجاح' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}