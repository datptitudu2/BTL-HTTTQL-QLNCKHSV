import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Space,
  Modal,
  Checkbox,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Alert,
  Radio,
  Divider,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SettingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  BookOutlined,
  UserOutlined,
  SolutionOutlined,
  DollarOutlined,
  TeamOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { scheduleService, CalendarEvent } from '../services/scheduleService';

const { Title } = Typography;

export const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';
  const roleName = user?.roleName || 'Người dùng';
  const isLeadershipOrAdmin = roleCode === 'ADMIN' || roleCode === 'QLKHCN' || roleCode === 'BOARD';

  const [selectedView, setSelectedView] = useState<'week' | 'day'>('week');
  const [activeModalEvent, setActiveModalEvent] = useState<CalendarEvent | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Chế độ xem: 'my_schedule' (lịch theo phân quyền cá nhân/vai trò) hoặc 'all' (toàn trường)
  const [calendarScope, setCalendarScope] = useState<'my_schedule' | 'all'>('my_schedule');

  // Bộ lọc loại sự kiện (100% nghiệp vụ NCKH theo QĐ 521 & phân quyền DFD 8.0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Mốc hạn NCKH',
    'Hội đồng thẩm định',
    'Sinh hoạt KH',
    'Làm việc với GVHD',
    'Họp nhóm NCKH',
    'Tác nghiệp CTSV',
    'Quyết toán TCKT',
    'Giao ban Quản lý',
  ]);

  // Màu sắc chuẩn theo thiết kế S-Link và vai trò NCKH
  const categoryConfig: Record<
    string,
    { color: string; bg: string; border: string; label: string; icon: React.ReactNode }
  > = {
    'Mốc hạn NCKH': {
      color: '#D48806',
      bg: '#FFFBE6',
      border: '#FFE58F',
      label: 'Mốc hạn NCKH (QĐ 521)',
      icon: <ClockCircleOutlined />,
    },
    'Hội đồng thẩm định': {
      color: '#C62828',
      bg: '#FFF1F0',
      border: '#FFA39E',
      label: 'Hội đồng thẩm định & Nghiệm thu',
      icon: <CheckCircleOutlined />,
    },
    'Sinh hoạt KH': {
      color: '#722ED1',
      bg: '#F9F0FF',
      border: '#D3ADF7',
      label: 'Sinh hoạt Khoa học Cấp Khoa',
      icon: <BookOutlined />,
    },
    'Làm việc với GVHD': {
      color: '#096DD9',
      bg: '#E6F7FF',
      border: '#91D5FF',
      label: 'Làm việc với GVHD',
      icon: <UserOutlined />,
    },
    'Họp nhóm NCKH': {
      color: '#389E0D',
      bg: '#F6FFED',
      border: '#B7EB8F',
      label: 'Họp nhóm NCKH Sinh viên',
      icon: <TeamOutlined />,
    },
    'Tác nghiệp CTSV': {
      color: '#EB2F96',
      bg: '#FFF0F6',
      border: '#FFADD2',
      label: 'Tác nghiệp Phòng CT&CTSV',
      icon: <SolutionOutlined />,
    },
    'Quyết toán TCKT': {
      color: '#13C2C2',
      bg: '#E6FFFB',
      border: '#87E8DE',
      label: 'Quyết toán Phòng TCKT',
      icon: <DollarOutlined />,
    },
    'Giao ban Quản lý': {
      color: '#FA8C16',
      bg: '#FFF7E6',
      border: '#FFD591',
      label: 'Giao ban Quản lý KHCN & BGĐ',
      icon: <ApartmentOutlined />,
    },
  };

  // Danh sách sự kiện kết nối ERD Kho D8/D9 & DFD 8.0 (không còn mock data cứng)
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      try {
        const data = await scheduleService.getEvents(roleCode, calendarScope);
        if (isMounted) setEvents(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, [roleCode, calendarScope]);

  const daysHeader = [
    { label: '09 T2', fullDate: '09/11/2026' },
    { label: '10 T3', fullDate: '10/11/2026' },
    { label: '11 T4', fullDate: '11/11/2026' },
    { label: '12 T5', fullDate: '12/11/2026', isToday: true },
    { label: '13 T6', fullDate: '13/11/2026' },
    { label: '14 T7', fullDate: '14/11/2026' },
    { label: '15 CN', fullDate: '15/11/2026' },
  ];

  const timeRows = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const handleAddEvent = async (values: any) => {
    let targetRoles = [roleCode];
    let scopeLevel: CalendarEvent['scopeLevel'] = 'Nhóm đề tài';
    let broadcastBy = `${roleName} - ${user?.fullName || 'Người dùng'}`;

    if (isLeadershipOrAdmin) {
      if (values.scope === 'ALL') {
        targetRoles = ['ALL'];
        scopeLevel = 'Toàn Học viện';
        broadcastBy = `${roleName} ban hành toàn Học viện`;
      } else if (values.scope === 'FACULTY') {
        targetRoles = ['FACULTY_LEADER', 'FACULTY_SECRETARY', 'LECTURER', 'STUDENT'];
        scopeLevel = 'Khoa CNTT1';
        broadcastBy = `Khoa CNTT1 (${roleName})`;
      } else {
        targetRoles = ['QLKHCN', 'BOARD'];
        scopeLevel = 'Phòng QLKH&CN';
      }
    } else if (roleCode === 'STUDENT_AFFAIRS') {
      targetRoles = ['STUDENT_AFFAIRS'];
      scopeLevel = 'Phòng CT&CTSV';
    } else if (roleCode === 'FINANCE') {
      targetRoles = ['FINANCE'];
      scopeLevel = 'Phòng Tài chính Kế toán';
    } else if (roleCode === 'STUDENT' || roleCode === 'LECTURER') {
      targetRoles = ['STUDENT', 'LECTURER'];
      scopeLevel = 'Nhóm đề tài';
    }

    const newEv: Omit<CalendarEvent, 'id'> = {
      title: values.title,
      type: values.type || 'Họp nhóm NCKH',
      startDate: values.date?.format('DD/MM/YYYY') || '12/11/2026',
      startTime: values.startTime?.format('HH:mm') || '14:00',
      endDate: values.date?.format('DD/MM/YYYY') || '12/11/2026',
      endTime: values.endTime?.format('HH:mm') || '16:00',
      location: values.location || 'Học viện PTIT',
      regulatoryBasis:
        values.type === 'Mốc hạn NCKH'
          ? 'Bắt buộc theo Kế hoạch QĐ 521'
          : 'Kế hoạch tác nghiệp thực hiện đề tài NCKH SV',
      participants: values.participants || `${roleName} & Các cá nhân liên quan`,
      projectId: values.projectId || 'SV-2026-CNTT1-001',
      note: values.note || '',
      dayIndex: values.date ? (values.date.day() + 6) % 7 : 3, // mặc định tuần này
      startHour: values.startTime ? values.startTime.hour() : 14,
      durationHours: 2,
      targetRoles,
      scopeLevel,
      broadcastBy,
    };

    try {
      const created = await scheduleService.createEvent(newEv);
      setEvents((prev) => [created, ...prev]);
      message.success(
        values.scope === 'ALL'
          ? 'Đã ban hành sự kiện mốc hạn NCKH toàn Học viện thành công (áp xuống toàn trường)!'
          : 'Đã lưu lịch làm việc NCKH thành công vào hệ thống!',
      );
      setAddModalVisible(false);
      form.resetFields();
    } catch (e) {
      message.error('Lỗi khi lưu lịch làm việc');
    }
  };

  // LOGIC PHÂN QUYỀN LỊCH THEO VAI TRÒ (DFD 8.0 & KHO D8 ERD)
  const filteredEvents = events.filter((e) => {
    // 1. Lọc theo checkbox phân loại sự kiện
    if (!selectedCategories.includes(e.type)) return false;

    // 2. Nếu người dùng chọn xem toàn bộ sự kiện Học viện
    if (calendarScope === 'all') return true;

    // 3. Nếu ở chế độ "Lịch của tôi" (mặc định chuẩn nghiệp vụ cá nhân):
    // - Lịch do Ban Giám Đốc/P.QLKHCN áp xuống toàn trường ('ALL') -> Luôn hiển thị
    if (e.targetRoles.includes('ALL')) return true;

    // - Lịch trực tiếp gắn với vai trò đăng nhập hiện tại
    if (e.targetRoles.includes(roleCode)) return true;

    // - Với Ban Chủ nhiệm Khoa: xem thêm lịch của Khoa CNTT1
    if (
      (roleCode === 'FACULTY_LEADER' || roleCode === 'FACULTY_SECRETARY') &&
      e.scopeLevel === 'Khoa CNTT1'
    ) {
      return true;
    }

    // - Với Admin & Lãnh đạo / QLKHCN: xem được các hoạt động chuyên môn của Khoa & toàn Học viện
    if (
      isLeadershipOrAdmin &&
      (e.scopeLevel === 'Toàn Học viện' || e.scopeLevel === 'Phòng QLKH&CN' || e.scopeLevel === 'Khoa CNTT1')
    ) {
      return true;
    }

    return false;
  });

  return (
    <div>
      {/* BANNER PHÂN QUYỀN LỊCH THEO VAI TRÒ (ALIGNED WITH DFD 8.0 & QĐ 521) */}
      <Alert
        style={{
          marginBottom: 16,
          borderRadius: 8,
          border: '1px solid #FFCCC7',
          backgroundColor: '#FFF2F0',
        }}
        message={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <Space size={8}>
                <ApartmentOutlined style={{ color: '#C62828', fontSize: 16 }} />
                <span style={{ fontWeight: 700, color: '#C62828', fontSize: 14 }}>
                  Lịch NCKH cá nhân hóa theo vai trò: {roleName} ({user?.fullName || 'Người dùng'})
                </span>
                <Tag color={isLeadershipOrAdmin ? 'red' : 'blue'} style={{ borderRadius: 10 }}>
                  {roleCode}
                </Tag>
              </Space>
              <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                {calendarScope === 'my_schedule'
                  ? `Đang hiển thị lịch chuyên môn tác nghiệp của vai trò "${roleName}" + Các mốc hạn do P.QLKHCN/Ban Giám Đốc ban hành toàn trường.`
                  : 'Đang hiển thị toàn bộ lịch làm việc và mốc hạn NCKH của tất cả phòng ban, khoa và nhóm đề tài trong Học viện.'}
              </div>
            </div>

            <Radio.Group
              value={calendarScope}
              onChange={(e) => setCalendarScope(e.target.value)}
              buttonStyle="solid"
              size="middle"
            >
              <Radio.Button value="my_schedule" style={{ fontWeight: 600 }}>
                Lịch của tôi ({roleName})
              </Radio.Button>
              <Radio.Button value="all" style={{ fontWeight: 600 }}>
                Toàn bộ lịch sự kiện Học viện
              </Radio.Button>
            </Radio.Group>
          </div>
        }
        type="warning"
        showIcon={false}
      />

      {/* THANH ĐIỀU HƯỚNG LỊCH CHUẨN S-LINK */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          backgroundColor: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: 8,
          border: '1px solid #EDEDEE',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Space size={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
              Lịch & Sự kiện NCKH
            </Title>
            <Space size={2} style={{ marginLeft: 6 }}>
              <Button size="small" type="text" icon={<AppstoreOutlined style={{ color: '#C62828' }} />} />
              <Button size="small" type="text" icon={<BarsOutlined />} />
            </Space>
          </div>

          <Space size={8}>
            <Button size="middle" style={{ borderRadius: 4 }}>
              Hôm nay
            </Button>
            <Button size="middle" icon={<LeftOutlined />} />
            <Button size="middle" icon={<RightOutlined />} />
            <span style={{ fontWeight: 600, fontSize: 14, color: '#262626', marginLeft: 6 }}>
              09/11/2026 - 15/11/2026
            </span>
          </Space>
        </Space>

        <Space size={12}>
          <div
            style={{
              display: 'inline-flex',
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Button
              type={selectedView === 'week' ? 'primary' : 'text'}
              style={selectedView === 'week' ? { backgroundColor: '#C62828', borderColor: '#C62828' } : {}}
              onClick={() => setSelectedView('week')}
            >
              Tuần
            </Button>
            <Button
              type={selectedView === 'day' ? 'primary' : 'text'}
              style={selectedView === 'day' ? { backgroundColor: '#C62828', borderColor: '#C62828' } : {}}
              onClick={() => setSelectedView('day')}
            >
              Ngày
            </Button>
          </div>

          <Button
            type="primary"
            style={{
              backgroundColor: '#C62828',
              borderColor: '#C62828',
              borderRadius: 4,
              fontWeight: 500,
            }}
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            {isLeadershipOrAdmin ? 'Thêm / Ban hành lịch NCKH' : 'Thêm lịch làm việc NCKH'}
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* KHỐI LƯỚI LỊCH BIỂU (TIMETABLE GRID) */}
        <Col xs={24} lg={18}>
          <Card
            bodyStyle={{ padding: 0 }}
            style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #EDEDEE' }}
          >
            {/* Hàng Tiêu Đề Ngày Trong Tuần */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '70px repeat(7, 1fr)',
                borderBottom: '2px solid #E8E8E8',
                backgroundColor: '#FAFAFA',
              }}
            >
              <div
                style={{
                  padding: '12px 6px',
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#8c8c8c',
                  borderRight: '1px solid #F0F0F0',
                  fontWeight: 600,
                }}
              >
                Giờ
              </div>
              {daysHeader.map((d, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 4px',
                    textAlign: 'center',
                    borderRight: idx < 6 ? '1px solid #F0F0F0' : 'none',
                    backgroundColor: d.isToday ? '#FFF1F0' : 'transparent',
                    borderBottom: d.isToday ? '2px solid #C62828' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: d.isToday ? '#C62828' : '#262626',
                    }}
                  >
                    {d.label}
                  </div>
                  <div style={{ fontSize: 11, color: d.isToday ? '#C62828' : '#8c8c8c' }}>
                    {d.isToday ? 'Hôm nay' : d.fullDate.substring(0, 5)}
                  </div>
                </div>
              ))}
            </div>

            {/* Hàng Cả Ngày */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '70px repeat(7, 1fr)',
                borderBottom: '1px solid #F0F0F0',
                minHeight: 40,
                backgroundColor: '#FCFCFC',
              }}
            >
              <div
                style={{
                  padding: '8px 6px',
                  textAlign: 'center',
                  fontSize: 11,
                  color: '#8c8c8c',
                  borderRight: '1px solid #F0F0F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Cả ngày
              </div>
              {Array.from({ length: 7 }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  style={{
                    borderRight: colIdx < 6 ? '1px solid #F0F0F0' : 'none',
                    padding: 4,
                  }}
                />
              ))}
            </div>

            {/* Các Khung Giờ Trong Ngày */}
            <div style={{ position: 'relative' }}>
              {timeRows.map((hour) => (
                <div
                  key={hour}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px repeat(7, 1fr)',
                    borderBottom: '1px solid #F0F0F0',
                    height: 64,
                  }}
                >
                  {/* Cột mốc giờ */}
                  <div
                    style={{
                      padding: '4px 6px',
                      textAlign: 'center',
                      fontSize: 12,
                      color: '#595959',
                      borderRight: '1px solid #F0F0F0',
                      fontWeight: 500,
                      backgroundColor: '#FAFAFA',
                    }}
                  >
                    {hour}:00
                  </div>

                  {/* 7 ô tương ứng 7 ngày */}
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    const slotEvents = filteredEvents.filter(
                      (e) => e.dayIndex === dayIdx && e.startHour === hour,
                    );

                    return (
                      <div
                        key={dayIdx}
                        style={{
                          borderRight: dayIdx < 6 ? '1px solid #F0F0F0' : 'none',
                          position: 'relative',
                          padding: 2,
                          backgroundColor:
                            dayIdx === 3 ? 'rgba(255, 241, 240, 0.15)' : 'transparent',
                        }}
                      >
                        {slotEvents.map((ev) => {
                          const cfg = categoryConfig[ev.type] || {
                            color: '#1890ff',
                            bg: '#e6f7ff',
                            border: '#91d5ff',
                          };
                          const heightPx = ev.durationHours * 64 - 6;

                          return (
                            <div
                              key={ev.id}
                              onClick={() => setActiveModalEvent(ev)}
                              style={{
                                position: 'absolute',
                                top: 2,
                                left: 3,
                                right: 3,
                                height: heightPx,
                                backgroundColor: cfg.bg,
                                borderLeft: `3px solid ${cfg.color}`,
                                borderRadius: 4,
                                padding: '6px 8px',
                                cursor: 'pointer',
                                zIndex: 3,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow =
                                  '0 4px 10px rgba(0,0,0,0.15)';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow =
                                  '0 1px 3px rgba(0,0,0,0.08)';
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: 2,
                                }}
                              >
                                {ev.targetRoles.includes('ALL') ? (
                                  <Tag
                                    color="gold"
                                    style={{
                                      fontSize: 10,
                                      padding: '0 4px',
                                      lineHeight: '16px',
                                      marginRight: 0,
                                      fontWeight: 600,
                                    }}
                                  >
                                    Toàn trường
                                  </Tag>
                                ) : (
                                  <Tag
                                    style={{
                                      fontSize: 10,
                                      padding: '0 4px',
                                      lineHeight: '16px',
                                      marginRight: 0,
                                      color: cfg.color,
                                      borderColor: cfg.border,
                                      background: '#fff',
                                    }}
                                  >
                                    {ev.scopeLevel}
                                  </Tag>
                                )}
                              </div>

                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: cfg.color,
                                  lineHeight: 1.3,
                                  marginBottom: 3,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {ev.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: '#595959',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <EnvironmentOutlined style={{ marginRight: 4 }} />
                                {ev.location}
                              </div>
                              <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                {ev.startTime} - {ev.endTime}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* CỘT PHẢI: CÀI ĐẶT LỊCH & BỘ LỌC PHÂN LOẠI NGHIỆP VỤ */}
        <Col xs={24} lg={6}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#262626', fontSize: 14 }}>
                  Cài đặt lịch NCKH
                </span>
                <SettingOutlined style={{ color: '#8c8c8c' }} />
              </div>
            }
            bodyStyle={{ padding: '16px' }}
            style={{ borderRadius: 8, border: '1px solid #EDEDEE', marginBottom: 16 }}
          >
            <div style={{ marginBottom: 12, fontSize: 12, color: '#8c8c8c' }}>
              Hiển thị phân loại sự kiện NCKH:
            </div>

            <Checkbox.Group
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}
              value={selectedCategories}
              onChange={(vals) => setSelectedCategories(vals as string[])}
            >
              {Object.entries(categoryConfig).map(([key, cfg]) => {
                const count = events.filter((e) => e.type === key).length;
                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '2px 0',
                    }}
                  >
                    <Checkbox value={key}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#262626' }}>
                        {cfg.label}
                      </span>
                    </Checkbox>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: '#8c8c8c' }}>({count})</span>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          backgroundColor: cfg.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </Checkbox.Group>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ fontSize: 12, color: '#595959', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: '#C62828', marginBottom: 6 }}>
                Phân quyền sự kiện theo quy chế:
              </div>
              <div style={{ marginBottom: 4 }}>
                • <strong>Mốc hạn & Sự kiện toàn trường:</strong> Do P.QLKHCN & Ban Giám Đốc ban hành, tự động áp xuống lịch của tất cả các vai trò.
              </div>
              <div style={{ marginBottom: 4 }}>
                • <strong>Lịch chuyên môn cấp Khoa:</strong> Hội đồng thẩm định & Sinh hoạt KH định kỳ (Mẫu 3.5).
              </div>
              <div style={{ marginBottom: 4 }}>
                • <strong>Lịch tác nghiệp riêng:</strong> P.CT&CTSV (xét ĐRL, học bổng), P.TCKT (đối soát hóa đơn VAT, duyệt chi), Nhóm SV & GVHD (họp chuyên môn).
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* MODAL CHI TIẾT LỊCH NCKH CHUẨN S-LINK */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: '#C62828' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Chi tiết lịch làm việc NCKH</span>
          </div>
        }
        open={!!activeModalEvent}
        onCancel={() => setActiveModalEvent(null)}
        footer={[
          activeModalEvent && (activeModalEvent.id?.startsWith('nckh_usr_') || isLeadershipOrAdmin) && (
            <Button
              key="delete"
              danger
              onClick={async () => {
                if (!activeModalEvent) return;
                await scheduleService.deleteEvent(activeModalEvent.id);
                setEvents((prev) => prev.filter((e) => e.id !== activeModalEvent.id));
                message.success('Đã xóa sự kiện lịch làm việc thành công!');
                setActiveModalEvent(null);
              }}
            >
              Xóa sự kiện
            </Button>
          ),
          <Button
            key="close"
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            onClick={() => setActiveModalEvent(null)}
          >
            Đóng
          </Button>,
        ]}
        width={620}
      >
        {activeModalEvent && (
          <div style={{ padding: '8px 4px', fontSize: 13, lineHeight: 2.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ width: 160, color: '#595959' }}>Loại sự kiện NCKH:</span>
              <Tag
                style={{
                  backgroundColor: categoryConfig[activeModalEvent.type]?.bg || '#E6F7FF',
                  borderColor: categoryConfig[activeModalEvent.type]?.border || '#91D5FF',
                  color: categoryConfig[activeModalEvent.type]?.color || '#096DD9',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 12,
                  padding: '2px 10px',
                }}
              >
                {activeModalEvent.type}
              </Tag>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ width: 160, color: '#595959' }}>Phạm vi áp dụng:</span>
              <Tag
                color={activeModalEvent.targetRoles.includes('ALL') ? 'gold' : 'blue'}
                style={{ fontWeight: 600 }}
              >
                {activeModalEvent.scopeLevel}
              </Tag>
              {activeModalEvent.broadcastBy && (
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                  (Ban hành: {activeModalEvent.broadcastBy})
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ width: 160, color: '#595959', flexShrink: 0 }}>Tên nội dung:</span>
              <span style={{ fontWeight: 600, color: '#262626', lineHeight: 1.4 }}>
                {activeModalEvent.title}
              </span>
            </div>

            {activeModalEvent.projectId && (
              <div style={{ display: 'flex', marginBottom: 8 }}>
                <span style={{ width: 160, color: '#595959', flexShrink: 0 }}>Mã đề tài liên quan:</span>
                <span style={{ fontWeight: 600, color: '#C62828' }}>
                  {activeModalEvent.projectId}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', marginBottom: 8 }}>
              <span style={{ width: 160, color: '#595959' }}>Thời gian thực hiện:</span>
              <span style={{ fontWeight: 500, color: '#262626' }}>
                {activeModalEvent.startTime} - {activeModalEvent.endTime} ngày {activeModalEvent.startDate}
              </span>
            </div>

            <div style={{ display: 'flex', marginBottom: 8 }}>
              <span style={{ width: 160, color: '#595959' }}>Địa điểm tổ chức:</span>
              <span style={{ fontWeight: 500, color: '#262626' }}>
                {activeModalEvent.location}
              </span>
            </div>

            <div style={{ display: 'flex', marginBottom: 8 }}>
              <span style={{ width: 160, color: '#595959', flexShrink: 0 }}>Thành phần tham gia:</span>
              <span style={{ fontWeight: 500, color: '#262626' }}>
                {activeModalEvent.participants || '--'}
              </span>
            </div>

            <div style={{ display: 'flex', marginBottom: 8 }}>
              <span style={{ width: 160, color: '#595959', flexShrink: 0 }}>Căn cứ nghiệp vụ NCKH:</span>
              <span style={{ fontWeight: 500, color: '#096DD9' }}>
                {activeModalEvent.regulatoryBasis || 'Quy định quản lý Đề tài NCKH Sinh viên theo QĐ 521/QĐ-HV'}
              </span>
            </div>

            <div style={{ display: 'flex', marginBottom: 8 }}>
              <span style={{ width: 160, color: '#595959', flexShrink: 0 }}>Ghi chú công việc:</span>
              <span style={{ color: '#595959', fontStyle: 'italic' }}>
                {activeModalEvent.note || '--'}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL THÊM / BAN HÀNH LỊCH LÀM VIỆC NCKH */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusOutlined style={{ color: '#C62828' }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              {isLeadershipOrAdmin
                ? 'Thêm / Ban hành lịch làm việc NCKH (Toàn trường & Phân hệ)'
                : 'Thêm lịch làm việc NCKH cá nhân'}
            </span>
          </div>
        }
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        width={580}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEvent}>
          {isLeadershipOrAdmin && (
            <Form.Item
              name="scope"
              label={
                <span style={{ fontWeight: 600 }}>
                  Phạm vi ban hành & Hiển thị lịch (Phân quyền hệ thống)
                </span>
              }
              initialValue="ALL"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  {
                    value: 'ALL',
                    label: 'Toàn Học viện (Áp xuống lịch tất cả Giảng viên, Sinh viên & Phòng ban)',
                  },
                  {
                    value: 'FACULTY',
                    label: 'Khoa CNTT1 (Áp dụng cho Ban Chủ nhiệm, GVHD & Sinh viên Khoa)',
                  },
                  {
                    value: 'INTERNAL',
                    label: 'Nội bộ Phòng Quản lý KH&CN / Ban Giám Đốc',
                  },
                ]}
              />
            </Form.Item>
          )}

          <Form.Item
            name="title"
            label="Tên sự kiện / Nội dung công việc NCKH"
            rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện' }]}
          >
            <Input placeholder="Ví dụ: Họp xét duyệt hồ sơ đề tài / Đối soát chứng từ quyết toán..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Phân loại sự kiện"
                initialValue={
                  roleCode === 'STUDENT_AFFAIRS'
                    ? 'Tác nghiệp CTSV'
                    : roleCode === 'FINANCE'
                    ? 'Quyết toán TCKT'
                    : isLeadershipOrAdmin
                    ? 'Mốc hạn NCKH'
                    : 'Họp nhóm NCKH'
                }
              >
                <Select
                  options={[
                    { value: 'Mốc hạn NCKH', label: 'Mốc hạn NCKH (QĐ 521)' },
                    { value: 'Hội đồng thẩm định', label: 'Hội đồng thẩm định & Nghiệm thu' },
                    { value: 'Sinh hoạt KH', label: 'Sinh hoạt Khoa học Cấp Khoa' },
                    { value: 'Làm việc với GVHD', label: 'Làm việc với Giảng viên hướng dẫn' },
                    { value: 'Họp nhóm NCKH', label: 'Họp nhóm NCKH Sinh viên' },
                    { value: 'Tác nghiệp CTSV', label: 'Tác nghiệp Phòng CT&CTSV' },
                    { value: 'Quyết toán TCKT', label: 'Quyết toán Phòng TCKT' },
                    { value: 'Giao ban Quản lý', label: 'Giao ban Quản lý KHCN & BGĐ' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Địa điểm"
                initialValue="Học viện Công nghệ Bưu chính Viễn thông"
              >
                <Input placeholder="Ví dụ: P.102 Nhà A2 hoặc Online MS Teams" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="Mã đề tài liên quan (nếu có)"
                initialValue="SV-2026-CNTT1-001"
              >
                <Input placeholder="Ví dụ: SV-2026-CNTT1-001 hoặc Tất cả đề tài" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="participants"
                label="Thành phần tham gia"
                initialValue={`${roleName} & Các cá nhân liên quan`}
              >
                <Input placeholder="Ví dụ: GVHD TS. Ngô Quốc Dũng, Chuyên viên CTSV, ..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Ngày thực hiện">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="startTime" label="Bắt đầu">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="endTime" label="Kết thúc">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="note" label="Ghi chú nội dung cần chuẩn bị">
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú hồ sơ, biên bản, hóa đơn VAT hoặc slide báo cáo..."
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setAddModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            >
              {isLeadershipOrAdmin ? 'Lưu & Ban hành lịch' : 'Lưu lịch làm việc'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
export default SchedulePage;
