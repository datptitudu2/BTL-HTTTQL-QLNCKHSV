import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Row,
  Col,
  Tabs,
  message,
} from 'antd';
import {
  TrophyOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  PlusOutlined,
  ReloadOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const GRADE_MAP: Record<string, { label: string; color: string }> = {
  XUAT_SAC: { label: 'Xuất sắc', color: 'green' },
  'Xuất sắc': { label: 'Xuất sắc', color: 'green' },
  TOT: { label: 'Tốt', color: 'blue' },
  'Tốt': { label: 'Tốt', color: 'blue' },
  KHA: { label: 'Khá', color: 'cyan' },
  'Khá': { label: 'Khá', color: 'cyan' },
  DAT: { label: 'Đạt', color: 'gold' },
  'Đạt': { label: 'Đạt', color: 'gold' },
  KHONG_DAT: { label: 'Không đạt', color: 'red' },
  'Không đạt': { label: 'Không đạt', color: 'red' },
};

export const AwardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';

  const [data, setData] = useState<{
    nominations: any[];
    certificates: any[];
    lecturerHours: any[];
    studentBonuses: any[];
  }>({
    nominations: [],
    certificates: [],
    lecturerHours: [],
    studentBonuses: [],
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nomModalVisible, setNomModalVisible] = useState(false);
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nomForm] = Form.useForm();
  const [certForm] = Form.useForm();

  const isQLKHOrBoard = ['QLKHCN', 'BOARD', 'ADMIN'].includes(roleCode);
  const isFacultyStaff = ['FACULTY_SECRETARY', 'FACULTY_LEADER', 'QLKHCN', 'BOARD', 'ADMIN'].includes(roleCode);
  const isCTSV = ['STUDENT_AFFAIRS', 'ADMIN'].includes(roleCode);
  const isStudent = roleCode === 'STUDENT';
  const isLecturer = roleCode === 'LECTURER';
  const isFinance = roleCode === 'FINANCE';
  const showBonusesTab = !isLecturer && !isFinance;
  const showHoursTab = !isStudent && !isCTSV && !isFinance;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [awardsRes, projRes] = await Promise.all([
        api.get('/awards'),
        api.get('/projects'),
      ]);
      setData(awardsRes.data);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể tải dữ liệu Khen thưởng & Chứng nhận');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const eligibleAcceptedProjects = projects.filter(
    (p) => p.acceptances?.grade && ['XUAT_SAC', 'TOT', 'KHA'].includes(p.acceptances.grade),
  );

  const handleCreateNomination = async (values: any) => {
    try {
      setSubmitting(true);
      await api.post('/awards/nominations', values);
      message.success('Đã lập hồ sơ Đề cử Khen thưởng Mẫu 5 thành công!');
      setNomModalVisible(false);
      nomForm.resetFields();
      await fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể tạo đề cử Mẫu 5');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveNomination = async (nominationId: number) => {
    try {
      await api.patch(`/awards/nominations/${nominationId}/approve`, {});
      message.success('Đã phê duyệt Giải thưởng & tự động đồng bộ điểm cộng học bổng cho Sinh viên!');
      await fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể duyệt đề cử');
    }
  };

  const handleIssueCertificates = async (values: any) => {
    try {
      setSubmitting(true);
      const res = await api.post('/awards/certificates/issue', { projectId: values.projectId });
      message.success(`Đã phát hành ${res.data.length} Giấy chứng nhận điện tử có mã QR!`);
      setCertModalVisible(false);
      certForm.resetFields();
      await fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không đủ điều kiện cấp chứng nhận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveBonus = async (bonusId: number) => {
    try {
      await api.patch(`/awards/bonuses/${bonusId}/approve`, {});
      message.success('Phòng CT&CTSV đã phê duyệt cộng ĐRL & Điểm học bổng!');
      await fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể duyệt quyền lợi sinh viên');
    }
  };

  const handleConfirmHours = async (hourId: number) => {
    try {
      await api.patch(`/awards/lecturer-hours/${hourId}/confirm`, {});
      message.success('P.QLKHCN đã xác nhận quy đổi Giờ chuẩn NCKH cho Giảng viên!');
      await fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Lỗi xác nhận giờ chuẩn');
    }
  };

  const totalLecturerHours = data.lecturerHours.reduce((s, h) => s + Number(h.convertedHours || 0), 0);
  const summaryColSpan = showBonusesTab && showHoursTab ? 6 : 8;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={4} style={{ margin: 0, color: '#262626', fontWeight: 700 }}>
          Khen thưởng, Chứng nhận & Quyền lợi NCKH
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Tải lại
          </Button>
          {isFacultyStaff && (
            <Button
              icon={<PlusOutlined />}
              onClick={() => setNomModalVisible(true)}
              disabled={eligibleAcceptedProjects.length === 0}
            >
              Đề cử Giải thưởng Mẫu 5
            </Button>
          )}
          {isQLKHOrBoard && (
            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              onClick={() => setCertModalVisible(true)}
              disabled={eligibleAcceptedProjects.length === 0}
            >
              Cấp Giấy chứng nhận SV
            </Button>
          )}
        </Space>
      </div>

      {/* KHỐI THỐNG KÊ PASTEL CHUẨN S-LINK PTIT */}
      <Card
        bordered={false}
        style={{ marginBottom: 14, borderRadius: 10, border: '1px solid #F0F0F0' }}
        bodyStyle={{ padding: '14px 16px' }}
      >
        <div style={{ fontWeight: 700, fontSize: 13, color: '#262626', marginBottom: 10 }}>
          {isStudent ? 'Tổng hợp quyền lợi & chứng nhận của bạn' : 'Thống kê Khen thưởng & Chứng nhận NCKH'}
        </div>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={summaryColSpan}>
            <div
              style={{
                background: 'linear-gradient(90deg, #FFF5F5 0%, #FFF0EC 100%)',
                borderRadius: 8,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 74,
              }}
            >
              <SafetyCertificateOutlined style={{ color: '#C62828', fontSize: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, gap: 6 }}>
                <span style={{ fontSize: 12, color: '#595959', fontWeight: 500 }}>
                  {isStudent ? 'Giấy chứng nhận của bạn' : 'Giấy chứng nhận SV'}
                </span>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#C62828', lineHeight: 1 }}>
                  {data.certificates.length}
                </span>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={summaryColSpan}>
            <div
              style={{
                backgroundColor: '#FFFBEB',
                borderRadius: 8,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 74,
              }}
            >
              <TrophyOutlined style={{ color: '#D48806', fontSize: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, gap: 6 }}>
                <span style={{ fontSize: 12, color: '#595959', fontWeight: 500 }}>Hồ sơ Giải thưởng Mẫu 5</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#D48806', lineHeight: 1 }}>
                  {data.nominations.length}
                </span>
              </div>
            </div>
          </Col>

          {showBonusesTab && (
            <Col xs={24} sm={12} md={summaryColSpan}>
              <div
                style={{
                  background: 'linear-gradient(90deg, #F0F7FF 0%, #E6F4FF 100%)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 74,
                }}
              >
                <StarOutlined style={{ color: '#1677FF', fontSize: 16 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#595959', fontWeight: 500 }}>
                    {isStudent ? 'ĐRL & Học bổng của bạn' : 'Lượt SV xét ĐRL & Học bổng'}
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#1677FF', lineHeight: 1 }}>
                    {data.studentBonuses.length}
                  </span>
                </div>
              </div>
            </Col>
          )}

          {showHoursTab && (
            <Col xs={24} sm={12} md={summaryColSpan}>
              <div
                style={{
                  background: 'linear-gradient(90deg, #F6FFED 0%, #EAF7EC 100%)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 74,
                }}
              >
                <ClockCircleOutlined style={{ color: '#389E0D', fontSize: 16 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#595959', fontWeight: 500 }}>
                    {isLecturer ? 'Giờ chuẩn NCKH của bạn' : 'Tổng Giờ chuẩn GVHD'}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#389E0D', lineHeight: 1 }}>
                    {totalLecturerHours} giờ
                  </span>
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* LƯU Ý QUY ĐỊNH 521 */}
      <div style={{ marginBottom: 14, padding: '2px 4px', fontSize: 12.5, lineHeight: 1.65, color: '#434343' }}>
        <div style={{ fontStyle: 'italic', color: '#595959', marginBottom: 2 }}>Lưu ý:</div>
        <div>
          - <b style={{ color: '#C62828' }}>Điều 15 QĐ 521:</b> Giấy chứng nhận số (kèm mã QR xác thực) chỉ cấp cho <b>Sinh viên</b> tham gia đề tài nghiệm thu đạt loại <b>Khá trở lên</b>; xét cộng ĐRL và điểm thưởng học bổng qua Phòng CT&amp;CTSV.
        </div>
        <div>
          - <b>Điều 16 QĐ 521:</b> Giảng viên hướng dẫn được quy đổi Giờ chuẩn NCKH (20 giờ chuẩn/đề tài) sau khi đề tài hoàn thành nghiệm thu.
        </div>
      </div>

      <Card bordered={false} style={{ borderRadius: 10, border: '1px solid #F0F0F0' }}>
        <Tabs
          defaultActiveKey={isFinance ? 'nominations' : 'certs'}
          items={[
            {
              key: 'certs',
              label: `Giấy chứng nhận số (${data.certificates.length})`,
              children: (
                <Table
                  loading={loading}
                  rowKey="certId"
                  dataSource={data.certificates}
                  pagination={{ pageSize: 8 }}
                  columns={[
                    {
                      title: 'Mã Chứng nhận',
                      dataIndex: 'certCode',
                      key: 'certCode',
                      render: (code: string) => <Text strong style={{ color: '#C62828' }}>{code}</Text>,
                    },
                    {
                      title: 'Người được cấp & Vai trò',
                      key: 'recipient',
                      render: (_: any, r: any) => (
                        <div>
                          <Text strong>{r.recipient?.fullName}</Text>{' '}
                          <Tag color={r.recipientType === 'STUDENT' ? 'blue' : 'purple'}>
                            {r.recipientType === 'STUDENT' ? 'Sinh viên' : 'GVHD'}
                          </Tag>
                        </div>
                      ),
                    },
                    {
                      title: 'Đề tài & Khoa',
                      key: 'project',
                      render: (_: any, r: any) => (
                        <div>
                          <a onClick={() => navigate(`/projects/${r.projectId}`)} style={{ fontWeight: 600 }}>
                            {r.projectId}
                          </a>
                          <div style={{ fontSize: 12, color: '#595959' }}>{r.project?.titleVi}</div>
                        </div>
                      ),
                    },
                    {
                      title: 'Xếp loại NT',
                      dataIndex: 'grade',
                      key: 'grade',
                      render: (g: string) => {
                        const info = GRADE_MAP[g] || { label: g, color: 'default' };
                        return <Tag color={info.color}>{info.label}</Tag>;
                      },
                    },
                    {
                      title: 'Xác thực QR',
                      key: 'verify',
                      render: (_: any, r: any) => (
                        <Button
                          size="small"
                          icon={<QrcodeOutlined />}
                          onClick={() => navigate(`/verify-cert?code=${encodeURIComponent(r.certCode)}`)}
                        >
                          Mở bản số & QR
                        </Button>
                      ),
                    },
                  ]}
                />
              ),
            },
            ...(showBonusesTab
              ? [
                  {
                    key: 'bonuses',
                    label: `ĐRL & Điểm học bổng SV (${data.studentBonuses.length})`,
                    children: (
                      <Table
                        loading={loading}
                        rowKey="bonusId"
                        dataSource={data.studentBonuses}
                        pagination={{ pageSize: 8 }}
                        columns={[
                          {
                            title: 'Sinh viên',
                            key: 'student',
                            render: (_: any, r: any) => (
                              <div>
                                <Text strong>{r.student?.user?.fullName}</Text>
                                <div style={{ fontSize: 12, color: '#595959' }}>
                                  {r.studentId} • {r.student?.className} ({r.student?.department?.deptCode})
                                </div>
                              </div>
                            ),
                          },
                          {
                            title: 'Đề tài & Xếp loại',
                            key: 'project',
                            render: (_: any, r: any) => {
                              const g = r.project?.acceptance?.grade;
                              const info = GRADE_MAP[g] || { label: g || '—', color: 'default' };
                              return (
                                <div>
                                  <a onClick={() => navigate(`/projects/${r.projectId}`)} style={{ fontWeight: 600 }}>
                                    {r.projectId}
                                  </a>{' '}
                                  <Tag color={info.color}>{info.label}</Tag>
                                </div>
                              );
                            },
                          },
                          {
                            title: 'Điểm ĐRL (P.CTSV)',
                            dataIndex: 'trainingScore',
                            key: 'trainingScore',
                            render: (v: any) => <Tag color="green">+{Number(v)} điểm ĐRL</Tag>,
                          },
                          {
                            title: 'Điểm cộng Học bổng (Đ15.2.h)',
                            dataIndex: 'bonusPoints',
                            key: 'bonusPoints',
                            render: (v: any) =>
                              Number(v) > 0 ? <Tag color="gold">+{Number(v)} điểm TB học kỳ</Tag> : <Text type="secondary">0</Text>,
                          },
                          {
                            title: 'Trạng thái CTSV',
                            key: 'approvalStatus',
                            render: (_: any, r: any) =>
                              r.approvalStatus === 'APPROVED' ? (
                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                  Đã duyệt ({r.decisionNotice || 'CTSV'})
                                </Tag>
                              ) : (
                                <Tag color="orange">Chờ Phòng CT&CTSV duyệt</Tag>
                              ),
                          },
                          {
                            title: 'Thao tác',
                            key: 'action',
                            render: (_: any, r: any) =>
                              isCTSV && r.approvalStatus !== 'APPROVED' ? (
                                <Button
                                  size="small"
                                  type="primary"
                                  style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                                  onClick={() => handleApproveBonus(r.bonusId)}
                                >
                                  CTSV Phê duyệt
                                </Button>
                              ) : null,
                          },
                        ]}
                      />
                    ),
                  },
                ]
              : []),
            {
              key: 'nominations',
              label: `Giải thưởng Mẫu 5 (${data.nominations.length})`,
              children: (
                <Table
                  loading={loading}
                  rowKey="nominationId"
                  dataSource={data.nominations}
                  pagination={{ pageSize: 8 }}
                  columns={[
                    {
                      title: 'Đề tài đề cử',
                      key: 'project',
                      render: (_: any, r: any) => (
                        <div>
                          <a onClick={() => navigate(`/projects/${r.projectId}`)} style={{ fontWeight: 700, color: '#C62828' }}>
                            {r.projectId}
                          </a>
                          <div style={{ fontSize: 12 }}>{r.project?.titleVi}</div>
                        </div>
                      ),
                    },
                    {
                      title: 'Cấp giải thưởng',
                      dataIndex: 'awardLevel',
                      key: 'awardLevel',
                      render: (lvl: string) => (
                        <Tag color={lvl === 'INTERNATIONAL' ? 'volcano' : lvl === 'MINISTRY' ? 'purple' : 'blue'}>
                          {lvl === 'INTERNATIONAL'
                            ? 'Quốc tế (ISI/Scopus)'
                            : lvl === 'MINISTRY'
                            ? 'Cấp Bộ GD&ĐT'
                            : 'Cấp Học viện'}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Xếp giải & Tiền thưởng',
                      key: 'prize',
                      render: (_: any, r: any) => {
                        const prizeLabels: Record<string, { label: string; color: string }> = {
                          FIRST: { label: 'Giải Nhất', color: 'gold' },
                          SECOND: { label: 'Giải Nhì', color: 'cyan' },
                          THIRD: { label: 'Giải Ba', color: 'blue' },
                          CONSOLATION: { label: 'Giải Khuyến khích', color: 'default' },
                        };
                        const prizeInfo = r.prizeGrade ? prizeLabels[r.prizeGrade] : null;
                        const supAmt = Number(r.supportAmount ?? r.supportFund ?? 0);
                        return (
                          <div>
                            {prizeInfo ? (
                              <Tag color={prizeInfo.color} style={{ fontWeight: 600 }}>{prizeInfo.label}</Tag>
                            ) : (
                              <Text strong>{r.prizeGrade || 'Đề xuất'}</Text>
                            )}
                            <div style={{ fontSize: 12, color: '#389E0D', marginTop: 2 }}>
                              Thưởng: {Number(r.rewardAmount || 0).toLocaleString('vi-VN')}đ
                              {supAmt > 0 && ` (+Hỗ trợ: ${supAmt.toLocaleString('vi-VN')}đ)`}
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      title: 'Trạng thái',
                      key: 'status',
                      render: (_: any, r: any) =>
                        r.approvalStatus === 'APPROVED' || r.status === 'APPROVED' ? (
                          <Tag color="green">Đã duyệt ({r.rewardDecisionNo})</Tag>
                        ) : (
                          <Tag color="gold">Chờ P.QLKHCN / BGĐ duyệt</Tag>
                        ),
                    },
                    {
                      title: 'Thao tác',
                      key: 'action',
                      render: (_: any, r: any) =>
                        isQLKHOrBoard && r.approvalStatus !== 'APPROVED' && r.status !== 'APPROVED' ? (
                          <Button
                            size="small"
                            type="primary"
                            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                            onClick={() => handleApproveNomination(r.nominationId)}
                          >
                            Phê duyệt Giải
                          </Button>
                        ) : null,
                    },
                  ]}
                />
              ),
            },
            ...(showHoursTab
              ? [
                  {
                    key: 'hours',
                    label: `Giờ chuẩn NCKH GVHD (${data.lecturerHours.length})`,
                    children: (
                      <Table
                        loading={loading}
                        rowKey="hourId"
                        dataSource={data.lecturerHours}
                        pagination={{ pageSize: 8 }}
                        columns={[
                          {
                            title: 'Giảng viên hướng dẫn',
                            key: 'lecturer',
                            render: (_: any, r: any) => (
                              <div>
                                <Text strong>
                                  <UserOutlined /> {r.lecturer?.user?.fullName}
                                </Text>
                                <div style={{ fontSize: 12, color: '#595959' }}>
                                  {r.lecturerId} • {r.lecturer?.department?.deptName}
                                </div>
                              </div>
                            ),
                          },
                          {
                            title: 'Đề tài hướng dẫn',
                            key: 'project',
                            render: (_: any, r: any) => (
                              <div>
                                <a onClick={() => navigate(`/projects/${r.projectId}`)} style={{ fontWeight: 600 }}>
                                  {r.projectId}
                                </a>
                                <div style={{ fontSize: 12 }}>{r.project?.titleVi}</div>
                              </div>
                            ),
                          },
                          {
                            title: 'Năm học',
                            dataIndex: 'academicYear',
                            key: 'academicYear',
                          },
                          {
                            title: 'Giờ chuẩn quy đổi',
                            dataIndex: 'convertedHours',
                            key: 'convertedHours',
                            render: (h: any) => <Tag color="blue">{Number(h)} giờ chuẩn</Tag>,
                          },
                          {
                            title: 'Xác nhận',
                            key: 'declarationStatus',
                            render: (_: any, r: any) =>
                              r.declarationStatus === 'CONFIRMED' ? (
                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                  Đã chốt giờ NCKH
                                </Tag>
                              ) : (
                                <Tag color="gold">Chờ P.QLKHCN chốt</Tag>
                              ),
                          },
                          {
                            title: 'Thao tác',
                            key: 'action',
                            render: (_: any, r: any) =>
                              isQLKHOrBoard && r.declarationStatus !== 'CONFIRMED' ? (
                                <Button size="small" type="primary" onClick={() => handleConfirmHours(r.hourId)}>
                                  Chốt giờ NCKH
                                </Button>
                              ) : null,
                          },
                        ]}
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>

      {/* Modal Đề cử Mẫu 5 */}
      <Modal
        title="Lập Đề cử Khen thưởng Đề tài Xuất sắc (Mẫu 5 - QĐ 521)"
        open={nomModalVisible}
        onCancel={() => setNomModalVisible(false)}
        onOk={() => nomForm.submit()}
        confirmLoading={submitting}
        okText="Gửi đề cử Mẫu 5"
        okButtonProps={{ style: { backgroundColor: '#C62828', borderColor: '#C62828' } }}
      >
        <Form form={nomForm} layout="vertical" onFinish={handleCreateNomination}>
          <Form.Item name="projectId" label="Chọn đề tài đã nghiệm thu (≥ Khá)" rules={[{ required: true }]}>
            <Select placeholder="Chọn đề tài đạt Khá trở lên">
              {eligibleAcceptedProjects.map((p) => (
                <Select.Option key={p.project_id} value={p.project_id}>
                  {p.project_id} — {p.title_vi} ({GRADE_MAP[p.acceptances?.grade]?.label || p.acceptances?.grade})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="awardLevel" label="Cấp đề cử" initialValue="INSTITUTE">
            <Select>
              <Select.Option value="INSTITUTE">Giải thưởng NCKH Cấp Học viện PTIT</Select.Option>
              <Select.Option value="MINISTRY">Dự thi Sinh viên NCKH Cấp Bộ GD&ĐT</Select.Option>
              <Select.Option value="INTERNATIONAL">Công bố / Giải thưởng Quốc tế (ISI/Scopus)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="prizeGrade" label="Xếp giải đề xuất" initialValue="SECOND">
            <Select>
              <Select.Option value="FIRST">Giải Nhất (Học viện / Bộ GD&ĐT)</Select.Option>
              <Select.Option value="SECOND">Giải Nhì</Select.Option>
              <Select.Option value="THIRD">Giải Ba</Select.Option>
              <Select.Option value="CONSOLATION">Giải Khuyến khích</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="rewardAmount" label="Mức tiền thưởng đề xuất (VNĐ)" initialValue={3000000}>
            <InputNumber style={{ width: '100%' }} min={500000} step={500000} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Cấp Giấy chứng nhận số */}
      <Modal
        title="Cấp Giấy chứng nhận Điện tử cho Đề tài (Điều 15.2.e)"
        open={certModalVisible}
        onCancel={() => setCertModalVisible(false)}
        onOk={() => certForm.submit()}
        confirmLoading={submitting}
        okText="Phát hành Chứng nhận & QR"
        okButtonProps={{ style: { backgroundColor: '#C62828', borderColor: '#C62828' } }}
      >
        <Form form={certForm} layout="vertical" onFinish={handleIssueCertificates}>
          <Form.Item name="projectId" label="Chọn đề tài đủ điều kiện (Nghiệm thu ≥ Khá)" rules={[{ required: true }]}>
            <Select placeholder="Chọn đề tài">
              {eligibleAcceptedProjects.map((p) => (
                <Select.Option key={p.project_id} value={p.project_id}>
                  {p.project_id} — {p.title_vi} ({p.acceptances?.avg_score}đ - {GRADE_MAP[p.acceptances?.grade]?.label || p.acceptances?.grade})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
