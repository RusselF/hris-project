import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto) {
    // 1. Cek email belum dipakai (sebelum masuk transaction, biar gagal cepat)
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 2. Transaction: bikin User + Employee sekaligus, atau gagal semua
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: 'EMPLOYEE',
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          name: dto.name,
          departmentId: dto.departmentId,
          positionId: dto.positionId,
          managerId: dto.managerId,
          joinDate: new Date(dto.joinDate),
        },
        include: { department: true, position: true },
      });

      return employee;
    });
  }

  findAll() {
    return this.prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      include: { department: true, position: true },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { department: true, position: true, manager: true },
    });
    if (!employee) {
      throw new NotFoundException(`Employee dengan id ${id} tidak ditemukan`);
    }
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data: {
        ...dto,
        joinDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
      },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async findMyTeam(managerEmployeeId: string) {
    return this.prisma.employee.findMany({
      where: { managerId: managerEmployeeId, status: 'ACTIVE' },
      include: { department: true, position: true },
    });
  }
}