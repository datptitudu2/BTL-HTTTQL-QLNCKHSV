import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface UserProfile {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  roleCode: string;
  roleName: string;
  studentId?: string;
  lecturerId?: string;
  deptId?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (username: string, pass?: string) => Promise<void>;
  ssoLogin: (provider: 'outlook' | 'gmail') => Promise<void>;
  quickLogin: (roleCode: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const roleProfiles: Record<string, UserProfile> = {
  STUDENT: {
    userId: 1,
    username: 'an.nv',
    fullName: 'Nguyễn Văn An',
    email: 'an.nv@stu.ptit.edu.vn',
    phone: '0981234567',
    roleCode: 'STUDENT',
    roleName: 'Sinh viên',
    studentId: 'B23DCCN001',
    deptId: 1,
  },
  LECTURER: {
    userId: 2,
    username: 'dungnq',
    fullName: 'TS. Ngô Quốc Dũng',
    email: 'dungnq@ptit.edu.vn',
    phone: '0912345678',
    roleCode: 'LECTURER',
    roleName: 'Giảng viên hướng dẫn',
    lecturerId: 'GV001',
    deptId: 1,
  },
  LECTURER_TRI: {
    userId: 12,
    username: 'tritd',
    fullName: 'TS. Trần Đình Trí',
    email: 'tritd@ptit.edu.vn',
    phone: '0912345888',
    roleCode: 'LECTURER',
    roleName: 'Giảng viên hướng dẫn',
    lecturerId: 'GV002',
    deptId: 2,
  },
  LECTURER_HUY: {
    userId: 13,
    username: 'huydq',
    fullName: 'TS. Đinh Quang Huy',
    email: 'huydq@ptit.edu.vn',
    phone: '0912345999',
    roleCode: 'LECTURER',
    roleName: 'Giảng viên hướng dẫn',
    lecturerId: 'GV003',
    deptId: 3,
  },
  LECTURER_TUAN: {
    userId: 14,
    username: 'tuannv',
    fullName: 'TS. Nguyễn Văn Tuấn',
    email: 'tuannv@ptit.edu.vn',
    phone: '0912345777',
    roleCode: 'LECTURER',
    roleName: 'Giảng viên hướng dẫn',
    lecturerId: 'GV004',
    deptId: 4,
  },
  LECTURER_HUNG: {
    userId: 28,
    username: 'hungnq',
    fullName: 'TS. Nguyễn Quang Hưng',
    email: 'hungnq@ptit.edu.vn',
    phone: '0912345888',
    roleCode: 'LECTURER',
    roleName: 'Giảng viên Hội đồng',
    lecturerId: 'GV007',
    deptId: 1,
  },
  FACULTY_SECRETARY: {
    userId: 3,
    username: 'thukycntt1',
    fullName: 'ThS. Nguyễn Thị Lan',
    email: 'lannt@ptit.edu.vn',
    roleCode: 'FACULTY_SECRETARY',
    roleName: 'Thư ký Khoa CNTT1',
    deptId: 1,
  },
  FACULTY_LEADER: {
    userId: 4,
    username: 'khoacntt1',
    fullName: 'PGS.TS. Trần Đình Quế',
    email: 'quetd@ptit.edu.vn',
    roleCode: 'FACULTY_LEADER',
    roleName: 'Trưởng Khoa CNTT1',
    deptId: 1,
  },
  QLKHCN: {
    userId: 5,
    username: 'qlkhcn',
    fullName: 'ThS. Phạm Văn Hùng',
    email: 'qlkhcn@ptit.edu.vn',
    roleCode: 'QLKHCN',
    roleName: 'Chuyên viên Phòng QLKH&CN',
  },
  BOARD: {
    userId: 6,
    username: 'bgiangdoc',
    fullName: 'PGS.TS. Đặng Hoài Bắc',
    email: 'bacdh@ptit.edu.vn',
    roleCode: 'BOARD',
    roleName: 'Giám đốc Học viện',
  },
  FINANCE: {
    userId: 7,
    username: 'tckt',
    fullName: 'CN. Lê Thị Mai',
    email: 'tckt@ptit.edu.vn',
    roleCode: 'FINANCE',
    roleName: 'Kế toán viên Phòng TCKT',
  },
  STUDENT_AFFAIRS: {
    userId: 8,
    username: 'ctsv',
    fullName: 'ThS. Bùi Văn Toàn',
    email: 'ctsv@ptit.edu.vn',
    roleCode: 'STUDENT_AFFAIRS',
    roleName: 'Chuyên viên Phòng CT&CTSV',
  },
  ADMIN: {
    userId: 9,
    username: 'admin',
    fullName: 'Quản trị viên Hệ thống PTIT',
    email: 'admin@ptit.edu.vn',
    roleCode: 'ADMIN',
    roleName: 'Quản trị viên Hệ thống',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('srms_user');
    if (!cached) return null;
    try {
      const parsed = JSON.parse(cached);
      // Tự động chuẩn hóa dọn dẹp các tên placeholder cũ nếu còn lưu trong localStorage trình duyệt
      if (parsed.fullName?.includes('Bùi Công Tác') || parsed.username === 'ctsv' || parsed.username === 'ctsv001') {
        localStorage.setItem('srms_user', JSON.stringify(roleProfiles.STUDENT_AFFAIRS));
        return roleProfiles.STUDENT_AFFAIRS;
      }
      if (parsed.fullName?.includes('Đỗ Văn Khoa') || parsed.username === 'qlkhcn' || parsed.username === 'qlkh001') {
        localStorage.setItem('srms_user', JSON.stringify(roleProfiles.QLKHCN));
        return roleProfiles.QLKHCN;
      }
      if (parsed.fullName?.includes('Trần Đình Trưởng Khoa') || parsed.username === 'khoacntt1' || parsed.username === 'lead001') {
        localStorage.setItem('srms_user', JSON.stringify(roleProfiles.FACULTY_LEADER));
        return roleProfiles.FACULTY_LEADER;
      }
      if (parsed.fullName?.includes('Phạm Thị Thư Ký') || parsed.username === 'thukycntt1' || parsed.username === 'tk001') {
        localStorage.setItem('srms_user', JSON.stringify(roleProfiles.FACULTY_SECRETARY));
        return roleProfiles.FACULTY_SECRETARY;
      }
      if (parsed.fullName?.includes('Nguyễn Giám Đốc') || parsed.username === 'bgiangdoc' || parsed.username === 'bgd001') {
        localStorage.setItem('srms_user', JSON.stringify(roleProfiles.BOARD));
        return roleProfiles.BOARD;
      }
      if (parsed.fullName?.includes('Lê Tài Chính') || parsed.username === 'tckt' || parsed.username === 'tckt001') {
        localStorage.setItem('srms_user', JSON.stringify(roleProfiles.FINANCE));
        return roleProfiles.FINANCE;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('srms_access_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      // Nếu token là phiên giả lập hoặc offline, không gọi API /auth/me để tránh ECONNREFUSED
      if (token.startsWith('mock_')) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const roleData = res.data.role || res.data.roles || {};
        const studentData = res.data.student || res.data.students || {};
        const lecturerData = res.data.lecturer || res.data.lecturers || {};

        const userData: UserProfile = {
          userId: res.data.userId ?? res.data.user_id ?? 1,
          username: res.data.ssoUsername ?? res.data.sso_username ?? res.data.username ?? '',
          fullName: res.data.fullName ?? res.data.full_name ?? '',
          email: res.data.email ?? '',
          phone: res.data.phone ?? '',
          roleCode: roleData.roleCode ?? roleData.role_code ?? res.data.roleCode ?? 'STUDENT',
          roleName: roleData.roleName ?? roleData.role_name ?? res.data.roleName ?? 'Sinh viên',
          studentId: studentData.studentId ?? studentData.student_id,
          lecturerId: lecturerData.lecturerId ?? lecturerData.lecturer_id,
          deptId: studentData.deptId ?? studentData.dept_id ?? lecturerData.deptId ?? lecturerData.dept_id ?? res.data.deptId,
        };
        setUser(userData);
        localStorage.setItem('srms_user', JSON.stringify(userData));
      } catch (err: any) {
        // Chỉ logout khi server thực sự phản hồi 401 Unauthorized
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const handleAuthSuccess = (data: any) => {
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('srms_access_token', data.access_token);
    localStorage.setItem('srms_user', JSON.stringify(data.user));
  };

  const login = async (username: string, password = 'password123') => {
    try {
      const res = await api.post('/auth/login', { username, password });
      handleAuthSuccess(res.data);
    } catch (err) {
      // Fallback xác thực cục bộ khớp tên đăng nhập / vai trò
      const u = username.toLowerCase();
      let matched = roleProfiles.STUDENT;
      if (u.includes('tritd') || u.includes('gv002')) matched = roleProfiles.LECTURER_TRI;
      else if (u.includes('huydq') || u.includes('gv003')) matched = roleProfiles.LECTURER_HUY;
      else if (u.includes('tuannv') || u.includes('gv004')) matched = roleProfiles.LECTURER_TUAN;
      else if (u.includes('hungnq') || u.includes('gv007')) matched = roleProfiles.LECTURER_HUNG;
      else if (u.includes('dung') || u.includes('gv001')) matched = roleProfiles.LECTURER;
      else if (u.includes('thuky') || u.includes('tk001')) matched = roleProfiles.FACULTY_SECRETARY;
      else if (u.includes('khoa') || u.includes('lead001')) matched = roleProfiles.FACULTY_LEADER;
      else if (u.includes('qlkh') || u.includes('qlkh001')) matched = roleProfiles.QLKHCN;
      else if (u.includes('giangdoc') || u.includes('bgd') || u.includes('bgd001')) matched = roleProfiles.BOARD;
      else if (u.includes('tckt') || u.includes('tckt001') || u.includes('taichinh')) matched = roleProfiles.FINANCE;
      else if (u.includes('ctsv') || u.includes('ctsv001')) matched = roleProfiles.STUDENT_AFFAIRS;
      else if (u.includes('admin')) matched = roleProfiles.ADMIN;
      else if (u.includes('sv001') || u.includes('an') || u.includes('b23dccn001') || u.includes('sv002') || u.includes('sv003')) matched = roleProfiles.STUDENT;

      handleAuthSuccess({
        access_token: 'mock_token_' + Date.now(),
        user: matched,
      });
    }
  };

  const ssoLogin = async (provider: 'outlook' | 'gmail') => {
    try {
      const res = await api.post('/auth/sso', { provider });
      handleAuthSuccess(res.data);
    } catch (err) {
      // Miền Bắc Outlook mặc định Sinh viên Nguyễn Văn An / Miền Nam Gmail
      handleAuthSuccess({
        access_token: 'mock_sso_token_' + Date.now(),
        user: provider === 'outlook' ? roleProfiles.STUDENT : roleProfiles.LECTURER,
      });
    }
  };

  const quickLogin = async (roleCode: string) => {
    try {
      const res = await api.post('/auth/quick-role', { roleCode });
      handleAuthSuccess(res.data);
    } catch (err) {
      handleAuthSuccess({
        access_token: 'mock_role_token_' + Date.now(),
        user: roleProfiles[roleCode] || roleProfiles.STUDENT,
      });
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('srms_access_token');
    localStorage.removeItem('srms_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, ssoLogin, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

