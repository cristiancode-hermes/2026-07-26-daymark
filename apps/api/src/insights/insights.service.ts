import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Entry } from '../entities/entry.entity';

@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(Entry)
    private readonly entryRepo: Repository<Entry>,
  ) {}

  async getMoodDistribution(userId: string) {
    const allEntries = await this.entryRepo.find({
      where: { userId },
    });

    const distribution: Record<string, number> = {};

    for (const entry of allEntries) {
      if (entry.mood) {
        distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
      }
    }

    return {
      distribution,
      total: allEntries.length,
    };
  }

  async getWeeklyTrend(userId: string) {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const entries = await this.entryRepo.find({
      where: {
        userId,
        date: Between(weekAgo, now),
      },
      order: { date: 'ASC' },
    });

    return entries.map((e) => ({
      date: e.date,
      mood: e.mood,
    }));
  }

  async getSummary(userId: string) {
    const totalEntries = await this.entryRepo.count({ where: { userId } });

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekEntries = await this.entryRepo.find({
      where: {
        userId,
        date: Between(weekAgo, now),
      },
    });

    // Compute streak
    let streak = 0;
    const allEntries = await this.entryRepo.find({
      where: { userId },
      order: { date: 'DESC' },
    });

    if (allEntries.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < allEntries.length; i++) {
        const entryDate = new Date(allEntries[i].date);
        entryDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);

        if (entryDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }
    }

    return {
      totalEntries,
      entriesThisWeek: weekEntries.length,
      currentStreak: streak,
      mostUsedMood: await this.getMostUsedMood(userId),
    };
  }

  private async getMostUsedMood(userId: string): Promise<string | null> {
    const allEntries = await this.entryRepo.find({
      where: { userId },
    });

    const freq: Record<string, number> = {};
    for (const e of allEntries) {
      if (e.mood) {
        freq[e.mood] = (freq[e.mood] || 0) + 1;
      }
    }

    let maxCount = 0;
    let maxMood: string | null = null;
    for (const [mood, count] of Object.entries(freq)) {
      if (count > maxCount) {
        maxCount = count;
        maxMood = mood;
      }
    }

    return maxMood;
  }
}
