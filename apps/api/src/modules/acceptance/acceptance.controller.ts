import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AcceptanceService } from './acceptance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('5. Phân hệ Nghiệm thu & Chấm điểm (DFD 5.0 & D6)')
@Controller('api/acceptance')
export class AcceptanceController {
  constructor(private acceptanceService: AcceptanceService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Lấy thông tin hội đồng và kết quả nghiệm thu của đề tài' })
  async getByProject(@Param('projectId') projectId: string) {
    return this.acceptanceService.getCouncilByProject(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('project/:projectId/council')
  @ApiOperation({ summary: '5.2 Thành lập Hội đồng nghiệm thu & lập lịch bảo vệ' })
  async createCouncil(
    @Param('projectId') projectId: string,
    @Body() body: any,
  ) {
    return this.acceptanceService.createCouncil(projectId, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('score')
  @ApiOperation({ summary: '5.3 Chấm điểm & nhận xét bảo vệ (Phiếu chấm Mẫu 4.1)' })
  async submitScore(
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.acceptanceService.submitScoreSheet(user, body);
  }
}

