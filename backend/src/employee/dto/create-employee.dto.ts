import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  // Data untuk bikin akun User baru sekaligus
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
}