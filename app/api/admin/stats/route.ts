import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const [totalAdvisors, totalStudents, totalInterviews, totalFollowUps] = await Promise.all([
      prisma.user.count({ where: { role: 'ADVISOR' } }),
      prisma.student.count(),
      prisma.interview.count(),
      prisma.followUp.count(),
    ])

    return NextResponse.json({
      totalAdvisors,
      totalStudents,
      totalInterviews,
      totalFollowUps,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}