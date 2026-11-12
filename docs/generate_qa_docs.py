# -*- coding: utf-8 -*-
"""
Script to generate the exact Q&A Business Document (.docx) directly answering all questions
from 'Hệ thống quản lý đề tài nghiên cứu khoa học sinh viên.pdf' based on Decision No. 521/QD-HV 
and amended by Decision No. 169/QD-HV dated 15/01/2026 (Budget: 7-10M VND).
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def build_qa_document():
    doc = Document()
    
    # Page setup - Standard A4 (Top: 2.0cm, Bottom: 2.0cm, Left: 3.0cm, Right: 2.0cm)
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
        hrun = hp.add_run("HỆ THỐNG THÔNG TIN QUẢN LÝ ĐỀ TÀI NCKH SINH VIÊN (PTIT / VIỆN KHKT BƯU ĐIỆN)")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(0x77, 0x77, 0x77)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Tài liệu Trả lời Nghiệp vụ 6 Góc nhìn (Căn cứ QĐ 521/QĐ-HV & QĐ 169/QĐ-HV)")
        frun.font.name = "Times New Roman"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(0x77, 0x77, 0x77)

    # Styling helpers
    def apply_font(run, size=12, bold=False, italic=False, color_rgb=(0x22, 0x22, 0x22)):
        run.font.name = "Times New Roman"
        run.font.size = Pt(size)
        run.bold = bold
        run.italic = italic
        run.font.color.rgb = RGBColor(*color_rgb)

    def add_p(doc, text="", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=5, line_spacing=1.15, bold=False, italic=False, size=12, color=(0x22, 0x22, 0x22)):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            r = p.add_run(text)
            apply_font(r, size=size, bold=bold, italic=italic, color_rgb=color)
        return p

    def add_section_header(doc, section_num, section_name_en, section_name_vn):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(f"{section_num}. Góc nhìn {section_name_en} – {section_name_vn}")
        apply_font(r, size=14.5, bold=True, color_rgb=(0x00, 0x33, 0x66))
        return p

    def add_question(doc, q_num_str, q_text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        
        r_bullet = p.add_run("● ")
        apply_font(r_bullet, size=12.5, bold=True, color_rgb=(0x99, 0x00, 0x00))
        
        r_q = p.add_run(q_text)
        apply_font(r_q, size=12.5, bold=True, color_rgb=(0x00, 0x33, 0x66))
        return p

    def add_answer_intro(doc, text="Trả lời:"):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(text)
        apply_font(r, size=12, bold=True, italic=True, color_rgb=(0x2B, 0x4C, 0x7E))
        return p

    def add_bullet_item(doc, title, content, level=0):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if level > 0:
            p.paragraph_format.left_indent = Inches(0.25 * level + 0.25)
        
        if title:
            r_title = p.add_run(title + ": ")
            apply_font(r_title, size=11.5, bold=True, color_rgb=(0x00, 0x33, 0x66))
        
        r_content = p.add_run(content)
        apply_font(r_content, size=11.5, bold=False, color_rgb=(0x22, 0x22, 0x22))
        return p

    def add_callout(doc, text, prefix="CĂN CỨ QUY ĐỊNH (QĐ 521 & QĐ 169): "):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.3)
        
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F0F4F8"/>')
        tcPr.append(shd)
        
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tcMar>')
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
        apply_font(r_prefix, size=10.5, bold=True, color_rgb=(0x00, 0x33, 0x66))
        
        r_text = p.add_run(text)
        apply_font(r_text, size=10.5, bold=False, italic=True, color_rgb=(0x33, 0x33, 0x33))
        
        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_before = Pt(0)
        p_after.paragraph_format.space_after = Pt(4)

    def add_table_data(doc, headers, data, col_widths=None):
        table = doc.add_table(rows=len(data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        
        hdr_row = table.rows[0]
        hdr_row._tr.get_or_add_trPr().append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        for idx, heading in enumerate(headers):
            cell = hdr_row.cells[idx]
            if col_widths and idx < len(col_widths):
                cell.width = Inches(col_widths[idx])
            
            tcPr = cell._tc.get_or_add_tcPr()
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="003366"/>')
            tcPr.append(shd)
            tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>')
            tcPr.append(tcMar)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(heading)
            apply_font(r, size=10, bold=True, color_rgb=(0xFF, 0xFF, 0xFF))
            
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
                tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>')
                tcPr.append(tcMar)
                
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx > 1 else WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.15
                r = p.add_run(str(val))
                apply_font(r, size=9.5, bold=False, color_rgb=(0x33, 0x33, 0x33))

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
        p_after.paragraph_format.space_after = Pt(4)

    # TRANG TIÊU ĐỀ
    add_p(doc, "BỘ THÔNG TIN VÀ TRUYỀN THÔNG", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=2, size=12.5, bold=True, color=(0x33, 0x33, 0x33))
    add_p(doc, "HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2, size=13.5, bold=True, color=(0x00, 0x33, 0x66))
    add_p(doc, "VIỆN KHOA HỌC KỸ THUẬT BƯU ĐIỆN", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=28, size=11, bold=True, italic=True, color=(0x66, 0x66, 0x66))

    add_p(doc, "TÀI LIỆU TRẢ LỜI YÊU CẦU NGHIỆP VỤ", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=4, size=14, bold=True, color=(0x00, 0x33, 0x66))
    add_p(doc, "HỆ THỐNG QUẢN LÝ ĐỀ TÀI NGHIÊN CỨU KHOA HỌC SINH VIÊN", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=8, size=16, bold=True, color=(0x99, 0x00, 0x00))
    add_p(doc, "(Đáp ứng toàn bộ 54 câu hỏi theo 6 góc nhìn: Tổ chức, Con người, Quy trình, Dữ liệu, Công nghệ, Chức năng)", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=20, size=11.5, italic=True, color=(0x44, 0x44, 0x44))

    add_callout(doc,
        "Văn bản được xây dựng căn cứ theo:\n"
        "1. Quyết định số 521/QĐ-HV ngày 14/05/2020 của Giám đốc Học viện về Quy định hoạt động NCKH của sinh viên;\n"
        "2. Căn cứ Quyết định số 169/QĐ-HV ngày 15 tháng 01 năm 2026 của Giám đốc Học viện về việc sửa đổi, bổ sung Quy định về hoạt động nghiên cứu khoa học của sinh viên Học viện Công nghệ Bưu chính Viễn thông;\n"
        "3. Tổng kinh phí thực hiện cấp cho 01 đề tài NCKH sinh viên từ 7.000.000 VNĐ đến 10.000.000 VNĐ / đề tài.",
        "CĂN CỨ BAN HÀNH & ĐỊNH MỨC KINH PHÍ: "
    )

    # GÓC NHÌN 1: ORGANIZATION
    add_section_header(doc, "1", "Organization", "Tổ chức")

    add_question(doc, "1.1", "Hệ thống được xây dựng nhằm giải quyết những vấn đề gì trong công tác quản lý đề tài nghiên cứu khoa học sinh viên?")
    add_answer_intro(doc)
    add_p(doc, "Hệ thống Thông tin Quản lý Đề tài NCKH Sinh viên (SRMS) được xây dựng nhằm giải quyết các bất cập và thách thức trọng yếu trong công tác quản lý NCKH sinh viên tại Học viện/Viện KHKT Bưu điện:")
    add_bullet_item(doc, "Xóa bỏ sự phân tán và gánh nặng hồ sơ giấy tờ", "Thay thế hoàn toàn việc luân chuyển hồ sơ, đề cương, báo cáo tổng kết và phiếu chấm điểm bằng giấy (Mẫu 1 đến Mẫu 5 theo QĐ 521), giúp số hóa và lưu trữ tập trung dữ liệu NCKH qua các năm.")
    add_bullet_item(doc, "Ngăn ngừa tình trạng trùng lặp đề tài và thiếu tính mới", "Hệ thống cung cấp cơ sở dữ liệu NCKH sinh viên tập trung toàn Học viện, tự động đối soát tên đề tài và từ khóa nghiên cứu để hỗ trợ Hội đồng Khoa học phát hiện sớm các đề tài trùng lặp.")
    add_bullet_item(doc, "Minh bạch hóa tiến độ và nâng cao chất lượng nghiên cứu", "Khắc phục tình trạng đề tài chậm tiến độ hoặc 'bỏ quên' bằng cách thiết lập các mốc kiểm soát (Milestones), cập nhật nhật ký thực hiện và tổ chức hội thảo chuyên đề (Mẫu 3.5) trực tuyến.")
    add_bullet_item(doc, "Tối ưu hóa quản lý kinh phí (7 - 10 triệu đồng/đề tài)", "Hỗ trợ lập dự toán, thẩm định và thanh quyết toán kinh phí đề tài (từ 7 đến 10 triệu VNĐ/đề tài theo QĐ 169/2026) nhanh chóng, minh bạch theo đúng kết luận của Hội đồng nghiệm thu.")
    add_bullet_item(doc, "Kịp thời ghi nhận quyền lợi, khen thưởng và cộng điểm học bổng", "Tự động trích xuất kết quả đề tài đạt loại Khá trở lên để cấp Giấy chứng nhận điện tử và cộng điểm thưởng học bổng theo đúng Điều 15 QĐ 521.")

    add_question(doc, "1.2", "Phạm vi quản lý của hệ thống bao gồm những hoạt động nào?")
    add_answer_intro(doc)
    add_p(doc, "Phạm vi quản lý của hệ thống bao quát toàn diện chu trình vòng đời của hoạt động NCKH sinh viên theo QĐ 521/QĐ-HV và QĐ 169/QĐ-HV:")
    add_bullet_item(doc, "Quản lý Đăng ký & Giao đề tài (Đầu năm học - Tháng 8-9)", "Phát động kế hoạch NCKH; tiếp nhận đăng ký đề tài và dự toán kinh phí (7-10 triệu VNĐ); thẩm định danh mục cấp Khoa (Mẫu 1); trình Giám đốc Học viện ban hành Quyết định giao kế hoạch kinh phí và danh mục đề tài.")
    add_bullet_item(doc, "Quản lý Đề cương & Triển khai thực hiện (Tháng 10 - Tháng 3)", "Xét duyệt Đề cương chi tiết (Mẫu 2); phân công/xác nhận GVHD; giám sát tiến độ định kỳ; tổ chức hội thảo góp ý (Mẫu 3.5); quản lý sinh viên làm trợ lý/giúp việc NCKH cho giảng viên (Khoản 4 Điều 9).")
    add_bullet_item(doc, "Quản lý Đánh giá & Nghiệm thu đề tài (Tháng 3 - Trước ngày 10/4)", "Tiếp nhận Báo cáo tổng kết (Mẫu 3.1-3.3), bản Tóm tắt kết quả (Mẫu 3.4), sản phẩm phần mềm/phần cứng, minh chứng bài báo; thành lập Hội đồng nghiệm thu; chấm điểm độc lập (Mẫu 4.1); lập Biên bản nghiệm thu (Mẫu 4.2) và Bảng tổng hợp xếp loại (Mẫu 4.3); nộp hồ sơ về Học viện trước 10/4.")
    add_bullet_item(doc, "Quản lý Khen thưởng, Vinh danh & Thi cấp Bộ (Tháng 5 - Trước ngày 30/6)", "Tổ chức Hội nghị NCKH sinh viên toàn Học viện (trước 15/6) (Điều 11); cấp Giấy chứng nhận NCKH; lập danh mục đề tài Xuất sắc dự thi Giải thưởng 'Sinh viên NCKH' cấp Bộ GD&ĐT (Mẫu 5, trước 30/6) (Điều 12); quản lý kinh phí hỗ trợ dự thi (tối đa 1.000.000đ/đề tài).")
    add_bullet_item(doc, "Quản lý Lưu trữ số & Kho tri thức", "Lưu trữ toàn văn báo cáo, kỷ yếu vào Thư viện số Học viện để tra cứu và kế thừa phát triển làm đồ án/khóa luận tốt nghiệp (Điều 14).")

    add_question(doc, "1.3", "Cơ cấu tổ chức tham gia vào hoạt động nghiên cứu khoa học sinh viên như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Cơ cấu tổ chức tham gia vào hệ thống quản lý NCKH sinh viên tại Học viện và Viện KHKT Bưu điện bao gồm: Ban Giám đốc Học viện, Phòng QLKHCN&HTQT (đầu mối thường trực), Các Khoa Đào tạo 1 & 2, Viện KHKT Bưu điện (CDIT/RIPT), Cơ sở TP.HCM, Phòng CT&CTSV, Phòng Tài chính Kế toán, Đoàn Thanh niên và Hội Sinh viên.")

    add_question(doc, "1.4", "Đơn vị/bộ phận nào chịu trách nhiệm quản lý, xét duyệt và theo dõi các đề tài?")
    add_answer_intro(doc)
    add_bullet_item(doc, "Đơn vị quản lý cấp Học viện", "Phòng QLKHCN&HTQT quản lý vĩ mô toàn trường, thẩm tra danh mục và kinh phí (7-10 triệu VNĐ/đề tài), trình Ban Giám đốc phê duyệt Quyết định giao đề tài, kiểm tra định kỳ/đột xuất.")
    add_bullet_item(doc, "Đơn vị xét duyệt chuyên môn cấp Khoa/Viện", "Hội đồng Khoa học Khoa xét duyệt tên đề tài và dự toán kinh phí (Mẫu 1); Ban Chủ nhiệm Khoa duyệt Đề cương chi tiết (Mẫu 2).")
    add_bullet_item(doc, "Đơn vị theo dõi và tổ chức nghiệm thu", "Khoa/Viện và GVHD trực tiếp theo dõi tiến độ; Hội đồng Khoa học và Đào tạo Khoa/Bộ môn chủ trì đánh giá nghiệm thu đề tài.")

    add_question(doc, "1.5", "Quyền hạn và trách nhiệm của các đơn vị trong quá trình quản lý đề tài được phân chia như thế nào?")
    add_answer_intro(doc)
    headers_q1_5 = ["Quy trình nghiệp vụ", "Ban Giám đốc", "P.QLKHCN", "Khoa / Viện", "Hội đồng KH", "GVHD & SV", "P. TCKT / CTSV"]
    data_q1_5 = [
        ["1. Ban hành Kế hoạch NCKH năm học", "A (Phê duyệt)", "R (Chủ trì)", "I", "C", "I", "I"],
        ["2. Đăng ký & Xét duyệt danh mục Mẫu 1", "A (Ký QĐ)", "C / R (Tổng hợp)", "R (Trưởng khoa)", "R (Thẩm định)", "R (Đăng ký)", "I"],
        ["3. Phân công GVHD & Duyệt đề cương Mẫu 2", "I", "I (Lưu trữ)", "A (Trưởng khoa)", "C", "R (Biên soạn)", "I"],
        ["4. Giám sát tiến độ & Hội thảo Mẫu 3.5", "I", "C (Kiểm tra)", "A", "C", "R (Thực hiện)", "I"],
        ["5. Tổ chức Nghiệm thu (Mẫu 4.1, 4.2, 4.3)", "I", "C (Giám sát)", "A (Tổ chức)", "R (Chấm điểm)", "R (Bảo vệ)", "I"],
        ["6. Quyết toán kinh phí đề tài (7-10 trđ)", "A", "C", "R (Xác nhận)", "I", "R (Kê khai)", "R (Phòng TCKT)"],
        ["7. Hội nghị NCKH & Khen thưởng SV", "A (Khen thưởng)", "R (Chủ trì)", "R (Phối hợp)", "C", "I", "R (P.CTSV)"],
        ["8. Nộp hồ sơ dự thi cấp Bộ (Mẫu 5)", "A", "R (Nộp hồ sơ)", "R (Đề xuất)", "C", "R (Hoàn thiện)", "I"]
    ]
    add_table_data(doc, headers_q1_5, data_q1_5, [1.6, 0.8, 0.8, 0.8, 0.8, 0.8, 0.7])

    # GÓC NHÌN 2: PEOPLE
    add_section_header(doc, "2", "People", "Con người")

    add_question(doc, "2.1", "Cơ chế xác thực người dùng và gán quyền (Role) trên hệ thống được thực hiện như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Hệ thống SRMS tích hợp trực tiếp với Cổng xác thực tập trung PTIT Slink SSO (gwdu.ptit.edu.vn) qua chuẩn OpenID Connect (OIDC) / OAuth 2.0, hỗ trợ 02 phương thức xác thực tài khoản tổ chức:")
    add_bullet_item(doc, "PTIT Microsoft Outlook", "Dành cho toàn bộ Cán bộ, Giảng viên và Sinh viên Cơ sở đào tạo phía Bắc (sử dụng tài khoản @ptit.edu.vn và @stu.ptit.edu.vn).")
    add_bullet_item(doc, "PTIT Google Gmail", "Dành cho Cán bộ, Giảng viên và Sinh viên Cơ sở đào tạo phía Nam.")
    add_bullet_item(doc, "Cơ chế Gán Role tự động (Claim-based Auto Role Provisioning)", "Hệ thống KHÔNG sử dụng cơ chế đăng ký tài khoản tự do hoặc phân quyền thủ công từ Quản trị viên. Ngay khi người dùng xác thực thành công qua SSO, hệ thống tự động bóc tách các Claims định danh trong ID Token (Email domain, Student/Staff ID, Department, Job Title) từ dịch vụ Directory của Học viện để gán sẵn Role tương ứng:")
    add_bullet_item(doc, "• Role Sinh viên", "Tự động gán cho tài khoản có định danh sinh viên (@stu.ptit.edu.vn / Cơ sở phía Nam). Tự động đồng bộ Mã SV, Họ tên, Lớp, Ngành, Khoa vào hồ sơ; tự động mở quyền Đăng ký đề tài, Nộp đề cương Mẫu 2, Nộp báo cáo Mẫu 3.1-3.4, Tra cứu kết quả và Tải GCN điện tử.", level=1)
    add_bullet_item(doc, "• Role Giảng viên / Cán bộ hướng dẫn", "Tự động gán cho tài khoản cán bộ/giảng viên (@ptit.edu.vn). Tự động đồng bộ Học hàm, Học vị, Bộ môn, Khoa; mở quyền Phê duyệt hướng dẫn đề tài, Theo dõi tiến độ, Đánh giá nhận xét Mẫu 3.4.", level=1)
    add_bullet_item(doc, "• Role Thư ký Khoa / Ban Chủ nhiệm Khoa", "Tự động kích hoạt cho các tài khoản thuộc danh mục Trợ lý NCKH / Lãnh đạo Khoa trong danh bạ quản lý; mở quyền Thẩm định danh mục Mẫu 1, Lập hội đồng Mẫu 4.3, Phê duyệt cấp cơ sở.", level=1)
    add_bullet_item(doc, "• Role Hội đồng Đánh giá", "Tự động kích hoạt quyền Chấm điểm online Mẫu 4.1 khi giảng viên được gán tên trong Quyết định thành lập Hội đồng nghiệm thu.", level=1)
    add_bullet_item(doc, "• Role Quản lý KHCN (P.QLKHCN&HTQT)", "Tự động gán cho chuyên viên Phòng QLKHCN&HTQT; mở quyền Quản lý đợt NCKH toàn viện, trình QĐ kinh phí (7-10 triệu VNĐ/đề tài), Xuất danh mục Mẫu 5 thi Bộ GD&ĐT.", level=1)
    add_bullet_item(doc, "• Role Quản trị Kỹ thuật (System Admin)", "Dành riêng cho kỹ sư CNTT vận hành hạ tầng, quản lý cấu hình hệ thống, giám sát logs và sao lưu dữ liệu; không can thiệp vào quy trình chấm điểm chuyên môn.", level=1)

    add_question(doc, "2.2", "Sinh viên tham gia hệ thống với những vai trò và nhiệm vụ cụ thể nào?")
    add_answer_intro(doc)
    add_bullet_item(doc, "Sinh viên Chủ trì đề tài (Trưởng nhóm)", "Là người chịu trách nhiệm chính của đề tài (Khoản 2 Điều 9). Sau khi đăng nhập SSO Outlook/Gmail, sinh viên thực hiện: Đăng ký tên đề tài, lập dự toán kinh phí từ 7 - 10 triệu VNĐ (theo QĐ 169/2026), mời thành viên nhóm (tối đa 5 SV), mời GVHD, nộp Đề cương Mẫu 2, nộp báo cáo tiến độ, nộp Báo cáo tổng kết toàn văn (Mẫu 3.1-3.3) và Tóm tắt kết quả (Mẫu 3.4), đại diện nhóm bảo vệ trước Hội đồng, làm thủ tục thanh quyết toán kinh phí.")
    add_bullet_item(doc, "Sinh viên Thành viên nhóm", "Xác nhận tham gia nhóm trên hệ thống; nhận phân công nhiệm vụ chuyên môn; cùng thực hiện nghiên cứu, viết báo cáo và bảo vệ trước Hội đồng; hưởng Giấy chứng nhận và điểm thưởng học bổng nếu đề tài đạt loại Khá trở lên.")
    add_bullet_item(doc, "Sinh viên Trợ lý / Giúp việc NCKH", "Đăng ký tham gia làm trợ lý cho các đề tài NCKH của giảng viên hoặc hỗ trợ thí nghiệm thực hành tại phòng Lab (Khoản 4 Điều 9).")
    add_bullet_item(doc, "Quy định ràng buộc (Điều 15)", "Mỗi sinh viên chỉ được tham gia thực hiện tối đa 01 đề tài NCKH sinh viên trong một năm học (Hệ thống tự động kiểm tra và khóa quyền nếu đã đăng ký đề tài khác).")

    add_question(doc, "2.3", "Giảng viên/cán bộ hướng dẫn sử dụng hệ thống để thực hiện những công việc gì?")
    add_answer_intro(doc)
    add_bullet_item(doc, "Xác nhận hướng dẫn đề tài", "Đăng nhập SSO Outlook nhận lời mời từ sinh viên hoặc phân công từ Khoa; xác nhận đồng ý hướng dẫn trên hệ thống (đảm bảo không quá 02 đề tài sinh viên cùng lúc theo Khoản 2 Điều 16).")
    add_bullet_item(doc, "Định hướng và Phê duyệt Đề cương", "Gợi ý hướng nghiên cứu, phương pháp luận; kiểm duyệt và phê duyệt Đề cương chi tiết (Mẫu 2) trực tuyến.")
    add_bullet_item(doc, "Giám sát tiến độ & Chủ trì hội thảo góp ý", "Theo dõi các mốc tiến độ; chủ trì buổi sinh hoạt học thuật/hội thảo chuyên đề (Mẫu 3.5) để hoàn thiện đề tài.")
    add_bullet_item(doc, "Nhận xét và Đồng ý cho nghiệm thu", "Đọc duyệt bản thảo báo cáo tổng kết, viết bản Nhận xét của cán bộ hướng dẫn và xác nhận cho phép nhóm nộp hồ sơ bảo vệ nghiệm thu; nhận giờ chuẩn NCKH quy đổi.")

    add_question(doc, "2.4", "Cán bộ quản lý nghiên cứu khoa học thực hiện những công việc gì trên hệ thống?")
    add_answer_intro(doc)
    add_bullet_item(doc, "Cán bộ Phòng QLKHCN&HTQT (Cấp Học viện)", "Khởi tạo đợt NCKH sinh viên hàng năm; thiết lập thời hạn các mốc nghiệp vụ; tiếp nhận và tổng hợp danh mục Mẫu 1 từ các Khoa; trình Giám đốc Học viện ban hành Quyết định giao đề tài và kinh phí (7-10 triệu VNĐ/đề tài); theo dõi tiến độ toàn trường; tiếp nhận hồ sơ nghiệm thu trước 10/4; cấp mã Giấy chứng nhận NCKH điện tử cho sinh viên đạt loại Khá trở lên; tổng hợp danh sách đề tài Xuất sắc gửi thi cấp Bộ (Mẫu 5, trước 30/6); xuất các báo cáo thống kê thường niên.")
    add_bullet_item(doc, "Thư ký Khoa / Trợ lý NCKH Khoa (Cấp Cơ sở)", "Thông báo kế hoạch NCKH tại Khoa; tiếp nhận đăng ký đề tài của sinh viên; lập biên bản họp HĐKH Khoa xét duyệt danh mục; xuất Công văn Mẫu 1 gửi Học viện; tiếp nhận Đề cương Mẫu 2; tạo Hội đồng nghiệm thu và phân công lịch bảo vệ; nhập và kiểm tra điểm Mẫu 4.1, lập Biên bản Mẫu 4.2 và Bảng tổng hợp Mẫu 4.3; bàn giao hồ sơ nghiệm thu về Phòng QLKHCN&HTQT đúng hạn.")

    add_question(doc, "2.5", "Có cần vai trò của Hội đồng khoa học/người đánh giá đề tài hay không? Nếu có, họ thực hiện những nhiệm vụ gì?")
    add_answer_intro(doc)
    add_p(doc, "CÓ. Vai trò của Hội đồng khoa học là BẮT BUỘC theo Điều 9 và Điều 10 QĐ 521. Họ thực hiện: HĐ Khoa thẩm định tính mới, tính khả thi và dự toán kinh phí (7-10 triệu VNĐ); HĐ Nghiệm thu chấm điểm độc lập trực tiếp trên hệ thống bằng Phiếu đánh giá Mẫu 4.1 (thang 100); Thư ký lập Biên bản nghiệm thu Mẫu 4.2 và Chủ tịch Hội đồng ký duyệt kết luận xếp loại.")

    add_question(doc, "2.6", "Mỗi vai trò được phép xem, thêm, sửa, xóa hoặc phê duyệt những thông tin nào?")
    add_answer_intro(doc)
    headers_q2_5 = ["Phân hệ / Đối tượng dữ liệu", "Sinh viên", "GV Hướng dẫn", "Thư ký Khoa", "Hội đồng KH", "P. QLKHCN", "Admin"]
    data_q2_5 = [
        ["Hồ sơ tài khoản (Tự động map SSO)", "R, U (cá nhân)", "R, U (cá nhân)", "R, U (khoa)", "R, U (cá nhân)", "R, U (toàn trường)", "R (Logs/Sync)"],
        ["Đăng ký đề tài & Nhóm SV", "C, R, U (khi mở đợt)", "R (đề tài HD)", "R, U (khoa)", "R (hội đồng)", "R (toàn trường)", "C, R, U, D"],
        ["Xác nhận hướng dẫn đề tài", "R", "R, U (Đồng ý/Từ chối)", "R, U", "R", "R", "C, R, U, D"],
        ["Đề cương chi tiết (Mẫu 2)", "C, R, U (SV chủ trì)", "R, U (Góp ý/Ký duyệt)", "R, A (Duyệt khoa)", "R", "R (Tra cứu)", "C, R, U, D"],
        ["Báo cáo tiến độ & Mẫu 3.5", "C, R, U (SV chủ trì)", "R, U, A (Xác nhận)", "R, U (Giám sát)", "R", "R (Kiểm tra)", "C, R, U, D"],
        ["Báo cáo tổng kết & Sản phẩm", "C, R, U (trước hạn)", "R, A (Đồng ý NT)", "R, U (Tiếp nhận)", "R (Thẩm định)", "R (Toàn trường)", "C, R, U, D"],
        ["Phiếu chấm điểm (Mẫu 4.1)", "R (Xem sau NT)", "R (Xem sau NT)", "R, U (Tổng hợp)", "C, R, U (Chấm online)", "R (Thẩm định)", "C, R, U, D"],
        ["Biên bản NT & Bảng điểm (4.2, 4.3)", "R (Kết quả chung)", "R (Đề tài HD)", "C, R, U, A (Lập BB)", "R, A (Ký duyệt)", "R, A (Phê duyệt)", "C, R, U, D"],
        ["Giấy chứng nhận & Danh mục Mẫu 5", "R (Tải GCN QR)", "R (Tải GCN)", "R (Xuất báo cáo)", "R", "C, R, U, A (Cấp & Duyệt)", "C, R, U, D"]
    ]
    add_table_data(doc, headers_q2_5, data_q2_5, [1.6, 0.8, 0.8, 0.8, 0.8, 0.8, 0.7])

    add_question(doc, "2.6", "Dự kiến có bao nhiêu người sử dụng hệ thống và số lượng người dùng của từng vai trò là bao nhiêu?")
    add_answer_intro(doc)
    add_bullet_item(doc, "Sinh viên", "~15.000 - 20.000 tài khoản SSO sẵn sàng; trong đó có 1.500 - 2.500 sinh viên trực tiếp tham gia đề tài NCKH hàng năm.")
    add_bullet_item(doc, "Giảng viên / Nghiên cứu viên", "~800 - 1.000 tài khoản; trong đó 300 - 450 giảng viên trực tiếp hướng dẫn.")
    add_bullet_item(doc, "Cán bộ quản lý & Thư ký khoa", "~40 - 50 tài khoản.")
    add_bullet_item(doc, "Hội đồng Khoa học", "~150 - 200 chuyên gia/giảng viên tham gia các hội đồng.")
    add_bullet_item(doc, "Số lượng đề tài hàng năm", "300 - 500 đề tài NCKH sinh viên toàn Học viện.")

    # GÓC NHÌN 3: PROCESS
    add_section_header(doc, "3", "Process", "Quy trình")

    add_question(doc, "3.1", "Quy trình đăng ký đề tài nghiên cứu khoa học của sinh viên diễn ra như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Quy trình diễn ra vào đầu năm học (tháng 8 - tháng 9): P.QLKHCN phát động kế hoạch -> Sinh viên chủ trì đăng nhập, điền thông tin đề tài, lập dự toán kinh phí (7 - 10 triệu VNĐ) -> Mời thành viên (tối đa 5 SV) -> Mời GVHD xác nhận -> Nộp hồ sơ lên Khoa.")

    add_question(doc, "3.2", "Quy trình xét duyệt và phê duyệt đề tài diễn ra như thế nào?")
    add_answer_intro(doc)
    add_bullet_item(doc, "Bước 1 - HĐ Khoa thẩm định", "HĐ Khoa họp đánh giá tính mới, tính khả thi, định mức kinh phí (7-10 triệu VNĐ).")
    add_bullet_item(doc, "Bước 2 - Lập Công văn Mẫu 1", "Thư ký khoa xuất Công văn Mẫu 1 gửi P.QLKHCN (tháng 9).")
    add_bullet_item(doc, "Bước 3 - Quyết định cấp Học viện", "Giám đốc Học viện ký Quyết định giao kế hoạch kinh phí và danh mục đề tài chính thức.")

    add_question(doc, "3.3", "Quy trình phân công hoặc xác nhận giảng viên hướng dẫn như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Sinh viên chủ động mời hoặc Khoa chỉ định phân công; GVHD xác nhận trên hệ thống; kiểm soát cứng: đúng 1 GVHD/đề tài, tối đa 2 đề tài/GV cùng thời gian.")

    add_question(doc, "3.4", "Quy trình theo dõi tiến độ thực hiện đề tài được thực hiện như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Nhóm nộp Đề cương chi tiết Mẫu 2 -> Theo dõi theo 3 mốc Milestones (tháng 11, 1, 3) -> Tổ chức Hội thảo chuyên đề Mẫu 3.5 tại Khoa để hoàn thiện đề tài.")

    add_question(doc, "3.5", "Quy trình sinh viên nộp báo cáo/sản phẩm nghiên cứu như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Sinh viên nộp trực tuyến: Báo cáo tổng kết PDF (Mẫu 3.1-3.3), Tóm tắt Mẫu 3.4, minh chứng bài báo, link mã nguồn Git/video demo; GVHD duyệt đồng ý cho nghiệm thu.")

    add_question(doc, "3.6", "Quy trình đánh giá, chấm điểm và nghiệm thu đề tài diễn ra như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Khoa thành lập Hội đồng -> Giám khảo chấm điểm độc lập Phiếu Mẫu 4.1 (7 tiêu chí thang 100) -> Hệ thống tự động tính ĐTB và xếp loại 5 mức (*Xuất sắc >=90đ, Tốt 80-<90đ, Khá 70-<80đ, Đạt 50-<70đ, Không đạt <50đ*) -> Thư ký lập Biên bản Mẫu 4.2 và Bảng tổng hợp Mẫu 4.3 nộp về Học viện **trước ngày 10/4**.")

    add_question(doc, "3.7", "Quy trình cập nhật kết quả và trạng thái của đề tài được thực hiện ra sao?")
    add_answer_intro(doc)
    add_p(doc, "Chuyển đổi trạng thái tự động: Draft -> Submitted -> Faculty Approved -> Institute Approved -> In Progress -> Submitted Final -> Evaluated -> Closed/Awarded.")

    add_question(doc, "3.8", "Hệ thống xử lý như thế nào đối với các đề tài bị từ chối, yêu cầu chỉnh sửa, quá hạn hoặc không hoàn thành?")
    add_answer_intro(doc)
    add_p(doc, "Từ chối (ghi rõ lý do), Yêu cầu chỉnh sửa (mở quyền sửa trong 5-7 ngày), Quá hạn (cảnh báo/khóa nộp bài), Xin gia hạn/Hủy bỏ (nộp đơn online duyệt qua 2 cấp).")

    add_question(doc, "3.9", "Các bước nào trong quy trình cần sự phê duyệt của cán bộ quản lý hoặc hội đồng?")
    add_answer_intro(doc)
    add_p(doc, "Gồm 6 cổng phê duyệt trọng yếu: Gate 1 (Duyệt Mẫu 1 cấp Khoa), Gate 2 (QĐ giao đề tài & kinh phí cấp Học viện), Gate 3 (Duyệt Đề cương Mẫu 2), Gate 4 (Duyệt đủ điều kiện nghiệm thu), Gate 5 (Phê duyệt Biên bản Mẫu 4.2, 4.3), Gate 6 (Cấp Giấy chứng nhận & Danh mục thi Bộ Mẫu 5).")

    # GÓC NHÌN 4: DATA
    add_section_header(doc, "4", "Data", "Dữ liệu")

    add_question(doc, "4.1", "Hệ thống cần lưu trữ những thông tin gì về sinh viên?")
    add_answer_intro(doc)
    add_p(doc, "Mã SV (PK), Họ tên, Ngày sinh, Giới tính, Dân tộc, Lớp, Khóa, Ngành, Khoa, Cơ sở (HN/HCM), Năm học thứ mấy, Số năm đào tạo chuẩn, Email, SĐT, GPA, Lịch sử NCKH, Danh hiệu/Giải thưởng, Điểm thưởng học bổng.")

    add_question(doc, "4.2", "Hệ thống cần lưu trữ những thông tin gì về giảng viên/cán bộ hướng dẫn?")
    add_answer_intro(doc)
    add_p(doc, "Mã GV (PK), Họ tên, Học hàm, Học vị, Khoa/Bộ môn/Viện, Hướng nghiên cứu, Email công vụ, SĐT, Số đề tài đang hướng dẫn (max = 2), Giờ NCKH tích lũy quy đổi.")

    add_question(doc, "4.3", "Hệ thống cần lưu trữ những thông tin gì về đề tài nghiên cứu?")
    add_answer_intro(doc)
    add_p(doc, "Mã số đề tài (PK - quy chuẩn SV-YYYY-KHOA-XXX), Tên đề tài tiếng Việt/Anh, Nhóm ngành KHCN, Mục tiêu, Nội dung, Phương pháp, Kết quả dự kiến, Kinh phí đăng ký, Kinh phí được cấp (7 - 10 triệu VNĐ theo QĐ 169/2026), Trạng thái, Ngày nghiệm thu.")

    add_question(doc, "4.4", "Hệ thống cần quản lý những thông tin gì về nhóm sinh viên thực hiện đề tài?")
    add_answer_intro(doc)
    add_p(doc, "Mã nhóm (PK), Mã đề tài (FK), Danh sách tối đa 5 thành viên (Mã SV, Vai trò Chủ trì/Thành viên, % Đóng góp, Nhiệm vụ cụ thể).")

    add_question(doc, "4.5", "Hệ thống cần quản lý những thông tin gì về khoa/bộ môn/ngành?")
    add_answer_intro(doc)
    add_p(doc, "Mã đơn vị (PK), Tên Khoa/Viện, Cơ sở (HN/HCM), Danh sách Bộ môn trực thuộc, Danh sách Ngành đào tạo, Trưởng đơn vị, Thư ký NCKH.")

    add_question(doc, "4.6", "Hệ thống cần quản lý những thông tin gì về quá trình đăng ký và xét duyệt đề tài?")
    add_answer_intro(doc)
    add_p(doc, "Mã đợt đăng ký, Biên bản họp HĐKH Khoa, Kết luận duyệt, Số Công văn Mẫu 1; Số QĐ giao đề tài của Giám đốc Học viện, Kinh phí cấp (7-10 triệu VNĐ); File Đề cương Mẫu 2.")

    add_question(doc, "4.7", "Hệ thống cần quản lý những thông tin gì về tiến độ thực hiện đề tài?")
    add_answer_intro(doc)
    add_p(doc, "Mã mốc tiến độ (Milestones 1, 2, 3), Hạn hoàn thành, Báo cáo mốc, Đánh giá của GVHD; Biên bản Hội thảo chuyên đề Mẫu 3.5.")

    add_question(doc, "4.8", "Hệ thống cần quản lý những thông tin gì về báo cáo, sản phẩm và tài liệu của đề tài?")
    add_answer_intro(doc)
    add_p(doc, "File PDF Báo cáo toàn văn (chuẩn bìa Mẫu 3.2, bìa phụ Mẫu 3.3, cấu trúc Mẫu 3.1); File Tóm tắt kết quả Mẫu 3.4; Minh chứng bài báo khoa học; Link kho mã nguồn Git, File cài đặt, Video demo.")

    add_question(doc, "4.9", "Hệ thống cần lưu trữ thông tin về đánh giá, điểm số và kết quả nghiệm thu như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Phiếu chấm điểm Mẫu 4.1 (7 tiêu chí thang 100); Biên bản nghiệm thu Mẫu 4.2 & Bảng tổng hợp Mẫu 4.3 (ĐTB, xếp loại 5 mức); Danh mục Mẫu 5 thi cấp Bộ; Mã Giấy chứng nhận điện tử QR.")

    add_question(doc, "4.10", "Các đối tượng dữ liệu có mối quan hệ với nhau như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Mô hình ERD chuẩn hóa 3NF gồm 12 thực thể chính (USERS, ROLES, STUDENTS, LECTURERS, DEPARTMENTS, PROJECTS, PROJECT_MEMBERS, MILESTONES, COUNCILS, COUNCIL_MEMBERS, EVALUATION_SHEETS, PROJECT_DOCUMENTS).")

    add_question(doc, "4.11", "Dữ liệu nào cần được phân quyền truy cập hoặc bảo mật?")
    add_answer_intro(doc)
    add_p(doc, "Phân loại 4 cấp độ: Công khai (Tên đề tài, Tác giả, Tóm tắt Mẫu 3.4), Nội bộ (Đề cương Mẫu 2, Báo cáo toàn văn), Hạn chế (Phiếu chấm điểm chi tiết Mẫu 4.1, Dự toán kinh phí 7-10 triệu), Tuyệt mật (Mật khẩu, Token, Khóa ký số, Audit Logs).")

    # GÓC NHÌN 5: TECHNOLOGY
    add_section_header(doc, "5", "Technology", "Công nghệ")

    add_question(doc, "5.1", "Hệ thống cần sử dụng những loại phần cứng nào để triển khai và vận hành?")
    add_answer_intro(doc)
    add_p(doc, "Web/App Server Cluster (2-4 VM Nodes Load Balancing), Database Server Cluster (Master - Slave Replication), Object Storage (MinIO 5-10TB), Backup Server độc lập tại TP.HCM (>= 10TB).")

    add_question(doc, "5.2", "Hệ thống sẽ được triển khai dưới dạng web, mobile hay desktop? Vì sao?")
    add_answer_intro(doc)
    add_p(doc, "Ứng dụng Web Responsive (Web-first) kết hợp Mobile REST API/PWA: tối ưu soạn thảo/đọc duyệt tài liệu dài trên Desktop và hỗ trợ tra cứu/nhận thông báo đẩy trên Mobile.")

    add_question(doc, "5.3", "Các phần mềm/công nghệ nào dự kiến được sử dụng để xây dựng hệ thống?")
    add_answer_intro(doc)
    add_p(doc, "Frontend: React.js / Next.js, TypeScript, Tailwind CSS; Backend: NestJS (Node.js) / Spring Boot (Java); DB: PostgreSQL 16, Redis 7 Cluster, MinIO Object Storage; Search: Elasticsearch/Meilisearch.")

    add_question(doc, "5.4", "Ngôn ngữ lập trình và framework nào được sử dụng cho Frontend và Backend?")
    add_answer_intro(doc)
    add_p(doc, "Frontend: Next.js 14+ / React 18+ (Type-safe); Backend: NestJS (TypeScript) hoặc Spring Boot (Java 21) kiến trúc Clean Architecture / Modular Monolith.")

    add_question(doc, "5.5", "Hệ quản trị cơ sở dữ liệu nào được sử dụng để lưu trữ dữ liệu?")
    add_answer_intro(doc)
    add_p(doc, "PostgreSQL 16 (ACID tuyệt đối, JSONB cho tiêu chí chấm điểm động, Table Partitioning theo năm học) kết hợp Redis Cluster cho Caching và Session.")

    add_question(doc, "5.6", "Hệ thống cần sử dụng những công nghệ mạng và giao thức nào?")
    add_answer_intro(doc)
    add_p(doc, "HTTPS (TLS 1.3), RESTful API chuẩn OpenAPI 3.0, GraphQL cho thống kê động, WebSockets cho thông báo thời gian thực, gRPC.")

    add_question(doc, "5.7", "Hệ thống có sử dụng Cloud/Infrastructure hay máy chủ nội bộ không?")
    add_answer_intro(doc)
    add_p(doc, "Triển khai trên Private Cloud tại Trung tâm Dữ liệu (Data Center) PTIT, đóng gói Docker Container và điều phối bằng Kubernetes (K8s) đảm bảo an toàn tuyệt đối dữ liệu.")

    add_question(doc, "5.8", "Hệ thống cần những cơ chế nào để đảm bảo bảo mật và phân quyền người dùng?")
    add_answer_intro(doc)
    add_bullet_item(doc, "Xác thực tập trung PTIT Slink SSO", "Tích hợp chuẩn OpenID Connect (OIDC) với cổng SSO của Học viện (gwdu.ptit.edu.vn). Hỗ trợ đăng nhập qua Microsoft Outlook (@ptit.edu.vn, @stu.ptit.edu.vn cho miền Bắc) và Google Gmail (cho miền Nam). Tuyệt đối không lưu trữ mật khẩu cục bộ tại hệ thống SRMS.")
    add_bullet_item(doc, "Tự động gán Role theo Claims (Claim-based RBAC)", "Role được gán tự động ngay sau khi giải mã ID Token dựa trên định danh tài khoản, loại bỏ rủi ro cấp sai quyền hoặc tạo tài khoản ảo.")
    add_bullet_item(doc, "Kiểm soát truy cập theo ngữ cảnh (ABAC)", "Chặn quyền sửa đổi dữ liệu khi đã quá hạn mốc tiến độ; chặn giảng viên ngoài danh sách Hội đồng truy cập phiếu chấm Mẫu 4.1; chặn sinh viên sửa đề tài sau khi Khoa đã duyệt.")
    add_bullet_item(doc, "An toàn truyền dẫn và chống giả mạo", "Mã hóa toàn bộ lưu lượng qua HTTPS (TLS 1.3); phòng chống OWASP Top 10 (SQL Injection, XSS, CSRF); mã hóa AES-256 các file tài liệu nhạy cảm.")
    add_bullet_item(doc, "Xác thực toàn vẹn bằng Mã QR và Chữ ký số", "Giấy chứng nhận NCKH và Biên bản nghiệm thu Mẫu 4.2 được gắn mã QR ký số điện tử để tra cứu tính xác thực tức thì.")

    add_question(doc, "5.9", "Cần có cơ chế sao lưu và khôi phục dữ liệu như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Chiến lược Backup 3-2-1 (Full weekly, Diff daily, WAL 15 mins), cam kết RPO <= 15 phút, RTO <= 1 giờ.")

    add_question(doc, "5.10", "Hệ thống cần đáp ứng như thế nào về hiệu năng, khả năng mở rộng và tính sẵn sàng?")
    add_answer_intro(doc)
    add_p(doc, "Tải trang <= 1.5s, API response <= 500ms, Uptime >= 99.9%, hỗ trợ đồng thời >= 3.000 người dùng truy cập.")

    # GÓC NHÌN 6: FUNCTION
    add_section_header(doc, "6", "Function / Application", "Chức năng / Ứng dụng")

    add_question(doc, "6.1", "Chức năng đăng nhập, đăng xuất và quản lý tài khoản được thực hiện như thế nào?")
    add_answer_intro(doc)
    add_bullet_item(doc, "Đăng nhập một chạm PTIT Slink SSO", "Người dùng truy cập hệ thống, chọn đăng nhập bằng 'PTIT Microsoft Outlook' (miền Bắc) hoặc 'PTIT Google Gmail' (miền Nam). Hệ thống chuyển hướng xác thực an toàn qua giao thức OIDC.")
    add_bullet_item(doc, "Tự động kích hoạt vai trò (Auto Role Provisioning)", "Sau khi đăng nhập thành công, hệ thống tự động nhận diện danh tính và gắn sẵn vai trò (Sinh viên, Giảng viên, Thư ký Khoa, Chuyên viên QLKH) mà người dùng không cần đăng ký tài khoản hay chờ Admin cấp quyền thủ công.")
    add_bullet_item(doc, "Quản lý phiên làm việc (Session Management)", "Sử dụng JSON Web Token (JWT) với cơ chế Refresh Token lưu tại Redis; tự động đăng xuất sau 30 phút bất hoạt để bảo vệ dữ liệu khi dùng máy tính công cộng.")

    add_question(doc, "6.2", "Chức năng quản lý thông tin sinh viên và giảng viên gồm những gì?")
    add_answer_intro(doc)
    add_bullet_item(doc, "Tự động đồng bộ hồ sơ (Profile Auto-sync)", "Đồng bộ thông tin cá nhân (Mã SV/Mã GV, Họ tên, Lớp, Ngành, Khoa/Viện, Bộ môn) từ danh bạ Học viện ngay lần đầu đăng nhập SSO.")
    add_bullet_item(doc, "Hồ sơ năng lực NCKH (Scientific Portfolio)", "Lưu trữ lịch sử các đề tài đã thực hiện/hướng dẫn, công trình bài báo công bố, giải thưởng NCKH sinh viên qua các năm.")
    add_bullet_item(doc, "Kiểm soát hạn mức ràng buộc theo QĐ 521", "Tự động kiểm tra: mỗi sinh viên tối đa 01 đề tài/năm (Điều 15); mỗi giảng viên hướng dẫn tối đa không quá 02 đề tài sinh viên cùng thời gian (Điều 16).")

    add_question(doc, "6.3", "Chức năng quản lý đề tài nghiên cứu gồm những gì?")
    add_answer_intro(doc)
    add_p(doc, "Cấu hình đợt NCKH theo năm học, bộ lọc đa tiêu chí, tự động phân tích độ tương đồng kiểm tra trùng lặp đề tài.")

    add_question(doc, "6.4", "Chức năng đăng ký đề tài của sinh viên hoạt động như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Form đăng ký thông minh, quản lý dự toán kinh phí (7 - 10 triệu VNĐ theo QĐ 169/2026), tự động chặn SV làm 2 đề tài/năm, nộp Đề cương Mẫu 2.")

    add_question(doc, "6.5", "Chức năng quản lý nhóm sinh viên và giảng viên hướng dẫn như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Thêm/xóa thành viên bằng Mã SV (tối đa 5 SV), xác nhận tham gia nhóm, GVHD duyệt nhận hướng dẫn trên hệ thống.")

    add_question(doc, "6.6", "Chức năng xét duyệt/phê duyệt đề tài hoạt động như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Hội đồng Khoa thẩm định sơ bộ, tự động xuất Công văn Mẫu 1 gửi Học viện, P.QLKHCN tổng hợp và cập nhật QĐ giao đề tài & kinh phí của Giám đốc Học viện.")

    add_question(doc, "6.7", "Chức năng quản lý và theo dõi tiến độ đề tài gồm những gì?")
    add_answer_intro(doc)
    add_p(doc, "Lược đồ Milestones và Gantt Chart, nộp báo cáo định kỳ 3 mốc, quản lý Biên bản Hội thảo chuyên đề Mẫu 3.5.")

    add_question(doc, "6.8", "Chức năng nộp và quản lý báo cáo, tài liệu, sản phẩm nghiên cứu gồm những gì?")
    add_answer_intro(doc)
    add_p(doc, "Nộp Báo cáo tổng kết toàn văn (Mẫu 3.1-3.3), Tóm tắt Mẫu 3.4, bài báo minh chứng, link mã nguồn Git; kiểm tra đạo văn; GVHD xác nhận đồng ý nghiệm thu.")

    add_question(doc, "6.9", "Chức năng đánh giá, chấm điểm và nghiệm thu đề tài hoạt động như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Quản lý Hội đồng và xếp lịch bảo vệ, Phiếu chấm điểm Online Mẫu 4.1 (thang 100 điểm với 7 tiêu chí), tự động tính ĐTB và xuất Biên bản Mẫu 4.2, Bảng tổng hợp Mẫu 4.3 theo 5 mức xếp loại.")

    add_question(doc, "6.10", "Chức năng tìm kiếm, lọc và tra cứu đề tài hoạt động như thế nào?")
    add_answer_intro(doc)
    add_p(doc, "Tìm kiếm toàn văn theo từ khóa, tên đề tài, tác giả, GVHD, năm học, khoa/ngành; Thư viện số cho phép đọc tóm tắt kết quả (Mẫu 3.4) và tải báo cáo toàn văn công khai.")

    add_question(doc, "6.11", "Hệ thống có chức năng thống kê, báo cáo kết quả nghiên cứu khoa học hay không?")
    add_answer_intro(doc)
    add_p(doc, "CÓ. Tự động xuất Word/PDF chuẩn **100% các Biểu mẫu QĐ 521** (Mẫu 1, 2, 3.1-3.4, 3.5, 4.1, 4.2, 4.3, 5); Thống kê số lượng đề tài theo Khoa; Thống kê giờ NCKH giảng viên; Lập danh sách cấp Giấy chứng nhận và danh sách cộng điểm học bổng gửi Phòng CTSV.")

    add_question(doc, "6.12", "Hệ thống có gửi thông báo về hạn đăng ký, xét duyệt, tiến độ hoặc nộp báo cáo không?")
    add_answer_intro(doc)
    add_p(doc, "CÓ. Notification Engine đa kênh (In-app, Email, Zalo/SMS) tự động nhắc hạn trước 7 ngày, 3 ngày, 1 ngày khi sắp đến hạn nộp đề cương, báo cáo tiến độ, nộp hồ sơ nghiệm thu.")

    add_question(doc, "6.13", "Mỗi nhóm người dùng được sử dụng những chức năng nào?")
    add_answer_intro(doc)
    headers_q6_13 = ["Nhóm Chức năng / Phân hệ", "Sinh viên", "Giảng viên HD", "Thư ký Khoa", "Hội đồng KH", "P. QLKHCN", "Quản trị Admin"]
    data_q6_13 = [
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
    add_table_data(doc, headers_q6_13, data_q6_13, [2.1, 0.7, 0.7, 0.8, 0.8, 0.8, 0.7])

    # Save document
    filename = "He_thong_quan_ly_de_tai_nghien_cuu_khoa_hoc_sinh_vien.docx"
    doc.save(filename)

if __name__ == "__main__":
    build_qa_document()
