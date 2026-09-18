import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { PayrollService } from './payroll.service';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payrolls')
@UseGuards(RolesGuard)
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Roles('HR')
  @Post('generate')
  generate(@Body() dto: GeneratePayrollDto) {
    return this.payrollService.generate(dto);
  }

  @Get('my-payrolls')
  myPayrolls(@Request() req: ExpressRequest) {
    const employeeId = (req.user as any)?.employeeId;
    return this.payrollService.findMyPayrolls(employeeId);
  }

  @Roles('HR')
  @Get()
  findAll() {
    return this.payrollService.findAll();
  }
}