import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.budget.findMany({
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

  async getBudgetByProject(projectId: string) {
    return this.prisma.budget.findUnique({
      where: { projectId: projectId },
      include: {
        project: { include: { acceptance: true, department: true } },
        settlements: {
          orderBy: { submittedAt: 'desc' },
        },
      },
    });
  }

  async addSettlement(
    budgetId: number,
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
    const budget = await this.prisma.budget.findUnique({
      where: { budgetId: budgetId },
      include: { settlements: true },
    });
    if (!budget) throw new NotFoundException('Không tìm thấy tài khoản kinh phí đề tài');

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
    if (!['FACULTY_SECRETARY', 'FACULTY_LEADER', 'QLKHCN', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ Thư ký Khoa hoặc Lãnh đạo Khoa mới có quyền xác nhận chứng từ hoàn thành sản phẩm');
    }

    const existing = await this.prisma.settlement.findUnique({ where: { settlementId } });
    if (!existing) throw new NotFoundException('Không tìm thấy chứng từ thanh quyết toán');

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
    if (Number(settlement.budget.approvedAmount) > 0 && settledSum >= Number(settlement.budget.approvedAmount)) {
      await this.prisma.budget.update({
        where: { budgetId: settlement.budgetId },
        data: { status: 'SETTLED' },
      });
    }

    return updated;
  }
}
