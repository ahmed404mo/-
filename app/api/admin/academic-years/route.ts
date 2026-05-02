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

    const academicYears = await prisma.academicYear.findMany()
    return NextResponse.json(academicYears || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json([])
  }
}