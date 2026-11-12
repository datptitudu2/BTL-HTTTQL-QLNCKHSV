import { z } from "zod";

// ==========================================
// 1. ENUMS (Hệ thống & Nghiệp vụ QĐ 521)
// ==========================================

export enum RoleCode {
  STUDENT = "STUDENT",
  LECTURER = "LECTURER",
  FACULTY_SECRETARY = "FACULTY_SECRETARY",
  FACULTY_LEADER = "FACULTY_LEADER",
  QLKHCN = "QLKHCN",
  BOARD = "BOARD",
  FINANCE = "FINANCE",
  STUDENT_AFFAIRS = "STUDENT_AFFAIRS",
  ADMIN = "ADMIN",
}

export enum ProjectStatus {
  DRAFT = "Draft",
  SUBMITTED = "Submitted",
  FACULTY_APPROVED = "Faculty Approved",
  INSTITUTE_APPROVED = "Institute Approved",
  IN_PROGRESS = "In Progress",
  SUBMITTED_FINAL = "Submitted Final",
  EVALUATED = "Evaluated",
  CLOSED = "Closed",
  CANCELLED = "Cancelled",
}

export enum MemberRole {
  LEAD = "LEAD", // Chủ nhiệm đề tài
  MEMBER = "MEMBER", // Thành viên nghiên cứu
}

export enum AdvisorStatus {
  INVITED = "INVITED",
  ACTIVE = "ACTIVE",
  REPLACED = "REPLACED",
  REJECTED = "REJECTED",
}

export enum ApprovalDecision {
  APPROVED = "APPROVED",
  REVISION_REQUIRED = "REVISION_REQUIRED",
  REJECTED = "REJECTED",
}

export enum ApprovalMode {
  DIRECT = "DIRECT", // Trực tiếp
  PROXY = "PROXY", // Ký thay (Phó ký thay Trưởng)
}

export enum EvaluationGrade {
  EXCELLENT = "EXCELLENT", // Xuất sắc (>= 90)
  GOOD = "GOOD", // Tốt (80 - 89.9)
  FAIR = "FAIR", // Khá (70 - 79.9)
  PASS = "PASS", // Đạt (50 - 69.9)
  FAIL = "FAIL", // Không đạt (< 50)
}

export enum NotificationChannel {
  WEB = "WEB",
  EMAIL = "EMAIL",
  SMS = "SMS",
  ZALO = "ZALO",
}

export enum ChangeRequestType {
  ADJUSTMENT = "ADJUSTMENT",
  EXTENSION = "EXTENSION",
  CANCELLATION = "CANCELLATION",
  CHANGE_ADVISOR = "CHANGE_ADVISOR",
}

// ==========================================
// 2. ERROR CODES (Mã lỗi nghiệp vụ RFC 7807)
// ==========================================

export const BusinessErrorCode = {
  ADVISOR_QUOTA_EXCEEDED: "ADVISOR_QUOTA_EXCEEDED", // Mỗi giảng viên tối đa 2 đề tài
  ADVISOR_NOT_APPROVED_YET: "ADVISOR_NOT_APPROVED_YET", // GVHD chưa duyệt thì Trưởng khoa chưa duyệt
  SCORE_EXCEEDS_MAX: "SCORE_EXCEEDS_MAX", // Điểm tiêu chí vượt mức tối đa
  STUDENT_ALREADY_IN_PROJECT: "STUDENT_ALREADY_IN_PROJECT", // Sinh viên chỉ tham gia 1 đề tài / năm
  MAX_MEMBERS_EXCEEDED: "MAX_MEMBERS_EXCEEDED", // Tối đa 5 sinh viên / đề tài
  NOT_FACULTY_LEADER_OF_PROJECT: "NOT_FACULTY_LEADER_OF_PROJECT", // Không phải lãnh đạo khoa chủ trì
  TOTAL_SCORE_NOT_100: "TOTAL_SCORE_NOT_100", // Tổng điểm bộ tiêu chí phải bằng 100
  CERTIFICATE_NOT_ELIGIBLE: "CERTIFICATE_NOT_ELIGIBLE", // Chỉ cấp GCN từ loại Khá trở lên
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS", // Sai thông tin đăng nhập
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED", // Tài khoản bị khóa tạm
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
} as const;

export type BusinessErrorCodeType = typeof BusinessErrorCode[keyof typeof BusinessErrorCode];

export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail: string;
  code?: BusinessErrorCodeType | string;
  errors?: Array<{ field: string; message: string }>;
}

// ==========================================
// 3. ZOD SCHEMAS (Kiểm tra dữ liệu chung)
// ==========================================

export const LoginSchema = z.object({
  email: z.string().email("Email không đúng định dạng"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const CreateProjectSchema = z.object({
  periodId: z.number().int().positive(),
  deptId: z.number().int().positive(),
  titleVi: z.string().min(5, "Tên tiếng Việt tối thiểu 5 ký tự"),
  titleEn: z.string().optional(),
  researchField: z.string().min(2, "Lĩnh vực nghiên cứu là bắt buộc"),
  objectives: z.string().min(10, "Mục tiêu nghiên cứu tối thiểu 10 ký tự"),
  content: z.string().min(10, "Nội dung nghiên cứu tối thiểu 10 ký tự"),
  methodology: z.string().min(10, "Phương pháp nghiên cứu tối thiểu 10 ký tự"),
  expectedResult: z.string().min(10, "Kết quả dự kiến tối thiểu 10 ký tự"),
  requestedBudget: z.number().nonnegative().optional(),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const InviteMemberSchema = z.object({
  studentCode: z.string().min(1, "Mã sinh viên là bắt buộc"),
  contributionPct: z.number().min(1).max(100),
  assignedTask: z.string().min(3, "Nhiệm vụ phân công là bắt buộc"),
});
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;

export const OutlineApprovalSchema = z.object({
  role: z.nativeEnum(RoleCode),
  decision: z.nativeEnum(ApprovalDecision),
  mode: z.nativeEnum(ApprovalMode),
  comment: z.string().min(1, "Nhận xét là bắt buộc khi đánh giá"),
});
export type OutlineApprovalInput = z.infer<typeof OutlineApprovalSchema>;

export const ScoreItemSchema = z.object({
  criteriaId: z.number().int().positive(),
  score: z.number().min(0),
});

export const SubmitScoreSheetSchema = z.object({
  scores: z.array(ScoreItemSchema),
  strengths: z.string().optional(),
  limitations: z.string().optional(),
  qaNotes: z.string().optional(),
  recommendAward: z.boolean().default(false),
});
export type SubmitScoreSheetInput = z.infer<typeof SubmitScoreSheetSchema>;

