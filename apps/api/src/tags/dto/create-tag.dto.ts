import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'salud', description: 'Nombre de la etiqueta' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional({ example: '#FF6B6B', description: 'Color hexadecimal' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe ser un hex válido (ej: #FF6B6B)' })
  color?: string;
}
