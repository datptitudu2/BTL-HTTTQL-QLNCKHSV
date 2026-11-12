import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AcceptanceService {
  constructor(private prisma: PrismaService) {}

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
    strengths: string;
    limitations: string;
    qaComment?: string;
    conclusionAwardRec?: string;
    scores: { criteriaId: number; score: number }[];
  }) {
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

    let cmId: number | undefined;
    if (lecturer) {
      const cm = acceptance.council.members.find((m) => m.lecturerId === lecturer.lecturerId);
      if (cm) cmId = cm.cmId;
    }

    if (!cmId && acceptance.council.members.length > 0) {
      cmId = acceptance.council.members[0].cmId;
    }

    if (!cmId) {
      throw new BadRequestException('Bạn không thuộc danh sách thành viên Hội đồng đánh giá');
    }

    const totalRaw = dto.scores.reduce((sum, item) => sum + Number(item.score), 0);

    const sheet = await this.prisma.evaluationSheet.create({
      data: {
        acceptanceId: dto.acceptanceId,
        cmId: cmId,
        strengths: dto.strengths,
        limitations: dto.limitations,
        qaNotes: dto.qaComment || '',
        recommendAward: Boolean(dto.conclusionAwardRec),
        totalScore: totalRaw,
        submittedAt: new Date(),
        scores: {
          create: dto.scores.map((s) => ({
            criteriaId: s.criteriaId,
            score: s.score,
          })),
        },
      },
      include: {
        scores: true,
      },
    });

    await this.recalculateAcceptanceGrade(dto.acceptanceId);

    return sheet;
  }

  async recalculateAcceptanceGrade(acceptanceId: number) {
    const sheets = await this.prisma.evaluationSheet.findMany({
      where: { acceptanceId },
      include: { scores: true },
    });

    if (sheets.length === 0) return;

    const totalScores = sheets.map((sheet) => {
      return sheet.scores.reduce((sum, item) => sum + Number(item.score), 0);
    });

    const avgScore = totalScores.reduce((sum, val) => sum + val, 0) / totalScores.length;

    let grade = 'DAT';
    if (avgScore >= 90) grade = 'XUAT_SAC';
    else if (avgScore >= 80) grade = 'TOT';
    else if (avgScore >= 70) grade = 'KHA';
    else if (avgScore >= 50) grade = 'DAT';
    else grade = 'KHONG_DAT';

    const updated = await this.prisma.acceptance.update({
      where: { acceptanceId },
      data: {
        avgScore: avgScore,
        grade,
      },
    });

    await this.prisma.project.update({
      where: { projectId: updated.projectId },
      data: { status: 'ACCEPTED' },
    });

    return updated;
  }
}
