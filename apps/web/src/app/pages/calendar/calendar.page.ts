import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { EntriesService } from '../../services/entries.service';
import { InsightsService } from '../../services/insights.service';
import { StreakStats, CalendarDay } from '../../interfaces';
import { CardComponent } from '../../shared/card.component';
import { ButtonComponent } from '../../shared/button.component';
import { CalendarDayComponent } from '../../shared/calendar-day.component';
import { StreakBadgeComponent } from '../../shared/streak-badge.component';
import { SpinnerComponent } from '../../shared/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [RouterLink, DatePipe, SlicePipe, CardComponent, CalendarDayComponent, StreakBadgeComponent, SpinnerComponent, EmptyStateComponent],
  template: `
    @if (loading()) {
      <app-spinner [size]="40" />
    } @else {
      <div class="calendar-page">
        <header class="page-header">
          <h1>Calendario</h1>
        </header>

        <!-- Streak summary -->
        @if (streakStats(); as s) {
          <app-card>
            <div class="streak-row">
              <app-streak-badge [count]="s.current" />
              <span class="streak-text">Racha actual</span>
              <span class="streak-divider">|</span>
              <span class="streak-best">Mejor: {{ s.longest }} días</span>
            </div>
          </app-card>
        }

        <!-- Month navigation -->
        <div class="month-nav">
          <button class="nav-btn" (click)="prevMonth()">←</button>
          <h2 class="month-title">{{ monthName }} {{ year }}</h2>
          <button class="nav-btn" (click)="nextMonth()">→</button>
        </div>

        <!-- Calendar grid -->
        <app-card>
          <div class="calendar-grid">
            <div class="weekday-header">
              @for (day of weekDays; track day) {
                <span class="weekday-label">{{ day }}</span>
              }
            </div>
            <div class="days-grid">
              @for (blank of blanks; track blank) {
                <div class="blank-cell"></div>
              }
              @for (day of calendarDays(); track day.day) {
                <app-calendar-day
                  [day]="day.day"
                  [mood]="day.mood"
                  [hasEntry]="day.hasEntry"
                  [isToday]="day.day === todayDate && month === currentMonth && year === currentYear"
                  [isSelected]="day.day === selectedDay"
                  (select)="selectDay(day.day)"
                />
              }
            </div>
          </div>
        </app-card>

        @if (selectedEntry()) {
          <app-card>
            <div class="selected-entry">
              <div class="selected-entry-header">
                <span class="mood-emoji">{{ moodEmoji(selectedEntry()!.mood) }}</span>
                <h3>{{ selectedDay }} de {{ monthName }}</h3>
              </div>
              <p class="selected-entry-text">{{ selectedEntry()!.content | slice:0:200 }}{{ (selectedEntry()!.content.length > 200) ? '…' : '' }}</p>
              <div class="selected-entry-actions">
                <a routerLink="/entries/{{ selectedEntry()!.id }}" class="link">Ver completa →</a>
                <a routerLink="/entries/{{ selectedEntry()!.id }}/edit" class="link">Editar</a>
              </div>
            </div>
          </app-card>
        } @else if (selectedDay && !noEntryForSelected()) {
          <app-empty-state icon="📝" title="Sin entrada" [message]="'No hay entrada para el ' + selectedDay + ' de ' + monthName" actionLabel="Crear entrada" (action)="createEntry()" />
        }
      </div>
    }
  `,
  styles: [`
    .calendar-page { display: flex; flex-direction: column; gap: var(--space-md); }
    .page-header h1 { font-size: var(--text-h1); font-weight: 700; color: var(--color-ink); }
    .streak-row { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--text-body-sm); color: var(--color-ink-secondary); }
    .streak-divider { color: var(--color-border); }
    .streak-text, .streak-best { font-weight: 500; }
    .month-nav { display: flex; align-items: center; justify-content: center; gap: var(--space-lg); }
    .nav-btn { background: none; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 8px 16px; cursor: pointer; font-size: var(--text-body); color: var(--color-ink-secondary); transition: all 150ms; }
    .nav-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
    .month-title { font-size: var(--text-h2); font-weight: 700; color: var(--color-ink); min-width: 200px; text-align: center; }
    .calendar-grid { display: flex; flex-direction: column; gap: 4px; }
    .weekday-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .weekday-label { text-align: center; font-size: var(--text-caption); font-weight: 600; color: var(--color-ink-tertiary); padding: 4px; }
    .days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .blank-cell { aspect-ratio: 1; }
    .selected-entry { display: flex; flex-direction: column; gap: var(--space-sm); }
    .selected-entry-header { display: flex; align-items: center; gap: var(--space-sm); }
    .selected-entry-header h3 { font-size: var(--text-h3); font-weight: 600; color: var(--color-ink); text-transform: capitalize; }
    .mood-emoji { font-size: 1.5rem; }
    .selected-entry-text { font-size: var(--text-body-sm); color: var(--color-ink-secondary); line-height: 1.6; }
    .selected-entry-actions { display: flex; gap: var(--space-md); }
    .link { font-size: var(--text-body-sm); color: var(--color-accent); font-weight: 500; text-decoration: none; }
    .link:hover { text-decoration: underline; }
  `],
})
export class CalendarPageComponent implements OnInit {
  private readonly entriesService = inject(EntriesService);
  private readonly insightsService = inject(InsightsService);
  protected readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = signal(true);
  protected year = new Date().getFullYear();
  protected month = new Date().getMonth() + 1;
  protected currentYear = new Date().getFullYear();
  protected currentMonth = new Date().getMonth() + 1;
  protected todayDate = new Date().getDate();
  protected selectedDay = 0;
  protected selectedEntry = signal<any>(null);
  protected noEntryForSelected = signal(false);
  protected streakStats = signal<StreakStats | null>(null);
  protected calendarDays = signal<CalendarDay[]>([]);
  protected blanks: number[] = [];

