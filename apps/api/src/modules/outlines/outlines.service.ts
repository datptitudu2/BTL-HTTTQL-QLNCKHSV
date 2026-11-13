import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OutlinesService {
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
      if (deptIds.length > 0) {
        whereClause = { project: { deptId: { in: deptIds } } };
      }
    } else if (roleCode === 'FINANCE' || roleCode === 'STUDENT_AFFAIRS') {
      return [];
    }

    return this.prisma.outline.findMany({
      where: whereClause,
      include: {
        approvals: {
          orderBy: { decidedAt: 'desc' },
        },
        project: {
          include: {
            department: true,
            decision: true,
            budget: true,
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

  async findByProject(projectId: string, user?: any) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: {
        members: { include: { student: true } },
        advisors: { include: { lecturer: true } },
      },
    });
    if (!project) return [];

    const roleCode = user?.roleCode;
    if (roleCode === 'STUDENT') {
      const isMember = project.members.some(
        (m) => m.student?.userId === user.userId || (user.studentId && m.studentId === user.studentId),
      );
      if (!isMember) throw new ForbiddenException('Bạn không có quyền xem đề cương của đề tài khác');
    } else if (roleCode === 'LECTURER') {
      const isAdvisor = project.advisors.some(
        (a) => a.lecturer?.userId === user.userId || (user.lecturerId && a.lecturerId === user.lecturerId),
      );
      if (!isAdvisor) throw new ForbiddenException('Bạn chỉ xem được đề cương của đề tài mình hướng dẫn');
    }

    return this.prisma.outline.findMany({
      where: { projectId: projectId },
      include: {
        approvals: true,
      },
      orderBy: { versionNo: 'desc' },
    });
  }

  async submitOutline(projectId: string, payload: any, user?: any) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: { members: { include: { student: true } } },
    });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${projectId}`);
    if (user?.roleCode === 'STUDENT') {
      const isMember = project.members.some(
        (m) => m.student?.userId === user.userId || (user.studentId && m.studentId === user.studentId),
      );
      if (!isMember) {
        throw new ForbiddenException('Sinh viên chỉ được nộp Đề cương Mẫu 2 cho đề tài nhóm mình');
      }
    }
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
      include: {
        project: {
          include: {
            advisors: {
              include: { lecturer: true },
            },
          },
        },
        approvals: true,
      },
    });

    if (!outline) throw new NotFoundException('Không tìm thấy bản đề cương');

    if (!['LECTURER', 'FACULTY_LEADER', 'FACULTY_SECRETARY', 'ADMIN'].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ Giảng viên hướng dẫn (Cấp 1) hoặc Lãnh đạo Khoa (Cấp 2) mới có quyền phê duyệt đề cương Mẫu 2');
    }

    const advisorApproved = outline.approvals.some(
      (a) => a.role === 'ADVISOR' && a.decision === 'APPROVED',
    );

    const isLecturer = user.roleCode === 'LECTURER';
    if (isLecturer) {
      const isProjectAdvisor = outline.project.advisors.some(
        (a) => a.lecturer.userId === user.userId || (user.lecturerId && a.lecturerId === user.lecturerId),
      );
      if (!isProjectAdvisor) {
        throw new ForbiddenException('Chỉ Giảng viên hướng dẫn được phân công cho đề tài này mới có quyền thẩm định Cấp 1');
      }
      if (outline.approvalStatus === 'ADVISOR_APPROVED' || outline.approvalStatus === 'FACULTY_APPROVED') {
        throw new BadRequestException('Đề cương này đã được Giảng viên hướng dẫn thẩm định đạt trước đó');
      }
    }

    const levelRole = isLecturer ? 'ADVISOR' : 'FACULTY_LEADER';

    if (levelRole === 'FACULTY_LEADER' && outline.approvalStatus === 'FACULTY_APPROVED') {
      throw new BadRequestException('Đề cương này đã được Lãnh đạo Khoa phê duyệt 2 cấp');
    }

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
