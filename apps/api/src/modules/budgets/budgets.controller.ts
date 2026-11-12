import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('6. Phân hệ Kinh phí & Quyết toán (DFD 6.0 & D7)')
@Controller('api/budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Lấy thông tin dự toán và lịch sử quyết toán của đề tài' })
  async getByProject(@Param('projectId') projectId: string) {
    return this.budgetsService.getBudgetByProject(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/settlements')
  @ApiOperation({ summary: '6.6 Kê khai hồ sơ & chứng từ thanh quyết toán chi tiêu' })
  async addSettlement(
    @Param('id', ParseIntPipe) budgetId: number,
    @Body() body: any,
  ) {
    return this.budgetsService.addSettlement(budgetId, body);
  }
}

