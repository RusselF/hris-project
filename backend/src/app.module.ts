import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { DepartmentModule } from './department/department.module';
import { PositionModule } from './position/position.module';
import { EmployeeModule } from './employee/employee.module';


@Module({
  imports: [AuthModule, PrismaModule, DepartmentModule, PositionModule, EmployeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
