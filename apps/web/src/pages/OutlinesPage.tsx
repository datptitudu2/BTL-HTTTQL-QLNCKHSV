import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Modal,
  Input,
  Radio,
  Form,
  Select,
  message,
  Alert,
  Timeline,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SolutionOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const OutlinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';

  const [outlines, setOutlines] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutline, setSelectedOutline] = useState<any>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);

  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED'>('APPROVED');
  const [reviewMode, setReviewMode] = useState<'DIRECT' | 'PROXY'>('DIRECT');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [submitForm] = Form.useForm();

  const isLecturer = roleCode === 'LECTURER';
  const isFaculty = roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY' || roleCode === 'ADMIN';
  const canReview = isLecturer || isFaculty || roleCode === 'QLKHCN';
  const canSubmitOutline = roleCode === 'STUDENT' || roleCode === 'ADMIN';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [outRes, projRes] = await Promise.all([
        api.get('/outlines'),
        api.get('/projects'),
      ]);
      setOutlines(Array.isArray(outRes.data) ? outRes.data : []);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể tải dữ liệu đề cương từ máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const eligibleProjectsForSubmit = projects.filter((p) => {
    if (!['ONGOING', 'OUTLINE_SUBMITTED', 'FACULTY_APPROVED'].includes(p.status)) return false;
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

  const openReviewModal = (record: any) => {
    setSelectedOutline(record);
    setReviewDecision('APPROVED');
    setReviewMode('DIRECT');
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedOutline) return;
    try {
      setSubmitting(true);
      await api.post(`/outlines/${selectedOutline.outlineId}/approve`, {
        decision: reviewDecision,
        comment: reviewComment,
        mode: reviewMode,
      });
      message.success('Đã ghi nhận kết quả thẩm định Đề cương Mẫu 2 lên CSDL.');
      setReviewModalVisible(false);
      setSelectedOutline(null);
      await fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Lỗi khi phê duyệt đề cương');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitNewOutline = async (values: any) => {
    try {
      setSubmitting(true);
      await api.post(`/outlines/project/${values.projectId}`, {
        fileUrl: values.fileUrl || `/storage/outlines/${values.projectId}_Mau2.pdf`,
        objectives: values.objectives,
        content: values.content,
        methodology: values.methodology,
        expectedResult: values.expectedResult,
      });
      message.success('Đã nộp phiên bản Đề cương chi tiết Mẫu 2 thành công!');
      setSubmitModalVisible(false);
      submitForm.resetFields();
      await fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể nộp đề cương');
    } finally {
      setSubmitting(false);
    }
  };

  const getApprovalTag = (status: string, approvals: any[] = []) => {
    const proxyApproved = approvals.some((a) => a.mode === 'PROXY' && a.decision === 'APPROVED');
    switch (status) {
      case 'FACULTY_APPROVED':
        return (
          <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontWeight: 600 }}>
            Đã duyệt 2 cấp (Khoa){proxyApproved ? ' • Ký thay' : ''}
          </Tag>
        );
      case 'ADVISOR_APPROVED':
        return (
          <Tag color="blue" icon={<SolutionOutlined />} style={{ fontWeight: 600 }}>
            GVHD đã duyệt • Chờ Trưởng Khoa
          </Tag>
        );
      case 'REVISION_REQUIRED':
        return (
          <Tag color="orange" icon={<ExclamationCircleOutlined />} style={{ fontWeight: 600 }}>
            Yêu cầu chỉnh sửa
          </Tag>
        );
      case 'REJECTED':
        return (
          <Tag color="red" icon={<CloseCircleOutlined />} style={{ fontWeight: 600 }}>
            Từ chối đề cương
          </Tag>
        );
      default:
        return (
          <Tag color="gold" style={{ fontWeight: 600 }}>
            Chờ GVHD thẩm định (Cấp 1)
          </Tag>
        );
    }
  };

  const stats = {
    total: outlines.length,
    pendingAdvisor: outlines.filter((o) => o.approvalStatus === 'PENDING').length,
    pendingFaculty: outlines.filter((o) => o.approvalStatus === 'ADVISOR_APPROVED').length,
    approved: outlines.filter((o) => o.approvalStatus === 'FACULTY_APPROVED').length,
  };

  const columns = [
    {
      title: 'Mã đề tài',
      dataIndex: 'projectId',
      key: 'projectId',
      width: 170,
      render: (id: string, record: any) => (
        <Space direction="vertical" size={2}>
          <a onClick={() => navigate(`/projects/${id}`)} style={{ fontWeight: 700, color: '#C62828' }}>
            {id}
          </a>
          <Tag color="default" style={{ fontSize: 11 }}>
            {record.project?.department?.deptName || 'Khoa/Viện PTIT'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Tên đề tài & Nhóm thực hiện',
      key: 'title',
      render: (_: any, record: any) => {
        const lead = record.project?.members?.find((m: any) => m.memberRole === 'LEAD') || record.project?.members?.[0];
        const adv = record.project?.advisors?.[0];
        return (
          <div>
            <Text strong style={{ color: '#262626' }}>
              {record.project?.titleVi || '—'}
            </Text>
            <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
              Chủ nhiệm: <b>{lead?.student?.user?.fullName || 'Chưa cập nhật'}</b> • GVHD:{' '}
              <b>{adv?.lecturer?.user?.fullName || 'Chưa phân công'}</b>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Phiên bản',
      dataIndex: 'versionNo',
      key: 'versionNo',
      width: 110,
      render: (v: number) => <Tag color="geekblue">v{v}.0</Tag>,
    },
    {
      title: 'Trạng thái duyệt 2 cấp (DFD 4.1)',
      key: 'approvalStatus',
      width: 240,
      render: (_: any, record: any) => getApprovalTag(record.approvalStatus, record.approvals),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 230,
      render: (_: any, record: any) => {
        const advisorApproved = record.approvals?.some(
          (a: any) => a.role === 'ADVISOR' && a.decision === 'APPROVED',
        );
        const facultyBlocked =
          (roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') && !advisorApproved;

        return (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openReviewModal(record)}
            >
              Chi tiết
            </Button>
            {canReview && record.approvalStatus !== 'FACULTY_APPROVED' && (
              <Tooltip
                title={
                  facultyBlocked
                    ? 'Lãnh đạo Khoa chỉ ký duyệt sau khi GVHD phê duyệt (DFD 4.1)'
                    : 'Thẩm định & Ký duyệt Đề cương'
                }
              >
                <Button
                  size="small"
                  type="primary"
                  style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                  disabled={facultyBlocked}
                  onClick={() => openReviewModal(record)}
                >
                  {isLecturer ? 'GVHD duyệt' : 'Khoa duyệt'}
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#262626', fontWeight: 700 }}>
            Quản lý & Phê duyệt 2 cấp Đề cương Chi tiết (Mẫu 2 - QĐ 521)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quy trình DFD 4.1: Chỉ nộp sau Quyết định giao đề tài; bắt buộc GVHD thẩm định (Cấp 1) trước khi Lãnh đạo Khoa ký duyệt (Cấp 2 - hỗ trợ Ký thay).
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
          {canSubmitOutline && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              disabled={eligibleProjectsForSubmit.length === 0}
              onClick={() => setSubmitModalVisible(true)}
            >
              Nộp Đề cương Mẫu 2
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Tổng bản đề cương" value={stats.total} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Chờ GVHD duyệt (Cấp 1)" value={stats.pendingAdvisor} valueStyle={{ color: '#D48806' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Chờ Lãnh đạo Khoa (Cấp 2)" value={stats.pendingFaculty} valueStyle={{ color: '#1890FF' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Đã phê duyệt 2 cấp" value={stats.approved} valueStyle={{ color: '#389E0D' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Table
          loading={loading}
          dataSource={outlines}
          columns={columns}
          rowKey="outlineId"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có bản đề cương nào được nộp trong CSDL' }}
        />
      </Card>

      {/* Modal Thẩm định & Lịch sử duyệt 2 cấp */}
      <Modal
        title={`Hồ sơ Đề cương Mẫu 2 — ${selectedOutline?.projectId} (v${selectedOutline?.versionNo})`}
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={760}
      >
        {selectedOutline && (
          <div>
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message={selectedOutline.project?.titleVi}
              description={`Tệp đính kèm số: ${selectedOutline.fileUrl}`}
            />

            <Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>
              Lịch sử Thẩm định & Ký duyệt 2 cấp (DFD 4.1)
            </Title>
            {selectedOutline.approvals?.length > 0 ? (
              <Timeline
                items={selectedOutline.approvals.map((app: any) => ({
                  color: app.decision === 'APPROVED' ? 'green' : app.decision === 'REVISION_REQUIRED' ? 'orange' : 'red',
                  children: (
                    <div>
                      <Text strong>
                        {app.role === 'ADVISOR' ? 'Cấp 1: Giảng viên hướng dẫn' : 'Cấp 2: Lãnh đạo Khoa / Đơn vị'}
                      </Text>{' '}
                      <Tag color={app.decision === 'APPROVED' ? 'green' : app.decision === 'REVISION_REQUIRED' ? 'orange' : 'red'}>
                        {app.decision === 'APPROVED'
                          ? 'Đã phê duyệt'
                          : app.decision === 'REVISION_REQUIRED'
                            ? 'Yêu cầu chỉnh sửa'
                            : 'Không đạt / Từ chối'}
                      </Tag>
                      {app.mode === 'PROXY' && <Tag color="purple">Ký thay (PROXY)</Tag>}
                      <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>{app.comment || 'Không có ghi chú'}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                        {new Date(app.decidedAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Text type="secondary">Chưa có lượt thẩm định nào cho phiên bản này.</Text>
            )}

            {canReview && selectedOutline.approvalStatus !== 'FACULTY_APPROVED' && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                <Title level={5} style={{ fontSize: 14, color: '#C62828' }}>
                  Ghi nhận quyết định thẩm định ({isLecturer ? 'Cấp 1: GVHD' : 'Cấp 2: Khoa'})
                </Title>

                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Quyết định:</Text>
                    <Radio.Group value={reviewDecision} onChange={(e) => setReviewDecision(e.target.value)}>
                      <Radio.Button value="APPROVED">Phê duyệt Đạt</Radio.Button>
                      <Radio.Button value="REVISION_REQUIRED">Yêu cầu chỉnh sửa</Radio.Button>
                      <Radio.Button value="REJECTED">Từ chối</Radio.Button>
                    </Radio.Group>
                  </div>

                  {!isLecturer && (
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>Hình thức ký duyệt (QĐ 521):</Text>
                      <Radio.Group value={reviewMode} onChange={(e) => setReviewMode(e.target.value)}>
                        <Radio value="DIRECT">Ký duyệt trực tiếp (DIRECT)</Radio>
                        <Radio value="PROXY">Thư ký / Phó khoa Ký thay (PROXY)</Radio>
                      </Radio.Group>
                    </div>
                  )}

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Nhận xét chuyên môn:</Text>
                    <TextArea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Nhập góp ý về mục tiêu, phương pháp nghiên cứu, dự toán..."
                    />
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <Space>
                      <Button onClick={() => setReviewModalVisible(false)}>Đóng</Button>
                      <Button
                        type="primary"
                        loading={submitting}
                        style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                        onClick={handleConfirmReview}
                      >
                        Xác nhận thẩm định
                      </Button>
                    </Space>
                  </div>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Sinh viên nộp Đề cương Mẫu 2 */}
      <Modal
        title="Nộp phiên bản Đề cương chi tiết (Mẫu 2)"
        open={submitModalVisible}
        onCancel={() => setSubmitModalVisible(false)}
        onOk={() => submitForm.submit()}
        confirmLoading={submitting}
        okText="Nộp Đề cương"
        okButtonProps={{ style: { backgroundColor: '#C62828', borderColor: '#C62828' } }}
      >
        <Form form={submitForm} layout="vertical" onFinish={handleSubmitNewOutline}>
          <Form.Item
            name="projectId"
            label="Chọn đề tài đã được giao thực hiện"
            rules={[{ required: true, message: 'Vui lòng chọn đề tài' }]}
          >
            <Select placeholder="Chọn đề tài của bạn">
              {eligibleProjectsForSubmit.map((p) => (
                <Select.Option key={p.project_id} value={p.project_id}>
                  {p.project_id} — {p.title_vi}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="fileUrl" label="Đường dẫn tệp Đề cương PDF (Mẫu 2)">
            <Input placeholder="/storage/outlines/SV-2026-CNTT1-002_v2.pdf" />
          </Form.Item>
          <Form.Item name="objectives" label="Cập nhật Mục tiêu nghiên cứu (tùy chọn)">
            <TextArea rows={2} placeholder="Mục tiêu nghiên cứu chi tiết..." />
          </Form.Item>
          <Form.Item name="methodology" label="Phương pháp nghiên cứu (tùy chọn)">
            <TextArea rows={2} placeholder="Phương pháp thực nghiệm..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
