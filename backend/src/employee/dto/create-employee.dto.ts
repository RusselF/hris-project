import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsEmail, MinLength, IsEnum } from 'class-validator';

enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  HR = 'HR',
}

export class CreateEmployeeDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsUUID()
  departmentId: string;

  @IsUUID()
  positionId: string;

  @IsOptional()
  @IsUUID()
  managerId?: string;

  @IsDateString()
  joinDate: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole; // default EMPLOYEE kalau tidak diisi
}