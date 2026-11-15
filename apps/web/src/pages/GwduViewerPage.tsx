import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Alert,
  message,
} from 'antd';
import {
  FilePdfOutlined,
  PrinterOutlined,
  SafetyCertificateOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateRightOutlined,
  LinkOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  ExportOutlined,
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
  category: 'SYSTEM' | 'PROJECT';
  categoryLabel: string;
  sourceNote: string;
  desc: string;
}

const SYSTEM_DOCUMENTS: DocumentMeta[] = [
  {
    id: 'doc-pdf-bfd',
    name: '1. Sơ đồ BFD & Đặc tả Quy trình Nghiệp vụ SRMS (PDF gốc)',
    fileName: 'SRMS_BFD_final.drawio.pdf',
    category: 'SYSTEM',
    categoryLabel: 'Tài liệu Đặc tả Hệ thống',
    sourceNote: '/docs/SRMS_BFD_final.drawio.pdf',
    desc: 'Bản vẽ sơ đồ phân rã chức năng (BFD) và kiến trúc quy trình nghiệp vụ chuẩn của hệ thống SRMS.',
  },
  {
    id: 'doc-qd521',
    name: '2. Quyết định 521/QĐ-HV: Quy chế Quản lý NCKH Sinh viên PTIT',
    fileName: 'QD_521_QD_HV_NCKH_Sinh_Vien.pdf',
    category: 'SYSTEM',
    categoryLabel: 'Văn bản Pháp quy Gốc',
    sourceNote: 'Văn bản ban hành ngày 17/07/2020 - PTIT',
    desc: 'Quyết định gốc làm căn cứ triển khai đề tài, định mức SV (01 đề tài/năm), GVHD (02 đề tài cùng lúc), nhóm (tối đa 05 SV) và nghiệm thu 7 tiêu chí.',
  },
];

const PROJECT_DOCUMENTS: DocumentMeta[] = [
  {
    id: 'doc-m2',
    name: 'Hồ sơ Đề cương chi tiết 12 mục (Mẫu 2)',
    fileName: 'Mau_2_Thuyet_minh_de_cuong.pdf',
    category: 'PROJECT',
    categoryLabel: 'Hồ sơ Đề tài Thực tế',
    sourceNote: 'Trích xuất từ CSDL Đề tài & Đề cương',
    desc: 'Bản thuyết minh Đề cương chi tiết gắn với mã số đề tài đang chọn trong hệ thống.',
  },
  {
    id: 'doc-m1',
    name: 'Công văn đề xuất cấp Khoa (Mẫu 1)',
    fileName: 'Mau_1_Cong_van_Khoa.pdf',
    category: 'PROJECT',
    categoryLabel: 'Hồ sơ Đề tài Thực tế',
    sourceNote: 'Trích xuất từ CSDL Đề tài',
    desc: 'Văn bản đề xuất thực hiện đề tài cấp Khoa gửi Phòng QLKH&CN.',
  },
  {
    id: 'doc-m3',
    name: 'Bìa Báo cáo tổng kết (Mẫu 3.2 - 3.3)',
    fileName: 'Mau_3_Bia_Bao_cao.pdf',
    category: 'PROJECT',
    categoryLabel: 'Hồ sơ Đề tài Thực tế',
    sourceNote: 'Trích xuất từ CSDL Đề tài',
    desc: 'Trang bìa chính thức của Báo cáo tổng kết đề tài NCKH sinh viên.',
  },
  {
    id: 'doc-m35',
    name: 'Biên bản Sinh hoạt khoa học (Mẫu 3.5)',
    fileName: 'Mau_3.5_Bien_ban_SHKH.pdf',
    category: 'PROJECT',
    categoryLabel: 'Hồ sơ Đề tài Thực tế',
    sourceNote: 'Trích xuất từ CSDL Tiến độ & Hội thảo',
    desc: 'Biên bản báo cáo tiến độ sinh hoạt khoa học chuyên môn cấp Khoa/Bộ môn.',
  },
  {
    id: 'doc-m41',
    name: 'Phiếu đánh giá Hội đồng (Mẫu 4.1)',
    fileName: 'Mau_4.1_Phieu_danh_gia.pdf',
    category: 'PROJECT',
    categoryLabel: 'Hồ sơ Đề tài Thực tế',
    sourceNote: 'Trích xuất từ CSDL Nghiệm thu',
    desc: 'Phiếu chấm điểm độc lập 7 tiêu chí thang 100 điểm của thành viên Hội đồng.',
  },
  {
    id: 'doc-m42',
    name: 'Biên bản họp Hội đồng Nghiệm thu (Mẫu 4.2)',
    fileName: 'Mau_4.2_Bien_ban_nghiem_thu.pdf',
    category: 'PROJECT',
    categoryLabel: 'Hồ sơ Đề tài Thực tế',
    sourceNote: 'Trích xuất từ CSDL Nghiệm thu',
    desc: 'Biên bản tổng hợp điểm hợp lệ và xếp loại nghiệm thu của Hội đồng.',
  },
  {
    id: 'doc-m5',
    name: 'Đề nghị Khen thưởng & Giải thưởng (Mẫu 5)',
    fileName: 'Mau_5_De_nghi_Khen_thuong.pdf',
    category: 'PROJECT',
    categoryLabel: 'Hồ sơ Đề tài Thực tế',
    sourceNote: 'Trích xuất từ CSDL Khen thưởng',
    desc: 'Văn bản đề xuất khen thưởng cho đề tài đạt thành tích xuất sắc/tốt.',
  },
  {
    id: 'doc-cert',
    name: 'Giấy chứng nhận NCKH Sinh viên (Xác thực QR)',
    fileName: 'Giay_Chung_nhan_NCKH.pdf',
    category: 'PROJECT',
    categoryLabel: 'Văn bằng Số hóa',
    sourceNote: 'Cấp tự động cho đề tài đã nghiệm thu',
    desc: 'Giấy chứng nhận điện tử có mã QR kiểm chứng công khai tại /verify.',
  },
];

