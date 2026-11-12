import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Typography,
  Tag,
  Progress,
  Button,
  Space,
  Avatar,
  Calendar,
  List,
  Select,
  Tooltip,
} from 'antd';
import {
  FolderOpenOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  RightOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  FileTextOutlined,
  CommentOutlined,
  DollarCircleOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PtitSpinner } from '../components/common/PtitSpinner';

const { Title } = Typography;

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Hàm xác định đơn vị công tác và thẩm quyền theo đúng 9 vai trò PTIT
  const getRoleConfig = () => {
    switch (roleCode) {
      case 'FINANCE':
        return {
          unit: 'Phòng Tài chính - Kế toán (P.TCKT)',
          desc: 'Thẩm định dự toán kinh phí, kiểm soát chứng từ chi tiêu và thanh quyết toán kinh phí đề tài NCKH sinh viên theo QĐ 521.',
          sectionTitle: 'Hồ sơ Quyết toán Kinh phí NCKH cần thẩm định & giải ngân',
          badgeText: '3 chứng từ chờ duyệt',
          actionBtn: 'Thẩm định & Duyệt chi',
          actionPath: '/budgets',
          btnIcon: <DollarCircleOutlined />,
        };
      case 'QLKHCN':
        return {
          unit: 'Phòng Quản lý Khoa học Công nghệ & HTQT',
          desc: 'Quản lý danh mục đề tài toàn Học viện, cấu hình đợt NCKH, thành lập Hội đồng nghiệm thu và trình Ban Giám Đốc ban hành Quyết định.',
          sectionTitle: 'Danh mục Đề tài NCKH Toàn Học viện (Năm học 2026 - 2027)',
          badgeText: '128 / 150 chỉ tiêu',
          actionBtn: 'Cấu hình đợt NCKH',
          actionPath: '/periods',
          btnIcon: <FolderOpenOutlined />,
        };
      case 'LECTURER':
        return {
          unit: 'Bộ môn Hệ thống thông tin • Khoa CNTT 1',
          desc: 'Hướng dẫn khoa học sinh viên nghiên cứu, duyệt thuyết minh đề cương Mẫu 2, kiểm tra tiến độ Mẫu 3.5 và tham gia Hội đồng nghiệm thu.',
          sectionTitle: 'Đề tài NCKH bạn đang hướng dẫn (Điều 8 QĐ 521: Tối đa 2 đề tài/GV)',
          badgeText: '2 đề tài hướng dẫn',
          actionBtn: 'Duyệt đề cương & Tiến độ',
          actionPath: '/outlines',
          btnIcon: <CheckCircleOutlined />,
        };
      case 'FACULTY_LEADER':
      case 'FACULTY_SECRETARY':
        return {
          unit: 'Khoa Công nghệ thông tin 1',
          desc: 'Sơ tuyển đề tài cấp Khoa, lập Công văn đề xuất Mẫu 1 gửi Học viện, tổ chức Hội thảo sinh hoạt khoa học Mẫu 3.5.',
          sectionTitle: 'Đề tài NCKH Sinh viên Thuộc Khoa CNTT 1 Quản lý',
          badgeText: '24 đề tài Khoa CNTT1',
          actionBtn: 'Lập Công văn đề xuất Mẫu 1',
          actionPath: '/forms',
          btnIcon: <FileTextOutlined />,
        };
      case 'BOARD':
        return {
          unit: 'Ban Giám Đốc Học viện Công nghệ Bưu chính Viễn thông',
          desc: 'Ban hành Quyết định phê duyệt giao đề tài NCKH sinh viên toàn Học viện và ký Quyết định khen thưởng giải thưởng NCKH.',
          sectionTitle: 'Hồ sơ & Quyết định NCKH Sinh viên Trình Ban Giám Đốc Phê duyệt',
          badgeText: '3 quyết định chờ ký',
          actionBtn: 'Ký duyệt Quyết định',
          actionPath: '/forms',
          btnIcon: <SafetyCertificateOutlined />,
        };
      case 'STUDENT_AFFAIRS':
        return {
          unit: 'Phòng Công tác Chính trị & Công tác Sinh viên (P.CT&CTSV)',
          desc: 'Xác nhận thành tích NCKH sinh viên, cộng điểm rèn luyện theo Điều 14 & 15 QĐ 521 và ưu tiên xét cấp học bổng khuyến khích.',
          sectionTitle: 'Danh sách Sinh viên Khen thưởng & Cộng Điểm Rèn luyện NCKH',
          badgeText: '12 sinh viên đạt giải',
          actionBtn: 'Xác nhận Điểm rèn luyện',
          actionPath: '/awards',
          btnIcon: <TrophyOutlined />,
        };
      case 'ADMIN':
        return {
          unit: 'Trung tâm Dịch vụ Số & Quản trị Hệ thống',
          desc: 'Toàn quyền cấu hình hệ thống, quản trị tài khoản 9 vai trò, sao lưu dữ liệu và kiểm tra nhật ký bảo mật.',
          sectionTitle: 'Bảng Điều khiển Quản trị Toàn quyền Hệ thống SRMS PTIT',
          badgeText: 'Toàn quyền ADMIN',
          actionBtn: 'Cấu hình Đợt NCKH',
          actionPath: '/periods',
          btnIcon: <AuditOutlined />,
        };
      case 'STUDENT':
      default:
        return {
          unit: 'Khoa Công nghệ thông tin 1',
          desc: 'Thực hiện nghiên cứu đề tài theo thuyết minh đề cương đã duyệt, tham gia sinh hoạt khoa học Mẫu 3.5 và hoàn thiện sản phẩm nghiệm thu.',
          sectionTitle: 'Đề tài NCKH sinh viên của bạn',
          badgeText: '1 đề tài',
          actionBtn: 'Đăng ký đề tài mới',
          actionPath: '/projects/new',
          btnIcon: <PlusOutlined />,
        };
    }
  };

  const roleConfig = getRoleConfig();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) {
        // Fallback danh mục đề tài mẫu chuẩn hóa khi backend offline
        setProjects([
          {
            project_id: 'SV-2026-CNTT1-001',
            title_vi: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
            title_en: 'Research and development of Student Research Management System for PTIT',
            status: 'ONGOING',
            departments: { dept_name: 'Khoa Công nghệ thông tin 1' },
            project_members: [
              { member_role: 'LEADER', students: { users: { full_name: 'Nguyễn Văn An' } } },
              { member_role: 'MEMBER', students: { users: { full_name: 'Trần Thị Mai' } } },
            ],
            project_advisors: [
              { lecturers: { users: { full_name: 'TS. Ngô Quốc Dũng' } } },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Danh mục nhiệm vụ thích ứng động theo vai trò (Dynamic Tasks by Role)
  const getTasksByRole = () => {
    switch (roleCode) {
      case 'FINANCE':
        return [
          {
            code: '#CT-2027-001',
            title: 'Thẩm định hồ sơ chứng từ hóa đơn linh kiện IoT đề tài SV-2026-CNTT1-001 (2.500.000đ)',
            deadline: '15/05/2027 17:00',
            status: 'Chờ duyệt chi',
            color: 'orange',
            path: '/budgets',
          },
          {
            code: '#CT-2027-002',
            title: 'Kiểm soát hóa đơn dịch vụ cloud server & domain đề tài SV-2026-CNTT1-001 (1.500.000đ)',
            deadline: '15/05/2027 17:00',
            status: 'Chờ duyệt chi',
            color: 'orange',
            path: '/budgets',
          },
          {
            code: '#NS-2026-001',
            title: 'Đối soát và quyết toán đợt tạm ứng kinh phí lần 1 (50%) cho các Khoa đào tạo',
            deadline: '30/12/2026 23:59',
            status: 'Đang thực hiện',
            color: 'blue',
            path: '/budgets',
          },
        ];
      case 'LECTURER':
        return [
          {
            code: '#SV-2026-CNTT1-001',
            title: 'Duyệt Thuyết minh Đề cương chi tiết 12 mục (Mẫu 2) cho nhóm Nguyễn Văn An',
            deadline: '15/10/2026 23:59',
            status: 'Đã hoàn thành',
            color: 'green',
            path: '/outlines',
          },
          {
            code: '#SV-2026-CNTT1-001',
            title: 'Xác nhận Biên bản sinh hoạt khoa học & Hội thảo bộ môn (Mẫu 3.5)',
            deadline: '20/12/2026 08:30',
            status: 'Sắp tới',
            color: 'orange',
            path: '/progress',
          },
          {
            code: '#HD-2027-01',
            title: 'Tham gia Hội đồng nghiệm thu bảo vệ và chấm điểm 7 tiêu chí (Mẫu 4.1)',
            deadline: '28/04/2027 08:30',
            status: 'Kế hoạch',
            color: 'blue',
            path: '/acceptance',
          },
        ];
      case 'QLKHCN':
      case 'ADMIN':
        return [
          {
            code: '#QD-521-2026',
            title: 'Cấu hình đợt NCKH sinh viên năm học 2026 - 2027 và phân bổ chỉ tiêu 150 đề tài',
            deadline: '01/09/2026 00:00',
            status: 'Đã ban hành',
            color: 'green',
            path: '/periods',
          },
          {
            code: '#M1-CNTT1-2026',
            title: 'Rà soát Công văn đề xuất Mẫu 1 cấp Khoa và lập danh mục trình Ban Giám Đốc',
            deadline: '25/09/2026 17:00',
            status: 'Đã thông qua',
            color: 'green',
            path: '/forms',
          },
          {
            code: '#HD-NT-2027',
            title: 'Thành lập Hội đồng nghiệm thu bảo vệ và điều phối lịch họp toàn Học viện',
            deadline: '15/04/2027 17:00',
            status: 'Sắp tới',
            color: 'orange',
            path: '/acceptance',
          },
        ];
      case 'FACULTY_LEADER':
      case 'FACULTY_SECRETARY':
        return [
          {
            code: '#M1-CNTT1-2026',
            title: 'Lập & Ký số Công văn đề xuất Mẫu 1 gửi Phòng QLKH&CN (24 đề tài cấp Khoa)',
            deadline: '25/09/2026 17:00',
            status: 'Đã hoàn thành',
            color: 'green',
            path: '/forms',
          },
          {
            code: '#SHKH-CNTT1-26',
            title: 'Tổ chức Hội thảo khoa học sinh viên & Biên bản sinh hoạt định kỳ Mẫu 3.5',
            deadline: '20/12/2026 08:30',
            status: 'Sắp tới',
            color: 'orange',
            path: '/progress',
          },
          {
            code: '#HD-KHOA-2027',
            title: 'Thành lập Hội đồng chấm đề cương Mẫu 2 và sơ tuyển cấp Khoa CNTT 1',
            deadline: '10/04/2027 08:30',
            status: 'Kế hoạch',
            color: 'blue',
            path: '/acceptance',
          },
        ];
      case 'BOARD':
        return [
          {
            code: '#QD-GIAO-2026',
            title: 'Ký duyệt Quyết định ban hành danh mục 128 đề tài NCKH sinh viên toàn trường',
            deadline: '05/10/2026 17:00',
            status: 'Đã ban hành',
            color: 'green',
            path: '/forms',
          },
          {
            code: '#QD-HD-2027',
            title: 'Phê duyệt Quyết định thành lập các Hội đồng đánh giá nghiệm thu cấp Học viện',
            deadline: '15/04/2027 17:00',
            status: 'Sắp tới',
            color: 'orange',
            path: '/acceptance',
          },
          {
            code: '#QD-KT-2027',
            title: 'Ban hành Quyết định khen thưởng Giải thưởng NCKH sinh viên cấp Học viện',
            deadline: '15/05/2027 17:00',
            status: 'Dự thảo',
            color: 'blue',
            path: '/awards',
          },
        ];
      case 'STUDENT_AFFAIRS':
        return [
          {
            code: '#DRL-NCKH-2027',
            title: 'Thẩm định hồ sơ và xác nhận cộng Điểm rèn luyện NCKH theo Điều 14 QĐ 521',
            deadline: '20/05/2027 17:00',
            status: 'Đang diễn ra',
            color: 'blue',
            path: '/awards',
          },
          {
            code: '#HB-KK-2027',
            title: 'Lập danh sách sinh viên NCKH xuất sắc ưu tiên xét cấp Học bổng khuyến khích',
            deadline: '25/05/2027 17:00',
            status: 'Sắp tới',
            color: 'orange',
            path: '/awards',
          },
          {
            code: '#GCN-NCKH-2027',
            title: 'Cấp Giấy chứng nhận hoàn thành đề tài NCKH sinh viên năm học 2026 - 2027',
            deadline: '30/05/2027 17:00',
            status: 'Kế hoạch',
            color: 'blue',
            path: '/forms',
          },
        ];
      case 'STUDENT':
      default:
        return [
          {
            code: '#SV-2026-CNTT1-001',
            title: 'Hoàn thiện Báo cáo tổng kết & Sản phẩm nghiệm thu (Mẫu 3.1 - 3.4)',
            deadline: '15/04/2027 17:00',
            status: 'Đang thực hiện',
            color: 'blue',
            path: '/projects/SV-2026-CNTT1-001',
          },
          {
            code: '#SV-2026-CNTT1-001',
            title: 'Tổ chức sinh hoạt khoa học & Hội thảo cấp Khoa CNTT1 (Mẫu 3.5)',
            deadline: '20/12/2026 08:30',
            status: 'Sắp tới',
            color: 'orange',
            path: '/progress',
          },
          {
            code: '#SV-2026-CNTT1-001',
            title: 'Nộp Thuyết minh Đề cương chi tiết (Mẫu 2 - 12 mục quy chuẩn QĐ 521)',
            deadline: '15/10/2026 23:59',
            status: 'Đã hoàn thành',
            color: 'green',
            path: '/outlines',
          },
        ];
    }
  };

  const currentTasks = getTasksByRole();

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* 1. HÀNG BANNER CHÀO MỪNG CHUẨN XÁC THEO ẢNH S-LINK DASHBOARD */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Banner đỏ hồng Xin chào */}
        <div
          style={{
            flex: 2,
            minWidth: 320,
            background: 'linear-gradient(105deg, #FFF1F0 0%, #FFE4E6 50%, #FFD1D6 100%)',
            border: '1px solid #FFD4D0',
            borderRadius: 8,
            padding: '24px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: '#C62828', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
              Cổng dịch vụ nghiên cứu khoa học sinh viên (SRMS)
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#C62828', lineHeight: 1.2 }}>
              Xin chào {user?.fullName || 'Nguyễn Văn An'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginTop: 4 }}>
              Mừng bạn quay lại hệ thống
            </div>
            <div style={{ fontSize: 12, color: '#595959', marginTop: 8 }}>
              Vai trò hiện tại: <b style={{ color: '#C62828' }}>{user?.roleName || 'Sinh viên'}</b> • Đơn vị: <b style={{ color: '#262626' }}>{roleConfig.unit}</b>
            </div>
          </div>

          {/* Icon bàn tay vẫy hoà bình theo ảnh S-Link */}
          <div style={{ fontSize: 50, userSelect: 'none', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>
            ✌️
          </div>
        </div>

        {/* Thẻ Thông báo */}
        <div
          style={{
            flex: 1.1,
            minWidth: 260,
            backgroundColor: '#FFFFFF',
            border: '1px solid #EDEDEE',
            borderRadius: 8,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>Thông báo NCKH</span>
            <Tag color="red" style={{ margin: 0 }}>Mới</Tag>
          </div>
          <div style={{ margin: '10px 0', fontSize: 13, fontWeight: 600, color: '#262626', lineHeight: 1.4 }}>
            Thông báo mở cổng Đăng ký đề tài NCKH sinh viên năm học 2026 - 2027 (Đợt 1)
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            12/11/2026 • Phòng Quản lý Khoa học Công nghệ
          </div>
        </div>

        {/* Thẻ Sự kiện */}
        <div
          style={{
            flex: 1.1,
            minWidth: 260,
            backgroundColor: '#FFFFFF',
            border: '1px solid #EDEDEE',
            borderRadius: 8,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>Sự kiện sắp tới</span>
            <Tag color="blue" style={{ margin: 0 }}>Lịch NCKH</Tag>
          </div>
          <div style={{ margin: '10px 0', fontSize: 13, fontWeight: 600, color: '#262626', lineHeight: 1.4 }}>
            Hội thảo khoa học cấp Khoa & Báo cáo tiến độ lần 1 (Mẫu 3.5)
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            20/12/2026 • Phòng Hội thảo Tầng 2 Nhà A2
          </div>
        </div>
      </div>

      {/* 2. KHỐI THẺ THÍCH ỨNG LINH HOẠT THEO VAI TRÒ ĐĂNG NHẬP (ROLE-ADAPTIVE DASHBOARD) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626', fontSize: 17 }}>
              {roleConfig.sectionTitle}
            </Title>
            <Tag color={roleCode === 'FINANCE' ? 'orange' : roleCode === 'QLKHCN' ? 'purple' : 'green'} style={{ borderRadius: 10, padding: '0 8px', fontWeight: 600 }}>
              {roleConfig.badgeText}
            </Tag>
          </div>

          <Space size={12}>
            <Button
              type="primary"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600, borderRadius: 6 }}
              icon={roleConfig.btnIcon}
              onClick={() => navigate(roleConfig.actionPath)}
            >
              {roleConfig.actionBtn}
            </Button>
            <Select
              defaultValue="HK1 26-27"
              size="small"
              style={{ width: 120 }}
              options={[
                { value: 'HK1 26-27', label: 'HK1 26-27' },
                { value: 'HK2 26-27', label: 'HK2 26-27' },
              ]}
            />
            <a style={{ color: '#C62828', fontSize: 13, fontWeight: 500 }} onClick={() => navigate(roleConfig.actionPath)}>
              Xem tất cả <RightOutlined style={{ fontSize: 10 }} />
            </a>
          </Space>
        </div>

        {/* NỘI DUNG HIỂN THỊ ĐỘNG THEO TỪNG VAI TRÒ */}
        {roleCode === 'FINANCE' ? (
          /* =========================================================================
             GIAO DIỆN PHÒNG TÀI CHÍNH - KẾ TOÁN (P.TCKT)
             Hiển thị danh mục chứng từ hóa đơn, kinh phí giải ngân và dự toán duyệt
             ========================================================================= */
          <Row gutter={[16, 16]}>
            {/* THẺ CHỨNG TỪ 1 */}
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EDEDEE',
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onClick={() => navigate('/budgets')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#C62828', fontWeight: 700 }}>PC-2027-001</span>
                    <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>Chờ duyệt chi</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Mua linh kiện vi điều khiển & cảm biến IoT
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>
                    Đề tài: <b>SV-2026-CNTT1-001</b>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#C62828', marginBottom: 8 }}>
                    2.500.000 VNĐ
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Chủ nhiệm: Nguyễn Văn An • GVHD: TS. Ngô Quốc Dũng
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: '#52C41A', fontWeight: 600 }}>Hóa đơn VAT tài chính</span>
                  <Avatar size={24} style={{ backgroundColor: '#FA8C16', fontSize: 11 }}>TC</Avatar>
                </div>
              </div>
            </Col>

            {/* THẺ CHỨNG TỪ 2 */}
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EDEDEE',
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onClick={() => navigate('/budgets')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#C62828', fontWeight: 700 }}>PC-2027-002</span>
                    <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>Chờ duyệt chi</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Thuê máy chủ Cloud Server & tên miền
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>
                    Đề tài: <b>SV-2026-CNTT1-001</b>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#C62828', marginBottom: 8 }}>
                    1.500.000 VNĐ
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Chủ nhiệm: Nguyễn Văn An • GVHD: TS. Ngô Quốc Dũng
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: '#1890FF', fontWeight: 600 }}>Hợp đồng & hóa đơn số</span>
                  <Avatar size={24} style={{ backgroundColor: '#FA8C16', fontSize: 11 }}>TC</Avatar>
                </div>
              </div>
            </Col>

            {/* THẺ CHỨNG TỪ 3 */}
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EDEDEE',
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onClick={() => navigate('/budgets')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#C62828', fontWeight: 700 }}>PC-2027-003</span>
                    <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>Chờ duyệt chi</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    In ấn báo cáo bìa cứng & đĩa CD sản phẩm
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>
                    Đề tài: <b>SV-2026-CNTT1-001</b>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#C62828', marginBottom: 8 }}>
                    1.000.000 VNĐ
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Chủ nhiệm: Nguyễn Văn An • GVHD: TS. Ngô Quốc Dũng
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: '#52C41A', fontWeight: 600 }}>Thanh quyết toán 100%</span>
                  <Avatar size={24} style={{ backgroundColor: '#FA8C16', fontSize: 11 }}>TC</Avatar>
                </div>
              </div>
            </Col>

            {/* THẺ TỔNG HỢP NGÂN SÁCH ĐỢT NCKH TOÀN TRƯỜNG */}
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EDEDEE',
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onClick={() => navigate('/periods')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#1890FF', fontWeight: 700 }}>NGÂN SÁCH NCKH</span>
                    <Tag color="green" style={{ margin: 0, fontSize: 11 }}>2026 - 2027</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Tổng kinh phí Học viện phê duyệt cấp
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1890FF', marginBottom: 4 }}>
                    800.000.000 VNĐ
                  </div>
                  <div style={{ fontSize: 12, color: '#595959', marginBottom: 8 }}>
                    Đã giải ngân đợt 1: <b>400.000.000đ (50%)</b>
                  </div>
                  <Progress percent={50} strokeColor="#1890FF" size="small" showInfo={false} />
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: '#8c8c8c' }}>Còn lại: 400.000.000đ</span>
                  <Avatar size={24} style={{ backgroundColor: '#1890FF', fontSize: 11 }}>HV</Avatar>
                </div>
              </div>
            </Col>
          </Row>
        ) : roleCode === 'LECTURER' ? (
          /* =========================================================================
             GIAO DIỆN GIẢNG VIÊN HƯỚNG DẪN (LECTURER)
             Hiển thị đề tài đang hướng dẫn và số giờ chuẩn NCKH theo Điều 8 & 16 QĐ 521
             ========================================================================= */
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EDEDEE',
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onClick={() => navigate('/projects/SV-2026-CNTT1-001')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>SV-2026-CNTT1-001</span>
                    <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>Đang hướng dẫn</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 10 }}>
                    Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 12 }}>
                    Chủ nhiệm: <b>Nguyễn Văn An</b> (3 thành viên)
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span>Tiến trình:</span>
                      <b>85%</b>
                    </div>
                    <Progress percent={85} size="small" strokeColor="#C62828" showInfo={false} />
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: '#C62828', fontWeight: 600 }}>30 Giờ chuẩn NCKH</span>
                  <Avatar size={24} style={{ backgroundColor: '#262626', fontSize: 11 }}>AN</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EDEDEE',
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onClick={() => navigate('/projects')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>SV-2026-CNTT1-005</span>
                    <Tag color="volcano" style={{ margin: 0, fontSize: 10 }}>Sắp nghiệm thu</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 10 }}>
                    Ứng dụng Deep Learning trong phân tích bất thường lưu lượng mạng IoT
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 12 }}>
                    Chủ nhiệm: <b>Trần Bảo Ngọc</b> (2 thành viên)
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span>Tiến trình:</span>
                      <b>90%</b>
                    </div>
                    <Progress percent={90} size="small" strokeColor="#C62828" showInfo={false} />
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: '#C62828', fontWeight: 600 }}>30 Giờ chuẩn NCKH</span>
                  <Avatar size={24} style={{ backgroundColor: '#262626', fontSize: 11 }}>BN</Avatar>
                </div>
              </div>
            </Col>
          </Row>
        ) : roleCode === 'QLKHCN' || roleCode === 'ADMIN' ? (
          /* =========================================================================
             GIAO DIỆN PHÒNG QUẢN LÝ KHOA HỌC CÔNG NGHỆ (P.QLKH&CN)
             Hiển thị thống kê tổng quan toàn Học viện theo từng Khoa
             ========================================================================= */
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer' }}
                onClick={() => navigate('/projects')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#C62828' }}>KHOA CNTT 1</span>
                  <Tag color="blue">24 đề tài</Tag>
                </div>
                <div style={{ fontSize: 13, color: '#595959', marginBottom: 8 }}>18 đề tài đã duyệt • 6 đề tài đang thẩm định</div>
                <Progress percent={75} size="small" strokeColor="#C62828" />
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer' }}
                onClick={() => navigate('/projects')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1890FF' }}>KHOA ĐTVT 1</span>
                  <Tag color="blue">20 đề tài</Tag>
                </div>
                <div style={{ fontSize: 13, color: '#595959', marginBottom: 8 }}>15 đề tài đã duyệt • 5 đề tài đang thẩm định</div>
                <Progress percent={75} size="small" strokeColor="#1890FF" />
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer' }}
                onClick={() => navigate('/projects')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#52C41A' }}>KHOA ATTT</span>
                  <Tag color="blue">18 đề tài</Tag>
                </div>
                <div style={{ fontSize: 13, color: '#595959', marginBottom: 8 }}>14 đề tài đã duyệt • 4 đề tài đang thẩm định</div>
                <Progress percent={78} size="small" strokeColor="#52C41A" />
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer' }}
                onClick={() => navigate('/projects')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#722ED1' }}>KHOA ĐA PHƯƠNG TIỆN</span>
                  <Tag color="blue">16 đề tài</Tag>
                </div>
                <div style={{ fontSize: 13, color: '#595959', marginBottom: 8 }}>12 đề tài đã duyệt • 4 đề tài đang thẩm định</div>
                <Progress percent={75} size="small" strokeColor="#722ED1" />
              </div>
            </Col>
          </Row>
        ) : roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY' ? (
          /* =========================================================================
             GIAO DIỆN LÃNH ĐẠO & THƯ KÝ KHOA (FACULTY_LEADER / FACULTY_SECRETARY)
             Quản lý danh mục 24 đề tài của Khoa, duyệt Mẫu 1 và sinh hoạt Mẫu 3.5
             ========================================================================= */
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/projects/SV-2026-CNTT1-001')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>SV-2026-CNTT1-001</span>
                    <Tag color="green">Sơ tuyển Đạt</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6 }}>
                    Chủ nhiệm: <b>Nguyễn Văn An</b> • GVHD: TS. Ngô Quốc Dũng
                  </div>
                  <Progress percent={85} size="small" strokeColor="#C62828" />
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#C62828', fontWeight: 600 }}>Bộ môn HTTT</span>
                  <Tag color="blue">Khoa CNTT1</Tag>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/projects')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>SV-2026-CNTT1-004</span>
                    <Tag color="green">Sơ tuyển Đạt</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    PHƯƠNG PHÁP TIỀN XỬ LÝ VÀ TRÍCH XUẤT ĐẶC TRƯNG TỪ DỮ LIỆU POS
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6 }}>
                    Chủ nhiệm: <b>Kim Ngọc Bách</b> • GVHD: PGS.TS. Hoàng Minh
                  </div>
                  <Progress percent={92} size="small" strokeColor="#C62828" />
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#1890FF', fontWeight: 600 }}>Bộ môn KHMT</span>
                  <Tag color="blue">Khoa CNTT1</Tag>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/forms')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#C62828', fontWeight: 700 }}>MẪU 1 CẤP KHOA</span>
                    <Tag color="purple">24 đề tài</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Công văn số 45/HV-CNTT1 về việc đăng ký đề tài NCKH sinh viên
                  </div>
                  <div style={{ fontSize: 11, color: '#595959', marginBottom: 6 }}>
                    Đã thông qua Hội đồng Khoa học Khoa CNTT1 và gửi Học viện
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#52C41A' }}>
                    100% Hồ sơ hợp lệ
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#595959' }}>Ngày gửi: 10/09/2026</span>
                  <Tag color="green">Đã nộp</Tag>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/progress')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#FA8C16', fontWeight: 700 }}>MẪU 3.5 SINH HOẠT KH</span>
                    <Tag color="orange">Đợt 1</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Hội thảo khoa học sinh viên & Báo cáo tiến độ định kỳ cấp Khoa
                  </div>
                  <div style={{ fontSize: 11, color: '#595959', marginBottom: 6 }}>
                    45 sinh viên & 12 giảng viên tham gia thảo luận góp ý đề cương
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1890FF' }}>
                    Biên bản đã lưu trữ số
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#595959' }}>Phòng Hội thảo A2</span>
                  <Tag color="blue">Hoàn tất</Tag>
                </div>
              </div>
            </Col>
          </Row>
        ) : roleCode === 'BOARD' ? (
          /* =========================================================================
             GIAO DIỆN BAN GIÁM ĐỐC HỌC VIỆN (BOARD)
             Ban hành Quyết định giao đề tài, thành lập Hội đồng và khen thưởng
             ========================================================================= */
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/forms')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#C62828', fontWeight: 700 }}>QUYẾT ĐỊNH GIAO ĐỀ TÀI</span>
                    <Tag color="green">Đã ban hành</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Quyết định phê duyệt giao nhiệm vụ 128 đề tài NCKH sinh viên năm học 2026-2027
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Căn cứ Tờ trình số 188/TTr-QLKHCN của Phòng QLKH&CN
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#C62828', fontWeight: 600 }}>Ký số BGĐ Học viện</span>
                  <Avatar size={24} style={{ backgroundColor: '#C62828', fontSize: 11 }}>BGD</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/acceptance')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#1890FF', fontWeight: 700 }}>HỘI ĐỒNG NGHIỆM THU</span>
                    <Tag color="orange">Chờ ký</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Quyết định thành lập 16 Hội đồng đánh giá nghiệm thu cấp Học viện
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Quy chuẩn 5 thành viên/Hội đồng theo Điều 11 QĐ 521
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#1890FF', fontWeight: 600 }}>Trình ký đợt 2</span>
                  <Avatar size={24} style={{ backgroundColor: '#1890FF', fontSize: 11 }}>HĐ</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/awards')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#FA8C16', fontWeight: 700 }}>KHEN THƯỞNG GIẢI THƯỞNG</span>
                    <Tag color="gold">Dự thảo</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Quyết định tặng Giấy khen & Tiền thưởng Giải thưởng NCKH Sinh viên cấp Học viện
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Cơ cấu giải: 04 Giải Nhất, 08 Giải Nhì, 12 Giải Ba, 16 Giải KK
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#FA8C16', fontWeight: 600 }}>Quỹ Khen thưởng NCKH</span>
                  <Avatar size={24} style={{ backgroundColor: '#FA8C16', fontSize: 11 }}>KT</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/regulations')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#52C41A', fontWeight: 700 }}>QUY CHẾ QUẢN LÝ</span>
                    <Tag color="green">QĐ 521</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Quyết định số 521/QĐ-HV ngày 24/5/2022 về Quy chế Quản lý hoạt động NCKH Sinh viên
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Áp dụng toàn diện cho các cơ sở đào tạo Hà Nội và TP.HCM
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#52C41A', fontWeight: 600 }}>Văn bản Quy phạm nội bộ</span>
                  <Avatar size={24} style={{ backgroundColor: '#52C41A', fontSize: 11 }}>QC</Avatar>
                </div>
              </div>
            </Col>
          </Row>
        ) : roleCode === 'STUDENT_AFFAIRS' ? (
          /* =========================================================================
             GIAO DIỆN PHÒNG CÔNG TÁC CHÍNH TRỊ & CTSV (STUDENT_AFFAIRS)
             Cộng Điểm rèn luyện theo Điều 14 QĐ 521, chính sách học bổng và chứng nhận
             ========================================================================= */
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/awards')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#C62828', fontWeight: 700 }}>ĐIỂM RÈN LUYỆN (ĐIỀU 14)</span>
                    <Tag color="red">128 sinh viên</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Xác nhận kết quả NCKH và cập nhật Điểm rèn luyện học kỳ 2 năm học 2026-2027
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Nhất: +10đ • Nhì: +8đ • Ba: +6đ • KK: +4đ • Hoàn thành: +3đ
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#C62828', fontWeight: 600 }}>Đồng bộ Cổng CTSV</span>
                  <Avatar size={24} style={{ backgroundColor: '#C62828', fontSize: 11 }}>RL</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/awards')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#1890FF', fontWeight: 700 }}>HỌC BỔNG KHUYẾN KHÍCH</span>
                    <Tag color="blue">Ưu tiên xét</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Danh sách sinh viên NCKH đạt giải ưu tiên xét học bổng khuyến khích học tập
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Áp dụng Điều 15 Quyết định 521/QĐ-HV
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#1890FF', fontWeight: 600 }}>36 Suất học bổng</span>
                  <Avatar size={24} style={{ backgroundColor: '#1890FF', fontSize: 11 }}>HB</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/forms')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#52C41A', fontWeight: 700 }}>GIẤY CHỨNG NHẬN NCKH</span>
                    <Tag color="green">Mẫu số hoá</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Cấp Giấy chứng nhận tham gia NCKH có chữ ký số và mã định danh tra cứu trực tuyến
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Tích hợp hồ sơ năng lực số của sinh viên trên S-Link
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#52C41A', fontWeight: 600 }}>Tra cứu QR Code</span>
                  <Avatar size={24} style={{ backgroundColor: '#52C41A', fontSize: 11 }}>CN</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/projects')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#722ED1', fontWeight: 700 }}>HỒ SƠ BÀI BÁO KH</span>
                    <Tag color="purple">8 bài báo</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Sinh viên đồng tác giả bài báo công bố trên tạp chí chuyên ngành và kỷ yếu hội thảo
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Quyền lợi cộng tối đa 10 điểm rèn luyện & khen thưởng đặc biệt
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#722ED1', fontWeight: 600 }}>Tạp chí KHCN PTIT</span>
                  <Avatar size={24} style={{ backgroundColor: '#722ED1', fontSize: 11 }}>BB</Avatar>
                </div>
              </div>
            </Col>
          </Row>
        ) : (
          /* =========================================================================
             GIAO DIỆN SINH VIÊN (STUDENT)
             Hiển thị đề tài nghiên cứu của sinh viên, tiến độ và tín chỉ tích lũy
             ========================================================================= */
          loading ? (
            <PtitSpinner tip="Đang tải dữ liệu đề tài..." minHeight={180} />
          ) : (
            <Row gutter={[16, 16]}>
              {projects.map((p) => {
                const advisor = p.project_advisors?.[0];
                return (
                  <Col xs={24} sm={12} lg={6} key={p.project_id}>
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EDEDEE',
                        borderRadius: 8,
                        padding: 16,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => navigate(`/projects/${p.project_id}`)}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>{p.project_id}</span>
                          <Tag color="volcano" style={{ margin: 0, fontSize: 10, borderRadius: 4 }}>Sắp nghiệm thu</Tag>
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#262626',
                            lineHeight: 1.35,
                            marginBottom: 10,
                            height: 38,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {p.title_vi}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginBottom: 12 }}>
                          <span><TeamOutlined style={{ color: '#1890FF', marginRight: 4 }} />{p.project_members?.length || 2} thành viên</span>
                          <span><FileTextOutlined style={{ color: '#FA8C16', marginRight: 4 }} />12 mục đề cương</span>
                          <span><CommentOutlined style={{ color: '#52C41A', marginRight: 4 }} />Mẫu 3.5</span>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#595959', marginBottom: 4 }}>
                            <span>Tiến trình:</span>
                            <b>85%</b>
                          </div>
                          <Progress percent={85} size="small" strokeColor="#C62828" showInfo={false} />
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                        <span style={{ color: '#8c8c8c' }}>3 Tín chỉ tương đương</span>
                        <Tooltip title={`GVHD: ${advisor?.lecturers?.users?.full_name || 'TS. Ngô Quốc Dũng'}`}>
                          <Avatar size={24} style={{ backgroundColor: '#262626', fontSize: 11 }}>ND</Avatar>
                        </Tooltip>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )
        )}
      </div>

      {/* 3. PHẦN DƯỚI: NHIỆM VỤ MỐC TIẾN ĐỘ THÍCH ỨNG THEO VAI TRÒ & MINI CALENDAR */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #EDEDEE',
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
                  {roleCode === 'FINANCE' ? 'Nhiệm vụ Thẩm định & Nghiệp vụ Tài chính' : 'Nhiệm vụ & Mốc hạn tiến độ NCKH'}
                </span>
                <Tag color="cyan">Đang diễn ra ({currentTasks.length})</Tag>
              </div>
              <a style={{ color: '#C62828', fontSize: 13, fontWeight: 500 }} onClick={() => navigate(roleConfig.actionPath)}>
                Xem chi tiết <RightOutlined style={{ fontSize: 10 }} />
              </a>
            </div>

            <List
              itemLayout="horizontal"
              dataSource={currentTasks}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '12px 14px',
                    marginBottom: 10,
                    borderRadius: 6,
                    border: '1px solid #F0F0F0',
                    backgroundColor: '#FAFAFA',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(item.path)}
                  actions={[
                    <Button type="link" size="small" style={{ color: '#C62828', fontWeight: 600 }}>
                      Thực hiện <ArrowRightOutlined />
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: item.color === 'orange' ? '#FFF7E6' : '#FFF0ED',
                          color: item.color === 'orange' ? '#FA8C16' : '#C62828',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        ✓
                      </div>
                    }
                    title={
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#262626' }}>
                        {item.title}
                      </div>
                    }
                    description={
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                        Mã tham chiếu: <b>{item.code}</b> • Hạn hoàn thành: <b style={{ color: '#262626' }}>{item.deadline}</b> •{' '}
                        <Tag color={item.color} style={{ fontSize: 11, margin: 0 }}>
                          {item.status}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </Col>

        {/* CỘT PHẢI: LỊCH SỰ KIỆN NCKH */}
        <Col xs={24} lg={8}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #EDEDEE',
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
                Lịch trình NCKH
              </span>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>Tháng 11/2026</span>
            </div>

            <Calendar fullscreen={false} />

            <div style={{ marginTop: 14, padding: 12, backgroundColor: '#FFF9F9', border: '1px dashed #FFD4D0', borderRadius: 6 }}>
              <div style={{ fontWeight: 600, color: '#C62828', fontSize: 12 }}>Mốc gần nhất:</div>
              <div style={{ fontSize: 12, color: '#262626', marginTop: 2 }}>
                {roleCode === 'FINANCE'
                  ? '30/12/2026: Quyết toán đợt tạm ứng kinh phí lần 1 (50%) cho các đề tài'
                  : '20/12/2026: Hội thảo sinh hoạt khoa học cấp Khoa (Mẫu 3.5)'}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
