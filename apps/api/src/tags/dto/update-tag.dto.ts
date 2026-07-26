import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'bienestar', description: 'Nuevo nombre' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '#4ECDC4', description: 'Nuevo color hexadecimal' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe ser un hex válido (ej: #FF6B6B)' })
  color?: string;
}
