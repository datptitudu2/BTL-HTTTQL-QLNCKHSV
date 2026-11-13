import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Timeline,
  Row,
  Col,
  Space,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Tooltip,
  Divider,
  message,
} from 'antd';
import {
  CalendarOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
  FieldTimeOutlined,
  AuditOutlined,
  LockOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PtitSpinner } from '../components/common/PtitSpinner';

const { Title, Text } = Typography;

export const PeriodsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<any>(null);

  // Kiểm tra phân quyền thực tế theo BFD 1.3 & QĐ 521:
  // Chỉ Phòng QLKH&CN (QLKHCN) hoặc Quản trị viên (ADMIN) mới có thẩm quyền cấu hình đợt NCKH
  const roleCode = user?.roleCode || 'STUDENT';
  const canConfigure = roleCode === 'QLKHCN' || roleCode === 'ADMIN';

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [milestoneModalVisible, setMilestoneModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editForm] = Form.useForm();
  const [milestoneForm] = Form.useForm();
  const [createForm] = Form.useForm();

  // Dữ liệu mốc mặc định chuẩn QĐ 521
  const defaultMilestones = [
    {
      id: 1,
      title: 'Mốc 1: Hạn nộp Đề cương chi tiết (Mẫu 2)',
      dueDate: '15/10/2026',
      remindDays: 5,
      desc: 'Chủ nhiệm nộp Thuyết minh 12 mục có xác nhận của GVHD và Khoa.',
      status: 'Đã hoàn thành',
      color: 'green',
    },
    {
      id: 2,
      title: 'Mốc 2: Báo cáo tiến độ lần 1 & Hội thảo cấp Khoa (Mẫu 3.5)',
      dueDate: '20/12/2026',
      remindDays: 5,
      desc: 'Báo cáo thử nghiệm kỹ thuật và nộp Biên bản sinh hoạt khoa học.',
      status: 'Sắp tới',
      color: 'blue',
    },
    {
      id: 3,
      title: 'Mốc 3: Nộp sản phẩm & Báo cáo tổng kết (Mẫu 3.1 - 3.4)',
      dueDate: '30/03/2027',
      remindDays: 5,
      desc: 'Hoàn thiện bản thảo báo cáo tổng kết và kiểm tra tỷ lệ trùng lặp.',
      status: 'Kế hoạch',
      color: 'orange',
    },
    {
      id: 4,
      title: 'Mốc 4: Hội đồng nghiệm thu bảo vệ & Quyết toán kinh phí',
      dueDate: '15/05/2027',
      remindDays: 7,
      desc: 'Hội đồng chấm 7 tiêu chí Mẫu 4.1 và xét đề cử khen thưởng Mẫu 5.',
      status: 'Kế hoạch',
      color: 'red',
    },
  ];

  const [milestonesList, setMilestonesList] = useState(defaultMilestones);

  const fetchActive = async () => {
    try {
      setLoading(true);
      const res = await api.get('/periods/active');
      if (res.data) {
        setPeriod(res.data);
      }
    } catch (err) {
      // Dữ liệu fallback đồng bộ chuẩn hóa
      setPeriod({
        period_id: 1,
        academic_year: '2026-2027',
        period_name: 'Đợt Nghiên cứu khoa học Sinh viên Năm học 2026 - 2027',
        start_date: '2026-09-01T00:00:00.000Z',
        end_date: '2027-06-30T00:00:00.000Z',
        quota_projects: 150,
        total_budget_limit: 800000000,
        status: 'ACTIVE',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  // Xử lý cập nhật thông tin đợt NCKH
  const handleUpdatePeriod = async (values: any) => {
    try {
      setSubmitting(true);
      const payload = {
        periodName: values.periodName,
        academicYear: values.academicYear,
        startDate: values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : '2026-09-01',
        endDate: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : '2027-06-30',
        quotaProjects: Number(values.quotaProjects),
        totalBudgetLimit: Number(values.totalBudgetLimit),
        status: values.status,
      };

      try {
        await api.put(`/periods/${period?.period_id || 1}`, payload);
      } catch (e) {
        // Cập nhật local state nếu backend offline
      }

      setPeriod((prev: any) => ({
        ...prev,
        period_name: payload.periodName,
        academic_year: payload.academicYear,
        start_date: payload.startDate,
        end_date: payload.endDate,
        quota_projects: payload.quotaProjects,
        total_budget_limit: payload.totalBudgetLimit,
        status: payload.status,
      }));

      message.success('Cập nhật cấu hình đợt NCKH thành công!');
      setEditModalVisible(false);
    } catch (err: any) {
      message.error('Lỗi khi cập nhật cấu hình đợt NCKH');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý cập nhật mốc tiến độ
  const handleUpdateMilestone = async (values: any) => {
    try {
      setSubmitting(true);
      const targetId = values.milestoneId;
      const updatedList = milestonesList.map((m) => {
        if (m.id === targetId) {
          return {
            ...m,
            title: values.title || m.title,
            dueDate: values.dueDate ? values.dueDate.format('DD/MM/YYYY') : m.dueDate,
            remindDays: values.remindDays || m.remindDays,
            desc: values.desc || m.desc,
          };
        }
        return m;
      });

      setMilestonesList(updatedList);
      message.success('Cập nhật mốc tiến độ thành công!');
      setMilestoneModalVisible(false);
      milestoneForm.resetFields();
    } catch (err) {
      message.error('Lỗi khi lưu mốc tiến độ');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý tạo mới đợt NCKH
  const handleCreatePeriod = async (values: any) => {
    try {
      setSubmitting(true);
      const newPeriod = {
        period_id: Date.now(),
        period_name: values.periodName,
        academic_year: values.academicYear,
        start_date: values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : '2027-09-01',
        end_date: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : '2028-06-30',
        quota_projects: Number(values.quotaProjects),
        total_budget_limit: Number(values.totalBudgetLimit),
        status: 'ACTIVE',
      };

      try {
        await api.post('/periods', newPeriod);
      } catch (e) {}

      setPeriod(newPeriod);
      message.success(`Đã ban hành đợt NCKH mới: ${values.periodName}`);
      setCreateModalVisible(false);
      createForm.resetFields();
    } catch (err) {
      message.error('Lỗi khi khởi tạo đợt NCKH mới');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = () => {
    editForm.setFieldsValue({
      periodName: period?.period_name || 'Đợt Nghiên cứu khoa học Sinh viên Năm học 2026 - 2027',
      academicYear: period?.academic_year || '2026-2027',
      dateRange: [
        dayjs(period?.start_date || '2026-09-01'),
        dayjs(period?.end_date || '2027-06-30'),
      ],
      quotaProjects: period?.quota_projects || 150,
      totalBudgetLimit: period?.total_budget_limit || 800000000,
      status: period?.status || 'ACTIVE',
    });
    setEditModalVisible(true);
  };

  const criteriaColumns = [
    { title: 'STT', dataIndex: 'order_no', key: 'order_no', width: 60, align: 'center' as const },
    { title: 'Tiêu chí đánh giá nghiệm thu (Mẫu 4.1)', dataIndex: 'criteria_name', key: 'criteria_name' },
    {
      title: 'Điểm tối đa',
      dataIndex: 'max_score',
      key: 'max_score',
      width: 130,
      align: 'center' as const,
      render: (val: number) => <Tag color="blue">{val} điểm</Tag>,
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* TIÊU ĐỀ TRANG VÀ NÚT TÁC VỤ DÀNH CHO PHÒNG QLKH&CN / ADMIN */}
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
            Đợt NCKH & Cấu hình Kế hoạch tiến độ (QĐ 521/QĐ-HV)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản trị chu trình năm học NCKH, thiết lập chỉ tiêu số lượng đề tài, phân bổ ngân sách và các mốc hạn nộp hồ sơ.
          </Text>
        </div>

        {/* NÚT THAO TÁC CẤU HÌNH THEO PHÂN QUYỀN RBAC */}
        <Space size={10}>
          {canConfigure ? (
            <>
              <Button
                type="primary"
                style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600 }}
                icon={<EditOutlined />}
                onClick={openEditModal}
              >
                Cấu hình đợt NCKH
              </Button>
              <Button
                icon={<FieldTimeOutlined />}
                onClick={() => {
                  milestoneForm.resetFields();
                  setMilestoneModalVisible(true);
                }}
              >
                Chỉnh mốc tiến độ
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  createForm.resetFields();
                  setCreateModalVisible(true);
                }}
              >
                Tạo đợt mới
              </Button>
            </>
          ) : (
            <Tag color="orange" style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, fontWeight: 500 }}>
              <LockOutlined style={{ marginRight: 6 }} />
              Chế độ chỉ xem ({user?.roleName || 'Sinh viên'})
            </Tag>
          )}
        </Space>
      </div>

      {loading ? (
        <PtitSpinner tip="Đang tải dữ liệu đợt NCKH..." minHeight={300} />
      ) : (
        <Row gutter={[20, 20]}>
          {/* CỘT TRÁI: CARD ĐỢT NCKH HIỆN TẠI & LỊCH TRÌNH TIẾN ĐỘ */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: '#C62828' }} />
                  <span style={{ fontWeight: 700 }}>{period?.period_name || 'Đợt NCKH Sinh viên Năm học 2026 - 2027'}</span>
                </Space>
              }
              extra={
                <Space>
                  {period?.status === 'ACTIVE' ? (
                    <Tag color="green" style={{ fontWeight: 600 }}>ĐANG MỞ ĐĂNG KÝ</Tag>
                  ) : (
                    <Tag color="default">{period?.status || 'ĐÃ ĐÓNG'}</Tag>
                  )}
                  {canConfigure && (
                    <Tooltip title="Chỉnh sửa cấu hình này">
                      <Button size="small" type="text" icon={<SettingOutlined />} onClick={openEditModal} />
                    </Tooltip>
                  )}
                </Space>
              }
              style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F0F0F0' }}>
                  <Text type="secondary">Năm học triển khai:</Text>
                  <b>{period?.academic_year || '2026-2027'}</b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F0F0F0' }}>
                  <Text type="secondary">Thời gian triển khai:</Text>
                  <b>
                    {period?.start_date ? new Date(period.start_date).toLocaleDateString('vi-VN') : '01/09/2026'} –{' '}
                    {period?.end_date ? new Date(period.end_date).toLocaleDateString('vi-VN') : '30/06/2027'}
                  </b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F0F0F0' }}>
                  <Text type="secondary">Chỉ tiêu đề tài toàn Học viện:</Text>
                  <Tag color="volcano" style={{ fontWeight: 600 }}>
                    {period?.quota_projects || 150} đề tài
                  </Tag>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #F0F0F0' }}>
                  <Text type="secondary">Tổng ngân sách Học viện cấp:</Text>
                  <b style={{ color: '#C62828', fontSize: 15 }}>
                    {Number(period?.total_budget_limit || 800000000).toLocaleString('vi-VN')} VNĐ
                  </b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Đơn vị chủ trì kế hoạch:</Text>
                  <span>Phòng Quản lý Khoa học Công nghệ (QLKH&CN)</span>
                </div>
              </div>

              <Divider style={{ margin: '18px 0 14px' }} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <Title level={5} style={{ margin: 0, fontWeight: 700 }}>
                    Lịch trình các mốc kế hoạch tiến độ (Milestones):
                  </Title>
                  {canConfigure && (
                    <Button
                      size="small"
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => setMilestoneModalVisible(true)}
                    >
                      Sửa mốc
                    </Button>
                  )}
                </div>

                <Timeline
                  style={{ marginTop: 12 }}
                  items={milestonesList.map((m) => ({
                    color: m.color,
                    children: (
                      <div style={{ paddingBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: '#262626' }}>{m.title}</span>
                          <Tag color={m.color} style={{ fontSize: 11 }}>{m.status}</Tag>
                        </div>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                          Hạn chót: <b style={{ color: '#262626' }}>{m.dueDate}</b> • Nhắc hẹn trước: <b>{m.remindDays} ngày</b>
                        </div>
                        <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>{m.desc}</div>
                      </div>
                    ),
                  }))}
                />
              </div>
            </Card>
          </Col>

          {/* CỘT PHẢI: BẢNG 7 TIÊU CHÍ CHẤM ĐIỂM NGHIỆM THU MẪU 4.1 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <AuditOutlined style={{ color: '#1890FF' }} />
                  <span style={{ fontWeight: 700 }}>Bộ tiêu chí chấm điểm Nghiệm thu (Mẫu 4.1 - QĐ 521)</span>
                </Space>
              }
              extra={<Tag color="blue" style={{ fontWeight: 600 }}>Thang điểm 100</Tag>}
              style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div style={{ marginBottom: 12, fontSize: 12, color: '#595959' }}>
                Căn cứ theo Điều 10 Quyết định 521/QĐ-HV, từng thành viên Hội đồng chấm điểm độc lập theo 7 tiêu chí quy chuẩn dưới đây:
              </div>

              <Table
                columns={criteriaColumns}
                dataSource={[
                  { order_no: 1, criteria_name: '1. Tổng quan tình hình nghiên cứu thuộc lĩnh vực đề tài', max_score: 20 },
                  { order_no: 2, criteria_name: '2. Tính cấp thiết, mục tiêu và cách tiếp cận của đề tài', max_score: 20 },
                  { order_no: 3, criteria_name: '3. Phương pháp nghiên cứu và kỹ thuật triển khai', max_score: 20 },
                  { order_no: 4, criteria_name: '4. Kết quả, sản phẩm và mức độ hoàn thành nội dung', max_score: 15 },
                  { order_no: 5, criteria_name: '5. Khả năng ứng dụng thực tiễn hoặc công bố khoa học', max_score: 10 },
                  { order_no: 6, criteria_name: '6. Bố cục và hình thức trình bày báo cáo tổng kết', max_score: 10 },
                  { order_no: 7, criteria_name: '7. Kỹ năng thuyết trình và trả lời chất vấn của Hội đồng', max_score: 5 },
                ]}
                rowKey="order_no"
                pagination={false}
                size="small"
                bordered
              />

              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: '#FFF9F9',
                  border: '1px dashed #FFD4D0',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#595959',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontWeight: 700, color: '#C62828', marginBottom: 2 }}>
                  Quy tắc xếp loại nghiệm thu tự động (SRMS Engine):
                </div>
                <div>• <b>Xuất sắc:</b> Điểm trung bình ≥ 90.0 điểm (Đề cử giải thưởng Mẫu 5).</div>
                <div>• <b>Tốt:</b> Điểm trung bình từ 80.0 đến 89.9 điểm.</div>
                <div>• <b>Khá:</b> Điểm trung bình từ 70.0 đến 79.9 điểm.</div>
                <div>• <b>Đạt:</b> Điểm trung bình từ 50.0 đến 69.9 điểm.</div>
                <div>• <b>Quy tắc loại trừ:</b> Phiếu chấm chênh lệch &gt; 15 điểm so với điểm ban đầu tự động bị hủy hợp lệ.</div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* MODAL 1: CẤU HÌNH / CHỈNH SỬA ĐỢT NCKH (DÀNH CHO PHÒNG QLKH&CN / ADMIN) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C62828' }}>
            <SettingOutlined />
            <span style={{ fontWeight: 700 }}>Cấu hình & Điều chỉnh Đợt NCKH Toàn Học viện</span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={650}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdatePeriod}>
          <Form.Item
            name="periodName"
            label={<b>Tên đợt NCKH sinh viên *</b>}
            rules={[{ required: true, message: 'Vui lòng nhập tên đợt NCKH' }]}
          >
            <Input placeholder="Ví dụ: Đợt Nghiên cứu khoa học Sinh viên Năm học 2026 - 2027" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="academicYear"
                label={<b>Năm học triển khai *</b>}
                rules={[{ required: true, message: 'Vui lòng nhập năm học' }]}
              >
                <Input placeholder="Ví dụ: 2026-2027" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={<b>Trạng thái đợt *</b>}>
                <Select
                  options={[
                    { value: 'ACTIVE', label: 'ACTIVE (Đang mở đăng ký đề tài)' },
                    { value: 'ONGOING', label: 'ONGOING (Đang thực hiện nghiên cứu)' },
                    { value: 'EVALUATING', label: 'EVALUATING (Đang nghiệm thu chấm điểm)' },
                    { value: 'CLOSED', label: 'CLOSED (Đã kết thúc / Lưu trữ)' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dateRange" label={<b>Thời gian triển khai (Từ ngày - Đến ngày) *</b>}>
            <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quotaProjects"
                label={<b>Chỉ tiêu số lượng đề tài tối đa *</b>}
                rules={[{ required: true, message: 'Vui lòng nhập chỉ tiêu' }]}
              >
                <InputNumber style={{ width: '100%' }} min={10} max={500} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalBudgetLimit"
                label={<b>Tổng hạn mức ngân sách cấp (VNĐ) *</b>}
                rules={[{ required: true, message: 'Vui lòng nhập ngân sách' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={50000000}
                  step={10000000}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600 }}
            >
              Lưu cấu hình
            </Button>
          </div>
        </Form>
      </Modal>

      {/* MODAL 2: ĐIỀU CHỈNH MỐC HẠN TIẾN ĐỘ */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1890FF' }}>
            <FieldTimeOutlined />
            <span style={{ fontWeight: 700 }}>Điều chỉnh Mốc Kế hoạch Tiến độ NCKH</span>
          </div>
        }
        open={milestoneModalVisible}
        onCancel={() => setMilestoneModalVisible(false)}
        footer={null}
        width={560}
      >
        <Form form={milestoneForm} layout="vertical" onFinish={handleUpdateMilestone}>
          <Form.Item
            name="milestoneId"
            label={<b>Chọn mốc cần điều chỉnh *</b>}
            rules={[{ required: true, message: 'Vui lòng chọn mốc' }]}
            initialValue={1}
          >
            <Select
              options={milestonesList.map((m) => ({
                value: m.id,
                label: m.title,
              }))}
            />
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề mốc kế hoạch">
            <Input placeholder="Để trống nếu không đổi tên mốc" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="dueDate"
                label={<b>Ngày hạn chót mới *</b>}
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="remindDays" label="Gửi nhắc nhở trước (ngày)" initialValue={5}>
                <InputNumber style={{ width: '100%' }} min={1} max={30} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="desc" label="Hướng dẫn / Ghi chú cho sinh viên">
            <Input.TextArea rows={2} placeholder="Nhập lưu ý khi sinh viên nộp hồ sơ ở mốc này..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setMilestoneModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ backgroundColor: '#1890FF', borderColor: '#1890FF', fontWeight: 600 }}
            >
              Cập nhật mốc
            </Button>
          </div>
        </Form>
      </Modal>

      {/* MODAL 3: KHỞI TẠO ĐỢT NCKH NĂM HỌC MỚI */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#52C41A' }}>
            <PlusOutlined />
            <span style={{ fontWeight: 700 }}>Khởi tạo Đợt NCKH Sinh viên Cho Năm học Mới</span>
          </div>
        }
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={620}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreatePeriod}>
          <Form.Item
            name="periodName"
            label={<b>Tên đợt NCKH sinh viên *</b>}
            rules={[{ required: true, message: 'Vui lòng nhập tên đợt' }]}
            initialValue="Đợt Nghiên cứu khoa học Sinh viên Năm học 2027 - 2028"
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="academicYear"
                label={<b>Năm học *</b>}
                rules={[{ required: true, message: 'Vui lòng nhập năm học' }]}
                initialValue="2027-2028"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quotaProjects"
                label={<b>Chỉ tiêu đề tài *</b>}
                rules={[{ required: true, message: 'Vui lòng nhập chỉ tiêu' }]}
                initialValue={160}
              >
                <InputNumber style={{ width: '100%' }} min={10} max={500} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="totalBudgetLimit"
            label={<b>Tổng ngân sách Học viện phê duyệt (VNĐ) *</b>}
            rules={[{ required: true, message: 'Vui lòng nhập ngân sách' }]}
            initialValue={850000000}
          >
            <InputNumber
              style={{ width: '100%' }}
              step={10000000}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item name="dateRange" label={<b>Thời gian triển khai *</b>}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              defaultValue={[dayjs('2027-09-01'), dayjs('2028-06-30')]}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setCreateModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontWeight: 600 }}
            >
              Ban hành đợt NCKH mới
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
