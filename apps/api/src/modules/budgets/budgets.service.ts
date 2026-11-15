import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) { }

  async findAll(user?: any) {
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
      whereClause = {
        project: {
          advisors: {
            some: {
              lecturer: {
                OR: [
                  ...(user?.userId ? [{ userId: user.userId }] : []),
                  ...(user?.lecturerId ? [{ lecturerId: user.lecturerId }] : []),
                ],
              },
            },
          },
        },
      };
    } else if ((roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') && user?.userId) {
      const deptPositions = await this.prisma.deptPosition.findMany({
        where: { userId: user.userId, isActive: true },
        select: { deptId: true },
      });
      const deptIds = deptPositions.map((d) => d.deptId);
      if (deptIds.length === 0) return [];
      whereClause = { project: { deptId: { in: deptIds } } };
    } else if (roleCode === 'STUDENT_AFFAIRS') {
      return [];
    }

    return this.prisma.budget.findMany({
      where: whereClause,
      include: {
        project: {
          include: {
            department: true,
            acceptance: true,
            members: { include: { student: { include: { user: true } } } },
          },
        },
        settlements: {
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: { budgetId: 'asc' },
    });
  }

  async getBudgetByProject(projectId: string, user?: any) {
    const budget = await this.prisma.budget.findUnique({
      where: { projectId: projectId },
      include: {
        project: {
          include: {
            acceptance: true,
            department: true,
            members: { include: { student: true } },
            advisors: { include: { lecturer: true } },
          },
        },
        settlements: {
          orderBy: { submittedAt: 'desc' },
        },
      },
    });
    if (!budget) return null;

    const roleCode = user?.roleCode;
    if (roleCode === 'STUDENT') {
      const isMember = budget.project?.members?.some(
        (m) => m.student?.userId === user.userId || (user.studentId && m.studentId === user.studentId),
      );
      if (!isMember) {
        throw new ForbiddenException('Bạn không có quyền xem thông tin kinh phí của đề tài khác');
      }
    } else if (roleCode === 'LECTURER') {
      const isAdvisor = budget.project?.advisors?.some(
        (a) => a.lecturer?.userId === user.userId || (user.lecturerId && a.lecturerId === user.lecturerId),
      );
      if (!isAdvisor) {
        throw new ForbiddenException('Bạn chỉ xem được kinh phí của đề tài mình hướng dẫn');
      }
    } else if ((roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') && user?.userId) {
      const deptPositions = await this.prisma.deptPosition.findMany({
        where: { userId: user.userId, isActive: true },
        select: { deptId: true },
      });
      const deptIds = deptPositions.map((d) => d.deptId);
      if (deptIds.length === 0 || (budget.project?.deptId && !deptIds.includes(budget.project.deptId))) {
        throw new ForbiddenException('Bạn chỉ xem được kinh phí đề tài thuộc Khoa mình quản lý');
      }
    }

    return budget;
  }

  async addSettlement(
    budgetId: number,
    user: any,
    dto: {
      voucherNo: string;
      invoiceNo?: string;
      category?: string;
      description?: string;
      supplier?: string;
      amount: number;
      voucherFileUrl?: string;
    },
  ) {
    if (!['STUDENT', 'FACULTY_SECRETARY', 'ADMIN'].includes(user?.roleCode)) {
      throw new ForbiddenException('Chỉ Chủ nhiệm/Thành viên đề tài hoặc Thư ký Khoa mới có quyền kê khai chứng từ thanh quyết toán');
    }

    const budget = await this.prisma.budget.findUnique({
      where: { budgetId: budgetId },
      include: {
        settlements: true,
        project: {
          include: {
            members: { include: { student: true } },
          },
        },
      },
    });
    if (!budget) throw new NotFoundException('Không tìm thấy tài khoản kinh phí đề tài');

    if (budget.project?.status === 'REJECTED' || Number(budget.approvedAmount || 0) <= 0) {
      throw new BadRequestException('Đề tài chưa được phê duyệt cấp kinh phí nên chưa thể kê khai chứng từ');
    }

    if (user.roleCode === 'STUDENT') {
      const isMember = budget.project?.members?.some(
        (m) => m.student?.userId === user.userId || (user.studentId && m.studentId === user.studentId),
      );
      if (!isMember) {
        throw new ForbiddenException('Sinh viên chỉ được kê khai chứng từ thanh quyết toán cho đề tài nhóm mình');
      }
    } else if (user.roleCode === 'FACULTY_SECRETARY') {
      const deptPositions = await this.prisma.deptPosition.findMany({
        where: { userId: user.userId, isActive: true },
        select: { deptId: true },
      });
      const deptIds = deptPositions.map((d) => d.deptId);
      if (!budget.project?.deptId || !deptIds.includes(budget.project.deptId)) {
        throw new ForbiddenException('Thư ký Khoa chỉ được kê khai chứng từ hộ đề tài thuộc Khoa mình quản lý');
      }
    }

    const amount = Number(dto.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Số tiền quyết toán phải lớn hơn 0');
    }

    const totalCurrent = budget.settlements.reduce((sum, s) => sum + Number(s.amount), 0);
    const approvedLimit = Number(budget.approvedAmount);
    if (approvedLimit > 0 && totalCurrent + amount > approvedLimit) {
      throw new BadRequestException(
        `Tổng tiền kê khai (${(totalCurrent + amount).toLocaleString('vi-VN')}đ) vượt quá kinh phí được duyệt (${approvedLimit.toLocaleString('vi-VN')}đ)`,
      );
    }

    return this.prisma.settlement.create({
      data: {
        budgetId: budgetId,
        voucherNo: dto.voucherNo,
        invoiceNo: dto.invoiceNo || null,
        category: dto.category || 'Chi vật tư & thực nghiệm',
        description: dto.description || '',
        supplier: dto.supplier || '',
        amount,
        voucherFileUrl: dto.voucherFileUrl || `/storage/vouchers/${dto.voucherNo}.pdf`,
        facultyConfirmed: false,
      },
    });
  }

  async confirmByFaculty(settlementId: number, user: any) {
    if (!['FACULTY_SECRETARY', 'FACULTY_LEADER', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ Thư ký Khoa hoặc Lãnh đạo Khoa mới có quyền xác nhận chứng từ hoàn thành sản phẩm');
    }

    const existing = await this.prisma.settlement.findUnique({
      where: { settlementId },
      include: { budget: { include: { project: true } } },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy chứng từ thanh quyết toán');

    if (user.roleCode === 'FACULTY_SECRETARY' || user.roleCode === 'FACULTY_LEADER') {
      const deptPositions = await this.prisma.deptPosition.findMany({
        where: { userId: user.userId, isActive: true },
        select: { deptId: true },
      });
      const deptIds = deptPositions.map((d) => d.deptId);
      if (!existing.budget?.project?.deptId || !deptIds.includes(existing.budget.project.deptId)) {
        throw new ForbiddenException('Chỉ được xác nhận chứng từ cho đề tài thuộc Khoa mình quản lý');
      }
    }

    return this.prisma.settlement.update({
      where: { settlementId },
      data: { facultyConfirmed: true },
    });
  }

  async settleByFinance(settlementId: number, user: any) {
    if (!['FINANCE', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ Phòng Tài chính - Kế toán (P.TCKT) mới có quyền phê duyệt chi quyết toán');
    }

    const settlement = await this.prisma.settlement.findUnique({
      where: { settlementId },
      include: {
        budget: {
          include: {
            settlements: true,
            project: {
              include: { acceptance: true },
            },
          },
        },
      },
    });
    if (!settlement) throw new NotFoundException('Không tìm thấy chứng từ thanh quyết toán');

    if (!settlement.facultyConfirmed) {
      throw new BadRequestException('Chứng từ chưa được Khoa xác nhận hoàn thành sản phẩm trước khi quyết toán (DFD 6.6)');
    }

    const acceptance = settlement.budget.project.acceptance;
    if (!acceptance || !acceptance.grade || ['PENDING', 'KHONG_DAT'].includes(acceptance.grade)) {
      throw new BadRequestException(
        'Theo Điều 5.2.b QĐ 521/QĐ-HV, chỉ được giải ngân quyết toán sau khi đề tài có kết quả nghiệm thu đạt từ Đạt trở lên.',
      );
    }

    const updated = await this.prisma.settlement.update({
      where: { settlementId },
      data: { settledAt: new Date() },
    });

    const settledSum = settlement.budget.settlements.reduce(
      (sum, s) => (s.settledAt || s.settlementId === settlementId ? sum + Number(s.amount) : sum),
      0,
    );
    const approvedAmount = Number(settlement.budget.approvedAmount);
    if (approvedAmount > 0 && settledSum >= approvedAmount) {
      await this.prisma.budget.update({
        where: { budgetId: settlement.budgetId },
        data: { status: 'SETTLED' },
      });
    } else if (settledSum > 0) {
      await this.prisma.budget.update({
        where: { budgetId: settlement.budgetId },
        data: { status: 'PARTIALLY_SETTLED' },
      });
    }

    return updated;
  }
}