const ALL_DOCUMENTS = [...SYSTEM_DOCUMENTS, ...PROJECT_DOCUMENTS];

const STATUS_VI_MAP: Record<string, string> = {
  PROPOSED: 'Đề xuất mới',
  FACULTY_APPROVED: 'Khoa đã sơ tuyển',
  APPROVED: 'Đã giao đề tài',
  OUTLINE_APPROVED: 'Đã duyệt đề cương',
  IN_PROGRESS: 'Đang triển khai',
  READY_FOR_ACCEPTANCE: 'Chờ nghiệm thu',
  ACCEPTED: 'Đã nghiệm thu',
  REJECTED: 'Không đạt / Từ chối',
  CANCELLED: 'Đã hủy',
};

const CERT_GRADE_MAP: Record<string, string> = {
  XUAT_SAC: 'Xuất sắc',
  TOT: 'Tốt',
  KHA: 'Khá',
  DAT: 'Đạt',
};

export const GwduViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const docParam = searchParams.get('doc');
  const projectParam = searchParams.get('projectId');

  const resolveDocId = (raw?: string | null): string => {
    if (!raw) return 'doc-pdf-bfd';
    const map: Record<string, string> = {
      m1: 'doc-m1',
      'doc-m1': 'doc-m1',
      m2: 'doc-m2',
      outline: 'doc-m2',
      'doc-m2': 'doc-m2',
      m3: 'doc-m3',
      'doc-m3': 'doc-m3',
      m35: 'doc-m35',
      'doc-m35': 'doc-m35',
      m41: 'doc-m41',
      'doc-m41': 'doc-m41',
      m42: 'doc-m42',
      'doc-m42': 'doc-m42',
      m5: 'doc-m5',
      'doc-m5': 'doc-m5',
      cert: 'doc-cert',
      'doc-cert': 'doc-cert',
      pdf: 'doc-pdf-bfd',
      bfd: 'doc-pdf-bfd',
      'doc-pdf-bfd': 'doc-pdf-bfd',
      qd521: 'doc-qd521',
      'doc-qd521': 'doc-qd521',
    };
    return map[raw] || 'doc-pdf-bfd';
  };

  const [selectedDocId, setSelectedDocId] = useState<string>(() => resolveDocId(docParam));
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectParam || '');
  const [projectData, setProjectData] = useState<any>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    if (docParam) {
      setSelectedDocId(resolveDocId(docParam));
    }
  }, [docParam]);

  useEffect(() => {
    api
      .get('/projects')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProjectsList(res.data);
          if (!projectParam) {
            setSelectedProjectId(res.data[0].project_id);
          }
        }
      })
      .catch(() => {});
  }, [projectParam]);

  useEffect(() => {
    const pid = projectParam || selectedProjectId;
    if (!pid) return;
    api
      .get(`/projects/${pid}`)
      .then((res) => {
        if (res.data) setProjectData(res.data);
      })
      .catch(() => {});
  }, [projectParam, selectedProjectId]);

  const currentDoc = ALL_DOCUMENTS.find((d) => d.id === selectedDocId) || SYSTEM_DOCUMENTS[0];
  const isProjectDoc = currentDoc.category === 'PROJECT';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Đã sao chép liên kết hồ sơ GWDU vào bộ nhớ tạm!');
  };

  const handlePrintOrExport = () => {
    if (selectedDocId === 'doc-pdf-bfd') {
      window.open('/docs/SRMS_BFD_final.drawio.pdf', '_blank');
    } else {
      printElement('gwdu-render-sheet', currentDoc.name);
    }
  };

  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId);
    setZoom(100);
    setRotation(0);
    const nextParams: Record<string, string> = { doc: docId };
    if (selectedProjectId) nextParams.projectId = selectedProjectId;
    setSearchParams(nextParams);
  };

  const handleSelectProject = (pid: string) => {
    setSelectedProjectId(pid);
    const nextParams: Record<string, string> = { doc: selectedDocId, projectId: pid };
    setSearchParams(nextParams);
  };

  const leaderMember =
    projectData?.project_members?.find((m: any) => m.member_role === 'LEADER' || m.member_role === 'LEAD') ||
    projectData?.project_members?.[0];
  const advisorMember = projectData?.project_advisors?.[0];
  const acceptanceGrade = projectData?.acceptances?.grade;
  const certRecord = projectData?.certificates?.[0];

  const renderDocumentContent = () => {
    if (selectedDocId === 'doc-pdf-bfd') {
      return (
        <div style={{ width: '100%', minHeight: 780, backgroundColor: '#525659', display: 'flex', justifyContent: 'center' }}>
          <iframe
            src="/docs/SRMS_BFD_final.drawio.pdf#toolbar=1"
            title="SRMS Architecture PDF Viewer"
            style={{ width: '100%', height: 780, border: 'none', borderRadius: 4 }}
          />
        </div>
      );
    }

    if (selectedDocId === 'doc-qd521') {
      return (
        <div style={{ fontFamily: '"Times New Roman", Times, serif', color: '#000000', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ textAlign: 'center', width: '48%' }}>
              <div style={{ fontSize: 12, fontWeight: 'bold' }}>BỘ THÔNG TIN VÀ TRUYỀN THÔNG</div>
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
            <div style={{ fontSize: 13, fontWeight: 'bold', marginTop: 4 }}>GIÁM ĐỐC HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
          </div>

          <div style={{ fontSize: 13, textAlign: 'justify', lineHeight: 1.8 }}>
            <p>
              <b>Căn cứ</b> Quyết định số 519/QĐ-BTTTT ngày 24/04/2017 của Bộ trưởng Bộ Thông tin và Truyền thông quy định chức năng, nhiệm vụ, quyền hạn và cơ cấu tổ chức của Học viện Công nghệ Bưu chính Viễn thông;
            </p>
            <p>
              <b>Căn cứ</b> Thông tư số 26/2014/TT-BGDĐT ngày 28/08/2014 của Bộ trưởng Bộ Giáo dục và Đào tạo ban hành Quy chế quản lý hoạt động nghiên cứu khoa học của sinh viên trong các cơ sở giáo dục đại học;
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
                <div style={{ fontSize: 11, fontStyle: 'italic' }}>(Đã ký và ban hành)</div>
                <div style={{ height: 60 }} />
                <div style={{ fontSize: 13, fontWeight: 'bold' }}>PGS.TS. Vũ Văn San</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!projectData) {
      return (
        <Alert
          type="info"
          showIcon
          message="Đang tải hoặc chưa chọn Đề tài thực tế"
          description="Vui lòng chọn một mã đề tài ở thanh công cụ phía trên để hiển thị hồ sơ số hóa từ CSDL."
        />
      );
    }

    switch (selectedDocId) {
      case 'doc-m1':
        return <Mau1CongVanKhoa project={projectData} />;
      case 'doc-m2':
        return <Mau2DeCuongChiTiet project={projectData} />;
      case 'doc-m3':
        return <Mau3BiaBaoCao project={projectData} />;
      case 'doc-m35':
        return <Mau35BienBanSinhHoat project={projectData} />;
      case 'doc-m41':
        return <Mau41PhieuDanhGia project={projectData} />;
      case 'doc-m42':
        return <Mau42BienBanHoiDong project={projectData} />;
      case 'doc-m5':
        return <Mau5DeNghiKhenThuong project={projectData} />;
      case 'doc-cert': {
        if (projectData.status !== 'ACCEPTED' && !acceptanceGrade) {
          return (
            <Alert
              type="warning"
              showIcon
              message="Đề tài chưa hoàn tất Nghiệm thu để cấp Giấy chứng nhận"
              description={`Đề tài ${projectData.project_id} hiện ở trạng thái "${STATUS_VI_MAP[projectData.status] || projectData.status}". Theo QĐ 521, Giấy chứng nhận NCKH chỉ được phát hành sau khi Hội đồng nghiệm thu phê duyệt kết quả đạt loại Khá trở lên.`}
            />
          );
        }
        return (
          <div style={{ backgroundColor: '#525659', padding: '24px 12px' }}>
            <PtitCertificate
              studentName={(leaderMember?.students?.users?.full_name || 'CHƯA CẬP NHẬT').toUpperCase()}
              studentClass={leaderMember?.students?.class_name || leaderMember?.students?.className || 'N/A'}
              department={projectData?.departments?.dept_name || 'Khoa chuyên môn'}
              projectTitle={projectData?.title_vi}
              projectCode={projectData?.project_id}
              academicYear={projectData?.nckh_periods?.academic_year || '2026-2027'}
              result={CERT_GRADE_MAP[acceptanceGrade] || acceptanceGrade || 'Đạt'}
              decisionNo={projectData?.decision_no || '521/QĐ-HV'}
              issueDate={certRecord?.issued_at ? new Date(certRecord.issued_at).toLocaleDateString('vi-VN') : 'Năm học 2026 - 2027'}
              certNo={certRecord?.cert_code || `CN-${projectData.project_id}`}
              signatoryTitle="GIÁM ĐỐC"
              signatoryName="PGS.TS. Đặng Hoài Bắc"
              printableId="gwdu-ptit-certificate"
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div>
      {/* BANNER CỔNG TÀI LIỆU SỐ GWDU */}
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
            <FilePdfOutlined style={{ color: '#C62828', fontSize: 22 }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
              Cổng Tài liệu Số & Minh chứng Đề tài (GWDU)
            </Title>
            <Tag color="green" icon={<SafetyCertificateOutlined />}>
              Kết nối Dữ liệu Thực
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>
            Trình xem tài liệu PDF kỹ thuật, văn bản gốc QĐ 521/QĐ-HV và hồ sơ số hóa đính kèm theo từng mã đề tài trong CSDL.
          </Text>
        </div>

        <Space size={10}>
          <Button icon={<LinkOutlined />} onClick={handleCopyLink}>
            Sao chép liên kết số
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            icon={selectedDocId === 'doc-pdf-bfd' ? <ExportOutlined /> : <PrinterOutlined />}
            onClick={handlePrintOrExport}
          >
            {selectedDocId === 'doc-pdf-bfd' ? 'Mở tệp PDF gốc' : 'In / Xuất PDF (A4)'}
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* CỘT TRÁI: TRÌNH XEM VĂN BẢN SỐ */}
        <Col xs={24} lg={18}>
          <Card
            bodyStyle={{ padding: 0 }}
            style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #EDEDEE' }}
          >
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
              <Space wrap>
                <Select
                  value={selectedDocId}
                  onChange={handleSelectDoc}
                  style={{ width: 360, fontWeight: 600 }}
                  options={[
                    {
                      label: 'Văn bản Gốc & Đặc tả Hệ thống',
                      options: SYSTEM_DOCUMENTS.map((d) => ({ value: d.id, label: d.name })),
                    },
                    {
                      label: 'Hồ sơ Số hóa theo Đề tài Thực tế',
                      options: PROJECT_DOCUMENTS.map((d) => ({ value: d.id, label: d.name })),
                    },
                  ]}
                />

                {isProjectDoc && projectsList.length > 0 && (
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Chọn Đề tài..."
                    value={selectedProjectId || undefined}
                    onChange={handleSelectProject}
                    style={{ width: 280 }}
                    options={projectsList.map((p: any) => ({
                      value: p.project_id,
                      label: `${p.project_id} — ${p.title_vi}`,
                    }))}
                  />
                )}
              </Space>

              {selectedDocId !== 'doc-pdf-bfd' && (
                <Space size={6}>
                  <Tooltip title="Thu nhỏ">
                    <Button size="small" icon={<ZoomOutOutlined />} onClick={() => setZoom((z) => Math.max(z - 15, 60))} />
                  </Tooltip>
                  <span style={{ fontSize: 12, width: 42, textAlign: 'center', fontWeight: 500 }}>{zoom}%</span>
                  <Tooltip title="Phóng to">
                    <Button size="small" icon={<ZoomInOutlined />} onClick={() => setZoom((z) => Math.min(z + 15, 180))} />
                  </Tooltip>
                  <Tooltip title="Xoay 90°">
                    <Button size="small" icon={<RotateRightOutlined />} onClick={() => setRotation((r) => (r + 90) % 360)} />
                  </Tooltip>
                </Space>
              )}
            </div>

            <div
              style={{
                height: '75vh',
                backgroundColor: '#525659',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflow: 'auto',
                padding: selectedDocId === 'doc-pdf-bfd' ? 0 : '24px 16px',
              }}
            >
              <div
                style={{
                  transform: selectedDocId === 'doc-pdf-bfd' ? undefined : `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  id="gwdu-render-sheet"
                  className={selectedDocId === 'doc-pdf-bfd' ? undefined : 'printable-a4-sheet'}
                  style={
                    selectedDocId === 'doc-pdf-bfd'
                      ? { width: '100%' }
                      : {
                          backgroundColor: '#FFFFFF',
                          width: '100%',
                          maxWidth: 740,
                          minHeight: '65vh',
                          padding: '36px 34px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                          borderRadius: 2,
                        }
                  }
                >
                  {renderDocumentContent()}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* CỘT PHẢI: METADATA THỰC CỦA TÀI LIỆU / ĐỀ TÀI */}
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
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>Định danh tệp GWDU:</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#C62828', marginTop: 2 }}>{currentDoc.fileName}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>Phân loại:</div>
              <Tag color="red" style={{ marginTop: 4 }}>{currentDoc.categoryLabel}</Tag>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>Nguồn dữ liệu:</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#262626', marginTop: 2 }}>{currentDoc.sourceNote}</div>
            </div>

            {isProjectDoc && projectData && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>Mã đề tài liên kết:</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{projectData.project_id}</div>
                  <Tag style={{ marginTop: 4 }}>{STATUS_VI_MAP[projectData.status] || projectData.status}</Tag>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>Chủ nhiệm đề tài:</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {leaderMember?.students?.users?.full_name || 'Chưa xác định'} ({leaderMember?.student_id || leaderMember?.students?.student_id || '—'})
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>Giảng viên hướng dẫn:</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {advisorMember?.lecturers?.users?.full_name || 'Chưa phân công'}
                  </div>
                </div>
                <Button
                  size="small"
                  block
                  onClick={() => navigate(`/projects/${projectData.project_id}`)}
                  style={{ marginTop: 4 }}
                >
                  Mở trang Chi tiết đề tài
                </Button>
              </>
            )}

            <Divider style={{ margin: '12px 0' }} />

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#262626', marginBottom: 4 }}>Mô tả tài liệu:</div>
              <div style={{ fontSize: 12, color: '#595959', lineHeight: 1.6 }}>{currentDoc.desc}</div>
            </div>

            <div
              style={{
                marginTop: 16,
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
              Muốn tải mẫu trắng QĐ 521 để tự điền, vui lòng chuyển sang mục <b>Biểu mẫu chuẩn QĐ 521</b>.
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
