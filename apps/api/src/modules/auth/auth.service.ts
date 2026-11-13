import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  public async hashPassword(pass: string): Promise<string> {
    return argon2.hash(pass, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  private legacyHash(pass: string): string {
    return crypto.createHash('sha256').update(pass + 'srms_salt_2026').digest('hex');
  }

  async validateUser(username: string, pass: string) {
    const usernameAliases: Record<string, string> = {
      'an.nv': 'sv001',
      'sv.moi': 'sv015',
      'dungnq': 'gv001',
      'tritd': 'gv002',
      'huydq': 'gv003',
      'tuannv': 'gv004',
      'minhh': 'gv005',
      'hungvt': 'gv006',
      'thukycntt1': 'tk001',
      'khoacntt1': 'lead001',
      'qlkhcn': 'qlkh001',
      'bgiangdoc': 'bgd001',
      'tckt': 'tckt001',
      'ctsv': 'ctsv001',
    };
    const targetUsername = usernameAliases[username] || username;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { ssoUsername: username },
          { ssoUsername: targetUsername },
          { email: username },
        ],
      },
      include: {
        role: true,
        credentials: true,
        student: true,
        lecturer: true,
      },
    });

    if (!user) return null;

    if (user.credentials) {
      let isMatch = false;
      const storedHash = user.credentials.passwordHash;

      // 1. Kiểm tra với Argon2id nếu mật khẩu lưu trữ đã chuẩn hóa
      if (storedHash.startsWith('$argon2')) {
        try {
          isMatch = await argon2.verify(storedHash, pass);
        } catch (e) {
          isMatch = false;
        }
      } else {
        // 2. Kiểm tra mật khẩu legacy với constant-time comparison chống Timing Attack
        const computedLegacy = this.legacyHash(pass);
        const bufA = Buffer.from(storedHash, 'utf-8');
        const bufB = Buffer.from(computedLegacy, 'utf-8');
        if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
          isMatch = true;
          // Tự động nâng cấp hash mật khẩu lên Argon2id
          const newArgonHash = await this.hashPassword(pass);
          await this.prisma.userCredential.update({
            where: { credentialId: user.credentials.credentialId },
            data: { passwordHash: newArgonHash },
          }).catch(() => {});
        }
      }

      // 3. Fallback mật khẩu kiểm thử: Chỉ được phép ở môi trường Development
      if (!isMatch && process.env.NODE_ENV !== 'production' && pass === 'ptit@123') {
        this.logger.warn(`[DEV AUTH] Cho phép đăng nhập mật khẩu test cho tài khoản: ${username}`);
        isMatch = true;
      }

      if (!isMatch) return null;
    }

    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.userId,
      username: user.ssoUsername,
      roleCode: user.role?.roleCode,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 86400,
      user: {
        userId: user.userId,
        username: user.ssoUsername,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        roleCode: user.role?.roleCode,
        roleName: user.role?.roleName,
        studentId: user.student?.studentId,
        lecturerId: user.lecturer?.lecturerId,
        deptId: user.student?.deptId || user.lecturer?.deptId,
      },
    };
  }

  async loginByRole(roleCode: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        role: { roleCode: roleCode },
        status: 'ACTIVE',
      },
      include: {
        role: true,
        student: true,
        lecturer: true,
      },
    });

    if (!user) {
      throw new BadRequestException(`Không tìm thấy người dùng mẫu cho vai trò ${roleCode}`);
    }

    return this.login(user);
  }

  async ssoLogin(provider: string, email?: string) {
    const defaultUsername = provider === 'outlook' ? 'gv001' : 'sv001';
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ ssoUsername: defaultUsername }, { email: email || 'b23dccn001@stu.ptit.edu.vn' }],
      },
      include: {
        role: true,
        student: true,
        lecturer: true,
      },
    });

    if (!user) {
      const fallback = await this.prisma.user.findFirst({
        where: { status: 'ACTIVE' },
        include: { role: true, student: true, lecturer: true },
      });
      if (!fallback) throw new UnauthorizedException('Không có tài khoản người dùng trong hệ thống');
      return this.login(fallback);
    }

    return this.login(user);
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId: userId },
      include: {
        role: true,
        student: {
          include: { department: true },
        },
        lecturer: {
          include: { department: true },
        },
        positions: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return user;
  }
}
