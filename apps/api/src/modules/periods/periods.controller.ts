import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PeriodsService } from './periods.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('1.3 & 8.1 Cấu hình Đợt NCKH, Mốc kế hoạch & Tiêu chí')
@Controller('api/periods')
export class PeriodsController {
  constructor(private periodsService: PeriodsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các đợt NCKH (Công khai cho mọi vai trò xem)' })
  async findAll() {
    return this.periodsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy thông tin đợt NCKH đang kích hoạt' })
  async getActive() {
    return this.periodsService.getActivePeriod();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đợt NCKH cùng các mốc kế hoạch và tiêu chí chấm' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.periodsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('QLKHCN', 'ADMIN')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Khởi tạo đợt NCKH mới (Chỉ Phòng QLKH&CN hoặc Quản trị viên)' })
  async create(@Body() body: any) {
    return this.periodsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('QLKHCN', 'ADMIN')
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật cấu hình đợt NCKH (Chỉ Phòng QLKH&CN hoặc Quản trị viên)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.periodsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('QLKHCN', 'ADMIN')
  @ApiBearerAuth()
  @Put(':id/milestones/:pmId')
  @ApiOperation({ summary: 'Cập nhật mốc kế hoạch tiến độ của đợt' })
  async updateMilestone(
    @Param('pmId', ParseIntPipe) pmId: number,
    @Body() body: any,
  ) {
    return this.periodsService.updateMilestone(pmId, body);
  }
}
