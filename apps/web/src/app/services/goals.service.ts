import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Goal } from '../interfaces';

export interface GoalProgress {
  weeklyEntries: number;
  currentStreak: number;
  weeklyComplete: boolean;
  streakComplete: boolean;
}

@Injectable({ providedIn: 'root' })
export class GoalsService {
  constructor(private readonly api: ApiService) {}

  get(): Observable<Goal> {
    return this.api.get<Goal>('/goals');
  }

  update(data: Goal): Observable<Goal> {
    return this.api.put<Goal>('/goals', data);
  }

  getProgress(): Observable<GoalProgress> {
    return this.api.get<GoalProgress>('/goals/progress');
  }
}
