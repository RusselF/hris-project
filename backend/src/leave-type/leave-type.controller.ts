import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { LeaveTypeService } from './leave-type.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('leave-types')
@UseGuards(RolesGuard)
export class LeaveTypeController {
  constructor(private leaveTypeService: LeaveTypeService) {}

  @Get()
  findAll() {
    return this.leaveTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveTypeService.findOne(id);
  }

  @Roles('HR')
  @Post()
  create(@Body() dto: CreateLeaveTypeDto) {
    return this.leaveTypeService.create(dto);
  }
}