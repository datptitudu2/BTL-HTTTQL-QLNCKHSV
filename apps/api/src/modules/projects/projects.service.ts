import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const TERMINAL_PROJECT_STATUSES = ['REJECTED', 'CANCELLED', 'ACCEPTED'];

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

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
        awardNominations: true,
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
      objectives: p.objectives,
      status: p.status,
      prelim_result: p.prelimResult,
      prelim_rank: p.prelimResult,
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
        confirm_status: m.confirmStatus,
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
        advisor_assignment_id: a.advisorAssignmentId,
        lecturer_id: a.lecturerId,
        assigned_by: a.assignedBy,
        status: a.status,
        lecturers: {
          academic_rank: a.lecturer.academicRank,
          users: {
            full_name: a.lecturer.user.fullName,
            email: a.lecturer.user.email,
          },
        },
      })),
      budgets: p.budget
        ? {
          budget_id: p.budget.budgetId,
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
      award_nominations: (p.awardNominations || []).map((an) => ({
        nomination_id: an.nominationId,
        award_level: an.awardLevel,
        prize_grade: an.prizeGrade,
        approval_status: an.approvalStatus,
      })),
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
          orderBy: { heldAt: 'desc' },
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
                    lecturer: { include: { user: true, department: true } },
                  },
                },
              },
            },
            sheets: {
              include: {
                councilMember: {
                  include: {
                    lecturer: { include: { user: true, department: true } },
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
        awardNominations: true,
      },
    });

    if (!p) throw new NotFoundException(`Không tìm thấy đề tài mã ${projectId}`);

    return {
      project_id: p.projectId,
      title_vi: p.titleVi,
      title_en: p.titleEn,
      research_field: p.researchField,
      coordinating_unit: p.coordinatingUnit,
      keywords: p.keywords,
      prelim_result: p.prelimResult,
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
        academic_year: p.period.academicYear,
        milestones: (p.period.milestones || [])
          .slice()
          .sort((a, b) => a.pmId - b.pmId)
          .map((m) => ({
            pm_id: m.pmId,
            milestone_type: m.milestoneType,
            milestone_name: m.milestoneName,
            due_date: m.dueDate,
          })),
        criteria: (p.period.criteria || [])
          .slice()
          .sort((a, b) => a.orderNo - b.orderNo)
          .map((c) => ({
            criteria_id: c.criteriaId,
            order_no: c.orderNo,
            title: c.title,
            max_score: c.maxScore,
          })),
      },
      project_members: p.members.map((m) => ({
        member_id: m.memberId,
        student_id: m.studentId,
        member_role: m.memberRole === 'LEAD' ? 'LEADER' : m.memberRole,
        contribution_pct: m.contributionPct,
        confirm_status: m.confirmStatus,
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
        advisor_assignment_id: a.advisorAssignmentId,
        lecturer_id: a.lecturerId,
        assigned_by: a.assignedBy,
        status: a.status,
        lecturers: {
          academic_rank: a.lecturer.academicRank,
          users: {
            full_name: a.lecturer.user.fullName,
            email: a.lecturer.user.email,
          },
        },
      })),
      budgets: p.budget
        ? {
          budget_id: p.budget.budgetId,
          requested_amount: p.budget.requestedAmount,
          faculty_proposed: p.budget.facultyProposed,
          approved_amount: p.budget.approvedAmount,
        }
        : null,
      outlines: p.outlines.map((ot) => ({
        outline_id: ot.outlineId,
        version_no: ot.versionNo,
        file_url: ot.fileUrl,
        approval_status: ot.approvalStatus,
        submitted_at: ot.submittedAt,
        approvals: ot.approvals,
      })),
      progress_reports: p.progressReports.map((pr) => ({
        report_id: pr.reportId,
        pm_id: pr.pmId,
        milestone_name: pr.milestone?.milestoneName,
        milestone_type: pr.milestone?.milestoneType,
        report_content: pr.reportContent,
        product_url: pr.productUrl,
        advisor_comment: pr.advisorComment,
        assessment: pr.assessment,
        submitted_at: pr.submittedAt,
      })),
      seminars: p.seminars.map((sm) => ({
        seminar_id: sm.seminarId,
        plan_title: sm.planTitle,
        held_at: sm.heldAt,
        location: sm.location,
        meeting_link: sm.meetingLink,
        invitation_code: sm.invitationCode,
        status: sm.status,
        feedback: sm.feedback,
        discussion: sm.discussion || sm.feedback,
        overall_assessment: sm.overallAssessment,
        revision_requests: sm.revisionRequests,
        minutes_file_url: sm.minutesFileUrl,
      })),
      documents: p.documents.map((doc) => ({
        doc_id: doc.docId,
        doc_type: doc.docType,
        file_url: doc.fileUrl,
        plagiarism_rate: doc.plagiarismRate,
        library_code: doc.libraryCode,
        visibility: doc.visibility,
      })),
      certificates: (p.certificates || []).map((c) => ({
        cert_id: c.certId,
        cert_code: c.certCode,
        grade: c.grade,
        issued_date: c.issuedDate,
      })),
      award_nominations: (p.awardNominations || []).map((an) => ({
        nomination_id: an.nominationId,
        award_level: an.awardLevel,
        prize_grade: an.prizeGrade,
        approval_status: an.approvalStatus,
        reward_decision_no: an.rewardDecisionNo,
      })),
      acceptances: p.acceptance
        ? {
          acceptance_id: p.acceptance.acceptanceId,
          avg_score: p.acceptance.avgScore,
          grade: p.acceptance.grade,
          approval_doc_no: p.acceptance.approvalDocNo,
          councils: p.acceptance.council
            ? {
              council_name: p.acceptance.council.councilName,
              decision_no: p.acceptance.council.decisionNo,
              council_members: p.acceptance.council.members.map((cm) => ({
                cm_id: cm.cmId,
                council_role: cm.councilRole,
                lecturers: {
                  departments: {
                    dept_name: cm.lecturer.department?.deptName,
                  },
                  users: {
                    full_name: cm.lecturer.user.fullName,
                  },
                },
              })),
            }
            : null,
          sheets: (p.acceptance.sheets || []).map((s) => ({
            sheet_id: s.sheetId,
            cm_id: s.cmId,
            council_role: s.councilMember?.councilRole,
            lecturer_name: s.councilMember?.lecturer?.user?.fullName,
            dept_name: s.councilMember?.lecturer?.department?.deptName,
            total_score: s.totalScore,
            strengths: s.strengths,
            limitations: s.limitations,
            qa_notes: s.qaNotes,
            qa_comment: s.qaComment,
            conclusion_award_rec: s.conclusionAwardRec,
            submitted_at: s.submittedAt,
            scored_at: s.scoredAt,
          })),
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
        confirmStatus: { not: 'DECLINED' },
        project: {
          period: { academicYear: period.academicYear },
          status: { notIn: ['REJECTED', 'CANCELLED'] },
        },
      },
      include: { project: true },
    });

    if (existingMembership) {
      throw new BadRequestException({
        code: 'STUDENT_PROJECT_LIMIT_EXCEEDED',
        message: `Sinh viên ${student.studentId} hiện đang có 01 đề tài ("${existingMembership.project.projectId}") trong năm học ${period.academicYear}. Theo Điều 15 khoản 2 điểm a QĐ 521/QĐ-HV, mỗi sinh viên chỉ được tham gia tối đa 01 đề tài/năm học.`,
      });
    }

    const extraMembers: Array<{ studentId: string; role?: string; pct?: number; assignedTask?: string }> =
      Array.isArray(dto.members) ? dto.members.filter((m: any) => m?.studentId && m.studentId !== student!.studentId) : [];

    if (1 + extraMembers.length > 5) {
      throw new BadRequestException('Mỗi đề tài NCKH sinh viên chỉ được tối đa 05 thành viên (bao gồm Chủ nhiệm) theo QĐ 521');
    }

    const seenIds = new Set<string>([student.studentId]);
    const validExtraStudents: Array<{ studentId: string; userId: number; fullName?: string }> = [];
    for (const m of extraMembers) {
      const normalizedId = String(m.studentId || '').trim().toUpperCase();
      if (seenIds.has(normalizedId)) {
        throw new BadRequestException(`Sinh viên ${normalizedId} bị trùng lặp trong danh sách nhóm`);
      }
      seenIds.add(normalizedId);

      const targetStudent = await this.prisma.student.findFirst({
        where: { studentId: { equals: normalizedId, mode: 'insensitive' } },
        include: { user: true },
      });
      if (!targetStudent) {
        throw new BadRequestException(
          `Không tìm thấy sinh viên có mã "${m.studentId}" trong hệ thống. Vui lòng chọn sinh viên từ danh sách gợi ý.`,
        );
      }
      m.studentId = targetStudent.studentId;
      validExtraStudents.push({
        studentId: targetStudent.studentId,
        userId: targetStudent.userId,
        fullName: targetStudent.user?.fullName,
      });

      const memberActive = await this.prisma.projectMember.findFirst({
        where: {
          studentId: targetStudent.studentId,
          confirmStatus: { not: 'DECLINED' },
          project: {
            period: { academicYear: period.academicYear },
            status: { notIn: ['REJECTED', 'CANCELLED'] },
          },
        },
        include: { project: true },
      });
      if (memberActive) {
        throw new BadRequestException({
          code: 'STUDENT_PROJECT_LIMIT_EXCEEDED',
          message: `Thành viên ${targetStudent.studentId} hiện đang có 01 đề tài ("${memberActive.project.projectId}") trong năm học ${period.academicYear}. Theo Điều 15 khoản 2 điểm a QĐ 521/QĐ-HV, mỗi sinh viên chỉ được tham gia tối đa 01 đề tài/năm học.`,
        });
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

    if (validExtraStudents.length > 0) {
      await this.prisma.notification
        .createMany({
          data: validExtraStudents.map((s) => ({
            userId: s.userId,
            title: `Lời mời tham gia đề tài NCKH ${projectId}`,
            content: `Bạn được mời làm thành viên phối hợp trong đề tài "${dto.titleVi}" (${projectId}). Vui lòng kiểm tra và xác nhận tham gia.`,
            channel: 'WEB',
            deliveryStatus: 'SENT',
            urgent: true,
            targetUrl: `/projects/${projectId}`,
            type: 'GENERAL',
          })),
        })
        .catch(() => {});
    }

    return {
      project_id: project.projectId,
      ...project,
    };
  }

  private async syncLecturerActiveCount(lecturerId: string) {
    const activeCount = await this.prisma.projectAdvisor.count({
      where: {
        lecturerId,
        status: 'ACTIVE',
        project: { status: { notIn: TERMINAL_PROJECT_STATUSES } },
      },
    });
    await this.prisma.lecturer
      .update({
        where: { lecturerId },
        data: { activeProjectCount: activeCount },
      })
      .catch(() => {});
  }

  private async verifyFacultyDeptAccess(user: any, targetDeptId: number, actionLabel: string) {
    if (!user?.userId || !['FACULTY_SECRETARY', 'FACULTY_LEADER'].includes(user?.roleCode)) return;
    const targetDeptStaffCount = await this.prisma.deptPosition.count({
      where: { deptId: targetDeptId, isActive: true },
    });
    if (targetDeptStaffCount === 0) return;

    const myPositions = await this.prisma.deptPosition.findMany({
      where: { userId: user.userId, isActive: true },
      select: { deptId: true },
    });
    const myDeptIds = myPositions.map((p) => p.deptId);
    if (myDeptIds.length > 0 && !myDeptIds.includes(targetDeptId)) {
      throw new ForbiddenException(`Bạn chỉ có quyền ${actionLabel} cho đề tài thuộc Khoa mình quản lý`);
    }
  }

  async assignAdvisor(projectId: string, lecturerId: string, assignedBy = 'STUDENT', user?: any) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: { members: true },
    });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${projectId}`);

    const roleCode = user?.roleCode;
    if (user) {
      if (roleCode === 'STUDENT') {
        const isLead = project.members.some(
          (m) => m.studentId === user.studentId && (m.memberRole === 'LEAD' || m.memberRole === 'LEADER'),
        );
        if (!isLead) {
          throw new ForbiddenException('Chỉ Chủ nhiệm đề tài mới có quyền mời Giảng viên hướng dẫn');
        }
      } else if (!['FACULTY_SECRETARY', 'FACULTY_LEADER', 'QLKHCN', 'ADMIN'].includes(roleCode)) {
        throw new ForbiddenException('Bạn không có quyền phân công Giảng viên hướng dẫn');
      } else if (['FACULTY_SECRETARY', 'FACULTY_LEADER'].includes(roleCode)) {
        await this.verifyFacultyDeptAccess(user, project.deptId, 'phân công GVHD');
      }
    }

    const effectiveAssignType = ['FACULTY_SECRETARY', 'FACULTY_LEADER', 'QLKHCN', 'ADMIN'].includes(roleCode)
      ? 'FACULTY'
      : assignedBy || 'STUDENT';

    const duplicate = await this.prisma.projectAdvisor.findFirst({
      where: { projectId, lecturerId, status: { in: ['ACTIVE', 'INVITED'] } },
    });
    if (duplicate) {
      throw new BadRequestException(`Giảng viên ${lecturerId} đã được mời/phân công hướng dẫn đề tài này`);
    }

    if (effectiveAssignType === 'STUDENT') {
      const existingAdvisor = await this.prisma.projectAdvisor.findFirst({
        where: { projectId, status: { in: ['ACTIVE', 'INVITED'] } },
      });
      if (existingAdvisor) {
        throw new BadRequestException('Đề tài đã có Giảng viên hướng dẫn đang chờ xác nhận hoặc đang hướng dẫn');
      }
    }

    const currentAssignments = await this.prisma.projectAdvisor.count({
      where: {
        lecturerId,
        status: 'ACTIVE',
        project: { status: { notIn: TERMINAL_PROJECT_STATUSES } },
      },
    });

    if (currentAssignments >= 2) {
      throw new BadRequestException({
        code: 'ADVISOR_QUOTA_EXCEEDED',
        message: `Giảng viên ${lecturerId} hiện đang có ${currentAssignments}/02 phân công hướng dẫn ACTIVE. Theo Điều 16 khoản 2 điểm a QĐ 521/QĐ-HV, mỗi giảng viên chỉ được hướng dẫn tối đa 02 đề tài cùng thời gian.`,
      });
    }

    if (effectiveAssignType === 'FACULTY') {
      await this.prisma.projectAdvisor.updateMany({
        where: { projectId, status: { in: ['ACTIVE', 'INVITED'] } },
        data: { status: 'REPLACED', endedAt: new Date(), replaceReason: 'Điều chuyển phân công cấp Khoa' },
      });
    }

    const createdAdvisor = await this.prisma.projectAdvisor.create({
      data: {
        projectId,
        lecturerId,
        assignedBy: effectiveAssignType,
        status: effectiveAssignType === 'STUDENT' ? 'INVITED' : 'ACTIVE',
        assignedAt: new Date(),
      },
    });
    await this.syncLecturerActiveCount(lecturerId);
    return createdAdvisor;
  }

  async respondAdvisorInvite(
    projectId: string,
    advisorAssignmentId: number,
    decision: 'ACTIVE' | 'REJECTED',
    reason?: string,
    user?: any,
  ) {
    const assignment = await this.prisma.projectAdvisor.findUnique({
      where: { advisorAssignmentId },
    });
    if (!assignment || assignment.projectId !== projectId) {
      throw new NotFoundException('Không tìm thấy lời mời hướng dẫn đề tài');
    }

    if (user && user.roleCode !== 'ADMIN') {
      if (user.roleCode !== 'LECTURER' || user.lecturerId !== assignment.lecturerId) {
        throw new ForbiddenException('Chỉ Giảng viên được mời mới có quyền xác nhận hoặc từ chối hướng dẫn');
      }
    }

    if (assignment.status !== 'INVITED') {
      throw new BadRequestException(`Lời mời đã ở trạng thái ${assignment.status}, không thể phản hồi lại`);
    }

    if (decision === 'ACTIVE') {
      const activeCount = await this.prisma.projectAdvisor.count({
        where: {
          lecturerId: assignment.lecturerId,
          status: 'ACTIVE',
          project: { status: { notIn: TERMINAL_PROJECT_STATUSES } },
        },
      });
      if (activeCount >= 2) {
        throw new BadRequestException({
          code: 'ADVISOR_QUOTA_EXCEEDED',
          message: `Giảng viên ${assignment.lecturerId} hiện đang có ${activeCount}/02 phân công hướng dẫn ACTIVE. Theo Điều 16 khoản 2 điểm a QĐ 521/QĐ-HV, mỗi giảng viên chỉ được hướng dẫn tối đa 02 đề tài cùng thời gian.`,
        });
      }
    }

    const updatedAdvisor = await this.prisma.projectAdvisor.update({
      where: { advisorAssignmentId },
      data: {
        status: decision,
        replaceReason: decision === 'REJECTED' ? reason || 'Giảng viên từ chối lời mời hướng dẫn' : null,
        endedAt: decision === 'REJECTED' ? new Date() : null,
      },
    });
    await this.syncLecturerActiveCount(assignment.lecturerId);
    return updatedAdvisor;
  }

  async inviteMember(projectId: string, studentId: string, role = 'MEMBER', pct = 20, user?: any) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: { members: true },
    });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${projectId}`);

    if (user && user.roleCode !== 'ADMIN' && user.roleCode !== 'QLKHCN') {
      const isLead = project.members.some(
        (m) => m.studentId === user.studentId && (m.memberRole === 'LEAD' || m.memberRole === 'LEADER'),
      );
      if (!isLead) {
        throw new ForbiddenException('Chỉ Chủ nhiệm đề tài mới có quyền mời thêm thành viên vào nhóm');
      }
    }

    const activeMembers = project.members.filter((m) => m.confirmStatus !== 'DECLINED');

    if (activeMembers.length >= 5) {
      throw new BadRequestException('Mỗi đề tài NCKH sinh viên tối đa không quá 5 thành viên theo QĐ 521');
    }

    if (activeMembers.some((m) => m.studentId === studentId)) {
      throw new BadRequestException(`Sinh viên ${studentId} đã thuộc nhóm đề tài này`);
    }

    const targetPeriod = await this.prisma.nckhPeriod.findUnique({ where: { periodId: project.periodId } });
    const existingMembership = await this.prisma.projectMember.findFirst({
      where: {
        studentId,
        confirmStatus: { not: 'DECLINED' },
        project: {
          ...(targetPeriod ? { period: { academicYear: targetPeriod.academicYear } } : { periodId: project.periodId }),
          status: { notIn: ['REJECTED', 'CANCELLED'] },
        },
      },
      include: { project: true },
    });

    if (existingMembership) {
      throw new BadRequestException({
        code: 'STUDENT_PROJECT_LIMIT_EXCEEDED',
        message: `Sinh viên ${studentId} hiện đang có 01 đề tài ("${existingMembership.project.projectId}") trong năm học ${targetPeriod?.academicYear || ''}. Theo Điều 15 khoản 2 điểm a QĐ 521/QĐ-HV, mỗi sinh viên chỉ được tham gia tối đa 01 đề tài/năm học.`,
      });
    }

    const totalOtherPct = activeMembers.reduce((sum, m) => sum + Number(m.contributionPct || 0), 0);
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

  async respondMemberInvite(
    projectId: string,
    memberId: number,
    decision: 'ACCEPTED' | 'DECLINED',
    user?: any,
  ) {
    const member = await this.prisma.projectMember.findUnique({ where: { memberId } });
    if (!member || member.projectId !== projectId) {
      throw new NotFoundException('Không tìm thấy lời mời tham gia nhóm đề tài');
    }

    if (user && user.roleCode !== 'ADMIN') {
      if (user.roleCode !== 'STUDENT' || user.studentId !== member.studentId) {
        throw new ForbiddenException('Chỉ sinh viên được mời mới có quyền xác nhận hoặc từ chối tham gia nhóm');
      }
    }

    if (member.confirmStatus !== 'PENDING') {
      throw new BadRequestException(`Lời mời thành viên đã được xử lý (${member.confirmStatus})`);
    }

    return this.prisma.projectMember.update({
      where: { memberId },
      data: { confirmStatus: decision },
    });
  }

  async updateStatus(
    projectId: string,
    newStatus: string,
    reason?: string,
    user?: any,
    options?: { decisionNo?: string; approvedBudget?: number; officialLetterNo?: string },
  ) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: { budget: true, department: true },
    });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${projectId}`);

    const roleCode = user?.roleCode;
    const dataToUpdate: any = { status: newStatus };

    if (newStatus === 'FACULTY_APPROVED') {
      if (roleCode && !['FACULTY_SECRETARY', 'FACULTY_LEADER', 'ADMIN'].includes(roleCode)) {
        throw new ForbiddenException('Chỉ Thư ký Khoa / Lãnh đạo Khoa mới có quyền sơ tuyển đề tài cấp Khoa (DFD 3)');
      }
      if (roleCode && ['FACULTY_SECRETARY', 'FACULTY_LEADER'].includes(roleCode)) {
        await this.verifyFacultyDeptAccess(user, project.deptId, 'sơ tuyển đề tài');
      }

      dataToUpdate.prelimResult = 'APPROVED';

      if (!project.dossierId) {
        let dossier = await this.prisma.facultyDossier.findFirst({
          where: { deptId: project.deptId, periodId: project.periodId },
        });
        if (!dossier) {
          dossier = await this.prisma.facultyDossier.create({
            data: {
              deptId: project.deptId,
              periodId: project.periodId,
              officialLetterNo: options?.officialLetterNo || `CV-${project.department.deptCode}-${new Date().getFullYear()}`,
              reviewStatus: 'APPROVED',
            },
          });
        } else if (options?.officialLetterNo && dossier.officialLetterNo !== options.officialLetterNo) {
          dossier = await this.prisma.facultyDossier.update({
            where: { dossierId: dossier.dossierId },
            data: { officialLetterNo: options.officialLetterNo },
          });
        }
        dataToUpdate.dossierId = dossier.dossierId;
      } else if (options?.officialLetterNo) {
        await this.prisma.facultyDossier.update({
          where: { dossierId: project.dossierId },
          data: { officialLetterNo: options.officialLetterNo },
        });
      }

      if (project.budget) {
        await this.prisma.budget.update({
          where: { budgetId: project.budget.budgetId },
          data: {
            facultyProposed: project.budget.requestedAmount,
            status: 'FACULTY_PROPOSED',
          },
        });
      }
    } else if (newStatus === 'REJECTED') {
      if (roleCode && !['FACULTY_SECRETARY', 'FACULTY_LEADER', 'QLKHCN', 'BOARD', 'ADMIN'].includes(roleCode)) {
        throw new ForbiddenException('Bạn không có quyền từ chối đề tài ở giai đoạn này');
      }
      if (roleCode && ['FACULTY_SECRETARY', 'FACULTY_LEADER'].includes(roleCode)) {
        await this.verifyFacultyDeptAccess(user, project.deptId, 'từ chối đề tài');
      }

      dataToUpdate.prelimResult = 'REJECTED';

      if (project.budget) {
        await this.prisma.budget.update({
          where: { budgetId: project.budget.budgetId },
          data: {
            facultyProposed: 0,
            approvedAmount: 0,
            status: 'REJECTED',
          },
        });
      }
    } else if (newStatus === 'ONGOING') {
      if (roleCode && !['QLKHCN', 'BOARD', 'ADMIN'].includes(roleCode)) {
        throw new ForbiddenException('Chỉ P.QLKHCN hoặc Ban Giám Đốc mới có thẩm quyền phê duyệt giao đề tài (DFD 3)');
      }
      if (roleCode !== 'ADMIN' && project.status !== 'FACULTY_APPROVED') {
        throw new BadRequestException('Đề tài phải được Hội đồng Khoa sơ tuyển (Khoa đã duyệt) trước khi Học viện ban hành Quyết định giao');
      }

      const customDecisionNo = options?.decisionNo?.trim();
      const targetDecisionNo = customDecisionNo || undefined;

      if (targetDecisionNo) {
        let decision = await this.prisma.decision.findUnique({ where: { decisionNo: targetDecisionNo } });
        if (!decision) {
          decision = await this.prisma.decision.create({
            data: {
              periodId: project.periodId,
              decisionNo: targetDecisionNo,
              decisionType: 'ASSIGN',
              issuedDate: new Date(),
              totalBudget: options?.approvedBudget || project.budget?.facultyProposed || project.budget?.requestedAmount || 5000000,
            },
          });
        }
        dataToUpdate.decisionId = decision.decisionId;
      } else if (!project.decisionId) {
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
              totalBudget: options?.approvedBudget || project.budget?.requestedAmount || 5000000,
            },
          });
        }
        dataToUpdate.decisionId = decision.decisionId;
      }

      if (project.budget) {
        const finalBudget = Number(
          options?.approvedBudget ??
            (project.budget.approvedAmount && Number(project.budget.approvedAmount) > 0 ? project.budget.approvedAmount : undefined) ??
            project.budget.facultyProposed ??
            project.budget.requestedAmount ??
            5000000,
        );
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

      const projectSeminars = await this.prisma.seminar.findMany({ where: { projectId } });
      const hasOpenSeminar = projectSeminars.some((s) => s.status !== 'COMPLETED');
      const hasCompletedSeminar = projectSeminars.some((s) => s.status === 'COMPLETED');
      if (hasOpenSeminar || !hasCompletedSeminar) {
        throw new BadRequestException(
          'Đề tài bắt buộc phải hoàn thành Sinh hoạt khoa học / Hội thảo cấp Khoa (Mẫu 3.5) và chốt Biên bản trước khi nộp hồ sơ Nghiệm thu',
        );
      }
    }

    const updated = await this.prisma.project.update({
      where: { projectId },
      data: dataToUpdate,
      include: { advisors: true },
    });

    for (const adv of updated.advisors || []) {
      await this.syncLecturerActiveCount(adv.lecturerId);
    }

    if (user?.userId) {
      await this.prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: `UPDATE_PROJECT_STATUS_${newStatus}`,
          entity: 'projects',
          entityId: projectId,
          newValue: JSON.stringify({ status: newStatus, reason: reason || null }),
        },
      }).catch(() => { });
    }

    return updated;
  }
}
