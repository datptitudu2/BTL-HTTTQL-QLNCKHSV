import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Space, Popover, List, Tag } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  BellOutlined,
  LogoutOutlined,
  FolderOpenOutlined,
  PlusCircleOutlined,
  FieldTimeOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  TrophyOutlined,
  AuditOutlined,
  RobotOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PtitSpinner } from '../components/common/PtitSpinner';
import { notificationService, AppNotification } from '../services/notificationService';

const { Header, Sider, Content } = Layout;

export const SLinkLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setTabLoading(true);
    const timer = setTimeout(() => {
      setTabLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const roleCode = user?.roleCode || 'STUDENT';
  const isStudentOrAdmin = roleCode === 'STUDENT' || roleCode === 'ADMIN';

  const getUserInitial = (name?: string) => {
    if (!name) return 'Đ';
    const parts = name.trim().split(/\s+/);
    const lastName = parts[parts.length - 1];
    return lastName.charAt(0).toUpperCase();
  };

  useEffect(() => {
    let isMounted = true;
    const fetchNotifs = async () => {
      try {
        const data = await notificationService.getNotifications(roleCode);
        if (isMounted) setNotifications(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifs();
    return () => {
      isMounted = false;
    };
  }, [roleCode]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (item: AppNotification) => {
    try {
      await notificationService.markAsRead(item.id, roleCode);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
      );
    } catch (e) {}
    if (item.targetUrl) {
      navigate(item.targetUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(roleCode);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const srmsChildren = [
    { key: '/home', icon: <HomeOutlined />, label: 'Trang chủ' },
    { key: '/calendar', icon: <CalendarOutlined />, label: 'Lịch & Sự kiện' },
    { key: '/projects', icon: <FolderOpenOutlined />, label: 'Toàn bộ đề tài NCKH' },
    {
      key: '/projects?tab=my',
      icon: roleCode === 'LECTURER' ? <AuditOutlined /> : <UserOutlined />,
      label:
        roleCode === 'LECTURER'
          ? 'Đề tài hướng dẫn (GVHD)'
          : roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY'
          ? 'Đề tài thuộc Khoa'
          : roleCode === 'QLKHCN'
          ? 'Đề tài thẩm định'
          : 'Đề tài của tôi',
    },
    ...(isStudentOrAdmin ? [{ key: '/projects/new', icon: <PlusCircleOutlined />, label: 'Đăng ký đề tài mới' }] : []),
    { key: '/outlines', icon: <FileDoneOutlined />, label: 'Quản lý Đề cương (Mẫu 2)' },
    { key: '/progress', icon: <ClockCircleOutlined />, label: 'Tiến độ & Sinh hoạt KH' },
    { key: '/acceptance', icon: <CheckCircleOutlined />, label: 'Nghiệm thu & Đánh giá' },
    { key: '/budgets', icon: <DollarCircleOutlined />, label: 'Kinh phí & Quyết toán' },
    { key: '/awards', icon: <TrophyOutlined />, label: 'Khen thưởng & Quyền lợi' },
  ];

  const menuItems = [
    {
      key: 'grp_srms',
      label: 'QUẢN LÝ ĐỀ TÀI NCKH (SRMS)',
      type: 'group' as const,
      children: srmsChildren,
    },
    {
      key: 'grp_system',
      label: 'HỒ SƠ & VĂN BẢN QUY ĐỊNH',
      type: 'group' as const,
      children: [
        { key: '/periods', icon: <FieldTimeOutlined />, label: 'Đợt NCKH & Mốc hạn' },
        { key: '/forms', icon: <FileTextOutlined />, label: 'Biểu mẫu chuẩn QĐ 521' },
        { key: '/gwdu', icon: <FilePdfOutlined />, label: 'Tài liệu số GWDU' },
        { key: '/regulations', icon: <BookOutlined />, label: 'Quy định 521 & ISO' },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const userMenuItems = [
    {
      key: 'info',
      label: (
        <div style={{ padding: '6px 8px' }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.fullName || 'Nguyễn Văn An'}</div>
          <div style={{ fontSize: 12, color: '#C62828', fontWeight: 600 }}>{user?.roleName || 'Sinh viên'}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user?.email || 'an.nv@stu.ptit.edu.vn'}</div>
        </div>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F7F7F8' }}>
      {/* HEADER S-LINK CHUẨN XÁC 100% THEO ẢNH */}
      <Header
        className="slink-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 60,
        }}
      >
        {/* LOGO S-LINK TRÁI */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => navigate('/home')}
        >
          <img
            src="/ptit_logo.png"
            alt="PTIT"
            style={{
              height: 36,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
          <span style={{ fontSize: 20, fontWeight: 700, color: '#C62828', letterSpacing: '-0.3px' }}>
            S-Link
          </span>
          <span
            style={{
              fontSize: 13,
              color: '#8c8c8c',
              marginLeft: 8,
              paddingLeft: 12,
              borderLeft: '1px solid #e8e8e8',
            }}
          >
            Cổng Thông tin Quản lý Đề tài NCKH Sinh viên (SRMS)
          </span>
        </div>

        {/* HEADER PHẢI: TÀI LIỆU SỐ GWDU, APPS, THÔNG BÁO & THÔNG TIN TÀI KHOẢN */}
        <Space size={16} align="center">
          {/* Nút truy cập nhanh Cổng Tài liệu số GWDU PTIT */}
          <Button
            type="text"
            style={{
              color: '#C62828',
              backgroundColor: '#FFF0ED',
              border: '1px solid #FADCD5',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13,
            }}
            icon={<FilePdfOutlined />}
            onClick={() => navigate('/gwdu')}
          >
            Tài liệu số GWDU
          </Button>

          {/* Huy hiệu vai trò chính thức của phiên đăng nhập */}
          <Tag color="red" style={{ fontWeight: 600, padding: '4px 12px', borderRadius: 12, margin: 0, fontSize: 12 }}>
            {user?.roleName || 'Sinh viên'}
          </Tag>

          <Button type="text" shape="circle" icon={<AppstoreOutlined style={{ fontSize: 18, color: '#595959' }} />} />

          {/* Chuông thông báo kết nối ERD Kho D9 & DFD 8.0 */}
          <Popover
            placement="bottomRight"
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  Thông báo nhắc việc hệ thống ({notifications.length})
                </span>
                {unreadCount > 0 && (
                  <Button
                    type="link"
                    size="small"
                    style={{ fontSize: 12, padding: 0, color: '#C62828', height: 'auto' }}
                    onClick={handleMarkAllRead}
                  >
                    Đánh dấu đã đọc tất cả
                  </Button>
                )}
              </div>
            }
            content={
              <div style={{ width: 380, maxHeight: 420, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#8c8c8c' }}>
                    Không có thông báo mới
                  </div>
                ) : (
                  <List
                    size="small"
                    dataSource={notifications}
                    renderItem={(item) => {
                      const tagMap: Record<string, { color: string; label: string }> = {
                        DEADLINE: { color: 'warning', label: 'Mốc hạn' },
                        SEMINAR: { color: 'processing', label: 'Sinh hoạt KH' },
                        ACCEPTANCE: { color: 'error', label: 'Hội đồng' },
                        BONUS: { color: 'purple', label: 'Khen thưởng / ĐRL' },
                        GENERAL: { color: 'default', label: 'Thông báo' },
                      };
                      const tagInfo = tagMap[item.type] || tagMap.GENERAL;

                      return (
                        <List.Item
                          style={{
                            padding: '10px 8px',
                            cursor: 'pointer',
                            backgroundColor: item.isRead ? '#FFFFFF' : '#FFF7E6',
                            borderBottom: '1px solid #F0F0F0',
                            borderRadius: 6,
                            marginBottom: 4,
                            transition: 'all 0.2s',
                          }}
                          onClick={() => handleNotificationClick(item)}
                        >
                          <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                              <Space size={4} wrap>
                                {item.urgent && <Tag color="red" style={{ margin: 0, fontSize: 11, padding: '0 4px' }}>Khẩn</Tag>}
                                <Tag color={tagInfo.color} style={{ margin: 0, fontSize: 11, padding: '0 4px' }}>{tagInfo.label}</Tag>
                                {!item.isRead && (
                                  <Badge status="error" title="Chưa đọc" />
                                )}
                              </Space>
                              <span style={{ fontSize: 11, color: '#8c8c8c', whiteSpace: 'nowrap' }}>{item.time}</span>
                            </div>
                            <div style={{ fontWeight: item.isRead ? 500 : 700, fontSize: 13, color: '#262626', marginTop: 4 }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: 12, color: '#595959', marginTop: 2, lineHeight: 1.4 }}>
                              {item.content}
                            </div>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                )}
              </div>
            }
            trigger="click"
          >
            <Badge count={unreadCount} overflowCount={99} size="small" style={{ backgroundColor: '#C62828' }}>
              <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18, color: '#595959' }} />} />
            </Badge>
          </Popover>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Avatar
                style={{
                  backgroundColor: '#8c8c8c',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {getUserInitial(user?.fullName)}
              </Avatar>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#262626' }}>
                  {user?.fullName || 'Nguyễn Văn An'}
                </div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{user?.roleName || 'Sinh viên'}</div>
              </div>
            </div>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        {/* SIDEBAR S-LINK */}
        <Sider
          width={240}
          collapsible
          collapsed={collapsed}
          onCollapse={(val) => setCollapsed(val)}
          style={{
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #EDEDEE',
            height: 'calc(100vh - 60px)',
            position: 'sticky',
            top: 60,
            overflowY: 'auto',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[
              location.pathname === '/projects' && location.search.includes('tab=my')
                ? '/projects?tab=my'
                : location.pathname,
            ]}
            defaultOpenKeys={['grp_srms', 'grp_system']}
            style={{ borderRight: 0, padding: '12px 0' }}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>

        {/* NỘI DUNG CHÍNH CÓ HIỆU ỨNG VÒNG TRÒN CHẤM ĐỎ XOAY TRÒN MỖI LẦN ẤN TAB */}
        <Content style={{ padding: '20px 24px', minHeight: 'calc(100vh - 60px)', overflowX: 'hidden' }}>
          {tabLoading ? (
            <PtitSpinner tip="Đang tải dữ liệu phân hệ..." minHeight="50vh" />
          ) : (
            <div className="ptit-page-fade">{children}</div>
          )}
        </Content>
      </Layout>

      {/* CHATBOT ROBOT LINH VẬT S-LINK */}
      <Popover
        open={chatbotOpen}
        onOpenChange={(v) => setChatbotOpen(v)}
        placement="topLeft"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1890FF', fontWeight: 700 }}>
            <RobotOutlined />
            <span>Trợ lý ảo NCKH S-Link PTIT</span>
          </div>
        }
        content={
          <div style={{ width: 280, fontSize: 13 }}>
            <p style={{ margin: '0 0 8px' }}>
              Xin chào <b>{user?.fullName || 'bạn'}</b>! Tôi có thể hỗ trợ giải đáp quy trình QĐ 521/QĐ-HV:
            </p>
            <ul style={{ paddingLeft: 16, margin: 0, lineHeight: 1.6, color: '#595959' }}>
              <li>Hạn nộp thuyết minh Đề cương (Mẫu 2)</li>
              <li>Định mức hướng dẫn: tối đa 2 đề tài/GV</li>
              <li>Quy mô nhóm: tối đa 5 sinh viên/đề tài</li>
              <li>Thang điểm nghiệm thu Mẫu 4.1 (100 điểm)</li>
            </ul>
          </div>
        }
        trigger="click"
      >
        <div className="slink-chatbot-btn" title="Trợ lý ảo NCKH S-Link">
          <RobotOutlined />
        </div>
      </Popover>
    </Layout>
  );
};
