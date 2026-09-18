import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePositionDto) {
    return this.prisma.position.create({
      data: {
        title: dto.title,
        departmentId: dto.departmentId,
      },
    });
  }

  findAll() {
    return this.prisma.position.findMany({
      include: { department: true },
    });
  }

  async findOne(id: string) {
    const position = await this.prisma.position.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!position) {
      throw new NotFoundException(`Position dengan id ${id} tidak ditemukan`);
    }
    return position;
  }

  async update(id: string, dto: UpdatePositionDto) {
    await this.findOne(id);
    return this.prisma.position.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.position.delete({ where: { id } });
  }
}