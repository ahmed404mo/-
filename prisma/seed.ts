import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء عملية seeding...')

  // ========== 1. إنشاء المستخدمين ==========
  
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
    console.log('   📧 superadmin@cu.edu.eg | 🔑 admin123')
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
    console.log('   📧 advisor@cu.edu.eg | 🔑 123456')
  } else {
    console.log('⚠️ المرشد التجريبي موجود بالفعل')
  }

  // ========== 2. إنشاء السنوات الدراسية ==========
  
  const academicYearsData = [
    { year: 1, name: 'السنة الأولى' },
    { year: 2, name: 'السنة الثانية' },
    { year: 3, name: 'السنة الثالثة' },
    { year: 4, name: 'السنة الرابعة' },
  ]

  for (const yearData of academicYearsData) {
    const existing = await prisma.academicYear.findFirst({
      where: { year: yearData.year }
    })
    
    if (!existing) {
      await prisma.academicYear.create({
        data: { year: yearData.year, name: yearData.name },
      })
    }
  }
  console.log('✅ تم إنشاء السنوات الدراسية (4 سنوات)')

  // ========== 3. إنشاء الأقسام ==========
  
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
  console.log('   - رياض أطفال عربي (KGA)')
  console.log('   - رياض أطفال انجلش (KGE)')
  console.log('   - تكنولوجيا (TECH)')
  console.log('   - علوم إعاقة (DIS)')
  console.log('   - تربية خاصة (SPED)')
  console.log('   - حضانة (NURS)')

  console.log('\n🎉 انتهت عملية seeding بنجاح!')
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })