'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createInterview(formData: FormData) {
  try {
    const studentCode = formData.get('studentCode') as string
    const studentName = formData.get('studentName') as string
    const studentEmail = formData.get('studentEmail') as string
    const year = parseInt(formData.get('year') as string)
    const group = formData.get('group') as string
    const program = formData.get('program') as string
    const problem = formData.get('problem') as string
    const guidance = formData.get('guidance') as string
    const situation = formData.get('situation') as string
    const advisorId = formData.get('advisorId') as string
    const interviewDate = formData.get('interviewDate') as string

    // البحث عن الطالب أو إنشاؤه
    let student = await prisma.student.findUnique({
      where: { code: studentCode }
    })

    if (!student) {
      student = await prisma.student.create({
        data: {
          code: studentCode,
          name: studentName,
          email: studentEmail,
          year,
          group,
          program,
        }
      })
    } else {
      // تحديث بيانات الطالب إذا تغيرت
      student = await prisma.student.update({
        where: { code: studentCode },
        data: { name: studentName, email: studentEmail, year, group, program }
      })
    }

    // إنشاء المقابلة
    const interview = await prisma.interview.create({
      data: {
        studentId: student.id,
        advisorId,
        date: new Date(interviewDate),
        problem,
        guidance,
        situation,
      }
    })

    revalidatePath('/dashboard/interviews')
    return { success: true, message: 'تم تسجيل المقابلة بنجاح', interviewId: interview.id }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'حدث خطأ أثناء الحفظ' }
  }
}