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

    const body = await request.json()
    console.log('Received body:', body)

    const { 
      studentCode, studentName, studentEmail, year, group, program, 
      interviewDate, situation, problem, guidance 
    } = body

    if (!studentCode || !studentName || !year || !group || !program) {
      return NextResponse.json({ 
        success: false, 
        message: 'البيانات المطلوبة ناقصة' 
      }, { status: 400 })
    }

    // البحث عن الطالب بالكود أولاً
    let student = await prisma.student.findUnique({
      where: { code: studentCode }
    })

    if (student) {
      // تحديث بيانات الطالب الموجود
      student = await prisma.student.update({
        where: { code: studentCode },
        data: {
          name: studentName,
          year: parseInt(year.toString()),
          group: group,
          program: program,
          // تحديث البريد فقط إذا تم توفير بريد جديد ومختلف
          email: studentEmail && studentEmail.trim() !== '' && studentEmail !== student.email 
            ? studentEmail 
            : student.email,
        }
      })
    } else {
      // إنشاء طالب جديد - تأكد من أن البريد فريد
      let emailToUse = studentEmail && studentEmail.trim() !== '' 
        ? studentEmail 
        : `${studentCode}@student.com`
      
      // تأكد من أن البريد غير موجود بالفعل
      const existingEmail = await prisma.student.findUnique({
        where: { email: emailToUse }
      })
      
      if (existingEmail) {
        // إذا كان البريد موجود، أضف رقم عشوائي
        emailToUse = `${studentCode}_${Date.now()}@student.com`
      }
      
      student = await prisma.student.create({
        data: {
          code: studentCode,
          name: studentName,
          email: emailToUse,
          year: parseInt(year.toString()),
          group: group,
          program: program,
        }
      })
    }

    // إنشاء المقابلة
    const interview = await prisma.interview.create({
      data: {
        studentId: student.id,
        advisorId,
        date: interviewDate ? new Date(interviewDate) : new Date(),
        problem: problem || '',
        guidance: guidance || '',
        situation: situation || null,
      }
    })

    console.log('Interview created:', interview.id)

    return NextResponse.json({ 
      success: true, 
      message: 'تم تسجيل المقابلة بنجاح', 
      interviewId: interview.id 
    })
  } catch (error: any) {
    console.error('Error creating interview:', error)
    
    // معالجة أخطاء Prisma بشكل خاص
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        message: 'هذا الطالب موجود بالفعل (كود أو بريد مكرر)' 
      }, { status: 409 })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'حدث خطأ أثناء الحفظ' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const advisorId = (session?.user as any)?.id

    if (!advisorId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const interviews = await prisma.interview.findMany({
      where: { advisorId },
      include: {
        student: true,
        followUps: {
          orderBy: { sessionDate: 'desc' }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(interviews)
  } catch (error: any) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}