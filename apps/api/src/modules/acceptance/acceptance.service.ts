import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AcceptanceService {
  constructor(private prisma: PrismaService) {}

  private sanitizeSheetsForUser(acc: any, user: any) {
    const roleCode = user?.roleCode;
    const isFinalized = Boolean(acc.approvalDocNo) || (acc.grade && acc.grade !== 'PENDING');

    if (roleCode === 'STUDENT') {
      if (!isFinalized) {
        return (acc.sheets || []).map((s: any) => ({
          sheetId: s.sheetId,
          cmId: s.cmId,
          hasSubmitted: true,
        }));
      }
      return acc.sheets;
    }

    if (roleCode === 'LECTURER' && !acc.approvalDocNo) {
      return (acc.sheets || []).map((s: any) => {
        const isOwnSheet =
          (user?.userId && s.councilMember?.lecturer?.userId === user.userId) ||
          (user?.lecturerId && s.councilMember?.lecturerId === user.lecturerId);
        if (isOwnSheet) return s;
        return {
          sheetId: s.sheetId,
          cmId: s.cmId,
          councilMember: s.councilMember,
          hasSubmitted: true,
        };
      });
    }

    return acc.sheets;
  }

  async getAllAcceptances(user?: any) {
    const roleCode = user?.roleCode;
    let whereClause: any = {};

    if (roleCode === 'STUDENT') {
      whereClause = {
        project: {
          members: {
            some: {
              student: {
                OR: [
                  ...(user?.userId ? [{ userId: user.userId }] : []),
                  ...(user?.studentId ? [{ studentId: user.studentId }] : []),
                ],
              },
            },
          },
        },
      };
    } else if (roleCode === 'LECTURER') {
      const lecturerOr = [
        ...(user?.userId ? [{ userId: user.userId }] : []),
        ...(user?.lecturerId ? [{ lecturerId: user.lecturerId }] : []),
      ];
      whereClause = {
        OR: [
          {
            council: {
              members: {
                some: {
                  lecturer: { OR: lecturerOr },
                },
              },
            },
          },
          {
            project: {
              advisors: {
                some: {
                  lecturer: { OR: lecturerOr },
                },
              },
            },
          },
        ],
      };
    } else if ((roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') && user?.userId) {
      const deptPositions = await this.prisma.deptPosition.findMany({
        where: { userId: user.userId, isActive: true },
        select: { deptId: true },
      });
      const deptIds = deptPositions.map((d) => d.deptId);
      if (deptIds.length > 0) {
        whereClause = { project: { deptId: { in: deptIds } } };
      }
    }

    const [acceptances, criteria] = await Promise.all([
      this.prisma.acceptance.findMany({
        where: whereClause,
        include: {
          project: {
            include: {
              department: true,
              documents: true,
              members: {
                include: { student: { include: { user: true } } },
              },
              advisors: {
                include: { lecturer: { include: { user: true } } },
              },
            },
          },
          council: {
            include: {
              members: {
                include: { lecturer: { include: { user: true } } },
              },
            },
          },
          sheets: {
            include: {
              councilMember: {
                include: { lecturer: { include: { user: true } } },
              },
              scores: {
                include: { criteria: true },
                orderBy: { criteria: { orderNo: 'asc' } },
              },
            },
            orderBy: { sheetId: 'asc' },
          },
        },
        orderBy: { defenseTime: 'desc' },
      }),
      this.prisma.evaluationCriteria.findMany({
        orderBy: { orderNo: 'asc' },
      }),
    ]);

    const scopedAcceptances = acceptances.map((acc) => ({
      ...acc,
      sheets: this.sanitizeSheetsForUser(acc, user),
    }));

    return { acceptances: scopedAcceptances, criteria };
  }

  async getCouncilByProject(projectId: string, user?: any) {
    const acc = await this.prisma.acceptance.findUnique({
      where: { projectId },
      include: {
        project: {
          include: {
            members: { include: { student: true } },
            advisors: { include: { lecturer: true } },
          },
        },
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
    });

    if (!acc) return null;

    if (user?.roleCode === 'STUDENT') {
      const isMember = acc.project.members.some(
        (m) => m.student.userId === user.userId || (user.studentId && m.studentId === user.studentId),
      );
      if (!isMember) {
        throw new ForbiddenException('Sinh viên chỉ được xem thông tin Hội đồng nghiệm thu của đề tài mình tham gia');
      }
    } else if (user?.roleCode === 'LECTURER') {
      const isCouncilMember = acc.council?.members?.some(
        (m) => m.lecturer.userId === user.userId || (user.lecturerId && m.lecturerId === user.lecturerId),
      );
      const isAdvisor = acc.project.advisors.some(
        (a) => a.lecturer.userId === user.userId || (user.lecturerId && a.lecturerId === user.lecturerId),
      );
      if (!isCouncilMember && !isAdvisor) {
        throw new ForbiddenException('Chỉ thành viên Hội đồng hoặc GVHD của đề tài mới có quyền xem chi tiết nghiệm thu này');
      }
    }

    return {
      ...acc,
      sheets: this.sanitizeSheetsForUser(acc, user),
    };
  }

  async createCouncil(projectId: string, user: any, dto: {
    councilName: string;
    decisionNo: string;
    defenseDate: string;
    location: string;
    members: { lecturerId: string; councilRole: string }[];
  }) {
    if (!['QLKHCN', 'FACULTY_LEADER', 'BOARD', 'ADMIN'].includes(user?.roleCode)) {
      throw new ForbiddenException('Chỉ P.QLKH&CN, Lãnh đạo Khoa hoặc Ban Giám Đốc mới có quyền thành lập Hội đồng nghiệm thu (DFD 5.2)');
    }

    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: { acceptance: true, seminars: true },
    });
    if (!project) {
      throw new NotFoundException(`Không tìm thấy đề tài ${projectId}`);
    }
    if (user?.roleCode === 'FACULTY_LEADER' && project.deptId) {
      const deptHasDedicatedStaff = await this.prisma.deptPosition.count({
        where: { deptId: project.deptId, isActive: true },
      });
      if (deptHasDedicatedStaff > 0) {
        const hasDeptPos = await this.prisma.deptPosition.findFirst({
          where: { userId: user.userId, deptId: project.deptId, isActive: true },
        });
        if (!hasDeptPos && user.deptId !== project.deptId) {
          throw new ForbiddenException('Bạn chỉ có quyền thành lập Hội đồng nghiệm thu cho đề tài thuộc Khoa của mình');
        }
      }
    }
    if (project.status !== 'SUBMITTED') {
      throw new BadRequestException('Đề tài phải ở trạng thái đã nộp báo cáo tổng kết (SUBMITTED) mới được thành lập Hội đồng nghiệm thu (DFD 5.1 → 5.2)');
    }
    if (project.seminars.some((s) => s.status !== 'COMPLETED') || !project.seminars.some((s) => s.status === 'COMPLETED')) {
      throw new BadRequestException('Hội thảo khoa học (Mẫu 3.5) phải được tổ chức và chốt Biên bản hoàn tất trước khi thành lập Hội đồng nghiệm thu');
    }
    const latestSeminar = project.seminars
      .filter((s) => s.status === 'COMPLETED')
      .sort((a, b) => new Date(b.heldAt).getTime() - new Date(a.heldAt).getTime())[0];
    if (latestSeminar && new Date(dto.defenseDate) <= new Date(latestSeminar.heldAt)) {
      throw new BadRequestException('Ngày bảo vệ Hội đồng Nghiệm thu phải diễn ra sau ngày tổ chức Hội thảo khoa học cấp Khoa');
    }
    if (project.acceptance?.councilId) {
      throw new BadRequestException(`Đề tài ${projectId} đã có Hội đồng nghiệm thu được thành lập`);
    }

    const members = Array.isArray(dto.members) ? dto.members : [];
    const uniqueLecturerIds = new Set(members.map((m) => m.lecturerId).filter(Boolean));
    if (uniqueLecturerIds.size < 3) {
      throw new BadRequestException('Hội đồng nghiệm thu phải có tối thiểu 03 thành viên giảng viên không trùng lặp');
    }

    const council = await this.prisma.council.create({
      data: {
        councilName: dto.councilName,
        decisionNo: dto.decisionNo,
        defenseDate: new Date(dto.defenseDate),
        location: dto.location,
        members: {
          create: members.map((m) => ({
            lecturerId: m.lecturerId,
            councilRole: m.councilRole,
          })),
        },
      },
      include: { members: true },
    });

    const acceptance = await this.prisma.acceptance.upsert({
      where: { projectId },
      update: {
        councilId: council.councilId,
        grade: 'PENDING',
      },
      create: {
        projectId,
        councilId: council.councilId,
        grade: 'PENDING',
      },
    });

    return { council, acceptance };
  }

  async submitScoreSheet(user: any, dto: {
    acceptanceId: number;
    cmId?: number;
    strengths: string;
    limitations: string;
    qaComment?: string;
    conclusionAwardRec?: boolean | string;
    scores: { criteriaId: number; score: number }[];
  }) {
    const lecturer = await this.prisma.lecturer.findFirst({
      where: { userId: user.userId },
    });

    const acceptance = await this.prisma.acceptance.findUnique({
      where: { acceptanceId: dto.acceptanceId },
      include: {
        project: { select: { periodId: true } },
        council: {
          include: { members: true },
        },
      },
    });

    if (!acceptance || !acceptance.councilId || !acceptance.council) {
      throw new NotFoundException('Hồ sơ nghiệm thu hoặc hội đồng không tồn tại');
    }

    if (acceptance.approvalDocNo) {
      throw new BadRequestException('Kết quả nghiệm thu đã được phê duyệt chính thức, không thể chỉnh sửa phiếu chấm');
    }

    const ownMember = lecturer
      ? acceptance.council.members.find((m) => m.lecturerId === lecturer.lecturerId)
      : undefined;

    if (!ownMember) {
      throw new ForbiddenException('Bạn không thuộc danh sách thành viên Hội đồng được thành lập cho đề tài này (DFD 5.3)');
    }

    if (dto.cmId && Number(dto.cmId) !== ownMember.cmId) {
      throw new ForbiddenException('Chỉ được phép chấm phiếu điểm bằng tư cách thành viên của chính mình trong Hội đồng');
    }

    const cmId = ownMember.cmId;

    // Kiểm tra trần điểm từng tiêu chí theo Điều 10 QĐ 521
    const periodId = acceptance.project?.periodId;
    const criteriaList = await this.prisma.evaluationCriteria.findMany(
      periodId ? { where: { periodId } } : undefined,
    );
    const effectiveCriteria = criteriaList.length > 0 ? criteriaList : await this.prisma.evaluationCriteria.findMany();
    const criteriaMap = new Map(effectiveCriteria.map((c) => [c.criteriaId, c]));

    for (const s of dto.scores) {
      const crit = criteriaMap.get(Number(s.criteriaId));
      const val = Number(s.score);
      if (!crit) {
        throw new BadRequestException(`Không tìm thấy tiêu chí đánh giá #${s.criteriaId}`);
      }
      if (Number.isNaN(val) || val < 0 || val > Number(crit.maxScore)) {
        throw new BadRequestException(
          `Điểm tiêu chí "${crit.title}" (${val}) phải nằm trong khoảng 0 đến ${Number(crit.maxScore)} điểm.`,
        );
      }
    }

    const totalRaw = dto.scores.reduce((sum, item) => sum + Number(item.score), 0);

    const existingSheet = await this.prisma.evaluationSheet.findFirst({
      where: { acceptanceId: dto.acceptanceId, cmId },
    });

    let sheet;
    if (existingSheet) {
      await this.prisma.sheetScore.deleteMany({ where: { sheetId: existingSheet.sheetId } });
      sheet = await this.prisma.evaluationSheet.update({
        where: { sheetId: existingSheet.sheetId },
        data: {
          strengths: dto.strengths,
          limitations: dto.limitations,
          qaNotes: dto.qaComment || '',
          qaComment: dto.qaComment || '',
          conclusionAwardRec:
            typeof dto.conclusionAwardRec === 'string'
              ? dto.conclusionAwardRec
              : dto.conclusionAwardRec
                ? 'Đề xuất khen thưởng cấp Học viện'
                : 'Đạt yêu cầu nghiệm thu',
          recommendAward: Boolean(dto.conclusionAwardRec),
          totalScore: totalRaw,
          submittedAt: new Date(),
          scoredAt: new Date(),
          scores: {
            create: dto.scores.map((s) => ({
              criteriaId: Number(s.criteriaId),
              score: Number(s.score),
            })),
          },
        },
        include: { scores: true },
      });
    } else {
      sheet = await this.prisma.evaluationSheet.create({
        data: {
          acceptanceId: dto.acceptanceId,
          cmId,
          strengths: dto.strengths,
          limitations: dto.limitations,
          qaNotes: dto.qaComment || '',
          qaComment: dto.qaComment || '',
          conclusionAwardRec:
            typeof dto.conclusionAwardRec === 'string'
              ? dto.conclusionAwardRec
              : dto.conclusionAwardRec
                ? 'Đề xuất khen thưởng cấp Học viện'
                : 'Đạt yêu cầu nghiệm thu',
          recommendAward: Boolean(dto.conclusionAwardRec),
          totalScore: totalRaw,
          submittedAt: new Date(),
          scoredAt: new Date(),
          scores: {
            create: dto.scores.map((s) => ({
              criteriaId: Number(s.criteriaId),
              score: Number(s.score),
            })),
          },
        },
        include: { scores: true },
      });
    }

    const updatedAcceptance = await this.recalculateAcceptanceGrade(dto.acceptanceId);

    return { sheet, acceptance: updatedAcceptance };
  }

  async recalculateAcceptanceGrade(acceptanceId: number) {
    const sheets = await this.prisma.evaluationSheet.findMany({
      where: { acceptanceId },
      include: { scores: true },
    });

    if (sheets.length === 0) return null;

    const sheetTotals = sheets.map((sheet) => ({
      sheetId: sheet.sheetId,
      total: sheet.scores.reduce((sum, item) => sum + Number(item.score), 0),
    }));

    const initialAvg = sheetTotals.reduce((sum, s) => sum + s.total, 0) / sheetTotals.length;

    // Thuật toán loại trừ điểm lệch > 15 điểm so với trung bình ban đầu (Điều 10 QĐ 521 / Mẫu 4.2)
    const validTotals: number[] = [];
    for (const s of sheetTotals) {
      const isOutlier = Math.abs(s.total - initialAvg) > 15;
      await this.prisma.evaluationSheet.update({
        where: { sheetId: s.sheetId },
        data: { isOutlier, totalScore: s.total },
      });
      if (!isOutlier) validTotals.push(s.total);
    }

    const finalScores = validTotals.length > 0 ? validTotals : sheetTotals.map((s) => s.total);
    const avgScore = Number((finalScores.reduce((sum, val) => sum + val, 0) / finalScores.length).toFixed(2));

    let grade = 'DAT';
    if (avgScore >= 90) grade = 'XUAT_SAC';
    else if (avgScore >= 80) grade = 'TOT';
    else if (avgScore >= 70) grade = 'KHA';
    else if (avgScore >= 50) grade = 'DAT';
    else grade = 'KHONG_DAT';

    return this.prisma.acceptance.update({
      where: { acceptanceId },
      data: { avgScore, grade },
    });
  }

  async approveAcceptance(acceptanceId: number, user: any, approvalDocNo?: string) {
    if (!['QLKHCN', 'BOARD', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ P.QLKHCN hoặc Ban Giám Đốc mới có quyền phê duyệt kết quả nghiệm thu (DFD 5.5)');
    }

    const acceptance = await this.prisma.acceptance.findUnique({
      where: { acceptanceId },
      include: {
        project: {
          include: {
            period: true,
            members: { include: { student: true } },
            advisors: { where: { status: 'ACTIVE' } },
          },
        },
        sheets: true,
      },
    });
    if (!acceptance) throw new NotFoundException('Không tìm thấy hồ sơ nghiệm thu');
    if (acceptance.sheets.length === 0 || !acceptance.avgScore) {
      throw new BadRequestException('Hội đồng chưa chấm đủ phiếu nghiệm thu');
    }

    const finalDocNo = approvalDocNo || `QĐ-NT-${acceptanceId}/${new Date().getFullYear()}`;
    const updated = await this.prisma.acceptance.update({
      where: { acceptanceId },
      data: {
        approvalDocNo: finalDocNo,
        minutesNo: acceptance.minutesNo || `BB-${acceptanceId}/2027`,
      },
    });

    await this.prisma.project.update({
      where: { projectId: acceptance.projectId },
      data: {
        status: acceptance.grade === 'KHONG_DAT' ? 'REJECTED' : 'ACCEPTED',
      },
    });

    // Tự động tính quyền lợi ĐRL (SV) & Giờ chuẩn (GV) nếu đạt từ Trung bình trở lên
    if (acceptance.grade && acceptance.grade !== 'KHONG_DAT') {
      const trainingScoreMap: Record<string, number> = {
        XUAT_SAC: 10,
        TOT: 8,
        KHA: 6,
        DAT: 4,
      };
      const trainingScore = trainingScoreMap[acceptance.grade] || 4;
      for (const m of acceptance.project.members) {
        const existingBonus = await this.prisma.studentBonus.findFirst({
          where: { studentId: m.studentId, projectId: acceptance.projectId },
        });
        if (!existingBonus) {
          await this.prisma.studentBonus.create({
            data: {
              studentId: m.studentId,
              projectId: acceptance.projectId,
              bonusPoints: 0,
              trainingScore,
              scholarshipPriority: ['XUAT_SAC', 'TOT'].includes(acceptance.grade),
              approvalStatus: 'PENDING',
            },
          });
        }
      }

      const hourMap: Record<string, number> = {
        XUAT_SAC: 25,
        TOT: 20,
        KHA: 15,
        DAT: 12,
      };
      const convertedHours = hourMap[acceptance.grade] || 12;
      for (const adv of acceptance.project.advisors) {
        const existingHour = await this.prisma.lecturerHour.findFirst({
          where: { lecturerId: adv.lecturerId, projectId: acceptance.projectId },
        });
        if (!existingHour) {
          await this.prisma.lecturerHour.create({
            data: {
              lecturerId: adv.lecturerId,
              projectId: acceptance.projectId,
              advisorAssignmentId: adv.advisorAssignmentId,
              academicYear: acceptance.project.period.academicYear,
              convertedHours,
              declarationStatus: 'PENDING',
            },
          });
        }
      }
    }

    return updated;
  }
}
