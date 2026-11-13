import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OutlinesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.outline.findMany({
      include: {
        approvals: {
          orderBy: { decidedAt: 'desc' },
        },
        project: {
          include: {
            department: true,
            decision: true,
            members: {
              include: {
                student: { include: { user: true } },
              },
            },
            advisors: {
              include: {
                lecturer: { include: { user: true } },
              },
            },
          },
        },
      },
      orderBy: [{ submittedAt: 'desc' }, { versionNo: 'desc' }],
    });
  }

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
    const project = await this.prisma.project.findUnique({ where: { projectId } });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${projectId}`);
    if (project.status === 'PROPOSED' || project.status === 'REJECTED') {
      throw new BadRequestException('Đề tài chưa được duyệt giao thực hiện nên chưa thể nộp Đề cương Mẫu 2');
    }

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
        approvalStatus: 'PENDING',
      },
    });

    // Cập nhật thông tin chi tiết đề cương vào đề tài (Mẫu 2)
    const updateData: any = {};
    if (project.status === 'FACULTY_APPROVED') updateData.status = 'OUTLINE_SUBMITTED';
    if (details.titleEn) updateData.titleEn = details.titleEn;
    if (details.researchField) updateData.researchField = details.researchField;
    if (details.objectives) updateData.objectives = details.objectives;
    if (details.content) updateData.content = details.content;
    if (details.methodology) updateData.methodology = details.methodology;
    if (details.expectedResult) updateData.expectedResult = details.expectedResult;

    if (Object.keys(updateData).length > 0) {
      await this.prisma.project.update({
        where: { projectId: projectId },
        data: updateData,
      });
    }

    return outline;
  }

  async approveOutline(
    outlineId: number,
    user: any,
    decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED',
    comment?: string,
    mode: 'DIRECT' | 'PROXY' = 'DIRECT',
  ) {
    const outline = await this.prisma.outline.findUnique({
      where: { outlineId: outlineId },
      include: { project: true, approvals: true },
    });

    if (!outline) throw new NotFoundException('Không tìm thấy bản đề cương');

    if (!['LECTURER', 'FACULTY_LEADER', 'FACULTY_SECRETARY', 'ADMIN', 'QLKHCN'].includes(user.roleCode)) {
      throw new ForbiddenException('Bạn không có quyền phê duyệt đề cương Mẫu 2');
    }

    const advisorApproved = outline.approvals.some(
      (a) => a.role === 'ADVISOR' && a.decision === 'APPROVED',
    );

    const isLecturer = user.roleCode === 'LECTURER';
    const levelRole = isLecturer ? 'ADVISOR' : 'FACULTY_LEADER';

    if (levelRole === 'FACULTY_LEADER' && decision === 'APPROVED' && !advisorApproved && user.roleCode !== 'ADMIN') {
      throw new ConflictException({
        statusCode: 409,
        code: 'ADVISOR_NOT_APPROVED_YET',
        message: 'Giảng viên hướng dẫn chưa phê duyệt đề cương này. Lãnh đạo Khoa chỉ ký duyệt sau bước thẩm định của GVHD (DFD 4.1).',
      });
    }

    const approval = await this.prisma.outlineApproval.create({
      data: {
        outlineId: outlineId,
        approverUserId: user.userId,
        role: levelRole,
        mode: mode === 'PROXY' ? 'PROXY' : 'DIRECT',
        decision,
        comment: comment || '',
      },
    });

    let nextOutlineStatus = outline.approvalStatus;
    if (decision === 'REJECTED') {
      nextOutlineStatus = 'REJECTED';
    } else if (decision === 'REVISION_REQUIRED') {
      nextOutlineStatus = 'REVISION_REQUIRED';
    } else if (decision === 'APPROVED') {
      nextOutlineStatus = levelRole === 'ADVISOR' ? 'ADVISOR_APPROVED' : 'FACULTY_APPROVED';
    }

    await this.prisma.outline.update({
      where: { outlineId },
      data: {
        approvalStatus: nextOutlineStatus,
        ...(levelRole === 'ADVISOR' && comment ? { advisorComment: comment } : {}),
      },
    });

    if (decision === 'APPROVED' && levelRole === 'FACULTY_LEADER' && ['FACULTY_APPROVED', 'OUTLINE_SUBMITTED'].includes(outline.project.status)) {
      await this.prisma.project.update({
        where: { projectId: outline.projectId },
        data: { status: 'ONGOING' },
      });
    }

    return approval;
  }
}
