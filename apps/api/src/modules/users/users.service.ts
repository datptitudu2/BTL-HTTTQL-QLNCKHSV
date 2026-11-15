import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TERMINAL_PROJECT_STATUSES } from '../projects/projects.service';

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
    const activePeriod = await this.prisma.nckhPeriod.findFirst({
      where: { status: 'ACTIVE' },
    });

    const students = await this.prisma.student.findMany({
      where,
      include: {
        user: true,
        department: true,
        memberships: {
          where: {
            confirmStatus: { not: 'DECLINED' },
            project: {
              ...(activePeriod ? { periodId: activePeriod.periodId } : {}),
              status: { not: 'REJECTED' },
            },
          },
          select: { projectId: true, memberRole: true },
        },
      },
      take: 50,
    });

    return students.map((s) => ({
      ...s,
      hasActiveProject: s.memberships.length > 0,
      activeProjectId: s.memberships[0]?.projectId || null,
    }));
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
    const activePeriod = await this.prisma.nckhPeriod.findFirst({
      where: { status: 'ACTIVE' },
    });
    const lecturers = await this.prisma.lecturer.findMany({
      where,
      include: {
        user: true,
        department: true,
        advisoryRoles: {
          where: {
            status: 'ACTIVE',
            project: {
              ...(activePeriod ? { periodId: activePeriod.periodId } : {}),
              status: { notIn: TERMINAL_PROJECT_STATUSES },
            },
          },
          select: { advisorAssignmentId: true, projectId: true, status: true },
        },
      },
      take: 50,
    });

    return lecturers.map((l) => ({
      ...l,
      activeProjectCount: l.advisoryRoles.length,
      maxProjects: 2,
    }));
  }

  async getDepartments() {
    return this.prisma.department.findMany({
      orderBy: { deptName: 'asc' },
    });
  }
}
