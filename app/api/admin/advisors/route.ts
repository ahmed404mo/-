import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

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
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(advisors || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json([])
  }
}

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
            groupName: assignment.groupName,
            semester: Number(assignment.semester),
            calendarYear: assignment.academicYearNum ? Number(assignment.academicYearNum) : new Date().getFullYear(),
          }))
        } : undefined
      },
      include: {
        advisorAssignments: {
          include: {
            department: true,
          }
        }
      }
    })

    return NextResponse.json({ success: true, advisor })
  } catch (error) {
    console.error('Error in POST:', error)
    return NextResponse.json({ error: 'خطأ في السيرفر: ' + (error as Error).message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, email, password, assignments } = body

    console.log('PUT received:', { id, name, email, assignments })

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 })
    }

    // حذف التوزيعات القديمة
    await prisma.advisorAssignment.deleteMany({
      where: { advisorId: id }
    })

    // تجهيز بيانات التوزيعات الجديدة
    let assignmentsData = undefined
    if (assignments && assignments.length > 0) {
      assignmentsData = {
        create: assignments.map((assignment: any) => {
          // التأكد من وجود قيمة صحيحة لـ calendarYear
          let calendarYear = new Date().getFullYear()
          if (assignment.academicYearNum) {
            calendarYear = Number(assignment.academicYearNum)
          } else if (assignment.calendarYear) {
            calendarYear = Number(assignment.calendarYear)
          }
          
          return {
            departmentId: assignment.departmentId,
            groupName: assignment.groupName,
            semester: Number(assignment.semester),
            calendarYear: calendarYear,
          }
        })
      }
    }

    // تحديث المرشد
    const updateData: any = {
      name,
      email,
    }
    
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    if (assignmentsData) {
      updateData.advisorAssignments = assignmentsData
    }

    const updatedAdvisor = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        advisorAssignments: {
          include: {
            department: true,
          }
        }
      }
    })

    return NextResponse.json({ success: true, advisor: updatedAdvisor })
  } catch (error) {
    console.error('Error in PUT:', error)
    return NextResponse.json({ error: 'خطأ في السيرفر: ' + (error as Error).message }, { status: 500 })
  }
}

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

    await prisma.advisorAssignment.deleteMany({
      where: { advisorId: id }
    })

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE:', error)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}