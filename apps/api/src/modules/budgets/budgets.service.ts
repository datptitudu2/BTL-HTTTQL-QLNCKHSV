import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async getBudgetByProject(projectId: string) {
    return this.prisma.budget.findUnique({
      where: { projectId: projectId },
      include: {
        settlements: {
          orderBy: { settledAt: 'desc' },
        },
      },
    });
  }

  async addSettlement(budgetId: number, dto: {
    voucherNo: string;
    amount: number;
    voucherFileUrl?: string;
    facultyConfirmed?: boolean;
  }) {
    const budget = await this.prisma.budget.findUnique({
      where: { budgetId: budgetId },
    });
    if (!budget) throw new NotFoundException('Không tìm thấy tài khoản kinh phí đề tài');

    return this.prisma.settlement.create({
      data: {
        budgetId: budgetId,
        voucherNo: dto.voucherNo,
        amount: dto.amount,
        voucherFileUrl: dto.voucherFileUrl || '',
        facultyConfirmed: dto.facultyConfirmed ?? true,
      },
    });
  }
}
