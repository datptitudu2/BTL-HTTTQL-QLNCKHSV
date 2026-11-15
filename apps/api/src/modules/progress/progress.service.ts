import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  private readonly STAFF_ROLES = ['FACULTY_SECRETARY', 'FACULTY_LEADER', 'QLKHCN', 'ADMIN'];

  async getOverview(user?: any) {
    const activePeriod = await this.prisma.nckhPeriod.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        milestones: { orderBy: { dueDate: 'asc' } },
      },
    });

    const roleCode = user?.roleCode;
    if (roleCode === 'FINANCE' || roleCode === 'STUDENT_AFFAIRS') {
      return {
        period: activePeriod,
        milestones: activePeriod?.milestones || [],
        reports: [],
        seminars: [],
        changeRequests: [],
      };
    }

    let reportsWhere: any = {};
    let seminarsWhere: any = {};
    let changeRequestsWhere: any = {};

    if (roleCode === 'STUDENT') {
      const studentProjectFilter = {
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
      };
      const attendeeFilter = {
        members: {
          some: {
            OR: [
              ...(user?.userId ? [{ userId: user.userId }] : []),
              ...(user?.fullName ? [{ attendeeName: user.fullName }] : []),
            ],
          },
        },
      };
      reportsWhere = { project: studentProjectFilter };
      changeRequestsWhere = { project: studentProjectFilter };
      seminarsWhere = { OR: [{ project: studentProjectFilter }, attendeeFilter] };
    } else if (roleCode === 'LECTURER') {
      const lecturerProjectFilter = {
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
      };
      const attendeeFilter = {
        members: {
          some: {
            OR: [
              ...(user?.userId ? [{ userId: user.userId }] : []),
              ...(user?.fullName ? [{ attendeeName: user.fullName }] : []),
            ],
          },
        },
      };
      reportsWhere = { project: lecturerProjectFilter };
      changeRequestsWhere = { project: lecturerProjectFilter };
      seminarsWhere = { OR: [{ project: lecturerProjectFilter }, attendeeFilter] };
    } else if ((roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') && user?.userId) {
      const deptPositions = await this.prisma.deptPosition.findMany({
        where: { userId: user.userId, isActive: true },
        select: { deptId: true },
      });
      const deptIds = deptPositions.map((d) => d.deptId);
      if (deptIds.length > 0) {
        const deptFilter = { project: { deptId: { in: deptIds } } };
        reportsWhere = deptFilter;
        seminarsWhere = deptFilter;
        changeRequestsWhere = deptFilter;
      }
    }

    const [reports, seminars, changeRequests] = await Promise.all([
      this.prisma.progressReport.findMany({
        where: reportsWhere,
        include: {
          milestone: true,
          project: {
            include: {
              department: true,
              members: { include: { student: { include: { user: true } } } },
              advisors: { include: { lecturer: { include: { user: true } } } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.seminar.findMany({
        where: seminarsWhere,
        include: {
          members: { orderBy: { memberId: 'asc' } },
          project: {
            include: {
              department: true,
              members: { include: { student: { include: { user: true } } } },
              advisors: { include: { lecturer: { include: { user: true } } } },
            },
          },
        },
        orderBy: { heldAt: 'desc' },
      }),
      this.prisma.changeRequest.findMany({
        where: changeRequestsWhere,
        include: {
          approvals: { orderBy: { decidedAt: 'asc' } },
          project: {
            include: {
              department: true,
              members: { include: { student: { include: { user: true } } } },
              advisors: { include: { lecturer: { include: { user: true } } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      period: activePeriod,
      milestones: activePeriod?.milestones || [],
      reports,
      seminars,
      changeRequests,
    };
  }

  async submitReport(
    user: any,
    dto: { projectId: string; pmId: number; reportContent: string; productUrl?: string },
  ) {
    const project = await this.prisma.project.findUnique({
      where: { projectId: dto.projectId },
    });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${dto.projectId}`);
    if (!['ONGOING', 'APPROVED', 'OUTLINE_SUBMITTED'].includes(project.status)) {
      throw new BadRequestException('Đề tài không ở giai đoạn thực hiện nên không thể nộp thêm báo cáo tiến độ định kỳ');
    }

    if (user.roleCode === 'STUDENT') {
      const isMember = await this.prisma.projectMember.findFirst({
        where: { projectId: dto.projectId, student: { userId: user.userId } },
      });
      if (!isMember) {
        throw new ForbiddenException('Bạn chỉ được nộp báo cáo tiến độ cho đề tài nhóm mình');
      }
    }

    return this.prisma.progressReport.create({
      data: {
        projectId: dto.projectId,
        pmId: Number(dto.pmId),
        reportContent: dto.reportContent,
        productUrl: dto.productUrl || null,
      },
      include: { milestone: true },
    });
  }

  async reviewReport(
    reportId: number,
    user: any,
    dto: { assessment: 'PASS' | 'WARNING_DELAY'; advisorComment: string },
  ) {
    if (!['LECTURER', ...this.STAFF_ROLES].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ Giảng viên hướng dẫn hoặc Ban chủ nhiệm Khoa mới có quyền đánh giá tiến độ');
    }

    const existing = await this.prisma.progressReport.findUnique({ where: { reportId } });
    if (!existing) throw new NotFoundException('Không tìm thấy báo cáo tiến độ');

    return this.prisma.progressReport.update({
      where: { reportId },
      data: {
        assessment: dto.assessment,
        advisorComment: dto.advisorComment,
      },
    });
  }

  async createSeminar(
    user: any,
    dto: {
      projectId: string;
      planTitle: string;
      heldAt: string;
      location: string;
      meetingLink?: string;
      members?: Array<{ userId?: number; attendeeName: string; role: string; unit?: string; email?: string }>;
    },
  ) {
    if (!this.STAFF_ROLES.includes(user.roleCode)) {
      throw new ForbiddenException(
        'Theo quy trình DFD 4.4, chỉ Thư ký Khoa / Lãnh đạo Khoa / P.QLKHCN mới có quyền lập lịch Sinh hoạt khoa học & phát hành Thư mời',
      );
    }

    const project = await this.prisma.project.findUnique({
      where: { projectId: dto.projectId },
      include: {
        department: true,
        acceptance: true,
        period: { include: { milestones: true } },
        members: { include: { student: { include: { user: true } } } },
        advisors: { include: { lecturer: { include: { user: true } } } },
      },
    });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${dto.projectId}`);
    if (!['ONGOING', 'APPROVED', 'OUTLINE_SUBMITTED'].includes(project.status) || project.acceptance) {
      throw new BadRequestException(
        'Chỉ được lập lịch Hội thảo khoa học (Mẫu 3.5) cho đề tài đang thực hiện trước giai đoạn nộp hồ sơ Nghiệm thu',
      );
    }

    const acceptanceMilestone = project.period?.milestones?.find((m) => m.milestoneType === 'ACCEPTANCE');
    if (acceptanceMilestone && new Date(dto.heldAt) > new Date(acceptanceMilestone.dueDate)) {
      throw new BadRequestException(
        `Thời gian tổ chức Hội thảo khoa học phải diễn ra trước hạn nộp hồ sơ Nghiệm thu (${new Date(acceptanceMilestone.dueDate).toLocaleDateString('vi-VN')})`,
      );
    }

    const defaultMembers: Array<{
      userId?: number;
      attendeeName: string;
      role: string;
      unit?: string;
      email?: string;
      rsvpStatus: string;
    }> = [
      {
        userId: user.userId,
        attendeeName: user.fullName || 'Thư ký Khoa',
        role: 'SECRETARY',
        unit: project.department.deptName,
        email: user.email || undefined,
        rsvpStatus: 'ACCEPTED_ONSITE',
      },
      ...project.advisors.map((a) => ({
        userId: a.lecturer.user.userId,
        attendeeName: a.lecturer.user.fullName,
        role: 'ADVISOR',
        unit: project.department.deptName,
        email: a.lecturer.user.email,
        rsvpStatus: 'PENDING',
      })),
      ...project.members.map((m) => ({
        userId: m.student.user.userId,
        attendeeName: m.student.user.fullName,
        role: m.memberRole === 'LEAD' ? 'LEADER' : 'MEMBER',
        unit: project.department.deptName,
        email: m.student.user.email,
        rsvpStatus: 'PENDING',
      })),
    ];

    if (Array.isArray(dto.members)) {
      for (const extra of dto.members) {
        if (!defaultMembers.some((d) => (extra.userId && d.userId === extra.userId) || d.attendeeName === extra.attendeeName)) {
          defaultMembers.push({
            userId: extra.userId,
            attendeeName: extra.attendeeName,
            role: extra.role || 'ATTENDEE',
            unit: extra.unit,
            email: extra.email,
            rsvpStatus: 'PENDING',
          });
        }
      }
    }

    const invitationCode = `GM-${Math.floor(100 + Math.random() * 899)}/${project.department.deptCode}`;

    return this.prisma.seminar.create({
      data: {
        projectId: dto.projectId,
        planTitle: dto.planTitle,
        heldAt: new Date(dto.heldAt),
        location: dto.location,
        meetingLink: dto.meetingLink || 'https://meet.google.com/ptit-srms-seminar',
        invitationCode,
        status: 'PLANNED',
        members: {
          create: defaultMembers,
        },
      },
      include: {
        members: true,
        project: { include: { department: true } },
      },
    });
  }

  async sendInvitations(
    seminarId: number,
    user: any,
    dto?: { invitees?: Array<{ userId?: number; attendeeName: string; role?: string; unit?: string; email?: string }> },
  ) {
    if (!this.STAFF_ROLES.includes(user.roleCode)) {
      throw new ForbiddenException(
        'Sinh viên không có quyền phát hành Giấy mời hội thảo khoa học. Thư mời chỉ do Thư ký Khoa / Lãnh đạo Khoa / QLKHCN phát hành.',
      );
    }

    const seminar = await this.prisma.seminar.findUnique({
      where: { seminarId },
      include: { members: true, project: { include: { department: true } } },
    });
    if (!seminar) throw new NotFoundException('Không tìm thấy phiên sinh hoạt khoa học');
    if (seminar.status === 'COMPLETED' || ['SUBMITTED', 'ACCEPTED', 'REJECTED'].includes(seminar.project.status)) {
      throw new BadRequestException(
        'Hội thảo đã kết thúc hoặc đề tài đã chuyển sang giai đoạn nghiệm thu, không thể phát hành thêm Thư mời',
      );
    }

    if (Array.isArray(dto?.invitees) && dto.invitees.length > 0) {
      for (const inv of dto.invitees) {
        const exists = seminar.members.some(
          (m) => (inv.userId && m.userId === inv.userId) || m.attendeeName === inv.attendeeName,
        );
        if (!exists && inv.attendeeName?.trim()) {
          await this.prisma.seminarMember.create({
            data: {
              seminarId,
              userId: inv.userId || null,
              attendeeName: inv.attendeeName.trim(),
              role: inv.role || 'ATTENDEE',
              unit: inv.unit || seminar.project.department.deptName,
              email: inv.email || null,
              rsvpStatus: 'PENDING',
            },
          });
        }
      }
    }

    const updated = await this.prisma.seminar.update({
      where: { seminarId },
      data: {
        status: 'INVITED',
        invitationCode: seminar.invitationCode || `GM-${seminarId}/${seminar.project.department.deptCode}`,
      },
      include: { members: true, project: { include: { department: true } } },
    });

    // Phát hành thông báo thực vào Kho D9 cho tất cả đại biểu có tài khoản
    const notifData = updated.members
      .filter((m) => m.userId)
      .map((m) => ({
        userId: m.userId!,
        title: `Thư mời Sinh hoạt khoa học (${updated.invitationCode})`,
        content: `Mời đại biểu ${m.attendeeName} tham dự "${updated.planTitle || updated.project.titleVi}" lúc ${new Date(updated.heldAt).toLocaleString('vi-VN')} tại ${updated.location}.`,
        channel: 'WEB',
        type: 'SEMINAR',
        targetUrl: '/progress',
      }));

    if (notifData.length > 0) {
      await this.prisma.notification.createMany({ data: notifData });
    }

    return updated;
  }

  async respondRsvp(
    seminarId: number,
    user: any,
    rsvpStatus: 'ACCEPTED_ONSITE' | 'ACCEPTED_ONLINE' | 'DECLINED',
  ) {
    if (!['ACCEPTED_ONSITE', 'ACCEPTED_ONLINE', 'DECLINED'].includes(rsvpStatus)) {
      throw new BadRequestException('Trạng thái RSVP không hợp lệ');
    }

    const seminar = await this.prisma.seminar.findUnique({
      where: { seminarId },
      include: { members: true, project: true },
    });
    if (!seminar) throw new NotFoundException('Không tìm thấy phiên sinh hoạt khoa học');
    if (seminar.status === 'COMPLETED' || ['SUBMITTED', 'ACCEPTED', 'REJECTED'].includes(seminar.project.status)) {
      throw new BadRequestException('Phiên Sinh hoạt khoa học đã kết thúc, cổng xác nhận tham dự (RSVP) đã đóng');
    }

    const member = seminar.members.find(
      (m) => m.userId === user.userId || m.attendeeName === user.fullName,
    );

    if (member) {
      return this.prisma.seminarMember.update({
        where: { memberId: member.memberId },
        data: {
          userId: member.userId || user.userId,
          rsvpStatus,
          respondedAt: new Date(),
        },
      });
    }

    return this.prisma.seminarMember.create({
      data: {
        seminarId,
        userId: user.userId,
        attendeeName: user.fullName || user.username,
        role: user.roleCode === 'LECTURER' ? 'ATTENDEE' : user.roleCode,
        unit: 'Học viện PTIT',
        email: user.email || null,
        rsvpStatus,
        respondedAt: new Date(),
      },
    });
  }

  async saveMinutes(
    seminarId: number,
    user: any,
    dto: { feedback: string; discussion?: string; overallAssessment?: string; revisionRequests?: string; minutesFileUrl?: string },
  ) {
    if (!['LECTURER', ...this.STAFF_ROLES].includes(user.roleCode)) {
      throw new ForbiddenException('Chỉ Thư ký Khoa, Lãnh đạo Khoa hoặc GVHD được cập nhật Biên bản Mẫu 3.5');
    }

    const seminar = await this.prisma.seminar.findUnique({ where: { seminarId } });
    if (!seminar) throw new NotFoundException('Không tìm thấy phiên sinh hoạt khoa học');

    const completed = await this.prisma.seminar.update({
      where: { seminarId },
      data: {
        feedback: dto.feedback,
        discussion: dto.discussion || dto.feedback,
        overallAssessment: dto.overallAssessment || 'Đạt yêu cầu tiến độ và chất lượng học thuật cấp Khoa',
        revisionRequests: dto.revisionRequests || 'Hoàn thiện báo cáo tổng kết theo góp ý của Hội thảo',
        minutesFileUrl: dto.minutesFileUrl || `/storage/seminars/BB_${seminar.projectId}_Mau3.5.pdf`,
        status: 'COMPLETED',
      },
      include: { members: true },
    });

    await this.prisma.notification.updateMany({
      where: {
        type: 'SEMINAR',
        isConfirmed: false,
        OR: [
          { content: { contains: seminar.projectId } },
          ...(seminar.invitationCode ? [{ content: { contains: seminar.invitationCode } }] : []),
        ],
      },
      data: { isConfirmed: true },
    });

    return completed;
  }

  async createChangeRequest(
    user: any,
    dto: { projectId: string; requestType: string; reason: string; newDueDate?: string },
  ) {
    const project = await this.prisma.project.findUnique({ where: { projectId: dto.projectId } });
    if (!project) throw new NotFoundException(`Không tìm thấy đề tài ${dto.projectId}`);
    if (!['ONGOING', 'APPROVED', 'OUTLINE_SUBMITTED'].includes(project.status)) {
      throw new BadRequestException('Chỉ đề tài đang trong giai đoạn thực hiện mới được gửi đơn điều chỉnh / gia hạn');
    }

    if (user.roleCode === 'STUDENT') {
      const isMember = await this.prisma.projectMember.findFirst({
        where: { projectId: dto.projectId, student: { userId: user.userId } },
      });
      if (!isMember) {
        throw new ForbiddenException('Bạn chỉ có thể gửi đơn điều chỉnh cho đề tài mình tham gia');
      }
    }

    return this.prisma.changeRequest.create({
      data: {
        projectId: dto.projectId,
        requestType: dto.requestType,
        reason: dto.reason,
        newDueDate: dto.newDueDate ? new Date(dto.newDueDate) : null,
        resultStatus: 'PENDING',
      },
      include: { approvals: true },
    });
  }

  async approveChangeRequest(
    requestId: number,
    user: any,
    dto: { decision: 'APPROVED' | 'REJECTED'; mode?: 'DIRECT' | 'PROXY'; comment?: string },
  ) {
    const req = await this.prisma.changeRequest.findUnique({
      where: { requestId },
      include: { approvals: true },
    });
    if (!req) throw new NotFoundException('Không tìm thấy đơn điều chỉnh / gia hạn');

    let stage: 'ADVISOR' | 'FACULTY_LEADER' | 'QLKHCN';
    if (user.roleCode === 'LECTURER') stage = 'ADVISOR';
    else if (user.roleCode === 'FACULTY_LEADER' || user.roleCode === 'FACULTY_SECRETARY') stage = 'FACULTY_LEADER';
    else if (['QLKHCN', 'BOARD', 'ADMIN'].includes(user.roleCode)) stage = 'QLKHCN';
    else throw new ForbiddenException('Bạn không có quyền phê duyệt đơn điều chỉnh');

    if (stage === 'FACULTY_LEADER' && dto.decision === 'APPROVED') {
      const advisorOk = req.approvals.some((a) => a.stage === 'ADVISOR' && a.decision === 'APPROVED');
      if (!advisorOk) {
        throw new ConflictException('GVHD phải cho ý kiến đồng ý trước khi Lãnh đạo Khoa xác nhận đơn điều chỉnh');
      }
    }

    if (stage === 'QLKHCN' && dto.decision === 'APPROVED' && user.roleCode !== 'ADMIN') {
      const facultyOk = req.approvals.some((a) => a.stage === 'FACULTY_LEADER' && a.decision === 'APPROVED');
      if (!facultyOk) {
        throw new ConflictException('Lãnh đạo Khoa phải duyệt đơn điều chỉnh trước khi P.QLKHCN ban hành Quyết định');
      }
    }

    const approval = await this.prisma.requestApproval.create({
      data: {
        requestId,
        approverUserId: user.userId,
        stage,
        approvalMode: dto.mode || (user.roleCode === 'FACULTY_SECRETARY' ? 'PROXY' : 'DIRECT'),
        decision: dto.decision,
        comment: dto.comment || '',
      },
    });

    if (dto.decision === 'REJECTED') {
      await this.prisma.changeRequest.update({
        where: { requestId },
        data: { resultStatus: 'REJECTED' },
      });
    } else if (stage === 'QLKHCN' && dto.decision === 'APPROVED') {
      await this.prisma.changeRequest.update({
        where: { requestId },
        data: {
          resultStatus: 'APPROVED',
          decisionNo: `DC-${requestId}/${new Date().getFullYear()}/QĐ-QLKH`,
        },
      });
      if (req.requestType === 'CANCELLATION') {
        await this.prisma.project.update({
          where: { projectId: req.projectId },
          data: { status: 'CANCELLED' },
        });
      }
    }

    return approval;
  }
}

