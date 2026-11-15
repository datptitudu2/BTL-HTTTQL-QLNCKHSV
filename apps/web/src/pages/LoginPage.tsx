import React, { useState } from 'react';
import {
  Button,
  Input,
  Typography,
  Form,
  message,
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
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

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

  // Danh mục tài khoản chuẩn hóa theo các vai trò PTIT
  const quickAccounts = [
    { role: 'Sinh viên', username: 'an.nv', code: 'STUDENT', desc: 'Nguyễn Văn An (Chủ nhiệm SV-2026-CNTT1-001)' },
    { role: 'SV mới (chưa ĐK)', username: 'sv.moi', code: 'STUDENT', desc: 'Lê Hoàng Nam (B23DCCN099 - chưa có đề tài để test Đăng ký mới)' },
    { role: 'GVHD (CNTT)', username: 'dungnq', code: 'LECTURER', desc: 'TS. Ngô Quốc Dũng - Bộ môn CNPM, Khoa CNTT 1' },
    { role: 'GVHD (DL)', username: 'hungvt', code: 'LECTURER', desc: 'TS. Vũ Trọng Hùng - Khoa CNTT 1' },
    { role: 'GVHD (ĐPT)', username: 'tritd', code: 'LECTURER', desc: 'TS. Trần Đình Trí - Khoa Đa phương tiện' },
    { role: 'GVHD (QTKD)', username: 'huydq', code: 'LECTURER', desc: 'TS. Đinh Quang Huy - Khoa Quản trị kinh doanh' },
    { role: 'GVHD (ATTT)', username: 'tuannv', code: 'LECTURER', desc: 'TS. Nguyễn Văn Tuấn - Khoa An toàn thông tin' },
    { role: 'GV Hội đồng', username: 'hungnq', code: 'LECTURER', desc: 'TS. Nguyễn Quang Hưng - GV được mời tham dự Hội đồng Nghiệm thu 04 (không HD đề tài)' },
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
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* CỘT TRÁI - ẢNH TÒA NHÀ TRỤ SỞ PTIT PHỦ ĐẦY KHUNG DỌC */}
      <div
        style={{
          flex: 1.15,
          height: '100%',
          backgroundColor: '#6C0403',
          backgroundImage: 'url(/ptit_building.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* CỘT PHẢI - KHUNG ĐĂNG NHẬP TÀI KHOẢN ĐỊNH DANH PTIT */}
      <div
        style={{
          flex: 1,
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '28px 36px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 460 }}>
          {/* Logo PTIT & Tiêu đề */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img
              src="/ptit_logo.png"
              alt="Logo Học viện PTIT"
              style={{
                height: 68,
                maxWidth: '100%',
                objectFit: 'contain',
                marginBottom: 10,
              }}
            />
            <Title level={4} style={{ margin: 0, color: '#C62828', fontWeight: 800, fontSize: 18, lineHeight: 1.35 }}>
              Hệ thống Quản lý Đề tài NCKH Sinh viên (SRMS)
            </Title>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4, fontWeight: 500 }}>
              Chuyển đổi số KH&CN • Học viện Công nghệ Bưu chính Viễn thông
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onDirectLogin}
            initialValues={{ username: 'an.nv', password: 'ptit@123', remember: true }}
          >
            <Form.Item
              name="username"
              label="Tên đăng nhập / Mã SV / Email PTIT"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập hoặc mã SV' }]}
            >
              <Input
                size="large"
                prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Ví dụ: an.nv, sv.moi hoặc an.nv@stu.ptit.edu.vn"
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
              <a
                style={{ fontSize: 13, color: '#C62828' }}
                onClick={() => message.info('Vui lòng liên hệ Phòng QLKH&CN hoặc quản trị viên S-Link để cấp lại mật khẩu.')}
              >
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
                height: 44,
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Đăng nhập hệ thống SRMS
            </Button>
          </Form>

          {/* Danh mục tài khoản demo theo vai trò */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f0f0f0' }}>
            <div
              style={{
                fontSize: 12,
                color: '#8c8c8c',
                marginBottom: 8,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <SafetyCertificateOutlined style={{ color: '#C62828' }} /> Tài khoản định danh theo vai trò PTIT (Bấm để điền nhanh):
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
      </div>
    </div>
  );
};
