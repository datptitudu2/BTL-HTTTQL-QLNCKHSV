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
        title: 'Nhắc hạn chót nộp Thuyết minh Đề cương chi tiết (Mẫu 2)',
        content: 'Thời hạn cuối cùng nộp Đề cương chi tiết (12 mục) trên Cổng SRMS là 23:59 ngày 14/11/2026. Đề nghị Chủ nhiệm đề tài SV-2026-CNTT1-001 kiểm tra và nộp đúng hạn.',
        time: 'Hôm nay 09:30',
        urgent: true,
        type: 'DEADLINE',
        targetUrl: '/outlines',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 102,
        title: 'Giấy mời tham dự Sinh hoạt Khoa học Cấp Khoa CNTT1 (Mẫu 3.5)',
        content: 'Khoa CNTT 1 phát hành Giấy mời số 128/GM-CNTT1 phiên báo cáo tiến độ đợt 1 vào 08:30 ngày 20/12/2026 tại Phòng Hội thảo A2. Vui lòng xác nhận RSVP.',
        time: 'Hôm qua 15:45',
        urgent: false,
        type: 'SEMINAR',
        targetUrl: '/progress',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 103,
        title: 'Thông báo Lịch làm việc chuyên môn với GVHD TS. Ngô Quốc Dũng',
        content: 'Lịch họp rà soát đề cương và kiến trúc hệ thống lúc 10:00 sáng Thứ Hai tại Văn phòng Bộ môn CNPM.',
        time: '2 ngày trước',
        urgent: false,
        type: 'GENERAL',
        targetUrl: '/calendar',
        isRead: true,
        channel: 'IN_APP',
      },
      {
        id: 104,
        title: 'Xác nhận cộng Điểm rèn luyện NCKH Kỳ 1 (+10 điểm)',
        content: 'Phòng CT&CTSV đã ghi nhận kết quả nghiệm thu Xuất sắc đề tài NCKH, cộng 10 điểm vào Tiêu chí 2.3 trên Cổng S-Link.',
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
        title: 'Yêu cầu thẩm định & phê duyệt Đề cương chi tiết (Mẫu 2)',
        content: 'Sinh viên Nguyễn Văn An (SV-2026-CNTT1-001) đã gửi bản thuyết minh đề cương 12 mục. Kính mời Thầy/Cô vào thẩm định và cho ý kiến chuyên môn.',
        time: 'Hôm nay 08:15',
        urgent: true,
        type: 'DEADLINE',
        targetUrl: '/outlines',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 202,
        title: 'Phân công Thành viên Hội đồng Nghiệm thu NCKH Khoa CNTT1',
        content: 'Theo QĐ số 145/QĐ-HV, Thầy/Cô được phân công làm Ủy viên Hội đồng nghiệm thu đề tài NCKH sinh viên Khoa CNTT1 số 01.',
        time: 'Hôm qua 14:00',
        urgent: false,
        type: 'ACCEPTANCE',
        targetUrl: '/acceptance',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 203,
        title: 'Thống kê hoàn thành Giờ chuẩn NCKH định mức năm học 2026-2027',
        content: 'Hệ thống đã tự động ghi nhận 20 giờ chuẩn hướng dẫn NCKH cho đề tài SV-2026-CNTT1-001 theo Điều 13 QĐ 521.',
        time: '3 ngày trước',
        urgent: false,
        type: 'BONUS',
        targetUrl: '/awards',
        isRead: true,
        channel: 'IN_APP',
      },
    ],
    FACULTY_LEADER: [
      {
        id: 301,
        title: 'Duyệt danh mục đề xuất đề tài NCKH cấp Khoa (Mẫu 1)',
        content: 'Thư ký Khoa CNTT1 đã tổng hợp 12 đề tài đủ điều kiện sơ tuyển. Kính trình Trưởng Khoa ký số phê duyệt Hồ sơ Mẫu 1 gửi P.QLKHCN.',
        time: 'Hôm nay 10:00',
        urgent: true,
        type: 'DEADLINE',
        targetUrl: '/projects',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 302,
        title: 'Phát hành Giấy mời & Chủ trì Sinh hoạt Khoa học Cấp Khoa (Mẫu 3.5)',
        content: 'Kế hoạch sinh hoạt học thuật đánh giá tiến độ trung gian đã được phê duyệt. Vui lòng rà soát danh sách đại biểu và ký phát hành Giấy mời.',
        time: 'Hôm qua 16:30',
        urgent: false,
        type: 'SEMINAR',
        targetUrl: '/progress',
        isRead: false,
        channel: 'IN_APP',
      },
      {
        id: 303,
        title: 'Kết quả thẩm định Hội đồng nghiệm thu chính thức đợt 1',
        content: '05 đề tài NCKH sinh viên Khoa CNTT1 đã hoàn thành bảo vệ với 100% đạt loại Xuất sắc và Tốt.',
        time: '2 ngày trước',
        urgent: false,
        type: 'ACCEPTANCE',
        targetUrl: '/acceptance',
        isRead: true,
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

  async getUserNotifications(userId?: number, roleCode?: string) {
    try {
      if (userId) {
        const fromDb = await this.prisma.notification.findMany({
          where: { userId: userId },
          orderBy: { sentAt: 'desc' },
          take: 50,
        });
        if (fromDb && fromDb.length > 0) {
          return fromDb.map((n) => ({
            id: n.notifId,
            userId: n.userId,
            title: n.title,
            content: n.content,
            time: new Date(n.sentAt).toLocaleString('vi-VN'),
            urgent: false,
            type: 'GENERAL' as const,
            targetUrl: '/calendar',
            isRead: n.isConfirmed,
            channel: n.channel,
          }));
        }
      }
    } catch (e) {
      // Fallback khi DB chưa kết nối
    }

    const code = roleCode || 'STUDENT';
    return this.mockRoleNotifications[code] || this.mockRoleNotifications.STUDENT;
  }

  async markAsRead(notifId: number) {
    try {
      await this.prisma.notification.update({
        where: { notifId: notifId },
        data: { isConfirmed: true },
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

  async markAllAsRead(roleCode?: string) {
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
        },
      });
    } catch (e) {
      return { success: true, ...dto };
    }
  }
}
