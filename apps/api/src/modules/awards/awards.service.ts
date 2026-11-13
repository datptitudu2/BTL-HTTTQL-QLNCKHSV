import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AwardsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const [nominations, certificates, lecturerHours, studentBonuses] = await Promise.all([
      this.prisma.awardNomination.findMany({
        include: {
          project: {
            include: {
              department: true,
              acceptance: true,
              members: { include: { student: { include: { user: true } } } },
              advisors: { include: { lecturer: { include: { user: true } } } },
            },
          },
        },
        orderBy: { nominationId: 'desc' },
      }),
      this.prisma.certificate.findMany({
        include: {
          recipient: true,
          project: {
            include: {
              department: true,
              acceptance: true,
            },
          },
        },
        orderBy: { issuedDate: 'desc' },
      }),
      this.prisma.lecturerHour.findMany({
        include: {
          lecturer: { include: { user: true, department: true } },
          project: { include: { department: true, acceptance: true } },
        },
        orderBy: { hourId: 'desc' },
      }),
      this.prisma.studentBonus.findMany({
        include: {
          student: { include: { user: true, department: true } },
          project: { include: { department: true, acceptance: true } },
        },
        orderBy: { bonusId: 'desc' },
      }),
    ]);

    return {
      nominations,
      certificates,
      lecturerHours,
      studentBonuses,
    };
  }

  async verifyCertificate(certCode: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { certCode },
      include: {
        recipient: true,
        project: {
          include: {
            department: true,
            acceptance: true,
          },
        },
      },
    });
    if (!cert) throw new NotFoundException(`Không tìm thấy Giấy chứng nhận số "${certCode}"`);
    return cert;
  }

  async createNomination(
    user: any,
    dto: {
      projectId: string;
      awardLevel: 'INSTITUTE' | 'MINISTRY';
      prizeGrade?: string;
      rewardAmount?: number;
      supportFund?: number;
    },
  ) {
    if (!['FACULTY_SECRETARY', 'FACULTY_LEADER', 'QLKHCN', 'BOARD', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ Khoa hoặc P.QLKHCN mới có quyền lập hồ sơ đề cử khen thưởng Mẫu 5');
    }

    const project = await this.prisma.project.findUnique({
      where: { projectId: dto.projectId },
      include: { acceptance: true },
    });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${dto.projectId}`);

    if (!project.acceptance || !['XUAT_SAC', 'TOT', 'KHA'].includes(project.acceptance.grade || '')) {
      throw new BadRequestException(
        'Theo QĐ 521, đề tài đề cử khen thưởng phải có kết quả nghiệm thu đạt loại Khá trở lên.',
      );
    }

    return this.prisma.awardNomination.create({
      data: {
        projectId: dto.projectId,
        awardLevel: dto.awardLevel || 'INSTITUTE',
        prizeGrade: dto.prizeGrade || 'Đề xuất Giải Nhì',
        rewardAmount: dto.rewardAmount || 3000000,
        supportFund: dto.awardLevel === 'MINISTRY' ? dto.supportFund || 5000000 : dto.supportFund || 0,
        status: 'PENDING',
      },
    });
  }

  async approveNomination(
    nominationId: number,
    user: any,
    dto?: { prizeGrade?: string; rewardDecisionNo?: string; rewardAmount?: number },
  ) {
    if (!['QLKHCN', 'BOARD', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ P.QLKHCN hoặc Ban Giám Đốc mới có quyền phê duyệt Giải thưởng');
    }

    const nom = await this.prisma.awardNomination.findUnique({
      where: { nominationId },
      include: { project: { include: { members: true } } },
    });
    if (!nom) throw new NotFoundException('Không tìm thấy hồ sơ đề cử khen thưởng');

    const prizeGrade = dto?.prizeGrade || nom.prizeGrade || 'Giải Ba';
    const updated = await this.prisma.awardNomination.update({
      where: { nominationId },
      data: {
        status: 'APPROVED',
        prizeGrade,
        rewardDecisionNo: dto?.rewardDecisionNo || `QĐ-KT-${nominationId}/${new Date().getFullYear()}`,
        rewardAmount: dto?.rewardAmount !== undefined ? dto.rewardAmount : nom.rewardAmount,
      },
    });

    // Áp dụng cộng điểm học tập theo Điều 15.2.h QĐ 521 (Trong nước: Nhất +0.4, Nhì +0.3, Ba +0.2, KK +0.1)
    let bonusPts = 0.1;
    const normalized = prizeGrade.toLowerCase();
    if (normalized.includes('nhất')) bonusPts = 0.4;
    else if (normalized.includes('nhì')) bonusPts = 0.3;
    else if (normalized.includes('ba')) bonusPts = 0.2;

    for (const m of nom.project.members) {
      const existing = await this.prisma.studentBonus.findFirst({
        where: { studentId: m.studentId, projectId: nom.projectId },
      });
      if (existing) {
        await this.prisma.studentBonus.update({
          where: { bonusId: existing.bonusId },
          data: { bonusPoints: bonusPts, scholarshipPriority: true },
        });
      }
    }

    return updated;
  }

  async issueCertificates(user: any, projectId: string) {
    if (!['QLKHCN', 'BOARD', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ P.QLKHCN hoặc Ban Giám Đốc mới có quyền cấp Giấy chứng nhận số');
    }

    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: {
        acceptance: true,
        members: { include: { student: { include: { user: true } } } },
        advisors: { where: { status: 'ACTIVE' }, include: { lecturer: { include: { user: true } } } },
      },
    });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${projectId}`);

    const grade = project.acceptance?.grade;
    if (!grade || !['XUAT_SAC', 'TOT', 'KHA'].includes(grade)) {
      throw new BadRequestException(
        'Theo Điều 15.2.e QĐ 521/QĐ-HV, chỉ cấp Giấy chứng nhận tham gia NCKH cho đề tài đạt kết quả từ Khá (70 điểm) trở lên.',
      );
    }

    const created: any[] = [];
    let seq = 1;

    for (const m of project.members) {
      const exists = await this.prisma.certificate.findFirst({
        where: { projectId, recipientUserId: m.student.userId },
      });
      if (!exists) {
        const cert = await this.prisma.certificate.create({
          data: {
            projectId,
            recipientUserId: m.student.userId,
            recipientType: 'STUDENT',
            certCode: `CN-${projectId}-SV${String(seq++).padStart(2, '0')}`,
            grade,
          },
        });
        created.push(cert);
      }
    }

    for (const adv of project.advisors) {
      const exists = await this.prisma.certificate.findFirst({
        where: { projectId, recipientUserId: adv.lecturer.userId },
      });
      if (!exists) {
        const cert = await this.prisma.certificate.create({
          data: {
            projectId,
            recipientUserId: adv.lecturer.userId,
            recipientType: 'ADVISOR',
            certCode: `CN-${projectId}-GV01`,
            grade,
          },
        });
        created.push(cert);
      }
    }

    return created;
  }

  async approveStudentBonus(bonusId: number, user: any, decisionNotice?: string) {
    if (!['STUDENT_AFFAIRS', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ Phòng CT&CTSV mới có quyền phê duyệt cộng Điểm rèn luyện & Học bổng');
    }

    const existing = await this.prisma.studentBonus.findUnique({ where: { bonusId } });
    if (!existing) throw new NotFoundException('Không tìm thấy bản ghi quyền lợi sinh viên');

    return this.prisma.studentBonus.update({
      where: { bonusId },
      data: {
        approvalStatus: 'APPROVED',
        decisionNotice: decisionNotice || `TB-CTSV-${bonusId}/${new Date().getFullYear()}`,
        approvedBy: user.fullName || 'Phòng CT&CTSV',
        approvedAt: new Date(),
      },
    });
  }

  async confirmLecturerHour(hourId: number, user: any) {
    if (!['QLKHCN', 'BOARD', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ P.QLKHCN mới có quyền chốt giờ chuẩn NCKH giảng viên');
    }

    const existing = await this.prisma.lecturerHour.findUnique({ where: { hourId } });
    if (!existing) throw new NotFoundException('Không tìm thấy kê khai giờ chuẩn NCKH');

    return this.prisma.lecturerHour.update({
      where: { hourId },
      data: { declarationStatus: 'CONFIRMED' },
    });
  }
}
