import { Controller, Post, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AttendanceService } from './attendance.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('attendance')
@UseGuards(RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  private getEmployeeId(req: ExpressRequest): string {
    const employeeId = (req.user as any)?.employeeId;
    if (!employeeId) {
      throw new ForbiddenException('Akun kamu belum terhubung ke data employee');
    }
    return employeeId;
  }

  @Post('clock-in')
  clockIn(@Request() req: ExpressRequest) {
    return this.attendanceService.clockIn(this.getEmployeeId(req));
  }

  @Post('clock-out')
  clockOut(@Request() req: ExpressRequest) {
    return this.attendanceService.clockOut(this.getEmployeeId(req));
  }

  @Get('my-history')
  myHistory(@Request() req: ExpressRequest) {
    return this.attendanceService.findMyHistory(this.getEmployeeId(req));
  }

  @Roles('HR', 'MANAGER')
  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }
}