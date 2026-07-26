import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Entry } from './entry.entity';
import { Tag } from './tag.entity';

@Entity('entry_tags')
export class EntryTag {
  @PrimaryColumn()
  entryId!: string;

  @PrimaryColumn()
  tagId!: string;

  @ManyToOne(() => Entry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entryId' })
  entry!: Entry;

  @ManyToOne(() => Tag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagId' })
  tag!: Tag;
}
