import { IsUUID, IsInt, Min, Max, IsNumber, Min as MinNumber } from 'class-validator';

export class GeneratePayrollDto {
  @IsUUID()
  employeeId: string;

  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @MinNumber(0)
  baseSalary: number;
}