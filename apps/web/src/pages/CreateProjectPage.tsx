import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Typography,
  Breadcrumb,
  Row,
  Col,
  Space,
  Tag,
  Divider,
  message,
  Alert,
} from 'antd';
import {
  SendOutlined,
  PrinterOutlined,
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { printElement } from '../utils/printHelper';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export interface ProjectMember {
  id: string;
  memberRole: 'LEADER' | 'MEMBER';
  studentId: string;
  fullName: string;
  className: string;
  email: string;
  contributionPct: number;
  assignedTask: string;
}

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [previewTab, setPreviewTab] = useState<'m1' | 'm2'>('m1');

  // Danh sách thành viên nhóm nghiên cứu theo Điều 4 & Điều 6 QĐ 521/QĐ-HV (1 SV = tối đa 1 đề tài/năm học)
  const [members, setMembers] = useState<ProjectMember[]>([
    {
      id: 'm_1',
      memberRole: 'LEADER',
      studentId: (user as any)?.studentId || 'B23DCCN099',
      fullName: user?.fullName || 'Lê Hoàng Nam',
      className: 'D23CQCN04-B',
      email: user?.email || 'nam.lh@stu.ptit.edu.vn',
      contributionPct: 100,
      assignedTask: 'Chủ nhiệm đề tài, phụ trách chung và phát triển giải pháp nghiên cứu',
    },
  ]);

  // Live form state for real-time A4 preview binding
  const [formData, setFormData] = useState<any>({
    titleVi: '',
    titleEn: '',
    researchField: 'Công nghệ thông tin',
    lecturerId: 'GV001',
    lecturerName: 'TS. Ngô Quốc Dũng',
    lecturerEmail: 'dungnq@ptit.edu.vn',
    objectives: '',
    content: '',
    methodology: '',
    expectedResult: '',
    requestedBudget: 5000000,
    leaderName: user?.fullName || 'Nguyễn Văn An',
    leaderCode: (user as any)?.studentId || 'B23DCCN001',
    leaderClass: 'D23CQCN01-B',
    membersList: members,
  });

  useEffect(() => {
    const leader = members.find((m) => m.memberRole === 'LEADER');
    setFormData((prev: any) => ({
      ...prev,
      leaderName: leader?.fullName || prev.leaderName,
      leaderCode: leader?.studentId || prev.leaderCode,
      leaderClass: leader?.className || prev.leaderClass,
      membersList: members,
    }));
  }, [members]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [lecRes, stuRes] = await Promise.all([
          api.get('/users/lecturers'),
          api.get('/users/students'),
        ]);
        const lecs = Array.isArray(lecRes.data) ? lecRes.data : [];
        const stus = Array.isArray(stuRes.data) ? stuRes.data : [];
        setLecturers(lecs);
        setStudentsList(stus);

        // Đồng bộ lại thông tin Chủ nhiệm đề tài từ hồ sơ SV thực tế
        const myStu = stus.find(
          (s: any) =>
            s.studentId === (user as any)?.studentId ||
            s.user?.userId === user?.userId ||
            s.user?.fullName === user?.fullName,
        );
        if (myStu) {
          setMembers((prev) =>
            prev.map((m) =>
              m.memberRole === 'LEADER'
                ? {
                    ...m,
                    studentId: myStu.studentId,
                    fullName: myStu.user?.fullName || m.fullName,
                    className: myStu.className || m.className,
                    email: myStu.user?.email || m.email,
                  }
                : m,
            ),
          );
        }
      } catch (err: any) {
        message.error('Không thể tải danh sách Giảng viên & Sinh viên từ máy chủ');
      }
    };
    fetchMeta();
  }, [user]);

  const myStudentProfile = studentsList.find(
    (s: any) =>
      s.studentId === (user as any)?.studentId ||
      s.user?.userId === user?.userId ||
      s.user?.fullName === user?.fullName,
  );

  const handleValuesChange = (_: any, allValues: any) => {
    const selectedLecturer = lecturers.find(
      (l) => l.lecturer_id === allValues.lecturerId || l.lecturerId === allValues.lecturerId,
    );

    setFormData((prev: any) => ({
      ...prev,
      ...allValues,
      lecturerName: selectedLecturer?.user?.fullName || selectedLecturer?.users?.full_name || prev.lecturerName,
      lecturerEmail: selectedLecturer?.user?.email || selectedLecturer?.users?.email || prev.lecturerEmail,
    }));
  };

  const handleAddMember = () => {
    if (members.length >= 5) {
      message.warning('Theo Điều 4 QĐ 521/QĐ-HV, mỗi đề tài có tối đa không quá 05 sinh viên tham gia.');
      return;
    }
    const newMember: ProjectMember = {
      id: `m_${Date.now()}`,
      memberRole: 'MEMBER',
      studentId: '',
      fullName: '',
      className: 'D23CQCN01-B',
      email: '',
      contributionPct: 0,
      assignedTask: 'Hỗ trợ thu thập tài liệu và thử nghiệm',
    };
    setMembers([...members, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    const target = members.find((m) => m.id === id);
    if (target?.memberRole === 'LEADER') {
      message.warning('Không thể xóa Chủ nhiệm đề tài!');
      return;
    }
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleUpdateMember = (id: string, field: keyof ProjectMember, value: any) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const totalContribution = members.reduce((sum, m) => sum + (Number(m.contributionPct) || 0), 0);

  const onFinish = async (values: any) => {
    // 1. Kiểm tra giới hạn thành viên theo QĐ 521 (Tối đa 5 sinh viên)
    if (members.length < 1 || members.length > 5) {
      message.error('Theo Điều 4 QĐ 521/QĐ-HV, số lượng sinh viên tham gia đề tài phải từ 01 đến tối đa 05 sinh viên!');
      return;
    }

    // 2. Kiểm tra tổng tỷ lệ đóng góp phải = 100%
    if (totalContribution !== 100) {
      message.error(
        `Tổng tỷ lệ đóng góp của các thành viên hiện tại là ${totalContribution}%. Theo quy định, tổng tỷ lệ phải bằng đúng 100%!`,
      );
      return;
    }

    // 3. Kiểm tra thông tin các thành viên không được để trống
    const invalidMember = members.find((m) => !m.studentId.trim() || !m.fullName.trim());
    if (invalidMember) {
      message.error('Vui lòng nhập đầy đủ Mã sinh viên và Họ tên cho tất cả các thành viên trong nhóm!');
      return;
    }

    try {
      setLoading(true);
      const leaderMember = members.find((m) => m.memberRole === 'LEADER');
      const extraMembers = members.filter((m) => m.memberRole !== 'LEADER');

      const res = await api.post('/projects', {
        titleVi: values.titleVi,
        titleEn: values.titleEn || '',
        researchField: values.researchField || 'Công nghệ thông tin',
        keywords: values.keywords || 'PTIT, NCKH',
        objectives: values.objectives,
        content: values.content,
        methodology: values.methodology,
        expectedResult: values.expectedResult,
        requestedBudget: Number(values.requestedBudget || 5000000),
        lecturerId: values.lecturerId,
        leadPct: Number(leaderMember?.contributionPct || 100),
        leadTask: leaderMember?.assignedTask,
        members: extraMembers.map((m) => ({
          studentId: m.studentId,
          role: 'MEMBER',
          pct: Number(m.contributionPct),
          assignedTask: m.assignedTask,
        })),
      });

      message.success(`Đăng ký đề tài thành công! Mã số được cấp: ${res.data.project_id}`);
      navigate(`/projects/${res.data.project_id}`);
    } catch (err: any) {
      message.error(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          'Đăng ký đề tài thất bại do vi phạm điều kiện QĐ 521 hoặc lỗi máy chủ.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: 14, fontSize: 13 }}
        items={[
          { title: <a onClick={() => navigate('/projects')}>Toàn bộ đề tài NCKH</a> },
          { title: <span style={{ color: '#262626', fontWeight: 600 }}>Đăng ký đề tài mới (Mẫu 1 & Mẫu 2)</span> },
        ]}
      />

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#C62828', fontWeight: 700 }}>
            Khởi tạo & Đăng ký đề tài NCKH Sinh viên trực tuyến
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Kê khai thông tin đề tài và thành viên (Tối đa 05 sinh viên theo Điều 4 QĐ 521). Dữ liệu sẽ tự động điền trực tiếp lên tờ đơn A4 ở cột phải.
          </Text>
        </div>
        <Space className="no-print">
          <Button
            icon={<PrinterOutlined />}
            onClick={() =>
              printElement(
                'printable-a4-preview',
                previewTab === 'm1'
                  ? 'Mẫu 1 - Công văn Đăng ký Đề tài NCKH'
                  : 'Mẫu 2 - Đề cương Đề tài NCKH Sinh viên',
              )
            }
          >
            In tờ đơn A4
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            icon={<SendOutlined />}
            loading={loading}
            onClick={() => form.submit()}
          >
            Gửi Hồ Sơ Đăng Ký Đề Tài
          </Button>
        </Space>
      </div>

      {myStudentProfile?.hasActiveProject && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`Sinh viên ${myStudentProfile.user?.fullName} (${myStudentProfile.studentId}) đã tham gia đề tài "${myStudentProfile.activeProjectId}" trong đợt NCKH hiện tại`}
          description="Theo quy định Điều 6 QĐ 521/QĐ-HV, mỗi sinh viên chỉ được tham gia tối đa 01 đề tài NCKH trong một năm học. Để kiểm thử luồng đăng ký mới, vui lòng chuyển sang tài khoản sinh viên chưa đăng ký (ví dụ: sv.moi - Lê Hoàng Nam)."
        />
      )}

      <Row gutter={[20, 20]}>
        {/* CỘT TRÁI: FORM NHẬP LIỆU TOÀN DIỆN */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  <FileTextOutlined style={{ color: '#C62828', marginRight: 6 }} />
                  Thông tin kê khai hồ sơ đề tài NCKH
                </span>
                <Tag color="volcano" style={{ fontWeight: 600 }}>QĐ 521/QĐ-HV</Tag>
              </div>
            }
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={handleValuesChange}
              initialValues={{
                researchField: 'Công nghệ thông tin',
                lecturerId: 'GV006',
                requestedBudget: 5000000,
                titleVi: 'Nghiên cứu và phát triển hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
                titleEn: 'Research and development of Student Research Management System for PTIT',
                objectives: 'Xây dựng giải pháp web quản lý chu trình NCKH sinh viên theo QĐ 521/QĐ-HV tích hợp S-Link.',
                content: 'Khảo sát hiện trạng, chuẩn hóa hệ thống quy trình nghiệp vụ QĐ 521, thiết kế kiến trúc hệ thống và phát triển giao diện ứng dụng theo chuẩn S-Link.',
                methodology: 'Phương pháp mô hình hóa nghiệp vụ chuyên sâu kết hợp kiến trúc dịch vụ hiện đại NestJS & React.',
                expectedResult: 'Hệ thống web hoàn chỉnh, tài liệu đặc tả kiến trúc giải pháp và báo cáo tổng kết nghiệm thu.',
              }}
            >
              <Form.Item
                name="titleVi"
                label={<b>1. Tên đề tài nghiên cứu (Tiếng Việt) *</b>}
                rules={[{ required: true, message: 'Vui lòng nhập tên đề tài tiếng Việt' }]}
              >
                <Input placeholder="Ví dụ: Nghiên cứu ứng dụng AI trong chẩn đoán hình ảnh y tế" />
              </Form.Item>

              <Form.Item name="titleEn" label="2. Tên đề tài (Tiếng Anh / Tùy chọn)">
                <Input placeholder="Example: Research and application of AI in medical imaging" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="researchField" label={<b>3. Lĩnh vực khoa học & công nghệ *</b>}>
                    <Select
                      options={[
                        { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
                        { value: 'An toàn thông tin', label: 'An toàn thông tin' },
                        { value: 'Điện tử - Viễn thông', label: 'Điện tử - Viễn thông' },
                        { value: 'Truyền thông & Đa phương tiện', label: 'Truyền thông & Đa phương tiện' },
                        { value: 'Kinh tế số & Quản trị kinh doanh', label: 'Kinh tế số & QTKD' },
                        { value: 'IoT & Tự động hóa', label: 'IoT & Tự động hóa' },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="lecturerId"
                    label={<b>4. Giảng viên hướng dẫn (GVHD) *</b>}
                    rules={[{ required: true, message: 'Vui lòng chọn giảng viên hướng dẫn' }]}
                  >
                    <Select
                      placeholder="Chọn giảng viên hướng dẫn (Tối đa 2 đề tài)"
                      options={lecturers.map((l) => {
                        const count = Number(l.activeProjectCount ?? l.advisoryRoles?.length ?? 0);
                        const fullName = l.user?.fullName || l.users?.full_name || l.lecturerId;
                        return {
                          value: l.lecturerId || l.lecturer_id,
                          disabled: count >= 2,
                          label: `${fullName} (${count}/2 đề tài${count >= 2 ? ' - Đã đủ định mức' : ''})`,
                        };
                      })}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="requestedBudget" label={<b>5. Dự toán kinh phí đề xuất (VNĐ) *</b>}>
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1000000}
                      max={20000000}
                      step={500000}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="keywords" label="6. Từ khóa (Keywords)">
                    <Input placeholder="Ví dụ: SRMS, S-Link, QĐ 521, PTIT" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="objectives"
                label={<b>7. Mục tiêu của đề tài *</b>}
                rules={[{ required: true, message: 'Vui lòng nhập mục tiêu đề tài' }]}
              >
                <TextArea rows={3} placeholder="Nêu rõ mục tiêu khoa học và thực tiễn đề tài hướng tới đạt được" />
              </Form.Item>

              <Form.Item
                name="content"
                label={<b>8. Nội dung nghiên cứu chính *</b>}
                rules={[{ required: true, message: 'Vui lòng nhập nội dung chính' }]}
              >
                <TextArea rows={3} placeholder="Mô tả tóm tắt các nội dung công việc và các gói nhiệm vụ triển khai" />
              </Form.Item>

              <Form.Item
                name="methodology"
                label={<b>9. Phương pháp nghiên cứu *</b>}
                rules={[{ required: true, message: 'Vui lòng nhập phương pháp nghiên cứu' }]}
              >
                <TextArea rows={2} placeholder="Phương pháp tiếp cận, công nghệ, công cụ, mô hình giải thuật..." />
              </Form.Item>

              <Form.Item
                name="expectedResult"
                label={<b>10. Sản phẩm và kết quả dự kiến *</b>}
                rules={[{ required: true, message: 'Vui lòng nhập sản phẩm dự kiến' }]}
              >
                <TextArea rows={2} placeholder="Sản phẩm phần mềm, bài báo khoa học, báo cáo tổng kết..." />
              </Form.Item>

              <Divider style={{ margin: '16px 0' }} />

              {/* MỤC QUẢN LÝ THÀNH VIÊN ĐỀ TÀI (ĐIỀU 4 QĐ 521 - TỐI ĐA 5 SINH VIÊN) */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      <TeamOutlined style={{ color: '#C62828', marginRight: 6 }} />
                      11. Danh sách thành viên nhóm nghiên cứu *
                    </span>
                    <span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 8 }}>(Tối đa 05 sinh viên theo Điều 4 QĐ 521)</span>
                  </div>
                  <Space size={6}>
                    <Tag color={members.length <= 5 ? 'blue' : 'red'} style={{ fontWeight: 600 }}>
                      Số lượng: {members.length} / 5 SV
                    </Tag>
                    <Tag color={totalContribution === 100 ? 'green' : 'red'} style={{ fontWeight: 600 }}>
                      Tổng đóng góp: {totalContribution}% / 100% {totalContribution === 100 ? '✓ Hợp lệ' : '⚠ Chưa đủ 100%'}
                    </Tag>
                  </Space>
                </div>

                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 12, fontSize: 12, padding: '8px 12px' }}
                  message={<b>Quy định nhóm NCKH theo Điều 4 Quyết định số 521/QĐ-HV:</b>}
                  description="Mỗi đề tài có tối đa không quá 05 sinh viên tham gia (01 sinh viên làm Chủ nhiệm đề tài và tối đa 04 thành viên phối hợp). Tổng tỷ lệ đóng góp (%) của các thành viên trong nhóm phải bằng đúng 100% để đảm bảo căn cứ xét Điểm rèn luyện và Khen thưởng."
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {members.map((m, idx) => (
                    <Card
                      key={m.id}
                      size="small"
                      style={{
                        backgroundColor: m.memberRole === 'LEADER' ? '#FFF9F9' : '#FAFAFA',
                        borderColor: m.memberRole === 'LEADER' ? '#FFA39E' : '#E8E8E8',
                        borderRadius: 6,
                      }}
                      bodyStyle={{ padding: '10px 12px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Space size={8}>
                          <span style={{ fontWeight: 700, color: '#595959', fontSize: 12 }}>#{idx + 1}</span>
                          <Tag color={m.memberRole === 'LEADER' ? 'red' : 'default'} style={{ fontWeight: 600, fontSize: 11 }}>
                            {m.memberRole === 'LEADER' ? 'Chủ nhiệm đề tài' : 'Thành viên phối hợp'}
                          </Tag>
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#262626' }}>
                            {m.fullName || '[Chưa nhập họ tên]'}
                          </span>
                        </Space>

                        {m.memberRole !== 'LEADER' && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveMember(m.id)}
                          >
                            Xóa
                          </Button>
                        )}
                      </div>

                      <Row gutter={[10, 8]}>
                        <Col span={6}>
                          <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Mã SV *</div>
                          <Input
                            size="small"
                            value={m.studentId}
                            onChange={(e) => handleUpdateMember(m.id, 'studentId', e.target.value)}
                            placeholder="B23DCCN001"
                          />
                        </Col>
                        <Col span={7}>
                          <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Họ và tên *</div>
                          <Input
                            size="small"
                            value={m.fullName}
                            onChange={(e) => handleUpdateMember(m.id, 'fullName', e.target.value)}
                            placeholder="Nguyễn Văn An"
                          />
                        </Col>
                        <Col span={6}>
                          <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Lớp sinh hoạt</div>
                          <Input
                            size="small"
                            value={m.className}
                            onChange={(e) => handleUpdateMember(m.id, 'className', e.target.value)}
                            placeholder="D23CQCN01-B"
                          />
                        </Col>
                        <Col span={5}>
                          <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Đóng góp (%) *</div>
                          <InputNumber
                            size="small"
                            min={1}
                            max={100}
                            style={{ width: '100%' }}
                            value={m.contributionPct}
                            onChange={(val) => handleUpdateMember(m.id, 'contributionPct', val || 0)}
                          />
                        </Col>
                        <Col span={24}>
                          <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Nhiệm vụ phân công cụ thể</div>
                          <Input
                            size="small"
                            value={m.assignedTask}
                            onChange={(e) => handleUpdateMember(m.id, 'assignedTask', e.target.value)}
                            placeholder="Mô tả công việc được giao thực hiện trong đề tài"
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddMember}
                    disabled={members.length >= 5}
                    style={{ borderColor: members.length >= 5 ? '#d9d9d9' : '#C62828', color: members.length >= 5 ? '#bfbfbf' : '#C62828' }}
                  >
                    + Thêm thành viên phối hợp ({members.length}/5)
                  </Button>

                  {members.length >= 5 && (
                    <span style={{ fontSize: 12, color: '#D48806', fontWeight: 500 }}>
                      ⚠ Đã đạt giới hạn tối đa 05 sinh viên theo Điều 4 QĐ 521
                    </span>
                  )}
                </div>
              </div>

              <Button
                type="primary"
                block
                size="large"
                style={{ backgroundColor: '#C62828', borderColor: '#C62828', height: 46, fontWeight: 700, marginTop: 14 }}
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
              >
                Gửi Hồ Sơ Đăng Ký Đề Tài (Chính Thức)
              </Button>
            </Form>
          </Card>
        </Col>

        {/* CỘT PHẢI: BẢN XEM TRƯỚC TỜ ĐƠN A4 TỰ ĐỘNG ĐIỀN THÔNG TIN (LIVE BINDING) */}
        <Col xs={24} lg={12}>
          <div style={{ position: 'sticky', top: 80 }}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#C62828' }}>
                    <EyeOutlined /> Bản xem trước tệp A4 tự động điền
                  </span>
                  <Space size={6}>
                    <Button
                      size="small"
                      type={previewTab === 'm1' ? 'primary' : 'default'}
                      style={previewTab === 'm1' ? { backgroundColor: '#C62828', borderColor: '#C62828' } : {}}
                      onClick={() => setPreviewTab('m1')}
                    >
                      Mẫu 1: Công văn Khoa
                    </Button>
                    <Button
                      size="small"
                      type={previewTab === 'm2' ? 'primary' : 'default'}
                      style={previewTab === 'm2' ? { backgroundColor: '#C62828', borderColor: '#C62828' } : {}}
                      onClick={() => setPreviewTab('m2')}
                    >
                      Mẫu 2: Đề cương chi tiết
                    </Button>
                  </Space>
                </div>
              }
              bodyStyle={{ padding: 12, backgroundColor: '#525659', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}
              style={{ borderRadius: 8, overflow: 'hidden' }}
            >
              <div
                id="printable-a4-preview"
                className="printable-a4-sheet"
                style={{
                  backgroundColor: '#FFFFFF',
                  width: '100%',
                  maxWidth: 680,
                  margin: '0 auto',
                  padding: '36px 32px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  fontFamily: '"Times New Roman", Times, serif',
                  color: '#000000',
                  lineHeight: 1.5,
                  fontSize: 13,
                }}
              >
                {previewTab === 'm1' ? (
                  /* MẪU 1: CÔNG VĂN ĐĂNG KÝ ĐỀ TÀI */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ textAlign: 'center', width: '48%' }}>
                        <div style={{ fontSize: 11, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
                        <div style={{ fontSize: 11, fontWeight: 'bold', textDecoration: 'underline' }}>KHOA CÔNG NGHỆ THÔNG TIN 1</div>
                        <div style={{ fontSize: 11, marginTop: 4 }}>Số: &nbsp;&nbsp;&nbsp;&nbsp; /HV-CNTT1</div>
                        <div style={{ fontSize: 10, fontStyle: 'italic' }}>V/v Đăng ký đề tài NCKH sinh viên</div>
                      </div>
                      <div style={{ textAlign: 'center', width: '48%' }}>
                        <div style={{ fontSize: 11, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                        <div style={{ fontSize: 11, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
                        <div style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>
                          Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', margin: '20px 0 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 'bold' }}>Mẫu 1. Công văn đăng ký đề tài NCKH của sinh viên</div>
                      <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 6 }}>
                        Kính gửi: Phòng Quản lý Khoa học công nghệ và Hợp tác quốc tế
                      </div>
                    </div>

                    <Paragraph style={{ textIndent: 24, fontSize: 13, marginBottom: 10 }}>
                      Căn cứ Kế hoạch hoạt động nghiên cứu khoa học của sinh viên năm học 2026 - 2027, Khoa Công nghệ thông tin 1 kính chuyển hồ sơ đăng ký đề tài NCKH của sinh viên với thông tin chi tiết như sau:
                    </Paragraph>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 14 }} border={1}>
                      <thead>
                        <tr style={{ backgroundColor: '#F0F0F0', textAlign: 'center' }}>
                          <th style={{ padding: 4, width: 30 }}>STT</th>
                          <th style={{ padding: 4 }}>Tên đề tài & Mã đề xuất</th>
                          <th style={{ padding: 4, width: 120 }}>Người hướng dẫn</th>
                          <th style={{ padding: 4, width: 90 }}>Lĩnh vực</th>
                          <th style={{ padding: 4, width: 85 }}>Kinh phí (VNĐ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ textAlign: 'center', padding: 4 }}>1</td>
                          <td style={{ padding: 4 }}>
                            <b>{formData.titleVi || '[Chưa nhập tên đề tài]'}</b>
                            {formData.titleEn && <div style={{ fontStyle: 'italic', fontSize: 10, color: '#444' }}>({formData.titleEn})</div>}
                            <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                              Chủ trì: <b>{formData.leaderName}</b> (Lớp {formData.leaderClass}) • Nhóm: <b>{members.length} thành viên</b>
                            </div>
                          </td>
                          <td style={{ padding: 4, textAlign: 'center' }}>
                            <b>{formData.lecturerName}</b>
                            <div style={{ fontSize: 10, color: '#555' }}>{formData.lecturerEmail}</div>
                          </td>
                          <td style={{ padding: 4, textAlign: 'center' }}>{formData.researchField}</td>
                          <td style={{ padding: 4, textAlign: 'right', fontWeight: 'bold' }}>
                            {Number(formData.requestedBudget || 5000000).toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ fontSize: 12, marginBottom: 10 }}>
                      <p><b>Mục tiêu tóm tắt:</b> {formData.objectives || '[Chưa nhập mục tiêu]'}</p>
                      <p><b>Sản phẩm dự kiến:</b> {formData.expectedResult || '[Chưa nhập sản phẩm]'}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, textAlign: 'center', fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>CHỦ TỊCH HỘI ĐỒNG KH KHOA</div>
                        <div style={{ fontStyle: 'italic', fontSize: 10 }}>(Ký và ghi rõ họ tên)</div>
                        <div style={{ marginTop: 45, fontWeight: 'bold' }}>PGS.TS. Hoàng Minh</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>TRƯỞNG KHOA</div>
                        <div style={{ fontStyle: 'italic', fontSize: 10 }}>(Ký và ghi rõ họ tên)</div>
                        <div style={{ marginTop: 45, fontWeight: 'bold' }}>Trần Đình Trưởng Khoa</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MẪU 2: THUYẾT MINH ĐỀ CƯƠNG CHI TIẾT */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ textAlign: 'center', width: '48%' }}>
                        <div style={{ fontSize: 10, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
                        <div style={{ fontSize: 10, fontWeight: 'bold', textDecoration: 'underline' }}>KHOA CÔNG NGHỆ THÔNG TIN 1</div>
                      </div>
                      <div style={{ textAlign: 'center', width: '48%' }}>
                        <div style={{ fontSize: 10, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                        <div style={{ fontSize: 10, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', margin: '14px 0 16px' }}>
                      <div style={{ fontSize: 11, fontWeight: 'bold' }}>Mẫu 2. Đề cương đề tài NCKH của sinh viên</div>
                      <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
                        ĐỀ CƯƠNG NGHIÊN CỨU KHOA HỌC CỦA SINH VIÊN
                      </div>
                    </div>

                    <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                      <p><b>1. Tên đề tài:</b> {formData.titleVi || '[Chưa nhập tên đề tài]'}</p>
                      {formData.titleEn && <p style={{ fontStyle: 'italic' }}><b>Tên tiếng Anh:</b> {formData.titleEn}</p>}
                      <p><b>2. Lĩnh vực KHCN:</b> {formData.researchField}</p>
                      <p><b>3. Chủ trì đề tài:</b> {formData.leaderName} - Lớp: {formData.leaderClass} (Mã SV: {formData.leaderCode})</p>
                      <p><b>4. Giảng viên hướng dẫn:</b> {formData.lecturerName} ({formData.lecturerEmail})</p>

                      <p><b>5. Mục tiêu, nội dung và sản phẩm:</b></p>
                      <div style={{ paddingLeft: 14 }}>
                        <p>• <b>Mục tiêu:</b> {formData.objectives || '[Chưa nhập]'}</p>
                        <p>• <b>Nội dung:</b> {formData.content || '[Chưa nhập]'}</p>
                        <p>• <b>Phương pháp:</b> {formData.methodology || '[Chưa nhập]'}</p>
                        <p>• <b>Sản phẩm:</b> {formData.expectedResult || '[Chưa nhập]'}</p>
                      </div>

                      <p><b>6. Dự toán kinh phí chi tiết:</b></p>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 12 }} border={1}>
                        <thead>
                          <tr style={{ backgroundColor: '#F8F8F8', textAlign: 'center' }}>
                            <th style={{ padding: 3 }}>STT</th>
                            <th style={{ padding: 3 }}>Nội dung khoản chi</th>
                            <th style={{ padding: 3, width: 100 }}>Dự toán (VNĐ)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td style={{ textAlign: 'center' }}>1</td><td>Xây dựng và hoàn thiện thuyết minh đề cương</td><td style={{ textAlign: 'right', paddingRight: 6 }}>1,000,000</td></tr>
                          <tr><td style={{ textAlign: 'center' }}>2</td><td>Nghiên cứu tài liệu và viết báo cáo chuyên đề</td><td style={{ textAlign: 'right', paddingRight: 6 }}>2,000,000</td></tr>
                          <tr><td style={{ textAlign: 'center' }}>3</td><td>Tổ chức sinh hoạt khoa học / Hội thảo Khoa (Mẫu 3.5)</td><td style={{ textAlign: 'right', paddingRight: 6 }}>1,000,000</td></tr>
                          <tr><td style={{ textAlign: 'center' }}>4</td><td>Họp Hội đồng nghiệm thu đánh giá (05 thành viên)</td><td style={{ textAlign: 'right', paddingRight: 6 }}>700,000</td></tr>
                          <tr><td style={{ textAlign: 'center' }}>5</td><td>Văn phòng phẩm, in ấn, đóng bìa cứng báo cáo</td><td style={{ textAlign: 'right', paddingRight: 6 }}>300,000</td></tr>
                          <tr style={{ fontWeight: 'bold' }}>
                            <td colSpan={2} style={{ textAlign: 'center' }}>Tổng cộng dự toán</td>
                            <td style={{ textAlign: 'right', paddingRight: 6, color: '#C62828' }}>
                              {Number(formData.requestedBudget || 5000000).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* BẢNG THÀNH VIÊN NHÓM NGHIÊN CỨU HIỂN THỊ TRỰC TIẾP TRÊN MẪU 2 */}
                      <p><b>7. Danh sách thành viên nhóm nghiên cứu ({members.length}/5 sinh viên theo Điều 4 QĐ 521):</b></p>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 12 }} border={1}>
                        <thead>
                          <tr style={{ backgroundColor: '#F8F8F8', textAlign: 'center' }}>
                            <th style={{ padding: 3, width: 28 }}>STT</th>
                            <th style={{ padding: 3 }}>Họ và tên</th>
                            <th style={{ padding: 3, width: 85 }}>Mã SV</th>
                            <th style={{ padding: 3, width: 80 }}>Lớp</th>
                            <th style={{ padding: 3, width: 50 }}>Đóng góp</th>
                            <th style={{ padding: 3 }}>Nhiệm vụ phân công</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((m, idx) => (
                            <tr key={m.id}>
                              <td style={{ textAlign: 'center', padding: 3 }}>{idx + 1}</td>
                              <td style={{ padding: 3 }}>
                                <b>{m.fullName || '[Chưa nhập]'}</b> {m.memberRole === 'LEADER' ? '(Chủ nhiệm)' : ''}
                              </td>
                              <td style={{ textAlign: 'center', padding: 3 }}>{m.studentId || '--'}</td>
                              <td style={{ textAlign: 'center', padding: 3 }}>{m.className || '--'}</td>
                              <td style={{ textAlign: 'center', padding: 3, fontWeight: 'bold' }}>{m.contributionPct}%</td>
                              <td style={{ padding: 3, fontSize: 10 }}>{m.assignedTask}</td>
                            </tr>
                          ))}
                          <tr style={{ fontWeight: 'bold', backgroundColor: '#FAFAFA' }}>
                            <td colSpan={4} style={{ textAlign: 'center', padding: 3 }}>TỔNG CỘNG TỶ LỆ ĐÓNG GÓP:</td>
                            <td style={{ textAlign: 'center', color: totalContribution === 100 ? '#52C41A' : '#C62828' }}>{totalContribution}%</td>
                            <td style={{ fontSize: 10, fontStyle: 'italic', padding: 3 }}>{totalContribution === 100 ? '✓ Đạt 100% chuẩn QĐ 521' : '⚠ Chưa đủ 100%'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, textAlign: 'center', fontSize: 11 }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>Chủ trì đề tài</div>
                        <div style={{ fontStyle: 'italic', fontSize: 10 }}>(Ký, ghi rõ họ tên)</div>
                        <div style={{ marginTop: 40, fontWeight: 'bold' }}>{formData.leaderName}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>Giảng viên hướng dẫn</div>
                        <div style={{ fontStyle: 'italic', fontSize: 10 }}>(Ký, ghi rõ họ tên)</div>
                        <div style={{ marginTop: 40, fontWeight: 'bold' }}>{formData.lecturerName}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>Trưởng Khoa</div>
                        <div style={{ fontStyle: 'italic', fontSize: 10 }}>(Ký, ghi rõ họ tên)</div>
                        <div style={{ marginTop: 40, fontWeight: 'bold' }}>Trần Đình Trưởng Khoa</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default CreateProjectPage;
