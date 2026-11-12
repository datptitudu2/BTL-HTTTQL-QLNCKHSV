import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('1. Phân hệ Quản lý hồ sơ & Đơn vị (DFD 1.0 & D1)')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('students')
  @ApiOperation({ summary: '2.2.1 Tìm kiếm hồ sơ sinh viên để mời vào nhóm nghiên cứu' })
  async findStudents(
    @Query('keyword') keyword?: string,
    @Query('deptId') deptId?: number,
  ) {
    return this.usersService.findStudents({ keyword, deptId });
  }

  @Get('lecturers')
  @ApiOperation({ summary: '2.3 & 5.2 Danh sách giảng viên hướng dẫn & tham gia hội đồng' })
  async findLecturers(
    @Query('keyword') keyword?: string,
    @Query('deptId') deptId?: number,
  ) {
    return this.usersService.findLecturers({ keyword, deptId });
  }

  @Get('departments')
  @ApiOperation({ summary: 'Danh mục các Khoa/Viện đào tạo trong Học viện' })
  async getDepartments() {
    return this.usersService.getDepartments();
  }
}

