import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Entry } from '../entities/entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Entry])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
