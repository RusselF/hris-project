import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  defaultQty: number;
}