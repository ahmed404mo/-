'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createFollowUp(formData: FormData) {
  try {
    const interviewId = formData.get('interviewId') as string
    const advisorId = formData.get('advisorId') as string
    const sessionType = formData.get('sessionType') as string
    const progress = formData.get('progress') as string
    const recommendation = formData.get('recommendation') as string
    const status = formData.get('status') as FollowUpStatus
    const sessionDate = formData.get('sessionDate') as string

    const followUp = await prisma.followUp.create({
      data: {
        interviewId,
        advisorId,
        sessionType,
        progress,
        recommendation,
        status: status as FollowUpStatus,
        sessionDate: new Date(sessionDate),
      }
    })

    revalidatePath(`/dashboard/interviews/${interviewId}`)
    return { success: true, message: 'تم تسجيل جلسة المتابعة' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'حدث خطأ' }
  }
}

export async function getFollowUpsByInterview(interviewId: string) {
  return await prisma.followUp.findMany({
    where: { interviewId },
    orderBy: { sessionDate: 'desc' }
  })
}