import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Select,
  Tag,
  Tooltip,
  Divider,
  message,
} from 'antd';
import {
  FilePdfOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FullscreenOutlined,
  SafetyCertificateOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateRightOutlined,
  LinkOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  Mau1CongVanKhoa,
  Mau2DeCuongChiTiet,
  Mau3BiaBaoCao,
  Mau35BienBanSinhHoat,
  Mau41PhieuDanhGia,
  Mau42BienBanHoiDong,
  Mau5DeNghiKhenThuong,
} from '../components/qd521/QD521Templates';
import { PtitCertificate } from '../components/qd521/PtitCertificate';
import { printElement } from '../utils/printHelper';
import api from '../services/api';

const { Title, Text } = Typography;

interface DocumentMeta {
  id: string;
  name: string;
  fileName: string;
  category: string;
  size: string;
  pages: number;
  signedBy: string;
  sha256: string;
  desc: string;
}

export const GwduViewerPage: React.FC = () => {
  const documents: DocumentMeta[] = [
    {
      id: 'doc-qd521',
      name: '1. Quyết định 521/QĐ-HV: Quy định Quản lý Hoạt động NCKH Sinh viên',
      fileName: 'QD_521_QD_HV_NCKH_Sinh_Vien.pdf',
      category: 'Văn bản Pháp lý Nền tảng',
      size: '342 KB',
      pages: 18,
      signedBy: 'Giám đốc Học viện Công nghệ Bưu chính Viễn thông',
      sha256: 'c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7',
      desc: 'Quy định đầy đủ về chu trình đăng ký, định mức GVHD max 2, nhóm max 5 SV, thẩm định đề cương, đánh giá 7 tiêu chí thang điểm 100 và quyền lợi cộng điểm rèn luyện, học bổng.',
    },
    {
      id: 'doc-m1',
      name: '2. Biểu mẫu 1: Công văn Đăng ký Đề tài NCKH Cấp Khoa',
      fileName: 'Mau_1_Cong_van_de_xuat_Khoa.pdf',
      category: 'Biểu mẫu Chuẩn QĐ 521',
      size: '112 KB',
      pages: 2,
      signedBy: 'Khoa Công nghệ thông tin 1',
      sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
      desc: 'Công văn tổng hợp đề xuất danh mục đề tài NCKH sinh viên của Khoa gửi Hội đồng Khoa học Học viện xét duyệt.',
    },
    {
      id: 'doc-m2',
      name: '3. Biểu mẫu 2: Bản Thuyết minh Đề cương Chi tiết Đề tài NCKH (12 Mục)',
      fileName: 'Mau_2_Thuyet_minh_de_cuong_chi_tiet.pdf',
      category: 'Biểu mẫu Chuẩn QĐ 521',
      size: '248 KB',
      pages: 6,
      signedBy: 'Chủ nhiệm đề tài & GVHD',
      sha256: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c',
      desc: 'Bản thuyết minh chi tiết gồm 12 mục quy chuẩn: tính cấp thiết, mục tiêu, đối tượng, phương pháp, nội dung, sản phẩm dự kiến và dự toán kinh phí.',
    },
    {
      id: 'doc-m3',
      name: '4. Biểu mẫu 3.1 - 3.4: Bìa & Báo cáo Tổng kết Đề tài NCKH',
      fileName: 'Mau_3_Bia_va_Bao_cao_tong_ket.pdf',
      category: 'Biểu mẫu Chuẩn QĐ 521',
      size: '310 KB',
      pages: 25,
      signedBy: 'Nhóm nghiên cứu sinh viên',
      sha256: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      desc: 'Quy cách bìa chính, bìa phụ, tóm tắt công trình nghiên cứu và báo cáo tổng kết khoa học hoàn chỉnh.',
    },
    {
      id: 'doc-m35',
      name: '5. Biểu mẫu 3.5: Biên bản Sinh hoạt Khoa học / Hội thảo Cấp Khoa',
      fileName: 'Mau_3.5_Bien_ban_sinh_hoat_khoa_hoc.pdf',
      category: 'Biểu mẫu Chuẩn QĐ 521',
      size: '98 KB',
      pages: 2,
      signedBy: 'Chủ trì Hội thảo & Thư ký Khoa',
      sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      desc: 'Biên bản bắt buộc ghi nhận kết quả báo cáo tại buổi sinh hoạt khoa học / hội thảo bộ môn trước khi nghiệm thu.',
    },
    {
      id: 'doc-m41',
      name: '6. Biểu mẫu 4.1: Phiếu Đánh giá Đề tài NCKH (Thang 100 / 7 Tiêu chí)',
      fileName: 'Mau_4.1_Phieu_danh_gia_7_tieu_chi.pdf',
      category: 'Biểu mẫu Chuẩn QĐ 521',
      size: '125 KB',
      pages: 2,
      signedBy: 'Ủy viên Hội đồng Nghiệm thu',
      sha256: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
      desc: 'Phiếu chấm điểm độc lập của từng thành viên Hội đồng theo 7 tiêu chí QĐ 521 kèm quy tắc loại trừ điểm lệch > 15đ.',
    },
    {
      id: 'doc-m42',
      name: '7. Biểu mẫu 4.2: Biên bản Họp Hội đồng Đánh giá & Nghiệm thu',
      fileName: 'Mau_4.2_Bien_ban_hoi_dong_nghiem_thu.pdf',
      category: 'Biểu mẫu Chuẩn QĐ 521',
      size: '140 KB',
      pages: 3,
      signedBy: 'Chủ tịch Hội đồng & Thư ký',
      sha256: '8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
      desc: 'Biên bản tổng hợp điểm số hợp lệ, kết luận xếp loại (Xuất sắc, Tốt, Khá, Đạt) và kiến nghị công nhận kết quả.',
    },
    {
      id: 'doc-m5',
      name: '8. Biểu mẫu 5: Công văn Đề nghị Khen thưởng Công trình NCKH',
      fileName: 'Mau_5_Cong_van_khen_thuong.pdf',
      category: 'Biểu mẫu Chuẩn QĐ 521',
      size: '95 KB',
      pages: 2,
      signedBy: 'Hội đồng Khoa học Khoa CNTT1',
      sha256: '2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e',
      desc: 'Văn bản đề xuất Giám đốc Học viện tặng Giấy khen, hỗ trợ kinh phí dự thi cấp Bộ và cộng điểm thưởng học tập.',
    },
    {
      id: 'doc-cert',
      name: '9. Giấy Chứng nhận NCKH Sinh viên (Phôi chuẩn có Mã QR & Dấu mộc đỏ)',
      fileName: 'Giay_Chung_nhan_NCKH_Sinh_vien_PTIT.pdf',
      category: 'Văn bằng & Chứng chỉ Số hóa',
      size: '185 KB',
      pages: 1,
      signedBy: 'Giám đốc Học viện Công nghệ BCVT (PGS.TS. Đặng Hoài Bắc)',
      sha256: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
      desc: 'Giấy chứng nhận chính thức hoàn thành / đạt giải NCKH sinh viên Học viện, tích hợp mã QR xác thực số và dấu mộc đỏ pháp lý.',
    },
    {
      id: 'doc-pdf-bfd',
      name: '10. Bản vẽ Kiến trúc & Đặc tả Giải pháp Phần mềm SRMS (Tệp PDF)',
      fileName: 'SRMS_Kien_truc_Giai_phap.pdf',
      category: 'Tài liệu Kỹ thuật Đề tài',
      size: '280 KB',
      pages: 3,
      signedBy: 'Ban Quản trị Hệ thống SRMS PTIT',
      sha256: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
      desc: 'Tập tin PDF bản vẽ kiến trúc giải pháp công nghệ và quy trình vận hành hệ thống quản lý đề tài NCKH sinh viên.',
    },
  ];

  const [searchParams] = useSearchParams();
  const docParam = searchParams.get('doc');
  const projectParam = searchParams.get('projectId');
  const [projectData, setProjectData] = useState<any>(null);

  const getInitialDocId = (): string => {
    if (docParam) {
      if (docParam === 'm2' || docParam === 'outline' || docParam === 'doc-m2') return 'doc-m2';
      if (docParam === 'pdf' || docParam === 'bfd' || docParam === 'doc-pdf-bfd') return 'doc-pdf-bfd';
      if (docParam === 'cert' || docParam === 'doc-cert') return 'doc-cert';
      if (docParam === 'm1' || docParam === 'doc-m1') return 'doc-m1';
      if (docParam === 'm3' || docParam === 'doc-m3') return 'doc-m3';
      if (docParam === 'm35' || docParam === 'doc-m35') return 'doc-m35';
      if (docParam === 'm41' || docParam === 'doc-m41') return 'doc-m41';
      if (docParam === 'm42' || docParam === 'doc-m42') return 'doc-m42';
      if (docParam === 'm5' || docParam === 'doc-m5') return 'doc-m5';
      if (docParam === 'qd521' || docParam === 'doc-qd521') return 'doc-qd521';
      return docParam;
    }
    return 'doc-qd521';
  };

  const [selectedDocId, setSelectedDocId] = useState<string>(getInitialDocId);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    if (docParam) {
      setSelectedDocId(getInitialDocId());
    }
  }, [docParam]);

  useEffect(() => {
    if (projectParam) {
      api.get(`/projects/${projectParam}`)
        .then((res) => {
          if (res.data) setProjectData(res.data);
        })
        .catch(() => {});
    }
  }, [projectParam]);

  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const sampleProject = {
    project_id: 'SV-2026-CNTT1-001',
    title_vi: 'Nghiên cứu và phát triển hệ thống quản lý đề tài NCKH sinh viên PTIT (SRMS)',
    title_en: 'Research and development of Student Research Management System for PTIT',
    research_field: 'Công nghệ thông tin & Chuyển đổi số',
    requested_budget: 5000000,
    approved_budget: 5000000,
    registered_at: '2026-09-10T00:00:00.000Z',
    objectives: 'Xây dựng giải pháp web quản lý chu trình NCKH sinh viên theo QĐ 521/QĐ-HV tích hợp S-Link.',
    content: 'Khảo sát hiện trạng, chuẩn hóa quy trình biểu mẫu QĐ 521, xây dựng kiến trúc hệ thống và phát triển giao diện ứng dụng.',
    methodology: 'Phương pháp mô hình hóa nghiệp vụ chuyên sâu kết hợp kiến trúc dịch vụ hiện đại NestJS & React.',
    expected_result: 'Hệ thống web hoàn chỉnh, tài liệu đặc tả kiến trúc giải pháp và báo cáo tổng kết nghiệm thu.',
    keywords: 'SRMS, S-Link, QĐ 521, PTIT',
    departments: { dept_name: 'Khoa Công nghệ thông tin 1' },
    project_members: [
      {
        member_role: 'LEADER',
        student_id: 'B23DCCC001',
        contribution_pct: 60,
        tasks_assigned: 'Phụ trách chung, xây dựng hệ thống',
        students: { student_id: 'B23DCCC001', gender: 'Nam', users: { full_name: 'Nguyễn Văn An' } },
      },
      {
        member_role: 'MEMBER',
        student_id: 'B23DCCC022',
        contribution_pct: 20,
        tasks_assigned: 'Thu thập số liệu và khảo sát',
        students: { student_id: 'B23DCCC022', gender: 'Nữ', users: { full_name: 'Trần Thị Mai' } },
      },
      {
        member_role: 'MEMBER',
        student_id: 'B23DCCC034',
        contribution_pct: 20,
        tasks_assigned: 'Thiết kế giao diện và kiểm thử',
        students: { student_id: 'B23DCCC034', gender: 'Nam', users: { full_name: 'Lê Hoàng Long' } },
      },
    ],
    project_advisors: [
      {
        lecturers: {
          academic_rank: 'TS',
          users: { full_name: 'Ngô Quốc Dũng', email: 'dungnq@ptit.edu.vn' },
        },
      },
    ],
    evaluations: [
      {
        total_score: 93.8,
        grade: 'XUẤT SẮC',
        concluded_at: '2027-05-10',
        criteria_1: 15,
        criteria_2: 15,
        criteria_3: 18.8,
        criteria_4: 15,
        criteria_5: 10,
        criteria_6: 10,
        criteria_7: 10,
      },
    ],
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Đã sao chép liên kết số GWDU vào bộ nhớ tạm!');
  };

  const handlePrint = () => {
    printElement('gwdu-render-sheet', currentDoc.name);
  };

  const handleDownload = () => {
    if (selectedDocId === 'doc-pdf-bfd') {
      window.open('/docs/SRMS_BFD_final.drawio.pdf', '_blank');
    } else {
      printElement('gwdu-render-sheet', currentDoc.name);
    }
  };

  const renderDocumentContent = () => {
    switch (selectedDocId) {
      case 'doc-m1':
        return <Mau1CongVanKhoa project={projectData || sampleProject} />;
      case 'doc-m2':
        return <Mau2DeCuongChiTiet project={projectData || sampleProject} />;
      case 'doc-pdf-bfd':
        return (
          <div style={{ width: '100%', minHeight: 780, backgroundColor: '#525659', display: 'flex', justifyContent: 'center' }}>
            <iframe
              src="/docs/SRMS_BFD_final.drawio.pdf#toolbar=1"
              title="SRMS Architecture PDF Viewer"
              style={{ width: '100%', height: 780, border: 'none', borderRadius: 4 }}
            />
          </div>
        );
      case 'doc-m3':
        return <Mau3BiaBaoCao project={projectData || sampleProject} />;
      case 'doc-m35':
        return <Mau35BienBanSinhHoat project={projectData || sampleProject} />;
      case 'doc-m41':
        return <Mau41PhieuDanhGia project={projectData || sampleProject} />;
      case 'doc-m42':
        return <Mau42BienBanHoiDong project={projectData || sampleProject} />;
      case 'doc-m5':
        return <Mau5DeNghiKhenThuong project={projectData || sampleProject} />;
      case 'doc-cert':
        return (
          <div style={{ backgroundColor: '#525659', padding: '24px 12px' }}>
            <PtitCertificate
              studentName="NGUYỄN TIẾN ĐẠT"
              studentClass="D23CCHT01"
              department="Viện Khoa học Kỹ thuật Bưu điện"
              projectTitle="Nghiên cứu, xây dựng mô hình xác thực 2FA ứng dụng RFID và vi điều khiển ESP32"
              projectCode="32-SV-2025-RIPT"
              academicYear="2025"
              result="Khá"
              decisionNo="1842/QĐ-HV"
              issueDate="ngày 24 tháng 6 năm 2026"
              certNo="32-SV-2025-RIPT"
              signatoryTitle="GIÁM ĐỐC"
              signatoryName="PGS.TS. Đặng Hoài Bắc"
              printableId="gwdu-ptit-certificate"
            />
          </div>
        );
      case 'doc-qd521':
      default:
        return (
          <div style={{ fontFamily: '"Times New Roman", Times, serif', color: '#000000', lineHeight: 1.6 }}>
            {/* TIÊU ĐỀ QUYẾT ĐỊNH 521 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ textAlign: 'center', width: '48%' }}>
                <div style={{ fontSize: 12, fontWeight: 'bold' }}>BỘ KHOA HỌC VÀ CÔNG NGHỆ</div>
                <div style={{ fontSize: 12, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
                <div style={{ width: 120, height: 1, backgroundColor: '#000000', margin: '4px auto' }} />
                <div style={{ fontSize: 11, marginTop: 4 }}>Số: 521/QĐ-HV</div>
              </div>
              <div style={{ textAlign: 'center', width: '48%' }}>
                <div style={{ fontSize: 12, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
                <div style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>
                  Hà Nội, ngày 17 tháng 07 năm 2020
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '24px 0 16px' }}>
              <div style={{ fontSize: 15, fontWeight: 'bold' }}>QUYẾT ĐỊNH</div>
              <div style={{ fontSize: 13, fontStyle: 'italic' }}>
                Về việc Ban hành Quy định Hoạt động Nghiên cứu Khoa học của Sinh viên
              </div>
              <div style={{ fontSize: 13, fontWeight: 'bold' }}>GIÁM ĐỐC HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
            </div>

            <div style={{ fontSize: 13, textAlign: 'justify', lineHeight: 1.8 }}>
              <p>
                <b>Căn cứ</b> các quy định của Bộ trưởng Bộ Khoa học và Công nghệ quy định chức năng, nhiệm vụ, quyền hạn và cơ cấu tổ chức của Học viện Công nghệ Bưu chính Viễn thông;
              </p>
              <p>
                <b>Căn cứ</b> Thông tư số 45/2020/TT-BGDĐT ngày 11/11/2020 của Bộ trưởng Bộ Giáo dục và Đào tạo ban hành Quy chế xét tặng Giải thưởng khoa học và công nghệ dành cho sinh viên;
              </p>
              <p>
                <b>Theo đề nghị</b> của Trưởng phòng Quản lý Khoa học Công nghệ và Hợp tác Quốc tế,
              </p>

              <div style={{ textAlign: 'center', margin: '16px 0', fontWeight: 'bold', fontSize: 14 }}>QUYẾT ĐỊNH:</div>

              <p>
                <b>Điều 1.</b> Ban hành kèm theo Quyết định này "Quy định về hoạt động nghiên cứu khoa học của sinh viên trong Học viện Công nghệ Bưu chính Viễn thông".
              </p>
              <p>
                <b>Điều 2.</b> Quyết định này có hiệu lực thi hành kể từ ngày ký và thay thế các quy định trước đây trái với Quyết định này.
              </p>
              <p>
                <b>Điều 3.</b> Các Ông (Bà) Trưởng phòng QLKH-CN&HTQT, Trưởng phòng Đào tạo, Trưởng các Khoa đào tạo và các đơn vị liên quan, sinh viên Học viện chịu trách nhiệm thi hành Quyết định này./.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
                <div style={{ fontSize: 11, fontStyle: 'italic', width: '40%' }}>
                  <b>Nơi nhận:</b><br />
                  - Như Điều 3;<br />
                  - Ban Giám đốc Học viện (để b/c);<br />
                  - Lưu: VT, QLKHCN.
                </div>
                <div style={{ textAlign: 'center', width: '48%' }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold' }}>GIÁM ĐỐC</div>
                  <div style={{ fontSize: 11, fontStyle: 'italic' }}>(Đã ký số và đóng dấu)</div>
                  <div style={{ height: 60 }} />
                  <div style={{ fontSize: 13, fontWeight: 'bold' }}>PGS.TS. Vũ Văn San</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {/* BANNER CỔNG TÀI LIỆU SỐ GWDU PTIT */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: 8,
          border: '1px solid #EDEDEE',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FilePdfOutlined style={{ color: '#C62828', fontSize: 24 }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
              Cổng Tài liệu & Hồ sơ Số GWDU (Digital University Gateway)
            </Title>
            <Tag color="green" icon={<SafetyCertificateOutlined />}>
              Văn bản Pháp quy PTIT
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>
            Hệ thống lưu trữ, tra cứu và hiển thị hồ sơ, biểu mẫu chuẩn QĐ 521/QĐ-HV phục vụ nghiên cứu khoa học sinh viên Học viện.
          </Text>
        </div>

        <Space size={10}>
          <Button icon={<LinkOutlined />} onClick={handleCopyLink}>
            Sao chép liên kết số
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            In văn bản số này
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* CỘT TRÁI: KHUNG XEM TRƯỚC VĂN BẢN SỐ CHUẨN A4 GWDU */}
        <Col xs={24} lg={18}>
          <Card
            bodyStyle={{ padding: 0 }}
            style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #EDEDEE' }}
          >
            {/* THANH ĐIỀU HƯỚNG TẬP TIN & THAO TÁC XEM PDF */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                backgroundColor: '#FAFAFA',
                borderBottom: '1px solid #EDEDEE',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {/* Dropdown chọn tài liệu văn bản chuẩn */}
              <Select
                value={selectedDocId}
                onChange={(val) => {
                  setSelectedDocId(val);
                  setZoom(100);
                  setRotation(0);
                }}
                style={{ width: 440, fontWeight: 600 }}
                options={documents.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
              />

              {/* Nút công cụ tương tác tài liệu */}
              <Space size={8}>
                <Tooltip title="Thu nhỏ">
                  <Button size="small" icon={<ZoomOutOutlined />} onClick={() => setZoom((z) => Math.max(z - 15, 60))} />
                </Tooltip>
                <span style={{ fontSize: 12, width: 44, textAlign: 'center', fontWeight: 500 }}>
                  {zoom}%
                </span>
                <Tooltip title="Phóng to">
                  <Button size="small" icon={<ZoomInOutlined />} onClick={() => setZoom((z) => Math.min(z + 15, 200))} />
                </Tooltip>

                <Divider type="vertical" style={{ margin: '0 4px' }} />

                <Tooltip title="Xoay trang 90 độ">
                  <Button size="small" icon={<RotateRightOutlined />} onClick={() => setRotation((r) => (r + 90) % 360)} />
                </Tooltip>

                <Tooltip title="In tài liệu chuẩn A4">
                  <Button size="small" icon={<PrinterOutlined />} onClick={handlePrint} />
                </Tooltip>

                <Tooltip title="Tải xuống tệp PDF">
                  <Button size="small" icon={<DownloadOutlined />} onClick={handleDownload} />
                </Tooltip>

                <Tooltip title="Xuất toàn màn hình">
                  <Button size="small" icon={<FullscreenOutlined />} onClick={handlePrint} />
                </Tooltip>
              </Space>
            </div>

            {/* Khung hiển thị tờ văn bản A4 chuẩn mực */}
            <div
              style={{
                height: '75vh',
                backgroundColor: '#525659',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflow: 'auto',
                padding: '24px 16px',
              }}
            >
              <div
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  id="gwdu-render-sheet"
                  className="printable-a4-sheet"
                  style={{
                    backgroundColor: '#FFFFFF',
                    width: '100%',
                    maxWidth: 720,
                    minHeight: '68vh',
                    padding: '40px 36px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    borderRadius: 2,
                  }}
                >
                  {renderDocumentContent()}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* CỘT PHẢI: THÔNG TIN HỒ SƠ PHÁP LÝ & ĐẶC TẢ */}
        <Col xs={24} lg={6}>
          <Card
            title={
              <Space>
                <FolderOpenOutlined style={{ color: '#C62828' }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Thông tin Hồ sơ Số</span>
              </Space>
            }
            bodyStyle={{ padding: 16 }}
            style={{ borderRadius: 8, border: '1px solid #EDEDEE' }}
          >
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>Tên tệp văn bản số:</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#C62828', marginTop: 2 }}>
                {currentDoc.fileName}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>Phân loại:</div>
              <Tag color="red" style={{ marginTop: 4 }}>{currentDoc.category}</Tag>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>Cơ quan ban hành:</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginTop: 2 }}>
                {currentDoc.signedBy}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>Kích thước:</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{currentDoc.size}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>Số trang:</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{currentDoc.pages} trang</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>Mã băm toàn vẹn (SHA-256):</div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  backgroundColor: '#F5F5F5',
                  padding: '4px 6px',
                  borderRadius: 4,
                  wordBreak: 'break-all',
                  marginTop: 4,
                  color: '#595959',
                }}
              >
                {currentDoc.sha256}
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#262626', marginBottom: 4 }}>
                Nội dung quy chuẩn:
              </div>
              <div style={{ fontSize: 12, color: '#595959', lineHeight: 1.6 }}>
                {currentDoc.desc}
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: '10px 12px',
                backgroundColor: '#FFF0ED',
                borderRadius: 6,
                border: '1px solid #FADCD5',
                fontSize: 11,
                color: '#C62828',
                lineHeight: 1.5,
              }}
            >
              <CheckCircleOutlined style={{ marginRight: 6 }} />
              Văn bản hành chính điện tử đã ký số số hóa phục vụ toàn diện công tác NCKH sinh viên Học viện.
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};