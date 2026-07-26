import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('goals')
@Unique(['userId'])
export class Goal {
  @ApiProperty({ description: 'UUID de la meta' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'UUID del usuario (único)' })
  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ApiProperty({ description: 'Objetivo semanal de entradas' })
  @Column({ type: 'integer' })
  weeklyTarget!: number;

  @ApiProperty({ description: 'Objetivo de racha (días consecutivos)' })
  @Column({ type: 'integer' })
  streakTarget!: number;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
