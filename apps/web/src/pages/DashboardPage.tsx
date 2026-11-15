import React, { useEffect, useMemo, useState } from 'react';
import {
  Row,
  Col,
  Typography,
  Tag,
  Progress,
  Button,
  Space,
  Avatar,
  Calendar,
  List,
  Select,
  Tooltip,
  Empty,
} from 'antd';
import {
  FolderOpenOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  RightOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  FileTextOutlined,
  CommentOutlined,
  DollarCircleOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PtitSpinner } from '../components/common/PtitSpinner';

const { Title } = Typography;

interface DynamicTask {
  code: string;
  title: string;
  deadline: string;
  status: string;
  color: string;
  path: string;
}

const GRADE_LABEL_MAP: Record<string, string> = {
  XUAT_SAC: 'Xuất sắc',
  TOT: 'Tốt',
  KHA: 'Khá',
  DAT: 'Đạt',
  KHONG_DAT: 'Không đạt',
};

const PROJECT_STATUS_META: Record<string, { label: string; color: string; progress: number }> = {
  PROPOSED: { label: 'Chờ Khoa sơ tuyển', color: 'orange', progress: 15 },
  FACULTY_APPROVED: { label: 'Chờ Học viện duyệt', color: 'purple', progress: 30 },
  APPROVED: { label: 'Đã giao đề tài', color: 'cyan', progress: 45 },
  OUTLINE_SUBMITTED: { label: 'Đang duyệt Đề cương', color: 'geekblue', progress: 55 },
  ONGOING: { label: 'Đang thực hiện', color: 'blue', progress: 70 },
  SUBMITTED: { label: 'Chờ nghiệm thu', color: 'volcano', progress: 85 },
  ACCEPTED: { label: 'Đã nghiệm thu', color: 'green', progress: 100 },
  REJECTED: { label: 'Không đạt', color: 'red', progress: 100 },
};

const formatDateShort = (value?: string | null): string => {
  if (!value) return 'Chưa xác định';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Chưa xác định';
  return d.toLocaleDateString('vi-VN');
};

