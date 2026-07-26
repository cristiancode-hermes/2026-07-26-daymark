import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { User } from '../entities/user.entity';
import { Entry } from '../entities/entry.entity';
import { Tag } from '../entities/tag.entity';
import { Prompt } from '../entities/prompt.entity';
import { Goal } from '../entities/goal.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Entry, Tag, Prompt, Goal]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
