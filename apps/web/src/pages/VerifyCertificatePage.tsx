import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Space, Alert, Spin } from 'antd';
import {
  CheckCircleFilled,
  HomeOutlined,
  PrinterOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { PtitCertificate } from '../components/qd521/PtitCertificate';
import { printElement } from '../utils/printHelper';
import api from '../services/api';

const GRADE_LABEL: Record<string, string> = {
  XUAT_SAC: 'Xuất sắc',
  TOT: 'Tốt',
  KHA: 'Khá',
  DAT: 'Đạt',
};

export const VerifyCertificatePage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const code = params.get('code') || 'CN-SV-2026-CNTT1-001-SV01';
  const student = params.get('student') || '';

  const [loading, setLoading] = useState(true);
  const [dbCert, setDbCert] = useState<any>(null);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/awards/certificates/verify/${encodeURIComponent(code)}`);
        setDbCert(res.data);
      } catch {
        setDbCert(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [code]);

  const isLegacySample = !dbCert && (student.toUpperCase().includes('ĐẠT') || code.includes('RIPT') || code.includes('032'));

  const matchedMember = dbCert?.project?.members?.find(
    (m: any) => m.student?.userId === dbCert?.recipientUserId,
  );

  const certData = dbCert
    ? {
      studentName: (dbCert.recipient?.fullName || 'SINH VIÊN PTIT').toUpperCase(),
      studentClass:
        dbCert.recipientType === 'ADVISOR'
          ? 'Giảng viên hướng dẫn'
          : matchedMember?.student?.className || 'Sinh viên PTIT',
      department: dbCert.project?.department?.deptName || 'Học viện Công nghệ Bưu chính Viễn thông',
      projectTitle: dbCert.project?.titleVi || '',
      projectCode: dbCert.projectId,
      academicYear: dbCert.project?.period?.academicYear || '2026-2027',
      result: GRADE_LABEL[dbCert.grade] || dbCert.grade,
      decisionNo: dbCert.project?.acceptance?.approvalDocNo || '521/QĐ-HV',
      issueDate: dbCert.issuedDate
        ? new Date(dbCert.issuedDate).toLocaleDateString('vi-VN')
        : 'ngày 05 tháng 5 năm 2027',
      certNo: dbCert.certCode,
      signatoryTitle: 'GIÁM ĐỐC',
      signatoryName: 'PGS.TS. Đặng Hoài Bắc',
    }
    : isLegacySample
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
        studentName: (student || 'NGUYỄN VĂN AN').toUpperCase(),
        studentClass: 'D23CQCN01-B',
        department: 'Khoa Công nghệ thông tin 1',
        projectTitle: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
        projectCode: 'SV-2026-CNTT1-001',
        academicYear: '2026',
        result: 'Xuất sắc',
        decisionNo: '521/QĐ-HV',
        issueDate: 'ngày 05 tháng 5 năm 2027',
        certNo: code,
        signatoryTitle: 'GIÁM ĐỐC',
        signatoryName: 'PGS.TS. Đặng Hoài Bắc',
      };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0F2F5', padding: '24px 16px' }}>
      <div style={{ maxWidth: 950, margin: '0 auto' }}>
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

        <Spin spinning={loading}>
          {dbCert ? (
            <Alert
              type="success"
              showIcon
              icon={<CheckCircleFilled />}
              style={{ marginBottom: 20 }}
              message={`Chứng nhận số "${certData.certNo}" HỢP LỆ trên Hệ thống dữ liệu gốc PTIT SRMS`}
              description={`Cấp cho ${certData.studentName} (${certData.department}) — Đề tài ${certData.projectCode}, xếp loại ${certData.result}.`}
            />
          ) : (
            <Alert
              type={isLegacySample ? 'info' : 'warning'}
              showIcon
              icon={isLegacySample ? <CheckCircleFilled /> : <WarningOutlined />}
              style={{ marginBottom: 20 }}
              message={
                isLegacySample
                  ? `Bản xem trước mẫu chứng nhận tham chiếu "${certData.certNo}"`
                  : `Không tìm thấy mã chứng nhận "${code}" trong CSDL hiện tại — Đang hiển thị bản xem trước tham khảo`
              }
            />
          )}

          <PtitCertificate {...certData} />
        </Spin>
      </div>
    </div>
  );
};
