import React from 'react';
import { Typography } from 'antd';

const { Paragraph } = Typography;

interface QD521Props {
  project: any;
}

export const Mau1CongVanKhoa: React.FC<QD521Props> = ({ project }) => {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '32px 40px', border: '1px solid #d9d9d9', maxWidth: 850, margin: '0 auto', fontFamily: '"Times New Roman", Times, serif', color: '#000000', lineHeight: 1.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
          <div style={{ fontSize: 13, fontWeight: 'bold', textDecoration: 'underline' }}>{project?.departments?.dept_name?.toUpperCase() || 'KHOA CÔNG NGHỆ THÔNG TIN 1'}</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>Số: 45/HV-CNTT1</div>
          <div style={{ fontSize: 12 }}>V/v: Đăng ký đề tài NCKH của sinh viên năm học 2026-2027</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: 13, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
          <div style={{ fontSize: 13, fontStyle: 'italic', marginTop: 8 }}>Hà Nội, ngày 10 tháng 09 năm 2026</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '24px 0 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 'bold' }}>Mẫu 1. Công văn đăng ký đề tài NCKH của sinh viên</div>
        <div style={{ fontSize: 15, fontWeight: 'bold', marginTop: 12 }}>Kính gửi: Phòng Quản lý Khoa học công nghệ và Hợp tác quốc tế</div>
      </div>

      <Paragraph style={{ textIndent: 30, fontSize: 14 }}>
        Thực hiện kế hoạch hoạt động nghiên cứu khoa học của sinh viên năm học 2026-2027, {project?.departments?.dept_name || 'Khoa Công nghệ thông tin 1'} đăng ký thực hiện đề tài NCKH của sinh viên với số lượng cụ thể như sau:
      </Paragraph>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }} border={1}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
            <th style={{ padding: 6, width: 40 }}>STT</th>
            <th style={{ padding: 6 }}>Tên đề tài</th>
            <th style={{ padding: 6, width: 170 }}>Người hướng dẫn</th>
            <th style={{ padding: 6, width: 110 }}>Thuộc lĩnh vực KHCN</th>
            <th style={{ padding: 6 }}>Mục tiêu đề tài</th>
            <th style={{ padding: 6, width: 100 }}>Dự kiến kinh phí (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: 'center', padding: 6 }}>1</td>
            <td style={{ padding: 6, fontWeight: 'bold' }}>{project?.title_vi}</td>
            <td style={{ padding: 6 }}>
              {project?.project_advisors?.[0]?.lecturers?.academic_rank ? project.project_advisors[0].lecturers.academic_rank + '. ' : ''}
              {project?.project_advisors?.[0]?.lecturers?.users?.full_name || 'TS. Ngô Quốc Dũng'}
              <br /><span style={{ fontSize: 11, color: '#555' }}>dungnq@ptit.edu.vn</span>
            </td>
            <td style={{ padding: 6, textAlign: 'center' }}>{project?.research_field || 'Công nghệ thông tin'}</td>
            <td style={{ padding: 6 }}>{project?.objectives || 'Xây dựng hệ thống web quản lý đề tài NCKH SV theo QĐ 521'}</td>
            <td style={{ padding: 6, textAlign: 'right', fontWeight: 'bold' }}>
              {Number(project?.budgets?.faculty_proposed || 5000000).toLocaleString('vi-VN')}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, textAlign: 'center' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 13 }}>CHỦ TỊCH HỘI ĐỒNG KHOA HỌC KHOA</div>
          <div style={{ fontStyle: 'italic', fontSize: 12 }}>(Ký, ghi rõ họ tên)</div>
          <div style={{ marginTop: 60, fontWeight: 'bold' }}>PGS.TS. Hoàng Minh</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 13 }}>TRƯỞNG KHOA</div>
          <div style={{ fontStyle: 'italic', fontSize: 12 }}>(Ký, ghi rõ họ tên)</div>
          <div style={{ marginTop: 60, fontWeight: 'bold' }}>Trần Đình Trưởng Khoa</div>
        </div>
      </div>
    </div>
  );
};

