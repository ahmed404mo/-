// actions/probation.ts
'use server'

import {prisma} from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProbationForm(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const advisorId = formData.get('advisorId') as string;
  const level = formData.get('level') as string; // P1, P2, P3
  const gpa = parseFloat(formData.get('gpa') as string);
  const interventionPlan = formData.get('interventionPlan') as string;

  try {
    await prisma.probationForm.create({
      data: {
        studentId,
        advisorId,
        level,
        gpa,
        passedHours: 0, // يتم استبداله بالبيانات الحقيقية
        remainingHours: 0,
        absencePercentage: 0,
        failedCourses: "N/A",
        interventionPlan,
      }
    });

    // تحديث الصفحة تلقائياً بعد الإضافة
    revalidatePath('/dashboard/probations');
    return { success: true, message: 'تم حفظ الإنذار بنجاح' }
  } catch (error) {
    return { success: false, message: 'حدث خطأ أثناء الحفظ' }
  }
}