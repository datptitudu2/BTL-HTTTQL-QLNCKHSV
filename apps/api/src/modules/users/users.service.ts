import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findStudents(query?: { keyword?: string; deptId?: number }) {
    const where: any = {};
    if (query?.deptId) where.deptId = Number(query.deptId);
    if (query?.keyword) {
      where.OR = [
        { studentId: { contains: query.keyword, mode: 'insensitive' } },
        { user: { fullName: { contains: query.keyword, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.student.findMany({
      where,
      include: {
        user: true,
        department: true,
      },
      take: 50,
    });
  }

  async findLecturers(query?: { keyword?: string; deptId?: number }) {
    const where: any = {};
    if (query?.deptId) where.deptId = Number(query.deptId);
    if (query?.keyword) {
      where.OR = [
        { lecturerId: { contains: query.keyword, mode: 'insensitive' } },
        { user: { fullName: { contains: query.keyword, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.lecturer.findMany({
      where,
      include: {
        user: true,
        department: true,
        advisoryRoles: {
          where: { status: { in: ['ACTIVE', 'INVITED'] } },
        },
      },
      take: 50,
    });
  }

  async getDepartments() {
    return this.prisma.department.findMany({
      orderBy: { deptName: 'asc' },
    });
  }
}
