'use server'

import { prisma } from '@/lib/prisma'

interface SearchFilters {
  studentCode?: string
  studentName?: string
  program?: string
  advisorId?: string
  fromDate?: string
  toDate?: string
  year?: number
  group?: string
}

export async function searchInterviews(filters: SearchFilters) {
  const where: any = {}

  if (filters.studentCode) {
    where.student = { code: { contains: filters.studentCode, mode: 'insensitive' } }
  }
  
  if (filters.studentName) {
    where.student = { name: { contains: filters.studentName, mode: 'insensitive' } }
  }
  
  if (filters.program) {
    where.student = { program: filters.program }
  }
  
  if (filters.advisorId) {
    where.advisorId = filters.advisorId
  }
  
  if (filters.year) {
    where.student = { ...where.student, year: filters.year }
  }
  
  if (filters.group) {
    where.student = { ...where.student, group: filters.group }
  }
  
  if (filters.fromDate || filters.toDate) {
    where.date = {}
    if (filters.fromDate) where.date.gte = new Date(filters.fromDate)
    if (filters.toDate) where.date.lte = new Date(filters.toDate)
  }

  const interviews = await prisma.interview.findMany({
    where,
    include: {
      student: true,
      advisor: true,
      followUps: { orderBy: { sessionDate: 'desc' } }
    },
    orderBy: { date: 'desc' }
  })

  return interviews
}

export async function getStudentHistory(studentId: string) {
  return await prisma.interview.findMany({
    where: { studentId },
    include: {
      advisor: true,
      followUps: true
    },
    orderBy: { date: 'desc' }
  })
}

export async function getAdvisorInterviews(advisorId: string, year?: number) {
  const where: any = { advisorId }
  
  if (year) {
    where.date = {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31`)
    }
  }

  return await prisma.interview.findMany({
    where,
    include: { student: true, followUps: true },
    orderBy: { date: 'desc' }
  })
}