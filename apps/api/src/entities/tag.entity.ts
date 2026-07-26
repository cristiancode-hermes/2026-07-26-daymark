import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Entry } from './entry.entity';

@Entity('tags')
@Unique(['name', 'userId'])
export class Tag {
  @ApiProperty({ description: 'UUID de la etiqueta' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Nombre de la etiqueta' })
  @Column()
  name!: string;

  @ApiProperty({ description: 'Color hexadecimal' })
  @Column({ nullable: true })
  color!: string | null;

  @ApiProperty({ description: 'UUID del usuario propietario' })
  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @ManyToMany(() => Entry, (entry) => entry.tags)
  entries!: Entry[];
}
