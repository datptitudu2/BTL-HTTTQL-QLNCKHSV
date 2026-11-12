import React from 'react';

interface PtitSpinnerProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
  minHeight?: number | string;
}

export const PtitSpinner: React.FC<PtitSpinnerProps> = ({
  tip = 'Đang tải dữ liệu hệ thống...',
  size = 'default',
  minHeight = 240,
}) => {
  const pixelSize = size === 'small' ? 32 : size === 'large' ? 56 : 42;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        minHeight,
        width: '100%',
      }}
    >
      {/* VÒNG TRÒN 12 CHẤM ĐỎ XOAY TRÒN CHUẨN S-LINK */}
      <div
        className="ptit-circle-spinner"
        style={{ width: pixelSize, height: pixelSize }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`dot dot-${i + 1}`} />
        ))}
      </div>

      {tip && (
        <div
          style={{
            marginTop: 14,
            fontSize: 13,
            color: '#8c8c8c',
            fontWeight: 500,
            letterSpacing: '0.2px',
          }}
        >
          {tip}
        </div>
      )}
    </div>
  );
};

