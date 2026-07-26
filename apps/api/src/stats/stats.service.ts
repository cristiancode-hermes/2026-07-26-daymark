import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Entry } from '../entities/entry.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Entry)
    private readonly entryRepo: Repository<Entry>,
  ) {}

  async getStreak(userId: string) {
    const entries = await this.entryRepo.find({
      where: { userId },
      order: { date: 'DESC' },
    });

    if (entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Compute current streak
    let currentStreak = 0;
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date);
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

    // Compute longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < entries.length; i++) {
      const prevDate = new Date(entries[i - 1].date);
      prevDate.setHours(0, 0, 0, 0);

      const currDate = new Date(entries[i].date);
      currDate.setHours(0, 0, 0, 0);

      const diffMs = prevDate.getTime() - currDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
    };
  }

  async getCalendar(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const entries = await this.entryRepo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      select: { date: true, mood: true },
      order: { date: 'ASC' },
    });

    const days: Record<string, { mood: string | null; hasEntry: boolean }> = {};

    for (const entry of entries) {
      const dateStr = this.formatDate(entry.date);
      days[dateStr] = {
        mood: entry.mood,
        hasEntry: true,
      };
    }

    return {
      year,
      month,
      days,
      totalEntries: entries.length,
    };
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
