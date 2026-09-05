import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('prompts')
export class Prompt {
  @ApiProperty({ description: 'UUID del prompt' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Texto del prompt en español' })
  @Column()
  text!: string;

  @ApiProperty({ description: 'Categoría del prompt (gratitud, reflexion, etc.)' })
  @Column({ nullable: true, type: 'text' })
  category!: string | null;

  @ApiProperty({ description: 'Si el prompt está activo' })
  @Column({ default: true })
  active!: boolean;

  @ApiProperty({ description: 'Día de la semana asociado (0=domingo, 6=sábado)' })
  @Column({ nullable: true, type: 'integer' })
  dayOfWeek!: number | null;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
