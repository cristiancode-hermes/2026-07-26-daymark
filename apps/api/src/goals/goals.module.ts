import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { Goal } from '../entities/goal.entity';
import { Entry } from '../entities/entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, Entry])],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
