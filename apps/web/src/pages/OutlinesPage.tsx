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
  Timeline,
  Tooltip,
  Badge,
  Descriptions,
  Tabs,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SolutionOutlined,
  ExclamationCircleOutlined,
  PrinterOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const OutlinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';

  const [outlines, setOutlines] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOutline, setSelectedOutline] = useState<any>(null);
  const [modalTab, setModalTab] = useState<'preview' | 'review'>('preview');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);

  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED'>('APPROVED');
  const [reviewMode, setReviewMode] = useState<'DIRECT' | 'PROXY'>('DIRECT');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [submitForm] = Form.useForm();

  const isLecturer = roleCode === 'LECTURER';
  const isFaculty = roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY' || roleCode === 'ADMIN';
  const canReviewRole = isLecturer || isFaculty;
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

  const openReviewModal = (record: any, initialTab: 'preview' | 'review' = 'preview') => {
    setSelectedOutline(record);
    setModalTab(initialTab);
    setReviewDecision('APPROVED');
    setReviewMode(roleCode === 'FACULTY_SECRETARY' ? 'PROXY' : 'DIRECT');
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const canActOnOutline = (record: any) => {
    if (!canReviewRole || !record || record.approvalStatus === 'FACULTY_APPROVED') return false;
    if (roleCode === 'ADMIN') return true;
    if (isLecturer) {
      const isAdvisor = record.project?.advisors?.some(
        (a: any) => a.lecturer?.userId === user?.userId || (user?.lecturerId && a.lecturerId === user.lecturerId),
      );
      return Boolean(isAdvisor) && ['PENDING', 'REVISION_REQUIRED'].includes(record.approvalStatus);
    }
    if (roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') {
      return record.approvalStatus === 'ADVISOR_APPROVED';
    }
    return false;
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
    revision: outlines.filter((o) => ['REVISION_REQUIRED', 'REJECTED'].includes(o.approvalStatus)).length,
  };

  const filteredOutlines = outlines.filter((o) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'REVISION') return ['REVISION_REQUIRED', 'REJECTED'].includes(o.approvalStatus);
    return o.approvalStatus === statusFilter;
  });

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
          (roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') &&
          !advisorApproved &&
          record.approvalStatus !== 'FACULTY_APPROVED';
        const showActionBtn = canActOnOutline(record) || facultyBlocked;

        return (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openReviewModal(record, 'preview')}
            >
              Xem đề cương
            </Button>
            {showActionBtn && (
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
                  onClick={() => openReviewModal(record, 'review')}
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

      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        activeTabKey={statusFilter}
        onTabChange={(key) => setStatusFilter(key)}
        tabList={[
          {
            key: 'ALL',
            tab: (
              <Space size={6}>
                <span>Tất cả đề cương</span>
                <Badge count={stats.total} showZero color="#8c8c8c" />
              </Space>
            ),
          },
          {
            key: 'PENDING',
            tab: (
              <Space size={6}>
                <span>Chờ GVHD duyệt (Cấp 1)</span>
                <Badge count={stats.pendingAdvisor} showZero color="#faad14" />
              </Space>
            ),
          },
          {
            key: 'ADVISOR_APPROVED',
            tab: (
              <Space size={6}>
                <span>Chờ Lãnh đạo Khoa (Cấp 2)</span>
                <Badge count={stats.pendingFaculty} showZero color="#1677ff" />
              </Space>
            ),
          },
          {
            key: 'FACULTY_APPROVED',
            tab: (
              <Space size={6}>
                <span>Đã phê duyệt 2 cấp</span>
                <Badge count={stats.approved} showZero color="#52c41a" />
              </Space>
            ),
          },
          ...(stats.revision > 0
            ? [
                {
                  key: 'REVISION',
                  tab: (
                    <Space size={6}>
                      <span>Cần chỉnh sửa / Từ chối</span>
                      <Badge count={stats.revision} color="#ff4d4f" />
                    </Space>
                  ),
                },
              ]
            : []),
        ]}
      >
        <Table
          loading={loading}
          dataSource={filteredOutlines}
          columns={columns}
          rowKey="outlineId"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có bản đề cương nào ở trạng thái này' }}
        />
      </Card>

      {/* Modal Preview Đề cương Mẫu 2 & Thẩm định 2 cấp */}
      <Modal
        title={
          <Space>
            <span>Đề cương Nghiên cứu chi tiết (Mẫu 2) — {selectedOutline?.projectId}</span>
            <Tag color="geekblue">v{selectedOutline?.versionNo}.0</Tag>
            {selectedOutline && getApprovalTag(selectedOutline.approvalStatus, selectedOutline.approvals)}
          </Space>
        }
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        width={860}
        footer={
          selectedOutline
            ? [
                <Button
                  key="project"
                  icon={<LinkOutlined />}
                  onClick={() => {
                    setReviewModalVisible(false);
                    navigate(`/projects/${selectedOutline.projectId}`);
                  }}
                >
                  Mở trang Đề tài
                </Button>,
                <Button
                  key="print"
                  icon={<PrinterOutlined />}
                  href={`/gwdu?doc=doc-m2&projectId=${selectedOutline.projectId}`}
                  target="_blank"
                >
                  Xem & In Mẫu 2 (GWDU)
                </Button>,
                <Button key="close" onClick={() => setReviewModalVisible(false)}>
                  Đóng
                </Button>,
              ]
            : null
        }
      >
        {selectedOutline && (
          <Tabs
            activeKey={modalTab}
            onChange={(k) => setModalTab(k as 'preview' | 'review')}
            items={[
              {
                key: 'preview',
                label: 'Nội dung Đề cương (Mẫu 2)',
                children: (
                  <div>
                    <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 14 }}>
                      <Descriptions.Item label="Tên đề tài (Tiếng Việt)" span={2}>
                        <Text strong>{selectedOutline.project?.titleVi}</Text>
                      </Descriptions.Item>
                      {selectedOutline.project?.titleEn && (
                        <Descriptions.Item label="Tên tiếng Anh" span={2}>
                          <Text type="secondary">{selectedOutline.project.titleEn}</Text>
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Khoa / Đơn vị">
                        {selectedOutline.project?.department?.deptName || '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Lĩnh vực chuyên môn">
                        <Tag color="volcano">{selectedOutline.project?.researchField || 'Công nghệ thông tin'}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Nhóm thực hiện">
                        {selectedOutline.project?.members?.map((m: any) => (
                          <div key={m.studentId} style={{ fontSize: 12 }}>
                            <b>{m.student?.user?.fullName}</b> ({m.studentId}) —{' '}
                            {m.memberRole === 'LEAD' ? 'Chủ nhiệm' : 'Thành viên'} ({m.contributionPct}%)
                          </div>
                        ))}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giảng viên hướng dẫn & Kinh phí">
                        <div style={{ fontSize: 12 }}>
                          GVHD:{' '}
                          <b>
                            {selectedOutline.project?.advisors?.[0]?.lecturer?.user?.fullName || 'Chưa phân công'}
                          </b>
                        </div>
                        <div style={{ fontSize: 12, color: '#595959' }}>
                          Dự toán:{' '}
                          <b>
                            {Number(
                              selectedOutline.project?.budget?.approvedAmount ||
                                selectedOutline.project?.budget?.requestedAmount ||
                                5000000,
                            ).toLocaleString('vi-VN')}{' '}
                            đ
                          </b>
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mục tiêu nghiên cứu" span={2}>
                        <Paragraph style={{ margin: 0, fontSize: 13 }}>
                          {selectedOutline.project?.objectives || 'Chưa cập nhật'}
                        </Paragraph>
                      </Descriptions.Item>
                      <Descriptions.Item label="Nội dung nghiên cứu" span={2}>
                        <Paragraph style={{ margin: 0, fontSize: 13 }}>
                          {selectedOutline.project?.content || 'Chưa cập nhật'}
                        </Paragraph>
                      </Descriptions.Item>
                      <Descriptions.Item label="Phương pháp nghiên cứu" span={2}>
                        <Paragraph style={{ margin: 0, fontSize: 13 }}>
                          {selectedOutline.project?.methodology || 'Chưa cập nhật'}
                        </Paragraph>
                      </Descriptions.Item>
                      <Descriptions.Item label="Sản phẩm & Kết quả dự kiến" span={2}>
                        <Paragraph style={{ margin: 0, fontSize: 13 }}>
                          {selectedOutline.project?.expectedResult || 'Chưa cập nhật'}
                        </Paragraph>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tệp đính kèm & Ngày nộp" span={2}>
                        <Space split="•" wrap>
                          <Text code>{selectedOutline.fileUrl}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Ngày nộp: {new Date(selectedOutline.submittedAt).toLocaleDateString('vi-VN')}
                          </Text>
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>
                    {canActOnOutline(selectedOutline) && (
                      <div style={{ textAlign: 'right' }}>
                        <Button
                          type="primary"
                          style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                          onClick={() => setModalTab('review')}
                        >
                          Chuyển sang bước {isLecturer ? 'GVHD thẩm định (Cấp 1)' : 'Lãnh đạo Khoa duyệt (Cấp 2)'} →
                        </Button>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'review',
                label: `Lịch sử & Thẩm định 2 cấp (${selectedOutline.approvals?.length || 0})`,
                children: (
                  <div>
                    <Title level={5} style={{ fontSize: 14, marginBottom: 10 }}>
                      Lịch sử Thẩm định & Ký duyệt 2 cấp (DFD 4.1)
                    </Title>
                    {selectedOutline.approvals?.length > 0 ? (
                      <Timeline
                        items={selectedOutline.approvals.map((app: any) => ({
                          color:
                            app.decision === 'APPROVED'
                              ? 'green'
                              : app.decision === 'REVISION_REQUIRED'
                              ? 'orange'
                              : 'red',
                          children: (
                            <div>
                              <Text strong>
                                {app.role === 'ADVISOR'
                                  ? 'Cấp 1: Giảng viên hướng dẫn'
                                  : 'Cấp 2: Lãnh đạo Khoa / Đơn vị'}
                              </Text>{' '}
                              <Tag
                                color={
                                  app.decision === 'APPROVED'
                                    ? 'green'
                                    : app.decision === 'REVISION_REQUIRED'
                                    ? 'orange'
                                    : 'red'
                                }
                              >
                                {app.decision === 'APPROVED'
                                  ? 'Đã phê duyệt'
                                  : app.decision === 'REVISION_REQUIRED'
                                  ? 'Yêu cầu chỉnh sửa'
                                  : 'Không đạt / Từ chối'}
                              </Tag>
                              {app.mode === 'PROXY' && <Tag color="purple">Ký thay</Tag>}
                              <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>
                                {app.comment || 'Không có ghi chú'}
                              </div>
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

                    {canActOnOutline(selectedOutline) && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                        <Title level={5} style={{ fontSize: 14, color: '#C62828' }}>
                          Ghi nhận quyết định thẩm định ({isLecturer ? 'Cấp 1: GVHD' : 'Cấp 2: Lãnh đạo Khoa'})
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
                              <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                Hình thức ký duyệt (QĐ 521):
                              </Text>
                              <Radio.Group value={reviewMode} onChange={(e) => setReviewMode(e.target.value)}>
                                <Radio value="DIRECT">Ký duyệt trực tiếp</Radio>
                                <Radio value="PROXY">Thư ký / Phó khoa Ký thay</Radio>
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
                            <Button
                              type="primary"
                              loading={submitting}
                              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                              onClick={handleConfirmReview}
                            >
                              Xác nhận thẩm định
                            </Button>
                          </div>
                        </Space>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
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
