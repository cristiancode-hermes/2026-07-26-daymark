import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ description: 'UUID del usuario' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Correo electrónico único' })
  @Column({ unique: true })
  email!: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  @Column()
  name!: string;

  @Column()
  password!: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
