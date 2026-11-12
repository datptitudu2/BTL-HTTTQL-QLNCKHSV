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
  Statistic,
  Modal,
  message,
  Input,
  Select,
  Tooltip,
  Form,
  Upload,
} from 'antd';
import {
  FileDoneOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  EyeOutlined,
  PrinterOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { printElement } from '../utils/printHelper';

const { Title, Text, Paragraph } = Typography;

export const BudgetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';
  const isFinance = roleCode === 'FINANCE' || roleCode === 'ADMIN';
  const isQLKH = roleCode === 'QLKHCN' || roleCode === 'ADMIN';

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState<boolean>(false);
  const [newVoucherModalVisible, setNewVoucherModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  // Danh mục chứng từ số hoá chuẩn quy trình 2 bước liên thông Điều 5 QĐ 521/QĐ-HV
  const [vouchers, setVouchers] = useState<any[]>([
    {
      id: 1,
      voucherNo: 'PC-2027-001',
      invoiceNo: 'HD-VAT-89210',
      projectCode: 'SV-2026-CNTT1-001',
      projectTitle: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
      faculty: 'Khoa Công nghệ thông tin 1',
      leader: 'Nguyễn Văn An (B23DCCN001)',
      advisor: 'TS. Ngô Quốc Dũng',
      category: 'Mua linh kiện, vật tư tiêu hao',
      title: 'Mua linh kiện vi điều khiển STM32, ESP32 và mạch cảm biến IoT phục vụ kiểm thử',
      supplier: 'Công ty TNHH Giải pháp Công nghệ Điện tử Thông minh',
      amount: 2500000,
      submittedDate: '10/01/2027',
      // Bước 1: QLKHCN xác nhận điều kiện nghiệm thu theo Điều 5.2.b QĐ 521
      academicClearance: 'CLEARED',
      academicNote: 'QLKHCN xác nhận: Đề tài nghiệm thu Xuất sắc (93.8đ)',
      academicOfficer: 'ThS. Phạm Văn Hùng (P.QLKH&CN)',
      academicDate: '29/04/2027',
      // Bước 2: P.TCKT thẩm tra hóa đơn VAT và giải ngân
      status: 'PENDING',
      statusText: 'P.TCKT chờ duyệt chi',
      statusColor: 'orange',
      approvedBy: null,
      approvedDate: null,
    },
    {
      id: 2,
      voucherNo: 'PC-2027-002',
      invoiceNo: 'INV-CLOUD-2027-44',
      projectCode: 'SV-2026-CNTT1-001',
      projectTitle: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
      faculty: 'Khoa Công nghệ thông tin 1',
      leader: 'Nguyễn Văn An (B23DCCN001)',
      advisor: 'TS. Ngô Quốc Dũng',
      category: 'Dịch vụ thuê máy chủ, phần mềm',
      title: 'Thuê cụm máy chủ Cloud Server (2 vCPU, 4GB RAM) & duy trì tên miền 12 tháng',
      supplier: 'Công ty Cổ phần Hạ tầng Dữ liệu Viễn thông NetHost',
      amount: 1500000,
      submittedDate: '22/02/2027',
      academicClearance: 'CLEARED',
      academicNote: 'QLKHCN xác nhận: Đề tài nghiệm thu Xuất sắc (93.8đ)',
      academicOfficer: 'ThS. Phạm Văn Hùng (P.QLKH&CN)',
      academicDate: '29/04/2027',
      status: 'APPROVED',
      statusText: 'Đã duyệt chi & Giải ngân',
      statusColor: 'green',
      approvedBy: 'CN. Lê Thị Mai (P.TCKT)',
      approvedDate: '24/02/2027',
    },
    {
      id: 3,
      voucherNo: 'PC-2027-003',
      invoiceNo: 'HD-IN-6628',
      projectCode: 'SV-2026-CNTT1-001',
      projectTitle: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
      faculty: 'Khoa Công nghệ thông tin 1',
      leader: 'Nguyễn Văn An (B23DCCN001)',
      advisor: 'TS. Ngô Quốc Dũng',
      category: 'In ấn kỷ yếu & Báo cáo',
      title: 'In ấn 06 cuốn báo cáo tổng kết bìa cứng nhũ vàng Mẫu 3.2 và ghi 05 đĩa CD sản phẩm',
      supplier: 'Trung tâm Dịch vụ In ấn & Chế bản Tài liệu PTIT',
      amount: 1000000,
      submittedDate: '25/04/2027',
      academicClearance: 'PENDING',
      academicNote: 'Chờ P.QLKHCN xác nhận kết quả nghiệm thu chính thức',
      academicOfficer: null,
      academicDate: null,
      status: 'PENDING',
      statusText: 'Chờ QLKHCN xác nhận',
      statusColor: 'orange',
      approvedBy: null,
      approvedDate: null,
    },
    {
      id: 4,
      voucherNo: 'PC-2027-004',
      invoiceNo: 'HD-VAT-33921',
      projectCode: 'SV-2026-CNTT1-004',
      projectTitle: 'Phương pháp tiền xử lý và trích xuất đặc trưng từ dữ liệu POS',
      faculty: 'Khoa Công nghệ thông tin 1',
      leader: 'Kim Ngọc Bách (B23DCCN088)',
      advisor: 'TS. Ngô Quốc Dũng',
      category: 'Mua tập dữ liệu bản quyền',
      title: 'Thu thập và gán nhãn tập dữ liệu giao dịch bán lẻ POS chuỗi siêu thị phục vụ huấn luyện',
      supplier: 'Viện Công nghệ Dữ liệu & AI Ứng dụng',
      amount: 3000000,
      submittedDate: '15/03/2027',
      academicClearance: 'CLEARED',
      academicNote: 'QLKHCN xác nhận: Đề tài nghiệm thu Tốt (86.5đ)',
      academicOfficer: 'ThS. Phạm Văn Hùng (P.QLKH&CN)',
      academicDate: '20/03/2027',
      status: 'APPROVED',
      statusText: 'Đã duyệt chi & Giải ngân',
      statusColor: 'green',
      approvedBy: 'CN. Lê Thị Mai (P.TCKT)',
      approvedDate: '22/03/2027',
    },
    {
      id: 5,
      voucherNo: 'PC-2027-005',
      invoiceNo: 'HD-AR-5512',
      projectCode: 'SV-2026-CNTT1-002',
      projectTitle: 'Mobile AR Apps and Impulse Buying: Perspectives from Indonesian Consumers',
      faculty: 'Khoa Đa phương tiện',
      leader: 'Nguyễn Minh Tuấn (B23DCDT015)',
      advisor: 'TS. Trần Đình Trí',
      category: 'Dịch vụ khảo sát dữ liệu số',
      title: 'Chi phí khảo sát người dùng AR di động và bản quyền phần mềm phân tích SPSS/Amos',
      supplier: 'Trung tâm Nghiên cứu Truyền thông Số PTIT',
      amount: 2800000,
      submittedDate: '12/04/2027',
      academicClearance: 'CLEARED',
      academicNote: 'QLKHCN xác nhận: Đề tài đã bảo vệ đạt yêu cầu cấp Khoa',
      academicOfficer: 'ThS. Phạm Văn Hùng (P.QLKH&CN)',
      academicDate: '15/04/2027',
      status: 'PENDING',
      statusText: 'P.TCKT chờ duyệt chi',
      statusColor: 'orange',
      approvedBy: null,
      approvedDate: null,
    },
    {
      id: 6,
      voucherNo: 'PC-2027-006',
      invoiceNo: 'HD-SEC-9901',
      projectCode: 'SV-2026-CNTT1-005',
      projectTitle: 'Phát hiện tấn công lỗ hổng bảo mật Zero-day trong hệ sinh thái IoT',
      faculty: 'Khoa An toàn thông tin',
      leader: 'Hoàng Quốc Việt (B23DCAT012)',
      advisor: 'TS. Nguyễn Văn Tuấn',
      category: 'Mua thiết bị thử nghiệm bảo mật',
      title: 'Mua card mạng chuyên dụng đo kiểm gói tin mạng và thiết bị Gateway IoT mô phỏng',
      supplier: 'Công ty Cổ phần Thiết bị An ninh Mạng Quốc tế',
      amount: 4500000,
      submittedDate: '05/05/2027',
      academicClearance: 'CLEARED',
      academicNote: 'QLKHCN xác nhận: Đề tài nghiệm thu Xuất sắc (91.0đ)',
      academicOfficer: 'ThS. Phạm Văn Hùng (P.QLKH&CN)',
      academicDate: '08/05/2027',
      status: 'APPROVED',
      statusText: 'Đã duyệt chi & Giải ngân',
      statusColor: 'green',
      approvedBy: 'CN. Lê Thị Mai (P.TCKT)',
      approvedDate: '10/05/2027',
    },
  ]);

  // Lọc chứng từ
  const filteredVouchers = vouchers.filter((v) => {
    if (filterStatus === 'ALL') return true;
    return v.status === filterStatus;
  });

  // Bước 1: QLKHCN xác nhận đề tài đủ điều kiện quyết toán (đã nghiệm thu đạt theo Điều 5.2.b QĐ 521)
  const handleAcademicClearance = (voucher: any) => {
    Modal.confirm({
      title: 'Xác nhận Đề tài Đủ điều kiện Quyết toán Kinh phí (P.QLKHCN)',
      content: (
        <div>
          <Paragraph>
            Căn cứ theo <b>Điều 5.2.b QĐ 521/QĐ-HV</b>, đề tài <b>{voucher.projectCode}</b> đã bảo vệ trước Hội đồng nghiệm thu và được công nhận kết quả đạt tiêu chuẩn.
          </Paragraph>
          <Paragraph style={{ fontSize: 13, color: '#595959' }}>
            Phòng QLKHCN xác nhận khối lượng nghiên cứu hoàn thành hợp lệ, chuyển hồ sơ sang <b>Phòng Tài chính - Kế toán</b> để thẩm tra hóa đơn VAT và thực hiện giải ngân.
          </Paragraph>
        </div>
      ),
      okText: 'Xác nhận đủ ĐK quyết toán',
      cancelText: 'Hủy bỏ',
      okButtonProps: { style: { backgroundColor: '#722ED1', borderColor: '#722ED1' } },
      onOk: () => {
        setVouchers((prev) =>
          prev.map((item) =>
            item.id === voucher.id
              ? {
                  ...item,
                  academicClearance: 'CLEARED',
                  academicNote: 'QLKHCN xác nhận: Đề tài nghiệm thu Xuất sắc (93.8đ)',
                  academicOfficer: user?.fullName || 'ThS. Phạm Văn Hùng (P.QLKH&CN)',
                  academicDate: new Date().toLocaleDateString('vi-VN'),
                  statusText: 'P.TCKT chờ duyệt chi',
                }
              : item,
          ),
        );
        message.success(`Phòng QLKHCN đã xác nhận đề tài ${voucher.projectCode} đủ điều kiện quyết toán chuyên môn!`);
      },
    });
  };

  // Bước 2: Kế toán Phòng TCKT thẩm định hóa đơn VAT & Duyệt chi giải ngân
  const handleApproveVoucher = (voucher: any) => {
    if (voucher.academicClearance === 'PENDING') {
      message.warning('Đề tài chưa được Phòng QLKHCN xác nhận kết quả nghiệm thu theo Điều 5.2.b QĐ 521!');
      return;
    }
    Modal.confirm({
      title: 'Xác nhận Thẩm tra Hóa đơn VAT & Duyệt chi Giải ngân (P.TCKT)',
      content: (
        <div>
          <Paragraph>
            Kế toán viên Phòng TCKT thẩm tra chứng từ số <b>{voucher.voucherNo}</b> với số tiền{' '}
            <b style={{ color: '#C62828' }}>{voucher.amount.toLocaleString('vi-VN')} VNĐ</b>.
          </Paragraph>
          <Paragraph style={{ fontSize: 13, color: '#595959' }}>
            Hóa đơn VAT và danh mục mua sắm đã được đối soát khớp với Khoản mục 12 trong Đề cương chi tiết (Mẫu 2) của đề tài. Đề tài đã có xác nhận nghiệm thu của P.QLKHCN. Sau khi xác nhận, lệnh giải ngân sẽ được thực hiện qua Kho bạc/Ngân hàng để chuyển khoản thanh toán.
          </Paragraph>
        </div>
      ),
      okText: 'Ký duyệt chi & Giải ngân',
      cancelText: 'Hủy bỏ',
      okButtonProps: { style: { backgroundColor: '#52C41A', borderColor: '#52C41A' } },
      onOk: () => {
        setVouchers((prev) =>
          prev.map((item) =>
            item.id === voucher.id
              ? {
                  ...item,
                  status: 'APPROVED',
                  statusText: 'Đã duyệt chi & Giải ngân',
                  statusColor: 'green',
                  approvedBy: user?.fullName || 'CN. Lê Thị Mai (P.TCKT)',
                  approvedDate: new Date().toLocaleDateString('vi-VN'),
                }
              : item,
          ),
        );
        message.success(`Phòng TCKT đã thẩm định và duyệt chi thành công chứng từ ${voucher.voucherNo}!`);
      },
    });
  };

  // Từ chối hoặc yêu cầu bổ sung chứng từ (Chỉ P.TCKT)
  const handleRejectVoucher = (voucher: any) => {
    Modal.confirm({
      title: 'Yêu cầu Bổ sung Chứng từ / Từ chối thanh toán (P.TCKT)',
      content: (
        <div>
          <Paragraph>Chứng từ số <b>{voucher.voucherNo}</b> sẽ được chuyển sang trạng thái cần bổ sung thông tin.</Paragraph>
          <Input.TextArea placeholder="Nhập lý do (ví dụ: Hóa đơn thiếu mã số thuế PTIT: 0100779774, biên bản giao nhận chưa có chữ ký GVHD...)" rows={3} />
        </div>
      ),
      okText: 'Gửi yêu cầu bổ sung',
      cancelText: 'Đóng',
      okButtonProps: { danger: true },
      onOk: () => {
        setVouchers((prev) =>
          prev.map((item) =>
            item.id === voucher.id
              ? {
                  ...item,
                  status: 'REJECTED',
                  statusText: 'Yêu cầu bổ sung',
                  statusColor: 'red',
                  approvedBy: user?.fullName || 'CN. Lê Thị Mai (P.TCKT)',
                  approvedDate: new Date().toLocaleDateString('vi-VN'),
                }
              : item,
          ),
        );
        message.warning(`Đã gửi yêu cầu bổ sung cho chứng từ ${voucher.voucherNo}`);
      },
    });
  };

  // Thêm chứng từ mới (Sinh viên nộp)
  const handleCreateVoucher = (values: any) => {
    const newId = vouchers.length + 1;
    const newEntry = {
      id: newId,
      voucherNo: `PC-2027-00${newId}`,
      invoiceNo: values.invoiceNo || 'HD-VAT-' + Math.floor(10000 + Math.random() * 90000),
      projectCode: values.projectCode || 'SV-2026-CNTT1-001',
      projectTitle: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
      faculty: 'Khoa Công nghệ thông tin 1',
      leader: user?.fullName || 'Nguyễn Văn An (B23DCCN001)',
      advisor: 'TS. Ngô Quốc Dũng',
      category: values.category || 'Mua linh kiện, vật tư tiêu hao',
      title: values.title,
      supplier: values.supplier,
      amount: Number(values.amount) || 1000000,
      submittedDate: new Date().toLocaleDateString('vi-VN'),
      status: 'PENDING',
      statusText: 'Chờ duyệt chi',
      statusColor: 'orange',
      approvedBy: null,
      approvedDate: null,
    };
    setVouchers([newEntry, ...vouchers]);
    setNewVoucherModalVisible(false);
    form.resetFields();
    message.success('Đã nộp hồ sơ chứng từ thanh toán kinh phí lên Phòng TCKT thành công!');
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* TIÊU ĐỀ TRANG */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
            Quản lý Kinh phí & Thanh quyết toán NCKH (Điều 5 QĐ 521/QĐ-HV)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Số hóa toàn diện quy trình thẩm định dự toán, kiểm soát hóa đơn điện tử VAT và giải ngân kinh phí đề tài sinh viên.
          </Text>
        </div>

        <Space size={10}>
          <Button
            icon={<FilePdfOutlined />}
            onClick={() => navigate('/gwdu')}
          >
            Sổ tay Hướng dẫn Tài chính
          </Button>

          {isFinance && (
            <Button
              type="primary"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              icon={<PlusOutlined />}
              onClick={() => setNewVoucherModalVisible(true)}
            >
              + Lập Phiếu chi / Quyết toán (P.TCKT)
            </Button>
          )}

          {!isFinance && roleCode !== 'QLKHCN' && (
            <Button
              type="primary"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              icon={<PlusOutlined />}
              onClick={() => setNewVoucherModalVisible(true)}
            >
              + Nộp chứng từ hóa đơn mới
            </Button>
          )}

          {roleCode === 'QLKHCN' && (
            <Button
              type="primary"
              style={{ backgroundColor: '#722ED1', borderColor: '#722ED1' }}
              icon={<SafetyCertificateOutlined />}
              onClick={() => navigate('/projects')}
            >
              Xem Danh mục Đề tài & QĐ Giao kinh phí
            </Button>
          )}
        </Space>
      </div>

      {/* THÔNG BÁO THẨM QUYỀN VAI TRÒ CHUẨN DFD 6.0 & QĐ 521 */}
      <Alert
        message={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <span>
              <b>Phân định thẩm quyền Quyết toán & Duyệt chi (Điều 5 QĐ 521):</b> Bạn đang đăng nhập với vai trò{' '}
              <Tag color={roleCode === 'FINANCE' ? 'orange' : roleCode === 'QLKHCN' ? 'purple' : 'red'} style={{ fontWeight: 600 }}>
                {user?.roleName || 'Kế toán viên Phòng TCKT'}
              </Tag>
              {roleCode === 'FINANCE' &&
                '• Phòng Tài chính - Kế toán là đơn vị DUY NHẤT có thẩm quyền thẩm tra hóa đơn điện tử VAT, kiểm soát chứng từ và THỰC HIỆN DUYỆT CHI / GIẢI NGÂN theo quy định tài chính.'}
              {roleCode === 'QLKHCN' &&
                '• Phòng QLKHCN thẩm định điều kiện chuyên môn: xác nhận đề tài đã nghiệm thu đạt theo Điều 5.2.b QĐ 521 để chuyển sang P.TCKT duyệt chi giải ngân (P.QLKHCN không thực hiện lệnh giải ngân tiền).'}
              {roleCode === 'ADMIN' &&
                '• Quản trị viên hệ thống có toàn quyền điều phối liên thông quy trình 2 bước giữa Phòng QLKHCN và Phòng TCKT.'}
              {roleCode === 'STUDENT' &&
                '• Sinh viên chủ nhiệm nộp hóa đơn VAT và theo dõi quy trình duyệt chi 2 bước: Bước 1 (QLKHCN xác nhận nghiệm thu đạt) ➔ Bước 2 (P.TCKT thẩm tra & giải ngân).'}
            </span>
          </div>
        }
        type={roleCode === 'FINANCE' ? 'warning' : 'info'}
        showIcon
        style={{ marginBottom: 20, borderRadius: 8 }}
      />

      {/* 4 THẺ CHỈ SỐ THỐNG KÊ NGÂN SÁCH NCKH TOÀN DIỆN */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #1890FF' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Tổng ngân sách Học viện cấp (2026-2027)</span>}
              value={800000000}
              suffix="đ"
              valueStyle={{ color: '#1890FF', fontWeight: 800, fontSize: 22 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 6 }}>128 đề tài sinh viên toàn trường</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #52C41A' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Đã giải ngân đợt 1 (Tạm ứng 50%)</span>}
              value={400000000}
              suffix="đ"
              valueStyle={{ color: '#52C41A', fontWeight: 800, fontSize: 22 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 6 }}>Đã chuyển tài khoản các Khoa đào tạo</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #FA8C16' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Hồ sơ chờ thẩm tra duyệt chi</span>}
              value={75000000}
              suffix="đ"
              valueStyle={{ color: '#FA8C16', fontWeight: 800, fontSize: 22 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 6 }}>{vouchers.filter(v => v.status === 'PENDING').length} chứng từ hóa đơn cần xử lý</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 18, borderLeft: '4px solid #C62828' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#595959', fontWeight: 600 }}>Dự toán Đề tài mẫu SV-2026-CNTT1-001</span>}
              value={5000000}
              suffix="đ"
              valueStyle={{ color: '#C62828', fontWeight: 800, fontSize: 22 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 6 }}>Đã duyệt chi: 1.500.000đ • Chờ: 3.500.000đ</div>
          </div>
        </Col>
      </Row>

      {/* BẢNG CHỨNG TỪ TÀI CHÍNH SỐ HÓA */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              Danh sách Chứng từ Thanh quyết toán Kinh phí NCKH (Điều 5 QĐ 521/QĐ-HV)
            </span>
            <Space size={10}>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 180 }}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'PENDING', label: 'Chờ duyệt chi' },
                  { value: 'APPROVED', label: 'Đã duyệt chi & Giải ngân' },
                  { value: 'REJECTED', label: 'Yêu cầu bổ sung' },
                ]}
              />
            </Space>
          </div>
        }
        style={{ borderRadius: 8 }}
      >
        <Table
          rowKey="id"
          dataSource={filteredVouchers}
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: 'Mã chứng từ',
              dataIndex: 'voucherNo',
              key: 'voucherNo',
              width: 125,
              render: (v, r) => (
                <div>
                  <b style={{ color: '#C62828' }}>{v}</b>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.invoiceNo}</div>
                </div>
              ),
            },
            {
              title: 'Đề tài & Nhóm nghiên cứu',
              key: 'project',
              render: (_, r) => (
                <div>
                  <div style={{ fontWeight: 600, color: '#262626', fontSize: 13 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 3 }}>
                    Đề tài: <b style={{ color: '#1890FF' }}>{r.projectCode}</b> • {r.faculty}
                  </div>
                  <div style={{ fontSize: 11, color: '#595959', marginTop: 2 }}>
                    Chủ nhiệm: {r.leader} • GVHD: {r.advisor}
                  </div>
                </div>
              ),
            },
            {
              title: 'Khoản mục chi tiêu',
              key: 'supplier',
              width: 200,
              render: (_, r) => (
                <div>
                  <Tag color="cyan" style={{ fontSize: 11, margin: '0 0 4px 0' }}>{r.category}</Tag>
                  <div style={{ fontSize: 12, color: '#262626' }}>{r.supplier}</div>
                </div>
              ),
            },
            {
              title: 'Số tiền',
              dataIndex: 'amount',
              key: 'amount',
              width: 130,
              align: 'right',
              render: (v) => <b style={{ color: '#C62828', fontSize: 14 }}>{Number(v).toLocaleString('vi-VN')} đ</b>,
            },
            {
              title: 'Bước 1: QLKHCN xác nhận',
              key: 'academicClearance',
              width: 180,
              align: 'center',
              render: (_, r) => (
                <div>
                  {r.academicClearance === 'CLEARED' ? (
                    <div>
                      <Tag color="purple" style={{ fontWeight: 600, fontSize: 11 }}>
                        <SafetyCertificateOutlined style={{ marginRight: 4 }} />
                        Đủ ĐK quyết toán
                      </Tag>
                      <div style={{ fontSize: 10, color: '#722ED1', marginTop: 3 }}>
                        {r.academicOfficer} ({r.academicDate})
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Tag color="default" style={{ fontSize: 11 }}>Chờ QLKHCN duyệt</Tag>
                      <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 3 }}>
                        Chờ xác nhận nghiệm thu
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: 'Bước 2: P.TCKT duyệt chi',
              key: 'status',
              width: 180,
              align: 'center',
              render: (_, r) => (
                <div>
                  <Tag color={r.statusColor} style={{ fontWeight: 600 }}>{r.statusText}</Tag>
                  {r.approvedBy && (
                    <div style={{ fontSize: 10, color: '#52C41A', marginTop: 4 }}>
                      Duyệt chi: {r.approvedBy} ({r.approvedDate})
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: 'Thao tác số hóa',
              key: 'actions',
              width: 210,
              align: 'center',
              render: (_, r) => (
                <Space size={6} wrap>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedVoucher(r);
                      setPreviewModalVisible(true);
                    }}
                  >
                    Xem phiếu A4
                  </Button>

                  {/* THAO TÁC BƯỚC 1: DÀNH CHO PHÒNG QLKHCN */}
                  {isQLKH && !isFinance && r.academicClearance === 'PENDING' && (
                    <Tooltip title="Xác nhận đề tài đã nghiệm thu đạt theo Điều 5.2.b QĐ 521 để chuyển P.TCKT duyệt chi">
                      <Button
                        size="small"
                        type="primary"
                        style={{ backgroundColor: '#722ED1', borderColor: '#722ED1', fontSize: 11 }}
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => handleAcademicClearance(r)}
                      >
                        Xác nhận ĐK
                      </Button>
                    </Tooltip>
                  )}

                  {/* THAO TÁC BƯỚC 2: CHỈ DÀNH CHO PHÒNG TÀI CHÍNH KẾ TOÁN (P.TCKT) */}
                  {isFinance && r.status === 'PENDING' && (
                    <>
                      <Tooltip title={r.academicClearance === 'PENDING' ? 'Cần Phòng QLKHCN xác nhận nghiệm thu trước' : 'Ký duyệt lệnh giải ngân thanh toán'}>
                        <Button
                          size="small"
                          type="primary"
                          style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontSize: 11 }}
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleApproveVoucher(r)}
                        >
                          Duyệt chi
                        </Button>
                      </Tooltip>
                      <Tooltip title="Yêu cầu bổ sung chứng từ hóa đơn">
                        <Button
                          size="small"
                          danger
                          icon={<CloseCircleOutlined />}
                          onClick={() => handleRejectVoucher(r)}
                        />
                      </Tooltip>
                    </>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* MODAL XEM TRƯỚC VĂN BẢN QUYẾT TOÁN SỐ HÓA A4 CHUẨN PTIT */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileDoneOutlined style={{ color: '#C62828', fontSize: 18 }} />
            <span>Văn bản Quyết toán Tài chính Số hóa - Mẫu TCKT PTIT</span>
          </div>
        }
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={920}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            icon={<PrinterOutlined />}
            onClick={() => {
              printElement('printable-voucher-sheet', `Phieu_Chi_${selectedVoucher?.voucherNo}`);
            }}
          >
            In Phiếu chi A4
          </Button>,
        ]}
      >
        {selectedVoucher && (
          <div
            id="printable-voucher-sheet"
            style={{
              backgroundColor: '#FFFFFF',
              padding: '36px 44px',
              border: '1px solid #D9D9D9',
              fontFamily: '"Times New Roman", Times, serif',
              color: '#000000',
              lineHeight: 1.6,
            }}
          >
            {/* QUỐC HUY & TIÊU NGỮ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 'bold' }}>BỘ KHOA HỌC VÀ CÔNG NGHỆ</div>
                <div style={{ fontSize: 12, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
                <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>PHÒNG TÀI CHÍNH - KẾ TOÁN</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Số phiếu: <b>{selectedVoucher.voucherNo}</b></div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
                <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 4 }}>Hà Nội, ngày {selectedVoucher.submittedDate}</div>
              </div>
            </div>

            {/* TIÊU ĐỀ PHIẾU */}
            <div style={{ textAlign: 'center', margin: '24px 0 16px' }}>
              <div style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' }}>
                PHIẾU THANH TOÁN KINH PHÍ ĐỀ TÀI NCKH SINH VIÊN
              </div>
              <div style={{ fontSize: 13, fontStyle: 'italic' }}>
                (Căn cứ Quyết định số 521/QĐ-HV ngày 24/5/2022 của Giám đốc Học viện Công nghệ BCVT)
              </div>
            </div>

            {/* THÔNG TIN CHI TIẾT */}
            <table style={{ width: '100%', marginBottom: 16, fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ width: 170, padding: '4px 0' }}><b>1. Tên đề tài NCKH:</b></td>
                  <td style={{ padding: '4px 0' }}><b>{selectedVoucher.projectTitle}</b></td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}><b>2. Mã số đề tài:</b></td>
                  <td style={{ padding: '4px 0' }}>{selectedVoucher.projectCode} • Thuộc đơn vị: {selectedVoucher.faculty}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}><b>3. Người đề nghị:</b></td>
                  <td style={{ padding: '4px 0' }}>{selectedVoucher.leader} (Chủ nhiệm đề tài)</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}><b>4. Giảng viên hướng dẫn:</b></td>
                  <td style={{ padding: '4px 0' }}>{selectedVoucher.advisor}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}><b>5. Nội dung chi tiêu:</b></td>
                  <td style={{ padding: '4px 0' }}>{selectedVoucher.title}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}><b>6. Khoản mục dự toán:</b></td>
                  <td style={{ padding: '4px 0' }}>{selectedVoucher.category} (Khớp mục 12 Đề cương Mẫu 2)</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}><b>7. Đơn vị thụ hưởng:</b></td>
                  <td style={{ padding: '4px 0' }}>{selectedVoucher.supplier}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}><b>8. Số hóa đơn điện tử:</b></td>
                  <td style={{ padding: '4px 0' }}><b>{selectedVoucher.invoiceNo}</b> (Đã đối soát tính hợp lệ hóa đơn VAT)</td>
                </tr>
              </tbody>
            </table>

            {/* BẢNG QUYẾT TOÁN SỐ TIỀN */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 13 }} border={1}>
              <thead>
                <tr style={{ backgroundColor: '#F5F5F5', textAlign: 'center' }}>
                  <th style={{ padding: 8, width: 50 }}>STT</th>
                  <th style={{ padding: 8 }}>Nội dung danh mục chứng từ</th>
                  <th style={{ padding: 8, width: 120 }}>Số hóa đơn</th>
                  <th style={{ padding: 8, width: 150 }}>Số tiền đề nghị</th>
                  <th style={{ padding: 8, width: 150 }}>Số tiền duyệt chi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center', padding: 8 }}>1</td>
                  <td style={{ padding: 8 }}>{selectedVoucher.title}</td>
                  <td style={{ textAlign: 'center', padding: 8 }}>{selectedVoucher.invoiceNo}</td>
                  <td style={{ textAlign: 'right', padding: 8 }}>{selectedVoucher.amount.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', padding: 8, fontWeight: 'bold', color: '#C62828' }}>
                    {selectedVoucher.status === 'APPROVED' ? selectedVoucher.amount.toLocaleString('vi-VN') + ' đ' : 'Chờ thẩm định'}
                  </td>
                </tr>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#FAFAFA' }}>
                  <td colSpan={3} style={{ textAlign: 'right', padding: 8 }}>TỔNG CỘNG THANH TOÁN:</td>
                  <td style={{ textAlign: 'right', padding: 8 }}>{selectedVoucher.amount.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', padding: 8, color: '#C62828' }}>
                    {selectedVoucher.status === 'APPROVED' ? selectedVoucher.amount.toLocaleString('vi-VN') + ' đ' : 'Chờ thẩm định'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* PHẦN CHỮ KÝ 4 BÊN SỐ HÓA (CHUẨN QUY TRÌNH 2 BƯỚC LIÊN THÔNG DFD 6.0) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, textAlign: 'center', marginTop: 32 }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 12 }}>NGƯỜI LẬP BIỂU</div>
                <div style={{ fontStyle: 'italic', fontSize: 11 }}>(Chủ nhiệm đề tài)</div>
                <div style={{ marginTop: 50, fontWeight: 'bold' }}>Nguyễn Văn An</div>
              </div>

              <div>
                <div style={{ fontWeight: 'bold', fontSize: 12 }}>GIẢNG VIÊN HƯỚNG DẪN</div>
                <div style={{ fontStyle: 'italic', fontSize: 11 }}>(Xác nhận chi tiêu)</div>
                <div style={{ marginTop: 50, fontWeight: 'bold' }}>TS. Ngô Quốc Dũng</div>
              </div>

              <div>
                <div style={{ fontWeight: 'bold', fontSize: 12 }}>XÁC NHẬN P.QLKHCN</div>
                <div style={{ fontStyle: 'italic', fontSize: 11 }}>(Đủ ĐK nghiệm thu QĐ 521)</div>
                <div style={{ marginTop: 50, fontWeight: 'bold', color: '#722ED1' }}>
                  {selectedVoucher.academicOfficer || 'Đỗ Văn Khoa'}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 'bold', fontSize: 12 }}>KẾ TOÁN VIÊN PHÒNG TCKT</div>
                <div style={{ fontStyle: 'italic', fontSize: 11 }}>(Ký duyệt chi & giải ngân)</div>
                <div style={{ marginTop: 50, fontWeight: 'bold', color: '#C62828' }}>
                  {selectedVoucher.approvedBy || 'CN. Lê Thị Mai'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL NỘP HỒ SƠ CHỨNG TỪ MỚI */}
      <Modal
        title="Kê khai Hồ sơ Chứng từ Hóa đơn NCKH Mới"
        open={newVoucherModalVisible}
        onCancel={() => setNewVoucherModalVisible(false)}
        footer={null}
        width={650}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateVoucher}>
          <Form.Item name="title" label="Nội dung chi tiêu" rules={[{ required: true, message: 'Vui lòng nhập nội dung chi tiêu' }]}>
            <Input placeholder="Ví dụ: Mua linh kiện cảm biến nhiệt độ & module Wifi ESP32" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Khoản mục chi" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'Mua linh kiện, vật tư tiêu hao', label: 'Mua linh kiện, vật tư tiêu hao' },
                    { value: 'Dịch vụ thuê máy chủ, phần mềm', label: 'Dịch vụ thuê máy chủ, phần mềm' },
                    { value: 'In ấn kỷ yếu & Báo cáo', label: 'In ấn kỷ yếu & Báo cáo' },
                    { value: 'Khảo sát thực địa & Thu thập số liệu', label: 'Khảo sát thực địa & Thu thập số liệu' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="amount" label="Số tiền thanh toán (VNĐ)" rules={[{ required: true, message: 'Nhập số tiền' }]}>
                <Input type="number" placeholder="2500000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplier" label="Đơn vị cung ứng / Nhà bán lẻ" rules={[{ required: true }]}>
                <Input placeholder="Tên công ty / cửa hàng xuất hóa đơn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="invoiceNo" label="Số Hóa đơn VAT / Điện tử">
                <Input placeholder="HD-VAT-XXXX" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Đính kèm tệp Scan Hóa đơn VAT / Sao kê tài khoản chuyển tiền">
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Tải lên tệp Hóa đơn điện tử (PDF/JPG)</Button>
            </Upload>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 20 }}>
            <Space>
              <Button onClick={() => setNewVoucherModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}>
                Nộp hồ sơ thanh toán
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
