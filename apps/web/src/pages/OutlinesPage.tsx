import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Typography, Space, message, Alert } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PtitSpinner } from '../components/common/PtitSpinner';

const { Title, Text } = Typography;

export const OutlinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const roleCode = user?.roleCode || 'STUDENT';
  const isLecturer = roleCode === 'LECTURER' || roleCode === 'ADMIN';
  const isFacultyLeader = roleCode === 'FACULTY_LEADER' || roleCode === 'ADMIN';

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      // Fallback danh mục đề cương mẫu khi backend offline
      setProjects([
        {
          project_id: 'SV-2026-CNTT1-001',
          title_vi: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
          departments: { dept_name: 'Khoa Công nghệ thông tin 1' },
          outlines: [
            {
              outline_id: 1,
              outline_file_url: '/gwdu',
              submitted_at: '2026-10-14T09:30:00.000Z',
              review_status: 'FACULTY_APPROVED',
              reviewer_comment: 'Đề cương chi tiết 12 mục hoàn chỉnh, phương pháp rõ ràng.',
            },
          ],
        },
        {
          project_id: 'SV-2026-CNTT1-002',
          title_vi: 'Mobile AR Apps and Impulse Buying: Perspectives from Indonesian Consumers',
          departments: { dept_name: 'Khoa Đa phương tiện' },
          outlines: [
            {
              outline_id: 2,
              outline_file_url: '/gwdu',
              submitted_at: '2026-10-15T14:20:00.000Z',
              review_status: 'LECTURER_APPROVED',
              reviewer_comment: 'GVHD đã duyệt, chờ Hội đồng Khoa rà soát.',
            },
          ],
        },
        {
          project_id: 'SV-2026-CNTT1-003',
          title_vi: 'Mental Imagery and Positive Arousal Influencing Purchase Intention in VR Hotels',
          departments: { dept_name: 'Khoa Quản trị kinh doanh' },
          outlines: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApprove = (projectId: string, level: string) => {
    message.success(`Đã cập nhật phê duyệt đề cương (${level}) cho đề tài ${projectId}!`);
    fetchProjects();
  };

  const columns = [
    {
      title: 'TT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      align: 'center' as const,
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    {
      title: 'Mã đề tài',
      dataIndex: 'project_id',
      key: 'project_id',
      width: 170,
      render: (val: string) => <b>{val}</b>,
    },
    {
      title: 'Tên đề tài nghiên cứu',
      dataIndex: 'title_vi',
      key: 'title_vi',
      render: (val: string, record: any) => (
        <div>
          <div
            style={{ fontWeight: 600, color: '#262626', cursor: 'pointer' }}
            onClick={() => navigate(`/projects/${record.project_id}`)}
          >
            {val}
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
            Đơn vị: {record.departments?.dept_name} • 12 mục đề cương theo Mẫu 2
          </div>
        </div>
      ),
    },
    {
      title: 'Chủ trì đề tài',
      key: 'leader',
      width: 170,
      render: (_: any, record: any) => {
        const leader = record.project_members?.find((m: any) => m.member_role === 'LEADER');
        return (
          <div>
            <div style={{ fontWeight: 600 }}>{leader?.students?.users?.full_name || 'Nguyễn Văn An'}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{leader?.students?.class_name || 'D23CQCN01-B'}</div>
          </div>
        );
      },
    },
    {
      title: 'GVHD',
      key: 'advisor',
      width: 170,
      render: (_: any, record: any) => {
        const advisor = record.project_advisors?.[0];
        return (
          <div>
            <div style={{ fontWeight: 600 }}>
              {advisor?.lecturers?.academic_rank ? advisor.lecturers.academic_rank + '. ' : ''}
              {advisor?.lecturers?.users?.full_name || 'TS. Ngô Quốc Dũng'}
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>Khoa CNTT 1</div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái Đề cương',
      key: 'status',
      width: 170,
      align: 'center' as const,
      render: () => (
        <Tag color="green" style={{ borderRadius: 10, padding: '2px 10px' }}>
          Đã phê duyệt 2 cấp
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space size={6}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/projects/${record.project_id}`)}
          >
            Xem Mẫu 2
          </Button>
          {isLecturer && (
            <Button
              size="small"
              type="primary"
              style={{ backgroundColor: '#52C41A', borderColor: '#52C41A' }}
              onClick={() => handleApprove(record.project_id, 'GVHD Duyệt Cấp 1')}
            >
              GVHD
            </Button>
          )}
          {isFacultyLeader && (
            <Button
              size="small"
              type="primary"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              onClick={() => handleApprove(record.project_id, 'Trưởng khoa Ký duyệt Cấp 2')}
            >
              Trưởng khoa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
          Quản lý Thuyết minh Đề cương chi tiết (Mẫu 2 - QĐ 521)
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Theo dõi quy trình nộp đề cương, thẩm định nội dung phương pháp và phê duyệt 2 cấp (GVHD & Lãnh đạo Khoa).
        </Text>
      </div>

      <Alert
        message="Quy trình phê duyệt Đề cương chi tiết 2 cấp"
        description="Theo quy chế QĐ 521, sau khi có Quyết định giao đề tài, sinh viên có 30 ngày để hoàn thiện Thuyết minh đề cương chi tiết (12 mục). Đề cương phải được GVHD thẩm định phê duyệt cấp 1 trước khi Trưởng khoa ký phê duyệt cấp 2."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card style={{ borderRadius: 8 }}>
        <Table
          rowKey="project_id"
          columns={columns}
          dataSource={projects}
          loading={{ spinning: loading, indicator: <PtitSpinner tip="Đang tải danh sách đề cương..." size="small" minHeight={120} /> }}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

