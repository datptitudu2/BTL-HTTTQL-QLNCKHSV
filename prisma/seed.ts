import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass + 'srms_salt_2026').digest('hex');
}

async function main() {
  console.log('--- KHỞI TẠO DỮ LIỆU MẪU SRMS PTIT (SEED) ---');

  // 1. ROLES (9 vai trò)
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
      update: {},
      create: r,
    });
  }

  // 2. KHOA / VIỆN ĐÀO TẠO
  const deptsData = [
    { deptCode: 'CNTT1', deptName: 'Khoa Công nghệ thông tin 1', campus: 'HN' },
    { deptCode: 'DTVT1', deptName: 'Khoa Điện tử viễn thông 1', campus: 'HN' },
    { deptCode: 'ATTT', deptName: 'Khoa An toàn thông tin', campus: 'HN' },
    { deptCode: 'DPT', deptName: 'Khoa Đa phương tiện', campus: 'HN' },
    { deptCode: 'QTKD1', deptName: 'Khoa Quản trị kinh doanh 1', campus: 'HN' },
    { deptCode: 'TCKT', deptName: 'Phòng Tài chính - Kế toán', campus: 'HN' },
    { deptCode: 'QLKHCN', deptName: 'Phòng Quản lý Khoa học Công nghệ', campus: 'HN' },
    { deptCode: 'CTSV', deptName: 'Phòng Công tác Chính trị & CTSV', campus: 'HN' },
  ];

  for (const d of deptsData) {
    await prisma.department.upsert({
      where: { deptCode: d.deptCode },
      update: {},
      create: d,
    });
  }

  const roleRecords = await prisma.role.findMany();
  const getRoleId = (code: string) => roleRecords.find((r) => r.roleCode === code)!.roleId;

  const deptRecords = await prisma.department.findMany();
  const getDeptId = (code: string) => deptRecords.find((d) => d.deptCode === code)!.deptId;

  const passwordHash = hashPassword('ptit@123');

  // 3. TÀI KHOẢN NGƯỜI DÙNG & PROFILE CHUẨN HÓA 9 VAI TRÒ
  const usersData = [
    { username: 'admin', name: 'Quản trị viên Học viện PTIT', role: 'ADMIN', email: 'admin@ptit.edu.vn' },
    { username: 'sv001', name: 'Nguyễn Văn An', role: 'STUDENT', email: 'an.nv@stu.ptit.edu.vn', studentId: 'B23DCCN001', class: 'D23CQCN01-B', gpa: 3.65 },
    { username: 'sv002', name: 'Trần Thị Bình', role: 'STUDENT', email: 'binh.tt@stu.ptit.edu.vn', studentId: 'B23DCCN002', class: 'D23CQCN01-B', gpa: 3.52 },
    { username: 'sv003', name: 'Nguyễn Minh Tuấn', role: 'STUDENT', email: 'tuan.nm@stu.ptit.edu.vn', studentId: 'B23DCDT015', class: 'D23CQDT01-B', gpa: 3.48 },
    { username: 'sv004', name: 'Kim Ngọc Bách', role: 'STUDENT', email: 'bach.kn@stu.ptit.edu.vn', studentId: 'B23DCCN088', class: 'D23CQCN01-B', gpa: 3.70 },
    { username: 'sv005', name: 'Phạm Đức Thịnh', role: 'STUDENT', email: 'thinh.pd@stu.ptit.edu.vn', studentId: 'B23DCQT009', class: 'D23CQQT01-B', gpa: 3.42 },
    { username: 'sv006', name: 'Hoàng Quốc Việt', role: 'STUDENT', email: 'viet.hq@stu.ptit.edu.vn', studentId: 'B23DCAT012', class: 'D23CQAT01-B', gpa: 3.58 },
    { username: 'gv001', name: 'TS. Ngô Quốc Dũng', role: 'LECTURER', email: 'dungnq@ptit.edu.vn', lecturerId: 'GV001', rank: 'TS', degree: 'Tiến sĩ', dept: 'CNTT1' },
    { username: 'gv002', name: 'TS. Trần Đình Trí', role: 'LECTURER', email: 'tritd@ptit.edu.vn', lecturerId: 'GV002', rank: 'TS', degree: 'Tiến sĩ', dept: 'DPT' },
    { username: 'gv003', name: 'TS. Đinh Quang Huy', role: 'LECTURER', email: 'huydq@ptit.edu.vn', lecturerId: 'GV003', rank: 'TS', degree: 'Tiến sĩ', dept: 'QTKD1' },
    { username: 'gv004', name: 'TS. Nguyễn Văn Tuấn', role: 'LECTURER', email: 'tuannv@ptit.edu.vn', lecturerId: 'GV004', rank: 'TS', degree: 'Tiến sĩ', dept: 'ATTT' },
    { username: 'gv005', name: 'PGS.TS. Hoàng Minh', role: 'LECTURER', email: 'minhh@ptit.edu.vn', lecturerId: 'GV005', rank: 'PGS.TS', degree: 'Tiến sĩ', dept: 'DTVT1' },
    { username: 'tk001', name: 'ThS. Nguyễn Thị Lan', role: 'FACULTY_SECRETARY', email: 'lannt@ptit.edu.vn' },
    { username: 'lead001', name: 'PGS.TS. Trần Đình Quế', role: 'FACULTY_LEADER', email: 'quetd@ptit.edu.vn' },
    { username: 'qlkh001', name: 'ThS. Phạm Văn Hùng', role: 'QLKHCN', email: 'qlkhcn@ptit.edu.vn' },
    { username: 'bgd001', name: 'PGS.TS. Đặng Hoài Bắc', role: 'BOARD', email: 'bacdh@ptit.edu.vn' },
    { username: 'tckt001', name: 'CN. Lê Thị Mai', role: 'FINANCE', email: 'tckt@ptit.edu.vn' },
    { username: 'ctsv001', name: 'ThS. Bùi Văn Toàn', role: 'STUDENT_AFFAIRS', email: 'ctsv@ptit.edu.vn' },
  ];

  for (const u of usersData) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ ssoUsername: u.username }, { email: u.email }],
      },
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
    } else {
      user = await prisma.user.create({
        data: {
          roleId: getRoleId(u.role),
          ssoUsername: u.username,
          fullName: u.name,
          email: u.email,
          phone: '0988123456',
          status: 'ACTIVE',
          credentials: {
            create: {
              passwordHash: passwordHash,
            },
          },
        },
      });
    }

    if (u.studentId) {
      const existingStudent = await prisma.student.findFirst({
        where: { OR: [{ studentId: u.studentId }, { userId: user.userId }] },
      });
      if (existingStudent) {
        await prisma.student.update({
          where: { studentId: existingStudent.studentId },
          data: {
            deptId: getDeptId(u.username === 'sv003' ? 'ATTT' : 'CNTT1'),
            className: u.class || 'D23CQCN01-B',
            gpa: u.gpa || 3.5,
          },
        });
      } else {
        await prisma.student.create({
          data: {
            studentId: u.studentId,
            userId: user.userId,
            deptId: getDeptId(u.username === 'sv003' ? 'ATTT' : 'CNTT1'),
            dateOfBirth: new Date('2005-08-15'),
            gender: 'Nam',
            ethnicity: 'Kinh',
            className: u.class || 'D23CQCN01-B',
            cohort: '2023-2028',
            studyYear: 3,
            gpa: u.gpa || 3.5,
          },
        });
      }
    }

    if (u.lecturerId) {
      const existingLecturer = await prisma.lecturer.findFirst({
        where: { OR: [{ lecturerId: u.lecturerId }, { userId: user.userId }] },
      });
      if (existingLecturer) {
        await prisma.lecturer.update({
          where: { lecturerId: existingLecturer.lecturerId },
          data: {
            deptId: getDeptId((u as any).dept || 'CNTT1'),
            academicRank: u.rank || 'TS',
            degree: u.degree || 'Tiến sĩ',
          },
        });
      } else {
        await prisma.lecturer.create({
          data: {
            lecturerId: u.lecturerId,
            userId: user.userId,
            deptId: getDeptId((u as any).dept || 'CNTT1'),
            academicRank: u.rank || 'TS',
            degree: u.degree || 'Tiến sĩ',
            researchField: 'Hệ thống thông tin & Trí tuệ nhân tạo',
          },
        });
      }
    }
  }

  // 4. ĐỢT NCKH NĂM HỌC 2026-2027 (D2)
  const period = await prisma.nckhPeriod.upsert({
    where: { periodId: 1 },
    update: {},
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

  // 5. TIÊU CHÍ CHẤM ĐIỂM NGHIỆM THU (MẪU 4.1 - THANG ĐIỂM 100)
  const criteriaData = [
    { orderNo: 1, name: 'Tổng quan tình hình nghiên cứu thuộc lĩnh vực đề tài', max: 20 },
    { orderNo: 2, name: 'Tính cấp thiết, mục tiêu và cách tiếp cận của đề tài', max: 20 },
    { orderNo: 3, name: 'Phương pháp nghiên cứu và kỹ thuật triển khai', max: 20 },
    { orderNo: 4, name: 'Kết quả, sản phẩm và mức độ hoàn thành nội dung', max: 15 },
    { orderNo: 5, name: 'Khả năng ứng dụng thực tiễn hoặc công bố khoa học', max: 10 },
    { orderNo: 6, name: 'Bố cục và hình thức trình bày báo cáo tổng kết', max: 10 },
    { orderNo: 7, name: 'Kỹ năng thuyết trình và trả lời chất vấn của Hội đồng', max: 5 },
  ];

  for (const c of criteriaData) {
    await prisma.evaluationCriteria.upsert({
      where: {
        criteriaId: c.orderNo,
      },
      update: {},
      create: {
        criteriaId: c.orderNo,
        periodId: period.periodId,
        orderNo: c.orderNo,
        title: c.name,
        maxScore: c.max,
      },
    });
  }

  // 6. MỐC KẾ HOẠCH TIẾN ĐỘ (MILESTONES)
  const milestonesData = [
    { type: 'OUTLINE', name: 'Nộp Thuyết minh Đề cương chi tiết (Mẫu 2)', due: new Date('2026-10-15') },
    { type: 'PROGRESS_1', name: 'Báo cáo tiến độ lần 1 & Hội thảo cấp Khoa (Mẫu 3.5)', due: new Date('2026-12-20') },
    { type: 'PROGRESS_2', name: 'Báo cáo tiến độ lần 2 & Thẩm định trung gian', due: new Date('2027-02-28') },
    { type: 'ACCEPTANCE', name: 'Nộp Hồ sơ Nghiệm thu & Sản phẩm (Mẫu 3.1 - 3.4)', due: new Date('2027-04-15') },
  ];

  for (let i = 0; i < milestonesData.length; i++) {
    const m = milestonesData[i];
    await prisma.periodMilestone.upsert({
      where: { pmId: i + 1 },
      update: {},
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

  // 7. ĐỀ TÀI MẪU (D3, D7, D4, D6)
  await prisma.project.upsert({
    where: { projectId: 'SV-2026-CNTT1-001' },
    update: {},
    create: {
      projectId: 'SV-2026-CNTT1-001',
      periodId: period.periodId,
      deptId: getDeptId('CNTT1'),
      titleVi: 'Nghiên cứu và xây dựng hệ thống web quản lý đề tài NCKH sinh viên PTIT S-Link',
      titleEn: 'Development of PTIT Student Research Management System on S-Link Platform',
      researchField: 'Công nghệ thông tin',
      objectives: 'Xây dựng giải pháp phần mềm toàn diện quản lý chu trình vòng đời đề tài NCKH SV theo QĐ 521/QĐ-HV.',
      content: 'Triển khai 8 phân hệ cốt lõi: Xác thực SSO, Đăng ký đề tài, Xét duyệt Khoa, Giám sát tiến độ, Nghiệm thu chấm điểm, Quyết toán kinh phí.',
      methodology: 'Agile/Scrum, kiến trúc Monorepo NestJS + React Ant Design S-Link token.',
      expectedResult: '01 Ứng dụng web hoàn chỉnh, 01 báo cáo thuyết minh Mẫu 3.3, 01 bài báo khoa học hội thảo.',
      status: 'ONGOING',
      registeredAt: new Date('2026-09-10'),
      members: {
        create: [
          {
            studentId: 'B23DCCN001',
            memberRole: 'LEAD',
            contributionPct: 60,
            assignedTask: 'Chủ nhiệm đề tài, thiết kế kiến trúc hệ thống và lập trình backend',
            confirmStatus: 'ACCEPTED',
          },
          {
            studentId: 'B23DCCN002',
            memberRole: 'MEMBER',
            contributionPct: 40,
            assignedTask: 'Thiết kế giao diện người dùng theo chuẩn S-Link và lập trình frontend',
            confirmStatus: 'ACCEPTED',
          },
        ],
      },
      advisors: {
        create: {
          lecturerId: 'GV001',
          assignedBy: 'STUDENT',
          status: 'ACTIVE',
          assignedAt: new Date('2026-09-10'),
        },
      },
      budget: {
        create: {
          requestedAmount: 5000000,
          facultyProposed: 5000000,
          approvedAmount: 5000000,
          status: 'APPROVED',
        },
      },
      outlines: {
        create: {
          versionNo: 1,
          fileUrl: 'https://slink.ptit.edu.vn/storage/outlines/SV-2026-CNTT1-001_v1.pdf',
          submittedAt: new Date('2026-10-10'),
          approvals: {
            create: {
              approverUserId: 5,
              role: 'ADVISOR',
              mode: 'DIRECT',
              decision: 'APPROVED',
              comment: 'Đề cương chi tiết bám sát yêu cầu thực tiễn, nhất trí thông qua.',
            },
          },
        },
      },
    },
  });

  // 8. CÁC ĐỀ TÀI NCKH ĐA DẠNG CỦA CÁC KHOA VÀ GIẢNG VIÊN HƯỚNG DẪN KHÁC (002 - 010)
  const additionalProjects = [
    {
      id: 'SV-2026-CNTT1-002',
      dept: 'DPT',
      titleVi: 'Mobile AR Apps and Impulse Buying: Perspectives from Indonesian Consumers and Tourists.',
      titleEn: 'Mobile AR Apps and Impulse Buying: Perspectives from Indonesian Consumers and Tourists',
      field: 'Đa phương tiện & Hành vi số',
      status: 'FACULTY_APPROVED',
      leadStudent: 'B23DCDT015',
      advisor: 'GV002', // TS. Trần Đình Trí
    },
    {
      id: 'SV-2026-CNTT1-003',
      dept: 'QTKD1',
      titleVi: 'Mental Imagery and Positive Arousal Influencing Purchase Intention in VR Hotels',
      titleEn: 'Mental Imagery and Positive Arousal Influencing Purchase Intention in VR Hotels',
      field: 'Quản trị kinh doanh & Du lịch số',
      status: 'PROPOSED',
      leadStudent: 'B23DCQT009',
      advisor: 'GV003', // TS. Đinh Quang Huy
    },
    {
      id: 'SV-2026-CNTT1-004',
      dept: 'CNTT1',
      titleVi: 'Phương pháp tiền xử lý và trích xuất đặc trưng từ dữ liệu giao dịch POS giúp cải thiện dự báo doanh thu cho doanh nghiệp SME',
      titleEn: 'Feature Extraction from POS Time Series for SME Retail Forecasting',
      field: 'Khoa học dữ liệu & Trí tuệ nhân tạo',
      status: 'COMPLETED',
      leadStudent: 'B23DCCN088',
      advisor: 'GV001', // TS. Ngô Quốc Dũng
    },
    {
      id: 'SV-2026-CNTT1-005',
      dept: 'ATTT',
      titleVi: 'Phát hiện tấn công lỗ hổng bảo mật Zero-day trong hệ sinh thái IoT dựa trên mô hình Deep Learning',
      titleEn: 'IoT Zero-day Intrusion Detection using Deep Residual Networks',
      field: 'An toàn thông tin & An ninh mạng',
      status: 'COMPLETED',
      leadStudent: 'B23DCAT012',
      advisor: 'GV004', // TS. Nguyễn Văn Tuấn
    },
    {
      id: 'SV-2026-CNTT1-006',
      dept: 'CNTT1',
      titleVi: 'Xây dựng trợ lý ảo hỗ trợ học tập dựa trên mô hình ngôn ngữ lớn (LLM) và kỹ thuật RAG cho sinh viên PTIT',
      titleEn: 'Retrieval-Augmented Generation for Academic Advising in Vietnamese Higher Education',
      field: 'Công nghệ thông tin & Trí tuệ nhân tạo',
      status: 'ONGOING',
      leadStudent: 'B23DCCN001',
      advisor: 'GV001', // TS. Ngô Quốc Dũng
    },
    {
      id: 'SV-2026-CNTT1-007',
      dept: 'QTKD1',
      titleVi: 'Tối ưu hóa chuỗi cung ứng nông sản thông minh ứng dụng công nghệ Blockchain và Hợp đồng thông minh',
      titleEn: 'Smart Contracts for Agritech Supply Chain Traceability in Vietnam',
      field: 'Thương mại điện tử & Chuỗi cung ứng',
      status: 'SUBMITTED',
      leadStudent: 'B23DCQT009',
      advisor: 'GV003', // TS. Đinh Quang Huy
    },
    {
      id: 'SV-2026-CNTT1-008',
      dept: 'DTVT1',
      titleVi: 'Thiết kế ăng-ten mảng Microstrip đa băng tần băng thông siêu rộng cho trạm gốc 5G/6G Massive MIMO',
      titleEn: 'Multi-band Ultra-wideband Microstrip Antenna Array for 5G/6G Massive MIMO',
      field: 'Kỹ thuật Điện tử Viễn thông',
      status: 'PROPOSED',
      leadStudent: 'B23DCCN088',
      advisor: 'GV005', // PGS.TS. Hoàng Minh
    },
    {
      id: 'SV-2026-CNTT1-009',
      dept: 'ATTT',
      titleVi: 'Hệ thống phân tích cảm xúc và phát hiện tin giả trên mạng xã hội bằng kỹ thuật NLP tiếng Việt',
      titleEn: 'Vietnamese Fake News Detection via Deep Contextual Sentiment Analysis',
      field: 'An toàn thông tin & Xử lý ngôn ngữ tự nhiên',
      status: 'FACULTY_APPROVED',
      leadStudent: 'B23DCAT012',
      advisor: 'GV004', // TS. Nguyễn Văn Tuấn
    },
    {
      id: 'SV-2026-CNTT1-010',
      dept: 'QTKD1',
      titleVi: 'Đánh giá tác động của thương mại điện tử qua video ngắn (TikTok Shop) đến hành vi mua bốc đồng của Gen Z',
      titleEn: 'Impact of Short-Form Video E-Commerce on Impulse Buying among Gen Z',
      field: 'Marketing số & Thương mại điện tử',
      status: 'REJECTED',
      leadStudent: 'B23DCQT009',
      advisor: 'GV003', // TS. Đinh Quang Huy
    },
  ];

  for (const ap of additionalProjects) {
    await prisma.project.upsert({
      where: { projectId: ap.id },
      update: {},
      create: {
        projectId: ap.id,
        periodId: period.periodId,
        deptId: getDeptId(ap.dept),
        titleVi: ap.titleVi,
        titleEn: ap.titleEn,
        researchField: ap.field,
        objectives: `Nghiên cứu và hoàn thiện đề tài ${ap.titleVi} theo QĐ 521/QĐ-HV.`,
        content: 'Khảo sát, thiết kế và thực nghiệm giải pháp chuyên sâu.',
        methodology: 'Nghiên cứu định lượng kết hợp triển khai thực nghiệm.',
        expectedResult: '01 Ứng dụng/Mô hình, 01 báo cáo thuyết minh, 01 bài báo khoa học.',
        status: ap.status,
        registeredAt: new Date('2026-09-10'),
        members: {
          create: [
            {
              studentId: ap.leadStudent,
              memberRole: 'LEAD',
              contributionPct: 60,
              assignedTask: 'Chủ nhiệm đề tài, điều phối và triển khai nội dung nghiên cứu',
              confirmStatus: 'ACCEPTED',
            },
          ],
        },
        advisors: {
          create: {
            lecturerId: ap.advisor,
            assignedBy: 'STUDENT',
            status: 'ACTIVE',
            assignedAt: new Date('2026-09-10'),
          },
        },
        budget: {
          create: {
            requestedAmount: 5000000,
            facultyProposed: 5000000,
            approvedAmount: ap.status === 'REJECTED' ? 0 : 5000000,
            status: ap.status === 'REJECTED' ? 'REJECTED' : 'APPROVED',
          },
        },
      },
    });
  }

  // 12. THÔNG BÁO & NHẮC VIỆC (NOTIFICATIONS - KHO D9 & DFD 8.0)
  const notifUsers = await prisma.user.findMany();
  const getUserIdByUsername = (uname: string) => notifUsers.find((u) => u.ssoUsername === uname)?.userId;

  const sampleNotifs = [
    {
      username: 'sv001', // Nguyễn Văn An
      title: 'Nhắc hạn chót nộp Thuyết minh Đề cương chi tiết (Mẫu 2)',
      content: 'Thời hạn cuối cùng nộp Đề cương chi tiết (12 mục) trên Cổng SRMS là 23:59 ngày 14/11/2026. Đề nghị Chủ nhiệm đề tài SV-2026-CNTT1-001 kiểm tra và nộp đúng hạn.',
      channel: 'WEB',
      deliveryStatus: 'SENT',
      isConfirmed: false,
    },
    {
      username: 'sv001',
      title: 'Giấy mời tham dự Sinh hoạt Khoa học Cấp Khoa CNTT1 (Mẫu 3.5)',
      content: 'Khoa CNTT 1 phát hành Giấy mời số 128/GM-CNTT1 phiên báo cáo tiến độ đợt 1 vào 08:30 ngày 20/12/2026 tại Phòng Hội thảo A2. Vui lòng xác nhận RSVP.',
      channel: 'WEB',
      deliveryStatus: 'SENT',
      isConfirmed: false,
    },
    {
      username: 'gv001', // TS. Ngô Quốc Dũng
      title: 'Yêu cầu thẩm định & phê duyệt Đề cương chi tiết (Mẫu 2)',
      content: 'Sinh viên Nguyễn Văn An (SV-2026-CNTT1-001) đã gửi bản thuyết minh đề cương 12 mục. Kính mời Thầy/Cô vào thẩm định và cho ý kiến chuyên môn.',
      channel: 'WEB',
      deliveryStatus: 'SENT',
      isConfirmed: false,
    },
    {
      username: 'lead001', // PGS.TS. Trần Đình Quế
      title: 'Duyệt danh mục đề xuất đề tài NCKH cấp Khoa (Mẫu 1)',
      content: 'Thư ký Khoa CNTT1 đã tổng hợp 12 đề tài đủ điều kiện sơ tuyển. Kính trình Trưởng Khoa ký số phê duyệt Hồ sơ Mẫu 1 gửi P.QLKHCN.',
      channel: 'WEB',
      deliveryStatus: 'SENT',
      isConfirmed: false,
    },
    {
      username: 'ctsv001', // ThS. Bùi Văn Toàn
      title: 'Tiếp nhận Danh sách Đề tài nghiệm thu Xuất sắc & Tốt để xét ĐRL',
      content: 'P.QLKHCN đã chuyển biên bản nghiệm thu Mẫu 4.2 của 15 đề tài NCKH sinh viên đủ điều kiện cộng Điểm rèn luyện theo Điều 14 QĐ 521.',
      channel: 'WEB',
      deliveryStatus: 'SENT',
      isConfirmed: false,
    },
    {
      username: 'tckt001', // CN. Lê Thị Mai
      title: 'Hồ sơ đề nghị tạm ứng kinh phí NCKH Sinh viên đợt 1',
      content: 'Đã nhận 08 hồ sơ đề cương (Mẫu 2) kèm dự toán kinh phí 5.000.000 đ/đề tài đã được Lãnh đạo Khoa và P.QLKHCN phê duyệt.',
      channel: 'WEB',
      deliveryStatus: 'SENT',
      isConfirmed: false,
    },
    {
      username: 'qlkh001', // ThS. Phạm Văn Hùng
      title: 'Tổng hợp Thuyết minh đề cương chi tiết (Mẫu 2) toàn Học viện',
      content: 'Tỷ lệ nộp đề cương đạt 92% (46/50 đề tài). Cần đôn đốc các nhóm còn lại trước giờ khóa cổng 23:59 ngày 14/11/2026.',
      channel: 'WEB',
      deliveryStatus: 'SENT',
      isConfirmed: false,
    },
  ];

  for (const n of sampleNotifs) {
    const uid = getUserIdByUsername(n.username);
    if (uid) {
      await prisma.notification.create({
        data: {
          userId: uid,
          title: n.title,
          content: n.content,
          channel: n.channel,
          deliveryStatus: n.deliveryStatus,
          isConfirmed: n.isConfirmed,
          urgent: false,
          type: 'system',
        },
      });
    }
  }

  // 13. LỊCH HOẠT ĐỘNG & SỰ KIỆN NCKH (SCHEDULE EVENTS - KHO D8 & DFD 8.0)
  const sampleEvents = [
    {
      title: 'Hạn chót Nộp Thuyết minh Đề cương chi tiết (Mẫu 2)',
      eventType: 'Mốc hạn NCKH',
      startDate: '2026-11-14',
      startTime: '23:59',
      endDate: '2026-11-14',
      endTime: '23:59',
      location: 'Cổng thông tin SRMS PTIT (Trực tuyến)',
      regulatoryBasis: 'Khoản 2 Điều 6 QĐ 521/QĐ-HV',
      participants: 'Chủ nhiệm đề tài, Giảng viên hướng dẫn, Ban Chủ nhiệm Khoa',
      projectId: 'SV-2026-CNTT1-001',
      note: 'Hệ thống tự động khóa cổng nộp hồ sơ vào đúng 23:59 ngày 14/11/2026.',
      dayIndex: 5,
      startHour: 23,
      durationHours: 1,
      targetRoles: JSON.stringify(['ALL']),
      scopeLevel: 'Toàn Học viện',
      broadcastBy: 'Phòng Quản lý Khoa học Công nghệ',
    },
    {
      title: 'Hội thảo Khoa học cấp Khoa CNTT1 - Báo cáo tiến độ đợt 1 (Mẫu 3.5)',
      eventType: 'Sinh hoạt KH',
      startDate: '2026-12-20',
      startTime: '08:30',
      endDate: '2026-12-20',
      endTime: '11:30',
      location: 'Phòng Hội thảo Tầng 2 - Nhà A2, Học viện PTIT',
      regulatoryBasis: 'Điều 9 QĐ 521/QĐ-HV',
      participants: 'Lãnh đạo Khoa, Hội đồng chuyên môn, GVHD, Nhóm sinh viên',
      projectId: 'SV-2026-CNTT1-001',
      note: 'Bắt buộc tối thiểu 01 buổi sinh hoạt khoa học lấy ý kiến đánh giá sản phẩm trung gian theo Biên bản Mẫu 3.5.',
      dayIndex: 0,
      startHour: 8,
      durationHours: 3,
      targetRoles: JSON.stringify(['STUDENT', 'LECTURER', 'FACULTY_LEADER', 'FACULTY_SECRETARY']),
      scopeLevel: 'Khoa Công nghệ thông tin 1',
      broadcastBy: 'Ban Chủ nhiệm Khoa CNTT 1',
    },
    {
      title: 'Phiên họp Hội đồng Nghiệm thu & Chấm điểm Đề tài SV-2026-CNTT1-001 (Mẫu 4.1 & 4.2)',
      eventType: 'Hội đồng thẩm định',
      startDate: '2027-04-28',
      startTime: '08:30',
      endDate: '2027-04-28',
      endTime: '11:00',
      location: 'Hội trường Tầng 1 - Nhà A2, Học viện PTIT',
      regulatoryBasis: 'Điều 10 QĐ 521/QĐ-HV',
      participants: 'Hội đồng 05 thành viên (PGS.TS. Hoàng Minh chủ tịch), Nhóm nghiên cứu',
      projectId: 'SV-2026-CNTT1-001',
      note: 'Chấm điểm 7 tiêu chí theo Phiếu Mẫu 4.1 và lập Biên bản Hội đồng Mẫu 4.2, áp dụng thuật toán loại trừ điểm lệch > 15đ.',
      dayIndex: 2,
      startHour: 8,
      durationHours: 3,
      targetRoles: JSON.stringify(['STUDENT', 'LECTURER', 'QLKHCN', 'BOARD']),
      scopeLevel: 'Khoa Công nghệ thông tin 1',
      broadcastBy: 'Phòng Quản lý Khoa học Công nghệ',
    },
    {
      title: 'Đối soát Điểm rèn luyện & Trao giải thưởng NCKH Sinh viên (Mẫu 4.4)',
      eventType: 'Tác nghiệp CTSV',
      startDate: '2027-05-10',
      startTime: '14:00',
      endDate: '2027-05-10',
      endTime: '16:30',
      location: 'Văn phòng Phòng CT&CTSV - Nhà A1',
      regulatoryBasis: 'Điều 14 QĐ 521/QĐ-HV',
      participants: 'Phòng CT&CTSV, P.QLKHCN, Sinh viên đạt giải',
      projectId: 'SV-2026-CNTT1-001',
      note: 'Cộng ĐRL tự động: Xuất sắc (+10đ), Tốt (+8đ), Khá (+6đ) và cấp Giấy chứng nhận có chữ ký số xác thực.',
      dayIndex: 1,
      startHour: 14,
      durationHours: 2,
      targetRoles: JSON.stringify(['STUDENT_AFFAIRS', 'STUDENT', 'ADMIN']),
      scopeLevel: 'Phòng CT&CTSV',
      broadcastBy: 'Phòng Công tác Chính trị & CTSV',
    },
  ];

  for (const ev of sampleEvents) {
    await prisma.scheduleEvent.create({
      data: ev,
    });
  }

  console.log('--- KHỞI TẠO DỮ LIỆU SEED HOÀN TẤT THÀNH CÔNG! ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
