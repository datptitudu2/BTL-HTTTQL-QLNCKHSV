SRMS – Kế hoạch thiết kế và triển khai web quản lý đề tài NCKH sinh viên PTIT
1. Tổng quan và đầu vào
Mục tiêu: xây web SRMS quản lý đề tài NCKH sinh viên cấp Học viện PTIT, bám đúng bộ tài liệu đã chốt: ERD v10 (34 bảng), DFD mức 0 và mức 1 (8 phân hệ, 41 tiến trình), BFD v10 và QĐ 521/QĐ-HV. Giao diện lấy mẫu từ S-Link (Ant Design).
Tài liệu
Dùng để
SRMS_ERD_v10, tab 2 (Lược đồ CSDL)
Nguồn duy nhất cho schema CSDL: bảng, cột, kiểu, khóa ngoại
SRMS_DFD_muc1_v10
Luồng nghiệp vụ từng tiến trình: ai làm, đọc/ghi bảng nào, đầu vào/ra. Sinh API, quyền, màn hình
SRMS_DFD_muc0_v10
Ranh giới 8 phân hệ và tác nhân ngoài (người dùng, hệ thống ngoài)
SRMS_BFD_v10
Danh sách module và tính năng; cấp 3 là use case để chia việc
QĐ 521/QĐ-HV và Mẫu 1 đến 5
Quy tắc nghiệp vụ, thang điểm, thời hạn, biểu mẫu cần xuất
Ảnh S-Link (3 ảnh)
Mẫu giao diện: menu trái, bảng có bộ lọc, thẻ trạng thái
Thứ tự ưu tiên khi các tài liệu mâu thuẫn: QĐ 521 > ERD tab 2 > DFD mức 1 > BFD > tài liệu này. Agent code phải báo lại chỗ mâu thuẫn, không tự chọn.
Trong phạm vi (MVP): cả 8 phân hệ: tài khoản và đợt NCKH, đăng ký và nhóm, xét duyệt, giám sát tiến độ, nghiệm thu và chấm điểm, khen thưởng và quyết toán, thư viện số và thống kê, thông báo và nhắc việc.
Ngoài phạm vi (làm sau hoặc nối qua giao diện giả): đăng nhập SSO PTIT Slink (làm sau, qua giao diện AuthProvider), kiểm tra đạo văn chuyên nghiệp (làm bằng giao diện kết nối, chạy giả lập), gửi SMS/Zalo OA thật, ứng dụng di động, thanh toán thật.
Quy mô giả định (cần xác nhận): vài trăm đề tài mỗi năm toàn Học viện, vài nghìn tài khoản, khoảng 9 vai trò. Một triển khai (1 server) là đủ.
2. Techstack khuyến nghị
Chọn React + Ant Design ở frontend, NestJS ở backend, PostgreSQL chạy trên Supabase ở dữ liệu. Supabase chỉ dùng làm Postgres và kho file có quản lý; toàn bộ nghiệp vụ nằm ở NestJS vì hệ thống có nhiều quy tắc duyệt, ràng buộc và biểu mẫu mà viết ở tầng ứng dụng dễ kiểm thử hơn.
Lớp
Lựa chọn
Lý do chính
Frontend
React 18, TypeScript, Vite
Nhanh, hệ sinh thái Ant Design đầy đủ
UI
Ant Design 5 và @ant-design/pro-components (ProLayout, ProTable, ProForm)
Cùng bộ với S-Link, có sẵn bảng lọc/phân trang giống mẫu
Dữ liệu phía client
TanStack Query, React Router 6, dayjs
Cache, phân trang, refetch sau khi duyệt
Biểu đồ
@ant-design/charts
Thống kê theo năm học, theo Khoa
Backend
Node.js 20, NestJS 10, TypeScript
Module hóa khớp 8 phân hệ BFD, guard cho phân quyền, cron cho nhắc hạn
ORM và migration
Prisma
Sinh kiểu từ schema, migration có lịch sử
Kiểm tra dữ liệu
zod dùng chung (packages/shared)
Một schema cho cả form và API
Tài liệu API
OpenAPI (Swagger) và orval
Sinh client TypeScript cho frontend
CSDL
PostgreSQL 15 trên Supabase
Quản lý sao lưu, có extension pg_trgm, unaccent
File
Supabase Storage (S3 API), bucket riêng, link ký tạm
Báo cáo, đề cương, chứng từ, biên bản
Hàng đợi, lịch
BullMQ và Redis, @nestjs/schedule
Gửi thông báo, xuất file nặng, nhắc hạn
Xác thực
Email và mật khẩu (Passport local, băm argon2id) qua giao diện AuthProvider; SSO PTIT (OIDC) cắm thêm sau
Làm được ngay, không phụ thuộc Trung tâm CNTT; đổi sang SSO chỉ là bật nhà cung cấp mới
Xuất biểu mẫu
docxtemplater (Word), Gotenberg hoặc LibreOffice headless (PDF)
Mẫu 1 đến 5 là file Word có chỗ điền
Thông báo
Nodemailer (email), SSE (in-app), giao diện adapter cho SMS/Zalo OA
Làm email và in-app thật, kênh còn lại cắm sau
Kiểm thử
Jest và Supertest, Vitest, Playwright
Unit, tích hợp, end-to-end
Hạ tầng
pnpm workspaces và Turborepo, Docker Compose, GitHub Actions
Một repo, chạy được trên máy dev
Phương án thay thế đã cân nhắc
Phương án
Hợp khi
Vì sao không chọn làm chính
Supabase thuần (Auth, RLS, Edge Functions)
Cần ra bản thử rất nhanh, ít nghiệp vụ
Quy tắc duyệt nhiều bước, giờ chuẩn, xuất Word, nhắc hạn đều phải viết thành hàm SQL/Edge, khó test; SSO PTIT phải cấu hình OIDC tùy biến
Next.js full-stack
Đội chỉ muốn một ứng dụng
Trộn giao diện với nghiệp vụ, khó tách khi hệ thống lớn lên
Nếu đội đã quen Python hoặc Java Spring thì thay NestJS và Prisma bằng FastAPI/SQLAlchemy hoặc Spring Boot/JPA; phần còn lại (Ant Design, PostgreSQL, thiết kế API) giữ nguyên.
3. Kiến trúc tổng thể
kiến trúc tổng thể · web, API, dữ liệu, hàng đợi, hệ thống ngoài
Web chỉ gọi API; API chạm CSDL, kho file và hàng đợi; Worker gửi tin và xuất biểu mẫu. Khung nét đứt là hệ thống ngoài.
Cấu trúc repo (pnpm workspaces và Turborepo)
Thư mục
Nội dung
apps/web
React và Ant Design: app/, layouts/, pages/<vai trò>/, features/<module>/, components/, api/ (client sinh từ OpenAPI), hooks/, theme/
apps/api
NestJS: modules/<module>/, common/ (guards, policies, filters, interceptors), điểm vào Worker dùng chung mã
packages/shared
Schema zod, enum, mã lỗi nghiệp vụ, hằng số dùng cho cả web và api
prisma/
schema.prisma sinh từ ERD tab 2, migration kèm SQL ràng buộc, seed.ts
templates/
Mẫu 1 đến 5 dạng .docx có chỗ điền
docs/
ERD, DFD, BFD, QĐ 521, ảnh S-Link, plan.md, DECISIONS.md
Module backend theo phân hệ BFD
Phân hệ BFD
Module NestJS
1. Tài khoản, đợt NCKH
auth, users, departments, positions, periods, criteria, milestones
2. Đăng ký đề tài, nhóm
projects, members, advisors
3. Xét duyệt, QĐ giao
screening, dossiers, decisions
4. Giám sát tiến độ
outlines, progress, seminars, change-requests
5. Nghiệm thu, chấm điểm
documents, councils, evaluation, acceptance
6. Khen thưởng, quyết toán
awards, certificates, lecturer-hours, student-bonus, budgets, settlements
7. Thư viện số, thống kê
library, stats, exports
8. Thông báo, nhắc việc
notifications, scheduler
Mỗi module có controller (nhận yêu cầu, kiểm tra quyền), service (nghiệp vụ, giao dịch), repository (Prisma) và policy (quyền theo ngữ cảnh). Service là nơi duy nhất đổi trạng thái đề tài.
4. Cơ sở dữ liệu
Schema PostgreSQL sinh thẳng từ tab 2 của ERD v10: 34 bảng, 49 khóa ngoại. Không đổi tên bảng hay cột nghiệp vụ; chỉ đổi kiểu cho hợp PostgreSQL và thêm vài bảng kỹ thuật (xem cuối mục).
Quy ước chuyển đổi
ERD (kiểu kiểu SQL Server)
PostgreSQL
INT (khóa tự tăng)
integer generated always as identity
VARCHAR(n), NVARCHAR(n)
varchar(n) (UTF-8 nên không cần N)
NTEXT
text
DATETIME
timestamptz (múi giờ Asia/Ho_Chi_Minh khi hiển thị)
DATE, DECIMAL(p,s)
date, numeric(p,s)
BIT
boolean
Tên bảng IN HOA (PROJECTS)
snake_case thường (projects), Prisma dùng @@map
34 bảng theo 9 kho dữ liệu
Kho
Bảng
Ghi chú triển khai
D1 (6)
ROLES, USERS, LECTURERS, DEPARTMENTS, STUDENTS, DEPT_POSITIONS
users.sso_username là tên đăng nhập duy nhất (hiện là email trường), mật khẩu ở bảng kỹ thuật user_credentials; dept_positions lưu Trưởng/Phó đơn vị, Thư ký, Chủ tịch HĐ kèm ngày bắt đầu và kết thúc
D2 (3)
NCKH_PERIODS, PERIOD_MILESTONES, EVALUATION_CRITERIA
Tiêu chí gắn theo đợt; sao chép bộ tiêu chí của đợt trước khi mở đợt mới
D3 (3)
PROJECTS, PROJECT_MEMBERS, PROJECT_ADVISORS
project_id là mã SV-YYYY-KHOA-XXX, cấp lúc khởi tạo đề tài
D4 (7)
OUTLINES, OUTLINE_APPROVALS, PROGRESS_REPORTS, SEMINARS, SEMINAR_MEMBERS, CHANGE_REQUESTS, REQUEST_APPROVALS
Mỗi lượt duyệt là một dòng, có người duyệt, vai trò, hình thức (Trực tiếp / Ký thay)
D5 (2)
FACULTY_DOSSIERS, DECISIONS
Hồ sơ Mẫu 1 cấp Khoa và QĐ giao đề tài
D6 (6)
COUNCILS, COUNCIL_MEMBERS, EVALUATION_SHEETS, SHEET_SCORES, ACCEPTANCES, PROJECT_DOCUMENTS
Điểm theo từng tiêu chí nằm ở SHEET_SCORES
D7 (2)
BUDGETS, SETTLEMENTS
Không lưu số đã chi: cộng từ SETTLEMENTS
D8 (4)
CERTIFICATES, LECTURER_HOURS, STUDENT_BONUS, AWARD_NOMINATIONS
LECTURER_HOURS gắn theo từng lần phân công GVHD
D9 (1)
NOTIFICATIONS
Kèm bảng mẫu thông báo (kỹ thuật)
Ràng buộc đưa xuống cơ sở dữ liệu (đặt ở DB để không bị bỏ sót khi viết thêm API):
Mỗi đề tài đúng một GVHD hiện hành: unique index một phần trên project_advisors(project_id) khi status = 'ACTIVE'.
Mỗi giảng viên tối đa 2 đề tài đang hướng dẫn: trigger kiểm tra khi thêm dòng ACTIVE, khóa dòng lecturers để tránh hai yêu cầu cùng lúc.
Mỗi đề tài tối đa 5 sinh viên và đúng 1 chủ nhiệm: trigger đếm; unique index một phần trên project_members(project_id) khi member_role = 'LEAD'.
Mỗi sinh viên chỉ 1 đề tài trong một đợt: trigger tra period_id qua projects.
Điểm không vượt điểm tối đa của tiêu chí: trigger trên sheet_scores; tổng điểm tối đa của bộ tiêu chí nghiệm thu phải bằng 100 khi kích hoạt đợt.
Hội đồng có đúng 1 Chủ tịch và 1 Thư ký: unique index một phần trên council_members.
Giấy chứng nhận chỉ cấp khi xếp loại từ Khá trở lên; mỗi (đề tài, người nhận) một giấy.
acceptances.project_id và budgets.project_id là unique (đã có trong ERD).
Giá trị liệt kê (enum) lưu bằng varchar kèm CHECK để dễ thêm giá trị: trạng thái đề tài, loại mốc, loại đơn (Điều chỉnh, Gia hạn, Hủy, Đổi GVHD), vai trò duyệt, kết quả duyệt (Duyệt, Yêu cầu sửa, Từ chối), xếp loại (Xuất sắc, Tốt, Khá, Đạt, Không đạt), kênh thông báo (Web, Email, SMS, Zalo).
Bảng kỹ thuật thêm ngoài ERD (không đổi nghiệp vụ): audit_logs (ai làm gì, lúc nào), project_code_counters (số thứ tự mã đề tài theo năm và Khoa), system_settings (hệ số quy đổi giờ NCKH, số ngày nhắc hạn mặc định, hạn mức theo QĐ), notification_templates, refresh_tokens, user_credentials (mật khẩu đã băm, số lần sai, khóa tạm), password_reset_tokens.
Chỉ mục: mọi khóa ngoại; (status, period_id) trên projects; pg_trgm trên tên đề tài và từ khóa để cảnh báo trùng đề tài; chỉ mục tìm kiếm toàn văn có unaccent cho thư viện số.
Dữ liệu khởi tạo (seed): 9 vai trò, Khoa/Viện thật, một đợt mẫu với 7 tiêu chí Mẫu 4.1 (10, 15, 15, 35, 15, 5, 5), 3 mốc tiến độ (tháng 11, 1, 3) và tài khoản mẫu cho mỗi vai trò.
Truy cập dữ liệu: chỉ qua NestJS bằng khóa service của Supabase; khóa này không bao giờ xuống trình duyệt. Bật RLS và từ chối mặc định cho quyền anon để phòng hờ.
5. Xác thực SSO và phân quyền
Giai đoạn đầu đăng nhập bằng email và mật khẩu do hệ thống quản lý. Việc xác thực nằm sau một giao diện AuthProvider, nên khi có SSO PTIT Slink (OIDC) chỉ cần bật nhà cung cấp mới, không đổi nghiệp vụ. Quyền gồm hai lớp: vai trò (RBAC) và điều kiện theo ngữ cảnh (người làm có thật sự thuộc đề tài, Khoa, hội đồng đó không).
Luồng đăng nhập hiện tại (tiến trình DFD 1.1)
Quản trị hoặc P.QLKHCN tạo tài khoản, từng người hoặc nhập CSV (mã, họ tên, email, Khoa, lớp, vai trò). Hệ thống tạo users cùng students hoặc lecturers, rồi gửi email mời đặt mật khẩu (link dùng một lần, hết hạn sau 24 giờ).
Người dùng đăng nhập bằng email và mật khẩu. Mật khẩu băm argon2id, tối thiểu 10 ký tự; lần đầu bắt buộc đổi mật khẩu.
Sai 5 lần thì khóa tạm 15 phút; giới hạn tần suất theo địa chỉ IP và theo tài khoản; thông báo lỗi chung ("Email hoặc mật khẩu không đúng"), không lộ email có tồn tại hay không.
Cấp access token JWT sống 15 phút (giữ trong bộ nhớ) và refresh token xoay vòng trong cookie httpOnly, Secure, SameSite=Lax, kèm chống CSRF cho điểm cuối làm mới.
Quên mật khẩu: gửi link đặt lại (dùng một lần, hiệu lực 30 phút); đổi mật khẩu thì thu hồi mọi phiên cũ.
Chuyển sang SSO PTIT sau này
AuthProvider có hai bản: LocalAuthProvider (dùng bây giờ) và OidcAuthProvider (làm khi có thông tin SSO). Tài khoản giữ nguyên mã người dùng; users.sso_username là tên định danh dùng cho cả hai cách (hiện là email trường). Các bước chuyển: xin client OIDC; bật OidcAuthProvider; liên kết tài khoản theo email; tắt đăng nhập mật khẩu cho sinh viên và giảng viên, giữ cho quản trị làm đường dự phòng.
Vai trò (bảng roles, 9 giá trị khởi tạo)
Mã
Vai trò
Ghi chú
STUDENT
Sinh viên
Chủ nhiệm hoặc thành viên đề tài là quyền theo ngữ cảnh
LECTURER
Giảng viên
GVHD, thành viên hội đồng là quyền theo ngữ cảnh
FACULTY_SECRETARY
Thư ký Khoa/Viện
Lấy từ dept_positions đang hiệu lực
FACULTY_LEADER
Lãnh đạo Khoa/Viện (Trưởng, Phó)
Lấy từ dept_positions; Phó được duyệt thay với hình thức Ký thay
QLKHCN
P.QLKHCN&HTQT
Cấu hình đợt, rà soát, thẩm định, kết xuất
BOARD
Ban Giám đốc
Ký ngoài hệ thống, nhập số quyết định; có thể có tài khoản xem
FINANCE
P.Tài chính Kế toán
Thẩm tra quyết toán
STUDENT_AFFAIRS
P.CT&CTSV
Nhận danh sách cộng điểm rèn luyện
ADMIN
Quản trị kỹ thuật
Cấu hình hệ thống, nhật ký; không duyệt nghiệp vụ
Quyền theo ngữ cảnh (kiểm tra trong chính sách, ví dụ bằng CASL): là chủ nhiệm đề tài; là GVHD đang hướng dẫn (project_advisors ACTIVE); đang giữ chức vụ tại Khoa của đề tài (dept_positions còn hiệu lực); là thành viên hội đồng của đề tài đó; là Khoa chủ trì đề tài.
Ma trận quyền chính
Hành động
Ai được làm
Tạo đề tài, lập nhóm, mời GVHD
Sinh viên (chủ nhiệm)
Xác nhận hoặc từ chối hướng dẫn
Giảng viên được mời
Chỉ định, thay GVHD
Thư ký/Lãnh đạo Khoa của đề tài
Sơ tuyển, lập Mẫu 1
Thư ký Khoa; Hội đồng Khoa (chủ tịch xác nhận kết quả)
Rà soát danh mục, trình QĐ
QLKHCN (Ban Giám đốc ký ngoài hệ thống)
Nộp, sửa đề cương
Chủ nhiệm đề tài
Duyệt đề cương
GVHD rồi Lãnh đạo Khoa (Trưởng hoặc Phó)
Báo cáo tiến độ
Chủ nhiệm; GVHD nhận xét
Xử lý đơn điều chỉnh, gia hạn, hủy
GVHD, Lãnh đạo Khoa, QLKHCN lần lượt
Thành lập hội đồng, xếp lịch bảo vệ
Thư ký Khoa
Chấm phiếu Mẫu 4.1
Thành viên hội đồng (mỗi người chỉ sửa phiếu của mình)
Phê duyệt kết quả nghiệm thu
QLKHCN
Quyết toán kinh phí
Chủ nhiệm nộp chứng từ; Khoa xác nhận; FINANCE thẩm tra
Cấp giấy chứng nhận, cập nhật điểm thưởng
QLKHCN; CTSV nhận danh sách
Cấu hình đợt, mốc, bộ tiêu chí
QLKHCN
Xem thống kê theo Khoa
Thư ký, Lãnh đạo Khoa (chỉ Khoa mình); QLKHCN (toàn Học viện)
Nguyên tắc: mọi quyền kiểm tra ở backend; frontend chỉ ẩn nút để dễ dùng. Mọi lượt duyệt, đổi trạng thái và xuất file đều ghi vào audit_logs.
6. Vòng đời đề tài và quy tắc nghiệp vụ
máy trạng thái đề tài · 8 trạng thái, 2 lối rẽ
Trạng thái đề tài (projects.status) chỉ đổi qua service tương ứng mỗi bước, theo đúng trình tự QĐ 521: đăng ký và sơ tuyển, QĐ giao đề tài, rồi mới duyệt đề cương. Tên trạng thái tiếng Anh khớp với file mô tả đề tài (Draft, Submitted, Faculty Approved, Institute Approved, In Progress, Submitted Final, Evaluated, Closed).
Quy tắc nghiệp vụ phải kiểm tra ở backend
#
Quy tắc
Căn cứ
Kiểm tra ở đâu
1
Mỗi đề tài một GVHD hiện hành; mỗi giảng viên tối đa 2 đề tài cùng lúc
Điều 9.2, 16.2.a
Trigger DB và service (mã ADVISOR_QUOTA_EXCEEDED)
2
Tối đa 5 sinh viên mỗi đề tài, đúng 1 chủ nhiệm
Điều 9.2
Trigger DB và service
3
Mỗi sinh viên chỉ tham gia 1 đề tài trong một năm học
Điều 15.2.a
Trigger DB
4
Danh mục đăng ký hoàn thành trong tháng 9; sơ tuyển không vượt chỉ tiêu của đợt
Điều 9.1.c, 9.1.e
Cấu hình đợt và service sơ tuyển
5
Đề cương duyệt sau QĐ giao: GVHD trước, Trưởng khoa sau; Phó duyệt thay ghi hình thức Ký thay
Mẫu 2, Điều 9.2
OutlineService (mã ADVISOR_NOT_APPROVED_YET)
6
Chấm độc lập thang 100, theo bộ tiêu chí của đợt; điểm không vượt điểm tối đa từng tiêu chí
Điều 10.3.a, Mẫu 4.1
Trigger DB và form (mã SCORE_EXCEEDS_MAX)
7
Xếp loại: 90 trở lên Xuất sắc; 80 đến dưới 90 Tốt; 70 đến dưới 80 Khá; 50 đến dưới 70 Đạt; dưới 50 Không đạt
Điều 10.3.a
AcceptanceService
8
Điểm lệch hơn 15 so với trung bình ban đầu là không hợp lệ, không tính vào điểm cuối
Ghi chú Mẫu 4.2
AcceptanceService
9
Chỉ cấp giấy chứng nhận từ loại Khá trở lên
Điều 7.1.f, 15.2.e
CertificateService
10
Quyết toán chỉ dựa trên kết luận của hội đồng nghiệm thu
Điều 5.2.b
SettlementService
11
Điểm thưởng học bổng theo cấp giải (quốc tế 3,0, 2,5, 2,0, 1,5; trong nước 0,4, 0,3, 0,2, 0,1); hỗ trợ dự thi tối đa 1.000.000 đồng mỗi đề tài mỗi cấp
Điều 15.2.h, 15.2.i
StudentBonusService, AwardService
12
Hạn gửi hồ sơ xác nhận hoàn thành trước 10/4; hội nghị trước 15/6; gửi hồ sơ giải Bộ trước 30/6
Điều 10.4, 11.2, 12.3
period_milestones và cron
13
Giờ NCKH tính sau khi hoàn thành hướng dẫn, theo từng lần phân công
Điều 16.2.b
LecturerHoursService
7. Thiết kế API
REST, JSON, tiền tố /api/v1, mô tả bằng OpenAPI. Mỗi tiến trình DFD mức 1 thành một nhóm điểm cuối; cột DFD chỉ ra tiến trình nguồn.
Quy ước chung
Mục
Quy ước
Xác thực
Authorization: Bearer <access token>; refresh bằng cookie
Đặt tên
Đường dẫn danh từ số nhiều; hành động nghiệp vụ là POST .../{hành động}
Trường JSON
camelCase; backend ánh xạ sang cột snake_case của ERD
Phân trang, lọc
?page=1&pageSize=20&sort=-createdAt&filter[status]=...&q=... → { data, meta:{page,pageSize,total} }
Lỗi
RFC 7807: { type, title, status, detail, code, errors:[{field,message}] }; code là mã nghiệp vụ như ADVISOR_QUOTA_EXCEEDED
Chống ghi trùng
Header Idempotency-Key cho các POST nộp hồ sơ, duyệt, chấm
Đồng thời
If-Match theo updatedAt cho thao tác duyệt, chấm điểm
File
Xin link tải lên → tải thẳng lên kho → xác nhận: POST /files/presign, POST /files/confirm, GET /files/{id}/url
Thời gian
ISO 8601, lưu UTC, hiển thị Asia/Ho_Chi_Minh
Phân hệ 1: tài khoản, đợt NCKH, cấu hình (BFD 1)
Điểm cuối
Việc
Ai
DFD
POST /auth/login, POST /auth/forgot-password, POST /auth/reset-password
Đăng nhập email và mật khẩu, quên và đặt lại mật khẩu
Mọi người
1.1
POST /auth/refresh, POST /auth/logout, POST /auth/change-password
Làm mới, đăng xuất
Mọi người
1.1
GET, PATCH /me
Xem, sửa hồ sơ cá nhân (điện thoại, email)
Mọi người
1.2
GET, POST /users, POST /users/import, PATCH /users/{id}/role, POST /users/{id}/invite
Tạo tài khoản (từng người hoặc CSV), gửi lại thư mời, cấp vai trò cán bộ
ADMIN, QLKHCN
1.3
GET /departments, GET, POST /departments/{id}/positions, PATCH /positions/{id}
Chức vụ tại Khoa: thêm, kết thúc
QLKHCN, ADMIN
1.3
GET, POST /periods, PATCH /periods/{id}, POST /periods/{id}/activate
Cấu hình đợt NCKH, chỉ tiêu, hạn mức
QLKHCN
1.3
POST /periods/{id}/clone-criteria
Sao chép bộ tiêu chí của đợt trước
QLKHCN
1.3
GET, PUT /periods/{id}/criteria
Xem, thay toàn bộ bộ tiêu chí (kiểm tra tổng = 100)
QLKHCN
1.3
GET, POST, PATCH, DELETE /periods/{id}/milestones
Mốc kế hoạch, số ngày nhắc, kênh
QLKHCN
1.3, 8.1
Phân hệ 2: đăng ký đề tài, nhóm, GVHD (BFD 2)
Điểm cuối
Việc
Ai
DFD
POST /projects
Khởi tạo đề tài, cấp mã SV-YYYY-KHOA-XXX, tự điền thông tin sinh viên
Sinh viên
2.1
GET /projects, GET, PATCH /projects/{id}
Danh sách, xem, sửa khi còn nháp
Theo quyền
2.1
PUT /projects/{id}/budget-request
Lập dự toán kinh phí đăng ký
Chủ nhiệm
2.1
POST /projects/{id}/members/invite
Mời thành viên bằng mã sinh viên
Chủ nhiệm
2.2
POST /member-invitations/{id}/respond
Xác nhận tham gia, tỷ lệ đóng góp, nhiệm vụ
Sinh viên được mời
2.2
POST /projects/{id}/advisor-invitations
Sinh viên mời GVHD
Chủ nhiệm
2.3
POST /advisor-assignments/{id}/respond
GV xác nhận hoặc từ chối
Giảng viên
2.3
GET /lecturers/{id}/advisor-load
Số đề tài đang hướng dẫn (tối đa 2)
Thư ký, Chủ nhiệm
2.3
POST /projects/{id}/submit
Nộp hồ sơ đăng ký lên Khoa
Chủ nhiệm
2.4
GET /faculty/projects
Danh sách hồ sơ của Khoa
Thư ký Khoa
2.4
POST /projects/{id}/advisor-assignments
Khoa chỉ định GVHD
Thư ký, Lãnh đạo Khoa
2.4
POST /advisor-assignments/{id}/replace
Thay GVHD, lưu lịch sử và lý do
Thư ký, Lãnh đạo Khoa
2.4
Phân hệ 3: xét duyệt, ban hành quyết định (BFD 3)
Điểm cuối
Việc
Ai
DFD
GET /faculty/screening, GET /projects/{id}/duplicates
Danh sách đủ điều kiện, cảnh báo trùng đề tài
Thư ký Khoa
3.1
PATCH /projects/{id}/screening-result
Kết quả sơ tuyển: Duyệt, Không duyệt, Yêu cầu sửa; kiểm tra chỉ tiêu
Thư ký, Chủ tịch HĐ Khoa
3.2
POST /faculty/dossiers, POST /faculty/dossiers/{id}/submit
Lập và gửi hồ sơ Mẫu 1 (biên bản, công văn)
Thư ký Khoa
3.3
GET /admin/dossiers, PATCH /admin/dossiers/{id}/review
Tổng hợp và rà soát danh mục Học viện
QLKHCN
3.4
POST /decisions, POST /decisions/{id}/publish
Nhập QĐ giao đề tài, gắn vào đề tài, khởi tạo kinh phí được duyệt
QLKHCN
3.5
Phân hệ 4: giám sát tiến độ (BFD 4)
Điểm cuối
Việc
Ai
DFD
POST, GET /projects/{id}/outlines
Nộp, nộp lại đề cương (mỗi lần một phiên bản)
Chủ nhiệm
4.1
POST /outlines/{id}/approvals
Một lượt duyệt: vai trò, kết quả, nhận xét, hình thức Trực tiếp hoặc Ký thay
GVHD, Lãnh đạo Khoa
4.1
GET /projects/{id}/milestones, POST, GET /projects/{id}/progress-reports
Báo cáo tiến độ theo mốc
Chủ nhiệm
4.2
POST /progress-reports/{id}/review
GVHD đánh giá, kết luận Đạt hoặc Cảnh báo trễ
GVHD
4.3
POST /faculty/seminars, PUT /seminars/{id}/members, PUT /seminars/{id}/minutes
Tổ chức hội thảo cấp Khoa, thành phần, biên bản Mẫu 3.5
Thư ký Khoa
4.4
POST /projects/{id}/change-requests
Gửi đơn điều chỉnh, gia hạn, hủy, đổi GVHD
Chủ nhiệm
4.5
POST /change-requests/{id}/approvals
GVHD, Lãnh đạo Khoa, QLKHCN lần lượt xác nhận hoặc thẩm định
Theo vai trò
4.5, 4.6
POST /change-requests/{id}/decision
Nhập QĐ của Ban Giám đốc, áp dụng thời hạn mới, hủy hoặc phân công GVHD mới
QLKHCN
4.7
Phân hệ 5: nghiệm thu, chấm điểm (BFD 5)
Điểm cuối
Việc
Ai
DFD
POST /projects/{id}/final-submission, POST /projects/{id}/documents
Nộp báo cáo tổng kết, sản phẩm, minh chứng bài báo
Chủ nhiệm
5.1
POST /documents/{id}/plagiarism-check
Kiểm tra trùng lặp, lưu tỷ lệ
Hệ thống
5.1
POST /projects/{id}/advisor-clearance
GVHD xác nhận đủ điều kiện nghiệm thu
GVHD
5.1
POST /councils, PUT /councils/{id}/members
Thành lập hội đồng, quyết định, lịch bảo vệ
Thư ký Khoa
5.2
GET /me/evaluations, GET, PUT /evaluation-sheets/{id}, POST /evaluation-sheets/{id}/submit
Chấm từng tiêu chí và 4 khung nhận xét
Thành viên hội đồng
5.3
POST /projects/{id}/acceptance/compute, GET /acceptances/{id}
Tính trung bình, loại điểm lệch hơn 15, xếp loại
Thư ký Khoa
5.4
POST /acceptances/{id}/minutes, POST /acceptances/{id}/approve
Sinh biên bản Mẫu 4.2 và bảng 4.3; phê duyệt, nhập số văn bản
Thư ký; QLKHCN
5.4, 5.5
Phân hệ 6: khen thưởng và quyết toán (BFD 6)
Điểm cuối
Việc
Ai
DFD
GET /faculty/completed-projects, POST /faculty/completion-confirmations
Xác nhận khối lượng hoàn thành cấp Khoa
Thư ký Khoa
6.1
POST /award-nominations, PATCH /award-nominations/{id}/review, /approve
Đề cử giải (Mẫu 5), rà soát, phê duyệt
Thư ký; QLKHCN
6.2, 6.3
POST /certificates/issue, GET /certificates/{id}/download
Cấp giấy chứng nhận cho sinh viên và GVHD
QLKHCN
6.4
POST /lecturer-hours/declare, PATCH /lecturer-hours/{id}/confirm, GET /lecturers/{id}/hours
Kê khai và xác nhận giờ NCKH theo lần phân công
GVHD; QLKHCN
6.4
POST /student-bonuses/batch, GET /student-bonuses/export
Cập nhật điểm thưởng, gửi CTSV
QLKHCN
6.5
GET, PUT /projects/{id}/budget, POST /projects/{id}/settlements
Kinh phí; nộp chứng từ quyết toán
Chủ nhiệm
6.6
PATCH /settlements/{id}/confirm-faculty, /settle
Khoa xác nhận, Tài chính hoàn tất quyết toán
Thư ký; FINANCE
6.6
Phân hệ 7 và 8: thư viện số, thống kê, thông báo (BFD 7, 8)
Điểm cuối
Việc
Ai
DFD
POST /library/{projectId}/publish, GET /library/search, GET /library/{projectId}
Lưu trữ, tra cứu công trình, chế độ Public hoặc Nội bộ
QLKHCN; mọi người
7.1, 7.2
GET /stats/lecturer-hours, /stats/projects, /stats/progress
Thống kê giờ NCKH, đề tài theo Khoa/năm, tiến độ
Theo phạm vi quyền
7.3, 7.4
POST /exports/forms/{mau}, GET /exports/{jobId}
Xuất Mẫu 1 đến 5 (Word, PDF) theo công việc nền
Theo quyền
7.5
GET /notifications, PATCH /notifications/{id}/read, POST /notifications/{id}/respond, GET /notifications/stream (SSE)
Hộp thông báo, đã đọc, phản hồi, nhận tức thời
Mọi người
8.3, 8.4
POST /admin/notifications, GET /admin/notifications/report
Khoa phát hành tin; báo cáo gửi tin, cảnh báo trễ
Thư ký; QLKHCN
8.2, 8.5, 8.6
Các công việc định kỳ (quét mốc, tạo hàng đợi, gửi tin) chạy trong backend bằng cron, không phải điểm cuối công khai.
Ví dụ: một lượt duyệt đề cương
POST /api/v1/outlines/812/approvals{ "role": "FACULTY_LEADER", "decision": "APPROVED",  "mode": "PROXY", "comment": "Đồng ý, ký thay Trưởng khoa" }→ 201 { "data": { "id": 5521, "outlineId": 812, "approverUserId": 143,  "role": "FACULTY_LEADER", "decision": "APPROVED", "mode": "PROXY",  "decidedAt": "2026-11-20T03:12:44Z" } }→ 409 { "code": "ADVISOR_NOT_APPROVED_YET" }  // Trưởng khoa duyệt trước GVHD→ 403 { "code": "NOT_FACULTY_LEADER_OF_PROJECT" }
Ví dụ: chấm phiếu Mẫu 4.1
PUT /api/v1/evaluation-sheets/90{ "scores": [ {"criteriaId": 1, "score": 9}, {"criteriaId": 2, "score": 13},              {"criteriaId": 3, "score": 12}, {"criteriaId": 4, "score": 30},              {"criteriaId": 5, "score": 12}, {"criteriaId": 6, "score": 4},              {"criteriaId": 7, "score": 3} ],  "strengths": "...", "limitations": "...",  "qaComment": "...", "conclusionAwardRec": "..." }→ 200 { "data": { "total": 83, "scoredAt": null } }   // tổng tính khi trả về, không lưu→ 422 { "code": "SCORE_EXCEEDS_MAX", "errors": [{"field":"scores[3].score"}] }
Ví dụ: tổng hợp kết quả nghiệm thu
POST /api/v1/projects/SV-2026-CNTT-014/acceptance/compute→ 200 { "data": { "initialAverage": 82.4, "validSheets": 4, "invalidSheets": [ {"sheetId": 93, "total": 61.0} ],  "finalAverage": 85.5, "grade": "GOOD", "certificateEligible": true } }
8. Frontend (Ant Design)
Giao diện dựng bằng Ant Design 5 và ProLayout/ProTable, theo bố cục S-Link nhưng dùng logo và màu riêng của dự án (không sao chép tài sản thương hiệu). Từ 3 ảnh S-Link lấy ra các mẫu sau.
Mẫu giao diện lấy từ S-Link
Thành phần S-Link
Cách làm trong SRMS
Menu trái thu gọn được, nhóm "Nghiên cứu khoa học" có menu con
ProLayout với menu sinh từ quyền của người dùng; nhóm "Nghiên cứu khoa học" chứa các mục của SRMS
Thanh trên: chuông thông báo có số, tên người dùng
NotificationBell (SSE, badge) và menu người dùng
Đường dẫn trang (breadcrumb) và tiêu đề lớn
PageContainer của ProLayout
Thẻ tab trong trang chi tiết (Thông tin chung, Thông báo, Kết quả…)
Tabs ở trang chi tiết đề tài
Trang danh sách: ô chọn phạm vi ("Dữ liệu toàn Học viện"), nút đỏ "Xuất dữ liệu", lọc theo đơn vị, khoảng ngày, ô tìm, "Bộ lọc", "Tải lại", "Tổng số: N"
Thành phần DataTable bọc ProTable với đúng thanh công cụ này
Cột trạng thái dạng thẻ màu ("Chờ xử lý"), cột thao tác biểu tượng sửa, xóa
StatusTag và cột Thao tác
Màu nhấn đỏ, nền trắng, phông gọn
ConfigProvider theo bảng theme đỏ và trắng bên dưới, locale vi_VN
Bảng màu và theme (đỏ và trắng)
Màu chủ đạo là đỏ trên nền trắng, như S-Link. Vì màu nhấn đã là đỏ nên màu lỗi dùng cam đỏ, để người dùng không nhầm một hành động nguy hiểm với một nút bình thường; mọi thao tác xóa hoặc hủy đều có hộp xác nhận. Mã màu dưới đây ước lượng bằng mắt từ ảnh S-Link và trang SSO, sẽ chỉnh lại khi có bộ nhận diện chính thức.
Token Ant Design
Giá trị
Dùng cho
colorPrimary
#C62828
Nút chính, liên kết, mục menu đang chọn, tiêu đề nhấn
colorPrimaryHover
#D32F2F
Khi rê chuột
colorPrimaryActive
#8E0000
Khi nhấn giữ
colorPrimaryBg
#FDECEA
Nền mục menu đang chọn, hàng được chọn
colorBgLayout
#F7F7F8
Nền trang
colorBgContainer
#FFFFFF
Thẻ, bảng, thanh trái, thanh trên
colorBorderSecondary
#EDEDED
Viền và đường kẻ
colorText và colorTextSecondary
#1F1F1F và #6B6B6B
Chữ chính và chữ phụ
colorError
#D4380D
Lỗi và hành động nguy hiểm (cam đỏ, khác màu nhấn)
colorSuccess, colorWarning, colorInfo
#389E0D, #D48806, #1677FF
Trạng thái thành công, cảnh báo, thông tin
borderRadius
8
Thẻ, nút, ô nhập
Nền cột trái màn đăng nhập
Chuyển sắc #8E0000 sang #C62828
Chỉ dùng cho màn đăng nhập
Màu thẻ trạng thái (StatusTag; đỏ nhấn không dùng cho trạng thái thường)
Trạng thái
Màu thẻ
Nháp
Xám
Chờ xử lý, Đã nộp
Xanh dương (như S-Link)
Đang thực hiện
Xanh lá nhạt
Đã duyệt, Hoàn tất
Xanh lá
Yêu cầu sửa, Quá hạn sắp tới
Cam vàng
Từ chối, Đã hủy
Cam đỏ (#D4380D)
Màn hình đăng nhập (bố cục hai cột như trang SSO của PTIT: cột trái đỏ, cột phải trắng)
Khu vực
Nội dung
Cột trái
Khoảng 60% chiều rộng, nền chuyển sắc đỏ đậm. Chữ trắng: tên Học viện cỡ lớn, dòng tiếng Anh nhỏ bên dưới, và tên hệ thống "Quản lý đề tài nghiên cứu khoa học sinh viên". Hình tòa nhà nét trắng mờ làm nền nếu Học viện cung cấp ảnh; chưa có thì dùng họa tiết hình học đơn giản. Logo là ô giữ chỗ, chỉ gắn logo PTIT khi được phép
Cột phải
Nền trắng, nội dung căn giữa theo chiều dọc, rộng tối đa 420 px: khu logo, dòng "Đăng nhập bằng tài khoản của bạn để tiếp tục"
Biểu mẫu
Ô Email (tự đặt con trỏ vào), ô Mật khẩu có nút hiện hoặc ẩn, liên kết đỏ "Quên mật khẩu?", nút đỏ "Đăng nhập" rộng hết khung; đường kẻ "hoặc"; nút viền "Đăng nhập bằng tài khoản PTIT (SSO)" đang vô hiệu hóa, ghi chú "Sắp có"; dòng nhỏ "Chưa có tài khoản? Liên hệ P.QLKHCN"
Trạng thái
Sai thông tin: "Email hoặc mật khẩu không đúng"; bị khóa: hiện thời gian còn lại; đăng nhập lần đầu: hộp thoại bắt buộc đổi mật khẩu; phiên hết hạn: quay về đây kèm thông báo
Trang đi kèm
/login, /forgot-password, /reset-password/:token, /first-login/change-password
Màn hình nhỏ
Ẩn cột trái, giữ khung trắng với dải đỏ mỏng ở đầu trang
Nhóm trang theo vai trò (tuyến chi tiết nằm trong prompt giao Anti)
Vai trò
Trang chính
Mọi người
Đăng nhập, Quên mật khẩu, Trang chủ (việc cần làm, mốc sắp tới), Hồ sơ cá nhân, Thông báo, Thư viện số và chi tiết công trình
Sinh viên
Đề tài của tôi; Tạo đề tài (4 bước: thông tin, nhóm, GVHD, dự toán và nộp); Chi tiết đề tài với các tab Tổng quan, Nhóm, GVHD, Đề cương, Tiến độ, Hội thảo, Đơn, Nghiệm thu, Kinh phí, Chứng nhận
Giảng viên
Lời mời hướng dẫn; Đề tài tôi hướng dẫn (duyệt đề cương, nhận xét tiến độ, xác nhận đủ điều kiện nghiệm thu); Phiếu cần chấm và form chấm Mẫu 4.1; Giờ NCKH của tôi
Thư ký, Lãnh đạo Khoa
Hồ sơ của Khoa; Sơ tuyển; Hồ sơ Mẫu 1; Đề cương chờ duyệt; Đơn chờ duyệt; Hội thảo; Hội đồng và lịch bảo vệ; Tổng hợp nghiệm thu; Xác nhận hoàn thành; Quyết toán chờ xác nhận; Thống kê Khoa
QLKHCN
Đợt NCKH (tab Thông tin, Tiêu chí, Mốc); Hồ sơ các Khoa; Quyết định giao; Đơn điều chỉnh; Nghiệm thu chờ phê duyệt; Đề cử giải; Giấy chứng nhận; Điểm thưởng; Thư viện; Thống kê; Kết xuất biểu mẫu; Người dùng và chức vụ; Thông báo
FINANCE, ADMIN
Quyết toán cần thẩm tra; Nhật ký hệ thống và cấu hình
Thành phần dùng chung (làm trước khi làm trang)
Thành phần
Chức năng
AppLayout
ProLayout, menu theo quyền, chọn đợt NCKH toàn cục, đổi vai trò khi một người có nhiều vai trò
DataTable
ProTable với thanh công cụ S-Link, phân trang phía máy chủ, xuất dữ liệu
StatusTag
Ánh xạ trạng thái đề tài, đơn, phiếu sang màu và nhãn tiếng Việt
ApprovalTimeline
Hiển thị các lượt duyệt: ai, vai trò, kết quả, hình thức (Trực tiếp / Ký thay), nhận xét, giờ
ConfirmActionModal
Duyệt, từ chối, yêu cầu sửa: bắt buộc nhập nhận xét khi không duyệt
MemberPicker
Tìm sinh viên hoặc giảng viên theo mã, họ tên; báo lỗi nếu đã vượt quá quota
FileUploader
Upload.Dragger gọi presign và confirm; giới hạn loại, dung lượng; xem trước PDF
ScoreSheetForm
Dựng form theo bộ tiêu chí lấy từ API, tổng cộng tự động, cảnh báo khi vượt điểm tối đa, 4 khung nhận xét
DeadlineBadge
Đếm ngược tới hạn của mốc, đổi màu khi còn 7, 3, 1 ngày
NotificationBell
SSE, badge số chưa đọc, nút xác nhận đã đọc và phản hồi
PeriodSelector
Chọn năm học, đợt; lưu lựa chọn
FormActions
Nhóm nút Xuất Mẫu Word, PDF gắn với trang
Dữ liệu và trạng thái
Client API sinh từ OpenAPI bằng orval; mỗi tài nguyên có query key riêng trong TanStack Query; sau mỗi thao tác duyệt thì làm mới query liên quan.
Kiểm tra form dùng schema zod từ packages/shared, cùng quy tắc với backend; thông báo lỗi tiếng Việt theo mã nghiệp vụ của RFC 7807.
Hook useCan(action, resource) đọc quyền từ GET /me để ẩn hoặc vô hiệu hóa nút; backend vẫn là nơi quyết định.
Chỉ giữ trạng thái toàn cục cho phiên đăng nhập, đợt NCKH đang chọn và cài đặt giao diện (Zustand).
Tách mã theo tuyến (React.lazy); ngân sách gói chính dưới 300 KB gzip.
Trải nghiệm: giao diện tiếng Việt (antd vi_VN, dayjs vi); trạng thái đang tải dùng khung xương; có trạng thái trống; dùng được từ máy tính bảng trở lên; phím tắt cơ bản và aria cho thành phần tùy biến; cảnh báo khi phiên sắp hết.
9. Biểu mẫu, file, thông báo và lịch nhắc việc
Ba việc dùng chung cho nhiều phân hệ: sinh biểu mẫu Word/PDF từ dữ liệu, lưu file an toàn, gửi thông báo đúng người đúng lúc.
Xuất biểu mẫu theo QĐ 521 (mẫu .docx chuẩn để trong repo, thư mục templates/, điền bằng docxtemplater, chạy dưới dạng công việc nền, PDF chuyển bằng Gotenberg)
Mẫu
Nội dung
Lấy dữ liệu từ
Mẫu 1
Công văn đăng ký đề tài của Khoa: STT, tên đề tài, GVHD (họ tên, học hàm, học vị, email), lĩnh vực, mục tiêu, kinh phí dự kiến
projects, project_advisors (ACTIVE), lecturers, budgets.faculty_proposed, faculty_dossiers; chữ ký lấy từ dept_positions
Mẫu 2
Đề cương nghiên cứu
projects, project_members, outlines, budgets
Mẫu 3.2 và 3.3
Bìa và bìa phụ báo cáo tổng kết: mã, tên đề tài, nhóm ngành; sinh viên (giới tính, dân tộc, lớp, khoa, năm thứ, số năm đào tạo, ngành); người hướng dẫn
projects, students, lecturers
Mẫu 3.4
Thông tin kết quả nghiên cứu
project_documents, projects
Mẫu 3.5
Biên bản hội thảo: thành phần, nội dung, đánh giá chung, đề nghị hoàn thiện
seminars, seminar_members
Mẫu 4.1
Phiếu đánh giá từng thành viên: 7 tiêu chí và ghi chú
evaluation_sheets, sheet_scores, evaluation_criteria, council_members
Mẫu 4.2
Biên bản nghiệm thu: số đầu điểm hợp lệ, điểm trung bình ban đầu và cuối, kết luận, xếp loại
acceptances, councils, evaluation_sheets
Mẫu 4.3
Công văn đề nghị xác nhận hoàn thành kế hoạch của Khoa (danh sách đề tài, điểm, xếp loại)
acceptances gom theo Khoa và đợt (ERD hiện lưu theo từng đề tài; danh sách được truy vấn khi xuất)
Mẫu 5
Danh sách đề tài gửi xét giải thưởng
award_nominations, projects, students, lecturers
Kết quả lưu thành file, ghi người xuất và giờ xuất vào nhật ký; link tải chỉ có hiệu lực 15 phút.
Lưu trữ file
Bucket riêng, đường dẫn dạng projects/{projectId}/{loại}/{phiên bản}; cột *_url của ERD lưu khóa trong kho, không lưu URL công khai.
Tải lên bằng link ký trước; kiểm tra loại file bằng nội dung (không tin đuôi file); giới hạn kích thước theo loại; quét virus bằng ClamAV nếu hạ tầng cho phép.
Mỗi lần nộp lại tạo phiên bản mới, không ghi đè; xóa mềm.
Chế độ Public hay Nội bộ của công trình trong thư viện số quyết định ai tải được toàn văn.
Thông báo đa kênh (phân hệ 8)
Sự kiện nghiệp vụ (nộp hồ sơ, duyệt, đến hạn…) → NotificationService chọn mẫu và người nhận → ghi bảng notifications → gửi theo từng kênh qua hàng đợi. Web dùng SSE; email dùng SMTP; SMS và Zalo OA là giao diện adapter, bản đầu để chế độ giả lập. Gửi lỗi thì thử lại 3 lần có giãn cách, ghi delivery_status. Người nhận xác nhận đã đọc và có thể phản hồi (is_confirmed, response_text). Chỉ thông báo bắt buộc (hạn nộp, kết quả duyệt) không cho tắt.
Quy tắc nhắc hạn (cron chạy 07:00 mỗi ngày, chống gửi trùng bằng khóa duy nhất: mốc, đề tài, người nhận, số ngày)
Sự kiện
Người nhận
Thời điểm
Đến hạn nộp đề cương, báo cáo mốc 1, 2, 3, hồ sơ nghiệm thu
Chủ nhiệm đề tài chưa nộp
7, 3 và 1 ngày trước hạn; cảnh báo khi quá hạn
Đề cương hoặc báo cáo tiến độ chờ duyệt, nhận xét
GVHD, Lãnh đạo Khoa
Sau 2 ngày chưa xử lý
Phiếu chấm chưa nộp
Thành viên hội đồng
1 ngày trước buổi bảo vệ và sáng ngày bảo vệ
Hạn hồ sơ xác nhận hoàn thành (10/4), hội nghị NCKH (trước 15/6), gửi hồ sơ giải Bộ (trước 30/6)
Thư ký Khoa, QLKHCN
7, 3 và 1 ngày trước hạn
Danh sách đề tài chậm tiến độ
Thư ký Khoa, QLKHCN
Hằng tuần
Các ngày hạn lấy từ period_milestones và system_settings, không đặt cứng trong mã.
10. Phi chức năng, kiểm thử và DevOps
Mục tiêu chất lượng (giả định ban đầu, chỉnh khi có số liệu thật)
Hạng mục
Mục tiêu
Hiệu năng
p95 dưới 500 ms cho API danh sách ở 10.000 dòng; xuất biểu mẫu chạy nền, xong dưới 30 giây
Sẵn sàng
99,5% trong giờ làm việc; điểm cuối /health và /ready
Sao lưu
Sao lưu hằng ngày; RPO 24 giờ, RTO 4 giờ; thử khôi phục mỗi quý
Bảo mật
Theo OWASP ASVS mức 2; không có lỗi mức cao khi quét trước khi ra mắt
Truy cập
Chạy tốt trên Chrome, Edge, Safari bản mới; dùng được ở màn hình máy tính bảng
Dữ liệu cá nhân
Chỉ hiện số điện thoại, email, GPA cho người có quyền; ghi nhật ký khi xem hàng loạt hoặc xuất
Bảo mật
Kiểm tra mọi đầu vào bằng zod; truy vấn có tham số qua Prisma; helmet, CSP, CORS theo danh sách tên miền.
Giới hạn tần suất: 100 yêu cầu mỗi phút mỗi người, đăng nhập 10 lần mỗi phút; khóa tạm khi vượt.
Cookie refresh httpOnly, Secure, SameSite=Lax, xoay vòng và thu hồi khi đăng xuất hoặc phát hiện dùng lại. Mật khẩu băm argon2id, tối thiểu 10 ký tự, khóa tạm sau 5 lần sai, bắt buộc HTTPS.
File tải lên: kiểm tra nội dung, giới hạn kích thước, link tải ký tạm; không cho chạy file.
Bí mật (khóa Supabase service, SMTP, SSO) nằm trong biến môi trường hoặc kho bí mật, không vào mã nguồn; khóa service không xuống trình duyệt.
audit_logs chỉ thêm, không sửa, ghi: người, hành động, đối tượng, giá trị trước và sau, địa chỉ IP.
Kiểm thử
Tầng
Công cụ
Phạm vi bắt buộc
Đơn vị
Jest, Vitest
Tính điểm và xếp loại, loại điểm lệch hơn 15, quota GVHD, máy trạng thái đề tài, quy tắc nhắc hạn; độ phủ trên 80% ở lớp nghiệp vụ
Tích hợp
Supertest với Postgres thật (Testcontainers)
Từng ràng buộc DB ở mục 4: thử vi phạm và thấy bị từ chối; phân quyền từng điểm cuối
Hợp đồng
Kiểm tra phản hồi theo OpenAPI
Không cho API lệch tài liệu
Đầu cuối
Playwright
6 luồng chính: sinh viên tạo và nộp đề tài; GVHD xác nhận; Khoa sơ tuyển và lập Mẫu 1; duyệt đề cương ba chữ ký; hội đồng chấm và tổng hợp; quyết toán
Tải
k6
200 người dùng đồng thời ở trang danh sách và nộp hồ sơ
DevOps
Môi trường: local (Docker Compose gồm Postgres, Redis, IdP giả, MailHog, Gotenberg), staging, production.
CI (GitHub Actions): lint, kiểm tra kiểu, kiểm thử, dựng gói, kiểm tra migration; không gộp nhánh nếu đỏ.
CD: dựng ảnh Docker, chạy migration khi triển khai, Nginx đảo ngược proxy, triển khai không làm gián đoạn; có cách quay lại bản trước.
Quy ước commit theo Conventional Commits; mẫu pull request có danh sách tiêu chí hoàn thành.
Quan sát: nhật ký JSON (pino) có mã yêu cầu, Sentry cho cả frontend và backend, kiểm tra uptime bên ngoài.
Cấu hình qua biến môi trường; ví dụ đầy đủ ở .env.example.
11. Lộ trình theo sprint
Giả định: 10 sprint, mỗi sprint 2 tuần, tổng 20 tuần, đội 3 người (hai lập trình full-stack và một kiểm thử bán thời gian). Thứ tự bám dòng chảy nghiệp vụ nên mỗi sprint kết thúc bằng một lát cắt chạy được từ giao diện tới CSDL. Nếu đội nhỏ hơn thì giữ nguyên thứ tự và kéo dài sprint.
Sprint
Tuần
Phạm vi
Đầu ra chính
Tiêu chí hoàn thành
0
1–2
Nền tảng
Monorepo, CI, Docker Compose; schema Prisma từ ERD tab 2 (34 bảng) và migration có ràng buộc; dữ liệu khởi tạo; khung OpenAPI; AppLayout kiểu S-Link, đăng nhập giả
docker compose up chạy được; migration xanh; mỗi ràng buộc DB ở mục 4 có test vi phạm bị từ chối
1
3–4
Phân hệ 1
Đăng nhập email và mật khẩu (tạo tài khoản, nhập CSV, quên mật khẩu, khóa tạm) qua AuthProvider chừa chỗ cho SSO, hồ sơ cá nhân, Khoa và chức vụ, đợt NCKH, mốc, bộ tiêu chí (sao chép theo đợt), vai trò, audit_logs; DataTable, StatusTag
QLKHCN tạo đợt với 7 tiêu chí tổng 100; không thể lưu bộ tiêu chí tổng khác 100
2
5–6
Phân hệ 2
Tạo đề tài và cấp mã, dự toán, mời và xác nhận thành viên, mời và xác nhận GVHD, Khoa chỉ định và thay GVHD kèm lịch sử; wizard 4 bước
Luồng sinh viên → giảng viên → Khoa chạy hết; test quota 2 đề tài, tối đa 5 sinh viên, 1 chủ nhiệm
3
7–8
Phân hệ 3
Sơ tuyển (chỉ tiêu, cảnh báo trùng), hồ sơ Mẫu 1 và xuất Mẫu 1, rà soát Học viện, QĐ giao đề tài và khởi tạo kinh phí được duyệt; thông báo in-app và email
Bộ dữ liệu 100 đề tài lọc còn 20, ban hành QĐ, đề tài sang trạng thái Institute Approved
4
9–10
Phân hệ 4a
Nộp đề cương theo phiên bản, hai cấp duyệt kèm hình thức Ký thay, báo cáo tiến độ theo mốc, GVHD nhận xét; ApprovalTimeline
Trưởng khoa duyệt trước GVHD bị từ chối (409); Phó duyệt thay ghi đúng hình thức
5
11–12
Phân hệ 4b
Hội thảo và Mẫu 3.5, đơn điều chỉnh, gia hạn, hủy, đổi GVHD qua ba cấp và QĐ, áp dụng kết quả đơn
Đơn đổi GVHD đóng dòng phân công cũ, mở dòng mới, giờ NCKH tách theo từng dòng
6
13–14
Phân hệ 5
Nộp báo cáo tổng kết và sản phẩm, kiểm tra trùng lặp (giả lập), GVHD xác nhận, hội đồng và lịch, form chấm Mẫu 4.1 theo tiêu chí động, tổng hợp và xếp loại, Mẫu 4.2 và 4.3
Test tính điểm khớp ví dụ tay của Mẫu 4.2, gồm trường hợp điểm lệch hơn 15 bị loại
7
15–16
Phân hệ 6
Xác nhận khối lượng, đề cử Mẫu 5, giấy chứng nhận (PDF, mã QR), giờ NCKH, điểm thưởng gửi CTSV, quyết toán kinh phí
Đề tài từ Khá trở lên cấp được giấy chứng nhận, dưới Khá bị từ chối; quyết toán chỉ dựa trên kết luận hội đồng
8
17–18
Phân hệ 7 và 8
Thư viện số (Public hoặc Nội bộ, tìm kiếm không dấu), thống kê và biểu đồ, kết xuất mọi biểu mẫu, cron nhắc hạn, adapter SMS và Zalo giả lập, báo cáo gửi tin
Mọi quy tắc nhắc ở mục 9 chạy đúng trên dữ liệu mẫu; không gửi trùng
9
19–20
Hoàn thiện
Rà soát bảo mật, tối ưu hiệu năng, kiểm thử chấp nhận với P.QLKHCN và một Khoa, tài liệu hướng dẫn, chạy thử một đợt nhỏ
Không còn lỗi nghiêm trọng; quét bảo mật sạch; thử khôi phục sao lưu thành công
Mỗi sprint đều gồm: schema và migration (nếu có), API kèm OpenAPI và test, giao diện và test, dữ liệu mẫu, cập nhật tài liệu; kết thúc bằng buổi demo cho người dùng đại diện.
12. Rủi ro và việc cần xác nhận
Tài liệu thiết kế đã khớp nhau ở mức kiểm tra được, nhưng 13 điểm dưới đây cần người có thẩm quyền xác nhận hoặc có thể làm đổi kế hoạch. Điểm 1, 2, 3 ảnh hưởng sớm nhất nên cần chốt trước Sprint 1.
#
Vấn đề
Ảnh hưởng
Cách xử lý và người xác nhận
1
Giai đoạn đầu dùng email và mật khẩu thay SSO PTIT Slink (OIDC); chưa có client, địa chỉ và claim của SSO
Bảo mật tài khoản do hệ thống tự quản, cấp tài khoản thủ công
Băm argon2id, khóa tạm, bắt buộc HTTPS, nhập CSV tài khoản; xin Trung tâm CNTT thông tin SSO để chuyển sau qua AuthProvider
2
Chưa có QĐ 169/2026 (mức kinh phí 7 đến 10 triệu, có thể đổi tiêu chí)
Sai hạn mức hoặc tiêu chí
Hạn mức và tiêu chí để dạng cấu hình theo đợt; P.QLKHCN xác nhận văn bản
3
Nơi đặt dữ liệu: Supabase đặt ngoài nước, Học viện có thể yêu cầu lưu trong nước
Phải đổi hạ tầng
Nếu bắt buộc trong nước thì tự vận hành Postgres và kho file chuẩn S3 (MinIO); mã không đổi vì chỉ dùng chuẩn Postgres và S3. Hỏi Trung tâm CNTT
4
SMS và Zalo OA cần nhà cung cấp, hợp đồng, mẫu tin được duyệt
Kênh thông báo thiếu
Bản đầu giả lập; email và in-app là bắt buộc
5
Dịch vụ kiểm tra đạo văn chưa chọn
Chưa có tỷ lệ trùng thật
Bản đầu là giao diện kết nối và chạy giả lập; chọn dịch vụ sau (thư viện hoặc bên thứ ba)
6
Mẫu 4.3 là công văn cấp Khoa, ERD lưu theo từng đề tài
Không lưu được số công văn và file theo Khoa
Xuất bằng truy vấn theo Khoa và đợt; nếu cần lưu thì thêm bảng hồ sơ cấp Khoa. Hỏi P.QLKHCN
7
Giờ NCKH khi đổi GVHD giữa chừng: chia theo từng lần phân công (thiết kế hiện tại) hay tính cho người cuối
Số giờ giảng viên
Xác nhận quy chế với P.QLKHCN và người hướng dẫn đồ án
8
Hồ sơ Hội đồng Khoa chỉ lưu kết quả sơ tuyển và biên bản, không quản lý thành viên
Thiếu danh sách thành viên Hội đồng Khoa
Xác nhận có cần quản lý thành viên trong hệ thống không
9
Phó Khoa duyệt thay Trưởng khoa (Ký thay)
Hiệu lực pháp lý của lượt duyệt
Xác nhận quy chế ký thay, có cần văn bản ủy quyền; hệ thống đã lưu hình thức duyệt
10
Hệ số quy đổi giờ NCKH chưa có số
Báo cáo giờ sai
Để system_settings; P.QLKHCN cung cấp số giờ chuẩn mỗi đề tài
11
Quy mô thật (số đề tài mỗi năm, số tài khoản) chưa có
Mục tiêu hiệu năng và hạ tầng
Lấy số năm gần nhất từ P.QLKHCN; chỉnh mục 10
12
File mô tả đề tài còn ghi ERD 12 thực thể và QĐ 521 ngày 14/05/2020 (thực tế 34 bảng, ngày 17/7/2020)
Báo cáo mâu thuẫn với thiết kế
Sửa trước khi nộp báo cáo
13
Logo và nhận diện S-Link, PTIT
Vấn đề bản quyền thương hiệu
Dùng tài sản riêng của dự án; xin phép nếu muốn dùng logo Học viện
Ràng buộc nghiệp vụ chỉ ở mã, không có trong ERD (phải đưa vào backend và test): tối đa 5 sinh viên mỗi đề tài; mỗi sinh viên một đề tài mỗi năm học; người duyệt phải đúng vai (GVHD đang hướng dẫn, người đang giữ chức Trưởng hoặc Phó Khoa của Khoa chủ trì); Trưởng khoa duyệt đề cương sau GVHD; điểm lệch hơn 15 so với trung bình ban đầu bị loại; giấy chứng nhận chỉ cấp từ loại Khá trở lên; quyết toán chỉ dựa trên kết luận của hội đồng nghiệm thu (Điều 5.2.b).
13. Prompt giao cho Anti
Cách dùng: tạo repo, để tài liệu vào docs/ (ERD v10, DFD mức 0 và mức 1 v10, BFD v10, QĐ 521, 3 ảnh S-Link, và tài liệu này lưu thành plan.md). Dán prompt chủ làm hướng dẫn cố định của dự án, rồi mỗi sprint dán prompt sprint kèm dòng tương ứng ở bảng bên dưới. Bắt agent viết kế hoạch ngắn và chờ duyệt trước khi code, để bạn chặn sai hướng sớm.
Prompt chủ
VAI TRÒBạn là kỹ sư trưởng xây hệ thống web SRMS (quản lý đề tài NCKH sinh viên Học viện PTIT).Làm theo từng sprint, mỗi sprint giao một lát cắt chạy được từ giao diện tới CSDL.NGUỒN SỰ THẬT (trong docs/), ưu tiên từ trên xuống1. QĐ 521/QĐ-HV và Mẫu 1 đến 5: quy tắc nghiệp vụ, biểu mẫu.2. SRMS_ERD_v10.drawio, tab 2 "Lược đồ CSDL": 34 bảng. Đây là nguồn duy nhất cho schema.   Không đổi tên bảng hay cột nghiệp vụ. Chỉ thêm bảng kỹ thuật ở mục 4 của plan.md.3. SRMS_DFD_muc1_v10 và muc0: luồng nghiệp vụ, ai làm, đọc/ghi bảng nào.4. SRMS_BFD_v10: danh sách tính năng theo phân hệ.5. plan.md: kiến trúc, API, phân quyền, sprint, phụ lục ánh xạ.6. docs/slink/*.png: mẫu giao diện (bố cục, thanh công cụ bảng, thẻ trạng thái).Khi các nguồn mâu thuẫn hoặc thiếu thông tin: theo thứ tự trên, ghi vào docs/DECISIONS.mdvà hỏi lại tôi. Không tự đoán nghiệp vụ.TECHSTACK (không đổi nếu chưa hỏi tôi)Frontend: React 18, TypeScript, Vite, Ant Design 5 và pro-components, TanStack Query, React Router 6.Backend: Node 20, NestJS, Prisma, zod dùng chung, OpenAPI, BullMQ và Redis.CSDL: PostgreSQL (Supabase), file ở Supabase Storage. Mọi truy cập dữ liệu đi qua NestJS.Xác thực giai đoạn đầu: email và mật khẩu (argon2id) qua giao diện AuthProvider; SSO PTIT (OIDC) là nhà cung cấp thêm sau.CẤU TRÚC REPO (pnpm workspaces, Turborepo)apps/web, apps/api, packages/shared (zod, hằng số, kiểu), prisma/, templates/ (Mẫu .docx), docs/QUY TẮC LÀM VIỆC1. Bắt đầu mỗi sprint bằng kế hoạch ngắn: việc, bảng, API, màn hình, rủi ro. Dừng chờ tôi duyệt.2. Ràng buộc nghiệp vụ nằm cả ở DB (migration SQL: unique index một phần, trigger, CHECK)   lẫn ở service; mỗi ràng buộc có test cố tình vi phạm.3. Mọi điểm cuối có: OpenAPI, kiểm tra đầu vào bằng zod, kiểm tra quyền (vai trò và ngữ cảnh),   ghi audit_logs khi đổi dữ liệu, mã lỗi nghiệp vụ ổn định (RFC 7807), test tích hợp.4. Giao diện tiếng Việt, theo Ant Design và bố cục S-Link; không dùng logo hay tài sản thương hiệu; màu chủ đạo đỏ và trắng theo bảng theme ở mục 8.5. Không dùng dữ liệu thật. Dữ liệu mẫu ở prisma/seed.ts. Không commit bí mật.6. Pull request nhỏ, có mô tả, ảnh chụp màn hình, danh sách tiêu chí hoàn thành đã tick.7. Không bỏ qua test hỏng; không xóa test để cho qua.8. Cuối sprint: liệt kê điều chưa làm, điều đã giả định, câu hỏi mở.
Prompt sprint (mẫu)
Thực hiện SPRINT <N> theo mục 11 của docs/plan.md.Phạm vi DFD: <các tiến trình>. Bảng liên quan: <các bảng> (xem phụ lục 14).Bước 1: đọc các tiến trình DFD trên và điều QĐ 521 liên quan; viết kế hoạch ngắn rồi dừng chờ duyệt.Bước 2: migration và ràng buộc (nếu có), kèm test vi phạm.Bước 3: API, OpenAPI, phân quyền, test tích hợp.Bước 4: giao diện và test.Bước 5: seed dữ liệu mẫu, chạy toàn bộ test, báo cáo điều chưa làm và câu hỏi mở.Tiêu chí hoàn thành: <sao chép cột Tiêu chí hoàn thành của sprint trong mục 11>.
Điền vào prompt sprint
Sprint
Phạm vi DFD
Bảng chính
Lưu ý riêng cho agent
0
(nền tảng)
Toàn bộ 34 bảng
Sinh Prisma từ ERD tab 2; viết các CHECK, index một phần, trigger ở mục 4; docker-compose chạy được
1
1.1, 1.2, 1.3, 8.1
users, roles, departments, dept_positions, nckh_periods, period_milestones, evaluation_criteria
Đăng nhập email và mật khẩu qua AuthProvider, nhập CSV tài khoản; sao chép bộ tiêu chí theo đợt; tổng điểm tối đa phải bằng 100
2
2.1 đến 2.4
projects, project_members, project_advisors, budgets
Mã SV-YYYY-KHOA-XXX qua project_code_counters; quota 2 đề tài; tối đa 5 sinh viên
3
3.1 đến 3.5
faculty_dossiers, decisions, budgets, projects
Xuất Mẫu 1; cảnh báo trùng đề tài bằng pg_trgm
4
4.1, 4.2, 4.3
outlines, outline_approvals, progress_reports
Trưởng khoa chỉ duyệt sau GVHD; có hình thức Ký thay; mỗi lần nộp lại là phiên bản mới
5
4.4 đến 4.7
seminars, seminar_members, change_requests, request_approvals, project_advisors
Đổi GVHD đóng dòng phân công cũ và mở dòng mới; giờ NCKH theo từng dòng
6
5.1 đến 5.5
project_documents, councils, council_members, evaluation_sheets, sheet_scores, acceptances
Điểm trung bình, loại điểm lệch hơn 15, xếp loại 5 mức; test theo ví dụ tay
7
6.1 đến 6.6
award_nominations, certificates, lecturer_hours, student_bonus, settlements, budgets
Chỉ cấp giấy chứng nhận từ Khá trở lên; quyết toán chỉ khi có kết luận hội đồng
8
7.1 đến 7.5, 8.2 đến 8.6
notifications, project_documents, mọi bảng cho thống kê
Cron nhắc hạn theo mục 9; không gửi trùng; SMS và Zalo giả lập
9
(hoàn thiện)
(không thêm bảng)
Rà bảo mật, hiệu năng, tài liệu hướng dẫn, chạy thử một đợt nhỏ
14. Phụ lục: ánh xạ tiến trình DFD sang bảng, màn hình, API
Bảng này là mục lục để chia việc: mỗi dòng là một tiến trình DFD mức 1 (41 dòng), cho biết bảng chính đọc hoặc ghi, màn hình và API tương ứng. Tên bảng theo ERD v10.
DFD
Tiến trình
Bảng đọc / ghi
Màn hình
API chính
1.1
Đăng nhập hệ thống (email, mật khẩu; SSO sau)
users, roles
Đăng nhập
/auth/*
1.2
Quản lý hồ sơ cá nhân
users, students, lecturers
Hồ sơ cá nhân
/me
1.3
Cấu hình đợt NCKH, tiêu chí, hệ thống
ghi nckh_periods, period_milestones, evaluation_criteria, dept_positions, users.role
Đợt NCKH; Người dùng và chức vụ
/periods, /users, /departments
2.1
Đăng ký đề tài, khởi tạo hồ sơ
đọc users, nckh_periods; ghi projects, budgets
Tạo đề tài (bước 1, 4)
POST /projects, PUT budget-request
2.2
Quản lý nhóm
ghi project_members
Tab Nhóm
members/invite, member-invitations/respond
2.3
Mời và xác nhận GVHD
ghi project_advisors
Tab GVHD; Lời mời hướng dẫn
advisor-invitations, advisor-assignments/respond
2.4
Tiếp nhận, thẩm định hồ sơ đăng ký
đọc, ghi projects, project_advisors
Hồ sơ của Khoa
projects/submit, faculty/projects, advisor-assignments
3.1
Xác định đề tài đủ điều kiện
đọc nckh_periods, projects
Sơ tuyển
faculty/screening, projects/duplicates
3.2
Tổ chức xét duyệt sơ tuyển cấp Khoa
ghi projects.prelim_result, budgets.faculty_proposed
Sơ tuyển
PATCH screening-result
3.3
Tiếp nhận đề xuất danh mục của Khoa
ghi faculty_dossiers, projects.dossier_id
Hồ sơ Mẫu 1
faculty/dossiers
3.4
Tổng hợp, rà soát danh mục Học viện
ghi faculty_dossiers
Hồ sơ các Khoa
admin/dossiers
3.5
Trình duyệt, ban hành QĐ giao
ghi decisions, projects.decision_id, budgets
Quyết định giao
/decisions
4.1
Nộp và duyệt đề cương
ghi outlines, outline_approvals
Tab Đề cương; Đề cương chờ duyệt
/outlines, /outlines/{id}/approvals
4.2
Tiếp nhận báo cáo tiến độ
đọc period_milestones; ghi progress_reports
Tab Tiến độ
/progress-reports
4.3
Đánh giá tiến độ
ghi progress_reports
GVHD nhận xét tiến độ
progress-reports/review
4.4
Tổ chức hội thảo cấp Khoa
ghi seminars, seminar_members
Hội thảo
/faculty/seminars
4.5
Tiếp nhận, xác nhận đơn
ghi change_requests, request_approvals
Tab Đơn; Đơn chờ duyệt
/change-requests, approvals
4.6
Thẩm định đơn
ghi request_approvals
Đơn chờ thẩm định
approvals (QLKHCN)
4.7
Trình duyệt xử lý đơn
ghi change_requests, projects, project_advisors
Đơn đã thẩm định
change-requests/decision
5.1
Tiếp nhận hồ sơ, xác nhận điều kiện
ghi project_documents
Tab Nghiệm thu; GVHD xác nhận
final-submission, documents, advisor-clearance
5.2
Thành lập Hội đồng, lập lịch
ghi councils, council_members
Hội đồng và lịch
/councils
5.3
Chấm điểm, nhận xét bảo vệ
đọc evaluation_criteria; ghi evaluation_sheets, sheet_scores
Form chấm Mẫu 4.1
/evaluation-sheets
5.4
Tổng hợp điểm, lập biên bản
ghi acceptances
Tổng hợp nghiệm thu
acceptance/compute, minutes
5.5
Phê duyệt, công bố kết quả
ghi acceptances
Nghiệm thu chờ phê duyệt
acceptances/approve
6.1
Xác nhận khối lượng hoàn thành
đọc projects, acceptances; ghi settlements.faculty_confirmed
Xác nhận hoàn thành
faculty/completion-confirmations
6.2
Rà soát hồ sơ đề cử (Mẫu 5)
ghi award_nominations
Đề cử giải
award-nominations/review
6.3
Trình duyệt khen thưởng và quyết toán
ghi award_nominations, budgets
Phê duyệt khen thưởng
award-nominations/approve
6.4
Cấp giấy chứng nhận
ghi certificates, lecturer_hours
Giấy chứng nhận; Giờ NCKH
certificates/issue, lecturer-hours
6.5
Cập nhật quyền lợi, điểm thưởng
ghi student_bonus
Điểm thưởng
student-bonuses
6.6
Thanh quyết toán kinh phí
ghi settlements, budgets
Quyết toán
/settlements
7.1
Lưu trữ công trình vào thư viện số
ghi project_documents (index, visibility)
Thư viện (QLKHCN)
library/publish
7.2
Tra cứu công trình, đề tài
đọc project_documents, projects
Thư viện số
library/search
7.3
Thống kê giờ NCKH của giảng viên
đọc lecturers, lecturer_hours, project_advisors
Thống kê giờ
stats/lecturer-hours
7.4
Thống kê đề tài theo Khoa
đọc projects, progress_reports, acceptances
Thống kê Khoa
stats/projects
7.5
Kết xuất biểu mẫu chuẩn
đọc theo từng mẫu
Kết xuất biểu mẫu
exports/forms
8.1
Cấu hình lịch trình mốc hạn
ghi period_milestones
Đợt NCKH, tab Mốc
/periods/{id}/milestones
8.2
Theo dõi mốc, tạo hàng đợi thông báo
đọc period_milestones, projects, progress_reports; ghi notifications
(hệ thống)
cron, admin/notifications
8.3
Nhắc việc sinh viên
ghi notifications
Thông báo
/notifications
8.4
Nhắc việc giảng viên
ghi notifications
Thông báo
/notifications
8.5
Gửi qua Email, SMS, Zalo OA
đọc users; ghi notifications.delivery_status
(hệ thống)
hàng đợi gửi tin
8.6
Lập báo cáo phát hành, cảnh báo chậm trễ
đọc notifications
Báo cáo gửi tin
admin/notifications/report