const formatDateTimeShort = (value?: string | null): string => {
  if (!value) return 'Theo kế hoạch Đợt NCKH';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Theo kế hoạch Đợt NCKH';
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${d.toLocaleDateString('vi-VN')}`;
};

const getInitials = (name?: string): string => {
  if (!name) return 'PT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[parts.length - 2][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';

  const [loading, setLoading] = useState<boolean>(true);
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');
  const [periods, setPeriods] = useState<any[]>([]);
  const [rawProjects, setRawProjects] = useState<any[]>([]);
  const [outlines, setOutlines] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({ seminars: [], reports: [], changeRequests: [], milestones: [], period: null });
  const [acceptances, setAcceptances] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [awards, setAwards] = useState<any>({ nominations: [], certificates: [], lecturerHours: [], studentBonuses: [] });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [pRes, oRes, prRes, aRes, bRes, awRes, nRes, sRes, pdRes] = await Promise.all([
          api.get('/projects').catch(() => ({ data: [] })),
          api.get('/outlines').catch(() => ({ data: [] })),
          api.get('/progress/overview').catch(() => ({ data: { seminars: [], reports: [], changeRequests: [], milestones: [], period: null } })),
          api.get('/acceptance').catch(() => ({ data: { acceptances: [] } })),
          api.get('/budgets').catch(() => ({ data: [] })),
          api.get('/awards').catch(() => ({ data: { nominations: [], certificates: [], lecturerHours: [], studentBonuses: [] } })),
          api.get('/notifications').catch(() => ({ data: [] })),
          api.get('/schedule', { params: { role: roleCode, scope: 'my_schedule' } }).catch(() => ({ data: [] })),
          api.get('/periods').catch(() => ({ data: [] })),
        ]);
        setRawProjects(Array.isArray(pRes.data) ? pRes.data : []);
        setOutlines(Array.isArray(oRes.data) ? oRes.data : []);
        setProgress(prRes.data || { seminars: [], reports: [], changeRequests: [], milestones: [], period: null });
        setAcceptances(aRes.data?.acceptances || []);
        setBudgets(Array.isArray(bRes.data) ? bRes.data : []);
        setAwards(awRes.data || { nominations: [], certificates: [], lecturerHours: [], studentBonuses: [] });
        setNotifications(Array.isArray(nRes.data) ? nRes.data : []);
        setEvents(Array.isArray(sRes.data) ? sRes.data : []);
        const periodList = Array.isArray(pdRes.data) ? pdRes.data : [];
        setPeriods(periodList);
        const activePeriod = periodList.find((p: any) => p.status === 'ACTIVE');
        if (activePeriod?.periodId) {
          setPeriodFilter(String(activePeriod.periodId));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.userId]);

  const projects = useMemo(() => {
    if (!periodFilter || periodFilter === 'ALL') return rawProjects;
    const pid = Number(periodFilter);
    return rawProjects.filter((p) => Number(p.period_id) === pid);
  }, [rawProjects, periodFilter]);

  // Tổng hợp chứng từ tài chính từ DB
  const allSettlements = useMemo(() => {
    const items: any[] = [];
    budgets.forEach((b) => {
      (b.settlements || []).forEach((s: any) => {
        const leader = b.project?.members?.find((m: any) => m.memberRole === 'LEAD' || m.memberRole === 'LEADER') || b.project?.members?.[0];
        items.push({
          ...s,
          projectId: b.projectId,
          projectTitle: b.project?.titleVi,
          leaderName: leader?.student?.user?.fullName || 'Chủ nhiệm đề tài',
          acceptanceGrade: b.project?.acceptance?.grade || null,
        });
      });
    });
    return items.sort((a, b) => {
      const aPending = !a.settledAt ? 0 : 1;
      const bPending = !b.settledAt ? 0 : 1;
      return aPending - bPending;
    });
  }, [budgets]);

  const budgetSummary = useMemo(() => {
    const totalApproved = budgets.reduce((sum, b) => sum + Number(b.approvedAmount || 0), 0);
    const totalSettled = allSettlements
      .filter((s) => Boolean(s.settledAt))
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const pendingCount = allSettlements.filter((s) => !s.settledAt).length;
    const pct = totalApproved > 0 ? Math.min(100, Math.round((totalSettled / totalApproved) * 100)) : 0;
    return { totalApproved, totalSettled, remaining: Math.max(0, totalApproved - totalSettled), pendingCount, pct };
  }, [budgets, allSettlements]);

  // Lọc đề tài theo vai trò Sinh viên hoặc Giảng viên hướng dẫn
  const studentProjects = useMemo(() => {
    const matched = projects.filter((p) =>
      p.project_members?.some(
        (m: any) =>
          (user?.studentId && m.student_id === user.studentId) ||
          (user?.fullName && m.students?.users?.full_name === user.fullName),
      ),
    );
    return matched;
  }, [projects, user?.studentId, user?.fullName]);

  const lecturerProjects = useMemo(() => {
    const matched = projects.filter((p) =>
      p.project_advisors?.some(
        (a: any) => user?.fullName && a.lecturers?.users?.full_name === user.fullName,
      ),
    );
    return matched;
  }, [projects, user?.fullName]);

  // Thống kê theo Khoa từ DB cho QLKHCN / ADMIN
  const deptStats = useMemo(() => {
    const map = new Map<string, { code: string; name: string; total: number; doneOrOngoing: number }>();
    projects.forEach((p) => {
      const code = p.departments?.dept_code || 'KHAC';
      const name = p.departments?.dept_name || 'Khoa chuyên môn';
      const cur = map.get(code) || { code, name, total: 0, doneOrOngoing: 0 };
      cur.total += 1;
      if (['APPROVED', 'OUTLINE_SUBMITTED', 'ONGOING', 'SUBMITTED', 'ACCEPTED'].includes(p.status)) {
        cur.doneOrOngoing += 1;
      }
      map.set(code, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 4);
  }, [projects]);

  // Xác định tên Khoa/Đơn vị từ dữ liệu đề tài nếu có deptId
  const userDeptName = useMemo(() => {
    if (!user?.deptId) return undefined;
    const matchedProj = projects.find((p) => p.dept_id === user.deptId);
    return matchedProj?.departments?.dept_name;
  }, [projects, user?.deptId]);

  // Cấu hình văn phong và số liệu badge live theo 9 vai trò PTIT
  const getRoleConfig = () => {
    const acceptedCount = projects.filter((p) => p.status === 'ACCEPTED').length;
    const periodLabel = progress.period?.periodName || `Năm học ${periodFilter}`;

    switch (roleCode) {
      case 'FINANCE':
        return {
          unit: 'Phòng Tài chính - Kế toán (P.TCKT)',
          sectionTitle: 'Hồ sơ Quyết toán Kinh phí NCKH cần thẩm định & giải ngân',
          badgeText: `${budgetSummary.pendingCount} chứng từ chờ xử lý`,
          actionBtn: 'Thẩm định & Duyệt chi',
          actionPath: '/budgets',
          btnIcon: <DollarCircleOutlined />,
        };
      case 'QLKHCN':
        return {
          unit: 'Phòng Quản lý Khoa học Công nghệ & HTQT',
          sectionTitle: `Danh mục Đề tài NCKH Toàn Học viện (${periodLabel})`,
          badgeText: `${projects.length} đề tài • ${acceptedCount} đã nghiệm thu`,
          actionBtn: 'Cấu hình đợt NCKH',
          actionPath: '/periods',
          btnIcon: <FolderOpenOutlined />,
        };
      case 'LECTURER':
        return {
          unit: lecturerProjects[0]?.departments?.dept_name || userDeptName || 'Bộ môn chuyên ngành • Học viện PTIT',
          sectionTitle: 'Đề tài NCKH bạn đang hướng dẫn (Điều 8 QĐ 521: Tối đa 2 đề tài/GV)',
          badgeText: `${lecturerProjects.length} đề tài hướng dẫn`,
          actionBtn: 'Duyệt đề cương & Tiến độ',
          actionPath: '/outlines',
          btnIcon: <CheckCircleOutlined />,
        };
      case 'FACULTY_LEADER':
      case 'FACULTY_SECRETARY':
        return {
          unit: userDeptName || projects[0]?.departments?.dept_name || 'Ban Chủ nhiệm Khoa',
          sectionTitle: 'Đề tài NCKH Sinh viên & Hồ sơ Cấp Khoa Quản lý',
          badgeText: `${projects.length} đề tài • ${outlines.length} đề cương`,
          actionBtn: 'Lập Công văn đề xuất Mẫu 1',
          actionPath: '/forms',
          btnIcon: <FileTextOutlined />,
        };
      case 'BOARD':
        return {
          unit: 'Ban Giám Đốc Học viện Công nghệ Bưu chính Viễn thông',
          sectionTitle: 'Hồ sơ & Quyết định NCKH Sinh viên Trình Ban Giám Đốc Phê duyệt',
          badgeText: `${acceptances.filter((a) => !a.approvalDocNo && a.avgScore).length} QĐ chờ ký`,
          actionBtn: 'Ký duyệt Quyết định',
          actionPath: '/forms',
          btnIcon: <SafetyCertificateOutlined />,
        };
      case 'STUDENT_AFFAIRS':
        return {
          unit: 'Phòng Công tác Chính trị & Công tác Sinh viên (P.CT&CTSV)',
          sectionTitle: 'Danh sách Sinh viên Khen thưởng & Cộng Điểm Rèn luyện NCKH',
          badgeText: `${awards.studentBonuses?.length || 0} sinh viên xét ĐRL`,
          actionBtn: 'Xác nhận Điểm rèn luyện',
          actionPath: '/awards',
          btnIcon: <TrophyOutlined />,
        };
      case 'ADMIN':
        return {
          unit: 'Trung tâm Dịch vụ Số & Quản trị Hệ thống',
          sectionTitle: `Bảng Điều khiển Quản trị Toàn quyền Hệ thống SRMS PTIT (${periodLabel})`,
          badgeText: `${projects.length} đề tài • Toàn quyền ADMIN`,
          actionBtn: 'Cấu hình Đợt NCKH',
          actionPath: '/periods',
          btnIcon: <AuditOutlined />,
        };
      case 'STUDENT':
      default:
        return {
          unit: studentProjects[0]?.departments?.dept_name || userDeptName || 'Sinh viên Nghiên cứu Khoa học PTIT',
          sectionTitle: 'Đề tài NCKH sinh viên của bạn',
          badgeText: `${studentProjects.length} / 1 đề tài (QĐ 521)`,
          actionBtn: studentProjects.length > 0 ? 'Xem chi tiết đề tài' : 'Đăng ký đề tài mới',
          actionPath: studentProjects.length > 0 ? `/projects/${studentProjects[0].project_id}` : '/projects/new',
          btnIcon: studentProjects.length > 0 ? <FolderOpenOutlined /> : <PlusOutlined />,
        };
    }
  };

  const roleConfig = getRoleConfig();

  // Danh mục nhiệm vụ thích ứng động theo vai trò từ dữ liệu DB thật
  const getTasksByRole = (): DynamicTask[] => {
    const tasks: DynamicTask[] = [];

    if (roleCode === 'FINANCE') {
      allSettlements
        .filter((s) => !s.settledAt)
        .slice(0, 4)
        .forEach((s) => {
          tasks.push({
            code: s.voucherNo || s.projectId,
            title: `Thẩm định chứng từ ${s.voucherNo}: ${s.description} (${Number(s.amount || 0).toLocaleString('vi-VN')}đ)`,
            deadline: formatDateShort(s.submittedAt),
            status: s.facultyConfirmed ? 'Chờ duyệt chi P.TCKT' : 'Chờ Khoa xác nhận',
            color: s.facultyConfirmed ? 'orange' : 'blue',
            path: '/budgets',
          });
        });
    } else if (roleCode === 'LECTURER') {
      outlines
        .filter((o) => o.approvalStatus === 'PENDING')
        .forEach((o) => {
          tasks.push({
            code: o.projectId,
            title: `Thẩm định Thuyết minh Đề cương Mẫu 2 (v${o.versionNo}): ${o.project?.titleVi || o.projectId}`,
            deadline: formatDateShort(o.submittedAt),
            status: 'Chờ GVHD duyệt',
            color: 'red',
            path: '/outlines',
          });
        });
      (progress.reports || [])
        .filter((r: any) => !r.assessment)
        .forEach((r: any) => {
          tasks.push({
            code: r.projectId,
            title: `Nhận xét Báo cáo tiến độ (${r.milestone?.milestoneName || 'Định kỳ'})`,
            deadline: formatDateShort(r.submittedAt),
            status: 'Chờ đánh giá',
            color: 'orange',
            path: '/progress',
          });
        });
      (progress.seminars || [])
        .filter(
          (s: any) =>
            s.status !== 'COMPLETED' && !['SUBMITTED', 'ACCEPTED', 'REJECTED'].includes(s.project?.status),
        )
        .slice(0, 2)
        .forEach((s: any) => {
          tasks.push({
            code: s.projectId,
            title: `Sinh hoạt khoa học Mẫu 3.5: ${s.planTitle}`,
            deadline: formatDateTimeShort(s.heldAt || s.scheduledAt),
            status: s.status === 'INVITED' ? 'Đã gửi giấy mời' : 'Kế hoạch',
            color: 'blue',
            path: '/progress',
          });
        });
    } else if (roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') {
      projects
        .filter((p) => p.status === 'PROPOSED')
        .forEach((p) => {
          tasks.push({
            code: p.project_id,
            title: `Sơ tuyển đề xuất đề tài & Lập Công văn Mẫu 1: "${p.title_vi}"`,
            deadline: formatDateShort(p.registered_at),
            status: 'Chờ Khoa sơ tuyển',
            color: 'red',
            path: '/projects',
          });
        });
      outlines
        .filter((o) => o.approvalStatus === 'ADVISOR_APPROVED')
        .forEach((o) => {
          tasks.push({
            code: o.projectId,
            title: `Ký duyệt Đề cương Mẫu 2 cấp Khoa: ${o.project?.titleVi || o.projectId}`,
            deadline: formatDateShort(o.submittedAt),
            status: 'GVHD đã duyệt',
            color: 'blue',
            path: '/outlines',
          });
        });
      allSettlements
        .filter((s) => !s.facultyConfirmed)
        .slice(0, 2)
        .forEach((s) => {
          tasks.push({
            code: s.voucherNo || s.projectId,
            title: `Xác nhận chứng từ ${s.voucherNo} (${Number(s.amount || 0).toLocaleString('vi-VN')}đ)`,
            deadline: formatDateShort(s.submittedAt),
            status: 'Chờ Khoa xác nhận',
            color: 'orange',
            path: '/budgets',
          });
        });
    } else if (roleCode === 'QLKHCN' || roleCode === 'ADMIN' || roleCode === 'BOARD') {
      projects
        .filter((p) => p.status === 'FACULTY_APPROVED')
        .forEach((p) => {
          tasks.push({
            code: p.project_id,
            title: `Phê duyệt giao đề tài NCKH: "${p.title_vi}"`,
            deadline: formatDateShort(p.registered_at),
            status: 'Khoa đã sơ tuyển',
            color: 'purple',
            path: '/projects',
          });
        });
      acceptances
        .filter((a) => !a.approvalDocNo && a.avgScore)
        .forEach((a) => {
          tasks.push({
            code: a.projectId,
            title: `Ban hành QĐ công nhận Kết quả Nghiệm thu (${Number(a.avgScore).toFixed(1)}đ - ${GRADE_LABEL_MAP[a.grade] || a.grade})`,
            deadline: formatDateShort(a.defenseTime),
            status: 'Chờ QĐ Nghiệm thu',
            color: 'green',
            path: '/acceptance',
          });
        });
      (awards.nominations || [])
        .filter((n: any) => n.status !== 'APPROVED')
        .slice(0, 2)
        .forEach((n: any) => {
          tasks.push({
            code: n.projectId,
            title: `Phê duyệt đề cử Giải thưởng NCKH (${n.prizeGrade}): ${n.project?.titleVi || n.projectId}`,
            deadline: n.awardYear || 'Năm học 2026-2027',
            status: n.status === 'PENDING' ? 'Chờ phê duyệt' : 'Dự thảo QĐ',
            color: 'orange',
            path: '/awards',
          });
        });
    } else if (roleCode === 'STUDENT_AFFAIRS') {
      (awards.studentBonuses || [])
        .filter((sb: any) => sb.approvalStatus !== 'APPROVED')
        .slice(0, 4)
        .forEach((sb: any) => {
          tasks.push({
            code: sb.projectId,
            title: `Xác nhận +${sb.trainingScore}đ ĐRL cho ${sb.student?.user?.fullName || sb.studentId} (${sb.studentId})`,
            deadline: 'Học kỳ 2026-2027',
            status: 'Chờ CTSV duyệt',
            color: 'blue',
            path: '/awards',
          });
        });
    } else {
      // STUDENT
      (progress.seminars || [])
        .filter(
          (s: any) =>
            s.status !== 'COMPLETED' &&
            !['SUBMITTED', 'ACCEPTED', 'REJECTED'].includes(s.project?.status) &&
            s.members?.some(
              (m: any) =>
                (m.userId === user?.userId || m.attendeeName === user?.fullName) && m.rsvpStatus === 'PENDING',
            ),
        )
        .forEach((s: any) => {
          tasks.push({
            code: s.projectId,
            title: `Xác nhận tham dự Sinh hoạt khoa học "${s.planTitle}"`,
            deadline: formatDateTimeShort(s.heldAt || s.scheduledAt),
            status: 'Chờ xác nhận RSVP',
            color: 'orange',
            path: '/progress',
          });
        });

      outlines
        .filter((o) => o.approvalStatus === 'REVISION_REQUIRED')
        .forEach((o) => {
          tasks.push({
            code: o.projectId,
            title: `Chỉnh sửa Thuyết minh Đề cương Mẫu 2 (v${o.versionNo}) theo góp ý`,
            deadline: formatDateShort(o.submittedAt),
            status: 'Cần chỉnh sửa',
            color: 'red',
            path: '/outlines',
          });
        });

      studentProjects.forEach((p) => {
        const meta = PROJECT_STATUS_META[p.status] || { label: p.status, color: 'blue', progress: 50 };
        if (p.status !== 'ACCEPTED') {
          tasks.push({
            code: p.project_id,
            title: `Theo dõi tiến độ & hoàn thiện hồ sơ đề tài "${p.title_vi}"`,
            deadline: formatDateShort(p.registered_at),
            status: meta.label,
            color: meta.color,
            path: `/projects/${p.project_id}`,
          });
        }
      });

      if (studentProjects.length === 0) {
        tasks.push({
          code: 'MẪU 1',
          title: 'Bạn chưa tham gia đề tài nào trong Đợt 2026-2027. Đăng ký đề tài mới ngay.',
          deadline: 'Đang mở đăng ký',
          status: 'Sẵn sàng',
          color: 'blue',
          path: '/projects/new',
        });
      }
    }

    return tasks;
  };

  const currentTasks = getTasksByRole();
  const latestNotif = notifications[0];
  const unreadNotifCount = notifications.filter((n) => !(n.isRead || n.readAt)).length;
  const nextEvent = events[0];
  const nextMilestone = (progress.milestones || [])[0];
  const now = new Date();
  const currentMonthText = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

  const deptColors = ['#C62828', '#1890FF', '#52C41A', '#722ED1'];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* 1. HÀNG BANNER CHÀO MỪNG S-LINK + THÔNG BÁO + SỰ KIỆN */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div
          style={{
            flex: 2,
            minWidth: 320,
            background: 'linear-gradient(105deg, #FFF1F0 0%, #FFE4E6 50%, #FFD1D6 100%)',
            border: '1px solid #FFD4D0',
            borderRadius: 8,
            padding: '0 20px 0 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '22px 0' }}>
            <div style={{ fontSize: 13, color: '#C62828', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
              Cổng dịch vụ nghiên cứu khoa học sinh viên (SRMS)
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#C62828', lineHeight: 1.2 }}>
              Xin chào {user?.fullName || 'Thành viên PTIT'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#262626', marginTop: 4 }}>
              Mừng bạn quay lại hệ thống
            </div>
            <div style={{ fontSize: 12, color: '#595959', marginTop: 8 }}>
              Vai trò hiện tại: <b style={{ color: '#C62828' }}>{user?.roleName || 'Sinh viên'}</b> • Đơn vị:{' '}
              <b style={{ color: '#262626' }}>{roleConfig.unit}</b>
            </div>
          </div>

          <div className="peace-hand-box" title="Xin chào!">
            <svg className="peace-hand-svg" viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="73" y="128" width="32" height="42" fill="#FBB7AF" stroke="#6E2C1E" strokeWidth="1.5" />
              <path
                d="M63 155 C63 151, 66 148, 70 148 H108 C112 148, 115 151, 115 155 V225 H63 V155 Z"
                fill="#A62D0C"
                stroke="#6E2C1E"
                strokeWidth="1.5"
              />
              <g className="v-fingers">
                <path
                  d="M71 95 C65 78, 56 63, 46 51 C42 46, 42 40, 47 37 C52 34, 57 38, 61 44 C70 57, 78 72, 82 90 Z"
                  fill="#FBB7AF"
                  stroke="#6E2C1E"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M84 89 C83 71, 80 54, 78 40 C77 33, 81 29, 86 29 C91 29, 94 34, 95 41 C97 56, 99 73, 100 90 Z"
                  fill="#FBB7AF"
                  stroke="#6E2C1E"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </g>
              <path
                d="M68 89 C73 80, 88 77, 102 81 C117 85, 125 100, 122 116 C119 132, 105 142, 89 142 C75 142, 65 134, 60 122 L68 89 Z"
                fill="#FBB7AF"
                stroke="#6E2C1E"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <rect
                x="97"
                y="77"
                width="16"
                height="33"
                rx="8"
                transform="rotate(18 105 92)"
                fill="#FBB7AF"
                stroke="#6E2C1E"
                strokeWidth="1.5"
              />
              <rect
                x="108"
                y="87"
                width="15"
                height="30"
                rx="7.5"
                transform="rotate(24 115 101)"
                fill="#FBB7AF"
                stroke="#6E2C1E"
                strokeWidth="1.5"
              />
              <path
                d="M61 122 C55 121, 51 116, 52 110 C53 103, 59 99, 67 97 L80 94 C87 92, 92 96, 92 102 C92 108, 87 112, 80 114 L71 116"
                fill="#FBB7AF"
                stroke="#6E2C1E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Thẻ Thông báo NCKH */}
        <div
          style={{
            flex: 1.1,
            minWidth: 260,
            backgroundColor: '#FFFFFF',
            border: '1px solid #EDEDEE',
            borderRadius: 8,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => navigate(latestNotif?.targetUrl || '/calendar')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>Thông báo NCKH</span>
            <Tag color={unreadNotifCount > 0 ? 'red' : 'default'} style={{ margin: 0 }}>
              {unreadNotifCount > 0 ? `${unreadNotifCount} chưa đọc` : 'Cập nhật'}
            </Tag>
          </div>
          <div style={{ margin: '10px 0', fontSize: 13, fontWeight: 600, color: '#262626', lineHeight: 1.4 }}>
            {latestNotif?.title || 'Chưa có thông báo mới trong hệ thống'}
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {latestNotif?.time
              ? `${latestNotif.time} • Phòng Quản lý Khoa học Công nghệ`
              : latestNotif?.sentAt
                ? `${formatDateShort(latestNotif.sentAt)} • Phòng Quản lý Khoa học Công nghệ`
                : 'Đồng bộ tự động từ dữ liệu D9'}
          </div>
        </div>

        {/* Thẻ Sự kiện sắp tới */}
        <div
          style={{
            flex: 1.1,
            minWidth: 260,
            backgroundColor: '#FFFFFF',
            border: '1px solid #EDEDEE',
            borderRadius: 8,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/calendar')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#262626' }}>Sự kiện sắp tới</span>
            <Tag color="blue" style={{ margin: 0 }}>
              {events.length} lịch NCKH
            </Tag>
          </div>
          <div style={{ margin: '10px 0', fontSize: 13, fontWeight: 600, color: '#262626', lineHeight: 1.4 }}>
            {nextEvent?.title || nextMilestone?.milestoneName || 'Theo dõi lịch trình sinh hoạt khoa học & bảo vệ'}
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {nextEvent
              ? `${nextEvent.startDate ? formatDateShort(nextEvent.startDate) : ''}${nextEvent.startTime ? ` (${nextEvent.startTime})` : ''} • ${nextEvent.location || 'Học viện PTIT'}`
              : nextMilestone
                ? `Hạn mốc: ${formatDateShort(nextMilestone.dueDate)}`
                : 'Lịch công tác NCKH toàn Học viện'}
          </div>
        </div>
      </div>

      {/* 2. KHỐI THẺ THÍCH ỨNG LINH HOẠT THEO VAI TRÒ (ROLE-ADAPTIVE CARDS GRID) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626', fontSize: 17 }}>
              {roleConfig.sectionTitle}
            </Title>
            <Tag color={roleCode === 'FINANCE' ? 'orange' : roleCode === 'QLKHCN' ? 'purple' : 'green'} style={{ borderRadius: 10, padding: '0 8px', fontWeight: 600 }}>
              {roleConfig.badgeText}
            </Tag>
          </div>

          <Space size={12}>
            <Button
              type="primary"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828', fontWeight: 600, borderRadius: 6 }}
              icon={roleConfig.btnIcon}
              onClick={() => navigate(roleConfig.actionPath)}
            >
              {roleConfig.actionBtn}
            </Button>
            <Select
              value={periodFilter}
              onChange={setPeriodFilter}
              size="small"
              style={{ width: 150 }}
              options={[
                { value: 'ALL', label: 'Tất cả đợt NCKH' },
                ...periods.map((p: any) => ({
                  value: String(p.periodId),
                  label: `Đợt ${p.academicYear}`,
                })),
              ]}
            />
            <a style={{ color: '#C62828', fontSize: 13, fontWeight: 500 }} onClick={() => navigate(roleConfig.actionPath)}>
              Xem tất cả <RightOutlined style={{ fontSize: 10 }} />
            </a>
          </Space>
        </div>

        {loading ? (
          <PtitSpinner tip="Đang đồng bộ dữ liệu từ hệ thống..." minHeight={180} />
        ) : roleCode === 'FINANCE' ? (
          <Row gutter={[16, 16]}>
            {allSettlements.slice(0, 3).map((s) => {
              const statusTag = s.settledAt
                ? { color: 'green', label: 'Đã giải ngân' }
                : s.facultyConfirmed
                  ? { color: 'orange', label: 'Chờ duyệt chi' }
                  : { color: 'blue', label: 'Chờ Khoa xác nhận' };
              return (
                <Col xs={24} sm={12} lg={6} key={s.settlementId}>
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EDEDEE',
                      borderRadius: 8,
                      padding: 16,
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    onClick={() => navigate('/budgets')}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: '#C62828', fontWeight: 700 }}>{s.voucherNo}</span>
                        <Tag color={statusTag.color} style={{ margin: 0, fontSize: 11 }}>
                          {statusTag.label}
                        </Tag>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                        {s.description}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>
                        Đề tài: <b>{s.projectId}</b>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#C62828', marginBottom: 8 }}>
                        {Number(s.amount || 0).toLocaleString('vi-VN')} VNĐ
                      </div>
                      <div style={{ fontSize: 11, color: '#595959' }}>
                        Chủ nhiệm: {s.leaderName}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ color: s.acceptanceGrade ? '#52C41A' : '#8c8c8c', fontWeight: 600 }}>
                        {s.acceptanceGrade ? `Nghiệm thu: ${GRADE_LABEL_MAP[s.acceptanceGrade] || s.acceptanceGrade}` : s.category || 'Hồ sơ chi phí'}
                      </span>
                      <Avatar size={24} style={{ backgroundColor: '#FA8C16', fontSize: 11 }}>TC</Avatar>
                    </div>
                  </div>
                </Col>
              );
            })}

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EDEDEE',
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onClick={() => navigate('/budgets')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#1890FF', fontWeight: 700 }}>NGÂN SÁCH NCKH</span>
                    <Tag color="green" style={{ margin: 0, fontSize: 11 }}>{periodFilter}</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Tổng kinh phí đã phê duyệt cấp ({budgets.length} đề tài)
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1890FF', marginBottom: 4 }}>
                    {budgetSummary.totalApproved.toLocaleString('vi-VN')} VNĐ
                  </div>
                  <div style={{ fontSize: 12, color: '#595959', marginBottom: 8 }}>
                    Đã giải ngân: <b>{budgetSummary.totalSettled.toLocaleString('vi-VN')}đ ({budgetSummary.pct}%)</b>
                  </div>
                  <Progress percent={budgetSummary.pct} strokeColor="#1890FF" size="small" showInfo={false} />
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: '#8c8c8c' }}>Còn lại: {budgetSummary.remaining.toLocaleString('vi-VN')}đ</span>
                  <Avatar size={24} style={{ backgroundColor: '#1890FF', fontSize: 11 }}>HV</Avatar>
                </div>
              </div>
            </Col>
          </Row>
        ) : roleCode === 'LECTURER' ? (
          <Row gutter={[16, 16]}>
            {lecturerProjects.slice(0, 4).map((p) => {
              const leader = p.project_members?.find((m: any) => m.member_role === 'LEADER') || p.project_members?.[0];
              const leaderName = leader?.students?.users?.full_name || 'Chủ nhiệm đề tài';
              const meta = PROJECT_STATUS_META[p.status] || { label: p.status, color: 'blue', progress: 50 };
              const hourRecord = (awards.lecturerHours || []).find((h: any) => h.projectId === p.project_id);
              const hoursText = hourRecord ? `${hourRecord.convertedHours} Giờ chuẩn NCKH` : p.status === 'ACCEPTED' ? '30 Giờ chuẩn NCKH' : 'Đang tính giờ NCKH';
              return (
                <Col xs={24} sm={12} lg={6} key={p.project_id}>
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EDEDEE',
                      borderRadius: 8,
                      padding: 16,
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    onClick={() => navigate(`/projects/${p.project_id}`)}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>{p.project_id}</span>
                        <Tag color={meta.color} style={{ margin: 0, fontSize: 10 }}>{meta.label}</Tag>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 10 }}>
                        {p.title_vi}
                      </div>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 12 }}>
                        Chủ nhiệm: <b>{leaderName}</b> ({p.project_members?.length || 1} thành viên)
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                          <span>Tiến trình:</span>
                          <b>{meta.progress}%</b>
                        </div>
                        <Progress percent={meta.progress} size="small" strokeColor="#C62828" showInfo={false} />
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ color: '#C62828', fontWeight: 600 }}>{hoursText}</span>
                      <Avatar size={24} style={{ backgroundColor: '#262626', fontSize: 11 }}>{getInitials(leaderName)}</Avatar>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        ) : roleCode === 'QLKHCN' || roleCode === 'ADMIN' ? (
          <Row gutter={[16, 16]}>
            {deptStats.map((dept, idx) => {
              const color = deptColors[idx % deptColors.length];
              const pct = dept.total > 0 ? Math.round((dept.doneOrOngoing / dept.total) * 100) : 0;
              return (
                <Col xs={24} sm={12} lg={6} key={dept.code}>
                  <div
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%' }}
                    onClick={() => navigate('/projects')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{dept.name.toUpperCase()}</span>
                      <Tag color="blue">{dept.total} đề tài</Tag>
                    </div>
                    <div style={{ fontSize: 13, color: '#595959', marginBottom: 8 }}>
                      {dept.doneOrOngoing} đề tài đã duyệt / triển khai • {dept.total - dept.doneOrOngoing} đang sơ tuyển
                    </div>
                    <Progress percent={pct} size="small" strokeColor={color} />
                  </div>
                </Col>
              );
            })}
          </Row>
        ) : roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY' ? (
          <Row gutter={[16, 16]}>
            {projects.slice(0, 2).map((p) => {
              const leader = p.project_members?.find((m: any) => m.member_role === 'LEADER') || p.project_members?.[0];
              const advisor = p.project_advisors?.[0];
              const meta = PROJECT_STATUS_META[p.status] || { label: p.status, color: 'blue', progress: 50 };
              return (
                <Col xs={24} sm={12} lg={6} key={p.project_id}>
                  <div
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    onClick={() => navigate(`/projects/${p.project_id}`)}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>{p.project_id}</span>
                        <Tag color={meta.color}>{meta.label}</Tag>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                        {p.title_vi}
                      </div>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6 }}>
                        Chủ nhiệm: <b>{leader?.students?.users?.full_name || 'Đang cập nhật'}</b> • GVHD: {advisor?.lecturers?.users?.full_name || 'Đang cập nhật'}
                      </div>
                      <Progress percent={meta.progress} size="small" strokeColor="#C62828" />
                    </div>
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#C62828', fontWeight: 600 }}>{p.departments?.dept_code || 'KHOA'}</span>
                      <Tag color="blue">{p.departments?.dept_name || 'Đơn vị'}</Tag>
                    </div>
                  </div>
                </Col>
              );
            })}

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/outlines')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#C62828', fontWeight: 700 }}>ĐỀ CƯƠNG MẪU 2</span>
                    <Tag color="purple">{outlines.length} hồ sơ</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Thẩm định Thuyết minh Đề cương 2 cấp (GVHD → Khoa)
                  </div>
                  <div style={{ fontSize: 11, color: '#595959', marginBottom: 6 }}>
                    Chờ Khoa duyệt: {outlines.filter((o) => o.approvalStatus === 'ADVISOR_APPROVED').length} • Đã duyệt:{' '}
                    {outlines.filter((o) => o.approvalStatus === 'FACULTY_APPROVED').length}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#52C41A' }}>
                    Quy trình chuẩn QĐ 521
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#595959' }}>Phê duyệt 2 cấp</span>
                  <Tag color="green">Cập nhật trực tiếp</Tag>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              {(() => {
                const allSems = progress.seminars || [];
                const activeSems = allSems.filter(
                  (s: any) =>
                    s.status !== 'COMPLETED' && !['SUBMITTED', 'ACCEPTED', 'REJECTED'].includes(s.project?.status),
                );
                const featuredSem = activeSems[0] || allSems[0];
                return (
                  <div
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    onClick={() => navigate('/progress')}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: '#FA8C16', fontWeight: 700 }}>MẪU 3.5 SINH HOẠT KH</span>
                        <Tag color={activeSems.length > 0 ? 'orange' : 'green'}>
                          {activeSems.length > 0 ? `${activeSems.length} đang mở` : `${allSems.length} đã hoàn thành`}
                        </Tag>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                        {featuredSem?.planTitle || 'Tổ chức Hội thảo khoa học & Báo cáo tiến độ cấp Khoa'}
                      </div>
                      <div style={{ fontSize: 11, color: '#595959', marginBottom: 6 }}>
                        {featuredSem?.members?.length || 0} đại biểu •{' '}
                        {activeSems.length > 0 ? 'Theo dõi RSVP thời gian thực' : 'Đã chốt biên bản trước nghiệm thu'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1890FF' }}>
                        Biên bản Mẫu 3.5 số hóa
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#595959' }}>{featuredSem?.location || 'Hội trường Khoa'}</span>
                      <Tag color="blue">Điều 9 QĐ 521</Tag>
                    </div>
                  </div>
                );
              })()}
            </Col>
          </Row>
        ) : roleCode === 'BOARD' ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/projects')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#C62828', fontWeight: 700 }}>QUYẾT ĐỊNH GIAO ĐỀ TÀI</span>
                    <Tag color="green">{projects.length} đề tài</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Danh mục đề tài NCKH sinh viên toàn Học viện đợt {periodFilter}
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    {projects.filter((p) => p.status === 'FACULTY_APPROVED').length} chờ phê duyệt • {projects.filter((p) => p.status === 'ACCEPTED').length} đã nghiệm thu
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#C62828', fontWeight: 600 }}>Ký số BGĐ Học viện</span>
                  <Avatar size={24} style={{ backgroundColor: '#C62828', fontSize: 11 }}>BGD</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/acceptance')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#1890FF', fontWeight: 700 }}>HỘI ĐỒNG NGHIỆM THU</span>
                    <Tag color="orange">{acceptances.length} hội đồng</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Hội đồng đánh giá nghiệm thu 7 tiêu chí cấp Học viện (Mẫu 4)
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Chờ QĐ công nhận: {acceptances.filter((a) => !a.approvalDocNo && a.avgScore).length} hội đồng
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#1890FF', fontWeight: 600 }}>Điều 11 QĐ 521</span>
                  <Avatar size={24} style={{ backgroundColor: '#1890FF', fontSize: 11 }}>HĐ</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/awards')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#FA8C16', fontWeight: 700 }}>KHEN THƯỞNG GIẢI THƯỞNG</span>
                    <Tag color="gold">{(awards.nominations || []).length} đề cử</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Quyết định tặng Giấy khen & Giải thưởng NCKH Sinh viên (Mẫu 5)
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Đã cấp {(awards.certificates || []).length} Giấy chứng nhận số QR
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#FA8C16', fontWeight: 600 }}>Quỹ Khen thưởng NCKH</span>
                  <Avatar size={24} style={{ backgroundColor: '#FA8C16', fontSize: 11 }}>KT</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/regulations')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#52C41A', fontWeight: 700 }}>QUY CHẾ QUẢN LÝ</span>
                    <Tag color="green">QĐ 521</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Quyết định số 521/QĐ-HV về Quy chế Quản lý hoạt động NCKH Sinh viên
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Áp dụng thống nhất trên toàn hệ thống S-Link SRMS
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#52C41A', fontWeight: 600 }}>Văn bản Quy phạm</span>
                  <Avatar size={24} style={{ backgroundColor: '#52C41A', fontSize: 11 }}>QC</Avatar>
                </div>
              </div>
            </Col>
          </Row>
        ) : roleCode === 'STUDENT_AFFAIRS' ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/awards')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#C62828', fontWeight: 700 }}>ĐIỂM RÈN LUYỆN (ĐIỀU 14)</span>
                    <Tag color="red">{(awards.studentBonuses || []).length} sinh viên</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Xác nhận kết quả NCKH và cập nhật Điểm rèn luyện năm học {periodFilter}
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Chờ CTSV duyệt: {(awards.studentBonuses || []).filter((s: any) => s.approvalStatus !== 'APPROVED').length} hồ sơ
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#C62828', fontWeight: 600 }}>Đồng bộ Cổng CTSV</span>
                  <Avatar size={24} style={{ backgroundColor: '#C62828', fontSize: 11 }}>RL</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/awards')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#1890FF', fontWeight: 700 }}>HỌC BỔNG KHUYẾN KHÍCH</span>
                    <Tag color="blue">{(awards.nominations || []).length} đề cử</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Danh sách sinh viên NCKH đạt giải ưu tiên xét học bổng khuyến khích
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Áp dụng Điều 15 Quyết định 521/QĐ-HV
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#1890FF', fontWeight: 600 }}>Quỹ Học bổng PTIT</span>
                  <Avatar size={24} style={{ backgroundColor: '#1890FF', fontSize: 11 }}>HB</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/awards')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#52C41A', fontWeight: 700 }}>GIẤY CHỨNG NHẬN NCKH</span>
                    <Tag color="green">{(awards.certificates || []).length} chứng nhận</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Cấp Giấy chứng nhận hoàn thành NCKH có mã định danh QR tra cứu
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Tích hợp hồ sơ năng lực số sinh viên
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#52C41A', fontWeight: 600 }}>Tra cứu QR Code</span>
                  <Avatar size={24} style={{ backgroundColor: '#52C41A', fontSize: 11 }}>CN</Avatar>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 16, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                onClick={() => navigate('/projects')}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#722ED1', fontWeight: 700 }}>ĐỀ TÀI NGHIỆM THU</span>
                    <Tag color="purple">{projects.filter((p) => p.status === 'ACCEPTED').length} đề tài</Tag>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#262626', height: 38, overflow: 'hidden', lineHeight: 1.35, marginBottom: 8 }}>
                    Tổng hợp đề tài đạt nghiệm thu đủ điều kiện cộng điểm & khen thưởng
                  </div>
                  <div style={{ fontSize: 11, color: '#595959' }}>
                    Tổng số đề tài toàn Học viện: {projects.length}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#722ED1', fontWeight: 600 }}>Cổng SRMS PTIT</span>
                  <Avatar size={24} style={{ backgroundColor: '#722ED1', fontSize: 11 }}>NT</Avatar>
                </div>
              </div>
            </Col>
          </Row>
        ) : studentProjects.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDEE', borderRadius: 8, padding: 28 }}>
            <Empty description="Bạn chưa tham gia đề tài NCKH nào trong Đợt 2026-2027 (Tối đa 1 đề tài / sinh viên theo QĐ 521)">
              <Button type="primary" style={{ backgroundColor: '#C62828', borderColor: '#C62828' }} icon={<PlusOutlined />} onClick={() => navigate('/projects/new')}>
                Đăng ký đề tài mới (Mẫu 1)
              </Button>
            </Empty>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {studentProjects.map((p) => {
              const advisor = p.project_advisors?.[0];
              const advisorName = advisor?.lecturers?.users?.full_name || 'Chưa phân công GVHD';
              const meta = PROJECT_STATUS_META[p.status] || { label: p.status, color: 'blue', progress: 50 };
              return (
                <Col xs={24} sm={12} lg={6} key={p.project_id}>
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EDEDEE',
                      borderRadius: 8,
                      padding: 16,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => navigate(`/projects/${p.project_id}`)}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>{p.project_id}</span>
                        <Tag color={meta.color} style={{ margin: 0, fontSize: 10, borderRadius: 4 }}>
                          {meta.label}
                        </Tag>
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#262626',
                          lineHeight: 1.35,
                          marginBottom: 10,
                          height: 38,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {p.title_vi}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c', marginBottom: 12 }}>
                        <span><TeamOutlined style={{ color: '#1890FF', marginRight: 4 }} />{p.project_members?.length || 1} thành viên</span>
                        <span><FileTextOutlined style={{ color: '#FA8C16', marginRight: 4 }} />Mẫu 2 Đề cương</span>
                        <span><CommentOutlined style={{ color: '#52C41A', marginRight: 4 }} />Mẫu 3.5</span>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#595959', marginBottom: 4 }}>
                          <span>Tiến trình:</span>
                          <b>{meta.progress}%</b>
                        </div>
                        <Progress percent={meta.progress} size="small" strokeColor="#C62828" showInfo={false} />
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ color: '#8c8c8c' }}>Định mức: 1 SV / 1 Đề tài</span>
                      <Tooltip title={`GVHD: ${advisorName}`}>
                        <Avatar size={24} style={{ backgroundColor: '#262626', fontSize: 11 }}>
                          {getInitials(advisorName)}
                        </Avatar>
                      </Tooltip>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      {/* 3. PHẦN DƯỚI: NHIỆM VỤ MỐC TIẾN ĐỘ THÍCH ỨNG THEO VAI TRÒ & MINI CALENDAR */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #EDEDEE',
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
                  {roleCode === 'FINANCE' ? 'Nhiệm vụ Thẩm định & Nghiệp vụ Tài chính' : 'Nhiệm vụ & Mốc hạn tiến độ NCKH'}
                </span>
                <Tag color="cyan">Đang xử lý ({currentTasks.length})</Tag>
              </div>
              <a style={{ color: '#C62828', fontSize: 13, fontWeight: 500 }} onClick={() => navigate(roleConfig.actionPath)}>
                Xem chi tiết <RightOutlined style={{ fontSize: 10 }} />
              </a>
            </div>

            <List
              itemLayout="horizontal"
              dataSource={currentTasks}
              locale={{ emptyText: 'Không có tác vụ tồn đọng nào cần xử lý lúc này.' }}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '12px 14px',
                    marginBottom: 10,
                    borderRadius: 6,
                    border: '1px solid #F0F0F0',
                    backgroundColor: '#FAFAFA',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(item.path)}
                  actions={[
                    <Button key="go" type="link" size="small" style={{ color: '#C62828', fontWeight: 600 }}>
                      Thực hiện <ArrowRightOutlined />
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: item.color === 'orange' ? '#FFF7E6' : '#FFF0ED',
                          color: item.color === 'orange' ? '#FA8C16' : '#C62828',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        ✓
                      </div>
                    }
                    title={
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#262626' }}>
                        {item.title}
                      </div>
                    }
                    description={
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                        Mã tham chiếu: <b>{item.code}</b> • Mốc thời gian: <b style={{ color: '#262626' }}>{item.deadline}</b> •{' '}
                        <Tag color={item.color} style={{ fontSize: 11, margin: 0 }}>
                          {item.status}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </Col>

        {/* CỘT PHẢI: LỊCH SỰ KIỆN NCKH */}
        <Col xs={24} lg={8}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #EDEDEE',
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#262626' }}>
                Lịch trình NCKH
              </span>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>{currentMonthText}</span>
            </div>

            <Calendar fullscreen={false} />

            <div style={{ marginTop: 14, padding: 12, backgroundColor: '#FFF9F9', border: '1px dashed #FFD4D0', borderRadius: 6 }}>
              <div style={{ fontWeight: 600, color: '#C62828', fontSize: 12 }}>Mốc gần nhất:</div>
              <div style={{ fontSize: 12, color: '#262626', marginTop: 2 }}>
                {nextEvent
                  ? `${nextEvent.startDate ? formatDateShort(nextEvent.startDate) : ''}${nextEvent.startTime ? ` (${nextEvent.startTime})` : ''}: ${nextEvent.title}`
                  : nextMilestone
                    ? `${formatDateShort(nextMilestone.dueDate)}: ${nextMilestone.milestoneName}`
                    : 'Đang theo dõi lịch công tác NCKH năm học 2026-2027'}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
