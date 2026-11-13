import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProgressService } from './progress.service';

@ApiTags('4.2 - 4.7 Phân hệ Tiến độ, Sinh hoạt khoa học (Mẫu 3.5) & Điều chỉnh')
@Controller('api/progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Tổng hợp Mốc kiểm soát, Báo cáo tiến độ, Hội thảo Mẫu 3.5 & Đơn điều chỉnh' })
  async getOverview() {
    return this.progressService.getOverview();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('reports')
  @ApiOperation({ summary: '4.2 Sinh viên nộp báo cáo tiến độ định kỳ' })
  async submitReport(
    @CurrentUser() user: any,
    @Body() body: { projectId: string; pmId: number; reportContent: string; productUrl?: string },
  ) {
    return this.progressService.submitReport(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('reports/:id/review')
  @ApiOperation({ summary: '4.3 GVHD nhận xét & đánh giá tiến độ thực hiện' })
  async reviewReport(
    @Param('id', ParseIntPipe) reportId: number,
    @CurrentUser() user: any,
    @Body() body: { assessment: 'PASS' | 'WARNING_DELAY'; advisorComment: string },
  ) {
    return this.progressService.reviewReport(reportId, user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('seminars')
  @ApiOperation({ summary: '4.4 Khoa / QLKHCN lập lịch Sinh hoạt khoa học cấp Khoa' })
  async createSeminar(@CurrentUser() user: any, @Body() body: any) {
    return this.progressService.createSeminar(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('seminars/:id/invite')
  @ApiOperation({ summary: '4.4 Khoa phát hành Thư mời tham dự & Thông báo real-time' })
  async sendInvitations(
    @Param('id', ParseIntPipe) seminarId: number,
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.progressService.sendInvitations(seminarId, user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('seminars/:id/rsvp')
  @ApiOperation({ summary: '4.4 Đại biểu / Sinh viên / GVHD xác nhận tham dự (Trực tiếp / Online / Báo vắng)' })
  async respondRsvp(
    @Param('id', ParseIntPipe) seminarId: number,
    @CurrentUser() user: any,
    @Body() body: { rsvpStatus: 'ACCEPTED_ONSITE' | 'ACCEPTED_ONLINE' | 'DECLINED' },
  ) {
    return this.progressService.respondRsvp(seminarId, user, body.rsvpStatus);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('seminars/:id/minutes')
  @ApiOperation({ summary: '4.5 Lưu Biên bản Sinh hoạt khoa học Mẫu 3.5' })
  async saveMinutes(
    @Param('id', ParseIntPipe) seminarId: number,
    @CurrentUser() user: any,
    @Body() body: { feedback: string; minutesFileUrl?: string },
  ) {
    return this.progressService.saveMinutes(seminarId, user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-requests')
  @ApiOperation({ summary: '4.6 Sinh viên gửi đơn Điều chỉnh / Gia hạn / Thay đổi GVHD' })
  async createChangeRequest(
    @CurrentUser() user: any,
    @Body() body: { projectId: string; requestType: string; reason: string; newDueDate?: string },
  ) {
    return this.progressService.createChangeRequest(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('change-requests/:id/approve')
  @ApiOperation({ summary: '4.7 Phê duyệt 3 cấp Đơn điều chỉnh (GVHD -> Khoa -> QLKHCN)' })
  async approveChangeRequest(
    @Param('id', ParseIntPipe) requestId: number,
    @CurrentUser() user: any,
    @Body() body: { decision: 'APPROVED' | 'REJECTED'; comment?: string },
  ) {
    return this.progressService.approveChangeRequest(requestId, user, body);
  }
}
