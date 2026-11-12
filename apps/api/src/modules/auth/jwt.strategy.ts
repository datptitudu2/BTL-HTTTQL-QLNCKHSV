import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  username: string;
  roleCode: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
      ? (() => { throw new Error('FATAL SECURITY ERROR: JWT_SECRET must be configured in production!'); })() 
      : 'super-secret-srms-jwt-key-ptit-2026-very-secure');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { userId: payload.sub },
      include: {
        role: true,
        student: true,
        lecturer: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
    }

    return {
      userId: user.userId,
      username: user.ssoUsername,
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      roleCode: user.role.roleCode,
      studentId: user.student?.studentId,
      lecturerId: user.lecturer?.lecturerId,
      deptId: user.student?.deptId || user.lecturer?.deptId,
    };
  }
}
