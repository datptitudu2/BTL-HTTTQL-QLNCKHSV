import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PeriodsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.nckhPeriod.findMany({
      include: {
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        criteria: {
          orderBy: { orderNo: 'asc' },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const period = await this.prisma.nckhPeriod.findUnique({
      where: { periodId: id },
      include: {
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        criteria: {
          orderBy: { orderNo: 'asc' },
        },
        projects: {
          select: {
            projectId: true,
            titleVi: true,
            status: true,
          },
        },
      },
    });
    if (!period) throw new NotFoundException('Không tìm thấy đợt NCKH');
    return period;
  }

  async getActivePeriod() {
    const period = await this.prisma.nckhPeriod.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        criteria: {
          orderBy: { orderNo: 'asc' },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    if (period) return period;

    // Trả về đợt mới nhất nếu chưa có đợt nào có status ACTIVE
    return this.prisma.nckhPeriod.findFirst({
      include: {
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        criteria: {
          orderBy: { orderNo: 'asc' },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async create(data: {
    academicYear: string;
    periodName: string;
    startDate: string | Date;
    endDate: string | Date;
    quotaProjects?: number;
    totalBudgetLimit?: number;
    status?: string;
  }) {
    return this.prisma.nckhPeriod.create({
      data: {
        academicYear: data.academicYear,
        periodName: data.periodName,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        quotaProjects: data.quotaProjects || 150,
        totalBudgetLimit: data.totalBudgetLimit || 800000000,
        status: data.status || 'ACTIVE',
        milestones: {
          create: [
            {
              milestoneType: 'OUTLINE',
              milestoneName: 'Hạn nộp Đề cương chi tiết (Mẫu 2)',
              dueDate: new Date(new Date(data.startDate).getTime() + 45 * 24 * 60 * 60 * 1000),
              remindDaysBefore: 5,
            },
            {
              milestoneType: 'PROGRESS_1',
              milestoneName: 'Báo cáo tiến độ lần 1 & Hội thảo cấp Khoa (Mẫu 3.5)',
              dueDate: new Date(new Date(data.startDate).getTime() + 110 * 24 * 60 * 60 * 1000),
              remindDaysBefore: 5,
            },
            {
              milestoneType: 'PROGRESS_2',
              milestoneName: 'Nộp sản phẩm & Báo cáo tổng kết (Mẫu 3.1 - 3.4)',
              dueDate: new Date(new Date(data.startDate).getTime() + 210 * 24 * 60 * 60 * 1000),
              remindDaysBefore: 5,
            },
            {
              milestoneType: 'ACCEPTANCE',
              milestoneName: 'Hội đồng nghiệm thu bảo vệ & Quyết toán kinh phí',
              dueDate: new Date(data.endDate),
              remindDaysBefore: 7,
            },
          ],
        },
        criteria: {
          create: [
            { orderNo: 1, title: 'Tổng quan tình hình nghiên cứu thuộc lĩnh vực đề tài', maxScore: 10 },
            { orderNo: 2, title: 'Tính cấp thiết, mục tiêu và cách tiếp cận của đề tài', maxScore: 15 },
            { orderNo: 3, title: 'Phương pháp nghiên cứu và kỹ thuật triển khai', maxScore: 15 },
            { orderNo: 4, title: 'Kết quả, sản phẩm và mức độ hoàn thành nội dung', maxScore: 35 },
            { orderNo: 5, title: 'Khả năng ứng dụng thực tiễn hoặc công bố khoa học', maxScore: 15 },
            { orderNo: 6, title: 'Bố cục và hình thức trình bày báo cáo tổng kết', maxScore: 5 },
            { orderNo: 7, title: 'Kỹ năng thuyết trình và trả lời chất vấn của Hội đồng', maxScore: 5 },
          ],
        },
      },
      include: {
        milestones: true,
        criteria: true,
      },
    });
  }

  async update(id: number, data: {
    academicYear?: string;
    periodName?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    quotaProjects?: number;
    totalBudgetLimit?: number;
    status?: string;
  }) {
    const updateData: any = {};
    if (data.academicYear) updateData.academicYear = data.academicYear;
    if (data.periodName) updateData.periodName = data.periodName;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.quotaProjects !== undefined) updateData.quotaProjects = Number(data.quotaProjects);
    if (data.totalBudgetLimit !== undefined) updateData.totalBudgetLimit = Number(data.totalBudgetLimit);
    if (data.status) updateData.status = data.status;

    return this.prisma.nckhPeriod.update({
      where: { periodId: id },
      data: updateData,
      include: {
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        criteria: {
          orderBy: { orderNo: 'asc' },
        },
      },
    });
  }

  async updateMilestone(pmId: number, data: {
    milestoneName?: string;
    dueDate?: string | Date;
    remindDaysBefore?: number;
  }) {
    const updateData: any = {};
    if (data.milestoneName) updateData.milestoneName = data.milestoneName;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.remindDaysBefore !== undefined) updateData.remindDaysBefore = Number(data.remindDaysBefore);

    return this.prisma.periodMilestone.update({
      where: { pmId },
      data: updateData,
    });
  }
}
