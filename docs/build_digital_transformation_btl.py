# -*- coding: utf-8 -*-
"""
Master script to generate the complete, comprehensive BTL Report on Information Gathering Methods for MIS
featuring the Digital Transformation / Paperless Paradigm for Student Scientific Research Management System.
Căn cứ lý thuyết: 
1. Kenneth C. Laudon & Jane P. Laudon - Management Information Systems: Managing the Digital Firm (Pearson)
2. Giáo trình & Slide bài giảng 'Phát triển Hệ thống thông tin quản lý' - TS. Nguyễn Quang Hưng (Học viện PTIT)
3. Management Information Systems - Odisha CSE
Căn cứ thực tiễn:
1. Quyết định số 521/QĐ-HV ngày 14/05/2020 của Giám đốc Học viện PTIT
2. Quyết định số 169/QĐ-HV ngày 15/01/2026 của Giám đốc Học viện PTIT về việc sửa đổi, bổ sung Quy định NCKH SV
3. Định mức kinh phí: 7.000.000 VNĐ - 10.000.000 VNĐ / đề tài.
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def generate_paperless_btl_report():
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
        hrun = hp.add_run("BÀI TẬP LỚN HTTTQL | CHUYỂN ĐỔI SỐ HOẠT ĐỘNG NCKH SINH VIÊN (SRMS)")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(0x77, 0x77, 0x77)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Báo cáo Thu thập thông tin Phân tích Hệ thống SRMS (Căn cứ QĐ 521/QĐ-HV & QĐ 169/QĐ-HV)")
        frun.font.name = "Times New Roman"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(0x77, 0x77, 0x77)

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

    def add_h1(doc, text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        apply_font(r, size=14, bold=True, color_rgb=(0x00, 0x33, 0x66))
        return p

    def add_h2(doc, text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        apply_font(r, size=12.5, bold=True, color_rgb=(0x00, 0x33, 0x66))
        return p

    def add_h3(doc, text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        apply_font(r, size=12, bold=True, italic=True, color_rgb=(0x2B, 0x4C, 0x7E))
        return p

    def add_bullet(doc, title, content, level=0):
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

    def add_callout(doc, text, prefix="CĂN CỨ VĂN BẢN VÀ CƠ SỞ LÝ THUYẾT HTTTQL: "):
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

    def add_styled_table(doc, headers, data, col_widths=None):
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
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx > 0 and len(headers) > 2 else WD_ALIGN_PARAGRAPH.CENTER
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
        return table

    # TRANG BÌA
    add_p(doc, "BỘ THÔNG TIN VÀ TRUYỀN THÔNG", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=2, size=12.5, bold=True, color=(0x33, 0x33, 0x33))
    add_p(doc, "HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=2, size=13.5, bold=True, color=(0x00, 0x33, 0x66))
    add_p(doc, "KHOA HỆ THỐNG THÔNG TIN / CÔNG NGHỆ THÔNG TIN", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=24, size=11, bold=True, italic=True, color=(0x66, 0x66, 0x66))

    add_p(doc, "BÁO CÁO BÀI TẬP LỚN HỆ THỐNG THÔNG TIN QUẢN LÝ", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=8, space_after=4, size=14, bold=True, color=(0x00, 0x33, 0x66))
    add_p(doc, "ĐỀ TÀI: CHUYỂN ĐỔI SỐ QUẢN LÝ ĐỀ TÀI NCKH SINH VIÊN\nÁP DỤNG CÁC PHƯƠNG PHÁP THU THẬP THÔNG TIN TRONG PHÂN TÍCH HTTT", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, size=15.5, bold=True, color=(0x99, 0x00, 0x00))
    add_p(doc, "(Chuyển đổi toàn diện từ quy trình văn bản giấy tờ thủ công sang Hệ thống thông tin số hóa\nCăn cứ: Quyết định số 521/QĐ-HV & Quyết định sửa đổi, bổ sung số 169/QĐ-HV ngày 15/01/2026)", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=32, size=11.5, italic=True, color=(0x44, 0x44, 0x44))

    add_p(doc, "Môn học: Hệ thống thông tin quản lý", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=16, space_after=4, size=11.5, bold=True, color=(0x00, 0x33, 0x66))
    add_p(doc, "Nhóm sinh viên thực hiện: Nhóm Bài tập lớn HTTTQL", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=4, size=11, color=(0x33, 0x33, 0x33))
    add_p(doc, "Thời gian thực hiện: Năm học 2025 - 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=36, size=11, italic=True, color=(0x33, 0x33, 0x33))

    doc.add_page_break()

    # LỜI MỞ ĐẦU & BỐI CẢNH CHUYỂN ĐỔI SỐ
    add_h1(doc, "LỜI MỞ ĐẦU: BỐI CẢNH CHUYỂN ĐỔI SỐ VÀ MỤC TIÊU BÀI TẬP LỚN")
    add_p(doc, "Hệ thống Thông tin Quản lý (MIS) là tập hợp có cấu trúc của các thành phần bao gồm: **Tổ chức (Organizations)**, **Con người (People)** và **Công nghệ (Technology)** cùng tương tác nhằm thu thập, lưu trữ, xử lý và phân phối thông tin hỗ trợ việc ra quyết định, điều phối và kiểm soát trong tổ chức.")
    add_p(doc, "Trong xu thế chuyển đổi số giáo dục đại học, việc đổi mới quy trình quản lý đặt ra yêu cầu tái cấu trúc toàn diện các hoạt động nghiệp vụ: **chuyển đổi từ phương thức quản lý giấy tờ, hồ sơ in ấn thủ công sang nền tảng số hóa thông minh, liên thông dòng dữ liệu và không giấy tờ (Paperless Management)**.")
    add_p(doc, "Để phân tích và thiết kế Hệ thống Thông tin Quản lý Đề tài NCKH Sinh viên (SRMS), nhóm đã lựa chọn và triển khai **02 phương pháp thu thập thông tin chuẩn mực có căn cứ xác thực 100%, bám sát các văn bản pháp quy của Học viện**:")
    add_bullet(doc, "Phương pháp 1 - Nghiên cứu tài liệu về hệ thống (Document Analysis)", "Nguồn tài liệu chính thức: Toàn văn **Quyết định số 521/QĐ-HV ngày 14/05/2020** và **Quyết định số 169/QĐ-HV ngày 15/01/2026** của Giám đốc Học viện về việc sửa đổi, bổ sung Quy định hoạt động NCKH của sinh viên (trong đó quy định rõ định mức kinh phí cấp cho 01 đề tài từ 7.000.000 VNĐ đến 10.000.000 VNĐ) cùng hệ thống Phụ lục Biểu mẫu Mẫu 1 đến Mẫu 5.")
    add_bullet(doc, "Phương pháp 2 - Phiếu điều tra khảo sát (Questionnaires / Survey Method)", "Khảo sát thực tế trên tập mẫu sinh viên và giảng viên nhằm đo lường các nút thắt của quy trình giấy tờ cũ và đo lường mức độ ưu tiên của các tính năng số hóa mới.")

    add_callout(doc,
        "1. Căn cứ thực tiễn: Quyết định số 521/QĐ-HV ngày 14/05/2020 & Quyết định sửa đổi, bổ sung số 169/QĐ-HV ngày 15/01/2026 của Giám đốc Học viện Công nghệ Bưu chính Viễn thông;\n"
        "2. Định mức kinh phí: Tổng kinh phí cấp cho 01 đề tài NCKH sinh viên từ 7.000.000 VNĐ đến 10.000.000 VNĐ (theo QĐ số 169/QĐ-HV sửa đổi, bổ sung);\n"
        "3. Mục tiêu Chuyển đổi số: Loại bỏ 100% việc in ấn nộp hồ sơ giấy (Mẫu 1-5), chấm điểm giấy, nộp 10 cuốn báo cáo in và đĩa CD; chuyển sang quy trình trực tuyến hoàn toàn.",
        "CĂN CỨ PHÁP LÝ, ĐỊNH MỨC KINH PHÍ & MỤC TIÊU SỐ HÓA: "
    )

    # BẢNG SO SÁNH AS-IS VS TO-BE
    add_h2(doc, "Bảng so sánh: Quy trình Quản lý Giấy tờ thủ công (AS-IS) vs Mô hình Chuyển đổi số (TO-BE)")
    headers_as_is = ["Khâu nghiệp vụ", "Hiện trạng Giấy tờ thủ công (AS-IS)", "Hệ thống Thông tin Chuyển đổi số (TO-BE)", "Lợi ích mang lại"]
    data_as_is = [
        ["1. Đăng ký & Lập nhóm đề tài", "Sinh viên viết đơn giấy, in bản thuyết minh, đi xin chữ ký GVHD, nộp trực tiếp tại Khoa", "Đăng nhập một chạm PTIT Slink SSO (Microsoft Outlook/Gmail), hệ thống tự gán Role Sinh viên, tự động kiểm tra quy định, mời thành viên & GVHD duyệt online", "Tiết kiệm 90% thời gian, không cần tạo tài khoản thủ công, chống trùng lặp đề tài"],
        ["2. Thẩm định & Giao đề tài", "Khoa lập công văn giấy Mẫu 1 gửi P.QLKHCN; Học viện ban hành quyết định giấy", "HĐ Khoa duyệt sơ bộ trên web, tự động xuất Công văn Mẫu 1 có chữ ký số; Giám đốc duyệt QĐ & kinh phí 7-10 trđ trên hệ thống", "Rút ngắn quy trình từ 3 tuần xuống 3 ngày, minh bạch hóa hạn mức kinh phí"],
        ["3. Phê duyệt Đề cương & Giám sát", "Nộp bản in Đề cương Mẫu 2; theo dõi tiến độ qua trao đổi rời rạc Zalo/Email; biên bản hội thảo Mẫu 3.5 ký giấy", "Nộp và duyệt Đề cương Mẫu 2 trực tuyến; quản lý tiến độ theo 3 mốc Milestones & Gantt Chart; số hóa Biên bản hội thảo Mẫu 3.5", "Giám sát tiến độ thời gian thực, nhắc hạn tự động qua Email/In-app, tránh bỏ quên đề tài"],
        ["4. Nộp Báo cáo & Chấm nghiệm thu", "In đóng 10 quyển báo cáo dày + ghi đĩa CD; Hội đồng chấm phiếu giấy Mẫu 4.1; thư ký cộng điểm thủ công", "Nộp bản PDF toàn văn + link Git/video demo; Hội đồng chấm điểm Online trên Tablet/Web (thang 100); hệ thống tự tính ĐTB & xếp loại 5 mức", "Loại bỏ hoàn toàn chi phí in ấn đóng quyển, chấm điểm chính xác tuyệt đối, lập tức có kết quả"],
        ["5. Cấp Chứng nhận & Quyết toán", "Chờ in Giấy chứng nhận bản cứng có chữ ký tay; thủ tục thanh quyết toán kinh phí (7-10 triệu) làm giấy tờ phức tạp", "Tự động cấp E-Certificate có mã QR xác thực; tự động xuất danh sách cộng điểm học bổng cho P.CTSV; hỗ trợ quyết toán số", "Sinh viên nhận chứng nhận tức thì, giải ngân kinh phí minh bạch và thuận tiện"],
        ["6. Khai thác & Kế thừa tri thức", "Báo cáo nghiệm thu xếp kho hoặc đĩa CD bị ẩm mốc, sinh viên khóa sau không thể tra cứu", "Toàn bộ báo cáo, bài báo và mã nguồn được index vào Thư viện số NCKH, cho phép tìm kiếm toàn văn và kế thừa phát triển đồ án", "Tối đa hóa giá trị học thuật, xây dựng kho tri thức số cho toàn Học viện"]
    ]
    add_styled_table(doc, headers_as_is, data_as_is, [1.2, 1.8, 1.9, 1.4])

    # PHẦN 1: NGHIÊN CỨU TÀI LIỆU
    add_h1(doc, "PHẦN I. PHƯƠNG PHÁP NGHIÊN CỨU TÀI LIỆU VỀ HỆ THỐNG (DOCUMENT ANALYSIS)")
    
    add_h2(doc, "1.1. Mục đích và lý do lựa chọn phương pháp")
    add_p(doc, "Nghiên cứu tài liệu về hệ thống là phương pháp thu thập thông tin thông qua việc tìm kiếm, đọc, phân tích, đối chiếu và trích xuất các quy tắc từ các văn bản pháp quy, quy chế đào tạo, quy định quản lý khoa học công nghệ và các biểu mẫu hành chính đang được áp dụng.")
    add_p(doc, "Phương pháp này đảm bảo tính pháp lý vững chắc, giúp nhóm nắm bắt chuẩn xác từng điều khoản, biểu mẫu và quy tắc nghiệp vụ thực tế của Học viện PTIT mà không bị sai lệch hay suy đoán chủ quan.")

    add_h2(doc, "1.2. Nguồn tài liệu thu thập và tính xác thực của tài liệu")
    headers_doc_plan = ["STT", "Tên tài liệu thu thập", "Cơ quan ban hành / Nguồn", "Nội dung trích xuất chính", "Tình trạng xác thực"]
    data_doc_plan = [
        ["1", "Quyết định số 521/QĐ-HV (14/05/2020)", "Giám đốc Học viện PTIT", "Toàn bộ 18 Điều quy định về NCKH sinh viên, cơ cấu quản lý, tiêu chí chấm điểm, quyền lợi", "Đã thu thập & OCR toàn văn 24 trang"],
        ["2", "Quyết định số 169/QĐ-HV (15/01/2026)", "Giám đốc Học viện PTIT", "Sửa đổi, bổ sung quy định NCKH SV, quy định định mức kinh phí từ 7.000.000 đến 10.000.000 VNĐ/đề tài", "Đã cập nhật đầy đủ các điểm mới"],
        ["3", "Hệ thống Phụ lục Biểu mẫu (QĐ 521)", "Phòng QLKHCN & HTQT", "Mẫu 1 (Công văn ĐK), Mẫu 2 (Đề cương), Mẫu 3 (Báo cáo), Mẫu 4 (Nghiệm thu), Mẫu 5 (Thi Bộ)", "Đã phân tích chi tiết cấu trúc trường dữ liệu"],
        ["4", "Thông tư 19/2012/TT-BGDĐT", "Bộ Giáo dục và Đào tạo", "Quy định khung về hoạt động NCKH của sinh viên trong cơ sở giáo dục đại học", "Đã đối chiếu tính pháp lý Nhà nước"],
        ["5", "Khung Kiến trúc Đại học số PTIT", "Học viện PTIT / Bộ TT&TT", "Định hướng chuyển đổi số, tích hợp SSO CAS, cơ sở dữ liệu dùng chung và dịch vụ số", "Đã tham chiếu kiến trúc công nghệ"]
    ]
    add_styled_table(doc, headers_doc_plan, data_doc_plan, [0.5, 1.8, 1.4, 2.0, 1.0])

    add_h2(doc, "1.3. Phiếu ghi nhận thông tin tài liệu thực tế (Trích xuất từ QĐ 521 & QĐ 169)")
    
    add_h3(doc, "Bảng 1.1: Thông tin chung về văn bản pháp lý nghiên cứu")
    headers_meta = ["Thuộc tính", "Nội dung ghi nhận thực tế từ tài liệu"]
    data_meta = [
        ["Tên văn bản gốc", "Quy định về hoạt động nghiên cứu khoa học của sinh viên Học viện Công nghệ Bưu chính Viễn thông"],
        ["Số hiệu văn bản gốc", "Quyết định số 521/QĐ-HV ngày 14/05/2020 của Giám đốc Học viện"],
        ["Văn bản sửa đổi, bổ sung", "Quyết định số 169/QĐ-HV ngày 15/01/2026 của Giám đốc Học viện Công nghệ Bưu chính Viễn thông"],
        ["Cơ quan ban hành", "Giám đốc Học viện Công nghệ Bưu chính Viễn thông (Bộ Thông tin và Truyền thông)"],
        ["Cơ quan tham mưu", "Phòng Quản lý Khoa học Công nghệ và Hợp tác Quốc tế (P.QLKHCN&HTQT)"],
        ["Định mức kinh phí đề tài", "Từ 7.000.000 VNĐ đến 10.000.000 VNĐ / đề tài NCKH sinh viên (theo QĐ 169/QĐ-HV)"],
        ["Đối tượng áp dụng", "Sinh viên đại học chính quy và giảng viên cơ hữu thuộc Học viện (Khoa Đào tạo 1, 2, Đa phương tiện, Viện KHKT Bưu điện CDIT/RIPT, Viện Kinh tế Bưu điện)"]
    ]
    add_styled_table(doc, headers_meta, data_meta, [2.2, 4.5])

    add_h3(doc, "Bảng 1.2: Trích xuất nội dung nghiệp vụ trọng yếu và quy tắc ràng buộc (Business Rules)")
    headers_extract = ["STT", "Nội dung nghiệp vụ", "Thông tin trích xuất chi tiết từ QĐ 521 & QĐ 169", "Căn cứ điều khoản"]
    data_extract = [
        ["1", "Mục tiêu NCKH SV", "Nâng cao chất lượng đào tạo, bồi dưỡng nhân tài; phát huy tính sáng tạo, độc lập NCKH; tạo ra tri thức/sản phẩm mới.", "Điều 2 QĐ 521"],
        ["2", "Kinh phí thực hiện đề tài", "Tổng kinh phí cấp cho 01 đề tài NCKH sinh viên từ 7.000.000 VNĐ đến 10.000.000 VNĐ. Cấp kinh phí theo đề cương duyệt; quyết toán theo kết luận nghiệm thu.", "Điều 5 QĐ 521 & QĐ 169/2026"],
        ["3", "Thời hạn đăng ký đề tài", "Học viện phát động đầu năm học; các Khoa hoàn thành xét duyệt danh mục đề tài đăng ký trong tháng 9 hàng năm (Mẫu 1).", "Điểm e Khoản 1 Điều 9"],
        ["4", "Thời hạn nộp hồ sơ nghiệm thu", "Các Khoa gửi toàn bộ hồ sơ xác nhận hoàn thành kế hoạch NCKH về Phòng QLKHCN&HTQT trước ngày 10 tháng 4 hàng năm.", "Khoản 4 Điều 10"],
        ["5", "Thời gian tổ chức Hội nghị NCKH", "Tổ chức Hội nghị NCKH sinh viên toàn Học viện trước ngày 15 tháng 6 hàng năm.", "Khoản 2 Điều 11"],
        ["6", "Thời gian nộp hồ sơ thi Giải cấp Bộ", "Hoàn thiện và gửi hồ sơ tham gia xét Giải thưởng 'Sinh viên NCKH' cấp Bộ GD&ĐT trước ngày 30 tháng 6 hàng năm (Mẫu 5).", "Khoản 3 Điều 12"],
        ["7", "Quy định quy mô nhóm sinh viên", "Mỗi đề tài NCKH do một (01) sinh viên chủ trì, số lượng tham gia không quá năm (05) người. Mỗi SV chỉ làm 01 đề tài/năm.", "Khoản 2 Điều 9, Điều 15"],
        ["8", "Quy định người hướng dẫn", "Mỗi đề tài do một (01) người hướng dẫn. Mỗi giảng viên/cán bộ hướng dẫn tối đa hai (02) đề tài sinh viên trong cùng một thời gian.", "Khoản 2 Điều 9, Điều 16"],
        ["9", "Thang điểm & Xếp loại nghiệm thu", "Đánh giá độc lập thang điểm 100 theo 7 tiêu chí. Xếp loại 5 mức: Xuất sắc (>=90đ), Tốt (80-<90đ), Khá (70-<80đ), Đạt (50-<70đ), Không đạt (<50đ).", "Khoản 2 & 3 Điều 10"],
        ["10", "Quyền lợi cấp Giấy chứng nhận", "Sinh viên có đề tài nghiệm thu đạt loại Khá trở lên được Học viện cấp Giấy chứng nhận tham gia NCKH; được phát triển làm đồ án/khóa luận tốt nghiệp.", "Điểm e Khoản 2 Điều 15"],
        ["11", "Quyền lợi cộng điểm học bổng", "Cộng điểm thưởng vào ĐTB chung học tập xét học bổng (1 kỳ): Giải Quốc tế (Nhất +3.0, Nhì +2.5, Ba +2.0, KK +1.5); Giải Trong nước/Bộ (Nhất +0.4, Nhì +0.3, Ba +0.2, KK +0.1).", "Điểm h Khoản 2 Điều 15"],
        ["12", "Hỗ trợ kinh phí dự thi cấp trên", "Hỗ trợ kinh phí chuẩn bị hồ sơ báo cáo/sản phẩm gửi dự thi cấp trên tối đa 1.000.000 VNĐ/đề tài (sản phẩm)/cấp dự thi.", "Điểm i Khoản 2 Điều 15"]
    ]
    add_styled_table(doc, headers_extract, data_extract, [0.5, 1.8, 3.4, 1.0])

    add_h3(doc, "Bảng 1.3: Danh mục hệ thống biểu mẫu cần được số hóa hoàn toàn (Mẫu 1 đến Mẫu 5)")
    headers_forms = ["Mã biểu mẫu", "Tên biểu mẫu quy định", "Đơn vị chủ trì lập", "Mục đích nghiệp vụ", "Yêu cầu số hóa trên HTTT"]
    data_forms = [
        ["Mẫu 1", "Công văn đăng ký đề tài NCKH sinh viên", "Khoa / Viện đào tạo", "Đăng ký danh mục đề tài và dự kiến kinh phí (7-10 triệu) lên P.QLKHCN", "Tự động kết xuất từ dữ liệu duyệt cấp Khoa"],
        ["Mẫu 2", "Đề cương nghiên cứu khoa học của sinh viên", "Sinh viên chủ trì & GVHD", "Thuyết minh mục tiêu, nội dung, phương pháp, dự toán kinh phí", "Form nhập trực tuyến + Upload file đính kèm"],
        ["Mẫu 3.1 - 3.3", "Báo cáo tổng kết toàn văn, Trang bìa & Bìa phụ", "Nhóm sinh viên thực hiện", "Trình bày toàn văn kết quả nghiên cứu theo chuẩn A4", "Upload file PDF chuẩn + tự sinh trang bìa"],
        ["Mẫu 3.4", "Thông tin kết quả nghiên cứu của đề tài", "Nhóm sinh viên & GVHD", "Tóm tắt kết quả, tính mới, khả năng ứng dụng thực tế", "Form tóm tắt phục vụ tra cứu Thư viện số"],
        ["Mẫu 3.5", "Biên bản hội thảo đề tài NCKH sinh viên", "Khoa & GVHD", "Ghi nhận ý kiến đóng góp hoàn thiện đề tài trong quá trình thực hiện", "Nhập biên bản họp + upload bản scan chữ ký"],
        ["Mẫu 4.1", "Phiếu đánh giá đề tài NCKH sinh viên", "Thành viên Hội đồng nghiệm thu", "Chấm điểm độc lập 7 tiêu chí theo thang điểm 100", "Giao diện chấm điểm Online cho từng giám khảo"],
        ["Mẫu 4.2", "Biên bản nghiệm thu đề tài NCKH sinh viên", "Thư ký & Chủ tịch Hội đồng NT", "Ghi nhận kết quả điểm TB, xếp loại, kiến nghị khen thưởng", "Tự động tổng hợp điểm TB và sinh biên bản"],
        ["Mẫu 4.3", "Bảng tổng hợp kết quả đánh giá đề tài NCKH", "Trợ lý NCKH Khoa / Thư ký", "Tổng hợp xếp loại toàn bộ đề tài của Khoa gửi về Học viện", "Tự động xuất bảng tổng hợp gửi P.QLKHCN"],
        ["Mẫu 5", "Danh mục đề tài gửi tham gia xét Giải thưởng cấp Bộ", "Khoa đề xuất, P.QLKHCN tổng hợp", "Lựa chọn các đề tài Xuất sắc tiêu biểu gửi Bộ GD&ĐT", "Tự động lọc đề tài Xuất sắc và xuất biểu mẫu"]
    ]
    add_styled_table(doc, headers_forms, data_forms, [0.8, 1.8, 1.2, 1.5, 1.4])

    # PHẦN 2: PHIẾU ĐIỀU TRA KHẢO SÁT
    add_h1(doc, "PHẦN II. PHƯƠNG PHÁP PHIẾU ĐIỀU TRA KHẢO SÁT (QUESTIONNAIRES)")
    
    add_h2(doc, "2.1. Mục đích và đối tượng khảo sát")
    add_p(doc, "Khảo sát định lượng trên quy mô 120 - 150 sinh viên và 20 - 30 giảng viên/cán bộ quản lý tại các Khoa nhằm xác định mức độ khó khăn thực tế khi làm giấy tờ thủ công và đo lường mức độ sẵn sàng đón nhận hệ thống chuyển đổi số.")

    add_h2(doc, "2.2. Ma trận thiết kế câu hỏi khảo sát (Mapping Matrix)")
    headers_map = ["Mã câu hỏi", "Nội dung khảo sát", "Mục tiêu nghiên cứu", "Yêu cầu chức năng tương ứng trên hệ thống"]
    data_map = [
        ["Câu 1 - 3", "Năm học, Khoa/Ngành, Kinh nghiệm NCKH", "Phân loại mẫu khảo sát", "Module Xác thực PTIT Slink SSO & Gán Role tự động theo định danh"],
        ["Câu 4 - 5", "Kênh tiếp cận thông tin & Mức độ dễ dàng", "Đánh giá khả năng tiếp cận quy chế", "Module Cổng thông tin, Tra cứu quy định & Thông báo"],
        ["Câu 6 - 7", "Hình thức đăng ký & Khó khăn giấy tờ", "Nhận diện rào cản đăng ký thủ công", "Module Đăng ký đề tài trực tuyến & Hướng dẫn Mẫu 1, 2"],
        ["Câu 8 - 10", "Cách theo dõi tiến độ & Khó khăn thực tế", "Nhận diện nút thắt giám sát tiến độ", "Module Giám sát tiến độ theo mốc Milestones & Gantt Chart"],
        ["Câu 11 - 12", "Nhu cầu chuyển đổi số & Dùng app online", "Đo lường mức độ sẵn sàng đón nhận", "Xác định tính khả thi triển khai hệ thống SRMS"],
        ["Câu 13 - 14", "Khảo sát nhu cầu & Mức độ cần thiết chức năng", "Đo lường mức độ ưu tiên chức năng", "Xây dựng Product Backlog, xếp hạng mức độ ưu tiên"],
        ["Câu 15", "Kênh mong muốn nhận thông báo tự động", "Xác định kênh tương tác người dùng", "Module Notification Engine (Web In-app, Email, Zalo/SMS)"],
        ["Câu 16", "Ý kiến đóng góp và đề xuất mở", "Thu thập yêu cầu phi cấu trúc", "Hoàn thiện các yêu cầu phi chức năng và trải nghiệm UI/UX"]
    ]
    add_styled_table(doc, headers_map, data_map, [1.0, 1.8, 1.8, 2.1])

    add_h2(doc, "2.3. BỘ PHIẾU ĐIỀU TRA SỐ 01: KHẢO SÁT SINH VIÊN (16 CÂU HỎI HOÀN CHỈNH)")
    
    survey_questions = [
        ("Câu 1. Bạn hiện đang là sinh viên năm thứ mấy?", "Trắc nghiệm 1 lựa chọn", ["Năm thứ nhất", "Năm thứ hai", "Năm thứ ba", "Năm thứ tư", "Năm thứ năm trở lên"], "Xác định phân bố mẫu theo năm học"),
        ("Câu 2. Bạn thuộc Khoa / Ngành đào tạo nào?", "Trắc nghiệm 1 lựa chọn", ["Công nghệ thông tin / An toàn thông tin", "Kỹ thuật Điện tử / Viễn thông", "Công nghệ Đa phương tiện / Truyền thông", "Quản trị kinh doanh / Marketing", "Tài chính Kế toán", "Khác (ghi rõ)"], "Xác định cơ cấu khối ngành"),
        ("Câu 3. Bạn đã từng tham gia hoạt động nghiên cứu khoa học sinh viên chưa?", "Trắc nghiệm 1 lựa chọn", ["Đang chủ trì hoặc là thành viên đề tài NCKH năm nay", "Đã từng tham gia NCKH ở các năm học trước", "Chưa từng tham gia nhưng rất quan tâm và có ý định tham gia", "Chưa từng tham gia và chưa có ý định"], "Phân loại đối tượng trải nghiệm"),
        ("Câu 4. Bạn thường tiếp cận thông tin, kế hoạch NCKH sinh viên từ nguồn nào?", "Hộp kiểm - Chọn nhiều đáp án", ["Website chính thức của Học viện (ptit.edu.vn)", "Website / Fanpage của Khoa / Viện đào tạo", "Email sinh viên do nhà trường cấp", "Giảng viên bộ môn / Cố vấn học tập phổ biến", "Bạn bè, anh chị khóa trên truyền đạt", "Nhóm Facebook / Zalo lớp, câu lạc bộ sinh viên NCKH", "Các buổi tọa đàm, hội thảo phát động NCKH đầu năm", "Khác / Chưa từng tiếp cận thông tin"], "Xác định kênh truyền thông hiệu quả"),
        ("Câu 5. Bạn đánh giá mức độ dễ dàng khi tìm kiếm quy chế, điều kiện và biểu mẫu NCKH hiện nay như thế nào?", "Trắc nghiệm 1 lựa chọn (Thang đo 5 mức)", ["1 - Rất khó khăn (Không tìm thấy thông tin đầy đủ)", "2 - Khó khăn (Thông tin phân tán, biểu mẫu cũ)", "3 - Bình thường (Tìm kiếm mất nhiều thời gian)", "4 - Dễ dàng (Có hướng dẫn khá rõ ràng)", "5 - Rất dễ dàng (Mọi thông tin đều công khai, dễ tra cứu)", "Chưa từng tìm kiếm thông tin này"], "Đo lường mức độ minh bạch thông tin"),
        ("Câu 6. Nếu đã/đang tham gia NCKH, bạn đăng ký đề tài bằng hình thức nào?", "Trắc nghiệm 1 lựa chọn", ["Nộp hồ sơ bản in giấy trực tiếp tại văn phòng Khoa", "Gửi file biểu mẫu Word/PDF qua Email của Thư ký Khoa", "Điền qua Google Forms do Khoa/Bộ môn tạo", "Đăng ký trên phần mềm/Cổng thông tin trực tuyến", "Hình thức khác", "Chưa từng đăng ký đề tài"], "Đánh giá mức độ số hóa khâu đăng ký"),
        ("Câu 7. Trong quá trình đăng ký đề tài, bạn đã gặp những khó khăn nào sau đây?", "Hộp kiểm - Chọn nhiều đáp án", ["Không nắm rõ quy định (kinh phí hỗ trợ 7-10 triệu, số lượng thành viên)", "Khó khăn trong việc tìm kiếm Giảng viên hướng dẫn phù hợp", "Không biết cách điền các biểu mẫu thuyết minh, đề cương (Mẫu 1, Mẫu 2)", "Không biết tình trạng đề tài đã được Khoa/Học viện duyệt hay chưa", "Phải in ấn, chỉnh sửa và nộp lại hồ sơ giấy tờ nhiều lần", "Bị trễ hạn đăng ký do không nhận được thông báo kịp thời", "Không gặp khó khăn nào", "Khác (ghi rõ)"], "Nhận diện pain-points khâu đăng ký"),
        ("Câu 8. Bạn và nhóm nghiên cứu theo dõi tiến độ thực hiện đề tài bằng cách nào?", "Hộp kiểm - Chọn nhiều đáp án", ["Họp và trao đổi trực tiếp với GVHD định kỳ", "Trao đổi qua nhóm chat Zalo / Messenger / Telegram", "Gửi báo cáo qua Email cho GVHD và Khoa", "Tự theo dõi bằng file Excel / Trello / Notion", "Theo dõi trên phần mềm quản lý của nhà trường", "Chỉ nộp báo cáo vào đợt nghiệm thu cuối cùng, không theo dõi định kỳ", "Khác / Chưa từng tham gia"], "Khảo sát phương thức theo dõi tiến độ"),
        ("Câu 9. Bạn đánh giá mức độ thuận tiện của việc theo dõi tiến độ đề tài hiện nay ra sao?", "Trắc nghiệm 1 lựa chọn (Thang đo 5 mức)", ["1 - Rất bất tiện (Dễ quên hạn, không rõ tiến độ)", "2 - Bất tiện", "3 - Bình thường", "4 - Thuận tiện", "5 - Rất thuận tiện", "Chưa có trải nghiệm"], "Đo lường độ hài lòng về quản lý tiến độ"),
        ("Câu 10. Những khó khăn lớn nhất bạn gặp phải trong suốt quá trình làm NCKH?", "Hộp kiểm - Chọn nhiều đáp án", ["Khó khăn khi tìm kiếm tài liệu, công trình NCKH của khóa trước để tham khảo", "Khó khăn khi nộp báo cáo tiến độ và tổ chức hội thảo góp ý (Mẫu 3.5)", "Không nắm được lịch bảo vệ nghiệm thu và danh sách Hội đồng", "Chậm nhận được kết quả chấm điểm, xếp loại và Giấy chứng nhận NCKH", "Thủ tục thanh quyết toán kinh phí hỗ trợ (7-10 triệu) phức tạp", "Không biết cách kiểm tra trùng lặp, đạo văn cho báo cáo", "Khác (ghi rõ)"], "Nhận diện pain-points toàn chu trình"),
        ("Câu 11. Theo bạn, việc xây dựng một hệ thống phần mềm quản lý đề tài NCKH sinh viên trực tuyến có cần thiết không?", "Trắc nghiệm 1 lựa chọn", ["Rất cần thiết (Cần triển khai ngay)", "Cần thiết", "Bình thường", "Không cần thiết", "Không có ý kiến"], "Đo lường nhu cầu bức thiết của người dùng"),
        ("Câu 12. Bạn có sẵn sàng sử dụng hệ thống trực tuyến để đăng ký và quản lý NCKH không?", "Trắc nghiệm 1 lựa chọn", ["Rất sẵn sàng và mong muốn sử dụng", "Sẵn sàng", "Phân vân / Tùy thuộc vào độ dễ dùng", "Không sẵn sàng"], "Đo lường mức độ sẵn sàng ứng dụng"),
        ("Câu 13. Bạn mong muốn hệ thống mới hỗ trợ những chức năng nào sau đây?", "Hộp kiểm - Chọn nhiều đáp án", ["Đăng nhập một chạm PTIT Slink SSO bằng tài khoản Microsoft Outlook (miền Bắc) / Google Gmail (miền Nam)", "Tự động nhận diện vai trò sinh viên/giảng viên và đồng bộ thông tin cá nhân", "Đăng ký đề tài trực tuyến, tự động kiểm tra quy định hợp lệ", "Mời thành viên nhóm và mời GVHD xác nhận điện tử", "Nộp và quản lý Đề cương (Mẫu 2), Báo cáo tổng kết (Mẫu 3.1-3.4) trực tuyến", "Theo dõi tiến độ trực quan bằng sơ đồ mốc (Milestones / Gantt chart)", "Xem lịch nghiệm thu, danh sách Hội đồng và nhận kết quả chấm điểm online", "Tải Giấy chứng nhận NCKH điện tử có mã QR xác thực", "Thư viện số tra cứu toàn văn các đề tài NCKH đạt giải các năm trước", "Tự động trích xuất danh sách cộng điểm học bổng theo QĐ 521"], "Khảo sát nhu cầu chức năng cụ thể"),
        ("Câu 14. Đánh giá mức độ cần thiết của từng chức năng trên thang điểm từ 1 đến 5", "Lưới trắc nghiệm (1: Rất không cần thiết -> 5: Rất cần thiết)", ["Đăng ký đề tài & Duyệt GVHD trực tuyến", "Nộp & Quản lý Đề cương Mẫu 2 trực tuyến", "Giám sát tiến độ theo mốc Milestones", "Nộp Báo cáo tổng kết & Sản phẩm số hóa", "Chấm điểm & Xem kết quả nghiệm thu online", "Thư viện số tra cứu công trình NCKH khóa trước", "Tự động xuất biểu mẫu (Mẫu 1 -> Mẫu 5)", "Cấp Giấy chứng nhận điện tử & Điểm thưởng HB"], "Đo lường mức độ ưu tiên chức năng"),
        ("Câu 15. Bạn mong muốn nhận thông báo từ hệ thống qua những kênh nào?", "Hộp kiểm - Chọn nhiều đáp án", ["Thông báo trên Web hệ thống (In-app notification)", "Email tự động gửi về hòm thư sinh viên", "Tin nhắn Zalo thông báo (Zalo ZNS)", "Thông báo đẩy qua Ứng dụng di động (Mobile App)", "Tin nhắn SMS Brandname"], "Xác định kênh thông báo ưu tiên"),
        ("Câu 16. Bạn có đề xuất hoặc góp ý nào khác để hệ thống hoạt động hiệu quả hơn?", "Câu hỏi mở (Đoạn văn)", ["Nhập ý kiến đóng góp của bạn tại đây..."], "Thu thập ý kiến đóng góp sáng tạo")
    ]

    for q_title, q_type, q_opts, q_target in survey_questions:
        add_h3(doc, q_title)
        add_p(doc, f"Hình thức câu hỏi: {q_type} | Mục đích phân tích: {q_target}", italic=True, size=10.5, color=(0x55, 0x55, 0x55))
        for opt in q_opts:
            add_bullet(doc, "", f"☐ {opt}", level=1)

    add_h2(doc, "2.4. BỘ PHIẾU ĐIỀU TRA SỐ 02: KHẢO SÁT GIẢNG VIÊN HƯỚNG DẪN & CÁN BỘ QUẢN LÝ (10 CÂU HỎI)")
    lecturer_questions = [
        ("Câu 1. Quý Thầy/Cô hiện đang công tác tại Khoa / Viện / Đơn vị nào?", "Trắc nghiệm / Trả lời ngắn"),
        ("Câu 2. Học hàm, học vị hiện tại của Quý Thầy/Cô?", "Trắc nghiệm (GS, PGS, TS, ThS, Khác)"),
        ("Câu 3. Trung bình mỗi năm học, Quý Thầy/Cô hướng dẫn bao nhiêu đề tài NCKH sinh viên?", "Trắc nghiệm (1 đề tài, 2 đề tài, >2 đề tài, Chưa từng hướng dẫn)"),
        ("Câu 4. Khó khăn lớn nhất của Thầy/Cô khi quản lý và hướng dẫn sinh viên làm NCKH hiện nay là gì?", "Hộp kiểm (Theo dõi tiến độ nhóm; Sinh viên nộp báo cáo sát hạn; Biểu mẫu giấy tờ nhiều khâu; Quản lý minh chứng bài báo; Khó kiểm tra trùng lặp)"),
        ("Câu 5. Thầy/Cô đánh giá thế nào về quy trình xét duyệt đề cương và tổ chức hội đồng nghiệm thu thủ công hiện nay?", "Thang đo 5 mức (1 - Rất rườm rà đến 5 - Rất thuận tiện)"),
        ("Câu 6. Thầy/Cô có mong muốn sử dụng tính năng Chấm điểm nghiệm thu trực tuyến trên máy tính/máy tính bảng theo Phiếu Mẫu 4.1 không?", "Trắc nghiệm (Rất mong muốn, Mong muốn, Bình thường, Không mong muốn)"),
        ("Câu 7. Thầy/Cô đánh giá mức độ cần thiết của tính năng tự động ghi nhận và quy đổi giờ chuẩn NCKH sau khi nghiệm thu đề tài?", "Thang đo 5 mức (1 - Rất không cần thiết đến 5 - Rất cần thiết)"),
        ("Câu 8. Thầy/Cô mong muốn hệ thống cung cấp những công cụ hỗ trợ nào cho công tác quản lý chuyên môn?", "Hộp kiểm (Kho lưu trữ đề tài lịch sử; Công cụ kiểm tra đạo văn; Tự động xuất biểu mẫu Mẫu 1 đến Mẫu 5; Quản lý hạn mức hướng dẫn)"),
        ("Câu 9. Kênh nhận thông báo về lịch họp Hội đồng và nhắc hạn duyệt đề cương Thầy/Cô ưu tiên?", "Hộp kiểm (Email công vụ, Thông báo trên hệ thống, Tin nhắn Zalo/SMS)"),
        ("Câu 10. Đóng góp ý kiến chuyên môn của Quý Thầy/Cô cho việc thiết kế hệ thống SRMS?", "Câu hỏi mở")
    ]

    for q_title, q_type in lecturer_questions:
        add_h3(doc, q_title)
        add_p(doc, f"Loại câu hỏi: {q_type}", italic=True, size=10.5, color=(0x55, 0x55, 0x55))

    # PHẦN 3: TỔNG HỢP VÀ KẾT LUẬN
    add_h1(doc, "PHẦN III. TỔNG HỢP KẾT QUẢ VÀ ĐỀ XUẤT YÊU CẦU HỆ THỐNG (CROSS-VALIDATION)")
    
    add_h2(doc, "3.1. Bảng đối chiếu chéo (Cross-validation) giữa Tài liệu quy định (QĐ 521, QĐ 169) và Thực tế nghiệp vụ")
    headers_cross = ["Quy định trong Tài liệu (QĐ 521 & QĐ 169)", "Thực tế nghiệp vụ ghi nhận", "Vấn đề phát hiện", "Giải pháp đáp ứng trên Hệ thống SRMS"]
    data_cross = [
        ["Quy định nộp Mẫu 1 trong tháng 9, nộp hồ sơ nghiệm thu trước 10/4", "Sinh viên và giảng viên thường bị động, dễ trễ hạn nộp do thiếu kênh nhắc việc tự động tập trung", "Thiếu kênh thông báo nhắc nhở tập trung", "Xây dựng Module Lịch trình & Tự động gửi thông báo nhắc hạn trước 7, 3, 1 ngày"],
        ["Định mức kinh phí đề tài từ 7 - 10 triệu VNĐ/đề tài (QĐ 169/2026)", "Sinh viên gặp nhiều lúng túng khi tự lập dự toán và làm thủ tục thanh quyết toán kinh phí bằng hóa đơn giấy", "Thủ tục giấy tờ chứng từ thanh toán phức tạp", "Tích hợp biểu mẫu dự toán chuẩn và quản lý hồ sơ quyết toán trực tuyến"],
        ["Mỗi đề tài tối đa 5 SV, mỗi SV chỉ tham gia 1 đề tài/năm (Điều 15)", "Khâu kiểm tra điều kiện sinh viên (không làm 2 đề tài/năm) thực hiện thủ công bằng mắt rất dễ sót lọt", "Khâu kiểm tra điều kiện thủ công rất mất thời gian", "Cài đặt Hard-constraint: Hệ thống tự động chặn đăng ký trùng SV trong 1 năm học"],
        ["Mỗi GV hướng dẫn tối đa 2 đề tài SV trong cùng thời gian (Điều 16)", "Khoa khó kiểm soát tải hướng dẫn thực tế của GV trên phạm vi toàn viện, dễ dẫn đến quá tải", "Nguy cơ một số GV bị quá tải hướng dẫn", "Hệ thống tự động đếm số đề tài GV đang nhận và cảnh báo khi đạt ngưỡng max = 2"],
        ["Hội đồng chấm điểm thang 100 với 7 tiêu chí theo Mẫu 4.1 (Điều 10)", "Hội đồng chấm điểm trên giấy mất nhiều thời gian tính ĐTB và dễ phát sinh sai sót khi tính toán", "Tổng hợp kết quả nghiệm thu chậm trễ", "Xây dựng giao diện Phiếu chấm điểm Online Mẫu 4.1, tự động tính ĐTB và xếp loại 5 mức"],
        ["Lưu giữ và phổ biến kết quả NCKH trên trang thông tin (Điều 14)", "Sinh viên khóa sau rất khó tiếp cận và tra cứu các đề tài khóa trước để kế thừa học thuật", "Lãng phí kho tri thức khoa học đã nghiệm thu", "Xây dựng Thư viện số NCKH SV cho phép tra cứu toàn văn theo ngành/từ khóa"]
    ]
    add_styled_table(doc, headers_cross, data_cross, [1.5, 1.4, 1.4, 2.0])

    add_h2(doc, "3.2. Đề xuất Danh mục Yêu cầu Chức năng sơ bộ cho Hệ thống SRMS")
    add_bullet(doc, "Phân hệ 1 - Xác thực PTIT Slink SSO & Gán Role tự động theo định danh (Auto Role Provisioning)", "Đăng nhập một chạm qua PTIT Slink SSO (Microsoft Outlook @ptit.edu.vn, @stu.ptit.edu.vn cho miền Bắc và Google Gmail cho miền Nam). Hệ thống tự động giải mã Claims từ ID Token để gán sẵn Role tương ứng (Sinh viên, GVHD, Thư ký Khoa, Hội đồng KH, P.QLKHCN) và đồng bộ thông tin hồ sơ mà không cần tạo tài khoản hay phân quyền thủ công.")
    add_bullet(doc, "Phân hệ 2 - Đăng ký Đề tài & Quản lý Nhóm", "Đăng ký trực tuyến, kiểm tra ràng buộc QĐ 521, ghép nối GVHD, quản lý dự toán kinh phí 7 - 10 triệu VNĐ, nộp và duyệt Đề cương chi tiết Mẫu 2.")
    add_bullet(doc, "Phân hệ 3 - Quản lý Xét duyệt & Ban hành Quyết định", "Hội đồng Khoa họp duyệt Mẫu 1, P.QLKHCN tổng hợp và cập nhật Quyết định giao đề tài kèm kinh phí của Giám đốc Học viện.")
    add_bullet(doc, "Phân hệ 4 - Quản lý & Giám sát Tiến độ (Milestones)", "Thiết lập mốc tiến độ (tháng 11, 1, 3), nộp báo cáo mốc, GVHD chấm tiến độ, nhập Biên bản hội thảo chuyên đề Mẫu 3.5.")
    add_bullet(doc, "Phân hệ 5 - Nghiệm thu & Chấm điểm Online", "Nộp Báo cáo tổng kết Mẫu 3.1-3.4, bài báo, mã nguồn; Chấm điểm Online Phiếu Mẫu 4.1, tự động sinh Biên bản Mẫu 4.2 và Bảng tổng hợp Mẫu 4.3.")
    add_bullet(doc, "Phân hệ 6 - Khen thưởng, Giấy chứng nhận & Thi cấp Bộ", "Tự động cấp Giấy chứng nhận NCKH điện tử có mã QR; xuất danh sách cộng điểm học bổng cho P.CTSV; lập danh mục Mẫu 5 thi cấp Bộ trước 30/6.")
    add_bullet(doc, "Phân hệ 7 - Thư viện số & Báo cáo Thống kê", "Tra cứu toàn văn công trình NCKH đã nghiệm thu; tự động xuất 100% biểu mẫu chuẩn QĐ 521 (Mẫu 1 -> Mẫu 5) sang file Word/PDF.")
    add_bullet(doc, "Phân hệ 8 - Notification Engine", "Gửi thông báo nhắc hạn tự động đa kênh qua Web In-App, Email sinh viên và Zalo/SMS.")

    add_h2(doc, "3.3. Kết luận")
    add_p(doc, "Việc chuyển đổi từ quy trình giấy tờ thủ công sang Hệ thống Thông tin Quản lý Đề tài NCKH Sinh viên (SRMS) là xu thế tất yếu trong công cuộc chuyển đổi số giáo dục đại học. Sự kết hợp chặt chẽ giữa phương pháp Nghiên cứu tài liệu (QĐ 521/QĐ-HV & QĐ 169/QĐ-HV) và phương pháp Phiếu điều tra khảo sát đã cung cấp cơ sở khoa học và thực tiễn vững chắc để nhóm tiến hành các bước Phân tích & Thiết kế hệ thống tiếp theo.")

    # Save to single target file
    target_file = "Phương pháp nghiên cứu tài liệu về hệ thống.docx"
    doc.save(target_file)
    print("BTL Report saved successfully to: Phuong phap nghien cuu tai lieu ve he thong.docx")

if __name__ == "__main__":
    generate_paperless_btl_report()
