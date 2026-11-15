import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface NotificationItem {
  id: number;
  userId?: number;
  title: string;
  content: string;
  time: string;
  urgent: boolean;
  type: 'DEADLINE' | 'SEMINAR' | 'ACCEPTANCE' | 'BONUS' | 'GENERAL';
  targetUrl: string;
  isRead: boolean;
  channel: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  private mockRoleNotifications: Record<string, NotificationItem[]> = {
    STUDENT: [
      {
        id: 101,
        title: 'Nhắc kiểm tra tiến độ hoàn thiện Đề cương chi tiết (Mẫu 2)',
        content: 'Đề tài SV-2026-DTVT1-001 đã nộp Đề cương chi tiết (12 mục), đang chờ Giảng viên hướng dẫn thẩm định Cấp 1 trên Cổng SRMS.',
        time: 'Hôm nay 09:30',
        urgent: true,
        type: 'DEADLINE',
        targetUrl: '/outlines',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 102,
        title: 'Giấy mời tham dự Sinh hoạt Khoa học Bộ môn HTTT (Mẫu 3.5)',
        content: 'Khoa CNTT 1 phát hành Giấy mời số 132/GM-CNTT1 cho đề tài đang thực hiện SV-2026-CNTT1-002 vào 14:00 ngày 22/12/2026. Vui lòng xác nhận RSVP.',
        time: 'Hôm qua 15:45',
        urgent: false,
        type: 'SEMINAR',
        targetUrl: '/progress',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 104,
        title: 'Xác nhận cộng Điểm rèn luyện NCKH (+10 điểm)',
        content: 'Đề tài SV-2026-CNTT1-001 đã nghiệm thu Xuất sắc, hồ sơ đang chờ Phòng CT&CTSV đối soát cộng 10 điểm rèn luyện theo Điều 14 QĐ 521.',
        time: '05/11/2026',
        urgent: false,
        type: 'BONUS',
        targetUrl: '/awards',
        isRead: true,
        channel: 'IN_APP',
      },
    ],
    LECTURER: [
      {
        id: 201,
        title: 'Yêu cầu thẩm định Đề cương chi tiết Cấp 1 (Mẫu 2)',
        content: 'Sinh viên Trần Quốc Bảo (SV-2026-DTVT1-001) đã gửi bản thuyết minh Đề cương Mẫu 2. Kính mời GVHD vào thẩm định trước khi chuyển Lãnh đạo Khoa.',
        time: 'Hôm nay 08:15',
        urgent: true,
        type: 'DEADLINE',
        targetUrl: '/outlines',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 202,
        title: 'Phân công Thành viên Hội đồng Nghiệm thu 04 (Đề tài SV-2026-CNTT1-003)',
        content: 'Kính mời thành viên Hội đồng 04 vào chấm điểm độc lập 7 tiêu chí (Mẫu 4.1) cho đề tài SV-2026-CNTT1-003 (đã hoàn tất Hội thảo Mẫu 3.5).',
        time: 'Hôm qua 14:00',
        urgent: false,
        type: 'ACCEPTANCE',
        targetUrl: '/acceptance',
        isRead: false,
        channel: 'IN_APP',
      },
    ],
    FACULTY_LEADER: [
      {
        id: 301,
        title: 'Sơ tuyển đề xuất đề tài NCKH cấp Khoa (Mẫu 1)',
        content: 'Đề tài SV-2026-QTKD1-002 đang chờ Khoa sơ tuyển & lập Tờ trình Mẫu 1 gửi Phòng QLKH&CN.',
        time: 'Hôm nay 10:00',
        urgent: true,
        type: 'DEADLINE',
        targetUrl: '/projects',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 302,
        title: 'Ký duyệt Đề cương chi tiết Cấp 2 (SV-2026-CNTT1-002)',
        content: 'GVHD TS. Ngô Quốc Dũng đã thông qua Đề cương Mẫu 2 (Cấp 1). Kính trình Trưởng Khoa ký duyệt Cấp 2.',
        time: 'Hôm qua 16:30',
        urgent: false,
        type: 'DEADLINE',
        targetUrl: '/outlines',
        isRead: false,
        channel: 'IN_APP',
      },
    ],
    STUDENT_AFFAIRS: [
      {
        id: 401,
        title: 'Tiếp nhận Danh sách Đề tài nghiệm thu Xuất sắc & Tốt để xét ĐRL',
        content: 'P.QLKHCN đã chuyển biên bản nghiệm thu Mẫu 4.2 của 15 đề tài NCKH sinh viên đủ điều kiện cộng Điểm rèn luyện theo Điều 14 QĐ 521.',
        time: 'Hôm nay 08:30',
        urgent: true,
        type: 'BONUS',
        targetUrl: '/awards',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 402,
        title: 'Lịch họp Hội đồng xét Khen thưởng & Học bổng NCKH SV cấp Học viện',
        content: 'Phiên họp diễn ra lúc 10:00 ngày 11/11/2026 tại Phòng họp Ban Giám Đốc. Đề nghị P.CT&CTSV chuẩn bị bảng tổng hợp tiêu chí.',
        time: 'Hôm qua 11:00',
        urgent: false,
        type: 'GENERAL',
        targetUrl: '/calendar',
        isRead: false,
        channel: 'IN_APP',
      },
    ],
    FINANCE: [
      {
        id: 501,
        title: 'Hồ sơ đề nghị tạm ứng kinh phí NCKH Sinh viên đợt 1',
        content: 'Đã nhận 08 hồ sơ đề cương (Mẫu 2) kèm dự toán kinh phí 5.000.000 đ/đề tài đã được Lãnh đạo Khoa và P.QLKHCN phê duyệt.',
        time: 'Hôm nay 09:00',
        urgent: true,
        type: 'BONUS',
        targetUrl: '/budgets',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 502,
        title: 'Đối soát hóa đơn tài chính & Quyết toán kinh phí đề tài đạt',
        content: 'Lịch tiếp nhận và kiểm tra chứng từ gốc thanh quyết toán tại Phòng Kế toán Tổng hợp 105-A2 từ ngày 10/11/2026.',
        time: 'Hôm qua 14:30',
        urgent: false,
        type: 'GENERAL',
        targetUrl: '/calendar',
        isRead: true,
        channel: 'IN_APP',
      },
    ],
    QLKHCN: [
      {
        id: 601,
        title: 'Tổng hợp Thuyết minh đề cương chi tiết (Mẫu 2) toàn Học viện',
        content: 'Tỷ lệ nộp đề cương đạt 92% (46/50 đề tài). Cần đôn đốc các nhóm còn lại trước giờ khóa cổng 23:59 ngày 14/11/2026.',
        time: 'Hôm nay 07:45',
        urgent: true,
        type: 'DEADLINE',
        targetUrl: '/outlines',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 602,
        title: 'Dự thảo Quyết định giao đề tài NCKH Sinh viên năm học 2026-2027',
        content: 'Hồ sơ đã sẵn sàng trình Giám đốc Học viện ban hành Quyết định chính thức.',
        time: 'Hôm qua 16:00',
        urgent: false,
        type: 'ACCEPTANCE',
        targetUrl: '/acceptance',
        isRead: false,
        channel: 'IN_APP',
      },
    ],
  };

  async getUserNotifications(userId?: number, _roleCode?: string) {
    try {
      if (userId) {
        const fromDb = await this.prisma.notification.findMany({
          where: { userId },
          orderBy: { sentAt: 'desc' },
          take: 50,
        });
        // Trả về đúng danh sách thông báo của riêng user đó (kể cả khi rỗng = []),
        // tuyệt đối không fallback sang thông báo mẫu của vai trò khác hay sinh viên khác.
        return fromDb.map((n) => ({
          id: n.notifId,
          userId: n.userId,
          title: n.title,
          content: n.content,
          time: new Date(n.sentAt).toLocaleString('vi-VN'),
          urgent: Boolean(n.urgent),
          type: (n.type as NotificationItem['type']) || 'GENERAL',
          targetUrl: n.targetUrl || '/calendar',
          isRead: n.isConfirmed,
          channel: n.channel,
        }));
      }
    } catch (e) {
      // Fallback khi DB chưa kết nối
    }

    return [];
  }

  async markAsRead(notifId: number, userId?: number) {
    try {
      await this.prisma.notification.updateMany({
        where: userId ? { notifId, userId } : { notifId },
        data: { isConfirmed: true, readAt: new Date() },
      });
    } catch (e) {}

    // Cập nhật cả in-memory mock store
    Object.keys(this.mockRoleNotifications).forEach((k) => {
      this.mockRoleNotifications[k] = this.mockRoleNotifications[k].map((item) =>
        item.id === notifId ? { ...item, isRead: true } : item,
      );
    });

    return { success: true, notifId };
  }

  async markAllAsRead(roleCode?: string, userId?: number) {
    if (userId) {
      try {
        await this.prisma.notification.updateMany({
          where: { userId, isConfirmed: false },
          data: { isConfirmed: true, readAt: new Date() },
        });
      } catch (e) {}
    }
    const code = roleCode || 'STUDENT';
    if (this.mockRoleNotifications[code]) {
      this.mockRoleNotifications[code] = this.mockRoleNotifications[code].map((item) => ({
        ...item,
        isRead: true,
      }));
    }
    return { success: true };
  }

  async createNotification(dto: {
    userId: number;
    scheduleRef?: string;
    title: string;
    content: string;
    channel?: string;
    urgent?: boolean;
    type?: string;
    targetUrl?: string;
  }) {
    try {
      return await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          scheduleRef: dto.scheduleRef || '',
          title: dto.title,
          content: dto.content,
          channel: dto.channel || 'IN_APP',
          deliveryStatus: 'SENT',
          isConfirmed: false,
          urgent: Boolean(dto.urgent),
          type: dto.type || 'GENERAL',
          targetUrl: dto.targetUrl || '/calendar',
        },
      });
    } catch (e) {
      return { success: true, ...dto };
    }
  }
}
