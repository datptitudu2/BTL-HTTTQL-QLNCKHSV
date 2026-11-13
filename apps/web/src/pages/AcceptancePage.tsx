import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Alert,
  Row,
  Col,
  Select,
  Statistic,
  message,
  DatePicker,
  Checkbox,
} from 'antd';
import {
  CheckCircleOutlined,
  AuditOutlined,
  PlusOutlined,
  PrinterOutlined,
  TrophyOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  BookOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { printElement } from '../utils/printHelper';

const { Title, Text } = Typography;

const GRADE_LABEL: Record<string, { label: string; color: string; drl: number }> = {
  XUAT_SAC: { label: 'Xuất sắc', color: 'green', drl: 10 },
  TOT: { label: 'Tốt', color: 'blue', drl: 8 },
  KHA: { label: 'Khá', color: 'cyan', drl: 6 },
  DAT: { label: 'Đạt', color: 'gold', drl: 4 },
  KHONG_DAT: { label: 'Không đạt', color: 'red', drl: 0 },
  PENDING: { label: 'Chờ chấm điểm', color: 'default', drl: 0 },
};

export const AcceptancePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleCode = user?.roleCode || 'STUDENT';

  const [acceptances, setAcceptances] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [submittedProjects, setSubmittedProjects] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  const [scoringAcc, setScoringAcc] = useState<any>(null);
  const [detailAcc, setDetailAcc] = useState<any>(null);
  const [councilModalVisible, setCouncilModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [scoreForm] = Form.useForm();
  const [councilForm] = Form.useForm();

  const canScore = ['LECTURER', 'FACULTY_LEADER', 'QLKHCN', 'ADMIN'].includes(roleCode);
  const canCreateCouncil = ['QLKHCN', 'FACULTY_LEADER', 'ADMIN'].includes(roleCode);
  const canApproveFinal = ['QLKHCN', 'BOARD', 'ADMIN'].includes(roleCode);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [accRes, projRes, lecRes] = await Promise.all([
        api.get('/acceptance'),
        api.get('/projects'),
        api.get('/users/lecturers'),
      ]);
      const accList = accRes.data?.acceptances || [];
      setAcceptances(accList);
      setCriteria(accRes.data?.criteria || []);
      const existingProjIds = new Set(accList.map((a: any) => a.projectId));
      const waiting = (Array.isArray(projRes.data) ? projRes.data : []).filter(
        (p: any) => p.status === 'SUBMITTED' && !existingProjIds.has(p.project_id),
      );
      setSubmittedProjects(waiting);
      setLecturers(Array.isArray(lecRes.data) ? lecRes.data : []);
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể tải dữ liệu Hội đồng Nghiệm thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openScoreModal = (acc: any) => {
    setScoringAcc(acc);
    const initialScores: Record<string, number> = {};
    criteria.forEach((c) => {
      initialScores[`c_${c.criteriaId}`] = Math.round(Number(c.maxScore) * 0.85 * 10) / 10;
    });
    scoreForm.setFieldsValue({
      ...initialScores,
      cmId: acc.council?.members?.[0]?.cmId,
      strengths: 'Đề tài hoàn thành đúng mục tiêu, sản phẩm hoạt động ổn định và có tính ứng dụng thực tiễn.',
      limitations: 'Cần tiếp tục mở rộng tập dữ liệu kiểm thử và hoàn thiện thêm bài báo khoa học.',
      qaComment: 'Nhóm trả lời rõ ràng các câu hỏi phản biện của Hội đồng.',
      recommendAward: true,
    });
  };

  const handleSubmitScore = async (values: any) => {
    if (!scoringAcc) return;
    try {
      setSubmitting(true);
      const scores = criteria.map((c) => ({
        criteriaId: c.criteriaId,
        score: Number(values[`c_${c.criteriaId}`] || 0),
      }));
      await api.post('/acceptance/score', {
        acceptanceId: scoringAcc.acceptanceId,
        cmId: values.cmId,
        strengths: values.strengths,
        limitations: values.limitations,
        qaComment: values.qaComment,
        conclusionAwardRec: values.recommendAward,
        scores,
      });
      message.success('Đã lưu Phiếu chấm Mẫu 4.1 & tự động kiểm tra điểm lệch > 15 điểm!');
      setScoringAcc(null);
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể lưu phiếu chấm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveFinal = async (acceptanceId: number) => {
    try {
      await api.post(`/acceptance/${acceptanceId}/approve`, {});
      message.success('P.QLKHCN đã phê duyệt Kết quả Nghiệm thu, cập nhật ĐRL SV & Giờ chuẩn GVHD!');
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Không thể phê duyệt kết quả nghiệm thu');
    }
  };

  const handleCreateCouncil = async (values: any) => {
    try {
      setSubmitting(true);
      const members = [
        { lecturerId: values.chairId, councilRole: 'CHAIR' },
        { lecturerId: values.reviewerId, councilRole: 'REVIEWER' },
        { lecturerId: values.secretaryId, councilRole: 'SECRETARY' },
      ];
      await api.post(`/acceptance/project/${values.projectId}/council`, {
        councilName: values.councilName,
        decisionNo: values.decisionNo,
        defenseDate: values.defenseDate ? values.defenseDate.toISOString() : new Date().toISOString(),
        location: values.location,
        members,
      });
      message.success('Đã thành lập Hội đồng nghiệm thu & lập lịch bảo vệ!');
      setCouncilModalVisible(false);
      councilForm.resetFields();
      await fetchAll();
    } catch (err: any) {
      message.error(err.response?.data?.detail || err.response?.data?.message || 'Lỗi thành lập Hội đồng');
    } finally {
      setSubmitting(false);
    }
  };

  const departments = Array.from(
    new Set(acceptances.map((a) => a.project?.department?.deptCode).filter(Boolean)),
  );

  const filteredAcceptances = acceptances.filter(
    (a) => deptFilter === 'ALL' || a.project?.department?.deptCode === deptFilter,
  );

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#C62828', fontWeight: 700 }}>
            Hội đồng Nghiệm thu & Chấm điểm Đề tài (QĐ 521/QĐ-HV - D6)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý phiên bảo vệ theo Khoa & Đề tài: 7 tiêu chí chuẩn (100đ), tự động loại trừ phiếu chênh lệch &gt; 15 điểm (Mẫu 4.2), phê duyệt P.QLKHCN.
          </Text>
        </div>
        <Space>
          <Select value={deptFilter} onChange={setDeptFilter} style={{ width: 170 }}>
            <Select.Option value="ALL">Tất cả các Khoa ({acceptances.length})</Select.Option>
            {departments.map((d) => (
              <Select.Option key={d} value={d}>Khoa {d}</Select.Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchAll} loading={loading}>
            Làm mới
          </Button>
          {canCreateCouncil && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              onClick={() => setCouncilModalVisible(true)}
            >
              Thành lập Hội đồng
            </Button>
          )}
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Thuật toán tính điểm & Loại trừ phiếu lệch > 15 điểm (Điều 10 QĐ 521/QĐ-HV)"
        description="Mỗi thành viên Hội đồng chấm theo 7 tiêu chí (10 + 15 + 15 + 35 + 15 + 5 + 5 = 100 điểm). Nếu điểm tổng của thành viên chênh lệch quá 15 điểm so với trung bình ban đầu sẽ bị hệ thống gắn cờ Loại trừ trước khi xếp loại: Xuất sắc (≥90), Tốt (80-89.9), Khá (70-79.9), Đạt (50-69.9)."
      />

      {submittedProjects.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`Có ${submittedProjects.length} đề tài đã nộp báo cáo tổng kết (SUBMITTED) đang chờ thành lập Hội đồng nghiệm thu`}
          description={submittedProjects.map((p) => `${p.project_id} (${p.departments?.dept_code})`).join(' • ')}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Tổng Hồ sơ Nghiệm thu" value={acceptances.length} prefix={<AuditOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Đã phê duyệt P.QLKHCN"
              value={acceptances.filter((a) => Boolean(a.approvalDocNo)).length}
              valueStyle={{ color: '#389E0D' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Đạt Xuất sắc / Tốt"
              value={acceptances.filter((a) => ['XUAT_SAC', 'TOT'].includes(a.grade)).length}
              valueStyle={{ color: '#C62828' }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Có phiếu lệch > 15đ (Mẫu 4.2)"
              value={acceptances.filter((a) => a.sheets?.some((s: any) => s.isOutlier)).length}
              valueStyle={{ color: '#D48806' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        {filteredAcceptances.map((acc) => {
          const gradeInfo = GRADE_LABEL[acc.grade || 'PENDING'] || GRADE_LABEL.PENDING;
          const lead = acc.project?.members?.find((m: any) => m.memberRole === 'LEAD') || acc.project?.members?.[0];
          const adv = acc.project?.advisors?.[0];
          const papers = (acc.project?.documents || []).filter((d: any) => d.docType === 'PAPER');
          const hasOutlier = acc.sheets?.some((s: any) => s.isOutlier);

          return (
            <Card
              key={acc.acceptanceId}
              bordered={false}
              style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <Text strong style={{ color: '#C62828', fontSize: 15 }}>
                      {acc.council?.councilName}
                    </Text>
                    <div style={{ fontSize: 12, color: '#595959', fontWeight: 400 }}>
                      Khoa: <b>{acc.project?.department?.deptName}</b> • QĐ Hội đồng: <b>{acc.council?.decisionNo || '—'}</b>
                    </div>
                  </div>
                  <Space>
                    {acc.approvalDocNo ? (
                      <Tag color="green" icon={<SafetyCertificateOutlined />}>
                        Đã phê duyệt ({acc.approvalDocNo})
                      </Tag>
                    ) : (
                      <Tag color="gold">Chờ P.QLKHCN duyệt cuối (DFD 5.5)</Tag>
                    )}
                    <Tag color={gradeInfo.color} style={{ fontSize: 13, fontWeight: 700, padding: '2px 10px' }}>
                      {gradeInfo.label.toUpperCase()} {acc.avgScore ? `(${Number(acc.avgScore).toFixed(1)}đ)` : ''}
                    </Tag>
                  </Space>
                </div>
              }
            >
              <Row gutter={[20, 12]}>
                <Col xs={24} lg={11}>
                  <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    <div>
                      <CalendarOutlined /> Thời gian bảo vệ:{' '}
                      <b>{acc.council?.defenseDate ? new Date(acc.council.defenseDate).toLocaleString('vi-VN') : '—'}</b>
                    </div>
                    <div>
                      <EnvironmentOutlined /> Địa điểm: <b>{acc.council?.location || '—'}</b>
                    </div>
                    <div>
                      Đề tài:{' '}
                      <a onClick={() => navigate(`/projects/${acc.projectId}`)} style={{ fontWeight: 700, color: '#C62828' }}>
                        {acc.projectId}
                      </a>{' '}
                      — <Text strong>{acc.project?.titleVi}</Text>
                    </div>
                    <div style={{ fontSize: 12, color: '#595959' }}>
                      Chủ nhiệm: <b>{lead?.student?.user?.fullName || '—'}</b> ({lead?.studentId}) • GVHD:{' '}
                      <b>{adv?.lecturer?.user?.fullName || '—'}</b>
                    </div>
                    {papers.length > 0 && (
                      <div style={{ fontSize: 12 }}>
                        <BookOutlined style={{ color: '#1890FF' }} /> Sản phẩm công bố: <b>{papers.length} bài báo khoa học</b>{' '}
                        ({papers[0].fileUrl})
                      </div>
                    )}
                    {hasOutlier && (
                      <Tag color="red" icon={<WarningOutlined />}>
                        Đã áp dụng loại trừ phiếu chênh lệch &gt; 15 điểm theo Điều 10 QĐ 521
                      </Tag>
                    )}
                  </Space>
                </Col>

                <Col xs={24} lg={13}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    <TeamOutlined /> Kết quả Phiếu chấm Hội đồng ({acc.sheets?.length || 0}/{acc.council?.members?.length || 0} phiếu):
                  </Text>
                  <Table
                    size="small"
                    pagination={false}
                    rowKey="cmId"
                    dataSource={(acc.council?.members || []).map((m: any) => {
                      const sheet = acc.sheets?.find((s: any) => s.cmId === m.cmId);
                      return { ...m, sheet };
                    })}
                    columns={[
                      {
                        title: 'Thành viên Hội đồng',
                        key: 'lec',
                        render: (_: any, m: any) => (
                          <span>
                            <b>{m.lecturer?.user?.fullName}</b> <Tag>{m.councilRole}</Tag>
                          </span>
                        ),
                      },
                      {
                        title: 'Tổng điểm',
                        key: 'score',
                        width: 120,
                        render: (_: any, m: any) =>
                          m.sheet ? (
                            <Text strong style={{ color: m.sheet.isOutlier ? '#CF1322' : '#262626', textDecoration: m.sheet.isOutlier ? 'line-through' : 'none' }}>
                              {Number(m.sheet.totalScore).toFixed(1)}đ
                            </Text>
                          ) : (
                            <Text type="secondary">Chưa chấm</Text>
                          ),
                      },
                      {
                        title: 'Hợp lệ (Mẫu 4.2)',
                        key: 'valid',
                        width: 140,
                        render: (_: any, m: any) =>
                          !m.sheet ? (
                            <Tag>Chờ</Tag>
                          ) : m.sheet.isOutlier ? (
                            <Tag color="red">Loại (&gt;15đ)</Tag>
                          ) : (
                            <Tag color="green">Hợp lệ</Tag>
                          ),
                      },
                    ]}
                  />
                </Col>
              </Row>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button icon={<PrinterOutlined />} onClick={() => setDetailAcc(acc)}>
                  Biên bản Mẫu 4.2 & Chi tiết 7 tiêu chí
                </Button>
                {canScore && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                    onClick={() => openScoreModal(acc)}
                  >
                    Chấm điểm Phiếu 4.1
                  </Button>
                )}
                {canApproveFinal && !acc.approvalDocNo && acc.avgScore && (
                  <Button
                    type="primary"
                    style={{ backgroundColor: '#389E0D', borderColor: '#389E0D' }}
                    icon={<SafetyCertificateOutlined />}
                    onClick={() => handleApproveFinal(acc.acceptanceId)}
                  >
                    Phê duyệt KQ Nghiệm thu (DFD 5.5)
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </Space>

      {/* Modal Chấm điểm 7 tiêu chí (Mẫu 4.1) */}
      <Modal
        title={`Phiếu chấm 7 Tiêu chí (Mẫu 4.1) — ${scoringAcc?.projectId}`}
        open={Boolean(scoringAcc)}
        onCancel={() => setScoringAcc(null)}
        onOk={() => scoreForm.submit()}
        confirmLoading={submitting}
        width={760}
        okText="Gửi Phiếu chấm lên Hội đồng"
        okButtonProps={{ style: { backgroundColor: '#C62828', borderColor: '#C62828' } }}
      >
        <Form form={scoreForm} layout="vertical" onFinish={handleSubmitScore}>
          <Form.Item name="cmId" label="Chấm với tư cách thành viên Hội đồng" rules={[{ required: true }]}>
            <Select>
              {(scoringAcc?.council?.members || []).map((m: any) => (
                <Select.Option key={m.cmId} value={m.cmId}>
                  {m.lecturer?.user?.fullName} ({m.councilRole})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={[12, 8]}>
            {criteria.map((c) => (
              <Col xs={24} md={12} key={c.criteriaId}>
                <Form.Item
                  name={`c_${c.criteriaId}`}
                  label={`${c.orderNo}. ${c.title} (Tối đa ${Number(c.maxScore)}đ)`}
                  rules={[{ required: true }]}
                >
                  <InputNumber min={0} max={Number(c.maxScore)} step={0.5} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Form.Item name="strengths" label="Ưu điểm nổi bật" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="limitations" label="Hạn chế & Kiến nghị sửa chữa" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="qaComment" label="Ghi chú Hỏi - Đáp trước Hội đồng">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="recommendAward" valuePropName="checked">
            <Checkbox>Đề nghị xét Khen thưởng NCKH sinh viên cấp Học viện / Bộ (Mẫu 5)</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Biên bản Mẫu 4.2 */}
      <Modal
        title={`Biên bản Họp Hội đồng Nghiệm thu (Mẫu 4.2) — ${detailAcc?.projectId}`}
        open={Boolean(detailAcc)}
        onCancel={() => setDetailAcc(null)}
        width={800}
        footer={[
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
            onClick={() => printElement('printable-acc-minutes', `BienBan_NT_${detailAcc?.projectId}`)}
          >
            In Biên bản A4
          </Button>,
          <Button key="close" onClick={() => setDetailAcc(null)}>Đóng</Button>,
        ]}
      >
        {detailAcc && (
          <div id="printable-acc-minutes" style={{ padding: 20, backgroundColor: '#fff', border: '1px solid #d9d9d9' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
              HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
            </div>
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 16, color: '#C62828', marginTop: 6 }}>
              BIÊN BẢN HỌP HỘI ĐỒNG ĐÁNH GIÁ NGHIỆM THU ĐỀ TÀI NCKH SINH VIÊN (MẪU 4.2)
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, marginBottom: 14 }}>
              Số biên bản: {detailAcc.minutesNo || `BB-${detailAcc.acceptanceId}/2027`} • QĐ Hội đồng: {detailAcc.council?.decisionNo}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
              <div><b>Tên đề tài:</b> {detailAcc.project?.titleVi} ({detailAcc.projectId})</div>
              <div><b>Hội đồng:</b> {detailAcc.council?.councilName}</div>
              <div><b>Điểm trung bình chính thức (sau kiểm tra độ lệch &gt;15đ):</b> <b style={{ color: '#C62828' }}>{detailAcc.avgScore ? `${Number(detailAcc.avgScore).toFixed(1)}/100` : 'Chưa chốt'}</b></div>
              <div><b>Xếp loại:</b> <b>{GRADE_LABEL[detailAcc.grade || 'PENDING']?.label}</b></div>
            </div>
            <Table
              size="small"
              pagination={false}
              rowKey="sheetId"
              dataSource={detailAcc.sheets || []}
              columns={[
                { title: 'Ủy viên Hội đồng', render: (_: any, s: any) => s.councilMember?.lecturer?.user?.fullName },
                { title: 'Điểm tổng', render: (_: any, s: any) => `${Number(s.totalScore).toFixed(1)}đ` },
                { title: 'Hiệu lực', render: (_: any, s: any) => (s.isOutlier ? 'Loại trừ (>15đ)' : 'Hợp lệ') },
                { title: 'Nhận xét', dataIndex: 'strengths' },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Modal Thành lập Hội đồng */}
      <Modal
        title="Thành lập Hội đồng Nghiệm thu Đề tài NCKH (DFD 5.2)"
        open={councilModalVisible}
        onCancel={() => setCouncilModalVisible(false)}
        onOk={() => councilForm.submit()}
        confirmLoading={submitting}
        okText="Ban hành Hội đồng"
        okButtonProps={{ style: { backgroundColor: '#C62828', borderColor: '#C62828' } }}
      >
        <Form form={councilForm} layout="vertical" onFinish={handleCreateCouncil}>
          <Form.Item name="projectId" label="Đề tài đã nộp tổng kết (SUBMITTED)" rules={[{ required: true }]}>
            <Select placeholder="Chọn đề tài">
              {submittedProjects.map((p) => (
                <Select.Option key={p.project_id} value={p.project_id}>
                  {p.project_id} — {p.title_vi}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="councilName" label="Tên Hội đồng" rules={[{ required: true }]}>
            <Input placeholder="Hội đồng nghiệm thu NCKH Khoa CNTT1 số 02" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="decisionNo" label="Số QĐ thành lập" rules={[{ required: true }]}>
                <Input placeholder="210/QĐ-HV" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="defenseDate" label="Ngày bảo vệ" rules={[{ required: true }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="location" label="Phòng bảo vệ" rules={[{ required: true }]}>
            <Input placeholder="Phòng Hội thảo A2, PTIT" />
          </Form.Item>
          <Form.Item name="chairId" label="Chủ tịch Hội đồng" rules={[{ required: true }]}>
            <Select>
              {lecturers.map((l) => (
                <Select.Option key={l.lecturerId} value={l.lecturerId}>
                  {l.user?.fullName} ({l.department?.deptCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="reviewerId" label="Ủy viên Phản biện" rules={[{ required: true }]}>
            <Select>
              {lecturers.map((l) => (
                <Select.Option key={l.lecturerId} value={l.lecturerId}>
                  {l.user?.fullName} ({l.department?.deptCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="secretaryId" label="Thư ký Hội đồng" rules={[{ required: true }]}>
            <Select>
              {lecturers.map((l) => (
                <Select.Option key={l.lecturerId} value={l.lecturerId}>
                  {l.user?.fullName} ({l.department?.deptCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
