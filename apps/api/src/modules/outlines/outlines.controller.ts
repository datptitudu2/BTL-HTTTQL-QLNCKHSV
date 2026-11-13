import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OutlinesService } from './outlines.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('4.1 Phân hệ Đề cương nghiên cứu chi tiết (Mẫu 2 & D4)')
@Controller('api/outlines')
export class OutlinesController {
  constructor(private outlinesService: OutlinesService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đề cương phân quyền theo vai trò & ERD' })
  async findAll(@CurrentUser() user: any) {
    return this.outlinesService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('project/:projectId')
  @ApiOperation({ summary: 'Lấy danh sách các phiên bản đề cương của đề tài' })
  async findByProject(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.outlinesService.findByProject(projectId, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('project/:projectId')
  @ApiOperation({ summary: '4.1.1 Soạn và nộp đề cương nghiên cứu theo Mẫu 2' })
  async submit(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.outlinesService.submitOutline(projectId, body, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/approve')
  @ApiOperation({ summary: '4.1.2 & 4.1.3 Phê duyệt đề cương (GVHD & Lãnh đạo Khoa, hỗ trợ Ký trực tiếp / Ký thay)' })
  async approve(
    @Param('id', ParseIntPipe) outlineId: number,
    @CurrentUser() user: any,
    @Body() body: { decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED'; comment?: string; mode?: 'DIRECT' | 'PROXY' },
  ) {
    return this.outlinesService.approveOutline(outlineId, user, body.decision, body.comment, body.mode);
  }
}