export const Mau2DeCuongChiTiet: React.FC<QD521Props> = ({ project }) => {
  const leader = project?.project_members?.find((m: any) => m.member_role === 'LEADER');
  const advisor = project?.project_advisors?.[0];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        padding: '36px 44px',
        border: '1px solid #d9d9d9',
        maxWidth: 850,
        margin: '0 auto',
        fontFamily: '"Times New Roman", Times, serif',
        color: '#000000',
        lineHeight: 1.6,
      }}
    >
      {/* QUỐC HIỆU & TIÊU NGỮ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ textAlign: 'center', width: '48%' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>BỘ KHOA HỌC VÀ CÔNG NGHỆ</div>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>
            {project?.departments?.dept_name?.toUpperCase() || 'KHOA CÔNG NGHỆ THÔNG TIN 1'}
          </div>
        </div>
        <div style={{ textAlign: 'center', width: '48%' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
          <div style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>Hà Nội, ngày 15 tháng 10 năm 2026</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0 22px' }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#595959' }}>
          Mẫu 2. Bản thuyết minh đề cương đề tài NCKH sinh viên (Ban hành kèm theo QĐ 521/QĐ-HV)
        </div>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 8, letterSpacing: '0.5px' }}>
          BẢN THUYẾT MINH ĐỀ CƯƠNG ĐỀ TÀI NGHIÊN CỨU KHOA HỌC SINH VIÊN
        </div>
        <div style={{ fontSize: 13, fontStyle: 'italic', marginTop: 2 }}>Năm học: 2026 - 2027</div>
      </div>

      {/* 12 MỤC ĐỀ CƯƠNG CHI TIẾT ĐẦY ĐỦ THÔNG TIN MÔ TẢ THEO ĐÚNG ĐẶC TẢ */}
      <div style={{ fontSize: 13, textAlign: 'justify', lineHeight: 1.65 }}>
        <p>
          <b>1. Tên đề tài nghiên cứu:</b> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{project?.title_vi}</span>
        </p>
        <p style={{ textIndent: 20 }}>
          <i>Tên tiếng Anh:</i> {project?.title_en || 'Research and development of Student Research Management System for PTIT (SRMS)'}
        </p>
        <p style={{ textIndent: 20 }}>
          <i>Mã số đề tài quản lý:</i> <b>{project?.project_id || 'SV-2026-CNTT1-001'}</b>
        </p>

        <p>
          <b>2. Lĩnh vực khoa học & công nghệ:</b> {project?.research_field || 'Khoa học máy tính & Công nghệ thông tin'} •{' '}
          <i>Từ khóa:</i> {project?.keywords || 'SRMS, S-Link, QĐ 521, PTIT, Monorepo, NestJS, React'}
        </p>

        <p>
          <b>3. Tính cấp thiết của đề tài:</b> {project?.urgency || 'Hoạt động NCKH của sinh viên Học viện đóng vai trò then chốt trong việc nâng cao chất lượng đào tạo và thúc đẩy đổi mới sáng tạo. Tuy nhiên, quy trình quản lý hiện nay còn phân tán qua nhiều biểu mẫu giấy tờ thủ công, gây chậm trễ trong các khâu thẩm định đề cương, giám sát tiến độ và thanh quyết toán kinh phí. Do đó, việc xây dựng một hệ thống web quản lý đề tài NCKH sinh viên đồng bộ theo Quy định 521/QĐ-HV và tích hợp cổng định danh S-Link PTIT là nhiệm vụ vô cùng cấp thiết, đáp ứng chiến lược chuyển đổi số toàn diện của Học viện.'}
        </p>

        <p>
          <b>4. Mục tiêu nghiên cứu:</b>
        </p>
        <div style={{ paddingLeft: 20, marginBottom: 8 }}>
          <p>
            • <i>Mục tiêu chung:</i> {project?.objectives || 'Xây dựng giải pháp web quản lý vòng đời đề tài NCKH sinh viên theo chuẩn QĐ 521/QĐ-HV tích hợp hệ sinh thái số S-Link PTIT.'}
          </p>
          <p>
            • <i>Mục tiêu cụ thể:</i> Chuẩn hóa toàn diện quy trình vòng đời đề tài NCKH, thiết kế kiến trúc giải pháp và mô hình dữ liệu tổng thể, hiện thực hóa các phân hệ cốt lõi gồm: Đăng ký đề tài trực tuyến, Thẩm định đề cương 12 mục, Giám sát tiến độ & Sinh hoạt KH định kỳ, Hội đồng đánh giá nghiệm thu theo 7 tiêu chí, Quyết toán kinh phí tài chính và Quản lý khen thưởng theo Quyết định 521/QĐ-HV.
          </p>
        </div>

        <p>
          <b>5. Đối tượng và phạm vi nghiên cứu:</b>
        </p>
        <div style={{ paddingLeft: 20, marginBottom: 8 }}>
          <p>• <i>Đối tượng & Phạm vi:</i> {project?.targetScope || 'Đối tượng: Quy trình quản trị hoạt động NCKH sinh viên tại các Khoa đào tạo và Phòng Quản lý Khoa học Công nghệ Học viện. Phạm vi: Toàn bộ sinh viên hệ đại học chính quy, giảng viên hướng dẫn và các phòng ban chức năng tại cơ sở Hà Đông và cơ sở TP. Hồ Chí Minh.'}</p>
        </div>

        <p>
          <b>6. Cách tiếp cận và phương pháp nghiên cứu:</b>
        </p>
        <div style={{ paddingLeft: 20, marginBottom: 8 }}>
          <p>• <i>Cách tiếp cận & Phương pháp:</i> {project?.methodology || 'Tiếp cận hướng chuẩn hóa quy trình quản trị đại học số kết hợp thiết kế trải nghiệm người dùng S-Link. Phương pháp mô hình hóa nghiệp vụ chuyên sâu, phương pháp phát triển phần mềm hiện đại Agile/Scrum, kiểm thử chất lượng đa tầng và đánh giá an toàn thông tin bảo mật dữ liệu.'}</p>
        </div>

        <p>
          <b>7. Nội dung nghiên cứu chi tiết:</b> {project?.content || 'Khảo sát hiện trạng, chuẩn hóa hệ thống biểu mẫu nghiệp vụ QĐ 521, xây dựng kiến trúc hệ thống và mô hình dữ liệu tổng thể, phát triển các dịch vụ xử lý nghiệp vụ trung tâm, hoàn thiện giao diện ứng dụng trực tuyến và tích hợp số hóa biểu mẫu, mã QR xác thực và in ấn văn bản hành chính A4 chuẩn quy định.'}
        </p>

        <p>
          <b>8. Sản phẩm dự kiến và địa chỉ ứng dụng:</b>
        </p>
        <div style={{ paddingLeft: 20, marginBottom: 8 }}>
          <p>• <i>Sản phẩm dự kiến:</i> {project?.expectedResult || project?.expected_result || '01 Báo cáo tổng kết hoàn chỉnh (Mẫu 3.3), 01 Báo cáo tóm tắt (Mẫu 3.4), 01 Bài báo khoa học đăng trên kỷ yếu Hội nghị sinh viên NCKH PTIT, 01 Hệ thống phần mềm web SRMS hoạt động ổn định trên máy chủ Học viện.'}</p>
          <p>• <i>Địa chỉ ứng dụng:</i> {project?.applicationAddress || project?.application_address || 'Triển khai tại Phòng Quản lý Khoa học Công nghệ và các Khoa đào tạo Học viện Công nghệ Bưu chính Viễn thông.'}</p>
        </div>

        <p>
          <b>9. Đơn vị chủ trì & Đơn vị phối hợp:</b>
        </p>
        <div style={{ paddingLeft: 20, marginBottom: 8 }}>
          <p>• <i>Đơn vị chủ trì:</i> {project?.departments?.dept_name || 'Khoa Công nghệ thông tin 1'}</p>
          <p>• <i>Đơn vị phối hợp:</i> Phòng Quản lý Khoa học Công nghệ & Hợp tác Quốc tế, Phòng Tài chính - Kế toán, Trung tâm Dịch vụ Số.</p>
        </div>

        <p>
          <b>10. Thông tin Chủ trì đề tài & Nhóm nghiên cứu:</b>
        </p>
        <div style={{ paddingLeft: 20, marginBottom: 8 }}>
          <p>
            • <b>Chủ nhiệm đề tài:</b> {leader?.students?.users?.full_name || 'Nguyễn Văn An'} &nbsp;&nbsp;|&nbsp;&nbsp; 
            Mã SV: <b>{leader?.student_id || 'B23DCCN001'}</b> &nbsp;&nbsp;|&nbsp;&nbsp; 
            Lớp: <b>{leader?.students?.class_name || 'D23CQCN01-B'}</b> &nbsp;&nbsp;|&nbsp;&nbsp; 
            Email: {leader?.students?.users?.email || 'an.nv@stu.ptit.edu.vn'}
          </p>
          <p>• <b>Danh sách thành viên phối hợp:</b></p>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '6px 0 10px', fontSize: 12 }} border={1}>
            <thead>
              <tr style={{ backgroundColor: '#F2F2F2', textAlign: 'center' }}>
                <th style={{ padding: 4 }}>STT</th>
                <th style={{ padding: 4 }}>Họ và tên</th>
                <th style={{ padding: 4 }}>Mã sinh viên</th>
                <th style={{ padding: 4 }}>Lớp</th>
                <th style={{ padding: 4 }}>Đóng góp (%)</th>
                <th style={{ padding: 4 }}>Nhiệm vụ phân công cụ thể</th>
              </tr>
            </thead>
            <tbody>
              {project?.project_members?.map((m: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center', padding: 4 }}>{idx + 1}</td>
                  <td style={{ padding: 4 }}><b>{m.students?.users?.full_name}</b> {m.member_role === 'LEADER' ? '(Chủ nhiệm)' : ''}</td>
                  <td style={{ textAlign: 'center', padding: 4 }}>{m.student_id}</td>
                  <td style={{ textAlign: 'center', padding: 4 }}>{m.students?.class_name || 'D23CQCN01-B'}</td>
                  <td style={{ textAlign: 'center', padding: 4 }}><b>{m.contribution_pct}%</b></td>
                  <td style={{ padding: 4 }}>{m.assigned_task || m.tasks_assigned || 'Xây dựng module chức năng và kiểm thử'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          <b>11. Cán bộ hướng dẫn khoa học:</b>{' '}
          {advisor?.lecturers?.academic_rank ? advisor.lecturers.academic_rank + '. ' : ''}
          <b>{advisor?.lecturers?.users?.full_name || 'TS. Ngô Quốc Dũng'}</b> &nbsp;&nbsp;|&nbsp;&nbsp; 
          Học vị: {advisor?.lecturers?.degree || 'Tiến sĩ'} &nbsp;&nbsp;|&nbsp;&nbsp; 
          Bộ môn: Hệ thống thông tin & Mạng máy tính &nbsp;&nbsp;|&nbsp;&nbsp; 
          Email: {advisor?.lecturers?.users?.email || 'dungnq@ptit.edu.vn'}
        </p>

        <p>
          <b>12. Dự toán kinh phí thực hiện đề tài:</b> (Tổng mức đề nghị: <b>{Number(project?.requested_budget || 5000000).toLocaleString('vi-VN')} VNĐ</b>)
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '6px 0 16px', fontSize: 12 }} border={1}>
          <thead>
            <tr style={{ backgroundColor: '#F2F2F2', textAlign: 'center' }}>
              <th style={{ padding: 4, width: 40 }}>STT</th>
              <th style={{ padding: 4 }}>Nội dung các khoản mục chi theo QĐ 521</th>
              <th style={{ padding: 4, width: 140 }}>Thành tiền (VNĐ)</th>
              <th style={{ padding: 4, width: 220 }}>Ghi chú / Chứng từ dự kiến</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center' }}>1</td>
              <td>Xây dựng và hoàn thiện thuyết minh đề cương nghiên cứu chi tiết</td>
              <td style={{ textAlign: 'right', paddingRight: 8 }}>1,000,000</td>
              <td>Biên bản nghiệm thu đề cương</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>2</td>
              <td>Khảo sát số liệu, thu thập tài liệu và viết báo cáo kết quả nghiên cứu</td>
              <td style={{ textAlign: 'right', paddingRight: 8 }}>2,000,000</td>
              <td>Bản thảo báo cáo khoa học</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>3</td>
              <td>Tổ chức sinh hoạt khoa học, hội thảo báo cáo tiến độ cấp Khoa (Mẫu 3.5)</td>
              <td style={{ textAlign: 'right', paddingRight: 8 }}>1,000,000</td>
              <td>Biên bản sinh hoạt khoa học cấp Khoa</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>4</td>
              <td>Hội đồng đánh giá nghiệm thu đề tài cấp Khoa (05 thành viên)</td>
              <td style={{ textAlign: 'right', paddingRight: 8 }}>700,000</td>
              <td>Phiếu chấm điểm Mẫu 4.1 & 4.2</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>5</td>
              <td>Chi phí văn phòng phẩm, photocopy tài liệu, đóng quyển báo cáo tổng kết</td>
              <td style={{ textAlign: 'right', paddingRight: 8 }}>300,000</td>
              <td>Hóa đơn VAT tài chính hợp lệ</td>
            </tr>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#FAFAFA' }}>
              <td colSpan={2} style={{ textAlign: 'center', padding: 6 }}>TỔNG CỘNG KINH PHÍ ĐỀ XUẤT</td>
              <td style={{ textAlign: 'right', paddingRight: 8, color: '#C62828' }}>5,000,000</td>
              <td style={{ fontStyle: 'italic', fontSize: 11 }}>Bằng chữ: Năm triệu đồng chẵn</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CHỮ KÝ 3 BÊN THEO CHUẨN MẪU 2 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, textAlign: 'center', fontSize: 13 }}>
        <div style={{ width: '30%' }}>
          <div style={{ fontWeight: 'bold' }}>CHỦ NHIỆM ĐỀ TÀI</div>
          <div style={{ fontStyle: 'italic', fontSize: 11 }}>(Ký và ghi rõ họ tên)</div>
          <div style={{ marginTop: 52, fontWeight: 'bold' }}>{leader?.students?.users?.full_name || 'Nguyễn Văn An'}</div>
        </div>
        <div style={{ width: '35%' }}>
          <div style={{ fontWeight: 'bold' }}>GIÁNG VIÊN HƯỚNG DẪN</div>
          <div style={{ fontStyle: 'italic', fontSize: 11 }}>(Ký và ghi rõ họ tên)</div>
          <div style={{ marginTop: 52, fontWeight: 'bold' }}>{advisor?.lecturers?.users?.full_name || 'TS. Ngô Quốc Dũng'}</div>
        </div>
        <div style={{ width: '35%' }}>
          <div style={{ fontWeight: 'bold' }}>TRƯỞNG KHOA CHỦ TRÌ</div>
          <div style={{ fontStyle: 'italic', fontSize: 11 }}>(Ký duyệt và đóng dấu)</div>
          <div style={{ marginTop: 52, fontWeight: 'bold' }}>PGS.TS. Trần Đình Quế</div>
        </div>
      </div>
    </div>
  );
};

