import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const WORK_START_HOUR = 9; // jam 09:00, batas dianggap "Late"

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private getTodayDateOnly(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  async clockIn(employeeId: string) {
    const today = this.getTodayDateOnly();

    // Cek dulu di level aplikasi (biar error message-nya jelas),
    // tapi constraint @@unique di database tetap jadi pertahanan terakhir
    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (existing) {
      throw new ConflictException('Kamu sudah clock-in hari ini');
    }

    const now = new Date();
    const status = now.getHours() >= WORK_START_HOUR ? 'LATE' : 'ON_TIME';

    return this.prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        clockIn: now,
        status,
      },
    });
  }

  async clockOut(employeeId: string) {
    const today = this.getTodayDateOnly();

    const attendance = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (!attendance) {
      throw new BadRequestException('Kamu belum clock-in hari ini');
    }

    if (attendance.clockOut) {
      throw new ConflictException('Kamu sudah clock-out hari ini');
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: { clockOut: new Date() },
    });
  }

  findMyHistory(employeeId: string) {
    return this.prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
    });
  }

  findAll() {
    return this.prisma.attendance.findMany({
      include: { employee: { select: { name: true, departmentId: true } } },
      orderBy: { date: 'desc' },
    });
  }
}