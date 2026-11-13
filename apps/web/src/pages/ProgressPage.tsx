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
  Input,
  DatePicker,
  Form,
  Select,
  Progress,
  Radio,
} from 'antd';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileDoneOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  SendOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  VideoCameraOutlined,
  ReloadOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { printElement } from '../utils/printHelper';

const { Title, Text } = Typography;
const { TextArea } = Input;

const RSVP_MAP: Record<string, { label: string; color: string }> = {
  ACCEPTED_ONSITE: { label: 'Tham dự trực tiếp', color: 'green' },
  ACCEPTED_ONLINE: { label: 'Tham dự Online', color: 'blue' },
  DECLINED: { label: 'Báo vắng', color: 'red' },
  PENDING: { label: 'Chờ phản hồi', color: 'gold' },
};

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';

  const [overview, setOverview] = useState<{
    period: any;
    milestones: any[];
    reports: any[];
    seminars: any[];
    changeRequests: any[];
  }>({
    period: null,
    milestones: [],
    reports: [],
    seminars: [],
    changeRequests: [],
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [createSeminarVisible, setCreateSeminarVisible] = useState(false);
  const [attendeesModalSeminar, setAttendeesModalSeminar] = useState<any>(null);
  const [inviteModalSeminar, setInviteModalSeminar] = useState<any>(null);
  const [minutesModalSeminar, setMinutesModalSeminar] = useState<any>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reviewReportItem, setReviewReportItem] = useState<any>(null);
  const [changeReqModalVisible, setChangeReqModalVisible] = useState(false);

  const [extraInviteesText, setExtraInviteesText] = useState('');
  const [minutesFeedback, setMinutesFeedback] = useState('');
  const [reportReviewAssessment, setReportReviewAssessment] = useState<'PASS' | 'WARNING_DELAY'>('PASS');
  const [reportReviewComment, setReportReviewComment] = useState('');

  const [seminarForm] = Form.useForm();
  const [reportForm] = Form.useForm();
  const [changeForm] = Form.useForm();

  const isStaff = ['FACULTY_SECRETARY', 'FACULTY_LEADER', 'QLKHCN', 'ADMIN'].includes(roleCode);
  const isLecturer = roleCode === 'LECTURER';
  const canCreateSeminarOrInvite = isStaff; // Sinh viên KHÔNG được phát hành thư mời / lập lịch hội thảo Khoa
  const canReviewReport = isLecturer || isStaff;
  const canSubmitStudentAction = roleCode === 'STUDENT' || roleCode === 'ADMIN';

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [ovRes, projRes] = await Promise.all([
        api.get('/progress/overview'),
        api.get('/projects'),
      ]);
      setOverview(ovRes.data);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể tải dữ liệu tiến độ & hội thảo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const eligibleProjects = projects.filter((p) => {
    if (!['ONGOING', 'OUTLINE_SUBMITTED', 'SUBMITTED', 'ACCEPTED'].includes(p.status)) return false;
    if (roleCode === 'STUDENT') {
      const uid = user?.studentId;
      const uname = (user?.fullName || '').toLowerCase();
      return p.project_members?.some(
        (m: any) =>
          (uid && m.student_id === uid) ||
          (uname && m.students?.users?.full_name?.toLowerCase().includes(uname)),
      );
    }
    return true;
  });

  const handleRsvp = async (seminarId: number, rsvpStatus: 'ACCEPTED_ONSITE' | 'ACCEPTED_ONLINE' | 'DECLINED') => {
    try {
      await api.patch(`/progress/seminars/${seminarId}/rsvp`, { rsvpStatus });
      message.success(`Đã cập nhật trạng thái tham dự (${RSVP_MAP[rsvpStatus].label}) vào CSDL.`);
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể cập nhật RSVP');
    }
  };

  const handleCreateSeminar = async (values: any) => {
    try {
      setSubmitting(true);
      await api.post('/progress/seminars', {
        projectId: values.projectId,
        planTitle: values.planTitle,
        heldAt: values.heldAt ? values.heldAt.toISOString() : new Date().toISOString(),
        location: values.location,
        meetingLink: values.meetingLink,
      });
      message.success('Đã lập lịch phiên Sinh hoạt khoa học mới!');
      setCreateSeminarVisible(false);
      seminarForm.resetFields();
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể tạo phiên sinh hoạt khoa học');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendInvitations = async () => {
    if (!inviteModalSeminar) return;
    try {
      setSubmitting(true);
      const extraLines = extraInviteesText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((name) => ({ attendeeName: name, role: 'ATTENDEE', unit: 'Học viện PTIT' }));

      await api.post(`/progress/seminars/${inviteModalSeminar.seminarId}/invite`, {
        invitees: extraLines,
      });
      message.success('Đã phát hành Thư mời tham dự & Thông báo real-time tới toàn bộ đại biểu!');
      setInviteModalSeminar(null);
      setExtraInviteesText('');
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể phát hành thư mời');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMinutes = async () => {
    if (!minutesModalSeminar) return;
    try {
      setSubmitting(true);
      await api.patch(`/progress/seminars/${minutesModalSeminar.seminarId}/minutes`, {
        feedback: minutesFeedback,
      });
      message.success('Đã lưu Biên bản Sinh hoạt khoa học Mẫu 3.5!');
      setMinutesModalSeminar(null);
      setMinutesFeedback('');
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể lưu biên bản');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (values: any) => {
    try {
      setSubmitting(true);
      await api.post('/progress/reports', values);
      message.success('Đã nộp Báo cáo tiến độ định kỳ!');
      setReportModalVisible(false);
      reportForm.resetFields();
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể nộp báo cáo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReviewReport = async () => {
    if (!reviewReportItem) return;
    try {
      setSubmitting(true);
      await api.patch(`/progress/reports/${reviewReportItem.reportId}/review`, {
        assessment: reportReviewAssessment,
        advisorComment: reportReviewComment,
      });
      message.success('Đã lưu đánh giá tiến độ từ GVHD/Khoa!');
      setReviewReportItem(null);
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Lỗi đánh giá tiến độ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateChangeReq = async (values: any) => {
    try {
      setSubmitting(true);
      await api.post('/progress/change-requests', {
        projectId: values.projectId,
        requestType: values.requestType,
        reason: values.reason,
        newDueDate: values.newDueDate ? values.newDueDate.format('YYYY-MM-DD') : undefined,
      });
      message.success('Đã gửi Đơn điều chỉnh / gia hạn tới GVHD thẩm định (DFD 4.6)!');
      setChangeReqModalVisible(false);
      changeForm.resetFields();
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể gửi đơn điều chỉnh');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveChangeReq = async (requestId: number, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/progress/change-requests/${requestId}/approve`, {
        decision,
        comment: decision === 'APPROVED' ? 'Nhất trí phê duyệt đề nghị điều chỉnh theo quy trình.' : 'Chưa đủ lý do thuyết phục.',
      });
      message.success('Đã ghi nhận kết quả phê duyệt đơn điều chỉnh.');
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Chưa thỏa điều kiện duyệt trước đó');
    }
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#262626', fontWeight: 700 }}>
            Quản lý Tiến độ, Sinh hoạt Khoa học (Mẫu 3.5) & Đơn điều chỉnh
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Đồng bộ dữ liệu thực DFD 4.2–4.7: Báo cáo định kỳ, Hội thảo cấp Khoa (Khoa phát hành Thư mời • Đại biểu phản hồi RSVP realtime), Đơn gia hạn 3 cấp.
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAll} loading={loading}>
            Làm mới
          </Button>
          {canSubmitStudentAction && (
            <>
              <Button icon={<FormOutlined />} onClick={() => setReportModalVisible(true)} disabled={eligibleProjects.length === 0}>
                Nộp Báo cáo tiến độ
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => setChangeReqModalVisible(true)} disabled={eligibleProjects.length === 0}>
                Gửi Đơn gia hạn / Điều chỉnh
              </Button>
            </>
          )}
          {canCreateSeminarOrInvite && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              onClick={() => setCreateSeminarVisible(true)}
            >
              Lập lịch Hội thảo (Khoa)
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Cột trái: Mốc kiểm soát từ DB */}
        <Col xs={24} lg={7}>
          <Card
            title={<span style={{ color: '#C62828', fontWeight: 700 }}><ClockCircleOutlined /> Mốc kiểm soát Tiến độ (QĐ 521)</span>}
            bordered={false}
            style={{ borderRadius: 8 }}
            loading={loading}
          >
            <Timeline
              items={overview.milestones.map((m) => {
                const isPast = new Date(m.dueDate) < new Date();
                return {
                  color: isPast ? 'green' : 'blue',
                  children: (
                    <div>
                      <Text strong>{m.milestoneName}</Text>
                      <div>
                        <Tag color="default" style={{ fontSize: 11 }}>{m.milestoneType}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Hạn chót: {new Date(m.dueDate).toLocaleDateString('vi-VN')}
                        </Text>
                      </div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                        Nhắc trước {m.remindDaysBefore} ngày ({m.remindChannels})
                      </div>
                    </div>
                  ),
                };
              })}
            />
          </Card>
        </Col>

        {/* Cột phải: 3 Tabs */}
        <Col xs={24} lg={17}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Tabs
              defaultActiveKey="seminars"
              items={[
                {
                  key: 'seminars',
                  label: `Hội thảo & Thư mời RSVP (${overview.seminars.length})`,
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                      {overview.seminars.map((sem) => {
                        const members = sem.members || [];
                        const onsiteCount = members.filter((m: any) => m.rsvpStatus === 'ACCEPTED_ONSITE').length;
                        const onlineCount = members.filter((m: any) => m.rsvpStatus === 'ACCEPTED_ONLINE').length;
                        const declinedCount = members.filter((m: any) => m.rsvpStatus === 'DECLINED').length;
                        const pendingCount = members.filter((m: any) => m.rsvpStatus === 'PENDING').length;
                        const respondedPct = members.length > 0 ? Math.round(((members.length - pendingCount) / members.length) * 100) : 0;

                        const myMember = members.find(
                          (m: any) =>
                            m.userId === user?.userId ||
                            (user?.fullName && m.attendeeName?.toLowerCase() === user.fullName.toLowerCase()),
                        );

                        return (
                          <Card
                            key={sem.seminarId}
                            size="small"
                            style={{ borderRadius: 8, borderColor: sem.status === 'INVITED' ? '#FFA39E' : '#E8E8E8' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                              <div>
                                <Text strong style={{ fontSize: 15, color: '#C62828' }}>
                                  {sem.planTitle || sem.project?.titleVi}
                                </Text>
                                <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>
                                  Đề tài:{' '}
                                  <a onClick={() => navigate(`/projects/${sem.projectId}`)} style={{ fontWeight: 700 }}>
                                    {sem.projectId}
                                  </a>{' '}
                                  — {sem.project?.department?.deptName}
                                </div>
                              </div>
                              <Tag color={sem.status === 'COMPLETED' ? 'green' : sem.status === 'INVITED' ? 'blue' : 'gold'}>
                                {sem.status === 'COMPLETED'
                                  ? 'Đã hoàn thành Biên bản Mẫu 3.5'
                                  : sem.status === 'INVITED'
                                  ? 'Đã phát hành Thư mời'
                                  : 'Lịch dự kiến (Chưa gửi thư mời)'}
                              </Tag>
                            </div>

                            <Row gutter={12} style={{ marginTop: 10, fontSize: 12, color: '#262626' }}>
                              <Col xs={24} md={12}>
                                <div><CalendarOutlined /> Thời gian: <b>{new Date(sem.heldAt).toLocaleString('vi-VN')}</b></div>
                                <div><EnvironmentOutlined /> Địa điểm: <b>{sem.location}</b></div>
                                {sem.meetingLink && (
                                  <div>
                                    <VideoCameraOutlined /> Link online:{' '}
                                    <a href={sem.meetingLink} target="_blank" rel="noreferrer">{sem.meetingLink}</a>
                                  </div>
                                )}
                              </Col>
                              <Col xs={24} md={12}>
                                <div>Số giấy mời: <b>{sem.invitationCode || `GM-${sem.seminarId}`}</b></div>
                                <div>
                                  Phản hồi đại biểu ({members.length} người):{' '}
                                  <Tag color="green">{onsiteCount} trực tiếp</Tag>
                                  <Tag color="blue">{onlineCount} online</Tag>
                                  <Tag color="red">{declinedCount} vắng</Tag>
                                  <Tag color="gold">{pendingCount} chờ</Tag>
                                </div>
                                <Progress percent={respondedPct} size="small" style={{ marginTop: 4 }} />
                              </Col>
                            </Row>

                            {/* Khu vực Xác nhận tham dự (RSVP Realtime vào DB) */}
                            <div
                              style={{
                                marginTop: 12,
                                padding: '8px 12px',
                                backgroundColor: '#FFF7F6',
                                borderRadius: 6,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 8,
                              }}
                            >
                              <Text style={{ fontSize: 12 }}>
                                Xác nhận tham dự của bạn (<b>{user?.fullName}</b>):{' '}
                                {myMember ? (
                                  <Tag color={RSVP_MAP[myMember.rsvpStatus]?.color || 'default'}>
                                    {RSVP_MAP[myMember.rsvpStatus]?.label || myMember.rsvpStatus}
                                  </Tag>
                                ) : (
                                  <Tag>Chưa xác nhận</Tag>
                                )}
                              </Text>
                              <Space size={6}>
                                <Button
                                  size="small"
                                  type={myMember?.rsvpStatus === 'ACCEPTED_ONSITE' ? 'primary' : 'default'}
                                  style={myMember?.rsvpStatus === 'ACCEPTED_ONSITE' ? { backgroundColor: '#389E0D', borderColor: '#389E0D' } : {}}
                                  icon={<CheckCircleOutlined />}
                                  onClick={() => handleRsvp(sem.seminarId, 'ACCEPTED_ONSITE')}
                                >
                                  Tham dự trực tiếp
                                </Button>
                                <Button
                                  size="small"
                                  type={myMember?.rsvpStatus === 'ACCEPTED_ONLINE' ? 'primary' : 'default'}
                                  icon={<VideoCameraOutlined />}
                                  onClick={() => handleRsvp(sem.seminarId, 'ACCEPTED_ONLINE')}
                                >
                                  Tham dự Online
                                </Button>
                                <Button
                                  size="small"
                                  danger={myMember?.rsvpStatus === 'DECLINED'}
                                  icon={<CloseCircleOutlined />}
                                  onClick={() => handleRsvp(sem.seminarId, 'DECLINED')}
                                >
                                  Báo vắng
                                </Button>
                              </Space>
                            </div>

                            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {canCreateSeminarOrInvite && (
                                <Button
                                  size="small"
                                  type="primary"
                                  danger
                                  icon={<SendOutlined />}
                                  onClick={() => setInviteModalSeminar(sem)}
                                >
                                  {sem.status === 'PLANNED' ? 'Phát hành Thư mời (Khoa)' : 'Mời bổ sung & Gửi lại'}
                                </Button>
                              )}
                              <Button
                                size="small"
                                icon={<TeamOutlined />}
                                onClick={() => setAttendeesModalSeminar(sem)}
                              >
                                Quản lý Đại biểu & RSVP ({members.length})
                              </Button>
                              <Button
                                size="small"
                                icon={<PrinterOutlined />}
                                onClick={() => {
                                  setAttendeesModalSeminar(sem);
                                }}
                              >
                                In Giấy mời (A4)
                              </Button>
                              <Button
                                size="small"
                                icon={<FileDoneOutlined />}
                                onClick={() => {
                                  setMinutesModalSeminar(sem);
                                  setMinutesFeedback(sem.feedback || '');
                                }}
                              >
                                Biên bản Mẫu 3.5
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </Space>
                  ),
                },
                {
                  key: 'reports',
                  label: `Báo cáo tiến độ định kỳ (${overview.reports.length})`,
                  children: (
                    <Table
                      loading={loading}
                      rowKey="reportId"
                      dataSource={overview.reports}
                      pagination={{ pageSize: 8 }}
                      columns={[
                        {
                          title: 'Đề tài & Mốc',
                          key: 'project',
                          render: (_: any, r: any) => (
                            <div>
                              <a onClick={() => navigate(`/projects/${r.projectId}`)} style={{ fontWeight: 700, color: '#C62828' }}>
                                {r.projectId}
                              </a>
                              <div><Tag color="geekblue">{r.milestone?.milestoneName}</Tag></div>
                            </div>
                          ),
                        },
                        {
                          title: 'Nội dung thực hiện & Sản phẩm trung gian',
                          key: 'content',
                          render: (_: any, r: any) => (
                            <div>
                              <div style={{ fontSize: 13 }}>{r.reportContent}</div>
                              {r.productUrl && (
                                <Text type="secondary" style={{ fontSize: 11 }}>Minh chứng: {r.productUrl}</Text>
                              )}
                            </div>
                          ),
                        },
                        {
                          title: 'Đánh giá GVHD (DFD 4.3)',
                          key: 'assessment',
                          render: (_: any, r: any) => (
                            <div>
                              {r.assessment === 'PASS' ? (
                                <Tag color="green">Đạt tiến độ (PASS)</Tag>
                              ) : r.assessment === 'WARNING_DELAY' ? (
                                <Tag color="orange">Cảnh báo chậm (WARNING)</Tag>
                              ) : (
                                <Tag color="gold">Chờ GVHD nhận xét</Tag>
                              )}
                              {r.advisorComment && (
                                <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>{r.advisorComment}</div>
                              )}
                            </div>
                          ),
                        },
                        {
                          title: 'Thao tác',
                          key: 'action',
                          render: (_: any, r: any) =>
                            canReviewReport ? (
                              <Button
                                size="small"
                                onClick={() => {
                                  setReviewReportItem(r);
                                  setReportReviewAssessment((r.assessment as any) || 'PASS');
                                  setReportReviewComment(r.advisorComment || '');
                                }}
                              >
                                Đánh giá
                              </Button>
                            ) : null,
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: 'changes',
                  label: `Đơn Điều chỉnh / Gia hạn (${overview.changeRequests.length})`,
                  children: (
                    <Table
                      loading={loading}
                      rowKey="requestId"
                      dataSource={overview.changeRequests}
                      pagination={{ pageSize: 8 }}
                      columns={[
                        {
                          title: 'Đề tài & Loại đơn',
                          key: 'req',
                          render: (_: any, r: any) => (
                            <div>
                              <a onClick={() => navigate(`/projects/${r.projectId}`)} style={{ fontWeight: 700, color: '#C62828' }}>
                                {r.projectId}
                              </a>
                              <div>
                                <Tag color="purple">{r.requestType}</Tag>
                                {r.newDueDate && (
                                  <Text type="secondary" style={{ fontSize: 11 }}>
                                    Hạn mới: {new Date(r.newDueDate).toLocaleDateString('vi-VN')}
                                  </Text>
                                )}
                              </div>
                            </div>
                          ),
                        },
                        {
                          title: 'Lý do đề nghị',
                          dataIndex: 'reason',
                          key: 'reason',
                        },
                        {
                          title: 'Tiến trình duyệt 3 cấp (DFD 4.7)',
                          key: 'approvals',
                          render: (_: any, r: any) => (
                            <div>
                              <Space size={4} wrap>
                                {['ADVISOR', 'FACULTY_LEADER', 'QLKHCN'].map((st) => {
                                  const found = r.approvals?.find((a: any) => a.stage === st);
                                  return (
                                    <Tag
                                      key={st}
                                      color={
                                        found?.decision === 'APPROVED'
                                          ? 'green'
                                          : found?.decision === 'REJECTED'
                                          ? 'red'
                                          : 'default'
                                      }
                                    >
                                      {st === 'ADVISOR' ? '1.GVHD' : st === 'FACULTY_LEADER' ? '2.Khoa' : '3.QLKH'}
                                      {found ? ` (${found.decision})` : ''}
                                    </Tag>
                                  );
                                })}
                              </Space>
                              <div style={{ marginTop: 4 }}>
                                Trạng thái chung:{' '}
                                <Tag color={r.resultStatus === 'APPROVED' ? 'green' : r.resultStatus === 'REJECTED' ? 'red' : 'gold'}>
                                  {r.resultStatus} {r.decisionNo ? `(${r.decisionNo})` : ''}
                                </Tag>
                              </div>
                            </div>
                          ),
                        },
                        {
                          title: 'Phê duyệt',
                          key: 'action',
                          render: (_: any, r: any) => {
                            if (r.resultStatus !== 'PENDING') return null;
                            if (!['LECTURER', 'FACULTY_LEADER', 'FACULTY_SECRETARY', 'QLKHCN', 'BOARD', 'ADMIN'].includes(roleCode)) {
                              return null;
                            }
                            return (
                              <Space>
                                <Button size="small" type="primary" onClick={() => handleApproveChangeReq(r.requestId, 'APPROVED')}>
                                  Duyệt
                                </Button>
                                <Button size="small" danger onClick={() => handleApproveChangeReq(r.requestId, 'REJECTED')}>
                                  Từ chối
                                </Button>
                              </Space>
                            );
                          },
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal Khoa Lập lịch Hội thảo */}
      <Modal
        title="Lập lịch Sinh hoạt Khoa học Cấp Khoa (Mẫu 3.5)"
        open={createSeminarVisible}
        onCancel={() => setCreateSeminarVisible(false)}
        onOk={() => seminarForm.submit()}
        confirmLoading={submitting}
        okText="Tạo phiên Hội thảo"
        okButtonProps={{ style: { backgroundColor: '#C62828', borderColor: '#C62828' } }}
      >
        <Form form={seminarForm} layout="vertical" onFinish={handleCreateSeminar}>
          <Form.Item name="projectId" label="Đề tài báo cáo trung gian" rules={[{ required: true }]}>
            <Select placeholder="Chọn đề tài">
              {projects.filter((p) => !['REJECTED', 'PROPOSED'].includes(p.status)).map((p) => (
                <Select.Option key={p.project_id} value={p.project_id}>
                  {p.project_id} — {p.title_vi}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="planTitle" label="Tiêu đề phiên Hội thảo" rules={[{ required: true }]}>
            <Input placeholder="Sinh hoạt KH Khoa CNTT1 - Đánh giá tiến độ đợt 1..." />
          </Form.Item>
          <Form.Item name="heldAt" label="Thời gian tổ chức" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="location" label="Địa điểm" rules={[{ required: true }]}>
            <Input placeholder="Phòng Hội thảo Tầng 2 - Nhà A2, PTIT" />
          </Form.Item>
          <Form.Item name="meetingLink" label="Link họp trực tuyến (nếu có)">
            <Input placeholder="https://meet.google.com/ptit-srms-seminar" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Khoa Phát hành Thư mời */}
      <Modal
        title={`Phát hành Thư mời Sinh hoạt KH — ${inviteModalSeminar?.projectId}`}
        open={Boolean(inviteModalSeminar)}
        onCancel={() => setInviteModalSeminar(null)}
        onOk={handleSendInvitations}
        confirmLoading={submitting}
        okText="Phát hành Thư mời & Bắn thông báo"
        okButtonProps={{ style: { backgroundColor: '#C62828', borderColor: '#C62828' } }}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message="Hệ thống tự động gửi Giấy mời & Thông báo real-time (D9) tới nhóm Sinh viên, GVHD và danh sách đại biểu đã cấu hình."
        />
        <Text strong style={{ display: 'block', marginBottom: 6 }}>
          Mời bổ sung đại biểu / giảng viên phản biện khác (mỗi dòng 1 họ tên):
        </Text>
        <TextArea
          rows={3}
          value={extraInviteesText}
          onChange={(e) => setExtraInviteesText(e.target.value)}
          placeholder="Ví dụ: TS. Trần Mai Lan"
        />
      </Modal>

      {/* Modal Danh sách Đại biểu + Giấy mời A4 */}
      <Modal
        title={`Quản lý Đại biểu RSVP & In Giấy mời A4 — ${attendeesModalSeminar?.invitationCode || ''}`}
        open={Boolean(attendeesModalSeminar)}
        onCancel={() => setAttendeesModalSeminar(null)}
        width={760}
        footer={[
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            onClick={() => printElement('printable-seminar-invitation', `GiayMoi_${attendeesModalSeminar?.projectId}`)}
          >
            In Giấy mời A4
          </Button>,
          <Button key="close" onClick={() => setAttendeesModalSeminar(null)}>Đóng</Button>,
        ]}
      >
        {attendeesModalSeminar && (
          <div>
            <Table
              size="small"
              rowKey="memberId"
              pagination={false}
              dataSource={attendeesModalSeminar.members || []}
              columns={[
                { title: 'Họ tên đại biểu', dataIndex: 'attendeeName', key: 'attendeeName' },
                { title: 'Vai trò', dataIndex: 'role', key: 'role', render: (r: string) => <Tag>{r}</Tag> },
                { title: 'Đơn vị', dataIndex: 'unit', key: 'unit' },
                {
                  title: 'Phản hồi RSVP',
                  dataIndex: 'rsvpStatus',
                  key: 'rsvpStatus',
                  render: (s: string) => {
                    const info = RSVP_MAP[s] || RSVP_MAP.PENDING;
                    return <Tag color={info.color}>{info.label}</Tag>;
                  },
                },
              ]}
            />

            <div id="printable-seminar-invitation" style={{ marginTop: 16, padding: 20, border: '1px solid #d9d9d9', backgroundColor: '#fff' }}>
              <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
                HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG • {attendeesModalSeminar.project?.department?.deptName?.toUpperCase()}
              </div>
              <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 16, color: '#C62828', marginTop: 8 }}>
                GIẤY MỜI THAM DỰ SINH HOẠT KHOA HỌC (MẪU 3.5)
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, marginBottom: 12 }}>
                Số: {attendeesModalSeminar.invitationCode || `GM-${attendeesModalSeminar.seminarId}`}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                <div><b>Chuyên đề:</b> {attendeesModalSeminar.planTitle || attendeesModalSeminar.project?.titleVi}</div>
                <div><b>Mã đề tài:</b> {attendeesModalSeminar.projectId}</div>
                <div><b>Thời gian:</b> {new Date(attendeesModalSeminar.heldAt).toLocaleString('vi-VN')}</div>
                <div><b>Địa điểm:</b> {attendeesModalSeminar.location}</div>
                <div><b>Phòng Online:</b> {attendeesModalSeminar.meetingLink || '—'}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Biên bản Mẫu 3.5 */}
      <Modal
        title={`Biên bản Sinh hoạt Khoa học (Mẫu 3.5) — ${minutesModalSeminar?.projectId}`}
        open={Boolean(minutesModalSeminar)}
        onCancel={() => setMinutesModalSeminar(null)}
        footer={[
          <Button key="close" onClick={() => setMinutesModalSeminar(null)}>Đóng</Button>,
          (isStaff || isLecturer) && (
            <Button
              key="save"
              type="primary"
              loading={submitting}
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              onClick={handleSaveMinutes}
            >
              Lưu & Chốt Biên bản Mẫu 3.5
            </Button>
          ),
        ]}
      >
        <TextArea
          rows={5}
          value={minutesFeedback}
          onChange={(e) => setMinutesFeedback(e.target.value)}
          disabled={!isStaff && !isLecturer}
          placeholder="Ghi chép ý kiến đóng góp chuyên môn của Hội đồng Khoa/Bộ môn & Kết luận cho nhóm nghiên cứu..."
        />
      </Modal>

      {/* Modal SV nộp Báo cáo tiến độ */}
      <Modal
        title="Nộp Báo cáo Tiến độ Thực hiện (DFD 4.2)"
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        onOk={() => reportForm.submit()}
        confirmLoading={submitting}
        okText="Nộp báo cáo"
        okButtonProps={{ style: { backgroundColor: '#C62828', borderColor: '#C62828' } }}
      >
        <Form form={reportForm} layout="vertical" onFinish={handleSubmitReport}>
          <Form.Item name="projectId" label="Chọn đề tài" rules={[{ required: true }]}>
            <Select placeholder="Chọn đề tài nhóm bạn">
              {eligibleProjects.map((p) => (
                <Select.Option key={p.project_id} value={p.project_id}>
                  {p.project_id} — {p.title_vi}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="pmId" label="Mốc kiểm soát tiến độ" rules={[{ required: true }]}>
            <Select placeholder="Chọn mốc báo cáo">
              {overview.milestones.map((m) => (
                <Select.Option key={m.pmId} value={m.pmId}>{m.milestoneName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="reportContent" label="Tóm tắt kết quả đã thực hiện" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Mô tả khối lượng công việc đã hoàn thành..." />
          </Form.Item>
          <Form.Item name="productUrl" label="Liên kết minh chứng / GitHub / PDF">
            <Input placeholder="/storage/reports/progress_v1.pdf" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal GVHD đánh giá báo cáo */}
      <Modal
        title={`Đánh giá Tiến độ — ${reviewReportItem?.projectId}`}
        open={Boolean(reviewReportItem)}
        onCancel={() => setReviewReportItem(null)}
        onOk={handleConfirmReviewReport}
        confirmLoading={submitting}
        okText="Lưu nhận xét GVHD"
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Radio.Group value={reportReviewAssessment} onChange={(e) => setReportReviewAssessment(e.target.value)}>
            <Radio.Button value="PASS">Đạt tiến độ (PASS)</Radio.Button>
            <Radio.Button value="WARNING_DELAY">Cảnh báo chậm tiến độ (WARNING)</Radio.Button>
          </Radio.Group>
          <TextArea
            rows={3}
            value={reportReviewComment}
            onChange={(e) => setReportReviewComment(e.target.value)}
            placeholder="Nhận xét và dặn dò nhóm nghiên cứu..."
          />
        </Space>
      </Modal>

      {/* Modal SV gửi Đơn điều chỉnh */}
      <Modal
        title="Gửi Đơn Điều chỉnh / Gia hạn Đề tài (DFD 4.6)"
        open={changeReqModalVisible}
        onCancel={() => setChangeReqModalVisible(false)}
        onOk={() => changeForm.submit()}
        confirmLoading={submitting}
        okText="Gửi đơn xin duyệt 3 cấp"
        okButtonProps={{ style: { backgroundColor: '#C62828', borderColor: '#C62828' } }}
      >
        <Form form={changeForm} layout="vertical" onFinish={handleCreateChangeReq}>
          <Form.Item name="projectId" label="Chọn đề tài" rules={[{ required: true }]}>
            <Select placeholder="Chọn đề tài">
              {eligibleProjects.map((p) => (
                <Select.Option key={p.project_id} value={p.project_id}>
                  {p.project_id} — {p.title_vi}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="requestType" label="Loại đề nghị" initialValue="EXTENSION">
            <Select>
              <Select.Option value="EXTENSION">Gia hạn thời gian thực hiện</Select.Option>
              <Select.Option value="ADJUSTMENT">Điều chỉnh nội dung / Thành viên nhóm</Select.Option>
              <Select.Option value="CHANGE_ADVISOR">Thay đổi Giảng viên hướng dẫn</Select.Option>
              <Select.Option value="CANCELLATION">Xin rút / Hủy đề tài</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="newDueDate" label="Mốc gia hạn mới đề xuất (nếu xin gia hạn)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Lý do chi tiết" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Nêu rõ lý do chính đáng cần điều chỉnh..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
