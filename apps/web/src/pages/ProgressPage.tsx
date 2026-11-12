import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Timeline,
  Modal,
  message,
  Alert,
  Row,
  Col,
  Tabs,
  Tooltip,
  Divider,
  Checkbox,
  Input,
  DatePicker,
  TimePicker,
  Form,
  Select,
  Progress,
} from 'antd';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileDoneOutlined,
  PlusOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  UserOutlined,
  MailOutlined,
  SendOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  VideoCameraOutlined,
  NotificationOutlined,
  SolutionOutlined,
  SyncOutlined,
  ApartmentOutlined,
  LaptopOutlined,
  FormOutlined,
  CheckOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { printElement } from '../utils/printHelper';

const { Title, Text } = Typography;
const { TextArea } = Input;

export interface SeminarAttendee {
  id: string;
  name: string;
  role: 'CHAIR' | 'SECRETARY' | 'REVIEWER' | 'ADVISOR' | 'STUDENT';
  roleTitle: string;
  email: string;
  department: string;
  status: 'ACCEPTED_ONSITE' | 'ACCEPTED_ONLINE' | 'PENDING' | 'DECLINED';
  phone?: string;
  respondedAt?: string;
}

export interface SeminarItem {
  id: number;
  projectId: string;
  projectTitle: string;
  studentLeader: string;
  studentClass: string;
  studentCode: string;
  advisor: string;
  advisorTitle: string;
  title: string;
  date: string;
  time: string;
  location: string;
  onlineLink: string;
  chair: string;
  secretary: string;
  status: 'SCHEDULED' | 'INVITATION_SENT' | 'COMPLETED';
  statusText: string;
  invitationCode: string;
  invitationSentAt?: string;
  attendeesList: SeminarAttendee[];
  agenda: { time: string; activity: string; speaker: string }[];
  feedbackNotes?: { author: string; role: string; comment: string }[];
  conclusion?: string;
}

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';
  const isFacultyRole = roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY' || roleCode === 'ADMIN' || roleCode === 'QLKHCN';

  // State quản lý danh sách Hội thảo & Sinh hoạt KH (Kho D4: SEMINARS & SEMINAR_MEMBERS)
  const [seminars, setSeminars] = useState<SeminarItem[]>([
    {
      id: 1,
      projectId: 'SV-2026-CNTT1-001',
      projectTitle: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
      studentLeader: 'Nguyễn Văn An',
      studentClass: 'D23CQCN01-B',
      studentCode: 'B23DCCN001',
      advisor: 'TS. Ngô Quốc Dũng',
      advisorTitle: 'Giảng viên Bộ môn Công nghệ phần mềm',
      title: 'Hội thảo khoa học Khoa CNTT 1 - Báo cáo tiến độ đợt 1 & Góp ý chuyên môn (Mẫu 3.5)',
      date: '20/12/2026',
      time: '08:30 - 11:30',
      location: 'Phòng Hội thảo Tầng 2 - Nhà A2, Học viện PTIT Cơ sở Hà Đông',
      onlineLink: 'https://meet.google.com/srms-nckh-cntt1',
      chair: 'PGS.TS. Hoàng Minh',
      secretary: 'ThS. Đỗ Thị Thu Hiền',
      status: 'INVITATION_SENT',
      statusText: 'Đã phát hành thư mời',
      invitationCode: '128/GM-CNTT1',
      invitationSentAt: '15/12/2026 09:30',
      attendeesList: [
        {
          id: 'att-1',
          name: 'PGS.TS. Hoàng Minh',
          role: 'CHAIR',
          roleTitle: 'Trưởng Khoa CNTT 1 - Chủ trì',
          email: 'minhhm@ptit.edu.vn',
          department: 'Khoa Công nghệ thông tin 1',
          status: 'ACCEPTED_ONSITE',
          phone: '0912.345.678',
          respondedAt: '15/12/2026 10:15',
        },
        {
          id: 'att-2',
          name: 'TS. Nguyễn Thị Mai Dung',
          role: 'CHAIR',
          roleTitle: 'Phó Trưởng Khoa CNTT 1',
          email: 'dungntm@ptit.edu.vn',
          department: 'Khoa Công nghệ thông tin 1',
          status: 'ACCEPTED_ONSITE',
          phone: '0983.210.987',
          respondedAt: '15/12/2026 11:00',
        },
        {
          id: 'att-3',
          name: 'ThS. Đỗ Thị Thu Hiền',
          role: 'SECRETARY',
          roleTitle: 'Thư ký Khoa CNTT 1',
          email: 'hiendtt@ptit.edu.vn',
          department: 'Văn phòng Khoa CNTT 1',
          status: 'ACCEPTED_ONSITE',
          phone: '0977.888.999',
          respondedAt: '15/12/2026 09:45',
        },
        {
          id: 'att-4',
          name: 'TS. Trần Đình Trí',
          role: 'REVIEWER',
          roleTitle: 'Trưởng Bộ môn Công nghệ phần mềm',
          email: 'tritd@ptit.edu.vn',
          department: 'Bộ môn CNPM',
          status: 'ACCEPTED_ONSITE',
          phone: '0904.555.666',
          respondedAt: '15/12/2026 14:20',
        },
        {
          id: 'att-5',
          name: 'TS. Đinh Quang Huy',
          role: 'REVIEWER',
          roleTitle: 'Giảng viên Chuyên gia Phản biện',
          email: 'huydq@ptit.edu.vn',
          department: 'Bộ môn Hệ thống thông tin',
          status: 'ACCEPTED_ONLINE',
          phone: '0913.777.888',
          respondedAt: '16/12/2026 08:10',
        },
        {
          id: 'att-6',
          name: 'TS. Ngô Quốc Dũng',
          role: 'ADVISOR',
          roleTitle: 'Giảng viên Hướng dẫn đề tài',
          email: 'dungnq@ptit.edu.vn',
          department: 'Bộ môn CNPM',
          status: 'ACCEPTED_ONSITE',
          phone: '0988.123.456',
          respondedAt: '15/12/2026 10:05',
        },
        {
          id: 'att-7',
          name: 'Nguyễn Văn An',
          role: 'STUDENT',
          roleTitle: 'Chủ nhiệm đề tài (Lớp D23CQCN01-B)',
          email: 'an.nv@stu.ptit.edu.vn',
          department: 'Sinh viên Khoa CNTT 1',
          status: 'ACCEPTED_ONSITE',
          phone: '0961.111.222',
          respondedAt: '15/12/2026 09:35',
        },
        {
          id: 'att-8',
          name: 'Trần Thị Mai',
          role: 'STUDENT',
          roleTitle: 'Thành viên nghiên cứu (B23DCCN022)',
          email: 'mai.tt@stu.ptit.edu.vn',
          department: 'Sinh viên Khoa CNTT 1',
          status: 'ACCEPTED_ONSITE',
          phone: '0962.333.444',
          respondedAt: '15/12/2026 09:40',
        },
        {
          id: 'att-9',
          name: 'Lê Hoàng Long',
          role: 'STUDENT',
          roleTitle: 'Thành viên nghiên cứu (B23DCCN034)',
          email: 'long.lh@stu.ptit.edu.vn',
          department: 'Sinh viên Khoa CNTT 1',
          status: 'PENDING',
          phone: '0963.555.666',
        },
      ],
      agenda: [
        { time: '08:30 - 08:45', activity: 'Tuyên bố lý do, giới thiệu thành phần đại biểu và thông qua chương trình', speaker: 'ThS. Đỗ Thị Thu Hiền (Thư ký)' },
        { time: '08:45 - 09:30', activity: 'Nhóm sinh viên báo cáo tiến độ Mốc 2 và demo sản phẩm phần mềm trung gian', speaker: 'Sinh viên Nguyễn Văn An (Chủ nhiệm)' },
        { time: '09:30 - 10:30', activity: 'Các nhà khoa học, giảng viên trao đổi, chất vấn và đóng góp ý kiến chuyên môn', speaker: 'TS. Trần Đình Trí & TS. Đinh Quang Huy' },
        { time: '10:30 - 11:00', activity: 'Giảng viên hướng dẫn phát biểu nhận xét, định hướng triển khai Mốc 3', speaker: 'TS. Ngô Quốc Dũng (GVHD)' },
        { time: '11:00 - 11:30', activity: 'Chủ trì kết luận đánh giá tiến độ, thư ký thông qua Biên bản Mẫu 3.5', speaker: 'PGS.TS. Hoàng Minh (Trưởng Khoa)' },
      ],
      feedbackNotes: [
        { author: 'TS. Trần Đình Trí', role: 'Trưởng BM CNPM', comment: 'Kiến trúc giải pháp rõ ràng, tiến độ đạt 85% khối lượng giai đoạn 1. Đề nghị bổ sung ma trận kiểm thử tải và phân quyền RBAC chi tiết.' },
        { author: 'TS. Đinh Quang Huy', role: 'Phản biện chuyên môn', comment: 'Giao diện theo chuẩn S-Link trực quan, hỗ trợ tốt quy trình phê duyệt điện tử. Cần hoàn thiện xuất file PDF Mẫu 4.1 và 4.2.' },
        { author: 'TS. Ngô Quốc Dũng', role: 'GVHD', comment: 'Nhóm sinh viên chủ động, làm việc nghiêm túc, bám sát các mục tiêu nghiên cứu đã cam kết trong Đề cương Mẫu 2.' },
      ],
      conclusion: 'Hội đồng Khoa nhất trí đánh giá Đề tài đạt yêu cầu tiến độ Mốc 2 (Khá - Tốt). Đề nghị nhóm sinh viên tiếp thu các ý kiến góp ý, tiếp tục triển khai Mốc 3 và chuẩn bị hồ sơ nghiệm thu chính thức.',
    },
    {
      id: 2,
      projectId: 'SV-2026-CNTT1-002',
      projectTitle: 'Mobile AR Apps and Impulse Buying: Perspectives from Indonesian Consumers and Tourists',
      studentLeader: 'Nguyễn Minh Tuấn',
      studentClass: 'D23CQDT01-B',
      studentCode: 'B23DCDT015',
      advisor: 'TS. Trần Đình Trí',
      advisorTitle: 'Giảng viên Bộ môn CNPM',
      title: 'Sinh hoạt học thuật Bộ môn Hệ thống thông tin - Đánh giá tiến độ đề tài NCKH',
      date: '15/01/2027',
      time: '14:00 - 16:30',
      location: 'Văn phòng Bộ môn HTTT, Phòng 305 Nhà A2, Cơ sở Hà Đông',
      onlineLink: 'https://meet.google.com/srms-httt-nckh',
      chair: 'TS. Ngô Quốc Dũng',
      secretary: 'ThS. Nguyễn Văn B',
      status: 'SCHEDULED',
      statusText: 'Kế hoạch (Chưa gửi thư mời)',
      invitationCode: '145/GM-CNTT1',
      attendeesList: [
        {
          id: 'att-201',
          name: 'TS. Ngô Quốc Dũng',
          role: 'CHAIR',
          roleTitle: 'Trưởng Bộ môn HTTT - Chủ trì',
          email: 'dungnq@ptit.edu.vn',
          department: 'Bộ môn Hệ thống thông tin',
          status: 'PENDING',
        },
        {
          id: 'att-202',
          name: 'ThS. Nguyễn Văn B',
          role: 'SECRETARY',
          roleTitle: 'Thư ký Bộ môn',
          email: 'nguyenvanb@ptit.edu.vn',
          department: 'Bộ môn Hệ thống thông tin',
          status: 'PENDING',
        },
        {
          id: 'att-203',
          name: 'TS. Trần Đình Trí',
          role: 'ADVISOR',
          roleTitle: 'Giảng viên Hướng dẫn',
          email: 'tritd@ptit.edu.vn',
          department: 'Bộ môn CNPM',
          status: 'PENDING',
        },
        {
          id: 'att-204',
          name: 'Nguyễn Minh Tuấn',
          role: 'STUDENT',
          roleTitle: 'Chủ nhiệm đề tài (Lớp D23CQDT01-B)',
          email: 'tuan.nm@stu.ptit.edu.vn',
          department: 'Khoa Đa phương tiện',
          status: 'PENDING',
        },
      ],
      agenda: [
        { time: '14:00 - 14:15', activity: 'Khai mạc và phổ biến yêu cầu sinh hoạt chuyên đề', speaker: 'TS. Ngô Quốc Dũng' },
        { time: '14:15 - 15:00', activity: 'Nhóm sinh viên trình bày kết quả khảo sát thực nghiệm và mô hình hồi quy', speaker: 'Nguyễn Minh Tuấn' },
        { time: '15:00 - 16:00', activity: 'Góp ý chuyên môn về phân tích dữ liệu SPSS/SmartPLS', speaker: 'Các thành viên Bộ môn' },
        { time: '16:00 - 16:30', activity: 'Tổng hợp kết luận và ký biên bản Mẫu 3.5', speaker: 'TS. Ngô Quốc Dũng' },
      ],
    },
  ]);

  // Modal State
  const [selectedSeminar, setSelectedSeminar] = useState<SeminarItem>(seminars[0]);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [minutesModalVisible, setMinutesModalVisible] = useState(false);
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Form State cho Thư mời
  const [sendingInvite, setSendingInvite] = useState(false);
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);
  const [sendInApp, setSendInApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [syncCalendar, setSyncCalendar] = useState(true);
  const [invitationNote, setInvitationNote] = useState(
    'Trân trọng kính mời Quý Thầy/Cô và các em sinh viên tham dự đúng giờ. Các nhóm sinh viên chuẩn bị trước slide báo cáo (15 phút) và bản in sản phẩm trung gian.'
  );

  const [createForm] = Form.useForm();

  // Xử lý mở Modal Gửi Thư Mời
  const handleOpenInviteModal = (sem: SeminarItem) => {
    setSelectedSeminar(sem);
    setSelectedAttendeeIds(sem.attendeesList.map((a) => a.id));
    setInviteModalVisible(true);
  };

  // Thực hiện Gửi thư mời đa kênh (DFD 4.3 -> DFD 8.1 & 8.2)
  const handleSendInvitations = () => {
    if (selectedAttendeeIds.length === 0) {
      message.warning('Vui lòng chọn ít nhất 01 đại biểu nhận thư mời!');
      return;
    }
    setSendingInvite(true);
    setTimeout(() => {
      const nowStr = new Date().toLocaleString('vi-VN');
      setSeminars((prev) =>
        prev.map((s) => {
          if (s.id === selectedSeminar.id) {
            return {
              ...s,
              status: 'INVITATION_SENT',
              statusText: 'Đã phát hành thư mời',
              invitationSentAt: nowStr,
              attendeesList: s.attendeesList.map((a) =>
                selectedAttendeeIds.includes(a.id)
                  ? { ...a, status: a.status === 'PENDING' ? 'PENDING' : a.status }
                  : a
              ),
            };
          }
          return s;
        })
      );
      setSendingInvite(false);
      setInviteModalVisible(false);
      message.success(
        `Đã phát hành Thư mời tham dự (${selectedSeminar.invitationCode}) tới ${selectedAttendeeIds.length} đại biểu qua hệ thống S-Link & Email tự động!`
      );
    }, 1000);
  };

  // Gửi lại lời nhắc (Reminder) cho các đại biểu chưa xác nhận
  const handleResendReminder = () => {
    const pendingCount = selectedSeminar.attendeesList.filter((a) => a.status === 'PENDING').length;
    if (pendingCount === 0) {
      message.info('Tất cả đại biểu đã hoàn tất phản hồi xác nhận tham dự!');
      return;
    }
    message.loading('Đang gửi thông báo nhắc lịch tham dự tới các đại biểu chờ phản hồi...');
    setTimeout(() => {
      message.success(`Đã gửi lại thông báo nhắc hạn tới ${pendingCount} đại biểu thành công!`);
    }, 800);
  };

  // Khởi tạo và đồng bộ realtime trạng thái phản hồi RSVP từ localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem('srms_seminar_attendance_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSeminars(parsed);
          setSelectedSeminar(parsed[0]);
        }
      }
    } catch (e) {}
  }, []);

  // Xác định đại biểu tương ứng với tài khoản đang đăng nhập
  const getMyAttendee = (attendeesList: SeminarAttendee[]) => {
    const userFullName = (user?.fullName || '').toLowerCase();

    // 1. Nếu là sinh viên
    if (roleCode === 'STUDENT') {
      return (
        attendeesList.find(
          (a) =>
            a.role === 'STUDENT' &&
            (a.name.toLowerCase().includes(userFullName) ||
              userFullName.includes(a.name.toLowerCase()) ||
              a.id === 'att-7')
        ) || attendeesList.find((a) => a.role === 'STUDENT')
      );
    }

    // 2. Nếu là GVHD
    if (roleCode === 'LECTURER') {
      return (
        attendeesList.find(
          (a) =>
            (a.role === 'ADVISOR' || a.role === 'REVIEWER') &&
            (a.name.toLowerCase().includes(userFullName) ||
              userFullName.includes(a.name.toLowerCase()) ||
              (userFullName.includes('dũng') && a.id === 'att-6') ||
              (userFullName.includes('trí') && a.id === 'att-4') ||
              (userFullName.includes('huy') && a.id === 'att-5'))
        ) || attendeesList.find((a) => a.role === 'ADVISOR')
      );
    }

    // 3. Nếu là Thư ký Khoa
    if (roleCode === 'FACULTY_SECRETARY') {
      return attendeesList.find((a) => a.role === 'SECRETARY');
    }

    // 4. Nếu là Trưởng Khoa / Lãnh đạo Khoa
    if (roleCode === 'FACULTY_LEADER') {
      return attendeesList.find((a) => a.role === 'CHAIR');
    }

    // Mặc định khớp theo họ tên
    return attendeesList.find(
      (a) => a.name.toLowerCase().includes(userFullName) || userFullName.includes(a.name.toLowerCase())
    );
  };

  // Xử lý RSVP Cập nhật Realtime (Đại biểu / Sinh viên xác nhận tham dự)
  const handleUpdateRsvp = (seminarId: number, status: 'ACCEPTED_ONSITE' | 'ACCEPTED_ONLINE' | 'DECLINED') => {
    const nowStr = new Date().toLocaleString('vi-VN');

    setSeminars((prev) => {
      const updated = prev.map((s) => {
        if (s.id === seminarId) {
          const myAtt = getMyAttendee(s.attendeesList);
          const targetId = myAtt?.id || 'att-7';

          const updatedAttendees = s.attendeesList.map((a) => {
            if (a.id === targetId) {
              return {
                ...a,
                status,
                respondedAt: nowStr,
              };
            }
            return a;
          });

          const updatedSem = { ...s, attendeesList: updatedAttendees };
          if (selectedSeminar && selectedSeminar.id === seminarId) {
            setSelectedSeminar(updatedSem);
          }
          return updatedSem;
        }
        return s;
      });

      // Lưu realtime vào localStorage để đồng bộ giữa các tab & các phiên
      try {
        localStorage.setItem('srms_seminar_attendance_v1', JSON.stringify(updated));
      } catch (e) {}

      return updated;
    });

    if (status === 'ACCEPTED_ONSITE') {
      message.success('✓ Bạn đã xác nhận THAM DỰ TRỰC TIẾP tại phòng hội thảo thành công!');
    } else if (status === 'ACCEPTED_ONLINE') {
      message.success('💻 Bạn đã xác nhận THAM DỰ TRỰC TUYẾN qua Google Meet thành công!');
    } else {
      message.warning('✕ Đã ghi nhận thông báo vắng mặt có lý do của bạn.');
    }
  };

  // Tạo Hội thảo mới (Thư ký / Lãnh đạo Khoa)
  const handleCreateSeminar = (values: any) => {
    const newSem: SeminarItem = {
      id: Date.now(),
      projectId: values.projectId || 'SV-2026-CNTT1-001',
      projectTitle: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
      studentLeader: 'Nguyễn Văn An',
      studentClass: 'D23CQCN01-B',
      studentCode: 'B23DCCN001',
      advisor: 'TS. Ngô Quốc Dũng',
      advisorTitle: 'Giảng viên Bộ môn CNPM',
      title: values.title,
      date: values.date ? values.date.format('DD/MM/YYYY') : '25/12/2026',
      time: `${values.startTime ? values.startTime.format('HH:mm') : '08:30'} - ${values.endTime ? values.endTime.format('HH:mm') : '11:30'}`,
      location: values.location,
      onlineLink: values.onlineLink || 'https://meet.google.com/srms-nckh-new',
      chair: values.chair || 'PGS.TS. Hoàng Minh',
      secretary: values.secretary || 'ThS. Đỗ Thị Thu Hiền',
      status: 'SCHEDULED',
      statusText: 'Kế hoạch (Chưa gửi thư mời)',
      invitationCode: `${Math.floor(100 + Math.random() * 900)}/GM-CNTT1`,
      attendeesList: [
        {
          id: 'new-att-1',
          name: values.chair || 'PGS.TS. Hoàng Minh',
          role: 'CHAIR',
          roleTitle: 'Chủ trì phiên họp',
          email: 'minhhm@ptit.edu.vn',
          department: 'Khoa CNTT 1',
          status: 'PENDING',
        },
        {
          id: 'new-att-2',
          name: values.secretary || 'ThS. Đỗ Thị Thu Hiền',
          role: 'SECRETARY',
          roleTitle: 'Thư ký phiên họp',
          email: 'hiendtt@ptit.edu.vn',
          department: 'Văn phòng Khoa CNTT 1',
          status: 'PENDING',
        },
        {
          id: 'new-att-3',
          name: 'TS. Ngô Quốc Dũng',
          role: 'ADVISOR',
          roleTitle: 'Giảng viên Hướng dẫn',
          email: 'dungnq@ptit.edu.vn',
          department: 'Bộ môn CNPM',
          status: 'PENDING',
        },
        {
          id: 'new-att-4',
          name: 'Nguyễn Văn An',
          role: 'STUDENT',
          roleTitle: 'Chủ nhiệm đề tài',
          email: 'an.nv@stu.ptit.edu.vn',
          department: 'Sinh viên Khoa CNTT 1',
          status: 'PENDING',
        },
      ],
      agenda: [
        { time: '08:30 - 08:45', activity: 'Tuyên bố lý do, giới thiệu đại biểu', speaker: 'Thư ký' },
        { time: '08:45 - 09:30', activity: 'Nhóm sinh viên báo cáo tiến độ và demo sản phẩm', speaker: 'Chủ nhiệm đề tài' },
        { time: '09:30 - 10:30', activity: 'Hội thảo trao đổi và góp ý chuyên môn', speaker: 'Đại biểu tham dự' },
        { time: '10:30 - 11:30', activity: 'Chủ trì kết luận đánh giá và thông qua Mẫu 3.5', speaker: 'Chủ trì' },
      ],
    };

    setSeminars([newSem, ...seminars]);
    setCreateModalVisible(false);
    createForm.resetFields();
    message.success('Đã khởi tạo kế hoạch Hội thảo sinh hoạt khoa học mới thành công! Bạn có thể phát hành Thư mời ngay.');
  };

  const getRoleTag = (role: string) => {
    switch (role) {
      case 'CHAIR':
        return <Tag color="volcano">Chủ trì</Tag>;
      case 'SECRETARY':
        return <Tag color="purple">Thư ký</Tag>;
      case 'REVIEWER':
        return <Tag color="blue">Phản biện / Chuyên gia</Tag>;
      case 'ADVISOR':
        return <Tag color="orange">GVHD</Tag>;
      case 'STUDENT':
        return <Tag color="green">Nhóm Sinh viên</Tag>;
      default:
        return <Tag color="default">Đại biểu</Tag>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED_ONSITE':
        return <Tag color="green">✓ Tham dự trực tiếp</Tag>;
      case 'ACCEPTED_ONLINE':
        return <Tag color="blue">💻 Tham dự online</Tag>;
      case 'PENDING':
        return <Tag color="gold">⏳ Chờ phản hồi</Tag>;
      case 'DECLINED':
        return <Tag color="red">✕ Báo vắng</Tag>;
      default:
        return <Tag color="default">Chưa rõ</Tag>;
    }
  };

  return (
    <div>
      {/* HEADER BANNER S-LINK */}
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
          Quản lý Tiến độ & Tổ chức Sinh hoạt Khoa học Cấp Khoa (Mẫu 3.5)
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Giám sát chu trình 3 mốc tiến độ theo QĐ 521/QĐ-HV: Lập kế hoạch, phát hành Thư mời tham dự, rà soát đại biểu RSVP và số hóa Biên bản Hội thảo Mẫu 3.5.
        </Text>
      </div>

      <Row gutter={[20, 20]}>
        {/* CỘT TRÁI: KHUNG 3 MỐC KIỂM SOÁT TIẾN ĐỘ NCKH */}
        <Col xs={24} lg={9}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#C62828' }} />
                <span>3 Mốc Kiểm soát Tiến độ (QĐ 521)</span>
              </div>
            }
            style={{ borderRadius: 8, height: '100%' }}
            bodyStyle={{ padding: 18 }}
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1f1f1f' }}>Mốc 1: Thuyết minh Đề cương (Mẫu 2)</span>
                        <Tag color="green">Đã hoàn thành</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                        Hoàn thành soạn thảo 12 mục đề cương và bảng dự toán chi tiết. Đã được GVHD thẩm định và Lãnh đạo Khoa phê duyệt.
                      </div>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} /> Hạn chót: 15/10/2026
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'orange',
                  children: (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#C62828' }}>
                          Mốc 2: Sinh hoạt KH & Hội thảo Khoa
                        </span>
                        <Tag color="orange">Đang thực hiện</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                        Nhóm sinh viên báo cáo sản phẩm trung gian, tổ chức Hội thảo khoa học cấp Khoa/Bộ môn lấy ý kiến đóng góp và lập Biên bản Mẫu 3.5.
                      </div>
                      <div style={{ fontSize: 11, color: '#C62828', fontWeight: 600, marginTop: 4 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} /> Phiên họp: 20/12/2026 • Hạn chót: 25/12/2026
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1f1f1f' }}>Mốc 3: Hoàn thiện & Báo cáo tổng kết</span>
                        <Tag color="default">Giai đoạn 3</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                        Nộp Báo cáo tổng kết (Mẫu 3.1 - 3.4), tài liệu kỹ thuật, kiểm tra tỷ lệ trùng lặp đạo văn &lt; 20% và bảo vệ nghiệm thu trước Hội đồng.
                      </div>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} /> Hạn chót: 15/04/2027
                      </div>
                    </div>
                  ),
                },
              ]}
            />

            <Divider style={{ margin: '14px 0' }} />

            <div style={{ backgroundColor: '#F6FFED', border: '1px solid #B7EB8F', padding: 12, borderRadius: 6, fontSize: 12 }}>
              <div style={{ fontWeight: 600, color: '#389E0D', marginBottom: 4 }}>
                <CheckCircleOutlined style={{ marginRight: 6 }} /> Căn cứ Điều 9 QĐ 521/QĐ-HV:
              </div>
              <div style={{ color: '#595959', lineHeight: 1.5 }}>
                Trong quá trình thực hiện đề tài, Khoa/Bộ môn bắt buộc tổ chức ít nhất <b>01 buổi sinh hoạt khoa học</b> để nhóm sinh viên báo cáo kết quả trung gian và hoàn thiện sản phẩm theo Biên bản Mẫu 3.5.
              </div>
            </div>
          </Card>
        </Col>

        {/* CỘT PHẢI: DANH SÁCH HỘI THẢO & TÁC NGHIỆP PHÁT HÀNH THƯ MỜI */}
        <Col xs={24} lg={15}>
          {/* BANNER ĐIỀU HÀNH CHUYÊN BIỆT DÀNH CHO TRƯỞNG KHOA (FACULTY_LEADER THEO DFD 4.3 & ERD) */}
          {roleCode === 'FACULTY_LEADER' && (
            <Card
              style={{
                marginBottom: 16,
                borderRadius: 8,
                border: '1.5px solid #91D5FF',
                backgroundColor: '#E6F7FF',
                boxShadow: '0 2px 6px rgba(24,144,255,0.08)',
              }}
              bodyStyle={{ padding: '14px 18px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0050B3', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ApartmentOutlined /> KHU VỰC ĐIỀU HÀNH BAN CHỦ NHIỆM KHOA - GIÁM SÁT TIẾN ĐỘ & HỘI THẢO (MẪU 3.5)
                  </div>
                  <div style={{ fontSize: 12, color: '#595959', marginTop: 4, lineHeight: 1.5 }}>
                    Bạn đang đăng nhập với tư cách <b>Trưởng Khoa CNTT 1 ({user?.fullName || 'PGS.TS. Trần Đình Quế'})</b>. Thẩm quyền theo Điều 9 QĐ 521: Phê duyệt kế hoạch sinh hoạt học thuật, ký phát hành Giấy mời, kiểm tra túc số đại biểu (Quorum) và chủ trì phiên họp để ký Biên bản đánh giá tiến độ Mẫu 3.5.
                  </div>
                </div>
                <Space size={8}>
                  <Button
                    type="primary"
                    style={{ backgroundColor: '#1890FF', borderColor: '#1890FF', fontWeight: 600 }}
                    icon={<SendOutlined />}
                    onClick={() => handleOpenInviteModal(selectedSeminar)}
                  >
                    Phê duyệt & Phát hành Giấy mời
                  </Button>
                  <Button
                    style={{ borderColor: '#FA8C16', color: '#D46B08', fontWeight: 600 }}
                    icon={<SyncOutlined />}
                    onClick={handleResendReminder}
                  >
                    Đôn đốc RSVP ({selectedSeminar?.attendeesList.filter((a) => a.status === 'PENDING').length} người)
                  </Button>
                </Space>
              </div>
            </Card>
          )}

          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <Space size={8}>
                  <TeamOutlined style={{ color: '#C62828' }} />
                  <span>Phiên họp Sinh hoạt Khoa học & Hội thảo Cấp Khoa (Mẫu 3.5)</span>
                </Space>
                <Tag color="red" style={{ fontSize: 12, padding: '2px 8px' }}>
                  {seminars.length} phiên họp
                </Tag>
              </div>
            }
            extra={
              /* CHỈ THƯ KÝ KHOA & LÃNH ĐẠO KHOA MỚI CÓ QUYỀN LẬP LỊCH HỘI THẢO MỚI */
              isFacultyRole ? (
                <Button
                  type="primary"
                  style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  + Lập lịch Hội thảo mới
                </Button>
              ) : null
            }
            style={{ borderRadius: 8 }}
            bodyStyle={{ padding: 18 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {seminars.map((s) => {
                const totalAtt = s.attendeesList.length;
                const acceptedOnsite = s.attendeesList.filter((a) => a.status === 'ACCEPTED_ONSITE').length;
                const acceptedOnline = s.attendeesList.filter((a) => a.status === 'ACCEPTED_ONLINE').length;
                const pending = s.attendeesList.filter((a) => a.status === 'PENDING').length;
                const confirmedPct = Math.round(((acceptedOnsite + acceptedOnline) / totalAtt) * 100);

                const myAtt = getMyAttendee(s.attendeesList);
                const myStatus = myAtt?.status || 'PENDING';

                return (
                  <div
                    key={s.id}
                    style={{
                      padding: 18,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      border: s.id === 1 ? '1.5px solid #FFCCC7' : '1px solid #EDEDEE',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* HÀNG 1: TIÊU ĐỀ & TRẠNG THÁI */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#C62828', lineHeight: 1.4 }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#595959', marginTop: 3 }}>
                          Đề tài: <b>{s.projectTitle}</b> (Mã số: <b style={{ color: '#C62828' }}>{s.projectId}</b>)
                        </div>
                      </div>
                      <Tag color={s.status === 'INVITATION_SENT' ? 'green' : 'orange'} style={{ fontSize: 12, padding: '3px 10px' }}>
                        {s.status === 'INVITATION_SENT' ? '✓ ' + s.statusText : '⏳ ' + s.statusText}
                      </Tag>
                    </div>

                    {/* HÀNG 2: THÔNG TIN CHI TIẾT */}
                    <div
                      style={{
                        backgroundColor: '#FAFAFA',
                        padding: '10px 14px',
                        borderRadius: 6,
                        border: '1px solid #F0F0F0',
                        fontSize: 12,
                        color: '#262626',
                        lineHeight: 1.8,
                        marginBottom: 12,
                      }}
                    >
                      <Row gutter={[12, 6]}>
                        <Col span={14}>
                          <div>
                            <CalendarOutlined style={{ color: '#C62828', marginRight: 6 }} />
                            Thời gian: <b>{s.time} ngày {s.date}</b>
                          </div>
                          <div>
                            <EnvironmentOutlined style={{ color: '#C62828', marginRight: 6 }} />
                            Địa điểm: <b>{s.location}</b>
                          </div>
                          <div>
                            <VideoCameraOutlined style={{ color: '#1890FF', marginRight: 6 }} />
                            Trực tuyến: <a href={s.onlineLink} target="_blank" rel="noreferrer">{s.onlineLink}</a>
                          </div>
                        </Col>
                        <Col span={10}>
                          <div>
                            <UserOutlined style={{ color: '#1890FF', marginRight: 6 }} />
                            Chủ trì: <b>{s.chair}</b>
                          </div>
                          <div>
                            <SolutionOutlined style={{ color: '#722ED1', marginRight: 6 }} />
                            Thư ký: <b>{s.secretary}</b>
                          </div>
                          <div>
                            <TeamOutlined style={{ color: '#52C41A', marginRight: 6 }} />
                            Chủ nhiệm: <b>{s.studentLeader}</b> • GVHD: <b>{s.advisor}</b>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* TIỆN ÍCH KIỂM TRA TÚC SỐ ĐẠI BIỂU DÀNH CHO TRƯỞNG KHOA (QUORUM COMPLIANCE) */}
                    {roleCode === 'FACULTY_LEADER' && (
                      <div
                        style={{
                          marginBottom: 12,
                          padding: '8px 12px',
                          backgroundColor: '#F0F5FF',
                          borderRadius: 6,
                          border: '1px solid #ADC6FF',
                          fontSize: 12,
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#1D39C4', marginBottom: 4 }}>
                          <CheckCircleOutlined style={{ marginRight: 6 }} /> Rà soát Túc số theo Điều 9 QĐ 521:
                        </div>
                        <div style={{ color: '#595959', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span>• Chủ trì: <b style={{ color: '#52C41A' }}>Có mặt</b></span>
                          <span>• Thư ký: <b style={{ color: '#52C41A' }}>Có mặt</b></span>
                          <span>• GVHD: <b style={{ color: '#52C41A' }}>Xác nhận</b></span>
                          <span>• Sinh viên báo cáo: <b style={{ color: '#52C41A' }}>Đầy đủ</b></span>
                          <span>• Phản biện: <b style={{ color: '#52C41A' }}>02/02 chuyên gia</b></span>
                          <span style={{ color: '#1D39C4', fontWeight: 600 }}>→ Đủ điều kiện tổ chức phiên họp</span>
                        </div>
                      </div>
                    )}

                    {/* HÀNG 3: TIẾN ĐỘ PHẢN HỒI THƯ MỜI RSVP CẬP NHẬT REALTIME */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 14,
                        padding: '8px 12px',
                        backgroundColor: '#F6FFED',
                        borderRadius: 6,
                        border: '1px solid #D9F7BE',
                      }}
                    >
                      <div style={{ fontSize: 12 }}>
                        <MailOutlined style={{ color: '#389E0D', marginRight: 6 }} />
                        Số giấy mời: <b>{s.invitationCode}</b> • Đã phát hành tới <b>{totalAtt} đại biểu</b>:
                        <span style={{ marginLeft: 6, color: '#389E0D', fontWeight: 600 }}>
                          {acceptedOnsite} trực tiếp, {acceptedOnline} online, {pending} chờ phản hồi
                        </span>
                      </div>
                      <div style={{ width: 140 }}>
                        <Progress percent={confirmedPct} size="small" strokeColor="#52C41A" />
                      </div>
                    </div>

                    {/* HÀNG 4: KHU VỰC PHẢN HỒI NHANH CỦA NGƯỜI ĐĂNG NHẬP (RSVP WIDGET REALTIME) */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: '#FFF2E8',
                        borderRadius: 6,
                        marginBottom: 14,
                        border: '1.5px dashed #FFBB96',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: '#D4380D' }}>
                          <b>Xác nhận tham dự ({myAtt?.roleTitle || 'Đại biểu'} - {user?.fullName || 'Bạn'}):</b>
                        </span>
                        {myStatus === 'PENDING' ? (
                          <Tag color="gold" style={{ fontWeight: 600 }}>
                            ⏳ Chưa phản hồi
                          </Tag>
                        ) : myStatus === 'ACCEPTED_ONSITE' ? (
                          <Tag color="green" style={{ fontWeight: 600 }}>
                            ✓ Đã chọn: Trực tiếp
                          </Tag>
                        ) : myStatus === 'ACCEPTED_ONLINE' ? (
                          <Tag color="blue" style={{ fontWeight: 600 }}>
                            💻 Đã chọn: Online
                          </Tag>
                        ) : (
                          <Tag color="red" style={{ fontWeight: 600 }}>
                            ✕ Đã chọn: Báo vắng
                          </Tag>
                        )}
                      </div>

                      <Space size={8}>
                        <Button
                          size="small"
                          type={myStatus === 'ACCEPTED_ONSITE' ? 'primary' : 'default'}
                          style={
                            myStatus === 'ACCEPTED_ONSITE'
                              ? { backgroundColor: '#52C41A', borderColor: '#52C41A', fontWeight: 600 }
                              : { borderColor: '#52C41A', color: '#389E0D' }
                          }
                          icon={<CheckOutlined />}
                          onClick={() => handleUpdateRsvp(s.id, 'ACCEPTED_ONSITE')}
                        >
                          Tham dự trực tiếp
                        </Button>
                        <Button
                          size="small"
                          type={myStatus === 'ACCEPTED_ONLINE' ? 'primary' : 'default'}
                          style={
                            myStatus === 'ACCEPTED_ONLINE'
                              ? { backgroundColor: '#1890FF', borderColor: '#1890FF', fontWeight: 600 }
                              : { borderColor: '#1890FF', color: '#1890FF' }
                          }
                          icon={<LaptopOutlined />}
                          onClick={() => handleUpdateRsvp(s.id, 'ACCEPTED_ONLINE')}
                        >
                          Tham dự online
                        </Button>
                        <Button
                          size="small"
                          type={myStatus === 'DECLINED' ? 'primary' : 'default'}
                          danger
                          style={myStatus === 'DECLINED' ? { fontWeight: 600 } : {}}
                          icon={<CloseCircleOutlined />}
                          onClick={() => handleUpdateRsvp(s.id, 'DECLINED')}
                        >
                          Báo vắng
                        </Button>
                      </Space>
                    </div>

                    {/* HÀNG 5: CÁC NÚT TÁC NGHIỆP NGHIỆP VỤ CHÍNH THEO ĐÚNG PHÂN QUYỀN */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <Space size={8}>
                        {/* THẨM QUYỀN BAN CHỦ NHIỆM KHOA & THƯ KÝ: GỬI THƯ MỜI THAM DỰ */}
                        {isFacultyRole ? (
                          <Button
                            type="primary"
                            style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600 }}
                            icon={<SendOutlined />}
                            onClick={() => handleOpenInviteModal(s)}
                          >
                            Phát hành Thư mời tham dự
                          </Button>
                        ) : (
                          <Tag color="green" style={{ fontSize: 12, padding: '4px 10px', fontWeight: 600 }}>
                            <CheckCircleOutlined /> Khoa đã phát hành Giấy mời ({s.invitationCode})
                          </Tag>
                        )}

                        {/* NÚT XEM & IN GIẤY MỜI A4 */}
                        <Button
                          icon={<PrinterOutlined />}
                          onClick={() => {
                            setSelectedSeminar(s);
                            setTimeout(() => {
                              printElement('printable-invitation-sheet', `Giấy mời tham dự Hội thảo NCKH - ${s.invitationCode}`);
                            }, 200);
                          }}
                        >
                          {isFacultyRole ? 'In Giấy mời (A4)' : 'Xem Giấy mời của tôi (A4)'}
                        </Button>

                        {/* NÚT DANH SÁCH ĐẠI BIỂU & PHẢN HỒI */}
                        <Button
                          icon={<TeamOutlined />}
                          onClick={() => {
                            setSelectedSeminar(s);
                            setAttendeesModalVisible(true);
                          }}
                        >
                          Danh sách đại biểu ({s.attendeesList.length})
                        </Button>
                      </Space>

                      {/* NÚT XEM/KÝ BIÊN BẢN MẪU 3.5 */}
                      <Space size={8}>
                        {roleCode === 'FACULTY_LEADER' && (
                          <Button
                            type="primary"
                            style={{ backgroundColor: '#722ED1', borderColor: '#722ED1', fontWeight: 600 }}
                            icon={<FormOutlined />}
                            onClick={() => {
                              setSelectedSeminar(s);
                              setMinutesModalVisible(true);
                            }}
                          >
                            Chủ trì & Ký Biên bản Mẫu 3.5
                          </Button>
                        )}
                        {roleCode !== 'FACULTY_LEADER' && (
                          <Button
                            type="default"
                            style={{ borderColor: '#C62828', color: '#C62828', fontWeight: 500 }}
                            icon={<FileDoneOutlined />}
                            onClick={() => {
                              setSelectedSeminar(s);
                              setMinutesModalVisible(true);
                            }}
                          >
                            Biên bản Mẫu 3.5
                          </Button>
                        )}
                      </Space>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ========================================================================= */}
      {/* MODAL 1: GỬI THƯ MỜI THAM DỰ HỘI THẢO (ĐA KÊNH: IN-APP, EMAIL, CALENDAR)  */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#FFF1F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C62828',
                fontSize: 18,
              }}
            >
              <MailOutlined />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1f1f1f' }}>
                Phát hành Thư mời tham dự Sinh hoạt Khoa học Cấp Khoa
              </div>
              <div style={{ fontSize: 12, fontWeight: 'normal', color: '#8c8c8c' }}>
                Mã giấy mời: <b>{selectedSeminar?.invitationCode}</b> • Thẩm quyền: Ban Chủ nhiệm Khoa & Thư ký Khoa (QĐ 521)
              </div>
            </div>
          </div>
        }
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        width={880}
        footer={[
          <Button key="cancel" onClick={() => setInviteModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="reminder"
            icon={<SyncOutlined />}
            onClick={handleResendReminder}
          >
            Gửi lại nhắc nhở (Reminder)
          </Button>,
          <Button
            key="send"
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600 }}
            icon={<SendOutlined />}
            loading={sendingInvite}
            onClick={handleSendInvitations}
          >
            Phát hành Thư mời ngay ({selectedAttendeeIds.length} người)
          </Button>,
        ]}
      >
        <Tabs
          defaultActiveKey="tab-config"
          items={[
            {
              key: 'tab-config',
              label: (
                <span>
                  <SettingOutlined /> Cấu hình Thư mời & Đại biểu ({selectedSeminar?.attendeesList.length})
                </span>
              ),
              children: (
                <div>
                  {/* TÓM TẮT THÔNG TIN PHIÊN HỌP */}
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#FAFAFA',
                      borderRadius: 6,
                      border: '1px solid #EDEDEE',
                      marginBottom: 14,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#C62828', marginBottom: 4 }}>
                      {selectedSeminar?.title}
                    </div>
                    <div>
                      • Đề tài báo cáo: <b>{selectedSeminar?.projectTitle}</b> ({selectedSeminar?.projectId})
                    </div>
                    <div>
                      • Thời gian: <b>{selectedSeminar?.time} ngày {selectedSeminar?.date}</b>
                    </div>
                    <div>
                      • Địa điểm: <b>{selectedSeminar?.location}</b> • Trực tuyến: <b>{selectedSeminar?.onlineLink}</b>
                    </div>
                  </div>

                  {/* KÊNH GỬI THƯ MỜI CHUẨN DFD 8.2 */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#262626' }}>
                      Phương thức phát hành & Đồng bộ hệ thống:
                    </div>
                    <Space size={20} wrap>
                      <Checkbox checked={sendInApp} onChange={(e) => setSendInApp(e.target.checked)}>
                        <NotificationOutlined style={{ color: '#1890FF' }} /> Gửi thông báo Web In-App (S-Link)
                      </Checkbox>
                      <Checkbox checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)}>
                        <MailOutlined style={{ color: '#52C41A' }} /> Gửi thư điện tử Email tự động kèm PDF
                      </Checkbox>
                      <Checkbox checked={syncCalendar} onChange={(e) => setSyncCalendar(e.target.checked)}>
                        <CalendarOutlined style={{ color: '#C62828' }} /> Đồng bộ vào Lịch công tác NCKH (S-Link)
                      </Checkbox>
                    </Space>
                  </div>

                  {/* LỜI NHẮN ĐÍNH KÈM TỪ BAN TỔ CHỨC */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#262626' }}>
                      Lời nhắn / Hướng dẫn gửi kèm thư mời:
                    </div>
                    <TextArea
                      rows={2}
                      value={invitationNote}
                      onChange={(e) => setInvitationNote(e.target.value)}
                      placeholder="Nhập ghi chú hoặc yêu cầu chuẩn bị slide, tài liệu..."
                    />
                  </div>

                  {/* DANH SÁCH ĐẠI BIỂU ĐƯỢC CHỌN GỬI */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#262626' }}>
                        Thành phần đại biểu nhận thư mời ({selectedAttendeeIds.length}/{selectedSeminar?.attendeesList.length}):
                      </div>
                      <Space size={8}>
                        <Button
                          size="small"
                          type="link"
                          onClick={() => setSelectedAttendeeIds(selectedSeminar?.attendeesList.map((a) => a.id) || [])}
                        >
                          Chọn tất cả
                        </Button>
                        <Button size="small" type="link" onClick={() => setSelectedAttendeeIds([])}>
                          Bỏ chọn
                        </Button>
                      </Space>
                    </div>

                    <Table
                      dataSource={selectedSeminar?.attendeesList || []}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      bordered
                      columns={[
                        {
                          title: 'Gửi',
                          width: 50,
                          align: 'center' as const,
                          render: (_: any, record: SeminarAttendee) => (
                            <Checkbox
                              checked={selectedAttendeeIds.includes(record.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAttendeeIds([...selectedAttendeeIds, record.id]);
                                } else {
                                  setSelectedAttendeeIds(selectedAttendeeIds.filter((id) => id !== record.id));
                                }
                              }}
                            />
                          ),
                        },
                        {
                          title: 'Họ và tên',
                          dataIndex: 'name',
                          render: (name: string, record: SeminarAttendee) => (
                            <div>
                              <div style={{ fontWeight: 600 }}>{name}</div>
                              <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.email}</div>
                            </div>
                          ),
                        },
                        {
                          title: 'Vai trò trong phiên họp',
                          dataIndex: 'roleTitle',
                          render: (roleTitle: string, record: SeminarAttendee) => (
                            <div>
                              {getRoleTag(record.role)}
                              <span style={{ fontSize: 12, marginLeft: 6 }}>{roleTitle}</span>
                            </div>
                          ),
                        },
                        {
                          title: 'Đơn vị công tác',
                          dataIndex: 'department',
                          width: 170,
                          render: (dept: string) => <span style={{ fontSize: 12 }}>{dept}</span>,
                        },
                        {
                          title: 'Trạng thái phản hồi',
                          dataIndex: 'status',
                          width: 150,
                          align: 'center' as const,
                          render: (status: string) => getStatusBadge(status),
                        },
                      ]}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'tab-preview-letter',
              label: (
                <span>
                  <EyeOutlined /> Xem trước Giấy mời chính thức (A4)
                </span>
              ),
              children: (
                <div>
                  <div style={{ textAlign: 'right', marginBottom: 10 }}>
                    <Button
                      type="primary"
                      style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                      icon={<PrinterOutlined />}
                      onClick={() => printElement('printable-invitation-sheet', `Giấy mời tham dự Hội thảo NCKH - ${selectedSeminar?.invitationCode}`)}
                    >
                      In Giấy mời (A4)
                    </Button>
                  </div>
                  <div
                    style={{
                      maxHeight: 520,
                      overflowY: 'auto',
                      padding: 24,
                      backgroundColor: '#525659',
                      borderRadius: 6,
                    }}
                  >
                    {renderInvitationSheetA4(selectedSeminar, invitationNote)}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: DANH SÁCH ĐẠI BIỂU & QUẢN LÝ PHẢN HỒI RSVP CHI TIẾT            */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TeamOutlined style={{ color: '#C62828', fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 700 }}>
              Danh sách Đại biểu & Tình trạng Phản hồi RSVP ({selectedSeminar?.attendeesList.length} đại biểu)
            </span>
          </div>
        }
        open={attendeesModalVisible}
        onCancel={() => setAttendeesModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" type="primary" style={{ backgroundColor: '#C62828' }} onClick={() => setAttendeesModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 14 }}>
          <Alert
            type="info"
            showIcon
            message={
              <div>
                Phiên họp: <b>{selectedSeminar?.title}</b> ({selectedSeminar?.time} ngày {selectedSeminar?.date})
                <br />
                Đại biểu có thể xác nhận tham dự qua S-Link in-app hoặc phản hồi qua email được gửi tự động.
              </div>
            }
          />
        </div>

        <Table
          dataSource={selectedSeminar?.attendeesList || []}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
          columns={[
            {
              title: 'STT',
              width: 50,
              align: 'center' as const,
              render: (_: any, __: any, idx: number) => idx + 1,
            },
            {
              title: 'Họ và tên',
              dataIndex: 'name',
              render: (name: string, record: SeminarAttendee) => {
                const myAtt = getMyAttendee(selectedSeminar?.attendeesList || []);
                const isMe = record.id === myAtt?.id;
                return (
                  <div>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{name}</span>
                      {isMe && (
                        <Tag color="red" style={{ fontSize: 10, padding: '0 5px', lineHeight: '16px', fontWeight: 700 }}>
                          Bạn
                        </Tag>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      Email: {record.email} {record.phone ? `• SĐT: ${record.phone}` : ''}
                    </div>
                  </div>
                );
              },
            },
            {
              title: 'Phân loại',
              dataIndex: 'role',
              width: 140,
              render: (role: string) => getRoleTag(role),
            },
            {
              title: 'Tình trạng phản hồi',
              dataIndex: 'status',
              width: 170,
              align: 'center' as const,
              render: (status: string, record: SeminarAttendee) => (
                <div>
                  {getStatusBadge(status)}
                  {record.respondedAt && (
                    <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>{record.respondedAt}</div>
                  )}
                </div>
              ),
            },
            ...(isFacultyRole
              ? [
                  {
                    title: 'Thao tác điều phối (Khoa)',
                    key: 'action',
                    width: 150,
                    align: 'center' as const,
                    render: (_: any, record: SeminarAttendee) => (
                      <Space size={4}>
                        <Tooltip title="Chuyển thành Tham dự trực tiếp">
                          <Button
                            size="small"
                            type="text"
                            style={{ color: '#52C41A' }}
                            icon={<CheckCircleOutlined />}
                            onClick={() => {
                              setSeminars((prev) =>
                                prev.map((s) =>
                                  s.id === selectedSeminar.id
                                    ? {
                                        ...s,
                                        attendeesList: s.attendeesList.map((a) =>
                                          a.id === record.id
                                            ? { ...a, status: 'ACCEPTED_ONSITE', respondedAt: new Date().toLocaleString('vi-VN') }
                                            : a
                                        ),
                                      }
                                    : s
                                )
                              );
                              message.success(`Đã cập nhật trạng thái của ${record.name} thành Tham dự trực tiếp!`);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Chuyển thành Tham dự online">
                          <Button
                            size="small"
                            type="text"
                            style={{ color: '#1890FF' }}
                            icon={<LaptopOutlined />}
                            onClick={() => {
                              setSeminars((prev) =>
                                prev.map((s) =>
                                  s.id === selectedSeminar.id
                                    ? {
                                        ...s,
                                        attendeesList: s.attendeesList.map((a) =>
                                          a.id === record.id
                                            ? { ...a, status: 'ACCEPTED_ONLINE', respondedAt: new Date().toLocaleString('vi-VN') }
                                            : a
                                        ),
                                      }
                                    : s
                                )
                              );
                              message.success(`Đã cập nhật trạng thái của ${record.name} thành Tham dự online!`);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Gửi thư nhắc nhở riêng">
                          <Button
                            size="small"
                            type="text"
                            icon={<MailOutlined />}
                            onClick={() => message.success(`Đã gửi email nhắc nhở lịch họp tới ${record.email}!`)}
                          />
                        </Tooltip>
                      </Space>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: XEM & IN BIÊN BẢN HỘI THẢO SINH HOẠT KH (MẪU 3.5 - QĐ 521)        */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '95%' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#C62828' }}>
              Biên bản Sinh hoạt Khoa học & Báo cáo Tiến độ Đề tài (Mẫu 3.5)
            </span>
            <Button
              type="primary"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              icon={<PrinterOutlined />}
              onClick={() => printElement('printable-minutes-sheet', `Biên bản Mẫu 3.5 - ${selectedSeminar?.projectId}`)}
            >
              In Biên bản Mẫu 3.5 (A4)
            </Button>
          </div>
        }
        open={minutesModalVisible}
        onCancel={() => setMinutesModalVisible(false)}
        width={920}
        footer={[
          <Button key="close" onClick={() => setMinutesModalVisible(false)}>
            Đóng
          </Button>,
          roleCode === 'FACULTY_LEADER' && (
            <Button
              key="sign"
              type="primary"
              style={{ backgroundColor: '#722ED1', borderColor: '#722ED1', fontWeight: 600 }}
              icon={<CheckCircleOutlined />}
              onClick={() => {
                message.loading('Đang ký số điện tử Biên bản Mẫu 3.5 với tư cách Trưởng Khoa...');
                setTimeout(() => {
                  message.success('Trưởng Khoa đã phê duyệt và ký số xác thực Biên bản Sinh hoạt Khoa học Mẫu 3.5 thành công!');
                  setMinutesModalVisible(false);
                }, 800);
              }}
            >
              Ký duyệt số hóa Biên bản Mẫu 3.5 (Chủ trì phiên họp)
            </Button>
          ),
        ]}
      >
        <div style={{ maxHeight: 600, overflowY: 'auto', padding: 20, backgroundColor: '#525659', borderRadius: 6 }}>
          {renderMinutesSheetA4(selectedSeminar)}
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: LẬP KẾ HOẠCH HỘI THẢO KHOA HỌC MỚI                               */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PlusOutlined style={{ color: '#C62828', fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 700 }}>
              Khởi tạo Kế hoạch Hội thảo Sinh hoạt Khoa học Cấp Khoa (Mẫu 3.5)
            </span>
          </div>
        }
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateSeminar}>
          <Form.Item
            name="title"
            label="Tiêu đề phiên họp Hội thảo / Sinh hoạt Khoa học"
            initialValue="Hội thảo Khoa học Khoa CNTT 1 - Báo cáo tiến độ & Góp ý hoàn thiện đề tài NCKH đợt 2"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề phiên họp' }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="projectId" label="Đề tài NCKH báo cáo" initialValue="SV-2026-CNTT1-001">
                <Select
                  options={[
                    { value: 'SV-2026-CNTT1-001', label: 'SV-2026-CNTT1-001 - SRMS PTIT S-Link' },
                    { value: 'SV-2026-CNTT1-002', label: 'SV-2026-CNTT1-002 - Mobile AR Apps' },
                    { value: 'SV-2026-CNTT1-003', label: 'SV-2026-CNTT1-003 - VR Hotels Booking' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="date" label="Ngày tổ chức">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startTime" label="Giờ bắt đầu">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endTime" label="Giờ kết thúc">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Địa điểm phòng họp trực tiếp"
            initialValue="Phòng Hội thảo Tầng 2 - Nhà A2, Cơ sở Hà Đông"
            rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="onlineLink"
            label="Đường dẫn họp trực tuyến (Google Meet / Teams)"
            initialValue="https://meet.google.com/srms-nckh-ptit"
          >
            <Input prefix={<VideoCameraOutlined style={{ color: '#1890FF' }} />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="chair" label="Người chủ trì (Chủ tọa)" initialValue="PGS.TS. Hoàng Minh">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="secretary" label="Thư ký ghi biên bản" initialValue="ThS. Đỗ Thị Thu Hiền">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setCreateModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}>
              Lưu & Khởi tạo Hội thảo
            </Button>
          </div>
        </Form>
      </Modal>

      {/* TẬP TIN A4 ẨN ĐỂ IN GIẤY MỜI NHANH */}
      <div style={{ display: 'none' }}>
        {renderInvitationSheetA4(selectedSeminar, invitationNote)}
        {renderMinutesSheetA4(selectedSeminar)}
      </div>
    </div>
  );
};

// =========================================================================
// HÀM RENDER GIẤY MỜI CHUẨN THỂ THỨC HÀNH CHÍNH A4 HỌC VIỆN PTIT
// =========================================================================
function renderInvitationSheetA4(seminar: SeminarItem, customNote?: string) {
  if (!seminar) return null;

  return (
    <div
      id="printable-invitation-sheet"
      className="printable-a4-sheet"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '25mm 20mm 20mm 25mm',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        fontFamily: '"Times New Roman", Times, serif',
        lineHeight: 1.45,
        margin: '0 auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.15)',
        boxSizing: 'border-box',
        fontSize: '13pt',
      }}
    >
      {/* HEADER QUỐC HIỆU & TIÊU NGỮ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ textAlign: 'center', width: '48%' }}>
          <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>BỘ KHOA HỌC VÀ CÔNG NGHỆ</div>
          <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
          <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>KHOA CÔNG NGHỆ THÔNG TIN 1</div>
          <div style={{ width: 80, height: 1, backgroundColor: '#000000', margin: '3px auto' }} />
          <div style={{ fontSize: '11pt', marginTop: 4 }}>Số: <b>{seminar.invitationCode}</b></div>
        </div>

        <div style={{ textAlign: 'center', width: '50%' }}>
          <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>Độc lập - Tự do - Hạnh phúc</div>
          <div style={{ width: 120, height: 1, backgroundColor: '#000000', margin: '3px auto' }} />
          <div style={{ fontSize: '11pt', fontStyle: 'italic', marginTop: 4 }}>
            Hà Nội, ngày 15 tháng 12 năm 2026
          </div>
        </div>
      </div>

      {/* TIÊU ĐỀ GIẤY MỜI */}
      <div style={{ textAlign: 'center', margin: '22px 0 16px' }}>
        <div style={{ fontSize: '18pt', fontWeight: 'bold', letterSpacing: 1 }}>GIẤY MỜI</div>
        <div style={{ fontSize: '13pt', fontWeight: 'bold', marginTop: 6, textTransform: 'uppercase' }}>
          Tham dự Phiên họp Sinh hoạt Khoa học & Báo cáo Tiến độ Đề tài NCKH
        </div>
        <div style={{ fontSize: '11pt', fontStyle: 'italic', marginTop: 3 }}>
          (Thực hiện theo quy định tại Điều 9 Quyết định số 521/QĐ-HV của Giám đốc Học viện)
        </div>
      </div>

      {/* KÍNH GỬI */}
      <div style={{ margin: '14px 0 12px', fontSize: '13pt' }}>
        <p style={{ margin: '4px 0' }}>
          <b>Kính gửi:</b>
        </p>
        <ul style={{ paddingLeft: 26, margin: '4px 0 10px', listStyleType: 'disc' }}>
          <li>Các nhà khoa học, Chuyên gia phản biện trong và ngoài Bộ môn;</li>
          <li>Giảng viên hướng dẫn: <b>{seminar.advisor}</b>;</li>
          <li>Nhóm sinh viên thực hiện đề tài: <b>{seminar.studentLeader}</b> (Chủ nhiệm) và các thành viên.</li>
        </ul>
      </div>

      <div style={{ fontSize: '13pt', lineHeight: 1.55 }}>
        <p style={{ textIndent: 28, margin: '6px 0', textAlign: 'justify' }}>
          Ban Chủ nhiệm Khoa Công nghệ Thông tin 1 trân trọng kính mời Quý Thầy/Cô và các em sinh viên tham dự Phiên họp Sinh hoạt Khoa học định kỳ và Báo cáo tiến độ đề tài NCKH sinh viên cấp Khoa, cụ thể như sau:
        </p>

        <p style={{ margin: '6px 0' }}>
          <b>1. Tên buổi sinh hoạt khoa học:</b> {seminar.title}.
        </p>

        <p style={{ margin: '6px 0' }}>
          <b>2. Báo cáo tiến độ đề tài NCKH:</b>
        </p>
        <div style={{ paddingLeft: 20, margin: '4px 0 8px', fontSize: '12pt' }}>
          <div>• Tên đề tài: <b>{seminar.projectTitle}</b></div>
          <div>• Mã số đề tài: <b>{seminar.projectId}</b></div>
          <div>• Chủ nhiệm đề tài: <b>{seminar.studentLeader}</b> (Lớp {seminar.studentClass}, MSSV: {seminar.studentCode})</div>
          <div>• Giảng viên hướng dẫn: <b>{seminar.advisor}</b> ({seminar.advisorTitle})</div>
        </div>

        <p style={{ margin: '6px 0' }}>
          <b>3. Thời gian:</b> <b>{seminar.time}</b>, ngày <b>{seminar.date}</b>.
        </p>

        <p style={{ margin: '6px 0' }}>
          <b>4. Địa điểm:</b>
        </p>
        <div style={{ paddingLeft: 20, margin: '4px 0 8px', fontSize: '12pt' }}>
          <div>• Trực tiếp: <b>{seminar.location}</b></div>
          <div>• Trực tuyến: <b>{seminar.onlineLink}</b> (dành cho đại biểu tham dự từ xa).</div>
        </div>

        <p style={{ margin: '6px 0' }}>
          <b>5. Thành phần tham dự ({seminar.attendeesList.length} đại biểu):</b>
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0', fontSize: '10pt' }}>
          <thead>
            <tr style={{ backgroundColor: '#F2F2F2' }}>
              <th style={{ border: '1px solid #000', padding: 4, width: 35, textAlign: 'center' }}>TT</th>
              <th style={{ border: '1px solid #000', padding: 4, textAlign: 'left' }}>Họ và tên</th>
              <th style={{ border: '1px solid #000', padding: 4, width: 170, textAlign: 'left' }}>Vai trò trong phiên họp</th>
              <th style={{ border: '1px solid #000', padding: 4, width: 170, textAlign: 'left' }}>Đơn vị công tác</th>
            </tr>
          </thead>
          <tbody>
            {seminar.attendeesList.map((att, idx) => (
              <tr key={att.id}>
                <td style={{ border: '1px solid #000', padding: 4, textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ border: '1px solid #000', padding: 4, fontWeight: 'bold' }}>{att.name}</td>
                <td style={{ border: '1px solid #000', padding: 4 }}>{att.roleTitle}</td>
                <td style={{ border: '1px solid #000', padding: 4 }}>{att.department}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ margin: '6px 0' }}>
          <b>6. Nội dung chương trình:</b>
        </p>
        <div style={{ paddingLeft: 20, margin: '4px 0 8px', fontSize: '11pt' }}>
          {seminar.agenda.map((ag, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              • <b>{ag.time}:</b> {ag.activity} <i>({ag.speaker})</i>.
            </div>
          ))}
        </div>

        {customNote && (
          <p style={{ margin: '6px 0', fontStyle: 'italic', fontSize: '11pt' }}>
            * <b>Lưu ý:</b> {customNote}
          </p>
        )}

        <p style={{ textIndent: 28, margin: '8px 0', textAlign: 'justify' }}>
          Đề nghị các đại biểu xác nhận tham dự qua Cổng thông tin Quản lý Đề tài SRMS S-Link hoặc phản hồi email trước ngày 18/12/2026 để Ban tổ chức đón tiếp chu đáo.
        </p>

        <p style={{ margin: '10px 0 0' }}>
          Trân trọng cảm ơn!
        </p>
      </div>

      {/* CHỮ KÝ TRƯỞNG KHOA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, fontSize: '12pt' }}>
        <div style={{ width: '45%' }}>
          <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>Nơi nhận:</div>
          <div style={{ fontSize: '10pt', lineHeight: 1.4 }}>
            - Như kính gửi;<br />
            - Ban Giám đốc Học viện (để b/c);<br />
            - Phòng QLKHCN (để phối hợp);<br />
            - Lưu: VT, Khoa CNTT 1.
          </div>
        </div>

        <div style={{ textAlign: 'center', width: '50%' }}>
          <div style={{ fontWeight: 'bold' }}>TRƯỞNG KHOA</div>
          <div style={{ fontStyle: 'italic', fontSize: '10pt' }}>(Ký, đóng dấu / Ký số điện tử)</div>
          <div
            style={{
              display: 'inline-block',
              border: '1.5px solid #52C41A',
              color: '#389E0D',
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: '9pt',
              fontWeight: 'bold',
              margin: '16px auto 10px',
            }}
          >
            ✓ KÝ SỐ XÁC THỰC S-LINK PTIT
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '13pt' }}>{seminar.chair}</div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// HÀM RENDER BIÊN BẢN HỘI THẢO SINH HOẠT KHOA HỌC MẪU 3.5 (A4)
// =========================================================================
function renderMinutesSheetA4(seminar: SeminarItem) {
  if (!seminar) return null;

  return (
    <div
      id="printable-minutes-sheet"
      className="printable-a4-sheet"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '22mm 20mm 20mm 25mm',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        fontFamily: '"Times New Roman", Times, serif',
        lineHeight: 1.45,
        margin: '0 auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.15)',
        boxSizing: 'border-box',
        fontSize: '12pt',
      }}
    >
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ textAlign: 'center', width: '48%' }}>
          <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
          <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>KHOA CÔNG NGHỆ THÔNG TIN 1</div>
          <div style={{ width: 80, height: 1, backgroundColor: '#000000', margin: '3px auto' }} />
        </div>

        <div style={{ textAlign: 'center', width: '50%' }}>
          <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>Độc lập - Tự do - Hạnh phúc</div>
          <div style={{ width: 120, height: 1, backgroundColor: '#000000', margin: '3px auto' }} />
          <div style={{ fontSize: '10pt', fontStyle: 'italic', marginTop: 3 }}>
            Hà Nội, ngày {seminar.date}
          </div>
        </div>
      </div>

      {/* TIÊU ĐỀ BIÊN BẢN MẪU 3.5 */}
      <div style={{ textAlign: 'center', margin: '18px 0 14px' }}>
        <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>Mẫu 3.5. Biên bản sinh hoạt khoa học</div>
        <div style={{ fontSize: '15pt', fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' }}>
          BIÊN BẢN SINH HOẠT KHOA HỌC / HỘI THẢO CẤP KHOA
        </div>
        <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>
          Đánh giá tiến độ đề tài NCKH sinh viên năm học 2026 - 2027
        </div>
      </div>

      <div style={{ fontSize: '12pt', lineHeight: 1.55 }}>
        <p style={{ margin: '4px 0' }}>
          <b>1. Thời gian, địa điểm:</b> Hồi {seminar.time} ngày {seminar.date} tại {seminar.location}.
        </p>

        <p style={{ margin: '4px 0' }}>
          <b>2. Thành phần tham dự ({seminar.attendeesList.length} đại biểu):</b>
        </p>
        <ul style={{ paddingLeft: 24, margin: '2px 0 6px' }}>
          <li>Chủ trì (Chủ tọa): <b>{seminar.chair}</b> - Trưởng Khoa CNTT 1</li>
          <li>Thư ký phiên họp: <b>{seminar.secretary}</b> - Thư ký Khoa</li>
          <li>Giảng viên hướng dẫn: <b>{seminar.advisor}</b></li>
          <li>Các nhà khoa học, giảng viên phản biện và toàn thể sinh viên nhóm nghiên cứu.</li>
        </ul>

        <p style={{ margin: '4px 0' }}>
          <b>3. Tên đề tài báo cáo tiến độ:</b> <b>{seminar.projectTitle}</b>
        </p>
        <p style={{ margin: '2px 0 2px 20px' }}>
          - Mã số đề tài: <b>{seminar.projectId}</b>
        </p>
        <p style={{ margin: '2px 0 2px 20px' }}>
          - Chủ nhiệm đề tài: <b>{seminar.studentLeader}</b> (Lớp {seminar.studentClass}, MSSV: {seminar.studentCode})
        </p>
        <p style={{ margin: '2px 0 6px 20px' }}>
          - Người hướng dẫn khoa học: <b>{seminar.advisor}</b>
        </p>

        <p style={{ margin: '6px 0 4px' }}>
          <b>4. Nội dung sinh hoạt khoa học & Ý kiến đóng góp của Hội thảo:</b>
        </p>
        <div style={{ backgroundColor: '#FAFAFA', padding: 10, border: '1px solid #ECECEC', borderRadius: 4, margin: '4px 0 8px', fontSize: '11pt' }}>
          <p style={{ margin: '3px 0' }}>
            • <b>Báo cáo của nhóm sinh viên:</b> Nhóm đã hoàn thành khảo sát thực tế quy trình nghiệp vụ, hoàn thiện tài liệu đặc tả kiến trúc giải pháp, thiết kế cơ sở dữ liệu và triển khai thử nghiệm các phân hệ cốt lõi. Khối lượng công việc đạt xấp xỉ 85% kế hoạch Mốc 2.
          </p>
          {seminar.feedbackNotes?.map((f, i) => (
            <p key={i} style={{ margin: '3px 0' }}>
              • <b>Ý kiến của {f.author} ({f.role}):</b> {f.comment}
            </p>
          ))}
          <p style={{ margin: '3px 0' }}>
            • <b>Ý kiến giải trình của nhóm nghiên cứu:</b> Nhóm sinh viên đã tiếp thu toàn bộ góp ý của các Thầy/Cô và cam kết hoàn thiện các module, chuẩn bị bài báo khoa học và kiểm tra đạo văn trước buổi nghiệm thu chính thức.
          </p>
        </div>

        <p style={{ margin: '6px 0 4px' }}>
          <b>5. Kết luận của Hội thảo:</b>
        </p>
        <p style={{ textIndent: 20, margin: '4px 0', textAlign: 'justify', fontStyle: 'italic' }}>
          "{seminar.conclusion || 'Đề tài đạt tiến độ xuất sắc, nhất trí cho phép tiếp tục triển khai giai đoạn thực nghiệm và chuẩn bị hồ sơ nghiệm thu chính thức theo QĐ 521.'}"
        </p>
      </div>

      {/* CHỮ KÝ HAI BÊN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, textAlign: 'center', fontSize: '12pt' }}>
        <div style={{ width: '45%' }}>
          <div style={{ fontWeight: 'bold' }}>THƯ KÝ PHIÊN HỌP</div>
          <div style={{ fontStyle: 'italic', fontSize: '10pt' }}>(Ký và ghi rõ họ tên)</div>
          <div style={{ marginTop: 55, fontWeight: 'bold' }}>{seminar.secretary}</div>
        </div>

        <div style={{ width: '45%' }}>
          <div style={{ fontWeight: 'bold' }}>CHỦ TỌA SINH HOẠT KHOA HỌC</div>
          <div style={{ fontStyle: 'italic', fontSize: '10pt' }}>(Ký và ghi rõ họ tên)</div>
          <div style={{ marginTop: 55, fontWeight: 'bold' }}>{seminar.chair}</div>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;
