import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء عملية seeding...')

  // إنشاء Super Admin
  const superAdminEmail = 'superadmin@cu.edu.eg'
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail }
  })

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: superAdminEmail,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      }
    })
    console.log('✅ تم إنشاء Super Admin')
  } else {
    console.log('⚠️ Super Admin موجود بالفعل')
  }

  // إنشاء مرشد تجريبي
  const advisorEmail = 'advisor@cu.edu.eg'
  const existingAdvisor = await prisma.user.findUnique({
    where: { email: advisorEmail }
  })

  if (!existingAdvisor) {
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    await prisma.user.create({
      data: {
        name: 'د. أحمد محمد',
        email: advisorEmail,
        password: hashedPassword,
        role: 'ADVISOR',
      }
    })
    console.log('✅ تم إنشاء مرشد تجريبي')
  } else {
    console.log('⚠️ المرشد التجريبي موجود بالفعل')
  }

  // إضافة الأقسام
  const departmentsData = [
    { name: 'رياض أطفال عربي', code: 'KGA' },
    { name: 'رياض أطفال انجلش', code: 'KGE' },
    { name: 'تكنولوجيا', code: 'TECH' },
    { name: 'علوم إعاقة', code: 'DIS' },
    { name: 'تربية خاصة', code: 'SPED' },
    { name: 'حضانة', code: 'NURS' },
  ]

  for (const dept of departmentsData) {
    const existing = await prisma.department.findUnique({
      where: { code: dept.code }
    })
    
    if (!existing) {
      await prisma.department.create({
        data: { name: dept.name, code: dept.code },
      })
    }
  }
  console.log('✅ تم إنشاء الأقسام (6 أقسام)')

  console.log('🎉 انتهت عملية seeding بنجاح!')
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })