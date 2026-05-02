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

    // تحقق من وجود النموذج
    let academicYears = []
    try {
      academicYears = await prisma.academicYear.findMany()
    } catch (error) {
      console.log('AcademicYear model not found yet')
      academicYears = []
    }

    return NextResponse.json(academicYears)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json([])
  }
}