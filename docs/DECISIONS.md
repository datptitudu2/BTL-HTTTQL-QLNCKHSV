# Architecture Decision Records (ADR) & Đối chiếu ERD v10 ↔ Physical Schema (`schema.prisma`)

Tài liệu này ghi nhận toàn bộ quyết định thiết kế cơ sở dữ liệu vật lý (`prisma/schema.prisma`), ràng buộc mức CSDL (`prisma/migrations/20261115000000_erd_v10_constraints/migration.sql`) và dữ liệu khởi tạo (`prisma/seed.ts`) trong mối tương quan với **Lược đồ CSDL chuẩn 3NF (`SRMS_ERD_v2.pdf` / `SRMS_ERD_v10.drawio`, 34 bảng nghiệp vụ)** và **Quy định QĐ 521/QĐ-HV**.

---

## 1. Định mức Nghiệp vụ QĐ 521/QĐ-HV (Mục 0 & Việc 1, Việc 5)

| Quy định | Căn cứ pháp lý | Giới hạn áp dụng & Luật tính | Nơi kiểm tra (Source of Truth + DB Trigger) | Mã lỗi chuẩn |
| :--- | :--- | :--- | :--- | :--- |
| Định mức đề tài của Sinh viên | **Điều 15 khoản 2 điểm a** QĐ 521/QĐ-HV | Tối đa **01 đề tài / năm học** (tính cả vai trò `LEAD` và `MEMBER`, bao gồm cả đề tài đã `ACCEPTED` trong năm học đó; chỉ loại trừ lời mời `DECLINED` và đề tài `REJECTED`/`CANCELLED`) | `ProjectsService.create`, `ProjectsService.inviteMember` + DB Trigger `trg_enforce_student_and_team_limits` | `STUDENT_PROJECT_LIMIT_EXCEEDED` |
| Định mức hướng dẫn của Giảng viên | **Điều 16 khoản 2 điểm a** QĐ 521/QĐ-HV | Tối đa **02 đề tài đang hướng dẫn cùng thời gian**. Định nghĩa thống nhất qua hằng số `TERMINAL_PROJECT_STATUSES = ['REJECTED', 'CANCELLED', 'ACCEPTED']`: chỉ đếm các bản ghi `project_advisors.status = 'ACTIVE'` mà `projects.status NOT IN ('REJECTED', 'CANCELLED', 'ACCEPTED')` | `ProjectsService.assignAdvisor`, `ProjectsService.respondAdvisorInvite`, `ProjectsService.syncLecturerActiveCount`, `UsersService.findLecturers`, `seed.ts` + DB Trigger `trg_enforce_advisor_quota` | `ADVISOR_QUOTA_EXCEEDED` |
| Quy mô nhóm nghiên cứu | **Điều 9 khoản 2** QĐ 521/QĐ-HV | Tối đa **05 sinh viên / đề tài**, đúng **01 Chủ nhiệm (`LEAD`)**, tổng tỷ lệ đóng góp = `100%` | `ProjectsService.create`, `ProjectsService.inviteMember` + Partial Unique Index `uq_project_members_one_lead_per_project` + DB Trigger `trg_enforce_student_and_team_limits` | `TEAM_SIZE_EXCEEDED` |
| Trần điểm tiêu chí Mẫu 4.1 | **Điều 10 & Phụ lục Mẫu 4.1** QĐ 521/QĐ-HV | `0 <= sheet_scores.score <= evaluation_criteria.max_score`, tổng `max_score` 7 tiêu chí = `100.0` | `AcceptanceService.submitScoreSheet` + DB Trigger `trg_enforce_sheet_score_bounds` | `SCORE_OUT_OF_RANGE` |
| Quy đổi điểm thưởng học tập SV | **Điều 15 khoản 2 điểm h** QĐ 521/QĐ-HV | Hỗ trợ đầy đủ cả **Giải Quốc tế** (Nhất `+3.0`, Nhì `+2.5`, Ba `+2.0`, KK `+1.5`) và **Giải Trong nước / Cấp Bộ / Học viện** (Nhất `+0.4`, Nhì `+0.3`, Ba `+0.2`, KK `+0.1`) dựa trên `award_nominations.award_level` (`INTERNATIONAL` vs `MINISTRY` / `INSTITUTE`) | `AwardsService.approveNomination` | — |

