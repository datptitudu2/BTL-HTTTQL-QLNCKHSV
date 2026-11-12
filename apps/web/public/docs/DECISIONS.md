# NHẬT KÝ QUYẾT ĐỊNH KIẾN TRÚC & NGHIỆP VỤ (DECISIONS.MD) - SRMS PTIT

Tài liệu này ghi nhận các quyết định kỹ thuật, quy tắc nghiệp vụ và các điểm cần làm rõ/chốt theo thứ tự ưu tiên:
`QĐ 521/QĐ-HV > ERD tab 2 (Lược đồ CSDL) > DFD mức 1 > BFD > plan.md`.

---

## 1. Quyết định Kiến trúc & Công nghệ (Tech Stack)
- **Kiến trúc Monorepo:** Sử dụng `pnpm workspaces` + `Turborepo` để quản lý `apps/web` (Frontend), `apps/api` (Backend NestJS), `packages/shared` (Zod schemas, enums, DTOs chung).
- **Frontend Stack:** React 18, TypeScript, Vite, Ant Design 5 + `@ant-design/pro-components` (ProLayout, ProTable, ProForm), TanStack Query v5, Dayjs.
  - **Bảng màu giao diện:** Chuẩn đỏ - trắng S-Link PTIT:
    - Primary Color: `#C62828`
    - Primary Hover: `#D32F2F`
    - Background: `#F7F7F8` / Card: `#FFFFFF`
    - Error: `#D4380D` (cam đỏ, tách biệt màu nhấn để tránh thao tác nhầm)
- **Backend Stack:** Node.js 20+, NestJS 10, Prisma ORM, OpenAPI (Swagger), BullMQ + Redis cho hàng đợi xử lý nền và tác vụ nhắc hạn (`@nestjs/schedule`).
- **Database:** PostgreSQL (Supabase / local Postgres qua Docker Compose), hỗ trợ `pg_trgm`, `unaccent`.
- **Cơ chế xác thực (Auth):** Thiết kế mẫu `AuthProvider` (hiện tại triển khai `LocalAuthProvider` dùng Email/Password băm `argon2id` + JWT + HTTP-only Cookie; chuẩn bị sẵn interface `OidcAuthProvider` để cắm SSO PTIT Slink sau).

---

## 2. Quy tắc Nghiệp vụ Cốt lõi & Ràng buộc CSDL (QĐ 521/QĐ-HV)
1. **Mã số đề tài:** Định dạng chuẩn `SV-YYYY-KHOA-XXX`, sinh tự động qua `project_code_counters`.
2. **Định mức GVHD:** Mỗi đề tài có đúng 1 GVHD hiện hành (`status = 'ACTIVE'`); mỗi GV tối đa hướng dẫn 2 đề tài cùng lúc trong năm học (kiểm tra bằng partial unique index + trigger).
3. **Quy mô nhóm:** Tối đa 5 sinh viên / 1 đề tài; đúng 1 chủ nhiệm (`member_role = 'LEAD'`); mỗi SV chỉ tham gia 1 đề tài / năm học.
4. **Phê duyệt đề cương:** Đề cương chi tiết (Mẫu 2) chỉ được duyệt sau khi có Quyết định giao đề tài; GVHD duyệt trước, Lãnh đạo Khoa duyệt sau (hỗ trợ hình thức Trực tiếp hoặc Ký thay).
5. **Thang điểm nghiệm thu:** Chấm độc lập thang 100 theo 7 tiêu chí Mẫu 4.1. Điểm của ủy viên lệch > 15 điểm so với điểm trung bình ban đầu sẽ bị loại khỏi tính toán điểm cuối (theo Ghi chú Mẫu 4.2).
6. **Xếp loại:** $\ge 90$: Xuất sắc; $80 \le \text{Điểm} < 90$: Tốt; $70 \le \text{Điểm} < 80$: Khá; $50 \le \text{Điểm} < 70$: Đạt; $< 50$: Không đạt.
7. **Cấp Giấy chứng nhận:** Chỉ cấp GCN cho đề tài xếp loại từ Khá trở lên.
8. **Quyết toán kinh phí:** Chỉ thực hiện khi có kết luận nghiệm thu đạt từ Hội đồng.

---

## 3. Nhật ký Sprint Thực thi
- **Sprint 0: Nền tảng (Foundation):**
  - Đồng bộ hoá 4 tài liệu sơ đồ chuẩn v4 mới nhất được cung cấp: `SRMS_DFD_muc0_v4.pdf`, `SRMS_BFD_v4.pdf`, `SRMS_ERD_v2.pdf`, `SRMS_DFD_muc1_v4.pdf`.
  - Thiết lập cấu trúc Monorepo (`pnpm-workspace.yaml`, `turbo.json`, `packages/shared`, `apps/api`, `apps/web`, `prisma/`, `docker-compose.yml`).
  - Thiết lập Schema Prisma 34 bảng nghiệp vụ (D1-D9) + 7 bảng kỹ thuật (`audit_logs`, `project_code_counters`, `user_credentials`, `system_settings`, `notification_templates`, `refresh_tokens`, `password_reset_tokens`).
  - Dựng giao diện S-Link PTIT chuẩn thực tế bám sát 100% 4 ảnh mẫu:
    - Trang Đăng nhập SSO 2 cột: Cột trái kiến trúc toà nhà PTIT line-art nền gradient đỏ burgundy `#8E0000`, Cột phải 2 nút SSO PTIT Microsoft Outlook & Google Gmail kèm Quick Role Demo Switcher 9 vai trò.
    - Trang Danh sách Đề tài Kê khai KHCN (`ProjectsPage`): Header có logo S-Link, badge thông báo 99+, avatar tròn "Đ" Nguyễn Tiến Đạt, menu dọc DASHBOARD & HỌC TẬP, thanh công cụ lọc với nút đỏ nổi bật `[Xuất dữ liệu]`, ProTable với thẻ trạng thái bo tròn.
    - Trang Chi tiết Đề tài (`ProjectDetailPage`): Card banner hồng nhạt `#FDEEE9` chia 3 cột (Mã đề tài, Kỳ học, GVHD), tabs phân hệ đầy đủ, cột phải danh sách sinh viên nghiên cứu kèm avatar và vai trò, hỗ trợ nộp đề cương Mẫu 2, thành lập hội đồng D6 và chấm điểm phiếu Mẫu 4.1.


