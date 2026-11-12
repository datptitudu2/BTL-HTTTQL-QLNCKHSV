import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Alert,
  Row,
  Col,
  Select,
  Statistic,
  Divider,
  message,
  Tooltip,
  DatePicker,
} from 'antd';
import {
  CheckCircleOutlined,
  AuditOutlined,
  PlusOutlined,
  PrinterOutlined,
  EyeOutlined,
  TrophyOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FileDoneOutlined,
  EditOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  SearchOutlined,
  ReloadOutlined,
  BookOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mau41PhieuDanhGia,
  Mau42BienBanHoiDong,
  Mau43BanNhanXet,
} from '../components/qd521/QD521Templates';
import { printElement } from '../utils/printHelper';

const { Title, Text } = Typography;

export const AcceptancePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';
  const isLecturerOrAdmin =
    roleCode === 'LECTURER' ||
    roleCode === 'ADMIN' ||
    roleCode === 'QLKHCN' ||
    roleCode === 'FACULTY_LEADER';
  const isStudentAffairs = roleCode === 'STUDENT_AFFAIRS';

  // DANH MỤC PHIÊN HỘI ĐỒNG NGHIỆM THU THEO KHOA & THEO ĐỀ TÀI (CHUẨN ERD 34 BẢNG: COUNCILS, PROJECTS, DEPARTMENTS, ACCEPTANCES)
  const initialSessions = [
    {
      id: 'ACC-001',
      projectId: 'SV-2026-CNTT1-001',
      titleVi: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
      deptId: 1,
      deptCode: 'CNTT1',
      deptName: 'Khoa Công nghệ thông tin 1',
      councilName: 'Hội đồng nghiệm thu đề tài NCKH sinh viên Khoa CNTT1 số 01',
      decisionNo: '145/QĐ-HV ngày 20/04/2027 của Giám đốc Học viện',
      defenseDate: '28/04/2027',
      defenseTime: '08:30',
      location: 'Hội trường Tầng 1 - Nhà A2, Học viện PTIT',
      status: 'ACCEPTED', // Đã nghiệm thu
      avgScore: 93.8,
      grade: 'XUẤT SẮC',
      drlBonus: 10,
      awardRecommendation:
        'Hội đồng nhất trí 100% đề nghị Giám đốc Học viện khen thưởng Giải Nhất cấp Học viện và chọn làm đại diện dự thi Giải thưởng Sinh viên NCKH cấp Bộ GD&ĐT.',
      leader: {
        name: 'Nguyễn Văn An',
        studentId: 'B23DCCN001',
        className: 'D23CQCN01-B',
        email: 'an.nv@stu.ptit.edu.vn',
      },
      advisor: {
        name: 'TS. Ngô Quốc Dũng',
        email: 'dungnq@ptit.edu.vn',
        dept: 'Bộ môn CNPM - Khoa CNTT 1',
      },
      evaluators: [
        {
          id: 1,
          name: 'PGS.TS. Hoàng Minh',
          role: 'Chủ tịch Hội đồng',
          title: 'Trưởng Khoa, Giảng viên cao cấp',
          score1: 9.5,
          score2: 14.5,
          score3: 14.0,
          score4: 33.0,
          score5: 14.0,
          score6: 5.0,
          score7: 4.5,
          total: 94.5,
          grade: 'Xuất sắc',
          comment:
            'Đề tài giải quyết vấn đề thực tế cấp thiết của Học viện. Phương pháp nghiên cứu bài bản, sản phẩm hoàn thiện cao, ứng dụng thực tế tốt. Đề nghị trao Giải Nhất Học viện.',
          date: 'ngày 28 tháng 04 năm 2027',
        },
        {
          id: 2,
          name: 'TS. Vũ Trọng Hùng',
          role: 'Ủy viên Phản biện 1',
          title: 'Phó Trưởng Bộ môn Khoa học Máy tính',
          score1: 9.0,
          score2: 14.0,
          score3: 14.0,
          score4: 32.5,
          score5: 14.5,
          score6: 4.5,
          score7: 4.5,
          total: 93.0,
          grade: 'Xuất sắc',
          comment:
            'Bản nhận xét phản biện chi tiết: phương pháp triển khai chặt chẽ, thuật toán loại trừ điểm lệch > 15đ hoạt động chính xác. Đề nghị Hội đồng nghiệm thu xếp loại Xuất sắc.',
          date: 'ngày 28 tháng 04 năm 2027',
        },
        {
          id: 3,
          name: 'TS. Trần Mai Lan',
          role: 'Ủy viên Phản biện 2',
          title: 'Giảng viên chính Khoa CNTT1',
          score1: 9.0,
          score2: 14.0,
          score3: 13.5,
          score4: 33.0,
          score5: 13.5,
          score6: 4.5,
          score7: 5.0,
          total: 92.5,
          grade: 'Xuất sắc',
          comment:
            'Sinh viên làm chủ công nghệ, có bài báo công bố tại Kỷ yếu Hội thảo KHCN. Báo cáo tổng kết Mẫu 3.4 trình bày công phu, chuẩn mực.',
          date: 'ngày 28 tháng 04 năm 2027',
        },
        {
          id: 4,
          name: 'ThS. Đỗ Thị Thu Hiền',
          role: 'Thư ký Hội đồng',
          title: 'Giảng viên Bộ môn HTTT',
          score1: 9.5,
          score2: 15.0,
          score3: 14.0,
          score4: 33.5,
          score5: 14.0,
          score6: 4.5,
          score7: 4.5,
          total: 95.0,
          grade: 'Xuất sắc',
          comment:
            'Hồ sơ đầy đủ từ Mẫu 1 đến Mẫu 3.5. Trả lời xuất sắc toàn bộ câu hỏi chất vấn của Hội đồng. Đề nghị khen thưởng đặc biệt.',
          date: 'ngày 28 tháng 04 năm 2027',
        },
        {
          id: 5,
          name: 'TS. Nguyễn Quang Hưng',
          role: 'Ủy viên Hội đồng',
          title: 'Trưởng Phòng Thí nghiệm Hệ thống Nhúng',
          score1: 9.5,
          score2: 14.0,
          score3: 14.0,
          score4: 33.0,
          score5: 14.0,
          score6: 5.0,
          score7: 4.5,
          total: 94.0,
          grade: 'Xuất sắc',
          comment:
            'Tính năng xem trước A4 và xuất file chứng nhận số rất trực quan, thiết thực cho công tác quản lý của các Khoa đào tạo.',
          date: 'ngày 28 tháng 04 năm 2027',
        },
      ],
    },
    {
      id: 'ACC-002',
      projectId: 'SV-2026-CNTT1-002',
      titleVi: 'Mobile AR Apps and Impulse Buying: Perspectives from Indonesian Consumers and Tourists',
      deptId: 2,
      deptCode: 'DPT',
      deptName: 'Khoa Đa phương tiện',
      councilName: 'Hội đồng nghiệm thu đề tài NCKH Khoa Đa phương tiện số 02',
      decisionNo: '148/QĐ-HV ngày 22/04/2027 của Giám đốc Học viện',
      defenseDate: '29/04/2027',
      defenseTime: '09:00',
      location: 'Phòng Lab Đa phương tiện 302-A2',
      status: 'ACCEPTED',
      avgScore: 84.6,
      grade: 'TỐT',
      drlBonus: 8,
      awardRecommendation:
        'Đề tài đạt mức xếp loại Tốt. Hội đồng đề nghị cộng 8 điểm rèn luyện theo Quy định số 521/QĐ-HV.',
      leader: {
        name: 'Nguyễn Minh Tuấn',
        studentId: 'B23DCDT015',
        className: 'D23CQDT01-B',
        email: 'tuan.nm@stu.ptit.edu.vn',
      },
      advisor: {
        name: 'TS. Trần Đình Trí',
        email: 'tritd@ptit.edu.vn',
        dept: 'Khoa Đa phương tiện',
      },
      evaluators: [
        {
          id: 1,
          name: 'TS. Nguyễn Thị Hồng',
          role: 'Chủ tịch Hội đồng',
          title: 'Phó Trưởng Khoa Đa phương tiện',
          score1: 8.5,
          score2: 13.0,
          score3: 12.5,
          score4: 30.0,
          score5: 12.0,
          score6: 4.0,
          score7: 4.0,
          total: 84.0,
          grade: 'Tốt',
          comment: 'Mô hình hồi quy AR được xây dựng chuẩn xác, khảo sát người dùng thực tế tại thị trường Đông Nam Á.',
          date: 'ngày 29 tháng 04 năm 2027',
        },
        {
          id: 2,
          name: 'ThS. Lê Hoàng Nam',
          role: 'Ủy viên Phản biện 1',
          title: 'Giảng viên Bộ môn Thiết kế Đồ họa',
          score1: 8.5,
          score2: 13.5,
          score3: 13.0,
          score4: 30.5,
          score5: 12.5,
          score6: 4.0,
          score7: 3.5,
          total: 85.5,
          grade: 'Tốt',
          comment: 'Giao diện ứng dụng AR trực quan, trải nghiệm mượt mà, phân tích số liệu SPSS tin cậy.',
          date: 'ngày 29 tháng 04 năm 2027',
        },
        {
          id: 3,
          name: 'TS. Phạm Thanh Sơn',
          role: 'Ủy viên Phản biện 2',
          title: 'Giảng viên chính Khoa Đa phương tiện',
          score1: 8.0,
          score2: 12.5,
          score3: 13.0,
          score4: 30.0,
          score5: 12.5,
          score6: 4.0,
          score7: 4.0,
          total: 84.0,
          grade: 'Tốt',
          comment: 'Báo cáo tổng kết đạt yêu cầu, đề xuất giải pháp kích cầu mua sắm du lịch qua công nghệ AR.',
          date: 'ngày 29 tháng 04 năm 2027',
        },
        {
          id: 4,
          name: 'ThS. Chu Minh Anh',
          role: 'Thư ký Hội đồng',
          title: 'Giảng viên Khoa Đa phương tiện',
          score1: 8.5,
          score2: 13.0,
          score3: 13.0,
          score4: 31.0,
          score5: 12.5,
          score6: 4.0,
          score7: 4.0,
          total: 86.0,
          grade: 'Tốt',
          comment: 'Hồ sơ đầy đủ, sinh viên trả lời tốt các câu hỏi về thuật toán hiển thị mô hình 3D AR.',
          date: 'ngày 29 tháng 04 năm 2027',
        },
        {
          id: 5,
          name: 'TS. Đinh Văn Toàn',
          role: 'Ủy viên Hội đồng',
          title: 'Trưởng Phòng Thí nghiệm Media',
          score1: 8.0,
          score2: 13.0,
          score3: 12.5,
          score4: 30.0,
          score5: 12.0,
          score6: 4.0,
          score7: 4.0,
          total: 83.5,
          grade: 'Tốt',
          comment: 'Sản phẩm demo chạy tốt trên các thiết bị di động Android và iOS.',
          date: 'ngày 29 tháng 04 năm 2027',
        },
      ],
    },
    {
      id: 'ACC-004',
      projectId: 'SV-2026-CNTT1-004',
      titleVi:
        'Phương pháp tiền xử lý và trích xuất đặc trưng từ dữ liệu giao dịch POS giúp cải thiện dự báo doanh thu cho doanh nghiệp SME',
      deptId: 1,
      deptCode: 'CNTT1',
      deptName: 'Khoa Công nghệ thông tin 1',
      councilName: 'Hội đồng nghiệm thu đề tài NCKH sinh viên Khoa CNTT1 số 04',
      decisionNo: '152/QĐ-HV ngày 25/04/2027 của Giám đốc Học viện',
      defenseDate: '03/05/2027',
      defenseTime: '14:00',
      location: 'Phòng Hội thảo Tầng 2 - Thư viện PTIT',
      status: 'ACCEPTED',
      avgScore: 91.2,
      grade: 'XUẤT SẮC',
      drlBonus: 10,
      awardRecommendation:
        'Đề tài xuất sắc trong lĩnh vực AI & Data Mining. Đề nghị khen thưởng Giải Nhì cấp Học viện.',
      leader: {
        name: 'Kim Ngọc Bách',
        studentId: 'B23DCCN088',
        className: 'D23CQCN01-B',
        email: 'bach.kn@stu.ptit.edu.vn',
      },
      advisor: {
        name: 'TS. Ngô Quốc Dũng',
        email: 'dungnq@ptit.edu.vn',
        dept: 'Bộ môn CNPM - Khoa CNTT 1',
      },
      evaluators: [
        {
          id: 1,
          name: 'PGS.TS. Trần Đình Quế',
          role: 'Chủ tịch Hội đồng',
          title: 'Trưởng Khoa CNTT1, Giảng viên cao cấp',
          score1: 9.0,
          score2: 14.5,
          score3: 14.0,
          score4: 32.5,
          score5: 13.5,
          score6: 4.5,
          score7: 4.0,
          total: 92.0,
          grade: 'Xuất sắc',
          comment: 'Thuật toán trích xuất đặc trưng từ chuỗi thời gian POS sáng tạo, độ chính xác dự báo cao.',
          date: 'ngày 03 tháng 05 năm 2027',
        },
        {
          id: 2,
          name: 'TS. Vũ Trọng Hùng',
          role: 'Ủy viên Phản biện 1',
          title: 'Phó Trưởng Bộ môn KHMT',
          score1: 9.0,
          score2: 14.0,
          score3: 13.5,
          score4: 32.0,
          score5: 14.0,
          score6: 4.5,
          score7: 4.5,
          total: 91.5,
          grade: 'Xuất sắc',
          comment: 'Thực nghiệm trên 100.000 bản ghi POS thực tế, xử lý ngoại lệ dữ liệu nhiễu rất tốt.',
          date: 'ngày 03 tháng 05 năm 2027',
        },
        {
          id: 3,
          name: 'TS. Trần Mai Lan',
          role: 'Ủy viên Phản biện 2',
          title: 'Giảng viên chính Khoa CNTT1',
          score1: 9.0,
          score2: 14.0,
          score3: 13.5,
          score4: 31.5,
          score5: 13.5,
          score6: 4.5,
          score7: 4.0,
          total: 90.0,
          grade: 'Xuất sắc',
          comment: 'Công trình có tính khả thi chuyển giao cao cho các doanh nghiệp bán lẻ vừa và nhỏ.',
          date: 'ngày 03 tháng 05 năm 2027',
        },
        {
          id: 4,
          name: 'ThS. Nguyễn Thị Lan',
          role: 'Thư ký Hội đồng',
          title: 'Thư ký Khoa CNTT1',
          score1: 9.0,
          score2: 14.5,
          score3: 14.0,
          score4: 32.0,
          score5: 14.0,
          score6: 4.5,
          score7: 4.0,
          total: 92.0,
          grade: 'Xuất sắc',
          comment: 'Hồ sơ tài liệu chuẩn chỉnh, mã nguồn được công khai trên GitHub của nhóm.',
          date: 'ngày 03 tháng 05 năm 2027',
        },
        {
          id: 5,
          name: 'TS. Ngô Quốc Dũng',
          role: 'Ủy viên Hội đồng',
          title: 'Bộ môn CNPM - Giảng viên hướng dẫn',
          score1: 9.0,
          score2: 14.0,
          score3: 13.5,
          score4: 32.0,
          score5: 13.5,
          score6: 4.5,
          score7: 4.0,
          total: 90.5,
          grade: 'Xuất sắc',
          comment: 'Sinh viên nỗ lực nghiên cứu trong suốt 6 tháng, tự lập trình toàn bộ pipeline tiền xử lý.',
          date: 'ngày 03 tháng 05 năm 2027',
        },
      ],
    },
    {
      id: 'ACC-003',
      projectId: 'SV-2026-CNTT1-003',
      titleVi: 'Mental Imagery and Positive Arousal Influencing Purchase Intention in VR Hotels',
      deptId: 3,
      deptCode: 'QTKD',
      deptName: 'Khoa Quản trị kinh doanh',
      councilName: 'Hội đồng nghiệm thu đề tài NCKH Khoa Quản trị kinh doanh số 03',
      decisionNo: '155/QĐ-HV ngày 28/04/2027 của Giám đốc Học viện',
      defenseDate: '05/05/2027',
      defenseTime: '08:30',
      location: 'Phòng họp 1 - Nhà A1, Học viện PTIT',
      status: 'PENDING', // Chờ bảo vệ
      avgScore: null,
      grade: 'CHỜ BẢO VỆ',
      drlBonus: null,
      awardRecommendation:
        'Hội đồng đã được thành lập theo QĐ 155/QĐ-HV, hồ sơ Báo cáo tổng kết Mẫu 3.4 đã sẵn sàng cho phiên bảo vệ.',
      leader: {
        name: 'Phạm Đức Thịnh',
        studentId: 'B23DCQT009',
        className: 'D23CQQT01-B',
        email: 'thinh.pd@stu.ptit.edu.vn',
      },
      advisor: {
        name: 'TS. Đinh Quang Huy',
        email: 'huydq@ptit.edu.vn',
        dept: 'Khoa Quản trị kinh doanh',
      },
      evaluators: [
        { id: 1, name: 'PGS.TS. Nguyễn Văn Hậu', role: 'Chủ tịch Hội đồng', title: 'Trưởng Khoa QTKD', total: null, grade: 'Chờ chấm' },
        { id: 2, name: 'TS. Lê Thị Thanh', role: 'Ủy viên Phản biện 1', title: 'Phó Trưởng Bộ môn Marketing', total: null, grade: 'Chờ chấm' },
        { id: 3, name: 'ThS. Trần Đức Thắng', role: 'Ủy viên Phản biện 2', title: 'Giảng viên Bộ môn QTKD', total: null, grade: 'Chờ chấm' },
        { id: 4, name: 'ThS. Hoàng Bích Ngọc', role: 'Thư ký Hội đồng', title: 'Giảng viên Khoa QTKD', total: null, grade: 'Chờ chấm' },
        { id: 5, name: 'TS. Đinh Quang Huy', role: 'Ủy viên Hội đồng', title: 'Giảng viên hướng dẫn', total: null, grade: 'Chờ chấm' },
      ],
    },
    {
      id: 'ACC-005',
      projectId: 'SV-2026-CNTT1-005',
      titleVi: 'Phát hiện tấn công lỗ hổng bảo mật Zero-day trong hệ sinh thái IoT dựa trên mô hình Deep Learning',
      deptId: 4,
      deptCode: 'ATTT',
      deptName: 'Khoa An toàn thông tin',
      councilName: 'Hội đồng nghiệm thu đề tài NCKH Khoa An toàn thông tin số 05',
      decisionNo: '150/QĐ-HV ngày 24/04/2027 của Giám đốc Học viện',
      defenseDate: '30/04/2027',
      defenseTime: '14:00',
      location: 'Phòng Lab An toàn thông tin 404-A2',
      status: 'ACCEPTED',
      avgScore: 78.6,
      grade: 'KHÁ',
      drlBonus: 6,
      awardRecommendation:
        'Đề tài đạt mức xếp loại Khá. Đề nghị cộng 6 điểm rèn luyện cho các thành viên nhóm sinh viên theo Điều 14 QĐ 521.',
      leader: {
        name: 'Hoàng Quốc Việt',
        studentId: 'B23DCAT012',
        className: 'D23CQAT01-B',
        email: 'viet.hq@stu.ptit.edu.vn',
      },
      advisor: {
        name: 'TS. Nguyễn Văn Tuấn',
        email: 'tuannv@ptit.edu.vn',
        dept: 'Khoa An toàn thông tin',
      },
      evaluators: [
        {
          id: 1,
          name: 'TS. Lê Anh Tuấn',
          role: 'Chủ tịch Hội đồng',
          title: 'Phó Trưởng Khoa ATTT',
          score1: 8.0,
          score2: 12.0,
          score3: 12.0,
          score4: 28.0,
          score5: 11.5,
          score6: 4.0,
          score7: 3.5,
          total: 79.0,
          grade: 'Khá',
          comment: 'Mô hình phát hiện Zero-day có tính thực tiễn, dataset thử nghiệm cần mở rộng hơn.',
          date: 'ngày 30 tháng 04 năm 2027',
        },
        {
          id: 2,
          name: 'ThS. Vũ Đình Hải',
          role: 'Ủy viên Phản biện 1',
          title: 'Giảng viên Bộ môn Mạng & ATTT',
          score1: 7.5,
          score2: 12.0,
          score3: 11.5,
          score4: 28.0,
          score5: 11.5,
          score6: 3.5,
          score7: 3.5,
          total: 77.5,
          grade: 'Khá',
          comment: 'Báo cáo trình bày rõ ràng, cần tối ưu thêm thời gian huấn luyện mô hình trên thiết bị nhúng IoT.',
          date: 'ngày 30 tháng 04 năm 2027',
        },
        {
          id: 3,
          name: 'TS. Đỗ Xuân Thắng',
          role: 'Ủy viên Phản biện 2',
          title: 'Giảng viên chính Khoa ATTT',
          score1: 8.0,
          score2: 12.5,
          score3: 12.0,
          score4: 28.5,
          score5: 11.5,
          score6: 3.5,
          score7: 3.5,
          total: 79.5,
          grade: 'Khá',
          comment: 'Sản phẩm demo phát hiện thành công một số biến thể tấn công DDoS IoT.',
          date: 'ngày 30 tháng 04 năm 2027',
        },
        {
          id: 4,
          name: 'ThS. Lê Thị Phương',
          role: 'Thư ký Hội đồng',
          title: 'Giảng viên Khoa ATTT',
          score1: 7.5,
          score2: 12.0,
          score3: 12.0,
          score4: 28.0,
          score5: 12.0,
          score6: 3.5,
          score7: 3.5,
          total: 78.5,
          grade: 'Khá',
          comment: 'Nhóm nghiên cứu làm việc nghiêm túc, hồ sơ nghiệm thu hợp lệ.',
          date: 'ngày 30 tháng 04 năm 2027',
        },
        {
          id: 5,
          name: 'TS. Nguyễn Văn Tuấn',
          role: 'Ủy viên Hội đồng',
          title: 'Giảng viên hướng dẫn',
          score1: 8.0,
          score2: 12.0,
          score3: 12.0,
          score4: 28.0,
          score5: 11.5,
          score6: 3.5,
          score7: 3.5,
          total: 78.5,
          grade: 'Khá',
          comment: 'Sinh viên nắm vững kiến thức an toàn thông tin và học máy.',
          date: 'ngày 30 tháng 04 năm 2027',
        },
      ],
    },
  ];

  const [sessions, setSessions] = useState<any[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('ACC-001');

  // Bộ lọc
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Modal states
  const [mau41ModalVisible, setMau41ModalVisible] = useState<boolean>(false);
  const [mau42ModalVisible, setMau42ModalVisible] = useState<boolean>(false);
  const [mau43ModalVisible, setMau43ModalVisible] = useState<boolean>(false);
  const [scoreFormModalVisible, setScoreFormModalVisible] = useState<boolean>(false);
  const [newCouncilModalVisible, setNewCouncilModalVisible] = useState<boolean>(false);
  const [selectedEvaluatorIndex, setSelectedEvaluatorIndex] = useState<number>(0);

  // Form thành lập HĐ mới
  const [councilForm] = Form.useForm();

  // Form chấm điểm 7 tiêu chí trực tuyến
  const [scoreForm] = Form.useForm();
  const [liveScores, setLiveScores] = useState({
    score1: 9.5,
    score2: 14.5,
    score3: 14.0,
    score4: 33.0,
    score5: 14.0,
    score6: 5.0,
    score7: 4.5,
  });

  const liveTotal = Number(
    (
      (liveScores.score1 || 0) +
      (liveScores.score2 || 0) +
      (liveScores.score3 || 0) +
      (liveScores.score4 || 0) +
      (liveScores.score5 || 0) +
      (liveScores.score6 || 0) +
      (liveScores.score7 || 0)
    ).toFixed(1),
  );

  // Đề tài / Phiên nghiệm thu đang được người dùng chọn xem chi tiết
  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  // Danh sách thành viên HĐ của phiên đang chọn
  const evaluators = selectedSession.evaluators || [];
  const selectedEvaluator = evaluators[selectedEvaluatorIndex] || evaluators[0];

  // Chuẩn bị đối tượng Project truyền vào các biểu mẫu A4
  const selectedProjectForDocs = {
    project_id: selectedSession.projectId,
    title_vi: selectedSession.titleVi,
    departments: { dept_name: selectedSession.deptName },
    project_members: [
      {
        member_role: 'LEADER',
        students: {
          student_id: selectedSession.leader.studentId,
          class_name: selectedSession.leader.className,
          users: {
            full_name: selectedSession.leader.name,
            email: selectedSession.leader.email,
          },
        },
      },
    ],
    project_advisors: [
      {
        lecturers: {
          users: {
            full_name: selectedSession.advisor.name,
            email: selectedSession.advisor.email,
          },
        },
        department: selectedSession.advisor.dept,
      },
    ],
    decisionNo: selectedSession.decisionNo,
    councilMembers: evaluators,
    avgScore: selectedSession.avgScore,
    grade: selectedSession.grade,
    awardRecommendation: selectedSession.awardRecommendation,
    reviewer: evaluators[1]
      ? {
          name: evaluators[1].name,
          role: evaluators[1].role,
          dept: selectedSession.deptName,
        }
      : undefined,
  };

  // Lọc danh sách phiên Hội đồng
  const filteredSessions = sessions.filter((s) => {
    // 1. Lọc theo Khoa
    if (selectedDeptFilter !== 'ALL' && s.deptCode !== selectedDeptFilter) {
      return false;
    }
    // 2. Lọc theo Xếp loại
    if (selectedGradeFilter !== 'ALL') {
      if (selectedGradeFilter === 'PENDING' && s.status !== 'PENDING') return false;
      if (selectedGradeFilter === 'EXCELLENT' && s.grade !== 'XUẤT SẮC') return false;
      if (selectedGradeFilter === 'GOOD' && s.grade !== 'TỐT') return false;
      if (selectedGradeFilter === 'FAIR' && s.grade !== 'KHÁ') return false;
    }
    // 3. Tìm kiếm từ khóa
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const match =
        s.titleVi.toLowerCase().includes(q) ||
        s.projectId.toLowerCase().includes(q) ||
        s.leader.name.toLowerCase().includes(q) ||
        s.advisor.name.toLowerCase().includes(q) ||
        s.deptName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleScoreChange = (_: any, allValues: any) => {
    setLiveScores({
      score1: Number(allValues.score1) || 0,
      score2: Number(allValues.score2) || 0,
      score3: Number(allValues.score3) || 0,
      score4: Number(allValues.score4) || 0,
      score5: Number(allValues.score5) || 0,
      score6: Number(allValues.score6) || 0,
      score7: Number(allValues.score7) || 0,
    });
  };

  const handleSubmitScore = () => {
    const gradeText =
      liveTotal >= 90 ? 'Xuất sắc' : liveTotal >= 80 ? 'Tốt' : liveTotal >= 70 ? 'Khá' : 'Đạt';
    message.success(
      `Đã nộp phiếu chấm điểm điện tử thành công cho đề tài ${selectedSession.projectId}! Tổng điểm ghi nhận: ${liveTotal}/100đ (${gradeText}).`,
    );
    setScoreFormModalVisible(false);
  };

  // Tạo Hội đồng mới
  const handleCreateCouncil = (values: any) => {
    const newSession = {
      id: `ACC-00${sessions.length + 1}`,
      projectId: values.projectId,
      titleVi: values.titleVi,
      deptId: 1,
      deptCode: 'CNTT1',
      deptName: 'Khoa Công nghệ thông tin 1',
      councilName: values.councilName,
      decisionNo: values.decisionNo || '158/QĐ-HV của Giám đốc Học viện',
      defenseDate: values.defenseDate ? values.defenseDate.format('DD/MM/YYYY') : '10/05/2027',
      defenseTime: values.defenseTime || '08:30',
      location: values.location || 'Phòng họp Tầng 2 - Nhà A2, PTIT',
      status: 'PENDING',
      avgScore: null,
      grade: 'CHỜ BẢO VỆ',
      drlBonus: null,
      awardRecommendation: 'Hội đồng mới được thành lập, đang chuẩn bị tiến hành đánh giá.',
      leader: {
        name: values.leaderName || 'Sinh viên NCKH',
        studentId: 'B23DCCN099',
        className: 'D23CQCN01-B',
        email: 'sinhvien@stu.ptit.edu.vn',
      },
      advisor: {
        name: values.advisorName || 'TS. Ngô Quốc Dũng',
        email: 'dungnq@ptit.edu.vn',
        dept: 'Khoa Công nghệ thông tin 1',
      },
      evaluators: [
        { id: 1, name: values.chairName || 'PGS.TS. Trần Đình Quế', role: 'Chủ tịch Hội đồng', title: 'Trưởng Khoa', total: null, grade: 'Chờ chấm' },
        { id: 2, name: values.reviewer1Name || 'TS. Vũ Trọng Hùng', role: 'Ủy viên Phản biện 1', title: 'Phó Trưởng BM KHMT', total: null, grade: 'Chờ chấm' },
        { id: 3, name: values.reviewer2Name || 'TS. Trần Mai Lan', role: 'Ủy viên Phản biện 2', title: 'Giảng viên chính', total: null, grade: 'Chờ chấm' },
        { id: 4, name: values.secretaryName || 'ThS. Nguyễn Thị Lan', role: 'Thư ký Hội đồng', title: 'Thư ký Khoa', total: null, grade: 'Chờ chấm' },
        { id: 5, name: values.advisorName || 'TS. Ngô Quốc Dũng', role: 'Ủy viên Hội đồng', title: 'Giảng viên hướng dẫn', total: null, grade: 'Chờ chấm' },
      ],
    };

    setSessions([newSession, ...sessions]);
    setSelectedSessionId(newSession.id);
    message.success(`Đã thành lập thành công Hội đồng nghiệm thu cho đề tài ${values.projectId}!`);
    setNewCouncilModalVisible(false);
    councilForm.resetFields();
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* TIÊU ĐỀ TRANG CHUẨN S-LINK */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
            Hội đồng Nghiệm thu & Chấm điểm Đề tài (QĐ 521/QĐ-HV)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tổ chức Hội đồng bảo vệ theo từng Khoa, chấm điểm 7 tiêu chí theo Phiếu Mẫu 4.1, lập Biên bản họp Mẫu 4.2 và tính điểm tự động loại trừ chênh lệch &gt; 15 điểm.
          </Text>
        </div>

        <Space wrap>
          {isLecturerOrAdmin && (
            <Button
              type="primary"
              style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontWeight: 600 }}
              icon={<EditOutlined />}
              onClick={() => setScoreFormModalVisible(true)}
            >
              Chấm điểm trực tuyến (Mẫu 4.1)
            </Button>
          )}

          {(roleCode === 'QLKHCN' || roleCode === 'FACULTY_LEADER' || roleCode === 'ADMIN') && (
            <Button
              type="primary"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600 }}
              icon={<PlusOutlined />}
              onClick={() => setNewCouncilModalVisible(true)}
            >
              Thành lập Hội đồng mới
            </Button>
          )}

          <Button icon={<FileTextOutlined />} onClick={() => navigate('/forms')}>
            Tất cả Biểu mẫu QĐ 521
          </Button>
        </Space>
      </div>

      {/* BANNER PHÂN QUYỀN ĐẶC BIỆT KHI ĐĂNG NHẬP PHÒNG CT&CTSV */}
      {isStudentAffairs && (
        <Alert
          type="warning"
          showIcon
          icon={<TrophyOutlined style={{ color: '#D46B08' }} />}
          message={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontWeight: 700, color: '#D46B08', fontSize: 14 }}>
                  Cổng Tra cứu Kết quả Nghiệm thu & Đối soát Điểm rèn luyện — Phòng CT&CTSV
                </span>
                <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                  Bạn đang đăng nhập với vai trò <b>Phòng Công tác & Công tác sinh viên (P.CT&CTSV)</b>. Căn cứ kết quả xếp loại nghiệm thu chính thức của các Hội đồng cấp Khoa để thực hiện đối soát và xét duyệt cộng Điểm rèn luyện (ĐRL) theo <b>Điều 14 Quyết định số 521/QĐ-HV</b> (Xuất sắc: +10đ, Tốt: +8đ, Khá: +6đ, Đạt: +4đ).
                </div>
              </div>
              <Button
                type="primary"
                style={{ backgroundColor: '#D46B08', borderColor: '#D46B08', fontWeight: 600 }}
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/awards')}
              >
                Xét duyệt Cộng Điểm rèn luyện (ĐRL) →
              </Button>
            </div>
          }
          style={{ marginBottom: 16, borderRadius: 8, border: '1px solid #FFE58F', backgroundColor: '#FFFBE6' }}
        />
      )}

      {/* BANNER NGUYÊN TẮC CHẤM ĐIỂM & ĐIỀU 10 QĐ 521 */}
      <Alert
        message={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: '#1890FF' }} />
            <b style={{ color: '#1890FF' }}>
              Nguyên tắc chấm điểm nghiệm thu & Thuật toán loại trừ điểm lệch (Điều 10 QĐ 521/QĐ-HV)
            </b>
          </div>
        }
        description="Điểm độc lập của 5 thành viên Hội đồng được chấm theo thang 100 với 7 tiêu chí chuẩn. Điểm của thành viên chênh lệch quá 15 điểm so với điểm trung bình ban đầu bị coi là không hợp lệ và bị hệ thống tự động loại trừ trước khi tính điểm chính thức: Xuất sắc (≥ 90), Tốt (80 - 89), Khá (70 - 79), Đạt (50 - 69)."
        type="info"
        showIcon={false}
        style={{ marginBottom: 20, borderRadius: 8, border: '1px solid #BAE7FF', backgroundColor: '#F0F8FF' }}
      />

      {/* 4 THẺ THỐNG KÊ NHANH TỔNG THỂ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '14px 16px' }} style={{ borderRadius: 8, border: '1px solid #EDEDEE' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Tổng đề tài nghiệm thu</span>}
              value={sessions.length}
              suffix="đề tài"
              valueStyle={{ fontWeight: 700, color: '#262626', fontSize: 22 }}
              prefix={<BookOutlined style={{ color: '#1890FF' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '14px 16px' }} style={{ borderRadius: 8, border: '1px solid #EDEDEE' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Đã nghiệm thu chính thức</span>}
              value={sessions.filter((s) => s.status === 'ACCEPTED').length}
              suffix="đề tài"
              valueStyle={{ fontWeight: 700, color: '#52C41A', fontSize: 22 }}
              prefix={<CheckCircleOutlined style={{ color: '#52C41A' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '14px 16px' }} style={{ borderRadius: 8, border: '1px solid #EDEDEE' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Chờ phiên bảo vệ</span>}
              value={sessions.filter((s) => s.status === 'PENDING').length}
              suffix="đề tài"
              valueStyle={{ fontWeight: 700, color: '#FA8C16', fontSize: 22 }}
              prefix={<ClockCircleOutlined style={{ color: '#FA8C16' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '14px 16px' }} style={{ borderRadius: 8, border: '1px solid #EDEDEE' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Tỷ lệ Xuất sắc & Tốt</span>}
              value={75}
              suffix="%"
              valueStyle={{ fontWeight: 700, color: '#C62828', fontSize: 22 }}
              prefix={<TrophyOutlined style={{ color: '#C62828' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* =========================================================================
          KHU VỰC 1: BẢNG DANH SÁCH CÁC HỘI ĐỒNG & ĐỀ TÀI NGHIỆM THU THEO KHOA
          ========================================================================= */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ApartmentOutlined style={{ color: '#C62828', fontSize: 18 }} />
              <span style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
                Danh mục Hội đồng & Đề tài Nghiệm thu theo Đơn vị Khoa (QĐ 521)
              </span>
              <Tag color="red" style={{ fontWeight: 600 }}>
                {filteredSessions.length} đề tài
              </Tag>
            </div>

            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              Nhấp vào một đề tài để xem chi tiết Hội đồng, điểm 7 tiêu chí & biểu mẫu A4
            </div>
          </div>
        }
        style={{ borderRadius: 8, marginBottom: 24, border: '1px solid #EDEDEE' }}
        bodyStyle={{ padding: 16 }}
      >
        {/* THANH BỘ LỌC NGHIỆP VỤ */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ minWidth: 220 }}>
            <span style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>
              Lọc theo Đơn vị Khoa:
            </span>
            <Select
              value={selectedDeptFilter}
              onChange={(val) => setSelectedDeptFilter(val)}
              style={{ width: '100%' }}
              options={[
                { value: 'ALL', label: 'Tất cả các Khoa trong Học viện' },
                { value: 'CNTT1', label: 'Khoa Công nghệ thông tin 1 (2 đề tài)' },
                { value: 'DPT', label: 'Khoa Đa phương tiện (1 đề tài)' },
                { value: 'QTKD', label: 'Khoa Quản trị kinh doanh (1 đề tài)' },
                { value: 'ATTT', label: 'Khoa An toàn thông tin (1 đề tài)' },
              ]}
            />
          </div>

          <div style={{ minWidth: 180 }}>
            <span style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>
              Lọc theo Kết quả xếp loại:
            </span>
            <Select
              value={selectedGradeFilter}
              onChange={(val) => setSelectedGradeFilter(val)}
              style={{ width: '100%' }}
              options={[
                { value: 'ALL', label: 'Tất cả kết quả' },
                { value: 'EXCELLENT', label: 'Xuất sắc (≥ 90 điểm)' },
                { value: 'GOOD', label: 'Tốt (80 - 89 điểm)' },
                { value: 'FAIR', label: 'Khá (70 - 79 điểm)' },
                { value: 'PENDING', label: 'Chờ bảo vệ' },
              ]}
            />
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <span style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 4 }}>
              Tìm kiếm đề tài:
            </span>
            <Input
              placeholder="Nhập tên đề tài, mã đề tài, sinh viên chủ nhiệm, GVHD..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSelectedDeptFilter('ALL');
                setSelectedGradeFilter('ALL');
                setSearchKeyword('');
              }}
            >
              Đặt lại
            </Button>
          </div>
        </div>

        {/* BẢNG TỔNG HỢP CÁC PHIÊN BẢO VỆ */}
        <Table
          rowKey="id"
          dataSource={filteredSessions}
          pagination={false}
          size="middle"
          rowClassName={(record) => (record.id === selectedSessionId ? 'ant-table-row-selected' : '')}
          onRow={(record) => ({
            onClick: () => setSelectedSessionId(record.id),
            style: {
              cursor: 'pointer',
              backgroundColor: record.id === selectedSessionId ? '#FFF2F0' : undefined,
            },
          })}
          columns={[
            {
              title: 'STT',
              width: 50,
              align: 'center',
              render: (_, __, idx) => idx + 1,
            },
            {
              title: 'Mã đề tài & Khoa',
              key: 'project_info',
              width: 170,
              render: (_, r) => (
                <div>
                  <b style={{ color: '#C62828', fontSize: 13 }}>{r.projectId}</b>
                  <div style={{ fontSize: 11, color: '#595959', marginTop: 2 }}>
                    <ApartmentOutlined style={{ marginRight: 3 }} /> {r.deptName}
                  </div>
                </div>
              ),
            },
            {
              title: 'Tên đề tài NCKH Sinh viên',
              dataIndex: 'titleVi',
              key: 'titleVi',
              render: (val, r) => (
                <div>
                  <div style={{ fontWeight: 600, color: '#262626', fontSize: 13, lineHeight: 1.4 }}>
                    {val}
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 3 }}>
                    Chủ nhiệm: <b>{r.leader.name}</b> ({r.leader.className}) • GVHD: <b>{r.advisor.name}</b>
                  </div>
                </div>
              ),
            },
            {
              title: 'Thời gian & Địa điểm bảo vệ',
              key: 'schedule',
              width: 220,
              render: (_, r) => (
                <div style={{ fontSize: 12 }}>
                  <div>
                    <CalendarOutlined style={{ color: '#C62828', marginRight: 4 }} />
                    <b>{r.defenseDate}</b> • {r.defenseTime}
                  </div>
                  <div style={{ color: '#595959', marginTop: 2 }}>
                    <EnvironmentOutlined style={{ color: '#C62828', marginRight: 4 }} />
                    {r.location}
                  </div>
                </div>
              ),
            },
            {
              title: 'Điểm & Xếp loại',
              key: 'score_grade',
              width: 160,
              align: 'center',
              render: (_, r) => {
                if (r.status === 'PENDING') {
                  return <Tag color="orange">Chờ bảo vệ</Tag>;
                }
                const tagColor =
                  r.grade === 'XUẤT SẮC' ? 'green' : r.grade === 'TỐT' ? 'blue' : 'gold';
                return (
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#C62828' }}>
                      {r.avgScore} đ
                    </div>
                    <Tag color={tagColor} style={{ marginTop: 2, fontWeight: 600 }}>
                      {r.grade}
                    </Tag>
                  </div>
                );
              },
            },
            ...(isStudentAffairs
              ? [
                  {
                    title: 'Điểm rèn luyện (CTSV)',
                    key: 'drl',
                    width: 150,
                    align: 'center' as const,
                    render: (_: any, r: any) =>
                      r.drlBonus ? (
                        <Tag color="volcano" style={{ fontWeight: 700, fontSize: 12 }}>
                          +{r.drlBonus} ĐRL (Đ.14)
                        </Tag>
                      ) : (
                        <span style={{ color: '#8c8c8c', fontSize: 11 }}>Chờ nghiệm thu</span>
                      ),
                  },
                ]
              : []),
            {
              title: 'Thao tác',
              key: 'action',
              width: 150,
              align: 'center',
              render: (_, r) => (
                <Space size={6}>
                  <Tooltip title="Xem chi tiết phiên bảo vệ">
                    <Button
                      size="small"
                      type={r.id === selectedSessionId ? 'primary' : 'default'}
                      style={{
                        backgroundColor: r.id === selectedSessionId ? '#C62828' : undefined,
                        borderColor: r.id === selectedSessionId ? '#C62828' : undefined,
                      }}
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSessionId(r.id);
                      }}
                    >
                      {r.id === selectedSessionId ? 'Đang chọn' : 'Xem'}
                    </Button>
                  </Tooltip>

                  <Tooltip title="Xem Biên bản Hội đồng (Mẫu 4.2)">
                    <Button
                      size="small"
                      icon={<FileDoneOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSessionId(r.id);
                        setMau42ModalVisible(true);
                      }}
                    />
                  </Tooltip>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* =========================================================================
          KHU VỰC 2: CHI TIẾT PHIÊN HỘI ĐỒNG BẢO VỆ CỦA ĐỀ TÀI ĐANG CHỌN
          ========================================================================= */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#C62828' }}>
                  {selectedSession.councilName}
                </span>
                <Tag color="purple">{selectedSession.deptName}</Tag>
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                Căn cứ: <b>{selectedSession.decisionNo}</b>
              </div>
            </div>

            <div>
              {selectedSession.status === 'ACCEPTED' ? (
                <Tag color="green" style={{ fontSize: 14, padding: '4px 14px', borderRadius: 12, fontWeight: 700 }}>
                  Xếp loại: {selectedSession.grade} ({selectedSession.avgScore}đ)
                </Tag>
              ) : (
                <Tag color="orange" style={{ fontSize: 14, padding: '4px 14px', borderRadius: 12, fontWeight: 700 }}>
                  Trạng thái: CHỜ BẢO VỆ
                </Tag>
              )}
            </div>
          </div>
        }
        style={{ borderRadius: 8, marginBottom: 20, border: '1px solid #EDEDEE' }}
      >
        {/* BOX TÓM TẮT THÔNG TIN ĐỀ TÀI & HỘI ĐỒNG */}
        <div style={{ backgroundColor: '#FAFAFA', padding: 18, borderRadius: 6, marginBottom: 18, fontSize: 13, lineHeight: 1.8 }}>
          <Row gutter={[16, 12]}>
            <Col xs={24} md={13}>
              <div>
                <CalendarOutlined style={{ color: '#C62828', marginRight: 6 }} /> Thời gian bảo vệ:{' '}
                <b>
                  {selectedSession.defenseDate} • {selectedSession.defenseTime}
                </b>
              </div>
              <div style={{ marginTop: 4 }}>
                <EnvironmentOutlined style={{ color: '#C62828', marginRight: 6 }} /> Địa điểm:{' '}
                <b>{selectedSession.location}</b>
              </div>
              <div style={{ marginTop: 6 }}>
                <FileDoneOutlined style={{ color: '#52C41A', marginRight: 6 }} /> Đề tài bảo vệ:{' '}
                <b style={{ color: '#C62828' }}>{selectedSession.projectId}</b>
              </div>
              <div style={{ fontSize: 13, color: '#262626', fontWeight: 600, paddingLeft: 22 }}>
                “{selectedSession.titleVi}”
              </div>
              <div style={{ fontSize: 12, color: '#595959', paddingLeft: 22, marginTop: 4 }}>
                • Sinh viên chủ trì: <b>{selectedSession.leader.name}</b> (MSSV: {selectedSession.leader.studentId} - Lớp {selectedSession.leader.className})
                <br />
                • Giảng viên hướng dẫn: <b>{selectedSession.advisor.name}</b> ({selectedSession.advisor.dept})
              </div>
            </Col>

            <Col xs={24} md={11}>
              <div>
                <TeamOutlined style={{ color: '#1890FF', marginRight: 6 }} />{' '}
                <b>Thành phần Hội đồng đánh giá (05 thành viên):</b>
              </div>
              <ul style={{ paddingLeft: 24, margin: '4px 0 0 0' }}>
                {evaluators.map((ev: any) => (
                  <li key={ev.id}>
                    <b>{ev.name}</b> ({ev.role})
                    {ev.total !== null && (
                      <>
                        {' '}
                        — <b style={{ color: '#C62828' }}>{ev.total}đ</b> ({ev.grade})
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
        </div>

        {/* 3 NÚT XEM TÀI LIỆU SỐ HÓA A4 CHUẨN XÁC */}
        <Space size={12} wrap>
          <Button
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600 }}
            icon={<EyeOutlined />}
            onClick={() => setMau41ModalVisible(true)}
          >
            Xem Phiếu chấm 7 tiêu chí (Mẫu 4.1)
          </Button>

          <Button
            style={{ fontWeight: 600, color: '#C62828', borderColor: '#C62828' }}
            icon={<FileDoneOutlined />}
            onClick={() => setMau42ModalVisible(true)}
          >
            Xem Biên bản Hội đồng (Mẫu 4.2)
          </Button>

          <Button
            style={{ fontWeight: 600 }}
            icon={<FileTextOutlined />}
            onClick={() => setMau43ModalVisible(true)}
          >
            Xem Nhận xét phản biện (Mẫu 4.3)
          </Button>

          {isLecturerOrAdmin && (
            <Button
              type="primary"
              style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontWeight: 600 }}
              icon={<EditOutlined />}
              onClick={() => setScoreFormModalVisible(true)}
            >
              Chấm điểm đề tài này
            </Button>
          )}
        </Space>
      </Card>

      {/* =========================================================================
          KHU VỰC 3: BẢNG TỔNG HỢP ĐIỂM CHI TIẾT 5 THÀNH VIÊN VÀ ĐỐI SOÁT HỢP LỆ
          ========================================================================= */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              Bảng Tổng hợp Điểm Đánh giá Chi tiết của 5 Thành viên Hội đồng (Điều 10 QĐ 521)
            </span>
            {selectedSession.status === 'ACCEPTED' ? (
              <Tag color="cyan">5/5 Phiếu hợp lệ (Độ lệch tối đa ≤ 15đ)</Tag>
            ) : (
              <Tag color="orange">Đang chờ thành viên Hội đồng hoàn tất chấm điểm</Tag>
            )}
          </div>
        }
        style={{ borderRadius: 8, marginBottom: 24, border: '1px solid #EDEDEE' }}
      >
        <Table
          rowKey="id"
          dataSource={evaluators}
          pagination={false}
          columns={[
            { title: 'TT', dataIndex: 'id', width: 50, align: 'center' },
            {
              title: 'Họ và tên thành viên',
              key: 'name',
              render: (_: any, r: any) => (
                <div>
                  <div style={{ fontWeight: 700, color: '#262626' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.title}</div>
                </div>
              ),
            },
            {
              title: 'Chức danh Hội đồng',
              dataIndex: 'role',
              key: 'role',
              width: 180,
              render: (v: any) => <Tag color="blue">{v}</Tag>,
            },
            {
              title: 'Điểm chấm (Thang 100)',
              dataIndex: 'total',
              key: 'total',
              width: 160,
              align: 'center',
              render: (v: any) =>
                v !== null ? (
                  <b style={{ color: '#C62828', fontSize: 15 }}>{v} đ</b>
                ) : (
                  <span style={{ color: '#8c8c8c' }}>Chờ chấm</span>
                ),
            },
            {
              title: 'Độ lệch so với TB',
              key: 'diff',
              width: 180,
              align: 'center',
              render: (_: any, r: any) => {
                if (r.total === null || selectedSession.avgScore === null) {
                  return <span style={{ color: '#8c8c8c' }}>—</span>;
                }
                const diff = Math.abs(r.total - selectedSession.avgScore).toFixed(1);
                return <span style={{ color: '#52C41A', fontWeight: 600 }}>±{diff}đ (Hợp lệ)</span>;
              },
            },
            {
              title: 'Xếp loại',
              dataIndex: 'grade',
              key: 'grade',
              width: 120,
              align: 'center',
              render: (v: any) => (
                <Tag color={v === 'Xuất sắc' ? 'green' : v === 'Tốt' ? 'blue' : 'gold'}>
                  {v}
                </Tag>
              ),
            },
            {
              title: 'Thao tác số hóa',
              key: 'action',
              width: 140,
              align: 'center',
              render: (_: any, __: any, idx: number) => (
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedEvaluatorIndex(idx);
                    setMau41ModalVisible(true);
                  }}
                >
                  Xem phiếu A4
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {/* =========================================================================
          MODAL 1: XEM TRƯỚC PHIẾU CHẤM 7 TIÊU CHÍ (MẪU 4.1) SỐ HÓA A4
          ========================================================================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: '#C62828', fontSize: 18 }} />
            <span>Mẫu 4.1: Phiếu Đánh Giá Nghiệm Thu Đề Tài NCKH Sinh Viên (7 Tiêu chí - QĐ 521)</span>
          </div>
        }
        open={mau41ModalVisible}
        onCancel={() => setMau41ModalVisible(false)}
        width={940}
        footer={[
          <Button key="close" onClick={() => setMau41ModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            icon={<PrinterOutlined />}
            onClick={() =>
              printElement(
                'preview-mau41-sheet',
                `Phieu_Danh_Gia_Mau41_${selectedEvaluator?.name || 'Ủy_viên'}`,
              )
            }
          >
            In Phiếu chấm A4
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Space>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Chọn phiếu chấm của Ủy viên:</span>
            <Select
              value={selectedEvaluatorIndex}
              onChange={(val) => setSelectedEvaluatorIndex(val)}
              style={{ width: 340 }}
              options={evaluators.map((ev: any, i: number) => ({
                value: i,
                label: `${i + 1}. ${ev.name} (${ev.role}) — ${ev.total !== null ? `${ev.total}đ` : 'Chờ chấm'}`,
              }))}
            />
          </Space>
          {selectedEvaluator?.total !== null && (
            <Tag color="green" style={{ fontSize: 13, padding: '3px 10px', fontWeight: 600 }}>
              Điểm chấm: {selectedEvaluator.total} / 100đ ({selectedEvaluator.grade})
            </Tag>
          )}
        </div>

        <div style={{ maxHeight: '72vh', overflowY: 'auto', backgroundColor: '#525659', padding: '20px 10px', borderRadius: 6 }}>
          <Mau41PhieuDanhGia
            project={selectedProjectForDocs}
            evaluator={selectedEvaluator}
            printableId="preview-mau41-sheet"
          />
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 2: XEM TRƯỚC BIÊN BẢN HỌP HỘI ĐỒNG (MẪU 4.2) SỐ HÓA A4
          ========================================================================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileDoneOutlined style={{ color: '#C62828', fontSize: 18 }} />
            <span>Mẫu 4.2: Biên Bản Họp Hội Đồng Đánh Giá Nghiệm Thu Đề Tài NCKH Sinh Viên</span>
          </div>
        }
        open={mau42ModalVisible}
        onCancel={() => setMau42ModalVisible(false)}
        width={940}
        footer={[
          <Button key="close" onClick={() => setMau42ModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            icon={<PrinterOutlined />}
            onClick={() =>
              printElement('preview-mau42-sheet', `Bien_Ban_Hoi_Dong_Mau_4.2_${selectedSession.projectId}`)
            }
          >
            In Biên bản Hội đồng A4
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Biên bản chính thức tổng hợp điểm số 5 thành viên, xác nhận tính hợp lệ và kiến nghị khen thưởng.
          </Text>
          {selectedSession.avgScore && (
            <Tag color="red" style={{ fontWeight: 700 }}>
              Điểm chính thức: {selectedSession.avgScore}đ ({selectedSession.grade})
            </Tag>
          )}
        </div>

        <div style={{ maxHeight: '72vh', overflowY: 'auto', backgroundColor: '#525659', padding: '20px 10px', borderRadius: 6 }}>
          <Mau42BienBanHoiDong
            project={selectedProjectForDocs}
            printableId="preview-mau42-sheet"
          />
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 3: XEM TRƯỚC BẢN NHẬN XÉT PHẢN BIỆN (MẪU 4.3) SỐ HÓA A4
          ========================================================================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AuditOutlined style={{ color: '#C62828', fontSize: 18 }} />
            <span>Mẫu 4.3: Bản Nhận Xét Phản Biện Đề Tài NCKH Sinh Viên ({selectedProjectForDocs.reviewer?.name || 'Ủy viên Phản biện'})</span>
          </div>
        }
        open={mau43ModalVisible}
        onCancel={() => setMau43ModalVisible(false)}
        width={940}
        footer={[
          <Button key="close" onClick={() => setMau43ModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            icon={<PrinterOutlined />}
            onClick={() =>
              printElement('preview-mau43-sheet', `Ban_Nhan_Xet_Phan_Bien_Mau_4.3_${selectedSession.projectId}`)
            }
          >
            In Bản nhận xét A4
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Đánh giá chuyên sâu của Ủy viên Phản biện về tính mới, tính khoa học và giá trị thực tiễn của giải pháp.
          </Text>
        </div>

        <div style={{ maxHeight: '72vh', overflowY: 'auto', backgroundColor: '#525659', padding: '20px 10px', borderRadius: 6 }}>
          <Mau43BanNhanXet
            project={selectedProjectForDocs}
            printableId="preview-mau43-sheet"
          />
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 4: BIỂU MẪU CHẤM ĐIỂM TRỰC TUYẾN 7 TIÊU CHÍ (DÀNH CHO THÀNH VIÊN HỘI ĐỒNG)
          ========================================================================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditOutlined style={{ color: '#52C41A', fontSize: 18 }} />
            <span>Chấm Điểm Đề Tài Trực Tuyến - Phiếu Đánh Giá Mẫu 4.1 ({selectedSession.projectId})</span>
          </div>
        }
        open={scoreFormModalVisible}
        onCancel={() => setScoreFormModalVisible(false)}
        footer={null}
        width={720}
      >
        <Form
          form={scoreForm}
          layout="vertical"
          initialValues={liveScores}
          onValuesChange={handleScoreChange}
          onFinish={handleSubmitScore}
        >
          <div style={{ backgroundColor: '#F6FFED', border: '1px solid #B7EB8F', padding: 12, borderRadius: 6, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b>Người chấm:</b> {user?.fullName || 'PGS.TS. Hoàng Minh'} (Ủy viên Hội đồng)
                <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>
                  Đề tài: <b>{selectedSession.projectId}</b> — {selectedSession.titleVi}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>Tổng điểm tự động:</span>
                <span style={{ fontSize: 20, color: '#C62828', fontWeight: 800 }}>{liveTotal} / 100đ</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#52C41A', marginTop: 4 }}>
              Dự kiến xếp loại: <b>{liveTotal >= 90 ? 'Xuất sắc' : liveTotal >= 80 ? 'Tốt' : liveTotal >= 70 ? 'Khá' : 'Đạt'}</b>
            </div>
          </div>

          <Row gutter={16}>
            <Col span={18}>
              <span style={{ fontSize: 13 }}>1. Tổng quan tình hình nghiên cứu, lý do chọn đề tài (Max: 10đ)</span>
            </Col>
            <Col span={6}>
              <Form.Item name="score1" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={18}>
              <span style={{ fontSize: 13 }}>2. Mục tiêu đề tài (Max: 15đ)</span>
            </Col>
            <Col span={6}>
              <Form.Item name="score2" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                <InputNumber min={0} max={15} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={18}>
              <span style={{ fontSize: 13 }}>3. Phương pháp nghiên cứu và cách tiếp cận khoa học (Max: 15đ)</span>
            </Col>
            <Col span={6}>
              <Form.Item name="score3" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                <InputNumber min={0} max={15} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={18}>
              <span style={{ fontSize: 13 }}>4. Nội dung khoa học & chất lượng sản phẩm (Max: 35đ)</span>
            </Col>
            <Col span={6}>
              <Form.Item name="score4" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                <InputNumber min={0} max={35} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={18}>
              <span style={{ fontSize: 13 }}>5. Đóng góp kinh tế - xã hội, ứng dụng chuyển đổi số PTIT (Max: 15đ)</span>
            </Col>
            <Col span={6}>
              <Form.Item name="score5" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                <InputNumber min={0} max={15} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={18}>
              <span style={{ fontSize: 13 }}>6. Hình thức trình bày báo cáo tổng kết (Max: 5đ)</span>
            </Col>
            <Col span={6}>
              <Form.Item name="score6" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                <InputNumber min={0} max={5} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={18}>
              <span style={{ fontSize: 13 }}>7. Điểm thưởng có bài báo công bố khoa học (Max: 5đ)</span>
            </Col>
            <Col span={6}>
              <Form.Item name="score7" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                <InputNumber min={0} max={5} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Nhận xét chuyên môn & Kiến nghị xếp loại" name="comment" style={{ marginTop: 12 }}>
            <Input.TextArea
              rows={3}
              placeholder="Nhập nhận xét chi tiết về ưu điểm, nhược điểm và kiến nghị trao giải..."
              defaultValue="Đề tài giải quyết vấn đề thực tế cấp thiết của Học viện. Phương pháp nghiên cứu bài bản, sản phẩm hoàn thiện cao, ứng dụng thực tế tốt."
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setScoreFormModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#52C41A', borderColor: '#52C41A' }}>
                Ký số & Nộp Phiếu chấm điểm điện tử
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* =========================================================================
          MODAL 5: THÀNH LẬP HỘI ĐỒNG NGHIỆM THU MỚI (LÃNH ĐẠO KHOA / P.QLKHCN)
          ========================================================================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TeamOutlined style={{ color: '#C62828', fontSize: 18 }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#262626' }}>
              Thành lập Hội đồng Đánh giá Nghiệm thu Đề tài NCKH mới
            </span>
          </div>
        }
        open={newCouncilModalVisible}
        onCancel={() => setNewCouncilModalVisible(false)}
        footer={null}
        width={720}
      >
        <Form form={councilForm} layout="vertical" onFinish={handleCreateCouncil}>
          <div style={{ backgroundColor: '#FFF2F0', border: '1px solid #FFCCC7', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 12 }}>
            Căn cứ Điều 10 QĐ 521/QĐ-HV, Hội đồng đánh giá nghiệm thu gồm <b>05 thành viên</b> (Chủ tịch, 02 Ủy viên phản biện, Thư ký, Ủy viên/GVHD).
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="projectId" label="Mã đề tài cần nghiệm thu" initialValue="SV-2026-CNTT1-006" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: SV-2026-CNTT1-006" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="decisionNo" label="Căn cứ Quyết định Giám đốc Học viện" initialValue="158/QĐ-HV ngày 02/05/2027" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: 158/QĐ-HV" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="titleVi" label="Tên đề tài NCKH sinh viên" initialValue="Xây dựng trợ lý ảo hỗ trợ học tập dựa trên mô hình ngôn ngữ lớn cho sinh viên PTIT" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên đề tài chính xác..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="councilName" label="Tên Hội đồng nghiệm thu" initialValue="Hội đồng nghiệm thu đề tài NCKH sinh viên Khoa CNTT1 số 06" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="defenseDate" label="Ngày bảo vệ" rules={[{ required: true }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="defenseTime" label="Giờ bảo vệ" initialValue="08:30" rules={[{ required: true }]}>
                <Input placeholder="08:30" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="location" label="Địa điểm bảo vệ" initialValue="Phòng họp 2 - Nhà A2, PTIT" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Hội trường A2 hoặc Phòng họp 204-A2" />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }}>Phân công 5 Thành viên Hội đồng</Divider>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="chairName" label="1. Chủ tịch Hội đồng" initialValue="PGS.TS. Trần Đình Quế" rules={[{ required: true }]}>
                <Input placeholder="Họ tên Chủ tịch Hội đồng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reviewer1Name" label="2. Ủy viên Phản biện 1" initialValue="TS. Vũ Trọng Hùng" rules={[{ required: true }]}>
                <Input placeholder="Họ tên Phản biện 1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="reviewer2Name" label="3. Ủy viên Phản biện 2" initialValue="TS. Trần Mai Lan" rules={[{ required: true }]}>
                <Input placeholder="Họ tên Phản biện 2" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="secretaryName" label="4. Thư ký Hội đồng" initialValue="ThS. Nguyễn Thị Lan" rules={[{ required: true }]}>
                <Input placeholder="Họ tên Thư ký Hội đồng" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="advisorName" label="5. Ủy viên Hội đồng (GVHD)" initialValue="TS. Ngô Quốc Dũng" rules={[{ required: true }]}>
                <Input placeholder="Họ tên Giảng viên hướng dẫn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="leaderName" label="Sinh viên Chủ nhiệm đề tài" initialValue="Lê Minh Khang" rules={[{ required: true }]}>
                <Input placeholder="Họ tên sinh viên chủ nhiệm" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setNewCouncilModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600 }}>
                Thành lập Hội đồng & Ban hành Quyết định
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