export const Mau3BiaBaoCao: React.FC<QD521Props> = ({ project }) => {
  const leader = project?.project_members?.find((m: any) => m.member_role === 'LEADER');
  const advisor = project?.project_advisors?.[0];

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '40px', border: '2px solid #000000', maxWidth: 750, margin: '0 auto', fontFamily: '"Times New Roman", Times, serif', color: '#000000', minHeight: 900, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 'bold' }}>BỘ KHOA HỌC VÀ CÔNG NGHỆ</div>
        <div style={{ fontSize: 15, fontWeight: 'bold', marginTop: 4 }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
        <div style={{ fontSize: 13, fontWeight: 'bold', marginTop: 4 }}>{project?.departments?.dept_name?.toUpperCase() || 'KHOA CÔNG NGHỆ THÔNG TIN 1'}</div>
        <div style={{ width: 120, height: 1, backgroundColor: '#000000', margin: '8px auto' }} />
      </div>

      <div style={{ margin: '60px 0' }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', letterSpacing: 1 }}>BÁO CÁO TỔNG KẾT</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>ĐỀ TÀI NGHIÊN CỨU KHOA HỌC CỦA SINH VIÊN</div>
        <div style={{ fontSize: 14, fontStyle: 'italic', marginTop: 4 }}>NĂM HỌC 2026 - 2027</div>

        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#000000', margin: '40px 0 16px', padding: '0 20px', lineHeight: 1.4 }}>
          {project?.title_vi?.toUpperCase()}
        </div>
        <div style={{ fontSize: 15, fontWeight: 'bold' }}>Mã số đề tài: {project?.project_id}</div>
        <div style={{ fontSize: 13, fontStyle: 'italic', marginTop: 8 }}>Thuộc nhóm ngành khoa học: {project?.research_field || 'Công nghệ thông tin'}</div>
      </div>

      <div style={{ textAlign: 'left', paddingLeft: 80, fontSize: 14, lineHeight: 1.8 }}>
        <div><b>Sinh viên thực hiện:</b> {leader?.students?.users?.full_name || 'Nguyễn Văn An'} &nbsp;&nbsp;&nbsp;&nbsp; <b>Nam/Nữ:</b> Nam</div>
        <div><b>Lớp, khoa:</b> {leader?.students?.class_name || 'D23CQCN01-B'}, {project?.departments?.dept_name || 'Khoa CNTT 1'} &nbsp;&nbsp;&nbsp;&nbsp; <b>Năm thứ:</b> 3 / 5</div>
        <div><b>Người hướng dẫn:</b> {advisor?.lecturers?.academic_rank ? advisor.lecturers.academic_rank + '. ' : ''}{advisor?.lecturers?.users?.full_name || 'TS. Ngô Quốc Dũng'}</div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 60 }}>
        HÀ NỘI, THÁNG 04/2027
      </div>
    </div>
  );
};

