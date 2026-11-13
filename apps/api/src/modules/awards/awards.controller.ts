import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AwardsService } from './awards.service';

@ApiTags('6.2 - 6.5 Phân hệ Khen thưởng (Mẫu 5), Chứng nhận số, ĐRL & Giờ chuẩn')
@Controller('api/awards')
export class AwardsController {
  constructor(private awardsService: AwardsService) {}

  @Get()
  @ApiOperation({ summary: 'Tổng hợp Giải thưởng Mẫu 5, Giấy chứng nhận số, Giờ chuẩn GV & ĐRL SV' })
  async getAll() {
    return this.awardsService.getAll();
  }

  @Get('certificates/verify/:code')
  @ApiOperation({ summary: 'Tra cứu và xác thực Giấy chứng nhận điện tử qua mã QR/CertCode' })
  async verifyCertificate(@Param('code') code: string) {
    return this.awardsService.verifyCertificate(code);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('nominations')
  @ApiOperation({ summary: '6.2 Lập hồ sơ đề cử Khen thưởng Mẫu 5' })
  async createNomination(@CurrentUser() user: any, @Body() body: any) {
    return this.awardsService.createNomination(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('nominations/:id/approve')
  @ApiOperation({ summary: '6.2 P.QLKHCN / BGĐ phê duyệt Giải thưởng & cập nhật điểm cộng học bổng' })
  async approveNomination(
    @Param('id', ParseIntPipe) nominationId: number,
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.awardsService.approveNomination(nominationId, user, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('certificates/issue')
  @ApiOperation({ summary: '6.3 P.QLKHCN cấp Giấy chứng nhận số (yêu cầu đạt Khá trở lên)' })
  async issueCertificates(
    @CurrentUser() user: any,
    @Body() body: { projectId: string },
  ) {
    return this.awardsService.issueCertificates(user, body.projectId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('bonuses/:id/approve')
  @ApiOperation({ summary: '6.4 Phòng CT&CTSV duyệt cộng Điểm rèn luyện & Học bổng' })
  async approveStudentBonus(
    @Param('id', ParseIntPipe) bonusId: number,
    @CurrentUser() user: any,
    @Body() body: { decisionNotice?: string },
  ) {
    return this.awardsService.approveStudentBonus(bonusId, user, body?.decisionNotice);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('lecturer-hours/:id/confirm')
  @ApiOperation({ summary: '6.5 P.QLKHCN xác nhận Giờ chuẩn NCKH Giảng viên' })
  async confirmLecturerHour(
    @Param('id', ParseIntPipe) hourId: number,
    @CurrentUser() user: any,
  ) {
    return this.awardsService.confirmLecturerHour(hourId, user);
  }
}
