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

  async getAll(user?: any) {
    const roleCode = user?.roleCode;
    let nominationWhere: any = {};
    let certificateWhere: any = {};
    let lecturerHourWhere: any = {};
    let studentBonusWhere: any = {};
    let skipLecturerHours = false;
    let skipStudentBonuses = false;

    if (roleCode === 'STUDENT') {
      const studentOr = [
        ...(user?.userId ? [{ userId: user.userId }] : []),
        ...(user?.studentId ? [{ studentId: user.studentId }] : []),
      ];
      const ownProjectFilter = { members: { some: { student: { OR: studentOr } } } };
      nominationWhere = { OR: [{ status: 'APPROVED' }, { project: ownProjectFilter }] };
      certificateWhere = { OR: [{ recipientUserId: user?.userId }, { project: ownProjectFilter }] };
      studentBonusWhere = { student: { OR: studentOr } };
      skipLecturerHours = true;
    } else if (roleCode === 'LECTURER') {
      const lecturerOr = [
        ...(user?.userId ? [{ userId: user.userId }] : []),
        ...(user?.lecturerId ? [{ lecturerId: user.lecturerId }] : []),
      ];
      const advisedProjectFilter = { advisors: { some: { lecturer: { OR: lecturerOr } } } };
      nominationWhere = { OR: [{ status: 'APPROVED' }, { project: advisedProjectFilter }] };
      certificateWhere = { OR: [{ recipientUserId: user?.userId }, { project: advisedProjectFilter }] };
      lecturerHourWhere = { lecturer: { OR: lecturerOr } };
      skipStudentBonuses = true;
    } else if ((roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') && user?.userId) {
      const deptPositions = await this.prisma.deptPosition.findMany({
        where: { userId: user.userId, isActive: true },
        select: { deptId: true },
      });
      const deptIds = deptPositions.map((d) => d.deptId);
      if (deptIds.length > 0) {
        const deptFilter = { project: { deptId: { in: deptIds } } };
        nominationWhere = deptFilter;
        certificateWhere = deptFilter;
        lecturerHourWhere = { OR: [deptFilter, { lecturer: { deptId: { in: deptIds } } }] };
        studentBonusWhere = { OR: [deptFilter, { student: { deptId: { in: deptIds } } }] };
      }
    } else if (roleCode === 'STUDENT_AFFAIRS') {
      skipLecturerHours = true;
    } else if (roleCode === 'FINANCE') {
      nominationWhere = { status: 'APPROVED' };
      skipLecturerHours = true;
      skipStudentBonuses = true;
      certificateWhere = { certId: -1 };
    }

    const [nominations, certificates, lecturerHours, studentBonuses] = await Promise.all([
      this.prisma.awardNomination.findMany({
        where: nominationWhere,
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
        where: {
          AND: [certificateWhere, { recipientType: 'STUDENT' }],
        },
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
      skipLecturerHours
        ? Promise.resolve([])
        : this.prisma.lecturerHour.findMany({
            where: lecturerHourWhere,
            include: {
              lecturer: { include: { user: true, department: true } },
              project: { include: { department: true, acceptance: true } },
            },
            orderBy: { hourId: 'desc' },
          }),
      skipStudentBonuses
        ? Promise.resolve([])
        : this.prisma.studentBonus.findMany({
            where: studentBonusWhere,
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
            period: true,
            members: { include: { student: true } },
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

    if (user.roleCode === 'FACULTY_SECRETARY' || user.roleCode === 'FACULTY_LEADER') {
      const deptPositions = await this.prisma.deptPosition.findMany({
        where: { userId: user.userId, isActive: true },
        select: { deptId: true },
      });
      const deptIds = deptPositions.map((d) => d.deptId);
      if (!deptIds.includes(project.deptId)) {
        throw new ForbiddenException('Chỉ được lập hồ sơ đề cử khen thưởng cho đề tài thuộc Khoa mình quản lý');
      }
    }

    if (!project.acceptance || !['XUAT_SAC', 'TOT', 'KHA'].includes(project.acceptance.grade || '')) {
      throw new BadRequestException(
        'Theo QĐ 521, đề tài đề cử khen thưởng phải có kết quả nghiệm thu đạt loại Khá trở lên.',
      );
    }

    const existingNom = await this.prisma.awardNomination.findFirst({
      where: {
        projectId: dto.projectId,
        awardLevel: dto.awardLevel || 'INSTITUTE',
      },
    });
    if (existingNom) {
      throw new BadRequestException('Đề tài này đã có hồ sơ đề cử ở cấp giải thưởng đã chọn');
    }

    const supportVal = dto.awardLevel === 'MINISTRY' ? dto.supportFund || 1000000 : dto.supportFund || 0;
    return this.prisma.awardNomination.create({
      data: {
        projectId: dto.projectId,
        awardLevel: dto.awardLevel || 'INSTITUTE',
        prizeGrade: dto.prizeGrade || 'SECOND',
        rewardAmount: dto.rewardAmount || 3000000,
        supportFund: supportVal,
        supportAmount: supportVal,
        qlkhReviewStatus: 'PENDING',
        approvalStatus: 'PENDING',
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

    const prizeGrade = dto?.prizeGrade || nom.prizeGrade || 'THIRD';
    const updated = await this.prisma.awardNomination.update({
      where: { nominationId },
      data: {
        qlkhReviewStatus: 'APPROVED',
        approvalStatus: 'APPROVED',
        status: 'APPROVED',
        prizeGrade,
        rewardDecisionNo: dto?.rewardDecisionNo || `QĐ-KT-${nominationId}/${new Date().getFullYear()}`,
        rewardAmount: dto?.rewardAmount !== undefined ? dto.rewardAmount : nom.rewardAmount,
      },
    });

    // Áp dụng cộng điểm học tập theo Điều 15.2.h QĐ 521 (Quốc tế: 3.0, 2.5, 2.0, 1.5; Trong nước: 0.4, 0.3, 0.2, 0.1)
    const isInternational = nom.awardLevel === 'INTERNATIONAL';
    let bonusPts = isInternational ? 1.5 : 0.1;
    const normalized = prizeGrade.trim().toUpperCase();
    if (normalized === 'FIRST' || normalized.includes('NHẤT')) bonusPts = isInternational ? 3.0 : 0.4;
    else if (normalized === 'SECOND' || normalized.includes('NHÌ')) bonusPts = isInternational ? 2.5 : 0.3;
    else if (normalized === 'THIRD' || normalized.includes('BA')) bonusPts = isInternational ? 2.0 : 0.2;

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
        members: {
          where: { confirmStatus: { not: 'DECLINED' } },
          include: { student: { include: { user: true } } },
        },
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

