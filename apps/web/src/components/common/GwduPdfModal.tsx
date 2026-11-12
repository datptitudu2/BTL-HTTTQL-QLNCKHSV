import React, { useState } from 'react';
import { Modal, Button, Space, Tooltip } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateRightOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FullscreenOutlined,
  LeftOutlined,
  RightOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';

interface GwduPdfModalProps {
  open: boolean;
  onClose: () => void;
  fileName?: string;
  fileUrl?: string;
  totalPages?: number;
}

export const GwduPdfModal: React.FC<GwduPdfModalProps> = ({
  open,
  onClose,
  fileName = 'QD_521_QD_HV_NCKH_Sinh_Vien.pdf',
  fileUrl = '/gwdu',
  totalPages = 18,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 60));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrint = () => {
    const iframe = document.getElementById('gwdu-pdf-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1050}
      style={{ top: 20 }}
      styles={{ body: { padding: 0 } }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FilePdfOutlined style={{ color: '#C62828', fontSize: 18 }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Xem trước tập tin</span>
        </div>
      }
    >
      {/* THANH ĐIỀU KHIỂN CHUẨN XÁC THEO ẢNH 1 S-LINK */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 18px',
          borderBottom: '1px solid #EDEDEE',
          backgroundColor: '#FAFAFA',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 600, color: '#262626', fontSize: 13 }}>
          {fileName}
        </div>

        {/* Thanh công cụ xem PDF */}
        <Space size={10} align="center">
          {/* Phân trang */}
          <Space size={4}>
            <Button
              size="small"
              icon={<LeftOutlined />}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            />
            <span style={{ fontSize: 12, padding: '0 6px', fontWeight: 500 }}>
              {currentPage} / {totalPages}
            </span>
            <Button
              size="small"
              icon={<RightOutlined />}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            />
          </Space>

          <span style={{ borderLeft: '1px solid #D9D9D9', height: 16, margin: '0 4px' }} />

          {/* Thu phóng */}
          <Space size={4}>
            <Tooltip title="Thu nhỏ">
              <Button size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            </Tooltip>
            <span style={{ fontSize: 12, width: 44, textAlign: 'center', fontWeight: 500 }}>
              {zoom}%
            </span>
            <Tooltip title="Phóng to">
              <Button size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            </Tooltip>
          </Space>

          <span style={{ borderLeft: '1px solid #D9D9D9', height: 16, margin: '0 4px' }} />

          {/* Xoay trang */}
          <Tooltip title="Xoay 90 độ">
            <Button size="small" icon={<RotateRightOutlined />} onClick={handleRotate} />
          </Tooltip>

          {/* In trực tiếp */}
          <Tooltip title="In tài liệu này">
            <Button size="small" icon={<PrinterOutlined />} onClick={handlePrint} />
          </Tooltip>

          {/* Tải về */}
          <Tooltip title="Tải về máy tính">
            <Button
              size="small"
              type="primary"
              style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
              icon={<DownloadOutlined />}
              href={fileUrl}
              download={fileName}
            >
              Tải về
            </Button>
          </Tooltip>

          {/* Mở tab riêng GWDU */}
          <Tooltip title="Mở trong tab riêng GWDU PTIT">
            <Button
              size="small"
              icon={<FullscreenOutlined />}
              onClick={() => window.open(fileUrl, '_blank')}
            />
          </Tooltip>
        </Space>
      </div>

      {/* KHUNG XEM PDF TRỰC TUYẾN CHUẨN GWDU */}
      <div
        style={{
          height: '70vh',
          backgroundColor: '#525659',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 16,
        }}
      >
        <div
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <iframe
            id="gwdu-pdf-iframe"
            src={`${fileUrl}#toolbar=0&navpanes=0`}
            title={fileName}
            style={{
              width: '100%',
              maxWidth: 960,
              height: '100%',
              minHeight: '66vh',
              border: 'none',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
