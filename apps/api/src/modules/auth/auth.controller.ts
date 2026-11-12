import { Controller, Post, Body, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('1. Phân hệ Xác thực & Tài khoản')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '1.1 Đăng nhập trực tiếp bằng SSO username và mật khẩu' })
  async login(@Body() body: { username: string; password?: string }) {
    const user = await this.authService.validateUser(body.username, body.password || 'ptit@123');
    if (!user) {
      throw new UnauthorizedException('Thông tin tài khoản hoặc mật khẩu không chính xác');
    }
    return this.authService.login(user);
  }

  @Post('quick-role')
  @ApiOperation({ summary: 'Đăng nhập nhanh theo vai trò (Dành cho kiểm thử & đánh giá)' })
  async quickRole(@Body() body: { roleCode: string }) {
    return this.authService.loginByRole(body.roleCode);
  }

  @Post('sso')
  @ApiOperation({ summary: '1.1 Giả lập đăng nhập SSO PTIT S-Link (Microsoft Outlook hoặc Google Gmail)' })
  async ssoLogin(@Body() body: { provider: 'outlook' | 'gmail'; email?: string }) {
    return this.authService.ssoLogin(body.provider, body.email);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: '1.2 Lấy thông tin hồ sơ cá nhân hiện tại' })
  async getMe(@CurrentUser() currentUser: any) {
    return this.authService.getMe(currentUser.userId);
  }
}

