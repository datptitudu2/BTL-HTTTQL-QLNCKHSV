import { Injectable } from '@nestjs/common';

export interface CalendarEventDto {
  id?: string;
  title: string;
  type: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  regulatoryBasis?: string;
  participants?: string;
  projectId?: string;
  note?: string;
  dayIndex: number;
  startHour: number;
  durationHours: number;
  targetRoles: string[];
  scopeLevel: string;
  broadcastBy?: string;
}

@Injectable()
export class ScheduleService {
  // Bộ dữ liệu khởi tạo chuẩn ERD & QĐ 521 theo tuần NCKH
  private defaultEvents: CalendarEventDto[] = [
    // 1. LỊCH CHUNG TOÀN HỌC VIỆN (ÁP XUỐNG TẤT CẢ)
    {
      id: 'nckh_e4',
      title: 'Tập huấn Quy chế NCKH Sinh viên & Hướng dẫn số hóa biểu mẫu QĐ 521 - P.QLKHCN',
      type: 'Sinh hoạt KH',
      startDate: '12/11/2026',
      startTime: '14:00',
      endDate: '12/11/2026',
      endTime: '16:30',
      location: 'Hội trường lớn Nhà A2 & Trực tuyến MS Teams',
      regulatoryBasis: 'Kế hoạch phổ biến quy chế NCKH năm học 2026 - 2027',
      participants: 'Lãnh đạo P.QLKHCN, Giảng viên hướng dẫn & Toàn thể sinh viên NCKH',
      projectId: 'Toàn thể các đề tài NCKH sinh viên năm học 2026-2027',
      note: 'Hướng dẫn quy trình nghiệm thu theo QĐ 521, nguyên tắc loại trừ độ lệch > 15 điểm và chữ ký số chuẩn ISO',
      dayIndex: 3,
      startHour: 14,
      durationHours: 3,
      targetRoles: ['ALL'],
      scopeLevel: 'Toàn Học viện',
      broadcastBy: 'Phòng QLKH&CN & Ban Giám Đốc ban hành',
    },
    {
      id: 'nckh_e6',
      title: 'Hạn chót Nộp Thuyết minh Đề cương chi tiết (Mẫu 2 - 12 mục) lên Cổng trực tuyến SRMS',
      type: 'Mốc hạn NCKH',
      startDate: '14/11/2026',
      startTime: '14:00',
      endDate: '14/11/2026',
      endTime: '23:59',
      location: 'Cổng Thông tin Quản lý Đề tài NCKH Sinh viên PTIT S-Link (Online)',
      regulatoryBasis: 'Mốc hạn bắt buộc QĐ 521 - Hệ thống tự động khóa cổng nộp lúc 23:59',
      participants: 'Toàn thể Chủ nhiệm đề tài & Giảng viên hướng dẫn xác nhận',
      projectId: 'SV-2026-CNTT1-001',
      note: 'Kiểm tra đầy đủ 12 mục đề cương và chữ ký điện tử số hóa trước khi khóa sổ thẩm định',
      dayIndex: 5,
      startHour: 14,
      durationHours: 3,
      targetRoles: ['ALL'],
      scopeLevel: 'Toàn Học viện',
      broadcastBy: 'Phòng QLKH&CN ban hành toàn trường',
    },
    // 2. LỊCH CẤP KHOA CNTT1
    {
      id: 'nckh_e2',
      title: 'Phiên họp Hội đồng Thẩm định Thuyết minh Đề cương NCKH Sinh viên đợt 1 (Mẫu 2)',
      type: 'Hội đồng thẩm định',
      startDate: '10/11/2026',
      startTime: '14:00',
      endDate: '10/11/2026',
      endTime: '17:00',
      location: 'Phòng họp Hội đồng số 1, Tầng 2 Nhà A2',
      regulatoryBasis: 'Thẩm định đề cương nghiên cứu theo QĐ 521/QĐ-HV',
      participants: 'Hội đồng thẩm định Khoa CNTT1 (03 thành viên) & Các nhóm đề tài',
      projectId: 'Danh mục đề tài NCKH Khoa CNTT1 năm học 2026-2027',
      note: 'Đánh giá tính cấp thiết, mục tiêu, phương pháp triển khai và định mức kinh phí 5.000.000 đ',
      dayIndex: 1,
      startHour: 14,
      durationHours: 3,
      targetRoles: ['FACULTY_LEADER', 'FACULTY_SECRETARY', 'LECTURER', 'STUDENT'],
      scopeLevel: 'Khoa CNTT1',
      broadcastBy: 'Ban Chủ nhiệm Khoa CNTT1',
    },
    {
      id: 'nckh_e5',
      title: 'Sinh hoạt Khoa học Cấp Khoa CNTT1 (Mẫu 3.5 QĐ 521) - Báo cáo tiến độ đề tài đợt 1',
      type: 'Sinh hoạt KH',
      startDate: '13/11/2026',
      startTime: '10:00',
      endDate: '13/11/2026',
      endTime: '12:00',
      location: 'Phòng Hội thảo Tầng 2, Nhà A2',
      regulatoryBasis: 'Bắt buộc theo Điều 9 QĐ 521/QĐ-HV (Biên bản Mẫu 3.5)',
      participants: 'Ban Chủ nhiệm Khoa, Bộ môn CNPM, GVHD & Các nhóm sinh viên',
      projectId: 'SV-2026-CNTT1-001 & Các đề tài NCKH Khoa CNTT1',
      note: 'Các nhóm sinh viên báo cáo kết quả khảo sát, demo giải pháp phần mềm và nhận góp ý chuyên môn',
      dayIndex: 4,
      startHour: 10,
      durationHours: 2,
      targetRoles: ['FACULTY_LEADER', 'FACULTY_SECRETARY', 'LECTURER', 'STUDENT'],
      scopeLevel: 'Khoa CNTT1',
      broadcastBy: 'Ban Chủ nhiệm Khoa CNTT1',
    },
    // 3. LỊCH TÁC NGHIỆP CỦA PHÒNG CT&CTSV
    {
      id: 'nckh_ctsv1',
      title: 'Rà soát & Đối soát danh sách Sinh viên đủ điều kiện cộng Điểm rèn luyện NCKH Kỳ 1 (Điều 15 QĐ 521)',
      type: 'Tác nghiệp CTSV',
      startDate: '09/11/2026',
      startTime: '10:00',
      endDate: '09/11/2026',
      endTime: '12:00',
      location: 'Văn phòng P.CT&CTSV, Phòng 102 Nhà A2',
      regulatoryBasis: 'Quy chế đánh giá kết quả rèn luyện & Điều 15 QĐ 521/QĐ-HV (+20 ĐRL vào Tiêu chí 2.3)',
      participants: 'ThS. Bùi Văn Toàn (P.CT&CTSV) & Chuyên viên tiếp nhận dữ liệu từ P.QLKHCN',
      projectId: 'Tất cả đề tài NCKH nghiệm thu đạt yêu cầu năm học 2026-2027',
      note: 'Kiểm tra biên bản nghiệm thu Mẫu 4.2 và xác nhận phân loại xuất sắc/tốt/khá để chuẩn bị cộng ĐRL',
      dayIndex: 0,
      startHour: 10,
      durationHours: 2,
      targetRoles: ['STUDENT_AFFAIRS'],
      scopeLevel: 'Phòng CT&CTSV',
      broadcastBy: 'Phòng Chính trị & Công tác Sinh viên',
    },
    {
      id: 'nckh_ctsv2',
      title: 'Họp Hội đồng xét Học bổng Khuyến khích học tập & Khen thưởng thành tích NCKH SV cấp Học viện',
      type: 'Tác nghiệp CTSV',
      startDate: '11/11/2026',
      startTime: '10:00',
      endDate: '11/11/2026',
      endTime: '12:00',
      location: 'Phòng họp Ban Giám Đốc, P.201 Nhà A2',
      regulatoryBasis: 'Quy chế chi tiêu nội bộ & Khen thưởng NCKH sinh viên theo QĐ 521',
      participants: 'Ban Giám đốc Học viện, Trưởng phòng CT&CTSV, Trưởng phòng QLKHCN, Đoàn Thanh niên',
      projectId: 'Hồ sơ khen thưởng NCKH sinh viên đợt 1',
      note: 'Xét duyệt hồ sơ ưu tiên cộng điểm học bổng và đề xuất Giám đốc Học viện tặng Giấy khen',
      dayIndex: 2,
      startHour: 10,
      durationHours: 2,
      targetRoles: ['STUDENT_AFFAIRS'],
      scopeLevel: 'Phòng CT&CTSV',
      broadcastBy: 'Hội đồng Thi đua Khen thưởng Học viện',
    },
    {
      id: 'nckh_ctsv3',
      title: 'Đồng bộ dữ liệu Điểm rèn luyện & Khen thưởng NCKH lên Cổng Thông tin Sinh viên S-Link',
      type: 'Tác nghiệp CTSV',
      startDate: '13/11/2026',
      startTime: '14:00',
      endDate: '13/11/2026',
      endTime: '16:00',
      location: 'P.CT&CTSV - Hệ thống Quản trị Dữ liệu Sinh viên S-Link',
      regulatoryBasis: 'Tích hợp API Cổng S-Link theo Quy chế đánh giá kết quả rèn luyện',
      participants: 'Chuyên viên P.CT&CTSV & Bộ phận Quản trị Hệ thống S-Link',
      projectId: 'Đợt NCKH Sinh viên 2026-2027',
      note: 'Cập nhật trực tiếp vào hồ sơ sinh viên: +20 ĐRL, cộng 0.4 TBC học tập và gửi thông báo S-Link App',
      dayIndex: 4,
      startHour: 14,
      durationHours: 2,
      targetRoles: ['STUDENT_AFFAIRS'],
      scopeLevel: 'Phòng CT&CTSV',
      broadcastBy: 'Phòng Chính trị & Công tác Sinh viên',
    },
    // 4. LỊCH TÁC NGHIỆP CỦA PHÒNG TÀI CHÍNH KẾ TOÁN
    {
      id: 'nckh_tckt1',
      title: 'Đối soát chứng từ gốc, hóa đơn VAT thanh quyết toán kinh phí đề tài NCKH SV (Điều 5 QĐ 521)',
      type: 'Quyết toán TCKT',
      startDate: '10/11/2026',
      startTime: '10:00',
      endDate: '10/11/2026',
      endTime: '12:00',
      location: 'Phòng Kế toán Tổng hợp, P.105 Nhà A2',
      regulatoryBasis: 'Quy chế chi tiêu nội bộ & Định mức kinh phí 5.000.000 đ/đề tài (QĐ 521/QĐ-HV)',
      participants: 'CN. Lê Thị Mai (P.TCKT), Chuyên viên P.QLKHCN & Chủ nhiệm đề tài',
      projectId: 'SV-2026-CNTT1-001 & Các đề tài nghiệm thu đạt',
      note: 'Kiểm tra tính hợp lệ của hóa đơn tài chính linh kiện thử nghiệm và bảng kê mua sắm',
      dayIndex: 1,
      startHour: 10,
      durationHours: 2,
      targetRoles: ['FINANCE'],
      scopeLevel: 'Phòng Tài chính Kế toán',
      broadcastBy: 'Phòng Tài chính - Kế toán',
    },
    {
      id: 'nckh_tckt2',
      title: 'Lập lệnh chi trả tiền thưởng NCKH SV qua tài khoản ngân hàng liên kết Cổng S-Link',
      type: 'Quyết toán TCKT',
      startDate: '12/11/2026',
      startTime: '10:00',
      endDate: '12/11/2026',
      endTime: '12:00',
      location: 'Phòng Thanh toán & Ngân quỹ, P.106 Nhà A2',
      regulatoryBasis: 'Quyết định khen thưởng giải Nhất, Nhì, Ba NCKH SV cấp Học viện',
      participants: 'Kế toán viên thanh toán & Ngân hàng đối tác PTIT',
      projectId: 'Danh mục khen thưởng NCKH sinh viên năm 2026',
      note: 'Thực hiện chi thưởng tự động theo danh sách đã duyệt từ P.CT&CTSV và P.QLKHCN',
      dayIndex: 3,
      startHour: 10,
      durationHours: 2,
      targetRoles: ['FINANCE'],
      scopeLevel: 'Phòng Tài chính Kế toán',
      broadcastBy: 'Phòng Tài chính - Kế toán',
    },
    // 5. LỊCH GIAO BAN QUẢN LÝ
    {
      id: 'nckh_ql1',
      title: 'Giao ban công tác NCKH Sinh viên định kỳ - Đánh giá tiến độ nộp đề cương toàn Học viện',
      type: 'Giao ban Quản lý',
      startDate: '10/11/2026',
      startTime: '08:00',
      endDate: '10/11/2026',
      endTime: '10:00',
      location: 'Phòng họp Giao ban Tầng 2, Nhà A2',
      regulatoryBasis: 'Kế hoạch công tác KH&CN học kỳ 1 năm học 2026-2027',
      participants: 'Ban Giám đốc, Trưởng phòng QLKHCN, Lãnh đạo các Khoa đào tạo',
      projectId: 'Đợt NCKH Sinh viên 2026-2027',
      note: 'Rà soát tỷ lệ hoàn thành nộp thuyết minh Mẫu 2 của từng Khoa và giải quyết khó khăn vướng mắc',
      dayIndex: 1,
      startHour: 8,
      durationHours: 2,
      targetRoles: ['QLKHCN', 'BOARD', 'ADMIN', 'FACULTY_LEADER'],
      scopeLevel: 'Phòng QLKH&CN',
      broadcastBy: 'Phòng Quản lý Khoa học Công nghệ',
    },
    // 6. LỊCH CÁ NHÂN / NHÓM
    {
      id: 'nckh_e1',
      title: 'Làm việc chuyên môn với GVHD TS. Ngô Quốc Dũng - Rà soát 12 mục Đề cương (Mẫu 2)',
      type: 'Làm việc với GVHD',
      startDate: '09/11/2026',
      startTime: '10:00',
      endDate: '09/11/2026',
      endTime: '12:00',
      location: 'Văn phòng Bộ môn CNPM, Tầng 3 Nhà A2 (Hoặc Google Meet)',
      regulatoryBasis: 'Kế hoạch hướng dẫn NCKH theo Điều 8 QĐ 521',
      participants: 'TS. Ngô Quốc Dũng & Nhóm sinh viên nghiên cứu (Nguyễn Văn An, Trần Thị Bình)',
      projectId: 'SV-2026-CNTT1-001',
      note: 'Thống nhất kiến trúc vi dịch vụ và bảng dự toán kinh phí 5.000.000 đ trước khi ký nộp',
      dayIndex: 0,
      startHour: 10,
      durationHours: 2,
      targetRoles: ['LECTURER', 'STUDENT'],
      scopeLevel: 'Nhóm đề tài',
      broadcastBy: 'TS. Ngô Quốc Dũng (Giảng viên hướng dẫn)',
    },
    {
      id: 'nckh_e3',
      title: 'Họp nhóm NCKH SRMS - Hoàn thiện các sơ đồ DFD mức 1 và thiết kế CSDL PostgreSQL',
      type: 'Họp nhóm NCKH',
      startDate: '11/11/2026',
      startTime: '10:00',
      endDate: '11/11/2026',
      endTime: '12:00',
      location: 'Thư viện Cơ sở Hà Đông - Khu tự học nhóm P.302',
      regulatoryBasis: 'Kế hoạch làm việc nội bộ nhóm SV-2026-CNTT1-001',
      participants: 'Nguyễn Văn An (Chủ nhiệm) & Trần Thị Bình (Thành viên)',
      projectId: 'SV-2026-CNTT1-001',
      note: 'Chuẩn bị slide báo cáo và tài liệu kỹ thuật cho buổi sinh hoạt học thuật Mẫu 3.5 cấp Khoa',
      dayIndex: 2,
      startHour: 10,
      durationHours: 2,
      targetRoles: ['STUDENT'],
      scopeLevel: 'Nhóm đề tài',
      broadcastBy: 'Nguyễn Văn An (Chủ nhiệm đề tài)',
    },
    {
      id: 'nckh_e7',
      title: 'Họp nhóm NCKH SRMS - Rà soát giao diện S-Link theo nhận diện thương hiệu PTIT',
      type: 'Họp nhóm NCKH',
      startDate: '15/11/2026',
      startTime: '10:00',
      endDate: '15/11/2026',
      endTime: '12:00',
      location: 'Phòng Lab Nghiên cứu Khoa CNTT1 (P.402-A2)',
      regulatoryBasis: 'Kế hoạch hoàn thiện giao diện người dùng theo chuẩn PTIT',
      participants: 'Toàn thể thành viên nhóm đề tài SV-2026-CNTT1-001',
      projectId: 'SV-2026-CNTT1-001',
      note: 'Kiểm tra tỷ lệ responsive, bảng màu đỏ thương hiệu và kiểm thử các luồng nộp hồ sơ',
      dayIndex: 6,
      startHour: 10,
      durationHours: 2,
      targetRoles: ['STUDENT'],
      scopeLevel: 'Nhóm đề tài',
      broadcastBy: 'Nguyễn Văn An (Chủ nhiệm đề tài)',
    },
  ];

