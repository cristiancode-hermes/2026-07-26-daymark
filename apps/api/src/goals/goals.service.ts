import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from '../entities/goal.entity';
import { Entry } from '../entities/entry.entity';
import { UpsertGoalDto } from './dto/upsert-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepo: Repository<Goal>,
    @InjectRepository(Entry)
    private readonly entryRepo: Repository<Entry>,
  ) {}

  async getGoal(userId: string) {
    const goal = await this.goalRepo.findOne({ where: { userId } });
    return goal;
  }

  async upsert(userId: string, dto: UpsertGoalDto) {
    const existing = await this.goalRepo.findOne({ where: { userId } });

    if (existing) {
      existing.weeklyTarget = dto.weeklyTarget;
      existing.streakTarget = dto.streakTarget;
      return this.goalRepo.save(existing) as unknown as Goal;
    }

    const goal = this.goalRepo.create({
      userId,
      weeklyTarget: dto.weeklyTarget,
      streakTarget: dto.streakTarget,
    });

    return this.goalRepo.save(goal) as unknown as Goal;
  }

  async getProgress(userId: string) {
    const goal = await this.goalRepo.findOne({ where: { userId } });

    if (!goal) {
      return {
        hasGoal: false,
        message: 'No has configurado metas aún',
      };
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const entriesThisWeek = await this.entryRepo.count({
      where: {
        userId,
        date: startOfWeek.toISOString() >= now.toISOString() ? undefined : undefined,
      },
    });

    // Count entries from start of week
    const entriesInWeek = await this.entryRepo
      .createQueryBuilder('entry')
      .where('entry.userId = :userId', { userId })
      .andWhere('entry.date >= :startOfWeek', { startOfWeek })
      .getCount();

    // Current streak
    const allEntries = await this.entryRepo.find({
      where: { userId },
      order: { date: 'DESC' },
    });

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < allEntries.length; i++) {
      const entryDate = new Date(allEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);

      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      expected.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === expected.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      hasGoal: true,
      goal,
      progress: {
        entriesThisWeek: entriesInWeek,
        weeklyTarget: goal.weeklyTarget,
        weeklyProgress: Math.min(
          100,
          Math.round((entriesInWeek / goal.weeklyTarget) * 100),
        ),
        currentStreak,
        streakTarget: goal.streakTarget,
        streakProgress: Math.min(
          100,
          Math.round((currentStreak / goal.streakTarget) * 100),
        ),
      },
    };
  }
}