  protected readonly weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  get monthName(): string {
    const d = new Date(this.year, this.month - 1, 1);
    return d.toLocaleDateString('es-ES', { month: 'long' });
  }

  ngOnInit(): void {
    this.loadMonth();
  }

  protected loadMonth(): void {
    this.loading.set(true);
    this.selectedDay = 0;
    this.selectedEntry.set(null);

    const firstDay = new Date(this.year, this.month - 1, 1).getDay();
    const daysInMonth = new Date(this.year, this.month, 0).getDate();
    this.blanks = Array(firstDay).fill(0);

    // Load streak + calendar data in parallel
    this.insightsService.getSummary().pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (s) => {
        if (s) {
          this.streakStats.set({ current: (s as any).currentStreak ?? 0, longest: (s as any).longestStreak ?? 0 });
        }
      },
    });

    this.entriesService.getCalendarMonth(this.year, this.month).pipe(
      catchError(() => of({})),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (moodMap) => {
        const days: CalendarDay[] = [];
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${this.year}-${String(this.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const moodFromServer = (moodMap as any)[dateStr];
          days.push({
            day: d,
            mood: moodFromServer || '',
            hasEntry: !!moodFromServer,
          });
        }
        this.calendarDays.set(days);
        this.loading.set(false);
      },
    });
  }

  protected prevMonth(): void {
    if (this.month === 1) { this.month = 12; this.year--; }
    else { this.month--; }
    this.loadMonth();
  }

  protected nextMonth(): void {
    if (this.month === 12) { this.month = 1; this.year++; }
    else { this.month++; }
    this.loadMonth();
  }

  protected selectDay(day: number): void {
    this.selectedDay = day;
    const dateStr = `${this.year}-${String(this.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    this.entriesService.getByDate(dateStr).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (entry) => {
        if (entry) {
          this.selectedEntry.set(entry);
          this.noEntryForSelected.set(false);
        } else {
          this.selectedEntry.set(null);
          this.noEntryForSelected.set(true);
        }
      },
    });
  }

  protected createEntry(): void {
    this.router.navigate(['/entries/new']);
  }

  protected moodEmoji(mood: string): string {
    const map: Record<string, string> = { happy: '😄', good: '🙂', neutral: '😐', sad: '😔', awful: '😢' };
    return map[mood] ?? '😐';
  }
}
