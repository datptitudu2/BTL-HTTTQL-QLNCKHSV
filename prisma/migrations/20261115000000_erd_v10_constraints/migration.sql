-- 
-- SRMS PTIT - ERD v10 & QĐ 521/QĐ-HV Database-Level Constraints Migration
-- Bao gồm: Partial Unique Indexes, PL/pgSQL Triggers (Quota 1 SV/năm, 2 GV ACTIVE,
-- Tối đa 5 SV/nhóm, Trần điểm tiêu chí Mẫu 4.1) và CHECK Constraints.
-- 

-- 1. EXTENSIONS HỖ TRỢ TÌM KIẾM TRÙNG LẶP ĐỀ TÀI (PG_TRGM & UNACCENT)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE INDEX IF NOT EXISTS idx_projects_title_vi_trgm ON projects USING gin (title_vi gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_projects_title_en_trgm ON projects USING gin (title_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_projects_keywords_trgm ON projects USING gin (keywords gin_trgm_ops);

-- 2. PARTIAL UNIQUE INDEXES (CHỈ MỤC DUY NHẤT MỘT PHẦN)
-- 2.1. Mỗi đề tài chỉ có đúng 01 Giảng viên hướng dẫn đang ACTIVE cùng thời điểm
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_advisors_one_active_per_project
  ON project_advisors (project_id)
  WHERE status = 'ACTIVE';

-- 2.2. Mỗi đề tài chỉ có đúng 01 Sinh viên làm Chủ nhiệm (LEAD / LEADER)
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_members_one_lead_per_project
  ON project_members (project_id)
  WHERE member_role IN ('LEAD', 'LEADER') AND confirm_status <> 'DECLINED';

-- 2.3. Mỗi Hội đồng nghiệm thu chỉ có đúng 01 Chủ tịch (CHAIR) và 01 Thư ký (SECRETARY)
CREATE UNIQUE INDEX IF NOT EXISTS uq_council_members_one_chair_per_council
  ON council_members (council_id)
  WHERE council_role = 'CHAIR';

CREATE UNIQUE INDEX IF NOT EXISTS uq_council_members_one_secretary_per_council
  ON council_members (council_id)
  WHERE council_role = 'SECRETARY';

-- 3. CHECK CONSTRAINTS CHO CÁC GIÁ TRỊ LIỆT KÊ (ENUM CHECK)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_projects_status;
ALTER TABLE projects ADD CONSTRAINT chk_projects_status
  CHECK (status IN ('DRAFT', 'PROPOSED', 'FACULTY_APPROVED', 'APPROVED', 'ONGOING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'CANCELLED'));

ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_projects_prelim_result;
ALTER TABLE projects ADD CONSTRAINT chk_projects_prelim_result
  CHECK (prelim_result IS NULL OR prelim_result IN ('APPROVED', 'REJECTED', 'REVISE', 'PASSED', 'FAILED'));

ALTER TABLE change_requests DROP CONSTRAINT IF EXISTS chk_change_requests_type;
ALTER TABLE change_requests ADD CONSTRAINT chk_change_requests_type
  CHECK (request_type IN ('ADJUSTMENT', 'EXTENSION', 'CANCELLATION', 'CHANGE_ADVISOR'));

ALTER TABLE outline_approvals DROP CONSTRAINT IF EXISTS chk_outline_approvals_mode;
ALTER TABLE outline_approvals ADD CONSTRAINT chk_outline_approvals_mode
  CHECK (mode IN ('DIRECT', 'PROXY'));

ALTER TABLE request_approvals DROP CONSTRAINT IF EXISTS chk_request_approvals_mode;
ALTER TABLE request_approvals ADD CONSTRAINT chk_request_approvals_mode
  CHECK (approval_mode IN ('DIRECT', 'PROXY'));

ALTER TABLE award_nominations DROP CONSTRAINT IF EXISTS chk_award_nominations_qlkh_status;
ALTER TABLE award_nominations ADD CONSTRAINT chk_award_nominations_qlkh_status
  CHECK (qlkh_review_status IN ('PENDING', 'APPROVED', 'REJECTED'));

ALTER TABLE award_nominations DROP CONSTRAINT IF EXISTS chk_award_nominations_approval_status;
ALTER TABLE award_nominations ADD CONSTRAINT chk_award_nominations_approval_status
  CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- 4. PL/PGSQL TRIGGERS KIỂM SOÁT ĐỊNH MỨC NGHIỆP VỤ QĐ 521/QĐ-HV

-- 4.1. Trigger: Giảng viên hướng dẫn tối đa 02 đề tài đang thực hiện cùng thời gian (Điều 16.2.a QĐ 521)
-- Định nghĩa đang thực hiện: project_advisors.status = 'ACTIVE' AND projects.status NOT IN ('REJECTED', 'CANCELLED', 'ACCEPTED')
CREATE OR REPLACE FUNCTION fn_enforce_advisor_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_active_count INT;
  v_proj_status VARCHAR(30);
BEGIN
  IF NEW.status <> 'ACTIVE' THEN
    RETURN NEW;
  END IF;

  -- Khóa dòng giảng viên để chống race condition khi có 2 request đồng thời
  PERFORM 1 FROM lecturers WHERE lecturer_id = NEW.lecturer_id FOR UPDATE;

  SELECT status INTO v_proj_status FROM projects WHERE project_id = NEW.project_id;
  IF v_proj_status IN ('REJECTED', 'CANCELLED', 'ACCEPTED') THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_active_count
  FROM project_advisors pa
  JOIN projects p ON p.project_id = pa.project_id
  WHERE pa.lecturer_id = NEW.lecturer_id
    AND pa.status = 'ACTIVE'
    AND p.status NOT IN ('REJECTED', 'CANCELLED', 'ACCEPTED')
    AND (TG_OP = 'INSERT' OR pa.advisor_assignment_id <> NEW.advisor_assignment_id);

  IF v_active_count >= 2 THEN
    RAISE EXCEPTION 'ADVISOR_QUOTA_EXCEEDED: Giảng viên % đã đạt tối đa 02 đề tài đang hướng dẫn cùng thời gian (Điều 16.2.a QĐ 521/QĐ-HV)', NEW.lecturer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_advisor_quota ON project_advisors;
CREATE TRIGGER trg_enforce_advisor_quota
  BEFORE INSERT OR UPDATE OF status, lecturer_id ON project_advisors
  FOR EACH ROW
  EXECUTE FUNCTION fn_enforce_advisor_quota();

-- 4.2. Trigger: Sinh viên tham gia tối đa 01 đề tài trong 01 năm học (Điều 15.2.a QĐ 521)
-- và Mỗi đề tài tối đa 05 sinh viên (Điều 9.2 QĐ 521)
CREATE OR REPLACE FUNCTION fn_enforce_student_and_team_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_academic_year VARCHAR(9);
  v_proj_status VARCHAR(30);
  v_student_proj_count INT;
  v_team_size INT;
BEGIN
  IF NEW.confirm_status = 'DECLINED' THEN
    RETURN NEW;
  END IF;

  SELECT np.academic_year, p.status
  INTO v_academic_year, v_proj_status
  FROM projects p
  JOIN nckh_periods np ON np.period_id = p.period_id
  WHERE p.project_id = NEW.project_id;

  IF v_proj_status IN ('REJECTED', 'CANCELLED') THEN
    RETURN NEW;
  END IF;

  -- Khóa dòng sinh viên để chống race condition
  PERFORM 1 FROM students WHERE student_id = NEW.student_id FOR UPDATE;

  -- Kiểm tra tối đa 01 đề tài/năm học cho sinh viên (cả LEAD và MEMBER)
  SELECT COUNT(*) INTO v_student_proj_count
  FROM project_members pm
  JOIN projects p ON p.project_id = pm.project_id
  JOIN nckh_periods np ON np.period_id = p.period_id
  WHERE pm.student_id = NEW.student_id
    AND pm.confirm_status <> 'DECLINED'
    AND np.academic_year = v_academic_year
    AND p.status NOT IN ('REJECTED', 'CANCELLED')
    AND (TG_OP = 'INSERT' OR pm.member_id <> NEW.member_id);

  IF v_student_proj_count >= 1 THEN
    RAISE EXCEPTION 'STUDENT_PROJECT_LIMIT_EXCEEDED: Sinh viên % đã tham gia 01 đề tài trong năm học % (Điều 15.2.a QĐ 521/QĐ-HV)', NEW.student_id, v_academic_year;
  END IF;

  -- Kiểm tra tối đa 05 thành viên/đề tài (Điều 9.2 QĐ 521)
  SELECT COUNT(*) INTO v_team_size
  FROM project_members pm
  WHERE pm.project_id = NEW.project_id
    AND pm.confirm_status <> 'DECLINED'
    AND (TG_OP = 'INSERT' OR pm.member_id <> NEW.member_id);

  IF v_team_size >= 5 THEN
    RAISE EXCEPTION 'TEAM_SIZE_EXCEEDED: Đề tài % đã đủ tối đa 05 thành viên (Điều 9.2 QĐ 521/QĐ-HV)', NEW.project_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_student_and_team_limits ON project_members;
CREATE TRIGGER trg_enforce_student_and_team_limits
  BEFORE INSERT OR UPDATE OF student_id, confirm_status ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION fn_enforce_student_and_team_limits();

-- 4.3. Trigger: Điểm chấm từng tiêu chí (sheet_scores.score) không âm và không vượt max_score (Mẫu 4.1)
CREATE OR REPLACE FUNCTION fn_enforce_sheet_score_bounds()
RETURNS TRIGGER AS $$
DECLARE
  v_max_score DECIMAL(4,1);
BEGIN
  SELECT max_score INTO v_max_score
  FROM evaluation_criteria
  WHERE criteria_id = NEW.criteria_id;

  IF v_max_score IS NULL THEN
    RAISE EXCEPTION 'CRITERIA_NOT_FOUND: Không tìm thấy tiêu chí đánh giá #% ', NEW.criteria_id;
  END IF;

  IF NEW.score < 0 OR NEW.score > v_max_score THEN
    RAISE EXCEPTION 'SCORE_OUT_OF_RANGE: Điểm chấm (%) vượt ngoài khoảng cho phép [0, %]', NEW.score, v_max_score;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_sheet_score_bounds ON sheet_scores;
CREATE TRIGGER trg_enforce_sheet_score_bounds
  BEFORE INSERT OR UPDATE OF score, criteria_id ON sheet_scores
  FOR EACH ROW
  EXECUTE FUNCTION fn_enforce_sheet_score_bounds();

-- 4.4. Trigger: Khóa chỉnh sửa phiếu chấm (evaluation_sheets) sau khi biên bản nghiệm thu đã phê duyệt
CREATE OR REPLACE FUNCTION fn_lock_approved_evaluation_sheet()
RETURNS TRIGGER AS $$
DECLARE
  v_approval_doc_no VARCHAR(50);
BEGIN
  SELECT approval_doc_no INTO v_approval_doc_no
  FROM acceptances
  WHERE acceptance_id = COALESCE(NEW.acceptance_id, OLD.acceptance_id);

  IF v_approval_doc_no IS NOT NULL AND LENGTH(TRIM(v_approval_doc_no)) > 0 THEN
    RAISE EXCEPTION 'ACCEPTANCE_LOCKED: Biên bản nghiệm thu đã được phê duyệt (%), không thể sửa/xóa phiếu chấm', v_approval_doc_no;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lock_approved_evaluation_sheet ON evaluation_sheets;
CREATE TRIGGER trg_lock_approved_evaluation_sheet
  BEFORE UPDATE OR DELETE ON evaluation_sheets
  FOR EACH ROW
  EXECUTE FUNCTION fn_lock_approved_evaluation_sheet();

-- 4.5. Trigger: Đảm bảo LecturerHour khớp lecturer_id và project_id với ProjectAdvisor gốc
CREATE OR REPLACE FUNCTION fn_verify_lecturer_hour_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_lecturer_id VARCHAR(15);
  v_project_id VARCHAR(30);
BEGIN
  SELECT lecturer_id, project_id INTO v_lecturer_id, v_project_id
  FROM project_advisors
  WHERE advisor_assignment_id = NEW.advisor_assignment_id;

  IF v_lecturer_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_ASSIGNMENT: Không tìm thấy phân công hướng dẫn #%', NEW.advisor_assignment_id;
  END IF;

  IF NEW.lecturer_id <> v_lecturer_id OR NEW.project_id <> v_project_id THEN
    RAISE EXCEPTION 'ASSIGNMENT_MISMATCH: lecturer_id (%) hoặc project_id (%) không khớp với phân công #%', NEW.lecturer_id, NEW.project_id, NEW.advisor_assignment_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_verify_lecturer_hour_assignment ON lecturer_hours;
CREATE TRIGGER trg_verify_lecturer_hour_assignment
  BEFORE INSERT OR UPDATE ON lecturer_hours
  FOR EACH ROW
  EXECUTE FUNCTION fn_verify_lecturer_hour_assignment();
