import { Controller, Post, Get, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { LeaveBalanceService } from './leave-balance.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('leave-balances')
@UseGuards(RolesGuard)
export class LeaveBalanceController {
  constructor(private leaveBalanceService: LeaveBalanceService) {}

  @Roles('HR')
  @Post('initialize')
  initialize(@Body() dto: { employeeId: string; leaveTypeId: string; year: number }) {
    return this.leaveBalanceService.initialize(dto.employeeId, dto.leaveTypeId, dto.year);
  }

  @Get('my-balance')
  myBalance(@Request() req: ExpressRequest) {
    const employeeId = (req.user as any)?.employeeId;
    if (!employeeId) {
      throw new ForbiddenException('Akun kamu belum terhubung ke data employee');
    }
    const year = new Date().getFullYear();
    return this.leaveBalanceService.findMyBalances(employeeId, year);
  }
}