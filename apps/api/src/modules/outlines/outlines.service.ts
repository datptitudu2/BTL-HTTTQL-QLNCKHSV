import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OutlinesService {
  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: string) {
    return this.prisma.outline.findMany({
      where: { projectId: projectId },
      include: {
        approvals: true,
      },
      orderBy: { versionNo: 'desc' },
    });
  }

  async submitOutline(projectId: string, payload: any) {
    const fileUrl = typeof payload === 'string' ? payload : payload?.fileUrl;
    const details = typeof payload === 'object' && payload !== null ? payload : {};

    const latest = await this.prisma.outline.findFirst({
      where: { projectId: projectId },
      orderBy: { versionNo: 'desc' },
    });

    const nextVersion = (latest?.versionNo || 0) + 1;
    const finalFileUrl =
      fileUrl || `/storage/outlines/${projectId}_v${nextVersion}.pdf`;

    const outline = await this.prisma.outline.create({
      data: {
        projectId: projectId,
        versionNo: nextVersion,
        fileUrl: finalFileUrl,
      },
    });

    // Cập nhật thông tin chi tiết đề cương vào đề tài (Mẫu 2)
    const updateData: any = { status: 'OUTLINE_SUBMITTED' };
    if (details.titleEn) updateData.titleEn = details.titleEn;
    if (details.researchField) updateData.researchField = details.researchField;
    if (details.objectives) updateData.objectives = details.objectives;
    if (details.content) updateData.content = details.content;
    if (details.methodology) updateData.methodology = details.methodology;
    if (details.expectedResult) updateData.expectedResult = details.expectedResult;

    await this.prisma.project.update({
      where: { projectId: projectId },
      data: updateData,
    });

    return outline;
  }

  async approveOutline(outlineId: number, user: any, decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED', comment?: string) {
    const outline = await this.prisma.outline.findUnique({
      where: { outlineId: outlineId },
      include: { project: true },
    });

    if (!outline) throw new NotFoundException('Không tìm thấy bản đề cương');

    const role = user.roleCode === 'LECTURER' ? 'ADVISOR' : 'FACULTY_LEADER';

    const approval = await this.prisma.outlineApproval.create({
      data: {
        outlineId: outlineId,
        approverUserId: user.userId,
        role: role,
        mode: 'DIRECT',
        decision,
        comment: comment || '',
      },
    });

    if (decision === 'APPROVED' && (user.roleCode === 'FACULTY_LEADER' || user.roleCode === 'ADMIN')) {
      await this.prisma.project.update({
        where: { projectId: outline.projectId },
        data: { status: 'ONGOING' },
      });
    }

    return approval;
  }
}
