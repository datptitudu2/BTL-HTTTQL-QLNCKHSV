import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('8. Phân hệ Thông báo & Nhắc việc (DFD 8.0 & D9)')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private notifService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: '8.5.1 Lấy danh sách thông báo in-app theo đúng tài khoản đang đăng nhập' })
  async getNotifications(@CurrentUser() user: any) {
    return this.notifService.getUserNotifications(user?.userId, user?.roleCode);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  async markRead(@Param('id') id: string, @CurrentUser() user: any) {
    const notifId = parseInt(id, 10);
    return this.notifService.markAsRead(notifId, user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  async markAllRead(@CurrentUser() user: any, @Body('role') role?: string) {
    return this.notifService.markAllAsRead(role || user?.roleCode, user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Tạo thông báo nhắc việc mới (mặc định gửi cho tài khoản hiện tại nếu không truyền userId)' })
  async createNotification(
    @CurrentUser() user: any,
    @Body()
    dto: {
      userId?: number;
      scheduleRef?: string;
      title: string;
      content: string;
      channel?: string;
      urgent?: boolean;
      type?: string;
      targetUrl?: string;
    },
  ) {
    return this.notifService.createNotification({
      ...dto,
      userId: dto.userId || user?.userId,
    });
  }
}
