import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

export const TERMINAL_PROJECT_STATUSES = ['REJECTED', 'CANCELLED', 'ACCEPTED'];

function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass + 'srms_salt_2026').digest('hex');
}

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    throw new Error('Chặn chạy seed xóa dữ liệu trên môi trường production (NODE_ENV=production).');
  }
  console.log('--- BẮT ĐẦU KHỞI TẠO DỮ LIỆU CHUẨN ERD & QĐ 521/QĐ-HV ---');

  // 0. DỌN DẸP SẠCH DỮ LIỆU GIAO DỊCH CŨ ĐỂ ĐẢM BẢO TOÀN VẸN & KHÔNG TRÙNG LẶP
  // Tạm tắt trigger khóa sửa/xóa phiếu chấm đã phê duyệt khi reset dữ liệu seed
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lock_approved_evaluation_sheet') THEN
        ALTER TABLE evaluation_sheets DISABLE TRIGGER trg_lock_approved_evaluation_sheet;
      END IF;
    END $$;
  `);

  try {
    await prisma.auditLog.deleteMany();
    await prisma.sheetScore.deleteMany();
    await prisma.evaluationSheet.deleteMany();
    await prisma.acceptance.deleteMany();
    await prisma.councilMember.deleteMany();
    await prisma.council.deleteMany();
    await prisma.projectDocument.deleteMany();
    await prisma.settlement.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.lecturerHour.deleteMany();
    await prisma.studentBonus.deleteMany();
    await prisma.awardNomination.deleteMany();
    await prisma.requestApproval.deleteMany();
    await prisma.changeRequest.deleteMany();
    await prisma.seminarMember.deleteMany();
    await prisma.seminar.deleteMany();
    await prisma.progressReport.deleteMany();
    await prisma.outlineApproval.deleteMany();
    await prisma.outline.deleteMany();
    await prisma.projectAdvisor.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.decision.deleteMany();
    await prisma.facultyDossier.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.scheduleEvent.deleteMany();
    await prisma.systemSetting.deleteMany();
    await prisma.notificationTemplate.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.projectCodeCounter.deleteMany();
    await prisma.student.deleteMany();
    await prisma.lecturer.deleteMany();
  } finally {
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lock_approved_evaluation_sheet') THEN
          ALTER TABLE evaluation_sheets ENABLE TRIGGER trg_lock_approved_evaluation_sheet;
        END IF;
      END $$;
    `);
  }

  // =========================================================================
  // KHO D1: ROLES, DEPARTMENTS, USERS, STUDENTS, LECTURERS, DEPT_POSITIONS
  // =========================================================================
  const rolesData = [
    { roleCode: 'STUDENT', roleName: 'Sinh viên nghiên cứu', description: 'Quyền nộp đề tài, báo cáo tiến độ, đề cương' },
    { roleCode: 'LECTURER', roleName: 'Giảng viên hướng dẫn', description: 'Quyền duyệt đề cương, đánh giá tiến độ, chấm điểm' },
    { roleCode: 'FACULTY_SECRETARY', roleName: 'Thư ký Khoa / Viện', description: 'Quyền lập hồ sơ đề xuất Mẫu 1, rà soát sơ tuyển' },
    { roleCode: 'FACULTY_LEADER', roleName: 'Lãnh đạo Khoa / Viện', description: 'Quyền ký duyệt đề xuất Khoa, ký duyệt đề cương' },
    { roleCode: 'QLKHCN', roleName: 'Chuyên viên P.QLKHCN', description: 'Quản lý danh mục, thành lập hội đồng, trình Quyết định' },
    { roleCode: 'BOARD', roleName: 'Ban Giám Đốc Học viện', description: 'Ban hành Quyết định giao đề tài, phê duyệt giải thưởng' },
    { roleCode: 'FINANCE', roleName: 'Phòng Tài chính - Kế toán', description: 'Thanh quyết toán kinh phí đề tài' },
    { roleCode: 'STUDENT_AFFAIRS', roleName: 'Phòng CT&CTSV', description: 'Cộng điểm rèn luyện và chính sách học bổng' },
    { roleCode: 'ADMIN', roleName: 'Quản trị viên hệ thống', description: 'Toàn quyền cấu hình hệ thống' },
  ];

  for (const r of rolesData) {
    await prisma.role.upsert({
      where: { roleCode: r.roleCode },
      update: { roleName: r.roleName, description: r.description },
      create: r,
    });
  }

  const deptsData = [
    { deptCode: 'CNTT1', deptName: 'Khoa Công nghệ thông tin 1', campus: 'HN', headName: 'PGS.TS. Trần Đình Quế', secretaryName: 'ThS. Nguyễn Thị Lan' },
    { deptCode: 'DPT', deptName: 'Khoa Đa phương tiện', campus: 'HN', headName: 'TS. Nguyễn Thị Hồng', secretaryName: 'ThS. Chu Minh Anh' },
    { deptCode: 'QTKD1', deptName: 'Khoa Quản trị kinh doanh 1', campus: 'HN', headName: 'TS. Đinh Quang Huy', secretaryName: 'ThS. Lê Thu Hà' },
    { deptCode: 'ATTT', deptName: 'Khoa An toàn thông tin', campus: 'HN', headName: 'TS. Nguyễn Văn Tuấn', secretaryName: 'ThS. Lê Thị Phương' },
    { deptCode: 'DTVT1', deptName: 'Khoa Kỹ thuật Điện tử 1', campus: 'HN', headName: 'PGS.TS. Hoàng Minh', secretaryName: 'ThS. Đỗ Minh Đức' },
    { deptCode: 'TCKT', deptName: 'Phòng Tài chính - Kế toán', campus: 'HN' },
    { deptCode: 'QLKHCN', deptName: 'Phòng Quản lý Khoa học Công nghệ', campus: 'HN' },
    { deptCode: 'CTSV', deptName: 'Phòng Công tác Chính trị & CTSV', campus: 'HN' },
  ];

  for (const d of deptsData) {
    await prisma.department.upsert({
      where: { deptCode: d.deptCode },
      update: d,
      create: d,
    });
  }

  const roleRecords = await prisma.role.findMany();
  const getRoleId = (code: string) => roleRecords.find((r) => r.roleCode === code)!.roleId;

  const deptRecords = await prisma.department.findMany();
  const getDeptId = (code: string) => deptRecords.find((d) => d.deptCode === code)!.deptId;

  const defaultSeedPass = process.env.SEED_DEFAULT_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'ptit@123' : '');
  if (!defaultSeedPass) {
    throw new Error('Thiếu biến môi trường SEED_DEFAULT_PASSWORD');
  }
  const passwordHash = hashPassword(defaultSeedPass);

  // Danh sách người dùng chuẩn hóa (đảm bảo 1 SV chỉ tối đa 1 đề tài/năm học)
  const usersData = [
    { username: 'admin', name: 'Quản trị viên Hệ thống PTIT', role: 'ADMIN', email: 'admin@ptit.edu.vn' },
    // 17 Sinh viên thuộc 5 khoa (sv001..sv012 cho 10 đề tài, sv015..sv019 chưa tham gia đề tài nào để đăng ký mới / ghép nhóm)
    { username: 'sv001', name: 'Nguyễn Văn An', role: 'STUDENT', email: 'an.nv@stu.ptit.edu.vn', studentId: 'B23DCCN001', class: 'D23CQCN01-B', dept: 'CNTT1', gpa: 3.72 },
    { username: 'sv002', name: 'Trần Thị Bình', role: 'STUDENT', email: 'binh.tt@stu.ptit.edu.vn', studentId: 'B23DCCN002', class: 'D23CQCN01-B', dept: 'CNTT1', gpa: 3.55 },
    { username: 'sv003', name: 'Lê Minh Khôi', role: 'STUDENT', email: 'khoi.lm@stu.ptit.edu.vn', studentId: 'B23DCCN003', class: 'D23CQCN02-B', dept: 'CNTT1', gpa: 3.60 },
    { username: 'sv004', name: 'Phạm Gia Hân', role: 'STUDENT', email: 'han.pg@stu.ptit.edu.vn', studentId: 'B23DCCN004', class: 'D23CQCN02-B', dept: 'CNTT1', gpa: 3.45 },
    { username: 'sv005', name: 'Đỗ Tuấn Anh', role: 'STUDENT', email: 'anh.dt@stu.ptit.edu.vn', studentId: 'B23DCCN005', class: 'D23CQCN03-B', dept: 'CNTT1', gpa: 3.68 },
    { username: 'sv006', name: 'Nguyễn Minh Tuấn', role: 'STUDENT', email: 'tuan.nm@stu.ptit.edu.vn', studentId: 'B23DCDT015', class: 'D23CQDT01-B', dept: 'DPT', gpa: 3.52 },
    { username: 'sv007', name: 'Hoàng Gia Bảo', role: 'STUDENT', email: 'bao.hg@stu.ptit.edu.vn', studentId: 'B23DCDT018', class: 'D23CQDT02-B', dept: 'DPT', gpa: 3.20 },
    { username: 'sv008', name: 'Phạm Đức Thịnh', role: 'STUDENT', email: 'thinh.pd@stu.ptit.edu.vn', studentId: 'B23DCQT009', class: 'D23CQQT01-B', dept: 'QTKD1', gpa: 3.49 },
    { username: 'sv009', name: 'Vũ Thu Phương', role: 'STUDENT', email: 'phuong.vt@stu.ptit.edu.vn', studentId: 'B23DCQT014', class: 'D23CQQT02-B', dept: 'QTKD1', gpa: 3.56 },
    { username: 'sv010', name: 'Hoàng Quốc Việt', role: 'STUDENT', email: 'viet.hq@stu.ptit.edu.vn', studentId: 'B23DCAT012', class: 'D23CQAT01-B', dept: 'ATTT', gpa: 3.62 },
    { username: 'sv011', name: 'Nguyễn Hải Đăng', role: 'STUDENT', email: 'dang.nh@stu.ptit.edu.vn', studentId: 'B23DCAT019', class: 'D23CQAT02-B', dept: 'ATTT', gpa: 3.44 },
    { username: 'sv012', name: 'Trần Quốc Bảo', role: 'STUDENT', email: 'bao.tq@stu.ptit.edu.vn', studentId: 'B23DCVT005', class: 'D23CQVT01-B', dept: 'DTVT1', gpa: 3.58 },
    { username: 'sv015', name: 'Lê Hoàng Nam', role: 'STUDENT', email: 'nam.lh@stu.ptit.edu.vn', studentId: 'B23DCCN099', class: 'D23CQCN04-B', dept: 'CNTT1', gpa: 3.75 },
    { username: 'sv016', name: 'Nguyễn Minh Anh', role: 'STUDENT', email: 'anh.nm@stu.ptit.edu.vn', studentId: 'B23DCCN101', class: 'D23CQCN03-B', dept: 'CNTT1', gpa: 3.66 },
    { username: 'sv017', name: 'Phạm Thảo Vy', role: 'STUDENT', email: 'vy.pt@stu.ptit.edu.vn', studentId: 'B23DCCN102', class: 'D23CQCN04-B', dept: 'CNTT1', gpa: 3.59 },
    { username: 'sv018', name: 'Vũ Đức Mạnh', role: 'STUDENT', email: 'manh.vd@stu.ptit.edu.vn', studentId: 'B23DCAT025', class: 'D23CQAT02-B', dept: 'ATTT', gpa: 3.48 },
    { username: 'sv019', name: 'Lê Bảo Ngọc', role: 'STUDENT', email: 'ngoc.lb@stu.ptit.edu.vn', studentId: 'B23DCDT022', class: 'D23CQDT01-B', dept: 'DPT', gpa: 3.64 },

    // 6 Giảng viên hướng dẫn (Mỗi GV hướng dẫn tối đa 2 đề tài/năm học theo QĐ 521)
    { username: 'gv001', name: 'TS. Ngô Quốc Dũng', role: 'LECTURER', email: 'dungnq@ptit.edu.vn', lecturerId: 'GV001', rank: 'TS', degree: 'Tiến sĩ', dept: 'CNTT1', field: 'Công nghệ Phần mềm & Hệ thống thông tin' },
    { username: 'gv002', name: 'TS. Trần Đình Trí', role: 'LECTURER', email: 'tritd@ptit.edu.vn', lecturerId: 'GV002', rank: 'TS', degree: 'Tiến sĩ', dept: 'DPT', field: 'Công nghệ Đa phương tiện & AR/VR' },
    { username: 'gv003', name: 'TS. Đinh Quang Huy', role: 'LECTURER', email: 'huydq@ptit.edu.vn', lecturerId: 'GV003', rank: 'TS', degree: 'Tiến sĩ', dept: 'QTKD1', field: 'Kinh doanh số & Chuỗi cung ứng' },
    { username: 'gv004', name: 'TS. Nguyễn Văn Tuấn', role: 'LECTURER', email: 'tuannv@ptit.edu.vn', lecturerId: 'GV004', rank: 'TS', degree: 'Tiến sĩ', dept: 'ATTT', field: 'An toàn mạng & Trí tuệ nhân tạo' },
    { username: 'gv005', name: 'PGS.TS. Hoàng Minh', role: 'LECTURER', email: 'minhh@ptit.edu.vn', lecturerId: 'GV005', rank: 'PGS.TS', degree: 'Tiến sĩ', dept: 'DTVT1', field: 'Viễn thông thế hệ mới 5G/6G' },
    { username: 'gv006', name: 'TS. Vũ Trọng Hùng', role: 'LECTURER', email: 'hungvt@ptit.edu.vn', lecturerId: 'GV006', rank: 'TS', degree: 'Tiến sĩ', dept: 'CNTT1', field: 'Khoa học dữ liệu & Học máy' },
    // Giảng viên được mời tham dự Hội đồng (0 đề tài hướng dẫn, chuyên chấm Hội đồng Nghiệm thu 04)
    { username: 'gv007', name: 'TS. Nguyễn Quang Hưng', role: 'LECTURER', email: 'hungnq@ptit.edu.vn', lecturerId: 'GV007', rank: 'TS', degree: 'Tiến sĩ', dept: 'CNTT1', field: 'Mạng máy tính & Hệ thống phân tán' },

    // Cán bộ quản lý các cấp
    { username: 'tk001', name: 'ThS. Nguyễn Thị Lan', role: 'FACULTY_SECRETARY', email: 'lannt@ptit.edu.vn', dept: 'CNTT1' },
    { username: 'lead001', name: 'PGS.TS. Trần Đình Quế', role: 'FACULTY_LEADER', email: 'quetd@ptit.edu.vn', dept: 'CNTT1' },
    { username: 'qlkh001', name: 'ThS. Phạm Văn Hùng', role: 'QLKHCN', email: 'qlkhcn@ptit.edu.vn', dept: 'QLKHCN' },
    { username: 'bgd001', name: 'PGS.TS. Đặng Hoài Bắc', role: 'BOARD', email: 'bacdh@ptit.edu.vn', dept: 'QLKHCN' },
    { username: 'tckt001', name: 'CN. Lê Thị Mai', role: 'FINANCE', email: 'tckt@ptit.edu.vn', dept: 'TCKT' },
    { username: 'ctsv001', name: 'ThS. Bùi Văn Toàn', role: 'STUDENT_AFFAIRS', email: 'ctsv@ptit.edu.vn', dept: 'CTSV' },
  ];

  const userMap: Record<string, number> = {};

  for (const u of usersData) {
    let user = await prisma.user.findFirst({
      where: { OR: [{ ssoUsername: u.username }, { email: u.email }] },
    });

    if (user) {
      user = await prisma.user.update({
        where: { userId: user.userId },
        data: {
          roleId: getRoleId(u.role),
          ssoUsername: u.username,
          fullName: u.name,
          email: u.email,
          status: 'ACTIVE',
        },
      });
      await prisma.userCredential.upsert({
        where: { userId: user.userId },
        update: { passwordHash, mustChangePass: true },
        create: { userId: user.userId, passwordHash, mustChangePass: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          roleId: getRoleId(u.role),
          ssoUsername: u.username,
          fullName: u.name,
          email: u.email,
          phone: '0988123456',
          status: 'ACTIVE',
          credentials: { create: { passwordHash, mustChangePass: true } },
        },
      });
    }
    userMap[u.username] = user.userId;

    if (u.studentId) {
      await prisma.student.create({
        data: {
          studentId: u.studentId,
          userId: user.userId,
          deptId: getDeptId(u.dept || 'CNTT1'),
          dateOfBirth: new Date('2005-08-15'),
          gender: u.name.includes('Thị') || u.name.includes('Hân') || u.name.includes('Phương') ? 'Nữ' : 'Nam',
          ethnicity: 'Kinh',
          className: u.class || 'D23CQCN01-B',
          cohort: '2023-2028',
          major: u.dept === 'DPT' ? 'Công nghệ Đa phương tiện' : u.dept === 'QTKD1' ? 'Quản trị kinh doanh' : u.dept === 'ATTT' ? 'An toàn thông tin' : u.dept === 'DTVT1' ? 'Kỹ thuật Điện tử Viễn thông' : 'Công nghệ thông tin',
          studyYear: 3,
          programYears: 4,
          gpa: u.gpa || 3.5,
        },
      });
    }

    if (u.lecturerId) {
      await prisma.lecturer.create({
        data: {
          lecturerId: u.lecturerId,
          userId: user.userId,
          deptId: getDeptId(u.dept || 'CNTT1'),
          academicRank: u.rank || 'TS',
          degree: u.degree || 'Tiến sĩ',
          researchField: u.field || 'Hệ thống thông tin',
        },
      });
    }
  }

  // Dept Positions
  await prisma.deptPosition.deleteMany();
  await prisma.deptPosition.createMany({
    data: [
      { userId: userMap['lead001'], deptId: getDeptId('CNTT1'), roleType: 'DEAN', isActive: true },
      { userId: userMap['tk001'], deptId: getDeptId('CNTT1'), roleType: 'SECRETARY', isActive: true },
    ],
  });

  // =========================================================================
  // KHO D2: ĐỢT NCKH, TIÊU CHÍ CHẤM ĐIỂM (MẪU 4.1 TỔNG = 100), MỐC TIẾN ĐỘ
  // =========================================================================
  const period = await prisma.nckhPeriod.upsert({
    where: { periodId: 1 },
    update: { status: 'ACTIVE' },
    create: {
      periodId: 1,
      academicYear: '2026-2027',
      periodName: 'Đợt Nghiên cứu khoa học Sinh viên Năm học 2026 - 2027',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-06-30'),
      quotaProjects: 150,
      totalBudgetLimit: 800000000,
      status: 'ACTIVE',
    },
  });

  // Bộ 7 tiêu chí chuẩn Mẫu 4.1 QĐ 521 (Thang điểm: 10 + 15 + 15 + 35 + 15 + 5 + 5 = 100 điểm)
  const criteriaData = [
    { orderNo: 1, name: 'Tổng quan tình hình nghiên cứu, lý do chọn đề tài', max: 10 },
    { orderNo: 2, name: 'Mục tiêu đề tài', max: 15 },
    { orderNo: 3, name: 'Phương pháp nghiên cứu', max: 15 },
    { orderNo: 4, name: 'Nội dung khoa học', max: 35 },
    { orderNo: 5, name: 'Đóng góp về mặt kinh tế - xã hội, giáo dục và đào tạo, an ninh, quốc phòng', max: 15 },
    { orderNo: 6, name: 'Hình thức trình bày báo cáo tổng kết đề tài', max: 5 },
    { orderNo: 7, name: 'Điểm thưởng (có công bố khoa học từ kết quả nghiên cứu trên các tạp chí chuyên ngành trong và ngoài nước)', max: 5 },
  ];

  const criteriaByOrder: Record<number, number> = {};
  for (const c of criteriaData) {
    const crit = await prisma.evaluationCriteria.upsert({
      where: { periodId_orderNo: { periodId: period.periodId, orderNo: c.orderNo } },
      update: { title: c.name, maxScore: c.max, isActive: true },
      create: { periodId: period.periodId, orderNo: c.orderNo, title: c.name, maxScore: c.max, isActive: true },
    });
    criteriaByOrder[c.orderNo] = crit.criteriaId;
  }

  const milestonesData = [
    { type: 'OUTLINE', name: 'Mốc 1: Nộp Thuyết minh Đề cương chi tiết (Mẫu 2)', due: new Date('2026-10-15') },
    { type: 'PROGRESS_1', name: 'Mốc 2: Báo cáo tiến độ & Sinh hoạt khoa học cấp Khoa (Mẫu 3.5)', due: new Date('2026-12-20') },
    { type: 'PROGRESS_2', name: 'Mốc 3: Báo cáo hoàn thiện sản phẩm trung gian & Trùng lặp', due: new Date('2027-02-28') },
    { type: 'ACCEPTANCE', name: 'Mốc 4: Nộp Hồ sơ Nghiệm thu & Sản phẩm tổng kết (Mẫu 3.1 - 3.4)', due: new Date('2027-04-10') },
  ];

  for (let i = 0; i < milestonesData.length; i++) {
    const m = milestonesData[i];
    await prisma.periodMilestone.upsert({
      where: { pmId: i + 1 },
      update: { periodId: period.periodId, milestoneType: m.type, milestoneName: m.name, dueDate: m.due },
      create: {
        pmId: i + 1,
        periodId: period.periodId,
        milestoneType: m.type,
        milestoneName: m.name,
        dueDate: m.due,
        remindDaysBefore: 5,
        remindChannels: 'IN_APP,EMAIL',
      },
    });
  }

  // =========================================================================
  // KHO D5: HỒ SƠ MẪU 1 CẤP KHOA & QUYẾT ĐỊNH GIAO ĐỀ TÀI
  // =========================================================================
  const dossierCNTT = await prisma.facultyDossier.create({
    data: {
      periodId: period.periodId,
      deptId: getDeptId('CNTT1'),
      officialLetterNo: '89/TTr-CNTT1',
      minutesUrl: '/storage/dossiers/bien_ban_so_tuyen_cntt1.pdf',
      reviewStatus: 'APPROVED',
      submittedAt: new Date('2026-09-25'),
    },
  });

  const decisionAssign = await prisma.decision.create({
    data: {
      periodId: period.periodId,
      decisionNo: '145/QĐ-HV',
      decisionType: 'ASSIGN',
      submissionNo: '112/TTr-KHCN',
      issuedDate: new Date('2026-10-01'),
      totalBudget: 35000000,
      fileUrl: '/storage/decisions/145_QD_HV_GiaoDeTai.pdf',
    },
  });

  // =========================================================================
  // KHO D3 & D7: 10 ĐỀ TÀI MẪU CHUẨN MÃ SV-2026-KHOA-XXX (1 SV = TỐI ĐA 1 ĐỀ TÀI, 1 GV <= 2 ĐỀ TÀI)
  // =========================================================================
  const projectsSeed = [
    {
      id: 'SV-2026-CNTT1-001',
      dept: 'CNTT1',
      dossierId: dossierCNTT.dossierId,
      decisionId: decisionAssign.decisionId,
      titleVi: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
      titleEn: 'Development of PTIT Student Research Management System on S-Link Platform',
      field: 'Công nghệ Phần mềm & Hệ thống thông tin',
      status: 'ACCEPTED',
      prelimResult: 'PASSED',
      members: [
        { studentId: 'B23DCCN001', role: 'LEAD', pct: 60, task: 'Chủ nhiệm đề tài, thiết kế kiến trúc hệ thống, cơ sở dữ liệu và lập trình Backend NestJS' },
        { studentId: 'B23DCCN002', role: 'MEMBER', pct: 40, task: 'Thiết kế UI/UX chuẩn S-Link, lập trình Frontend React Ant Design và kiểm thử quy trình' },
      ],
      advisorId: 'GV001',
      budgetApproved: 5000000,
    },
    {
      id: 'SV-2026-CNTT1-002',
      dept: 'CNTT1',
      dossierId: dossierCNTT.dossierId,
      decisionId: decisionAssign.decisionId,
      titleVi: 'Xây dựng trợ lý ảo học tập sử dụng mô hình ngôn ngữ lớn (LLM) và kỹ thuật RAG cho sinh viên PTIT',
      titleEn: 'Retrieval-Augmented Generation Academic Advising Assistant for PTIT Students',
      field: 'Trí tuệ nhân tạo & Xử lý ngôn ngữ tự nhiên',
      status: 'ONGOING',
      prelimResult: 'PASSED',
      members: [
        { studentId: 'B23DCCN003', role: 'LEAD', pct: 55, task: 'Chủ nhiệm đề tài, xây dựng Vector DB và pipeline RAG' },
        { studentId: 'B23DCCN004', role: 'MEMBER', pct: 45, task: 'Thu thập dữ liệu quy chế học vụ và phát triển giao diện chat' },
      ],
      advisorId: 'GV001',
      budgetApproved: 5000000,
    },
    {
      id: 'SV-2026-CNTT1-003',
      dept: 'CNTT1',
      dossierId: dossierCNTT.dossierId,
      decisionId: decisionAssign.decisionId,
      titleVi: 'Phương pháp tiền xử lý và trích xuất đặc trưng từ dữ liệu giao dịch POS giúp cải thiện dự báo doanh thu SME',
      titleEn: 'Feature Extraction from POS Time Series for SME Retail Forecasting',
      field: 'Khoa học dữ liệu & Học máy',
      status: 'SUBMITTED', // Đã nộp báo cáo tổng kết - chờ hội đồng chấm điểm live!
      prelimResult: 'PASSED',
      members: [
        { studentId: 'B23DCCN005', role: 'LEAD', pct: 100, task: 'Nghiên cứu thuật toán trích xuất đặc trưng và kiểm thử trên tập dữ liệu POS thực tế' },
      ],
      advisorId: 'GV006',
      budgetApproved: 5000000,
    },
    {
      id: 'SV-2026-DPT-001',
      dept: 'DPT',
      decisionId: decisionAssign.decisionId,
      titleVi: 'Ứng dụng công nghệ thực tế tăng cường di động (Mobile AR) và phân tích hành vi mua sắm ngẫu hứng',
      titleEn: 'Mobile AR Apps and Impulse Buying: Perspectives from Young Consumers and Tourists',
      field: 'Đa phương tiện & Tương tác người máy',
      status: 'ACCEPTED',
      prelimResult: 'PASSED',
      members: [
        { studentId: 'B23DCDT015', role: 'LEAD', pct: 100, task: 'Thiết kế trải nghiệm 3D AR, khảo sát SPSS và lập trình ứng dụng di động' },
      ],
      advisorId: 'GV002',
      budgetApproved: 4500000,
    },
    {
      id: 'SV-2026-DPT-002',
      dept: 'DPT',
      titleVi: 'Thiết kế trò chơi nhập vai giáo dục lịch sử Việt Nam trên nền tảng WebGL 3D',
      titleEn: '3D WebGL Historical Educational Game Design',
      field: 'Thiết kế Đa phương tiện',
      status: 'REJECTED',
      prelimResult: 'FAILED',
      members: [
        { studentId: 'B23DCDT018', role: 'LEAD', pct: 100, task: 'Chủ nhiệm đề tài, dựng mô hình nhân vật và kịch bản' },
      ],
      advisorId: 'GV002',
      budgetApproved: 0,
    },
    {
      id: 'SV-2026-QTKD1-001',
      dept: 'QTKD1',
      decisionId: decisionAssign.decisionId,
      titleVi: 'Tối ưu hóa chuỗi cung ứng nông sản minh bạch ứng dụng công nghệ Blockchain và Hợp đồng thông minh',
      titleEn: 'Smart Contracts for Agritech Supply Chain Traceability in Vietnam',
      field: 'Thương mại điện tử & Chuỗi cung ứng',
      status: 'SUBMITTED', // Đã nộp tổng kết, hội đồng chờ chấm
      prelimResult: 'PASSED',
      members: [
        { studentId: 'B23DCQT009', role: 'LEAD', pct: 100, task: 'Phân tích mô hình chuỗi cung ứng và viết Smart Contract truy xuất nguồn gốc' },
      ],
      advisorId: 'GV003',
      budgetApproved: 4500000,
    },
    {
      id: 'SV-2026-QTKD1-002',
      dept: 'QTKD1',
      titleVi: 'Đánh giá tác động của thương mại điện tử qua video ngắn đến hành vi tiêu dùng của sinh viên đại học',
      titleEn: 'Impact of Short-Form Video E-Commerce on Impulse Buying among University Students',
      field: 'Marketing số',
      status: 'PROPOSED', // Chờ Khoa sơ tuyển
      members: [
        { studentId: 'B23DCQT014', role: 'LEAD', pct: 100, task: 'Xây dựng bảng hỏi khảo sát định lượng và xử lý dữ liệu SEM' },
      ],
      advisorId: 'GV003',
      budgetApproved: 0,
    },
    {
      id: 'SV-2026-ATTT-001',
      dept: 'ATTT',
      decisionId: decisionAssign.decisionId,
      titleVi: 'Phát hiện tấn công lỗ hổng bảo mật Zero-day trong hệ sinh thái IoT dựa trên mạng nơ-ron sâu',
      titleEn: 'IoT Zero-day Intrusion Detection using Deep Residual Networks',
      field: 'An toàn thông tin & An ninh mạng',
      status: 'ACCEPTED',
      prelimResult: 'PASSED',
      members: [
        { studentId: 'B23DCAT012', role: 'LEAD', pct: 100, task: 'Thu thập gói tin mạng IoT, huấn luyện mô hình ResNet phát hiện bất thường' },
      ],
      advisorId: 'GV004',
      budgetApproved: 5000000,
    },
    {
      id: 'SV-2026-ATTT-002',
      dept: 'ATTT',
      titleVi: 'Phát hiện tin giả tiếng Việt trên mạng xã hội bằng mô hình ngôn ngữ ngữ cảnh PhoBERT',
      titleEn: 'Vietnamese Fake News Detection via PhoBERT Contextual Analysis',
      field: 'An toàn thông tin & NLP',
      status: 'FACULTY_APPROVED', // Khoa đã duyệt sơ tuyển - chờ P.QLKHCN/BGĐ ban hành QĐ
      prelimResult: 'PASSED',
      members: [
        { studentId: 'B23DCAT019', role: 'LEAD', pct: 100, task: 'Huấn luyện phân loại tin giả tiếng Việt trên tập dữ liệu gán nhãn' },
      ],
      advisorId: 'GV004',
      budgetApproved: 0,
    },
    {
      id: 'SV-2026-DTVT1-001',
      dept: 'DTVT1',
      decisionId: decisionAssign.decisionId,
      titleVi: 'Thiết kế ăng-ten mảng Microstrip đa băng tần băng thông siêu rộng cho trạm gốc 5G/6G Massive MIMO',
      titleEn: 'Multi-band Ultra-wideband Microstrip Antenna Array for 5G/6G Massive MIMO',
      field: 'Kỹ thuật Điện tử Viễn thông',
      status: 'ONGOING',
      prelimResult: 'PASSED',
      members: [
        { studentId: 'B23DCVT005', role: 'LEAD', pct: 100, task: 'Mô phỏng HFSS cấu trúc ăng-ten mảng và đo kiểm tham số S11' },
      ],
      advisorId: 'GV005',
      budgetApproved: 5000000,
    },
  ];

  for (const p of projectsSeed) {
    await prisma.project.create({
      data: {
        projectId: p.id,
        periodId: period.periodId,
        deptId: getDeptId(p.dept),
        dossierId: p.dossierId || null,
        decisionId: p.decisionId || null,
        titleVi: p.titleVi,
        titleEn: p.titleEn,
        researchField: p.field,
        coordinatingUnit: 'Trung tâm Đổi mới Sáng tạo & Khởi nghiệp PTIT',
        keywords: `${p.id}, ${p.field}, NCKH PTIT, QĐ 521`,
        objectives: `Nghiên cứu, thiết kế và hoàn thiện sản phẩm đề tài "${p.titleVi}" tuân thủ quy trình QĐ 521/QĐ-HV.`,
        content: 'Khảo sát cơ sở lý thuyết, thiết kế kiến trúc/mô hình đề xuất, cài đặt thực nghiệm và đánh giá hiệu năng.',
        methodology: 'Nghiên cứu lý thuyết kết hợp thực nghiệm kiểm chứng định lượng trên tập dữ liệu thực.',
        expectedResult: '01 Báo cáo tổng kết Mẫu 3.2-3.4, 01 Sản phẩm/Phần mềm demo, 01 Bài báo khoa học.',
        status: p.status,
        prelimResult: p.prelimResult === 'PASSED' ? 'APPROVED' : p.prelimResult === 'FAILED' ? 'REJECTED' : null,
        registeredAt: new Date('2026-09-10'),
        members: {
          create: p.members.map((m) => ({
            studentId: m.studentId,
            memberRole: m.role,
            contributionPct: m.pct,
            assignedTask: m.task,
            confirmStatus: 'ACCEPTED',
          })),
        },
        advisors: {
          create: {
            lecturerId: p.advisorId,
            assignedBy: 'STUDENT',
            status: 'ACTIVE',
            assignedAt: new Date('2026-09-10'),
          },
        },
        budget: {
          create: {
            requestedAmount: 5000000,
            facultyProposed: p.status === 'REJECTED' ? 0 : 5000000,
            approvedAmount: p.budgetApproved,
            status: p.status === 'REJECTED' ? 'REJECTED' : p.budgetApproved > 0 ? 'APPROVED' : 'PENDING',
          },
        },
      },
    });
  }

  // Đồng bộ active_project_count cho bảng lecturers (D1) chuẩn ERD
  for (const gvId of ['GV001', 'GV002', 'GV003', 'GV004', 'GV005', 'GV006', 'GV007']) {
    const activeCount = await prisma.projectAdvisor.count({
      where: {
        lecturerId: gvId,
        status: 'ACTIVE',
        project: {
          periodId: period.periodId,
          status: { notIn: TERMINAL_PROJECT_STATUSES },
        },
      },
    });
    await prisma.lecturer.update({
      where: { lecturerId: gvId },
      data: { activeProjectCount: activeCount },
    });
  }

  // Cập nhật Counters cho sinh mã SV-2026-KHOA-XXX không bị đụng
  await prisma.projectCodeCounter.createMany({
    data: [
      { year: 2026, deptCode: 'CNTT1', lastNo: 3 },
      { year: 2026, deptCode: 'DPT', lastNo: 2 },
      { year: 2026, deptCode: 'QTKD1', lastNo: 2 },
      { year: 2026, deptCode: 'ATTT', lastNo: 2 },
      { year: 2026, deptCode: 'DTVT1', lastNo: 1 },
    ],
  });

  // =========================================================================
  // KHO D4: ĐỀ CƯƠNG (OUTLINES), TIẾN ĐỘ (PROGRESS), HỘI THẢO (SEMINARS), ĐƠN (CHANGE REQUESTS)
  // =========================================================================
  // 1. Outlines
  await prisma.outline.create({
    data: {
      projectId: 'SV-2026-CNTT1-001',
      versionNo: 1,
      fileUrl: '/storage/outlines/SV-2026-CNTT1-001_v1.pdf',
      approvalStatus: 'FACULTY_APPROVED',
      submittedAt: new Date('2026-10-10'),
      approvals: {
        create: [
          { approverUserId: userMap['gv001'], role: 'ADVISOR', mode: 'DIRECT', decision: 'APPROVED', comment: 'Đề cương 12 mục rõ ràng, bám sát QĐ 521.' },
          { approverUserId: userMap['lead001'], role: 'FACULTY_LEADER', mode: 'DIRECT', decision: 'APPROVED', comment: 'Nhất trí phê duyệt cấp Khoa, chuyển triển khai thực hiện.' },
        ],
      },
    },
  });

  await prisma.outline.create({
    data: {
      projectId: 'SV-2026-CNTT1-002',
      versionNo: 1,
      fileUrl: '/storage/outlines/SV-2026-CNTT1-002_v1.pdf',
      approvalStatus: 'ADVISOR_APPROVED', // GVHD đã duyệt -> Chờ Trưởng khoa duyệt cấp 2
      submittedAt: new Date('2026-10-14'),
      approvals: {
        create: [
          { approverUserId: userMap['gv001'], role: 'ADVISOR', mode: 'DIRECT', decision: 'APPROVED', comment: 'Phương pháp RAG phù hợp, đề nghị Trưởng khoa phê duyệt.' },
        ],
      },
    },
  });

  await prisma.outline.create({
    data: {
      projectId: 'SV-2026-DTVT1-001',
      versionNo: 1,
      fileUrl: '/storage/outlines/SV-2026-DTVT1-001_v1.pdf',
      approvalStatus: 'PENDING', // Mới nộp, chờ GVHD PGS.TS. Hoàng Minh duyệt
      submittedAt: new Date('2026-10-15'),
    },
  });

  await prisma.outline.create({
    data: {
      projectId: 'SV-2026-CNTT1-003',
      versionNo: 1,
      fileUrl: '/storage/outlines/SV-2026-CNTT1-003_v1.pdf',
      approvalStatus: 'FACULTY_APPROVED',
      submittedAt: new Date('2026-10-08'),
      approvals: {
        create: [
          { approverUserId: userMap['gv006'], role: 'ADVISOR', mode: 'DIRECT', decision: 'APPROVED', comment: 'Đồng ý thông qua.' },
          { approverUserId: userMap['lead001'], role: 'FACULTY_LEADER', mode: 'PROXY', decision: 'APPROVED', comment: 'Ký thay Trưởng khoa phê duyệt đề cương.' },
        ],
      },
    },
  });

  await prisma.outline.create({
    data: {
      projectId: 'SV-2026-DPT-001',
      versionNo: 1,
      fileUrl: '/storage/outlines/SV-2026-DPT-001_v1.pdf',
      approvalStatus: 'FACULTY_APPROVED',
      submittedAt: new Date('2026-10-09'),
      approvals: {
        create: [
          { approverUserId: userMap['gv002'], role: 'ADVISOR', mode: 'DIRECT', decision: 'APPROVED', comment: 'Đề cương Mobile AR đầy đủ mục tiêu, kịch bản thử nghiệm và dự toán.' },
          { approverUserId: userMap['lead001'], role: 'FACULTY_LEADER', mode: 'PROXY', decision: 'APPROVED', comment: 'Phê duyệt đề cương triển khai nghiên cứu.' },
        ],
      },
    },
  });

  await prisma.outline.create({
    data: {
      projectId: 'SV-2026-QTKD1-001',
      versionNo: 1,
      fileUrl: '/storage/outlines/SV-2026-QTKD1-001_v1.pdf',
      approvalStatus: 'FACULTY_APPROVED',
      submittedAt: new Date('2026-10-11'),
      approvals: {
        create: [
          { approverUserId: userMap['gv003'], role: 'ADVISOR', mode: 'DIRECT', decision: 'APPROVED', comment: 'Phương pháp khảo sát và mô hình Smart Contract khả thi.' },
          { approverUserId: userMap['lead001'], role: 'FACULTY_LEADER', mode: 'PROXY', decision: 'APPROVED', comment: 'Phê duyệt đề cương triển khai nghiên cứu.' },
        ],
      },
    },
  });

  await prisma.outline.create({
    data: {
      projectId: 'SV-2026-ATTT-001',
      versionNo: 1,
      fileUrl: '/storage/outlines/SV-2026-ATTT-001_v1.pdf',
      approvalStatus: 'FACULTY_APPROVED',
      submittedAt: new Date('2026-10-10'),
      approvals: {
        create: [
          { approverUserId: userMap['gv004'], role: 'ADVISOR', mode: 'DIRECT', decision: 'APPROVED', comment: 'Đề cương nghiên cứu IoT Zero-day với Deep ResNet đạt yêu cầu Mẫu 2.' },
          { approverUserId: userMap['lead001'], role: 'FACULTY_LEADER', mode: 'PROXY', decision: 'APPROVED', comment: 'Nhất trí phê duyệt cấp Khoa, chuyển triển khai thực hiện.' },
        ],
      },
    },
  });

  // 2. Progress Reports
  await prisma.progressReport.createMany({
    data: [
      {
        projectId: 'SV-2026-CNTT1-001',
        pmId: 2,
        reportContent: 'Hoàn thành 100% thiết kế CSDL 34 bảng PostgreSQL, hoàn thiện REST API NestJS và giao diện S-Link 8 phân hệ.',
        productUrl: 'https://github.com/datptitudu2/BTL-HTTTQL-QLNCKHSV',
        advisorComment: 'Tiến độ vượt kế hoạch, chất lượng code và giao diện tốt.',
        assessment: 'PASS',
        submittedAt: new Date('2026-12-18'),
      },
      {
        projectId: 'SV-2026-CNTT1-002',
        pmId: 2,
        reportContent: 'Đã hoàn thành tiền xử lý dữ liệu quy chế học vụ PTIT và triển khai thử nghiệm mô hình embedding trên 1.200 câu hỏi.',
        productUrl: 'https://github.com/ptit-srms/rag-assistant-demo',
        advisorComment: 'Cần bổ sung đánh giá độ trễ phản hồi LLM trong kỳ báo cáo tới.',
        assessment: 'PASS',
        submittedAt: new Date('2026-12-19'),
      },
      {
        projectId: 'SV-2026-CNTT1-003',
        pmId: 2,
        reportContent: 'Hoàn thành tiền xử lý chuỗi thời gian POS và trích xuất 24 đặc trưng mùa vụ cho doanh nghiệp SME.',
        productUrl: 'https://github.com/ptit-ds/pos-sme-forecast',
        advisorComment: 'Đạt tiến độ Mốc 2, tiếp tục tối ưu mô hình dự báo.',
        assessment: 'PASS',
        submittedAt: new Date('2026-12-18'),
      },
      {
        projectId: 'SV-2026-DPT-001',
        pmId: 2,
        reportContent: 'Hoàn thành nguyên mẫu Mobile AR và phiếu khảo sát 250 người dùng trẻ.',
        productUrl: 'https://github.com/ptit-dpt/mobile-ar-impulse',
        advisorComment: 'Kết quả thử nghiệm bước đầu rất khả quan.',
        assessment: 'PASS',
        submittedAt: new Date('2026-12-17'),
      },
      {
        projectId: 'SV-2026-QTKD1-001',
        pmId: 2,
        reportContent: 'Triển khai thử nghiệm Smart Contract truy xuất nguồn gốc nông sản trên mạng Testnet.',
        productUrl: 'https://github.com/ptit-biz/agritech-smart-contract',
        advisorComment: 'Đạt yêu cầu tiến độ đợt 1.',
        assessment: 'PASS',
        submittedAt: new Date('2026-12-19'),
      },
      {
        projectId: 'SV-2026-ATTT-001',
        pmId: 2,
        reportContent: 'Hoàn thành thu thập bộ dữ liệu lưu lượng mạng IoT (CICIoT) và huấn luyện mô hình ResNet phát hiện Zero-day.',
        productUrl: 'https://github.com/ptit-sec/iot-zeroday-resnet',
        advisorComment: 'Độ chính xác phát hiện đạt 94.2%, đạt tiến độ đề cương.',
        assessment: 'PASS',
        submittedAt: new Date('2026-12-18'),
      },
      {
        projectId: 'SV-2026-CNTT1-001',
        pmId: 4,
        reportContent: 'Nộp đầy đủ Hồ sơ nghiệm thu Mẫu 3.1 - 3.4, sản phẩm phần mềm hoàn chỉnh và bài báo Tạp chí KH PTIT.',
        productUrl: 'https://github.com/datptitudu2/BTL-HTTTQL-QLNCKHSV',
        advisorComment: 'Đủ điều kiện đưa ra Hội đồng nghiệm thu.',
        assessment: 'PASS',
        submittedAt: new Date('2027-04-05'),
      },
      {
        projectId: 'SV-2026-CNTT1-003',
        pmId: 4,
        reportContent: 'Hoàn thiện Báo cáo tổng kết Mẫu 3.2 - 3.4 và mã nguồn kiểm thử, kiểm tra đạo văn < 10%.',
        productUrl: 'https://github.com/ptit-ds/pos-sme-forecast',
        advisorComment: 'Xác nhận đủ điều kiện nghiệm thu.',
        assessment: 'PASS',
        submittedAt: new Date('2027-04-07'),
      },
      {
        projectId: 'SV-2026-DPT-001',
        pmId: 4,
        reportContent: 'Nộp sản phẩm Mobile AR, báo cáo SPSS và bài báo IEEE.',
        productUrl: 'https://github.com/ptit-dpt/mobile-ar-impulse',
        advisorComment: 'Đạt yêu cầu nghiệm thu cấp Học viện.',
        assessment: 'PASS',
        submittedAt: new Date('2027-04-06'),
      },
      {
        projectId: 'SV-2026-QTKD1-001',
        pmId: 4,
        reportContent: 'Nộp Báo cáo tổng kết, hợp đồng thông minh và báo cáo thực nghiệm chuỗi cung ứng nông sản.',
        productUrl: 'https://github.com/ptit-biz/agritech-smart-contract',
        advisorComment: 'Đủ điều kiện lập Hội đồng nghiệm thu.',
        assessment: 'PASS',
        submittedAt: new Date('2027-04-08'),
      },
      {
        projectId: 'SV-2026-ATTT-001',
        pmId: 4,
        reportContent: 'Nộp hoàn chỉnh Báo cáo tổng kết (Mẫu 3.1 - 3.4), mã nguồn ResNet Zero-day (tỷ lệ trùng lặp 9.5%).',
        productUrl: 'https://github.com/ptit-sec/iot-zeroday-resnet',
        advisorComment: 'Xác nhận hoàn thành sản phẩm, đủ điều kiện nghiệm thu.',
        assessment: 'PASS',
        submittedAt: new Date('2027-04-08'),
      },
    ],
  });

  // 3. Seminars (Mẫu 3.5 & RSVP)
  await prisma.seminar.create({
    data: {
      projectId: 'SV-2026-CNTT1-001',
      planTitle: 'Hội thảo khoa học Khoa CNTT 1 - Báo cáo sản phẩm trung gian Đợt 1 (Mẫu 3.5)',
      heldAt: new Date('2026-12-20T08:30:00Z'),
      location: 'Phòng Hội thảo Tầng 2 - Nhà A2, Học viện PTIT',
      meetingLink: 'https://meet.google.com/srms-nckh-cntt1',
      invitationCode: '128/GM-CNTT1',
      status: 'COMPLETED',
      feedback: 'Nhóm SV trình bày xuất sắc demo hệ thống SRMS chuẩn QĐ 521. Hội đồng góp ý tối ưu hóa phần xuất biểu mẫu PDF và thuật toán chấm điểm.',
      discussion: 'Nhóm SV trình bày xuất sắc demo hệ thống SRMS chuẩn QĐ 521. Hội đồng góp ý tối ưu hóa phần xuất biểu mẫu PDF và thuật toán chấm điểm.',
      overallAssessment: 'Đạt yêu cầu chất lượng học thuật và tiến độ cấp Khoa (Mẫu 3.5).',
      revisionRequests: 'Bổ sung kiểm thử hiệu năng xuất PDF hàng loạt trước khi nộp nghiệm thu.',
      minutesFileUrl: '/storage/seminars/BB_3_5_CNTT1_001.pdf',
      members: {
        create: [
          { userId: userMap['lead001'], attendeeName: 'PGS.TS. Trần Đình Quế', role: 'CHAIR', unit: 'Trưởng Khoa CNTT 1', email: 'quetd@ptit.edu.vn', rsvpStatus: 'ACCEPTED_ONSITE', respondedAt: new Date('2026-12-15') },
          { userId: userMap['tk001'], attendeeName: 'ThS. Nguyễn Thị Lan', role: 'SECRETARY', unit: 'Thư ký Khoa CNTT 1', email: 'lannt@ptit.edu.vn', rsvpStatus: 'ACCEPTED_ONSITE', respondedAt: new Date('2026-12-15') },
          { userId: userMap['gv001'], attendeeName: 'TS. Ngô Quốc Dũng', role: 'ADVISOR', unit: 'GVHD - Bộ môn CNPM', email: 'dungnq@ptit.edu.vn', rsvpStatus: 'ACCEPTED_ONSITE', respondedAt: new Date('2026-12-16') },
          { userId: userMap['sv001'], attendeeName: 'Nguyễn Văn An', role: 'LEADER', unit: 'Chủ nhiệm (B23DCCN001)', email: 'an.nv@stu.ptit.edu.vn', rsvpStatus: 'ACCEPTED_ONSITE', respondedAt: new Date('2026-12-15') },
          { userId: userMap['sv002'], attendeeName: 'Trần Thị Bình', role: 'MEMBER', unit: 'Thành viên (B23DCCN002)', email: 'binh.tt@stu.ptit.edu.vn', rsvpStatus: 'ACCEPTED_ONLINE', respondedAt: new Date('2026-12-16') },
        ],
      },
    },
  });

  await prisma.seminar.create({
    data: {
      projectId: 'SV-2026-CNTT1-002',
      planTitle: 'Sinh hoạt học thuật Bộ môn Hệ thống thông tin - Đánh giá mô hình RAG (Mẫu 3.5)',
      heldAt: new Date('2026-12-22T14:00:00Z'),
      location: 'Phòng Lab AI 405 - Nhà A2, Học viện PTIT',
      meetingLink: 'https://meet.google.com/srms-rag-httt',
      invitationCode: '132/GM-CNTT1',
      status: 'INVITED', // Đang mở RSVP cho mọi thành viên test realtime!
      members: {
        create: [
          { userId: userMap['lead001'], attendeeName: 'PGS.TS. Trần Đình Quế', role: 'CHAIR', unit: 'Trưởng Khoa CNTT 1', email: 'quetd@ptit.edu.vn', rsvpStatus: 'ACCEPTED_ONSITE', respondedAt: new Date('2026-12-17') },
          { userId: userMap['tk001'], attendeeName: 'ThS. Nguyễn Thị Lan', role: 'SECRETARY', unit: 'Thư ký Khoa CNTT 1', email: 'lannt@ptit.edu.vn', rsvpStatus: 'ACCEPTED_ONSITE', respondedAt: new Date('2026-12-17') },
          { userId: userMap['gv001'], attendeeName: 'TS. Ngô Quốc Dũng', role: 'ADVISOR', unit: 'GVHD - Bộ môn CNPM', email: 'dungnq@ptit.edu.vn', rsvpStatus: 'PENDING' },
          { userId: userMap['sv003'], attendeeName: 'Lê Minh Khôi', role: 'LEADER', unit: 'Chủ nhiệm (B23DCCN003)', email: 'khoi.lm@stu.ptit.edu.vn', rsvpStatus: 'PENDING' },
          { userId: userMap['sv004'], attendeeName: 'Phạm Gia Hân', role: 'MEMBER', unit: 'Thành viên (B23DCCN004)', email: 'han.pg@stu.ptit.edu.vn', rsvpStatus: 'PENDING' },
          { userId: userMap['sv001'], attendeeName: 'Nguyễn Văn An', role: 'ATTENDEE', unit: 'Sinh viên tham dự (B23DCCN001)', email: 'an.nv@stu.ptit.edu.vn', rsvpStatus: 'PENDING' },
        ],
      },
    },
  });

  await prisma.seminar.createMany({
    data: [
      {
        projectId: 'SV-2026-CNTT1-003',
        planTitle: 'Sinh hoạt khoa học Bộ môn Khoa học dữ liệu - Dự báo POS (Mẫu 3.5)',
        heldAt: new Date('2026-12-20T09:00:00Z'),
        location: 'Phòng Hội thảo 301 - Nhà A2, Học viện PTIT',
        invitationCode: '135/GM-CNTT1',
        status: 'COMPLETED',
        feedback: 'Đã nghiệm thu tiến độ bước 1, mô hình trích xuất đặc trưng đạt độ chính xác tốt.',
        discussion: 'Đã nghiệm thu tiến độ bước 1, mô hình trích xuất đặc trưng đạt độ chính xác tốt.',
        overallAssessment: 'Đạt yêu cầu tiến độ bước 1 cấp Bộ môn/Khoa.',
        revisionRequests: 'Bổ sung so sánh với mô hình ARIMA truyền thống trong báo cáo tổng kết.',
        minutesFileUrl: '/storage/seminars/BB_3_5_CNTT1_003.pdf',
      },
      {
        projectId: 'SV-2026-DPT-001',
        planTitle: 'Hội thảo khoa học Khoa Đa phương tiện - Mobile AR (Mẫu 3.5)',
        heldAt: new Date('2026-12-19T14:00:00Z'),
        location: 'Phòng Lab Đa phương tiện 302 - Nhà A2',
        invitationCode: '129/GM-DPT',
        status: 'COMPLETED',
        feedback: 'Sản phẩm Mobile AR hoạt động ổn định trên Android/iOS.',
        discussion: 'Sản phẩm Mobile AR hoạt động ổn định trên Android/iOS.',
        overallAssessment: 'Sản phẩm thực nghiệm hoàn thiện tốt, đủ điều kiện hoàn tất báo cáo.',
        revisionRequests: 'Hoàn thiện phụ lục bảng hỏi khảo sát người dùng.',
        minutesFileUrl: '/storage/seminars/BB_3_5_DPT_001.pdf',
      },
      {
        projectId: 'SV-2026-QTKD1-001',
        planTitle: 'Hội thảo khoa học Khoa QTKD 1 - Blockchain Nông sản (Mẫu 3.5)',
        heldAt: new Date('2026-12-21T09:00:00Z'),
        location: 'Phòng Hội thảo Khoa QTKD1 - Nhà A3',
        invitationCode: '134/GM-QTKD1',
        status: 'COMPLETED',
        feedback: 'Hoàn thành tốt nội dung sinh hoạt khoa học cấp Khoa.',
        discussion: 'Hoàn thành tốt nội dung sinh hoạt khoa học cấp Khoa.',
        overallAssessment: 'Đạt yêu cầu sinh hoạt học thuật cấp Khoa.',
        revisionRequests: 'Làm rõ chi phí gas thực thi Smart Contract trong chương 3.',
        minutesFileUrl: '/storage/seminars/BB_3_5_QTKD1_001.pdf',
      },
      {
        projectId: 'SV-2026-ATTT-001',
        planTitle: 'Hội thảo khoa học Khoa An toàn thông tin - IoT Zero-day (Mẫu 3.5)',
        heldAt: new Date('2026-12-20T14:00:00Z'),
        location: 'Phòng Lab An toàn thông tin 404 - Nhà A2',
        invitationCode: '130/GM-ATTT',
        status: 'COMPLETED',
        feedback: 'Nhóm SV trình diễn phát hiện tấn công Zero-day đạt yêu cầu tiến độ.',
        discussion: 'Nhóm SV trình diễn phát hiện tấn công Zero-day đạt yêu cầu tiến độ.',
        overallAssessment: 'Đạt yêu cầu tiến độ và chất lượng chuyên môn ATTT.',
        revisionRequests: 'Bổ sung ma trận nhầm lẫn (Confusion Matrix) vào báo cáo tổng kết.',
        minutesFileUrl: '/storage/seminars/BB_3_5_ATTT_001.pdf',
      },
    ],
  });

  // 4. Change Requests (Đơn điều chỉnh / Gia hạn)
  await prisma.changeRequest.create({
    data: {
      projectId: 'SV-2026-CNTT1-002',
      requestType: 'EXTENSION',
      reason: 'Xin gia hạn thời gian nộp sản phẩm kiểm thử RAG thêm 15 ngày để thu thập bổ sung dữ liệu câu hỏi quy chế từ Phòng Giáo vụ.',
      newDueDate: new Date('2027-04-25'),
      resultStatus: 'PENDING',
      approvals: {
        create: [
          { approverUserId: userMap['gv001'], stage: 'ADVISOR', approvalMode: 'DIRECT', decision: 'APPROVED', comment: 'Xác nhận lý do chính đáng, đề nghị Khoa xem xét gia hạn 15 ngày.' },
        ],
      },
    },
  });

  // =========================================================================
  // KHO D6: TÀI LIỆU & BÀI BÁO KHOA HỌC, HỘI ĐỒNG NGHIỆM THU, PHIẾU CHẤM MẪU 4.1
  // =========================================================================
  await prisma.projectDocument.createMany({
    data: [
      {
        projectId: 'SV-2026-CNTT1-001',
        docType: 'SUMMARY_REPORT',
        fileUrl: '/storage/docs/SV-2026-CNTT1-001_BaoCaoTongKet_Mau3_2.pdf',
        plagiarismRate: 6.4,
        libraryCode: 'THU-VIEN-SO-2027-001',
        visibility: 'PUBLIC',
      },
      {
        projectId: 'SV-2026-CNTT1-001',
        docType: 'PAPER',
        fileUrl: 'https://tapchikhoahoc.ptit.edu.vn/bai-bao-srms-slink-2027.pdf',
        plagiarismRate: 4.2,
        libraryCode: 'PAPER-FAIR-2027-01',
        visibility: 'PUBLIC',
      },
      {
        projectId: 'SV-2026-DPT-001',
        docType: 'PAPER',
        fileUrl: 'https://ieeexplore.ieee.org/document/mobile-ar-ptit-2027',
        plagiarismRate: 8.1,
        libraryCode: 'PAPER-IEEE-2027-09',
        visibility: 'PUBLIC',
      },
      {
        projectId: 'SV-2026-ATTT-001',
        docType: 'SOURCE_CODE',
        fileUrl: 'https://github.com/ptit-sec/iot-zeroday-resnet',
        plagiarismRate: 9.5,
        libraryCode: 'SRC-ATTT-2027-04',
        visibility: 'INTERNAL',
      },
      {
        projectId: 'SV-2026-ATTT-001',
        docType: 'SUMMARY_REPORT',
        fileUrl: '/storage/docs/SV-2026-ATTT-001_BaoCaoTongKet_Mau3_2.pdf',
        plagiarismRate: 9.5,
        libraryCode: 'THU-VIEN-SO-2027-003',
        visibility: 'PUBLIC',
      },
      {
        projectId: 'SV-2026-DPT-001',
        docType: 'SUMMARY_REPORT',
        fileUrl: '/storage/docs/SV-2026-DPT-001_BaoCaoTongKet_Mau3_2.pdf',
        plagiarismRate: 8.1,
        libraryCode: 'THU-VIEN-SO-2027-002',
        visibility: 'PUBLIC',
      },
      {
        projectId: 'SV-2026-CNTT1-003',
        docType: 'SUMMARY_REPORT',
        fileUrl: '/storage/docs/SV-2026-CNTT1-003_BaoCaoTongKet_Mau3_2.pdf',
        plagiarismRate: 7.4,
        libraryCode: null,
        visibility: 'INTERNAL',
      },
      {
        projectId: 'SV-2026-QTKD1-001',
        docType: 'SUMMARY_REPORT',
        fileUrl: '/storage/docs/SV-2026-QTKD1-001_BaoCaoTongKet_Mau3_2.pdf',
        plagiarismRate: 11.2,
        libraryCode: null,
        visibility: 'INTERNAL',
      },
    ],
  });

  // Hội đồng 1: SV-2026-CNTT1-001 (Đã nghiệm thu XUẤT SẮC 93.8đ)
  const council1 = await prisma.council.create({
    data: {
      councilName: 'Hội đồng Nghiệm thu Đề tài NCKH Khoa CNTT 1 - Hội đồng 01',
      decisionNo: '145/QĐ-HV',
      decisionDate: new Date('2027-04-15'),
      defenseDate: new Date('2027-04-28T08:30:00Z'),
      location: 'Hội trường Tầng 1 - Nhà A2, Học viện PTIT',
      members: {
        create: [
          { lecturerId: 'GV005', councilRole: 'CHAIR', attendance: 'Có mặt' },
          { lecturerId: 'GV006', councilRole: 'REVIEWER_1', attendance: 'Có mặt' },
          { lecturerId: 'GV002', councilRole: 'REVIEWER_2', attendance: 'Có mặt' },
          { lecturerId: 'GV004', councilRole: 'SECRETARY', attendance: 'Có mặt' },
          { lecturerId: 'GV003', councilRole: 'MEMBER', attendance: 'Có mặt' },
        ],
      },
    },
    include: { members: true },
  });

  const acc1 = await prisma.acceptance.create({
    data: {
      projectId: 'SV-2026-CNTT1-001',
      councilId: council1.councilId,
      defenseTime: new Date('2027-04-28T08:30:00Z'),
      avgScore: 93.8,
      grade: 'XUAT_SAC',
      minutesNo: '01/BB-HĐNT-CNTT1',
      approvalDocNo: '198/QĐ-KHCN',
    },
  });

  const scoresC1 = [
    [9.5, 14.5, 14.0, 33.0, 14.0, 5.0, 4.5], // 94.5
    [9.0, 14.0, 14.0, 32.5, 14.5, 4.5, 4.5], // 93.0
    [9.0, 14.0, 13.5, 33.0, 13.5, 4.5, 5.0], // 92.5
    [9.5, 15.0, 14.0, 33.5, 14.0, 4.5, 4.5], // 95.0
    [9.5, 14.0, 14.0, 33.0, 14.0, 5.0, 4.5], // 94.0
  ];

  for (let i = 0; i < council1.members.length; i++) {
    const s = scoresC1[i];
    const total = s.reduce((a, b) => a + b, 0);
    await prisma.evaluationSheet.create({
      data: {
        acceptanceId: acc1.acceptanceId,
        cmId: council1.members[i].cmId,
        totalScore: total,
        isOutlier: false,
        strengths: 'Hệ thống phần mềm hoàn thiện cao, số hóa toàn diện quy trình QĐ 521/QĐ-HV.',
        limitations: 'Cần mở rộng tích hợp SSO thực tế khi Học viện cấp endpoint OIDC.',
        qaNotes: 'Nhóm sinh viên trả lời tự tin, nắm chắc mô hình ERD và thuật toán loại trừ điểm lệch.',
        qaComment: 'Nhóm sinh viên trả lời tự tin, nắm chắc mô hình ERD và thuật toán loại trừ điểm lệch.',
        conclusionAwardRec: 'Đề tài đạt loại Xuất sắc, đề nghị Giám đốc Học viện khen thưởng Giải Nhất và đề cử dự thi cấp Bộ.',
        recommendAward: true,
        submittedAt: new Date('2027-04-28T10:30:00Z'),
        scoredAt: new Date('2027-04-28T10:30:00Z'),
        scores: {
          create: s.map((val, idx) => ({ criteriaId: criteriaByOrder[idx + 1], score: val })),
        },
      },
    });
  }

  // Hội đồng 2: SV-2026-DPT-001 (Đã nghiệm thu TỐT 85.5đ - có 1 phiếu lệch >15đ minh họa thuật toán Mẫu 4.2!)
  const council2 = await prisma.council.create({
    data: {
      councilName: 'Hội đồng Nghiệm thu Đề tài NCKH Khoa Đa phương tiện - Hội đồng 02',
      decisionNo: '148/QĐ-HV',
      decisionDate: new Date('2027-04-16'),
      defenseDate: new Date('2027-04-29T09:00:00Z'),
      location: 'Phòng Lab Đa phương tiện 302 - Nhà A2',
      members: {
        create: [
          { lecturerId: 'GV004', councilRole: 'CHAIR', attendance: 'Có mặt' },
          { lecturerId: 'GV001', councilRole: 'REVIEWER_1', attendance: 'Có mặt' },
          { lecturerId: 'GV003', councilRole: 'REVIEWER_2', attendance: 'Có mặt' },
          { lecturerId: 'GV005', councilRole: 'SECRETARY', attendance: 'Có mặt' },
          { lecturerId: 'GV006', councilRole: 'MEMBER', attendance: 'Có mặt' },
        ],
      },
    },
    include: { members: true },
  });

  const acc2 = await prisma.acceptance.create({
    data: {
      projectId: 'SV-2026-DPT-001',
      councilId: council2.councilId,
      defenseTime: new Date('2027-04-29T09:00:00Z'),
      avgScore: 85.5, // Trung bình 4 phiếu hợp lệ: (84 + 85.5 + 86.5 + 86)/4 = 85.5 (phiếu 61.0 bị loại do lệch > 15đ!)
      grade: 'TOT',
      minutesNo: '02/BB-HĐNT-DPT',
    },
  });

  const scoresC2 = [
    [8.5, 13.0, 12.5, 30.0, 12.0, 4.0, 4.0], // 84.0
    [8.5, 13.5, 13.0, 30.5, 12.5, 4.0, 3.5], // 85.5
    [6.0, 9.0, 9.0, 22.0, 9.0, 3.0, 3.0],    // 61.0 -> Lệch > 15 điểm so với ĐTB ban đầu (80.6) -> isOutlier = true!
    [8.5, 13.5, 13.0, 31.0, 12.5, 4.0, 4.0], // 86.5
    [8.5, 13.0, 13.0, 31.0, 12.5, 4.0, 4.0], // 86.0
  ];

  for (let i = 0; i < council2.members.length; i++) {
    const s = scoresC2[i];
    const total = s.reduce((a, b) => a + b, 0);
    const qaText = i === 2 ? 'Phiếu chấm quá khắt khe, chênh lệch >15 điểm so với mặt bằng Hội đồng.' : 'Bảo vệ tốt.';
    await prisma.evaluationSheet.create({
      data: {
        acceptanceId: acc2.acceptanceId,
        cmId: council2.members[i].cmId,
        totalScore: total,
        isOutlier: i === 2,
        strengths: 'Ứng dụng Mobile AR trực quan, có bài báo quốc tế IEEE.',
        limitations: 'Cần mở rộng mẫu khảo sát tại khu vực miền Bắc.',
        qaNotes: qaText,
        qaComment: qaText,
        conclusionAwardRec: i === 2 ? 'Đề tài đạt mức Khá.' : 'Đề tài đạt loại Tốt, đề xuất xét khen thưởng cấp Học viện.',
        recommendAward: i !== 2,
        submittedAt: new Date('2027-04-29T11:00:00Z'),
        scoredAt: new Date('2027-04-29T11:00:00Z'),
        scores: {
          create: s.map((val, idx) => ({ criteriaId: criteriaByOrder[idx + 1], score: val })),
        },
      },
    });
  }

  // Hội đồng 3: SV-2026-ATTT-001 (Đã nghiệm thu KHÁ 78.5đ)
  const council3 = await prisma.council.create({
    data: {
      councilName: 'Hội đồng Nghiệm thu Đề tài NCKH Khoa An toàn thông tin - Hội đồng 03',
      decisionNo: '150/QĐ-HV',
      decisionDate: new Date('2027-04-17'),
      defenseDate: new Date('2027-04-30T14:00:00Z'),
      location: 'Phòng Lab An toàn thông tin 404 - Nhà A2',
      members: {
        create: [
          { lecturerId: 'GV002', councilRole: 'CHAIR', attendance: 'Có mặt' },
          { lecturerId: 'GV001', councilRole: 'REVIEWER_1', attendance: 'Có mặt' },
          { lecturerId: 'GV006', councilRole: 'REVIEWER_2', attendance: 'Có mặt' },
          { lecturerId: 'GV005', councilRole: 'SECRETARY', attendance: 'Có mặt' },
          { lecturerId: 'GV003', councilRole: 'MEMBER', attendance: 'Có mặt' },
        ],
      },
    },
    include: { members: true },
  });

  const acc3 = await prisma.acceptance.create({
    data: {
      projectId: 'SV-2026-ATTT-001',
      councilId: council3.councilId,
      defenseTime: new Date('2027-04-30T14:00:00Z'),
      avgScore: 78.5,
      grade: 'KHA',
      minutesNo: '03/BB-HĐNT-ATTT',
    },
  });

  const scoresC3 = [
    [8.0, 12.0, 12.0, 28.0, 11.0, 4.0, 3.5], // 78.5
    [7.5, 12.0, 12.0, 28.0, 11.5, 3.5, 3.5], // 78.0
    [8.0, 12.5, 12.0, 28.5, 11.5, 3.5, 3.5], // 79.5
    [7.5, 12.0, 12.0, 28.0, 11.5, 3.5, 3.5], // 78.0
    [8.0, 12.0, 12.0, 28.0, 11.5, 3.5, 3.5], // 78.5
  ];

  for (let i = 0; i < council3.members.length; i++) {
    const s = scoresC3[i];
    const total = s.reduce((a, b) => a + b, 0);
    await prisma.evaluationSheet.create({
      data: {
        acceptanceId: acc3.acceptanceId,
        cmId: council3.members[i].cmId,
        totalScore: total,
        isOutlier: false,
        strengths: 'Mô hình Zero-day đạt độ chính xác phát hiện khả quan trên mạng IoT.',
        limitations: 'Cần tối ưu kích thước mô hình để nhúng trên thiết bị cấu hình thấp.',
        qaNotes: 'Nhóm nắm vững kiến trúc mạng ResNet và tập dữ liệu CICIoT.',
        qaComment: 'Nhóm nắm vững kiến trúc mạng ResNet và tập dữ liệu CICIoT.',
        conclusionAwardRec: 'Đề tài đạt yêu cầu nghiệm thu xếp loại Khá.',
        recommendAward: false,
        submittedAt: new Date('2027-04-30T16:00:00Z'),
        scoredAt: new Date('2027-04-30T16:00:00Z'),
        scores: {
          create: s.map((val, idx) => ({ criteriaId: criteriaByOrder[idx + 1], score: val })),
        },
      },
    });
  }

  // Hội đồng 4: SV-2026-CNTT1-003 (CHỜ BẢO VỆ & CHẤM ĐIỂM - để GVHD/Hội đồng test chấm điểm live!)
  const council4 = await prisma.council.create({
    data: {
      councilName: 'Hội đồng Nghiệm thu Đề tài NCKH Khoa CNTT 1 - Hội đồng 04 (Đợt 2)',
      decisionNo: '155/QĐ-HV',
      decisionDate: new Date('2027-04-20'),
      defenseDate: new Date('2027-05-05T08:30:00Z'),
      location: 'Phòng Hội thảo Tầng 2 - Thư viện PTIT',
      members: {
        create: [
          { lecturerId: 'GV001', councilRole: 'CHAIR', attendance: 'Có mặt' },
          { lecturerId: 'GV003', councilRole: 'REVIEWER_1', attendance: 'Có mặt' },
          { lecturerId: 'GV004', councilRole: 'REVIEWER_2', attendance: 'Có mặt' },
          { lecturerId: 'GV002', councilRole: 'SECRETARY', attendance: 'Có mặt' },
          { lecturerId: 'GV007', councilRole: 'MEMBER', attendance: 'Có mặt' },
        ],
      },
    },
  });

  await prisma.acceptance.create({
    data: {
      projectId: 'SV-2026-CNTT1-003',
      councilId: council4.councilId,
      defenseTime: new Date('2027-05-05T08:30:00Z'),
      grade: 'PENDING',
    },
  });

  // =========================================================================
  // KHO D7: CHỨNG TỪ THANH QUYẾT TOÁN (SETTLEMENTS) ĐÚNG LUỒNG KHOA -> TCKT
  // =========================================================================
  const budget1 = await prisma.budget.findUnique({ where: { projectId: 'SV-2026-CNTT1-001' } });
  const budgetDpt = await prisma.budget.findUnique({ where: { projectId: 'SV-2026-DPT-001' } });
  const budgetAttt = await prisma.budget.findUnique({ where: { projectId: 'SV-2026-ATTT-001' } });

  if (budget1) {
    await prisma.settlement.createMany({
      data: [
        {
          budgetId: budget1.budgetId,
          voucherNo: 'PC-2027-001',
          invoiceNo: 'HD-VAT-89210',
          category: 'Thuê hạ tầng máy chủ & tên miền kiểm thử',
          description: 'Thuê máy chủ Cloud triển khai thử nghiệm hệ thống SRMS 12 tháng',
          supplier: 'Công ty Cổ phần Hạ tầng Dữ liệu NetHost',
          amount: 1500000,
          voucherFileUrl: '/storage/vouchers/HD-VAT-89210.pdf',
          facultyConfirmed: true,
          submittedAt: new Date('2027-04-29'),
          settledAt: new Date('2027-05-02'), // Đã giải ngân hoàn tất
        },
        {
          budgetId: budget1.budgetId,
          voucherNo: 'PC-2027-002',
          invoiceNo: 'HD-IN-6628',
          category: 'In ấn kỷ yếu, đóng bìa cứng Mẫu 3.2',
          description: 'In 06 cuốn báo cáo tổng kết và sao lưu đĩa sản phẩm nộp P.QLKHCN',
          supplier: 'Trung tâm In ấn Tài liệu Học viện PTIT',
          amount: 1200000,
          voucherFileUrl: '/storage/vouchers/HD-IN-6628.pdf',
          facultyConfirmed: true, // Khoa đã xác nhận -> Chờ P.TCKT duyệt chi!
          submittedAt: new Date('2027-05-01'),
          settledAt: null,
        },
        {
          budgetId: budget1.budgetId,
          voucherNo: 'PC-2027-003',
          invoiceNo: 'HD-HT-9012',
          category: 'Lệ phí đăng bài báo Hội thảo Khoa học',
          description: 'Lệ phí xuất bản bài báo kỷ yếu Hội thảo Công nghệ thông tin toàn quốc',
          supplier: 'Tạp chí Khoa học Công nghệ',
          amount: 2300000,
          voucherFileUrl: '/storage/vouchers/HD-HT-9012.pdf',
          facultyConfirmed: false, // Mới nộp -> Chờ Khoa xác nhận khối lượng hoàn thành (DFD 6.1)
          submittedAt: new Date('2027-05-02'),
          settledAt: null,
        },
      ],
    });
  }

  if (budgetDpt) {
    await prisma.settlement.create({
      data: {
        budgetId: budgetDpt.budgetId,
        voucherNo: 'PC-2027-004',
        invoiceNo: 'HD-AR-2027-11',
        category: 'Mua sắm thiết bị kiểm thử Mobile AR',
        description: 'Thuê bộ kit thiết bị thực tế tăng cường & phí xuất bản IEEE',
        supplier: 'Công ty Công nghệ Số Minh Anh',
        amount: 3500000,
        voucherFileUrl: '/storage/vouchers/HD-AR-2027-11.pdf',
        facultyConfirmed: true,
        submittedAt: new Date('2027-05-01'),
        settledAt: null,
      },
    });
  }

  if (budgetAttt) {
    await prisma.settlement.create({
      data: {
        budgetId: budgetAttt.budgetId,
        voucherNo: 'PC-2027-005',
        invoiceNo: 'HD-IOT-7741',
        category: 'Linh kiện cảm biến & Gateway IoT',
        description: 'Mua thiết bị IoT thực nghiệm tấn công mạng Zero-day',
        supplier: 'Cửa hàng Linh kiện Điện tử Bách Khoa',
        amount: 2800000,
        voucherFileUrl: '/storage/vouchers/HD-IOT-7741.pdf',
        facultyConfirmed: false,
        submittedAt: new Date('2027-05-03'),
        settledAt: null,
      },
    });
  }

  // =========================================================================
  // KHO D8: KHEN THƯỞNG (MẪU 5), CHỨNG NHẬN SỐ, GIỜ NCKH GV, ĐIỂM THƯỞNG CTSV
  // =========================================================================
  await prisma.awardNomination.createMany({
    data: [
      {
        projectId: 'SV-2026-CNTT1-001',
        awardLevel: 'INSTITUTE',
        rewardDecisionNo: '210/QĐ-HV',
        prizeGrade: 'Giải Nhất cấp Học viện (Đề cử Bộ GD&ĐT)',
        rewardAmount: 5000000,
        supportFund: 1000000, // Tối đa 1.000.000đ theo Điều 15.2.i QĐ 521
        supportAmount: 1000000,
        qlkhReviewStatus: 'APPROVED',
        approvalStatus: 'APPROVED',
        status: 'APPROVED',
      },
      {
        projectId: 'SV-2026-DPT-001',
        awardLevel: 'INSTITUTE',
        prizeGrade: 'Giải Nhì cấp Học viện',
        rewardAmount: 3000000,
        supportFund: 0,
        supportAmount: 0,
        qlkhReviewStatus: 'APPROVED',
        approvalStatus: 'PENDING',
        status: 'PENDING', // Chờ P.QLKHCN & BGĐ phê duyệt đề cử Mẫu 5
      },
    ],
  });

  // Giấy chứng nhận số (Điều 15.2.e: Chỉ cấp từ loại Khá trở lên)
  await prisma.certificate.createMany({
    data: [
      {
        projectId: 'SV-2026-CNTT1-001',
        recipientUserId: userMap['sv001'],
        recipientType: 'STUDENT',
        certCode: 'GCN-NCKH-2027-001',
        grade: 'Xuất sắc',
        issuedDate: new Date('2027-05-05'),
      },
      {
        projectId: 'SV-2026-CNTT1-001',
        recipientUserId: userMap['sv002'],
        recipientType: 'STUDENT',
        certCode: 'GCN-NCKH-2027-002',
        grade: 'Xuất sắc',
        issuedDate: new Date('2027-05-05'),
      },
      {
        projectId: 'SV-2026-DPT-001',
        recipientUserId: userMap['sv006'],
        recipientType: 'STUDENT',
        certCode: 'GCN-NCKH-2027-003',
        grade: 'Tốt',
        issuedDate: new Date('2027-05-06'),
      },
    ],
  });

  // Giờ chuẩn NCKH Giảng viên (Điều 16.2.b) - liên kết advisor_assignment_id chuẩn ERD
  const advG001 = await prisma.projectAdvisor.findFirstOrThrow({ where: { lecturerId: 'GV001', projectId: 'SV-2026-CNTT1-001' } });
  const advG002 = await prisma.projectAdvisor.findFirstOrThrow({ where: { lecturerId: 'GV002', projectId: 'SV-2026-DPT-001' } });
  const advG004 = await prisma.projectAdvisor.findFirstOrThrow({ where: { lecturerId: 'GV004', projectId: 'SV-2026-ATTT-001' } });
  await prisma.lecturerHour.createMany({
    data: [
      { lecturerId: 'GV001', projectId: 'SV-2026-CNTT1-001', advisorAssignmentId: advG001.advisorAssignmentId, academicYear: '2026-2027', convertedHours: 30, declarationStatus: 'CONFIRMED' },
      { lecturerId: 'GV002', projectId: 'SV-2026-DPT-001', advisorAssignmentId: advG002.advisorAssignmentId, academicYear: '2026-2027', convertedHours: 25, declarationStatus: 'PENDING' },
      { lecturerId: 'GV004', projectId: 'SV-2026-ATTT-001', advisorAssignmentId: advG004.advisorAssignmentId, academicYear: '2026-2027', convertedHours: 20, declarationStatus: 'PENDING' },
    ],
  });

  // Điểm thưởng sinh viên (Điều 14 & 15.2.h QĐ 521: Trong nước Nhất +0.4, Nhì +0.3, Ba +0.2, KK +0.1)
  await prisma.studentBonus.createMany({
    data: [
      {
        studentId: 'B23DCCN001',
        projectId: 'SV-2026-CNTT1-001',
        bonusPoints: 0.4, // Giải Nhất trong nước: +0.4 TBC học bổng
        trainingScore: 10, // Xuất sắc: +10 ĐRL
        scholarshipPriority: true,
        approvalStatus: 'PENDING', // Chờ Phòng CT&CTSV (ThS. Bùi Văn Toàn) đối soát duyệt
      },
      {
        studentId: 'B23DCCN002',
        projectId: 'SV-2026-CNTT1-001',
        bonusPoints: 0.4,
        trainingScore: 10,
        scholarshipPriority: true,
        approvalStatus: 'PENDING',
      },
      {
        studentId: 'B23DCDT015',
        projectId: 'SV-2026-DPT-001',
        bonusPoints: 0.3, // Giải Nhì trong nước: +0.3 TBC học bổng
        trainingScore: 8,  // Tốt: +8 ĐRL
        scholarshipPriority: true,
        approvalStatus: 'APPROVED',
        decisionNotice: 'TB-CTSV/2027-08',
        approvedBy: 'ThS. Bùi Văn Toàn (P.CT&CTSV)',
        approvedAt: new Date('2027-05-07'),
      },
      {
        studentId: 'B23DCAT012',
        projectId: 'SV-2026-ATTT-001',
        bonusPoints: 0.0,
        trainingScore: 6, // Khá: +6 ĐRL
        scholarshipPriority: false,
        approvalStatus: 'APPROVED',
        decisionNotice: 'TB-CTSV/2027-09',
        approvedBy: 'ThS. Bùi Văn Toàn (P.CT&CTSV)',
        approvedAt: new Date('2027-05-07'),
      },
    ],
  });

  // =========================================================================
  // KHO D9: THÔNG BÁO & LỊCH SỰ KIỆN
  // =========================================================================
  await prisma.notification.createMany({
    data: [
      {
        userId: userMap['sv001'],
        title: 'Chờ Phòng CT&CTSV xét duyệt cộng 10 ĐRL & +0.4đ học bổng',
        content: 'Đề tài SV-2026-CNTT1-001 đạt kết quả Xuất sắc (93.8đ) và Giải Nhất Học viện. Đã cấp Giấy chứng nhận GCN-NCKH-2027-001.',
        channel: 'WEB',
        deliveryStatus: 'SENT',
        urgent: false,
        targetUrl: '/awards',
        type: 'BONUS',
      },
      {
        userId: userMap['sv003'],
        title: 'Giấy mời tham dự Sinh hoạt Khoa học Bộ môn HTTT (Mẫu 3.5)',
        content: 'Khoa CNTT 1 phát hành Giấy mời 132/GM-CNTT1 phiên họp đánh giá tiến độ đề tài SV-2026-CNTT1-002. Vui lòng xác nhận RSVP.',
        channel: 'WEB',
        deliveryStatus: 'SENT',
        urgent: true,
        targetUrl: '/progress',
        type: 'SEMINAR',
      },
      {
        userId: userMap['gv001'],
        title: 'Mời tham gia Hội đồng Nghiệm thu 04 & xác nhận RSVP Sinh hoạt KH',
        content: 'Kính mời TS. Ngô Quốc Dũng xác nhận tham dự Hội thảo Mẫu 3.5 (132/GM-CNTT1) và chấm điểm Hội đồng 04 cho đề tài SV-2026-CNTT1-003.',
        channel: 'WEB',
        deliveryStatus: 'SENT',
        urgent: true,
        targetUrl: '/acceptance',
        type: 'ACCEPTANCE',
      },
      {
        userId: userMap['lead001'],
        title: 'Có 01 Đề cương chi tiết & 01 Đơn gia hạn chờ Lãnh đạo Khoa duyệt',
        content: 'Đề tài SV-2026-CNTT1-002 đã được GVHD TS. Ngô Quốc Dũng phê duyệt đề cương cấp 1. Kính trình Trưởng Khoa xem xét ký duyệt cấp 2.',
        channel: 'WEB',
        deliveryStatus: 'SENT',
        urgent: true,
        targetUrl: '/outlines',
        type: 'DEADLINE',
      },
      {
        userId: userMap['tk001'],
        title: 'Có 02 chứng từ thanh quyết toán chờ Khoa xác nhận khối lượng hoàn thành',
        content: 'Đề nghị Thư ký Khoa CNTT 1 kiểm tra và xác nhận khối lượng hoàn thành cho chứng từ PC-2027-003 trước khi chuyển P.TCKT.',
        channel: 'WEB',
        deliveryStatus: 'SENT',
        urgent: false,
        targetUrl: '/budgets',
        type: 'GENERAL',
      },
      {
        userId: userMap['qlkh001'],
        title: 'Hồ sơ đề tài SV-2026-ATTT-002 đã qua sơ tuyển Khoa, chờ trình Quyết định giao',
        content: 'Khoa ATTT đã gửi kết quả sơ tuyển. Đề nghị P.QLKH&CN rà soát tổng hợp trình Ban Giám đốc ban hành Quyết định giao đề tài.',
        channel: 'WEB',
        deliveryStatus: 'SENT',
        urgent: true,
        targetUrl: '/projects',
        type: 'DEADLINE',
      },
      {
        userId: userMap['tckt001'],
        title: 'Có 02 chứng từ đã được Khoa xác nhận, chờ P.TCKT thẩm tra duyệt chi',
        content: 'Chứng từ PC-2027-002 (SV-2026-CNTT1-001) và PC-2027-004 (SV-2026-DPT-001) đã đủ điều kiện nghiệm thu & xác nhận Khoa.',
        channel: 'WEB',
        deliveryStatus: 'SENT',
        urgent: false,
        targetUrl: '/budgets',
        type: 'GENERAL',
      },
      {
        userId: userMap['ctsv001'],
        title: 'Có 02 sinh viên đề tài Xuất sắc chờ duyệt cộng ĐRL & Điểm học bổng',
        content: 'P.QLKHCN chuyển danh sách sinh viên Nguyễn Văn An & Trần Thị Bình đạt Giải Nhất NCKH (SV-2026-CNTT1-001) để duyệt cộng 10 ĐRL và +0.4đ học bổng.',
        channel: 'WEB',
        deliveryStatus: 'SENT',
        urgent: true,
        targetUrl: '/awards',
        type: 'BONUS',
      },
      {
        userId: userMap['sv015'],
        title: 'Thông báo mở đăng ký Đợt NCKH Sinh viên Năm học 2026 - 2027',
        content: 'Cổng SRMS đang mở tiếp nhận hồ sơ đăng ký đề tài mới (Mẫu 1 & Mẫu 2). Thời hạn nộp đề cương chi tiết: 23:59 ngày 15/10/2026.',
        channel: 'WEB',
        deliveryStatus: 'SENT',
        urgent: false,
        targetUrl: '/projects/new',
        type: 'GENERAL',
      },
      {
        userId: userMap['gv007'],
        scheduleRef: 'QĐ 155/QĐ-HV',
        title: 'Giấy mời tham dự Hội đồng Nghiệm thu 04 (QĐ 155/QĐ-HV)',
        content: 'Kính mời TS. Nguyễn Quang Hưng tham dự và chấm điểm Hội đồng Nghiệm thu 04 cho đề tài SV-2026-CNTT1-003 (Chẩn đoán hình ảnh y tế Deep Learning). Vui lòng truy cập mục Nghiệm thu & Đánh giá.',
        channel: 'WEB',
        deliveryStatus: 'SENT',
        urgent: true,
        targetUrl: '/acceptance',
        type: 'COUNCIL',
      },
    ],
  });

  await prisma.scheduleEvent.createMany({
    data: [
      {
        title: 'Hạn chót Nộp Thuyết minh Đề cương chi tiết (Mẫu 2)',
        eventType: 'Mốc hạn NCKH',
        startDate: '2026-10-15',
        startTime: '23:59',
        endDate: '2026-10-15',
        endTime: '23:59',
        location: 'Cổng thông tin SRMS PTIT (Trực tuyến)',
        regulatoryBasis: 'Khoản 2 Điều 9 QĐ 521/QĐ-HV',
        participants: 'Chủ nhiệm đề tài, Giảng viên hướng dẫn, Lãnh đạo Khoa',
        projectId: 'SV-2026-CNTT1-002',
        note: 'GVHD phê duyệt cấp 1 trước khi Lãnh đạo Khoa phê duyệt cấp 2.',
        dayIndex: 3,
        startHour: 20,
        durationHours: 1,
        targetRoles: JSON.stringify(['ALL']),
        scopeLevel: 'Toàn Học viện',
        broadcastBy: 'Phòng Quản lý Khoa học Công nghệ',
        createdByUserId: userMap['qlkh001'],
      },
      {
        title: 'Sinh hoạt học thuật Bộ môn HTTT - Đánh giá mô hình RAG (Mẫu 3.5)',
        eventType: 'Sinh hoạt KH',
        startDate: '2026-12-22',
        startTime: '14:00',
        endDate: '2026-12-22',
        endTime: '16:30',
        location: 'Phòng Lab AI 405 - Nhà A2, Học viện PTIT',
        regulatoryBasis: 'Điều 9 QĐ 521/QĐ-HV',
        participants: 'Lãnh đạo Khoa CNTT1, GVHD, Nhóm nghiên cứu SV-2026-CNTT1-002',
        projectId: 'SV-2026-CNTT1-002',
        note: 'Đại biểu vui lòng xác nhận RSVP (Trực tiếp / Online / Báo vắng) trên mục Tiến độ & Sinh hoạt KH.',
        dayIndex: 1,
        startHour: 14,
        durationHours: 3,
        targetRoles: JSON.stringify(['STUDENT', 'LECTURER', 'FACULTY_LEADER', 'FACULTY_SECRETARY']),
        scopeLevel: 'Khoa Công nghệ thông tin 1',
        broadcastBy: 'Ban Chủ nhiệm Khoa CNTT 1',
        createdByUserId: userMap['lead001'],
      },
      {
        title: 'Phiên họp Hội đồng Nghiệm thu 04 - Đề tài SV-2026-CNTT1-003 (Mẫu 4.1 & 4.2)',
        eventType: 'Hội đồng thẩm định',
        startDate: '2027-05-05',
        startTime: '08:30',
        endDate: '2027-05-05',
        endTime: '11:00',
        location: 'Phòng Hội thảo Tầng 2 - Thư viện PTIT',
        regulatoryBasis: 'Điều 10 QĐ 521/QĐ-HV',
        participants: 'Hội đồng 05 thành viên (TS. Ngô Quốc Dũng chủ tịch), Nhóm Đỗ Tuấn Anh',
        projectId: 'SV-2026-CNTT1-003',
        note: 'Thành viên Hội đồng chấm điểm độc lập 7 tiêu chí thang 100 trước 11:30.',
        dayIndex: 2,
        startHour: 8,
        durationHours: 3,
        targetRoles: JSON.stringify(['STUDENT', 'LECTURER', 'QLKHCN', 'BOARD', 'FACULTY_LEADER', 'FACULTY_SECRETARY']),
        scopeLevel: 'Khoa Công nghệ thông tin 1',
        broadcastBy: 'Phòng Quản lý Khoa học Công nghệ',
        createdByUserId: userMap['qlkh001'],
      },
      {
        title: 'Đối soát Điểm rèn luyện & Trao giải thưởng NCKH Sinh viên (Điều 14 & 15)',
        eventType: 'Tác nghiệp CTSV',
        startDate: '2027-05-10',
        startTime: '14:00',
        endDate: '2027-05-10',
        endTime: '16:30',
        location: 'Văn phòng Phòng CT&CTSV - Nhà A1',
        regulatoryBasis: 'Điều 14 & Điều 15 QĐ 521/QĐ-HV',
        participants: 'Phòng CT&CTSV (ThS. Bùi Văn Toàn), P.QLKHCN, Sinh viên đạt giải',
        projectId: 'SV-2026-CNTT1-001',
        note: 'Đối soát cộng +10 ĐRL (Xuất sắc), +8 ĐRL (Tốt), +6 ĐRL (Khá) và cộng +0.4đ học bổng Giải Nhất.',
        dayIndex: 4,
        startHour: 14,
        durationHours: 2,
        targetRoles: JSON.stringify(['STUDENT_AFFAIRS', 'QLKHCN', 'STUDENT', 'ADMIN']),
        scopeLevel: 'Phòng CT&CTSV',
        broadcastBy: 'Phòng Công tác Chính trị & CTSV',
        createdByUserId: userMap['ctsv001'],
      },
    ],
  });

  // =========================================================================
  // 13. BẢNG HỆ THỐNG KỸ THUẬT: SYSTEM_SETTINGS, NOTIFICATION_TEMPLATES, AUDIT_LOGS
  // =========================================================================
  await prisma.systemSetting.createMany({
    data: [
      { settingKey: 'QD521_MAX_TEAM_SIZE', settingValue: '5', description: 'Tối đa 05 sinh viên/nhóm nghiên cứu (Điều 6 QĐ 521/QĐ-HV)' },
      { settingKey: 'QD521_MAX_STUDENT_PROJECTS_PER_YEAR', settingValue: '1', description: 'Tối đa 01 đề tài/sinh viên trong 01 năm học (Điều 15.2.a QĐ 521/QĐ-HV)' },
      { settingKey: 'QD521_MAX_ADVISOR_QUOTA', settingValue: '2', description: 'Tối đa 02 đề tài/GVHD trong cùng thời gian (Điều 16.2.a QĐ 521/QĐ-HV)' },
      { settingKey: 'QD521_PLAGIARISM_THRESHOLD', settingValue: '20', description: 'Ngưỡng tỷ lệ trùng lặp tối đa cho phép (< 20%) khi nộp nghiệm thu (Điều 10 QĐ 521/QĐ-HV)' },
      { settingKey: 'QD521_SCORE_DEVIATION_LIMIT', settingValue: '15', description: 'Ngưỡng cảnh báo độ lệch điểm giữa các thành viên Hội đồng (> 15 điểm, Mẫu 4.2)' },
    ],
  });

  await prisma.notificationTemplate.createMany({
    data: [
      {
        templateCode: 'OUTLINE_APPROVED_L2',
        title: 'Phê duyệt Đề cương chi tiết (Mẫu 2)',
        content: 'Đề cương đề tài {{projectId}} đã được Lãnh đạo Khoa phê duyệt Cấp 2.',
        channels: 'IN_APP,EMAIL',
      },
      {
        templateCode: 'SEMINAR_INVITATION_M35',
        title: 'Thư mời tham dự Hội thảo Khoa học cấp Khoa (Mẫu 3.5)',
        content: 'Kính mời đại biểu và nhóm đề tài {{projectId}} tham dự phiên Sinh hoạt học thuật cấp Khoa.',
        channels: 'IN_APP,EMAIL',
      },
      {
        templateCode: 'ACCEPTANCE_RESULT_M42',
        title: 'Công bố Kết quả Nghiệm thu Đề tài NCKH (Mẫu 4.2)',
        content: 'Đề tài {{projectId}} đã hoàn thành nghiệm thu với xếp loại {{grade}}.',
        channels: 'IN_APP,EMAIL',
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: userMap['qlkh001'],
        action: 'CREATE_NCKH_PERIOD',
        entity: 'nckh_periods',
        entityId: String(period.periodId),
        oldValue: null,
        newValue: JSON.stringify({ academicYear: '2026-2027', status: 'ACTIVE', maxBudgetPerProject: 15000000 }),
        ipAddress: '10.10.1.15',
      },
      {
        userId: userMap['lead001'],
        action: 'APPROVE_OUTLINE_LEVEL_2',
        entity: 'project_outlines',
        entityId: 'SV-2026-CNTT1-001',
        oldValue: JSON.stringify({ status: 'ADVISOR_APPROVED' }),
        newValue: JSON.stringify({ status: 'FACULTY_APPROVED', isCurrent: true }),
        ipAddress: '10.10.2.20',
      },
      {
        userId: userMap['qlkh001'],
        action: 'APPROVE_ACCEPTANCE_RESULT',
        entity: 'acceptance_results',
        entityId: 'SV-2026-CNTT1-001',
        oldValue: JSON.stringify({ qlkhcnApproved: false }),
        newValue: JSON.stringify({ qlkhcnApproved: true, avgScore: 93.8, grade: 'Xuất sắc' }),
        ipAddress: '10.10.1.15',
      },
    ],
  });

  console.log('--- KHỞI TẠO TOÀN BỘ DỮ LIỆU MẪU CHUẨN ERD & QĐ 521 THÀNH CÔNG! ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
