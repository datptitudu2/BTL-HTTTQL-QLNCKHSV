# KỊCH BẢN KIỂM THỬ TOÀN DIỆN HỆ THỐNG SRMS (THEO ERD & QUY CHẾ QĐ 521/QĐ-HV)

Tài liệu này tổng hợp **toàn bộ danh mục tài khoản, bản đồ ánh xạ ERD (Kho D1 – D9), dữ liệu mẫu đang có trên DB** và **tất cả kịch bản kiểm thử (Happy Path + Ràng buộc nghiệp vụ / Edge Cases)** để các thành viên trong nhóm kiểm thử đồng bộ trên môi trường local.

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:4000/api`
- **Mật khẩu mặc định mọi tài khoản:** `ptit@123`

---

## PHẦN 1: DANH MỤC 15 TÀI KHOẢN KIỂM THỬ CHUẨN (KHO D1)

| STT | Vai trò hiển thị | Username (`Login`) | User DB (`sso_username`) | Mã định danh / Đơn vị | Mục đích test chính |
|---:|---|---|---|---|---|
| 1 | **Sinh viên (đã có đề tài)** | `an.nv` | `sv001` | `B23DCCN001` • CNTT 1 | Đề tài `SV-2026-CNTT1-001` (`ACCEPTED` Xuất sắc): Xem GCN QR, chứng từ, thông báo, nhắc lịch |
| 2 | **SV mới (chưa có đề tài)** | `sv.moi` | `sv015` | `B23DCCN099` • CNTT 1 | Test đăng ký đề tài mới (`/projects/new`), mời thành viên (`sv016..sv019`), test chặn SV trùng đề tài |
| 3 | **GVHD (CNTT)** | `dungnq` | `gv001` | `GV001` • CNTT 1 (2 đề tài) | Test full quota 2 đề tài/năm, duyệt đề cương Cấp 1 (`SV-2026-CNTT1-002`), nhận xét tiến độ, Chủ tịch HĐ 04 |
| 4 | **GVHD (DL)** | `hungvt` | `gv006` | `GV006` • CNTT 1 (1 đề tài) | GVHD đề tài `SV-2026-CNTT1-003` (`SUBMITTED`) |
| 5 | **GVHD (ĐPT)** | `tritd` | `gv002` | `GV002` • ĐPT (2 đề tài) | Thư ký HĐ 04, GVHD `SV-2026-DPT-001` (`ACCEPTED`), xem giờ chuẩn NCKH |
| 6 | **GVHD (QTKD)** | `huydq` | `gv003` | `GV003` • QTKD 1 (2 đề tài) | Phản biện 1 HĐ 04, GVHD đề tài `SV-2026-QTKD1-002` (`PROPOSED`) |
| 7 | **GVHD (ATTT)** | `tuannv` | `gv004` | `GV004` • ATTT (2 đề tài) | Phản biện 2 HĐ 04, xem đề tài `SV-2026-ATTT-001`, `002` |
| 8 | **GV Hội đồng (Mới)** | `hungnq` | `gv007` | `GV007` • CNTT 1 (**0 đề tài HD**) | **Case GV được mời tham dự Hội đồng:** Không HD đề tài nào, chỉ thấy thông báo mời & chấm Phiếu 4.1 tại HĐ 04 |
| 9 | **Thư ký Khoa** | `thukycntt1` | `tk001` | Khoa CNTT 1 | Sơ tuyển đề tài `PROPOSED`, lập công văn Mẫu 1, triệu tập Sinh hoạt KH Mẫu 3.5, thành lập HĐ Nghiệm thu |
| 10 | **Trưởng Khoa** | `khoacntt1` | `lead001` | Khoa CNTT 1 | Duyệt Đề cương Cấp 2 (`ADVISOR_APPROVED`), duyệt Đơn gia hạn (`SV-2026-CNTT1-002`), Khoa xác nhận chứng từ D7 |
| 11 | **Phòng QLKH&CN** | `qlkhcn` | `qlkh001` | Phòng QLKH&CN | Quản lý Đợt NCKH (`/periods`), thẩm định tổng hợp, giao kinh phí đợt, phê duyệt kết quả HĐ & đề cử Giải thưởng |
| 12 | **Ban Giám Đốc** | `bgiangdoc` | `bgd001` | Ban Giám Đốc | Phê duyệt Quyết định giao đề tài (QĐ) từ `FACULTY_APPROVED` -> `ASSIGNED`/`ONGOING`, duyệt Giải thưởng Mẫu 5 |
| 13 | **Phòng TCKT** | `tckt` | `tckt001` | Phòng TCKT | Kiểm tra hóa đơn VAT & giải ngân chứng từ đã được Khoa xác nhận (`PC-2027-002`, `PC-2027-004`) |
| 14 | **Phòng CT&CTSV** | `ctsv` | `ctsv001` | Phòng CT&CTSV | Đối soát & duyệt cộng ĐRL (+10/+8/+6) và điểm ưu tiên học bổng cho SV (`B23DCCN001`, `B23DCCN002`) |
| 15 | **Quản trị viên** | `admin` | `admin` | Toàn hệ thống | Toàn quyền xem/điều phối mọi kho D1–D9, thông báo, lịch toàn Học viện |

**Sinh viên tự do chưa có đề tài (dùng để test thêm thành viên nhóm ở `/projects/new`):**
- `B23DCCN099` — Lê Hoàng Nam (`sv015`)
- `B23DCCN101` — Nguyễn Minh Anh (`sv016`)
- `B23DCCN102` — Phạm Thảo Vy (`sv017`)
- `B23DCAT025` — Vũ Đức Mạnh (`sv018`)
- `B23DCDT022` — Lê Bảo Ngọc (`sv019`)

---

## PHẦN 2: BẢN ĐỒ DỮ LIỆU MẪU HIỆN TẠI THEO ERD (KHO D1 – D9)

| Kho ERD | Các bảng DB (`schema.prisma`) | Dữ liệu mồi sẵn sàng để kiểm thử |
|---|---|---|
| **D1 — Tài khoản & Hồ sơ** | `roles`, `users`, `departments`, `dept_positions`, `students`, `lecturers` | 15+ tài khoản vai trò, 8 đơn vị (`CNTT1`, `DPT`, `QTKD1`, `ATTT`, `DTVT1`, `TCKT`, `QLKHCN`, `CTSV`), 17 SV, 7 GV (`GV001..GV007`) |
| **D2 — Kế hoạch & Đợt** | `nckh_periods`, `period_milestones`, `evaluation_criteria` | Đợt **2026–2027** (`ACTIVE`), các mốc hạn (Đăng ký -> Nộp đề cương -> Tiến độ giữa kỳ -> Sinh hoạt KH -> Nghiệm thu), 7 tiêu chí chấm tổng **100 điểm** |
| **D3 — Đề tài & Nhóm** | `projects`, `project_members`, `project_advisors` | 10 đề tài phủ đủ trạng thái (`PROPOSED`, `FACULTY_APPROVED`, `ONGOING`, `SUBMITTED`, `ACCEPTED`, `REJECTED`) |
| **D4 — Đề cương & Tiến độ** | `outlines`, `outline_approvals`, `progress_reports`, `seminars`, `seminar_members`, `change_requests`, `request_approvals` | `SV-2026-DTVT1-001` (`PENDING`), `SV-2026-CNTT1-002` (`ADVISOR_APPROVED`, kèm đơn gia hạn chờ Trưởng khoa), Seminar `132/GM-CNTT1` (`INVITED` chờ RSVP) |
| **D5 — Hồ sơ & Quyết định** | `faculty_dossiers`, `decisions` | Hồ sơ Khoa CNTT 1, `SV-2026-ATTT-002` (`FACULTY_APPROVED` chờ BGĐ/QLKHCN ra QĐ giao đề tài) |
| **D6 — Nghiệm thu & Tài liệu** | `project_documents`, `councils`, `council_members`, `acceptances`, `evaluation_sheets`, `sheet_scores` | **HĐ 01–03** (`SV-2026-CNTT1-001`, `DPT-001`, `ATTT-001`) đã nghiệm thu; **HĐ 04 (`155/QĐ-HV`, `SV-2026-CNTT1-003`)** đang `PENDING` 0/5 phiếu chờ chấm live |
| **D7 — Kinh phí & Quyết toán** | `budgets`, `settlements` | `PC-2027-001` (Đã giải ngân), `PC-2027-002` & `PC-2027-004` (Khoa đã XN -> Chờ TCKT), `PC-2027-003` & `PC-2027-005` (Mới nộp -> Chờ Khoa XN) |
| **D8 — Khen thưởng & Quyền lợi** | `certificates`, `lecturer_hours`, `student_bonus`, `award_nominations` | 3 GCN sinh viên QR (`GCN-NCKH-2027-001..003`), giờ chuẩn GV (`GV001`, `GV002`, `GV004`), điểm ĐRL (`B23DCCN001..002` chờ CTSV), 2 đề cử Mẫu 5 |
| **D9 — Lịch & Thông báo** | `notifications`, `schedule_events`, `notification_templates` | Thông báo tách riêng từng `user_id`, nút `Xác nhận đã đọc`, nút `Nhắc nhở tôi` trên lịch `/calendar`, giấy mời HĐ 04 riêng cho `hungnq` |

---

## PHẦN 3: PHÂN CHIA KIỂM THỬ CHO 3 NGƯỜI (KỊCH BẢN CHI TIẾT)

> **Gợi ý chia 3 luồng độc lập:**
> - **Người 1:** Đăng nhập, Phân quyền D1, Đợt D2, Đăng ký đề tài D3 & Ràng buộc hạn mức.
> - **Người 2:** Đề cương 2 cấp, Tiến độ, Hội thảo Mẫu 3.5 RSVP, Đơn gia hạn D4 & Quyết định D5.
> - **Người 3:** Nghiệm thu Hội đồng D6 (bao gồm `hungnq`), Kinh phí D7, Khen thưởng QR D8, Thông báo D9 & Kho Biểu mẫu/GWDU.

---

### BỘ KỊCH BẢN A — XÁC THỰC, ĐĂNG KÝ ĐỀ TÀI & RÀNG BUỘC ERD (D1, D2, D3)

#### TC-A1: Đăng nhập & cô lập dữ liệu theo vai trò (`D1`, `D9`)
1. Vào `/login`: Kiểm tra giao diện toàn màn hình đỏ PTIT bên trái, tab duy nhất **Tài khoản Định danh PTIT** và danh sách **15 tài khoản test nhanh**.
2. Đăng nhập bằng **`sv.moi`** (Lê Hoàng Nam - `sv015`):
   - **Kỳ vọng:** Header hiển thị `Lê Hoàng Nam`. Mở chuông thông báo trên góc phải chỉ thấy **đúng 1 thông báo mở đợt đăng ký cho `sv015`**, KHÔNG lẫn thông báo của SV khác (`an.nv`).
3. Đăng nhập bằng **`hungnq`** (TS. Nguyễn Quang Hưng - `gv007`):
   - **Kỳ vọng:** Thấy thông báo khẩn *"Giấy mời tham dự Hội đồng Nghiệm thu 04 (QĐ 155/QĐ-HV)"*.

#### TC-A2: Đăng ký Đề tài mới & AutoComplete thành viên/GVHD (`/projects/new`)
1. Đăng nhập **`sv.moi`** -> Mở menu **Đăng ký đề tài mới**.
2. Kiểm tra phần thành viên: Chủ nhiệm mặc định điền sẵn thông tin `Lê Hoàng Nam (B23DCCN099)`.
3. Ở ô thêm thành viên nhóm:
   - Thử **nhập tự do tên hoặc tìm kiếm** trong AutoComplete các SV chưa có đề tài (`sv016` / `B23DCCN101`, `sv017` / `B23DCCN102`). Xác nhận chọn/nhập được **tên SV + mã SV** mượt mà.
4. Ở ô chọn Giảng viên hướng dẫn:
   - Thử chọn GVHD đã đủ **2 đề tài/năm** (như `TS. Ngô Quốc Dũng - GV001`): hệ thống phải **cảnh báo / vô hiệu hóa hoặc chặn API** vì vượt giới hạn `active_project_count >= 2` theo QĐ 521.
   - Chọn GVHD còn trống slot (ví dụ `TS. Vũ Trọng Hùng - GV006` đang `1/2` hoặc `TS. Nguyễn Quang Hưng - GV007` đang `0/2`).
5. Điền đủ thông tin đề cương rút gọn -> Kiểm tra nút **`Gửi hồ sơ đăng ký đề tài`** kích thước vừa vặn, căn chỉnh gọn đẹp -> Bấm gửi.
   - **Kỳ vọng:** Đề tài mới được sinh mã tự động chuẩn `SV-2026-KHOA-XXX` (từ `project_code_counters`), trạng thái `PROPOSED`.

#### TC-A3: Test ràng buộc 1 Sinh viên <= 1 Đề tài / năm học (Negative Case)
1. Đăng nhập **`an.nv`** (đã là chủ nhiệm `SV-2026-CNTT1-001`) hoặc dùng **`sv.moi`** sau khi vừa đăng ký xong ở TC-A2, mở `/projects/new` và thử gửi thêm 1 đề tài nữa.
   - **Kỳ vọng:** Giao diện cảnh báo đã có đề tài trong đợt 2026–2027 / API trả lỗi nghiệp vụ từ chối tạo mới.
2. Khi mời thành viên ở TC-A2, thử nhập `B23DCCN001` (đã có đề tài): hệ thống chặn không cho ghép trùng nhóm.

#### TC-A4: Quản lý Đợt NCKH & Sơ tuyển Khoa -> Phê duyệt BGĐ (`/periods`, `/projects`)
1. Đăng nhập **`qlkhcn`** -> Mở `/periods`: Kiểm tra danh sách Đợt NCKH 2026–2027, quota đề tài, trần kinh phí và các mốc hạn (`period_milestones`).
2. Đăng nhập **`thukycntt1`** -> Mở `/projects`: Chọn đề tài `PROPOSED` thuộc **Khoa CNTT 1** (ví dụ đề tài mới tạo của `sv.moi` ở TC-A2), thực hiện **Sơ tuyển / Tổng hợp hồ sơ Khoa (`FACULTY_APPROVED`)**. *(Lưu ý: `thukycntt1` không có quyền duyệt đề tài của Khoa khác như `SV-2026-QTKD1-002` — hệ thống sẽ ẩn nút duyệt và chặn `403` ở API nếu cố thao tác chéo Khoa).*
3. Đăng nhập **`bgiangdoc`** (hoặc `qlkhcn`) -> Mở `/projects`: Chọn `SV-2026-ATTT-002` (`FACULTY_APPROVED`), thực hiện **Ban hành Quyết định giao đề tài (`Decision`) -> Chuyển sang `ONGOING`**.

---

### BỘ KỊCH BẢN B — ĐỀ CƯƠNG 2 CẤP, TIẾN ĐỘ, HỘI THẢO MẪU 3.5 & GIA HẠN (D4, D5)

#### TC-B1: Phê duyệt Đề cương chi tiết 2 cấp (`/outlines`)
1. Kiểm tra trên chi tiết đề tài `/projects/SV-2026-CNTT1-001` tab **Đề cương chi tiết (Mẫu 2)**: hiển thị gọn gàng trạng thái phê duyệt 2 cấp + preview Mẫu 2 (không trùng lặp nút).
2. Mở `/outlines`:
   - Tài khoản **`dungnq`** hoặc GVHD tương ứng duyệt Cấp 1 cho đề cương `PENDING` (ví dụ `SV-2026-DTVT1-001` nếu dùng tài khoản `minhh` / `gv005` qua API, hoặc test nộp phiên bản đề cương mới từ tài khoản SV đang `ONGOING`).
   - Đăng nhập **`khoacntt1`** (Trưởng Khoa): Tìm `SV-2026-CNTT1-002` đang ở trạng thái **`ADVISOR_APPROVED`**, bấm **Phê duyệt Cấp 2** -> Trạng thái chuyển `FACULTY_APPROVED`.

#### TC-B2: Báo cáo tiến độ & Đánh giá GVHD (`/progress`)
1. Xem các báo cáo tiến độ của `SV-2026-CNTT1-002` (`ONGOING`).
2. Dùng GVHD (`dungnq`) đánh giá **`PASS`** hoặc **`WARNING_DELAY`** kèm nhận xét trên tab Báo cáo tiến độ.
   - **Kỳ vọng:** Lưu vào bảng `progress_reports`, cập nhật nhận xét hiển thị ngay cho sinh viên nhóm đó.

#### TC-B3: Sinh hoạt Khoa học Mẫu 3.5 & Xác nhận tham dự RSVP (`/progress`)
1. Vào tab **Sinh hoạt Khoa học (Mẫu 3.5)**: tìm cuộc họp mã mời **`132/GM-CNTT1`** của đề tài `SV-2026-CNTT1-002` (`status: INVITED`).
2. Đăng nhập bằng đại biểu có trong danh sách mời của đề tài `002` là **`dungnq`** (GVHD) hoặc chủ nhiệm `sv003` (`Lê Minh Khôi`) -> Thực hiện **RSVP** chọn `Tham gia trực tiếp (ACCEPTED_ONSITE)` / `Tham gia Online (ACCEPTED_ONLINE)` / `Từ chối`. *(Lưu ý: `an.nv` thuộc đề tài `001`, không nằm trong danh sách mời của `132/GM-CNTT1` nên hệ thống cô lập dữ liệu và không hiển thị cuộc họp này cho `an.nv`).*
   - **Kỳ vọng:** Bảng `seminar_members` cập nhật `rsvp_status` và `responded_at`; danh sách thành viên đổi badge màu ngay lập tức.
3. Đăng nhập **`thukycntt1`**: Triệu tập mới hoặc cập nhật biên bản/nhận xét cho buổi Sinh hoạt KH (hoàn tất `COMPLETED`).

#### TC-B4: Đơn xin gia hạn / Điều chỉnh Đề tài (`/progress`)
1. Đăng nhập **`khoacntt1`** (Trưởng Khoa): Mở trang **`/progress`** -> tab **Đơn Điều chỉnh / Gia hạn**, kiểm tra đơn **`EXTENSION`** của `SV-2026-CNTT1-002` (GVHD `dungnq` đã duyệt bước 1 `ADVISOR`, đang chờ `FACULTY_LEADER`).
2. Bấm duyệt cấp Khoa -> Đăng nhập **`qlkhcn`** duyệt bước cuối + cấp số QĐ (`decision_no`).
   - **Kỳ vọng:** Chuỗi `request_approvals` ghi nhận đủ 3 cấp `ADVISOR -> FACULTY_LEADER -> QLKHCN`.

---

### BỘ KỊCH BẢN C — NGHIỆM THU HỘI ĐỒNG, KINH PHÍ, KHEN THƯỞNG, THÔNG BÁO & TÀI LIỆU SỐ (D6, D7, D8, D9)

#### TC-C1: Giảng viên được mời tham dự Hội đồng & Chấm điểm Phiếu 4.1 (`/acceptance`)
> **Đây là case mới bổ sung riêng cho kịch bản Hội đồng độc lập!**
1. Đăng nhập **`hungnq`** (TS. Nguyễn Quang Hưng — `GV007`, **0 đề tài hướng dẫn**).
2. Vào menu **Đề tài hướng dẫn (GVHD)** (hoặc `/projects`): kiểm tra TS. Hưng **không** giữ đề tài hướng dẫn nào.
3. Mở **Chuông thông báo**: thấy thông báo mời Hội đồng Nghiệm thu 04 -> Bấm để nhảy tới `/acceptance` (hoặc vào trực tiếp tab **Nghiệm thu & Đánh giá**).
4. Kiểm tra giao diện phần trên của `/acceptance`: **4 thẻ KPI pastel** chuẩn S-Link PTIT (`Hội đồng phụ trách: 1`, `Đã phê duyệt P.QLKHCN: 0`, `Đạt Xuất sắc / Tốt: 0`, `Có phiếu lệch > 15đ: 0`).
5. Tại card **Hội đồng 04 (`155/QĐ-HV` — đề tài `SV-2026-CNTT1-003`)**:
   - Bấm **`Chấm điểm Phiếu 4.1 (Ủy viên)`**.
   - Thử nhập điểm vượt mức tối đa từng tiêu chí hoặc chưa đủ -> Kiểm tra validate tổng điểm 7 tiêu chí tối đa **100 điểm**.
   - Nhập điểm hợp lệ + nhận xét -> Lưu phiếu (`evaluation_sheets` & `sheet_scores`).
6. *(Mở rộng test Mẫu 4.2)* Đăng nhập thêm các thành viên khác của HĐ 04 (`dungnq`, `huydq`, `tuannv`, `tritd`) chấm điểm, cố tình cho 1 phiếu lệch **> 15 điểm** so với trung bình:
   - **Kỳ vọng:** Hệ thống tự động đánh dấu `is_outlier = true` (loại trừ phiếu lệch theo Mẫu 4.2), tính lại điểm trung bình và cập nhật KPI **"Có phiếu lệch > 15đ (Mẫu 4.2)"**.
7. Đăng nhập **`qlkhcn`**: Phê duyệt kết quả nghiệm thu chính thức (`approval_doc_no`) -> Kiểm tra trạng thái đề tài chuyển `ACCEPTED`.

#### TC-C2: Thanh quyết toán Kinh phí 3 bước (`/budgets`)
1. Kiểm tra phần trên của `/budgets`: **3 thẻ KPI pastel** (`Tổng kinh phí được duyệt`, `Tổng đã giải ngân`, `Số chứng từ chờ duyệt`) + nút **Hạn mức từng Đề tài** mở Drawer xem từng đề tài.
2. Đăng nhập **`an.nv`** (hoặc chủ nhiệm đề tài có ngân sách `APPROVED`): Bấm **`Kê khai chứng từ quyết toán`**, nhập số chứng từ, hóa đơn VAT, số tiền hợp lệ không vượt hạn mức còn lại -> Gửi (`facultyConfirmed = false`).
3. Đăng nhập **`khoacntt1`** (hoặc `thukycntt1`): Tìm chứng từ **`PC-2027-003`** (hoặc `PC-2027-005` / chứng từ vừa tạo) -> Bấm **`Khoa xác nhận`** -> Trạng thái đổi thành *"Khoa đã xác nhận • Chờ P.TCKT"*.
4. Đăng nhập **`tckt`**:
   - Với chứng từ **`PC-2027-002`** (`SV-2026-CNTT1-001` đã `ACCEPTED`) & `PC-2027-004` (`SV-2026-DPT-001` đã `ACCEPTED`): Bấm **`P.TCKT Giải ngân`** -> Thành công, cập nhật `settled_at` & tổng tiền đã giải ngân.
   - *(Test ràng buộc Điều 5.2.b QĐ 521)* Nếu chứng từ thuộc đề tài chưa nghiệm thu đạt (`PENDING` / `KHONG_DAT`), nút **Giải ngân** phải bị vô hiệu hóa (`disabled` kèm Tooltip giải thích).

#### TC-C3: Khen thưởng Mẫu 5, Giấy chứng nhận QR (chỉ SV) & Cộng ĐRL (`/awards`, `/verify-cert`)
1. Kiểm tra phần trên của `/awards`: thiết kế thẻ pastel gọn đẹp đồng bộ S-Link; cột tổng hợp hiển thị đúng vai trò (**SV chỉ thấy GCN & ĐRL của mình**, không thấy cột giờ chuẩn GV).
2. Kiểm tra tab **Giấy chứng nhận số**:
   - **Kỳ vọng:** Chỉ cấp và hiển thị **Giấy chứng nhận cho Sinh viên** (`GCN-NCKH-2027-001`, `002`, `003`), **KHÔNG** có GCN của Giảng viên hướng dẫn (`GCN-GVHD-...` đã bị loại bỏ).
   - Bấm **`Mở bản số & QR`** -> Mở trang công khai `/verify-cert?code=GCN-NCKH-2027-001` (không cần login vẫn quét QR tra cứu xác thực được).
3. Đăng nhập **`ctsv`**: Mở tab **ĐRL & Điểm học bổng SV**, tìm `B23DCCN001` & `B23DCCN002` đang `PENDING` (+10 ĐRL, +0.4đ học bổng) -> Bấm **Duyệt quyết định cộng điểm** (`TB-CTSV/...`).
4. Đăng nhập **`qlkhcn`** / **`bgiangdoc`**: Mở tab **Giải thưởng Mẫu 5**, duyệt đề cử Giải Nhì của `SV-2026-DPT-001`.
5. Đăng nhập **`dungnq`** / **`tritd`**: Kiểm tra tab **Giờ chuẩn NCKH GVHD** hiển thị đúng số giờ quy đổi từ `lecturer_hours`.

#### TC-C4: Lịch làm việc, Nút "Nhắc nhở tôi" & Chuông Thông báo Realtime (`/calendar`, Header Bell)
1. Đăng nhập bất kỳ tài khoản nào (ví dụ **`an.nv`** hoặc **`hungnq`**) -> Mở `/calendar`.
2. Bấm vào một sự kiện bất kỳ trên lịch để mở modal **`Chi tiết lịch làm việc NCKH`**.
3. Bấm nút **`Nhắc nhở tôi`** ở chân modal -> Thấy toast thông báo *"Đã tạo nhắc nhở vào Hộp thư Thông báo (D9)!"*.
4. Quan sát **Chuông thông báo** trên góc phải header:
   - **Kỳ vọng:** Số đếm unread tăng ngay lập tức (không cần F5). Mở chuông ra thấy bản ghi *"Nhắc lịch: ..."* vừa tạo.
5. Bấm nút nhỏ **`Xác nhận đã đọc`** ngay trên dòng thông báo chưa đọc:
   - **Kỳ vọng:** Dòng thông báo chuyển sang trạng thái **`Đã xác nhận đọc`** (lưu `is_confirmed = true`, `read_at` xuống bảng `notifications`), số badge trên chuông giảm đi 1; click nội dung thông báo điều hướng đúng tới trang đích (`target_url`).
6. Bấm **`Đánh dấu đã đọc tất cả`** -> Toàn bộ thông báo chuyển đã đọc, badge chuông về 0.

#### TC-C5: Bộ 3 tab Hồ sơ & Văn bản quy định + Sidebar (`/forms`, `/gwdu`, `/regulations`)
1. Bấm nút thu nhỏ/mở rộng thanh menu bên trái dưới cùng: kiểm tra nút có **nền màu đỏ PTIT** (`#C62828`) nổi bật.
2. Kiểm tra lần lượt 3 tab dưới mục **HỒ SƠ & VĂN BẢN QUY ĐỊNH** để xác nhận nội dung tách bạch, không lặp:
   - **Biểu mẫu chuẩn QĐ 521 (`/forms`):** Danh mục tải/mẫu chuẩn các biểu mẫu trống (Mẫu 1, 2, 3.1–3.5, 4.1–4.2, 5).
   - **Tài liệu số GWDU (`/gwdu`):** Trình đọc & xuất/in A4 các văn bản đã số hóa điền sẵn dữ liệu thực tế theo từng đề tài.
   - **Quy định 521 & ISO (`/regulations`):** Tra cứu các điều khoản quy chế QĐ 521/QĐ-HV và lưu đồ ISO.

---

## PHẦN 4: LỆNH KIỂM TRA NHANH KỸ THUẬT TRƯỚC KHI CHỐT BẢN DEMO

```powershell
# 1. Kiểm tra TypeScript Backend
pnpm --filter @srms/api exec tsc --noEmit

# 2. Kiểm tra TypeScript & Build Production Frontend
pnpm --filter @srms/web run build

# 3. Khởi động lại sạch dữ liệu Seed (chú ý: chỉ dùng khi muốn reset toàn bộ về trạng thái gốc)
pnpm --filter @srms/api exec prisma db push --force-reset --schema=../../prisma/schema.prisma
pnpm prisma:seed
```

> **Lưu ý khi báo lỗi:** Nếu phát hiện bất kỳ sai lệch nào giữa giao diện, API và ERD (D1–D9), vui lòng ghi lại **Tài khoản test + Đường dẫn URL + Bước thao tác + Kết quả thực tế vs Kỳ vọng** để fix dứt điểm trước buổi bảo vệ.
