import api from './api';

export interface AppNotification {
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

const STORAGE_KEY = 'srms_notifications_db_v1';

// Dữ liệu mẫu ban đầu theo từng vai trò chuẩn ERD Kho D9 & DFD 8.0
const INITIAL_NOTIFICATIONS: Record<string, AppNotification[]> = {
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

function getStoredNotifications(): Record<string, AppNotification[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return INITIAL_NOTIFICATIONS;
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
}

function saveStoredNotifications(data: Record<string, AppNotification[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Lỗi khi lưu thông báo:', e);
  }
}

export const notificationService = {
  // Lấy danh sách thông báo theo vai trò (kết nối API hoặc fallback local store)
  async getNotifications(roleCode: string): Promise<AppNotification[]> {
    const allStored = getStoredNotifications();
    let notifs = allStored[roleCode] || allStored.STUDENT || [];

    try {
      const res = await api.get('/notifications', { params: { role: roleCode } });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        notifs = res.data;
        allStored[roleCode] = notifs;
        saveStoredNotifications(allStored);
      }
    } catch (e) {
      // Backend offline: sử dụng store local
    }

    return notifs;
  },

  // Đánh dấu 1 thông báo đã đọc
  async markAsRead(id: number, roleCode: string): Promise<void> {
    try {
      await api.post(`/notifications/${id}/read`);
    } catch (e) {
      // Offline fallback
    }

    const allStored = getStoredNotifications();
    const list = allStored[roleCode] || allStored.STUDENT || [];
    allStored[roleCode] = list.map((item) => (item.id === id ? { ...item, isRead: true } : item));
    saveStoredNotifications(allStored);
  },

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(roleCode: string): Promise<void> {
    try {
      await api.post('/notifications/read-all', { role: roleCode });
    } catch (e) {
      // Offline fallback
    }

    const allStored = getStoredNotifications();
    const list = allStored[roleCode] || allStored.STUDENT || [];
    allStored[roleCode] = list.map((item) => ({ ...item, isRead: true }));
    saveStoredNotifications(allStored);
  },
};

