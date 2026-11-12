import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('8. Phân hệ Thông báo & Nhắc việc (DFD 8.0 & D9)')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private notifService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '8.5.1 Lấy danh sách thông báo in-app theo userId hoặc roleCode' })
  async getNotifications(
    @Query('userId') userId?: string,
    @Query('role') role?: string,
  ) {
    const uid = userId ? parseInt(userId, 10) : undefined;
    return this.notifService.getUserNotifications(uid, role);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  async markRead(@Param('id') id: string) {
    const notifId = parseInt(id, 10);
    return this.notifService.markAsRead(notifId);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  async markAllRead(@Body('role') role?: string) {
    return this.notifService.markAllAsRead(role);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo thông báo nhắc việc mới' })
  async createNotification(
    @Body() dto: { userId: number; scheduleRef?: string; title: string; content: string; channel?: string },
  ) {
    return this.notifService.createNotification(dto);
  }
}
