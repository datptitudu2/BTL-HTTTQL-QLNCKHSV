import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AcceptanceService {
  constructor(private prisma: PrismaService) {}

  async getAllAcceptances() {
    const [acceptances, criteria] = await Promise.all([
      this.prisma.acceptance.findMany({
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

    return { acceptances, criteria };
  }

  async getCouncilByProject(projectId: string) {
    return this.prisma.acceptance.findUnique({
      where: { projectId },
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
    });
  }

  async createCouncil(projectId: string, dto: {
    councilName: string;
    decisionNo: string;
    defenseDate: string;
    location: string;
    members: { lecturerId: string; councilRole: string }[];
  }) {
    const council = await this.prisma.council.create({
      data: {
        councilName: dto.councilName,
        decisionNo: dto.decisionNo,
        defenseDate: new Date(dto.defenseDate),
        location: dto.location,
        members: {
          create: dto.members.map((m) => ({
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
    if (!['LECTURER', 'FACULTY_LEADER', 'QLKHCN', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ thành viên Hội đồng đánh giá mới có quyền chấm điểm');
    }

    const lecturer = await this.prisma.lecturer.findFirst({
      where: { userId: user.userId },
    });

    const acceptance = await this.prisma.acceptance.findUnique({
      where: { acceptanceId: dto.acceptanceId },
      include: {
        council: {
          include: { members: true },
        },
      },
    });

    if (!acceptance || !acceptance.councilId || !acceptance.council) {
      throw new NotFoundException('Hồ sơ nghiệm thu hoặc hội đồng không tồn tại');
    }

    let cmId: number | undefined = dto.cmId ? Number(dto.cmId) : undefined;
    if (!cmId && lecturer) {
      const cm = acceptance.council.members.find((m) => m.lecturerId === lecturer.lecturerId);
      if (cm) cmId = cm.cmId;
    }

    if (!cmId && acceptance.council.members.length > 0 && ['QLKHCN', 'ADMIN', 'FACULTY_LEADER'].includes(user.roleCode)) {
      cmId = acceptance.council.members[0].cmId;
    }

    if (!cmId) {
      throw new BadRequestException('Bạn không thuộc danh sách thành viên Hội đồng đánh giá');
    }

    // Kiểm tra trần điểm từng tiêu chí theo Điều 10 QĐ 521
    const criteriaList = await this.prisma.evaluationCriteria.findMany();
    const criteriaMap = new Map(criteriaList.map((c) => [c.criteriaId, c]));

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
          recommendAward: Boolean(dto.conclusionAwardRec),
          totalScore: totalRaw,
          submittedAt: new Date(),
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
          recommendAward: Boolean(dto.conclusionAwardRec),
          totalScore: totalRaw,
          submittedAt: new Date(),
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
      const isOutlier = sheetTotals.length >= 3 && Math.abs(s.total - initialAvg) > 15;
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
              creditBonus: acceptance.grade === 'XUAT_SAC' ? 3 : 2,
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
