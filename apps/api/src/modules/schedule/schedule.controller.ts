import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ScheduleService, CalendarEventDto } from './schedule.service';

@ApiTags('8. Phân hệ Lịch biểu & Sự kiện NCKH (DFD 8.0 & ERD)')
@Controller('api/schedule')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sự kiện lịch NCKH theo phân quyền vai trò' })
  async getEvents(
    @Query('role') role?: string,
    @Query('scope') scope?: string,
  ) {
    return this.scheduleService.getEvents(role, scope);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm mới sự kiện lịch làm việc NCKH' })
  async createEvent(@Body() dto: CalendarEventDto) {
    return this.scheduleService.createEvent(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sự kiện lịch' })
  async deleteEvent(@Param('id') id: string) {
    return this.scheduleService.deleteEvent(id);
  }
}

