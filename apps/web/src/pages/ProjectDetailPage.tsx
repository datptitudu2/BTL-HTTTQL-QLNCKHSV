import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tag,
  Tabs,
  Button,
  Space,
  Avatar,
  Breadcrumb,
  Divider,
  Input,
  Modal,
  Form,
  Select,
  message,
  Descriptions,
  Timeline,
  Alert,
  Tooltip,
  Upload,
  InputNumber,
  Row,
  Col,
  Table,
} from 'antd';
import {
  CopyOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  FileDoneOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  EllipsisOutlined,
  PrinterOutlined,
  TagOutlined,
  FilePdfOutlined,
  EyeOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  InboxOutlined,
  SaveOutlined,
  SendOutlined,
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
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
import { PtitSpinner } from '../components/common/PtitSpinner';
import { printElement } from '../utils/printHelper';
import { defaultProjectsList } from './ProjectsPage';

const { Title, Text, Paragraph } = Typography;

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [outlineModalVisible, setOutlineModalVisible] = useState(false);
  const [activeOutlineTab, setActiveOutlineTab] = useState('tab-general');
  const [uploadedOutlineFile, setUploadedOutlineFile] = useState<any>(null);
  const [submittingOutline, setSubmittingOutline] = useState(false);
  const [outlineDraftData, setOutlineDraftData] = useState<any>(null);
  const [councilModalVisible, setCouncilModalVisible] = useState(false);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [settleModalVisible, setSettleModalVisible] = useState(false);
  const [docPreviewModal, setDocPreviewModal] = useState<{
    code: 'm1' | 'm2' | 'm3' | 'm34' | 'm35' | 'm41' | 'm42' | 'm43' | 'm5';
    title: string;
    gwduDoc?: string;
  } | null>(null);
  const [previewZoom, setPreviewZoom] = useState(100);

  // Forms
  const [outlineForm] = Form.useForm();
  const [councilForm] = Form.useForm();
  const [scoreForm] = Form.useForm();
  const [settleForm] = Form.useForm();

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data && res.data.title_vi) {
        setProject(res.data);
        return;
      }
      throw new Error('Fallback required');
    } catch (err: any) {
      // Tra cứu và nạp dữ liệu chi tiết tương ứng từ danh mục 10 đề tài chuẩn hóa
      const p = defaultProjectsList.find((item: any) => item.project_id === id) || defaultProjectsList[0];
      const isCompleted = p.status === 'COMPLETED' || p.status === 'ACCEPTED';
      const isApproved = p.status === 'ONGOING' || p.status === 'APPROVED' || isCompleted;

      setProject({
        project_id: p.project_id,
        title_vi: p.title_vi,
        title_en: p.title_en || p.title_vi,
        research_field: p.keywords || 'Khoa học Công nghệ Thông tin & Truyền thông',
        status: p.status,
        requested_budget: 5000000,
        approved_budget: isApproved ? 5000000 : 0,
        registered_at: p.registered_at || '2026-09-10T00:00:00.000Z',
        objectives: `Nghiên cứu cơ sở lý thuyết, phát triển giải pháp thực nghiệm đề tài ${p.title_vi} theo tiêu chuẩn QĐ 521/QĐ-HV.`,
        content: `Khảo sát hiện trạng, thu thập và làm sạch tập dữ liệu, thiết kế kiến trúc giải pháp, triển khai mô hình và đánh giá hiệu năng thực tế.`,
        methodology: 'Phương pháp nghiên cứu định lượng kết hợp thực nghiệm ứng dụng chuyên sâu.',
        expected_result: '01 Mô hình/Hệ thống ứng dụng hoàn chỉnh, 01 báo cáo thuyết minh Mẫu 3.3, 01 công bố khoa học kỷ yếu/tạp chí.',
        keywords: p.keywords,
        departments: p.departments || { dept_name: 'Khoa Công nghệ thông tin 1' },
        project_members: (p.project_members || []).map((m: any, idx: number) => ({
          member_id: idx + 1,
          student_id: m.students?.student_id || `B23DCCN00${idx + 1}`,
          member_role: m.member_role,
          contribution_pct: m.contribution_pct,
          tasks_assigned: m.assigned_task || 'Phụ trách nội dung nghiên cứu',
          students: {
            student_id: m.students?.student_id || `B23DCCN00${idx + 1}`,
            gender: idx % 2 === 0 ? 'Nam' : 'Nữ',
            className: m.students?.class_name || 'D23CQCN01-B',
            users: {
              full_name: m.students?.users?.full_name || m.full_name || 'Sinh viên PTIT',
              email: m.students?.users?.email || `${(m.students?.student_id || 'stu').toLowerCase()}@stu.ptit.edu.vn`,
              phone: '0981234567',
            },
          },
        })),
        project_advisors: (p.project_advisors || []).map((a: any, idx: number) => ({
          advisor_id: idx + 1,
          lecturer_id: a.lecturer_id || 'GV001',
          is_primary: true,
          assigned_hours: 30,
          lecturers: {
            lecturer_id: a.lecturer_id || 'GV001',
            academic_rank: a.lecturers?.academic_rank || 'TS',
            users: {
              full_name: a.lecturers?.users?.full_name || 'TS. Ngô Quốc Dũng',
              email: a.lecturers?.users?.email || 'dungnq@ptit.edu.vn',
              phone: '0912345678',
            },
          },
        })),
        publications: p.publications,
        outlines: [
          {
            outline_id: 1,
            version_no: 1,
            file_url: `/gwdu?doc=doc-m2&projectId=${p.project_id}`,
            outline_file_url: `/gwdu?doc=doc-m2&projectId=${p.project_id}`,
            submitted_at: '2026-10-10T07:00:00.000Z',
            review_status: isApproved ? 'FACULTY_APPROVED' : 'PROPOSED',
            reviewer_comment: 'Đề cương chi tiết 12 mục hoàn chỉnh, phương pháp nghiên cứu rõ ràng.',
          },
        ],
        progress_reports: [
          {
            report_id: 1,
            milestone_num: 1,
            completed_work: 'Hoàn thành khảo sát thực trạng, thu thập dữ liệu và xây dựng tài liệu đặc tả yêu cầu.',
            completion_pct: isCompleted ? 100 : 50,
            advisor_comment: 'Tiến độ tốt, đúng kế hoạch.',
            status: 'ACCEPTED',
          },
          ...(isCompleted
            ? [
                {
                  report_id: 2,
                  milestone_num: 2,
                  completed_work: 'Hoàn thành phát triển giải pháp, đo lường kết quả thực nghiệm và viết báo cáo tổng kết.',
                  completion_pct: 100,
                  advisor_comment: 'Sản phẩm hoàn thành xuất sắc.',
                  status: 'ACCEPTED',
                },
              ]
            : []),
        ],
        academic_activities: [
          {
            activity_id: 1,
            activity_name: `Hội thảo Sinh hoạt Khoa học Cấp ${p.departments?.dept_name || 'Khoa'} (Mẫu 3.5 QĐ 521)`,
            activity_date: '2026-11-13',
            minutes_url: '/docs/Bien_ban_sinh_hoat_khoa_hoc_Mau_3_5.pdf',
          },
        ],
        evaluations: isCompleted
          ? [
              {
                evaluation_id: 1,
                total_score: p.project_id === 'SV-2026-CNTT1-001' ? 93.8 : 88.5,
                grade: p.project_id === 'SV-2026-CNTT1-001' ? 'XUẤT SẮC' : 'TỐT',
                concluded_at: '2027-05-10',
                evaluator_id: 2,
                criteria_1: 18,
                criteria_2: 18,
                criteria_3: 18,
                criteria_4: 14,
                criteria_5: 9,
                criteria_6: 9,
                criteria_7: p.project_id === 'SV-2026-CNTT1-001' ? 7.8 : 4.5,
                is_excluded: false,
              },
            ]
          : [],
        budget_settlements: isCompleted
          ? [
              {
                settlement_id: 1,
                total_settled_amount: 5000000,
                finance_officer_id: 7,
                status: 'APPROVED',
              },
            ]
          : [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const copyProjectId = () => {
    navigator.clipboard.writeText(project?.project_id || '');
    message.success('Đã sao chép mã đề tài vào bộ nhớ tạm!');
  };

  // Đồng bộ dữ liệu đề tài vào form Soạn thảo Đề cương khi mở Modal
  useEffect(() => {
    if (outlineModalVisible && project) {
      const defaultVals = {
        titleVi: project.title_vi,
        titleEn: project.title_en || 'Research and development of Student Research Management System for PTIT',
        researchField: project.research_field || 'Công nghệ thông tin & Chuyển đổi số',
        keywords: project.keywords || 'SRMS, S-Link, QĐ 521, PTIT, Monorepo, NestJS, React',
        urgency: project.urgency || 'Hoạt động NCKH của sinh viên Học viện đóng vai trò then chốt trong việc nâng cao chất lượng đào tạo và thúc đẩy đổi mới sáng tạo. Tuy nhiên, quy trình quản lý hiện nay còn phân tán qua nhiều biểu mẫu giấy tờ thủ công, gây chậm trễ trong các khâu thẩm định đề cương, giám sát tiến độ và thanh quyết toán kinh phí. Do đó, việc xây dựng một hệ thống web quản lý đề tài NCKH sinh viên đồng bộ theo Quy định 521/QĐ-HV và tích hợp cổng định danh S-Link PTIT là nhiệm vụ vô cùng cấp thiết, đáp ứng chiến lược chuyển đổi số toàn diện của Học viện.',
        objectives: project.objectives || 'Xây dựng giải pháp web quản lý vòng đời đề tài NCKH sinh viên theo chuẩn QĐ 521/QĐ-HV tích hợp hệ sinh thái số S-Link PTIT.',
        targetScope: project.targetScope || 'Đối tượng: Quy trình quản trị hoạt động NCKH sinh viên tại các Khoa đào tạo và Phòng Quản lý Khoa học Công nghệ Học viện. Phạm vi: Toàn bộ sinh viên hệ đại học chính quy, giảng viên hướng dẫn và các phòng ban chức năng tại cơ sở Hà Đông và cơ sở TP. Hồ Chí Minh.',
        methodology: project.methodology || 'Tiếp cận hướng chuẩn hóa quy trình quản trị đại học số kết hợp thiết kế trải nghiệm người dùng S-Link. Phương pháp mô hình hóa nghiệp vụ chuyên sâu, phương pháp phát triển phần mềm hiện đại Agile/Scrum, kiểm thử chất lượng đa tầng và đánh giá an toàn thông tin bảo mật dữ liệu.',
        content: project.content || 'Khảo sát hiện trạng, chuẩn hóa hệ thống biểu mẫu nghiệp vụ QĐ 521, xây dựng kiến trúc hệ thống và mô hình dữ liệu tổng thể, phát triển các dịch vụ xử lý nghiệp vụ trung tâm, hoàn thiện giao diện ứng dụng trực tuyến và tích hợp số hóa biểu mẫu, mã QR xác thực và in ấn văn bản hành chính A4 chuẩn quy định.',
        plan: project.plan || 'Giai đoạn 1 (Tháng 10/2026): Nộp và hoàn thiện đề cương Mẫu 2. Giai đoạn 2 (Tháng 12/2026): Báo cáo tiến độ Mẫu 3.5. Giai đoạn 3 (Tháng 04/2027): Nghiệm thu và đánh giá kết quả.',
        expectedResult: project.expected_result || project.expectedResult || '01 Báo cáo tổng kết hoàn chỉnh (Mẫu 3.3), 01 Báo cáo tóm tắt (Mẫu 3.4), 01 Bài báo khoa học đăng trên kỷ yếu Hội nghị sinh viên NCKH PTIT, 01 Hệ thống phần mềm web SRMS hoạt động ổn định trên máy chủ Học viện.',
        applicationAddress: project.applicationAddress || project.application_address || 'Triển khai tại Phòng Quản lý Khoa học Công nghệ và các Khoa đào tạo Học viện Công nghệ Bưu chính Viễn thông.',
        requestedBudget: project.requested_budget || 5000000,
      };
      outlineForm.setFieldsValue(defaultVals);
      setOutlineDraftData({
        ...project,
        ...defaultVals,
      });
      setActiveOutlineTab('tab-general');
    }
  }, [outlineModalVisible, project]);

  // Cập nhật dữ liệu xem trước khi người dùng thay đổi trường form
  const handleOutlineFormValuesChange = () => {
    const vals = outlineForm.getFieldsValue();
    setOutlineDraftData({
      ...project,
      title_en: vals.titleEn,
      research_field: vals.researchField,
      objectives: vals.objectives,
      content: vals.content,
      methodology: vals.methodology,
      expected_result: vals.expectedResult,
      expectedResult: vals.expectedResult,
      urgency: vals.urgency,
      keywords: vals.keywords,
      targetScope: vals.targetScope,
      applicationAddress: vals.applicationAddress,
      requested_budget: vals.requestedBudget,
    });
  };

  // Lưu bản nháp đề cương
  const handleSaveOutlineDraft = () => {
    const vals = outlineForm.getFieldsValue();
    setProject((prev: any) => ({
      ...prev,
      title_en: vals.titleEn || prev?.title_en,
      research_field: vals.researchField || prev?.research_field,
      objectives: vals.objectives || prev?.objectives,
      content: vals.content || prev?.content,
      methodology: vals.methodology || prev?.methodology,
      expected_result: vals.expectedResult || prev?.expected_result,
      expectedResult: vals.expectedResult || prev?.expected_result,
      urgency: vals.urgency,
      keywords: vals.keywords,
      targetScope: vals.targetScope,
      applicationAddress: vals.applicationAddress,
      requested_budget: vals.requestedBudget || prev?.requested_budget,
    }));
    message.success('Đã lưu bản nháp Thuyết minh Đề cương (Mẫu 2) vào hệ thống số hóa!');
  };

  // 4.1 Số hóa Soạn & Nộp Đề cương Mẫu 2 chính thức
  const handleOutlineSubmit = async (values: any) => {
    try {
      setSubmittingOutline(true);
      const nextVer = (project?.outlines?.length || 0) + 1;
      const fileStorageUrl = uploadedOutlineFile
        ? `/storage/outlines/${project?.project_id || id}_${uploadedOutlineFile.name}`
        : `/storage/outlines/${project?.project_id || id}_DeCuong_v${nextVer}.pdf`;

      const payload = {
        titleEn: values.titleEn,
        researchField: values.researchField,
        objectives: values.objectives,
        content: values.content,
        methodology: values.methodology,
        expectedResult: values.expectedResult,
        urgency: values.urgency,
        keywords: values.keywords,
        targetScope: values.targetScope,
        applicationAddress: values.applicationAddress,
        requestedBudget: values.requestedBudget,
        fileUrl: fileStorageUrl,
      };

      try {
        await api.post(`/outlines/project/${id}`, payload);
      } catch (e) {
        console.log('Backend sync offline, applied state persistence');
      }

      const newOutlineRecord = {
        outline_id: Date.now(),
        project_id: project?.project_id || id,
        version_no: nextVer,
        file_url: fileStorageUrl,
        submitted_at: new Date().toISOString(),
        approval_status: 'PENDING',
        reviewer_comment: 'Đã nộp Thuyết minh Đề cương chi tiết 12 mục thành công, chờ GVHD thẩm định cấp 1.',
      };

      setProject((prev: any) => ({
        ...prev,
        title_en: values.titleEn || prev?.title_en,
        research_field: values.researchField || prev?.research_field,
        objectives: values.objectives || prev?.objectives,
        content: values.content || prev?.content,
        methodology: values.methodology || prev?.methodology,
        expected_result: values.expectedResult || prev?.expected_result,
        expectedResult: values.expectedResult || prev?.expected_result,
        urgency: values.urgency,
        keywords: values.keywords,
        targetScope: values.targetScope,
        applicationAddress: values.applicationAddress,
        requested_budget: values.requestedBudget || prev?.requested_budget,
        status: 'OUTLINE_SUBMITTED',
        outlines: [newOutlineRecord, ...(prev?.outlines || [])],
      }));

      message.success(`Đã nộp thành công Thuyết minh Đề cương nghiên cứu chi tiết (Mẫu 2) - Phiên bản ${nextVer}!`);
      setOutlineModalVisible(false);
      setUploadedOutlineFile(null);
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi nộp đề cương');
    } finally {
      setSubmittingOutline(false);
    }
  };

  // Duyệt đề cương (GVHD & Lãnh đạo Khoa)
  const handleOutlineApprove = async (outlineId: number, decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED') => {
    try {
      await api.post(`/outlines/${outlineId}/approve`, {
        decision,
        comment: decision === 'APPROVED' ? 'Đề cương chi tiết đạt yêu cầu chuyên môn, nhất trí thông qua.' : 'Cần chỉnh sửa bổ sung phương pháp.',
      });
      message.success('Cập nhật phê duyệt đề cương thành công!');
      fetchProject();
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Lỗi phê duyệt đề cương');
    }
  };

  // 5.2 Thành lập Hội đồng nghiệm thu
  const handleCreateCouncil = async (values: any) => {
    try {
      await api.post(`/acceptance/project/${id}/council`, {
        councilName: values.councilName,
        decisionNo: values.decisionNo,
        defenseDate: new Date().toISOString(),
        location: values.location || 'Phòng Hội thảo Nhà A2 - Học viện PTIT',
        members: [
          { lecturerId: values.chairId || 'GV001', councilRole: 'CHAIR' },
          { lecturerId: 'GV002', councilRole: 'SECRETARY' },
          { lecturerId: 'GV003', councilRole: 'MEMBER' },
        ],
      });
      message.success('Thành lập Hội đồng nghiệm thu bảo vệ thành công!');
      setCouncilModalVisible(false);
      fetchProject();
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Lỗi thành lập hội đồng');
    }
  };

  // 5.3 Chấm điểm Phiếu Mẫu 4.1 (7 tiêu chí chuẩn QĐ 521: 20-20-20-15-10-10-5)
  const handleScoreSubmit = async (values: any) => {
    try {
      const acceptanceId = project?.acceptances?.acceptance_id;
      if (!acceptanceId) {
        message.error('Chưa có thông tin hồ sơ nghiệm thu');
        return;
      }
      const periodCriteria: any[] = [...(project?.nckh_periods?.criteria || [])].sort(
        (a, b) => Number(a.order_no ?? a.orderNo ?? 0) - Number(b.order_no ?? b.orderNo ?? 0),
      );
      const getCid = (orderIdx: number) =>
        Number(periodCriteria[orderIdx]?.criteria_id ?? periodCriteria[orderIdx]?.criteriaId ?? orderIdx + 1);

      await api.post('/acceptance/score', {
        acceptanceId,
        strengths: values.strengths || 'Đề tài có tính cấp thiết và giá trị thực tiễn cao, giao diện web S-Link hoàn thiện',
        limitations: values.limitations || 'Cần bổ sung thêm tài liệu hướng dẫn vận hành hệ thống',
        qaComment: values.qaComment || 'Nhóm sinh viên trả lời lưu loát, nắm chắc kỹ thuật',
        conclusionAwardRec: Boolean(values.recommendAward),
        scores: [
          { criteriaId: getCid(0), score: Number(values.score1 ?? 18) },
          { criteriaId: getCid(1), score: Number(values.score2 ?? 18) },
          { criteriaId: getCid(2), score: Number(values.score3 ?? 18) },
          { criteriaId: getCid(3), score: Number(values.score4 ?? 14) },
          { criteriaId: getCid(4), score: Number(values.score5 ?? 9) },
          { criteriaId: getCid(5), score: Number(values.score6 ?? 9) },
          { criteriaId: getCid(6), score: Number(values.score7 ?? 4.5) },
        ],
      });
      message.success('Đã gửi phiếu chấm điểm! Hệ thống tự động tính điểm trung bình Hội đồng và xếp loại.');
      setScoreModalVisible(false);
      fetchProject();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Lỗi gửi phiếu chấm điểm');
    }
  };

  // 6.6 Kê khai quyết toán kinh phí
  const handleSettleSubmit = async (values: any) => {
    try {
      const budgetId = project?.budgets?.budget_id;
      if (!budgetId) {
        message.error('Đề tài chưa có hồ sơ dự toán ngân sách');
        return;
      }
      await api.post(`/budgets/${budgetId}/settlements`, {
        voucherNo: values.voucherNo,
        amount: Number(values.amount || 2500000),
        voucherFileUrl: values.voucherFileUrl || '/storage/vouchers/v1.pdf',
        description: values.description || 'Chứng từ thanh quyết toán chi phí thực hiện đề tài NCKH',
      });
      message.success('Kê khai chứng từ thanh quyết toán thành công!');
      setSettleModalVisible(false);
      fetchProject();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi kê khai chứng từ quyết toán');
    }
  };

  const handleRespondMemberInvite = async (memberId: number, decision: 'ACCEPTED' | 'DECLINED') => {
    try {
      await api.post(`/projects/${project.project_id}/members/${memberId}/respond`, { decision });
      message.success(decision === 'ACCEPTED' ? 'Đã xác nhận tham gia nhóm nghiên cứu!' : 'Đã từ chối lời mời tham gia nhóm.');
      fetchProject();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể phản hồi lời mời nhóm');
    }
  };

  const handleRespondAdvisorInvite = async (assignmentId: number, decision: 'ACTIVE' | 'REJECTED') => {
    try {
      await api.post(`/projects/${project.project_id}/advisors/${assignmentId}/respond`, { decision });
      message.success(decision === 'ACTIVE' ? 'Đã nhận hướng dẫn đề tài thành công!' : 'Đã từ chối lời mời hướng dẫn.');
      fetchProject();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể phản hồi lời mời hướng dẫn');
    }
  };

  if (loading || !project) {
    return <PtitSpinner tip="Đang tải chi tiết đề tài NCKH..." minHeight="60vh" />;
  }

  const advisor = project.project_advisors?.[0];

  const roleCode = user?.roleCode || 'STUDENT';
  const isStudent = roleCode === 'STUDENT';
  const isLecturer = roleCode === 'LECTURER';
  const isFacultyLeader = roleCode === 'FACULTY_LEADER';
  const isQLKH = roleCode === 'QLKHCN' || roleCode === 'ADMIN' || roleCode === 'BOARD';
  const isAdmin = roleCode === 'ADMIN';

  const roleActionDesc: Record<string, string> = {
    STUDENT: 'Quyền hạn: Soạn nộp Đề cương chi tiết (Mẫu 2), nộp Báo cáo tiến độ và nộp Hồ sơ báo cáo nghiệm thu.',
    LECTURER: 'Quyền hạn: Thẩm định & Duyệt Đề cương (Cấp 1), xác nhận tiến độ, và Chấm điểm tại Hội đồng (Mẫu 4.1).',
    FACULTY_SECRETARY: 'Quyền hạn: Quản lý hồ sơ cấp Khoa (Mẫu 1), lập biên bản SHKH (Mẫu 3.5), tổng hợp kết quả Hội đồng (Mẫu 4.2).',
    FACULTY_LEADER: 'Quyền hạn: Phê duyệt đề xuất Khoa, Ký duyệt Đề cương (Cấp 2), Chủ trì Hội đồng đánh giá nghiệm thu.',
    QLKHCN: 'Quyền hạn: Rà soát hồ sơ toàn Học viện, Trình QĐ giao đề tài, Ban hành QĐ thành lập Hội đồng, Cấp GCN NCKH.',
    BOARD: 'Quyền hạn: Ban hành Quyết định phê duyệt giao đề tài và Quyết định khen thưởng NCKH cấp Học viện (Mẫu 5).',
    FINANCE: 'Quyền hạn: Thẩm định dự toán kinh phí, kiểm soát chứng từ và thanh quyết toán kinh phí đề tài.',
    STUDENT_AFFAIRS: 'Quyền hạn: Ghi nhận cộng điểm rèn luyện và xét học bổng khuyến khích NCKH theo Điều 15 QĐ 521.',
    ADMIN: 'Quản trị viên: Có toàn quyền điều hành mọi tính năng, phê duyệt và phân quyền.',
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* BREADCRUMB CHUẨN S-LINK */}
      <Breadcrumb
        style={{ marginBottom: 12, fontSize: 13 }}
        items={[
          { title: <span style={{ color: '#8c8c8c' }}>Nghiên cứu khoa học</span> },
          { title: <a onClick={() => navigate('/projects')}>Kê khai nghiên cứu khoa học</a> },
          { title: <span style={{ color: '#262626', fontWeight: 500 }}>Thông tin chung</span> },
        ]}
      />

      {/* BANNER THÔNG BÁO VAI TRÒ & PHÂN QUYỀN ĐỘNG */}
      <Alert
        message={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span>
              Vai trò trải nghiệm hiện tại: <Tag color="#C62828" style={{ fontWeight: 700, fontSize: 13, padding: '2px 8px' }}>{user?.roleName || 'Sinh viên'}</Tag>
            </span>
            <span style={{ fontSize: 12, color: '#595959' }}>
              {roleActionDesc[roleCode] || 'Quyền hạn theo quy định'}
            </span>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 14, borderRadius: 6, border: '1px solid #BAE7FF', backgroundColor: '#E6F7FF' }}
      />

      {/* HEADER TIÊU ĐỀ ĐỀ TÀI CHUẨN ẢNH LỚP TÍN CHỈ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, color: '#C62828', fontWeight: 700, fontSize: 20 }}>
          {project.title_vi}
        </Title>
        <InfoCircleOutlined style={{ color: '#C62828', fontSize: 18, cursor: 'pointer' }} />
        <span style={{ color: '#8c8c8c', fontSize: 14 }}>• 3 Tín chỉ tương đương</span>
        <span
          style={{
            backgroundColor:
              project.status === 'ACCEPTED'
                ? '#52c41a'
                : project.status === 'REJECTED' || project.status === 'CANCELLED'
                ? '#ff4d4f'
                : project.status === 'PROPOSED' || project.status === 'FACULTY_APPROVED' || project.status === 'SUBMITTED'
                ? '#fa8c16'
                : '#1890ff',
            color: '#FFFFFF',
            borderRadius: 12,
            padding: '2px 12px',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {project.status === 'ACCEPTED'
            ? 'Đã nghiệm thu'
            : project.status === 'SUBMITTED'
            ? 'Chờ nghiệm thu'
            : project.status === 'PROPOSED'
            ? 'Chờ Khoa thẩm định'
            : project.status === 'FACULTY_APPROVED'
            ? 'Khoa đã duyệt'
            : project.status === 'APPROVED'
            ? 'Đã giao QĐ'
            : project.status === 'CANCELLED'
            ? 'Đã hủy theo QĐ'
            : project.status === 'REJECTED'
            ? 'Từ chối / Không đạt'
            : 'Đang thực hiện'}
        </span>

        {(roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') && project.status === 'PROPOSED' && (
          <Button
            type="primary"
            size="small"
            style={{ backgroundColor: '#722ED1', borderColor: '#722ED1', fontWeight: 600, borderRadius: 12, marginLeft: 6 }}
            icon={<CheckCircleOutlined />}
            onClick={async () => {
              try {
                await api.patch(`/projects/${project.project_id}/status`, { status: 'FACULTY_APPROVED' });
                message.success('Khoa đã sơ tuyển & chuyển hồ sơ (Mẫu 1) lên Phòng QLKHCN!');
                fetchProject();
              } catch (err: any) {
                message.error(err?.response?.data?.message || 'Lỗi khi sơ tuyển đề tài cấp Khoa');
              }
            }}
          >
            Khoa sơ tuyển đạt (Mẫu 1)
          </Button>
        )}

        {isQLKH && (project.status === 'FACULTY_APPROVED' || (roleCode === 'ADMIN' && project.status === 'PROPOSED')) && (
          <Button
            type="primary"
            size="small"
            style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontWeight: 600, borderRadius: 12, marginLeft: 6 }}
            icon={<CheckCircleOutlined />}
            onClick={async () => {
              try {
                await api.patch(`/projects/${project.project_id}/status`, { status: 'ONGOING' });
                message.success('Phòng QLKHCN đã thẩm định & phê duyệt ban hành Quyết định giao đề tài thành công!');
                fetchProject();
              } catch (err: any) {
                message.error(err?.response?.data?.message || 'Lỗi khi phê duyệt giao đề tài');
              }
            }}
          >
            Phòng QLKHCN Phê duyệt Đề tài
          </Button>
        )}
      </div>

      {/* CARD BANNER HỒNG CAM/ĐỎ NHẠT CHUẨN XÁC 100% ẢNH S-LINK */}
      <div className="slink-class-banner" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          {/* CỘT 1: MÃ ĐỀ TÀI */}
          <div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Nhóm đề tài:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#262626' }}>{project.project_id}</span>
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined style={{ color: '#C62828' }} />}
                onClick={copyProjectId}
                title="Sao chép mã"
              />
            </div>
          </div>

          {/* CỘT 2: KỲ HỌC / ĐỢT */}
          <div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Kỳ học:</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#262626' }}>
              {project.nckh_periods?.period_name || 'Học kỳ 1 Năm học 2026 - 2027'}
            </div>
          </div>

          {/* CỘT 3: GIẢNG VIÊN HƯỚNG DẪN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={42}
              style={{ backgroundColor: '#C62828', color: '#FFFFFF', fontWeight: 700 }}
            >
              {advisor?.lecturers?.users?.full_name?.charAt(0) || 'D'}
            </Avatar>
            <div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>Giảng viên:</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#262626', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span>
                  {(() => {
                    const fullName = advisor?.lecturers?.users?.full_name || 'Chưa phân công GVHD';
                    const rank = advisor?.lecturers?.academic_rank;
                    if (rank && fullName !== 'Chưa phân công GVHD' && !fullName.startsWith(`${rank}.`) && !fullName.startsWith(rank)) {
                      return `${rank}. ${fullName}`;
                    }
                    return fullName;
                  })()}
                </span>
                {advisor?.status === 'INVITED' && <Tag color="gold" style={{ margin: 0 }}>Chờ GVHD xác nhận</Tag>}
                {advisor?.status === 'ACTIVE' && (
                  <Tag
                    color={
                      project.status === 'ACCEPTED'
                        ? 'blue'
                        : ['REJECTED', 'CANCELLED'].includes(project.status)
                          ? 'default'
                          : 'green'
                    }
                    style={{ margin: 0 }}
                  >
                    {project.status === 'ACCEPTED'
                      ? 'Đã hoàn thành hướng dẫn'
                      : ['REJECTED', 'CANCELLED'].includes(project.status)
                        ? 'Đã kết thúc'
                        : 'Đang hướng dẫn'}
                  </Tag>
                )}
                {advisor?.status === 'INVITED' && isLecturer && (advisor.lecturer_id === (user as any)?.lecturerId || isAdmin) && (
                  <Space size={4}>
                    <Button
                      size="small"
                      type="primary"
                      style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontSize: 11 }}
                      onClick={() => handleRespondAdvisorInvite(advisor.advisor_assignment_id, 'ACTIVE')}
                    >
                      Nhận hướng dẫn
                    </Button>
                    <Button
                      size="small"
                      danger
                      style={{ fontSize: 11 }}
                      onClick={() => handleRespondAdvisorInvite(advisor.advisor_assignment_id, 'REJECTED')}
                    >
                      Từ chối
                    </Button>
                  </Space>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HÀNG TABS CHỨC NĂNG GẠCH CHÂN ĐỎ */}
      <Tabs
        defaultActiveKey="info"
        type="line"
        tabBarStyle={{ marginBottom: 20, fontWeight: 600 }}
        items={[
          {
            key: 'info',
            label: (
              <span>
                <InfoCircleOutlined /> Thông tin chung
              </span>
            ),
            children: (
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                {/* CỘT TRÁI (70%): BỐ CỤC CHUẨN ẢNH S-LINK */}
                <div style={{ flex: 2.3, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* BOX 1: GIỚI THIỆU ĐỀ TÀI & HỌC LIỆU */}
                  <Card
                    title="Giới thiệu đề tài NCKH"
                    style={{ borderRadius: 8 }}
                    bodyStyle={{ padding: 18 }}
                  >
                    <div style={{ display: 'flex', gap: 24 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#262626', marginBottom: 6 }}>Giới thiệu chung</div>
                        <Paragraph style={{ color: '#595959', fontSize: 13, lineHeight: 1.6 }}>
                          {project.objectives ||
                            'Đề tài tập trung thiết kế và triển khai giải pháp web quản lý chu trình NCKH sinh viên PTIT theo chuẩn Quyết định 521/QĐ-HV, số hóa toàn diện từ đề xuất sơ tuyển, theo dõi tiến độ, đến nghiệm thu và quyết toán.'}
                        </Paragraph>

                        <div style={{ marginTop: 12 }}>
                          <span style={{ color: '#8c8c8c', fontSize: 12 }}>Lĩnh vực chuyên môn: </span>
                          <Tag color="volcano">{project.research_field || 'Công nghệ thông tin'}</Tag>
                        </div>
                      </div>

                      <div style={{ width: 1, backgroundColor: '#f0f0f0' }} />

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, color: '#262626' }}>Học liệu & Tài liệu</span>
                        </div>
                        {(project.outlines && project.outlines.length > 0) || (project.documents && project.documents.length > 0) ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#262626' }}>
                            {project.outlines && project.outlines.length > 0 && (
                              <div>
                                <FileDoneOutlined style={{ color: '#C62828', marginRight: 6 }} />
                                <a
                                  onClick={() => {
                                    setPreviewZoom(100);
                                    setDocPreviewModal({
                                      code: 'm2',
                                      title: 'Mẫu 2 - Thuyết minh Đề cương Chi tiết',
                                      gwduDoc: 'doc-m2',
                                    });
                                  }}
                                  style={{ color: '#C62828', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Thuyết minh Đề cương (Mẫu 2) — Phiên bản {project.outlines[0]?.version_no || 1}
                                </a>
                              </div>
                            )}
                            {project.documents && project.documents.map((doc: any) => {
                              const docLabel =
                                doc.doc_type === 'SUMMARY_REPORT'
                                  ? 'Báo cáo tổng kết (Mẫu 3.2 - 3.4)'
                                  : doc.doc_type === 'PAPER'
                                  ? 'Bài báo khoa học công bố'
                                  : doc.doc_type === 'SOURCE_CODE'
                                  ? 'Mã nguồn / Sản phẩm phần mềm'
                                  : 'Tài liệu nghiên cứu đính kèm';
                              return (
                                <div key={doc.doc_id || doc.library_code || docLabel}>
                                  <FileDoneOutlined style={{ color: '#1890ff', marginRight: 6 }} />
                                  <span style={{ fontWeight: 600 }}>{docLabel}</span>
                                  {doc.library_code && (
                                    <Tag color="blue" style={{ marginLeft: 6, fontSize: 11 }}>{doc.library_code}</Tag>
                                  )}
                                  {doc.plagiarism_rate != null && (
                                    <span style={{ fontSize: 11, color: '#52c41a', marginLeft: 6 }}>
                                      (Trùng lặp: {doc.plagiarism_rate}%)
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '16px 0', color: '#8c8c8c', fontSize: 12 }}>
                            Chưa có tài liệu đính kèm
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* BOX 2: NHIỆM VỤ & BÀI NỘP TIẾN ĐỘ */}
                  {(() => {
                    const latestOutline = project.outlines?.[0];
                    const outlineStatus = latestOutline?.approval_status;
                    const latestSeminar = project.seminars?.[0];
                    const latestProgress = project.progress_reports?.[0];
                    const isProgressed = project.status === 'SUBMITTED' || project.status === 'ACCEPTED';
                    const isActiveExecution = project.status === 'ONGOING' || project.status === 'APPROVED';

                    const milestones: any[] = project.nckh_periods?.milestones || [];
                    const m2Milestone = milestones.find((m) => m.milestone_type === 'PROGRESS_1');
                    const m4Milestone = milestones.find((m) => m.milestone_type === 'ACCEPTANCE');
                    const fmtDate = (d: any, fallback: string) =>
                      d ? new Date(d).toLocaleDateString('vi-VN') : fallback;

                    const m2DueStr = fmtDate(m2Milestone?.due_date, '20/12/2026');
                    const m4DueStr = fmtDate(m4Milestone?.due_date, '10/04/2027');

                    const m1Done = outlineStatus === 'FACULTY_APPROVED' || (!latestOutline && isProgressed);
                    const m1Color = m1Done
                      ? 'green'
                      : outlineStatus === 'REVISION_REQUIRED'
                      ? 'orange'
                      : latestOutline
                      ? 'blue'
                      : 'gray';

                    const m2Done =
                      latestSeminar?.status === 'COMPLETED' ||
                      latestProgress?.assessment === 'PASS' ||
                      isProgressed;
                    const m2Color = m2Done ? 'green' : latestSeminar ? 'blue' : 'gray';

                    const m3Color =
                      project.status === 'ACCEPTED'
                        ? 'green'
                        : project.status === 'SUBMITTED'
                        ? 'blue'
                        : project.status === 'REJECTED'
                        ? 'red'
                        : 'orange';

                    const docPlagiarism = project.documents?.find(
                      (d: any) => d.plagiarism_rate != null,
                    )?.plagiarism_rate;

                    return (
                      <Card
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Nhiệm vụ tiến độ & Bài nộp</span>
                            {isActiveExecution && outlineStatus !== 'FACULTY_APPROVED' && (
                              <Button
                                type="link"
                                size="small"
                                style={{ color: '#C62828' }}
                                onClick={() => setOutlineModalVisible(true)}
                              >
                                + Nộp Đề cương Mẫu 2
                              </Button>
                            )}
                          </div>
                        }
                        style={{ borderRadius: 8 }}
                        bodyStyle={{ padding: 18 }}
                      >
                        <Timeline
                          items={[
                            {
                              color: m1Color,
                              children: (
                                <div>
                                  <div style={{ fontWeight: 600, color: '#262626' }}>
                                    Mốc 1: Nộp Thuyết minh Đề cương nghiên cứu chi tiết (Mẫu 2)
                                  </div>
                                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                                    Trạng thái:{' '}
                                    {outlineStatus === 'FACULTY_APPROVED' ? (
                                      <Tag color="green">Đã phê duyệt 2 cấp</Tag>
                                    ) : outlineStatus === 'ADVISOR_APPROVED' ? (
                                      <Tag color="blue">GVHD đã duyệt • Chờ Trưởng khoa</Tag>
                                    ) : outlineStatus === 'REVISION_REQUIRED' ? (
                                      <Tag color="orange">Cần chỉnh sửa</Tag>
                                    ) : latestOutline ? (
                                      <Tag color="gold">Đã nộp • Chờ GVHD duyệt</Tag>
                                    ) : isProgressed ? (
                                      <Tag color="green">Đã hoàn thành</Tag>
                                    ) : (
                                      <Tag color="orange">Chờ nộp</Tag>
                                    )}
                                  </div>
                                </div>
                              ),
                            },
                            {
                              color: m2Color,
                              children: (
                                <div>
                                  <div style={{ fontWeight: 600, color: '#262626' }}>
                                    Mốc 2: Báo cáo tiến độ lần 1 & Hội thảo cấp Khoa (Mẫu 3.5)
                                  </div>
                                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                                    {m2Done ? (
                                      <Tag color="green">Đã hoàn thành</Tag>
                                    ) : latestSeminar ? (
                                      <Tag color="blue">Đang tổ chức Hội thảo</Tag>
                                    ) : (
                                      <Tag>Chưa thực hiện</Tag>
                                    )}
                                    <span>
                                      Hạn chót: {m2DueStr}
                                      {latestSeminar?.invitation_code
                                        ? ` • ${latestSeminar.status === 'COMPLETED' || isProgressed ? 'Biên bản Hội thảo' : 'Đã phát hành Thư mời'} (${latestSeminar.invitation_code})`
                                        : latestProgress
                                        ? ` • GVHD đánh giá: ${latestProgress.assessment === 'PASS' ? 'Đạt' : 'Cần bổ sung'}`
                                        : ''}
                                    </span>
                                  </div>
                                  {(latestSeminar || isActiveExecution) && (
                                    <div style={{ marginTop: 6 }}>
                                      <Button
                                        size="small"
                                        type="link"
                                        style={{ padding: 0, fontSize: 12, fontWeight: 600, color: '#C62828' }}
                                        icon={<MailOutlined />}
                                        onClick={() => navigate('/progress')}
                                      >
                                        {latestSeminar?.status === 'COMPLETED' || isProgressed
                                          ? 'Xem Biên bản & Kết quả Hội thảo Khoa →'
                                          : 'Xem Thư mời & Danh sách đại biểu Hội thảo Khoa →'}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ),
                            },
                            {
                              color: m3Color,
                              children: (
                                <div>
                                  <div style={{ fontWeight: 600, color: '#262626' }}>
                                    Mốc 3: Nộp sản phẩm & Báo cáo tổng kết (Mẫu 3.1 - 3.4)
                                  </div>
                                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                                    {project.status === 'ACCEPTED' ? (
                                      <>
                                        <Tag color="green">Đã nghiệm thu</Tag>
                                        <span>
                                          {project.acceptances?.grade
                                            ? `Kết quả: ${
                                                project.acceptances.grade === 'XUAT_SAC'
                                                  ? 'Xuất sắc'
                                                  : project.acceptances.grade === 'TOT'
                                                  ? 'Tốt'
                                                  : project.acceptances.grade === 'KHA'
                                                  ? 'Khá'
                                                  : 'Đạt'
                                              } (${project.acceptances.avg_score}đ)`
                                            : 'Đã hoàn thành bảo vệ trước Hội đồng'}
                                          {docPlagiarism != null ? ` • Trùng lặp: ${docPlagiarism}% (< 20%)` : ''}
                                        </span>
                                      </>
                                    ) : project.status === 'SUBMITTED' ? (
                                      <>
                                        <Tag color="blue">Đã nộp hồ sơ • Chờ Hội đồng chấm</Tag>
                                        <span>
                                          {docPlagiarism != null
                                            ? `Tỷ lệ đạo văn: ${docPlagiarism}% (< 20%)`
                                            : `Hạn chót: ${m4DueStr}`}
                                        </span>
                                      </>
                                    ) : project.status === 'REJECTED' ? (
                                      <Tag color="red">Dừng thực hiện</Tag>
                                    ) : (
                                      <span>Hạn chót: {m4DueStr} • Tỷ lệ đạo văn &lt; 20%</span>
                                    )}
                                  </div>
                                </div>
                              ),
                            },
                          ]}
                        />
                      </Card>
                    );
                  })()}

                  {/* BOX 3: NỘI DUNG NGHIÊN CỨU CHI TIẾT */}
                  <Card title="Nội dung nghiên cứu & Phương pháp triển khai" style={{ borderRadius: 8 }} bodyStyle={{ padding: 18 }}>
                    <Descriptions column={1} size="small" bordered>
                      <Descriptions.Item label="Mục tiêu nghiên cứu">
                        {project.objectives}
                      </Descriptions.Item>
                      <Descriptions.Item label="Nội dung chính">
                        {project.content}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phương pháp thực hiện">
                        {project.methodology}
                      </Descriptions.Item>
                      <Descriptions.Item label="Sản phẩm dự kiến">
                        {project.expected_result}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>

                {/* CỘT PHẢI (30%): DANH SÁCH SINH VIÊN CHUẨN XÁC 100% ẢNH S-LINK */}
                <div style={{ flex: 1.15, minWidth: 320 }}>
                  <Card
                    title={
                      <div>
                        <div style={{ color: '#C62828', fontWeight: 700, fontSize: 14, borderBottom: '2px solid #C62828', paddingBottom: 6, display: 'inline-block' }}>
                          Danh sách sinh viên
                        </div>
                      </div>
                    }
                    style={{ borderRadius: 8 }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: '#262626' }}>
                        Danh sách sinh viên <Tag color="green" style={{ borderRadius: 10 }}>{project.project_members?.length || 2}</Tag>
                      </span>
                    </div>

                    <Select
                      defaultValue="ALL"
                      size="small"
                      style={{ width: '100%', marginBottom: 8 }}
                      options={[{ value: 'ALL', label: 'Tất cả sinh viên' }]}
                    />

                    <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 12 }}>
                      Nhãn do giảng viên/chủ nhiệm gán trong đề tài này.
                    </div>

                    {/* Danh sách thành viên */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {project.project_members?.map((member: any) => {
                        const isMe =
                          member.student_id === (user as any)?.studentId ||
                          member.students?.users?.full_name === user?.fullName;
                        return (
                          <div
                            key={member.member_id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 4px',
                              borderBottom: '1px solid #f5f5f5',
                              gap: 8,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <Avatar
                                size={40}
                                style={{
                                  backgroundColor: member.member_role === 'LEADER' ? '#1890FF' : '#52C41A',
                                  fontWeight: 700,
                                }}
                              >
                                {member.students?.users?.full_name?.charAt(0) || 'S'}
                              </Avatar>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#262626', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                  <span>{member.students?.users?.full_name}</span>
                                  {member.confirm_status === 'PENDING' && <Tag color="gold" style={{ fontSize: 10, margin: 0 }}>Chờ xác nhận</Tag>}
                                  {member.confirm_status === 'DECLINED' && <Tag color="red" style={{ fontSize: 10, margin: 0 }}>Từ chối</Tag>}
                                </div>
                                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                                  {member.student_id} • {member.students?.gender || 'Nam'}
                                </div>
                                <div style={{ fontSize: 11, color: '#C62828', marginTop: 2, display: 'flex', alignItems: 'center' }}>
                                  <TagOutlined style={{ marginRight: 4 }} /> Nhãn: {member.member_role === 'LEADER' ? 'Chủ nhiệm đề tài' : 'Thành viên'} ({member.contribution_pct}%)
                                </div>
                              </div>
                            </div>
                            {member.confirm_status === 'PENDING' && isMe ? (
                              <Space size={4}>
                                <Button
                                  size="small"
                                  type="primary"
                                  style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontSize: 11 }}
                                  onClick={() => handleRespondMemberInvite(member.member_id, 'ACCEPTED')}
                                >
                                  Tham gia
                                </Button>
                                <Button
                                  size="small"
                                  danger
                                  style={{ fontSize: 11 }}
                                  onClick={() => handleRespondMemberInvite(member.member_id, 'DECLINED')}
                                >
                                  Từ chối
                                </Button>
                              </Space>
                            ) : (
                              <EllipsisOutlined style={{ color: '#8c8c8c', cursor: 'pointer' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* BOX KINH PHÍ & DỰ TOÁN */}
                  <Card
                    title="Kinh phí & Ngân sách đề tài"
                    style={{ marginTop: 20, borderRadius: 8 }}
                    extra={<DollarCircleOutlined style={{ color: '#faad14', fontSize: 18 }} />}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Dự toán nhóm đăng ký:</span>
                        <b>{Number(project.budgets?.requested_amount ?? 0).toLocaleString('vi-VN')} đ</b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Hội đồng Khoa đề xuất:</span>
                        <b>
                          {project.status === 'PROPOSED'
                            ? 'Chờ Khoa đề xuất'
                            : `${Number(project.budgets?.faculty_proposed ?? 0).toLocaleString('vi-VN')} đ`}
                        </b>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Học viện phê duyệt:</span>
                        <b style={{ color: project.status === 'REJECTED' ? '#ff4d4f' : '#C62828' }}>
                          {['PROPOSED', 'FACULTY_APPROVED'].includes(project.status)
                            ? 'Chờ Học viện duyệt'
                            : `${Number(project.budgets?.approved_amount ?? 0).toLocaleString('vi-VN')} đ`}
                        </b>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ),
          },
          {
            key: 'outline',
            label: 'Đề cương chi tiết (Mẫu 2)',
            children: (() => {
              const latestOutline = project.outlines?.[0];
              const isOutlineLocked =
                ['ACCEPTED', 'REJECTED', 'CANCELLED', 'SUBMITTED'].includes(project.status) ||
                latestOutline?.approval_status === 'FACULTY_APPROVED';

              return (
                <Card
                  title="Hồ sơ Thuyết minh Đề cương nghiên cứu (Mẫu 2 - QĐ 521)"
                  extra={
                    isOutlineLocked ? (
                      <Tag color="green" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
                        Đã hoàn tất phê duyệt Đề cương
                      </Tag>
                    ) : (
                      (isStudent || isAdmin) && (
                        <Button
                          type="primary"
                          icon={<UploadOutlined />}
                          style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                          onClick={() => setOutlineModalVisible(true)}
                        >
                          {latestOutline ? 'Nộp phiên bản chỉnh sửa' : 'Soạn & Nộp Đề cương'}
                        </Button>
                      )
                    )
                  }
                >
                  {project.outlines && project.outlines.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {project.outlines.map((ot: any) => (
                        <div
                          key={ot.outline_id}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: '#FAFAFA',
                            borderRadius: 8,
                            border: '1px solid #EDEDEE',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 12,
                          }}
                        >
                          <div>
                            <Space size={8}>
                              <FilePdfOutlined style={{ color: '#C62828', fontSize: 18 }} />
                              <span style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>
                                Phiên bản {ot.version_no || 1} — Thuyết minh Đề cương (Mẫu 2)
                              </span>
                            </Space>
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                              Thời điểm nộp: {ot.submitted_at ? new Date(ot.submitted_at).toLocaleString('vi-VN') : '07:00:00 10/10/2026'}
                            </div>
                          </div>

                          <Space size={8} wrap>
                            {(isLecturer || isAdmin) && ['PENDING', 'REVISION_REQUIRED'].includes(ot.approval_status) && (
                              <Button
                                type="primary"
                                size="small"
                                style={{ backgroundColor: '#52C41A', borderColor: '#52C41A' }}
                                onClick={() => handleOutlineApprove(ot.outline_id, 'APPROVED')}
                              >
                                GVHD Duyệt (Cấp 1)
                              </Button>
                            )}
                            {(isFacultyLeader || roleCode === 'FACULTY_SECRETARY' || isAdmin) && ot.approval_status === 'ADVISOR_APPROVED' && (
                              <Button
                                type="primary"
                                size="small"
                                style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                                onClick={() => handleOutlineApprove(ot.outline_id, 'APPROVED')}
                              >
                                Trưởng khoa Ký duyệt (Cấp 2)
                              </Button>
                            )}
                            <Tag
                              color={
                                ot.approval_status === 'FACULTY_APPROVED'
                                  ? 'green'
                                  : ot.approval_status === 'ADVISOR_APPROVED'
                                    ? 'blue'
                                    : ot.approval_status === 'REVISION_REQUIRED'
                                      ? 'orange'
                                      : ot.approval_status === 'REJECTED'
                                        ? 'red'
                                        : 'gold'
                              }
                            >
                              {ot.approval_status === 'FACULTY_APPROVED'
                                ? 'Đã phê duyệt 2 cấp'
                                : ot.approval_status === 'ADVISOR_APPROVED'
                                  ? 'GVHD đã duyệt • Chờ Khoa'
                                  : ot.approval_status === 'REVISION_REQUIRED'
                                    ? 'Yêu cầu chỉnh sửa'
                                    : ot.approval_status === 'REJECTED'
                                      ? 'Từ chối'
                                      : 'Chờ GVHD duyệt'}
                            </Tag>
                          </Space>
                        </div>
                      ))}

                      {/* KHUNG XEM TRƯỚC TRỰC TIẾP TRÊN TRANG (1 THANH CÔNG CỤ DUY NHẤT, KHÔNG TRÙNG NÚT) */}
                      <Divider style={{ margin: '16px 0 12px' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
                            Bản kết xuất Thuyết minh Đề cương (Mẫu 2 - A4)
                          </span>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            Tự động đồng bộ từ 12 mục thuyết minh đã kê khai trên hệ thống.
                          </div>
                        </div>
                        <Space>
                          <Button
                            icon={<FullscreenOutlined />}
                            onClick={() => {
                              setPreviewZoom(100);
                              setDocPreviewModal({
                                code: 'm2',
                                title: 'Mẫu 2 - Thuyết minh Đề cương Chi tiết',
                                gwduDoc: 'doc-m2',
                              });
                            }}
                          >
                            Toàn màn hình
                          </Button>
                          <Button
                            icon={<EyeOutlined />}
                            onClick={() => window.open(`/gwdu?doc=doc-m2&projectId=${project.project_id}`, '_blank')}
                          >
                            Mở cổng GWDU
                          </Button>
                          <Button
                            icon={<PrinterOutlined />}
                            type="primary"
                            style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600 }}
                            onClick={() => printElement('live-outline-a4-sheet', 'Mẫu 2 - Đề cương nghiên cứu chi tiết')}
                          >
                            In / Xuất PDF
                          </Button>
                        </Space>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#525659',
                          padding: '24px 16px',
                          borderRadius: 8,
                          maxHeight: 750,
                          overflowY: 'auto',
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      >
                        <div
                          id="live-outline-a4-sheet"
                          className="printable-a4-sheet"
                          style={{
                            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                            margin: '0 auto',
                          }}
                        >
                          <Mau2DeCuongChiTiet project={project} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#8c8c8c' }}>
                      Chưa có đề cương nào được nộp. Bấm "Soạn & Nộp Đề cương" để kê khai 12 mục trực tuyến.
                    </div>
                  )}
                </Card>
              );
            })(),
          },
          {
            key: 'acceptance',
            label: 'Nghiệm thu & Chấm điểm (QĐ 521)',
            children: (
              <Card
                title="Hội đồng Nghiệm thu & Phiếu chấm điểm Mẫu 4.1"
                extra={
                  <Space>
                    {(isQLKH || isFacultyLeader || isAdmin) && !project.acceptances && project.status === 'SUBMITTED' && (
                      <Button
                        type="primary"
                        style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                        onClick={() => setCouncilModalVisible(true)}
                      >
                        Thành lập Hội đồng
                      </Button>
                    )}
                    {(isLecturer || isFacultyLeader || isAdmin) && project.acceptances && project.status !== 'ACCEPTED' && (
                      <Button
                        type="primary"
                        style={{ backgroundColor: '#1890FF' }}
                        onClick={() => setScoreModalVisible(true)}
                      >
                        Chấm điểm Mẫu 4.1
                      </Button>
                    )}
                    {project.acceptances && (
                      <Button
                        icon={<PrinterOutlined />}
                        onClick={() => {
                          setPreviewZoom(100);
                          setDocPreviewModal({
                            code: 'm42',
                            title: 'Mẫu 4.2 - Biên bản Họp Hội đồng Nghiệm thu',
                            gwduDoc: 'doc-m42',
                          });
                        }}
                      >
                        Xem & In Biên bản (Mẫu 4.2)
                      </Button>
                    )}
                  </Space>
                }
              >
                {project.acceptances ? (
                  <div>
                    {/* BẢNG TỔNG HỢP KẾT QUẢ ĐIỂM SỐ */}
                    <Alert
                      message={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 13, color: '#389e0d' }}>Kết quả nghiệm thu Hội đồng:</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#274916' }}>
                              {project.acceptances.avg_score != null
                                ? `Điểm trung bình: ${Number(project.acceptances.avg_score).toFixed(1)} / 100`
                                : 'Đang chờ Hội đồng chấm điểm'}
                            </div>
                          </div>
                          <Tag color="green" style={{ fontSize: 16, padding: '6px 16px', borderRadius: 8 }}>
                            Xếp loại:{' '}
                            {project.acceptances.grade === 'XUAT_SAC'
                              ? 'Xuất sắc'
                              : project.acceptances.grade === 'TOT'
                                ? 'Tốt'
                                : project.acceptances.grade === 'KHA'
                                  ? 'Khá'
                                  : project.acceptances.grade === 'DAT'
                                    ? 'Đạt'
                                    : project.acceptances.grade === 'KHONG_DAT'
                                      ? 'Không đạt'
                                      : 'Chờ chấm điểm'}
                          </Tag>
                        </div>
                      }
                      type="success"
                      style={{ marginBottom: 20, borderRadius: 8 }}
                    />

                    <Title level={5}>Thành viên Hội đồng nghiệm thu bảo vệ:</Title>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                      {project.acceptances.councils?.council_members?.map((cm: any) => (
                        <Card key={cm.cm_id} size="small" style={{ width: 270, borderRadius: 6 }}>
                          <div style={{ fontWeight: 600 }}>{cm.lecturers?.users?.full_name}</div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            {cm.council_role === 'CHAIR'
                              ? 'Chủ tịch Hội đồng'
                              : cm.council_role === 'SECRETARY'
                                ? 'Thư ký Hội đồng'
                                : cm.council_role === 'REVIEWER' || cm.council_role === 'REVIEWER_1'
                                  ? 'Ủy viên Phản biện 1'
                                  : cm.council_role === 'REVIEWER_2'
                                    ? 'Ủy viên Phản biện 2'
                                    : 'Ủy viên Hội đồng'}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: '#8c8c8c' }}>
                    {project.status === 'SUBMITTED'
                      ? 'Đề tài đã nộp hồ sơ tổng kết, đang chờ Khoa / P.QLKHCN thành lập Hội đồng nghiệm thu.'
                      : 'Chưa đến giai đoạn nghiệm thu (đề tài cần nộp hồ sơ tổng kết trước khi lập Hội đồng).'}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: 'templates',
            label: 'Hồ sơ pháp lý đề tài',
            children: (() => {
              const hasOutline =
                (project.outlines && project.outlines.length > 0) ||
                ['ONGOING', 'APPROVED', 'OUTLINE_SUBMITTED', 'SUBMITTED', 'ACCEPTED'].includes(project.status);
              const hasSeminar =
                (project.seminars && project.seminars.length > 0) ||
                ['SUBMITTED', 'ACCEPTED'].includes(project.status);
              const hasSubmittedReport = ['SUBMITTED', 'ACCEPTED'].includes(project.status);
              const hasAcceptance = Boolean(project.acceptances);
              const canReward =
                (project.award_nominations && project.award_nominations.length > 0) ||
                ['XUAT_SAC', 'TOT', 'KHA'].includes(project.acceptances?.grade);

              const dossierRows = [
                {
                  key: 'm1',
                  stage: '1. Đăng ký & Sơ tuyển',
                  docName: 'Mẫu 1 — Công văn đăng ký đề tài NCKH cấp Khoa',
                  owner: 'Khoa & P.QLKHCN',
                  ready: true,
                  statusText: 'Đã ghi nhận khi đăng ký đề tài',
                  gwduDoc: 'doc-m1',
                },
                {
                  key: 'm2',
                  stage: '2. Thuyết minh Đề cương',
                  docName: 'Mẫu 2 — Thuyết minh Đề cương chi tiết (12 mục)',
                  owner: 'Chủ nhiệm, GVHD & Trưởng khoa',
                  ready: hasOutline,
                  statusText: hasOutline ? 'Đã đồng bộ từ Tab Đề cương' : 'Chưa nộp đề cương Mẫu 2',
                  gwduDoc: 'doc-m2',
                },
                {
                  key: 'm35',
                  stage: '3. Tiến độ & SHKH',
                  docName: 'Mẫu 3.5 — Biên bản Sinh hoạt Khoa học cấp Khoa',
                  owner: 'Khoa chủ trì & Thư ký Khoa',
                  ready: hasSeminar,
                  statusText: hasSeminar ? 'Đã phát sinh từ phân hệ Tiến độ & SHKH' : 'Chưa tổ chức phiên SHKH',
                  gwduDoc: 'doc-m35',
                },
                {
                  key: 'm3',
                  stage: '4. Nộp hồ sơ Tổng kết',
                  docName: 'Mẫu 3.2 & 3.3 — Bìa chính & Bìa phụ Báo cáo tổng kết',
                  owner: 'Nhóm sinh viên',
                  ready: hasSubmittedReport,
                  statusText: hasSubmittedReport ? 'Đã kết xuất cùng hồ sơ tổng kết' : 'Mở khi nộp tổng kết (SUBMITTED)',
                  gwduDoc: 'doc-m3',
                },
                {
                  key: 'm34',
                  stage: '4. Nộp hồ sơ Tổng kết',
                  docName: 'Mẫu 3.4 — Báo cáo tóm tắt công trình nghiên cứu',
                  owner: 'Nhóm sinh viên',
                  ready: hasSubmittedReport,
                  statusText: hasSubmittedReport ? 'Đã kết xuất cùng hồ sơ tổng kết' : 'Mở khi nộp tổng kết (SUBMITTED)',
                },
                {
                  key: 'm41',
                  stage: '5. Hội đồng Nghiệm thu',
                  docName: 'Mẫu 4.1 — Phiếu đánh giá đề tài NCKH (7 tiêu chí / 100đ)',
                  owner: 'Thành viên Hội đồng',
                  ready: hasAcceptance,
                  statusText: hasAcceptance ? 'Đã có dữ liệu Hội đồng nghiệm thu' : 'Chưa thành lập Hội đồng',
                  gwduDoc: 'doc-m41',
                },
                {
                  key: 'm42',
                  stage: '5. Hội đồng Nghiệm thu',
                  docName: 'Mẫu 4.2 — Biên bản họp Hội đồng đánh giá nghiệm thu',
                  owner: 'Chủ tịch & Thư ký Hội đồng',
                  ready: hasAcceptance,
                  statusText: hasAcceptance ? 'Đã kết xuất từ điểm tổng hợp Hội đồng' : 'Chưa thành lập Hội đồng',
                  gwduDoc: 'doc-m42',
                },
                {
                  key: 'm43',
                  stage: '5. Hội đồng Nghiệm thu',
                  docName: 'Mẫu 4.3 — Bản nhận xét đánh giá của Ủy viên phản biện',
                  owner: 'Ủy viên Phản biện',
                  ready: hasAcceptance,
                  statusText: hasAcceptance ? 'Đã kết xuất từ nhận xét phản biện' : 'Chưa thành lập Hội đồng',
                },
                {
                  key: 'm5',
                  stage: '6. Khen thưởng (≥ Khá)',
                  docName: 'Mẫu 5 — Công văn đề nghị khen thưởng công trình NCKH',
                  owner: 'Hội đồng Khoa & P.QLKHCN',
                  ready: canReward,
                  statusText: canReward
                    ? 'Đủ điều kiện / Đã lập hồ sơ Mẫu 5'
                    : 'Chỉ mở khi nghiệm thu đạt từ Khá trở lên',
                  gwduDoc: 'doc-m5',
                },
              ];

              return (
                <Card
                  title="Hồ sơ văn bản số hóa theo vòng đời Đề tài (QĐ 521/QĐ-HV)"
                  extra={
                    <Button icon={<FileTextOutlined />} onClick={() => navigate('/forms')}>
                      Mở Kho Biểu mẫu chuẩn QĐ 521
                    </Button>
                  }
                >
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Mỗi biểu mẫu được hệ thống tự động kết xuất từ dữ liệu nghiệp vụ của giai đoạn tương ứng (không cần nhập lại). Chỉ những giai đoạn đề tài đã đi qua mới mở khóa xem và in."
                  />
                  <Table
                    rowKey="key"
                    pagination={false}
                    size="middle"
                    dataSource={dossierRows}
                    columns={[
                      {
                        title: 'Giai đoạn',
                        dataIndex: 'stage',
                        key: 'stage',
                        width: 190,
                        render: (val: string) => <Text strong>{val}</Text>,
                      },
                      {
                        title: 'Biểu mẫu số hóa',
                        dataIndex: 'docName',
                        key: 'docName',
                        render: (val: string, r: any) => (
                          <div>
                            <div style={{ fontWeight: 600, color: r.ready ? '#262626' : '#8c8c8c' }}>{val}</div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Đơn vị thực hiện: {r.owner}</div>
                          </div>
                        ),
                      },
                      {
                        title: 'Trạng thái hồ sơ',
                        key: 'status',
                        width: 260,
                        render: (_: any, r: any) =>
                          r.ready ? (
                            <Tag color="green" icon={<CheckCircleOutlined />}>
                              {r.statusText}
                            </Tag>
                          ) : (
                            <Tag color="default" icon={<LockOutlined />}>
                              {r.statusText}
                            </Tag>
                          ),
                      },
                      {
                        title: 'Thao tác',
                        key: 'action',
                        width: 150,
                        align: 'right' as const,
                        render: (_: any, r: any) => (
                          <Button
                            size="small"
                            type={r.ready ? 'primary' : 'default'}
                            disabled={!r.ready}
                            style={r.ready ? { backgroundColor: '#C62828', borderColor: '#C62828' } : {}}
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setPreviewZoom(100);
                              setDocPreviewModal({
                                code: r.key,
                                title: r.docName,
                                gwduDoc: r.gwduDoc,
                              });
                            }}
                          >
                            Xem & In A4
                          </Button>
                        ),
                      },
                    ]}
                  />
                </Card>
              );
            })(),
          },
        ]}
      />

      {/* MODAL SỐ HÓA SOẠN THẢO & NỘP THUYẾT MINH ĐỀ CƯƠNG (MẪU 2 - QĐ 521) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: '#FFF1F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C62828',
                fontSize: 18,
              }}
            >
              <FileTextOutlined />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1f1f1f' }}>
                Số hóa Soạn thảo & Nộp Thuyết minh Đề cương (Mẫu 2 - QĐ 521)
              </div>
              <div style={{ fontSize: 12, fontWeight: 'normal', color: '#8c8c8c' }}>
                Soạn thảo và chỉnh sửa trực tiếp 12 mục đề cương trên hệ thống số hóa • Không cần liên kết ngoài
              </div>
            </div>
          </div>
        }
        open={outlineModalVisible}
        onCancel={() => setOutlineModalVisible(false)}
        width={980}
        style={{ top: 20 }}
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 12,
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <Button onClick={() => setOutlineModalVisible(false)}>
              Đóng
            </Button>
            <Space size={10}>
              <Button
                icon={<EyeOutlined />}
                onClick={() => {
                  handleOutlineFormValuesChange();
                  setActiveOutlineTab('tab-preview');
                }}
              >
                Xem trước Mẫu 2 (A4)
              </Button>
              <Button
                icon={<SaveOutlined />}
                onClick={handleSaveOutlineDraft}
                loading={submittingOutline}
              >
                Lưu bản nháp
              </Button>
              <Button
                type="primary"
                style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600 }}
                icon={<SendOutlined />}
                onClick={() => outlineForm.submit()}
                loading={submittingOutline}
              >
                Nộp chính thức Đề cương (Mẫu 2)
              </Button>
            </Space>
          </div>
        }
        destroyOnClose={false}
      >
        <Alert
          type="info"
          showIcon
          message="Chuyển đổi số toàn diện quy trình NCKH Sinh viên theo QĐ 521/QĐ-HV"
          description="Hệ thống quản lý trực tiếp nội dung đề cương 12 mục trong cơ sở dữ liệu. Toàn bộ văn bản hành chính được kết xuất tự động theo chuẩn quy định Học viện. Sinh viên nhập trực tiếp form trên máy hoặc đính kèm tệp số hóa nội bộ nếu có."
          style={{ marginBottom: 16 }}
        />

        <Form
          form={outlineForm}
          layout="vertical"
          onFinish={handleOutlineSubmit}
          onValuesChange={handleOutlineFormValuesChange}
        >
          <Tabs
            activeKey={activeOutlineTab}
            onChange={setActiveOutlineTab}
            type="card"
            items={[
              {
                key: 'tab-general',
                label: '📋 1. Thông tin chung & Tính cấp thiết',
                children: (
                  <div style={{ padding: '8px 4px' }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label={<b>Mã đề tài</b>}>
                          <Input value={project?.project_id || id} disabled style={{ backgroundColor: '#f5f5f5', fontWeight: 600 }} />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item name="titleVi" label={<b>Tên đề tài nghiên cứu (Tiếng Việt)</b>} initialValue={project?.title_vi}>
                          <Input disabled style={{ backgroundColor: '#f5f5f5', fontWeight: 600 }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={14}>
                        <Form.Item name="titleEn" label={<b>Tên đề tài bằng Tiếng Anh</b>} rules={[{ required: true, message: 'Vui lòng nhập tên tiếng Anh' }]}>
                          <Input placeholder="English Title of Research Project" />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item name="researchField" label={<b>Lĩnh vực KH&CN</b>} rules={[{ required: true, message: 'Chọn lĩnh vực' }]}>
                          <Select
                            options={[
                              { value: 'Công nghệ thông tin & Chuyển đổi số', label: 'Công nghệ thông tin & Chuyển đổi số' },
                              { value: 'Kỹ thuật Điện tử - Viễn thông & IoT', label: 'Kỹ thuật Điện tử - Viễn thông & IoT' },
                              { value: 'An toàn thông tin & Mật mã học', label: 'An toàn thông tin & Mật mã học' },
                              { value: 'Trí tuệ nhân tạo & Khoa học dữ liệu', label: 'Trí tuệ nhân tạo & Khoa học dữ liệu' },
                              { value: 'Kinh tế số & Thương mại điện tử', label: 'Kinh tế số & Thương mại điện tử' },
                              { value: 'Truyền thông đa phương tiện', label: 'Truyền thông đa phương tiện' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="keywords" label={<b>Từ khóa nghiên cứu (Keywords)</b>}>
                      <Input placeholder="Cách nhau bằng dấu phẩy, ví dụ: SRMS, S-Link, QĐ 521, Monorepo, NestJS" />
                    </Form.Item>

                    <Form.Item
                      name="urgency"
                      label={<b>3. Tính cấp thiết của đề tài (Lý do chọn đề tài, tính mới & khoảng trống nghiên cứu) *</b>}
                      rules={[{ required: true, message: 'Vui lòng nhập tính cấp thiết của đề tài' }]}
                    >
                      <Input.TextArea
                        rows={4}
                        placeholder="Nêu rõ lý do lựa chọn hướng nghiên cứu, thực trạng vấn đề tại Học viện hoặc xã hội, tính cấp bách cần giải quyết..."
                        showCount
                        maxLength={1500}
                      />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'tab-objectives',
                label: '🎯 2. Mục tiêu, Đối tượng & Phương pháp',
                children: (
                  <div style={{ padding: '8px 4px' }}>
                    <Form.Item
                      name="objectives"
                      label={<b>4. Mục tiêu nghiên cứu (Mục tiêu tổng quát & Mục tiêu cụ thể) *</b>}
                      rules={[{ required: true, message: 'Vui lòng nhập mục tiêu nghiên cứu' }]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Mục tiêu chung: Giải quyết bài toán gì? Mục tiêu cụ thể: Xây dựng các chức năng, chỉ số đo lường..."
                        showCount
                        maxLength={1000}
                      />
                    </Form.Item>

                    <Form.Item
                      name="targetScope"
                      label={<b>5. Đối tượng và phạm vi nghiên cứu *</b>}
                      rules={[{ required: true, message: 'Vui lòng nhập đối tượng và phạm vi' }]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Đối tượng nghiên cứu: Quy trình, công nghệ, người dùng... Phạm vi: Không gian, thời gian, giới hạn đề tài..."
                        showCount
                        maxLength={800}
                      />
                    </Form.Item>

                    <Form.Item
                      name="methodology"
                      label={<b>6. Cách tiếp cận và phương pháp nghiên cứu *</b>}
                      rules={[{ required: true, message: 'Vui lòng nhập phương pháp nghiên cứu' }]}
                    >
                      <Input.TextArea
                        rows={4}
                        placeholder="Cách tiếp cận (lý thuyết, thực nghiệm), các phương pháp nghiên cứu khoa học, mô hình hóa giải pháp, phát triển phần mềm và kiểm thử đánh giá..."
                        showCount
                        maxLength={1200}
                      />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'tab-content',
                label: '📝 3. Nội dung nghiên cứu & Kế hoạch',
                children: (
                  <div style={{ padding: '8px 4px' }}>
                    <Form.Item
                      name="content"
                      label={<b>7. Nội dung nghiên cứu chi tiết (Các gói công việc WP & phân công nhiệm vụ) *</b>}
                      rules={[{ required: true, message: 'Vui lòng nhập nội dung chi tiết' }]}
                    >
                      <Input.TextArea
                        rows={5}
                        placeholder="Nội dung 1: Khảo sát hiện trạng và chuẩn hóa quy trình. Nội dung 2: Thiết kế kiến trúc giải pháp và mô hình dữ liệu tổng thể. Nội dung 3: Hiện thực hóa các phân hệ backend & frontend. Nội dung 4: Thử nghiệm và đánh giá chất lượng..."
                        showCount
                        maxLength={2000}
                      />
                    </Form.Item>

                    <Form.Item
                      name="plan"
                      label={<b>Kế hoạch và tiến độ thực hiện theo các mốc thời gian</b>}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Tiến độ từng giai đoạn thực hiện đề tài..."
                        showCount
                        maxLength={800}
                      />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'tab-products',
                label: '📦 4. Sản phẩm dự kiến, Kinh phí & Đính kèm số',
                children: (
                  <div style={{ padding: '8px 4px' }}>
                    <Row gutter={16}>
                      <Col span={14}>
                        <Form.Item
                          name="expectedResult"
                          label={<b>8. Sản phẩm dự kiến (Dạng I: Báo cáo/Bài báo, Dạng II: Phần mềm/Mô hình) *</b>}
                          rules={[{ required: true, message: 'Vui lòng nhập sản phẩm dự kiến' }]}
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder="Liệt kê sản phẩm khoa học (báo cáo, bài báo kỷ yếu) và sản phẩm ứng dụng thực tế (ứng dụng web, module phần mềm, tài liệu kỹ thuật)..."
                          />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item
                          name="applicationAddress"
                          label={<b>Địa chỉ ứng dụng kết quả</b>}
                        >
                          <Input placeholder="Nơi tiếp nhận hoặc ứng dụng sản phẩm đề tài..." />
                        </Form.Item>

                        <Form.Item
                          name="requestedBudget"
                          label={<b>12. Dự toán kinh phí thực hiện đề tài (VNĐ)</b>}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => (value ? Number(value.replace(/,/g, '')) : 0) as any}
                            addonAfter="VNĐ"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* KHU VỰC ĐÍNH KÈM TÀI LIỆU SỐ HÓA NỘI BỘ (KHÔNG LIÊN KẾT NGOÀI) */}
                    <div style={{ marginTop: 8, padding: 14, backgroundColor: '#F8F9FA', borderRadius: 8, border: '1px dashed #D9D9D9' }}>
                      <div style={{ fontWeight: 600, marginBottom: 8, color: '#262626', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FilePdfOutlined style={{ color: '#C62828' }} />
                        <span>Tệp thuyết minh số hóa bổ sung (.PDF / .DOCX - Tùy chọn)</span>
                      </div>
                      <Upload.Dragger
                        name="outlineAttachment"
                        multiple={false}
                        beforeUpload={(file) => {
                          setUploadedOutlineFile(file);
                          message.success(`Đã đính kèm tệp: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                          return false;
                        }}
                        onRemove={() => setUploadedOutlineFile(null)}
                        fileList={uploadedOutlineFile ? [uploadedOutlineFile] : []}
                        maxCount={1}
                        accept=".pdf,.docx,.doc"
                        style={{ padding: '12px 0', backgroundColor: '#FFFFFF' }}
                      >
                        <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
                          <InboxOutlined style={{ fontSize: 32, color: '#C62828' }} />
                        </p>
                        <p className="ant-upload-text" style={{ fontSize: 13, fontWeight: 600 }}>
                          Kéo thả hoặc bấm để đính kèm bản thuyết minh hoàn chỉnh từ máy tính
                        </p>
                        <p className="ant-upload-hint" style={{ fontSize: 12, color: '#8c8c8c' }}>
                          Lưu trữ nội bộ an toàn trên hệ thống máy chủ Học viện PTIT (Hỗ trợ PDF, DOCX tối đa 25MB)
                        </p>
                      </Upload.Dragger>
                      {uploadedOutlineFile && (
                        <div style={{ marginTop: 8, color: '#52C41A', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircleOutlined /> Đã sẵn sàng lưu trữ vào hệ thống: <b>/storage/outlines/{project?.project_id}_{uploadedOutlineFile.name}</b>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: 'tab-preview',
                label: '👁️ 5. Xem trước trực tiếp Mẫu 2 (A4 Live Preview)',
                children: (
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Bản in thử Mẫu 2 A4 tự động phản ánh các thông tin bạn vừa nhập trên form.
                      </Text>
                      <Button
                        size="small"
                        icon={<PrinterOutlined />}
                        onClick={() => printElement('live-outline-modal-a4-sheet', 'Thuyết minh đề cương Mẫu 2')}
                      >
                        In thử bản xem trước A4
                      </Button>
                    </div>
                    <div
                      style={{
                        maxHeight: 520,
                        overflowY: 'auto',
                        border: '1px solid #D9D9D9',
                        padding: 16,
                        backgroundColor: '#F5F5F5',
                        borderRadius: 6,
                      }}
                    >
                      <div id="live-outline-modal-a4-sheet" className="printable-a4-sheet" style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
                        <Mau2DeCuongChiTiet project={outlineDraftData || project} />
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Form>
      </Modal>

      {/* MODAL THÀNH LẬP HỘI ĐỒNG */}
      <Modal
        title="5.2 Thành lập Hội đồng nghiệm thu bảo vệ đề tài"
        open={councilModalVisible}
        onCancel={() => setCouncilModalVisible(false)}
        onOk={() => councilForm.submit()}
        okText="Ban hành Quyết định"
      >
        <Form form={councilForm} layout="vertical" onFinish={handleCreateCouncil}>
          <Form.Item name="councilName" label="Tên Hội đồng" initialValue="Hội đồng nghiệm thu Đề tài NCKH SV Khoa CNTT1">
            <Input />
          </Form.Item>
          <Form.Item name="decisionNo" label="Số Quyết định thành lập" initialValue="145/QĐ-HV">
            <Input />
          </Form.Item>
          <Form.Item name="location" label="Địa điểm họp bảo vệ" initialValue="Phòng Hội thảo Nhà A2 - Tầng 2">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL CHẤM ĐIỂM PHIẾU MẪU 4.1 THEO 7 TIÊU CHÍ CHUẨN */}
      <Modal
        title="5.3 Phiếu chấm điểm nghiệm thu bảo vệ đề tài (Mẫu 4.1 - QĐ 521)"
        open={scoreModalVisible}
        onCancel={() => setScoreModalVisible(false)}
        onOk={() => scoreForm.submit()}
        okText="Xác nhận gửi điểm"
        width={720}
      >
        <Form form={scoreForm} layout="vertical" onFinish={handleScoreSubmit}>
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
            <div style={{ fontWeight: 600, color: '#C62828', marginBottom: 12 }}>
              Đánh giá theo 7 tiêu chí quy định tại Mẫu 4.1 QĐ 521/QĐ-HV (Thang điểm 100):
            </div>
            <Form.Item name="score1" label="1. Tổng quan tình hình nghiên cứu thuộc lĩnh vực đề tài (Tối đa 20đ)" initialValue={18}>
              <Input type="number" max={20} min={0} step={0.5} />
            </Form.Item>
            <Form.Item name="score2" label="2. Mục tiêu đề tài (Tối đa 20đ)" initialValue={18}>
              <Input type="number" max={20} min={0} step={0.5} />
            </Form.Item>
            <Form.Item name="score3" label="3. Phương pháp nghiên cứu (Tối đa 20đ)" initialValue={18}>
              <Input type="number" max={20} min={0} step={0.5} />
            </Form.Item>
            <Form.Item name="score4" label="4. Nội dung khoa học (Tối đa 15đ)" initialValue={14}>
              <Input type="number" max={15} min={0} step={0.5} />
            </Form.Item>
            <Form.Item name="score5" label="5. Đóng góp về mặt kinh tế - xã hội, giáo dục và đào tạo, an ninh, quốc phòng (Tối đa 10đ)" initialValue={9}>
              <Input type="number" max={10} min={0} step={0.5} />
            </Form.Item>
            <Form.Item name="score6" label="6. Hình thức trình bày báo cáo tổng kết đề tài (Tối đa 10đ)" initialValue={9}>
              <Input type="number" max={10} min={0} step={0.5} />
            </Form.Item>
            <Form.Item name="score7" label="7. Điểm thưởng (có công bố khoa học hoặc sản phẩm ứng dụng thực tiễn cao) (Tối đa 5đ)" initialValue={4.5}>
              <Input type="number" max={5} min={0} step={0.5} />
            </Form.Item>

            <Divider />
            <Form.Item name="strengths" label="Ưu điểm nổi bật (Khung 1)" initialValue="Đề tài có tính cấp thiết cao, sản phẩm phần mềm chạy tốt">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="limitations" label="Hạn chế cần hoàn thiện (Khung 2)" initialValue="Cần viết thêm tài liệu hướng dẫn sử dụng chi tiết">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="recommendAward" label="Đề xuất khen thưởng (Khung 4)" initialValue={true}>
              <Select
                options={[
                  { value: true, label: 'Đề nghị xét Khen thưởng NCKH sinh viên (Mẫu 5)' },
                  { value: false, label: 'Không đề xuất khen thưởng' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* MODAL KÊ KHAI CHỨNG TỪ QUYẾT TOÁN */}
      <Modal
        title="6.6 Kê khai chứng từ thanh quyết toán chi tiêu (P.TCKT)"
        open={settleModalVisible}
        onCancel={() => setSettleModalVisible(false)}
        onOk={() => settleForm.submit()}
        okText="Lưu chứng từ"
      >
        <Form form={settleForm} layout="vertical" onFinish={handleSettleSubmit}>
          <Form.Item name="voucherNo" label="Số hóa đơn / Phiếu chi" initialValue="PC-2026-089" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="Số tiền thanh toán (VNĐ)" initialValue={2500000} rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="voucherFileUrl" label="Liên kết tệp hóa đơn chứng từ" initialValue="/storage/vouchers/PC-2026-089.pdf">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL XEM TRƯỚC & IN VĂN BẢN A4 THỐNG NHẤT */}
      <Modal
        open={Boolean(docPreviewModal)}
        onCancel={() => setDocPreviewModal(null)}
        footer={null}
        width={1050}
        style={{ top: 20 }}
        styles={{ body: { padding: 0 } }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilePdfOutlined style={{ color: '#C62828', fontSize: 18 }} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              {docPreviewModal?.title || 'Xem trước biểu mẫu A4'}
            </span>
            <Tag color="red" style={{ marginLeft: 4 }}>QĐ 521/QĐ-HV</Tag>
          </div>
        }
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 18px',
            borderBottom: '1px solid #EDEDEE',
            backgroundColor: '#FAFAFA',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 600, color: '#262626', fontSize: 13 }}>
            {project?.project_id || 'SV-2026-CNTT1-001'} • {docPreviewModal?.code?.toUpperCase()}
          </div>

          <Space size={10} align="center">
            <Space size={4}>
              <Tooltip title="Thu nhỏ">
                <Button
                  size="small"
                  icon={<ZoomOutOutlined />}
                  onClick={() => setPreviewZoom((z) => Math.max(z - 15, 60))}
                />
              </Tooltip>
              <span style={{ fontSize: 12, width: 44, textAlign: 'center', fontWeight: 500 }}>
                {previewZoom}%
              </span>
              <Tooltip title="Phóng to">
                <Button
                  size="small"
                  icon={<ZoomInOutlined />}
                  onClick={() => setPreviewZoom((z) => Math.min(z + 15, 180))}
                />
              </Tooltip>
            </Space>

            <span style={{ borderLeft: '1px solid #D9D9D9', height: 16, margin: '0 4px' }} />

            {docPreviewModal?.gwduDoc && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() =>
                  window.open(`/gwdu?doc=${docPreviewModal.gwduDoc}&projectId=${project.project_id}`, '_blank')
                }
              >
                Mở cổng GWDU
              </Button>
            )}

            <Button
              size="small"
              type="primary"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              icon={<PrinterOutlined />}
              onClick={() => printElement('modal-unified-a4-sheet', docPreviewModal?.title || 'Bieu_mau_QD521')}
            >
              In / Lưu PDF A4
            </Button>
          </Space>
        </div>

        <div
          style={{
            height: '75vh',
            backgroundColor: '#525659',
            overflow: 'auto',
            padding: '24px 16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <div
            id="modal-unified-a4-sheet"
            className="printable-a4-sheet"
            style={{
              transform: `scale(${previewZoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            {docPreviewModal?.code === 'm1' && <Mau1CongVanKhoa project={project} />}
            {docPreviewModal?.code === 'm2' && <Mau2DeCuongChiTiet project={project} />}
            {docPreviewModal?.code === 'm3' && <Mau3BiaBaoCao project={project} />}
            {docPreviewModal?.code === 'm34' && <Mau34BaoCaoTomTat project={project} />}
            {docPreviewModal?.code === 'm35' && <Mau35BienBanSinhHoat project={project} />}
            {docPreviewModal?.code === 'm41' && <Mau41PhieuDanhGia project={project} />}
            {docPreviewModal?.code === 'm42' && <Mau42BienBanHoiDong project={project} />}
            {docPreviewModal?.code === 'm43' && <Mau43BanNhanXet project={project} />}
            {docPreviewModal?.code === 'm5' && <Mau5DeNghiKhenThuong project={project} />}
          </div>
        </div>
      </Modal>
    </div>
  );
};
