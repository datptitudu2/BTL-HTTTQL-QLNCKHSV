import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Alert,
  Row,
  Col,
  Modal,
  Tooltip,
  Form,
  Input,
  InputNumber,
  Statistic,
  message,
} from 'antd';
import {
  TrophyOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  UserOutlined,
  SolutionOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  FileDoneOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PtitCertificate } from '../components/qd521/PtitCertificate';
import { printElement } from '../utils/printHelper';

const { Title, Text } = Typography;

export const AwardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';
  const isCTSV = roleCode === 'STUDENT_AFFAIRS' || roleCode === 'ADMIN';

  const [certModalVisible, setCertModalVisible] = useState(false);
  const [selectedAward, setSelectedAward] = useState<any>(null);

  // Modal phê duyệt cộng điểm & quyền lợi của Phòng CT&CTSV
  const [bonusModalVisible, setBonusModalVisible] = useState(false);
  const [selectedForBonus, setSelectedForBonus] = useState<any>(null);
  const [form] = Form.useForm();

  // Danh mục đề tài khen thưởng & quyền lợi theo Điều 15 QĐ 521
  const [awardsList, setAwardsList] = useState<any[]>([
    {
      id: 1,
      projectCode: '32-SV-2025-RIPT',
      title: 'Nghiên cứu, xây dựng mô hình xác thực 2FA ứng dụng RFID và vi điều khiển ESP32',
      leader: 'NGUYỄN TIẾN ĐẠT (D23CCHT01)',
      studentName: 'NGUYỄN TIẾN ĐẠT',
      studentId: 'B23DCQT088',
      studentClass: 'D23CCHT01',
      department: 'Viện Khoa học Kỹ thuật Bưu điện',
      academicYear: '2025',
      decisionNo: '1842/QĐ-HV',
      issueDate: 'ngày 24 tháng 6 năm 2026',
      certificateNo: '32-SV-2025-RIPT',
      certNo: '32-SV-2025-RIPT',
      advisor: 'TS. Vũ Trọng Hùng',
      score: 82.5,
      result: 'Khá',
      awardType: 'Chứng nhận Hoàn thành NCKH Sinh viên (Xếp loại Khá)',
      studentBonus: '+5 điểm rèn luyện (CTSV) • Tích lũy 3 tín chỉ NCKH',
      advisorHours: '20 giờ chuẩn NCKH • Hoàn thành nhiệm vụ hướng dẫn',
      tagColor: 'blue',
      // Trạng thái phê duyệt của Phòng CT&CTSV
      bonusStatus: 'APPROVED',
      drlPoints: 5,
      gpaBonus: 0,
      creditBonus: 3,
      approvedBy: 'ThS. Bùi Văn Toàn (Phòng CT&CTSV)',
      approvedDate: '26/06/2026',
      decisionNotice: 'TB-CTSV/2026-14',
    },
    {
      id: 2,
      projectCode: 'SV-2026-CNTT1-001',
      title: 'Hệ thống Quản lý Đề tài NCKH Sinh viên Học viện PTIT (SRMS)',
      leader: 'NGUYỄN VĂN AN (D23CQCN01-B)',
      studentName: 'NGUYỄN VĂN AN',
      studentId: 'B23DCCN001',
      studentClass: 'D23CQCN01-B',
      department: 'Khoa Công nghệ thông tin 1',
      academicYear: '2026',
      decisionNo: '521/QĐ-HV',
      issueDate: 'ngày 05 tháng 5 năm 2027',
      certificateNo: 'GCN-NCKH-2027-001',
      certNo: 'GCN-NCKH-2027-001',
      advisor: 'TS. Ngô Quốc Dũng',
      score: 93.8,
      result: 'Xuất sắc',
      awardType: 'Giải Nhất cấp Học viện & Đề cử Giải thưởng cấp Bộ',
      studentBonus: '+0.4 điểm TBC xét học bổng • +20 điểm rèn luyện (CTSV)',
      advisorHours: '30 giờ chuẩn NCKH • Ưu tiên xét danh hiệu thi đua (Điều 16)',
      tagColor: 'gold',
      bonusStatus: 'PENDING', // Đang chờ Phòng CT&CTSV duyệt cộng điểm
      drlPoints: 20,
      gpaBonus: 0.4,
      creditBonus: 3,
      approvedBy: null,
      approvedDate: null,
      decisionNotice: null,
    },
    {
      id: 3,
      projectCode: 'SV-2026-CNTT1-004',
      title: 'PHƯƠNG PHÁP TIỀN XỬ LÝ VÀ TRÍCH XUẤT ĐẶC TRƯNG TỪ DỮ LIỆU POS',
      leader: 'KIM NGỌC BÁCH (D23CQCN01-B)',
      studentName: 'KIM NGỌC BÁCH',
      studentId: 'B23DCCN088',
      studentClass: 'D23CQCN01-B',
      department: 'Khoa Công nghệ thông tin 1',
      academicYear: '2026',
      decisionNo: '521/QĐ-HV',
      issueDate: 'ngày 05 tháng 5 năm 2027',
      certificateNo: 'GCN-NCKH-2027-004',
      certNo: 'GCN-NCKH-2027-004',
      advisor: 'PGS.TS. Hoàng Minh',
      score: 88.5,
      result: 'Tốt (Giải Nhì)',
      awardType: 'Giải Nhì cấp Học viện',
      studentBonus: '+0.2 điểm TBC xét học bổng • +15 điểm rèn luyện (CTSV)',
      advisorHours: '25 giờ chuẩn NCKH • Đạt định mức NCKH',
      tagColor: 'cyan',
      bonusStatus: 'APPROVED',
      drlPoints: 15,
      gpaBonus: 0.2,
      creditBonus: 3,
      approvedBy: 'ThS. Bùi Văn Toàn (Phòng CT&CTSV)',
      approvedDate: '06/05/2027',
      decisionNotice: 'TB-CTSV/2027-08',
    },
  ]);

  const handleOpenCert = (record: any) => {
    setSelectedAward(record);
    setCertModalVisible(true);
  };

  // Mở modal duyệt cộng điểm dành riêng cho Phòng CT&CTSV
  const handleOpenBonusModal = (record: any) => {
    setSelectedForBonus(record);
    form.setFieldsValue({
      drlPoints: record.drlPoints || 20,
      gpaBonus: record.gpaBonus || 0.4,
      creditBonus: record.creditBonus || 3,
      semester: 'Học kỳ 2 năm học 2026 - 2027',
      noticeNo: record.decisionNotice || 'TB-CTSV-DRL-2027/02',
      note: `Phòng CT&CTSV phê duyệt cộng điểm theo Điều 15 QĐ 521 cho sinh viên ${record.studentName} đạt kết quả ${record.result}.`,
    });
    setBonusModalVisible(true);
  };

  // Xử lý phê duyệt cộng điểm của Phòng CT&CTSV
  const handleApproveBonus = (values: any) => {
    if (!selectedForBonus) return;
    const approverName = user?.fullName || 'ThS. Bùi Văn Toàn (Phòng CT&CTSV)';
    const todayStr = new Date().toLocaleDateString('vi-VN');

    setAwardsList((prev) =>
      prev.map((item) =>
        item.id === selectedForBonus.id
          ? {
              ...item,
              bonusStatus: 'APPROVED',
              drlPoints: values.drlPoints,
              gpaBonus: values.gpaBonus,
              creditBonus: values.creditBonus,
              approvedBy: approverName,
              approvedDate: todayStr,
              decisionNotice: values.noticeNo,
            }
          : item,
      ),
    );

    message.success(
      `Phòng CT&CTSV đã phê duyệt và đồng bộ +${values.drlPoints} Điểm rèn luyện, +${values.gpaBonus} điểm TBC vào hồ sơ sinh viên ${selectedForBonus.studentName} trên Cổng S-Link thành công!`,
    );
    setBonusModalVisible(false);
    setSelectedForBonus(null);
  };

  // Phê duyệt hàng loạt toàn bộ hồ sơ đang chờ
  const handleBatchApprove = () => {
    const pendingCount = awardsList.filter((a) => a.bonusStatus === 'PENDING').length;
    if (pendingCount === 0) {
      message.info('Không có hồ sơ nào đang chờ duyệt cộng điểm!');
      return;
    }
    const approverName = user?.fullName || 'ThS. Bùi Văn Toàn (Phòng CT&CTSV)';
    const todayStr = new Date().toLocaleDateString('vi-VN');

    setAwardsList((prev) =>
      prev.map((item) =>
        item.bonusStatus === 'PENDING'
          ? {
              ...item,
              bonusStatus: 'APPROVED',
              approvedBy: approverName,
              approvedDate: todayStr,
              decisionNotice: 'TB-CTSV-BATCH-2027/01',
            }
          : item,
      ),
    );
    message.success(`Phòng CT&CTSV đã duyệt và ghi nhận cộng điểm thành công cho toàn bộ ${pendingCount} đề tài!`);
  };

  const handleExportList = () => {
    message.loading('Đang trích xuất danh sách sinh viên được cộng điểm rèn luyện & xét học bổng...');
    setTimeout(() => {
      message.success('Xuất danh sách thành công! Tệp Danh_sach_cong_DRL_NCKH_2027.xlsx đã sẵn sàng.');
    }, 700);
  };

  const pendingBonusCount = awardsList.filter((a) => a.bonusStatus === 'PENDING').length;
  const approvedBonusCount = awardsList.filter((a) => a.bonusStatus === 'APPROVED').length;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* TIÊU ĐỀ & NÚT THAO TÁC HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
            Khen thưởng & Quyền lợi Nghiên cứu Khoa học (Điều 15 & 16 QĐ 521)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Công nhận giải thưởng xuất sắc (Mẫu 5), cấp Giấy chứng nhận điện tử tra cứu QR và quy đổi quyền lợi điểm học tập cho sinh viên cùng giờ chuẩn cho giảng viên.
          </Text>
        </div>

        <Space wrap>
          {isCTSV && pendingBonusCount > 0 && (
            <Button
              type="primary"
              style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontWeight: 600 }}
              icon={<CheckCircleOutlined />}
              onClick={handleBatchApprove}
            >
              Duyệt cộng điểm toàn bộ ({pendingBonusCount})
            </Button>
          )}

          {isCTSV && (
            <Button icon={<ExportOutlined />} onClick={handleExportList}>
              Xuất DS gửi Hội đồng ĐRL & Học bổng
            </Button>
          )}

          <Button
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            onClick={() => navigate('/forms')}
          >
            Xem Công văn Khen thưởng (Mẫu 5)
          </Button>
        </Space>
      </div>

      {/* THÔNG BÁO VAI TRÒ CHUYÊN BIỆT CHO PHÒNG CT&CTSV */}
      <Alert
        message={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span>
              <b>Cổng dịch vụ Phòng Chính trị & Công tác Sinh viên (P.CT&CTSV):</b> Bạn đang đăng nhập với vai trò{' '}
              <Tag color="cyan" style={{ fontWeight: 600 }}>{user?.roleName || 'Phòng CT&CTSV'}</Tag>
              {isCTSV
                ? '• Có thẩm quyền thẩm định kết quả nghiệm thu, phê duyệt cộng Điểm rèn luyện (Mục 4 S-Link) và xác nhận điểm thưởng xét học bổng khuyến khích cho sinh viên NCKH theo Điều 15 QĐ 521/QĐ-HV.'
                : '• Theo dõi quyền lợi cộng điểm rèn luyện, điểm thưởng TBC và tra cứu Giấy chứng nhận số hóa có mã QR.'}
            </span>
          </div>
        }
        type={isCTSV ? 'info' : 'success'}
        showIcon
        style={{ marginBottom: 20, borderRadius: 8 }}
      />

      {/* 4 THẺ CHỈ SỐ THỐNG KÊ QUYỀN LỢI NCKH DÀNH CHO PHÒNG CTSV */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #1890FF' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Tổng đề tài được khen thưởng</span>}
              value={awardsList.length}
              suffix="đề tài"
              valueStyle={{ color: '#1890FF', fontWeight: 800, fontSize: 22 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>Quyết định 1842/QĐ-HV & 521/QĐ-HV</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #52C41A' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Đã duyệt cộng Điểm rèn luyện</span>}
              value={approvedBonusCount}
              suffix="đề tài"
              valueStyle={{ color: '#52C41A', fontWeight: 800, fontSize: 22 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>Đã đồng bộ lên Cổng S-Link sinh viên</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #FA8C16' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Hồ sơ chờ P.CTSV phê duyệt</span>}
              value={pendingBonusCount}
              suffix="hồ sơ"
              valueStyle={{ color: '#FA8C16', fontWeight: 800, fontSize: 22 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              {pendingBonusCount > 0 ? 'Cần duyệt để sinh viên kịp xét học bổng' : 'Toàn bộ hồ sơ đã được xử lý'}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #C62828' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Ưu tiên xét Học bổng khuyến khích</span>}
              value={awardsList.filter((a) => a.score >= 85).length}
              suffix="sinh viên"
              valueStyle={{ color: '#C62828', fontWeight: 800, fontSize: 22 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>Đạt giải Nhất, Nhì cấp Học viện</div>
          </div>
        </Col>
      </Row>

      {/* BẢNG DANH MỤC ĐỀ TÀI & QUYỀN LỢI ĐIỂM THƯỞNG */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              Danh mục đề tài được công nhận giải thưởng & Phê duyệt quyền lợi sinh viên (Điều 15 QĐ 521)
            </span>
          </div>
        }
        style={{ borderRadius: 8 }}
      >
        <Table
          rowKey="id"
          dataSource={awardsList}
          pagination={false}
          columns={[
            {
              title: 'Mã & Tên đề tài',
              key: 'topic',
              render: (_, r) => (
                <div>
                  <div style={{ fontWeight: 700, color: '#262626', fontSize: 14 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 3 }}>
                    Mã đề tài: <b style={{ color: '#C62828' }}>{r.projectCode}</b> • Khoa/Viện: <b>{r.department}</b> • Điểm: <b style={{ color: '#1890FF' }}>{r.score}đ</b>
                  </div>
                </div>
              ),
            },
            {
              title: 'Chủ trì & Người hướng dẫn',
              key: 'people',
              width: 220,
              render: (_, r) => (
                <div style={{ fontSize: 13 }}>
                  <div><b>SV:</b> {r.leader}</div>
                  <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}><b>GVHD:</b> {r.advisor}</div>
                </div>
              ),
            },
            {
              title: 'Danh hiệu khen thưởng',
              dataIndex: 'awardType',
              key: 'awardType',
              width: 230,
              render: (v, r) => (
                <Tag color={r.tagColor} style={{ fontSize: 12, padding: '4px 10px', fontWeight: 600 }}>
                  <TrophyOutlined style={{ marginRight: 4 }} /> {v}
                </Tag>
              ),
            },
            {
              title: 'Quyền lợi theo Điều 15 QĐ 521',
              key: 'benefits',
              width: 260,
              render: (_, r) => (
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <div><UserOutlined style={{ color: '#1890FF', marginRight: 4 }} /> <b>Sinh viên:</b> {r.studentBonus}</div>
                  <div style={{ color: '#595959', marginTop: 2 }}><SolutionOutlined style={{ color: '#52C41A', marginRight: 4 }} /> <b>GVHD:</b> {r.advisorHours}</div>
                </div>
              ),
            },
            {
              title: 'Trạng thái CTSV duyệt điểm',
              key: 'bonusStatus',
              width: 210,
              align: 'center',
              render: (_, r) => (
                <div>
                  {r.bonusStatus === 'APPROVED' ? (
                    <div>
                      <Tag color="green" style={{ fontWeight: 600, fontSize: 11, padding: '2px 8px' }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        Đã duyệt cộng ĐRL
                      </Tag>
                      <div style={{ fontSize: 11, color: '#52C41A', marginTop: 4, fontWeight: 500 }}>
                        +{r.drlPoints} ĐRL • +{r.gpaBonus} điểm TBC
                      </div>
                      <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>
                        {r.approvedBy} ({r.approvedDate})
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Tag color="orange" style={{ fontWeight: 600, fontSize: 11, padding: '2px 8px' }}>
                        Chờ P.CTSV duyệt điểm
                      </Tag>
                      <div style={{ fontSize: 11, color: '#D48806', marginTop: 4 }}>
                        Dự kiến: +{r.drlPoints} ĐRL • +{r.gpaBonus} TBC
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: 'Thao tác số hóa',
              key: 'actions',
              width: 220,
              align: 'center',
              render: (_, r) => (
                <Space size={6} wrap>
                  <Tooltip title="Xem Giấy chứng nhận NCKH điện tử chuẩn của Giám đốc Học viện">
                    <Button
                      size="small"
                      type="primary"
                      icon={<QrcodeOutlined />}
                      style={{ backgroundColor: '#1890FF', borderColor: '#1890FF', fontSize: 11 }}
                      onClick={() => handleOpenCert(r)}
                    >
                      GCN QR
                    </Button>
                  </Tooltip>

                  {/* NÚT THAO TÁC DUYỆT CỘNG ĐIỂM DÀNH RIÊNG CHO PHÒNG CT&CTSV */}
                  {isCTSV && r.bonusStatus === 'PENDING' && (
                    <Tooltip title="Phòng CT&CTSV phê duyệt cộng Điểm rèn luyện & Điểm thưởng xét học bổng theo Điều 15 QĐ 521">
                      <Button
                        size="small"
                        type="primary"
                        style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontWeight: 600, fontSize: 11 }}
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleOpenBonusModal(r)}
                      >
                        Duyệt cộng điểm
                      </Button>
                    </Tooltip>
                  )}

                  {isCTSV && r.bonusStatus === 'APPROVED' && (
                    <Tooltip title="Chỉnh sửa hoặc cập nhật lại quyết định cộng điểm">
                      <Button
                        size="small"
                        style={{ fontSize: 11, borderColor: '#52C41A', color: '#52C41A' }}
                        icon={<FileDoneOutlined />}
                        onClick={() => handleOpenBonusModal(r)}
                      >
                        Sửa mức điểm
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* MODAL PHÊ DUYỆT CỘNG ĐIỂM RÈN LUYỆN & HỌC BỔNG - PHÒNG CT&CTSV */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: '#52C41A', fontSize: 18 }} />
            <span>Phê duyệt Quyền lợi Điểm rèn luyện & Học bổng Sinh viên NCKH (P.CT&CTSV)</span>
          </div>
        }
        open={bonusModalVisible}
        onCancel={() => setBonusModalVisible(false)}
        footer={null}
        width={620}
      >
        {selectedForBonus && (
          <Form form={form} layout="vertical" onFinish={handleApproveBonus}>
            <div
              style={{
                backgroundColor: '#F6FFED',
                border: '1px solid #B7EB8F',
                borderRadius: 6,
                padding: '12px 16px',
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              <div>
                Sinh viên thụ hưởng: <b>{selectedForBonus.studentName}</b> ({selectedForBonus.studentClass})
              </div>
              <div style={{ marginTop: 3 }}>
                Đề tài: <b>{selectedForBonus.projectCode}</b> - {selectedForBonus.title}
              </div>
              <div style={{ marginTop: 3 }}>
                Kết quả nghiệm thu: <Tag color="gold" style={{ fontWeight: 700 }}>{selectedForBonus.result} ({selectedForBonus.score} điểm)</Tag> • Danh hiệu: <b>{selectedForBonus.awardType}</b>
              </div>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="drlPoints"
                  label={<b>Điểm rèn luyện cộng vào S-Link (Mục 4)</b>}
                  rules={[{ required: true, message: 'Nhập điểm rèn luyện' }]}
                >
                  <InputNumber min={0} max={30} style={{ width: '100%' }} suffix="điểm ĐRL" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="gpaBonus"
                  label={<b>Điểm thưởng TBC xét học bổng KKHT</b>}
                  rules={[{ required: true, message: 'Nhập điểm thưởng TBC' }]}
                >
                  <InputNumber min={0} max={1} step={0.05} style={{ width: '100%' }} suffix="điểm TBC" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="creditBonus" label="Tín chỉ NCKH được miễn / tích lũy">
                  <InputNumber min={0} max={6} style={{ width: '100%' }} suffix="tín chỉ" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="semester" label="Kỳ học áp dụng quyền lợi">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="noticeNo"
              label="Số Thông báo / Quyết định duyệt của Phòng CT&CTSV"
              rules={[{ required: true, message: 'Nhập số thông báo' }]}
            >
              <Input placeholder="Ví dụ: TB-CTSV-DRL-2027/02" />
            </Form.Item>

            <Form.Item name="note" label="Ghi chú phê duyệt">
              <Input.TextArea rows={2} />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Button onClick={() => setBonusModalVisible(false)}>Hủy bỏ</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontWeight: 600 }}
                icon={<CheckCircleOutlined />}
              >
                Xác nhận & Đồng bộ Cổng S-Link
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* MODAL GIẤY CHỨNG NHẬN ĐIỆN TỬ TRA CỨU QR CHUẨN XÁC 100% THEO ẢNH BẠN GỬI */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: '#C62828', fontSize: 18 }} />
            <span>Giấy Chứng Nhận NCKH Sinh viên Học viện PTIT (Có Mã QR & Dấu Mộc Đỏ)</span>
          </div>
        }
        open={certModalVisible}
        onCancel={() => setCertModalVisible(false)}
        width={960}
        footer={[
          <Button key="close" onClick={() => setCertModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="verify"
            icon={<GlobalOutlined />}
            onClick={() => {
              window.open(
                `/verify-cert?code=${encodeURIComponent(selectedAward?.certNo || '')}&student=${encodeURIComponent(
                  selectedAward?.studentName || '',
                )}&decision=${encodeURIComponent(selectedAward?.decisionNo || '')}&result=${encodeURIComponent(
                  selectedAward?.result || '',
                )}`,
                '_blank',
              );
            }}
          >
            Trang Tra cứu QR Trực tuyến
          </Button>,
          <Button
            key="print"
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            icon={<PrinterOutlined />}
            onClick={() => printElement('printable-ptit-certificate', `Giay_Chung_Nhan_${selectedAward?.certNo}`)}
          >
            In Giấy chứng nhận A4
          </Button>,
        ]}
      >
        {selectedAward && (
          <div>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#595959' }}>
                Mẫu giấy chứng nhận chuẩn theo mẫu phôi in ấn thực tế của Học viện PTIT. Mã QR nhỏ gọn ở góc trái dùng camera điện thoại quét trực tiếp để kiểm tra tính hợp lệ.
              </span>
            </div>

            <PtitCertificate
              studentName={selectedAward.studentName}
              studentClass={selectedAward.studentClass}
              department={selectedAward.department}
              projectTitle={selectedAward.title}
              projectCode={selectedAward.projectCode}
              academicYear={selectedAward.academicYear}
              result={selectedAward.result}
              decisionNo={selectedAward.decisionNo}
              issueDate={selectedAward.issueDate}
              certNo={selectedAward.certNo}
              signatoryTitle="GIÁM ĐỐC"
              signatoryName="PGS.TS. Đặng Hoài Bắc"
              printableId="printable-ptit-certificate"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
