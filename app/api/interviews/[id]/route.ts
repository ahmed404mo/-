import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - جلب مقابلة واحدة
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        student: true,
        advisor: true,
        followUps: {
          orderBy: { sessionDate: 'desc' }
        }
      }
    })

    if (!interview) {
      return NextResponse.json({ error: 'المقابلة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ interview })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}

// DELETE - حذف مقابلة
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const advisorId = (session?.user as any)?.id

    if (!advisorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const interview = await prisma.interview.findUnique({
      where: { id }
    })

    if (!interview) {
      return NextResponse.json({ error: 'المقابلة غير موجودة' }, { status: 404 })
    }

    await prisma.followUp.deleteMany({
      where: { interviewId: id }
    })

    await prisma.interview.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'تم حذف المقابلة بنجاح' })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ أثناء الحذف' }, { status: 500 })
  }
}

// PUT - تعديل مقابلة
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const advisorId = (session?.user as any)?.id

    if (!advisorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const formData = await request.formData()
    
    const studentCode = formData.get('studentCode') as string
    const studentName = formData.get('studentName') as string
    const studentEmail = formData.get('studentEmail') as string
    const year = parseInt(formData.get('year') as string)
    const group = formData.get('group') as string
    const program = formData.get('program') as string
    const problem = formData.get('problem') as string
    const guidance = formData.get('guidance') as string
    const situation = formData.get('situation') as string
    const interviewDate = formData.get('interviewDate') as string

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { student: true }
    })

    if (!interview) {
      return NextResponse.json({ error: 'المقابلة غير موجودة' }, { status: 404 })
    }

    await prisma.student.update({
      where: { id: interview.student.id },
      data: {
        code: studentCode,
        name: studentName,
        email: studentEmail || `${studentCode}@student.com`,
        year,
        group,
        program,
      }
    })

    await prisma.interview.update({
      where: { id },
      data: {
        date: new Date(interviewDate),
        problem,
        guidance,
        situation: situation || null,
      }
    })

    return NextResponse.json({ success: true, message: 'تم تعديل المقابلة بنجاح' })
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ أثناء التعديل' }, { status: 500 })
  }
}