---

## 2. Các Cột Phi chuẩn hóa có Kiểm soát & Cặp cột Tương thích UI (Mục A & Việc 2, Việc 3)

### 2.1. Các cột đã loại bỏ hoàn toàn khỏi `schema.prisma`
- **`EvaluationSheet.scorePaperBonus`:** Đã xóa. Điểm thưởng công bố khoa học chính là **Tiêu chí số 7** (tối đa 5.0 điểm) trong `sheet_scores`.
- **`StudentBonus.creditBonus`:** Đã xóa (QĐ 521 chỉ quy định cộng điểm thưởng học tập `bonus_points` và điểm rèn luyện `training_score`).
- **`Project.prelimScore` & `Project.prelimRank`:** Đã xóa (Việc 3). Sơ tuyển cấp Khoa (Mẫu 1) không chấm điểm số, chỉ lưu kết quả tại cột chuẩn ERD **`Project.prelimResult`** (`prelim_result`: `APPROVED`, `REJECTED`, `REVISE`).

### 2.2. Bảng kiểm soát 6 điều kiện cho các cột Đệm / Bản chụp (Snapshot) & Cặp cột Đồng bộ
Mọi cột giữ lại đều thỏa mãn 6 điều kiện: (1) Nguồn gốc 3NF rõ ràng; (2) Chỉ cập nhật qua hàm Service duy nhất trong cùng giao dịch; (3) Kiểm tra nghiệp vụ dùng bảng gốc; (4) Có truy vấn đối chiếu; (5) Khóa cứng sau phê duyệt; (6) Ghi nhận tại bảng dưới đây:

| Bảng (`@@map`) | Cột đệm / Cột tương thích UI | Cột / Bảng gốc chuẩn ERD v10 (Source of Truth) | Hàm duy nhất ghi & Quy tắc đồng bộ / Khóa |
| :--- | :--- | :--- | :--- |
| `evaluation_sheets` | `totalScore` (`total_score`) | `SUM(sheet_scores.score)` theo `sheet_id` (7 tiêu chí Mẫu 4.1) | `AcceptanceService.submitScoreSheet` & `recalculateAcceptanceGrade`. Khóa cứng bằng cả Service lẫn DB Trigger `trg_lock_approved_evaluation_sheet` khi `acceptances.approval_doc_no IS NOT NULL` |
| `evaluation_sheets` | `isOutlier` (`is_outlier`) | `ABS(totalScore - AVG_ban_dau) > 15` (Mẫu 4.2 QĐ 521, áp dụng cho mọi phiếu chấm không kèm điều kiện số lượng phiếu tối thiểu) | `AcceptanceService.recalculateAcceptanceGrade`. Khóa cứng khi `acceptances.approval_doc_no IS NOT NULL` |
| `evaluation_sheets` | `qaNotes` (`qa_notes`), `recommendAward` (`recommend_award`), `submittedAt` (`submitted_at`) | Cột chuẩn ERD: `qaComment` (`qa_comment`), `conclusionAwardRec` (`conclusion_award_rec` - Khung 4), `scoredAt` (`scored_at`) | `AcceptanceService.submitScoreSheet` và `seed.ts` luôn ghi đồng thời vào cả cột chuẩn ERD và cột tương thích UI |
| `lecturers` | `activeProjectCount` (`active_project_count`) | `COUNT(project_advisors WHERE status = 'ACTIVE' AND project.status NOT IN ('REJECTED', 'CANCELLED', 'ACCEPTED'))` | `ProjectsService.syncLecturerActiveCount`. Kiểm tra quota dùng trực tiếp `project_advisors` + Trigger `trg_enforce_advisor_quota` |
| `outlines` | `approvalStatus`, `advisorComment` | Bản ghi duyệt trong `outline_approvals` | `ProgressService.reviewOutline`. Lưu ý về `@@unique([outlineId, role])`: Khi đề cương bị `REVISION_REQUIRED` (Yêu cầu sửa), sinh viên nộp lại sẽ tạo bản ghi `Outline` mới với `versionNo = versionNo + 1` (`outlineId` mới), nên mỗi `outlineId` mỗi vai trò (`ADVISOR`, `FACULTY_LEADER`) chỉ duyệt đúng 1 lượt |
| `seminars` | `feedback` | Cột chuẩn ERD: `discussion`, `overallAssessment` (`overall_assessment`), `revisionRequests` (`revision_requests`) | `ProgressService.saveMinutes` và `seed.ts` luôn ghi đồng bộ `discussion` cùng `overallAssessment`, `revisionRequests` và `feedback` |
| `award_nominations` | `supportFund`, `status` | Cột chuẩn ERD: `supportAmount` (`support_amount`), `qlkhReviewStatus` (`qlkh_review_status`), `approvalStatus` (`approval_status`). Bộ giá trị cho phép: `'PENDING' \| 'APPROVED' \| 'REJECTED'` (ràng buộc bởi `chk_award_nominations_qlkh_status` & `chk_award_nominations_approval_status`) | `AwardsService.createNomination` & `AwardsService.approveNomination` và `seed.ts` luôn ghi đồng bộ cả `supportAmount` và 2 trạng thái `qlkhReviewStatus`, `approvalStatus` |
| `departments` | `headName`, `secretaryName` | `dept_positions` (`roleType IN ('DEAN', 'SECRETARY') AND isActive = true`) | Phân quyền cấp Khoa trong toàn bộ Service truy vấn trực tiếp `dept_positions` |
| `lecturer_hours` | `lecturerId`, `projectId` | `project_advisors.lecturer_id`, `project_advisors.project_id` qua khóa ngoại bắt buộc `advisorAssignmentId` (`NOT NULL`) | `AcceptanceService.approveAcceptance` + DB Trigger `trg_verify_lecturer_hour_assignment` đảm bảo `lecturer_id` và `project_id` luôn khớp 100% với `advisor_assignment_id` |

