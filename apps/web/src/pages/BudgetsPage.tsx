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
  Statistic,
  Progress,
  message,
  Tooltip,
  Collapse,
} from 'antd';
import {
  DollarOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  ReloadOutlined,
  BankOutlined,
  WarningOutlined,
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
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const isFacultyStaff = ['FACULTY_SECRETARY', 'FACULTY_LEADER', 'QLKHCN', 'ADMIN'].includes(roleCode);
  const isFinance = ['FINANCE', 'ADMIN'].includes(roleCode);
  const canSubmitVoucher = ['STUDENT', 'FACULTY_SECRETARY', 'ADMIN'].includes(roleCode);

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
  const totalSettled = allSettlements
    .filter((s) => Boolean(s.settledAt))
    .reduce((s, x) => s + Number(x.amount || 0), 0);
  const pendingCount = allSettlements.filter((s) => !s.settledAt).length;

  const eligibleBudgets = budgets.filter((b) => Number(b.approvedAmount || 0) > 0 && b.project?.status !== 'REJECTED');

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
              Đã nghiệm thu ({r.project.acceptance.grade})
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#262626', fontWeight: 700 }}>
            Quản lý Kinh phí & Thanh quyết toán Đề tài (Điều 5 QĐ 521)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quy trình DFD 6.6: (1) Chủ nhiệm kê khai hóa đơn → (2) Thư ký/Trưởng Khoa xác nhận hoàn thành sản phẩm → (3) P.TCKT phê duyệt giải ngân sau Nghiệm thu.
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchBudgets} loading={loading}>
            Làm mới
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

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #1890FF' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Tổng dự toán được cấp (VNĐ)</span>}
              value={totalApproved}
              suffix="đ"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890FF', fontWeight: 800, fontSize: 22 }}
            />
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #52C41A' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Đã giải ngân thực tế (VNĐ)</span>}
              value={totalSettled}
              suffix="đ"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52C41A', fontWeight: 800, fontSize: 22 }}
            />
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #FA8C16' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Chứng từ chờ xử lý</span>}
              value={pendingCount}
              prefix={<FileDoneOutlined />}
              valueStyle={{ color: '#FA8C16', fontWeight: 800, fontSize: 22 }}
            />
          </div>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8 }}>
        <Collapse
          ghost
          items={[
            {
              key: 'budgets-summary',
              label: <Text strong>Theo dõi Hạn mức Dự toán & Tỷ lệ giải ngân từng Đề tài ({budgets.length} đề tài)</Text>,
              children: (
                <Row gutter={[12, 12]}>
                  {budgets.map((b) => {
                    const approved = Number(b.approvedAmount || 0);
                    const settled = (b.settlements || [])
                      .filter((s: any) => Boolean(s.settledAt))
                      .reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0);
                    const pct = approved > 0 ? Math.min(100, Math.round((settled / approved) * 100)) : 0;
                    return (
                      <Col xs={24} md={12} key={b.budgetId}>
                        <Card size="small" style={{ borderRadius: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <a onClick={() => navigate(`/projects/${b.projectId}`)} style={{ fontWeight: 700, color: '#C62828' }}>
                              {b.projectId}
                            </a>
                            <Tag color={b.status === 'SETTLED' ? 'green' : approved > 0 ? 'blue' : 'default'}>
                              {b.status}
                            </Tag>
                          </div>
                          <div style={{ fontSize: 12, color: '#595959', marginBottom: 6 }}>
                            Được duyệt: <b>{approved.toLocaleString('vi-VN')}đ</b> • Đã giải ngân: <b>{settled.toLocaleString('vi-VN')}đ</b>
                          </div>
                          <Progress percent={pct} size="small" status={pct === 100 ? 'success' : 'active'} />
                          {canSubmitVoucher && approved > 0 && (
                            <Button size="small" type="link" style={{ padding: 0, marginTop: 4 }} onClick={() => openAddSettlement(b.budgetId)}>
                              + Kê khai chứng từ cho đề tài này
                            </Button>
                          )}
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ),
            },
          ]}
        />
      </Card>

      <Card title="Bảng kê Chứng từ Thanh quyết toán (D7)" bordered={false} style={{ borderRadius: 8 }}>
        <Table
          loading={loading}
          dataSource={allSettlements}
          columns={settlementColumns}
          rowKey="settlementId"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có chứng từ quyết toán nào được kê khai' }}
        />
      </Card>

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
