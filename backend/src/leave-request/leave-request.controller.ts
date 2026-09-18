import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('leave-requests')
@UseGuards(RolesGuard)
export class LeaveRequestController {
  constructor(private leaveRequestService: LeaveRequestService) {}

  private getEmployeeId(req: ExpressRequest): string {
    const employeeId = (req.user as any)?.employeeId;
    if (!employeeId) throw new ForbiddenException('Akun kamu belum terhubung ke data employee');
    return employeeId;
  }

  @Post()
  create(@Request() req: ExpressRequest, @Body() dto: CreateLeaveRequestDto) {
    return this.leaveRequestService.create(this.getEmployeeId(req), dto);
  }

  @Get('my-requests')
  myRequests(@Request() req: ExpressRequest) {
    return this.leaveRequestService.findMyRequests(this.getEmployeeId(req));
  }

  @Get('team-pending')
  teamPending(@Request() req: ExpressRequest) {
    return this.leaveRequestService.findPendingForTeam(this.getEmployeeId(req));
  }

  @Patch(':id/approve')
  approve(@Request() req: ExpressRequest, @Param('id') id: string) {
    return this.leaveRequestService.approve(id, this.getEmployeeId(req));
  }
    
  @Patch(':id/reject')
  reject(@Request() req: ExpressRequest, @Param('id') id: string) {
    return this.leaveRequestService.reject(id, this.getEmployeeId(req));
  }
}