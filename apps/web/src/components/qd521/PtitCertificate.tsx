import React from 'react';
import { QRCode } from 'antd';

export interface PtitCertificateProps {
  id?: string;
  studentName?: string;
  studentClass?: string;
  department?: string;
  projectTitle?: string;
  projectCode?: string;
  academicYear?: string;
  result?: string;
  decisionNo?: string;
  issueDate?: string;
  certNo?: string;
  signatoryTitle?: string;
  signatoryName?: string;
  printableId?: string;
}

export const PtitCertificate: React.FC<PtitCertificateProps> = ({
  id: _id = 'cert-default',
  studentName = 'NGUYỄN TIẾN ĐẠT',
  studentClass = 'D23CCHT01',
  department = 'Viện Khoa học Kỹ thuật Bưu điện',
  projectTitle = 'Nghiên cứu, xây dựng mô hình xác thực 2FA ứng dụng RFID và vi điều khiển ESP32',
  projectCode = '32-SV-2025-RIPT',
  academicYear = '2025',
  result = 'Khá',
  decisionNo = '1842/QĐ-HV',
  issueDate = 'ngày 24 tháng 6 năm 2026',
  certNo = 'GCN-2025-RIPT-032',
  signatoryTitle = 'GIÁM ĐỐC',
  signatoryName = 'PGS.TS. Đặng Hoài Bắc',
  printableId = 'printable-ptit-certificate',
}) => {
  // URL tra cứu chính thức quét được thật 100% bằng camera điện thoại/Zalo
  const verifyUrl = `https://slink.ptit.edu.vn/gwdu/verify-cert?code=${encodeURIComponent(
    certNo,
  )}&student=${encodeURIComponent(studentName)}&decision=${encodeURIComponent(decisionNo)}&result=${encodeURIComponent(
    result,
  )}`;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* KHUNG GIẤY CHỨNG NHẬN CHUẨN XÁC THEO ẢNH CHỤP GỐC CỦA HỌC VIỆN PTIT */}
      <div
        id={printableId}
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          padding: '24px',
          boxSizing: 'border-box',
          fontFamily: '"Times New Roman", Times, serif',
          color: '#000000',
          position: 'relative',
        }}
      >
        {/* KHUNG VIỀN HOA VĂN VÀNG KIM & CHỈ ĐỎ KÉP CHUẨN GIAO DIỆN BẰNG KHEN / CHỨNG NHẬN */}
        <div
          style={{
            border: '6px solid #C59B27',
            padding: '6px',
            position: 'relative',
            backgroundColor: '#FCFBF7',
          }}
        >
          {/* ĐƯỜNG VIỀN ĐỎ PHỤ BÊN TRONG */}
          <div
            style={{
              border: '2px solid #C62828',
              padding: '28px 36px 20px',
              position: 'relative',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* HOA VĂN 4 GÓC CHỨNG NHẬN TRUYỀN THỐNG */}
            <div style={{ position: 'absolute', top: 6, left: 6, color: '#C59B27', fontSize: 16, lineHeight: 1 }}>❖</div>
            <div style={{ position: 'absolute', top: 6, right: 6, color: '#C59B27', fontSize: 16, lineHeight: 1 }}>❖</div>
            <div style={{ position: 'absolute', bottom: 6, left: 6, color: '#C59B27', fontSize: 16, lineHeight: 1 }}>❖</div>
            <div style={{ position: 'absolute', bottom: 6, right: 6, color: '#C59B27', fontSize: 16, lineHeight: 1 }}>❖</div>

            {/* HÀNG HEADER: BỘ & HỌC VIỆN (TRÁI) - CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM (PHẢI) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ textAlign: 'center', width: '48%' }}>
                <div style={{ fontSize: 13, fontWeight: 'bold', letterSpacing: 0.2 }}>
                  BỘ KHOA HỌC VÀ CÔNG NGHỆ
                </div>
                <div style={{ fontSize: 13, fontWeight: 'bold', letterSpacing: 0.2, marginTop: 2 }}>
                  HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
                </div>
              </div>

              <div style={{ textAlign: 'center', width: '48%' }}>
                <div style={{ fontSize: 13, fontWeight: 'bold', letterSpacing: 0.2 }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div style={{ fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div style={{ width: 140, height: 1, backgroundColor: '#000000', margin: '4px auto 0' }} />
              </div>
            </div>

            {/* DÒNG CHỨC DANH GIÁM ĐỐC TRÊN TIÊU ĐỀ */}
            <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  letterSpacing: 0.5,
                  color: '#C62828',
                  textTransform: 'uppercase',
                }}
              >
                GIÁM ĐỐC HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
              </div>

              {/* CHỮ "CHỨNG NHẬN" TO ĐỎ SERIF CHUẨN XÁC 100% THEO ẢNH */}
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 'bold',
                  color: '#C62828',
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  margin: '8px 0 16px',
                  fontFamily: '"Times New Roman", Times, serif',
                }}
              >
                CHỨNG NHẬN
              </div>
            </div>

            {/* NỘI DUNG CHỨNG NHẬN SINH VIÊN & ĐỀ TÀI */}
            <div style={{ fontSize: 15, lineHeight: 1.85, textAlign: 'left', padding: '0 10px', color: '#111111' }}>
              <div style={{ marginBottom: 4 }}>
                Sinh viên: <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: 16 }}>{studentName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap' }}>
                <div>
                  Khoa: <span style={{ fontWeight: 'bold' }}>{department}</span>
                </div>
                <div style={{ marginRight: 60 }}>
                  Lớp: <span style={{ fontWeight: 'bold' }}>{studentClass}</span>
                </div>
              </div>

              <div style={{ marginBottom: 4 }}>
                Đã tham gia nghiên cứu đề tài: <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>“{projectTitle}”</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap' }}>
                <div>
                  Mã số: <span style={{ fontWeight: 'bold' }}>{projectCode}</span>
                </div>
                <div style={{ marginRight: 60 }}>
                  Kết quả: <span style={{ fontWeight: 'bold', color: result === 'Xuất sắc' ? '#C62828' : '#262626' }}>{result}</span>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                Thuộc chương trình nghiên cứu khoa học của sinh viên năm {academicYear}.
              </div>
            </div>

            {/* PHẦN CHÂN CHỨNG NHẬN: MÃ QR THẬT + SỐ QUYẾT ĐỊNH (TRÁI) & DẤU MỘC + CHỮ KÝ GIÁM ĐỐC (PHẢI) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18, padding: '0 10px' }}>
              {/* KHỐI TRÁI: MÃ QR THẬT BÉ LẠI NHƯ YÊU CẦU + SỐ QUYẾT ĐỊNH */}
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      padding: 4,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: 4,
                      display: 'inline-block',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* QR Code thật, kích thước bé gọn (size 72), điện thoại quét là nhận ngay */}
                    <QRCode
                      value={verifyUrl}
                      size={72}
                      bordered={false}
                      errorLevel="M"
                    />
                  </div>

                  <div style={{ fontSize: 11, color: '#595959', lineHeight: 1.4 }}>
                    <div style={{ fontWeight: 'bold', color: '#C62828' }}>XÁC THỰC SỐ S-LINK</div>
                    <div>Quét QR để tra cứu</div>
                    <div>Hồ sơ số trên GWDU</div>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#333333' }}>
                  Số Quyết định: {decisionNo}
                </div>
                <div style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>
                  Mã chứng nhận: {certNo}
                </div>
              </div>

              {/* KHỐI PHẢI: NGÀY KÝ, GIÁM ĐỐC, DẤU MỘC TRÒN ĐỎ VÀ CHỮ KÝ ĐÈ LÊN NHAU CHUẨN XÁC */}
              <div style={{ textAlign: 'center', width: 280, position: 'relative' }}>
                <div style={{ fontStyle: 'italic', fontSize: 13, color: '#222222' }}>
                  Hà Nội, {issueDate}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: 14, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {signatoryTitle}
                </div>

                {/* VÙNG CHỨA CHỮ KÝ VÀ DẤU MỘC ĐÈ NHAU */}
                <div
                  style={{
                    position: 'relative',
                    height: 105,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '4px 0',
                  }}
                >
                  {/* ẢNH DẤU MỘC TRÒN ĐỎ CHÍNH THỨC CỦA HỌC VIỆN PTIT */}
                  {/* Đóng trùm lên khoảng 1/3 chữ ký về phía bên trái theo đúng Nghị định 30/2020/NĐ-CP */}
                  <img
                    src="/ptit_seal.png"
                    alt="Dấu mộc Học viện PTIT"
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: -10,
                      width: 120,
                      height: 120,
                      objectFit: 'contain',
                      zIndex: 1,
                      opacity: 0.92,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* CHỮ KÝ MỰC XANH CỦA GIÁM ĐỐC HỌC VIỆN (CHUẨN NGHỆ THUẬT THEO CHỮ KÝ GỐC CỦA PGS.TS ĐẶNG HOÀI BẮC) */}
                  <svg
                    width="175"
                    height="75"
                    viewBox="0 0 190 85"
                    fill="none"
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      marginLeft: 26,
                    }}
                  >
                    {/* Thân chữ ký chữ Bắc uốn lượn liền mạch, có vòng loop trên cao, thắt eo mềm và 2 nét sóng uốn lượn */}
                    <path
                      d="M 36 65 C 34 46 38 24 46 15 C 52 7 66 9 66 22 C 66 33 50 38 40 40 C 34 41 60 42 72 48 C 80 53 76 66 62 66 C 48 66 62 52 80 44 C 92 38 100 52 112 42 C 120 35 128 46 136 40 C 142 36 150 42 154 38"
                      stroke="#12439B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Nét gạch chân ký dứt khoát bên dưới chữ ký */}
                    <path
                      d="M 32 71 C 60 69 104 67 146 63"
                      stroke="#12439B"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    {/* Nét phẩy bay bổng phần trên của chữ B/Đ */}
                    <path
                      d="M 44 26 C 56 22 72 23 84 28"
                      stroke="#12439B"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* HỌ TÊN IN ĐẬM Ở DƯỚI - GHI ĐÈ LÊN PHẦN DƯỚI CỦA DẤU MỘC CHUẨN XÁC THEO YÊU CẦU */}
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: 14,
                    color: '#000000',
                    position: 'relative',
                    zIndex: 3,
                    marginTop: -6,
                    letterSpacing: 0.2,
                  }}
                >
                  {signatoryName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

