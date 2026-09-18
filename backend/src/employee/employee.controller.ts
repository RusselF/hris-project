import { Controller, Get, Post, Body, Param, Put, Patch, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('employees')
@UseGuards(RolesGuard)
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Roles('HR')
  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @Get('my-team')
  findMyTeam(@Request() req: ExpressRequest) {
    const employeeId = (req.user as any)?.employeeId;
    if (!employeeId) {
      throw new ForbiddenException('Akun kamu belum terhubung ke data employee');
    }
    return this.employeeService.findMyTeam(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Roles('HR')
  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Roles('HR')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(id, dto);
  }

  @Roles('HR')
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.employeeService.deactivate(id);
  }
}