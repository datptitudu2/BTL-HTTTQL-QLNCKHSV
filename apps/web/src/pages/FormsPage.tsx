import React, { useState, useEffect, useMemo } from 'react';
import { Card, Typography, Button, Select, Space, Row, Col, Tag, Segmented, Alert, Input, DatePicker, Checkbox, Divider, Collapse, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import {
  PrinterOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useAuth } from '../context/AuthContext';
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const roleCode = user?.roleCode || '';
  const canScreenFaculty = ['FACULTY_SECRETARY', 'FACULTY_LEADER', 'ADMIN'].includes(roleCode);

  const initialForm = searchParams.get('form') || 'm1';
  const initialMode = searchParams.get('mode') === 'project' ? 'project' : 'blank';

  const [activeKey, setActiveKey] = useState<string>(initialForm);
  const [dataMode, setDataMode] = useState<'blank' | 'project'>(initialMode);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProjectData, setSelectedProjectData] = useState<any>(null);

  // State riêng cho Form Soạn / Lập Công văn tổng hợp cấp Khoa (Mẫu 1)
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>(user?.deptId);
  const [m1Scope, setM1Scope] = useState<'ELIGIBLE' | 'FACULTY_APPROVED' | 'ALL'>('ELIGIBLE');
  const [officialLetterNo, setOfficialLetterNo] = useState<string>('');
  const [issueDate, setIssueDate] = useState<Dayjs | null>(dayjs());
  const [periodName, setPeriodName] = useState<string>('2026 - 2027');
  const [recipient, setRecipient] = useState<string>('Phòng Quản lý Khoa học công nghệ và Hợp tác quốc tế');
  const [councilChair, setCouncilChair] = useState<string>('PGS.TS. Hoàng Minh');
  const [deanName, setDeanName] = useState<string>('Trưởng Khoa');
  const [m1SelectedIds, setM1SelectedIds] = useState<string[]>([]);
  const [submittingDossier, setSubmittingDossier] = useState<boolean>(false);

  // State cho Form Soạn Biên bản Sinh hoạt khoa học (Mẫu 3.5) — tự đồng bộ từ DB seminars/progress_reports
  const [m35Date, setM35Date] = useState<Dayjs | null>(dayjs());
  const [m35Time, setM35Time] = useState<string>('');
  const [m35Location, setM35Location] = useState<string>('');
  const [m35Chair, setM35Chair] = useState<string>('');
  const [m35Secretary, setM35Secretary] = useState<string>(user?.fullName || '');
  const [m35Attendees, setM35Attendees] = useState<string>('');
  const [m35Progress, setM35Progress] = useState<string>('');
  const [m35Feedback, setM35Feedback] = useState<string>('');
  const [m35Explanation, setM35Explanation] = useState<string>('');
  const [m35Conclusion, setM35Conclusion] = useState<string>('');
  const [hasRealSeminar, setHasRealSeminar] = useState<boolean>(false);

  // State cho Form Bản nhận xét Phản biện (Mẫu 4.3) — tự đồng bộ từ DB acceptances.sheets
  const [m43Date, setM43Date] = useState<Dayjs | null>(dayjs());
  const [m43ReviewerName, setM43ReviewerName] = useState<string>('');
  const [m43ReviewerRole, setM43ReviewerRole] = useState<string>('Ủy viên Phản biện');
  const [m43ReviewerDept, setM43ReviewerDept] = useState<string>('');
  const [m43Urgency, setM43Urgency] = useState<string>('');
  const [m43Method, setM43Method] = useState<string>('');
  const [m43Practical, setM43Practical] = useState<string>('');
  const [m43Improve, setM43Improve] = useState<string>('');
  const [m43Conclusion, setM43Conclusion] = useState<string>('');
  const [hasRealReviewSheet, setHasRealReviewSheet] = useState<boolean>(false);

  // State cho Form Công văn Đề nghị Khen thưởng (Mẫu 5)
  const [m5LetterNo, setM5LetterNo] = useState<string>('88/CV-KHOA');
  const [m5Date, setM5Date] = useState<Dayjs | null>(dayjs());
  const [m5Recipient, setM5Recipient] = useState<string>('Giám đốc Học viện Công nghệ Bưu chính Viễn thông');
  const [m5AwardType, setM5AwardType] = useState<string>('Khen thưởng Học viện');
  const [m5SelectedIds, setM5SelectedIds] = useState<string[]>([]);

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
    if (!selectedProjectData) return;

    // 1. Đồng bộ Mẫu 3.5 từ dữ liệu buổi Sinh hoạt khoa học & Tiến độ thật của đề tài
    const latestSeminar = selectedProjectData.seminars?.[0];
    const latestReport = selectedProjectData.progress_reports?.[0];
    if (latestSeminar) {
      setHasRealSeminar(true);
      const held = latestSeminar.held_at ? dayjs(latestSeminar.held_at) : dayjs();
      setM35Date(held);
      setM35Time(held.format('HH [giờ] mm'));
      setM35Location(latestSeminar.location || '');
      setM35Progress(latestReport?.report_content || '');
      setM35Feedback(latestSeminar.feedback || latestSeminar.discussion || '');
      setM35Explanation(latestSeminar.revision_requests || '');
      setM35Conclusion(latestSeminar.overall_assessment || '');
      setM35Attendees('Thành viên Hội đồng chuyên môn Khoa và nhóm sinh viên thực hiện đề tài.');
    } else {
      setHasRealSeminar(false);
      setM35Date(dayjs());
      setM35Time('');
      setM35Location('');
      setM35Progress(latestReport?.report_content || '');
      setM35Feedback('');
      setM35Explanation('');
      setM35Conclusion('');
      setM35Attendees('');
    }
    const advisorName = selectedProjectData.project_advisors?.[0]?.lecturers?.users?.full_name;
    setM35Chair(advisorName || '');
    setM35Secretary(user?.fullName || '');

    // 2. Đồng bộ Mẫu 4.3 từ Phiếu đánh giá / Nhận xét phản biện thật trong DB (acceptances.sheets)
    const sheets: any[] = selectedProjectData.acceptances?.sheets || [];
    const councilMembers: any[] = selectedProjectData.acceptances?.councils?.council_members || [];
    const reviewerSheet =
      sheets.find((s) => ['REVIEWER', 'PHAN_BIEN', 'CRITIC'].includes(String(s.council_role || '').toUpperCase())) ||
      sheets[0];
    const reviewerMember = councilMembers.find((cm) =>
      ['REVIEWER', 'PHAN_BIEN', 'CRITIC'].includes(String(cm.council_role || '').toUpperCase()),
    );

    if (reviewerSheet) {
      setHasRealReviewSheet(true);
      setM43ReviewerName(reviewerSheet.lecturer_name || reviewerMember?.lecturers?.users?.full_name || '');
      setM43ReviewerRole(
        reviewerSheet.council_role === 'REVIEWER'
          ? 'Ủy viên Phản biện'
          : reviewerSheet.council_role === 'CHAIR'
          ? 'Chủ tịch Hội đồng'
          : reviewerSheet.council_role || 'Thành viên Hội đồng',
      );
      setM43ReviewerDept(reviewerSheet.dept_name || selectedProjectData.departments?.dept_name || '');
      setM43Date(reviewerSheet.submitted_at || reviewerSheet.scored_at ? dayjs(reviewerSheet.submitted_at || reviewerSheet.scored_at) : dayjs());
      setM43Urgency(reviewerSheet.strengths || '');
      setM43Method(reviewerSheet.qa_comment || reviewerSheet.qa_notes || '');
      setM43Practical(reviewerSheet.strengths || '');
      setM43Improve(reviewerSheet.limitations || '');
      setM43Conclusion(reviewerSheet.conclusion_award_rec || '');
    } else {
      setHasRealReviewSheet(false);
      setM43ReviewerName(reviewerMember?.lecturers?.users?.full_name || '');
      setM43ReviewerRole(reviewerMember ? 'Ủy viên Phản biện' : '');
      setM43ReviewerDept(reviewerMember?.lecturers?.departments?.dept_name || selectedProjectData.departments?.dept_name || '');
      setM43Date(dayjs());
      setM43Urgency('');
      setM43Method('');
      setM43Practical('');
      setM43Improve('');
      setM43Conclusion('');
    }
  }, [selectedProjectData, user?.fullName]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setProjectsList(res.data);
        if (!selectedProjectId) {
          await handleSelectProject(res.data[0].project_id);
        }
      }
    } catch {
      // Khi offline vẫn cho xem Mẫu trắng
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const deptOptions = useMemo(() => {
    const map = new Map<number, { dept_id: number; dept_name: string; dept_code?: string }>();
    projectsList.forEach((p: any) => {
      const dId = p.dept_id || p.departments?.dept_id;
      if (dId && !map.has(dId)) {
        map.set(dId, {
          dept_id: dId,
          dept_name: p.departments?.dept_name || `Khoa #${dId}`,
          dept_code: p.departments?.dept_code,
        });
      }
    });
    return Array.from(map.values());
  }, [projectsList]);

  useEffect(() => {
    if (user?.deptId) {
      setSelectedDeptId(user.deptId);
    } else if (!selectedDeptId && deptOptions.length > 0) {
      setSelectedDeptId(deptOptions[0].dept_id);
    }
  }, [user?.deptId, deptOptions.length]);

  const deptProjects = useMemo(() => {
    if (!selectedDeptId) return projectsList;
    return projectsList.filter((p: any) => (p.dept_id || p.departments?.dept_id) === selectedDeptId);
  }, [projectsList, selectedDeptId]);

  const m1FilteredProjects = useMemo(() => {
    if (m1Scope === 'FACULTY_APPROVED') {
      return deptProjects.filter((p: any) => p.status === 'FACULTY_APPROVED');
    }
    if (m1Scope === 'ELIGIBLE') {
      return deptProjects.filter((p: any) =>
        ['PROPOSED', 'FACULTY_APPROVED', 'ONGOING', 'ACCEPTED'].includes(p.status),
      );
    }
    return deptProjects;
  }, [deptProjects, m1Scope]);

  useEffect(() => {
    setM1SelectedIds(m1FilteredProjects.map((p: any) => p.project_id));
  }, [m1FilteredProjects]);

  const m5CandidateProjects = useMemo(() => {
    const accepted = deptProjects.filter((p: any) => p.status === 'ACCEPTED');
    return accepted.length > 0 ? accepted : deptProjects;
  }, [deptProjects]);

  useEffect(() => {
    setM5SelectedIds(m5CandidateProjects.map((p: any) => p.project_id));
  }, [m5CandidateProjects]);

  const m5CheckedProjects = useMemo(
    () => m5CandidateProjects.filter((p: any) => m5SelectedIds.includes(p.project_id)),
    [m5CandidateProjects, m5SelectedIds],
  );

  const m1CheckedProjects = useMemo(
    () => m1FilteredProjects.filter((p: any) => m1SelectedIds.includes(p.project_id)),
    [m1FilteredProjects, m1SelectedIds],
  );

  const proposedSelectedProjects = useMemo(
    () => m1CheckedProjects.filter((p: any) => p.status === 'PROPOSED'),
    [m1CheckedProjects],
  );

  const proposedCountInDept = proposedSelectedProjects.length;

  const selectedDeptInfo = deptOptions.find((d) => d.dept_id === selectedDeptId);

  useEffect(() => {
    const existingNo = deptProjects.find((p: any) => p?.dossier?.officialLetterNo)?.dossier?.officialLetterNo;
    if (existingNo) {
      setOfficialLetterNo(existingNo);
    } else if (selectedDeptInfo?.dept_code) {
      setOfficialLetterNo(`CV-${selectedDeptInfo.dept_code}-${new Date().getFullYear()}`);
    }
    const existingPeriod = deptProjects.find((p: any) => p?.nckh_periods?.period_name)?.nckh_periods?.period_name;
    if (existingPeriod) {
      setPeriodName(existingPeriod);
    }
  }, [selectedDeptId, deptProjects.length]);

  const handleSubmitFacultyDossier = async () => {
    if (m1CheckedProjects.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 đề tài đưa vào Công văn Mẫu 1');
      return;
    }
    const targets = proposedSelectedProjects.length > 0
      ? proposedSelectedProjects
      : m1CheckedProjects.filter((p: any) => p.status === 'FACULTY_APPROVED');

    if (targets.length === 0) {
      message.info('Các đề tài được chọn đã có Quyết định giao hoặc đã qua bước sơ tuyển Khoa.');
      return;
    }

    try {
      setSubmittingDossier(true);
      for (const p of targets) {
        await api.patch(`/projects/${p.project_id}/status`, {
          status: 'FACULTY_APPROVED',
          officialLetterNo: officialLetterNo || undefined,
          reason: `Lập Công văn Mẫu 1 (${officialLetterNo || 'CV Khoa'}) tổng hợp ${m1CheckedProjects.length} đề tài trình P.QLKH&CN`,
        });
      }
      message.success(
        proposedSelectedProjects.length > 0
          ? `Đã sơ tuyển ${proposedSelectedProjects.length} đề tài & lưu Công văn Mẫu 1 (${officialLetterNo}) trình P.QLKH&CN!`
          : `Đã cập nhật Số công văn Mẫu 1 (${officialLetterNo}) cho hồ sơ Khoa!`,
      );
      await fetchProjects();
    } catch (err: any) {
      message.error(err.response?.data?.message || err.response?.data?.detail || 'Không thể lưu Công văn Mẫu 1');
    } finally {
      setSubmittingDossier(false);
    }
  };

  const formattedIssueDate = issueDate
    ? `Hà Nội, ngày ${issueDate.format('DD')} tháng ${issueDate.format('MM')} năm ${issueDate.format('YYYY')}`
    : undefined;

  const currentForm = QD521_FORMS.find((f) => f.key === activeKey) || QD521_FORMS[0];
  const activeProject = dataMode === 'project' && selectedProjectData ? selectedProjectData : BLANK_TEMPLATE_PROJECT;

  const renderFormComponent = () => {
    switch (activeKey) {
      case 'm1':
        return dataMode === 'project' ? (
          <Mau1CongVanKhoa
            projects={m1CheckedProjects}
            isBlank={false}
            departmentName={selectedDeptInfo?.dept_name}
            periodName={periodName}
            officialLetterNo={officialLetterNo}
            issueDate={formattedIssueDate}
            recipient={recipient}
            councilChair={councilChair}
            deanName={deanName}
          />
        ) : (
          <Mau1CongVanKhoa project={BLANK_TEMPLATE_PROJECT} isBlank />
        );
      case 'm2':
        return <Mau2DeCuongChiTiet project={activeProject} />;
      case 'm32':
        return <Mau3BiaBaoCao project={activeProject} />;
      case 'm34':
        return <Mau34BaoCaoTomTat project={activeProject} />;
      case 'm35':
        return dataMode === 'project' ? (
          <Mau35BienBanSinhHoat
            project={activeProject}
            isBlank={false}
            meetingDate={m35Date ? `Hà Nội, ngày ${m35Date.format('DD')} tháng ${m35Date.format('MM')} năm ${m35Date.format('YYYY')}` : undefined}
            meetingTime={m35Time}
            location={m35Location}
            chairName={m35Chair}
            secretaryName={m35Secretary}
            attendees={m35Attendees}
            progressNote={m35Progress}
            feedbackNote={m35Feedback}
            explanationNote={m35Explanation}
            conclusionNote={m35Conclusion}
          />
        ) : (
          <Mau35BienBanSinhHoat project={BLANK_TEMPLATE_PROJECT} isBlank />
        );
      case 'm41':
        return <Mau41PhieuDanhGia project={activeProject} />;
      case 'm42':
        return <Mau42BienBanHoiDong project={activeProject} />;
      case 'm43':
        return dataMode === 'project' ? (
          <Mau43BanNhanXet
            project={activeProject}
            isBlank={false}
            reviewDate={m43Date ? `Hà Nội, ngày ${m43Date.format('DD')} tháng ${m43Date.format('MM')} năm ${m43Date.format('YYYY')}` : undefined}
            reviewerName={m43ReviewerName}
            reviewerRole={m43ReviewerRole}
            reviewerDept={m43ReviewerDept}
            urgencyComment={m43Urgency}
            methodComment={m43Method}
            practicalComment={m43Practical}
            improveComment={m43Improve}
            conclusionComment={m43Conclusion}
          />
        ) : (
          <Mau43BanNhanXet project={BLANK_TEMPLATE_PROJECT} isBlank />
        );
      case 'm5':
        return dataMode === 'project' ? (
          <Mau5DeNghiKhenThuong
            projects={m5CheckedProjects}
            isBlank={false}
            departmentName={selectedDeptInfo?.dept_name}
            periodName={periodName}
            officialLetterNo={m5LetterNo}
            issueDate={m5Date ? `Hà Nội, ngày ${m5Date.format('DD')} tháng ${m5Date.format('MM')} năm ${m5Date.format('YYYY')}` : undefined}
            recipient={m5Recipient}
            deanName={deanName}
            awardType={m5AwardType}
          />
        ) : (
          <Mau5DeNghiKhenThuong project={BLANK_TEMPLATE_PROJECT} isBlank />
        );
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
              {
                label: ['m1', 'm35', 'm43', 'm5'].includes(activeKey)
                  ? 'Soạn / Lập biểu mẫu'
                  : 'Đổ dữ liệu Đề tài thực',
                value: 'project',
                disabled: projectsList.length === 0,
              },
            ]}
          />
          {dataMode === 'project' && projectsList.length > 0 && !['m1', 'm5'].includes(activeKey) && (
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
        <Col xs={24} lg={6}>
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
        <Col xs={24} lg={18}>
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

            {['m1', 'm35', 'm43', 'm5'].includes(activeKey) && dataMode === 'blank' && (
              <Alert
                className="no-print"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message={
                  <span style={{ fontSize: 13 }}>
                    Bạn đang xem <b>Mẫu trắng để in</b>. Để điền thông tin trực tiếp lên biểu mẫu từ dữ liệu thật, chuyển sang chế độ{' '}
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0, fontWeight: 700 }}
                      onClick={() => setDataMode('project')}
                    >
                      Soạn / Lập biểu mẫu
                    </Button>.
                  </span>
                }
              />
            )}

            {activeKey === 'm35' && dataMode === 'project' && (
              <Collapse
                className="no-print"
                defaultActiveKey={['m35-editor']}
                style={{ marginBottom: 16, backgroundColor: '#FAFAFA', borderColor: '#E8E8E8', borderRadius: 8 }}
                items={[
                  {
                    key: 'm35-editor',
                    label: (
                      <Space>
                        <FormOutlined style={{ color: '#C62828' }} />
                        <span style={{ fontWeight: 700, fontSize: 13 }}>Biểu mẫu Soạn Biên bản Sinh hoạt khoa học (Mẫu 3.5)</span>
                      </Space>
                    ),
                    children: (
                      <div>
                        <Alert
                          type={hasRealSeminar ? 'success' : 'info'}
                          showIcon
                          style={{ marginBottom: 12 }}
                          message={
                            hasRealSeminar
                              ? `Đã tự động đổ dữ liệu từ buổi Sinh hoạt khoa học thật của đề tài ${selectedProjectData?.project_id}.`
                              : `Đề tài ${selectedProjectData?.project_id || ''} chưa có biên bản Sinh hoạt khoa học trên hệ thống — bạn có thể điền trực tiếp hoặc cập nhật tại Tiến độ & Sinh hoạt KH.`
                          }
                          action={
                            <Button size="small" icon={<ArrowRightOutlined />} onClick={() => navigate('/progress')}>
                              Mở Tiến độ &amp; SHKH
                            </Button>
                          }
                        />
                        <Row gutter={[12, 10]}>
                        <Col xs={24} sm={8}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Ngày họp</div>
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" value={m35Date} onChange={(d) => setM35Date(d)} />
                        </Col>
                        <Col xs={24} sm={8}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Giờ họp</div>
                          <Input value={m35Time} onChange={(e) => setM35Time(e.target.value)} />
                        </Col>
                        <Col xs={24} sm={8}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Địa điểm</div>
                          <Input value={m35Location} onChange={(e) => setM35Location(e.target.value)} />
                        </Col>
                        <Col xs={24} sm={12}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Chủ tọa</div>
                          <Input value={m35Chair} onChange={(e) => setM35Chair(e.target.value)} />
                        </Col>
                        <Col xs={24} sm={12}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Thư ký hội thảo</div>
                          <Input value={m35Secretary} onChange={(e) => setM35Secretary(e.target.value)} />
                        </Col>
                        <Col xs={24}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Thành phần tham dự</div>
                          <Input value={m35Attendees} onChange={(e) => setM35Attendees(e.target.value)} />
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Tiến độ công việc đã đạt được</div>
                          <Input.TextArea rows={2} value={m35Progress} onChange={(e) => setM35Progress(e.target.value)} />
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Ý kiến góp ý chuyên môn</div>
                          <Input.TextArea rows={2} value={m35Feedback} onChange={(e) => setM35Feedback(e.target.value)} />
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Ý kiến giải trình của nhóm</div>
                          <Input.TextArea rows={2} value={m35Explanation} onChange={(e) => setM35Explanation(e.target.value)} />
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Kết luận của Hội thảo</div>
                          <Input.TextArea rows={2} value={m35Conclusion} onChange={(e) => setM35Conclusion(e.target.value)} />
                        </Col>
                      </Row>
                      </div>
                    ),
                  },
                ]}
              />
            )}

            {activeKey === 'm43' && dataMode === 'project' && (
              <Collapse
                className="no-print"
                defaultActiveKey={['m43-editor']}
                style={{ marginBottom: 16, backgroundColor: '#FAFAFA', borderColor: '#E8E8E8', borderRadius: 8 }}
                items={[
                  {
                    key: 'm43-editor',
                    label: (
                      <Space>
                        <FormOutlined style={{ color: '#C62828' }} />
                        <span style={{ fontWeight: 700, fontSize: 13 }}>Biểu mẫu Soạn Bản nhận xét Phản biện (Mẫu 4.3)</span>
                      </Space>
                    ),
                    children: (
                      <div>
                        <Alert
                          type={hasRealReviewSheet ? 'success' : 'info'}
                          showIcon
                          style={{ marginBottom: 12 }}
                          message={
                            hasRealReviewSheet
                              ? `Đã tự động lấy nhận xét phản biện thật từ Hội đồng nghiệm thu của đề tài ${selectedProjectData?.project_id}.`
                              : `Đề tài ${selectedProjectData?.project_id || ''} chưa có phiếu nhận xét phản biện trong CSDL — bạn có thể điền trực tiếp hoặc chấm tại Nghiệm thu & Đánh giá.`
                          }
                          action={
                            <Button size="small" icon={<ArrowRightOutlined />} onClick={() => navigate('/acceptance')}>
                              Mở Nghiệm thu
                            </Button>
                          }
                        />
                        <Row gutter={[12, 10]}>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Ngày nhận xét</div>
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" value={m43Date} onChange={(d) => setM43Date(d)} />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Họ tên Phản biện</div>
                          <Input value={m43ReviewerName} onChange={(e) => setM43ReviewerName(e.target.value)} />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Vai trò trong Hội đồng</div>
                          <Input value={m43ReviewerRole} onChange={(e) => setM43ReviewerRole(e.target.value)} />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Đơn vị công tác</div>
                          <Input value={m43ReviewerDept} onChange={(e) => setM43ReviewerDept(e.target.value)} />
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>1. Tính thời sự &amp; ý nghĩa khoa học</div>
                          <Input.TextArea rows={2} value={m43Urgency} onChange={(e) => setM43Urgency(e.target.value)} />
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>2. Phương pháp nghiên cứu &amp; giải pháp</div>
                          <Input.TextArea rows={2} value={m43Method} onChange={(e) => setM43Method(e.target.value)} />
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>3. Giá trị thực tiễn &amp; khả năng ứng dụng</div>
                          <Input.TextArea rows={2} value={m43Practical} onChange={(e) => setM43Practical(e.target.value)} />
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>4. Điểm cần hoàn thiện</div>
                          <Input.TextArea rows={2} value={m43Improve} onChange={(e) => setM43Improve(e.target.value)} />
                        </Col>
                        <Col xs={24}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Kết luận &amp; Đánh giá</div>
                          <Input value={m43Conclusion} onChange={(e) => setM43Conclusion(e.target.value)} />
                        </Col>
                      </Row>
                      </div>
                    ),
                  },
                ]}
              />
            )}

            {activeKey === 'm5' && dataMode === 'project' && (
              <Collapse
                className="no-print"
                defaultActiveKey={['m5-editor']}
                style={{ marginBottom: 16, backgroundColor: '#FAFAFA', borderColor: '#E8E8E8', borderRadius: 8 }}
                items={[
                  {
                    key: 'm5-editor',
                    label: (
                      <Space>
                        <FormOutlined style={{ color: '#C62828' }} />
                        <span style={{ fontWeight: 700, fontSize: 13 }}>Biểu mẫu Soạn Công văn Đề nghị Khen thưởng (Mẫu 5)</span>
                        <Tag color="red" style={{ margin: 0, fontSize: 11 }}>{m5CheckedProjects.length} đề tài</Tag>
                      </Space>
                    ),
                    children: (
                      <div>
                        <Row gutter={[12, 10]}>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Đơn vị / Khoa</div>
                            <Select
                              style={{ width: '100%' }}
                              value={selectedDeptId}
                              disabled={Boolean(user?.deptId && ['FACULTY_SECRETARY', 'FACULTY_LEADER'].includes(roleCode))}
                              onChange={(val) => setSelectedDeptId(val)}
                              options={deptOptions.map((d) => ({ value: d.dept_id, label: d.dept_name }))}
                            />
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Số công văn (Mẫu 5)</div>
                            <Input value={m5LetterNo} onChange={(e) => setM5LetterNo(e.target.value)} />
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Ngày ban hành</div>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" value={m5Date} onChange={(d) => setM5Date(d)} />
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Hình thức đề nghị</div>
                            <Select
                              style={{ width: '100%' }}
                              value={m5AwardType}
                              onChange={(v) => setM5AwardType(v)}
                              options={[
                                { value: 'Khen thưởng Học viện', label: 'Khen thưởng Học viện' },
                                { value: 'Dự thi Bộ GD&ĐT', label: 'Dự thi Bộ GD&ĐT' },
                                { value: 'Khen thưởng + Điểm RL', label: 'Khen thưởng + Điểm RL' },
                              ]}
                            />
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Trưởng Khoa ký duyệt</div>
                            <Input value={deanName} onChange={(e) => setDeanName(e.target.value)} />
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Kính gửi</div>
                            <Input value={m5Recipient} onChange={(e) => setM5Recipient(e.target.value)} />
                          </Col>
                        </Row>

                        <Divider style={{ margin: '12px 0 8px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>
                            Chọn đề tài đề nghị khen thưởng ({m5CheckedProjects.length}/{m5CandidateProjects.length} đề tài)
                          </span>
                          <Space size={8}>
                            <Button size="small" onClick={() => setM5SelectedIds(m5CandidateProjects.map((p: any) => p.project_id))}>Chọn tất cả</Button>
                            <Button size="small" onClick={() => setM5SelectedIds([])}>Bỏ chọn</Button>
                            <Button size="small" icon={<ArrowRightOutlined />} onClick={() => navigate('/awards')}>Mở Khen thưởng</Button>
                          </Space>
                        </div>
                        <div style={{ maxHeight: 140, overflowY: 'auto', border: '1px solid #EDEDEE', borderRadius: 6, backgroundColor: '#FFFFFF', padding: '6px 10px' }}>
                          <Checkbox.Group style={{ width: '100%' }} value={m5SelectedIds} onChange={(vals) => setM5SelectedIds(vals as string[])}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {m5CandidateProjects.map((p: any) => (
                                <Checkbox key={p.project_id} value={p.project_id} style={{ marginLeft: 0 }}>
                                  <span style={{ fontSize: 12 }}>
                                    <b>{p.project_id}</b> — {p.title_vi}
                                  </span>
                                </Checkbox>
                              ))}
                            </div>
                          </Checkbox.Group>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            )}

            {activeKey === 'm1' && dataMode === 'project' && (
              <Collapse
                className="no-print"
                defaultActiveKey={['m1-editor']}
                style={{ marginBottom: 16, backgroundColor: '#FAFAFA', borderColor: '#E8E8E8', borderRadius: 8 }}
                items={[
                  {
                    key: 'm1-editor',
                    label: (
                      <Space>
                        <FormOutlined style={{ color: '#C62828' }} />
                        <span style={{ fontWeight: 700, fontSize: 13 }}>
                          Biểu mẫu Soạn thảo Công văn Mẫu 1
                        </span>
                        <Tag color="red" style={{ margin: 0, fontSize: 11 }}>
                          {m1CheckedProjects.length} đề tài
                        </Tag>
                      </Space>
                    ),
                    children: (
                      <div>
                        <Row gutter={[12, 12]}>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#434343', marginBottom: 4 }}>Đơn vị / Khoa</div>
                            <Select
                              style={{ width: '100%' }}
                              value={selectedDeptId}
                              disabled={Boolean(user?.deptId && ['FACULTY_SECRETARY', 'FACULTY_LEADER'].includes(roleCode))}
                              onChange={(val) => setSelectedDeptId(val)}
                              options={deptOptions.map((d) => ({ value: d.dept_id, label: d.dept_name }))}
                            />
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#434343', marginBottom: 4 }}>Số công văn (Mẫu 1)</div>
                            <Input
                              placeholder="VD: 45/HV-CNTT1"
                              value={officialLetterNo}
                              onChange={(e) => setOfficialLetterNo(e.target.value)}
                            />
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#434343', marginBottom: 4 }}>Ngày ban hành</div>
                            <DatePicker
                              style={{ width: '100%' }}
                              format="DD/MM/YYYY"
                              value={issueDate}
                              onChange={(d) => setIssueDate(d)}
                            />
                          </Col>

                          <Col xs={24} md={12}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#434343', marginBottom: 4 }}>Năm học / Đợt NCKH</div>
                            <Input
                              value={periodName}
                              onChange={(e) => setPeriodName(e.target.value)}
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#434343', marginBottom: 4 }}>Kính gửi</div>
                            <Input
                              value={recipient}
                              onChange={(e) => setRecipient(e.target.value)}
                            />
                          </Col>

                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#434343', marginBottom: 4 }}>Chủ tịch HĐKH Khoa</div>
                            <Input
                              placeholder="Họ tên Chủ tịch HĐKH Khoa"
                              value={councilChair}
                              onChange={(e) => setCouncilChair(e.target.value)}
                            />
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#434343', marginBottom: 4 }}>Trưởng Khoa ký duyệt</div>
                            <Input
                              placeholder="Họ tên Trưởng Khoa"
                              value={deanName}
                              onChange={(e) => setDeanName(e.target.value)}
                            />
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#434343', marginBottom: 4 }}>Phạm vi lọc đề tài Khoa</div>
                            <Select
                              style={{ width: '100%' }}
                              value={m1Scope}
                              onChange={(val) => setM1Scope(val)}
                              options={[
                                { value: 'ELIGIBLE', label: 'Đề tài hợp lệ của Khoa' },
                                { value: 'FACULTY_APPROVED', label: 'Chỉ đề tài Khoa đã duyệt' },
                                { value: 'ALL', label: 'Tất cả đề tài của Khoa' },
                              ]}
                            />
                          </Col>
                        </Row>

                        <Divider style={{ margin: '14px 0 10px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#262626' }}>
                            Danh sách đề tài đưa vào Công văn ({m1CheckedProjects.length}/{m1FilteredProjects.length} đề tài)
                          </span>
                          <Space size={8}>
                            <Button size="small" onClick={() => setM1SelectedIds(m1FilteredProjects.map((p: any) => p.project_id))}>
                              Chọn tất cả
                            </Button>
                            <Button size="small" onClick={() => setM1SelectedIds([])}>
                              Bỏ chọn
                            </Button>
                          </Space>
                        </div>

                        <div style={{ maxHeight: 170, overflowY: 'auto', border: '1px solid #EDEDEE', borderRadius: 6, backgroundColor: '#FFFFFF', padding: '6px 10px' }}>
                          <Checkbox.Group
                            style={{ width: '100%' }}
                            value={m1SelectedIds}
                            onChange={(vals) => setM1SelectedIds(vals as string[])}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {m1FilteredProjects.map((p: any) => {
                                const statusInfo =
                                  p.status === 'PROPOSED'
                                    ? { color: 'orange', text: 'Chờ Khoa duyệt' }
                                    : p.status === 'FACULTY_APPROVED'
                                    ? { color: 'purple', text: 'Khoa đã duyệt' }
                                    : p.status === 'ONGOING'
                                    ? { color: 'blue', text: 'Đang thực hiện' }
                                    : p.status === 'ACCEPTED'
                                    ? { color: 'green', text: 'Đã nghiệm thu' }
                                    : { color: 'default', text: p.status };
                                return (
                                  <div
                                    key={p.project_id}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      gap: 8,
                                      padding: '4px 6px',
                                      borderRadius: 4,
                                      borderBottom: '1px solid #F5F5F5',
                                    }}
                                  >
                                    <Checkbox value={p.project_id} style={{ marginLeft: 0, flex: 1 }}>
                                      <span style={{ fontSize: 12 }}>
                                        <b>{p.project_id}</b> — {p.title_vi}
                                      </span>
                                    </Checkbox>
                                    <Tag color={statusInfo.color} style={{ margin: 0, fontSize: 11, flexShrink: 0 }}>
                                      {statusInfo.text}
                                    </Tag>
                                  </div>
                                );
                              })}
                            </div>
                          </Checkbox.Group>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Tổng hợp trên Công văn: <b>{m1CheckedProjects.length} đề tài</b> • Tổng kinh phí:{' '}
                            <b>
                              {m1CheckedProjects
                                .reduce((s, p) => s + Number(p?.budgets?.faculty_proposed || p?.budgets?.requested_amount || 0), 0)
                                .toLocaleString('vi-VN')}{' '}
                              VNĐ
                            </b>
                          </Text>
                          <Space wrap>
                            {canScreenFaculty && (
                              <Button
                                type="primary"
                                icon={proposedCountInDept > 0 ? <CheckCircleOutlined /> : <SaveOutlined />}
                                loading={submittingDossier}
                                style={{ backgroundColor: '#722ED1', borderColor: '#722ED1', fontWeight: 600 }}
                                onClick={handleSubmitFacultyDossier}
                              >
                                {proposedCountInDept > 0
                                  ? `Sơ tuyển & Trình Mẫu 1 (${proposedCountInDept} đề tài mới)`
                                  : 'Lưu Số công văn Mẫu 1'}
                              </Button>
                            )}
                            <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/projects')}>
                              Mở Quản lý Đề tài
                            </Button>
                          </Space>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            )}

            <div id={`form-sheet-${currentForm.key}`} className="printable-a4-sheet">
              {renderFormComponent()}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