export interface Mau41Props {
  project?: any;
  evaluator?: {
    name?: string;
    role?: string;
    score1?: number;
    score2?: number;
    score3?: number;
    score4?: number;
    score5?: number;
    score6?: number;
    score7?: number;
    comment?: string;
    date?: string;
  };
  printableId?: string;
}

export const Mau41PhieuDanhGia: React.FC<Mau41Props> = ({ project, evaluator, printableId = 'mau41-phieu-danh-gia' }) => {
  const memberName = evaluator?.name || 'PGS.TS. Hoàng Minh';
  const memberRole = evaluator?.role || 'Chủ tịch Hội đồng';
  const s1 = evaluator?.score1 ?? 9.5;
  const s2 = evaluator?.score2 ?? 14.5;
  const s3 = evaluator?.score3 ?? 14.0;
  const s4 = evaluator?.score4 ?? 33.0;
  const s5 = evaluator?.score5 ?? 14.0;
  const s6 = evaluator?.score6 ?? 5.0;
  const s7 = evaluator?.score7 ?? 4.5;
  const totalScore = Number((s1 + s2 + s3 + s4 + s5 + s6 + s7).toFixed(1));
  const grade = totalScore >= 90 ? 'Xuất sắc' : totalScore >= 80 ? 'Tốt' : totalScore >= 70 ? 'Khá' : 'Đạt';

  return (
    <div
      id={printableId}
      style={{
        backgroundColor: '#ffffff',
        padding: '32px 40px',
        border: '1px solid #d9d9d9',
        maxWidth: 850,
        margin: '0 auto',
        fontFamily: '"Times New Roman", Times, serif',
        color: '#000000',
        lineHeight: 1.5,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>HỘI ĐỒNG ĐÁNH GIÁ NGHIỆM THU ĐỀ TÀI</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 'bold' }}>Mẫu 4.1. Phiếu đánh giá đề tài NCKH của sinh viên</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>PHIẾU ĐÁNH GIÁ ĐỀ TÀI NGHIÊN CỨU KHOA HỌC CỦA SINH VIÊN</div>
      </div>

      <div style={{ fontSize: 13, marginBottom: 14 }}>
        <p>1. Họ tên thành viên Hội đồng: <b>{memberName}</b> - Chức danh: <b>{memberRole}</b></p>
        <p>2. Quyết định thành lập Hội đồng: Số 145/QĐ-HV ngày 20/04/2027 của Giám đốc Học viện</p>
        <p>3. Tên đề tài: <b>{project?.title_vi || 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link'}</b> (Mã số: <b>{project?.project_id || 'SV-2026-CNTT1-001'}</b>)</p>
      </div>

      <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 6 }}>4. Đánh giá của thành viên Hội đồng (7 tiêu chí thang 100 theo QĐ 521):</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }} border={1}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
            <th style={{ padding: 6, width: 45 }}>TT</th>
            <th style={{ padding: 6 }}>Nội dung đánh giá (7 tiêu chí Mẫu 4.1)</th>
            <th style={{ padding: 6, width: 90 }}>Điểm tối đa</th>
            <th style={{ padding: 6, width: 90 }}>Điểm đánh giá</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ textAlign: 'center' }}>1</td><td>Tổng quan tình hình nghiên cứu, lý do chọn đề tài</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s1}</td></tr>
          <tr><td style={{ textAlign: 'center' }}>2</td><td>Mục tiêu đề tài</td><td style={{ textAlign: 'center' }}>15</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s2}</td></tr>
          <tr><td style={{ textAlign: 'center' }}>3</td><td>Phương pháp nghiên cứu</td><td style={{ textAlign: 'center' }}>15</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s3}</td></tr>
          <tr><td style={{ textAlign: 'center' }}>4</td><td>Nội dung khoa học</td><td style={{ textAlign: 'center' }}>35</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s4}</td></tr>
          <tr><td style={{ textAlign: 'center' }}>5</td><td>Đóng góp về mặt kinh tế - xã hội, giáo dục và đào tạo, an ninh, quốc phòng</td><td style={{ textAlign: 'center' }}>15</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s5}</td></tr>
          <tr><td style={{ textAlign: 'center' }}>6</td><td>Hình thức trình bày báo cáo tổng kết đề tài</td><td style={{ textAlign: 'center' }}>5</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s6}</td></tr>
          <tr><td style={{ textAlign: 'center' }}>7</td><td>Điểm thưởng (có công bố khoa học từ kết quả nghiên cứu trên các tạp chí chuyên ngành trong và ngoài nước)</td><td style={{ textAlign: 'center' }}>5</td><td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s7}</td></tr>
          <tr style={{ backgroundColor: '#fcfcfc', fontWeight: 'bold' }}><td colSpan={2} style={{ textAlign: 'center' }}>CỘNG TỔNG ĐIỂM</td><td style={{ textAlign: 'center' }}>100</td><td style={{ textAlign: 'center', color: '#C62828', fontSize: 15 }}>{totalScore}</td></tr>
        </tbody>
      </table>

      <div style={{ fontSize: 13, marginBottom: 20 }}>
        <p><b>5. Dự kiến xếp loại và kiến nghị khác:</b> Xếp loại <b>{grade}</b> ({totalScore}/100đ). {evaluator?.comment || 'Đề tài đạt chất lượng rất cao, sản phẩm phần mềm S-Link chạy thực tế tốt. Đề nghị Học viện trao Giải Nhất và đề cử xét Giải thưởng Sinh viên NCKH cấp Bộ GD&ĐT.'}</p>
      </div>

      <div style={{ textAlign: 'right', marginTop: 30, paddingRight: 40 }}>
        <div style={{ fontStyle: 'italic', fontSize: 12 }}>Hà Nội, {evaluator?.date || 'ngày 28 tháng 04 năm 2027'}</div>
        <div style={{ fontWeight: 'bold', fontSize: 13, marginTop: 4 }}>Thành viên Hội đồng</div>
        <div style={{ fontStyle: 'italic', fontSize: 11 }}>(Ký và ghi rõ họ tên)</div>
        <div style={{ marginTop: 50, fontWeight: 'bold' }}>{memberName}</div>
      </div>
    </div>
  );
};

