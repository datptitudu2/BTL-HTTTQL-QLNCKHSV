import React, { useState } from 'react';
import {
  Button,
  Input,
  Typography,
  Form,
  message,
  Tabs,
  Checkbox,
  Tag,
  Tooltip,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LockOutlined,
  UserOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const { login, ssoLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSso = async (provider: 'outlook' | 'gmail') => {
    try {
      setLoading(true);
      await ssoLogin(provider);
      message.success(
        `Đăng nhập SSO PTIT S-Link (${provider === 'outlook' ? 'Microsoft Outlook' : 'Google Gmail'}) thành công!`,
      );
      navigate('/home');
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Đăng nhập SSO thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onDirectLogin = async (values: any) => {
    try {
      setLoading(true);
      await login(values.username, values.password);
      message.success('Đăng nhập hệ thống SRMS thành công!');
      navigate('/home');
    } catch (err: any) {
      message.error(err.response?.data?.detail || 'Thông tin tài khoản hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  // Danh mục tài khoản chuẩn hóa theo 9 vai trò PTIT (kèm nhiều GVHD theo Khoa)
  const quickAccounts = [
    { role: 'Sinh viên', username: 'an.nv', code: 'STUDENT', desc: 'Nguyễn Văn An (Chủ nhiệm đề tài D23CQCN01-B)' },
    { role: 'GVHD (CNTT)', username: 'dungnq', code: 'LECTURER', desc: 'TS. Ngô Quốc Dũng - Bộ môn CNPM, Khoa CNTT 1' },
    { role: 'GVHD (ĐPT)', username: 'tritd', code: 'LECTURER', desc: 'TS. Trần Đình Trí - Khoa Đa phương tiện' },
    { role: 'GVHD (QTKD)', username: 'huydq', code: 'LECTURER', desc: 'TS. Đinh Quang Huy - Khoa Quản trị kinh doanh' },
    { role: 'GVHD (ATTT)', username: 'tuannv', code: 'LECTURER', desc: 'TS. Nguyễn Văn Tuấn - Khoa An toàn thông tin' },
    { role: 'Thư ký Khoa', username: 'thukycntt1', code: 'FACULTY_SECRETARY', desc: 'ThS. Nguyễn Thị Lan (Khoa CNTT 1)' },
    { role: 'Trưởng Khoa', username: 'khoacntt1', code: 'FACULTY_LEADER', desc: 'PGS.TS. Trần Đình Quế (Trưởng Khoa CNTT 1)' },
    { role: 'Phòng QLKH&CN', username: 'qlkhcn', code: 'QLKHCN', desc: 'ThS. Phạm Văn Hùng (Chuyên viên Phòng QLKH&CN)' },
    { role: 'Ban Giám Đốc', username: 'bgiangdoc', code: 'BOARD', desc: 'PGS.TS. Đặng Hoài Bắc (Giám đốc Học viện)' },
    { role: 'Phòng TCKT', username: 'tckt', code: 'FINANCE', desc: 'CN. Lê Thị Mai (Kế toán viên Phòng TCKT)' },
    { role: 'Phòng CT&CTSV', username: 'ctsv', code: 'STUDENT_AFFAIRS', desc: 'ThS. Bùi Văn Toàn (Chuyên viên Phòng CT&CTSV)' },
    { role: 'Quản trị viên', username: 'admin', code: 'ADMIN', desc: 'Quản trị hệ thống toàn quyền' },
  ];

  const handleFillAccount = (acc: any) => {
    form.setFieldsValue({
      username: acc.username,
      password: 'ptit@123',
    });
    message.info(`Đã điền tài khoản: ${acc.role} (${acc.username})`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#F0F2F5' }}>
      {/* CỘT TRÁI - ẢNH TOÀ NHÀ TRỤ SỞ HỌC VIỆN PTIT NỀN ĐỎ CHUẨN XÁC THEO ẢNH 3 BẠN GỬI */}
      <div
        style={{
          flex: 1.15,
          backgroundColor: '#6C0403',
          backgroundImage: 'url(/ptit_building.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40px',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 48px',
          color: '#ffffff',
          boxShadow: 'inset 0 0 0 1000px rgba(0, 0, 0, 0.04)',
        }}
      />

      {/* CỘT PHẢI - KHUNG ĐĂNG NHẬP CHÍNH THỨC S-LINK PTIT */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 36px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 460 }}>
          {/* Logo PTIT chính thức & Tiêu đề Hệ thống SRMS */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img
              src="/ptit_logo.png"
              alt="Logo Học viện PTIT"
              style={{
                height: 72,
                maxWidth: '100%',
                objectFit: 'contain',
                marginBottom: 12,
              }}
            />
            <Title level={4} style={{ margin: 0, color: '#C62828', fontWeight: 800, fontSize: 18, lineHeight: 1.35 }}>
              Hệ thống Quản lý Đề tài NCKH Sinh viên (SRMS)
            </Title>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4, fontWeight: 500 }}>
              Chuyển đổi số KH&CN • Học viện Công nghệ Bưu chính Viễn thông
            </Text>
          </div>

          {/* TABS ĐĂNG NHẬP CHÍNH THỨC */}
          <Tabs
            defaultActiveKey="sso"
            centered
            items={[
              {
                key: 'sso',
                label: <span style={{ fontWeight: 600 }}>Cổng SSO S-Link</span>,
                children: (
                  <div style={{ paddingTop: 10 }}>
                    <div style={{ textAlign: 'center', marginBottom: 18 }}>
                      <Text style={{ fontSize: 14, color: '#595959', fontWeight: 500 }}>
                        Đăng nhập bằng tài khoản S-Link của bạn để tiếp tục
                      </Text>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Nút 1: PTIT Microsoft Outlook */}
                      <Button
                        size="large"
                        loading={loading}
                        onClick={() => handleSso('outlook')}
                        style={{
                          height: 50,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 12,
                          border: '1px solid #d9d9d9',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          fontSize: 15,
                          fontWeight: 600,
                          color: '#262626',
                        }}
                      >
                        {/* Icon Microsoft */}
                        <svg width="20" height="20" viewBox="0 0 21 21">
                          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                        </svg>
                        <span>PTIT Microsoft Outlook</span>
                      </Button>

                      {/* Nút 2: PTIT Google Gmail */}
                      <Button
                        size="large"
                        loading={loading}
                        onClick={() => handleSso('gmail')}
                        style={{
                          height: 50,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 12,
                          border: '1px solid #d9d9d9',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          fontSize: 15,
                          fontWeight: 600,
                          color: '#262626',
                        }}
                      >
                        {/* Icon Google */}
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>PTIT Google Gmail</span>
                      </Button>
                    </div>

                    <div style={{ marginTop: 22, fontSize: 13, color: '#8c8c8c', lineHeight: 1.6 }}>
                      <div>• CB/GV/SV Học viện miền Bắc sử dụng tài khoản <b style={{ color: '#C62828' }}>Microsoft Outlook</b>.</div>
                      <div>• CB/GV/SV Học viện miền Nam sử dụng tài khoản <b style={{ color: '#1677ff' }}>Google Gmail</b>.</div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'local',
                label: <span style={{ fontWeight: 600 }}>Tài khoản Định danh PTIT</span>,
                children: (
                  <div style={{ paddingTop: 6 }}>
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={onDirectLogin}
                      initialValues={{ username: 'an.nv', password: 'ptit@123', remember: true }}
                    >
                      <Form.Item
                        name="username"
                        label="Tên đăng nhập / Mã SV / Email"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập hoặc mã SV' }]}
                      >
                        <Input
                          size="large"
                          prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                          placeholder="Ví dụ: an.nv hoặc B23DCCC001"
                        />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                      >
                        <Input.Password
                          size="large"
                          prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                          placeholder="Nhập mật khẩu"
                        />
                      </Form.Item>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                          <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                        </Form.Item>
                        <a style={{ fontSize: 13, color: '#C62828' }} onClick={() => message.info('Vui lòng liên hệ Phòng QLKH&CN hoặc quản trị viên S-Link để cấp lại mật khẩu.')}>
                          Quên mật khẩu?
                        </a>
                      </div>

                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                        icon={<LoginOutlined />}
                        style={{
                          backgroundColor: '#C62828',
                          borderColor: '#C62828',
                          height: 46,
                          fontWeight: 600,
                          fontSize: 15,
                        }}
                      >
                        Đăng nhập hệ thống SRMS
                      </Button>
                    </Form>

                    {/* Danh mục tài khoản theo đúng 9 vai trò trong sơ đồ BFD & DFD */}
                    <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <SafetyCertificateOutlined style={{ color: '#C62828' }} /> Danh mục tài khoản định danh theo 9 vai trò PTIT (Bấm để điền nhanh):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {quickAccounts.map((acc) => (
                          <Tooltip key={acc.username} title={acc.desc}>
                            <Tag
                              color={acc.code === 'QLKHCN' || acc.code === 'ADMIN' ? 'red' : 'blue'}
                              style={{ cursor: 'pointer', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}
                              onClick={() => handleFillAccount(acc)}
                            >
                              {acc.role}: <b>{acc.username}</b>
                            </Tag>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};