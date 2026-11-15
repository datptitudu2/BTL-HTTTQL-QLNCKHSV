import React, { useState } from 'react';
import { Card, Typography, Collapse, Tabs, Row, Col, Table, Tag, Input, Space, Alert } from 'antd';
import {
  BookOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export const RegulationsPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const articles = [
    {
      key: '1',
      title: 'Điều 1. Phạm vi điều chỉnh và đối tượng áp dụng',
      content:
        'Quy định hoạt động nghiên cứu khoa học (NCKH) của sinh viên trong Học viện Công nghệ Bưu chính Viễn thông: xây dựng kế hoạch, đăng ký đề tài, triển khai thực hiện, nghiệm thu đánh giá, khen thưởng và trách nhiệm/quyền lợi của sinh viên, người hướng dẫn và đơn vị quản lý.',
    },
    {
      key: '2',
      title: 'Điều 2. Mục tiêu hoạt động NCKH của sinh viên',
      content:
        'Nâng cao chất lượng đào tạo, bồi dưỡng tài năng trẻ; rèn luyện tư duy nghiên cứu độc lập, làm việc nhóm và năng lực giải quyết vấn đề thực tiễn gắn với công nghệ mới.',
    },
    {
      key: '4',
      title: 'Điều 4. Nhóm sinh viên thực hiện đề tài',
      content:
        'Mỗi đề tài NCKH của sinh viên có tối đa 05 sinh viên tham gia, trong đó phải xác định rõ 01 sinh viên làm Chủ nhiệm đề tài (chịu trách nhiệm chính) và tối đa 04 thành viên phối hợp. Tổng tỷ lệ phần trăm đóng góp của cả nhóm phải bằng đúng 100% làm căn cứ xét Điểm rèn luyện và khen thưởng.',
    },
    {
      key: '5',
      title: 'Điều 5. Kinh phí thực hiện và thanh quyết toán',
      content:
        'Kinh phí hỗ trợ đề tài NCKH sinh viên trích từ nguồn ngân sách Học viện (định mức dự kiến theo đợt). Chủ nhiệm đề tài và GVHD chịu trách nhiệm sử dụng kinh phí đúng dự toán trong Đề cương chi tiết (Mẫu 2) đã duyệt và hoàn thiện chứng từ thanh quyết toán hợp lệ với Phòng TCKT sau khi nghiệm thu đạt.',
    },
    {
      key: '9',
      title: 'Điều 9. Quy trình Đề xuất, Giao đề tài & Sinh hoạt Khoa học',
      content:
        'Quy trình thực hiện tuần tự gồm: Đăng ký đề tài -> Khoa sơ tuyển lập Mẫu 1 -> P.QLKH&CN tổng hợp trình Giám đốc Học viện ký Quyết định giao đề tài -> Sinh viên nộp Đề cương chi tiết 12 mục (Mẫu 2) để GVHD duyệt Cấp 1 và Lãnh đạo Khoa duyệt Cấp 2 -> Tham gia báo cáo tiến độ tại Sinh hoạt khoa học cấp Khoa/Bộ môn (Biên bản Mẫu 3.5) trước khi nộp Báo cáo tổng kết (Mẫu 3.1 - 3.4).',
    },
    {
      key: '10',
      title: 'Điều 10. Đánh giá, Nghiệm thu (Thang điểm 100 / 7 Tiêu chí)',
      content:
        'Hội đồng Khoa học nghiệm thu chấm điểm độc lập theo Mẫu 4.1 gồm 7 tiêu chí (tổng tối đa 100 điểm). Quy tắc loại trừ chống thiên vị: Phiếu điểm của thành viên Hội đồng chênh lệch > 15 điểm so với điểm trung bình sơ bộ sẽ bị loại khi tính điểm kết luận chung trong Biên bản Mẫu 4.2. Xếp loại: Xuất sắc (≥ 90), Tốt (80 - 89), Khá (70 - 79), Đạt (50 - 69), Không đạt (< 50).',
    },
    {
      key: '13',
      title: 'Điều 13 & Điều 16. Định mức Hướng dẫn & Giờ chuẩn Giảng viên',
      content:
        'Khoản 2 điểm a Điều 16: Mỗi giảng viên hướng dẫn được hướng dẫn tối đa 02 đề tài NCKH sinh viên đang thực hiện trong cùng một thời gian (không tính các đề tài đã nghiệm thu xong ACCEPTED hoặc bị hủy/từ chối). Sau khi đề tài nghiệm thu đạt yêu cầu, GVHD được quy đổi 20 giờ chuẩn NCKH/đề tài và hỗ trợ 50% chi phí đăng ký sở hữu trí tuệ nếu có sản phẩm công bố.',
    },
    {
      key: '14',
      title: 'Điều 14 & Điều 15. Định mức Sinh viên & Quyền lợi Khen thưởng',
      content:
        'Khoản 2 điểm a Điều 15: Mỗi sinh viên chỉ được tham gia tối đa 01 đề tài NCKH sinh viên trong một năm học (bao gồm cả vai trò Chủ nhiệm lẫn Thành viên phối hợp). Sinh viên có đề tài nghiệm thu đạt loại Khá trở lên được cấp Giấy chứng nhận NCKH, xét cộng tối đa +10 Điểm rèn luyện (P.CT&CTSV) và cộng điểm TBC xét học bổng (Cấp Học viện: Nhất +0.4đ, Nhì +0.3đ, Ba +0.2đ; Giải thưởng Quốc tế: Nhất +3.0đ, Nhì +2.5đ, Ba +2.0đ).',
    },
  ];

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      a.content.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const gradingData = [
    { key: '1', range: '90.0 - 100', grade: 'Xuất sắc', color: 'green', cert: 'Có + Xét khen thưởng cấp HV / Bộ', bonus: '+10 ĐRL; Giải Nhất +0.4đ' },
    { key: '2', range: '80.0 - 89.9', grade: 'Tốt', color: 'blue', cert: 'Có + Xét giải Nhì/Ba cấp HV', bonus: '+10 ĐRL; Giải Nhì +0.3đ / Ba +0.2đ' },
    { key: '3', range: '70.0 - 79.9', grade: 'Khá', color: 'cyan', cert: 'Có (Đủ điều kiện cấp GCN)', bonus: 'Cộng ĐRL theo khung Khoa/CTSV' },
    { key: '4', range: '50.0 - 69.9', grade: 'Đạt', color: 'orange', cert: 'Không cấp GCN (Công nhận hoàn thành)', bonus: 'Hoàn tất thanh quyết toán kinh phí' },
    { key: '5', range: '< 50.0', grade: 'Không đạt', color: 'red', cert: 'Không', bonus: 'Không xét quyền lợi & giờ chuẩn thưởng' },
  ];

  const isoControls = [
    {
      key: 'iso-1',
      code: 'ISO-7.5 / Kiểm soát Phiên bản & Phê duyệt 2 cấp',
      scope: 'Quản lý Đề cương (Mẫu 2)',
      desc: 'Mọi bản thuyết minh đề cương đều đánh số phiên bản tăng dần (v1, v2...) và chỉ có hiệu lực triển khai sau khi vượt qua đủ 2 chốt kiểm soát độc lập: GVHD (Cấp 1) → Lãnh đạo Khoa (Cấp 2).',
    },
    {
      key: 'iso-2',
      code: 'ISO-8.5 / Khóa Toàn vẹn Kết quả Nghiệm thu',
      scope: 'Nghiệm thu & Đánh giá (Mẫu 4.1 - 4.2)',
      desc: 'CSDL PostgreSQL gắn trigger khóa bất biến (ACCEPTANCE_LOCKED): một khi Biên bản Hội đồng 4.2 đã phê duyệt hoặc Đề tài chuyển trạng thái ACCEPTED, hệ thống từ chối mọi thao tác sửa/xóa phiếu chấm điểm.',
    },
    {
      key: 'iso-3',
      code: 'ISO-7.5.2 / Quy chuẩn Định danh Mã Hồ sơ',
      scope: 'Toàn hệ thống SRMS',
      desc: 'Mỗi đề tài được cấp duy nhất 01 mã định danh tự động qua bộ đếm nguyên tử ProjectCodeCounter theo cấu trúc SV-<Năm>-<MãKhoa>-<STT 3 chữ số> (VD: SV-2026-CNTT1-001), tránh trùng lặp hoặc cấp sai khoa.',
    },
    {
      key: 'iso-4',
      code: 'ISO-9.1 / Truy vết Nhật ký Kiểm toán (AuditLog)',
      scope: 'Bảo mật & Thanh quyết toán',
      desc: 'Mọi hành động thay đổi trạng thái đề tài, điều chỉnh kinh phí, duyệt chứng từ tài chính và cộng điểm ĐRL đều lưu vết tác nhân, thời điểm và dữ liệu biến động vào bảng audit_logs.',
    },
    {
      key: 'iso-5',
      code: 'ISO-8.6 / Xác thực Văn bằng & Minh chứng Số QR',
      scope: 'Giấy Chứng nhận & Cổng GWDU',
      desc: 'Giấy chứng nhận NCKH sinh viên gắn mã định danh duy nhất và QR công khai dẫn tới /verify/:certCode để đơn vị tuyển dụng hoặc P.CT&CTSV đối soát tức thời chống làm giả.',
    },
  ];

  const tabItems = [
    {
      key: 'summary',
      label: (
        <span>
          <AuditOutlined /> Tóm tắt Định mức & Thang điểm QĐ 521
        </span>
      ),
      children: (
        <div>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ borderColor: '#FADCD5', backgroundColor: '#FFF7F5' }}>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Định mức Sinh viên (Điều 15.2.a)</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#C62828', marginTop: 4 }}>01 đề tài / năm học</div>
                <div style={{ fontSize: 11, color: '#595959' }}>Tính cả vai trò Chủ nhiệm & Thành viên</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ borderColor: '#FADCD5', backgroundColor: '#FFF7F5' }}>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Định mức GVHD (Điều 16.2.a)</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#C62828', marginTop: 4 }}>Tối đa 02 đề tài</div>
                <div style={{ fontSize: 11, color: '#595959' }}>Đề tài đang thực hiện cùng thời gian</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ borderColor: '#E6F4FF', backgroundColor: '#F5FAFF' }}>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Quy mô Nhóm (Điều 4)</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0958D9', marginTop: 4 }}>Tối đa 05 SV / đề tài</div>
                <div style={{ fontSize: 11, color: '#595959' }}>01 Chủ nhiệm + ≤ 04 Thành viên (Tổng 100%)</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ borderColor: '#D9F7BE', backgroundColor: '#F6FFED' }}>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Chấm điểm & Loại trừ (Điều 10)</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#389E0D', marginTop: 4 }}>7 tiêu chí / 100đ</div>
                <div style={{ fontSize: 11, color: '#595959' }}>Loại phiếu lệch &gt; 15đ so với TB ban đầu</div>
              </Card>
            </Col>
          </Row>

          <Title level={5} style={{ marginBottom: 10 }}>Bảng Xếp loại Nghiệm thu & Quyền lợi Khen thưởng</Title>
          <Table
            size="small"
            pagination={false}
            dataSource={gradingData}
            columns={[
              { title: 'Khoảng điểm', dataIndex: 'range', width: 130, render: (v) => <b>{v}</b> },
              {
                title: 'Xếp loại',
                dataIndex: 'grade',
                width: 130,
                render: (v, r: any) => <Tag color={r.color} style={{ fontWeight: 600 }}>{v}</Tag>,
              },
              { title: 'Cấp Giấy chứng nhận', dataIndex: 'cert' },
              { title: 'Quyền lợi ĐRL / Học bổng', dataIndex: 'bonus' },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'articles',
      label: (
        <span>
          <BookOutlined /> Chi tiết Điều khoản QĐ 521/QĐ-HV
        </span>
      ),
      children: (
        <div>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm nhanh theo điều khoản, định mức, điểm rèn luyện, nghiệm thu..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ marginBottom: 14, maxWidth: 460 }}
          />
          <Collapse
            defaultActiveKey={['4', '10', '13', '14']}
            items={filteredArticles.map((a) => ({
              key: a.key,
              label: <b style={{ color: '#C62828' }}>{a.title}</b>,
              children: <Paragraph style={{ fontSize: 13, lineHeight: 1.65, margin: 0 }}>{a.content}</Paragraph>,
            }))}
          />
        </div>
      ),
    },
    {
      key: 'iso',
      label: (
        <span>
          <SafetyCertificateOutlined /> Quy chuẩn ISO 9001:2015 & Toàn vẹn Số
        </span>
      ),
      children: (
        <div>
          <Alert
            type="info"
            showIcon
            icon={<CheckCircleOutlined style={{ color: '#C62828' }} />}
            style={{ marginBottom: 16, backgroundColor: '#FFF7F5', borderColor: '#FADCD5' }}
            message={<b>Áp dụng Hệ thống Quản lý Chất lượng ISO 9001:2015 trong NCKH Sinh viên PTIT</b>}
            description="Tất cả quy tắc trong QĐ 521 được số hóa thành ràng buộc kiểm soát trực tiếp tại tầng API và PostgreSQL để đảm bảo tính minh bạch, truy vết và chống chỉnh sửa hồi tố."
          />

          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {isoControls.map((item) => (
              <Card key={item.key} size="small" style={{ borderRadius: 6, borderLeft: '4px solid #C62828' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                  <Text strong style={{ color: '#C62828' }}>{item.code}</Text>
                  <Tag>{item.scope}</Tag>
                </div>
                <Text style={{ fontSize: 13, color: '#595959' }}>{item.desc}</Text>
              </Card>
            ))}
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
          Quy định 521/QĐ-HV & Quy chuẩn Quản trị Chất lượng ISO
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Tra cứu nhanh định mức tham gia, thang điểm nghiệm thu, quyền lợi khen thưởng theo QĐ 521/QĐ-HV (17/07/2020) và nguyên tắc kiểm soát ISO trên SRMS.
        </Text>
      </div>

      <Card style={{ borderRadius: 8 }}>
        <Tabs defaultActiveKey="summary" items={tabItems} />
      </Card>
    </div>
  );
};
