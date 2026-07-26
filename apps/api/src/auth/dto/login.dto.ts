import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario@ejemplo.com', description: 'Correo electrónico' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MiClaveSegura123', description: 'Contraseña' })
  @IsString()
  password!: string;
}