export const Mau34BaoCaoTomTat: React.FC<QD521Props> = ({ project }) => {
  const leader = project?.project_members?.find((m: any) => m.member_role === 'LEADER');
  const advisor = project?.project_advisors?.[0];

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '32px 40px', border: '1px solid #d9d9d9', maxWidth: 850, margin: '0 auto', fontFamily: '"Times New Roman", Times, serif', color: '#000000', lineHeight: 1.6 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
        <div style={{ fontSize: 13, fontWeight: 'bold' }}>{project?.departments?.dept_name?.toUpperCase() || 'KHOA CÔNG NGHỆ THÔNG TIN 1'}</div>
        <div style={{ width: 100, height: 1, backgroundColor: '#000', margin: '6px auto' }} />
        <div style={{ fontSize: 12, fontWeight: 'bold', marginTop: 10 }}>Mẫu 3.4. Báo cáo tóm tắt đề tài NCKH sinh viên</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>BÁO CÁO TÓM TẮT ĐỀ TÀI NGHIÊN CỨU KHOA HỌC SINH VIÊN</div>
        <div style={{ fontSize: 14, fontStyle: 'italic' }}>NĂM HỌC 2026 - 2027</div>
      </div>

      <div style={{ fontSize: 13, marginBottom: 16 }}>
        <p><b>1. Tên đề tài:</b> {project?.title_vi} (Mã số: <b>{project?.project_id}</b>)</p>
        <p><b>2. Sinh viên chịu trách nhiệm chính:</b> {leader?.students?.users?.full_name || 'Nguyễn Văn An'} - Lớp: {leader?.students?.class_name || 'D23CQCN01-B'}</p>
        <p><b>3. Giảng viên hướng dẫn:</b> {advisor?.lecturers?.academic_rank ? advisor.lecturers.academic_rank + '. ' : ''}{advisor?.lecturers?.users?.full_name || 'TS. Ngô Quốc Dũng'}</p>
        <p><b>4. Cơ quan chủ trì:</b> {project?.departments?.dept_name || 'Khoa Công nghệ thông tin 1'}</p>
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <p><b>I. Tính cấp thiết của đề tài:</b></p>
        <p style={{ textIndent: 20 }}>
          Hiện nay công tác quản lý hoạt động NCKH sinh viên tại các Học viện, Trường Đại học còn gặp nhiều khó khăn do quy trình phân tán, hồ sơ biểu mẫu giấy cồng kềnh. Đề tài nhằm số hóa toàn diện quy trình theo Quyết định 521/QĐ-HV, tích hợp hệ thống S-Link, giúp tự động hóa từ đăng ký, duyệt đề cương, nghiệm thu đến thanh quyết toán và cấp chứng nhận.
        </p>

        <p><b>II. Mục tiêu nghiên cứu:</b></p>
        <p style={{ textIndent: 20 }}>
          {project?.objectives || 'Xây dựng thành công hệ thống web SRMS chuẩn S-Link phục vụ 9 vai trò người dùng trong Học viện.'}
        </p>

        <p><b>III. Phương pháp nghiên cứu và Kiến trúc hệ thống:</b></p>
        <p style={{ textIndent: 20 }}>
          Nghiên cứu lý thuyết kết hợp khảo sát thực nghiệm và phương pháp phát triển phần mềm Agile/Scrum. Hệ thống được phân rã thành các phân hệ nghiệp vụ độc lập, tối ưu hóa luồng chu chuyển thông tin, thiết kế kiến trúc dịch vụ đa tầng và giao diện trực tuyến hiện đại, thân thiện trên nền tảng S-Link PTIT.
        </p>

        <p><b>IV. Kết quả nghiên cứu chính:</b></p>
        <ul style={{ paddingLeft: 30 }}>
          <li>Hệ sinh thái web SRMS hoàn chỉnh với giao diện PTIT S-Link đặc trưng.</li>
          <li>Tự động hóa số hóa 10 biểu mẫu QĐ 521/QĐ-HV trực tiếp từ dữ liệu hồ sơ đề tài.</li>
          <li>Tích hợp thuật toán tính điểm trung bình Hội đồng và tự động loại trừ điểm chênh lệch vượt quá 15 điểm theo Điều 10 QĐ 521.</li>
        </ul>

        <p><b>V. Kết luận và Kiến nghị:</b></p>
        <p style={{ textIndent: 20 }}>
          Đề tài đã hoàn thành xuất sắc 100% mục tiêu và khối lượng công việc được giao. Kính đề nghị Hội đồng nghiệm thu xếp loại Xuất sắc và cho phép triển khai ứng dụng thực tế trên toàn Học viện.
        </p>
      </div>
    </div>
  );
};

