# -*- coding: utf-8 -*-
"""
Script to create the complete, rich .docx document for Student Scientific Research Management System.
"""

import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_document():
    doc = Document()
    
    # Page setup - Standard A4 with VN Administrative Margins (Top: 2cm, Bottom: 2cm, Left: 3cm, Right: 2cm)
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(0.79)     # 2.0 cm
        section.bottom_margin = Inches(0.79)  # 2.0 cm
        section.left_margin = Inches(1.18)    # 3.0 cm
        section.right_margin = Inches(0.79)   # 2.0 cm
        
        # Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG | HỆ THỐNG QUẢN LÝ NCKH SINH VIÊN (SRMS)")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(0x88, 0x88, 0x88)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Tài liệu Phân tích Nghiệp vụ Hệ thống Quản lý Đề tài NCKH Sinh viên (Căn cứ QĐ 521/QĐ-HV)")
        frun.font.name = "Times New Roman"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(0x88, 0x88, 0x88)

    # Styles definition
    def apply_run_font(run, name="Times New Roman", size=12, bold=False, italic=False, color_rgb=(0x22, 0x22, 0x22)):
        run.font.name = name
        run.font.size = Pt(size)
        run.bold = bold
        run.italic = italic
        run.font.color.rgb = RGBColor(*color_rgb)

    def add_p(doc, text="", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=6, line_spacing=1.15, bold=False, italic=False, size=12, color=(0x22, 0x22, 0x22)):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            r = p.add_run(text)
            apply_run_font(r, size=size, bold=bold, italic=italic, color_rgb=color)
        return p

    def add_h1(doc, text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        apply_run_font(r, size=15, bold=True, color_rgb=(0x00, 0x33, 0x66))
        return p

    def add_h2(doc, text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        apply_run_font(r, size=13, bold=True, color_rgb=(0x00, 0x33, 0x66))
        return p

    def add_h3(doc, text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        apply_run_font(r, size=12, bold=True, italic=True, color_rgb=(0x2B, 0x4C, 0x7E))
        return p

    def add_bullet(doc, title, content, level=0):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if level > 0:
            p.paragraph_format.left_indent = Inches(0.25 * level + 0.25)
        
        r_title = p.add_run(title + ": " if title else "")
        apply_run_font(r_title, size=12, bold=True, color_rgb=(0x00, 0x33, 0x66))
        
        r_content = p.add_run(content)
        apply_run_font(r_content, size=12, bold=False, color_rgb=(0x22, 0x22, 0x22))
        return p

    def add_styled_table(doc, headers, data, col_widths=None):
        table = doc.add_table(rows=len(data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        
        # Header Row
        hdr_row = table.rows[0]
        hdr_row._tr.get_or_add_trPr().append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        for idx, heading in enumerate(headers):
            cell = hdr_row.cells[idx]
            if col_widths and idx < len(col_widths):
                cell.width = Inches(col_widths[idx])
            
            # Background Navy
            tcPr = cell._tc.get_or_add_tcPr()
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="003366"/>')
            tcPr.append(shd)
            
            # Margins
            tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar>')
            tcPr.append(tcMar)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(heading)
            apply_run_font(r, size=10.5, bold=True, color_rgb=(0xFF, 0xFF, 0xFF))
            
        # Data Rows
        for r_idx, row_data in enumerate(data):
            row = table.rows[r_idx + 1]
            bg_color = "F9FAFB" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row_data):
                cell = row.cells[c_idx]
                if col_widths and c_idx < len(col_widths):
                    cell.width = Inches(col_widths[c_idx])
                
                tcPr = cell._tc.get_or_add_tcPr()
                if bg_color != "FFFFFF":
                    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg_color}"/>')
                    tcPr.append(shd)
                
                tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar>')
                tcPr.append(tcMar)
                
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx > 1 else WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.15
                r = p.add_run(str(val))
                apply_run_font(r, size=10, bold=False, color_rgb=(0x33, 0x33, 0x33))

        # Borders
        tblPr = table._tbl.tblPr
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="single" w:sz="6" w:space="0" w:color="003366"/>'
            f'<w:left w:val="none"/>'
            f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="003366"/>'
            f'<w:right w:val="none"/>'
            f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>'
            f'<w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)
        
        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_before = Pt(0)
        p_after.paragraph_format.space_after = Pt(6)
        return table

    def add_callout(doc, text, prefix="GHI CHÚ / QUY ĐỊNH CĂN CỨ: "):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.3)
        
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F0F4F8"/>')
        tcPr.append(shd)
        
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)
        
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:top w:val="none"/>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="003366"/>'
            f'<w:bottom w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        
        r_prefix = p.add_run(prefix)
        apply_run_font(r_prefix, size=10.5, bold=True, color_rgb=(0x00, 0x33, 0x66))
        
        r_text = p.add_run(text)
        apply_run_font(r_text, size=10.5, bold=False, italic=True, color_rgb=(0x33, 0x33, 0x33))
        
        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_before = Pt(0)
        p_after.paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------
    # COVER PAGE
    # -------------------------------------------------------------
    p_org1 = add_p(doc, "BỘ THÔNG TIN VÀ TRUYỀN THÔNG", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=2, size=13, bold=True, color=(0x33, 0x33, 0x33))
    p_org2 = add_p(doc, "HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2, size=14, bold=True, color=(0x00, 0x33, 0x66))
    p_org3 = add_p(doc, "(VIỆN KHOA HỌC KỸ THUẬT BƯU ĐIỆN - CDIT / RIPT)", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=36, size=11, bold=True, italic=True, color=(0x66, 0x66, 0x66))
    
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_line = p_line.add_run("--------------------------------------------------")
    apply_run_font(r_line, size=12, color_rgb=(0x00, 0x33, 0x66))
    p_line.paragraph_format.space_after = Pt(36)

    p_title1 = add_p(doc, "TÀI LIỆU ĐÁP ỨNG YÊU CẦU NGHIỆP VỤ & PHÂN TÍCH HỆ THỐNG", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=8, size=15, bold=True, color=(0x00, 0x33, 0x66))
    p_title2 = add_p(doc, "HỆ THỐNG THÔNG TIN QUẢN LÝ ĐỀ TÀI NGHIÊN CỨU KHOA HỌC SINH VIÊN (SRMS)", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, size=17, bold=True, color=(0x99, 0x00, 0x00))
    p_sub = add_p(doc, "Căn cứ theo Quyết định số 521/QĐ-HV của Giám đốc Học viện Công nghệ Bưu chính Viễn thông\nban hành Quy định về Hoạt động Nghiên cứu Khoa học của Sinh viên", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=40, size=12, italic=True, color=(0x44, 0x44, 0x44))

    # Box info on cover
    p_meta1 = add_p(doc, "Đơn vị chủ trì xây dựng: Phòng Quản lý Khoa học Công nghệ & Hợp tác Quốc tế", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=20, space_after=4, size=11.5, bold=True, color=(0x00, 0x33, 0x66))
    p_meta2 = add_p(doc, "Đơn vị phối hợp: Các Khoa Đào tạo 1, Khoa Đào tạo 2, Viện KHKT Bưu điện, Phòng CT&CTSV", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=4, size=11, color=(0x33, 0x33, 0x33))
    p_meta3 = add_p(doc, "Đối tượng áp dụng: Trường Đại học / Học viện Công nghệ Bưu chính Viễn thông", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=40, size=11, italic=True, color=(0x33, 0x33, 0x33))
    
    p_date = add_p(doc, "HÀ NỘI - 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=40, space_after=0, size=12, bold=True, color=(0x00, 0x33, 0x66))

    doc.add_page_break()

    # -------------------------------------------------------------
    # PREAMBLE
    # -------------------------------------------------------------
    add_h1(doc, "LỜI MỞ ĐẦU & CĂN CỨ PHÁP LÝ")
    add_p(doc, "Nghiên cứu khoa học (NCKH) của sinh viên là một trong những hoạt động trọng tâm nhằm nâng cao chất lượng đào tạo đại học, phát huy tính chủ động, năng động, sáng tạo và hình thành năng lực tự học, nghiên cứu độc lập cho sinh viên. Tại Học viện Công nghệ Bưu chính Viễn thông (PTIT) và Viện Khoa học Kỹ thuật Bưu điện (RIPT/CDIT), công tác NCKH sinh viên được tổ chức quy củ, bài bản và là vườn ươm cho nhiều công trình khoa học, giải thưởng sinh viên NCKH cấp Bộ, giải thưởng Olympic quốc gia và quốc tế.", space_after=6)
    add_p(doc, "Nhằm chuyển đổi số toàn diện công tác quản lý hoạt động NCKH sinh viên, loại bỏ hoàn toàn các quy trình thủ công trên giấy tờ, tối ưu hóa thời gian thẩm định, theo dõi tiến độ và đánh giá nghiệm thu, tài liệu này được xây dựng để trả lời và đặc tả chi tiết toàn bộ 54 câu hỏi khảo sát & phân tích nghiệp vụ theo 6 góc nhìn kiến trúc tổng thể (Organization, People, Process, Data, Technology, Function).", space_after=6)
    
    add_callout(doc, 
        "Tài liệu được biên soạn dựa trên các căn cứ pháp lý và thực tiễn:\n"
        "1. Quyết định số 521/QĐ-HV ngày 14/05/2020 của Giám đốc Học viện Công nghệ Bưu chính Viễn thông ban hành Quy định về hoạt động NCKH của sinh viên;\n"
        "2. Thông tư số 19/2012/TT-BGDĐT ngày 01/06/2012 của Bộ Giáo dục & Đào tạo ban hành Quy định về hoạt động NCKH của sinh viên trong các cơ sở giáo dục đại học;\n"
        "3. Quy chế tổ chức và hoạt động của Học viện Công nghệ Bưu chính Viễn thông ban hành kèm theo Quyết định số 879/QĐ-BTTTT của Bộ trưởng Bộ TT&TT.",
        "CĂN CỨ PHÁP LÝ CHÍNH: "
    )

    # -------------------------------------------------------------
    # CHƯƠNG 1: GÓC NHÌN ORGANIZATION – TỔ CHỨC
    # -------------------------------------------------------------
    add_h1(doc, "PHẦN 1. GÓC NHÌN ORGANIZATION – TỔ CHỨC")
    
    add_h2(doc, "1.1. Mục tiêu và các vấn đề hệ thống giải quyết trong công tác quản lý đề tài NCKH sinh viên")
    add_p(doc, "Trong thực tế quản lý NCKH sinh viên truyền thống tại Học viện, công tác quản lý đối mặt với nhiều bất cập và nút thắt. Hệ thống Thông tin Quản lý Đề tài NCKH Sinh viên (Student Research Management System - SRMS) được xây dựng nhằm giải quyết triệt để các vấn đề sau:")
    add_bullet(doc, "Khắc phục tình trạng quản lý hồ sơ giấy tờ rời rạc và phân tán", "Trước đây, toàn bộ quy trình từ đăng ký tên đề tài, thẩm định đề cương, nộp báo cáo tổng kết, đến phiếu chấm điểm nghiệm thu đều sử dụng biểu mẫu in giấy (Mẫu 1 đến Mẫu 5 theo QĐ 521). Điều này gây tốn kém chi phí, dễ thất lạc hồ sơ và khó tra cứu lịch sử nghiên cứu của sinh viên/giảng viên qua các năm học.")
    add_bullet(doc, "Loại bỏ nguy cơ trùng lặp đề tài và thiếu tính mới", "Hệ thống cung cấp cơ sở dữ liệu đề tài NCKH tập trung của toàn Học viện và Viện KHKT Bưu điện qua các thời kỳ, tích hợp thuật toán đối soát trùng lặp tên đề tài, từ khóa và mục tiêu nghiên cứu, giúp Hội đồng khoa học dễ dàng phát hiện các đề tài có nội dung tương tự đã được thực hiện trước đó.")
    add_bullet(doc, "Minh bạch hóa và số hóa quy trình giám sát tiến độ", "Khắc phục tình trạng đề tài 'bỏ trống' hoặc thực hiện dồn dập vào phút chót. Hệ thống thiết lập các mốc kiểm soát tiến độ (Milestones) định kỳ, cho phép giảng viên hướng dẫn (GVHD) và Thư ký khoa cập nhật tình hình thực tế, tổ chức sinh hoạt học thuật/hội thảo chuyên đề (Mẫu 3.5) trực tuyến.")
    add_bullet(doc, "Tự động hóa công tác tổng hợp, đánh giá và thanh quyết toán kinh phí", "Phòng Quản lý Khoa học Công nghệ và Hợp tác Quốc tế (P.QLKHCN&HTQT) có thể tổng hợp danh mục đề tài toàn Học viện chỉ bằng một thao tác, tự động phân loại xếp loại đề tài theo kết quả chấm của Hội đồng (Mẫu 4.1, 4.2, 4.3), từ đó hỗ trợ Phòng Tài chính Kế toán thanh quyết toán kinh phí nhanh chóng, minh bạch.")
    add_bullet(doc, "Kịp thời vinh danh, khen thưởng và hỗ trợ xét học bổng", "Tự động trích xuất danh sách sinh viên đạt giải thưởng NCKH, Olympic để cộng điểm thưởng vào điểm trung bình chung học tập (GPA) xét học bổng theo đúng khung điểm quy định tại Khoản 2 Điều 15 QĐ 521 (từ +0.1 đến +3.0 điểm).")

    add_h2(doc, "1.2. Phạm vi quản lý của hệ thống")
    add_p(doc, "Phạm vi quản lý của hệ thống SRMS bao phủ toàn bộ vòng đời của hoạt động NCKH sinh viên trong một năm học theo đúng chu trình quy định tại QĐ 521/QĐ-HV, bao gồm:")
    add_bullet(doc, "Giai đoạn Đầu năm học (Tháng 8 - Tháng 9)", "Tiếp nhận thông báo kế hoạch NCKH của Học viện; Sinh viên đăng ký đề tài trực tuyến; Hội đồng Khoa họp thẩm định danh mục đề tài (Mẫu 1); Khoa gửi danh mục lên Phòng QLKHCN&HTQT; Trình Giám đốc Học viện ban hành Quyết định giao kế hoạch kinh phí và danh mục đề tài.")
    add_bullet(doc, "Giai đoạn Phê duyệt đề cương & Triển khai (Tháng 10 - Tháng 3 năm sau)", "Sinh viên nộp Đề cương chi tiết (Mẫu 2); Khoa tổ chức xét duyệt đề cương; Phân công/xác nhận GVHD; Giám sát tiến độ theo mốc; Tổ chức các buổi hội thảo/sinh hoạt học thuật lấy ý kiến chuyên môn (Mẫu 3.5); Quản lý nhiệm vụ trợ lý/giúp việc NCKH cho giảng viên.")
    add_bullet(doc, "Giai đoạn Nghiệm thu & Đánh giá (Tháng 3 - Trước ngày 10 tháng 4)", "Sinh viên nộp Báo cáo tổng kết (Mẫu 3.1-3.3), Tóm tắt kết quả (Mẫu 3.4), Sản phẩm demo/Mã nguồn, Minh chứng bài báo khoa học; Thành lập Hội đồng nghiệm thu cấp Khoa/Bộ môn; Chấm điểm độc lập theo thang 100 (Mẫu 4.1); Lập Biên bản nghiệm thu (Mẫu 4.2) và Bảng tổng hợp xếp loại (Mẫu 4.3); Gửi hồ sơ hoàn thành về Phòng QLKHCN&HTQT trước ngày 10/4.")
    add_bullet(doc, "Giai đoạn Khen thưởng, Vinh danh & Đăng ký thi cấp trên (Tháng 5 - Trước ngày 30 tháng 6)", "Tổ chức Hội nghị NCKH sinh viên toàn Học viện (trước 15/6) (Điều 11); Tự động cấp Giấy chứng nhận NCKH cho sinh viên đạt loại Khá trở lên; Lựa chọn các công trình Xuất sắc gửi tham gia Giải thưởng NCKH cấp Bộ GD&ĐT (Mẫu 5, trước 30/6) (Điều 12); Quản lý hỗ trợ kinh phí dự thi (tối đa 1.000.000đ/đề tài).")
    add_bullet(doc, "Giai đoạn Lưu trữ & Khai thác tri thức", "Số hóa toàn bộ kỷ yếu, báo cáo tổng kết, bài báo vào Thư viện số NCKH Học viện để phục vụ tra cứu, tham khảo và phát triển đồ án/khóa luận tốt nghiệp (Điều 14).")

    add_h2(doc, "1.3. Cơ cấu tổ chức tham gia vào hoạt động NCKH sinh viên")
    add_p(doc, "Cơ cấu tổ chức tham gia vận hành hoạt động NCKH sinh viên tại Học viện Công nghệ Bưu chính Viễn thông và Viện KHKT Bưu điện bao gồm các cấp quản lý và đơn vị chức năng:")
    add_bullet(doc, "Ban Giám đốc Học viện", "Cấp lãnh đạo cao nhất: Phê duyệt quy chế, ký Quyết định giao danh mục & kinh phí đề tài, ký quyết định khen thưởng, phê duyệt danh sách đề tài dự thi cấp Bộ.")
    add_bullet(doc, "Phòng Quản lý Khoa học Công nghệ và Hợp tác Quốc tế (QLKHCN&HTQT)", "Cơ quan thường trực cấp Học viện: Đầu mối hướng dẫn, điều phối, thẩm tra tổng thể, kiểm tra tiến độ định kỳ/đột xuất, tổ chức Hội nghị sinh viên NCKH, cấp Giấy chứng nhận và hoàn thiện hồ sơ dự thi cấp trên.")
    add_bullet(doc, "Các Khoa Đào tạo & Viện Nghiên cứu", "Khoa CNTT 1 & 2, Khoa Viễn thông 1 & 2, Khoa Điện tử 1 & 2, Khoa Đa phương tiện, Khoa An toàn thông tin, Khoa Quản trị Kinh doanh, Khoa Tài chính Kế toán, Viện KHKT Bưu điện (RIPT, CDIT), Viện Kinh tế Bưu điện: Quản lý chuyên môn trực tiếp, thành lập Hội đồng khoa học cấp cơ sở, tổ chức xét duyệt danh mục, phân công GVHD, tổ chức nghiệm thu.")
    add_bullet(doc, "Cơ sở Học viện tại TP. Hồ Chí Minh", "Phó Giám đốc phụ trách Cơ sở chỉ đạo, điều hành hoạt động NCKH sinh viên tại cơ sở phía Nam theo ủy quyền của Giám đốc Học viện.")
    add_bullet(doc, "Phòng Chính trị và Công tác Sinh viên (CT&CTSV)", "Phối hợp với Phòng QLKHCN&HTQT tổ chức Hội nghị sinh viên NCKH; tiếp nhận kết quả khen thưởng để xét điểm rèn luyện và cộng điểm thưởng học bổng theo Điều 15 QĐ 521.")
    add_bullet(doc, "Phòng Tài chính - Kế toán & Phòng Kế hoạch Đầu tư", "Quản lý cấp phát, hướng dẫn thủ tục thanh quyết toán kinh phí đề tài dựa trên kết luận của Hội đồng nghiệm thu và dự toán được duyệt.")
    add_bullet(doc, "Đoàn Thanh niên Học viện & Hội Sinh viên", "Tổ chức phong trào, truyền thông, phát động sinh viên tham gia NCKH, tổ chức các khóa tập huấn kỹ năng nghiên cứu.")

    add_h2(doc, "1.4. Đơn vị/bộ phận chịu trách nhiệm quản lý, xét duyệt và theo dõi đề tài")
    add_p(doc, "Theo Điều 7 và Điều 9 QĐ 521/QĐ-HV, trách nhiệm quản lý, xét duyệt và theo dõi đề tài được phân cấp cụ thể như sau:")
    add_bullet(doc, "Xét duyệt danh mục ban đầu", "Hội đồng Khoa học Khoa/Viện tổ chức họp đánh giá các đề xuất của sinh viên/giảng viên, lập danh mục Mẫu 1 gửi Phòng QLKHCN&HTQT. Phòng QLKHCN&HTQT rà soát và trình Ban Giám đốc Học viện ký Quyết định giao đề tài chính thức.")
    add_bullet(doc, "Xét duyệt đề cương chi tiết", "Ban Chủ nhiệm Khoa/Viện thành lập tiểu ban chuyên môn thẩm định Đề cương nghiên cứu (Mẫu 2) và gửi bản sao đã phê duyệt về Phòng QLKHCN&HTQT để theo dõi.")
    add_bullet(doc, "Theo dõi, đôn đốc tiến độ", "Khoa và GVHD trực tiếp theo dõi quá trình thực hiện, tổ chức hội thảo khoa học góp ý (Mẫu 3.5). Phòng QLKHCN&HTQT thực hiện kiểm tra định kỳ và đột xuất.")
    add_bullet(doc, "Tổ chức nghiệm thu, đánh giá kết quả", "Hội đồng Khoa học và Đào tạo của Khoa/Bộ môn chủ trì tổ chức buổi nghiệm thu đánh giá kết quả (có sự tham gia của đại diện quản lý khoa học Học viện).")

    add_h2(doc, "1.5. Phân chia quyền hạn và trách nhiệm giữa các đơn vị (Ma trận RACI)")
    add_p(doc, "Bảng ma trận RACI (R - Responsible: Chịu trách nhiệm thực hiện, A - Accountable: Chịu trách nhiệm giải trình/Phê duyệt, C - Consulted: Được tham vấn, I - Informed: Được thông báo) phân định quyền hạn và trách nhiệm qua từng khâu:")

    headers_org = ["Giai đoạn / Quy trình nghiệp vụ", "Ban Giám đốc", "P.QLKHCN & HTQT", "Khoa / Viện Đào tạo", "Hội đồng KH", "GVHD & Nhóm SV", "Phòng CTSV / TCKT"]
    data_org = [
        ["1. Ban hành kế hoạch NCKH năm học", "A", "R", "I", "C", "I", "I"],
        ["2. Đăng ký & Xét duyệt danh mục Mẫu 1", "A (Ký QĐ)", "C / R (Tổng hợp)", "R (Trưởng khoa)", "R (Thẩm định)", "R (Đăng ký)", "I"],
        ["3. Phân công GVHD & Duyệt đề cương Mẫu 2", "I", "I (Lưu trữ)", "A (Trưởng khoa)", "C", "R (Biên soạn)", "I"],
        ["4. Theo dõi tiến độ & Hội thảo Mẫu 3.5", "I", "C (Kiểm tra)", "A", "C", "R (Thực hiện)", "I"],
        ["5. Tổ chức Nghiệm thu (Mẫu 4.1, 4.2, 4.3)", "I", "C (Giám sát)", "A (Tổ chức)", "R (Chấm điểm)", "R (Bảo vệ)", "I"],
        ["6. Quyết toán kinh phí đề tài", "A", "C", "R (Xác nhận)", "I", "R (Kê khai)", "R (Phòng TCKT)"],
        ["7. Hội nghị NCKH & Khen thưởng SV", "A (Khen thưởng)", "R (Chủ trì)", "R (Phối hợp)", "C", "I", "R (Cộng điểm HB)"],
        ["8. Nộp hồ sơ dự thi cấp Bộ (Mẫu 5)", "A", "R (Nộp hồ sơ)", "R (Đề xuất)", "C", "R (Hoàn thiện)", "I (Kinh phí)"]
    ]
    add_styled_table(doc, headers_org, data_org, [1.5, 0.8, 0.9, 0.9, 0.8, 0.9, 0.9])

    # -------------------------------------------------------------
    # CHƯƠNG 2: GÓC NHÌN PEOPLE – CON NGƯỜI
    # -------------------------------------------------------------
    add_h1(doc, "PHẦN 2. GÓC NHÌN PEOPLE – CON NGƯỜI")
    
    add_h2(doc, "2.1. Cơ chế Xác thực Định danh và Gán quyền Tự động (Claim-based Auto Role Provisioning)")
    add_p(doc, "Hệ thống SRMS không áp dụng cơ chế đăng ký tài khoản tự do hoặc phân quyền thủ công từ Admin. Thay vào đó, hệ thống tích hợp trực tiếp với Cổng xác thực tập trung PTIT Slink SSO (gwdu.ptit.edu.vn) qua chuẩn OpenID Connect (OIDC) / OAuth 2.0:")
    add_bullet(doc, "Tài khoản PTIT Microsoft Outlook", "Dành cho Cán bộ, Giảng viên và Sinh viên Cơ sở đào tạo phía Bắc (@ptit.edu.vn, @stu.ptit.edu.vn).")
    add_bullet(doc, "Tài khoản PTIT Google Gmail", "Dành cho Cán bộ, Giảng viên và Sinh viên Cơ sở đào tạo phía Nam.")
    add_bullet(doc, "Cơ chế Gán Role tự động", "Ngay sau khi xác thực SSO thành công, hệ thống tự động bóc tách Claims định danh từ ID Token (Email domain, Student/Staff ID, Department) để tự động gán vai trò tương ứng: Sinh viên, Giảng viên, Thư ký Khoa, Chuyên viên QLKHCN. Người dùng không cần tạo tài khoản hay xin cấp quyền.")

    add_h2(doc, "2.2. Vai trò và nhiệm vụ của Sinh viên trên hệ thống")
    add_p(doc, "Theo Điều 15 QĐ 521, sinh viên hệ đại học chính quy là chủ thể trung tâm của hoạt động NCKH. Trên hệ thống SRMS, sinh viên tham gia với các vai trò và nhiệm vụ sau:")
    add_bullet(doc, "Sinh viên Chủ trì đề tài (Trưởng nhóm)", "Là sinh viên chịu trách nhiệm chính của đề tài. Thực hiện: Khởi tạo hồ sơ đăng ký đề tài; Mời các thành viên vào nhóm (tối đa 5 SV); Chọn hoặc đề xuất GVHD; Soạn thảo và nộp Đề cương nghiên cứu (Mẫu 2); Cập nhật báo cáo tiến độ theo mốc; Nộp Báo cáo tổng kết (Mẫu 3.1 - 3.3), bản tóm tắt kết quả (Mẫu 3.4), mã nguồn/sản phẩm và bài báo minh chứng; Đại diện nhóm bảo vệ trước Hội đồng nghiệm thu; Thực hiện thủ tục thanh quyết toán kinh phí.")
    add_bullet(doc, "Sinh viên Thành viên nhóm", "Tham gia vào nhóm đề tài (mỗi đề tài tối đa 05 SV); Xác nhận tham gia nhóm trên hệ thống; Nhận phân công nhiệm vụ cụ thể từ SV chủ trì; Cùng tham gia thực hiện nghiên cứu, viết báo cáo và bảo vệ trước Hội đồng; Hưởng đầy đủ quyền lợi về Giấy chứng nhận và điểm thưởng nếu đề tài đạt loại Khá trở lên.")
    add_bullet(doc, "Sinh viên Trợ lý / Giúp việc NCKH", "Tham gia hỗ trợ thực hiện các đề tài NCKH của giảng viên hoặc hỗ trợ các bài thí nghiệm, thực hành tại phòng Lab/Trung tâm Thí nghiệm Thực hành (theo Khoản 4 Điều 9).")

    add_h2(doc, "2.2. Vai trò và nhiệm vụ của Giảng viên / Cán bộ hướng dẫn")
    add_p(doc, "Theo Điều 16 QĐ 521, giảng viên cơ hữu và cán bộ nghiên cứu của Học viện/Viện KHKT Bưu điện tham gia hệ thống với vai trò Cán bộ hướng dẫn (GVHD):")
    add_bullet(doc, "Xác nhận và Định hướng nghiên cứu", "Tiếp nhận lời mời hướng dẫn đề tài từ sinh viên hoặc theo phân công của Khoa; Xác nhận đồng ý hướng dẫn trên hệ thống (đảm bảo tuân thủ giới hạn không quá 02 đề tài NCKH sinh viên trong cùng một thời gian); Gợi ý hướng nghiên cứu, định hướng phương pháp luận khoa học.")
    add_bullet(doc, "Phê duyệt Đề cương & Giám sát thực hiện", "Thẩm định, góp ý và ký duyệt điện tử Đề cương chi tiết (Mẫu 2) của nhóm sinh viên; Giám sát tiến độ từng mốc, hướng dẫn giải quyết khó khăn kỹ thuật; Chủ trì phối hợp với Khoa tổ chức buổi hội thảo/sinh hoạt học thuật lấy ý kiến (Mẫu 3.5).")
    add_bullet(doc, "Nhận xét và Đồng ý nghiệm thu", "Đọc duyệt bản thảo Báo cáo tổng kết, viết phiếu Nhận xét của Cán bộ hướng dẫn, xác nhận đề tài đủ điều kiện đưa ra bảo vệ trước Hội đồng nghiệm thu.")
    add_bullet(doc, "Quyền lợi được ghi nhận tự động", "Sau khi đề tài được nghiệm thu đạt yêu cầu, hệ thống tự động xác nhận và tính giờ định mức NCKH cho giảng viên; hỗ trợ đề xuất khen thưởng nếu đề tài đạt giải cấp Học viện/cấp Bộ.")

    add_h2(doc, "2.3. Vai trò và nhiệm vụ của Cán bộ Quản lý NCKH")
    add_bullet(doc, "Cán bộ Phòng QLKHCN&HTQT (Cấp Học viện)", "Quản trị chu trình NCKH sinh viên toàn trường: Khởi tạo đợt đăng ký hàng năm; Thiết lập thời hạn các mốc nghiệp vụ (Deadline); Tổng hợp danh mục Mẫu 1 toàn trường; Trình Ban Giám đốc phê duyệt Quyết định giao đề tài & kinh phí; Kiểm tra, giám sát tiến độ thực hiện; Tiếp nhận hồ sơ nghiệm thu từ các Khoa (trước 10/4); Tự động cấp và xuất mã Giấy chứng nhận NCKH điện tử cho sinh viên (loại Khá trở lên); Tổng hợp danh mục đề tài xuất sắc gửi dự thi cấp Bộ (Mẫu 5, trước 30/6); Xuất báo cáo thống kê tổng kết NCKH hàng năm.")
    add_bullet(doc, "Thư ký Khoa / Trợ lý NCKH Khoa (Cấp Cơ sở)", "Đầu mối quản lý tại Khoa/Viện: Thông báo kế hoạch cho GV & SV trong Khoa; Quản lý tiếp nhận đăng ký đề tài; Tạo phiên họp và nhập biên bản xét duyệt danh mục của Hội đồng Khoa; Xuất Công văn đăng ký đề tài Mẫu 1 gửi Phòng QLKHCN; Tiếp nhận Đề cương Mẫu 2; Thành lập các Hội đồng nghiệm thu chuyên ngành; Lập lịch bảo vệ; Nhập và kiểm tra điểm của Hội đồng (Mẫu 4.1, 4.2, 4.3); Tập hợp hồ sơ nộp về Học viện đúng hạn.")

    add_h2(doc, "2.4. Vai trò của Hội đồng Khoa học / Người đánh giá đề tài")
    add_p(doc, "Theo Điều 9 và Điều 10 QĐ 521, vai trò của Hội đồng Khoa học là bắt buộc và mang tính quyết định về chất lượng chuyên môn:")
    add_bullet(doc, "Hội đồng Khoa học Khoa (Giai đoạn Đầu vào)", "Đánh giá tính cấp thiết, tính mới, tính khả thi của đề tài đăng ký; Thẩm định dự kiến kinh phí thực hiện; Phê duyệt danh mục chính thức gửi Học viện.")
    add_bullet(doc, "Hội đồng Đánh giá & Nghiệm thu đề tài (Giai đoạn Đầu ra)", "Gồm các nhà khoa học, giảng viên có chuyên môn thuộc Khoa/Bộ môn (và đại diện Phòng QLKHCN Học viện). Từng thành viên thực hiện đánh giá độc lập trực tiếp trên hệ thống bằng Phiếu đánh giá Mẫu 4.1 theo thang điểm 100 với 7 nội dung cụ thể.")
    add_bullet(doc, "Chủ tịch và Thư ký Hội đồng Nghiệm thu", "Thư ký Hội đồng tổng hợp điểm trung bình, ghi chép ý kiến đánh giá, lập Biên bản nghiệm thu Mẫu 4.2. Chủ tịch Hội đồng ký duyệt kết luận xếp loại (Xuất sắc, Tốt, Khá, Đạt, Không đạt) và phê duyệt việc chỉnh sửa hoàn thiện báo cáo của nhóm sinh viên.")

    add_h2(doc, "2.5. Ma trận phân quyền CRUD và Phê duyệt cho từng vai trò người dùng")
    add_p(doc, "Bảng đặc tả quyền Thêm (C - Create), Xem (R - Read), Sửa (U - Update), Xóa (D - Delete), Phê duyệt (A - Approve) trên các phân hệ chức năng chính:")

    headers_people = ["Phân hệ / Đối tượng dữ liệu", "Sinh viên", "GV Hướng dẫn", "Thư ký Khoa", "Hội đồng KH", "P. QLKHCN", "Admin"]
    data_people = [
        ["Hồ sơ tài khoản cá nhân", "R, U (cá nhân)", "R, U (cá nhân)", "R, U (khoa)", "R, U (cá nhân)", "R, U (toàn trường)", "C, R, U, D"],
        ["Đăng ký đề tài & Nhóm SV", "C, R, U (khi mở đợt)", "R (đề tài HD)", "R, U (khoa)", "R (hội đồng)", "R (toàn trường)", "C, R, U, D"],
        ["Xác nhận hướng dẫn đề tài", "R", "R, U (Đồng ý/Từ chối)", "R, U", "R", "R", "C, R, U, D"],
        ["Đề cương chi tiết (Mẫu 2)", "C, R, U (SV chủ trì)", "R, U (Góp ý/Ký duyệt)", "R, A (Duyệt khoa)", "R", "R (Tra cứu)", "C, R, U, D"],
        ["Báo cáo tiến độ & Mẫu 3.5", "C, R, U (SV chủ trì)", "R, U, A (Xác nhận)", "R, U (Giám sát)", "R", "R (Kiểm tra)", "C, R, U, D"],
        ["Báo cáo tổng kết & Sản phẩm", "C, R, U (trước hạn)", "R, A (Đồng ý NT)", "R, U (Tiếp nhận)", "R (Thẩm định)", "R (Toàn trường)", "C, R, U, D"],
        ["Phiếu chấm điểm (Mẫu 4.1)", "R (Xem điểm sau NT)", "R (Xem sau NT)", "R, U (Tổng hợp)", "C, R, U (Chấm online)", "R (Thẩm định)", "C, R, U, D"],
        ["Biên bản NT & Bảng điểm (4.2, 4.3)", "R (Kết quả chung)", "R (Đề tài HD)", "C, R, U, A (Lập BB)", "R, A (Ký duyệt)", "R, A (Phê duyệt)", "C, R, U, D"],
        ["Giấy chứng nhận & Danh mục Mẫu 5", "R (Tải chứng nhận)", "R (Tải chứng nhận)", "R (Xuất báo cáo)", "R", "C, R, U, A (Cấp & Duyệt)", "C, R, U, D"]
    ]
    add_styled_table(doc, headers_people, data_people, [1.6, 0.8, 0.8, 0.8, 0.8, 0.8, 0.7])

    add_h2(doc, "2.6. Dự kiến số lượng người dùng và tải phân bổ theo từng vai trò")
    add_p(doc, "Căn cứ theo quy mô đào tạo và cơ cấu tổ chức của Học viện Công nghệ Bưu chính Viễn thông (gồm 2 cơ sở đào tạo tại Hà Nội và TP. Hồ Chí Minh, cùng các Viện nghiên cứu), thông số người dùng dự kiến được xác định như sau:")
    add_bullet(doc, "Nhóm Sinh viên (Hệ chính quy tập trung)", "Quy mô ~15.000 đến 20.000 tài khoản sinh viên được kích hoạt sẵn sàng thông qua tài khoản định danh chung (SSO). Trong đó, dự kiến hàng năm có khoảng 1.500 đến 2.500 sinh viên tham gia trực tiếp vào các nhóm đề tài NCKH.")
    add_bullet(doc, "Nhóm Giảng viên / Cán bộ nghiên cứu", "Quy mô ~800 đến 1.000 tài khoản giảng viên cơ hữu và nghiên cứu viên tại các Khoa, Viện KHKT Bưu điện. Dự kiến có 300 - 450 giảng viên tham gia hướng dẫn đề tài mỗi năm.")
    add_bullet(doc, "Nhóm Cán bộ quản lý & Thư ký khoa", "Khoảng 40 - 50 tài khoản chuyên viên Phòng QLKHCN&HTQT, Trợ lý NCKH các Khoa, chuyên viên Phòng CTSV, Phòng TCKT.")
    add_bullet(doc, "Nhóm Hội đồng Khoa học", "Khoảng 150 - 200 chuyên gia, giảng viên được phân quyền chấm điểm theo từng đợt nghiệm thu chuyên ngành.")
    add_bullet(doc, "Số lượng đề tài hàng năm", "Toàn Học viện có từ 300 đến 500 đề tài NCKH sinh viên được phê duyệt thực hiện mỗi năm học.")

    # -------------------------------------------------------------
    # CHƯƠNG 3: GÓC NHÌN PROCESS – QUY TRÌNH
    # -------------------------------------------------------------
    add_h1(doc, "PHẦN 3. GÓC NHÌN PROCESS – QUY TRÌNH")
    
    add_h2(doc, "3.1. Quy trình đăng ký đề tài NCKH của sinh viên")
    add_p(doc, "Theo Khoản 1 Điều 9 QĐ 521, quy trình đăng ký đề tài diễn ra vào đầu mỗi năm học (tháng 8 - tháng 9):")
    add_bullet(doc, "Bước 1 - Thông báo phát động", "Phòng QLKHCN&HTQT phát hành Thông báo kế hoạch NCKH sinh viên năm học trên hệ thống, thiết lập cổng đăng ký mở từ ngày DD/MM đến ngày DD/MM.")
    add_bullet(doc, "Bước 2 - Khởi tạo đề tài và Lập nhóm", "Sinh viên chủ trì đăng nhập hệ thống, nhập Tên đề tài (Tiếng Việt & Tiếng Anh), chọn Lĩnh vực KHCN, Đơn vị chủ trì (Khoa/Viện), Mục tiêu, Nội dung tóm tắt, Sản phẩm dự kiến và Kinh phí đề xuất. Sinh viên chủ trì gửi lời mời tham gia nhóm tới tối đa 4 sinh viên khác bằng Mã sinh viên. Hệ thống tự động kiểm tra quy tắc: 'Mỗi sinh viên chỉ được tham gia tối đa 01 đề tài/năm học' (Khoản 2 Điều 15).")
    add_bullet(doc, "Bước 3 - Mời Cán bộ hướng dẫn", "Sinh viên chọn Giảng viên hướng dẫn từ danh mục giảng viên của Học viện. Hệ thống gửi thông báo mời tới GVHD. GVHD đăng nhập và bấm 'Chấp nhận hướng dẫn' (hệ thống kiểm tra ràng buộc: GVHD không hướng dẫn quá 02 đề tài sinh viên trong cùng thời gian theo Khoản 2 Điều 16).")
    add_bullet(doc, "Bước 4 - Nộp hồ sơ đăng ký", "Sau khi các thành viên và GVHD đã xác nhận, Sinh viên chủ trì bấm 'Nộp đề tài lên Khoa'. Hệ thống khóa chỉnh sửa và chuyển trạng thái đề tài sang 'Chờ Khoa xét duyệt'.")

    add_h2(doc, "3.2. Quy trình xét duyệt và phê duyệt danh mục đề tài")
    add_bullet(doc, "Bước 1 - Hội đồng Khoa thẩm định danh mục", "Trợ lý NCKH Khoa tổng hợp danh sách đề tài đã nộp. Khoa tổ chức họp Hội đồng Khoa học Khoa để đánh giá, nhận xét, chọn lọc tên đề tài và dự kiến kinh phí. Ưu tiên các đề tài: có ứng dụng thực tế tại Học viện, có sản phẩm thử nghiệm, hoặc có bài báo khoa học công bố (Điểm c Khoản 1 Điều 9).")
    add_bullet(doc, "Bước 2 - Lập Công văn đăng ký (Mẫu 1)", "Thư ký khoa cập nhật kết luận của Hội đồng Khoa lên hệ thống (Duyệt / Duyệt có chỉnh sửa / Từ chối). Hệ thống tự động kết xuất Công văn đăng ký đề tài NCKH sinh viên (Mẫu 1). Trưởng khoa và Chủ tịch HĐKH Khoa ký duyệt điện tử và gửi lên Phòng QLKHCN&HTQT (hoàn thành trong tháng 9).")
    add_bullet(doc, "Bước 3 - Thẩm tra cấp Học viện & Ban hành Quyết định", "Phòng QLKHCN&HTQT tổng hợp danh mục toàn trường, thẩm tra tính hợp lệ và định mức kinh phí, trình Giám đốc Học viện. Giám đốc Học viện ban hành Quyết định giao kế hoạch kinh phí thực hiện đề tài kèm danh mục đề tài chính thức cho các Khoa/Viện. Hệ thống tự động cấp Mã số đề tài chuẩn hóa và cập nhật trạng thái 'Đã phê duyệt giao nhiệm vụ'.")

    add_h2(doc, "3.3. Quy trình phân công hoặc xác nhận Giảng viên hướng dẫn")
    add_p(doc, "Hệ thống hỗ trợ 2 phương thức xác lập GVHD theo Khoản 2 Điều 9 QĐ 521:")
    add_bullet(doc, "Phương thức 1 - Sinh viên chủ động đề xuất", "Sinh viên liên hệ trao đổi trước với giảng viên và chọn tên giảng viên khi đăng ký trên hệ thống. Giảng viên nhận thông báo và click xác nhận.")
    add_bullet(doc, "Phương thức 2 - Khoa phân công giảng viên", "Đối với các nhóm sinh viên có ý tưởng tốt nhưng chưa tìm được GVHD, Hội đồng Khoa sẽ chỉ định và phân công giảng viên có chuyên môn phù hợp trực tiếp trên giao diện quản trị Khoa. Giảng viên nhận quyết định phân công và liên hệ nhóm để triển khai.")
    add_bullet(doc, "Quy tắc kiểm soát tự động", "Hệ thống áp dụng Hard Constraint: Mỗi đề tài đúng 01 GVHD; Mỗi GVHD tối đa 02 đề tài NCKH sinh viên/năm học. Nếu vượt quá, hệ thống sẽ chặn và cảnh báo.")

    add_h2(doc, "3.4. Quy trình theo dõi và quản lý tiến độ thực hiện đề tài")
    add_bullet(doc, "Nộp và Duyệt Đề cương chi tiết (Mẫu 2)", "Sau khi có Quyết định giao đề tài, nhóm sinh viên hoàn thiện Đề cương nghiên cứu theo Mẫu 2, gửi GVHD duyệt và nộp lên Khoa. Khoa thẩm định đề cương và gửi bản sao phê duyệt về Phòng QLKHCN&HTQT.")
    add_bullet(doc, "Theo dõi các mốc tiến độ (Milestones)", "Hệ thống thiết lập 3 mốc kiểm soát chính: Mốc 1 (Tháng 11 - Hoàn thành tổng quan tài liệu và thiết kế phương pháp); Mốc 2 (Tháng 1 - Hoàn thành thử nghiệm/chế tạo sản phẩm); Mốc 3 (Tháng 3 - Viết dự thảo báo cáo tổng kết). Nhóm sinh viên cập nhật sản phẩm đầu ra của từng mốc, GVHD nhận xét và chấm tiến độ (Đạt/Chậm tiến độ/Cần khắc phục).")
    add_bullet(doc, "Tổ chức Hội thảo khoa học góp ý (Mẫu 3.5)", "Trong quá trình thực hiện, Khoa/Bộ môn tổ chức buổi hội thảo sinh hoạt học thuật để nhóm báo cáo tiến độ và tiếp thu ý kiến đóng góp từ các thầy cô chuyên môn. Thư ký nhập Biên bản hội thảo theo Mẫu 3.5 lên hệ thống (Điểm c Khoản 3 Điều 9).")

    add_h2(doc, "3.5. Quy trình sinh viên nộp báo cáo tổng kết và sản phẩm nghiên cứu")
    add_bullet(doc, "Thời gian nộp", "Nhóm sinh viên hoàn thiện báo cáo và nộp trực tuyến trước đợt nghiệm thu của Khoa (hạn chót thông thường vào cuối tháng 3).")
    add_bullet(doc, "Hồ sơ nộp trực tuyến bao gồm", 
        "\n  + Quyển Báo cáo tổng kết đề tài toàn văn (file PDF chuẩn theo định dạng A4 quy định tại Mẫu 3.1);"
        "\n  + Trang bìa chính (Mẫu 3.2) và Trang bìa phụ (Mẫu 3.3);"
        "\n  + Bản Thông tin kết quả nghiên cứu của đề tài (Mẫu 3.4 - tóm tắt tính mới, kết quả, khả năng ứng dụng);"
        "\n  + Minh chứng công bố khoa học (nếu có: file PDF bài báo đã được đăng/chấp nhận đăng trên tạp chí, hội nghị);"
        "\n  + Sản phẩm nghiên cứu: Link kho mã nguồn Git, video demo, file cài đặt phần mềm hoặc tài liệu thiết kế phần cứng."
    )
    add_bullet(doc, "Kiểm tra điều kiện nộp", "GVHD xem xét toàn bộ hồ sơ, nếu đạt yêu cầu sẽ bấm 'Xác nhận đồng ý cho bảo vệ nghiệm thu'.")

    add_h2(doc, "3.6. Quy trình đánh giá, chấm điểm và nghiệm thu đề tài")
    add_p(doc, "Theo Điều 10 QĐ 521, quy trình nghiệm thu được thực hiện nghiêm ngặt:")
    add_bullet(doc, "Thành lập Hội đồng nghiệm thu", "Trưởng khoa ra Quyết định thành lập các Hội đồng đánh giá nghiệm thu cấp Khoa/Bộ môn (gồm Chủ tịch, Thư ký, Ủy viên phản biện và các Ủy viên). Đại diện Phòng QLKHCN&HTQT tham dự giám sát.")
    add_bullet(doc, "Chấm điểm độc lập (Mẫu 4.1)", "Từng thành viên Hội đồng đăng nhập hệ thống bằng tài khoản cá nhân, nghe nhóm sinh viên thuyết trình và chấm điểm trực tiếp trên Phiếu đánh giá điện tử (Mẫu 4.1) theo thang điểm 100 với 7 tiêu chí: (1) Tổng quan tình hình NC - max 10đ; (2) Mục tiêu đề tài - max 10đ; (3) Phương pháp NC - max 15đ; (4) Nội dung khoa học - max 35đ; (5) Đóng góp KT-XH/Giáo dục - max 15đ; (6) Hình thức trình bày - max 5đ; (7) Điểm thưởng công bố bài báo - max 10đ.")
    add_bullet(doc, "Tổng hợp điểm & Xếp loại tự động", "Hệ thống tự động tính Điểm trung bình (ĐTB) của các thành viên có mặt và xếp loại theo 5 mức chuẩn của QĐ 521:")
    
    # Small criteria table
    headers_grade = ["Mức Xếp loại", "Khung điểm quy định (Thang 100)", "Quyền lợi & Xử lý tiếp theo"]
    data_grade = [
        ["Xuất sắc", "Từ 90 điểm trở lên (>= 90)", "Cấp Giấy chứng nhận; Đề xuất tham gia giải thưởng cấp Bộ (Mẫu 5); Ưu tiên tuyển dụng/giữ lại"],
        ["Tốt", "Từ 80 đến dưới 90 điểm (80 - < 90)", "Cấp Giấy chứng nhận; Ưu tiên tuyển dụng / giới thiệu việc làm trong Ngành"],
        ["Khá", "Từ 70 đến dưới 80 điểm (70 - < 80)", "Cấp Giấy chứng nhận NCKH; Cho phép phát triển làm Khóa luận/Đồ án tốt nghiệp"],
        ["Đạt", "Từ 50 đến dưới 70 điểm (50 - < 70)", "Được công nhận hoàn thành đề tài; Làm thủ tục thanh quyết toán kinh phí"],
        ["Không đạt", "Dưới 50 điểm (< 50)", "Không nghiệm thu; Thu hồi kinh phí theo quy định; Không tính giờ NCKH"]
    ]
    add_styled_table(doc, headers_grade, data_grade, [1.4, 2.0, 2.9])

    add_bullet(doc, "Lập Biên bản & Nộp hồ sơ về Học viện (trước 10/4)", "Thư ký lập Biên bản nghiệm thu (Mẫu 4.2) và Bảng tổng hợp xếp loại (Mẫu 4.3). Nhóm sinh viên có 05 ngày để chỉnh sửa báo cáo theo góp ý của Hội đồng. Trưởng khoa ký duyệt và gửi toàn bộ hồ sơ nghiệm thu về Phòng QLKHCN&HTQT trước ngày 10 tháng 4 hàng năm.")

    add_h2(doc, "3.7. Quy trình cập nhật kết quả và chuyển đổi trạng thái vòng đời đề tài")
    add_p(doc, "Trạng thái của đề tài được cập nhật tự động theo máy trạng thái (State Machine) đảm bảo tính toàn vẹn dữ liệu:")
    add_callout(doc, 
        "[Bản nháp (Draft)] -> [Đã nộp đăng ký (Submitted)] -> [Khoa đã duyệt (Faculty Approved)] "
        "-> [Học viện ra QĐ giao đề tài (Institute Approved)] -> [Đang triển khai (In Progress)] "
        "-> [Đã nộp báo cáo nghiệm thu (Submitted Final)] -> [Đã nghiệm thu (Evaluated)] "
        "-> [Hoàn tất hồ sơ / Đạt giải (Closed / Awarded)].",
        "CHUỖI TRẠNG THÁI VÒNG ĐỜI ĐỀ TÀI: "
    )

    add_h2(doc, "3.8. Xử lý các tình huống ngoại lệ (Từ chối, Chỉnh sửa, Quá hạn, Không hoàn thành)")
    add_bullet(doc, "Đề tài bị Hội đồng Khoa từ chối xét duyệt danh mục", "Hệ thống ghi nhận lý do từ chối, gửi thông báo tới sinh viên và GVHD. Đề tài chuyển trạng thái 'Không được duyệt', sinh viên có thể đăng ký đề tài khác nếu còn trong thời hạn mở cổng.")
    add_bullet(doc, "Yêu cầu chỉnh sửa Đề cương hoặc Báo cáo nghiệm thu", "Trạng thái chuyển sang 'Yêu cầu chỉnh sửa' kèm danh sách ý kiến góp ý của Hội đồng. Hệ thống mở quyền cập nhật cho sinh viên trong thời hạn quy định (thường 5 - 7 ngày), đính kèm bảng giải trình tiếp thu ý kiến.")
    add_bullet(doc, "Đề tài quá hạn mốc tiến độ hoặc quá hạn nộp báo cáo", "Hệ thống tự động kích hoạt cảnh báo qua Email/In-app trước 7 ngày, 3 ngày và 1 ngày. Nếu quá hạn mà không có đơn xin gia hạn được phê duyệt, đề tài sẽ bị khóa chức năng nộp bài và chuyển vào danh sách 'Chậm tiến độ' báo cáo Lãnh đạo Khoa.")
    add_bullet(doc, "Đề tài xin gia hạn hoặc xin dừng/hủy bỏ", "Sinh viên chủ trì nộp Đơn xin gia hạn (tối đa 1 lần, không quá 30 ngày) hoặc Đơn xin hủy đề tài (có xác nhận của GVHD). Trưởng khoa thẩm định và chuyển Phòng QLKHCN&HTQT xem xét trình Ban Giám đốc Học viện phê duyệt.")

    add_h2(doc, "3.9. Các điểm kiểm soát và phê duyệt trọng yếu (Approval Gates)")
    add_bullet(doc, "Gate 1 - Phê duyệt Danh mục đề tài cấp Khoa", "Thẩm quyền: Chủ tịch HĐKH Khoa & Trưởng Khoa (Ký duyệt danh mục Mẫu 1).")
    add_bullet(doc, "Gate 2 - Quyết định giao nhiệm vụ và Kinh phí cấp Học viện", "Thẩm quyền: Giám đốc Học viện (Ban hành Quyết định chính thức).")
    add_bullet(doc, "Gate 3 - Phê duyệt Đề cương chi tiết (Mẫu 2)", "Thẩm quyền: GVHD và Ban Chủ nhiệm Khoa.")
    add_bullet(doc, "Gate 4 - Phê duyệt đủ điều kiện Nghiệm thu", "Thẩm quyền: Cán bộ hướng dẫn & Trưởng Bộ môn.")
    add_bullet(doc, "Gate 5 - Phê duyệt Kết quả Nghiệm thu & Xếp loại", "Thẩm quyền: Chủ tịch Hội đồng nghiệm thu Khoa & Trưởng Khoa (Mẫu 4.2, 4.3).")
    add_bullet(doc, "Gate 6 - Phê duyệt Cấp Giấy chứng nhận, Khen thưởng & Danh mục thi Bộ (Mẫu 5)", "Thẩm quyền: Trưởng phòng QLKHCN&HTQT & Giám đốc Học viện.")

    # -------------------------------------------------------------
    # CHƯƠNG 4: GÓC NHÌN DATA – DỮ LIỆU
    # -------------------------------------------------------------
    add_h1(doc, "PHẦN 4. GÓC NHÌN DATA – DỮ LIỆU")
    
    add_h2(doc, "4.1. Thông tin lưu trữ về Sinh viên")
    add_bullet(doc, "Thuộc tính định danh và học vụ", "Mã sinh viên (PK), Họ và tên, Ngày sinh, Giới tính, Dân tộc (phục vụ bìa phụ Mẫu 3.3), Lớp học sinh hoạt, Khóa học, Chuyên ngành đào tạo, Khoa quản lý, Cơ sở đào tạo (Hà Nội / TP.HCM), Hệ đào tạo (Chính quy), Năm học thứ mấy / Số năm đào tạo chuẩn (Mẫu 3.3).")
    add_bullet(doc, "Thuộc tính liên lạc & Hệ thống", "Email sinh viên (@stu.ptit.edu.vn), Số điện thoại, Điểm trung bình chung tích lũy (GPA), Điểm rèn luyện.")
    add_bullet(doc, "Lịch sử NCKH", "Danh sách đề tài đã/đang tham gia, vai trò trong đề tài (Chủ trì/Thành viên/Trợ lý), Kết quả nghiệm thu các năm trước, Danh hiệu/Giải thưởng NCKH & Olympic đã đạt được, Điểm thưởng học bổng được cộng.")

    add_h2(doc, "4.2. Thông tin lưu trữ về Giảng viên / Cán bộ hướng dẫn")
    add_bullet(doc, "Thuộc tính chuyên môn", "Mã giảng viên (PK), Họ và tên, Học hàm (GS/PGS), Học vị (TS/ThS/KS), Khoa/Bộ môn/Viện nghiên cứu trực thuộc, Hướng nghiên cứu chuyên sâu / Lĩnh vực chuyên môn, Địa chỉ email công vụ (@ptit.edu.vn), Số điện thoại di động.")
    add_bullet(doc, "Thuộc tính tải giảng dạy và NCKH", "Số lượng đề tài sinh viên đang hướng dẫn trong năm học hiện tại (tự động cập nhật, max = 2), Tổng số giờ NCKH tích lũy quy đổi từ hướng dẫn sinh viên, Danh sách đề tài SV đạt giải cấp Bộ/Học viện do GV hướng dẫn.")

    add_h2(doc, "4.3. Thông tin lưu trữ về Đề tài Nghiên cứu Khoa học")
    add_bullet(doc, "Thông tin định danh đề tài", "Mã số đề tài (PK - quy chuẩn: SV-YYYY-KHOA-XXX), Tên đề tài tiếng Việt, Tên đề tài tiếng Anh, Thuộc nhóm ngành/lĩnh vực KHCN (Khoa học tự nhiên, Kỹ thuật - Công nghệ, CNTT & Truyền thông, Kinh tế - Xã hội), Năm học thực hiện.")
    add_bullet(doc, "Nội dung học thuật", "Tính cấp thiết, Mục tiêu đề tài, Nội dung nghiên cứu chính, Phương pháp nghiên cứu, Dự kiến kết quả đạt được, Khả năng ứng dụng vào thực tiễn Học viện / Doanh nghiệp.")
    add_bullet(doc, "Thông tin quản lý & Tài chính", "Đơn vị chủ trì (Khoa/Viện), Đơn vị phối hợp (nếu có), Kinh phí dự kiến đăng ký, Kinh phí được Học viện cấp theo Quyết định, Trạng thái đề tài, Ngày nộp hồ sơ, Ngày nghiệm thu.")

    add_h2(doc, "4.4. Thông tin quản lý về Nhóm sinh viên thực hiện")
    add_bullet(doc, "Cấu trúc nhóm đề tài", "Mã nhóm (PK), Mã đề tài (FK), Danh sách thành viên (tối đa 5 SV). Với mỗi thành viên: Mã sinh viên (FK), Vai trò trong nhóm (Chủ trì đề tài / Thành viên), Tỷ lệ đóng góp (%), Nhiệm vụ chuyên môn được phân công cụ thể trong đề cương, Ngày tham gia nhóm, Trạng thái xác nhận.")

    add_h2(doc, "4.5. Thông tin quản lý về Cơ cấu Đơn vị (Khoa / Bộ môn / Viện)")
    add_bullet(doc, "Thuộc tính cơ cấu", "Mã đơn vị (PK), Tên đơn vị (Khoa CNTT 1, Khoa Điện tử 1, Khoa Viễn thông 1, Khoa Đa phương tiện, Viện KHKT Bưu điện, Viện Kinh tế Bưu điện...), Loại đơn vị (Khoa đào tạo, Viện nghiên cứu, Phòng ban chức năng), Cơ sở (Hà Nội / Cơ sở TP.HCM), Danh sách các Bộ môn trực thuộc, Thông tin Trưởng đơn vị, Thông tin Trợ lý/Thư ký NCKH.")

    add_h2(doc, "4.6. Dữ liệu quá trình Đăng ký và Xét duyệt đề tài")
    add_bullet(doc, "Dữ liệu xét duyệt cấp Khoa (Mẫu 1)", "Mã đợt đăng ký, Ngày họp HĐKH Khoa, Điểm đánh giá sơ bộ, Ý kiến nhận xét của Hội đồng, Kết luận của Khoa (Đồng ý/Loại/Sửa đổi), Kinh phí Khoa đề xuất, Số công văn Khoa gửi Học viện.")
    add_bullet(doc, "Dữ liệu Quyết định giao đề tài của Giám đốc", "Số Quyết định (521/.../QĐ-HV), Ngày ký quyết định, Kinh phí chính thức được phê duyệt giao cho từng đề tài, Danh mục đề tài đính kèm.")
    add_bullet(doc, "Dữ liệu Đề cương chi tiết (Mẫu 2)", "File số đề cương (PDF/Word), Ngày nộp đề cương, Ý kiến thẩm định của tiểu ban chuyên môn, Trạng thái phê duyệt đề cương.")

    add_h2(doc, "4.7. Dữ liệu Theo dõi Tiến độ thực hiện")
    add_bullet(doc, "Dữ liệu mốc tiến độ (Milestones)", "Mã mốc tiến độ, Tên mốc, Hạn hoàn thành, Nội dung công việc cam kết, Sản phẩm trung gian đã upload, Báo cáo giải trình tiến độ, Nhận xét đánh giá của GVHD (Đúng hạn/Chậm tiến độ).")
    add_bullet(doc, "Dữ liệu Sinh hoạt học thuật & Hội thảo (Mẫu 3.5)", "Mã biên bản hội thảo, Thời gian, Địa điểm tổ chức, Thành phần tham dự (GVHD, các nhà khoa học, nhóm SV), Nội dung các ý kiến đóng góp, Kết luận của chủ trì hội thảo, File đính kèm biên bản có chữ ký.")

    add_h2(doc, "4.8. Dữ liệu Báo cáo, Sản phẩm và Tài liệu của đề tài")
    add_bullet(doc, "Tài liệu văn bản", "File Báo cáo tổng kết toàn văn (PDF chuẩn bìa Mẫu 3.2, bìa phụ Mẫu 3.3, mục lục, nội dung theo Mẫu 3.1), File Tóm tắt kết quả nghiên cứu (Mẫu 3.4 - Word/PDF), Phiếu nhận xét của Cán bộ hướng dẫn.")
    add_bullet(doc, "Minh chứng công bố khoa học", "Tên bài báo, Tên tạp chí/Hội thảo khoa học, Chỉ số ISSN/ISBN, Ngày công bố, Thứ hạng tạp chí (Scopus/WoS/Văn bản ngành TT&TT), Bản scan nguyên văn bài báo và trang bìa/mục lục tạp chí (Khoản 2 Điều 12).")
    add_bullet(doc, "Sản phẩm thực tế & Mã nguồn", "Đường dẫn kho lưu trữ mã nguồn Git (GitLab/GitHub), File cài đặt phần mềm/App (APK, IPA, EXE), Video clip demo sản phẩm, Bản vẽ sơ đồ mạch nguyên lý/mô hình phần cứng.")

    add_h2(doc, "4.9. Dữ liệu Đánh giá, Điểm số và Kết quả Nghiệm thu")
    add_bullet(doc, "Dữ liệu Phiếu chấm điểm độc lập (Mẫu 4.1)", "Mã phiếu chấm, Mã đề tài, Mã giám khảo (Thành viên Hội đồng), Điểm chi tiết 7 tiêu chuẩn (Tổng quan max 10, Mục tiêu max 10, Phương pháp max 15, Nội dung max 35, Đóng góp max 15, Hình thức max 5, Điểm thưởng bài báo max 10), Tổng điểm (thang 100), Nhận xét ưu điểm, tồn tại, kiến nghị.")
    add_bullet(doc, "Dữ liệu Biên bản nghiệm thu (Mẫu 4.2 & 4.3)", "Quyết định thành lập Hội đồng, Ngày nghiệm thu, Điểm trung bình cuối cùng, Kết luận xếp loại (Xuất sắc/Tốt/Khá/Đạt/Không đạt), Kiến nghị khen thưởng, Kiến nghị tham gia Giải thưởng cấp Bộ (Mẫu 5), Kiến nghị triển khai ứng dụng vào thực tiễn Học viện (Điều 13).")
    add_bullet(doc, "Dữ liệu Chứng nhận & Khen thưởng", "Mã Giấy chứng nhận điện tử (tra cứu trực tuyến bằng mã QR), Quyết định khen thưởng của Giám đốc Học viện, Điểm thưởng học bổng tương ứng.")

    add_h2(doc, "4.10. Mô hình Dữ liệu Quan hệ (ERD - Entity Relationship Diagram)")
    add_p(doc, "Lược đồ cơ sở dữ liệu quan hệ chuẩn hóa mức 3 (3NF) gồm 12 bảng thực thể chính:")
    add_bullet(doc, "USERS & ROLES", "Lưu thông tin tài khoản đăng nhập, định danh SSO, mật khẩu băm, quyền hạn.")
    add_bullet(doc, "STUDENTS (Sinh viên)", "Lưu hồ sơ chi tiết sinh viên, khóa, ngành, lớp, GPA, liên kết 1-N với PROJECT_MEMBERS.")
    add_bullet(doc, "LECTURERS (Giảng viên)", "Lưu hồ sơ cán bộ hướng dẫn, học hàm học vị, liên kết 1-N với PROJECTS.")
    add_bullet(doc, "DEPARTMENTS (Khoa / Viện)", "Lưu danh mục đơn vị cơ sở, liên kết 1-N với STUDENTS, LECTURERS, PROJECTS.")
    add_bullet(doc, "PROJECTS (Đề tài NCKH)", "Thực thể trung tâm, lưu toàn bộ thông tin đề tài, trạng thái, kinh phí, liên kết với PROJECT_MEMBERS, MILESTONES, EVALUATIONS.")
    add_bullet(doc, "PROJECT_MEMBERS (Thành viên nhóm)", "Bảng nối quan hệ N-N giữa PROJECTS và STUDENTS, lưu vai trò (Chủ trì/Thành viên) và tỷ lệ đóng góp.")
    add_bullet(doc, "MILESTONES (Mốc tiến độ)", "Lưu các giai đoạn kiểm tra tiến độ, liên kết 1-N với PROJECT_REPORTS.")
    add_bullet(doc, "COUNCILS (Hội đồng Khoa học)", "Lưu thông tin các hội đồng xét duyệt và hội đồng nghiệm thu.")
    add_bullet(doc, "COUNCIL_MEMBERS (Thành viên Hội đồng)", "Lưu danh sách giám khảo trong từng hội đồng, vai trò (Chủ tịch, Thư ký, Phản biện, Ủy viên).")
    add_bullet(doc, "EVALUATION_SHEETS (Phiếu chấm điểm Mẫu 4.1)", "Lưu điểm số chi tiết từng tiêu chí của từng giám khảo chấm cho từng đề tài.")
    add_bullet(doc, "PROJECT_DOCUMENTS (Tài liệu, Báo cáo & Minh chứng)", "Lưu metadata file upload (Đề cương Mẫu 2, Báo cáo 3.1-3.4, Biên bản 3.5, Bài báo, Mã nguồn).")
    add_bullet(doc, "CERTIFICATES_AWARDS (Chứng nhận & Khen thưởng)", "Lưu thông tin cấp giấy chứng nhận, xếp loại, điểm thưởng học bổng.")

    add_h2(doc, "4.11. Phân loại dữ liệu theo mức độ nhạy cảm và Chính sách Bảo mật")
    add_p(doc, "Dữ liệu hệ thống được phân cấp thành 4 mức độ bảo mật nghiêm ngặt:")

    headers_data_sec = ["Cấp độ bảo mật", "Danh mục dữ liệu", "Đối tượng được phép truy cập", "Biện pháp bảo vệ"]
    data_data_sec = [
        ["Công khai (Public)", "Tên đề tài, Tác giả, GVHD, Tóm tắt kết quả (Mẫu 3.4), Bài báo khoa học", "Toàn bộ giảng viên, sinh viên, cộng đồng nghiên cứu bên ngoài", "Index tìm kiếm toàn văn, công bố trên Cổng thông tin Học viện (Điều 14)"],
        ["Nội bộ (Internal)", "Đề cương chi tiết (Mẫu 2), Toàn văn Báo cáo tổng kết, Video/Mã nguồn", "Cán bộ, giảng viên, sinh viên có tài khoản PTIT", "Xác thực qua SSO CAS/OAuth2, chống tải lậu hàng loạt"],
        ["Hạn chế (Restricted)", "Phiếu chấm điểm chi tiết từng giám khảo (Mẫu 4.1), Dự toán kinh phí chi tiết", "Hội đồng nghiệm thu, Ban Chủ nhiệm Khoa, Phòng QLKHCN, Phòng TCKT", "Phân quyền theo vai trò (RBAC), mã hóa đường truyền SSL/TLS"],
        ["Tuyệt mật / Nhạy cảm (Confidential)", "Mật khẩu, Token xác thực, Khóa ký số, Nhật ký kiểm toán (Audit Logs)", "Chỉ Quản trị viên hệ thống (Super Admin)", "Mã hóa dữ liệu tại chỗ (Data-at-Rest AES-256), Log toàn bộ hành vi truy cập"]
    ]
    add_styled_table(doc, headers_data_sec, data_data_sec, [1.3, 1.8, 1.8, 1.4])

    # -------------------------------------------------------------
    # CHƯƠNG 5: GÓC NHÌN TECHNOLOGY – CÔNG NGHỆ
    # -------------------------------------------------------------
    add_h1(doc, "PHẦN 5. GÓC NHÌN TECHNOLOGY – CÔNG NGHỆ")
    
    add_h2(doc, "5.1. Yêu cầu hạ tầng phần cứng triển khai và vận hành")
    add_p(doc, "Hạ tầng phần cứng được thiết kế đáp ứng quy mô 20.000 người dùng, khả năng chịu tải cao trong các đợt cao điểm nộp hồ sơ (tháng 9 và tháng 4):")
    add_bullet(doc, "Máy chủ Web / Ứng dụng (Web/App Server Cluster)", "02 - 04 Node máy chủ ảo hóa (VM) chạy cân bằng tải (Load Balancing). Cấu hình mỗi Node: 8 vCPU, 16GB - 32GB RAM, 100GB SSD OS.")
    add_bullet(doc, "Máy chủ Cơ sở dữ liệu (Database Server Master - Slave)", "02 Node (1 Master ghi, 1 Read-Replica đọc). Cấu hình: 16 vCPU, 32GB - 64GB RAM, 500GB SSD NVMe chuẩn Enterprise chạy RAID 10.")
    add_bullet(doc, "Hệ thống lưu trữ tệp đính kèm (Object Storage Cluster)", "Sử dụng cụm MinIO / Ceph Storage dung lượng 5TB - 10TB có khả năng mở rộng linh hoạt, lưu trữ file báo cáo PDF, video demo và sản phẩm số.")
    add_bullet(doc, "Máy chủ Sao lưu dự phòng (Backup Server)", "Đặt tại phân vùng mạng độc lập hoặc cơ sở 2 (Cơ sở TP.HCM), dung lượng lưu trữ >= 10TB.")

    add_h2(doc, "5.2. Mô hình triển khai ứng dụng: Web-first Responsive kết hợp Mobile API")
    add_bullet(doc, "Lựa chọn kiến trúc Web-First", "Hệ thống được phát triển chủ đạo dưới dạng ứng dụng Web Responsive (Web-first) tương thích hoàn hảo trên mọi kích thước màn hình (Desktop, Laptop, Tablet, Smartphone).")
    add_bullet(doc, "Lý do lựa chọn", "Nghiệp vụ NCKH đòi hỏi các thao tác phức tạp như: soạn thảo đề cương, đọc duyệt tài liệu khoa học hàng trăm trang, chấm điểm bảng biểu nhiều tiêu chí (Mẫu 4.1), xuất báo cáo hành chính (Mẫu 1-5). Các thao tác này đạt hiệu suất cao nhất trên giao diện Web màn hình máy tính. Đồng thời, hệ thống cung cấp giao diện Mobile thân thiện cho sinh viên và giảng viên tra cứu nhanh, nhận thông báo đẩy (Push Notification) và xác nhận mốc tiến độ.")

    add_h2(doc, "5.3. Ngăn xếp công nghệ tổng thể (Technology Stack)")
    add_bullet(doc, "Tầng Trình diễn (Frontend)", "React.js / Next.js với TypeScript; Thiết kế giao diện hiện đại, tinh chuẩn với Vanilla Design Tokens và Tailwind CSS; Thư viện UI Radix / Ant Design; Trực quan hóa tiến độ bằng Chart.js & Gantt Chart.")
    add_bullet(doc, "Tầng Xử lý nghiệp vụ (Backend)", "Node.js (NestJS) hoặc Java (Spring Boot 3.x) kiến trúc Clean Architecture / Modular Monolith; Xác thực JWT / OAuth2; Xử lý tác vụ nền và hàng đợi (Background Worker) bằng BullMQ / Celery.")
    add_bullet(doc, "Tầng Dữ liệu & Lưu trữ (Data & Storage)", "Hệ quản trị CSDL quan hệ PostgreSQL 16 (hỗ trợ JSONB, Partitioning theo năm học); Redis 7 cho Caching và quản lý Session; MinIO Object Storage tương thích S3 API cho tệp đính kèm.")
    add_bullet(doc, "Tầng Tìm kiếm tri thức (Search Engine)", "Tích hợp Elasticsearch / Meilisearch phục vụ tìm kiếm toàn văn (Full-text search) tiếng Việt có dấu trong tên đề tài, tóm tắt và nội dung báo cáo.")

    add_h2(doc, "5.4. Ngôn ngữ lập trình và Framework chi tiết")
    add_bullet(doc, "Frontend Framework", "Next.js 14+ (App Router) / React 18+ với TypeScript giúp đảm bảo tính chặt chẽ về kiểu dữ liệu (Type-safety), Server-Side Rendering (SSR) cho cổng tra cứu công khai và Single Page Application (SPA) cho trang quản trị nội bộ.")
    add_bullet(doc, "Backend Framework", "NestJS (TypeScript) với kiến trúc Module hóa rõ ràng (Dependency Injection, DTO Validation, Guards, Interceptors) hoặc Spring Boot (Java 21) cho khả năng xử lý giao dịch tài chính - học vụ mạnh mẽ, độ ổn định cao.")

    add_h2(doc, "5.5. Hệ quản trị Cơ sở dữ liệu")
    add_bullet(doc, "PostgreSQL 16", "Lựa chọn số 1 cho hệ thống quản lý học thuật nhờ đảm bảo tuyệt đối tính toàn vẹn giao dịch (ACID), hỗ trợ mạnh mẽ kiểu dữ liệu cấu trúc và bán cấu trúc (JSONB cho các tiêu chí chấm điểm động), khả năng phân vùng bảng (Table Partitioning) theo Năm học (Academic_Year) giúp tối ưu hiệu năng truy vấn dữ liệu lịch sử.")
    add_bullet(doc, "Redis Cluster", "Lưu trữ bộ đệm danh mục dùng chung (Khoa, Ngành, Giảng viên), lưu phiên đăng nhập (Session Store), và điều phối hàng đợi gửi email thông báo tự động.")

    add_h2(doc, "5.6. Công nghệ mạng, Giao thức truyền thông và API")
    add_bullet(doc, "Giao thức bảo mật", "Toàn bộ kết nối bắt buộc qua HTTPS với giao thức TLS 1.3, chứng chỉ số SSL/TLS do Let's Encrypt hoặc CA uy tín cấp.")
    add_bullet(doc, "Kiến trúc API", "RESTful API chuẩn hóa theo tiêu chuẩn OpenAPI / Swagger Specification; GraphQL cho các màn hình dashboard thống kê động phức tạp; WebSockets (Socket.io) phục vụ thông báo thời gian thực (Real-time notifications) khi có sự kiện duyệt/chấm điểm.")

    add_h2(doc, "5.7. Mô hình hạ tầng: Private Cloud tại Trung tâm Dữ liệu PTIT")
    add_p(doc, "Hệ thống được ưu tiên triển khai trên hạ tầng Private Cloud đặt tại Trung tâm Dữ liệu (Data Center) của Học viện Công nghệ Bưu chính Viễn thông:")
    add_bullet(doc, "Ưu điểm bảo mật và chủ quyền dữ liệu", "Đảm bảo toàn bộ tài liệu nghiên cứu, công trình khoa học và thông tin cá nhân của cán bộ/sinh viên được lưu giữ an toàn tuyệt đối trong mạng nội bộ của Bộ TT&TT và Học viện.")
    add_bullet(doc, "Ảo hóa & Container hóa", "Triển khai trên nền tảng Docker Container và điều phối tự động bằng Kubernetes (K8s) hoặc Docker Swarm, giúp dễ dàng mở rộng tài nguyên (Scale-out) khi vào đợt cao điểm xét duyệt/nghiệm thu.")

    add_h2(doc, "5.8. Cơ chế Bảo mật, Định danh và Xác thực người dùng")
    add_bullet(doc, "Xác thực tập trung PTIT Slink SSO", "Liên thông xác thực tập trung với Cổng xác thực PTIT Slink SSO (gwdu.ptit.edu.vn) qua giao thức OpenID Connect (OIDC) / OAuth 2.0. Hỗ trợ đăng nhập một chạm qua PTIT Microsoft Outlook (@ptit.edu.vn, @stu.ptit.edu.vn cho miền Bắc) và PTIT Google Gmail (cho miền Nam). Tuyệt đối không lưu mật khẩu cục bộ trên SRMS.")
    add_bullet(doc, "Gán Role tự động theo Claims (Claim-based Auto Role Provisioning)", "Ngay khi đăng nhập thành công, hệ thống giải mã ID Token nhận từ IdP và tự động map người dùng vào các Role tương ứng: Sinh viên (theo domain @stu hoặc mã SV), Giảng viên/GVHD (theo domain @ptit), Thư ký Khoa (theo danh bạ cán bộ), P.QLKHCN. Loại bỏ hoàn toàn việc tạo user thủ công.")
    add_bullet(doc, "Phân quyền theo ngữ cảnh (ABAC)", "Kết hợp Role-Based Access Control (kiểm soát quyền theo chức danh) và Attribute-Based Access Control (kiểm soát theo ngữ cảnh: chỉ thành viên Hội đồng mới được mở Phiếu chấm Mẫu 4.1; khóa chỉnh sửa báo cáo sau thời hạn nộp).")
    add_bullet(doc, "Bảo vệ chống tấn công mạng", "Trang bị Web Application Firewall (WAF), phòng chống triệt để các lỗ hổng OWASP Top 10 (SQL Injection, XSS, CSRF, IDOR, Rate Limiting chống spam/DDoS).")
    add_bullet(doc, "Ký số điện tử & Xác thực toàn vẹn bằng Mã QR", "Áp dụng ký số HSM / Chữ ký điện tử nội bộ cho các biên bản nghiệm thu (Mẫu 4.2) và Giấy chứng nhận NCKH điện tử, xuất file PDF có gắn dấu thời gian (Timestamp) và mã QR tra cứu toàn vẹn.")

    add_h2(doc, "5.9. Cơ chế Sao lưu (Backup) và Khôi phục sau thảm họa (Disaster Recovery)")
    add_bullet(doc, "Chiến lược Backup 3-2-1", "Lưu 3 bản sao dữ liệu, trên 2 loại thiết bị lưu trữ khác nhau, và 1 bản sao lưu ngoại vi (Off-site backup tại Cơ sở TP.HCM).")
    add_bullet(doc, "Tần suất sao lưu", "Full Backup toàn bộ cơ sở dữ liệu và file đính kèm hàng tuần; Differential Backup hàng ngày; Backup nhật ký ghi (WAL - Write-Ahead Logging) liên tục mỗi 15 phút.")
    add_bullet(doc, "Chỉ số RPO và RTO cam kết", "Recovery Point Objective (RPO) <= 15 phút (mất mát dữ liệu tối đa không quá 15 phút khi có sự cố nghiêm trọng); Recovery Time Objective (RTO) <= 1 giờ (thời gian khôi phục hệ thống hoạt động bình thường dưới 60 phút).")

    add_h2(doc, "5.10. Yêu cầu Phi chức năng (Hiệu năng, Khả năng mở rộng, Tính sẵn sàng)")
    add_bullet(doc, "Hiệu năng phản hồi (Response Time)", "Thời gian tải trang trung bình <= 1.5 giây; Thời gian phản hồi API trung bình <= 500ms; Thời gian tạo và kết xuất báo cáo PDF/Word <= 3.0 giây.")
    add_bullet(doc, "Khả năng mở rộng (Scalability)", "Hệ thống thiết kế theo kiến trúc phi trạng thái (Stateless Services), cho phép mở rộng ngang (Horizontal Pod Autoscaling) tự động tăng số lượng instance khi CPU/RAM vượt ngưỡng 75%.")
    add_bullet(doc, "Tính sẵn sàng cao (High Availability)", "Cam kết chỉ số Uptime >= 99.9% trong suốt năm học (tổng thời gian gián đoạn ngoài kế hoạch < 8.7 giờ/năm).")

    # -------------------------------------------------------------
    # CHƯƠNG 6: GÓC NHÌN FUNCTION / APPLICATION – CHỨC NĂNG
    # -------------------------------------------------------------
    add_h1(doc, "PHẦN 6. GÓC NHÌN FUNCTION / APPLICATION – CHỨC NĂNG / ỨNG DỤNG")
    
    add_h2(doc, "6.1. Module Đăng nhập, Đăng xuất và Quản lý Tài khoản")
    add_bullet(doc, "Đăng nhập một chạm PTIT Slink SSO", "Hỗ trợ đăng nhập qua tài khoản PTIT Microsoft Outlook (CB/GV/SV miền Bắc) và PTIT Google Gmail (CB/GV/SV miền Nam) qua cổng SSO gwdu.ptit.edu.vn.")
    add_bullet(doc, "Tự động gán quyền (Auto Role Provisioning)", "Tự động kích hoạt quyền tương ứng cho Sinh viên, Giảng viên, Thư ký Khoa, Chuyên viên QLKH ngay lần đầu đăng nhập dựa trên ID Token; không cần phân quyền thủ công.")
    add_bullet(doc, "Quản lý phiên làm việc", "Tự động đăng xuất sau 30 phút không hoạt động để bảo mật; Hỗ trợ ghi nhớ đăng nhập (Remember me) với Refresh Token an toàn lưu tại Redis Cluster.")

    add_h2(doc, "6.2. Module Quản lý Thông tin Sinh viên và Giảng viên")
    add_bullet(doc, "Đồng bộ dữ liệu học vụ", "Đồng bộ danh sách sinh viên, lớp, ngành, GPA từ Hệ thống Quản lý Đào tạo (QLĐT) của Học viện qua API nội bộ.")
    add_bullet(doc, "Hồ sơ nghiên cứu cá nhân", "Hiển thị trang cá nhân khoa học (Portfolio NCKH) của từng sinh viên và giảng viên: danh sách đề tài đã thực hiện, các giải thưởng đạt được, các bài báo khoa học đã công bố, điểm thưởng tích lũy.")
    add_bullet(doc, "Theo dõi hạn mức hướng dẫn của giảng viên", "Hiển thị trực quan số lượng đề tài GV đang hướng dẫn trong năm học (cảnh báo nếu đạt ngưỡng 2 đề tài).")

    add_h2(doc, "6.3. Module Quản lý Danh mục và Đề tài Nghiên cứu")
    add_bullet(doc, "Quản lý đợt NCKH theo năm học", "Tạo và cấu hình các đợt NCKH (Năm học 2024-2025, 2025-2026...), thiết lập mốc thời gian cho từng khâu.")
    add_bullet(doc, "Quản trị danh mục đề tài tập trung", "Bộ lọc đa tiêu chí: Lọc theo Khoa/Viện, theo Nhóm ngành KHCN, theo Trạng thái vòng đời, theo Giảng viên hướng dẫn, theo Xếp loại nghiệm thu.")
    add_bullet(doc, "Kiểm tra trùng lặp đề tài", "Hệ thống tự động phân tích độ tương đồng (Similarity Check) của tên đề tài đăng ký mới với toàn bộ kho dữ liệu đề tài các năm trước.")

    add_h2(doc, "6.4. Module Đăng ký Đề tài Trực tuyến cho Sinh viên")
    add_bullet(doc, "Biểu mẫu đăng ký trực quan", "Form nhập liệu thân thiện: Tên đề tài, Nhóm ngành, Mục tiêu, Nội dung, Kết quả dự kiến, Kinh phí đề xuất.")
    add_bullet(doc, "Ràng buộc nghiệp vụ tự động", "Chặn đăng ký nếu sinh viên đã có tên trong 01 đề tài khác trong năm học hiện tại (Khoản 2 Điều 15).")
    add_bullet(doc, "Tải file Đề cương nghiên cứu (Mẫu 2)", "Cho phép tải mẫu biểu chuẩn Mẫu 2 (Word), điền thông tin và nộp file trực tiếp trên hệ thống.")

    add_h2(doc, "6.5. Module Quản lý Nhóm Sinh viên và Phân công / Xác nhận GVHD")
    add_bullet(doc, "Quản lý thành viên nhóm", "Thêm/xóa thành viên nhóm bằng Mã SV (tối đa 5 thành viên); Thành viên nhận thông báo và click 'Xác nhận tham gia'; Phân chia % đóng góp và trách nhiệm.")
    add_bullet(doc, "Quy trình phân công & Xác nhận GVHD", "Gửi yêu cầu hướng dẫn tới giảng viên; Giảng viên duyệt/từ chối; Ban Chủ nhiệm Khoa có quyền phân công lại GVHD nếu có thay đổi đột xuất.")

    add_h2(doc, "6.6. Module Xét duyệt / Phê duyệt Đề tài (Cấp Khoa & Cấp Học viện)")
    add_bullet(doc, "Xét duyệt danh mục cấp Khoa", "Giao diện dành riêng cho Hội đồng Khoa học Khoa: xem danh sách đăng ký, chấm sơ bộ, ghi nhận xét, phê duyệt danh mục chính thức.")
    add_bullet(doc, "Tự động xuất Công văn Mẫu 1", "Hệ thống tự động trích xuất file Công văn đăng ký đề tài NCKH sinh viên (Mẫu 1) chuẩn thể thức trình ký gửi Phòng QLKHCN&HTQT.")
    add_bullet(doc, "Phê duyệt Quyết định cấp Học viện", "Phòng QLKHCN tổng hợp danh mục toàn trường, cập nhật số Quyết định giao đề tài và mức kinh phí được duyệt cho từng đề tài.")

    add_h2(doc, "6.7. Module Quản lý và Giám sát Tiến độ Đề tài")
    add_bullet(doc, "Lược đồ tiến độ (Milestones & Timeline)", "Hiển thị trực quan tiến độ thực hiện đề tài dưới dạng sơ đồ Milestone và Gantt Chart.")
    add_bullet(doc, "Báo cáo tiến độ định kỳ", "Nhóm sinh viên nộp báo cáo định kỳ theo 3 mốc; GVHD nhận xét, chấm điểm tiến độ và hướng dẫn khắc phục vướng mắc.")
    add_bullet(doc, "Quản lý Biên bản Hội thảo chuyên đề (Mẫu 3.5)", "Nhập thông tin buổi sinh hoạt học thuật/hội thảo góp ý, upload biên bản scan có chữ ký theo đúng quy định tại Điểm c Khoản 3 Điều 9.")

    add_h2(doc, "6.8. Module Nộp và Quản lý Báo cáo, Tài liệu, Sản phẩm")
    add_bullet(doc, "Hồ sơ nộp nghiệm thu số", "Hỗ trợ nộp Báo cáo tổng kết toàn văn (Mẫu 3.1 - 3.3), Bản tóm tắt kết quả (Mẫu 3.4), Sản phẩm phần mềm, link mã nguồn Git, video demo.")
    add_bullet(doc, "Kiểm tra định dạng & Liêm chính học thuật", "Kiểm tra tính đầy đủ của các trường bắt buộc; Tích hợp công cụ rà soát đạo văn (Plagiarism Checker).")
    add_bullet(doc, "Xác nhận của Cán bộ hướng dẫn", "GVHD đọc duyệt hồ sơ trực tuyến, ghi nhận xét và bấm nút 'Đồng ý nghiệm thu' để chuyển hồ sơ sang Hội đồng.")

    add_h2(doc, "6.9. Module Đánh giá, Chấm điểm và Nghiệm thu Đề tài")
    add_bullet(doc, "Quản lý Hội đồng nghiệm thu", "Khoa tạo Hội đồng, phân công thành viên (Chủ tịch, Thư ký, Phản biện, Ủy viên), xếp lịch bảo vệ (ngày, giờ, phòng họp/link online).")
    add_bullet(doc, "Chấm điểm Online bằng Phiếu đánh giá (Mẫu 4.1)", "Giao diện chấm điểm trực quan cho từng thành viên Hội đồng theo thang 100 điểm với 7 tiêu chí theo quy định QĐ 521. Tự động tính tổng điểm và khóa phiếu sau khi nộp.")
    add_bullet(doc, "Tự động sinh Biên bản Nghiệm thu (Mẫu 4.2) và Bảng tổng hợp (Mẫu 4.3)", "Hệ thống tự động tính điểm trung bình của Hội đồng, xếp loại đề tài theo 5 mức (Xuất sắc, Tốt, Khá, Đạt, Không đạt), kết xuất file Biên bản nghiệm thu Mẫu 4.2 và Bảng tổng hợp Mẫu 4.3.")

    add_h2(doc, "6.10. Module Tìm kiếm, Lọc và Kho Tri thức Đề tài NCKH")
    add_bullet(doc, "Cổng tra cứu đề tài thông minh", "Tìm kiếm toàn văn theo từ khóa, tên đề tài, tên sinh viên, tên GVHD, năm học, khoa/bộ môn, kết quả xếp loại.")
    add_bullet(doc, "Thư viện số NCKH Sinh viên", "Cung cấp quyền đọc tóm tắt (Mẫu 3.4) cho sinh viên toàn trường để tham khảo ý tưởng; cho phép tải báo cáo toàn văn đối với những đề tài được công khai.")

    add_h2(doc, "6.11. Module Báo cáo Thống kê Động và Xuất Biểu mẫu Tự động")
    add_bullet(doc, "Xuất tự động 100% các Biểu mẫu QĐ 521", "Xuất file Word (.docx) và PDF chuẩn thể thức hành chính cho Mẫu 1 (Công văn đăng ký), Mẫu 2 (Đề cương), Mẫu 3.1 - 3.4 (Báo cáo & Bìa), Mẫu 3.5 (Biên bản hội thảo), Mẫu 4.1 (Phiếu chấm), Mẫu 4.2 (Biên bản NT), Mẫu 4.3 (Bảng tổng hợp xếp loại), Mẫu 5 (Danh mục thi cấp Bộ).")
    add_bullet(doc, "Báo cáo thống kê quản trị", "Báo cáo số lượng đề tài theo Khoa/Viện; Thống kê tỷ lệ xếp loại; Báo cáo tổng hợp số giờ NCKH của giảng viên gửi Phòng Tổ chức Cán bộ; Lập danh sách sinh viên được cấp Giấy chứng nhận và danh sách đề xuất cộng điểm học bổng gửi Phòng CTSV.")

    add_h2(doc, "6.12. Module Thông báo và Nhắc việc Tự động (Notification Engine)")
    add_bullet(doc, "Đa kênh thông báo", "Gửi thông báo qua Web Notification (In-App), Email công vụ tự động, và liên thông tin nhắn Zalo ZNS / SMS Brandname.")
    add_bullet(doc, "Lịch trình tự động (Scheduled Triggers)", "Tự động quét và gửi cảnh báo nhắc hạn trước 7 ngày, 3 ngày, 1 ngày khi sắp đến hạn nộp đề cương, hạn nộp báo cáo tiến độ, hạn nộp hồ sơ nghiệm thu; Thông báo ngay khi đề tài được duyệt hoặc có kết quả chấm điểm.")

    add_h2(doc, "6.13. Bảng Ma trận Chức năng Tổng thể theo Nhóm Người dùng")
    add_p(doc, "Bảng tổng hợp chi tiết phân quyền chức năng cho 6 nhóm đối tượng người dùng chính trên hệ thống:")

    headers_func = ["Nhóm Chức năng / Phân hệ", "Sinh viên", "Giảng viên HD", "Thư ký Khoa", "Hội đồng KH", "P. QLKHCN", "Quản trị Admin"]
    data_func = [
        ["1. Đăng nhập SSO & Quản lý hồ sơ", "V", "V", "V", "V", "V", "V"],
        ["2. Đăng ký đề tài & Mời thành viên", "V (Chủ trì)", "-", "-", "-", "-", "V"],
        ["3. Xác nhận tham gia nhóm đề tài", "V (Thành viên)", "-", "-", "-", "-", "V"],
        ["4. Xác nhận / Từ chối hướng dẫn", "-", "V", "-", "-", "-", "V"],
        ["5. Soạn thảo & Nộp Đề cương Mẫu 2", "V (Chủ trì)", "V (Duyệt)", "V (Thẩm định)", "-", "V (Tra cứu)", "V"],
        ["6. Thẩm định danh mục đề tài Mẫu 1", "-", "-", "V (Lập Mẫu 1)", "V (Họp duyệt)", "V (Tổng hợp)", "V"],
        ["7. Quản lý Quyết định giao đề tài & Kinh phí", "-", "-", "V (Xem)", "-", "V (Trình duyệt)", "V"],
        ["8. Báo cáo tiến độ & Lập Mẫu 3.5", "V", "V (Chấm mốc)", "V (Giám sát)", "-", "V (Kiểm tra)", "V"],
        ["9. Nộp Báo cáo nghiệm thu (Mẫu 3.1-3.4)", "V", "V (Đồng ý NT)", "V (Tiếp nhận)", "V (Đọc hồ sơ)", "V (Toàn trường)", "V"],
        ["10. Chấm điểm Online Phiếu Mẫu 4.1", "-", "-", "-", "V (Chấm điểm)", "V (Giám sát)", "V"],
        ["11. Lập Biên bản NT & Xếp loại (4.2, 4.3)", "-", "-", "V (Lập BB)", "V (Ký duyệt)", "V (Phê duyệt)", "V"],
        ["12. Cấp Giấy chứng nhận & Lập Mẫu 5", "V (Tải GCN)", "V (Tải GCN)", "V (Xuất báo cáo)", "-", "V (Ký & Cấp)", "V"],
        ["13. Thống kê, Báo cáo & Tra cứu thư viện", "V (Tra cứu)", "V (Tra cứu)", "V (Báo cáo khoa)", "V (Tra cứu)", "V (Báo cáo toàn viện)", "V"],
        ["14. Cấu hình hệ thống, Đợt NCKH, Danh mục", "-", "-", "-", "-", "V (Cấu hình đợt)", "V (Toàn quyền)"]
    ]
    add_styled_table(doc, headers_func, data_func, [2.1, 0.7, 0.7, 0.8, 0.8, 0.8, 0.7])

    # -------------------------------------------------------------
    # KẾT LUẬN & ĐỀ XUẤT LỘ TRÌNH TRIỂN KHAI
    # -------------------------------------------------------------
    add_h1(doc, "KẾT LUẬN & ĐỀ XUẤT LỘ TRÌNH TRIỂN KHAI")
    add_p(doc, "Tài liệu này đã giải quyết toàn diện, thấu đáo và chi tiết toàn bộ 54 câu hỏi nghiệp vụ và kỹ thuật theo 6 góc nhìn cốt lõi (Tổ chức, Con người, Quy trình, Dữ liệu, Công nghệ, Chức năng). Việc xây dựng Hệ thống Thông tin Quản lý Đề tài NCKH Sinh viên (SRMS) bám sát các điều khoản của Quyết định số 521/QĐ-HV là bước đi chiến lược mang lại giá trị to lớn cho Học viện Công nghệ Bưu chính Viễn thông và Viện Khoa học Kỹ thuật Bưu điện:")
    add_bullet(doc, "Đối với Sinh viên", "Môi trường nghiên cứu chuyên nghiệp, minh bạch, bảo vệ quyền sở hữu trí tuệ, dễ dàng đăng ký, theo dõi tiến độ và nhận quyền lợi khen thưởng, cộng điểm học bổng.")
    add_bullet(doc, "Đối với Giảng viên", "Giảm tải tối đa thủ tục hành chính giấy tờ, quản lý nhóm sinh viên hiệu quả, tự động ghi nhận giờ nghiên cứu khoa học.")
    add_bullet(doc, "Đối với Khoa và Phòng QLKHCN&HTQT", "Nâng cao năng lực giám sát, tự động hóa quy trình nghiệm thu, giảm 90% thời gian tổng hợp báo cáo biểu mẫu, tạo lập kho dữ liệu khoa học số phục vụ công tác kiểm định chất lượng giáo dục đại học.")

    add_h2(doc, "Lộ trình triển khai 4 giai đoạn đề xuất:")
    add_bullet(doc, "Giai đoạn 1 (Tháng 1 - Tháng 2)", "Hoàn thiện đặc tả yêu cầu nghiệp vụ (SRS/BRD), Thiết kế kiến trúc hệ thống, Lược đồ CSDL chi tiết (ERD) và Thiết kế giao diện mẫu (UI/UX Mockups).")
    add_bullet(doc, "Giai đoạn 2 (Tháng 3 - Tháng 5)", "Phát triển các module chức năng cốt lõi: Đăng nhập SSO, Đăng ký đề tài, Quản lý nhóm & GVHD, Nộp đề cương Mẫu 2, Giám sát tiến độ.")
    add_bullet(doc, "Giai đoạn 3 (Tháng 6 - Tháng 7)", "Phát triển module Chấm điểm nghiệm thu Online (Mẫu 4.1 - 4.3), Tự động kết xuất biểu mẫu Mẫu 1 - Mẫu 5, Thư viện số tra cứu; Triển khai thử nghiệm (Pilot) tại Khoa CNTT 1 và Khoa Viễn thông 1.")
    add_bullet(doc, "Giai đoạn 4 (Tháng 8 trở đi)", "Kiểm thử bảo mật, tối ưu hiệu năng, tập huấn người dùng toàn trường và chính thức đưa hệ thống vào vận hành (Go-Live) phục vụ năm học mới.")

    # Save Document
    filename = "Tai_Lieu_Phan_Tich_Nghiep_Vu_He_Thong_NCKH_Sinh_Vien_PTIT.docx"
    doc.save(filename)
    print(f"Document successfully created and saved as: {filename}")

if __name__ == "__main__":
    create_document()
