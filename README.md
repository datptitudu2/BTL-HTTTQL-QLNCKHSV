# HỆ THỐNG THÔNG TIN QUẢN LÝ ĐỀ TÀI NCKH SINH VIÊN PTIT (SRMS)
> **Hệ thống chuyên đề BTL HTTTQL** — Phân hệ Quản lý Vòng đời Đề tài Nghiên cứu Khoa học Sinh viên tích hợp Cổng thông tin đào tạo **PTIT S-Link**.  
> Chuẩn hóa theo quy định tại **Quyết định số 521/QĐ-HV** ngày 20/04/2023 của Giám đốc Học viện Công nghệ Bưu chính Viễn thông.

---

## 📌 1. Giới thiệu tổng quan
Hệ thống SRMS (Student Research Management System) số hóa toàn diện chu trình vòng đời đề tài NCKH sinh viên từ khâu đăng ký ý tưởng, phê duyệt cấp Khoa/Học viện, theo dõi tiến độ sinh hoạt học thuật, tổ chức Hội đồng nghiệm thu chấm điểm 7 tiêu chí đến thanh quyết toán kinh phí và xét duyệt cộng Điểm rèn luyện.

### 🌟 Tính năng cốt lõi:
- **Đầy đủ 9 Vai trò nghiệp vụ:** Sinh viên, Giảng viên hướng dẫn, Thư ký Khoa, Lãnh đạo Khoa, Phòng QLKH&CN, Ban Giám đốc Học viện, Phòng TCKT, Phòng CT&CTSV, Quản trị viên.
- **Tuân thủ QĐ 521/QĐ-HV:** Tự động sinh và số hóa các biểu mẫu Mẫu 1 (Đề xuất Khoa), Mẫu 2 (Thuyết minh đề cương), Mẫu 3.1 - 3.5 (Tiến độ & Sinh hoạt KH), Mẫu 4.1 - 4.4 (Nghiệm thu, chấm điểm loại trừ sai lệch > 15đ, cấp Giấy chứng nhận số có mã xác thực).
- **Chuẩn giao diện PTIT S-Link:** Thiết kế đồng bộ nhận diện thương hiệu PTIT (Tone đỏ đô `#C62828`, layout S-Link, Responsive, Dark/Light mode).

---

## 🛠️ 2. Công nghệ sử dụng (Tech Stack)
- **Monorepo:** [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/)
- **Frontend (`apps/web`):** React 18, TypeScript, Vite, Ant Design v5, React Router v6, Axios
- **Backend (`apps/api`):** NestJS 10, TypeScript, Prisma ORM, JWT, Passport, Socket.io
- **Cơ sở dữ liệu:** PostgreSQL 16 (34 bảng chuẩn hóa mô hình ERD Kho D1 - D9)
- **Cache & Message Queue:** Redis 7 Alpine
- **Email Testing:** MailHog

---

## 🚀 3. Hướng dẫn cài đặt & Khởi chạy nhanh (Quick Start)

