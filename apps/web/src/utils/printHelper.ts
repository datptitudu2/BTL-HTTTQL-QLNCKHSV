/**
 * Tiện ích in ấn văn bản hành chính chuẩn A4 Học viện PTIT
 * Tách biệt hoàn toàn phần tài liệu A4 khỏi giao diện web (header, sidebar, form, chatbot)
 */
export const printElement = (elementId: string, title = 'Văn bản NCKH PTIT') => {
  const elem = document.getElementById(elementId);
  if (!elem) {
    window.print();
    return;
  }

  // Mở cửa sổ in chuyên dụng độc lập hoàn toàn khỏi trang web
  const printWindow = window.open('', '_blank', 'width=950,height=900');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 18mm 15mm 18mm 20mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: "Times New Roman", Times, serif;
              color: #000000;
              background: #FFFFFF;
              line-height: 1.5;
              font-size: 13pt;
            }
            .printable-a4-sheet {
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              border: none !important;
              background: #FFFFFF !important;
            }
            #printable-award-cert {
              border: 8px double #C62828 !important;
              padding: 24px 30px !important;
            }
            p, div {
              margin-bottom: 6px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
              font-size: 11pt;
            }
            th, td {
              border: 1px solid #000000;
              padding: 6px 8px;
              vertical-align: middle;
            }
            th {
              background-color: #F2F2F2 !important;
              font-weight: bold;
              text-align: center;
            }
            @media print {
              body {
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          ${elem.outerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                try {
                  window.close();
                } catch(e) {}
              }, 700);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } else {
    // Dự phòng khi popup bị trình duyệt chặn
    window.print();
  }
};