export const Mau35BienBanSinhHoat: React.FC<QD521Props> = ({ project }) => {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '32px 40px', border: '1px solid #d9d9d9', maxWidth: 850, margin: '0 auto', fontFamily: '"Times New Roman", Times, serif', color: '#000000', lineHeight: 1.6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
          <div style={{ fontSize: 13, fontWeight: 'bold' }}>{project?.departments?.dept_name?.toUpperCase() || 'KHOA CÔNG NGHỆ THÔNG TIN 1'}</div>
          <div style={{ width: 100, height: 1, backgroundColor: '#000', margin: '4px auto' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
          <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 4 }}>Hà Nội, ngày 20 tháng 12 năm 2026</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '16px 0 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 'bold' }}>Mẫu 3.5. Biên bản sinh hoạt khoa học</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 6 }}>BIÊN BẢN SINH HOẠT KHOA HỌC / HỘI THẢO CẤP KHOA</div>
        <div style={{ fontSize: 13, fontStyle: 'italic' }}>Đánh giá tiến độ đề tài NCKH sinh viên năm học 2026 - 2027</div>
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <p><b>1. Thời gian, địa điểm:</b> Hồi 08 giờ 30 ngày 20/12/2026 tại Phòng Hội thảo Tầng 2 - Nhà A2, Học viện PTIT.</p>
        <p><b>2. Thành phần tham dự:</b></p>
        <ul style={{ paddingLeft: 24, margin: '4px 0 8px' }}>
          <li>Chủ trì: <b>PGS.TS. Hoàng Minh</b> - Chủ tịch Hội đồng KH Khoa</li>
          <li>Thư ký: <b>ThS. Đỗ Thị Thu Hiền</b> - Thư ký Khoa CNTT 1</li>
          <li>Đại biểu tham dự: 12 giảng viên trong Khoa và các nhóm sinh viên NCKH.</li>
        </ul>
        <p><b>3. Tên đề tài báo cáo tiến độ:</b> <b>{project?.title_vi}</b></p>
        <p style={{ textIndent: 20 }}><i>Mã số đề tài:</i> <b>{project?.project_id}</b></p>
        <p style={{ textIndent: 20 }}><i>Chủ trì đề tài:</i> <b>Nguyễn Văn An</b> (Lớp D23CQCN01-B)</p>
        <p style={{ textIndent: 20 }}><i>Người hướng dẫn:</i> <b>TS. Ngô Quốc Dũng</b></p>

        <p><b>4. Nội dung sinh hoạt khoa học & Góp ý của Hội thảo:</b></p>
        <div style={{ backgroundColor: '#FAFAFA', padding: 12, border: '1px solid #ECECEC', borderRadius: 4, marginBottom: 12 }}>
          <p>• <b>Tiến độ công việc đã đạt được:</b> Nhóm nghiên cứu đã hoàn thành khảo sát thực tế quy trình nghiệp vụ, hoàn thiện tài liệu đặc tả kiến trúc giải pháp, xây dựng mô hình dữ liệu tổng thể và hoàn thành thử nghiệm các phân hệ cốt lõi của hệ thống.</p>
          <p>• <b>Ý kiến góp ý chuyên môn:</b> Đề nghị nhóm bổ sung ma trận phân quyền chi tiết cho các vai trò và hoàn thiện giao diện mẫu Phiếu chấm điểm Mẫu 4.1, Biên bản Mẫu 4.2 trước buổi nghiệm thu chính thức.</p>
          <p>• <b>Ý kiến giải trình của nhóm:</b> Nhóm sinh viên đã tiếp thu đầy đủ ý kiến và cam kết hoàn thiện báo cáo tổng kết theo đúng hạn quy định.</p>
        </div>

        <p><b>5. Kết luận của Hội thảo:</b> Đề tài đạt tiến độ xuất sắc, nhất trí cho phép tiếp tục triển khai giai đoạn thực nghiệm và chuẩn bị hồ sơ nghiệm thu chính thức.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, textAlign: 'center' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 13 }}>THƯ KÝ HỘI THẢO</div>
          <div style={{ fontStyle: 'italic', fontSize: 12 }}>(Ký và ghi rõ họ tên)</div>
          <div style={{ marginTop: 50, fontWeight: 'bold' }}>ThS. Đỗ Thị Thu Hiền</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 13 }}>CHỦ TỌA SINH HOẠT KHOA HỌC</div>
          <div style={{ fontStyle: 'italic', fontSize: 12 }}>(Ký và ghi rõ họ tên)</div>
          <div style={{ marginTop: 50, fontWeight: 'bold' }}>PGS.TS. Hoàng Minh</div>
        </div>
      </div>
    </div>
  );
};

export interface Mau42Props {
  project?: any;
  printableId?: string;
}