### Điều kiện tiên quyết:
- Đã cài đặt [Node.js](https://nodejs.org/) (khuyến nghị phiên bản v18 hoặc v20)
- Đã cài đặt [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)
- Đã cài đặt & bật [Docker Desktop](https://www.docker.com/)

---

### Bước 1: Cài đặt Dependencies
Mở terminal tại thư mục gốc của dự án:
```bash
pnpm install
```

### Bước 2: Khởi động Cơ sở dữ liệu với Docker
Chạy stack PostgreSQL, Redis và MailHog:
```bash
docker compose up -d
```
*(Kiểm tra container `srms-postgres`, `srms-redis`, `srms-mailhog` đã ở trạng thái Running).*

### Bước 3: Cấu hình biến môi trường
Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```
*(File `.env` mặc định đã được cấu hình khớp 100% với Docker Compose).*

### Bước 4: Đồng bộ Schema & Đổ dữ liệu mẫu (Seed)
Đồng bộ bảng CSDL vào PostgreSQL và nạp dữ liệu mẫu:
```bash
pnpm --filter @srms/api exec prisma db push --schema=../../prisma/schema.prisma
pnpm prisma:seed
```

### Bước 5: Chạy toàn bộ ứng dụng
Khởi động đồng thời cả Frontend và Backend:
```bash
pnpm dev
```

Sau khi khởi chạy thành công:
- 🌐 **Ứng dụng Web (Frontend):** [http://localhost:3000](http://localhost:3000)
- 🔌 **API Server (Backend):** [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- ✉️ **Hòm thư ảo MailHog Web UI:** [http://localhost:8025](http://localhost:8025)

---

## 🔑 4. Danh sách tài khoản thử nghiệm (9 Vai trò)
> **Mật khẩu mặc định cho tất cả tài khoản:** `ptit@123`  
> *(Tại trang `/login` có sẵn khu vực "Chọn tài khoản nhanh" để đăng nhập một chạm).*

| STT | Vai trò | Họ và tên | Tên đăng nhập | Email |
|:---:|:---|:---|:---:|:---|
| 1 | **Sinh viên nghiên cứu** | Nguyễn Văn An | `an.nv` (hoặc `sv001`) | an.nv@stu.ptit.edu.vn |
| 2 | **GVHD - Khoa CNTT 1** | TS. Ngô Quốc Dũng | `dungnq` (hoặc `gv001`) | dungnq@ptit.edu.vn |
| 3 | **GVHD - Khoa ĐPT** | TS. Trần Đình Trí | `tritd` (hoặc `gv002`) | tritd@ptit.edu.vn |
| 4 | **GVHD - Khoa QTKD 1** | TS. Đinh Quang Huy | `huydq` (hoặc `gv003`) | huydq@ptit.edu.vn |
| 5 | **GVHD - Khoa ATTT** | TS. Nguyễn Văn Tuấn | `tuannv` (hoặc `gv004`) | tuannv@ptit.edu.vn |
| 6 | **Thư ký Khoa CNTT 1** | ThS. Nguyễn Thị Lan | `thukycntt1` (hoặc `tk001`) | lannt@ptit.edu.vn |
| 7 | **Trưởng Khoa CNTT 1** | PGS.TS. Trần Đình Quế | `khoacntt1` (hoặc `lead001`) | quetd@ptit.edu.vn |
| 8 | **Chuyên viên P.QLKH&CN** | ThS. Phạm Văn Hùng | `qlkhcn` (hoặc `qlkh001`) | qlkhcn@ptit.edu.vn |
| 9 | **Ban Giám đốc Học viện** | PGS.TS. Đặng Hoài Bắc | `bgiangdoc` (hoặc `bgd001`) | bacdh@ptit.edu.vn |
| 10 | **Phòng Tài chính - Kế toán** | CN. Lê Thị Mai | `tckt` (hoặc `tckt001`) | tckt@ptit.edu.vn |
| 11 | **Phòng CT&CTSV** | ThS. Bùi Văn Toàn | `ctsv` (hoặc `ctsv001`) | ctsv@ptit.edu.vn |
| 12 | **Quản trị viên hệ thống** | Ban Quản trị SRMS | `admin` | admin@ptit.edu.vn |

---

## 📁 5. Cấu trúc thư mục Monorepo

```plaintext
he_thong_thong_tin_quan_ly/
├── apps/
│   ├── api/                   # Backend NestJS (REST API, JWT, Guards, WebSocket)
│   │   ├── src/
│   │   │   ├── modules/       # Các module: auth, projects, schedule, notifications, ...
│   │   │   └── prisma/        # Prisma Service
│   └── web/                   # Frontend React (S-Link UI)
│       └── src/
│           ├── components/    # Biểu mẫu QĐ 521, Giấy chứng nhận, Layout, Chatbot
│           ├── context/       # AuthContext phân quyền 9 vai trò
│           ├── pages/         # 12 trang nghiệp vụ SRMS
│           └── services/      # Axios API client, Notification & Schedule Services
├── packages/
│   └── shared/                # DTO, Type definitions dùng chung Web & API
├── prisma/
│   ├── schema.prisma          # Thiết kế CSDL 34 bảng chuẩn ERD (D1 - D9)
│   └── seed.ts                # Dữ liệu khởi tạo chuẩn hóa (Đề tài, Hội đồng, ...)
├── docker-compose.yml         # Container Postgres 16, Redis 7, MailHog
├── package.json               # Monorepo workspaces config
└── turbo.json                 # Cấu hình Turborepo pipeline build & dev
```

---

## 📜 6. Kịch bản kiểm thử quy trình nghiệp vụ (Workflow)
1. **Sinh viên (`an.nv`):** Đăng ký đề tài mới, xem phân bổ thành viên nhóm, nộp Thuyết minh Đề cương (Mẫu 2).
2. **GVHD (`dungnq`):** Vào tab *Đề tài của tôi* xem danh sách hướng dẫn, thẩm định duyệt Đề cương chi tiết.
3. **Thư ký Khoa (`thukycntt1`):** Lập hồ sơ đề xuất Mẫu 1 cấp Khoa, phát hành Thư mời tham dự Sinh hoạt KH (Mẫu 3.5).
4. **Trưởng Khoa (`khoacntt1`):** Phê duyệt đề cương, ký số Biên bản sinh hoạt KH Mẫu 3.5.
5. **Phòng QLKH&CN (`qlkhcn`):** Thẩm định danh mục đề tài toàn Học viện, thành lập Hội đồng nghiệm thu.
6. **Hội đồng nghiệm thu (`/acceptance`):** Chấm điểm 7 tiêu chí trực tuyến, hệ thống tự động chạy thuật toán loại trừ điểm lệch > 15đ, xuất Biên bản Mẫu 4.2.
7. **Phòng CT&CTSV (`ctsv`):** Đối soát kết quả nghiệm thu, tự động cộng Điểm rèn luyện (+10đ, +8đ, +6đ) và cấp Chứng nhận số A4.
8. **Phòng TCKT (`tckt`):** Duyệt hồ sơ thanh quyết toán kinh phí đề tài.