---

## 3. Bảng Ánh xạ Máy trạng thái Đề tài (`Project.status` - Mục E & Việc 6)

| Mã trạng thái trong `schema.prisma` | Mã tương đương trong Plan | Nhãn hiển thị UI | Định nghĩa nghiệp vụ theo QĐ 521/QĐ-HV |
| :--- | :--- | :--- | :--- |
| `DRAFT` | `DRAFT` | Bản nháp | Sinh viên khởi tạo nháp, chưa gửi lên Khoa |
| `PROPOSED` | `SUBMITTED` | Chờ Khoa thẩm định | Nhóm SV đã nộp đăng ký đề tài, chờ GVHD xác nhận & Khoa sơ tuyển lập Mẫu 1 |
| `FACULTY_APPROVED` | `FACULTY_APPROVED` | Khoa đã duyệt (Mẫu 1) | Hội đồng Khoa đã sơ tuyển đạt (`prelim_result = 'APPROVED'`) và trình Công văn Mẫu 1 lên P.QLKHCN |
| `APPROVED` | `INSTITUTE_APPROVED` | Đã giao Quyết định | P.QLKHCN thẩm định và Ban Giám đốc ban hành Quyết định giao đề tài |
| `ONGOING` | `IN_PROGRESS` | Đang thực hiện | Nhóm SV đang nộp Đề cương Mẫu 2, Báo cáo tiến độ định kỳ & Hội thảo Mẫu 3.5 |
| `SUBMITTED` | `SUBMITTED_FINAL` | Chờ nghiệm thu | Nhóm SV đã nộp bộ hồ sơ báo cáo tổng kết (Mẫu 3.1 – 3.4) và kiểm tra tỷ lệ trùng lặp theo ngưỡng cấu hình của Học viện tại `system_settings` (`QD521_PLAGIARISM_THRESHOLD`, tham số quản trị do Học viện cấu hình, không cố định trong văn bản QĐ 521), chờ Hội đồng chấm |
| `ACCEPTED` | `EVALUATED` / `CLOSED` | Đã nghiệm thu | Hội đồng đã chấm (Mẫu 4.1, 4.2) và P.QLKHCN đã phê duyệt kết quả nghiệm thu hoàn tất (trạng thái kết thúc thành công) |
| `REJECTED` | `REJECTED` | Từ chối / Không đạt | Không qua sơ tuyển cấp Khoa (`prelim_result = 'REJECTED'`) hoặc kết quả nghiệm thu `< 50` điểm |
| `CANCELLED` | `CANCELLED` | Đã hủy theo Quyết định | Đề tài dừng thực hiện theo Đơn xin hủy (`ChangeRequest` loại `CANCELLATION`) đã được duyệt đủ 3 cấp (`ProgressService.approveChangeRequest`) |

