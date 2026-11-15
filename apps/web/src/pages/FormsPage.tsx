import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Select, Space, Row, Col, Tag, Segmented, Alert } from 'antd';
import {
  PrinterOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  Mau1CongVanKhoa,
  Mau2DeCuongChiTiet,
  Mau3BiaBaoCao,
  Mau34BaoCaoTomTat,
  Mau35BienBanSinhHoat,
  Mau41PhieuDanhGia,
  Mau42BienBanHoiDong,
  Mau43BanNhanXet,
  Mau5DeNghiKhenThuong,
} from '../components/qd521/QD521Templates';
import api from '../services/api';
import { printElement } from '../utils/printHelper';

const { Title, Text } = Typography;

interface FormMeta {
  key: string;
  code: string;
  stage: string;
  title: string;
  fileName: string;
  preparer: string;
  approver: string;
  legalBasis: string;
  usageNote: string;
}

const QD521_FORMS: FormMeta[] = [
  {
    key: 'm1',
    code: 'Mẫu 1',
    stage: 'Giai đoạn 1: Đề xuất & Giao đề tài',
    title: 'Công văn đề xuất danh mục đề tài Khoa',
    fileName: 'Mau_1_Cong_van_Khoa',
    preparer: 'Thư ký Khoa / Ban Chủ nhiệm Khoa',
    approver: 'Trưởng Khoa ký trình P.QLKHCN',
    legalBasis: 'Điều 9 QĐ 521/QĐ-HV',
    usageNote: 'Tổng hợp danh mục các đề tài sinh viên đã qua sơ tuyển cấp Khoa để trình Giám đốc Học viện ra Quyết định giao.',
  },
  {
    key: 'm2',
    code: 'Mẫu 2',
    stage: 'Giai đoạn 1: Đề xuất & Giao đề tài',
    title: 'Thuyết minh Đề cương chi tiết (12 mục)',
    fileName: 'Mau_2_De_cuong_chi_tiet',
    preparer: 'Chủ nhiệm đề tài & Nhóm sinh viên',
    approver: 'GVHD (Cấp 1) → Lãnh đạo Khoa (Cấp 2)',
    legalBasis: 'Điều 9, Điều 15 QĐ 521/QĐ-HV',
    usageNote: 'Hồ sơ kỹ thuật cốt lõi gồm 12 mục nội dung nghiên cứu, tiến độ và dự toán kinh phí ban đầu.',
  },
  {
    key: 'm32',
    code: 'Mẫu 3.2 - 3.3',
    stage: 'Giai đoạn 2: Thực hiện & Tổng kết',
    title: 'Trang bìa & Bìa lót Báo cáo tổng kết',
    fileName: 'Mau_3_Bia_Bao_cao',
    preparer: 'Nhóm sinh viên thực hiện đề tài',
    approver: 'GVHD xác nhận trước khi nộp nghiệm thu',
    legalBasis: 'Điều 9 QĐ 521/QĐ-HV',
    usageNote: 'Quy cách bìa chính (Mẫu 3.2) và bìa phụ (Mẫu 3.3) đóng quyển Báo cáo tổng kết đề tài NCKH.',
  },
  {
    key: 'm34',
    code: 'Mẫu 3.4',
    stage: 'Giai đoạn 2: Thực hiện & Tổng kết',
    title: 'Báo cáo tóm tắt công trình nghiên cứu',
    fileName: 'Mau_3.4_Bao_cao_tom_tat',
    preparer: 'Chủ nhiệm đề tài',
    approver: 'GVHD kiểm tra trước phiên Hội đồng',
    legalBasis: 'Điều 9, Điều 10 QĐ 521/QĐ-HV',
    usageNote: 'Bản tóm tắt kết quả chính (tối đa 5 trang) gửi trước cho các thành viên Hội đồng phản biện đọc duyệt.',
  },
  {
    key: 'm35',
    code: 'Mẫu 3.5',
    stage: 'Giai đoạn 2: Thực hiện & Tổng kết',
    title: 'Biên bản Sinh hoạt khoa học / Hội thảo',
    fileName: 'Mau_3.5_Bien_ban_SHKH',
    preparer: 'Thư ký Khoa / Bộ môn',
    approver: 'Chủ tọa Hội thảo & Thư ký ký',
    legalBasis: 'Điều 9 QĐ 521/QĐ-HV',
    usageNote: 'Điều kiện bắt buộc ghi nhận ý kiến góp ý chuyên môn định kỳ trước khi đề tài được đưa ra nghiệm thu.',
  },
  {
    key: 'm41',
    code: 'Mẫu 4.1',
    stage: 'Giai đoạn 3: Nghiệm thu & Khen thưởng',
    title: 'Phiếu đánh giá đề tài (7 tiêu chí / 100đ)',
    fileName: 'Mau_4.1_Phieu_danh_gia',
    preparer: 'Từng Ủy viên Hội đồng Nghiệm thu',
    approver: 'Thành viên Hội đồng ký độc lập',
    legalBasis: 'Điều 10 QĐ 521/QĐ-HV',
    usageNote: 'Chấm điểm độc lập theo 7 tiêu chí (tổng 100 điểm). Phiếu lệch > 15 điểm so với TB ban đầu bị loại khỏi điểm tổng hợp.',
  },
  {
    key: 'm42',
    code: 'Mẫu 4.2',
    stage: 'Giai đoạn 3: Nghiệm thu & Khen thưởng',
    title: 'Biên bản họp Hội đồng Nghiệm thu',
    fileName: 'Mau_4.2_Bien_ban_Hoi_dong',
    preparer: 'Thư ký Hội đồng Nghiệm thu',
    approver: 'Chủ tịch Hội đồng & Thư ký ký',
    legalBasis: 'Điều 10 QĐ 521/QĐ-HV',
    usageNote: 'Chốt điểm trung bình hợp lệ, xếp loại (Xuất sắc/Tốt/Khá/Đạt/Không đạt) và kiến nghị xét giải thưởng.',
  },
  {
    key: 'm43',
    code: 'Mẫu 4.3',
    stage: 'Giai đoạn 3: Nghiệm thu & Khen thưởng',
    title: 'Bản nhận xét đánh giá của Phản biện',
    fileName: 'Mau_4.3_Ban_nhan_xet',
    preparer: 'Giảng viên / Chuyên gia Phản biện',
    approver: 'Phản biện ký xác nhận trước bảo vệ',
    legalBasis: 'Điều 10 QĐ 521/QĐ-HV',
    usageNote: 'Nhận xét chi tiết về tính mới, giá trị khoa học - thực tiễn, ưu nhược điểm và câu hỏi phản biện.',
  },
  {
    key: 'm5',
    code: 'Mẫu 5',
    stage: 'Giai đoạn 3: Nghiệm thu & Khen thưởng',
    title: 'Công văn đề nghị Khen thưởng & Hỗ trợ',
    fileName: 'Mau_5_De_nghi_Khen_thuong',
    preparer: 'Hội đồng Khoa học Khoa / P.QLKHCN',
    approver: 'Trưởng Khoa → P.QLKHCN → Giám đốc HV',
    legalBasis: 'Điều 14, Điều 15 QĐ 521/QĐ-HV',
    usageNote: 'Đề xuất khen thưởng cấp Học viện, xét điểm thưởng học bổng và hỗ trợ kinh phí dự thi Bộ GD&ĐT.',
  },
];