  // In-memory store hỗ trợ cập nhật động ngay trong phiên làm việc
  private eventsStore: CalendarEventDto[] = [...this.defaultEvents];

  async getEvents(roleCode?: string, scope?: string) {
    let list = this.eventsStore;

    // Phân quyền theo vai trò (DFD 8.0 & QĐ 521)
    if (scope === 'my_schedule' && roleCode) {
      if (roleCode === 'ADMIN' || roleCode === 'QLKHCN' || roleCode === 'BOARD') {
        // Lãnh đạo và Admin thấy toàn bộ
        return list;
      }

      list = list.filter((e) => {
        // Sự kiện toàn trường áp xuống: ai cũng thấy
        if (e.targetRoles.includes('ALL')) return true;
        // Sự kiện gán đúng vai trò
        if (e.targetRoles.includes(roleCode)) return true;
        return false;
      });
    }

    return list;
  }

  async createEvent(dto: CalendarEventDto) {
    const newEvent: CalendarEventDto = {
      ...dto,
      id: dto.id || `nckh_usr_${Date.now()}`,
    };
    this.eventsStore.unshift(newEvent);
    return newEvent;
  }

  async deleteEvent(id: string) {
    this.eventsStore = this.eventsStore.filter((e) => e.id !== id);
    return { success: true, deletedId: id };
  }
}

