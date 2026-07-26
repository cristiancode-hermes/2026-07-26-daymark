import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { InsightsSummary } from '../interfaces';

export interface MoodDistribution {
  mood: string;
  count: number;
  percentage: number;
}

export interface WeeklyTrend {
  date: string;
  mood: string;
  moodValue: number;
}

@Injectable({ providedIn: 'root' })
export class InsightsService {
  constructor(private readonly api: ApiService) {}

  getSummary(): Observable<InsightsSummary> {
    return this.api.get<InsightsSummary>('/insights/summary');
  }

  getMoodDistribution(period: 'week' | 'month' | 'year' = 'month'): Observable<MoodDistribution[]> {
    return this.api.get<MoodDistribution[]>('/insights/mood-distribution', { period });
  }

  getWeeklyTrend(): Observable<WeeklyTrend[]> {
    return this.api.get<WeeklyTrend[]>('/insights/weekly-trend');
  }
}