const BLANK_TEMPLATE_PROJECT = {
  project_id: 'SV-2026-.......-...',
  title_vi: '....................................................................................................................',
  title_en: '....................................................................................................................',
  research_field: '................................................',
  keywords: '................................................',
  departments: { dept_name: 'Khoa ............................................' },
  objectives: '....................................................................................................................',
  content: '....................................................................................................................',
  methodology: '....................................................................................................................',
  expected_result: '....................................................................................................................',
  project_members: [
    {
      member_role: 'LEADER',
      students: {
        student_id: 'B23........',
        className: 'D23CQ....',
        cohort: '2023 - 2028',
        studyYear: '...',
        gpa: '...',
        users: {
          full_name: '............................................',
          email: '....................@stu.ptit.edu.vn',
          phone: '09........',
        },
      },
    },
  ],
  project_advisors: [
    {
      lecturers: {
        lecturer_id: 'GV...',
        academic_rank: '',
        degree: '...',
        departments: { dept_name: 'Bộ môn ................................' },
        users: {
          full_name: '............................................',
          email: '....................@ptit.edu.vn',
          phone: '09........',
        },
      },
    },
  ],
  budgets: {
    faculty_proposed: 0,
    institute_approved: 0,
    disbursed_amount: 0,
  },
};

export const FormsPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('m1');
  const [dataMode, setDataMode] = useState<'blank' | 'project'>('blank');
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProjectData, setSelectedProjectData] = useState<any>(null);

  const handleSelectProject = async (projectId: string) => {
    setSelectedProjectId(projectId);
    try {
      const detail = await api.get(`/projects/${projectId}`);
      if (detail.data) {
        setSelectedProjectData(detail.data);
      }
    } catch {
      // Bỏ qua nếu lỗi mạng
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProjectsList(res.data);
          await handleSelectProject(res.data[0].project_id);
        }
      } catch {
        // Khi offline vẫn cho xem Mẫu trắng
      }
    };
    fetchProjects();
  }, []);

  const currentForm = QD521_FORMS.find((f) => f.key === activeKey) || QD521_FORMS[0];
  const activeProject = dataMode === 'project' && selectedProjectData ? selectedProjectData : BLANK_TEMPLATE_PROJECT;

  const renderFormComponent = () => {
    switch (activeKey) {
      case 'm1':
        return <Mau1CongVanKhoa project={activeProject} />;
      case 'm2':
        return <Mau2DeCuongChiTiet project={activeProject} />;
      case 'm32':
        return <Mau3BiaBaoCao project={activeProject} />;
      case 'm34':
        return <Mau34BaoCaoTomTat project={activeProject} />;
      case 'm35':
        return <Mau35BienBanSinhHoat project={activeProject} />;
      case 'm41':
        return <Mau41PhieuDanhGia project={activeProject} />;
      case 'm42':
        return <Mau42BienBanHoiDong project={activeProject} />;
      case 'm43':
        return <Mau43BanNhanXet project={activeProject} />;
      case 'm5':
        return <Mau5DeNghiKhenThuong project={activeProject} />;
      default:
        return <Mau1CongVanKhoa project={activeProject} />;
    }
  };

  const stages = Array.from(new Set(QD521_FORMS.map((f) => f.stage)));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
            Thư viện Biểu mẫu Hành chính chuẩn QĐ 521/QĐ-HV
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tra cứu 09 biểu mẫu chuẩn (Mẫu 1 đến Mẫu 5) dùng để tải/in mẫu trắng hoặc điền thử trực tiếp từ hồ sơ đề tài.
          </Text>
        </div>

        <Space wrap>
          <Segmented
            value={dataMode}
            onChange={(val) => setDataMode(val as 'blank' | 'project')}
            options={[
              { label: 'Mẫu trắng chuẩn QĐ 521', value: 'blank' },
              { label: 'Đổ dữ liệu Đề tài thực', value: 'project', disabled: projectsList.length === 0 },
            ]}
          />
          {dataMode === 'project' && projectsList.length > 0 && (
            <Select
              showSearch
              optionFilterProp="label"
              style={{ width: 300 }}
              value={selectedProjectId || undefined}
              onChange={handleSelectProject}
              options={projectsList.map((p: any) => ({
                value: p.project_id,
                label: `${p.project_id} — ${p.title_vi}`,
              }))}
            />
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* CỘT TRÁI: DANH MỤC 09 BIỂU MẪU THEO GIAI ĐOẠN */}
        <Col xs={24} lg={7}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: '#C62828' }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Danh mục Biểu mẫu (09 mẫu)</span>
              </Space>
            }
            bodyStyle={{ padding: '12px 12px' }}
            style={{ borderRadius: 8 }}
          >
            {stages.map((stage) => (
              <div key={stage} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: 6, paddingLeft: 4 }}>
                  {stage}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {QD521_FORMS.filter((f) => f.stage === stage).map((f) => {
                    const isActive = f.key === activeKey;
                    return (
                      <div
                        key={f.key}
                        onClick={() => setActiveKey(f.key)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          border: isActive ? '1px solid #C62828' : '1px solid #F0F0F0',
                          backgroundColor: isActive ? '#FFF1F0' : '#FFFFFF',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <Tag color={isActive ? 'red' : 'default'} style={{ margin: 0, fontWeight: 600 }}>
                            {f.code}
                          </Tag>
                          <span style={{ fontSize: 11, color: '#8c8c8c' }}>{f.legalBasis}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#C62828' : '#262626' }}>
                          {f.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>
        </Col>

        {/* CỘT PHẢI: HƯỚNG DẪN NGHIỆP VỤ + BẢN XEM TRƯỚC A4 */}
        <Col xs={24} lg={17}>
          <Card style={{ borderRadius: 8 }}>
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <Tag color="red" style={{ fontWeight: 700 }}>{currentForm.code}</Tag>
                <Text strong style={{ fontSize: 15 }}>{currentForm.title}</Text>
              </div>
              <Button
                type="primary"
                style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                icon={<PrinterOutlined />}
                onClick={() => printElement(`form-sheet-${currentForm.key}`, `${currentForm.fileName}_QD521_PTIT`)}
              >
                In / Xuất PDF (A4)
              </Button>
            </div>

            <Alert
              className="no-print"
              type="info"
              showIcon
              icon={<InfoCircleOutlined style={{ color: '#C62828' }} />}
              style={{ marginBottom: 16, backgroundColor: '#FFF7F5', borderColor: '#FADCD5' }}
              message={
                <span style={{ fontSize: 13 }}>
                  <b>Người lập:</b> {currentForm.preparer} &nbsp;|&nbsp; <b>Phê duyệt / Ký:</b> {currentForm.approver}
                </span>
              }
              description={<span style={{ fontSize: 12, color: '#595959' }}>{currentForm.usageNote}</span>}
            />

            <div id={`form-sheet-${currentForm.key}`} className="printable-a4-sheet">
              {renderFormComponent()}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
