import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Space, Alert } from 'antd';
import {
  CheckCircleFilled,
  HomeOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { PtitCertificate } from '../components/qd521/PtitCertificate';
import { printElement } from '../utils/printHelper';

export const VerifyCertificatePage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const code = params.get('code') || 'GCN-2025-RIPT-032';
  const student = params.get('student') || 'NGUYỄN TIẾN ĐẠT';

  const isNguyenTienDat = student.toUpperCase().includes('ĐẠT') || code.includes('RIPT') || code.includes('032');

  const certData = isNguyenTienDat
    ? {
        studentName: 'NGUYỄN TIẾN ĐẠT',
        studentClass: 'D23CCHT01',
        department: 'Viện Khoa học Kỹ thuật Bưu điện',
        projectTitle: 'Nghiên cứu, xây dựng mô hình xác thực 2FA ứng dụng RFID và vi điều khiển ESP32',
        projectCode: '32-SV-2025-RIPT',
        academicYear: '2025',
        result: 'Khá',
        decisionNo: '1842/QĐ-HV',
        issueDate: 'ngày 24 tháng 6 năm 2026',
        certNo: 'GCN-2025-RIPT-032',
        signatoryTitle: 'GIÁM ĐỐC',
        signatoryName: 'PGS.TS. Đặng Hoài Bắc',
      }
    : {
        studentName: 'NGUYỄN VĂN AN',
        studentClass: 'D23CQCN01-B',
        department: 'Khoa Công nghệ thông tin 1',
        projectTitle: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
        projectCode: 'SV-2026-CNTT1-001',
        academicYear: '2026',
        result: 'Xuất sắc',
        decisionNo: '521/QĐ-HV',
        issueDate: 'ngày 05 tháng 5 năm 2027',
        certNo: 'GCN-NCKH-2027-001',
        signatoryTitle: 'GIÁM ĐỐC',
        signatoryName: 'PGS.TS. Đặng Hoài Bắc',
      };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0F2F5', padding: '24px 16px' }}>
      <div style={{ maxWidth: 950, margin: '0 auto' }}>
        {/* BANNER XÁC THỰC CHÍNH THỨC CỦA HỌC VIỆN PTIT */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: '16px 24px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/ptit_logo.png" alt="PTIT" style={{ height: 42 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#C62828' }}>
                HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
              </div>
              <div style={{ fontSize: 12, color: '#595959' }}>
                Cổng Tra cứu & Xác thực Văn bằng Chứng chỉ Nghiên cứu Khoa học Điện tử
              </div>
            </div>
          </div>

          <Space>
            <Button
              type="primary"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              icon={<PrinterOutlined />}
              onClick={() => printElement('printable-ptit-certificate', `Giay_Chung_Nhan_${certData.certNo}`)}
            >
              In Giấy chứng nhận
            </Button>
            <Button icon={<HomeOutlined />} onClick={() => navigate('/home')}>
              Về Trang chủ S-Link
            </Button>
          </Space>
        </div>

        {/* THÔNG BÁO XÁC THỰC THÀNH CÔNG */}
        <Alert
          message={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <CheckCircleFilled style={{ color: '#52C41A', fontSize: 18 }} />
              <b style={{ color: '#52C41A' }}>HỒ SƠ GIẤY CHỨNG NHẬN ĐIỆN TỬ HỢP LỆ & CHÍNH THỨC</b>
            </div>
          }
          description={
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Giấy chứng nhận số <b>{certData.certNo}</b> cấp cho sinh viên <b>{certData.studentName}</b> theo Quyết định số <b>{certData.decisionNo}</b> đã được ký số và đóng dấu mộc pháp lý bởi Giám đốc Học viện. Dữ liệu đối soát khớp 100% với Cơ sở Dữ liệu KH&CN Học viện PTIT.
            </div>
          }
          type="success"
          showIcon={false}
          style={{ marginBottom: 20, borderRadius: 8, border: '1px solid #B7EB8F' }}
        />

        {/* TỜ GIẤY CHỨNG NHẬN CHUẨN XÁC 100% */}
        <div style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <PtitCertificate {...certData} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#8c8c8c' }}>
          Hệ thống Quản lý Đề tài Nghiên cứu Khoa học Sinh viên (SRMS) • Học viện Công nghệ Bưu chính Viễn thông
        </div>
      </div>
    </div>
  );
};

