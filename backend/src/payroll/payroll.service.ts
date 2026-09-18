import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';

function getWorkingDaysInMonth(year: number, month: number): number {
  // Sederhana: hitung semua hari kecuali Sabtu-Minggu
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Minggu, 6 = Sabtu
    if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
  }
  return workingDays;
}

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async generate(dto: GeneratePayrollDto) {
    const period = `${dto.year}-${String(dto.month).padStart(2, '0')}`;

    const existing = await this.prisma.payroll.findFirst({
      where: { employeeId: dto.employeeId, period },
    });
    if (existing) {
      throw new ConflictException(`Payroll untuk periode ${period} sudah pernah di-generate`);
    }

    // Hitung jumlah hari ABSENT dalam periode ini
    const startOfMonth = new Date(dto.year, dto.month - 1, 1);
    const endOfMonth = new Date(dto.year, dto.month, 0);

    const absentCount = await this.prisma.attendance.count({
      where: {
        employeeId: dto.employeeId,
        date: { gte: startOfMonth, lte: endOfMonth },
        status: 'ABSENT',
      },
    });

    const workingDays = getWorkingDaysInMonth(dto.year, dto.month);
    const dailyRate = dto.baseSalary / workingDays;
    const deduction = Math.round(dailyRate * absentCount);
    const total = dto.baseSalary - deduction;

    return this.prisma.payroll.create({
      data: {
        employeeId: dto.employeeId,
        period,
        baseSalary: dto.baseSalary,
        deduction,
        total,
      },
    });
  }

  findMyPayrolls(employeeId: string) {
    return this.prisma.payroll.findMany({
      where: { employeeId },
      orderBy: { period: 'desc' },
    });
  }

  findAll() {
    return this.prisma.payroll.findMany({
      include: { employee: { select: { name: true } } },
      orderBy: { period: 'desc' },
    });
  }
}