export const Mau42BienBanHoiDong: React.FC<Mau42Props> = ({ project, printableId = 'mau42-bien-ban-hoi-dong' }) => {
  const leader = project?.project_members?.find((m: any) => m.member_role === 'LEADER' || m.member_role === 'LEAD');
  const leaderName = leader?.students?.users?.full_name || leader?.full_name || 'Nguyễn Văn An';
  const leaderClass = leader?.students?.class_name || 'D23CQCN01-B';
  const deptName = project?.departments?.dept_name || 'Khoa Công nghệ thông tin 1';
  const advisor = project?.project_advisors?.[0];
  const advisorName = advisor?.lecturers?.users?.full_name || advisor?.full_name || 'TS. Ngô Quốc Dũng';
  const decisionText = project?.decisionNo ? `Quyết định số ${project.decisionNo}` : 'Quyết định số 145/QĐ-HV ngày 20/04/2027 của Giám đốc Học viện';
  const membersList = project?.councilMembers || [
    { name: 'PGS.TS. Hoàng Minh', role: 'Chủ tịch Hội đồng', total: 94.5 },
    { name: 'TS. Vũ Trọng Hùng', role: 'Ủy viên Phản biện 1', total: 93.0 },
    { name: 'TS. Trần Mai Lan', role: 'Ủy viên Phản biện 2', total: 92.5 },
    { name: 'ThS. Đỗ Thị Thu Hiền', role: 'Thư ký Hội đồng', total: 95.0 },
    { name: 'TS. Nguyễn Quang Hưng', role: 'Ủy viên Hội đồng', total: 94.0 },
  ];
  const finalScore = project?.avgScore || 93.8;
  const finalGrade = project?.grade || 'XUẤT SẮC';
  const awardRecommendation = project?.awardRecommendation || 'Hội đồng nhất trí 100% đề nghị Giám đốc Học viện khen thưởng Giải Nhất cấp Học viện và chọn làm đại diện dự thi Giải thưởng Sinh viên NCKH toàn quốc của Bộ GD&ĐT.';

  return (
    <div
      id={printableId}
      style={{
        backgroundColor: '#ffffff',
        padding: '32px 40px',
        border: '1px solid #d9d9d9',
        maxWidth: 850,
        margin: '0 auto',
        fontFamily: '"Times New Roman", Times, serif',
        color: '#000000',
        lineHeight: 1.5,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>HỘI ĐỒNG ĐÁNH GIÁ NGHIỆM THU ĐỀ TÀI</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
          <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 4 }}>Hà Nội, ngày 28 tháng 04 năm 2027</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '18px 0 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 'bold' }}>Mẫu 4.2. Biên bản họp Hội đồng đánh giá nghiệm thu đề tài NCKH sinh viên</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 6 }}>BIÊN BẢN HỌP HỘI ĐỒNG ĐÁNH GIÁ NGHIỆM THU ĐỀ TÀI NCKH SINH VIÊN</div>
      </div>

      <div style={{ fontSize: 13, marginBottom: 12 }}>
        <p>1. Quyết định thành lập Hội đồng: <b>{decisionText}</b></p>
        <p>2. Tên đề tài: <b>{project?.title_vi || 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link'}</b> (Mã số: <b>{project?.project_id || 'SV-2026-CNTT1-001'}</b>)</p>
        <p>3. Sinh viên chủ trì: <b>{leaderName}</b> (Lớp {leaderClass}, {deptName})</p>
        <p>4. Người hướng dẫn khoa học: <b>{advisorName}</b></p>
      </div>

      <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 6 }}>
        5. Tổng hợp kết quả đánh giá điểm của Hội đồng (Tuân thủ Điều 10 QĐ 521/QĐ-HV):
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 14 }} border={1}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
            <th style={{ padding: 6, width: 45 }}>TT</th>
            <th style={{ padding: 6 }}>Họ và tên thành viên Hội đồng</th>
            <th style={{ padding: 6, width: 140 }}>Chức danh trong Hội đồng</th>
            <th style={{ padding: 6, width: 90 }}>Điểm chấm</th>
            <th style={{ padding: 6, width: 110 }}>Tính hợp lệ (Lệch ≤ 15đ)</th>
          </tr>
        </thead>
        <tbody>
          {membersList.map((m: any, idx: number) => (
            <tr key={idx}>
              <td style={{ textAlign: 'center' }}>{idx + 1}</td>
              <td>{m.name}</td>
              <td style={{ textAlign: 'center' }}>{m.role}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{m.total}</td>
              <td style={{ textAlign: 'center', color: '#52C41A' }}>Hợp lệ</td>
            </tr>
          ))}
          <tr style={{ backgroundColor: '#fcfcfc', fontWeight: 'bold' }}>
            <td colSpan={3} style={{ textAlign: 'center' }}>ĐIỂM TRUNG BÌNH HỢP LỆ CUỐI CÙNG ({membersList.length}/{membersList.length} phiếu hợp lệ)</td>
            <td style={{ textAlign: 'center', color: '#C62828', fontSize: 15 }}>{finalScore}</td>
            <td style={{ textAlign: 'center', color: '#C62828' }}>{finalGrade}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
        <p><b>6. Kết luận của Hội đồng:</b></p>
        <p style={{ textIndent: 20 }}>
          - Đề tài được nghiệm thu với mức xếp loại: <b>{finalGrade}</b> (Điểm số: <b>{finalScore} / 100 điểm</b>).<br />
          - {awardRecommendation}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, textAlign: 'center' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 13 }}>THƯ KÝ HỘI ĐỒNG</div>
          <div style={{ fontStyle: 'italic', fontSize: 12 }}>(Ký và ghi rõ họ tên)</div>
          <div style={{ marginTop: 50, fontWeight: 'bold' }}>ThS. Đỗ Thị Thu Hiền</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 13 }}>CHỦ TỊCH HỘI ĐỒNG</div>
          <div style={{ fontStyle: 'italic', fontSize: 12 }}>(Ký và ghi rõ họ tên)</div>
          <div style={{ marginTop: 50, fontWeight: 'bold' }}>PGS.TS. Hoàng Minh</div>
        </div>
      </div>
    </div>
  );
};

export interface Mau43Props {
  project?: any;
  printableId?: string;
}

