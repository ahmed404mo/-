'use server'

import {prisma} from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createExcellenceMeeting(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const advisorId = formData.get('advisorId') as string;
  const meetingType = formData.get('meetingType') as string;
  const location = formData.get('location') as string;
  const kpiParticipation = parseFloat(formData.get('kpiParticipation') as string);
  const kpiSatisfaction = parseFloat(formData.get('kpiSatisfaction') as string);

  try {
    await prisma.excellenceMeeting.create({
      data: {
        studentId,
        advisorId,
        meetingType,
        location,
        kpiParticipation,
        kpiSatisfaction,
      }
    });

    revalidatePath('/dashboard/excellence');
    return { success: true, message: 'تم حفظ محضر الجلسة بنجاح' }
  } catch (error) {
    return { success: false, message: 'حدث خطأ أثناء حفظ البيانات' }
  }
}