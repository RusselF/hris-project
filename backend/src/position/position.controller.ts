import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('positions')
@UseGuards(RolesGuard)
export class PositionController {
  constructor(private positionService: PositionService) {}

  @Get()
  findAll() {
    return this.positionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  @Roles('HR')
  @Post()
  create(@Body() dto: CreatePositionDto) {
    return this.positionService.create(dto);
  }

  @Roles('HR')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.positionService.update(id, dto);
  }

  @Roles('HR')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.positionService.remove(id);
  }
}