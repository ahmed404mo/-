import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // قراءة ملف Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[],
    }

    for (const row of data) {
      const name = (row as any).name || (row as any).الاسم
      const email = (row as any).email || (row as any).البريد
      const password = (row as any).password || (row as any).كلمة_المرور || '123456'

      if (!name || !email) {
        results.failed.push({ email: email || 'غير معروف', error: 'الاسم أو البريد ناقص' })
        continue
      }

      // التحقق من وجود البريد
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        results.failed.push({ email, error: 'البريد موجود بالفعل' })
        continue
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      try {
        await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: 'ADVISOR',
          }
        })
        results.success.push(email)
      } catch (error) {
        results.failed.push({ email, error: 'خطأ في الإضافة' })
      }
    }

    return NextResponse.json({
      success: true,
      total: data.length,
      added: results.success.length,
      failed: results.failed.length,
      details: results
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'خطأ في رفع الملف' }, { status: 500 })
  }
}