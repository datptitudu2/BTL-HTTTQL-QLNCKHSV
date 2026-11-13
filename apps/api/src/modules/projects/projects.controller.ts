import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('2. Phân hệ Đăng ký đề tài & Quản lý nhóm (DFD 2.0 & D3)')
@Controller('api/projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: '2.4.1 Lấy danh sách đề tài NCKH (hỗ trợ lọc đa điều kiện)' })
  async findAll(
    @Query('periodId') periodId?: number,
    @Query('deptId') deptId?: number,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('studentId') studentId?: string,
    @Query('lecturerId') lecturerId?: string,
  ) {
    return this.projectsService.findAll({
      periodId,
      deptId,
      status,
      keyword,
      studentId,
      lecturerId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết đầy đủ của đề tài NCKH' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '2.1.1 Đăng ký đề tài & khởi tạo hồ sơ trực tuyến' })
  async create(@CurrentUser() user: any, @Body() body: any) {
    return this.projectsService.create(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/members')
  @ApiOperation({ summary: '2.2.1 Mời thành viên sinh viên vào nhóm nghiên cứu' })
  async inviteMember(
    @Param('id') projectId: string,
    @Body() body: { studentId: string; role?: string; pct?: number },
  ) {
    return this.projectsService.inviteMember(
      projectId,
      body.studentId,
      body.role,
      body.pct,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/advisors')
  @ApiOperation({ summary: '2.3.1 Mời hoặc phân công giảng viên hướng dẫn' })
  async assignAdvisor(
    @Param('id') projectId: string,
    @Body() body: { lecturerId: string; assignType?: string },
  ) {
    return this.projectsService.assignAdvisor(
      projectId,
      body.lecturerId,
      body.assignType,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({ summary: '3.5 & 4.7 Chuyển trạng thái vòng đời đề tài' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') projectId: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.projectsService.updateStatus(projectId, body.status, body.reason, user);
  }
}

