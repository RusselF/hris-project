import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';

function countDays(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1; // inklusif tanggal awal & akhir
}

@Injectable()
export class LeaveRequestService {
  constructor(private prisma: PrismaService) {}

  async create(employeeId: string, dto: CreateLeaveRequestDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('Tanggal mulai tidak boleh setelah tanggal selesai');
    }

    const year = startDate.getFullYear();
    const requestedDays = countDays(startDate, endDate);

    // 1. Cek saldo cuti (FR-017)
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: { employeeId, leaveTypeId: dto.leaveTypeId, year },
      },
    });

    if (!balance || balance.balance < requestedDays) {
      throw new BadRequestException('Saldo cuti tidak mencukupi');
    }

    // 2. Cek overlap tanggal (FR-018)
    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (overlapping) {
      throw new BadRequestException('Tanggal cuti bertabrakan dengan pengajuan lain');
    }

    // 3. Simpan pengajuan
    return this.prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate,
        endDate,
        status: 'PENDING',
      },
      include: { leaveType: true },
    });
  }

  async approve(requestId: string, managerEmployeeId: string) {
    const request = await this.prisma.leaveRequest.findUnique({
        where: { id: requestId },
        include: { employee: true },
    });

    if (!request) {
        throw new NotFoundException('Leave request tidak ditemukan');
    }

    // Pastikan manager cuma bisa approve pengajuan anak buahnya sendiri
    if (request.employee.managerId !== managerEmployeeId) {
        throw new ForbiddenException('Kamu tidak berwenang approve pengajuan ini');
    }

    if (request.status !== 'PENDING') {
        throw new BadRequestException('Pengajuan ini sudah diproses sebelumnya');
    }

    const year = request.startDate.getFullYear();
    const days = countDays(request.startDate, request.endDate);

    return this.prisma.$transaction(async (tx) => {
        const updated = await tx.leaveRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', approvedBy: managerEmployeeId },
        });

        await tx.leaveBalance.update({
        where: {
            employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year,
            },
        },
        data: { balance: { decrement: days } },
        });

        return updated;
    });
    }

    async reject(requestId: string, managerEmployeeId: string) {
        const request = await this.prisma.leaveRequest.findUnique({
            where: { id: requestId },
            include: { employee: true },
        });

        if (!request) {
            throw new NotFoundException('Leave request tidak ditemukan');
        }

        if (request.employee.managerId !== managerEmployeeId) {
            throw new ForbiddenException('Kamu tidak berwenang menolak pengajuan ini');
        }

        if (request.status !== 'PENDING') {
            throw new BadRequestException('Pengajuan ini sudah diproses sebelumnya');
        }

        return this.prisma.leaveRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED', approvedBy: managerEmployeeId },
        });
    }

  findMyRequests(employeeId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { employeeId },
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPendingForTeam(managerEmployeeId: string) {
    return this.prisma.leaveRequest.findMany({
      where: {
        status: 'PENDING',
        employee: { managerId: managerEmployeeId },
      },
      include: { leaveType: true, employee: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}