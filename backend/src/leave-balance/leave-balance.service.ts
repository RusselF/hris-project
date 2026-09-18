import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaveBalanceService {
  constructor(private prisma: PrismaService) {}

  async initialize(employeeId: string, leaveTypeId: string, year: number) {
    const leaveType = await this.prisma.leaveType.findUniqueOrThrow({ where: { id: leaveTypeId } });

    const existing = await this.prisma.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year } },
    });
    if (existing) {
      throw new ConflictException('Balance untuk employee, leave type, dan tahun ini sudah ada');
    }

    return this.prisma.leaveBalance.create({
      data: { employeeId, leaveTypeId, year, balance: leaveType.defaultQty },
    });
  }

  findMyBalances(employeeId: string, year: number) {
    return this.prisma.leaveBalance.findMany({
      where: { employeeId, year },
      include: { leaveType: true },
    });
  }
}