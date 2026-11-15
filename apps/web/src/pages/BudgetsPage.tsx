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
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Progress,
  message,
  Tooltip,
  Segmented,
  Drawer,
} from 'antd';
import {
  DollarOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  BankOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export const BudgetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';

  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [quotaDrawerOpen, setQuotaDrawerOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAIT_FACULTY' | 'WAIT_FINANCE' | 'SETTLED'>('ALL');
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const isFacultyStaff = ['FACULTY_SECRETARY', 'FACULTY_LEADER', 'ADMIN'].includes(roleCode);
  const isFinance = ['FINANCE', 'ADMIN'].includes(roleCode);
  const canSubmitVoucher = ['STUDENT', 'FACULTY_SECRETARY', 'ADMIN'].includes(roleCode);
  const isStudent = roleCode === 'STUDENT';

  const ACCEPTANCE_GRADE_MAP: Record<string, string> = {
    XUAT_SAC: 'Xuất sắc',
    TOT: 'Tốt',
    KHA: 'Khá',
    DAT: 'Đạt',
    KHONG_DAT: 'Không đạt',
  };

  const BUDGET_STATUS_MAP: Record<string, { label: string; color: string }> = {
    SETTLED: { label: 'Đã quyết toán', color: 'green' },
    PARTIALLY_SETTLED: { label: 'Đang giải ngân', color: 'blue' },
    APPROVED: { label: 'Đã giao dự toán', color: 'blue' },
    PENDING: { label: 'Chờ duyệt', color: 'default' },
    REJECTED: { label: 'Từ chối', color: 'red' },
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/budgets');
      setBudgets(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể tải dữ liệu kinh phí & quyết toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const openAddSettlement = (budgetId: number) => {
    setSelectedBudgetId(budgetId);
    form.resetFields();
    setModalVisible(true);
  };

  const handleAddSettlement = async (values: any) => {
    const budgetId = values.budgetId || selectedBudgetId;
    if (!budgetId) return;
    try {
      setSubmitting(true);
      await api.post(`/budgets/${budgetId}/settlements`, {
        voucherNo: values.voucherNo,
        invoiceNo: values.invoiceNo,
        category: values.category,
        description: values.description,
        supplier: values.supplier,
        amount: Number(values.amount),
      });
      message.success('Đã kê khai chứng từ thanh quyết toán (Chờ Khoa xác nhận hoàn thành).');
      setModalVisible(false);
      await fetchBudgets();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể lưu chứng từ quyết toán');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFacultyConfirm = async (settlementId: number) => {
    try {
      await api.patch(`/budgets/settlements/${settlementId}/confirm-faculty`);
      message.success('Khoa đã xác nhận hoàn thành sản phẩm cho chứng từ (DFD 6.6).');
      await fetchBudgets();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Lỗi xác nhận chứng từ');
    }
  };

  const handleFinanceSettle = async (settlementId: number) => {
    try {
      await api.patch(`/budgets/settlements/${settlementId}/settle`);
      message.success('Phòng Tài chính - Kế toán đã phê duyệt giải ngân chứng từ!');
      await fetchBudgets();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không đủ điều kiện giải ngân');
    }
  };

  const totalApproved = budgets.reduce((s, b) => s + Number(b.approvedAmount || 0), 0);
  const allSettlements = budgets.flatMap((b) =>
    (b.settlements || []).map((st: any) => ({
      ...st,
      project: b.project,
      budgetApproved: Number(b.approvedAmount || 0),
    })),
  );
  const settledSettlements = allSettlements.filter((s) => Boolean(s.settledAt));
  const totalSettled = settledSettlements.reduce((s, x) => s + Number(x.amount || 0), 0);
  const remainingAmount = Math.max(0, totalApproved - totalSettled);
  const settledCount = settledSettlements.length;
  const pendingCount = allSettlements.length - settledCount;

  const filteredSettlements = allSettlements.filter((item) => {
    if (statusFilter === 'WAIT_FACULTY' && (item.facultyConfirmed || item.settledAt)) return false;
    if (statusFilter === 'WAIT_FINANCE' && (!item.facultyConfirmed || item.settledAt)) return false;
    if (statusFilter === 'SETTLED' && !item.settledAt) return false;
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      const target = `${item.project?.projectId || ''} ${item.voucherNo || ''} ${item.invoiceNo || ''} ${item.description || ''} ${item.supplier || ''}`.toLowerCase();
      if (!target.includes(kw)) return false;
    }
    return true;
  });

  const eligibleBudgets = budgets.filter((b) => {
    const approved = Number(b.approvedAmount || 0);
    const claimed = (b.settlements || []).reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0);
    return approved > 0 && b.project?.status !== 'REJECTED' && b.status !== 'SETTLED' && claimed < approved;
  });

  const settlementColumns = [
    {
      title: 'Đề tài & Khoa',
      key: 'project',
      width: 210,
      render: (_: any, r: any) => (
        <div>
          <a onClick={() => navigate(`/projects/${r.project?.projectId}`)} style={{ fontWeight: 700, color: '#C62828' }}>
            {r.project?.projectId}
          </a>
          <div style={{ fontSize: 11, color: '#595959' }}>{r.project?.department?.deptName}</div>
          {r.project?.acceptance?.grade && !['PENDING', 'KHONG_DAT'].includes(r.project.acceptance.grade) ? (
            <Tag color="green" style={{ fontSize: 10, marginTop: 4 }}>
              Đã nghiệm thu ({ACCEPTANCE_GRADE_MAP[r.project.acceptance.grade] || r.project.acceptance.grade})
            </Tag>
          ) : (
            <Tag color="orange" icon={<WarningOutlined />} style={{ fontSize: 10, marginTop: 4 }}>
              Chưa nghiệm thu (Đ5.2.b)
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Số chứng từ / Hóa đơn VAT',
      key: 'voucherNo',
      width: 190,
      render: (_: any, r: any) => (
        <div>
          <Text strong>{r.voucherNo}</Text>
          <div style={{ fontSize: 12, color: '#595959' }}>HĐ: {r.invoiceNo || '—'}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.supplier || 'Nhà cung cấp PTIT'}</div>
        </div>
      ),
    },
    {
      title: 'Hạng mục & Nội dung chi',
      key: 'description',
      render: (_: any, r: any) => (
        <div>
          <Tag color="blue">{r.category || 'Chi vật tư NCKH'}</Tag>
          <div style={{ fontSize: 13, marginTop: 4 }}>{r.description || 'Chi thực hiện sản phẩm đề tài'}</div>
        </div>
      ),
    },
    {
      title: 'Số tiền (VNĐ)',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right' as const,
      render: (val: any) => (
        <Text strong style={{ color: '#C62828' }}>
          {Number(val || 0).toLocaleString('vi-VN')} đ
        </Text>
      ),
    },
    {
      title: 'Trạng thái duyệt 3 bước (DFD 6.6)',
      key: 'status',
      width: 240,
      render: (_: any, r: any) => {
        if (r.settledAt) {
          return (
            <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontWeight: 600 }}>
              Đã giải ngân ({new Date(r.settledAt).toLocaleDateString('vi-VN')})
            </Tag>
          );
        }
        if (r.facultyConfirmed) {
          return (
            <Tag color="blue" icon={<BankOutlined />} style={{ fontWeight: 600 }}>
              Khoa đã xác nhận • Chờ P.TCKT
            </Tag>
          );
        }
        return (
          <Tag color="gold" style={{ fontWeight: 600 }}>
            Chờ Khoa xác nhận hoàn thành
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      render: (_: any, r: any) => {
        const hasAcceptance =
          r.project?.acceptance?.grade && !['PENDING', 'KHONG_DAT'].includes(r.project.acceptance.grade);

        return (
          <Space>
            {isFacultyStaff && !r.facultyConfirmed && (
              <Button size="small" type="primary" onClick={() => handleFacultyConfirm(r.settlementId)}>
                Khoa xác nhận
              </Button>
            )}
            {isFinance && r.facultyConfirmed && !r.settledAt && (
              <Tooltip
                title={
                  hasAcceptance
                    ? 'Phê duyệt giải ngân qua P.TCKT'
                    : 'Chỉ giải ngân sau khi đề tài có kết quả nghiệm thu đạt (Điều 5.2.b QĐ 521)'
                }
              >
                <Button
                  size="small"
                  type="primary"
                  style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                  disabled={!hasAcceptance}
                  onClick={() => handleFinanceSettle(r.settlementId)}
                >
                  P.TCKT Giải ngân
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
      {/* HEADER TRANG KINH PHÍ CHUẨN S-LINK */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={4} style={{ margin: 0, color: '#262626', fontWeight: 700 }}>
          Kinh phí & Thanh quyết toán Đề tài
        </Title>
        <Space>
          <Button icon={<WalletOutlined />} onClick={() => setQuotaDrawerOpen(true)}>
            Hạn mức từng Đề tài ({budgets.length})
          </Button>
          {canSubmitVoucher && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              disabled={eligibleBudgets.length === 0}
              onClick={() => {
                setSelectedBudgetId(eligibleBudgets[0]?.budgetId || null);
                form.setFieldsValue({ budgetId: eligibleBudgets[0]?.budgetId });
                setModalVisible(true);
              }}
            >
              Kê khai chứng từ quyết toán
            </Button>
          )}
        </Space>
      </div>

      {/* KHỐI THỐNG KÊ PASTEL 2 NHÓM CHUẨN S-LINK PTIT */}
      <Row gutter={[16, 16]} style={{ marginBottom: 14 }}>
        <Col xs={24} lg={13}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, border: '1px solid #F0F0F0' }}
            bodyStyle={{ padding: '14px 16px' }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: '#262626', marginBottom: 10 }}>
              Thống kê chứng từ quyết toán
            </div>
            <Row gutter={[10, 10]}>
              <Col xs={24} sm={8}>
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
                  <FileTextOutlined style={{ color: '#D48806', fontSize: 16 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#595959', fontWeight: 500 }}>Tổng chứng từ</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#262626', lineHeight: 1 }}>
                      {allSettlements.length}
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div
                  style={{
                    backgroundColor: '#F1FAEE',
                    borderRadius: 8,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 74,
                  }}
                >
                  <CheckCircleOutlined style={{ color: '#389E0D', fontSize: 16 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#595959', fontWeight: 500 }}>Đã giải ngân</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#389E0D', lineHeight: 1 }}>
                      {settledCount}
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div
                  style={{
                    backgroundColor: '#FFF1F0',
                    borderRadius: 8,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 74,
                  }}
                >
                  <ExclamationCircleOutlined style={{ color: '#C62828', fontSize: 16 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#595959', fontWeight: 500 }}>Chờ duyệt chi</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#C62828', lineHeight: 1 }}>
                      {pendingCount}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={11}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, border: '1px solid #F0F0F0', height: '100%' }}
            bodyStyle={{ padding: '14px 16px' }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: '#262626', marginBottom: 10 }}>
              {isStudent ? 'Thống kê kinh phí đề tài của bạn' : 'Thống kê kinh phí đề tài'}
            </div>
            <Row gutter={[10, 10]}>
              <Col xs={24} sm={12}>
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
                  <DollarOutlined style={{ color: '#389E0D', fontSize: 16 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#595959', fontWeight: 500 }}>Đã giải ngân</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#389E0D', lineHeight: 1 }}>
                      {totalSettled.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
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
                  <BankOutlined style={{ color: '#C62828', fontSize: 16 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#595959', fontWeight: 500 }}>Còn lại / Chưa chi</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#C62828', lineHeight: 1 }}>
                      {remainingAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* LƯU Ý NGHIỆP VỤ GỌN GÀNG NHƯ MẪU S-LINK */}
      <div style={{ marginBottom: 14, padding: '2px 4px', fontSize: 12.5, lineHeight: 1.65, color: '#434343' }}>
        <div style={{ fontStyle: 'italic', color: '#595959', marginBottom: 2 }}>Lưu ý:</div>
        <div>
          <span style={{ color: '#C62828', fontWeight: 700 }}>KHÔNG CHỈNH SỬA</span> hoặc tách chứng từ sau khi Phòng Tài chính - Kế toán đã phê duyệt giải ngân.
        </div>
        <div>
          - Quy trình 3 bước (DFD 6.6): Chủ nhiệm kê khai hóa đơn VAT → Khoa xác nhận hoàn thành sản phẩm → P.TCKT phê duyệt giải ngân.
        </div>
        <div>
          - Điều kiện giải ngân (Điều 5 QĐ 521): Đề tài phải có kết quả nghiệm thu <b>Đạt trở lên</b> trước khi P.TCKT giải ngân.
        </div>
      </div>

      {/* BẢNG KÊ CHỨNG TỪ KÈM THANH LỌC CHUẨN S-LINK */}
      <Card
        bordered={false}
        style={{ borderRadius: 10, border: '1px solid #F0F0F0' }}
        bodyStyle={{ padding: '14px 16px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <Segmented
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as any)}
            options={[
              { label: 'Tất cả chứng từ', value: 'ALL' },
              { label: 'Chờ Khoa xác nhận', value: 'WAIT_FACULTY' },
              { label: 'Chờ P.TCKT duyệt', value: 'WAIT_FINANCE' },
              { label: 'Đã giải ngân', value: 'SETTLED' },
            ]}
          />

          <Space wrap size={8}>
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Tìm theo: Mã chứng từ, Đề tài..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchBudgets} loading={loading}>
              Tải lại
            </Button>
            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 13,
                backgroundColor: '#FFFFFF',
                fontWeight: 500,
              }}
            >
              Tổng số: <b style={{ color: '#262626' }}>{filteredSettlements.length}</b>
            </div>
          </Space>
        </div>

        <Table
          loading={loading}
          dataSource={filteredSettlements}
          columns={settlementColumns}
          rowKey="settlementId"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có chứng từ quyết toán nào phù hợp' }}
        />
      </Card>

      {/* DRAWER XEM HẠN MỨC DỰ TOÁN TỪNG ĐỀ TÀI (KHÔNG LÀM RỐI KHÚC TRÊN) */}
      <Drawer
        title={`Theo dõi Hạn mức Dự toán & Giải ngân theo Đề tài (${budgets.length})`}
        open={quotaDrawerOpen}
        onClose={() => setQuotaDrawerOpen(false)}
        width={520}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {budgets.map((b) => {
            const approved = Number(b.approvedAmount || 0);
            const claimed = (b.settlements || []).reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0);
            const settled = (b.settlements || [])
              .filter((s: any) => Boolean(s.settledAt))
              .reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0);
            const pct = approved > 0 ? Math.min(100, Math.round((settled / approved) * 100)) : 0;
            const statusInfo = BUDGET_STATUS_MAP[b.status] || { label: b.status, color: 'default' };
            return (
              <Card key={b.budgetId} size="small" style={{ borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <a onClick={() => navigate(`/projects/${b.projectId}`)} style={{ fontWeight: 700, color: '#C62828' }}>
                    {b.projectId}
                  </a>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <div style={{ fontSize: 12, color: '#595959', marginBottom: 6 }}>
                  Dự toán duyệt: <b>{approved.toLocaleString('vi-VN')}đ</b> • Đã giải ngân: <b>{settled.toLocaleString('vi-VN')}đ</b>
                </div>
                <Progress percent={pct} size="small" status={pct === 100 ? 'success' : 'active'} />
                {canSubmitVoucher && approved > 0 && b.project?.status !== 'REJECTED' && b.status !== 'SETTLED' && claimed < approved && (
                  <Button
                    size="small"
                    type="link"
                    style={{ padding: 0, marginTop: 4 }}
                    onClick={() => {
                      setQuotaDrawerOpen(false);
                      openAddSettlement(b.budgetId);
                    }}
                  >
                    + Kê khai chứng từ cho đề tài này
                  </Button>
                )}
              </Card>
            );
          })}
        </Space>
      </Drawer>

      <Modal
        title="Kê khai Chứng từ Thanh quyết toán Kinh phí NCKH"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Gửi chứng từ chờ Khoa xác nhận"
        okButtonProps={{ style: { backgroundColor: '#C62828', borderColor: '#C62828' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddSettlement}>
          <Form.Item
            name="budgetId"
            label="Đề tài được cấp dự toán"
            rules={[{ required: true, message: 'Vui lòng chọn đề tài' }]}
            initialValue={selectedBudgetId}
          >
            <Select placeholder="Chọn đề tài">
              {eligibleBudgets.map((b) => (
                <Select.Option key={b.budgetId} value={b.budgetId}>
                  {b.projectId} — Hạn mức {Number(b.approvedAmount).toLocaleString('vi-VN')}đ
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="voucherNo" label="Số chứng từ (PT/PC)" rules={[{ required: true, message: 'Nhập số chứng từ' }]}>
                <Input placeholder="PC-2027-015" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="invoiceNo" label="Số hóa đơn VAT">
                <Input placeholder="VAT-0008123" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="category" label="Hạng mục chi" initialValue="Chi phí xuất bản bài báo / hội thảo">
            <Select>
              <Select.Option value="Chi phí nguyên vật liệu, thiết bị thực nghiệm">Chi phí nguyên vật liệu, thiết bị thực nghiệm</Select.Option>
              <Select.Option value="Chi phí thuê dịch vụ Cloud / API / Khảo sát">Chi phí thuê dịch vụ Cloud / API / Khảo sát</Select.Option>
              <Select.Option value="Chi phí xuất bản bài báo / hội thảo">Chi phí xuất bản bài báo / hội thảo</Select.Option>
              <Select.Option value="Chi phí văn phòng phẩm & in ấn đóng quyển">Chi phí văn phòng phẩm & in ấn đóng quyển</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="supplier" label="Đơn vị xuất hóa đơn / Nhà cung cấp">
            <Input placeholder="Công ty CP Dịch vụ Công nghệ..." />
          </Form.Item>
          <Form.Item name="amount" label="Số tiền đề nghị thanh toán (VNĐ)" rules={[{ required: true, message: 'Nhập số tiền' }]}>
            <InputNumber style={{ width: '100%' }} min={10000} step={50000} />
          </Form.Item>
          <Form.Item name="description" label="Diễn giải chi tiết" rules={[{ required: true, message: 'Nhập diễn giải' }]}>
            <Input.TextArea rows={2} placeholder="Mô tả nội dung phục vụ đề tài..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
