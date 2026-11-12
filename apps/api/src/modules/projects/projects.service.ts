import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    periodId?: number;
    deptId?: number;
    status?: string;
    keyword?: string;
    studentId?: string;
    lecturerId?: string;
  }) {
    const where: any = {};

    if (query.periodId) where.periodId = Number(query.periodId);
    if (query.deptId) where.deptId = Number(query.deptId);
    if (query.status) where.status = query.status;

    if (query.keyword) {
      where.OR = [
        { titleVi: { contains: query.keyword, mode: 'insensitive' } },
        { projectId: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    if (query.studentId) {
      where.members = {
        some: { studentId: query.studentId },
      };
    }

    if (query.lecturerId) {
      where.advisors = {
        some: { lecturerId: query.lecturerId },
      };
    }

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        period: true,
        department: true,
        members: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
        advisors: {
          include: {
            lecturer: {
              include: { user: true },
            },
          },
        },
        budget: true,
        acceptance: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    return projects.map((p) => ({
      project_id: p.projectId,
      title_vi: p.titleVi,
      title_en: p.titleEn,
      research_field: p.researchField,
      status: p.status,
      registered_at: p.registeredAt,
      departments: {
        dept_name: p.department.deptName,
        dept_code: p.department.deptCode,
      },
      nckh_periods: {
        period_name: p.period.periodName,
      },
      project_members: p.members.map((m) => ({
        member_id: m.memberId,
        student_id: m.studentId,
        member_role: m.memberRole === 'LEAD' ? 'LEADER' : m.memberRole,
        contribution_pct: m.contributionPct,
        assigned_task: m.assignedTask,
        students: {
          class_name: m.student.className,
          gender: m.student.gender,
          users: {
            full_name: m.student.user.fullName,
          },
        },
      })),
      project_advisors: p.advisors.map((a) => ({
        lecturer_id: a.lecturerId,
        lecturers: {
          academic_rank: a.lecturer.academicRank,
          users: {
            full_name: a.lecturer.user.fullName,
          },
        },
      })),
      budgets: p.budget
        ? {
            requested_amount: p.budget.requestedAmount,
            faculty_proposed: p.budget.facultyProposed,
            approved_amount: p.budget.approvedAmount,
          }
        : null,
      acceptances: p.acceptance
        ? {
            acceptance_id: p.acceptance.acceptanceId,
            avg_score: p.acceptance.avgScore,
            grade: p.acceptance.grade,
          }
        : null,
    }));
  }

  async findOne(projectId: string) {
    const p = await this.prisma.project.findUnique({
      where: { projectId },
      include: {
        period: {
          include: {
            milestones: true,
            criteria: true,
          },
        },
        department: true,
        members: {
          include: {
            student: {
              include: {
                user: true,
                department: true,
              },
            },
          },
        },
        advisors: {
          include: {
            lecturer: {
              include: {
                user: true,
                department: true,
              },
            },
          },
        },
        budget: {
          include: { settlements: true },
        },
        outlines: {
          include: { approvals: true },
          orderBy: { versionNo: 'desc' },
        },
        progressReports: {
          include: { milestone: true },
          orderBy: { submittedAt: 'desc' },
        },
        seminars: {
          include: { members: true },
        },
        changeRequests: {
          include: { approvals: true },
        },
        documents: true,
        acceptance: {
          include: {
            council: {
              include: {
                members: {
                  include: {
                    lecturer: { include: { user: true } },
                  },
                },
              },
            },
            sheets: {
              include: {
                councilMember: {
                  include: {
                    lecturer: { include: { user: true } },
                  },
                },
                scores: {
                  include: { criteria: true },
                },
              },
            },
          },
        },
        certificates: true,
        studentBonuses: true,
      },
    });

    if (!p) throw new NotFoundException(`Không tìm thấy đề tài mã ${projectId}`);

    return {
      project_id: p.projectId,
      title_vi: p.titleVi,
      title_en: p.titleEn,
      research_field: p.researchField,
      objectives: p.objectives,
      content: p.content,
      methodology: p.methodology,
      expected_result: p.expectedResult,
      status: p.status,
      registered_at: p.registeredAt,
      departments: {
        dept_name: p.department.deptName,
        dept_code: p.department.deptCode,
      },
      nckh_periods: {
        period_name: p.period.periodName,
      },
      project_members: p.members.map((m) => ({
        member_id: m.memberId,
        student_id: m.studentId,
        member_role: m.memberRole === 'LEAD' ? 'LEADER' : m.memberRole,
        contribution_pct: m.contributionPct,
        assigned_task: m.assignedTask,
        students: {
          class_name: m.student.className,
          gender: m.student.gender,
          users: {
            full_name: m.student.user.fullName,
          },
        },
      })),
      project_advisors: p.advisors.map((a) => ({
        lecturer_id: a.lecturerId,
        lecturers: {
          academic_rank: a.lecturer.academicRank,
          users: {
            full_name: a.lecturer.user.fullName,
          },
        },
      })),
      budgets: p.budget
        ? {
            requested_amount: p.budget.requestedAmount,
            faculty_proposed: p.budget.facultyProposed,
            approved_amount: p.budget.approvedAmount,
          }
        : null,
      outlines: p.outlines.map((ot) => ({
        outline_id: ot.outlineId,
        version_no: ot.versionNo,
        file_url: ot.fileUrl,
        submitted_at: ot.submittedAt,
        approvals: ot.approvals,
      })),
      acceptances: p.acceptance
        ? {
            acceptance_id: p.acceptance.acceptanceId,
            avg_score: p.acceptance.avgScore,
            grade: p.acceptance.grade,
            councils: p.acceptance.council
              ? {
                  council_name: p.acceptance.council.councilName,
                  council_members: p.acceptance.council.members.map((cm) => ({
                    cm_id: cm.cmId,
                    council_role: cm.councilRole,
                    lecturers: {
                      users: {
                        full_name: cm.lecturer.user.fullName,
                      },
                    },
                  })),
                }
              : null,
          }
        : null,
    };
  }

  async generateProjectId(deptCode: string, year: number): Promise<string> {
    const counter = await this.prisma.projectCodeCounter.upsert({
      where: {
        year_deptCode: {
          year,
          deptCode,
        },
      },
      update: { lastNo: { increment: 1 } },
      create: { year, deptCode, lastNo: 1 },
    });

    const padded = String(counter.lastNo).padStart(3, '0');
    return `SV-${year}-${deptCode}-${padded}`;
  }

  async create(user: any, dto: any) {
    const period = await this.prisma.nckhPeriod.findFirst({
      where: { status: 'ACTIVE' },
    });
    if (!period) throw new BadRequestException('Hiện tại chưa có đợt NCKH nào đang mở nhận đề tài');

    let student = await this.prisma.student.findFirst({
      where: { userId: user.userId },
      include: { department: true },
    });

    if (!student && user.studentId) {
      student = await this.prisma.student.findUnique({
        where: { studentId: user.studentId },
        include: { department: true },
      });
    }

    if (!student) {
      throw new BadRequestException('Chỉ tài khoản sinh viên mới có quyền đăng ký đề tài NCKH');
    }

    const currentYear = new Date().getFullYear();
    const deptCode = student.department?.deptCode || 'CNTT1';
    const projectId = await this.generateProjectId(deptCode, currentYear);

    const project = await this.prisma.project.create({
      data: {
        projectId,
        periodId: period.periodId,
        deptId: student.deptId,
        titleVi: dto.titleVi,
        titleEn: dto.titleEn || '',
        researchField: dto.researchField || 'Công nghệ thông tin',
        objectives: dto.objectives || '',
        content: dto.content || '',
        methodology: dto.methodology || '',
        expectedResult: dto.expectedResult || '',
        status: 'PROPOSED',
        members: {
          create: {
            studentId: student.studentId,
            memberRole: 'LEAD',
            contributionPct: 100,
            assignedTask: 'Chủ nhiệm đề tài, quản lý nghiên cứu chung',
            confirmStatus: 'ACCEPTED',
          },
        },
        budget: {
          create: {
            requestedAmount: dto.requestedBudget || 5000000,
            status: 'PROPOSED',
          },
        },
      },
      include: {
        members: true,
        budget: true,
      },
    });

    if (dto.lecturerId) {
      await this.assignAdvisor(projectId, dto.lecturerId, 'STUDENT');
    }

    return {
      project_id: project.projectId,
      ...project,
    };
  }

  async assignAdvisor(projectId: string, lecturerId: string, assignedBy = 'STUDENT') {
    const currentAssignments = await this.prisma.projectAdvisor.count({
      where: {
        lecturerId: lecturerId,
        status: { in: ['ACTIVE', 'INVITED'] },
      },
    });

    if (currentAssignments >= 2) {
      throw new BadRequestException(`Giảng viên ${lecturerId} đã đạt định mức hướng dẫn tối đa (2 đề tài) theo QĐ 521`);
    }

    return this.prisma.projectAdvisor.create({
      data: {
        projectId,
        lecturerId,
        assignedBy,
        status: assignedBy === 'STUDENT' ? 'INVITED' : 'ACTIVE',
        assignedAt: new Date(),
      },
    });
  }

  async inviteMember(projectId: string, studentId: string, role = 'MEMBER', pct = 20) {
    const memberCount = await this.prisma.projectMember.count({
      where: { projectId: projectId },
    });

    if (memberCount >= 5) {
      throw new BadRequestException('Mỗi đề tài NCKH sinh viên tối đa không quá 5 thành viên theo QĐ 521');
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        studentId,
        memberRole: role,
        contributionPct: pct,
        assignedTask: 'Tham gia nghiên cứu và thực nghiệm đề tài',
        confirmStatus: 'PENDING',
      },
    });
  }

  async updateStatus(projectId: string, newStatus: string, _reason?: string) {
    return this.prisma.project.update({
      where: { projectId },
      data: { status: newStatus },
    });
  }
}
