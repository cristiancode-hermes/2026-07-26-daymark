import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Tag } from './tag.entity';

@Entity('entries')
@Unique(['userId', 'date'])
export class Entry {
  @ApiProperty({ description: 'UUID de la entrada' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'UUID del usuario propietario' })
  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ApiProperty({ description: 'Fecha de la entrada (única por usuario)' })
  @Column({ type: 'datetime' })
  date!: Date;

  @ApiProperty({ description: 'Contenido de la entrada (JSON blob)' })
  @Column('simple-json', { nullable: true })
  content!: Record<string, any> | null;

  @ApiProperty({ description: 'Estado de ánimo' })
  @Column({ nullable: true })
  mood!: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @ManyToMany(() => Tag, (tag) => tag.entries)
  @JoinTable({
    name: 'entry_tags',
    joinColumn: { name: 'entryId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags!: Tag[];
}