export const Mau43BanNhanXet: React.FC<Mau43Props> = ({ project, printableId = 'mau43-ban-nhan-xet' }) => {
  const leader = project?.project_members?.find((m: any) => m.member_role === 'LEADER' || m.member_role === 'LEAD');
  const leaderName = leader?.students?.users?.full_name || leader?.full_name || 'Nguyễn Văn An';
  const deptName = project?.departments?.dept_name || 'Khoa Công nghệ thông tin 1';
  const reviewer = project?.reviewer || {
    name: 'TS. Vũ Trọng Hùng',
    role: 'Ủy viên Phản biện 1',
    dept: deptName,
  };

  return (
    <div
      id={printableId}
      style={{
        backgroundColor: '#ffffff',
        padding: '32px 40px',
        border: '1px solid #d9d9d9',
        maxWidth: 850,
        margin: '0 auto',
        fontFamily: '"Times New Roman", Times, serif',
        color: '#000000',
        lineHeight: 1.6,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>HỘI ĐỒNG ĐÁNH GIÁ NGHIỆM THU</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
          <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 4 }}>Hà Nội, ngày 27 tháng 04 năm 2027</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '16px 0 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 'bold' }}>Mẫu 4.3. Bản nhận xét phản biện đề tài NCKH sinh viên</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 6 }}>BẢN NHẬN XÉT PHẢN BIỆN ĐỀ TÀI NCKH SINH VIÊN</div>
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <p>Họ tên người nhận xét: <b>{reviewer.name}</b> - Đơn vị công tác: <b>{reviewer.dept}</b></p>
        <p>Vai trò trong Hội đồng: <b>{reviewer.role}</b></p>
        <p>Tên đề tài: <b>{project?.title_vi || 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link'}</b> (Mã số: <b>{project?.project_id || 'SV-2026-CNTT1-001'}</b>)</p>
        <p>Sinh viên thực hiện: <b>{leaderName}</b> (Chủ nhiệm đề tài) cùng nhóm nghiên cứu.</p>

        <p><b>NỘI DUNG NHẬN XÉT CHUYÊN MÔN:</b></p>
        <div style={{ paddingLeft: 16 }}>
          <p><b>1. Tính thời sự và ý nghĩa khoa học của đề tài:</b> Rất cao. Việc nghiên cứu hệ thống giải quyết trực tiếp nhu cầu cấp bách của Học viện trong công tác chuyển đổi số quản trị đại học.</p>
          <p><b>2. Phương pháp nghiên cứu và kiến trúc giải pháp:</b> Tiếp cận bài bản, phương pháp luận khoa học chặt chẽ, kiến trúc hệ thống hiện đại, tối ưu hóa quy trình nghiệp vụ và đảm bảo tính bảo mật, toàn vẹn dữ liệu cao.</p>
          <p><b>3. Giá trị thực tiễn và khả năng ứng dụng:</b> Sản phẩm phần mềm web S-Link đã hoạt động ổn định, giao diện thân thiện, chính xác theo Quyết định 521/QĐ-HV.</p>
          <p><b>4. Điểm cần hoàn thiện:</b> Cần tiếp tục nghiên cứu mở rộng tích hợp phân tích học tập (Learning Analytics) cho các khóa sau.</p>
        </div>

        <p><b>KẾT LUẬN VÀ ĐÁNH GIÁ:</b> Đề tài đạt chất lượng Xuất sắc, đủ điều kiện đưa ra bảo vệ trước Hội đồng.</p>
      </div>

      <div style={{ textAlign: 'right', marginTop: 30, paddingRight: 40 }}>
        <div style={{ fontWeight: 'bold', fontSize: 13 }}>NGƯỜI NHẬN XÉT PHẢN BIỆN</div>
        <div style={{ fontStyle: 'italic', fontSize: 11 }}>(Ký và ghi rõ họ tên)</div>
        <div style={{ marginTop: 50, fontWeight: 'bold' }}>{reviewer.name}</div>
      </div>
    </div>
  );
};

export const Mau5DeNghiKhenThuong: React.FC<QD521Props> = ({ project }) => {
  const leader = project?.project_members?.find(
    (m: any) => m.member_role === 'LEADER' || m.member_role === 'LEAD',
  ) || project?.project_members?.[0];
  const advisor = project?.project_advisors?.find((a: any) => a.status === 'ACTIVE') || project?.project_advisors?.[0];
  const deptName = project?.departments?.dept_name || 'Khoa Công nghệ thông tin 1';
  const avgScore = project?.acceptances?.avg_score ?? project?.evaluations?.[0]?.total_score ?? '93.8';

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '32px 40px', border: '1px solid #d9d9d9', maxWidth: 850, margin: '0 auto', fontFamily: '"Times New Roman", Times, serif', color: '#000000', lineHeight: 1.6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</div>
          <div style={{ fontSize: 13, fontWeight: 'bold' }}>{deptName.toUpperCase()}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Số: 88/CV-KHOA</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', textDecoration: 'underline' }}>Độc lập - Tự do - Hạnh phúc</div>
          <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 4 }}>Hà Nội, ngày 05 tháng 05 năm 2027</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0 24px' }}>
        <div style={{ fontSize: 12, fontWeight: 'bold' }}>Mẫu 5. Công văn đề nghị khen thưởng đề tài NCKH sinh viên</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>CÔNG VĂN ĐỀ NGHỊ KHEN THƯỞNG ĐỀ TÀI NCKH SINH VIÊN XUẤT SẮC</div>
        <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 8 }}>Kính gửi: Giám đốc Học viện Công nghệ Bưu chính Viễn thông</div>
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <p style={{ textIndent: 30 }}>
          Căn cứ Quyết định số 521/QĐ-HV ngày 17/07/2020 của Giám đốc Học viện ban hành Quy định về hoạt động nghiên cứu khoa học của sinh viên trong Học viện Công nghệ Bưu chính Viễn thông;
        </p>
        <p style={{ textIndent: 30 }}>
          Căn cứ Biên bản họp Hội đồng đánh giá nghiệm thu đề tài NCKH sinh viên;
        </p>
        <p style={{ textIndent: 30 }}>
          {deptName} trân trọng đề nghị Giám đốc Học viện xem xét quyết định khen thưởng cho đề tài NCKH của sinh viên có kết quả xuất sắc năm học {project?.nckh_periods?.academic_year || '2026 - 2027'} như sau:
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, margin: '14px 0' }} border={1}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>
              <th style={{ padding: 6, width: 40 }}>STT</th>
              <th style={{ padding: 6 }}>Tên đề tài & Mã số</th>
              <th style={{ padding: 6, width: 140 }}>Sinh viên chủ trì</th>
              <th style={{ padding: 6, width: 130 }}>Người hướng dẫn</th>
              <th style={{ padding: 6, width: 80 }}>Điểm TB</th>
              <th style={{ padding: 6, width: 110 }}>Hình thức đề nghị</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center' }}>1</td>
              <td style={{ padding: 6 }}>
                <b>{project?.title_vi}</b><br />
                <span style={{ fontSize: 11, color: '#666' }}>Mã: {project?.project_id}</span>
              </td>
              <td style={{ padding: 6, textAlign: 'center' }}>
                <b>{leader?.students?.users?.full_name || 'Sinh viên chủ trì'}</b><br />
                <span style={{ fontSize: 11 }}>Lớp {leader?.students?.class_name || leader?.students?.className || 'PTIT'}</span>
              </td>
              <td style={{ padding: 6, textAlign: 'center' }}>
                <b>{advisor?.lecturers?.academic_rank ? `${advisor.lecturers.academic_rank}. ` : ''}{advisor?.lecturers?.users?.full_name || 'Giảng viên hướng dẫn'}</b><br />
                <span style={{ fontSize: 11 }}>{deptName}</span>
              </td>
              <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#C62828' }}>{avgScore}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>Khen thưởng Học viện</td>
            </tr>
          </tbody>
        </table>

        <p style={{ textIndent: 30 }}>
          Kính trình Giám đốc Học viện xem xét, phê duyệt quyết định khen thưởng và cấp Giấy chứng nhận thành tích NCKH cho nhóm sinh viên và giảng viên hướng dẫn theo quy định.
        </p>
      </div>

      <div style={{ textAlign: 'right', marginTop: 30, paddingRight: 40 }}>
        <div style={{ fontWeight: 'bold', fontSize: 13 }}>TRƯỞNG KHOA</div>
        <div style={{ fontStyle: 'italic', fontSize: 11 }}>(Ký và ghi rõ họ tên)</div>
        <div style={{ marginTop: 50, fontWeight: 'bold' }}>Lãnh đạo {deptName}</div>
      </div>
    </div>
  );
};