---

## 4. Bảng Ánh xạ Tên cột DB (`@map`) giữa `schema.prisma` và ERD v10 (Mục E)

| Bảng (`@@map`) | Trường TypeScript & `@map` hiện tại | Tên cột trên bản vẽ ERD v10 | Ghi chú |
| :--- | :--- | :--- | :--- |
| `dept_positions` | `roleType` (`@map("role_type")`), `isActive` (`@map("is_active")`) | `position_role`, suy diễn từ `end_date` | Giữ `@map("role_type")` và cờ `is_active` có đánh index |
| `evaluation_criteria` | `title` (`@map("title")`), `isActive` (`@map("is_active")`) | `criteria_name`, `is_active` | Đã có `is_active` và `@@unique([periodId, orderNo])` |
| `outline_approvals` | `role` (`@map("role")`), `mode` (`@map("mode")`) | `approver_role`, `approval_mode` | Đã có `@@unique([outlineId, role])` và `@relation` tới `User` |
| `request_approvals` | `stage` (`@map("stage")`), `approvalMode` (`@map("approval_mode")`) | `approver_role`, `approval_mode` | Đã có `approval_mode` (`DIRECT` / `PROXY`) và `@relation` tới `User` |
| `project_advisors` | `advisorAssignmentId` (`@map("advisor_assignment_id")`), `assignedBy` (`@map("assigned_by")`), `assignedAt`, `endedAt`, `replaceReason` | `assignment_id`, `assign_type`, `start_date`, `end_date`, `change_reason` | Đương lượng 1–1; đã có Partial Unique Index `uq_project_advisors_one_active_per_project` |
| `project_documents` | `libraryCode` (`@map("library_code")`) | `library_index_code` | Mã chỉ mục lưu trữ Thư viện số Học viện |
| `seminar_members` | `role` (`@map("role")`), `userId` (nullable) | `seminar_role`, `user_id` | Đã có `@relation` tùy chọn tới `User` (cho phép `null` với khách mời ngoài dùng `attendeeName`) |
| `roles` | `description` (`@map("description")`) | `permissions` | Lưu mô tả phạm vi quyền hạn của từng vai trò |

---

## 5. Các Bảng & Cột Mở rộng ngoài ERD 3NF (Mục G)

1. **Bảng `schedule_events`:** Lưu lịch biểu hiển thị trên giao diện Lịch công tác tuần/tháng.
2. **Các cột hỗ trợ UX/UI tác nghiệp thời gian thực:**
   - `Notification`: `readAt`, `urgent`, `targetUrl`, `type`
   - `Seminar`: `meetingLink`, `invitationCode`, `status`, `feedback`
   - `SeminarMember`: `attendeeName`, `unit`, `email`, `rsvpStatus`, `respondedAt`
   - `Decision`: `decisionType` (`ASSIGN`, `REWARD`, `COUNCIL`)
   - `Acceptance`: `defenseTime`, `minutesNo`
3. **8 Bảng kỹ thuật hệ thống:** `user_credentials`, `refresh_tokens`, `password_reset_tokens`, `project_code_counters`, `system_settings`, `notification_templates`, `audit_logs`, `schedule_events`.
