import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertGoalDto {
  @ApiProperty({ example: 5, description: 'Objetivo semanal de entradas' })
  @IsInt()
  @Min(1)
  @Max(365)
  weeklyTarget!: number;

  @ApiProperty({ example: 7, description: 'Objetivo de racha (días consecutivos)' })
  @IsInt()
  @Min(1)
  @Max(365)
  streakTarget!: number;
}
