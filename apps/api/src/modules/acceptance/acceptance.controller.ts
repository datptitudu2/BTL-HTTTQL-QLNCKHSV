import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AcceptanceService } from './acceptance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('5. Phân hệ Nghiệm thu & Chấm điểm (DFD 5.0 & D6)')
@Controller('api/acceptance')
export class AcceptanceController {
  constructor(private acceptanceService: AcceptanceService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Danh sách Hội đồng & Hồ sơ Nghiệm thu phân quyền theo vai trò & ERD' })
  async findAll(@CurrentUser() user: any) {
    return this.acceptanceService.getAllAcceptances(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('project/:projectId')
  @ApiOperation({ summary: 'Lấy thông tin hội đồng và kết quả nghiệm thu của đề tài' })
  async getByProject(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.acceptanceService.getCouncilByProject(projectId, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('project/:projectId/council')
  @ApiOperation({ summary: '5.2 Thành lập Hội đồng nghiệm thu & lập lịch bảo vệ' })
  async createCouncil(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.acceptanceService.createCouncil(projectId, user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('score')
  @ApiOperation({ summary: '5.3 Chấm điểm & nhận xét bảo vệ (Phiếu chấm Mẫu 4.1, kiểm tra điểm lệch >15đ)' })
  async submitScore(
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.acceptanceService.submitScoreSheet(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/approve')
  @ApiOperation({ summary: '5.5 P.QLKHCN Phê duyệt kết quả nghiệm thu & Quy đổi giờ chuẩn / ĐRL' })
  async approveAcceptance(
    @Param('id', ParseIntPipe) acceptanceId: number,
    @CurrentUser() user: any,
    @Body() body: { approvalDocNo?: string },
  ) {
    return this.acceptanceService.approveAcceptance(acceptanceId, user, body?.approvalDocNo);
  }
}

