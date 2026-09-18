import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePositionDto {
  @IsNotEmpty()
  title: string;

  @IsUUID()
  departmentId: string;
}