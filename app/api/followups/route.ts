import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const advisorId = (session?.user as any)?.id

    if (!advisorId) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    // استقبال FormData
    const formData = await request.formData()
    const interviewId = formData.get('interviewId') as string
    const sessionType = formData.get('sessionType') as string
    const sessionDate = formData.get('sessionDate') as string
    const progress = formData.get('progress') as string
    const recommendation = formData.get('recommendation') as string
    const status = formData.get('status') as string

    console.log('Received:', { interviewId, sessionType, sessionDate, progress, recommendation, status, advisorId })

    if (!interviewId) {
      return NextResponse.json({ success: false, message: 'معرف المقابلة مطلوب' }, { status: 400 })
    }

    const followUp = await prisma.followUp.create({
      data: {
        interviewId: interviewId,
        advisorId: advisorId,
        sessionType: sessionType,
        sessionDate: new Date(sessionDate + 'T00:00:00'), // إصلاح التاريخ
        progress: progress,
        recommendation: recommendation || null,
        status: status as any,
      }
    })

    return NextResponse.json({ success: true, message: 'تم التسجيل', followUpId: followUp.id })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}