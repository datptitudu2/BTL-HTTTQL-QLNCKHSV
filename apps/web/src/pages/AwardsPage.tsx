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
  Alert,
  Row,
  Col,
  Statistic,
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
  TOT: { label: 'Tốt', color: 'blue' },
  KHA: { label: 'Khá', color: 'cyan' },
  DAT: { label: 'Đạt', color: 'gold' },
  KHONG_DAT: { label: 'Không đạt', color: 'red' },
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

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#C62828', fontWeight: 700 }}>
            Khen thưởng (Mẫu 5), Chứng nhận số & Quyền lợi NCKH (QĐ 521 - D8)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Đồng bộ dữ liệu thực Kho D8: Chứng nhận số QR (Điều 15.2.e ≥ Khá), ĐRL & Học bổng CTSV (Điều 15.2.h), Đề cử Mẫu 5 & Giờ chuẩn GVHD.
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
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
              Cấp Giấy chứng nhận số
            </Button>
          )}
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Chính sách Quyền lợi & Chứng nhận theo Điều 15 QĐ 521/QĐ-HV"
        description="• Cấp Giấy chứng nhận: Đạt kết quả Nghiệm thu từ Khá trở lên (≥ 70đ). • Cộng Điểm rèn luyện (P.CTSV): Xuất sắc (+10đ), Tốt (+8đ), Khá (+6đ), Đạt (+4đ). • Cộng Điểm học bổng Giải thưởng Trong nước: Nhất (+0.4), Nhì (+0.3), Ba (+0.2), KK (+0.1)."
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Giấy chứng nhận số đã cấp" value={data.certificates.length} prefix={<SafetyCertificateOutlined />} valueStyle={{ color: '#C62828' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Hồ sơ Giải thưởng Mẫu 5" value={data.nominations.length} prefix={<TrophyOutlined />} valueStyle={{ color: '#D48806' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Lượt SV xét ĐRL & Học bổng" value={data.studentBonuses.length} prefix={<StarOutlined />} valueStyle={{ color: '#1890FF' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Tổng Giờ chuẩn GVHD"
              value={data.lecturerHours.reduce((s, h) => s + Number(h.convertedHours || 0), 0)}
              suffix="giờ"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#389E0D' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Tabs
          defaultActiveKey="certs"
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
                        <Tag color={lvl === 'MINISTRY' ? 'purple' : 'blue'}>
                          {lvl === 'MINISTRY' ? 'Cấp Bộ GD&ĐT' : 'Cấp Học viện'}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Xếp giải & Tiền thưởng',
                      key: 'prize',
                      render: (_: any, r: any) => (
                        <div>
                          <Text strong>{r.prizeGrade || 'Đề xuất'}</Text>
                          <div style={{ fontSize: 12, color: '#389E0D' }}>
                            Thưởng: {Number(r.rewardAmount || 0).toLocaleString('vi-VN')}đ
                            {Number(r.supportFund || 0) > 0 && ` (+Hỗ trợ: ${Number(r.supportFund).toLocaleString('vi-VN')}đ)`}
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: 'Trạng thái',
                      key: 'status',
                      render: (_: any, r: any) =>
                        r.status === 'APPROVED' ? (
                          <Tag color="green">Đã duyệt ({r.rewardDecisionNo})</Tag>
                        ) : (
                          <Tag color="gold">Chờ P.QLKHCN / BGĐ duyệt</Tag>
                        ),
                    },
                    {
                      title: 'Thao tác',
                      key: 'action',
                      render: (_: any, r: any) =>
                        isQLKHOrBoard && r.status !== 'APPROVED' ? (
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
                  {p.project_id} — {p.title_vi} ({p.acceptances?.grade})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="awardLevel" label="Cấp đề cử" initialValue="INSTITUTE">
            <Select>
              <Select.Option value="INSTITUTE">Giải thưởng NCKH Cấp Học viện PTIT</Select.Option>
              <Select.Option value="MINISTRY">Dự thi Sinh viên NCKH Cấp Bộ GD&ĐT</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="prizeGrade" label="Xếp giải đề xuất" initialValue="Đề xuất Giải Nhì">
            <Input />
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
                  {p.project_id} — {p.title_vi} ({p.acceptances?.avg_score}đ - {p.acceptances?.grade})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
