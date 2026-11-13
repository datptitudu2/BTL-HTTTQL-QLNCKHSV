import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
        dossier: true,
        decision: true,
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
        outlines: {
          include: { approvals: true },
          orderBy: { versionNo: 'desc' },
        },
        documents: true,
        budget: true,
        acceptance: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    return projects.map((p) => ({
      project_id: p.projectId,
      period_id: p.periodId,
      dept_id: p.deptId,
      title_vi: p.titleVi,
      title_en: p.titleEn,
      research_field: p.researchField,
      status: p.status,
      prelim_score: p.prelimScore,
      prelim_rank: p.prelimRank,
      registered_at: p.registeredAt,
      dossier: p.dossier,
      decision: p.decision,
      departments: {
        dept_id: p.deptId,
        dept_name: p.department.deptName,
        dept_code: p.department.deptCode,
      },
      nckh_periods: {
        period_name: p.period.periodName,
      },
      outlines: p.outlines,
      documents: p.documents,
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

    // QĐ 521 Điều 6: 1 sinh viên chỉ được tham gia tối đa 1 đề tài NCKH trong 1 năm học / đợt NCKH
    const existingMembership = await this.prisma.projectMember.findFirst({
      where: {
        studentId: student.studentId,
        project: {
          periodId: period.periodId,
          status: { not: 'REJECTED' },
        },
      },
      include: { project: true },
    });

    if (existingMembership) {
      throw new BadRequestException(
        `Sinh viên ${student.studentId} đã tham gia đề tài "${existingMembership.project.projectId}" trong đợt ${period.periodName}. Theo QĐ 521, mỗi sinh viên chỉ được tham gia tối đa 01 đề tài/năm học.`,
      );
    }

    const extraMembers: Array<{ studentId: string; role?: string; pct?: number; assignedTask?: string }> =
      Array.isArray(dto.members) ? dto.members.filter((m: any) => m?.studentId && m.studentId !== student!.studentId) : [];

    if (1 + extraMembers.length > 5) {
      throw new BadRequestException('Mỗi đề tài NCKH sinh viên chỉ được tối đa 05 thành viên (bao gồm Chủ nhiệm) theo QĐ 521');
    }

    const seenIds = new Set<string>([student.studentId]);
    for (const m of extraMembers) {
      if (seenIds.has(m.studentId)) {
        throw new BadRequestException(`Sinh viên ${m.studentId} bị trùng lặp trong danh sách nhóm`);
      }
      seenIds.add(m.studentId);

      const memberActive = await this.prisma.projectMember.findFirst({
        where: {
          studentId: m.studentId,
          project: {
            periodId: period.periodId,
            status: { not: 'REJECTED' },
          },
        },
        include: { project: true },
      });
      if (memberActive) {
        throw new BadRequestException(
          `Thành viên ${m.studentId} đã thuộc đề tài "${memberActive.project.projectId}" trong đợt này (QĐ 521: tối đa 01 đề tài/năm học).`,
        );
      }
    }

    const otherPctSum = extraMembers.reduce((sum, m) => sum + Number(m.pct || 0), 0);
    if (otherPctSum >= 100) {
      throw new BadRequestException('Tổng tỷ lệ đóng góp của thành viên phụ phải nhỏ hơn 100% để đảm bảo tổng nhóm = 100%');
    }
    const leadPct = dto.leadPct !== undefined ? Number(dto.leadPct) : 100 - otherPctSum;
    if (Math.round(leadPct + otherPctSum) !== 100) {
      throw new BadRequestException('Tổng tỷ lệ % đóng góp của cả nhóm nghiên cứu phải bằng đúng 100%');
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
          create: [
            {
              studentId: student.studentId,
              memberRole: 'LEAD',
              contributionPct: leadPct,
              assignedTask: dto.leadTask || 'Chủ nhiệm đề tài, quản lý nghiên cứu chung',
              confirmStatus: 'ACCEPTED',
            },
            ...extraMembers.map((m) => ({
              studentId: m.studentId,
              memberRole: 'MEMBER',
              contributionPct: Number(m.pct || 0),
              assignedTask: m.assignedTask || 'Thành viên nghiên cứu & thực nghiệm',
              confirmStatus: 'PENDING',
            })),
          ],
        },
        budget: {
          create: {
            requestedAmount: dto.requestedBudget || 5000000,
            status: 'PENDING',
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
    const project = await this.prisma.project.findUnique({ where: { projectId } });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${projectId}`);

    const duplicate = await this.prisma.projectAdvisor.findFirst({
      where: { projectId, lecturerId, status: { in: ['ACTIVE', 'INVITED'] } },
    });
    if (duplicate) {
      throw new BadRequestException(`Giảng viên ${lecturerId} đã được mời/phân công hướng dẫn đề tài này`);
    }

    const currentAssignments = await this.prisma.projectAdvisor.count({
      where: {
        lecturerId,
        status: { in: ['ACTIVE', 'INVITED'] },
        project: { status: { not: 'REJECTED' } },
      },
    });

    if (currentAssignments >= 2) {
      throw new BadRequestException(`Giảng viên ${lecturerId} đã đạt định mức hướng dẫn tối đa (2 đề tài) theo QĐ 521`);
    }

    if (assignedBy === 'FACULTY') {
      await this.prisma.projectAdvisor.updateMany({
        where: { projectId, status: 'ACTIVE' },
        data: { status: 'REPLACED', endedAt: new Date(), replaceReason: 'Điều chuyển phân công cấp Khoa' },
      });
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
    const project = await this.prisma.project.findUnique({ where: { projectId } });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${projectId}`);

    const currentMembers = await this.prisma.projectMember.findMany({
      where: { projectId },
    });

    if (currentMembers.length >= 5) {
      throw new BadRequestException('Mỗi đề tài NCKH sinh viên tối đa không quá 5 thành viên theo QĐ 521');
    }

    if (currentMembers.some((m) => m.studentId === studentId)) {
      throw new BadRequestException(`Sinh viên ${studentId} đã thuộc nhóm đề tài này`);
    }

    const existingMembership = await this.prisma.projectMember.findFirst({
      where: {
        studentId,
        project: {
          periodId: project.periodId,
          status: { not: 'REJECTED' },
        },
      },
      include: { project: true },
    });

    if (existingMembership) {
      throw new BadRequestException(
        `Sinh viên ${studentId} đã tham gia đề tài "${existingMembership.project.projectId}" trong cùng đợt NCKH (tối đa 01 đề tài/năm học)`,
      );
    }

    const totalOtherPct = currentMembers.reduce((sum, m) => sum + Number(m.contributionPct || 0), 0);
    if (totalOtherPct + pct > 100) {
      throw new BadRequestException(`Tổng % đóng góp vượt quá 100% (hiện tại đã dùng ${totalOtherPct}%)`);
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        studentId,
        memberRole: role === 'LEAD' ? 'MEMBER' : role,
        contributionPct: pct,
        assignedTask: 'Tham gia nghiên cứu và thực nghiệm đề tài',
        confirmStatus: 'PENDING',
      },
    });
  }

  async updateStatus(projectId: string, newStatus: string, reason?: string, user?: any) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: { budget: true, department: true },
    });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${projectId}`);

    const roleCode = user?.roleCode;
    const dataToUpdate: any = { status: newStatus };

    if (newStatus === 'FACULTY_APPROVED' || newStatus === 'REJECTED') {
      if (roleCode && !['FACULTY_SECRETARY', 'FACULTY_LEADER', 'QLKHCN', 'ADMIN'].includes(roleCode)) {
        throw new ForbiddenException('Chỉ Thư ký Khoa / Lãnh đạo Khoa / QLKHCN mới có quyền sơ tuyển đề tài (DFD 3)');
      }

      dataToUpdate.prelimRank = newStatus === 'FACULTY_APPROVED' ? 'PASSED' : 'FAILED';
      dataToUpdate.prelimScore = newStatus === 'FACULTY_APPROVED' ? 88 : 42;

      if (newStatus === 'FACULTY_APPROVED' && !project.dossierId) {
        let dossier = await this.prisma.facultyDossier.findFirst({
          where: { deptId: project.deptId, periodId: project.periodId },
        });
        if (!dossier) {
          dossier = await this.prisma.facultyDossier.create({
            data: {
              deptId: project.deptId,
              periodId: project.periodId,
              officialLetterNo: `CV-${project.department.deptCode}-${new Date().getFullYear()}`,
              reviewStatus: 'APPROVED',
            },
          });
        }
        dataToUpdate.dossierId = dossier.dossierId;
      }

      if (project.budget) {
        await this.prisma.budget.update({
          where: { budgetId: project.budget.budgetId },
          data: {
            facultyProposed: newStatus === 'FACULTY_APPROVED' ? project.budget.requestedAmount : 0,
            status: newStatus === 'REJECTED' ? 'REJECTED' : 'FACULTY_PROPOSED',
          },
        });
      }
    } else if (newStatus === 'ONGOING') {
      if (roleCode && !['QLKHCN', 'BOARD', 'FACULTY_LEADER', 'ADMIN'].includes(roleCode)) {
        throw new ForbiddenException('Chỉ P.QLKHCN hoặc Ban Giám Đốc mới có thẩm quyền phê duyệt giao đề tài');
      }

      if (!project.decisionId) {
        let decision = await this.prisma.decision.findFirst({
          where: { periodId: project.periodId, decisionType: 'ASSIGN' },
        });
        if (!decision) {
          decision = await this.prisma.decision.create({
            data: {
              periodId: project.periodId,
              decisionNo: `${Math.floor(100 + Math.random() * 800)}/QĐ-HV`,
              decisionType: 'ASSIGN',
              issuedDate: new Date(),
              totalBudget: project.budget?.requestedAmount || 5000000,
            },
          });
        }
        dataToUpdate.decisionId = decision.decisionId;
      }

      if (project.budget) {
        const finalBudget = Number(project.budget.approvedAmount || project.budget.facultyProposed || project.budget.requestedAmount || 5000000);
        await this.prisma.budget.update({
          where: { budgetId: project.budget.budgetId },
          data: {
            approvedAmount: finalBudget,
            status: 'APPROVED',
          },
        });
      }
    } else if (newStatus === 'SUBMITTED') {
      if (roleCode === 'STUDENT') {
        const isMember = await this.prisma.projectMember.findFirst({
          where: { projectId, student: { userId: user.userId } },
        });
        if (!isMember) {
          throw new ForbiddenException('Bạn không phải thành viên của đề tài này');
        }
      }
    }

    const updated = await this.prisma.project.update({
      where: { projectId },
      data: dataToUpdate,
    });

    if (user?.userId) {
      await this.prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: `UPDATE_PROJECT_STATUS_${newStatus}`,
          entity: 'projects',
          entityId: projectId,
          newValue: JSON.stringify({ status: newStatus, reason: reason || null }),
        },
      }).catch(() => {});
    }

    return updated;
  }
}
