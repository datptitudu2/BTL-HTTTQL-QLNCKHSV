import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('6. Phân hệ Kinh phí & Quyết toán (DFD 6.0 & D7)')
@Controller('api/budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách toàn bộ dự toán và chứng từ quyết toán các đề tài' })
  async findAll() {
    return this.budgetsService.findAll();
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Lấy thông tin dự toán và lịch sử quyết toán của đề tài' })
  async getByProject(@Param('projectId') projectId: string) {
    return this.budgetsService.getBudgetByProject(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/settlements')
  @ApiOperation({ summary: '6.6 Sinh viên kê khai hồ sơ & chứng từ thanh quyết toán chi tiêu' })
  async addSettlement(
    @Param('id', ParseIntPipe) budgetId: number,
    @Body() body: any,
  ) {
    return this.budgetsService.addSettlement(budgetId, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('settlements/:id/confirm-faculty')
  @ApiOperation({ summary: '6.6 Khoa / Thư ký Khoa xác nhận hoàn thành sản phẩm trước quyết toán' })
  async confirmFaculty(
    @Param('id', ParseIntPipe) settlementId: number,
    @CurrentUser() user: any,
  ) {
    return this.budgetsService.confirmByFaculty(settlementId, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('settlements/:id/settle')
  @ApiOperation({ summary: '6.6 Phòng Tài chính - Kế toán phê duyệt giải ngân chứng từ' })
  async settle(
    @Param('id', ParseIntPipe) settlementId: number,
    @CurrentUser() user: any,
  ) {
    return this.budgetsService.settleByFinance(settlementId, user);
  }
}

