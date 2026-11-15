import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Typography,
  Modal,
  List,
  Avatar,
  message,
  Tooltip,
  Tabs,
} from 'antd';
import {
  ExportOutlined,
  ReloadOutlined,
  FilterOutlined,
  SearchOutlined,
  SettingOutlined,
  EyeOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileProtectOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  UserOutlined,
  UnorderedListOutlined,
  RocketOutlined,
  AuditOutlined,
  BookOutlined,
  TeamOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PtitSpinner } from '../components/common/PtitSpinner';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// DANH MỤC 10 ĐỀ TÀI MẪU CHUẨN ĐỒNG BỘ TOÀN HỆ THỐNG
export const defaultProjectsList: any[] = [
  {
    project_id: 'SV-2026-CNTT1-001',
    title_vi: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
    title_en: 'Development of PTIT Student Research Management System on S-Link Platform',
    keywords: 'SRMS, S-Link, QĐ 521, PTIT, NestJS, React, SSO',
    status: 'ONGOING',
    registered_at: '2026-09-10T00:00:00.000Z',
    departments: { dept_name: 'Khoa Công nghệ thông tin 1' },
    project_members: [
      { member_role: 'LEADER', contribution_pct: 60, assigned_task: 'Chủ nhiệm đề tài, thiết kế kiến trúc hệ thống và lập trình backend', students: { student_id: 'B23DCCN001', class_name: 'D23CQCN01-B', users: { full_name: 'Nguyễn Văn An', email: 'an.nv@stu.ptit.edu.vn' } } },
      { member_role: 'MEMBER', contribution_pct: 40, assigned_task: 'Thiết kế giao diện người dùng theo chuẩn S-Link và lập trình frontend', students: { student_id: 'B23DCCN002', class_name: 'D23CQCN01-B', users: { full_name: 'Trần Thị Bình', email: 'binh.tt@stu.ptit.edu.vn' } } },
    ],
    project_advisors: [
      {
        lecturer_id: 'GV001',
        department: 'Khoa Công nghệ thông tin 1',
        lecturers: {
          academic_rank: 'TS',
          users: { full_name: 'TS. Ngô Quốc Dũng', email: 'dungnq@ptit.edu.vn' },
        },
      },
    ],
    publications: {
      paper_title: 'Nghiên cứu kiến trúc số hóa quy trình quản trị nghiên cứu khoa học sinh viên theo chuẩn QĐ 521',
      paper_venue: 'Kỷ yếu Hội thảo Chuyển đổi số Đại học 2026',
      paper_type: 'National Conference',
    },
  },
  {
    project_id: 'SV-2026-CNTT1-002',
    title_vi: 'Mobile AR Apps and Impulse Buying: Perspectives from Indonesian Consumers and Tourists.',
    title_en: 'Mobile AR Apps and Impulse Buying: Perspectives from Indonesian Consumers and Tourists',
    keywords: 'mobile augmented reality, impulse buying, tourism, consumer behavior',
    status: 'FACULTY_APPROVED', // Khoa đã duyệt, chờ Phòng QLKHCN thẩm định & ban hành QĐ giao đề tài
    registered_at: '2026-09-10T00:00:00.000Z',
    departments: { dept_name: 'Khoa Đa phương tiện' },
    project_members: [
      { member_role: 'LEADER', contribution_pct: 50, assigned_task: 'Chủ nhiệm, khảo sát và xây dựng mô hình hồi quy', students: { student_id: 'B23DCDT015', class_name: 'D23CQDT01-B', users: { full_name: 'Nguyễn Minh Tuấn' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Thu thập dữ liệu người tiêu dùng và phân tích SPSS', students: { student_id: 'B23DCDT016', class_name: 'D23CQDT01-B', users: { full_name: 'Vũ Quốc Anh' } } },
      { member_role: 'MEMBER', contribution_pct: 20, assigned_task: 'Soạn thảo báo cáo và tài liệu', students: { student_id: 'B23DCDT017', class_name: 'D23CQDT01-B', users: { full_name: 'Đỗ Thị Hương' } } },
    ],
    project_advisors: [
      {
        lecturer_id: 'GV002',
        department: 'Khoa Đa phương tiện',
        lecturers: {
          academic_rank: 'TS',
          users: { full_name: 'TS. Trần Đình Trí', email: 'tritd@ptit.edu.vn' },
        },
      },
    ],
    publications: {
      paper_title: 'Mobile Augmented Reality Apps in Tourism: An Empirical Investigation on Consumer Behavior',
      paper_venue: 'Scopus / IEEE ICIIT 2026',
      paper_type: 'Scopus',
    },
  },
  {
    project_id: 'SV-2026-CNTT1-003',
    title_vi: 'Mental Imagery and Positive Arousal Influencing Purchase Intention in VR Hotels',
    title_en: 'Mental Imagery and Positive Arousal Influencing Purchase Intention in VR Hotels',
    keywords: 'Virtual Reality, Hotels, Purchase Intention, Tourism, Hospitality',
    status: 'PROPOSED', // Đề xuất mới, chờ xử lý
    registered_at: '2026-09-10T00:00:00.000Z',
    departments: { dept_name: 'Khoa Quản trị kinh doanh' },
    project_members: [
      { member_role: 'LEADER', contribution_pct: 40, assigned_task: 'Chủ nhiệm, thiết kế kịch bản thử nghiệm VR', students: { student_id: 'B23DCQT009', class_name: 'D23CQQT01-B', users: { full_name: 'Phạm Đức Thịnh' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Phát triển ứng dụng VR demo', students: { student_id: 'B23DCQT010', class_name: 'D23CQQT01-B', users: { full_name: 'Lê Thị Mai', email: 'mai.lt@stu.ptit.edu.vn' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Đo lường phản ứng người dùng và thống kê', students: { student_id: 'B23DCQT011', class_name: 'D23CQQT01-B', users: { full_name: 'Bùi Đức Trọng' } } },
    ],
    project_advisors: [
      {
        lecturer_id: 'GV003',
        department: 'Khoa Quản trị kinh doanh',
        lecturers: {
          academic_rank: 'TS',
          users: { full_name: 'TS. Đinh Quang Huy', email: 'huydq@ptit.edu.vn' },
        },
      },
    ],
  },
  {
    project_id: 'SV-2026-CNTT1-004',
    title_vi: 'Phương pháp tiền xử lý và trích xuất đặc trưng từ dữ liệu giao dịch POS giúp cải thiện dự báo doanh thu cho doanh nghiệp SME',
    title_en: 'Feature Extraction from POS Time Series for SME Retail Forecasting',
    keywords: 'data-centric AI, POS data, time series forecasting, SME, feature store',
    status: 'COMPLETED',
    registered_at: '2026-06-05T00:00:00.000Z',
    departments: { dept_name: 'Khoa Công nghệ thông tin 1' },
    project_members: [
      { member_role: 'LEADER', contribution_pct: 40, assigned_task: 'Chủ nhiệm, xây dựng mô hình dự báo AI', students: { student_id: 'B23DCCN088', class_name: 'D23CQCN01-B', users: { full_name: 'Kim Ngọc Bách' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Tiền xử lý và làm sạch dữ liệu POS', students: { student_id: 'B23DCCN089', class_name: 'D23CQCN01-B', users: { full_name: 'Ngô Hải Nam' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Thực nghiệm và so sánh độ chính xác', students: { student_id: 'B23DCCN090', class_name: 'D23CQCN01-B', users: { full_name: 'Trần Quang Huy' } } },
    ],
    project_advisors: [
      {
        lecturer_id: 'GV001',
        department: 'Khoa Công nghệ thông tin 1',
        lecturers: {
          academic_rank: 'TS',
          users: { full_name: 'TS. Ngô Quốc Dũng', email: 'dungnq@ptit.edu.vn' },
        },
      },
    ],
    publications: {
      paper_title: 'Feature Extraction from Point-of-Sale Time Series for SME Retail Forecasting',
      paper_venue: 'Tạp chí Khoa học & Công nghệ Thông tin PTIT (Tập 14, Số 2/2026)',
      paper_type: 'PTIT Journal',
    },
  },
  {
    project_id: 'SV-2026-CNTT1-005',
    title_vi: 'Phát hiện tấn công lỗ hổng bảo mật Zero-day trong hệ sinh thái IoT dựa trên mô hình Deep Learning',
    title_en: 'IoT Zero-day Intrusion Detection using Deep Residual Networks',
    keywords: 'Zero-day attack, Deep Learning, IoT Security, Anomaly Detection',
    status: 'COMPLETED',
    registered_at: '2026-05-18T00:00:00.000Z',
    departments: { dept_name: 'Khoa An toàn thông tin' },
    project_members: [
      { member_role: 'LEADER', contribution_pct: 45, assigned_task: 'Chủ nhiệm, nghiên cứu kiến trúc mô hình ResNet IoT', students: { student_id: 'B23DCAT012', class_name: 'D23CQAT01-B', users: { full_name: 'Hoàng Quốc Việt' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Thu thập dataset traffic mạng IoT', students: { student_id: 'B23DCAT013', class_name: 'D23CQAT01-B', users: { full_name: 'Nguyễn Tiến Đạt' } } },
      { member_role: 'MEMBER', contribution_pct: 25, assigned_task: 'Đánh giá độ chính xác và viết tài liệu', students: { student_id: 'B23DCAT014', class_name: 'D23CQAT01-B', users: { full_name: 'Lê Thùy Dung' } } },
    ],
    project_advisors: [
      {
        lecturer_id: 'GV004',
        department: 'Khoa An toàn thông tin',
        lecturers: {
          academic_rank: 'TS',
          users: { full_name: 'TS. Nguyễn Văn Tuấn', email: 'tuannv@ptit.edu.vn' },
        },
      },
    ],
    publications: {
      paper_title: 'IoT Zero-day Intrusion Detection using Deep Residual Networks and Anomaly Profiling',
      paper_venue: 'Hội thảo Quốc gia An toàn Thông tin - VNSec 2026',
      paper_type: 'National Conference',
    },
  },
  {
    project_id: 'SV-2026-CNTT1-006',
    title_vi: 'Xây dựng trợ lý ảo hỗ trợ học tập dựa trên mô hình ngôn ngữ lớn (LLM) và kỹ thuật RAG cho sinh viên PTIT',
    title_en: 'Retrieval-Augmented Generation for Academic Advising in Vietnamese Higher Education',
    keywords: 'LLM, RAG, Chatbot, S-Link, Llama-3, Vector Database',
    status: 'ONGOING',
    registered_at: '2026-09-12T00:00:00.000Z',
    departments: { dept_name: 'Khoa Công nghệ thông tin 1' },
    project_members: [
      { member_role: 'LEADER', contribution_pct: 50, assigned_task: 'Chủ nhiệm, xây dựng kiến trúc RAG pipeline', students: { student_id: 'B23DCCN099', class_name: 'D23CQCN01-B', users: { full_name: 'Lê Minh Khang' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Thu thập và làm sạch tài liệu đào tạo PTIT', students: { student_id: 'B23DCCN100', class_name: 'D23CQCN01-B', users: { full_name: 'Đặng Thu Trang' } } },
      { member_role: 'MEMBER', contribution_pct: 20, assigned_task: 'Tích hợp giao diện Chatbot S-Link', students: { student_id: 'B23DCCN101', class_name: 'D23CQCN01-B', users: { full_name: 'Phan Quốc Bảo' } } },
    ],
    project_advisors: [
      {
        lecturer_id: 'GV001',
        department: 'Khoa Công nghệ thông tin 1',
        lecturers: {
          academic_rank: 'TS',
          users: { full_name: 'TS. Ngô Quốc Dũng', email: 'dungnq@ptit.edu.vn' },
        },
      },
    ],
    publications: {
      paper_title: 'Retrieval-Augmented Generation for Academic Advising in Vietnamese Higher Education',
      paper_venue: 'Hội thảo Xử lý Ngôn ngữ Tự nhiên VLSP 2026',
      paper_type: 'National Conference',
    },
  },
  {
    project_id: 'SV-2026-CNTT1-007',
    title_vi: 'Tối ưu hóa chuỗi cung ứng nông sản thông minh ứng dụng công nghệ Blockchain và Hợp đồng thông minh',
    title_en: 'Smart Contracts for Agritech Supply Chain Traceability in Vietnam',
    keywords: 'Blockchain, Smart Contracts, Supply Chain, Agritech, Ethereum',
    status: 'SUBMITTED', // Đã nộp báo cáo tổng kết, chờ thành lập Hội đồng nghiệm thu
    registered_at: '2026-08-25T00:00:00.000Z',
    departments: { dept_name: 'Khoa Quản trị kinh doanh' },
    project_members: [
      { member_role: 'LEADER', contribution_pct: 40, assigned_task: 'Chủ nhiệm, phân tích quy trình chuỗi cung ứng', students: { student_id: 'B23DCQT020', class_name: 'D23CQQT02-B', users: { full_name: 'Vũ Mai Phương' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Lập trình Smart Contract trên Solidity', students: { student_id: 'B23DCQT021', class_name: 'D23CQQT02-B', users: { full_name: 'Hoàng Đức Anh' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Thực nghiệm truy xuất nguồn gốc nông sản', students: { student_id: 'B23DCQT022', class_name: 'D23CQQT02-B', users: { full_name: 'Nguyễn Diệu Linh' } } },
    ],
    project_advisors: [
      {
        lecturer_id: 'GV003',
        department: 'Khoa Quản trị kinh doanh',
        lecturers: {
          academic_rank: 'TS',
          users: { full_name: 'TS. Đinh Quang Huy', email: 'huydq@ptit.edu.vn' },
        },
      },
    ],
    publications: {
      paper_title: 'Smart Contracts for Agritech Supply Chain Traceability in Vietnam',
      paper_venue: 'Kỷ yếu Hội nghị Quốc gia Khoa học Kinh tế số 2026',
      paper_type: 'National Conference',
    },
  },
  {
    project_id: 'SV-2026-CNTT1-008',
    title_vi: 'Thiết kế ăng-ten mảng Microstrip đa băng tần băng thông siêu rộng cho trạm gốc 5G/6G Massive MIMO',
    title_en: 'Multi-band Ultra-wideband Microstrip Antenna Array for 5G/6G Massive MIMO',
    keywords: '5G, 6G, Massive MIMO, Microstrip Antenna, CST Studio',
    status: 'PROPOSED',
    registered_at: '2026-09-15T00:00:00.000Z',
    departments: { dept_name: 'Khoa Điện tử viễn thông 1' },
    project_members: [
      { member_role: 'LEADER', contribution_pct: 50, assigned_task: 'Chủ nhiệm, mô phỏng cấu trúc ăng-ten', students: { student_id: 'B23DCVT001', class_name: 'D23CQVT01-B', users: { full_name: 'Trịnh Văn Toàn' } } },
      { member_role: 'MEMBER', contribution_pct: 50, assigned_task: 'Đo kiểm thông số bức xạ và suy hao', students: { student_id: 'B23DCVT002', class_name: 'D23CQVT01-B', users: { full_name: 'Nguyễn Bá Thắng' } } },
    ],
    project_advisors: [
      {
        lecturer_id: 'GV005',
        department: 'Khoa Điện tử viễn thông 1',
        lecturers: {
          academic_rank: 'PGS.TS',
          users: { full_name: 'PGS.TS. Hoàng Minh', email: 'minhh@ptit.edu.vn' },
        },
      },
    ],
  },
  {
    project_id: 'SV-2026-CNTT1-009',
    title_vi: 'Hệ thống phân tích cảm xúc và phát hiện tin giả trên mạng xã hội bằng kỹ thuật NLP tiếng Việt',
    title_en: 'Vietnamese Fake News Detection via Deep Contextual Sentiment Analysis',
    keywords: 'Fake News, Sentiment Analysis, PhoBERT, NLP, Social Network',
    status: 'FACULTY_APPROVED',
    registered_at: '2026-09-08T00:00:00.000Z',
    departments: { dept_name: 'Khoa An toàn thông tin' },
    project_members: [
      { member_role: 'LEADER', contribution_pct: 40, assigned_task: 'Chủ nhiệm, huấn luyện mô hình PhoBERT', students: { student_id: 'B23DCAT030', class_name: 'D23CQAT02-B', users: { full_name: 'Nguyễn Hải Đăng' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Thu thập tập dữ liệu tin tức mạng xã hội', students: { student_id: 'B23DCAT031', class_name: 'D23CQAT02-B', users: { full_name: 'Trần Gia Huy' } } },
      { member_role: 'MEMBER', contribution_pct: 30, assigned_task: 'Đánh giá độ chính xác F1-score', students: { student_id: 'B23DCAT032', class_name: 'D23CQAT02-B', users: { full_name: 'Phạm Lan Anh' } } },
    ],
    project_advisors: [
      {
        lecturer_id: 'GV004',
        department: 'Khoa An toàn thông tin',
        lecturers: {
          academic_rank: 'TS',
          users: { full_name: 'TS. Nguyễn Văn Tuấn', email: 'tuannv@ptit.edu.vn' },
        },
      },
    ],
    publications: {
      paper_title: 'Vietnamese Fake News Detection via Deep Contextual Sentiment Analysis',
      paper_venue: 'Hội thảo Quốc tế RIVF 2026',
      paper_type: 'International Conference',
    },
  },
  {
    project_id: 'SV-2026-CNTT1-010',
    title_vi: 'Đánh giá tác động của thương mại điện tử qua video ngắn (TikTok Shop) đến hành vi mua bốc đồng của Gen Z',
    title_en: 'Impact of Short-Form Video E-Commerce on Impulse Buying among Gen Z',
    keywords: 'TikTok Shop, Impulse Buying, Gen Z, Social Commerce',
    status: 'REJECTED',
    registered_at: '2026-09-05T00:00:00.000Z',
    departments: { dept_name: 'Khoa Quản trị kinh doanh' },
    project_members: [
      { member_role: 'LEADER', contribution_pct: 50, assigned_task: 'Chủ nhiệm, khảo sát phiếu hỏi Gen Z', students: { student_id: 'B23DCQT050', class_name: 'D23CQQT03-B', users: { full_name: 'Lương Thu Thảo' } } },
      { member_role: 'MEMBER', contribution_pct: 50, assigned_task: 'Xử lý dữ liệu định lượng', students: { student_id: 'B23DCQT051', class_name: 'D23CQQT03-B', users: { full_name: 'Đoàn Thanh Hằng' } } },
    ],
    project_advisors: [
      {
        lecturer_id: 'GV003',
        department: 'Khoa Quản trị kinh doanh',
        lecturers: {
          academic_rank: 'TS',
          users: { full_name: 'TS. Đinh Quang Huy', email: 'huydq@ptit.edu.vn' },
        },
      },
    ],
  },
];

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const tabParam = searchParams.get('tab');

  const [loading, setLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'pending' | 'ongoing' | 'completed'>(
    tabParam === 'my' ? 'my' : 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState<number>(3); // 3: Đề tài/Nhiệm vụ KHCN
  const [selectedDept, setSelectedDept] = useState<any>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [membersModalVisible, setMembersModalVisible] = useState<boolean>(false);
  const [currentMembers, setCurrentMembers] = useState<any[]>([]);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<any>(null);

  useEffect(() => {
    if (tabParam === 'my') {
      setActiveTab('my');
    } else if (tabParam === 'all') {
      setActiveTab('all');
    }
  }, [tabParam]);

  // Quyền hạn thẩm định & phê duyệt theo QĐ 521 (Phòng QLKHCN & Lãnh đạo Khoa)
  const roleCode = user?.roleCode || 'STUDENT';
  const isQLKH = roleCode === 'QLKHCN' || roleCode === 'ADMIN' || roleCode === 'BOARD';
  const isFacultyLeader = roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY';
  const canApprove = isQLKH || isFacultyLeader;

  // State thẩm định & phê duyệt
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [approveModalVisible, setApproveModalVisible] = useState<boolean>(false);
  const [rejectModalVisible, setRejectModalVisible] = useState<boolean>(false);
  const [selectedProjectForAction, setSelectedProjectForAction] = useState<any>(null);
  const [decisionNo, setDecisionNo] = useState<string>('146/QĐ-HV');
  const [approvalNote, setApprovalNote] = useState<string>('Đề tài đủ điều kiện chuyên môn và tính khả thi theo QĐ 521, nhất trí phê duyệt giao đề tài.');
  const [approvedBudget, setApprovedBudget] = useState<number>(5000000);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects', {
        params: {
          keyword: keyword || undefined,
          deptId: selectedDept || undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        },
      });
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể tải danh sách đề tài từ máy chủ');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .get('/users/departments')
      .then((res) => {
        if (Array.isArray(res.data)) setDepartments(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [selectedDept, selectedStatus]);

  // Xử lý Phê duyệt đề tài phân cấp: Khoa sơ tuyển (FACULTY_APPROVED) vs QLKHCN/BGĐ ban hành QĐ (ONGOING)
  const handleApproveProject = async () => {
    if (!selectedProjectForAction) return;
    const isFacultyScreening =
      (roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') &&
      selectedProjectForAction.status === 'PROPOSED';
    const nextStatus = isFacultyScreening ? 'FACULTY_APPROVED' : 'ONGOING';

    try {
      setSubmittingAction(true);
      await api.patch(`/projects/${selectedProjectForAction.project_id}/status`, {
        status: nextStatus,
        reason: approvalNote,
        decisionNo: isFacultyScreening ? undefined : decisionNo,
        approvedBudget: isFacultyScreening ? undefined : approvedBudget,
      });

      message.success(
        isFacultyScreening
          ? `Khoa đã sơ tuyển đề tài ${selectedProjectForAction.project_id} (Mẫu 1) và chuyển P.QLKHCN!`
          : `Phòng QLKHCN đã phê duyệt giao đề tài ${selectedProjectForAction.project_id} (QĐ: ${decisionNo})!`,
      );
      setApproveModalVisible(false);
      setSelectedProjectForAction(null);
      await fetchProjects();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Lỗi khi phê duyệt đề tài');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Xử lý Từ chối / Yêu cầu chỉnh sửa
  const handleRejectProject = async () => {
    if (!selectedProjectForAction) return;
    try {
      setSubmittingAction(true);
      await api.patch(`/projects/${selectedProjectForAction.project_id}/status`, {
        status: 'REJECTED',
        reason: rejectReason,
      });

      message.warning(`Đã chuyển đề tài ${selectedProjectForAction.project_id} sang trạng thái Từ chối / Hủy.`);
      setRejectModalVisible(false);
      setSelectedProjectForAction(null);
      await fetchProjects();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Lỗi khi từ chối đề tài');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Phê duyệt hàng loạt bởi Phòng QLKHCN
  const handleBatchApprove = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      setSubmittingAction(true);
      const nextStatus = roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY' ? 'FACULTY_APPROVED' : 'ONGOING';
      for (const key of selectedRowKeys) {
        await api.patch(`/projects/${key}/status`, {
          status: nextStatus,
          reason: 'Thẩm định & phê duyệt danh mục hàng loạt theo QĐ 521',
        });
      }

      message.success(`Đã thẩm định & phê duyệt thành công ${selectedRowKeys.length} đề tài NCKH được chọn!`);
      setSelectedRowKeys([]);
      await fetchProjects();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Lỗi khi phê duyệt hàng loạt');
    } finally {
      setSubmittingAction(false);
    }
  };

  const PROJECT_STATUS_MAP: Record<string, { bg: string; label: string }> = {
    PROPOSED: { bg: '#1890FF', label: 'Chờ thẩm định' },
    FACULTY_APPROVED: { bg: '#722ED1', label: 'Khoa đã duyệt' },
    APPROVED: { bg: '#52C41A', label: 'Đã phê duyệt' },
    ONGOING: { bg: '#52C41A', label: 'Đã phê duyệt' },
    OUTLINE_SUBMITTED: { bg: '#FA8C16', label: 'Đã nộp đề cương' },
    SUBMITTED: { bg: '#FA8C16', label: 'Chờ nghiệm thu' },
    ACCEPTED: { bg: '#52C41A', label: 'Đã nghiệm thu' },
    COMPLETED: { bg: '#52C41A', label: 'Đã nghiệm thu' },
    REJECTED: { bg: '#F5222D', label: 'Từ chối / Không đạt' },
    CANCELLED: { bg: '#F5222D', label: 'Đã hủy theo QĐ' },
  };

  const handleExport = () => {
    if (displayedProjects.length === 0) {
      message.warning('Không có dữ liệu đề tài để xuất.');
      return;
    }
    const headers = ['Mã đề tài', 'Tên đề tài', 'Đơn vị', 'Lĩnh vực', 'Trạng thái', 'Ngày đăng ký', 'Kinh phí duyệt'];
    const rows = displayedProjects.map((p: any) => [
      p.project_id,
      `"${String(p.title_vi || '').replace(/"/g, '""')}"`,
      `"${String(p.departments?.dept_name || '').replace(/"/g, '""')}"`,
      `"${String(p.research_field || '').replace(/"/g, '""')}"`,
      (PROJECT_STATUS_MAP[p.status]?.label || p.status),
      p.registered_at ? new Date(p.registered_at).toLocaleDateString('vi-VN') : '',
      p.budgets?.approved_amount ?? p.budgets?.requested_amount ?? 0,
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `srms_ptit_projects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success(`Đã xuất ${displayedProjects.length} đề tài NCKH ra tệp CSV!`);
  };

  // LOGIC ĐỒNG BỘ MỐI QUAN HỆ & PHÂN QUYỀN VAI TRÒ CHUẨN XÁC CHO MỌI ROLE
  const userFullName = (user?.fullName || '').toLowerCase();
  const userStudentId = (user as any)?.studentId || '';
  const userLecturerId = (user as any)?.lecturerId || '';
  const userEmail = (user?.email || '').toLowerCase();

  const getUserProjectRelation = (p: any) => {
    // 1. Kiểm tra Giảng viên hướng dẫn (LECTURER)
    if (roleCode === 'LECTURER') {
      const isAdvisor = p.project_advisors?.some((a: any) => {
        const advName = (a.lecturers?.users?.full_name || a.full_name || '').toLowerCase();
        const advId = a.lecturer_id || a.lecturers?.lecturer_id || '';
        return (
          (userLecturerId && advId && userLecturerId === advId) ||
          (userFullName && advName && (advName.includes(userFullName) || userFullName.includes(advName)))
        );
      });

      if (isAdvisor) {
        return {
          isAdvisor: true,
          isLeader: false,
          isMember: false,
          isFaculty: false,
          isUniversityAdmin: false,
          tag: (
            <Tag color="orange" style={{ fontSize: 10, marginTop: 3, padding: '0 6px', lineHeight: '18px', fontWeight: 600 }}>
              Tôi là Giảng viên hướng dẫn
            </Tag>
          ),
          relationText: 'Giảng viên hướng dẫn',
        };
      }
    }

    // 2. Kiểm tra Sinh viên (STUDENT)
    if (roleCode === 'STUDENT') {
      // Chủ nhiệm đề tài (LEADER)
      const leader = p.project_members?.find((m: any) => m.member_role === 'LEADER' || m.member_role === 'LEAD');
      const leaderName = (leader?.students?.users?.full_name || leader?.full_name || '').toLowerCase();
      const leaderCode = leader?.students?.student_id || leader?.student_id || '';
      const leaderEmail = (leader?.students?.users?.email || leader?.email || '').toLowerCase();

      const isLeader = Boolean(
        (userFullName && leaderName && (leaderName.includes(userFullName) || userFullName.includes(leaderName))) ||
        (userStudentId && leaderCode && leaderCode === userStudentId) ||
        (userEmail && leaderEmail && leaderEmail === userEmail)
      );

      if (isLeader) {
        return {
          isAdvisor: false,
          isLeader: true,
          isMember: false,
          isFaculty: false,
          isUniversityAdmin: false,
          tag: (
            <Tag color="red" style={{ fontSize: 10, marginTop: 3, padding: '0 6px', lineHeight: '18px', fontWeight: 600 }}>
              Tôi là Chủ nhiệm đề tài
            </Tag>
          ),
          relationText: 'Chủ nhiệm đề tài',
        };
      }

      // Thành viên phối hợp (MEMBER)
      const isMember = p.project_members?.some((m: any) => {
        if (m.member_role === 'LEADER' || m.member_role === 'LEAD') return false;
        const mName = (m.students?.users?.full_name || m.full_name || '').toLowerCase();
        const mCode = m.students?.student_id || m.student_id || '';
        const mEmail = (m.students?.users?.email || m.email || '').toLowerCase();
        return (
          (userFullName && mName && (mName.includes(userFullName) || userFullName.includes(mName))) ||
          (userStudentId && mCode && mCode === userStudentId) ||
          (userEmail && mEmail && mEmail === userEmail)
        );
      });

      if (isMember) {
        return {
          isAdvisor: false,
          isLeader: false,
          isMember: true,
          isFaculty: false,
          isUniversityAdmin: false,
          tag: (
            <Tag color="blue" style={{ fontSize: 10, marginTop: 3, padding: '0 6px', lineHeight: '18px', fontWeight: 600 }}>
              Tôi là Thành viên nhóm
            </Tag>
          ),
          relationText: 'Thành viên nhóm',
        };
      }
    }

    // 3. Ban Chủ nhiệm Khoa & Thư ký Khoa
    if (roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') {
      const userDeptId = (user as any)?.deptId;
      const matchesDept = userDeptId
        ? Number(p.dept_id) === Number(userDeptId)
        : p.dept_id === 1 || p.project_id?.includes('CNTT1');
      if (matchesDept) {
        const deptLabel = p.departments?.dept_name || 'Khoa chuyên môn';
        return {
          isAdvisor: false,
          isLeader: false,
          isMember: false,
          isFaculty: true,
          isUniversityAdmin: false,
          tag: (
            <Tag color="purple" style={{ fontSize: 10, marginTop: 3, padding: '0 6px', lineHeight: '18px', fontWeight: 500 }}>
              {deptLabel} quản lý
            </Tag>
          ),
          relationText: `${deptLabel} quản lý`,
        };
      }
    }

    // 4. Các đơn vị cấp Học viện
    if (['QLKHCN', 'BOARD', 'FINANCE', 'STUDENT_AFFAIRS', 'ADMIN'].includes(roleCode)) {
      const roleLabel =
        roleCode === 'QLKHCN' ? 'P.QLKHCN thẩm định' :
        roleCode === 'FINANCE' ? 'P.TCKT quyết toán' :
        roleCode === 'STUDENT_AFFAIRS' ? 'P.CTSV xét ĐRL' :
        roleCode === 'BOARD' ? 'Ban Giám đốc phê duyệt' : 'Quản trị hệ thống';

      return {
        isAdvisor: false,
        isLeader: false,
        isMember: false,
        isFaculty: false,
        isUniversityAdmin: true,
        tag: (
          <Tag color="cyan" style={{ fontSize: 10, marginTop: 3, padding: '0 6px', lineHeight: '18px', fontWeight: 500 }}>
            {roleLabel}
          </Tag>
        ),
        relationText: roleLabel,
      };
    }

    return {
      isAdvisor: false,
      isLeader: false,
      isMember: false,
      isFaculty: false,
      isUniversityAdmin: false,
      tag: null,
      relationText: '',
    };
  };

  const isUserProject = (p: any) => {
    const rel = getUserProjectRelation(p);
    if (roleCode === 'LECTURER') return rel.isAdvisor;
    if (roleCode === 'STUDENT') return rel.isLeader || rel.isMember;
    if (roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') return rel.isFaculty;
    if (['QLKHCN', 'BOARD', 'FINANCE', 'STUDENT_AFFAIRS', 'ADMIN'].includes(roleCode)) return true;
    return rel.isLeader || rel.isMember || rel.isAdvisor;
  };

  const isOngoingStatus = (s: string) =>
    s === 'ONGOING' || s === 'APPROVED' || s === 'OUTLINE_SUBMITTED' || s === 'SUBMITTED';

  const myProjects = projects.filter(isUserProject);
  const pendingProjects = projects.filter((p) => p.status === 'PROPOSED' || p.status === 'FACULTY_APPROVED');
  const ongoingProjects = projects.filter((p) => isOngoingStatus(p.status));
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED' || p.status === 'ACCEPTED');

  const displayedProjects = projects.filter((p) => {
    if (selectedCategory === 1) {
      const hasSeminarDoc = p.documents?.some((d: any) => d.docType === 'SEMINAR' || d.docType === 'MINUTES') || isOngoingStatus(p.status) || p.status === 'ACCEPTED';
      if (!hasSeminarDoc) return false;
    } else if (selectedCategory === 2) {
      const hasPaperDoc = p.documents?.some((d: any) => d.docType === 'PAPER' || d.docType === 'PUBLICATION');
      if (!hasPaperDoc) return false;
    }

    if (dateRange && dateRange[0] && dateRange[1] && p.registered_at) {
      const reg = new Date(p.registered_at).getTime();
      const start = dateRange[0].startOf('day').valueOf();
      const end = dateRange[1].endOf('day').valueOf();
      if (reg < start || reg > end) return false;
    }

    if (activeTab === 'my') return isUserProject(p);
    if (activeTab === 'pending') return p.status === 'PROPOSED' || p.status === 'FACULTY_APPROVED';
    if (activeTab === 'ongoing') return isOngoingStatus(p.status);
    if (activeTab === 'completed') return p.status === 'COMPLETED' || p.status === 'ACCEPTED';
    return true; // 'all'
  });

  const getStatusPill = (status: string) => {
    const s = PROJECT_STATUS_MAP[status] || { bg: '#52C41A', label: 'Đã phê duyệt' };
    return (
      <span
        style={{
          display: 'inline-block',
          backgroundColor: s.bg,
          color: '#FFFFFF',
          borderRadius: 14,
          padding: '2px 14px',
          fontSize: 12,
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {s.label}
      </span>
    );
  };

  const columns = [
    {
      title: 'TT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Người khai báo <SearchOutlined style={{ fontSize: 11, color: '#bfbfbf' }} />
        </span>
      ),
      dataIndex: 'author',
      key: 'author',
      width: 165,
      render: (_: any, record: any) => {
        const leader = record.project_members?.find((m: any) => m.member_role === 'LEADER' || m.member_role === 'LEAD');
        const leaderName = leader?.students?.users?.full_name || leader?.full_name || 'NGUYỄN VĂN AN';
        const rel = getUserProjectRelation(record);

        return (
          <div>
            <div style={{ fontWeight: 600, color: '#262626', fontSize: 13, textTransform: 'uppercase' }}>
              {leaderName}
            </div>
            {rel.tag}
          </div>
        );
      },
    },
    {
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Thành viên <SearchOutlined style={{ fontSize: 11, color: '#bfbfbf' }} />
        </span>
      ),
      dataIndex: 'members',
      key: 'members',
      width: 100,
      render: (_: any, record: any) => {
        const count = record.project_members?.length || 1;
        return (
          <span
            style={{ color: '#C62828', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
            onClick={() => {
              setCurrentMembers(record.project_members || []);
              setSelectedProjectForModal(record);
              setMembersModalVisible(true);
            }}
          >
            {count} thành viên
          </span>
        );
      },
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'registered_at',
      key: 'registered_at',
      width: 105,
      render: (val: string) => (val ? new Date(val).toLocaleDateString('vi-VN') : '10/09/2026'),
    },
    {
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Tên đề tài NCKH <SearchOutlined style={{ fontSize: 11, color: '#bfbfbf' }} />
        </span>
      ),
      dataIndex: 'title_vi',
      key: 'title_vi',
      width: 260,
      render: (val: string, record: any) => {
        const paperDoc = record.documents?.find((d: any) => d.docType === 'PAPER');
        return (
          <div>
            <div
              style={{ fontWeight: 500, color: '#262626', cursor: 'pointer', lineHeight: 1.4 }}
              onClick={() => navigate(`/projects/${record.project_id}`)}
            >
              {val}
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 3 }}>
              Mã đề tài: <b>{record.project_id}</b> • Đơn vị: {record.departments?.dept_name || 'Khoa/Viện PTIT'}
            </div>
            {(record.publications || paperDoc) && (
              <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Tag color="geekblue" style={{ fontSize: 11, padding: '0 6px', margin: 0, fontWeight: 600 }}>
                  <BookOutlined /> {record.publications?.paper_venue || `Bài báo khoa học (${paperDoc?.libraryCode || 'GWDU'})`}
                </Tag>
                {record.publications?.paper_title && (
                  <span style={{ fontSize: 11, color: '#595959', fontStyle: 'italic' }}>
                    "{record.publications.paper_title}"
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Lĩnh vực',
      dataIndex: 'research_field',
      key: 'research_field',
      width: 135,
      render: (_: any, record: any) => (
        <span style={{ fontSize: 12, color: '#595959', lineHeight: 1.3 }}>
          {record.research_field || record.keywords || 'Công nghệ thông tin'}
        </span>
      ),
    },
    {
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Trạng thái <FilterOutlined style={{ fontSize: 11, color: '#bfbfbf' }} />
        </span>
      ),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center' as const,
      render: (status: string) => getStatusPill(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: canApprove ? 225 : 75,
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space size={[4, 4]} wrap style={{ justifyContent: 'center' }}>
          <Tooltip title="Xem chi tiết hồ sơ đề tài">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/projects/${record.project_id}`)}
            />
          </Tooltip>

          {((isFacultyLeader && record.status === 'PROPOSED') ||
            (isQLKH && (record.status === 'FACULTY_APPROVED' || (roleCode === 'ADMIN' && record.status === 'PROPOSED')))) && (
            <>
              <Tooltip
                title={
                  isFacultyLeader && record.status === 'PROPOSED'
                    ? 'Khoa Sơ tuyển & Gửi Hồ sơ Mẫu 1 lên P.QLKHCN'
                    : 'Phòng QLKHCN / BGĐ Thẩm định & Giao đề tài (QĐ)'
                }
              >
                <Button
                  size="small"
                  type="primary"
                  style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontSize: 11, padding: '0 8px' }}
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setSelectedProjectForAction(record);
                    setApprovedBudget(record.budgets?.requested_amount || 5000000);
                    setApproveModalVisible(true);
                  }}
                >
                  {isFacultyLeader && record.status === 'PROPOSED' ? 'Khoa duyệt' : 'Giao QĐ'}
                </Button>
              </Tooltip>
              <Tooltip title="Yêu cầu sửa / Từ chối">
                <Button
                  size="small"
                  danger
                  style={{ fontSize: 11, padding: '0 8px' }}
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setSelectedProjectForAction(record);
                    setRejectModalVisible(true);
                  }}
                >
                  Từ chối
                </Button>
              </Tooltip>
            </>
          )}

          {canApprove && (record.status === 'ONGOING' || record.status === 'APPROVED') && (
            <Tooltip title="Đề tài đã có Quyết định giao nhiệm vụ NCKH theo QĐ 521">
              <Tag color="success" style={{ margin: 0, fontSize: 11, padding: '2px 6px', cursor: 'default', whiteSpace: 'nowrap' }}>
                <CheckCircleOutlined /> Đã ban hành QĐ
              </Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* TIÊU ĐỀ SẢN PHẨM CHUẨN S-LINK */}
      <div style={{ marginBottom: 14 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626', fontSize: 18 }}>
          Sản phẩm
        </Title>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* DANH MỤC TRÁI (3 MỤC KHÔNG DÙNG CARD KHỐI NẶNG NỀ) */}
        <div style={{ flex: '0 0 200px', minWidth: 190 }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 6,
              border: '1px solid #EDEDEE',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: 13,
                color: selectedCategory === 1 ? '#C62828' : '#262626',
                fontWeight: selectedCategory === 1 ? 600 : 400,
                borderBottom: '1px solid #f0f0f0',
              }}
              onClick={() => setSelectedCategory(1)}
            >
              1. Hội thảo khoa học
            </div>
            <div
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: 13,
                color: selectedCategory === 2 ? '#C62828' : '#262626',
                fontWeight: selectedCategory === 2 ? 600 : 400,
                borderBottom: '1px solid #f0f0f0',
              }}
              onClick={() => setSelectedCategory(2)}
            >
              2. Tạp chí khoa học
            </div>
            <div
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: 13,
                color: selectedCategory === 3 ? '#C62828' : '#262626',
                fontWeight: selectedCategory === 3 ? 600 : 400,
                backgroundColor: selectedCategory === 3 ? '#FFF9F9' : '#FFFFFF',
              }}
              onClick={() => setSelectedCategory(3)}
            >
              3. Đề tài/Nhiệm vụ KHCN
            </div>
          </div>

          {(roleCode === 'STUDENT' || roleCode === 'ADMIN') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              block
              style={{
                marginTop: 14,
                height: 38,
                backgroundColor: '#C62828',
                borderColor: '#C62828',
                fontWeight: 600,
                borderRadius: 4,
              }}
              onClick={() => navigate('/projects/new')}
            >
              Đăng ký đề tài mới
            </Button>
          )}
        </div>

        {/* KHU VỰC BẢNG DỮ LIỆU & BỘ LỌC CHUẨN S-LINK */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EDEDEE',
              borderRadius: 6,
              padding: '14px 16px',
            }}
          >
            {/* HỆ THỐNG TABS PHÂN HỆ ĐỀ TÀI CHUẨN S-LINK */}
            <Tabs
              activeKey={activeTab}
              onChange={(key) => {
                setActiveTab(key as any);
                setSearchParams(key === 'all' ? {} : { tab: key });
              }}
              type="card"
              style={{ marginBottom: 14 }}
              items={[
                {
                  key: 'all',
                  label: (
                    <span style={{ fontWeight: 600 }}>
                      <UnorderedListOutlined /> Toàn bộ đề tài đã đăng ký ({projects.length})
                    </span>
                  ),
                },
                {
                  key: 'my',
                  label: (
                    <span style={{ fontWeight: 600, color: activeTab === 'my' ? '#C62828' : undefined }}>
                      {roleCode === 'LECTURER' ? (
                        <>
                          <AuditOutlined /> Đề tài hướng dẫn ({myProjects.length})
                        </>
                      ) : roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY' ? (
                        <>
                          <ApartmentOutlined /> Đề tài thuộc Khoa ({myProjects.length})
                        </>
                      ) : roleCode === 'QLKHCN' ? (
                        <>
                          <AuditOutlined /> Đề tài thẩm định ({myProjects.length})
                        </>
                      ) : (
                        <>
                          <UserOutlined /> Đề tài của tôi ({myProjects.length})
                        </>
                      )}
                    </span>
                  ),
                },
                {
                  key: 'pending',
                  label: (
                    <span style={{ fontWeight: 500 }}>
                      <ClockCircleOutlined /> Chờ thẩm định & Phê duyệt ({pendingProjects.length})
                    </span>
                  ),
                },
                {
                  key: 'ongoing',
                  label: (
                    <span style={{ fontWeight: 500 }}>
                      <RocketOutlined /> Đang triển khai ({ongoingProjects.length})
                    </span>
                  ),
                },
                {
                  key: 'completed',
                  label: (
                    <span style={{ fontWeight: 500 }}>
                      <TrophyOutlined /> Đã nghiệm thu ({completedProjects.length})
                    </span>
                  ),
                },
              ]}
            />

            {/* THANH THAO TÁC HÀNG LOẠT DÀNH CHO PHÒNG QLKHCN / KHOA */}
            {canApprove && selectedRowKeys.length > 0 && (
              <div
                style={{
                  backgroundColor: '#E6F7FF',
                  border: '1px solid #91D5FF',
                  padding: '10px 16px',
                  borderRadius: 6,
                  marginBottom: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 13, color: '#0050B3' }}>
                  Đã chọn <b>{selectedRowKeys.length}</b> đề tài NCKH cần thẩm định / phê duyệt
                </span>
                <Space>
                  <Button
                    type="primary"
                    style={{ backgroundColor: '#52C41A', borderColor: '#52C41A', fontWeight: 600 }}
                    icon={<CheckCircleOutlined />}
                    loading={submittingAction}
                    onClick={handleBatchApprove}
                  >
                    {isFacultyLeader ? `Khoa Sơ tuyển hàng loạt (${selectedRowKeys.length})` : `Phòng QLKHCN Phê duyệt hàng loạt (${selectedRowKeys.length})`}
                  </Button>
                  <Button onClick={() => setSelectedRowKeys([])}>Bỏ chọn</Button>
                </Space>
              </div>
            )}

            {/* HÀNG CÔNG CỤ 1: Dropdown phạm vi, Nút đỏ Xuất dữ liệu, Lọc đơn vị, Lọc trạng thái, Date Range */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Select
                value={selectedDept ? String(selectedDept) : 'ALL'}
                onChange={(val) => setSelectedDept(val === 'ALL' ? undefined : Number(val))}
                style={{ width: 185 }}
                options={[
                  { value: 'ALL', label: 'Dữ liệu toàn Học viện' },
                  ...(departments.length > 0
                    ? departments.map((d: any) => ({ value: String(d.deptId), label: d.deptName }))
                    : [
                        { value: '1', label: 'Khoa Công nghệ thông tin 1' },
                        { value: '2', label: 'Khoa An toàn thông tin' },
                        { value: '3', label: 'Khoa Kỹ thuật Điện tử 1' },
                        { value: '4', label: 'Khoa Đa phương tiện' },
                        { value: '5', label: 'Khoa Quản trị kinh doanh 1' },
                      ]),
                ]}
              />

              {/* NÚT ĐỎ NỔI BẬT: XUẤT DỮ LIỆU (ĐÚNG ẢNH S-LINK) */}
              <Button
                type="primary"
                icon={<ExportOutlined />}
                style={{
                  backgroundColor: '#C62828',
                  borderColor: '#C62828',
                  fontWeight: 600,
                  borderRadius: 4,
                  height: 32,
                }}
                onClick={handleExport}
              >
                Xuất dữ liệu
              </Button>

              <Select
                placeholder="Lọc theo đơn vị"
                allowClear
                value={selectedDept}
                onChange={(val) => setSelectedDept(val)}
                style={{ width: 185 }}
                options={
                  departments.length > 0
                    ? departments.map((d: any) => ({ value: d.deptId, label: d.deptName }))
                    : [
                        { value: 1, label: 'Khoa Công nghệ thông tin 1' },
                        { value: 2, label: 'Khoa An toàn thông tin' },
                        { value: 3, label: 'Khoa Kỹ thuật Điện tử 1' },
                        { value: 4, label: 'Khoa Đa phương tiện' },
                        { value: 5, label: 'Khoa Quản trị kinh doanh 1' },
                      ]
                }
              />

              {/* BỘ LỌC TRẠNG THÁI PHÊ DUYỆT (CHUYÊN BIỆT CHO QUY TRÌNH THẨM ĐỊNH) */}
              <Select
                placeholder="Trạng thái phê duyệt"
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                style={{ width: 215 }}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'PROPOSED', label: 'Chờ Khoa thẩm định' },
                  { value: 'FACULTY_APPROVED', label: 'Khoa đã duyệt (Chờ QĐ)' },
                  { value: 'ONGOING', label: 'Đã phê duyệt / Đang thực hiện' },
                  { value: 'OUTLINE_SUBMITTED', label: 'Đã nộp Đề cương' },
                  { value: 'SUBMITTED', label: 'Chờ nghiệm thu' },
                  { value: 'ACCEPTED', label: 'Đã nghiệm thu' },
                  { value: 'REJECTED', label: 'Từ chối / Yêu cầu sửa' },
                  { value: 'CANCELLED', label: 'Đã hủy theo QĐ' },
                ]}
              />

              <RangePicker
                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                value={dateRange as any}
                onChange={(vals) => setDateRange(vals as any)}
                style={{ width: 230 }}
              />

              <Tooltip title="Hướng dẫn sử dụng bộ lọc">
                <Button type="text" shape="circle" icon={<QuestionCircleOutlined style={{ color: '#8c8c8c' }} />} />
              </Tooltip>
            </div>

            {/* HÀNG CÔNG CỤ 2: Tìm kiếm, Bộ lọc, Tải lại, Tổng số, Cài đặt */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 14,
              }}
            >
              <Space size={8} wrap>
                <Input
                  placeholder="Tìm theo: Người khai báo, Tên bài viết, Mã..."
                  suffix={<SearchOutlined style={{ color: '#bfbfbf', cursor: 'pointer' }} onClick={fetchProjects} />}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={fetchProjects}
                  style={{ width: 280, borderRadius: 4 }}
                />
                <Button icon={<FilterOutlined />} onClick={fetchProjects}>
                  Bộ lọc
                </Button>
                <Button icon={<ReloadOutlined />} onClick={fetchProjects}>
                  Tải lại
                </Button>
              </Space>

              <Space size={14}>
                <div style={{ fontSize: 13, color: '#595959' }}>
                  Tổng số: <b style={{ color: '#C62828', fontSize: 14 }}>{displayedProjects.length}</b> đề tài
                </div>
                <Button type="text" icon={<SettingOutlined style={{ fontSize: 16, color: '#8c8c8c' }} />} />
              </Space>
            </div>

            {/* BẢNG PROTABLE S-LINK CÓ CHỨC NĂNG CHỌN HÀNG DÀNH CHO PHÒNG QLKHCN */}
            <Table
              className="slink-table"
              columns={columns}
              dataSource={displayedProjects}
              rowKey="project_id"
              rowSelection={
                canApprove
                  ? {
                      selectedRowKeys,
                      onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
                      getCheckboxProps: (record: any) => ({
                        disabled: isFacultyLeader
                          ? record.status !== 'PROPOSED'
                          : roleCode === 'ADMIN'
                            ? !['PROPOSED', 'FACULTY_APPROVED'].includes(record.status)
                            : record.status !== 'FACULTY_APPROVED',
                      }),
                    }
                  : undefined
              }
              loading={{ spinning: loading, indicator: <PtitSpinner tip="Đang tải danh sách đề tài..." size="small" minHeight={120} /> }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (t) => `Hiển thị 1-${displayedProjects.length} trong tổng số ${t} kết quả`,
              }}
              scroll={{ x: canApprove ? 1080 : 940 }}
              size="middle"
              bordered
            />
          </div>
        </div>
      </div>

      {/* POPUP XEM DANH SÁCH THÀNH VIÊN & GIẢNG VIÊN HƯỚNG DẪN */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TeamOutlined style={{ color: '#C62828', fontSize: 18 }} />
            <span style={{ color: '#C62828', fontWeight: 700, fontSize: 16 }}>
              Danh sách nhóm nghiên cứu & Giảng viên hướng dẫn
            </span>
          </div>
        }
        open={membersModalVisible}
        onCancel={() => setMembersModalVisible(false)}
        footer={[
          <Button key="close" type="primary" style={{ backgroundColor: '#C62828' }} onClick={() => setMembersModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedProjectForModal && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ padding: '10px 12px', backgroundColor: '#FAFAFA', borderRadius: 6, border: '1px solid #F0F0F0', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                Mã đề tài: <b style={{ color: '#C62828' }}>{selectedProjectForModal.project_id}</b> • Đơn vị: <b>{selectedProjectForModal.departments?.dept_name || 'Khoa Công nghệ thông tin 1'}</b>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#262626', marginTop: 4, lineHeight: 1.4 }}>
                {selectedProjectForModal.title_vi}
              </div>
            </div>

            {/* KHỐI GIẢNG VIÊN HƯỚNG DẪN KHOA HỌC (GVHD) */}
            <div
              style={{
                backgroundColor: '#FFF7E6',
                border: '1px solid #FFD591',
                borderRadius: 6,
                padding: '12px 14px',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: '#D46B08', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <AuditOutlined /> Giảng viên hướng dẫn khoa học (GVHD)
                </span>
                {roleCode === 'LECTURER' && (
                  <Tag color="orange" style={{ fontWeight: 600, margin: 0 }}>
                    Bạn là GVHD của đề tài này
                  </Tag>
                )}
              </div>

              {selectedProjectForModal.project_advisors && selectedProjectForModal.project_advisors.length > 0 ? (
                selectedProjectForModal.project_advisors.map((adv: any, idx: number) => {
                  const advName = adv.lecturers?.users?.full_name || adv.full_name || 'TS. Ngô Quốc Dũng';
                  const advEmail = adv.lecturers?.users?.email || adv.email || 'dungnq@ptit.edu.vn';
                  const advDept = adv.department || selectedProjectForModal.departments?.dept_name || 'Khoa Công nghệ thông tin 1';
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar size={42} style={{ backgroundColor: '#FA8C16', fontWeight: 700, fontSize: 14 }}>
                        {advName.split(' ').pop()?.charAt(0) || 'G'}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#262626', fontSize: 14 }}>
                          {advName}
                        </div>
                        <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>
                          Bộ môn Công nghệ phần mềm • {advDept}
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 1 }}>
                          Email: <b>{advEmail}</b> • Thẩm quyền: Hướng dẫn chuyên môn, duyệt đề cương & xác nhận tiến độ
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar size={42} style={{ backgroundColor: '#FA8C16', fontWeight: 700, fontSize: 14 }}>
                    D
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#262626', fontSize: 14 }}>
                      TS. Ngô Quốc Dũng
                    </div>
                    <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>
                      Bộ môn Công nghệ phần mềm • Khoa Công nghệ thông tin 1
                    </div>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 1 }}>
                      Email: <b>dungnq@ptit.edu.vn</b> • Thẩm quyền: Hướng dẫn chuyên môn & duyệt đề cương
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TIÊU ĐỀ NHÓM SINH VIÊN */}
            <div style={{ fontWeight: 700, color: '#262626', fontSize: 13, marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <TeamOutlined style={{ color: '#C62828' }} /> Nhóm sinh viên thực hiện ({currentMembers.length} sinh viên)
            </div>
          </div>
        )}

        <List
          itemLayout="horizontal"
          dataSource={currentMembers}
          renderItem={(item: any) => {
            const studentName = item.students?.users?.full_name || item.full_name || 'Sinh viên NCKH';
            const isMeLeader = roleCode === 'STUDENT' && item.member_role === 'LEADER' && userFullName && studentName.toLowerCase().includes(userFullName);
            const isMeMember = roleCode === 'STUDENT' && item.member_role !== 'LEADER' && userFullName && studentName.toLowerCase().includes(userFullName);

            return (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: item.member_role === 'LEADER' ? '#C62828' : '#1890FF' }}>
                      {studentName.charAt(0) || 'S'}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <span style={{ fontWeight: 600 }}>{studentName}</span>
                      <Tag color={item.member_role === 'LEADER' ? 'volcano' : 'blue'}>
                        {item.member_role === 'LEADER' ? 'Chủ nhiệm đề tài' : 'Thành viên'} ({item.contribution_pct}%)
                      </Tag>
                      {isMeLeader && <Tag color="red">Bạn</Tag>}
                      {isMeMember && <Tag color="blue">Bạn</Tag>}
                    </Space>
                  }
                  description={
                    <div style={{ fontSize: 12 }}>
                      MSSV: <b>{item.student_id || item.students?.student_id || 'B23DCCN001'}</b> • Lớp: <b>{item.students?.class_name || 'D23CQCN01-B'}</b>
                      <br />
                      Nhiệm vụ: {item.assigned_task || 'Tham gia nghiên cứu và thực nghiệm'}
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Modal>

      {/* MODAL 1: PHÒNG QLKHCN THẨM ĐỊNH & PHÊ DUYỆT ĐỀ TÀI (BAN HÀNH QUYẾT ĐỊNH GIAO ĐỀ TÀI) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileProtectOutlined style={{ color: '#52C41A', fontSize: 18 }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
              Phòng QLKHCN - Thẩm định & Phê duyệt Đề tài NCKH
            </span>
          </div>
        }
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        onOk={handleApproveProject}
        okText="Xác nhận Phê duyệt (P.QLKHCN)"
        confirmLoading={submittingAction}
        okButtonProps={{ style: { backgroundColor: '#52C41A', borderColor: '#52C41A', fontWeight: 600 } }}
        width={640}
      >
        {selectedProjectForAction && (
          <div style={{ marginTop: 12 }}>
            <div style={{ padding: 12, backgroundColor: '#F6FFED', border: '1px solid #B7EB8F', borderRadius: 6, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, color: '#262626', fontSize: 14 }}>
                {selectedProjectForAction.title_vi}
              </div>
              <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                Mã đề tài: <b>{selectedProjectForAction.project_id}</b> • Đơn vị chủ trì: <b>{selectedProjectForAction.departments?.dept_name || 'Khoa CNTT 1'}</b>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Căn cứ Quyết định giao đề tài của Giám đốc Học viện:</Text>
              <Input
                value={decisionNo}
                onChange={(e) => setDecisionNo(e.target.value)}
                placeholder="Ví dụ: 146/QĐ-HV hoặc QĐ-2026/HV-NCKH"
                style={{ marginTop: 6 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Kinh phí Học viện phê duyệt cấp cho đề tài (VNĐ):</Text>
              <Input
                type="number"
                value={approvedBudget}
                onChange={(e) => setApprovedBudget(Number(e.target.value))}
                style={{ marginTop: 6 }}
              />
            </div>

            <div>
              <Text strong>Ý kiến kết luận thẩm định chuyên môn của Phòng QLKHCN:</Text>
              <Input.TextArea
                rows={3}
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Nhập nhận xét thẩm định tính cấp thiết, mục tiêu và phương pháp..."
                style={{ marginTop: 6 }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: YÊU CẦU CHỈNH SỬA / TỪ CHỐI ĐỀ TÀI */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloseCircleOutlined style={{ color: '#F5222D', fontSize: 18 }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
              Yêu cầu chỉnh sửa / Từ chối đề tài NCKH
            </span>
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleRejectProject}
        okText="Xác nhận Từ chối / Yêu cầu sửa"
        okButtonProps={{ danger: true, style: { fontWeight: 600 } }}
        confirmLoading={submittingAction}
      >
        {selectedProjectForAction && (
          <div style={{ marginTop: 12 }}>
            <p style={{ marginBottom: 8 }}>
              Đề tài: <b>{selectedProjectForAction.title_vi}</b> ({selectedProjectForAction.project_id})
            </p>
            <Text strong>Lý do từ chối / Nội dung yêu cầu sinh viên & Khoa bổ sung chỉnh sửa:</Text>
            <Input.TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nêu rõ các nội dung cần hoàn thiện: trùng lặp hướng nghiên cứu, mục tiêu chưa đo lường được, phương pháp chưa phù hợp..."
              style={{ marginTop: 8 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
