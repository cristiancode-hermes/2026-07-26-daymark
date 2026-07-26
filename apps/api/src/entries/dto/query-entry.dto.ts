import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryEntryDto {
  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Elementos por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filtrar por estado de ánimo' })
  @IsOptional()
  @IsString()
  mood?: string;

  @ApiPropertyOptional({ description: 'Filtrar por fecha (inicio, ISO8601)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Filtrar por fecha (fin, ISO8601)' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de etiqueta' })
  @IsOptional()
  @IsString()
  tagId?: string;
}
