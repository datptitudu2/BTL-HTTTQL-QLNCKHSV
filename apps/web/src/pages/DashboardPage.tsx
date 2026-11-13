import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  Statistic,
  List,
  Spin,
} from 'antd';
import {
  RocketOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  AuditOutlined,
  DollarOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

interface DynamicTask {
  code: string;
  title: string;
  status: string;
  color: string;
  path: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [outlines, setOutlines] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({ seminars: [], reports: [], changeRequests: [], milestones: [] });
  const [acceptances, setAcceptances] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [awards, setAwards] = useState<any>({ nominations: [], certificates: [], lecturerHours: [], studentBonuses: [] });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [pRes, oRes, prRes, aRes, bRes, awRes, nRes, sRes] = await Promise.all([
          api.get('/projects').catch(() => ({ data: [] })),
          api.get('/outlines').catch(() => ({ data: [] })),
          api.get('/progress/overview').catch(() => ({ data: { seminars: [], reports: [], changeRequests: [], milestones: [] } })),
          api.get('/acceptance').catch(() => ({ data: { acceptances: [] } })),
          api.get('/budgets').catch(() => ({ data: [] })),
          api.get('/awards').catch(() => ({ data: { nominations: [], certificates: [], lecturerHours: [], studentBonuses: [] } })),
          api.get('/notifications').catch(() => ({ data: [] })),
          api.get('/schedule/events').catch(() => ({ data: [] })),
        ]);
        setProjects(Array.isArray(pRes.data) ? pRes.data : []);
        setOutlines(Array.isArray(oRes.data) ? oRes.data : []);
        setProgress(prRes.data || { seminars: [], reports: [], changeRequests: [], milestones: [] });
        setAcceptances(aRes.data?.acceptances || []);
        setBudgets(Array.isArray(bRes.data) ? bRes.data : []);
        setAwards(awRes.data || { nominations: [], certificates: [], lecturerHours: [], studentBonuses: [] });
        setNotifications(Array.isArray(nRes.data) ? nRes.data : []);
        setEvents(Array.isArray(sRes.data) ? sRes.data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.userId]);

  const buildRoleTasks = (): DynamicTask[] => {
    const tasks: DynamicTask[] = [];

    if (roleCode === 'STUDENT') {
      const pendingRsv = (progress.seminars || []).filter((s: any) =>
        s.members?.some(
          (m: any) =>
            (m.userId === user?.userId || m.attendeeName === user?.fullName) && m.rsvpStatus === 'PENDING',
        ),
      );
      pendingRsv.forEach((s: any) => {
        tasks.push({
          code: s.projectId,
          title: `Xác nhận tham dự Sinh hoạt khoa học "${s.planTitle || s.project?.titleVi}"`,
          status: 'Chờ xác nhận RSVP',
          color: 'red',
          path: '/progress',
        });
      });

      const revisionOutlines = outlines.filter((o) => o.approvalStatus === 'REVISION_REQUIRED');
      revisionOutlines.forEach((o) => {
        tasks.push({
          code: o.projectId,
          title: `Chỉnh sửa Đề cương Mẫu 2 (v${o.versionNo}) theo góp ý GVHD/Khoa`,
          status: 'Cần sửa Đề cương',
          color: 'orange',
          path: '/outlines',
        });
      });

      const myProj = projects.find((p) =>
        p.project_members?.some((m: any) => m.student_id === user?.studentId),
      );
      if (!myProj) {
        tasks.push({
          code: 'ĐK-2026',
          title: 'Bạn chưa tham gia đề tài nào trong Đợt 2026-2027. Nhấn để Đăng ký đề tài mới (Mẫu 1)',
          status: 'Sẵn sàng đăng ký',
          color: 'blue',
          path: '/projects/new',
        });
      }
    } else if (roleCode === 'LECTURER') {
      outlines
        .filter((o) => o.approvalStatus === 'PENDING')
        .forEach((o) => {
          tasks.push({
            code: o.projectId,
            title: `Thẩm định Đề cương Mẫu 2 (${o.project?.titleVi})`,
            status: 'Chờ GVHD duyệt',
            color: 'red',
            path: '/outlines',
          });
        });

      (progress.reports || [])
        .filter((r: any) => !r.assessment)
        .forEach((r: any) => {
          tasks.push({
            code: r.projectId,
            title: `Nhận xét Báo cáo tiến độ (${r.milestone?.milestoneName})`,
            status: 'Chờ đánh giá',
            color: 'orange',
            path: '/progress',
          });
        });
    } else if (roleCode === 'FACULTY_SECRETARY' || roleCode === 'FACULTY_LEADER') {
      projects
        .filter((p) => p.status === 'PROPOSED')
        .forEach((p) => {
          tasks.push({
            code: p.project_id,
            title: `Sơ tuyển đề xuất đề tài & Lập Công văn Mẫu 1: "${p.title_vi}"`,
            status: 'Chờ Khoa sơ tuyển',
            color: 'red',
            path: '/projects',
          });
        });

      outlines
        .filter((o) => o.approvalStatus === 'ADVISOR_APPROVED')
        .forEach((o) => {
          tasks.push({
            code: o.projectId,
            title: `Ký duyệt Đề cương Mẫu 2 (Cấp 2 - Khoa): ${o.projectId}`,
            status: 'GVHD đã duyệt',
            color: 'blue',
            path: '/outlines',
          });
        });

      budgets.forEach((b) => {
        (b.settlements || [])
          .filter((s: any) => !s.facultyConfirmed)
          .forEach((s: any) => {
            tasks.push({
              code: b.projectId,
              title: `Xác nhận hoàn thành chứng từ ${s.voucherNo} (${Number(s.amount).toLocaleString('vi-VN')}đ)`,
              status: 'Chờ Khoa xác nhận',
              color: 'orange',
              path: '/budgets',
            });
          });
      });
    } else if (roleCode === 'QLKHCN' || roleCode === 'BOARD' || roleCode === 'ADMIN') {
      projects
        .filter((p) => p.status === 'FACULTY_APPROVED')
        .forEach((p) => {
          tasks.push({
            code: p.project_id,
            title: `Thẩm định & Ban hành Quyết định giao đề tài: "${p.title_vi}"`,
            status: 'Khoa đã sơ tuyển',
            color: 'purple',
            path: '/projects',
          });
        });

      acceptances
        .filter((a) => !a.approvalDocNo && a.avgScore)
        .forEach((a) => {
          tasks.push({
            code: a.projectId,
            title: `Phê duyệt Kết quả Nghiệm thu (${Number(a.avgScore).toFixed(1)}đ - ${a.grade})`,
            status: 'Chờ QĐ Nghiệm thu',
            color: 'green',
            path: '/acceptance',
          });
        });
    } else if (roleCode === 'FINANCE') {
      budgets.forEach((b) => {
        (b.settlements || [])
          .filter((s: any) => s.facultyConfirmed && !s.settledAt)
          .forEach((s: any) => {
            tasks.push({
              code: b.projectId,
              title: `Kiểm tra & Giải ngân chứng từ ${s.voucherNo} (${Number(s.amount).toLocaleString('vi-VN')}đ)`,
              status: b.project?.acceptance?.grade ? 'Đủ ĐK Giải ngân' : 'Chờ Nghiệm thu',
              color: b.project?.acceptance?.grade ? 'green' : 'orange',
              path: '/budgets',
            });
          });
      });
    } else if (roleCode === 'STUDENT_AFFAIRS') {
      (awards.studentBonuses || [])
        .filter((sb: any) => sb.approvalStatus !== 'APPROVED')
        .forEach((sb: any) => {
          tasks.push({
            code: sb.projectId,
            title: `Duyệt cộng +${sb.trainingScore}đ ĐRL & Điểm Học bổng cho ${sb.student?.user?.fullName} (${sb.studentId})`,
            status: 'Chờ CTSV duyệt',
            color: 'blue',
            path: '/awards',
          });
        });
    }

    return tasks;
  };

  const tasks = buildRoleTasks();
  const latestNotif = notifications[0];
  const nextEvent = events[0];

  const statsCount = {
    totalProjects: projects.length,
    ongoing: projects.filter((p) => ['ONGOING', 'OUTLINE_SUBMITTED', 'SUBMITTED'].includes(p.status)).length,
    accepted: projects.filter((p) => p.status === 'ACCEPTED').length,
    certs: awards.certificates?.length || 0,
  };

  return (
    <div style={{ maxWidth: 1450, margin: '0 auto' }}>
      <Spin spinning={loading}>
        {/* 1. BANNER CHÀO MỪNG + THÔNG BÁO REAL-TIME + SỰ KIỆN LỊCH HẠN */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} lg={12}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(105deg, #FFF1F0 0%, #FFE4E6 50%, #FFD1D6 100%)',
                border: '1px solid #FFD4D0',
                borderRadius: 8,
                padding: '22px 26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#C62828', fontWeight: 700, textTransform: 'uppercase' }}>
                  Cổng Dịch vụ Nghiên cứu Khoa học Sinh viên (PTIT SRMS)
                </div>
                <Title level={3} style={{ margin: '4px 0', color: '#C62828', fontWeight: 800 }}>
                  Xin chào {user?.fullName}
                </Title>
                <Text style={{ fontSize: 13, color: '#595959' }}>
                  Vai trò phiên làm việc: <Tag color="red" style={{ fontWeight: 600 }}>{user?.roleName}</Tag>
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Space wrap>
                    <Button type="primary" style={{ backgroundColor: '#C62828', borderColor: '#C62828' }} onClick={() => navigate('/projects')}>
                      Danh mục đề tài NCKH
                    </Button>
                    {roleCode === 'STUDENT' && (
                      <Button onClick={() => navigate('/projects/new')}>Đăng ký đề tài mới</Button>
                    )}
                  </Space>
                </div>
              </div>
              <div style={{ fontSize: 48, userSelect: 'none' }}>🎓</div>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ height: '100%', borderRadius: 8, cursor: 'pointer' }} onClick={() => navigate(latestNotif?.targetUrl || '/projects')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong>Thông báo mới nhất (D9)</Text>
                <Tag color="red">{notifications.filter((n) => !n.readAt).length} chưa đọc</Tag>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#262626', marginBottom: 6 }}>
                {latestNotif?.title || 'Chào mừng năm học NCKH 2026 - 2027'}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {latestNotif?.content || 'Theo dõi các mốc thời hạn Đề cương, Hội thảo và Nghiệm thu.'}
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ height: '100%', borderRadius: 8, cursor: 'pointer' }} onClick={() => navigate('/schedule')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong><CalendarOutlined /> Lịch & Sự kiện sắp tới</Text>
                <Tag color="blue">{events.length} lịch</Tag>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#C62828', marginBottom: 6 }}>
                {nextEvent?.title || 'Xem lịch công tác NCKH toàn Học viện'}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {nextEvent
                  ? `${new Date(nextEvent.startTime).toLocaleDateString('vi-VN')} • ${nextEvent.location || 'PTIT'}`
                  : 'Đồng bộ từ Kho D9 theo phân quyền vai trò'}
              </Text>
            </Card>
          </Col>
        </Row>

        {/* 2. THỐNG KÊ TỔNG QUAN TỪ CSDL THỰC */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 8, cursor: 'pointer' }} onClick={() => navigate('/projects')}>
              <Statistic title="Tổng đề tài Đợt 2026-2027" value={statsCount.totalProjects} prefix={<RocketOutlined />} valueStyle={{ color: '#C62828' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 8, cursor: 'pointer' }} onClick={() => navigate('/progress')}>
              <Statistic title="Đang triển khai / Chờ bảo vệ" value={statsCount.ongoing} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#1890FF' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 8, cursor: 'pointer' }} onClick={() => navigate('/acceptance')}>
              <Statistic title="Đã nghiệm thu đạt" value={statsCount.accepted} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#389E0D' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 8, cursor: 'pointer' }} onClick={() => navigate('/awards')}>
              <Statistic title="Giấy chứng nhận số" value={statsCount.certs} prefix={<TrophyOutlined />} valueStyle={{ color: '#D48806' }} />
            </Card>
          </Col>
        </Row>

        {/* 3. VIỆC CẦN XỬ LÝ THEO ĐÚNG VAI TRÒ + TRUY CẬP NHANH NGHIỆP VỤ */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            <Card
              title={<Text strong style={{ color: '#C62828' }}>Tác vụ cần xử lý dành cho {user?.roleName} ({tasks.length})</Text>}
              bordered={false}
              style={{ borderRadius: 8 }}
            >
              <List
                dataSource={tasks}
                locale={{ emptyText: 'Hiện tại không có hồ sơ tồn đọng nào cần xử lý cho vai trò của bạn.' }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button key="go" type="link" onClick={() => navigate(item.path)}>
                        Xử lý ngay <ArrowRightOutlined />
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color={item.color}>{item.status}</Tag>
                          <Text strong>{item.code}</Text>
                        </Space>
                      }
                      description={item.title}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Card title={<Text strong>Phân hệ Nghiệp vụ Số hóa (DFD 1–6)</Text>} bordered={false} style={{ borderRadius: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }} size={10}>
                <Button block icon={<FileTextOutlined />} onClick={() => navigate('/outlines')}>
                  Đề cương 2 cấp (Mẫu 2 - DFD 4.1)
                </Button>
                <Button block icon={<ClockCircleOutlined />} onClick={() => navigate('/progress')}>
                  Tiến độ & Sinh hoạt KH (Mẫu 3.5)
                </Button>
                <Button block icon={<AuditOutlined />} onClick={() => navigate('/acceptance')}>
                  Hội đồng Nghiệm thu 7 tiêu chí (Mẫu 4)
                </Button>
                <Button block icon={<DollarOutlined />} onClick={() => navigate('/budgets')}>
                  Kinh phí & Quyết toán 3 bước (D7)
                </Button>
                <Button block icon={<SafetyCertificateOutlined />} onClick={() => navigate('/awards')}>
                  Khen thưởng Mẫu 5, Chứng nhận QR & ĐRL (D8)
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};
