import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@ejemplo.com', description: 'Correo electrónico' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'María García', description: 'Nombre del usuario' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'MiClaveSegura123', description: 'Contraseña (mín. 6 caracteres)' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;
}
