import React from 'react';
import { Card, Typography, Collapse, Alert } from 'antd';

const { Title, Text, Paragraph } = Typography;

export const RegulationsPage: React.FC = () => {
  const articles = [
    { key: '1', title: 'Điều 1. Phạm vi điều chỉnh và đối tượng áp dụng', content: 'Văn bản này quy định về hoạt động nghiên cứu khoa học (NCKH) của sinh viên trong Học viện Công nghệ Bưu chính Viễn thông bao gồm: xây dựng và thực hiện kế hoạch; quản lý hoạt động NCKH; trách nhiệm và quyền của sinh viên tham gia và người hướng dẫn.' },
    { key: '2', title: 'Điều 2. Mục tiêu hoạt động NCKH của sinh viên', content: 'Nâng cao chất lượng đào tạo, bồi dưỡng nhân tài; phát huy tính năng động, sáng tạo, khả năng NCKH độc lập; góp phần tạo ra tri thức và sản phẩm mới cho xã hội.' },
    { key: '5', title: 'Điều 5. Tài chính cho hoạt động NCKH của sinh viên', content: 'Kinh phí hỗ trợ từ ngân sách Học viện; Đối với đề tài NCKH, chủ trì đề tài và người hướng dẫn phải chịu trách nhiệm trước Trưởng khoa về việc sử dụng kinh phí theo dự toán trong đề cương đã phê duyệt; làm thủ tục thanh quyết toán khi đề tài được nghiệm thu đạt.' },
    { key: '9', title: 'Điều 9. Xác định danh mục đề tài, giao đề tài và triển khai thực hiện', content: 'Định mức GVHD: Mỗi đề tài NCKH của sinh viên do một (01) người hướng dẫn, mỗi giảng viên hướng dẫn tối đa 02 đề tài NCKH sinh viên trong cùng thời gian; Quy mô nhóm: Mỗi đề tài có không quá năm (05) sinh viên tham gia, trong đó phải xác định một sinh viên chịu trách nhiệm chính (chủ trì đề tài); Biểu mẫu liên quan: Mẫu 1 (Đề xuất Khoa), Mẫu 2 (Đề cương chi tiết), Mẫu 3.1-3.5 (Báo cáo tổng kết, tóm tắt, hội thảo khoa học).' },
    { key: '10', title: 'Điều 10. Tổ chức đánh giá đề tài NCKH của sinh viên', content: 'Hội đồng khoa học khoa/bộ môn tổ chức đánh giá, nghiệm thu. Điểm đánh giá độc lập thang điểm 100 theo 7 tiêu chí Phiếu đánh giá (Mẫu 4.1). Quy tắc loại trừ: Điểm của thành viên Hội đồng chênh lệch > 15 điểm so với điểm trung bình ban đầu coi là điểm không hợp lệ và không được tính vào tổng số điểm hợp lệ. Xếp loại: Xuất sắc (≥ 90đ), Tốt (80 - 89đ), Khá (70 - 79đ), Đạt (50 - 69đ), Không đạt (< 50đ).' },
    { key: '15', title: 'Điều 15. Trách nhiệm và quyền của sinh viên tham gia NCKH', content: 'Sinh viên được cấp Giấy chứng nhận tham gia NCKH khi đề tài đạt loại Khá trở lên; được cộng điểm thưởng vào điểm TBC học tập để xét học bổng: Quốc tế (Giải nhất: 3.0đ, Giải nhì: 2.5đ, Giải ba: 2.0đ); Trong nước (Giải nhất: 0.4đ, Giải nhì: 0.3đ, Giải ba: 0.2đ); hỗ trợ kinh phí chuẩn bị hồ sơ dự thi tối đa 1.000.000đ/đề tài.' },
    { key: '16', title: 'Điều 16. Trách nhiệm và quyền của người hướng dẫn sinh viên NCKH', content: 'Được tính giờ chuẩn NCKH sau khi hoàn thành việc hướng dẫn sinh viên NCKH; được hỗ trợ 50% phí đăng ký bảo hộ quyền tác giả; được ưu tiên xét các danh hiệu thi đua và hình thức khen thưởng.' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#262626' }}>
          Quy định 521/QĐ-HV về Hoạt động NCKH của Sinh viên PTIT
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Ban hành kèm theo Quyết định số 521/QĐ-HV ngày 17/07/2020 của Giám đốc Học viện Công nghệ Bưu chính Viễn thông
        </Text>
      </div>

      <Alert
        message="Văn bản pháp lý nền tảng của Hệ thống SRMS"
        description="Mọi quy tắc kiểm tra ràng buộc (quota GVHD max 2, nhóm max 5 SV, thang điểm 100 theo 7 tiêu chí Mẫu 4.1, loại trừ điểm lệch > 15đ) đều được lập trình tự động hóa tuân thủ nghiêm ngặt theo QĐ 521."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card style={{ borderRadius: 8 }}>
        <Collapse
          defaultActiveKey={['9', '10', '15', '16']}
          items={articles.map((a) => ({
            key: a.key,
            label: <b style={{ color: '#C62828' }}>{a.title}</b>,
            children: <Paragraph style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{a.content}</Paragraph>,
          }))}
        />
      </Card>
    </div>
  );
};

